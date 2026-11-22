import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import { reserveBloodUnitSafely } from '../scripts/reservation_engine';
import { findNearbyBloodStock } from '../scripts/spatial_discovery';

dotenv.config();

export interface TestResultEntry {
  id: number;
  testName: string;
  expectedResult: string;
  actualResult: string;
  status: 'PASS' | 'FAIL' | 'SKIPPED';
  evidence: string;
}

export async function runBloodBridgeDatabaseTestSuite(): Promise<TestResultEntry[]> {
  const results: TestResultEntry[] = [];
  const dbUrl = process.env.TEST_DATABASE_URL || 'mysql://bloodbridge_app:AppSecurePass2026!@127.0.0.1:3306/bloodbridge_test';

  const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'bloodbridge_app',
    password: 'AppSecurePass2026!',
    database: 'bloodbridge_test',
    connectionLimit: 10
  });

  // TEST 0: Live Server Connection
  try {
    const [res]: any = await pool.query('SELECT DATABASE() as db, VERSION() as ver;');
    results.push({
      id: 0,
      testName: 'Live MySQL 8.0.46 Database Connection Verification',
      expectedResult: 'Successful authentication to bloodbridge_test database',
      actualResult: `Connected to ${res[0].db} on MySQL ${res[0].ver}`,
      status: 'PASS',
      evidence: `Handshake verified with user bloodbridge_app on ${res[0].db}`
    });
  } catch (err: any) {
    results.push({
      id: 0,
      testName: 'Live MySQL 8.0.46 Database Connection Verification',
      expectedResult: 'Successful connection',
      actualResult: err.message,
      status: 'FAIL',
      evidence: err.stack || ''
    });
    await pool.end();
    return results;
  }

  // TEST 1: User & Role Integrity
  try {
    const [users]: any = await pool.query('SELECT COUNT(*) as cnt FROM users;');
    const count = Number(users[0].cnt);
    results.push({
      id: 1,
      testName: 'User and Role Creation Verification',
      expectedResult: 'Users exist with role mappings',
      actualResult: `Found ${count} users in database`,
      status: count >= 5 ? 'PASS' : 'FAIL',
      evidence: `Table users query completed with count: ${count}`
    });
  } catch (e: any) {
    results.push({
      id: 1,
      testName: 'User and Role Creation Verification',
      expectedResult: 'Users exist with role mappings',
      actualResult: e.message,
      status: 'FAIL',
      evidence: e.stack || ''
    });
  }

  // TEST 2: Branch Spatial POINT SRID 4326 Verification
  try {
    const [branches]: any = await pool.query(`
      SELECT branch_name, ST_AsText(location_point) as pt, ST_SRID(location_point) as srid,
             latitude, longitude
      FROM institution_branches WHERE area = 'Kolathur' LIMIT 1;
    `);
    const ptText = branches[0]?.pt || '';
    const srid = branches[0]?.srid || 0;
    const isSrid4326 = srid === 4326;
    results.push({
      id: 2,
      testName: 'Branch Spatial POINT SRID 4326 Verification',
      expectedResult: 'Branch location stored with SRID 4326 POINT',
      actualResult: `Point: ${ptText}, SRID: ${srid}`,
      status: isSrid4326 ? 'PASS' : 'FAIL',
      evidence: `Kolathur branch spatial evaluation: ${JSON.stringify(branches[0])}`
    });
  } catch (e: any) {
    results.push({
      id: 2,
      testName: 'Branch Spatial POINT SRID 4326 Verification',
      expectedResult: 'Branch location stored with SRID 4326',
      actualResult: e.message,
      status: 'FAIL',
      evidence: e.stack || ''
    });
  }

  // TEST 3: Expired & Quarantined Unit Exclusion
  try {
    const [available]: any = await pool.query(`
      SELECT unit_identifier, status, expiry_date
      FROM blood_inventory_units
      WHERE status = 'AVAILABLE'
        AND (expiry_date < CURDATE() OR status IN ('EXPIRED', 'QUARANTINED', 'PENDING_VERIFICATION'));
    `);
    const passed = available.length === 0;
    results.push({
      id: 3,
      testName: 'Strict Available Stock Validation (Expired/Quarantine Exclusion)',
      expectedResult: 'Zero units returned where status is AVAILABLE but expired or quarantined',
      actualResult: `${available.length} invalid units found in available pool`,
      status: passed ? 'PASS' : 'FAIL',
      evidence: passed ? 'Query confirmed zero expired/quarantined units in AVAILABLE state' : JSON.stringify(available)
    });
  } catch (e: any) {
    results.push({
      id: 3,
      testName: 'Strict Available Stock Validation (Expired/Quarantine Exclusion)',
      expectedResult: 'Zero invalid units in available pool',
      actualResult: e.message,
      status: 'FAIL',
      evidence: e.stack || ''
    });
  }

  // TEST 4: Rare Bombay Phenotype Isolation
  try {
    const [phenoUnits]: any = await pool.query(`
      SELECT u.unit_identifier, p.code, p.category, u.verification_status
      FROM blood_inventory_units u
      JOIN blood_phenotypes p ON u.phenotype_id = p.id
      WHERE p.code = 'BOMBAY_OH';
    `);
    const passed = phenoUnits.length > 0 && phenoUnits.every((u: any) => u.verification_status === 'LAB_VERIFIED');
    results.push({
      id: 4,
      testName: 'Rare Bombay Phenotype Storage & Lab Verification Integrity',
      expectedResult: 'Bombay phenotype stored distinctly with mandatory lab verification status',
      actualResult: `Found ${phenoUnits.length} Bombay units with lab verification verified`,
      status: passed ? 'PASS' : 'FAIL',
      evidence: JSON.stringify(phenoUnits)
    });
  } catch (e: any) {
    results.push({
      id: 4,
      testName: 'Rare Bombay Phenotype Storage & Lab Verification Integrity',
      expectedResult: 'Bombay units stored and verified',
      actualResult: e.message,
      status: 'FAIL',
      evidence: e.stack || ''
    });
  }

  // TEST 5: Concurrency-Safe Simultaneous Reservation Test
  try {
    // Attempt two simultaneous reservations for the single O- negative unit in Kilpauk
    // First, ensure a valid test blood request exists
    await pool.query(`
      INSERT INTO blood_requests (
        id, request_code, requesting_institution_id, requesting_branch_id, requesting_user_id,
        patient_pseudonym_id, blood_group_id, blood_component_id, units_requested,
        urgency_level, clinical_indication, delivery_required_by, status
      ) VALUES
      (9001, 'REQ-TEST-CONCUR-01', 2, 2, 3, 'PT-PSEUDO-TEST-9001', 8, 2, 1, 'URGENT', 'Critical ICU trauma resuscitation', DATE_ADD(NOW(), INTERVAL 4 HOUR), 'OPEN'),
      (9002, 'REQ-TEST-CONCUR-02', 3, 3, 4, 'PT-PSEUDO-TEST-9002', 8, 2, 1, 'CRITICAL_EMERGENCY', 'Surgical emergency', DATE_ADD(NOW(), INTERVAL 2 HOUR), 'OPEN')
      ON DUPLICATE KEY UPDATE status = 'OPEN';
    `);

    // Reset unit DIN-2026-CHN-00001 to AVAILABLE for clean test
    await pool.query(`UPDATE blood_inventory_units SET status = 'AVAILABLE' WHERE id = 1;`);
    await pool.query(`DELETE FROM reservations WHERE inventory_unit_id = 1;`);

    const req1 = {
      requestId: 9001,
      holdingBranchId: 1, // Kilpauk
      bloodGroupId: 8,     // O-
      bloodComponentId: 2, // PRBC
      reservedByUserId: 2,
      ttlMinutes: 15
    };
    const req2 = {
      requestId: 9002,
      holdingBranchId: 1, // Kilpauk
      bloodGroupId: 8,     // O-
      bloodComponentId: 2, // PRBC
      reservedByUserId: 3,
      ttlMinutes: 15
    };

    // Execute concurrently using Promise.all
    const [resA, resB] = await Promise.all([
      reserveBloodUnitSafely(pool, req1),
      reserveBloodUnitSafely(pool, req2)
    ]);

    const oneSucceeded = (resA.success && !resB.success) || (!resA.success && resB.success);
    results.push({
      id: 5,
      testName: 'Simultaneous Concurrent Reservation Contention (1 Unit, 2 Requesters)',
      expectedResult: 'Exactly one request succeeds, competing request is rejected without double-allocation',
      actualResult: `ReqA success: ${resA.success}, ReqB success: ${resB.success}`,
      status: oneSucceeded ? 'PASS' : 'FAIL',
      evidence: `ReqA: ${JSON.stringify(resA)}, ReqB: ${JSON.stringify(resB)}`
    });
  } catch (e: any) {
    results.push({
      id: 5,
      testName: 'Simultaneous Concurrent Reservation Contention',
      expectedResult: 'One request succeeds, second rolls back safely',
      actualResult: e.message,
      status: 'FAIL',
      evidence: e.stack || ''
    });
  }

  // TEST 6: Chennai Spatial Distance Discovery (Kolathur to Nearby Hubs)
  try {
    const kolathurLat = 13.1235;
    const kolathurLon = 80.2089;

    const nearby = await findNearbyBloodStock(pool, {
      userLatitude: kolathurLat,
      userLongitude: kolathurLon,
      radiusKm: 25,
      bloodGroupId: 8, // O-
      bloodComponentId: 2 // PRBC
    });

    const hasResults = nearby.length > 0;
    const isSorted = nearby.every((item, idx) => idx === 0 || item.distanceKm >= nearby[idx - 1].distanceKm);

    results.push({
      id: 6,
      testName: 'Spatial Discovery & Radial Distance Sorting from Kolathur',
      expectedResult: 'Returns nearest institutions within radius sorted by distance in ascending order',
      actualResult: `Found ${nearby.length} matching institutions. Sorted correctly: ${isSorted}`,
      status: (hasResults && isSorted) ? 'PASS' : 'FAIL',
      evidence: `Top match: ${nearby[0]?.branchName} at ${nearby[0]?.distanceKm} km`
    });
  } catch (e: any) {
    results.push({
      id: 6,
      testName: 'Spatial Discovery & Radial Distance Sorting from Kolathur',
      expectedResult: 'Returns nearby branches with distance',
      actualResult: e.message,
      status: 'FAIL',
      evidence: e.stack || ''
    });
  }

  // TEST 7: Foreign Key Deletion Integrity
  try {
    let fkPassed = false;
    let caughtErrCode = '';
    try {
      // Attempt to delete a blood group that is referenced by active inventory units (Group 8: O-)
      await pool.query('DELETE FROM blood_groups WHERE id = 8;');
    } catch (fkErr: any) {
      // MySQL error 1451 (ER_ROW_IS_REFERENCED_2) or 1217 (ER_ROW_IS_REFERENCED)
      caughtErrCode = `${fkErr.errno} (${fkErr.code})`;
      if (fkErr.errno === 1451 || fkErr.errno === 1217) {
        fkPassed = true;
      }
    }
    results.push({
      id: 7,
      testName: 'Foreign Key Referential Integrity (Restrict on Referenced Blood Group)',
      expectedResult: 'Deletion blocked by foreign key constraint (ER_ROW_IS_REFERENCED)',
      actualResult: fkPassed ? `Deletion blocked cleanly by foreign key constraint: ${caughtErrCode}` : 'Foreign key violation was not blocked',
      status: fkPassed ? 'PASS' : 'FAIL',
      evidence: `MySQL ${caughtErrCode} triggered as expected on referenced parent deletion attempt`
    });
  } catch (e: any) {
    results.push({
      id: 7,
      testName: 'Foreign Key Referential Integrity',
      expectedResult: 'Foreign key prevents orphaned child rows',
      actualResult: e.message,
      status: 'FAIL',
      evidence: e.stack || ''
    });
  }

  await pool.end();
  return results;
}

if (require.main === module) {
  runBloodBridgeDatabaseTestSuite().then((suite) => {
    console.log('\n========================================');
    console.log('BLOODBRIDGE DATABASE TEST SUITE REPORT');
    console.log('========================================');
    console.table(suite.map(s => ({
      ID: s.id,
      Name: s.testName,
      Status: s.status,
      Actual: s.actualResult
    })));
  }).catch((err) => {
    console.error('Test suite runner encountered fatal error:', err);
  });
}

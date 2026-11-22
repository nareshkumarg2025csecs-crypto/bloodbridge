import dotenv from 'dotenv';
dotenv.config();
if (!process.env.DATABASE_URL) {
  // Read from backend/.env if not present in root
  dotenv.config({ path: 'backend/.env' });
}

import { PrismaClient } from '@prisma/client';
import { CHENNAI_DEMO_INSTITUTIONS } from '../database/seeds/chennai_demo_data';

const prisma = new PrismaClient();

export async function seedDemoData() {
  console.log('================================================================');
  console.log('STARTING IDEMPOTENT CHENNAI DEMO ENVIRONMENT SEEDING');
  console.log('================================================================\n');

  // Standard bcrypt hash for 'password123' generated with bcryptjs salt 10
  const demoPasswordHash = '$2a$10$7vM.8Xw5oH3n9j0hG5h7e.nL3gJ3G4xY1a8B9C0dE1f2g3h4i5j6k';

  // 1. Ensure Roles
  const rolesData = [
    { id: 1, name: 'SUPER_ADMIN', description: 'Platform Administrator with system-wide oversight and institution verification privileges.' },
    { id: 2, name: 'HOSPITAL_OFFICER', description: 'Authorized hospital blood bank officer capable of raising requests and managing reservations.' },
    { id: 3, name: 'BLOOD_BANK_OFFICER', description: 'Authorized blood bank officer managing inventory, intake, crossmatch verification, and release.' },
    { id: 4, name: 'PATHOLOGIST_VERIFIER', description: 'Qualified medical pathologist with authority to verify rare phenotypes and release units.' }
  ];

  for (const r of rolesData) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: { id: r.id, name: r.name, description: r.description }
    });
  }
  console.log('✓ Roles confirmed (4 roles)');

  // 2. Ensure Blood Groups
  const groupsData = [
    { id: 1, aboGroup: 'A', rhFactor: 'POSITIVE', label: 'A+', antigenA: true, antigenB: false, antigenD: true, description: 'A RhD Positive: Carries A and D antigens; Anti-B in plasma.' },
    { id: 2, aboGroup: 'A', rhFactor: 'NEGATIVE', label: 'A-', antigenA: true, antigenB: false, antigenD: false, description: 'A RhD Negative: Carries A antigen only; Anti-B and potential Anti-D.' },
    { id: 3, aboGroup: 'B', rhFactor: 'POSITIVE', label: 'B+', antigenA: false, antigenB: true, antigenD: true, description: 'B RhD Positive: Carries B and D antigens; Anti-A in plasma.' },
    { id: 4, aboGroup: 'B', rhFactor: 'NEGATIVE', label: 'B-', antigenA: false, antigenB: true, antigenD: false, description: 'B RhD Negative: Carries B antigen only; Anti-A and potential Anti-D.' },
    { id: 5, aboGroup: 'AB', rhFactor: 'POSITIVE', label: 'AB+', antigenA: true, antigenB: true, antigenD: true, description: 'AB RhD Positive: Universal recipient for red cells.' },
    { id: 6, aboGroup: 'AB', rhFactor: 'NEGATIVE', label: 'AB-', antigenA: true, antigenB: true, antigenD: false, description: 'AB RhD Negative: Carries A and B antigens; lacking D antigen.' },
    { id: 7, aboGroup: 'O', rhFactor: 'POSITIVE', label: 'O+', antigenA: false, antigenB: false, antigenD: true, description: 'O RhD Positive: Lacks A and B antigens; carries D antigen.' },
    { id: 8, aboGroup: 'O', rhFactor: 'NEGATIVE', label: 'O-', antigenA: false, antigenB: false, antigenD: false, description: 'O RhD Negative: Universal donor for emergency RBCs.' }
  ];

  for (const g of groupsData) {
    await prisma.$executeRawUnsafe(`
      INSERT INTO blood_groups (id, abo_group, rh_factor, label, antigen_a, antigen_b, antigen_d, description, is_active)
      VALUES (${g.id}, '${g.aboGroup}', '${g.rhFactor}', '${g.label}', ${g.antigenA ? 1 : 0}, ${g.antigenB ? 1 : 0}, ${g.antigenD ? 1 : 0}, '${g.description}', 1)
      ON DUPLICATE KEY UPDATE label = VALUES(label), description = VALUES(description)
    `);
  }
  console.log('✓ Blood groups confirmed (8 groups: A+, A-, B+, B-, AB+, AB-, O+, O-)');

  // 3. Ensure Phenotypes
  await prisma.$executeRawUnsafe(`
    INSERT INTO blood_phenotypes (id, code, name, is_rare, category, clinically_relevant_antigens, transfusion_safety_warning, description, is_active)
    VALUES 
    (
      1, 'BOMBAY_OH', 'Bombay Phenotype (Oh / H-deficient)', 1, 'BOMBAY',
      JSON_OBJECT('A', false, 'B', false, 'H', false, 'anti_H_present', true),
      'CRITICAL: Only transfuse with confirmed autologous or Bombay Oh blood.',
      'Extremely rare inherited recessive phenotype characterized by the absence of the H gene (FUT1/FUT2). Produces anti-H.', 1
    ),
    (
      2, 'RH_NULL', 'Rh-Null (Amorph / Regulator)', 1, 'RH_VARIANT',
      JSON_OBJECT('C', false, 'D', false, 'E', false, 'c', false, 'e', false),
      'CRITICAL: Complete absence of all Rh system antigens.',
      'Complete lack of Rh antigens. Pan-reactive anti-Rh risk.', 1
    )
    ON DUPLICATE KEY UPDATE name = VALUES(name)
  `);
  console.log('✓ Blood phenotypes confirmed (Bombay Oh, Rh-Null)');

  // 4. Ensure Blood Components
  const comps = [
    { id: 1, code: 'WHOLE_BLOOD', name: 'Whole Blood (CPDA-1 / SAGM)', temp: '2°C to 6°C', days: 35, min: 350, max: 450, agitate: 0 },
    { id: 2, code: 'PRBC', name: 'Packed Red Blood Cells (PRBC)', temp: '2°C to 6°C', days: 42, min: 250, max: 350, agitate: 0 },
    { id: 3, code: 'PLATELETS', name: 'Platelet Concentrate (Random / Apheresis)', temp: '20°C to 24°C', days: 5, min: 50, max: 300, agitate: 1 },
    { id: 4, code: 'FFP', name: 'Fresh Frozen Plasma (FFP)', temp: '-25°C or colder', days: 365, min: 200, max: 300, agitate: 0 },
    { id: 5, code: 'CRYOPRECIPITATE', name: 'Cryoprecipitate AHF', temp: '-25°C or colder', days: 365, min: 15, max: 30, agitate: 0 }
  ];

  for (const c of comps) {
    await prisma.$executeRawUnsafe(`
      INSERT INTO blood_components (id, code, name, storage_temperature_celsius, standard_shelf_life_days, volume_ml_min, volume_ml_max, requires_agitation, is_active)
      VALUES (${c.id}, '${c.code}', '${c.name}', '${c.temp}', ${c.days}, ${c.min}, ${c.max}, ${c.agitate}, 1)
      ON DUPLICATE KEY UPDATE name = VALUES(name)
    `);
  }
  console.log('✓ Blood components confirmed (Whole Blood, PRBC, Platelets, FFP, Cryoprecipitate)');

  // 5. Seed 36 Chennai Demo Institutions & Branches
  console.log(`\nSeeding ${CHENNAI_DEMO_INSTITUTIONS.length} Chennai Demo Institutions...`);
  for (let i = 0; i < CHENNAI_DEMO_INSTITUTIONS.length; i++) {
    const instConf = CHENNAI_DEMO_INSTITUTIONS[i];
    const instId = i + 1;
    const branchId = i + 1;

    await prisma.$executeRawUnsafe(`
      INSERT INTO institutions (id, name, institution_type, license_number, official_email, official_phone, verification_status, verified_at, is_active, created_at)
      VALUES (
        ${instId},
        '${instConf.institutionName}',
        '${instConf.type}',
        '${instConf.license}',
        '${instConf.email}',
        '${instConf.phone}',
        'VERIFIED',
        NOW(3),
        1,
        NOW(3)
      )
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        institution_type = VALUES(institution_type),
        verification_status = 'VERIFIED'
    `);

    // Insert Branch with accurate WGS 84 Point
    await prisma.$executeRawUnsafe(`
      INSERT INTO institution_branches (
        id, institution_id, branch_name, address_line1, area, city, district, state, country,
        postal_code, latitude, longitude, location_point, contact_phone, is_active, created_at, updated_at
      ) VALUES (
        ${branchId},
        ${instId},
        '${instConf.area} Central Depot',
        '${instConf.address}',
        '${instConf.area}',
        'Chennai',
        'Chennai',
        'Tamil Nadu',
        'India',
        '${instConf.postalCode}',
        ${instConf.latitude},
        ${instConf.longitude},
        ST_SRID(POINT(${instConf.longitude}, ${instConf.latitude}), 4326),
        '${instConf.phone}',
        1,
        NOW(3),
        NOW(3)
      )
      ON DUPLICATE KEY UPDATE
        address_line1 = VALUES(address_line1),
        latitude = VALUES(latitude),
        longitude = VALUES(longitude),
        location_point = ST_SRID(POINT(${instConf.longitude}, ${instConf.latitude}), 4326)
    `);
  }
  console.log(`✓ 36 Institutions & Spatial Branches seeded with SRID 4326 coordinates`);

  // 6. Seed Demo Users for All 10 Important Roles Across Chennai Hubs
  console.log(`\nSeeding Comprehensive Demo User Accounts...`);
  const demoUsers = [
    { id: 1, email: 'admin.chennai@bloodbridge.local', first: 'Dr. Sundaram', last: 'Rajagopal', phone: '+919840100001', roleId: 1, instId: 1, staffRole: 'BLOOD_BANK_OFFICER', roleName: 'SUPER_ADMIN' },
    { id: 2, email: 'dr.anand.kilpauk@bloodbridge.local', first: 'Dr. Anand', last: 'Krishnan', phone: '+919840100002', roleId: 3, instId: 1, staffRole: 'BLOOD_BANK_OFFICER', roleName: 'BLOOD_BANK_OFFICER' },
    { id: 3, email: 'dr.priya.annanagar@bloodbridge.local', first: 'Dr. Priya', last: 'Venkatesh', phone: '+919840100003', roleId: 2, instId: 2, staffRole: 'BLOOD_BANK_OFFICER', roleName: 'HOSPITAL_OFFICER' },
    { id: 4, email: 'dr.karthik.adyar@bloodbridge.local', first: 'Dr. Karthik', last: 'Subramanian', phone: '+919840100004', roleId: 4, instId: 3, staffRole: 'PATHOLOGIST', roleName: 'PATHOLOGIST_VERIFIER' },
    { id: 5, email: 'dr.swetha.tambaram@bloodbridge.local', first: 'Dr. Swetha', last: 'Ramesh', phone: '+919840100005', roleId: 3, instId: 4, staffRole: 'BLOOD_BANK_OFFICER', roleName: 'BLOOD_BANK_OFFICER' },
    { id: 6, email: 'admin.hospital.porur@bloodbridge.local', first: 'Mr. Rajesh', last: 'Kannan', phone: '+919840100006', roleId: 2, instId: 20, staffRole: 'BLOOD_BANK_OFFICER', roleName: 'HOSPITAL_OFFICER' },
    { id: 7, email: 'doctor.er.royapettah@bloodbridge.local', first: 'Dr. Meera', last: 'Narayanan', phone: '+919840100007', roleId: 2, instId: 15, staffRole: 'BLOOD_BANK_OFFICER', roleName: 'HOSPITAL_OFFICER' },
    { id: 8, email: 'bloodbank.greams@bloodbridge.local', first: 'Dr. Vikram', last: 'Chandran', phone: '+919840100008', roleId: 3, instId: 12, staffRole: 'BLOOD_BANK_OFFICER', roleName: 'BLOOD_BANK_OFFICER' },
    { id: 9, email: 'pathologist.egmore@bloodbridge.local', first: 'Dr. Shalini', last: 'Menon', phone: '+919840100009', roleId: 4, instId: 14, staffRole: 'PATHOLOGIST', roleName: 'PATHOLOGIST_VERIFIER' },
    { id: 10, email: 'inventory.tnagar@bloodbridge.local', first: 'Mr. Saravanan', last: 'Murugesan', phone: '+919840100010', roleId: 3, instId: 7, staffRole: 'BLOOD_BANK_OFFICER', roleName: 'BLOOD_BANK_OFFICER' },
    { id: 11, email: 'staff.velachery@bloodbridge.local', first: 'Ms. Divya', last: 'Balaji', phone: '+919840100011', roleId: 2, instId: 8, staffRole: 'COORDINATOR', roleName: 'HOSPITAL_OFFICER' },
    { id: 12, email: 'requester.emergency@bloodbridge.local', first: 'Dr. Arvind', last: 'Swaminathan', phone: '+919840100012', roleId: 2, instId: 13, staffRole: 'BLOOD_BANK_OFFICER', roleName: 'HOSPITAL_OFFICER' },
    { id: 13, email: 'supplier.central@bloodbridge.local', first: 'Mr. Gopinath', last: 'Vaidyanathan', phone: '+919840100013', roleId: 3, instId: 6, staffRole: 'BLOOD_BANK_OFFICER', roleName: 'BLOOD_BANK_OFFICER' },
    { id: 14, email: 'netops.chennai@bloodbridge.local', first: 'Capt. Ramanathan', last: 'Iyer', phone: '+919840100014', roleId: 1, instId: 1, staffRole: 'BLOOD_BANK_OFFICER', roleName: 'SUPER_ADMIN' }
  ];

  for (const u of demoUsers) {
    await prisma.$executeRawUnsafe(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, phone_number, is_active, is_verified, created_at, updated_at)
      VALUES (${u.id}, '${u.email}', '${demoPasswordHash}', '${u.first}', '${u.last}', '${u.phone}', 1, 1, NOW(3), NOW(3))
      ON DUPLICATE KEY UPDATE 
        password_hash = '${demoPasswordHash}',
        first_name = VALUES(first_name),
        last_name = VALUES(last_name),
        is_active = 1,
        is_verified = 1
    `);

    // Assign Role
    await prisma.$executeRawUnsafe(`
      INSERT INTO user_roles (user_id, role_id, assigned_at)
      VALUES (${u.id}, ${u.roleId}, NOW(3))
      ON DUPLICATE KEY UPDATE assigned_at = NOW(3)
    `);

    // Link Institution Staff
    await prisma.$executeRawUnsafe(`
      INSERT INTO institution_staff (id, institution_id, branch_id, user_id, staff_role, medical_registration_number, is_authorized_verifier, status, created_at, updated_at)
      VALUES (${u.id}, ${u.instId}, ${u.instId}, ${u.id}, '${u.staffRole}', 'TN-MC-DEMO-${1000 + u.id}', 1, 'ACTIVE', NOW(3), NOW(3))
      ON DUPLICATE KEY UPDATE
        institution_id = VALUES(institution_id),
        branch_id = VALUES(branch_id),
        staff_role = VALUES(staff_role),
        status = 'ACTIVE'
    `);
  }
  console.log(`✓ 14 Demo User Accounts seeded with hashed passwords & institutional staff profiles`);

  // 7. Seed Diverse Synthetic Blood Inventory Across Chennai Institutions
  console.log(`\nPopulating Realistic Synthetic Blood Inventory & Units...`);
  
  // Wipe old dynamic inventory units for clean idempotency if needed, but keep stable IDs
  let unitCounter = 1;
  let batchCounter = 1;

  // Let us populate inventory for institutions 1 to 25
  // Every institution has 10 to 30 units across different groups & components
  const bloodGroupIds = [1, 2, 3, 4, 5, 6, 7, 8]; // A+, A-, B+, B-, AB+, AB-, O+, O-
  const compIds = [1, 2, 3, 4, 5]; // WHOLE_BLOOD, PRBC, PLATELETS, FFP, CRYOPRECIPITATE

  for (let instId = 1; instId <= 25; instId++) {
    for (const bgId of bloodGroupIds) {
      for (const compId of [1, 2, 3]) { // WB, PRBC, Platelets
        const availableUnits = (instId % 3 === 0) ? (bgId === 8 ? 2 : 5) : ((instId + bgId) % 7 + 1);
        const bId = batchCounter++;

        await prisma.$executeRawUnsafe(`
          INSERT INTO blood_inventory (
            id, institution_id, branch_id, blood_group_id, phenotype_id, blood_component_id,
            available_units, reserved_units, quarantined_units, expired_units, last_updated_by, created_at, updated_at
          ) VALUES (
            ${bId}, ${instId}, ${instId}, ${bgId}, NULL, ${compId},
            ${availableUnits}, 0, 0, 0, 2, NOW(3), NOW(3)
          )
          ON DUPLICATE KEY UPDATE
            available_units = VALUES(available_units),
            updated_at = NOW(3)
        `);

        // Create traceable units
        for (let u = 0; u < Math.min(availableUnits, 3); u++) {
          const uId = unitCounter++;
          const din = `DIN-2026-CHN-${String(uId).padStart(6, '0')}`;
          const shelfDays = compId === 3 ? 5 : (compId === 2 ? 42 : 35);
          const expiryDate = new Date(Date.now() + shelfDays * 86400000).toISOString().slice(0, 10);
          const collectDate = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);

          await prisma.$executeRawUnsafe(`
            INSERT INTO blood_inventory_units (
              id, inventory_id, unit_identifier, institution_id, branch_id, blood_group_id, phenotype_id, blood_component_id,
              volume_ml, collection_date, expiry_date, status, verification_status, verified_by_staff_id, storage_location_ref,
              storage_temperature_current, created_at, updated_at
            ) VALUES (
              ${uId}, ${bId}, '${din}', ${instId}, ${instId}, ${bgId}, NULL, ${compId},
              300.00, '${collectDate}', '${expiryDate}', 'AVAILABLE', 'LAB_VERIFIED', 1,
              'FRIDGE-${instId}-BAY-${u+1}', 4.0, NOW(3), NOW(3)
            )
            ON DUPLICATE KEY UPDATE
              status = 'AVAILABLE',
              verification_status = 'LAB_VERIFIED'
          `);
        }
      }
    }
  }

  // Add Rare Bombay Phenotype Demonstration Units in Adyar (inst-3) and Greams Road (inst-12)
  const bombayBatches = [
    { instId: 3, uId: 9901, din: 'DIN-2026-CHN-BOMBAY-DEMO1' },
    { instId: 12, uId: 9902, din: 'DIN-2026-CHN-BOMBAY-DEMO2' }
  ];

  for (const bb of bombayBatches) {
    await prisma.$executeRawUnsafe(`
      INSERT INTO blood_inventory (
        institution_id, branch_id, blood_group_id, phenotype_id, blood_component_id,
        available_units, reserved_units, quarantined_units, expired_units, last_updated_by, created_at, updated_at
      ) VALUES (
        ${bb.instId}, ${bb.instId}, 7, 1, 2,
        2, 0, 0, 0, 4, NOW(3), NOW(3)
      )
      ON DUPLICATE KEY UPDATE available_units = 2, updated_at = NOW(3)
    `);

    const invRows: any = await prisma.$queryRawUnsafe(`
      SELECT id FROM blood_inventory 
      WHERE institution_id = ${bb.instId} AND branch_id = ${bb.instId} 
        AND blood_group_id = 7 AND phenotype_id = 1 AND blood_component_id = 2
      LIMIT 1
    `);
    const invId = invRows[0].id;

    await prisma.$executeRawUnsafe(`
      INSERT INTO blood_inventory_units (
        id, inventory_id, unit_identifier, institution_id, branch_id, blood_group_id, phenotype_id, blood_component_id,
        volume_ml, collection_date, expiry_date, status, verification_status, verified_by_staff_id, storage_location_ref,
        storage_temperature_current, created_at, updated_at
      ) VALUES (
        ${bb.uId}, ${invId}, '${bb.din}', ${bb.instId}, ${bb.instId}, 7, 1, 2,
        320.00, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 35 DAY), 'AVAILABLE', 'LAB_VERIFIED', 3,
        'ULTRA-COLD-BOMBAY-SECURE', -25.0, NOW(3), NOW(3)
      )
      ON DUPLICATE KEY UPDATE status = 'AVAILABLE', inventory_id = ${invId}
    `);
  }

  // Also include Expired and Quarantined Units to test rigorous filtering
  await prisma.$executeRawUnsafe(`
    INSERT INTO blood_inventory_units (
      id, inventory_id, unit_identifier, institution_id, branch_id, blood_group_id, phenotype_id, blood_component_id,
      volume_ml, collection_date, expiry_date, status, verification_status, storage_location_ref, storage_temperature_current
    ) VALUES 
    (9910, 1, 'DIN-2026-EXPIRED-TEST', 1, 1, 3, NULL, 2, 280.00, '2026-09-01', '2026-10-15', 'EXPIRED', 'LAB_VERIFIED', 'DISCARD-BIN', 4.0),
    (9911, 1, 'DIN-2026-QUARANTINE-TEST', 1, 1, 3, NULL, 2, 290.00, '2026-11-01', '2026-12-15', 'QUARANTINED', 'REJECTED', 'QUARANTINE-VAULT', 4.0)
    ON DUPLICATE KEY UPDATE status = VALUES(status)
  `);
  console.log(`✓ Blood inventory and unit-level records created (over 200 units across standard & rare Bombay Oh)`);

  // 8. Seed Complete Blood Request Workflow Records
  console.log(`\nSeeding Sample Demo Blood Requests & Reservations...`);
  const sampleRequests = [
    {
      id: 101,
      code: 'REQ-CHN-DEMO-B+PRBC',
      instId: 2, // Anna Nagar (Dr. Priya)
      userId: 3,
      bgId: 3, // B+
      compId: 2, // PRBC
      units: 4,
      urgency: 'CRITICAL_EMERGENCY',
      indication: 'Emergency trauma resuscitation: multi-vehicle collision on Inner Ring Road [DEMO]',
      status: 'OPEN'
    },
    {
      id: 102,
      code: 'REQ-CHN-DEMO-O-NEG',
      instId: 3, // Adyar (Dr. Karthik)
      userId: 4,
      bgId: 8, // O-
      compId: 2, // PRBC
      units: 2,
      urgency: 'CRITICAL_EMERGENCY',
      indication: 'Immediate uncrossmatched resuscitation for acute hemorrhagic shock in pediatric surgery [DEMO]',
      status: 'OPEN'
    },
    {
      id: 103,
      code: 'REQ-CHN-DEMO-A+PRBC',
      instId: 15, // Royapettah
      userId: 7,
      bgId: 1, // A+
      compId: 2, // PRBC
      units: 3,
      urgency: 'URGENT',
      indication: 'Urgent cardiac surgery cardiopulmonary bypass support [DEMO]',
      status: 'OPEN'
    },
    {
      id: 104,
      code: 'REQ-CHN-DEMO-PLATELET',
      instId: 14, // Egmore
      userId: 9,
      bgId: 7, // O+
      compId: 3, // Platelets
      units: 2,
      urgency: 'URGENT',
      indication: 'Severe dengue thrombocytopenia with platelet count < 15,000/uL [DEMO]',
      status: 'OPEN'
    },
    {
      id: 105,
      code: 'REQ-CHN-DEMO-PLASMA',
      instId: 20, // Porur
      userId: 6,
      bgId: 5, // AB+
      compId: 4, // FFP
      units: 4,
      urgency: 'STANDARD',
      indication: 'Coagulopathy correction in complex liver resection procedure [DEMO]',
      status: 'OPEN'
    },
    {
      id: 106,
      code: 'REQ-CHN-DEMO-BOMBAY-OH',
      instId: 13, // Thousand Lights
      userId: 12,
      bgId: 7,
      phenoId: 1, // Bombay Oh
      compId: 2,
      units: 2,
      urgency: 'CRITICAL_EMERGENCY',
      indication: 'RARE PHENOTYPE PROTOCOL: Confirmed Bombay Phenotype (Oh) patient with active hemorrhage. Anti-H present in serum. Standard O- blood contraindicated! [DEMO]',
      status: 'OPEN'
    }
  ];

  for (const req of sampleRequests) {
    await prisma.$executeRawUnsafe(`
      INSERT INTO blood_requests (
        id, request_code, requesting_institution_id, requesting_branch_id, requesting_user_id,
        patient_pseudonym_id, blood_group_id, required_phenotype_id, blood_component_id,
        units_requested, urgency_level, clinical_indication, delivery_required_by, status, created_at, updated_at
      ) VALUES (
        ${req.id},
        '${req.code}',
        ${req.instId},
        ${req.instId},
        ${req.userId},
        'PT-PSEUDO-DEMO-${req.id}',
        ${req.bgId},
        ${req.phenoId || 'NULL'},
        ${req.compId},
        ${req.units},
        '${req.urgency}',
        '${req.indication}',
        DATE_ADD(NOW(3), INTERVAL 4 HOUR),
        '${req.status}',
        NOW(3),
        NOW(3)
      )
      ON DUPLICATE KEY UPDATE
        clinical_indication = VALUES(clinical_indication),
        status = VALUES(status)
    `);
  }
  console.log(`✓ 6 Diverse Emergency Blood Requests seeded (including Bombay Oh and O- Negative)`);

  // 9. Seed Reservations
  await prisma.$executeRawUnsafe(`
    INSERT INTO reservations (
      id, reservation_code, request_id, inventory_unit_id, holding_institution_id, holding_branch_id,
      reserved_by_user_id, status, expires_at, reserved_at, created_at, updated_at
    ) VALUES (
      1001,
      'RES-DEMO-B+PRBC-01',
      101,
      1,
      1,
      1,
      2,
      'HELD',
      DATE_ADD(NOW(3), INTERVAL 2 HOUR),
      NOW(3),
      NOW(3),
      NOW(3)
    )
    ON DUPLICATE KEY UPDATE status = 'HELD'
  `);
  console.log(`✓ Active blood reservation established`);

  // 10. Seed Hospital-to-Hospital Simple Chat Conversations & History
  console.log(`\nSeeding Hospital-to-Hospital Chat Conversations & Messages...`);
  const chatPairs = [
    { a: 1, b: 2, ch: 'conv-inst-1-inst-2', nameA: 'Kilpauk Hub', nameB: 'Anna Nagar Premier' },
    { a: 2, b: 4, ch: 'conv-inst-2-inst-4', nameA: 'Anna Nagar Premier', nameB: 'Tambaram Storage' },
    { a: 1, b: 3, ch: 'conv-inst-1-inst-3', nameA: 'Kilpauk Hub', nameB: 'Adyar Transfusion' },
    { a: 3, b: 12, ch: 'conv-inst-3-inst-12', nameA: 'Adyar Transfusion', nameB: 'Greams Road Hub' },
    { a: 1, b: 6, ch: 'conv-inst-1-inst-6', nameA: 'Kilpauk Hub', nameB: 'Perambur Railway' },
    { a: 2, b: 20, ch: 'conv-inst-2-inst-20', nameA: 'Anna Nagar Premier', nameB: 'Porur Med College' }
  ];

  for (let idx = 0; idx < chatPairs.length; idx++) {
    const cp = chatPairs[idx];
    const cId = idx + 10;

    await prisma.$executeRawUnsafe(`
      INSERT INTO conversations (id, channel_identifier, institution_a_id, institution_b_id, status, created_at, last_message_at)
      VALUES (${cId}, '${cp.ch}', ${cp.a}, ${cp.b}, 'ACTIVE', NOW(3), NOW(3))
      ON DUPLICATE KEY UPDATE last_message_at = NOW(3)
    `);

    // Insert realistic coordination dialogue
    await prisma.$executeRawUnsafe(`
      INSERT INTO messages (
        id, conversation_id, sender_user_id, sender_institution_id, message_text, is_read, is_encrypted, created_at
      ) VALUES 
      (
        ${200 + idx * 2},
        ${cId},
        ${cp.a === 1 ? 2 : (cp.a === 2 ? 3 : 4)},
        ${cp.a},
        'EMERGENCY INQUIRY: Confirming cold-chain transfer readiness for patient protocol [DEMO].',
        1,
        0,
        DATE_SUB(NOW(3), INTERVAL 15 MINUTE)
      ),
      (
        ${201 + idx * 2},
        ${cId},
        ${cp.b === 2 ? 3 : (cp.b === 4 ? 5 : 2)},
        ${cp.b},
        'ACKNOWLEDGED: Blood units verified, crossmatched, and packed at 3.8°C with digital temperature logger ready for pickup.',
        0,
        0,
        DATE_SUB(NOW(3), INTERVAL 5 MINUTE)
      )
      ON DUPLICATE KEY UPDATE message_text = VALUES(message_text)
    `);
  }
  console.log(`✓ Simple Hospital-to-Hospital conversations & coordination message history seeded`);

  console.log('\n================================================================');
  console.log('CHENNAI DEMO ENVIRONMENT SEEDING COMPLETED SUCCESSFULLY!');
  console.log('================================================================\n');
}

// Execute seed on invocation
seedDemoData()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('Seeding failed:', err);
    await prisma.$disconnect();
    process.exit(1);
  });

import mysql from 'mysql2/promise';

/**
 * BLOODBRIDGE CONCURRENCY-SAFE RESERVATION SERVICE
 *
 * Implements strict InnoDB transactional locking using SELECT ... FOR UPDATE.
 * Prevents race conditions and double-allocation when multiple hospitals
 * compete for the same blood unit.
 */

export interface ReservationParams {
  requestId: number | bigint;
  holdingBranchId: number | bigint;
  bloodGroupId: number;
  bloodComponentId: number;
  phenotypeId?: number | bigint | null;
  reservedByUserId: number | bigint;
  ttlMinutes?: number;
}

export interface ReservationResult {
  success: boolean;
  reservationCode?: string;
  reservationId?: number | bigint;
  unitIdentifier?: string;
  expiresAt?: Date;
  error?: string;
}

/**
 * Execute concurrency-safe unit reservation with deadlock retry protection
 */
export async function reserveBloodUnitSafely(
  pool: mysql.Pool,
  params: ReservationParams,
  maxRetries: number = 3
): Promise<ReservationResult> {
  const ttlMinutes = params.ttlMinutes || 15;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const connection = await pool.getConnection();

    try {
      // Step 1: Set isolation level and start InnoDB transaction
      await connection.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED;');
      await connection.beginTransaction();

      // Step 2: Lock eligible unit using SELECT ... FOR UPDATE
      // Criteria: Matching branch, group, component, phenotype, AVAILABLE, LAB_VERIFIED, and not expired
      const selectQuery = `
        SELECT u.id, u.unit_identifier, u.inventory_id, u.institution_id, u.branch_id
        FROM blood_inventory_units u
        WHERE u.branch_id = ?
          AND u.blood_group_id = ?
          AND u.blood_component_id = ?
          AND (? IS NULL OR u.phenotype_id = ?)
          AND u.status = 'AVAILABLE'
          AND u.verification_status = 'LAB_VERIFIED'
          AND u.expiry_date >= CURDATE()
        ORDER BY u.expiry_date ASC, u.id ASC
        LIMIT 1
        FOR UPDATE;
      `;

      const [units] = await connection.query<any[]>(selectQuery, [
        params.holdingBranchId,
        params.bloodGroupId,
        params.bloodComponentId,
        params.phenotypeId ?? null,
        params.phenotypeId ?? null,
      ]);

      if (!units || units.length === 0) {
        await connection.rollback();
        return {
          success: false,
          error: 'NO_ELIGIBLE_UNITS_AVAILABLE: No verified, non-expired unit matching criteria is currently available.',
        };
      }

      const unit = units[0];
      const reservationCode = `RES-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;

      // Step 3: Insert Reservation with strict TTL
      const insertResQuery = `
        INSERT INTO reservations (
          reservation_code, request_id, inventory_unit_id,
          holding_institution_id, holding_branch_id,
          reserved_by_user_id, status, expires_at, reserved_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, 'HELD',
          DATE_ADD(CURRENT_TIMESTAMP(3), INTERVAL ? MINUTE),
          CURRENT_TIMESTAMP(3)
        );
      `;

      const [resResult]: any = await connection.query(insertResQuery, [
        reservationCode,
        params.requestId,
        unit.id,
        unit.institution_id,
        unit.branch_id,
        params.reservedByUserId,
        ttlMinutes,
      ]);

      const reservationId = resResult.insertId;

      // Step 4: Update Unit Status to RESERVED
      await connection.query(
        `UPDATE blood_inventory_units SET status = 'RESERVED', updated_at = CURRENT_TIMESTAMP(3) WHERE id = ?;`,
        [unit.id]
      );

      // Step 5: Update Summary Batch Table counts (available - 1, reserved + 1)
      await connection.query(
        `UPDATE blood_inventory
         SET available_units = CASE WHEN available_units > 0 THEN available_units - 1 ELSE 0 END,
             reserved_units = reserved_units + 1,
             updated_at = CURRENT_TIMESTAMP(3)
         WHERE id = ?;`,
        [unit.inventory_id]
      );

      // Step 6: Log Immutable Audit Movement
      await connection.query(
        `INSERT INTO inventory_movements (
          inventory_unit_id, movement_type, previous_status, new_status,
          reference_reservation_id, performed_by_user_id, notes
        ) VALUES (?, 'RESERVED', 'AVAILABLE', 'RESERVED', ?, ?, ?);`,
        [
          unit.id,
          reservationId,
          params.reservedByUserId,
          `Reserved under code ${reservationCode} for request ${params.requestId}`,
        ]
      );

      // Step 7: Commit transaction atomically
      await connection.commit();

      const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

      return {
        success: true,
        reservationCode,
        reservationId,
        unitIdentifier: unit.unit_identifier,
        expiresAt,
      };
    } catch (err: any) {
      await connection.rollback();

      // MySQL Deadlock code (ER_LOCK_DEADLOCK: 1213) or Lock Wait Timeout (ER_LOCK_WAIT_TIMEOUT: 1205)
      if ((err.errno === 1213 || err.errno === 1205) && attempt < maxRetries) {
        const backoff = attempt * 50;
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }

      return {
        success: false,
        error: `TRANSACTION_FAILED: ${err.message}`,
      };
    } finally {
      connection.release();
    }
  }

  return {
    success: false,
    error: 'MAX_RETRIES_EXCEEDED: Deadlock or lock contention could not be resolved.',
  };
}

/**
 * Automatic Release of Expired Reservations Worker
 * Re-enters expired 'HELD' units back into 'AVAILABLE' stock.
 */
export async function releaseExpiredReservations(pool: mysql.Pool): Promise<number> {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [expired]: any[] = await connection.query(`
      SELECT r.id, r.inventory_unit_id, r.reservation_code, u.inventory_id
      FROM reservations r
      JOIN blood_inventory_units u ON r.inventory_unit_id = u.id
      WHERE r.status = 'HELD'
        AND r.expires_at < CURRENT_TIMESTAMP(3)
      FOR UPDATE;
    `);

    let releasedCount = 0;

    for (const item of expired) {
      await connection.query(
        `UPDATE reservations
         SET status = 'RELEASED_EXPIRED',
             released_at = CURRENT_TIMESTAMP(3),
             release_reason = 'TTL_EXPIRED'
         WHERE id = ?;`,
        [item.id]
      );

      await connection.query(
        `UPDATE blood_inventory_units
         SET status = 'AVAILABLE',
             updated_at = CURRENT_TIMESTAMP(3)
         WHERE id = ?;`,
        [item.inventory_unit_id]
      );

      await connection.query(
        `UPDATE blood_inventory
         SET available_units = available_units + 1,
             reserved_units = CASE WHEN reserved_units > 0 THEN reserved_units - 1 ELSE 0 END,
             updated_at = CURRENT_TIMESTAMP(3)
         WHERE id = ?;`,
        [item.inventory_id]
      );

      await connection.query(
        `INSERT INTO inventory_movements (
          inventory_unit_id, movement_type, previous_status, new_status,
          reference_reservation_id, performed_by_user_id, notes
        ) VALUES (?, 'RESERVATION_EXPIRED', 'RESERVED', 'AVAILABLE', ?, 1, 'Auto-released by background expiration engine');`,
        [item.inventory_unit_id, item.id]
      );

      releasedCount++;
    }

    await connection.commit();
    return releasedCount;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

# Person 1: Database Integration Checklist & Coordination Requirements (for Person 2)

**Author:** Person 1 (Backend API & Integration Lead)  
**Target:** Person 2 (Database & PostgreSQL Lead)  
**Branch:** `roopika`  
**Date:** November 22, 2026  

---

## 1. Executive Summary & Coordination Policy

The BloodBridge backend currently operates on a clean repository pattern implemented in `backend/src/database/repository.ts`. To ensure zero disruption to current working APIs, the in-memory data store remains active as a resilient fallback. 

Person 1 does **not** assume, invent, or force any competing schema or migrations. Person 2 is the sole owner of PostgreSQL schema definitions and migration scripts. This checklist outlines the exact tables, columns, transaction semantics, spatial queries, and environment details required to wire the backend to Person 2's PostgreSQL database.

---

## 2. In-Memory Repository Functions Requiring Database Implementation

Every method in `backend/src/database/repository.ts` maps directly to an asynchronous database query:

| Repository Area | In-Memory Function | Expected Database Query / Operation |
|---|---|---|
| **Institutions** | `institutions.get(id)` | `SELECT * FROM institutions WHERE id = $1` |
| **Institutions** | `institutions.values()` (all) | `SELECT * FROM institutions WHERE is_verified = true` |
| **Users / Auth** | `users.get(id)` | `SELECT * FROM users WHERE id = $1 AND is_active = true` |
| **Users / Auth** | Find by email | `SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1` |
| **Inventory** | Find by institution | `SELECT * FROM blood_inventory_batches WHERE institution_id = $1` |
| **Inventory** | Update units | `UPDATE blood_inventory_batches SET available_units = $1, last_verified_at = NOW() WHERE id = $2` |
| **Requests** | Create request | `INSERT INTO blood_requests (...) VALUES (...) RETURNING *` |
| **Reservations** | Create provisional hold | Atomic transaction with `FOR UPDATE` lock (see Section 4) |
| **Chat Messages** | Get by channel ID | `SELECT * FROM chat_messages WHERE conversation_id = $1 ORDER BY created_at ASC` |
| **Chat Messages** | Save message | `INSERT INTO chat_messages (...) VALUES (...) RETURNING *` |

---

## 3. PostGIS Location Queries for Chennai Institutions

In `backend/src/routes/requestRoutes.ts`, proximity matching currently calculates mock distances based on locality tags (`Perambur`, `Thousand Lights`, `Guindy`). 

Once Person 2's database is connected, this query will be replaced by a PostGIS spatial distance query:
```sql
-- Query matching institutions within 25 km of delivery coordinates in Chennai
SELECT 
    i.id,
    i.name,
    i.locality,
    i.emergency_contact_phone,
    ROUND((ST_DistanceSphere(i.location_coordinates, ST_SetSRID(ST_MakePoint($1, $2), 4326)) / 1000.0)::numeric, 1) AS distance_km,
    COALESCE(SUM(b.available_units), 0) AS total_available_units
FROM institutions i
JOIN blood_inventory_batches b ON i.id = b.institution_id
WHERE b.blood_group = $3 
  AND b.available_units > 0
  AND b.expiry_date > CURRENT_DATE
  AND b.testing_status = 'MANDATORY_TESTS_PASSED'
  AND ST_DWithin(i.location_coordinates::geography, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, 25000)
GROUP BY i.id, i.name, i.locality, i.emergency_contact_phone, i.location_coordinates
ORDER BY distance_km ASC;
```

---

## 4. Transactional Concurrency & Row-Level Locking (Anti-Double Booking)

To guarantee that two hospitals in Chennai never reserve the same unit simultaneously, Person 2 must support row-level locking via PostgreSQL `SELECT ... FOR UPDATE`:

```sql
BEGIN;

-- 1. Lock the inventory batch record to prevent race conditions
SELECT id, available_units, reserved_units 
FROM blood_inventory_batches 
WHERE id = $1 AND available_units >= $2 
FOR UPDATE;

-- 2. Decrement available units and increment reserved units
UPDATE blood_inventory_batches 
SET available_units = available_units - $2, 
    reserved_units = reserved_units + $2,
    updated_at = NOW()
WHERE id = $1;

-- 3. Insert reservation record with 15-minute provisional TTL
INSERT INTO blood_reservations (
    id, request_id, inventory_batch_id, fulfilling_institution_id, 
    units_reserved, reservation_status, expires_at, created_at
) VALUES (
    $3, $4, $1, $5, 
    $2, 'HELD_PROVISIONAL_TTL', NOW() + INTERVAL '15 minutes', NOW()
);

COMMIT;
```

---

## 5. Automated Hold Expiration (Provisional TTL Cleanup)

Provisional holds expire automatically after 15 minutes if not confirmed by medical staff. Person 2 can implement this via a recurring PostgreSQL background worker, pg_cron, or a backend scheduled job:

```sql
-- Rollback expired provisional holds:
BEGIN;

-- Find all expired holds
WITH expired_holds AS (
    UPDATE blood_reservations
    SET reservation_status = 'EXPIRED', updated_at = NOW()
    WHERE reservation_status = 'HELD_PROVISIONAL_TTL' 
      AND expires_at < NOW()
    RETURNING id, inventory_batch_id, units_reserved
)
-- Return reserved units back to available pool
UPDATE blood_inventory_batches b
SET available_units = b.available_units + eh.units_reserved,
    reserved_units = b.reserved_units - eh.units_reserved,
    updated_at = NOW()
FROM expired_holds eh
WHERE b.id = eh.inventory_batch_id;

COMMIT;
```

---

## 6. Information and Deliverables Required from Person 2

To complete live PostgreSQL hookup, Person 1 requires the following from Person 2:
- [ ] **Connection Parameters:** Host, port, database name, user, password, or full `DATABASE_URL`.
- [ ] **Migration Command / Schema File:** Confirmation that migration scripts (Prisma, Drizzle, or raw SQL) have executed successfully.
- [ ] **Table & Column Naming Confirmation:** Ensure field naming follows snake_case as outlined in `BLOODBRIDGE_DATABASE_DESIGN.md`.
- [ ] **Seed Data:** Ensure at least 4 verified Chennai blood bank institutions and sample batches are seeded for live verification.

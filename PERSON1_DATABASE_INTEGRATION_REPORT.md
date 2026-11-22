# BloodBridge: Person 1 Database Integration & Coordination Report

**Author:** Person 1 (Backend API Lead)  
**Collaborator:** Person 2 (Database & PostgreSQL Lead)  
**Branch:** `roopika`  
**Date:** November 22, 2026  

---

## 1. Database Integration Status

```
CURRENT STATUS: READY FOR PERSON 2 LIVE POSTGRESQL HOOKUP
FALLBACK ARCHITECTURE: THREAD-SAFE IN-MEMORY REPOSITORY (ACTIVE)
```

To maintain complete development velocity while preserving Person 2's exclusive ownership of database schema and migrations:
1. The backend repository `backend/src/database/repository.ts` strictly mirrors Person 2's DDL entity model.
2. An active `DATABASE_URL` configuration is declared in `backend/src/config/env.ts`.
3. Once Person 2 provides the live PostgreSQL instance, the data layer switches seamlessly from `DatabaseRepository` to `pg.Pool` or Drizzle ORM.

---

## 2. Table & Column Mapping Contract

| Backend Model | Person 2 PostgreSQL Table | Key Columns Used by Backend |
|---|---|---|
| `Institution` | `institutions` | `id`, `name`, `registration_license_number`, `institution_type`, `location_coordinates`, `locality`, `city`, `is_verified` |
| `User` | `users` | `id`, `institution_id`, `full_name`, `email`, `password_hash`, `user_role`, `is_active` |
| `BloodBatch` | `blood_inventory_batches` | `id`, `institution_id`, `bag_barcode`, `blood_group`, `rare_phenotype_details`, `available_units`, `reserved_units`, `expiry_date` |
| `BloodRequest` | `blood_requests` | `id`, `requesting_institution_id`, `urgency_tier`, `blood_group_requested`, `units_requested`, `patient_pseudonym_id`, `delivery_location` |
| `BloodReservation`| `blood_reservations` | `id`, `request_id`, `inventory_batch_id`, `fulfilling_institution_id`, `units_reserved`, `reservation_status`, `expires_at` |
| `ChatMessageEntity`| `chat_messages` | `id`, `conversation_id`, `sender_user_id`, `sender_institution_id`, `message_text`, `is_read`, `created_at` |

---

## 3. Mandatory Concurrency Locking Specification for Person 2

To prevent double-booking during concurrent Chennai trauma emergency requests:
```sql
-- Transaction executed when a reservation request arrives:
BEGIN;
SELECT id, available_units, reserved_units 
FROM blood_inventory_batches 
WHERE id = $1 AND available_units >= $2 
FOR UPDATE;

UPDATE blood_inventory_batches 
SET available_units = available_units - $2, 
    reserved_units = reserved_units + $2 
WHERE id = $1;

INSERT INTO blood_reservations (id, request_id, inventory_batch_id, fulfilling_institution_id, units_reserved, expires_at)
VALUES ($3, $4, $1, $5, $2, NOW() + INTERVAL '15 minutes');
COMMIT;
```

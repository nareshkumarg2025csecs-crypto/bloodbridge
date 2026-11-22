# BLOODBRIDGE CONCURRENCY-SAFE RESERVATION & TRANSACTION ENGINE

### 1. The Contention Challenge
**Scenario:** A blood bank branch possesses exactly one unit of O-Negative PRBC (`DIN-2026-CHN-00001`). Two emergency department physicians from competing hospitals initiate reservation requests simultaneously at timestamp `T0`.

**Database Guarantee:** The database **must** ensure that exactly one reservation succeeds while the second request is safely rejected with an explicit notification, preventing double-allocation and catastrophic transfusion delays.

---

### 2. Transactional Locking Architecture (InnoDB)

```
Hospital Request A (Tx 1)              Hospital Request B (Tx 2)
        |                                       |
        +-- BEGIN TRANSACTION                   +-- BEGIN TRANSACTION
        |                                       |
        +-- SELECT ... FOR UPDATE (Unit 1)      +-- SELECT ... FOR UPDATE (Unit 1)
        |   [Acquires Exclusive X-Lock]         |   [Blocks / Waits on Row Lock]
        |                                       |
        +-- INSERT INTO reservations (HELD)     |
        |                                       |
        +-- UPDATE unit status = 'RESERVED'     |
        |                                       |
        +-- INSERT INTO inventory_movements     |
        |                                       |
        +-- COMMIT TRANSACTION                  |
            [Releases Row Lock] ----------------> [Unblocks: Tx 2 now reads Unit 1]
                                                |
                                                +-- Evaluates status = 'RESERVED'
                                                +-- Criteria not met (0 rows eligible)
                                                +-- ROLLBACK TRANSACTION
                                                +-- Returns NO_ELIGIBLE_UNITS
```

---

### 3. Step-by-Step Atomic Reservation Sequence
1. **Begin Transaction:** `SET TRANSACTION ISOLATION LEVEL READ COMMITTED; BEGIN;`
2. **Lock Candidate Unit:**
   ```sql
   SELECT id, unit_identifier, inventory_id, institution_id, branch_id
   FROM blood_inventory_units
   WHERE branch_id = ?
     AND blood_group_id = ?
     AND blood_component_id = ?
     AND status = 'AVAILABLE'
     AND verification_status = 'LAB_VERIFIED'
     AND expiry_date >= CURDATE()
   ORDER BY expiry_date ASC, id ASC
   LIMIT 1
   FOR UPDATE;
   ```
3. **Verify Row Count:** If 0 rows returned, execute `ROLLBACK` and return error.
4. **Insert Reservation:** Record reservation with TTL (`expires_at = NOW() + 15 MIN`).
5. **Update Unit State:** Set unit status to `RESERVED`.
6. **Decrement Inventory Summary:** Decrement `available_units`, increment `reserved_units`.
7. **Log Movement:** Insert immutable audit record in `inventory_movements`.
8. **Commit:** `COMMIT;` releases the lock atomically.

---

### 4. Automatic Release of Expired Reservations
Unconfirmed reservations expire after their TTL (e.g. 15 minutes) via a background sweeper task that re-enters units back into `AVAILABLE` stock and logs `RESERVATION_EXPIRED` movements.
See [reservation_engine.ts](file:///D:/PROJECT%20REPO/bloodbridge-main/database/scripts/reservation_engine.ts) for full implementation.

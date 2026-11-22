# BLOODBRIDGE INVENTORY ENGINE & TRACEABILITY DESIGN

### 1. Dual-Tier Inventory Model: Summary Batches + Unit-Level DIN
The platform maintains a two-tiered architecture:
1. **Summary Batch Table (`blood_inventory`)**:
   Provides O(1) indexed aggregations for high-throughput public dashboard queries, regional overview heatmaps, and quick stock counting.
2. **Traceable Unit Table (`blood_inventory_units`)**:
   Tracks each physical blood bag by its unique Donation Identification Number (DIN / ISBT 128 barcode). Holds exact collection and expiration dates, storage shelf coordinates, current refrigeration temperature, and pathologist verification signatures.

---

### 2. Allowed Inventory Statuses
- `AVAILABLE`: Fully screened, lab verified, non-expired, and ready for reservation.
- `RESERVED`: Temporarily locked by a hospital request under an active reservation window.
- `EXPIRED`: Past shelf-life date (automatically excluded from all availability queries).
- `QUARANTINED`: Suspended due to serology flags, temperature excursions, or storage anomalies.
- `UNAVAILABLE`: Temporarily offline or allocated to internal critical care.
- `PENDING_VERIFICATION`: Freshly collected or transferred unit awaiting testing sign-off.

---

### 3. Strict Available Stock SQL Query
To guarantee that unverified, expired, or quarantined blood is **never** presented as confirmed stock, all stock availability APIs must execute the following filtered query:

```sql
SELECT
  b.id AS branch_id,
  b.branch_name,
  bg.label AS blood_group,
  bc.name AS component_name,
  p.name AS rare_phenotype,
  COUNT(u.id) AS confirmed_available_units
FROM blood_inventory_units u
JOIN institution_branches b ON u.branch_id = b.id
JOIN institutions i ON b.institution_id = i.id
JOIN blood_groups bg ON u.blood_group_id = bg.id
JOIN blood_components bc ON u.blood_component_id = bc.id
LEFT JOIN blood_phenotypes p ON u.phenotype_id = p.id
WHERE u.status = 'AVAILABLE'
  AND u.verification_status = 'LAB_VERIFIED'
  AND u.expiry_date >= CURDATE()
  AND b.is_active = TRUE
  AND i.verification_status = 'VERIFIED'
GROUP BY b.id, b.branch_name, bg.label, bc.name, p.name;
```

---

### 4. Database Integrity Constraints
1. **Quantity Non-Negativity:** `available_units >= 0` enforced by `UNSIGNED` types and database checks.
2. **Expiration Ordering:** `CONSTRAINT chk_units_dates CHECK (expiry_date > collection_date)`
3. **Volume Sanity:** `CONSTRAINT chk_units_volume CHECK (volume_ml > 0.00)`
4. **Barcode Uniqueness:** `UNIQUE KEY uq_units_identifier (unit_identifier)`

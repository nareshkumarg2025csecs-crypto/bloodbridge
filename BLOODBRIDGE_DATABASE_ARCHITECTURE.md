# BLOODBRIDGE DATABASE ARCHITECTURE SPECIFICATION
## High-Availability, Concurrency-Safe MySQL 8.0.46 Architecture

### 1. Executive Summary & Purpose
The BloodBridge database provides the authoritative data platform for inter-institutional blood stock coordination, traceability, and patient emergency requisition across Chennai, Tamil Nadu.

**Engine:** MySQL 8.0.46 Community Edition  
**Storage Engine:** InnoDB (Strict ACID transactions, Row-level Locking)  
**Character Set:** `utf8mb4` with `utf8mb4_unicode_ci`  
**Spatial Representation:** WGS 84 (`SRID 4326`), `POINT(latitude, longitude)`  
**ORM / Data Layer:** Prisma ORM (v6.4.1) & Native MySQL Spatial Queries  

---

### 2. Medical Safety Architecture Principles
> [!IMPORTANT]
> **Transfusion Safety Requirement:**
> Blood group compatibility alone does **NOT** constitute medical authorization for transfusion.
> Final crossmatching, screening for irregular red cell antibodies, compatibility assays, and blood release remain the strict legal and medical responsibility of authorized hospital pathologists and medical officers.
> The database strictly restricts unit status transitions to verified states and logs all verification signatures.

---

### 3. Core Relational Entities & Data Dictionary

#### 3.1 Identity & Access Management
1. **`users`**: Platform actors including hospital officers, blood bank directors, pathologists, coordinators, and administrators.
   - Primary Key: `id` (BIGINT UNSIGNED AUTO_INCREMENT)
   - Unique: `email`, `phone_number`
   - Indexes: `(is_active, is_verified)`
2. **`roles`**: System roles (`SUPER_ADMIN`, `HOSPITAL_OFFICER`, `BLOOD_BANK_OFFICER`, `PATHOLOGIST_VERIFIER`).
3. **`user_roles`**: Many-to-many role binding with audit tracking (`assigned_at`, `assigned_by`).

#### 3.2 Institutional Structure & Governance
4. **`institutions`**: Licensed legal entities (Govt Blood Banks, Private Blood Banks, Hospitals, Storage Centres).
   - Unique: `license_number`, `official_email`
   - Attributes: `institution_type`, `verification_status`
5. **`institution_branches`**: Physical facilities with geographical location.
   - Spatial Column: `location_point` (`POINT NOT NULL SRID 4326`)
   - Constraints: Latitude between -90 and 90, Longitude between -180 and 180.
   - Spatial Index: `spx_branches_location`
6. **`institution_staff`**: Verified staff assignments linking medical registration numbers and verification authority (`is_authorized_verifier`).
7. **`institution_verifications`**: Legal license documents (Drug Control License, Clinical Establishment Act, NABH) with cryptographic hashes (`document_hash`).

#### 3.3 Clinical Blood Catalog
8. **`blood_groups`**: 8 primary ABO/Rh combinations with explicit antigen indicators (`antigen_a`, `antigen_b`, `antigen_d`).
9. **`blood_phenotypes`**: Rare phenotype catalog (Bombay phenotype `Oh`, Rh-Null, Kell-Null, Duffy-Null) storing structured antigen profiles in JSON and critical transfusion safety warnings.
10. **`blood_components`**: Blood products (`WHOLE_BLOOD`, `PRBC`, `PLATELETS`, `FFP`, `CRYOPRECIPITATE`) specifying exact storage temperatures, shelf life limits, and agitation requirements.

#### 3.4 Inventory Management & Traceability
11. **`blood_inventory`**: Aggregate branch-level stock tracking summary counts (`available_units`, `reserved_units`, `quarantined_units`, `expired_units`).
12. **`blood_inventory_units`**: Unit-level DIN/Barcode traceability.
    - Statuses: `AVAILABLE`, `RESERVED`, `EXPIRED`, `QUARANTINED`, `UNAVAILABLE`, `PENDING_VERIFICATION`
    - Mandatory Verification: `LAB_VERIFIED` by authorized staff before becoming `AVAILABLE`.
    - Check Constraints: `expiry_date > collection_date`, `volume_ml > 0.00`.

#### 3.5 Requisition & Concurrency-Safe Reservations
13. **`blood_requests`**: Emergency hospital requisitions referencing pseudonymized patient IDs (`patient_pseudonym_id`) and clinical indications.
14. **`reservations`**: Concurrency-locked reservations holding specific blood units with strict TTL expiry (`expires_at`, e.g. 15 minutes).
15. **`inventory_movements`**: Immutable audit journal of every state change, verification, transfer, and disposal.

#### 3.6 Communication, Privacy & Audit Logging
16. **`conversations`**: Secure channels between institutions mapped to Nexconn Chat SDK channel identifiers.
17. **`messages`**: Encrypted institutional communication records.
18. **`notifications`**: Emergency broadcast alerts and stock expiration warnings.
19. **`audit_logs`**: System audit trail capturing user, action, IP, and JSON diffs (`old_values`, `new_values`).
20. **`consent_records`**: Digital Personal Data Protection (DPDP) Act compliance records storing patient consent hashes and expiration timestamps.

---

### 4. Storage Engine & Timezone Policy
- All tables strictly utilize the **InnoDB** engine to ensure ACID transactional semantics.
- All timestamps use `DATETIME(3)` and are stored strictly in **UTC (`+00:00`)**.
- Local Chennai display conversions (`IST = UTC + 05:30`) are performed at the application presentation layer by Person 1 and Person 3.

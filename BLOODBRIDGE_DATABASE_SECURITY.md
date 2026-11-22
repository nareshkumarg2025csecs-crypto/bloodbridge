# BLOODBRIDGE DATABASE SECURITY & COMPLIANCE SPECIFICATION

### 1. Principle of Least Privilege
The database enforces strict privilege separation:

| User Account | Host | Assigned Roles & Grants | Use Case |
|---|---|---|---|
| `bloodbridge_app` | `localhost`, `127.0.0.1` | `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `EXECUTE`, `SHOW VIEW` on `bloodbridge_dev` & `bloodbridge_test` | Runtime backend API and transaction service |
| `bloodbridge_migrate` | `localhost`, `127.0.0.1` | `ALL PRIVILEGES` on `bloodbridge_dev` & `bloodbridge_test` | CI/CD pipelines, migration scripts, and schema evolution |
| `root` | `localhost` | Administrative DBA only | Never configured in application `.env` |

---

### 2. Digital Personal Data Protection (DPDP) Act Compliance (India)
1. **Pseudonymization of Patient Data:**
   The `blood_requests` table stores `patient_pseudonym_id` instead of plain-text patient names, Aadhaar numbers, or medical record numbers (MRNs).
2. **Strict Public Isolation:**
   Public inventory search queries join only `institution_branches`, `blood_inventory_units`, `blood_groups`, and `blood_components`. Patient identities, hospital staff phone numbers, and donor origins are never projected in search views.
3. **Consent Artifact Storage (`consent_records`):**
   Stores cryptographic digests (`evidence_digest`, SHA-256) of patient data-sharing authorization for inter-hospital transfers.
4. **Comprehensive Audit Journal (`audit_logs`):**
   Logs all sensitive lookups, reservation locks, and state modifications with operator ID, IP address, timestamp, and JSON diffs.

---

### 3. Backup & Disaster Recovery Runbook

#### 3.1 Consistent Logical Backup (mysqldump)
Run daily automated backup with transactional consistency:
```bash
mysqldump -u bloodbridge_migrate -p \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  --databases bloodbridge_dev > bloodbridge_backup_$(date +%F_%T).sql
```

#### 3.2 Recovery Procedure
```bash
mysql -u bloodbridge_migrate -p bloodbridge_dev < bloodbridge_backup_YYYY-MM-DD.sql
```

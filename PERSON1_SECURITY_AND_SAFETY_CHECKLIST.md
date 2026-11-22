# BloodBridge: Security & Clinical Medical Safety Checklist

**Author:** Person 1 (Backend API & Integration Lead)  
**Branch:** `roopika`  
**Date:** November 22, 2026  

---

## 1. Statutory Clinical & Medical Safety Directives

BloodBridge is an inventory coordination and emergency discovery network. It is **not** an automated diagnostic or transfusion release tool.

1. **No Automatic Clinical Compatibility Decisions:**
   - ABO/Rh matching alone does **not** establish transfusion compatibility.
   - Clinical compatibility, serological crossmatching, antibody screening, and blood unit release remain the exclusive statutory responsibility of licensed Medical Officers and blood bank Pathologists.
2. **Statutory Crossmatch Disclaimers:**
   - Every response returned by the search API (`/api/v1/requests/search`) explicitly contains:
     > *"Clinical compatibility must be confirmed via serological crossmatching by licensed medical personnel prior to transfusion."*
3. **Bombay Blood Group (`Oh`) Safety Safeguards:**
   - A Bombay blood group patient possesses anti-H antibodies and will suffer a fatal hemolytic reaction if transfused with standard O-negative blood.
   - The search engine explicitly detects Bombay queries and flags them for specialized pathology triage rather than matching with standard ABO groups.
4. **Clear Labeling of Demo Stock:**
   - In development/demo mode, all inventory records are labeled as test data. Demo stock must never be presented as confirmed real-world inventory.

---

## 2. Data Privacy & DPDP Act 2023 Compliance Checklist

- [x] **No Public Exposure of Patient Identifiers:** Blood request search payloads return institution names, localities, and stock counts only. Zero patient names, phone numbers, or clinical notes are exposed publicly.
- [x] **Pseudonymized Patient Tracking:** Blood requests use `patientPseudonymId` (e.g. `PT-CHN-2026-99012`) to prevent data harvesting.
- [x] **Secure Credential Storage:** Password hashing via bcrypt; passwords are never returned in user or auth payloads.
- [x] **Short-Lived JWT Tokens:** Access tokens expire after 15 minutes (900 seconds) to mitigate session hijacking risks.
- [x] **Server-Side Role Enforcement (RBAC):** `requireRoles` middleware gates private routes against privilege escalation.
- [x] **No False E2EE Claims:** Documentation and API contracts state clearly that transport is encrypted via TLS 1.3 in transit; unsupported end-to-end encryption claims have been removed.
- [x] **CORS & Rate Limiting:** CORS is locked to authorized frontend origins.
- [x] **Credential Isolation:** Secrets (`JWT_SECRET`, `NEXCONN_API_KEY`, `SMS_API_KEY`) are managed strictly via environment variables and excluded from Git commits via `.gitignore`.

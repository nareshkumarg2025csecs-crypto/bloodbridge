# BloodBridge: Comprehensive Test Plan & Validation Protocols

**Document:** `BLOODBRIDGE_TEST_PLAN.md`  
**Date:** November 22, 2026  
**Auditor:** Senior Software Architect, Healthcare Technology Auditor & Full-Stack Engineering Lead  

---

## 1. Testing Strategy Overview

Testing a life-critical blood coordination platform requires validation that extends far beyond standard web application tests. A bug in an e-commerce platform results in a delayed package; a bug in BloodBridge during an emergency transfusion can result in a fatal hemolytic reaction or loss of human life due to delayed resuscitation.

The testing strategy is organized across **four validation tiers**:
1. **Unit Testing**: Pure logic, regex/intent extraction, date and expiry calculations, blood compatibility rules, coordinate transformations.
2. **Integration Testing**: Database transactions, PostGIS spatial queries, Redis distributed locks, atomic stock decrements, CSV/Excel parsers.
3. **End-to-End (E2E) Testing**: Complete user journeys from emergency search to multi-institution chat, reservation, and dispatch confirmation.
4. **Stress & Concurrency Testing**: High-concurrency race condition simulations, network failure injection, offline/reconnection recovery.

---

## 2. Mandatory Test Cases & Scenarios

### 2.1. Blood Search & NLP Parser Test Cases
| Test ID | Scenario | Input | Expected Output | Assertion Type |
|---|---|---|---|---|
| **TC-NLP-01** | Standard English Request | `"Need 2 units of A positive in Perambur urgently"` | Blood: `A_POS`, Units: 2, Locality: `"Perambur"`, Urgency: `URGENT` | Unit Test |
| **TC-NLP-02** | Tanglish Emergency Request | `"Enakku Kolathur-la O positive blood urgent-ah venum 3 units"` | Blood: `O_POS`, Units: 3, Locality: `"Kolathur"`, Urgency: `URGENT` | Unit Test |
| **TC-NLP-03** | Rare Bombay Blood Group | `"Patient requires 2 units of Bombay blood group at Stanley Hospital"` | Blood: `BOMBAY_OH`, Units: 2, Flag: `RARE_PHENOTYPE_TRIAGE` | Unit Test |
| **TC-NLP-04** | Ambiguous Blood Group | `"Send blood to Kilpauk hospital immediately"` | Trigger clarification prompt: `"Please specify blood group and units required"` | Unit Test |
| **TC-NLP-05** | Negative Quantity Injection | `"-5 units of B negative"` | Validation Error: `422 Unprocessable Entity - Units must be positive integer` | Unit Test |
| **TC-NLP-06** | Invalid Blood Group String | `"Need 2 units of C+ blood"` | Validation Error: `Unknown blood group 'C+'. Supported: ABO, Rh, Bombay` | Unit Test |

---

### 2.2. Clinical Logic & Rare Group Test Cases
| Test ID | Scenario | Input Condition | Expected Clinical Safety Behavior | Assertion Type |
|---|---|---|---|---|
| **TC-CLN-01** | Bombay Blood Compatibility Safeguard | Request for Bombay Blood (`Oh`) | System MUST NOT match O-negative units. Must strictly match verified Bombay inventory or prompt rare donor registry. | Clinical Unit Test |
| **TC-CLN-02** | Universal Donor O-Negative Boundary | Request for O-Negative | Show O-Negative units; include warning: *"O-negative uncrossmatched blood reserved strictly for extreme uncrossmatched resuscitation under senior physician authorization"*. | Clinical Unit Test |
| **TC-CLN-03** | Expired Unit Exclusion | Batch collection date: `2026-10-01`, current date: `2026-11-22` (PRBC > 42 days) | Unit status marked `EXPIRED_DISCARD`. Excluded from search results. | Integration Test |
| **TC-CLN-04** | Quarantined Unit Exclusion | Unit testing status: `PENDING_TESTING` | Excluded from `AVAILABLE` search tallies. | Integration Test |

---

### 2.3. Concurrency, Distributed Locking & Race Condition Tests
| Test ID | Scenario | Test Setup | Expected System Behavior | Tooling |
|---|---|---|---|---|
| **TC-CONC-01** | Simultaneous Double Reservation | 1 remaining unit of O-negative at Apollo Blood Bank. 50 simulated concurrent HTTP requests arrive within 100ms. | Exactly **1** request succeeds (`201 Created` with 15-min TTL hold); **49** requests return `409 Conflict` (Unit already reserved). Available count becomes `0`. | k6 / Go concurrency script |
| **TC-CONC-02** | Provisional Hold Expiry (TTL Rollback) | 2 units reserved with 15-minute TTL hold. Requesting hospital fails to submit requisition. | At $t = 15\text{ min} + 1\text{ sec}$, worker reverts units to `AVAILABLE`. Available count increments by 2. | BullMQ / Redis test runner |
| **TC-CONC-03** | Concurrent Stock Update vs Reservation | Inventory tech uploads CSV setting B+ to 10 units while a reservation for 2 units is being confirmed. | Atomic transaction ensures final available units is exactly $10 - 2 = 8$, preventing dirty writes. | Integration Test |

---

### 2.4. Emergency Escalation State Machine Tests
| Test ID | Scenario | Trigger Condition | Expected Escalation Action |
|---|---|---|---|
| **TC-ESC-01** | Tier-1 Immediate Dispatch | Emergency Code Red request submitted. | Push notification + SMS dispatched to primary matched facility within 5 seconds. |
| **TC-ESC-02** | Tier-2 Timeout Escalation | Primary facility does not acknowledge within 3 minutes. | System triggers automated WhatsApp notification to on-duty blood bank supervisor. |
| **TC-ESC-03** | Tier-3 Critical Escalation | No acknowledgement at 7 minutes. | System triggers automated IVR phone call to landline desk and cascades request to 3 nearest secondary blood banks. |
| **TC-ESC-04** | Cancellation Propagation | Requesting doctor cancels request after patient stabilized. | Active reservation released immediately; all pending escalation timers aborted. |

---

### 2.5. Real-Time Chat & Telemetry Tests
| Test ID | Scenario | Test Flow | Expected Result |
|---|---|---|---|
| **TC-CHAT-01** | Inter-Hospital Message Delivery | Hospital A sends message in active transfer channel. | Hospital B receives WebSocket message payload in $<100$ms; delivery receipt returned to Hospital A. |
| **TC-CHAT-02** | Offline Reconnection Resynchronization | Hospital B loses network connectivity for 60 seconds while Hospital A sends 3 updates. | Upon reconnection, client sends `last_synced_message_id`; server streams missing 3 messages in correct chronological order. |
| **TC-CHAT-03** | Channel Access Boundary Violation | Hospital C attempts to join channel `ch-hospA-hospB-res101` using valid JWT. | Server rejects connection with `403 Forbidden` (User does not belong to authorized transfer institutions). |

---

### 2.6. Security, Privacy & Compliance Tests
| Test ID | Scenario | Execution Method | Expected Security Posture |
|---|---|---|---|
| **TC-SEC-01** | Token Tampering / Forged JWT | Send request with manually signed JWT or altered payload. | Server rejects with `401 Unauthorized` (`Signature verification failed`). |
| **TC-SEC-02** | SQL Injection via Locality Search | Send input: `Kolathur'; DROP TABLE blood_inventory; --` | Parameterized PostGIS query sanitizes string; zero SQL injection vulnerability. |
| **TC-SEC-03** | Malicious File Upload | Upload `malware.exe` renamed as `inventory.xlsx`. | MIME/Magic-byte validation rejects file with `415 Unsupported Media Type`. |
| **TC-SEC-04** | Patient PII Leak Prevention | Query public search endpoints. | Response payload contains zero patient names, Aadhaar numbers, or telephone numbers. |
| **TC-SEC-05** | Rate Limit Exhaustion | Send 100 search requests in 10 seconds from one IP. | Request 51 onward throttled with `429 Too Many Requests`. |

---

## 3. Recommended Automated Test Suite Architecture

```
tests/
├── unit/
│   ├── clinical-compatibility.test.ts  # ABO, Rh, Bombay rule validation
│   ├── nlp-extractor.test.ts          # English, Tamil, Tanglish parsing
│   ├── expiry-calculator.test.ts      # Component shelf-life algorithms
│   └── coordinate-distance.test.ts    # Haversine / PostGIS math tests
├── integration/
│   ├── database-concurrency.test.ts   # Row-level locking & race conditions
│   ├── inventory-crud.test.ts         # Batch addition, CSV upload validation
│   ├── auth-rbac.test.ts              # JWT, cookie, role boundary tests
│   └── escalation-worker.test.ts      # BullMQ timer & retry tests
├── e2e/
│   ├── emergency-request-flow.spec.ts # Complete flow: Search -> Hold -> Confirm
│   ├── chat-coordination.spec.ts      # Multi-user chat with reconnection
│   └── stock-reconciliation.spec.ts   # CSV upload -> Stock refresh -> Alert
└── load/
    ├── k6-concurrency-spike.js        # 500 concurrent emergency requests
    └── k6-inventory-scraper.js        # Rate-limiting verification under DDoS
```

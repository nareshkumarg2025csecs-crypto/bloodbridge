# BloodBridge: Person 1 Test Results & Verification Log

**Author:** Person 1 (Backend API & Integration Lead)  
**Branch:** `roopika`  
**Date:** November 22, 2026  

---

## 1. Automated Test Suite Execution (Jest + ts-jest)

```bash
$ npm.cmd test
PASS src/tests/backend.integration.test.ts
  BloodBridge Backend API & Coordination Integration Tests
    1. Institutional Authentication & JWT Signing
      √ should generate a valid cryptographically signed JWT for verified hospital user (4 ms)
      √ should reject forged or tampered JWT signatures (11 ms)
    2. ISBT 128 Batch Inventory Management & Rare Blood Groups
      √ should track rare Bombay blood group (Oh) with specialized phenotype details (1 ms)
      √ should accurately calculate total available stock units in Chennai facility (1 ms)
    3. Concurrency Protection & Atomic Stock Decrement
      √ should atomically decrement stock and prevent negative units (1 ms)
    4. Real-Time Chat & Nexconn Message Relay
      √ should store and associate messages with verified hospital channels (1 ms)

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        1.556 s
```

---

## 2. Live HTTP & WebSocket API Endpoint Verification

Executed against active Express server listening on `http://localhost:5000`:

| Test ID | Endpoint / Protocol | Scenario | Expected Behavior | Actual Result | Status |
|---|---|---|---|---|---|
| **API-01** | `GET /health` | Service health check | Returns status healthy, version 1.0.0 | `200 OK`, `status: healthy` | **PASSED** |
| **API-02** | `POST /api/v1/auth/login` | Valid hospital login | Issues signed JWT + user profile | `200 OK`, token issued | **PASSED** |
| **API-03** | `POST /api/v1/auth/login` | Invalid credentials | Rejects with 401 | `401 Unauthorized` | **PASSED** |
| **API-04** | `GET /api/v1/inventory/stats` | Dashboard KPI query | Dynamic sum of batch units | `200 OK`, `totalUnits: 247` | **PASSED** |
| **API-05** | `GET /api/v1/inventory` | 9 groups + Bombay Oh | Cards grouped with colors | `200 OK`, 9 groups returned | **PASSED** |
| **API-06** | `POST /api/v1/requests/search` | Bombay Oh distress query | Triage flag + disclaimer | `200 OK`, `parsedBlood: Bombay Oh` | **PASSED** |
| **API-07** | `POST /api/v1/requests/reserve` | 15-min provisional hold | Returns hold confirmation | `201 Created`, `TTL: 15m` | **PASSED** |
| **API-08** | `GET /api/v1/alerts` | Expiry alert retrieval | Returns prioritized batches | `200 OK`, 2 alerts returned | **PASSED** |
| **API-09** | `GET /api/v1/chat/messages/ch-city` | Message history | Chronological channel messages | `200 OK`, 2 messages returned | **PASSED** |
| **API-10** | `WS /ws?token=<JWT>` | Authenticated WebSocket | Upgrades connection to socket | Handshake accepted | **PASSED** |
| **API-11** | `WS /ws?token=invalid` | Tampered token WebSocket | Rejects unauthorized upgrade | `401 Unauthorized` | **PASSED** |

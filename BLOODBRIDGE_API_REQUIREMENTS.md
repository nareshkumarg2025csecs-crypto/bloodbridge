# BloodBridge: API Specifications & Integration Contract

**Document:** `BLOODBRIDGE_API_REQUIREMENTS.md`  
**Date:** November 22, 2026  
**Auditor:** Senior Software Architect, Healthcare Technology Auditor & Full-Stack Engineering Lead  

---

## 1. API Architecture Overview

The BloodBridge Backend API conforms to **RESTful conventions** for state transitions and CRUD operations, complemented by **WebSocket events** for live telemetry, chat, and emergency broadcasts. 

### Global Standards
- **Base URL**: `https://api.bloodbridge.in/api/v1`
- **Transport**: TLS 1.3 mandatory.
- **Authentication**: Bearer JWT passed in `Authorization: Bearer <token>` header, with refresh token stored in HttpOnly secure cookie.
- **Payload Format**: JSON (`application/json; charset=utf-8`).
- **Error Format**: RFC 7807 Problem Details (`application/problem+json`).
- **Idempotency**: All mutative emergency requests (`POST /requests`, `POST /reservations`) require an `Idempotency-Key: <uuid>` header to prevent accidental duplicate actions during network retries.

---

## 2. Core REST Endpoints

### 2.1. Authentication & Session

#### `POST /auth/login`
Authenticates an institutional user or administrator.

- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "email": "doctor.sharma@rajalakshmi.bloodbridge.in",
    "password": "CorrectHorseBatteryStaple123!",
    "client_device_fingerprint": "a8f9c1b2-e981-4b42"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 900,
    "user": {
      "id": "7f8b3c20-21a4-4a25-9c88-12c8b8123456",
      "name": "Dr. S. Sharma",
      "email": "doctor.sharma@rajalakshmi.bloodbridge.in",
      "role": "HOSPITAL_MEDICAL_OFFICER",
      "institution": {
        "id": "e9124a1b-3f24-4298-b8cf-824c98239012",
        "name": "Rajalakshmi Hospital",
        "type": "HOSPITAL_BLOOD_BANK",
        "license_number": "TN/CHN/2021/BL/0892",
        "is_verified": true
      }
    }
  }
  ```

---

### 2.2. AI-Powered Blood Search & Discovery

#### `POST /search/natural-language`
Processes natural language distress queries, extracts clinical intent, and ranks available units in verified Chennai institutions.

- **Request Body**:
  ```json
  {
    "query": "I need 3 units of O-positive blood near Kolathur, Chennai, urgently.",
    "user_latitude": 13.1235,
    "user_longitude": 80.2085,
    "language_hint": "en-IN"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "parsed_intent": {
      "blood_group": "O_POS",
      "units": 3,
      "component_type": "PACKED_RED_BLOOD_CELLS",
      "locality": "Kolathur",
      "city": "Chennai",
      "urgency_tier": "URGENT_WITHIN_6_HOURS",
      "confidence_score": 0.985,
      "requires_clarification": false
    },
    "ranked_institutions": [
      {
        "institution_id": "b1a45c20-11ef-4235-9c78-aa8211002233",
        "name": "City General Hospital Blood Centre",
        "locality": "Perambur",
        "distance_km": 2.4,
        "estimated_transit_minutes": 11,
        "verified_license": "TN/CHN/2019/BL/0451",
        "freshness": "LIVE_VERIFIED",
        "last_updated_at": "2026-11-22T14:15:00Z",
        "stock": {
          "blood_group": "O_POS",
          "component": "PACKED_RED_BLOOD_CELLS",
          "available_units": 12,
          "reserved_units": 2
        },
        "contact_phone": "+91-44-2550-1122"
      },
      {
        "institution_id": "c890ab45-88de-4412-a123-55bb33445566",
        "name": "Apollo Blood Bank Greams Road",
        "locality": "Thousand Lights",
        "distance_km": 8.1,
        "estimated_transit_minutes": 24,
        "verified_license": "TN/CHN/2018/BL/0112",
        "freshness": "RECENTLY_UPDATED",
        "last_updated_at": "2026-11-22T12:30:00Z",
        "stock": {
          "blood_group": "O_POS",
          "component": "PACKED_RED_BLOOD_CELLS",
          "available_units": 8,
          "reserved_units": 0
        },
        "contact_phone": "+91-44-2829-0200"
      }
    ],
    "clinical_disclaimer": "Transfusion compatibility must be clinically confirmed via serological crossmatching by an authorized blood bank pathologist prior to release."
  }
  ```

---

### 2.3. Blood Inventory Management

#### `GET /inventory`
Returns the batch inventory for the authenticated institution.

- **Query Parameters**: `component_type=PACKED_RED_BLOOD_CELLS&status=AVAILABLE`
- **Response `200 OK`**:
  ```json
  {
    "institution_id": "e9124a1b-3f24-4298-b8cf-824c98239012",
    "total_available_units": 245,
    "batches": [
      {
        "batch_id": "4a12c8b0-8801-4432-b889-1100aa223344",
        "bag_barcode": "ISBT-IND-TN-2026-004812",
        "blood_group": "B_POS",
        "component_type": "PACKED_RED_BLOOD_CELLS",
        "units": 1,
        "collection_date": "2026-11-10",
        "expiry_date": "2026-12-15",
        "testing_status": "MANDATORY_TESTS_PASSED",
        "storage_temperature_c": 4.2,
        "freshness_status": "LIVE_VERIFIED",
        "last_verified_at": "2026-11-22T13:45:00Z"
      }
    ]
  }
  ```

#### `POST /inventory/bulk-upload`
Uploads a physical stock reconciliation sheet (CSV or Excel).

- **Request Headers**: `Content-Type: multipart/form-data`
- **Form Data**: `file: stock_inventory_nov22.xlsx`
- **Response `202 Accepted`**:
  ```json
  {
    "job_id": "job-parse-778812",
    "filename": "stock_inventory_nov22.xlsx",
    "status": "PROCESSING",
    "total_rows_detected": 142
  }
  ```

---

### 2.4. Atomic Reservation & Dispatch

#### `POST /reservations`
Initiates a 15-minute provisional lock on a blood unit.

- **Request Headers**: `Idempotency-Key: 9b24c1a0-55e1-4c11-b012-77aa11223344`
- **Request Body**:
  ```json
  {
    "request_id": "3b8a1c90-22bb-44cc-88dd-112233445566",
    "inventory_batch_id": "4a12c8b0-8801-4432-b889-1100aa223344",
    "units": 2,
    "urgency_tier": "CODE_RED_MASSIVE_HEMORRHAGE",
    "patient_pseudonym_id": "PT-CHN-2026-99012"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "reservation_id": "res-9911-4422-bb00",
    "status": "HELD_PROVISIONAL_TTL",
    "units_locked": 2,
    "expires_at": "2026-11-22T14:40:00Z",
    "time_remaining_seconds": 900,
    "pickup_verification_otp": "784920",
    "message": "Units successfully reserved for 15 minutes. Blood bank notified."
  }
  ```

---

## 3. Real-Time WebSocket Specifications

### 3.1. Connection Handshake
- **Endpoint**: `wss://api.bloodbridge.in/ws`
- **Query Params**: `?token=<access_jwt>&institutionId=<uuid>`

### 3.2. Subscribed Topics & Events
- `emergency:code_red:chennai` — Regional emergency broadcast for unmatched urgent requests.
- `inventory:institution:<id>` — Live updates when units are reserved, added, or expired.
- `chat:channel:<channel_id>` — Encrypted message frames between coordinating medical teams.

### 3.3. Client-to-Server Event: Send Message
```json
{
  "event": "chat:send_message",
  "data": {
    "channel_id": "ch-city-rajalakshmi-res9912",
    "recipient_institution_id": "b1a45c20-11ef-4235-9c78-aa8211002233",
    "message_text": "Ambulance TN-01-AB-1234 dispatched with cold-box. ETA 12 mins.",
    "attachment_url": null
  }
}
```

### 3.4. Server-to-Client Event: Emergency Escalation Alert
```json
{
  "event": "emergency:escalation_tier_2",
  "data": {
    "request_id": "req-88712",
    "blood_group": "BOMBAY_OH",
    "units": 2,
    "urgency": "CODE_RED_MASSIVE_HEMORRHAGE",
    "requesting_hospital": "Government Stanley Medical College Hospital",
    "locality": "Royapuram, Chennai",
    "timeout_seconds": 180
  }
}
```

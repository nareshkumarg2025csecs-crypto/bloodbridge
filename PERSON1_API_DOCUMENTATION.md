# BloodBridge: Person 1 Backend API Documentation

**Author:** Person 1 (Backend API & Integration Lead)  
**Base URL:** `http://localhost:5000/api/v1`  
**WebSocket URL:** `ws://localhost:5000/ws?token=<JWT_ACCESS_TOKEN>`  
**Branch:** `roopika`  
**Date:** November 22, 2026  

---

## 1. Authentication & Security

All private endpoints require the `Authorization` header formatted as:
```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

### 1.1. Login
- **Method & Path:** `POST /api/v1/auth/login`
- **Request Body:**
  ```json
  {
    "email": "rajalakshmi@bloodbridge.in",
    "password": "password123"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
    "token_type": "Bearer",
    "expires_in": 900,
    "user": {
      "id": "usr-rajalakshmi-admin",
      "name": "Dr. R. Ramanathan",
      "email": "rajalakshmi@bloodbridge.in",
      "role": "HOSPITAL_MEDICAL_OFFICER",
      "institution": {
        "id": "inst-rajalakshmi",
        "name": "Rajalakshmi Hospital Blood Bank",
        "license": "TN/CHN/2021/BL/0892",
        "type": "HOSPITAL_BLOOD_BANK",
        "address": "Poonamallee High Road, Kilpauk",
        "locality": "Kilpauk",
        "isVerified": true
      }
    }
  }
  ```

---

## 2. Inventory Management

### 2.1. Get Stats (Dashboard KPI)
- **Method & Path:** `GET /api/v1/inventory/stats`
- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
  ```json
  {
    "totalUnits": 247,
    "partnerBanksCount": 4,
    "transfersToday": 8
  }
  ```

### 2.2. Get Inventory Cards & Batches
- **Method & Path:** `GET /api/v1/inventory`
- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
  - Returns 9 blood groups (A+, A-, B+, B-, O+, O-, AB+, AB-, and **Bombay Oh**) with counts, hex design tokens, and bag-level batches.

### 2.3. Update Stock Units
- **Method & Path:** `PUT /api/v1/inventory/stock/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  { "units": 45 }
  ```

---

## 3. Search, Discovery & Provisional Holds

### 3.1. Natural Language Search & Chennai Spatial Ranking
- **Method & Path:** `POST /api/v1/requests/search`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "query": "Need 2 units of Bombay blood group urgently near Stanley Hospital"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "parsedBlood": "Bombay Oh",
    "unitsRequested": 2,
    "isUrgent": true,
    "results": [
      {
        "id": "inst-city",
        "name": "City General Hospital Blood Centre",
        "distance": "2.4 km",
        "units": 12,
        "bloodType": "Bombay Oh",
        "locality": "Perambur",
        "phone": "+91-44-2550-1122",
        "freshness": "LIVE_VERIFIED"
      }
    ],
    "disclaimer": "Clinical compatibility must be confirmed via serological crossmatching by licensed medical personnel prior to transfusion."
  }
  ```

### 3.2. Provisional Hold (15-Minute TTL)
- **Method & Path:** `POST /api/v1/requests/reserve`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "targetInstitutionId": "inst-city",
    "bloodType": "B+",
    "units": 2
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "reservationId": "res-1732270000000",
    "status": "HELD_PROVISIONAL_TTL",
    "expiresInMinutes": 15,
    "message": "Provisional hold placed for 2 units of B+. Partner blood bank alerted."
  }
  ```

---

## 4. WebSocket Real-Time Gateway

- **Handshake:** Connect via WebSocket with JWT in query:
  `ws://localhost:5000/ws?token=<ACCESS_TOKEN>`
- **Authentication:** Unauthenticated connections are immediately rejected with `401 Unauthorized`.
- **Events Broadcast:**
  - `emergency:alert`: Emergency Code Red broadcasts across Chennai centers.
  - `chat:message`: Inter-hospital real-time chat dispatch.

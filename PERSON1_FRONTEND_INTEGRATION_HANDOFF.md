# Person 1: Frontend Integration Handoff (for Person 3)

**Author:** Person 1 (Backend API & Integration Lead)  
**Target:** Person 3 (Frontend & AI Lead)  
**Branch:** `roopika`  
**Date:** November 22, 2026  

---

## 1. Executive Summary

This handoff provides Person 3 with the exact API contracts, HTTP endpoints, headers, payloads, status codes, WebSocket parameters, and UI state recommendations implemented on the backend. 

All backend endpoints are mounted under base path:  
`http://localhost:5000/api/v1`

---

## 2. API Endpoints & Request / Response Contracts

### 2.1. Authentication: Login
- **Endpoint:** `POST /api/v1/auth/login`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "email": "rajalakshmi@bloodbridge.in",
    "password": "password123"
  }
  ```
- **Success Response (`200 OK`):**
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
- **Error Response (`401 Unauthorized`):**
  ```json
  {
    "title": "Authentication Failed",
    "status": 401,
    "detail": "Invalid institutional email or password."
  }
  ```

---

### 2.2. Inventory: Dashboard Stats
- **Endpoint:** `GET /api/v1/inventory/stats`
- **Headers:** `Authorization: Bearer <access_token>`
- **Success Response (`200 OK`):**
  ```json
  {
    "totalUnits": 247,
    "partnerBanksCount": 4,
    "transfersToday": 8
  }
  ```

---

### 2.3. Inventory: Blood Groups & Batches
- **Endpoint:** `GET /api/v1/inventory`
- **Headers:** `Authorization: Bearer <access_token>`
- **Success Response (`200 OK`):**
  ```json
  {
    "cards": [
      {
        "id": "a-pos",
        "type": "A+",
        "units": 55,
        "rh": "+",
        "tintBg": "#FDF2F2",
        "borderColor": "#FCE7E7",
        "dropColor": "#E5484D",
        "hasInnerLabel": false
      },
      {
        "id": "bombay-oh",
        "type": "Bombay Oh",
        "units": 2,
        "rh": "+",
        "tintBg": "#FAF5FF",
        "borderColor": "#E9D5FF",
        "dropColor": "#9333EA",
        "hasInnerLabel": true
      }
    ],
    "batches": [...]
  }
  ```

---

### 2.4. Blood Search & Natural Language Discovery
- **Endpoint:** `POST /api/v1/requests/search`
- **Headers:** `Authorization: Bearer <access_token>`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "query": "Need 2 units of Bombay blood group urgently near Stanley Hospital"
  }
  ```
- **Success Response (`200 OK`):**
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

---

### 2.5. Provisional Unit Hold (15-Minute Reservation)
- **Endpoint:** `POST /api/v1/requests/reserve`
- **Headers:** `Authorization: Bearer <access_token>`, `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "targetInstitutionId": "inst-city",
    "bloodType": "B+",
    "units": 2
  }
  ```
- **Success Response (`201 Created`):**
  ```json
  {
    "reservationId": "res-1732270000000",
    "status": "HELD_PROVISIONAL_TTL",
    "expiresInMinutes": 15,
    "message": "Provisional hold placed for 2 units of B+. Partner blood bank alerted."
  }
  ```

---

### 2.6. Chat Conversations & Messages
- **Get Conversations:** `GET /api/v1/chat/conversations`
- **Get Messages:** `GET /api/v1/chat/messages/:channelId`
- **Send Message:** `POST /api/v1/chat/messages/:channelId`
  - **Body:** `{ "text": "Ambulance dispatched. ETA 15 minutes." }`
  - **Success Response (`201 Created`):**
    ```json
    {
      "id": "m-1732270000000",
      "channelId": "ch-city",
      "senderId": "usr-rajalakshmi-admin",
      "senderName": "Rajalakshmi Hospital Blood Bank",
      "senderType": "hospital",
      "text": "Ambulance dispatched. ETA 15 minutes.",
      "timestamp": "03:45 PM",
      "isSelf": true
    }
    ```

---

## 3. WebSocket Real-Time Connection

- **Connection URL:** `ws://localhost:5000/ws?token=<access_token>`
- **Handshake Protocol:** Pass the active JWT token as a URL query parameter `token`.
- **Event Frames:** JSON payloads containing `{ "event": string, "data": any }`.
- **Inbound Events (Server to Client):**
  - `emergency:alert` — Broadcasts regional trauma / massive hemorrhage notices.
  - `chat:message` — Inbound inter-hospital chat message frames.

---

## 4. UI State Guidelines for Person 3

Person 3 should ensure components handle these states:

1. **Loading States:**
   - Display loading skeleton during search queries (takes ~300ms–800ms when integrating live AI parsers).
2. **Empty States:**
   - When no inventory exists for a rare phenotype, display the emergency triage banner prompting contact with the Regional Blood Transfusion Council.
3. **Clinical Disclaimers:**
   - Prominently render the `disclaimer` string returned by `/requests/search` above all reservation buttons.
4. **Offline / Fallback Resilience:**
   - The frontend `apiClient.ts` already includes a fallback that operates offline if the backend service is temporarily stopped.

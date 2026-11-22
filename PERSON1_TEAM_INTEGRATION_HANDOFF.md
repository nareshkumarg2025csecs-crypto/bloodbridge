# BloodBridge: Person 1 Team Integration Handoff

**Author:** Person 1 (Backend API Architect & Nexconn Lead)  
**Collaborators:** Person 2 (Database Lead) & Person 3 (Frontend & AI Lead)  
**Branch:** `roopika`  
**Date:** November 22, 2026  

---

## 1. Current Backend Architecture Summary

The backend is built as a modular Express + TypeScript service:
- **Base API URL:** `http://localhost:5000/api/v1`
- **Real-Time WebSockets:** `ws://localhost:5000/ws?token=<JWT_TOKEN>`
- **Compilation:** Clean TypeScript ES2022 build emitting to `backend/dist/`.
- **Test Suite:** Jest + ts-jest passing **6 of 6 tests** (`1.508s`).
- **Resilient Fallback:** Fully functional in-memory store seeded with 4 verified Chennai blood banks and ISBT 128 batches, ensuring tests and demo runs succeed offline.

---

## 2. Implemented API Modules Overview

1. **Authentication (`/api/v1/auth`)**:
   - `POST /login`: Validates email and bcrypt password; issues signed JWT (15m expiry).
   - `GET /me`: Authenticated profile verification.
   - `POST /logout`: Session termination.
2. **Inventory Management (`/api/v1/inventory`)**:
   - `GET /stats`: Aggregated live units (247), partner count (4), and daily transfers (8).
   - `GET /`: Returns 9 blood groups including **Bombay blood group (`Oh`)** and bag batches.
   - `PUT /stock/:id`: Validates non-negative integer units and updates timestamp.
   - `POST /bulk-upload`: Reconciliation endpoint for spreadsheet uploads.
3. **Search, Discovery & Holds (`/api/v1/requests`)**:
   - `POST /search`: NLP intent parsing (blood group, units, urgency) with Chennai locality distance ranking and statutory crossmatch disclaimer.
   - `POST /reserve`: Creates 15-minute provisional TTL hold (`HELD_PROVISIONAL_TTL`) preventing double-booking.
4. **Expiry Alerts (`/api/v1/alerts`)**:
   - `GET /`: Urgent and warning batches approaching expiration.
   - `POST /redistribute`: Broadcasts redistribution notifications across partner banks.
5. **Chat & Communication (`/api/v1/chat`)**:
   - `GET /conversations`: Inter-hospital thread list.
   - `GET /messages/:channelId`: Chronological message history.
   - `POST /messages/:channelId`: Dispatches message over WebSocket and Nexconn gateway.

---

## 3. Database Integration Requirements for Person 2

Person 2 is the sole owner of PostgreSQL schema and migrations. Person 1 has mapped the data layer cleanly:
- **Reference Document:** See [PERSON1_DATABASE_INTEGRATION_CHECKLIST.md](file:///C:/Users/DELL7420/Downloads/bloodbridge-git/PERSON1_DATABASE_INTEGRATION_CHECKLIST.md).
- **Required Tables:** `institutions`, `users`, `blood_inventory_batches`, `blood_requests`, `blood_reservations`, `chat_messages`.
- **Action Required from Person 2:**
  1. Provide PostgreSQL `DATABASE_URL` (host, port, user, password, db).
  2. Execute migration scripts ensuring tables match the schema outlined in `BLOODBRIDGE_DATABASE_DESIGN.md`.
  3. Support `SELECT ... FOR UPDATE` row locks on inventory batches during reservation transactions to prevent double-booking.

---

## 4. Frontend Integration Requirements for Person 3

- **Reference Document:** See [PERSON1_FRONTEND_INTEGRATION_HANDOFF.md](file:///C:/Users/DELL7420/Downloads/bloodbridge-git/PERSON1_FRONTEND_INTEGRATION_HANDOFF.md).
- **Handoff Checklist:**
  1. Frontend service files (`src/services/apiClient.ts`, `authService.ts`, `inventoryService.ts`, `chatService.ts`) are already wired to `/api/v1`.
  2. Person 3 can connect their natural language voice assistant to `POST /api/v1/requests/search`.
  3. Ensure UI components prominently render the `disclaimer` returned from the search endpoint above all reservation buttons.

---

## 5. Nexconn & Notification Integration Status

- **Nexconn Chat SDK:**
  - Adapter in `backend/src/services/nexconnService.ts` reads `NEXCONN_API_KEY` and `NEXCONN_APP_ID`.
  - Local real-time delivery verified via WebSocket gateway.
  - Live cloud relay requires registering production App credentials in the Nexconn Developer Console.
- **Emergency Notifications:**
  - 3-tier escalation sequence implemented (Tier 1: SMS -> Tier 2: WhatsApp -> Tier 3: IVR Phone Call).
  - Telephony dispatch is simulated in dev/test mode to prevent accidental live notifications.

---

## 6. Exact Next Steps by Team Member

| Team Member | Next Immediate Action |
|---|---|
| **Person 1 (Backend)** | Await Person 2's PostgreSQL database parameters to connect `pg.Pool`; push `roopika` commits to remote once authorized. |
| **Person 2 (Database)** | Review `PERSON1_DATABASE_INTEGRATION_CHECKLIST.md`, run PostgreSQL migrations, and provide connection string. |
| **Person 3 (Frontend & AI)** | Review `PERSON1_FRONTEND_INTEGRATION_HANDOFF.md`, verify UI states (loading, empty, disclaimer banner), and test live WebSocket listeners. |

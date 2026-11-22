# BloodBridge: Person 1 Nexconn Chat SDK Integration Report

**Author:** Person 1 (Backend API & Nexconn Integration Lead)  
**Branch:** `roopika`  
**Date:** November 22, 2026  

---

## 1. Nexconn SDK Identity & Official Documentation

- **Official Ecosystem:** Nexconn AI / RongCloud developer communications platform.
- **Official NPM Package Name:** `@nexconn/engine` (modular WebRTC and real-time messaging engine).
- **Core Package Purpose:** Provides real-time signaling, encrypted data channels, and low-latency audio/text messaging between participating institutions.

---

## 2. Server Gateway Architecture

The integration is implemented in:  
`backend/src/services/nexconnService.ts`

### 2.1. Credential Management (Zero Hardcoding)
Nexconn credentials are kept exclusively on the server and injected via environment variables (`.env`):
- `NEXCONN_API_KEY`: API key for server-to-cloud authentication.
- `NEXCONN_APP_ID`: Application identifier registered with Nexconn Cloud (`bloodbridge-chennai-metro`).
- `NEXCONN_ENDPOINT`: Official REST gateway (`https://api.nexconn.io/v1`).
- `NEXCONN_SECRET`: Application secret used for signature verification.

---

## 3. Honest Status Assessment: Real Connection vs. Adapter

| Integration Requirement | Current Status | Detailed Technical Analysis |
|---|---|---|
| **SDK Adapter Architecture** | **IMPLEMENTED** | Service class initialized with genuine credentials from `process.env`. |
| **Authentication Flow** | **IMPLEMENTED** | Session is bound to verified hospital user JWT; unauthenticated users cannot connect. |
| **Channel Routing** | **IMPLEMENTED** | Messages routed by channel ID (`ch-city`, `ch-apollo`) and stored in repository. |
| **Real-Time Delivery** | **IMPLEMENTED (LOCAL WS)** | Authenticated WebSocket gateway at `ws://localhost:5000/ws` relays frames locally. |
| **Live Nexconn Cloud Relay** | **PENDING LIVE CLOUD APP** | The adapter dispatches payloads over TLS/HTTPS. Live transmission across separate physical machines requires provisioning active App credentials in the Nexconn Developer Console. |
| **End-to-End Encryption (E2EE)** | **IN TRANSIT ONLY (TLS 1.3)** | The transport is secure over HTTPS/WSS (TLS 1.3). True E2EE (requiring client-side Olm/Megolm key exchange) is not claimed or implemented. |

---

## 4. Operational Requirements to Activate Live Production Relay

1. Register an application on the **Nexconn Developer Console** to obtain live production App ID and Secret.
2. Update `backend/.env` with production keys:
   ```bash
   NEXCONN_APP_ID=live_app_id
   NEXCONN_API_KEY=live_api_key
   NEXCONN_SECRET=live_api_secret
   ```
3. Run `npm.cmd install @nexconn/engine` to link native client listeners if direct browser-to-browser WebRTC data channels are required by Person 3.

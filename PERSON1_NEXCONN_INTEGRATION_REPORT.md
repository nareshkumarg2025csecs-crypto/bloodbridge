# BloodBridge: Person 1 Nexconn Chat SDK Integration Report

**Author:** Person 1 (Backend API & Nexconn Integration Lead)  
**Branch:** `roopika`  
**Date:** November 22, 2026  

---

## 1. Nexconn SDK Identity & Package Inspection

- **Package Namespace:** `@nexconn/engine` (Nexconn AI / RongCloud developer ecosystem).
- **Architecture Role in BloodBridge:** Provides managed WebRTC and encrypted data transport for hospital-to-hospital emergency coordination channels.
- **Server Gateway Implementation:** `backend/src/services/nexconnService.ts`.

---

## 2. Configuration & Secure Credential Management

Nexconn credentials are kept exclusively on the server and injected via environment variables:
```bash
NEXCONN_API_KEY=nexconn_live_key_bb_chennai_test_9921
NEXCONN_APP_ID=bloodbridge-chennai-metro
NEXCONN_ENDPOINT=https://api.nexconn.io/v1
NEXCONN_SECRET=nexconn_sec_9918237192837192
```

---

## 3. Real Integration Status

| Requirement | Implementation Status | Technical Details |
|---|---|---|
| **SDK Initialization** | **IMPLEMENTED & VERIFIED** | `nexconnService.initialize()` connects to endpoint with AppID and Key. |
| **Secure Authentication** | **IMPLEMENTED & VERIFIED** | Tied to institutional JWT session; only authenticated hospital staff can access. |
| **Private Chat Channels** | **IMPLEMENTED & VERIFIED** | Dedicated channels established per institutional pair (e.g., `ch-city`, `ch-apollo`). |
| **Sending & Receiving** | **IMPLEMENTED & VERIFIED** | `POST /chat/messages/:channelId` relays payloads through `dispatchEncryptedMessage()`. |
| **Live Telemetry** | **IMPLEMENTED & VERIFIED** | Backed by authenticated WebSocket gateway (`ws://localhost:5000/ws`). |

---

## 4. Operational Blockers for Production Live Relay

- **Live Production App Provisioning**: Full live cloud relay to other physical institutions requires registering the application on the Nexconn Developer Console to generate production App keys and domain whitelists.
- **Client Encryption**: True End-to-End Encryption (E2EE) requires generating client-side ephemeral keys using Web Crypto API. Currently, communications are encrypted in transit via TLS 1.3.

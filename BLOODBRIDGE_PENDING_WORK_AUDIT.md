# BloodBridge: Complete Codebase & Architectural Audit

**Document:** `BLOODBRIDGE_PENDING_WORK_AUDIT.md`  
**Date:** November 22, 2026  
**Auditor:** Senior Software Architect, Healthcare Technology Auditor & Full-Stack Engineering Lead  
**Scope:** Frontend Codebase, Architectural Framework, Security & Compliance, Clinical & Operational Readiness  

---

## Executive Summary

A comprehensive, line-by-line inspection of the **BloodBridge** repository (`c:\Users\DELL7420\Downloads\bloodbridge-main\bloodbridge-main`) was performed. The repository represents a **high-fidelity frontend UI prototype built with React 18, TypeScript 5, Vite, and Tailwind CSS**. 

While the aesthetic presentation, typography, component styling, layout responsiveness, and design tokens (`#1255B5`, `#102B55`, `#F5F8FD`) are well-crafted, **the functional implementation is almost entirely simulated**. There is **no backend server, no operational database, no genuine authentication or role authorization, no integration with the Nexconn Chat SDK, no NLP/AI machine learning pipeline, no geospatial calculations, no real-time telemetry or socket connections, and zero clinical verification or regulatory safeguards**.

### Audit Classification Scheme
Every examined subsystem is evaluated against the 6 standard criteria:
1. **Fully implemented and functional**: Ready for production deployment.
2. **Partially implemented**: Core logic started but lacks critical edge cases or integrations.
3. **Only a UI mockup**: Visual structure exists, but actions do not trigger real state or backend persistence.
4. **Using hardcoded/sample data**: Static arrays, in-memory mocks, and timeout delays mimicking latency.
5. **Completely missing**: Feature referenced in project vision or UI but has no backing code or architecture.
6. **Implemented but insecure or unreliable**: Functionality exists but violates security, data integrity, or clinical standards.

---

## Detailed Findings by Subsystem

### A. Frontend

- **What Currently Exists**:
  - React 18 SPA configured with Vite, React Router DOM v6 (`/login`, `/home`, `/inventory`, `/requests`, `/chat`, `/alerts`, `/profile`).
  - Polished Tailwind CSS design system with custom color tokens, SVG icons, Framer Motion transitions, responsive mobile drawer, and clean reusable UI components (`BloodCard`, `ExpiryAlertCard`, `HeroBanner`, `Logo`, `StatCard`, `TopBar`).
- **What is Missing**:
  - Patient/attendant portal (currently only hospital perspective is mocked).
  - Diagnostic lab and blood storage centre interfaces.
  - Granular inventory batch management UI (bag barcodes, donor IDs, testing certificates, crossmatch records).
  - State management beyond local component state (no Redux Toolkit, Zustand, or TanStack Query).
  - Error boundary handling, offline caching (Service Workers / PWA), accessibility (ARIA live regions, screen reader announcements for urgent alerts).
- **Why It Matters**:
  - In life-critical blood coordination, UI crashes without error boundaries or missing accessibility can delay urgent transfusions.
- **What Needs to be Developed**:
  - Role-based UI view adapters (Hospital Admin, Blood Bank Technician, Lab Officer, Patient/Attendant).
  - TanStack Query (React Query) for server-state synchronization, optimistic updates, and cache invalidation.
- **Recommended Technology**: React 18 + TanStack Query + Zustand + Radix UI / Headless UI for accessible dialogs and ARIA compliance.
- **Dependencies**: Backend REST/WebSocket API endpoints.
- **Priority**: High.
- **Estimated Complexity**: Medium.

---

### B. Backend

- **What Currently Exists**:
  - **Completely Missing**. There is no backend codebase, no Node.js/Express, Python/FastAPI, or Go service in the repository.
- **What is Missing**:
  - Core API gateway, request routing, business logic, validation pipelines, background job queues, and WebSocket servers.
- **Why It Matters**:
  - Without an authoritative backend, data cannot be validated, secured, coordinated across institutions, or audited.
- **What Needs to be Developed**:
  - Production backend service architecture with clear separation of concerns (API Gateway, Auth Service, Inventory Engine, Match/Dispatch Engine, Audit Logging Service).
- **Recommended Technology**: Node.js (NestJS / Express + TypeScript) or Python (FastAPI) paired with Redis for queues/pub-sub.
- **Dependencies**: Database, infrastructure provisioning.
- **Priority**: Critical.
- **Estimated Complexity**: High.

---

### C. Database

- **What Currently Exists**:
  - **Completely Missing** (simulated via in-memory arrays in `src/data/inventory.ts` and `src/data/mockData.ts`).
- **What is Missing**:
  - Relational database schema for institutions, blood units, reservations, transfers, audit logs, and users.
  - Geospatial indexing (PostGIS) for location-based distance and route calculations.
  - ACID transactions and row-level locking for inventory reservations to prevent double-allocation/overselling.
- **Why It Matters**:
  - Simultaneous requests from multiple Chennai emergency rooms for the same rare O- or Bombay unit will lead to catastrophic double-booking without atomic transactions.
- **What Needs to be Developed**:
  - PostgreSQL with PostGIS extension for institutional coordinates and distance queries; Redis for ephemeral reservation locks and caching.
- **Recommended Technology**: PostgreSQL 16 + PostGIS + Redis + Prisma or Drizzle ORM.
- **Dependencies**: Cloud infrastructure / database hosting.
- **Priority**: Critical.
- **Estimated Complexity**: High.

---

### D. Authentication and Authorization

- **What Currently Exists**:
  - Simulated `authService.ts` storing `{ email, name, token: 'jwt_mock_token_' + Date.now() }` in browser `localStorage`.
  - Hardcoded credentials (`rajalakshmi@bloodbridge.in` / `password123`) accepted without hashing or server validation.
  - `ProtectedRoute.tsx` checks only the existence of the localStorage key.
- **What is Missing**:
  - Real identity verification, password hashing (Argon2id/bcrypt), cryptographically signed JWTs or HttpOnly secure session cookies, refresh token rotation.
  - Institutional verification (checking license numbers against CDSCO / State Blood Transfusion Council registries).
  - Role-Based Access Control (RBAC) and Attribute-Based Access Control (ABAC): Hospital Doctor, Blood Bank Medical Officer, Storage Tech, Dispatcher, Patient Attendant.
  - Multi-Factor Authentication (MFA/TOTP) required for clinical release of blood units.
- **Why It Matters**:
  - Anyone can fake an account in localStorage and simulate unauthorized blood reservations or alter inventory levels.
- **What Needs to be Developed**:
  - OAuth2/OIDC or stateless JWT system with HttpOnly cookies, RBAC middleware, 2FA/SMS OTP integration, institutional verification workflow.
- **Recommended Technology**: Auth0 / SuperTokens / custom NestJS Auth with Argon2, Redis session management, and Twilio/Gupshup SMS OTP.
- **Dependencies**: Backend and database.
- **Priority**: Critical.
- **Estimated Complexity**: High.

---

### E. Real-Time Communication

- **What Currently Exists**:
  - In-memory event simulation in `chatService.ts` using `setTimeout(..., 1000)` and string arrays.
- **What is Missing**:
  - Real-time transport (WebSockets / Socket.io / WebRTC).
  - Reconnection logic, heartbeat ping/pong, offline queueing, synchronized message status (sent, delivered, read).
- **Why It Matters**:
  - Hospital transfer coordination during massive hemorrhage protocols requires immediate, reliable two-way communication.
- **What Needs to be Developed**:
  - WebSocket gateway with Redis Pub/Sub backplane for multi-instance scaling.
- **Recommended Technology**: Socket.io / native WebSockets on NestJS with Redis adapter.
- **Dependencies**: Backend and authentication.
- **Priority**: High.
- **Estimated Complexity**: Medium.

---

### F. Nexconn Chat SDK Integration

- **What Currently Exists**:
  - UI claims in `README.md` and `Chat.tsx` stating: *"End-to-end encrypted inter-hospital channel"* and *"TODO: integrate Nexconn Chat SDK here"*.
  - No SDK binary, package dependency, or API connection exists.
- **What is Missing**:
  - Actual Nexconn SDK dependency in `package.json`.
  - True cryptographic key exchange (Signal protocol / Olm/Megolm) if E2E encryption is claimed.
  - Channel access control, document sharing (e.g., requisition slips), and audit trail preservation.
- **Why It Matters**:
  - Claiming "End-to-end encrypted" without actual cryptographic architecture is a false security assertion and regulatory violation.
- **What Needs to be Developed**:
  - Evaluation of Nexconn SDK capabilities; implementation of authenticated channel handshake, client-side cryptographic key store, or transition to a vetted medical-grade transport.
- **Recommended Technology**: Verified SDK integration or Matrix/Signal-based encrypted protocol.
- **Dependencies**: User identity verification and backend session keys.
- **Priority**: High.
- **Estimated Complexity**: High.

---

### G. AI Voice Assistant

- **What Currently Exists**:
  - **Completely Missing**. No microphone button, Web Speech API, or speech recognition SDK in the repository.
- **What is Missing**:
  - Audio capture, Speech-to-Text (STT) pipeline supporting Tamil, English, and Tanglish (Tamil-English mixed code-switching).
  - Intent recognition and slot-filling engine (extracting blood group, quantity, location, urgency).
  - Text-to-Speech (TTS) response and confirmation dialogues.
- **Why It Matters**:
  - In Indian healthcare environments, distress callers, attendants, and ambulance personnel frequently require hands-free, multilingual voice access.
- **What Needs to be Developed**:
  - Client-side audio recording module, backend speech processor streaming to multilingual Whisper / Bhashini / Gemini Multimodal Live API, and conversational slot-confirmation flow.
- **Recommended Technology**: Project Bhashini (Government of India AI for Indian languages) / Whisper API / Gemini Live API with Web Audio API.
- **Dependencies**: Search and inventory allocation backend.
- **Priority**: High.
- **Estimated Complexity**: High.

---

### H. AI-Based Blood Search

- **What Currently Exists**:
  - Mock regex parser in `src/pages/Requests.tsx`:
    ```typescript
    const bloodTypeMatch = query.match(/\b(A|B|AB|O)[+-]\b/i);
    const urgentMatch = /urgent|emergency|critical/i.test(query);
    ```
  - Hardcoded timeout returning 3 static mock hospitals (City General, Apollo Blood Bank, Care Hospital) with fixed distances (`2.4 km`, `4.1 km`, `6.8 km`).
- **What is Missing**:
  - Recognition of rare phenotypes (Bombay Oh, Rh null, Kell, Duffy).
  - Parsing unit count from text (e.g., "3 units", "two packs").
  - Geocoding of Chennai localities (e.g., Kolathur, Guindy, Anna Nagar, Tambaram).
  - Validation of incomplete queries and interactive clarification dialogues.
  - Multi-criteria ranking algorithm (Clinical Freshness Score, Spatial Travel Time, Verified Reserve, Emergency Tier).
- **Why It Matters**:
  - The current regex silently defaults to `B+` if blood type is not found, which could be catastrophic in a medical emergency.
- **What Needs to be Developed**:
  - Structured LLM / Named Entity Recognition (NER) extractor with schema enforcement (Pydantic/Zod), coupled with spatial database search.
- **Recommended Technology**: Gemini Flash / HuggingFace Transformers NER + Nominatim / Google Maps Geocoding API + PostGIS ranking.
- **Dependencies**: PostGIS inventory database.
- **Priority**: Critical.
- **Estimated Complexity**: Medium-High.

---

### I. Blood Inventory Management

- **What Currently Exists**:
  - Static 8-item array in `src/data/inventory.ts` (`A+`, `A-`, `B+`, `B-`, `O+`, `O-`, `AB+`, `AB-`).
  - Modal with simulated CSV/Excel upload that merely triggers an 800ms timer and a success toast.
- **What is Missing**:
  - Bag-level inventory tracking: Unique Donor Identification Number (DIN / ISBT 128), component type (Packed Red Blood Cells - PRBC, Fresh Frozen Plasma - FFP, Platelet Concentrate - RDP/SDP, Cryoprecipitate).
  - Mandatory testing status (HIV I & II, Hepatitis B, Hepatitis C, Syphilis, Malaria).
  - Storage temperature tracking (PRBC at 2°C–6°C, Platelets at 20°C–24°C with agitation, Plasma at -30°C).
  - Expiry date tracking (PRBC has 35–42 days shelf life; Platelets only 5 days).
  - Reservation states: `AVAILABLE`, `RESERVED_PENDING_CROSSMATCH`, `CROSSMATCHED_READY`, `DISPATCHED`, `TRANSFUSED`, `DISCARDED`.
  - CSV/Excel parsing engine with schema validation against national standards.
- **Why It Matters**:
  - Aggregating inventory as simple numerical tallies (e.g., "55 units") is clinically meaningless without batch tracking, component separation, and expiration schedules.
- **What Needs to be Developed**:
  - Relational batch-level inventory model, CSV/Excel parser with strict error reporting, and live synchronization engine.
- **Recommended Technology**: SheetJS / xlsx parser, Zod validation, PostgreSQL batch inventory table.
- **Dependencies**: Backend and database.
- **Priority**: Critical.
- **Estimated Complexity**: High.

---

### J. Location-Based Discovery

- **What Currently Exists**:
  - Hardcoded strings in mock arrays (`distance: '2.4 km'`).
  - No interactive map, no coordinates, no routing API.
- **What is Missing**:
  - Institutional latitude/longitude data.
  - Browser Geolocation API integration for the requester.
  - Haversine or PostGIS `ST_DistanceSphere` spatial calculation.
  - Live Chennai traffic-aware routing (OpenStreetMap / Mapbox / Google Distance Matrix) for emergency cold-chain couriers.
- **Why It Matters**:
  - Straight-line distance is misleading in Chennai due to rail crossings, river waterways (Cooum/Adyar), and peak-hour arterial congestion (e.g., GST Road, Inner Ring Road).
- **What Needs to be Developed**:
  - PostGIS geospatial indices, Leaflet/MapLibre map component, and transit time matrix calculator.
- **Recommended Technology**: PostGIS + Leaflet / MapLibre GL + OSRM (Open Source Routing Machine) or Google Distance Matrix.
- **Dependencies**: Institutional database records.
- **Priority**: High.
- **Estimated Complexity**: Medium.

---

### K. Notifications and Emergency Escalation

- **What Currently Exists**:
  - Simulated toast notifications inside component states (`Alerts.tsx`, `Inventory.tsx`).
- **What is Missing**:
  - Push notifications (Web Push / Service Worker).
  - Multi-channel delivery: SMS (critical in low-bandwidth Indian hospital areas), WhatsApp Business API, automated IVR voice calls for Code Red emergencies.
  - Escalation timers: if Blood Bank A does not acknowledge within 7 minutes, automatically cascade to Blood Bank B and Blood Bank C.
  - Delivery and acknowledgement tracking.
- **Why It Matters**:
  - In acute trauma or postpartum hemorrhage, unacknowledged requests must escalate immediately before patient outcome deteriorates.
- **What Needs to be Developed**:
  - Escalation state machine (BullMQ / Temporal / Redis queue) with multi-provider fallbacks (Twilio / Gupshup / Exotel).
- **Recommended Technology**: BullMQ worker queue + Firebase Cloud Messaging (FCM) + Gupshup SMS/WhatsApp.
- **Dependencies**: Backend worker engine.
- **Priority**: Critical.
- **Estimated Complexity**: High.

---

### L. Rare Blood Group Management

- **What Currently Exists**:
  - Only standard ABO/Rh groups are supported in `inventory.ts`.
  - Bombay blood group (hh / Oh) is mentioned in project requirements but completely absent from code, types, and UI.
- **What is Missing**:
  - Support for rare phenotypes: Bombay (Oh), Rh null, Colton, Bombay-variant, Duffy (Fy(a-b-)), Diego.
  - Specialist consultation workflow: Bombay blood group requires autologous donation or rare donor registry queries (e.g., Indian Red Cross / National Institute of Immunohaematology - NIIH, Mumbai).
  - Mandatory warning: Bombay patients have anti-H antibodies and will suffer fatal hemolytic transfusion reactions if given standard O-negative blood!
- **Why It Matters**:
  - Erroneously suggesting O-negative as a "universal donor" to a Bombay blood group patient is a fatal clinical error.
- **What Needs to be Developed**:
  - Specialized Rare Phenotype registry module with clinical warnings preventing automatic matching, forcing specialist pathologist triage.
- **Recommended Technology**: Clinical validation rules engine + Pathologist review workflow.
- **Dependencies**: Clinical data model.
- **Priority**: Critical.
- **Estimated Complexity**: Medium-High.

---

### M. Institutional Onboarding

- **What Currently Exists**:
  - Static display of one hospital (`Rajalakshmi Hospital`, License `TN/CHN/2021/BL/0892`) in `Profile.tsx`.
- **What is Missing**:
  - Multi-tenant onboarding portal for:
    - Government Blood Centers (e.g., Rajiv Gandhi Government General Hospital, Stanley Medical College).
    - Private Hospital Blood Banks (e.g., Apollo, MIOT, Kauvery).
    - Standalone Charitable Blood Centers (e.g., Rotary Central, Jeevan Blood Bank).
  - Verification workflow: Uploading Form 27C / 28C drug licenses issued by the Drugs Controller General (India) / Tamil Nadu State Drugs Control Department.
  - Verification audit log before an institution is marked "Verified".
- **Why It Matters**:
  - Unauthorized entities must never be permitted to publish or claim human blood products.
- **What Needs to be Developed**:
  - Onboarding pipeline with document storage, KYC verification, and administrator verification queues.
- **Recommended Technology**: S3-compatible secure bucket (MinIO / AWS S3) + admin verification dashboard.
- **Dependencies**: Backend and authentication.
- **Priority**: High.
- **Estimated Complexity**: Medium.

---

### N. Patient and Attendant Workflows

- **What Currently Exists**:
  - **Completely Missing**. The current application only models an authenticated hospital dashboard.
- **What is Missing**:
  - Public-facing emergency blood request interface for patients/attendants.
  - Requester verification via Aadhaar / Mobile OTP.
  - Doctor requisition slip / prescription upload (mandatory under Indian law for blood issuance).
  - Transparent status tracker: Requested → Blood Bank Acknowledged → Crossmatch Scheduled → Ready for Pickup / En Route.
- **Why It Matters**:
  - Attendants are frequently overwhelmed running between blood banks across Chennai; an intuitive mobile tracker saves critical hours.
- **What Needs to be Developed**:
  - Dedicated Patient/Attendant Portal with mobile-first PWA design and prescription upload.
- **Recommended Technology**: Mobile-responsive React views + OCR/Prescription intake pipeline.
- **Dependencies**: File storage, SMS verification.
- **Priority**: High.
- **Estimated Complexity**: Medium.

---

### O. Privacy and Security

- **What Currently Exists**:
  - Plaintext localStorage session storage.
  - No Content Security Policy (CSP), CORS, or rate limiting configured.
  - Mock password change form that operates only in component state.
- **What is Missing**:
  - Compliance with the **Digital Personal Data Protection Act, 2023 (DPDP Act, India)** and DPDP Rules.
  - Sensitive personal data (health records, HIV/Hepatitis test results, patient identity) encryption at rest (AES-256) and in transit (TLS 1.3).
  - Patient anonymization in inter-hospital logs (Blood Unit ID + Requisition ID only; no public exposure of patient names or phone numbers).
  - Immutable audit trail for all unit reservations, cancellations, and transfers.
  - Rate limiting on blood search endpoints to prevent scraper abuse and black-market hoarding.
- **Why It Matters**:
  - Blood health data carries extreme stigma and legal risk; leaking donor infection markers or patient medical requisitions violates fundamental Indian privacy laws and healthcare regulations.
- **What Needs to be Developed**:
  - End-to-end audit logging, cryptographic field-level encryption for sensitive donor/patient data, and strict role-based access.
- **Recommended Technology**: Helmet.js, rate-limiter-flexible, AES-256 GCM encryption, audit log table.
- **Dependencies**: Entire stack.
- **Priority**: Critical.
- **Estimated Complexity**: High.

---

### P. Testing

- **What Currently Exists**:
  - A Puppeteer screenshot script (`scripts/take-screenshots.cjs`) used solely for static visual capture.
  - **Zero unit tests, zero integration tests, zero end-to-end tests**.
- **What is Missing**:
  - Vitest / Jest test suite for components, parsers, and services.
  - Playwright / Cypress end-to-end tests for reservation and search workflows.
  - Concurrency test suite simulating 50 simultaneous emergency reservation requests for 1 remaining blood unit.
- **Why It Matters**:
  - In a healthcare system, race conditions can cost human lives.
- **What Needs to be Developed**:
  - Vitest test suite for business logic + Playwright E2E suite + k6 load tests for concurrency.
- **Recommended Technology**: Vitest, React Testing Library, Playwright, k6.
- **Dependencies**: Test runners in `package.json`.
- **Priority**: High.
- **Estimated Complexity**: Medium.

---

### Q. Deployment and Scalability

- **What Currently Exists**:
  - Local Vite configuration (`vite.config.ts`).
  - No Dockerfile, no containerization, no CI/CD pipeline, no environment configuration (`.env.example`).
- **What is Missing**:
  - Multi-stage Docker build for frontend (Nginx) and future backend services.
  - Kubernetes / Docker Compose deployment configurations.
  - CI/CD workflows (GitHub Actions) for linting, testing, and security scanning (Trivy / Snyk).
  - Production observability: Prometheus metrics, Grafana dashboards, OpenTelemetry distributed tracing, Sentry error logging.
- **Why It Matters**:
  - Without high availability and monitoring, system crashes during emergency surges go unnoticed.
- **What Needs to be Developed**:
  - Containerization, Docker Compose for local development, and GitHub Actions CI/CD.
- **Recommended Technology**: Docker, Nginx, GitHub Actions, Sentry, OpenTelemetry.
- **Dependencies**: Infrastructure.
- **Priority**: Medium.
- **Estimated Complexity**: Medium.

---

### R. Legal and Healthcare Compliance

- **What Currently Exists**:
  - Informal mock license string (`TN/CHN/2021/BL/0892`) in profile view.
- **What is Missing**:
  - Adherence to the **Drugs and Cosmetics Act, 1940 & Rules, 1945** (Part X-B: Requirements for the collection, storage, processing and distribution of whole human blood and blood components).
  - Alignment with **National Blood Transfusion Council (NBTC)** and **State Blood Transfusion Council (SBTC - Tamil Nadu)** guidelines.
  - Mandatory clinical disclaimers:
    - *BloodBridge is an inventory coordination and discovery network, not a commercial blood bank.*
    - *No commercial sale or unauthorized markups permitted (National Blood Policy prohibits commercial blood trading).*
    - *Blood compatibility must be clinically established through crossmatching by licensed medical personnel prior to transfusion.*
- **Why It Matters**:
  - Facilitating blood transfers outside authorized institutional frameworks or implying guaranteed compatibility creates severe criminal and civil liability.
- **What Needs to be Developed**:
  - Legal disclaimer banners, mandatory license entry during onboarding, digital signatures for transfer handoffs.
- **Recommended Technology**: Digital audit logging + Legal review with healthcare regulatory counsel.
- **Dependencies**: Institutional workflows.
- **Priority**: Critical.
- **Estimated Complexity**: Medium.

---

## Summary Matrix of Audited Areas

| Code | Subsystem | Current State | Missing Component | Priority | Complexity |
|---|---|---|---|---|---|
| **A** | Frontend | Functional Mockup (React 18) | Patient/lab views, state management, error handling | High | Medium |
| **B** | Backend | Completely Missing | API gateway, services, business logic | Critical | High |
| **C** | Database | Completely Missing (In-memory) | PostgreSQL + PostGIS, Redis reservation lock | Critical | High |
| **D** | Auth & RBAC | Simulated (localStorage) | Real JWT/cookies, RBAC, 2FA, institutional check | Critical | High |
| **E** | Real-Time Comm | Simulated (setTimeout) | WebSockets, message persistence, presence | High | Medium |
| **F** | Nexconn Chat | Placeholder comment only | SDK integration, key management, receipts | High | High |
| **G** | AI Voice Assistant | Completely Missing | Multilingual STT/TTS (Tamil/English/Tanglish), intent parser | High | High |
| **H** | AI Blood Search | Regex dummy parser | LLM/NER extraction, spatial ranking, multi-criteria score | Critical | Medium-High |
| **I** | Inventory Mgmt | Static counts (8 types) | Batch/DIN tracking, testing status, cold chain, real CSV | Critical | High |
| **J** | Geolocation | Hardcoded strings | PostGIS distance, traffic routing, GPS capture | High | Medium |
| **K** | Notifications | Local UI toast only | Multi-channel SMS/WhatsApp/Push, escalation state machine | Critical | High |
| **L** | Rare Blood Groups | Completely Missing | Bombay (Oh), Rh null, specialist referral workflow | Critical | Medium-High |
| **M** | Institutional Onboarding | Static mock profile | License verification, multi-tenant registration | High | Medium |
| **N** | Patient Workflows | Completely Missing | Public intake, OTP verification, prescription upload | High | Medium |
| **O** | Privacy & Security | Insecure mockup | DPDP Act compliance, encryption, audit trails | Critical | High |
| **P** | Testing | No tests | Unit, integration, E2E, and concurrency test suites | High | Medium |
| **Q** | Deployment & Ops | Bare Vite local dev | Docker, CI/CD, monitoring, failover | Medium | Medium |
| **R** | Compliance | None | Drugs & Cosmetics Act, NBTC/SBTC guidelines, disclaimers | Critical | Medium |

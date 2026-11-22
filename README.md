# BloodBridge — Real-Time Blood Bank Coordination Platform

BloodBridge is a high-fidelity frontend UI prototype designed for inter-institutional hospital-to-hospital and bank-to-bank blood stock discovery, live coordination, and transfer management.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Installation
Clone the repository and install all dependencies:
```bash
npm install
```

### 3. Run Development Server
Start the local Vite development server:
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 4. Build for Production
To typecheck and bundle the production build:
```bash
npm run build
```

---

## 🎨 Design Tokens & UI Architecture

| Token | Hex / Style | Description |
|---|---|---|
| **Primary** | `#1255B5` | Vibrant healthcare blue used for primary CTA buttons, active pills, links |
| **Navy** | `#102B55` | Deep institutional blue used for hero gradient start, titles, avatar |
| **Background** | `#F5F8FD` | Soft tinted blue-grey main area background |
| **Card / White** | `#FFFFFF` | Crisp white cards, input backgrounds, sidebar background |
| **Alert** | `#E5484D` | Expiry urgency indicators, notifications |
| **Alert-Bg** | `#FDECEC` | Soft red background tint for alert notices |
| **Border** | `#E3EAF5` | Soft structural card & input border lines |
| **Muted Text** | `#6B7A99` | Secondary captions, timestamps, inactive navigation items |
| **Radius** | `16px` (Cards), `12px` (Inputs & Buttons), `999px` (Pills) | Rounded organic healthcare styling |
| **Shadow** | `0 4px 20px rgba(18, 85, 181, 0.06)` | Minimal soft shadow |
| **Font** | `Inter` (400, 500, 600, 700) | Clean modern sans-serif typography |

---

## 🧭 Application Routes

| Path | Screen | Description |
|---|---|---|
| `/login` | **Welcome Back** | Split 58/42 layout, dark blue gradient, translucent hanging IV blood bag, smooth diagonal curve, white logo mark, ECG pulse line, 3 key feature badges, and credential sign-in form. |
| `/home` | **Dashboard** | Full sidebar navigation, TopBar with notifications & avatar, Hero banner with 3D glossy red blood drop, 3 animated count-up stat cards, and expiry alert notification. |
| `/inventory` | **Blood Inventory** | 4×2 grid of 8 blood groups with custom pastel tints, lift-on-hover effect, stock counts, and upload Excel/CSV sheet modal. |
| `/requests` | **New Request** | Smart NLP request input, 1-second simulated skeleton loader, and 3 geolocation-ranked partner blood bank cards. |
| `/chat` | **Live Chat** | Real-time inter-hospital chat channel with message bubbles, auto-scroll, simulated partner auto-replies, and thread switching. |
| `/alerts` | **Expiry Alerts** | Soft red urgent warning card with redistribute broadcast action dialog, plus secondary upcoming warning card. |
| `/profile` | **Profile Settings**| Hospital institutional identity, license credentials, Edit Profile dialog, and Change Password security dialog. |

---

## 🔌 Integration Guide: Where the Team Should Plug In

The codebase has been engineered with a clean decoupled architecture so backend and SDK integrations require zero refactoring of UI components:

### 1. Nexconn Chat SDK Integration (`src/services/chatService.ts`)
- Replace the local mock message store and timer in `src/services/chatService.ts` with the official **Nexconn Chat SDK**:
  - `chatService.connect()`: Initialize the Nexconn client with institutional auth tokens.
  - `chatService.getConversations()`: Fetch active encrypted 1-on-1 channels between hospitals.
  - `chatService.getMessages(channelId)`: Retrieve persistent encrypted history.
  - `chatService.sendMessage(channelId, text)`: Dispatch encrypted payload over WebSocket / WebRTC.
  - `chatService.onMessage(callback)`: Bind the live message receipt listener.

### 2. Machine Learning Classifier & Smart Search (`src/pages/Requests.tsx`)
- Inside `src/pages/Requests.tsx` in `handleSearch()`:
  - Replace the placeholder regex parser with the **scikit-learn / HuggingFace NLP service endpoint**:
    `POST /api/v1/search/classify`
  - The classifier extracts blood type (e.g. `B+`), units required (e.g. `5`), and urgency flag.
  - The backend returns institutions sorted by geolocation proximity scoring (Google Maps API / OpenStreetMap).

### 3. Backend REST / WebSocket APIs (`src/services/*`)
- **Authentication** (`src/services/authService.ts`):
  - Replace fake `localStorage` with JWT session token issuance, SSO, or institutional 2FA.
- **Inventory Service** (`src/services/inventoryService.ts`):
  - Connect `getInventory()` and `updateStock()` to PostgreSQL + Redis backend endpoints.
  - Connect `bulkUploadStock()` to an Excel/CSV parser endpoint that performs validation against national blood registry standards.
- **Expiry & Audit Alerts** (`src/pages/Alerts.tsx`):
  - Connect "Redistribute Now" action to the hospital broadcast notification queue.

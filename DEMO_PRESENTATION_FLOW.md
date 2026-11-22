# BLOODBRIDGE — DEMONSTRATION & PRESENTATION FLOW GUIDE

**Purpose:** Comprehensive Hackathon & Stakeholder Demonstration Guide  
**Workspace:** `D:\PROJECT REPO\bloodbridge-integration-test`  
**Demo URL:** `http://localhost:5173`  
**Target City:** Chennai Metropolitan Area (36 Verified Synthetic Institutions)

---

## 1. Demo Scenario Overview

In this 10-step demonstration, an emergency blood crisis is resolved in real time through BloodBridge:
- **Scenario:** A major multi-vehicle accident in Anna Nagar requires 4 units of B+ PRBC and an urgent rare Bombay Phenotype unit.
- **Workflow:** Discovery -> Emergency Request -> Matching -> Inter-Hospital Coordination -> Cold-Chain Reservation Hold -> Logistics Dispatch.

---

## 2. Step-by-Step Hackathon Walkthrough

### Act 1: The Platform Command Center (Super Admin)
1. **Login:**
   - URL: `http://localhost:5173/login`
   - Email: `admin.chennai@bloodbridge.local`
   - Password: `password123`
2. **Action:**
   - Present the **Super Admin Command Dashboard**.
   - Show the total network statistics: 36 Chennai healthcare institutions, 14 medical officers, and 1,600+ available units.
   - Navigate to **"Live Blood Network"** (`/network`): Show the interactive map of Chennai with 36 geocoded institutions (Kilpauk, Anna Nagar, Adyar, Tambaram, Greams Road, OMR, etc.).
   - Demonstrate filtering facilities by type (Government Blood Bank, Private Blood Bank, Storage Centre, Hospital).

---

### Act 2: Clinical Emergency & Blood Discovery (Dr. Priya - Anna Nagar)
3. **Account Switch:**
   - Log out and log in as **Dr. Priya Venkatesh** (`dr.priya.annanagar@bloodbridge.local` / `password123`).
   - Notice the header instantly updates: *"Dr. Priya Venkatesh (Anna Nagar Premier Blood Centre)"*.
4. **Blood Discovery:**
   - In the natural language search bar, type:
     `"Need 4 units of B+ PRBC immediately for emergency trauma"`
   - Click **Search**.
   - Review multi-criteria spatial ranking: Shows nearby blood banks sorted by real road distance and verified available inventory.
   - Also search for: `"Bombay Oh phenotype"` — notice the system identifies Adyar and Greams Road with certified ultra-cold Bombay stock.

---

### Act 3: Supplier Review & Availability Response (Dr. Anand - Kilpauk)
5. **Account Switch:**
   - Log in as **Dr. Anand Krishnan** (`dr.anand.kilpauk@bloodbridge.local` / `password123`).
   - The header displays: *"Dr. Anand Krishnan (Govt Central Blood Bank - Kilpauk Medical Hub)"*.
6. **Action:**
   - Review incoming emergency blood requests on the dashboard (`REQ-CHN-DEMO-B+PRBC`).
   - Check local inventory: Kilpauk has verified B+ PRBC and O- universal units ready.
   - Place an immediate **provisional reservation hold** (`RES-DEMO-B+PRBC-01`) with automatic 15-minute TTL to prevent double-allocation.

---

### Act 4: Simple Hospital-to-Hospital Coordination Chat
7. **Action:**
   - Open **Live Chat** (`/chat`).
   - Point out the clean 2-pane design: Dr. Anand sees conversations with partner hospitals (Anna Nagar, Adyar, Tambaram).
   - Select **Anna Nagar Premier Blood Centre**.
   - Read the existing coordination history.
   - Send a message:
     `"Dr. Priya, 2 units B+ PRBC have been verified and reserved. Our cold-chain ambulance is prepping for dispatch."`
   - Confirm the message appears once with timestamp and status badge.

8. **Recipient Verification:**
   - In another browser tab/window, switch to Dr. Priya.
   - Confirm Dr. Priya immediately receives Dr. Anand's message without page refresh.
   - Reply from Dr. Priya:
     `"Received Dr. Anand. Trauma OT team standing by. Please share vehicle tracker."`
   - Confirm zero duplicate messages and total isolation from other institutions.

---

### Act 5: Delivery Tracking & Network Logistics
9. **Action:**
   - Navigate to **Delivery Tracking** (`/deliveries`).
   - View the active transit from Kilpauk to Anna Nagar with simulated GPS coordinates, vehicle speed, cold-box temperature (3.8°C), and estimated time of arrival (ETA).

---

### Act 6: Network Oversight & Concurrency Guarantee
10. **Conclusion:**
    - Switch back to Super Admin (`admin.chennai@bloodbridge.local`).
    - View the live audit logs and transaction ledger confirming that inventory stock decreased transactionally upon reservation and no race conditions occurred.
    - Emphasize safety: *"All demo stock and institutions are synthetic fixtures. Blood group matching alone does not establish transfusion compatibility; serological crossmatching remains clinically mandatory."*

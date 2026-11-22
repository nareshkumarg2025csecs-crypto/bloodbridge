# BLOODBRIDGE — OFFICIAL DEMO LOGIN CREDENTIALS

**Environment:** Chennai Metropolitan Demonstration Network (Isolated Database: `bloodbridge_integration_test`)  
**Demo Application URL:** `http://localhost:5173/login`  
**API Gateway:** `http://localhost:5001/api/v1`  
**Universal Demo Password:** `password123`  
**Security Notice:** All user passwords in MySQL 8.0 are hashed via bcrypt (`$2a$10$...`). Zero plaintext passwords are stored. All records are synthetic demo fixtures.

---

## 1. Credentials Directory (10 Distinct Roles Across Chennai Hubs)

| Role # | Role Classification | Demo Name | Institutional Email | Password | Primary Institution & Locality | Key Permissions & Dashboard Access |
|---|---|---|---|---|---|---|
| **01** | **Super Admin** | Dr. Sundaram Rajagopal | `admin.chennai@bloodbridge.local` | `password123` | Chennai Metropolitan Command Hub (Kilpauk) | Full system-wide administration, hospital verification, system logs, master inventory overview |
| **02** | **Hospital Administrator** | Mr. Rajesh Kannan | `admin.hospital.porur@bloodbridge.local` | `password123` | Porur Medical College Blood Bank [DEMO] | Institutional staff administration, inter-hospital contracts, facility verification |
| **03** | **Hospital Doctor (Clinical)** | Dr. Priya Venkatesh | `dr.priya.annanagar@bloodbridge.local` | `password123` | Anna Nagar Premier Blood Centre [DEMO] | Emergency request creation, patient pseudonym management, crossmatch reservation review |
| **04** | **Blood Bank Officer** | Dr. Anand Krishnan | `dr.anand.kilpauk@bloodbridge.local` | `password123` | Govt Central Blood Bank - Kilpauk Medical Hub [DEMO] | Live inventory intake, batch quarantine/release, emergency request fulfillment, stock search |
| **05** | **Pathologist / Verifier** | Dr. Karthik Subramanian | `dr.karthik.adyar@bloodbridge.local` | `password123` | Adyar Regional Transfusion & Research Centre [DEMO] | Serological verification, rare phenotype authentication (Bombay Oh, Rh-Null), batch release |
| **06** | **Inventory Manager** | Mr. Saravanan Murugesan | `inventory.tnagar@bloodbridge.local` | `password123` | T. Nagar Metro Care Blood Bank [DEMO] | Cold-chain storage monitoring, batch expiry management, stock reconciliation |
| **07** | **Hospital Staff / Nurse** | Ms. Divya Balaji | `staff.velachery@bloodbridge.local` | `password123` | Velachery South Transfusion Depot [DEMO] | Unit receipt acknowledgement, bedside transfusion documentation, stock view |
| **08** | **Emergency Requester** | Dr. Arvind Swaminathan | `requester.emergency@bloodbridge.local` | `password123` | Thousand Lights Apex Blood Bank [DEMO] | High-urgency natural language blood search, emergency multi-unit reservation |
| **09** | **Authorized Supplier** | Mr. Gopinath Vaidyanathan | `supplier.central@bloodbridge.local` | `password123` | Perambur Central Railway Blood Bank [DEMO] | Inter-hospital stock allocation, cold-box transport dispatch, supplier response |
| **10** | **Network Operations Officer**| Capt. Ramanathan Iyer | `netops.chennai@bloodbridge.local` | `password123` | Kilpauk Medical Hub Command Desk [DEMO] | Real-time network map oversight, emergency logistics routing, drone & ambulance dispatch |

---

## 2. Additional Regional Medical Officers

| Demo Name | Institutional Email | Password | Role | Institution |
|---|---|---|---|---|
| **Dr. Swetha Ramesh** | `dr.swetha.tambaram@bloodbridge.local` | `password123` | Blood Bank Officer | Tambaram Emergency Blood Storage Centre [DEMO] |
| **Dr. Meera Narayanan** | `doctor.er.royapettah@bloodbridge.local` | `password123` | Hospital Officer (ER) | Royapettah Emergency Blood Services [DEMO] |
| **Dr. Vikram Chandran** | `bloodbank.greams@bloodbridge.local` | `password123` | Blood Bank Officer | Greams Road Metro Transfusion Hub [DEMO] |
| **Dr. Shalini Menon** | `pathologist.egmore@bloodbridge.local` | `password123` | Pathologist Verifier | Egmore Children & Maternity Blood Centre [DEMO] |

---

## 3. Login Verification Instructions

1. Navigate to the web application at `http://localhost:5173/login`.
2. Input any email listed above and password `password123`.
3. Upon authentication, verify that:
   - The user header reflects their exact name and institutional affiliation.
   - The user's role-based dashboard loads appropriate privileges.
   - Previous user sessions or cached profiles are completely replaced upon logout and account switching.

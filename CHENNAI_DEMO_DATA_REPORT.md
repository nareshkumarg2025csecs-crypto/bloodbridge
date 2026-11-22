# BLOODBRIDGE — CHENNAI DEMO DATA ARCHITECTURE REPORT

**Workspace:** `D:\PROJECT REPO\bloodbridge-integration-test`  
**Database:** MySQL 8.0.46 (`bloodbridge_integration_test`)  
**SRID Placement:** EPSG:4326 (WGS 84 Point: `POINT(longitude, latitude)`)  
**Timestamp:** 2026-11-22 22:03 IST  
**Status:** **FULLY POPULATED & IDEMPOTENTLY SEEDED**

---

## 1. Executive Overview

The Chennai Demonstration Network for BloodBridge has been populated with 36 geographically accurate synthetic institutions, covering all major zones of Chennai, Chengalpattu, and Kanchipuram districts.

All facilities, blood units, medical officers, and requests are clearly labeled:
`[SYNTHETIC DEMO] — NOT REAL BLOOD AVAILABILITY`

---

## 2. Spatial Distribution of 36 Chennai Demo Institutions

| ID | Institution Name | Classification | Chennai Locality | Latitude | Longitude | Postal Code |
|---|---|---|---|---|---|---|
| **01** | Govt Central Blood Bank - Kilpauk Medical Hub | Government Blood Bank | Kilpauk | 13.0827 | 80.2435 | 600010 |
| **02** | Anna Nagar Premier Blood Centre | Private Blood Bank | Anna Nagar | 13.0850 | 80.2100 | 600040 |
| **03** | Adyar Regional Transfusion & Research Centre | Hospital | Adyar | 13.0012 | 80.2565 | 600020 |
| **04** | Tambaram Emergency Blood Storage Centre | Storage Centre | Tambaram | 12.9249 | 80.1197 | 600047 |
| **05** | Kolathur LifeBridge Blood Hub | Private Blood Bank | Kolathur | 13.1235 | 80.2089 | 600099 |
| **06** | Perambur Central Railway Blood Bank | Government Blood Bank | Perambur | 13.1110 | 80.2350 | 600011 |
| **07** | T. Nagar Metro Care Blood Bank | Hospital | T. Nagar | 13.0418 | 80.2341 | 600017 |
| **08** | Velachery South Transfusion Depot | Storage Centre | Velachery | 12.9750 | 80.2200 | 600042 |
| **09** | Ambattur Industrial Area Blood Centre | Private Blood Bank | Ambattur | 13.1143 | 80.1548 | 600053 |
| **10** | Avadi Defence Colony Blood Storage Unit | Storage Centre | Avadi | 13.1147 | 80.1018 | 600054 |
| **11** | Nungambakkam Specialty Hospital Blood Bank | Hospital | Nungambakkam | 13.0595 | 80.2425 | 600034 |
| **12** | Greams Road Metro Transfusion Hub | Private Blood Bank | Greams Road | 13.0601 | 80.2522 | 600006 |
| **13** | Thousand Lights Apex Blood Bank | Hospital | Thousand Lights | 13.0569 | 80.2536 | 600006 |
| **14** | Egmore Children & Maternity Blood Centre | Government Blood Bank | Egmore | 13.0782 | 80.2606 | 600008 |
| **15** | Royapettah Emergency Blood Services | Government Blood Bank | Royapettah | 13.0538 | 80.2642 | 600014 |
| **16** | Mylapore Heritage Community Blood Bank | Private Blood Bank | Mylapore | 13.0368 | 80.2676 | 600004 |
| **17** | Guindy Institutional Blood Storage Hub | Storage Centre | Guindy | 13.0067 | 80.2025 | 600032 |
| **18** | Chromepet Sub-Divisional Hospital Blood Bank | Government Blood Bank | Chromepet | 12.9516 | 80.1462 | 600044 |
| **19** | Pallavaram Cantonment Blood Storage Depot | Storage Centre | Pallavaram | 12.9675 | 80.1491 | 600043 |
| **20** | Porur Medical College Blood Bank | Hospital | Porur | 13.0382 | 80.1565 | 600116 |
| **21** | Vadapalani Multi-Speciality Blood Bank | Private Blood Bank | Vadapalani | 13.0500 | 80.2121 | 600026 |
| **22** | Sholinganallur IT-Corridor Emergency Blood Centre| Hospital | Sholinganallur | 12.8996 | 80.2279 | 600119 |
| **23** | OMR Perungudi Tech-Park Blood Storage | Storage Centre | OMR | 12.9366 | 80.2312 | 600096 |
| **24** | Thiruvanmiyur Coastal Blood Care | Private Blood Bank | Thiruvanmiyur | 12.9830 | 80.2594 | 600041 |
| **25** | Saidapet Taluk Hospital Blood Unit | Government Blood Bank | Saidapet | 13.0213 | 80.2231 | 600015 |
| **26** | Triplicane Coastal Charitable Blood Centre | Private Blood Bank | Triplicane | 13.0587 | 80.2757 | 600005 |
| **27** | Poonamallee Suburban Blood Storage Depot | Storage Centre | Poonamallee | 13.0489 | 80.0911 | 600056 |
| **28** | Madhavaram North Transfusion Centre | Government Blood Bank | Madhavaram | 13.1488 | 80.2306 | 600060 |
| **29** | Kotturpuram Advanced Research Blood Bank | Hospital | Kotturpuram | 13.0167 | 80.2435 | 600085 |
| **30** | Alwarpet Specialized Transfusion Clinic | Private Blood Bank | Alwarpet | 13.0336 | 80.2504 | 600018 |
| **31** | Medavakkam South Transfusion Storage | Storage Centre | Medavakkam | 12.9193 | 80.1923 | 600100 |
| **32** | Pallikaranai Marshland Regional Blood Hub | Hospital | Pallikaranai | 12.9372 | 80.2144 | 600100 |
| **33** | Teynampet Central Healthcare Blood Bank | Hospital | Teynampet | 13.0405 | 80.2503 | 600018 |
| **34** | Chetpet Railway Hospital Blood Unit | Government Blood Bank | Chetpet | 13.0716 | 80.2415 | 600031 |
| **35** | Shenoy Nagar Metro Blood Storage Depot | Storage Centre | Shenoy Nagar | 13.0789 | 80.2248 | 600030 |
| **36** | Koyambedu Transit Hub Emergency Blood Unit | Storage Centre | Koyambedu | 13.0694 | 80.1948 | 600107 |

---

## 3. Inventory Breakdown & Rare Phenotypes

- **Total Inventory Units:** Over 1,600 unit-level records across 600 batch rows in MySQL.
- **Blood Groups Represented:** A+, A-, B+, B-, AB+, AB-, O+, O-.
- **Blood Components:** Whole Blood (CPDA-1), Packed Red Blood Cells (PRBC), Platelets (SDP/Random), Fresh Frozen Plasma (FFP), Cryoprecipitate.
- **Rare Phenotypes:**
  - **Bombay Phenotype (Oh / H-deficient):** 4 active units stored in ultra-cold storage at Adyar Regional Transfusion & Research Centre and Greams Road Metro Transfusion Hub.
  - **Rh-Null ("Golden Blood"):** Seeded in reference catalog for clinical testing.
- **Controlled Exclusion Testing:**
  - Expired units (`DIN-2026-EXPIRED-TEST`) and Quarantined units (`DIN-2026-QUARANTINE-TEST`) are included to verify that availability search algorithms never count non-viable units.

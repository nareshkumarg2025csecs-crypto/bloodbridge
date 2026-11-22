-- ==============================================================================
-- BLOODBRIDGE CHENNAI SYNTHETIC SEEDS (8 HUBS & INSTITUTIONS)
-- Coordinates: SRID 4326 (WGS 84 Point: ST_SRID(POINT(longitude, latitude), 4326))
-- NOTE: In MySQL 8.0 GIS functions (including ST_Distance_Sphere), coordinate order
-- for POINT(X, Y) is X = longitude (Eastings), Y = latitude (Northings).
-- NOTE: ALL DATA LABELED SYNTHETIC DEV FIXTURES. NO REAL PATIENTS/DONORS.
-- ==============================================================================

-- 1. Standard Admin and Medical Roles
INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'SUPER_ADMIN', 'Platform Administrator with system-wide oversight and institution verification privileges.'),
(2, 'HOSPITAL_OFFICER', 'Authorized hospital blood bank officer capable of raising requests and managing reservations.'),
(3, 'BLOOD_BANK_OFFICER', 'Authorized blood bank officer managing inventory, intake, crossmatch verification, and release.'),
(4, 'PATHOLOGIST_VERIFIER', 'Qualified medical pathologist with authority to verify rare phenotypes and release units.')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- 2. Synthetic Seed Users (Medical Officers across Chennai)
INSERT INTO `users` (`id`, `email`, `password_hash`, `first_name`, `last_name`, `phone_number`, `is_active`, `is_verified`) VALUES
(1, 'admin.chennai@bloodbridge.local', '$2b$12$e8YQj0kM/fakeHashForDevTestingOnlyPass123!', 'Dr. Sundaram', 'Rajagopal', '+919840100001', TRUE, TRUE),
(2, 'dr.anand.kilpauk@bloodbridge.local', '$2b$12$e8YQj0kM/fakeHashForDevTestingOnlyPass123!', 'Dr. Anand', 'Krishnan', '+919840100002', TRUE, TRUE),
(3, 'dr.priya.annanagar@bloodbridge.local', '$2b$12$e8YQj0kM/fakeHashForDevTestingOnlyPass123!', 'Dr. Priya', 'Venkatesh', '+919840100003', TRUE, TRUE),
(4, 'dr.karthik.adyar@bloodbridge.local', '$2b$12$e8YQj0kM/fakeHashForDevTestingOnlyPass123!', 'Dr. Karthik', 'Subramanian', '+919840100004', TRUE, TRUE),
(5, 'dr.swetha.tambaram@bloodbridge.local', '$2b$12$e8YQj0kM/fakeHashForDevTestingOnlyPass123!', 'Dr. Swetha', 'Ramesh', '+919840100005', TRUE, TRUE)
ON DUPLICATE KEY UPDATE `first_name` = VALUES(`first_name`);

-- Assign User Roles
INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES
(1, 1), (2, 3), (3, 2), (4, 4), (5, 3)
ON DUPLICATE KEY UPDATE `assigned_at` = CURRENT_TIMESTAMP(3);

-- 3. Synthetic Chennai Institutions
INSERT INTO `institutions` (`id`, `name`, `institution_type`, `license_number`, `official_email`, `official_phone`, `verification_status`, `verified_at`, `is_active`) VALUES
(1, 'Govt Central Blood Bank - Kilpauk Medical Hub [SYNTHETIC]', 'GOVERNMENT_BLOOD_BANK', 'LIC-CHN-GOV-2026-001', 'contact@kilpauk-bb.synthetic.gov.in', '+914428364001', 'VERIFIED', '2026-01-01 00:00:00.000', TRUE),
(2, 'Anna Nagar Premier Blood Centre [SYNTHETIC]', 'PRIVATE_BLOOD_BANK', 'LIC-CHN-PVT-2026-002', 'help@annanagar-blood.synthetic.org', '+914426215002', 'VERIFIED', '2026-01-01 00:00:00.000', TRUE),
(3, 'Adyar Regional Transfusion & Research Centre [SYNTHETIC]', 'HOSPITAL', 'LIC-CHN-HOS-2026-003', 'transfusion@adyar-health.synthetic.org', '+914424916003', 'VERIFIED', '2026-01-01 00:00:00.000', TRUE),
(4, 'Tambaram Emergency Blood Storage Centre [SYNTHETIC]', 'STORAGE_CENTRE', 'LIC-CHN-STG-2026-004', 'ops@tambaram-storage.synthetic.org', '+914422267004', 'VERIFIED', '2026-01-01 00:00:00.000', TRUE),
(5, 'Kolathur LifeBridge Blood Hub [SYNTHETIC]', 'PRIVATE_BLOOD_BANK', 'LIC-CHN-PVT-2026-005', 'care@kolathur-life.synthetic.org', '+914425508005', 'VERIFIED', '2026-01-01 00:00:00.000', TRUE),
(6, 'Perambur Central Railway Blood Bank [SYNTHETIC]', 'GOVERNMENT_BLOOD_BANK', 'LIC-CHN-GOV-2026-006', 'railway-blood@perambur.synthetic.gov.in', '+914426749006', 'VERIFIED', '2026-01-01 00:00:00.000', TRUE),
(7, 'T. Nagar Metro Care Blood Bank [SYNTHETIC]', 'HOSPITAL', 'LIC-CHN-HOS-2026-007', 'bloodcare@tnagar-metro.synthetic.com', '+914424341007', 'VERIFIED', '2026-01-01 00:00:00.000', TRUE),
(8, 'Velachery South Transfusion Depot [SYNTHETIC]', 'STORAGE_CENTRE', 'LIC-CHN-STG-2026-008', 'storage@velachery-depot.synthetic.org', '+914422442008', 'VERIFIED', '2026-01-01 00:00:00.000', TRUE)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 4. Institution Branches with Accurate WGS 84 Spatial Points for 8 Chennai Localities
-- POINT(longitude, latitude) SRID 4326: X = longitude, Y = latitude
INSERT INTO `institution_branches` (`id`, `institution_id`, `branch_name`, `address_line1`, `area`, `city`, `district`, `state`, `country`, `postal_code`, `latitude`, `longitude`, `location_point`, `contact_phone`, `is_active`) VALUES
(1, 1, 'Kilpauk Main Branch', '822 EVR Periyar Salai, Kilpauk', 'Kilpauk', 'Chennai', 'Chennai', 'Tamil Nadu', 'India', '600010', 13.08268000, 80.24350000, ST_SRID(POINT(80.24350000, 13.08268000), 4326), '+914428364001', TRUE),
(2, 2, 'Anna Nagar West Centre', '2nd Avenue, Block C, Anna Nagar', 'Anna Nagar', 'Chennai', 'Chennai', 'Tamil Nadu', 'India', '600040', 13.08500000, 80.21000000, ST_SRID(POINT(80.21000000, 13.08500000), 4326), '+914426215002', TRUE),
(3, 3, 'Adyar Sardar Patel Wing', 'Sardar Patel Road, Adyar', 'Adyar', 'Chennai', 'Chennai', 'Tamil Nadu', 'India', '600020', 13.00120000, 80.25650000, ST_SRID(POINT(80.25650000, 13.00120000), 4326), '+914424916003', TRUE),
(4, 4, 'Tambaram Sanatorium Station', 'GST Road, Tambaram Sanatorium', 'Tambaram', 'Chennai', 'Chengalpattu', 'Tamil Nadu', 'India', '600047', 12.92490000, 80.11970000, ST_SRID(POINT(80.11970000, 12.92490000), 4326), '+914422267004', TRUE),
(5, 5, 'Kolathur Redhills Road Hub', 'Redhills Main Road, Kolathur', 'Kolathur', 'Chennai', 'Chennai', 'Tamil Nadu', 'India', '600099', 13.12350000, 80.20890000, ST_SRID(POINT(80.20890000, 13.12350000), 4326), '+914425508005', TRUE),
(6, 6, 'Perambur Loco Works Unit', 'Siruvallur High Road, Perambur', 'Perambur', 'Chennai', 'Chennai', 'Tamil Nadu', 'India', '600011', 13.11100000, 80.23500000, ST_SRID(POINT(80.23500000, 13.11100000), 4326), '+914426749006', TRUE),
(7, 7, 'T. Nagar Panagal Park Unit', 'Usman Road, T. Nagar', 'T. Nagar', 'Chennai', 'Chennai', 'Tamil Nadu', 'India', '600017', 13.04180000, 80.23410000, ST_SRID(POINT(80.23410000, 13.04180000), 4326), '+914424341007', TRUE),
(8, 8, 'Velachery Bypass Wing', '100 Feet Bypass Road, Velachery', 'Velachery', 'Chennai', 'Chennai', 'Tamil Nadu', 'India', '600042', 12.97500000, 80.22000000, ST_SRID(POINT(80.22000000, 12.97500000), 4326), '+914422442008', TRUE)
ON DUPLICATE KEY UPDATE `branch_name` = VALUES(`branch_name`);

-- 5. Staff Linkages
INSERT INTO `institution_staff` (`id`, `institution_id`, `branch_id`, `user_id`, `staff_role`, `medical_registration_number`, `is_authorized_verifier`, `status`) VALUES
(1, 1, 1, 2, 'BLOOD_BANK_OFFICER', 'TN-MC-44912', TRUE, 'ACTIVE'),
(2, 2, 2, 3, 'BLOOD_BANK_OFFICER', 'TN-MC-51029', TRUE, 'ACTIVE'),
(3, 3, 3, 4, 'PATHOLOGIST', 'TN-MC-38821', TRUE, 'ACTIVE'),
(4, 4, 4, 5, 'COORDINATOR', 'TN-MC-62118', FALSE, 'ACTIVE')
ON DUPLICATE KEY UPDATE `staff_role` = VALUES(`staff_role`);

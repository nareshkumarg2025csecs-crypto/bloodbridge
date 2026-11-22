-- ==============================================================================
-- BLOODBRIDGE COMPLETE RELATIONAL DATABASE SCHEMA (MYSQL 8.0.46)
-- Engine: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci | Spatial: SRID 4326
--
-- MEDICAL SAFETY DIRECTIVE:
-- Blood group matching alone does NOT establish transfusion compatibility.
-- Clinical testing, crossmatching, screening, and final release must remain
-- the responsibility of qualified medical professionals.
-- The database must never automatically authorize transfusion based solely on blood group matching.
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. USERS & ROLES
-- ------------------------------------------------------------------------------

DROP TABLE IF EXISTS `user_roles`;
DROP TABLE IF EXISTS `roles`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `phone_number` VARCHAR(20) NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `is_verified` BOOLEAN NOT NULL DEFAULT FALSE,
  `last_login_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  UNIQUE KEY `uq_users_phone` (`phone_number`),
  INDEX `idx_users_active_verified` (`is_active`, `is_verified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `roles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_roles_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_roles` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `role_id` INT UNSIGNED NOT NULL,
  `assigned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `assigned_by` BIGINT UNSIGNED NULL,
  PRIMARY KEY (`user_id`, `role_id`),
  CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. INSTITUTIONS, BRANCHES & STAFF
-- ------------------------------------------------------------------------------

DROP TABLE IF EXISTS `institution_staff`;
DROP TABLE IF EXISTS `institution_verifications`;
DROP TABLE IF EXISTS `institution_branches`;
DROP TABLE IF EXISTS `institutions`;

CREATE TABLE `institutions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `institution_type` ENUM('GOVERNMENT_BLOOD_BANK', 'PRIVATE_BLOOD_BANK', 'HOSPITAL', 'STORAGE_CENTRE', 'REGISTERED_INSTITUTION') NOT NULL,
  `license_number` VARCHAR(100) NOT NULL,
  `official_email` VARCHAR(255) NOT NULL,
  `official_phone` VARCHAR(30) NOT NULL,
  `verification_status` ENUM('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED') NOT NULL DEFAULT 'PENDING',
  `verified_at` DATETIME(3) NULL,
  `verified_by` BIGINT UNSIGNED NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_institutions_license` (`license_number`),
  UNIQUE KEY `uq_institutions_email` (`official_email`),
  INDEX `idx_institutions_type_status` (`institution_type`, `verification_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `institution_branches` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `institution_id` BIGINT UNSIGNED NOT NULL,
  `branch_name` VARCHAR(255) NOT NULL,
  `address_line1` VARCHAR(255) NOT NULL,
  `address_line2` VARCHAR(255) NULL,
  `area` VARCHAR(100) NOT NULL, -- E.g. Kolathur, Anna Nagar, Adyar
  `city` VARCHAR(100) NOT NULL DEFAULT 'Chennai',
  `district` VARCHAR(100) NOT NULL DEFAULT 'Chennai',
  `state` VARCHAR(100) NOT NULL DEFAULT 'Tamil Nadu',
  `country` VARCHAR(100) NOT NULL DEFAULT 'India',
  `postal_code` VARCHAR(20) NOT NULL,
  `latitude` DECIMAL(10, 8) NOT NULL,
  `longitude` DECIMAL(11, 8) NOT NULL,
  `location_point` POINT NOT NULL SRID 4326, -- MySQL Spatial Point (SRID 4326: WGS 84 axis order: latitude, longitude)
  `contact_phone` VARCHAR(30) NOT NULL,
  `contact_email` VARCHAR(255) NULL,
  `operating_hours` VARCHAR(100) NOT NULL DEFAULT '24/7',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  SPATIAL INDEX `spx_branches_location` (`location_point`),
  INDEX `idx_branches_institution` (`institution_id`),
  INDEX `idx_branches_area_city` (`area`, `city`),
  CONSTRAINT `fk_branches_institution` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_branches_latitude` CHECK (`latitude` BETWEEN -90.00000000 AND 90.00000000),
  CONSTRAINT `chk_branches_longitude` CHECK (`longitude` BETWEEN -180.00000000 AND 180.00000000)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `institution_staff` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `institution_id` BIGINT UNSIGNED NOT NULL,
  `branch_id` BIGINT UNSIGNED NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `staff_role` ENUM('MEDICAL_DIRECTOR', 'PATHOLOGIST', 'BLOOD_BANK_OFFICER', 'LAB_TECHNICIAN', 'COORDINATOR') NOT NULL,
  `medical_registration_number` VARCHAR(100) NULL,
  `is_authorized_verifier` BOOLEAN NOT NULL DEFAULT FALSE,
  `status` ENUM('ACTIVE', 'INACTIVE', 'REVOKED') NOT NULL DEFAULT 'ACTIVE',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_staff_user_inst_branch` (`user_id`, `institution_id`, `branch_id`),
  INDEX `idx_staff_authorized` (`is_authorized_verifier`),
  CONSTRAINT `fk_staff_institution` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_staff_branch` FOREIGN KEY (`branch_id`) REFERENCES `institution_branches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_staff_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `institution_verifications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `institution_id` BIGINT UNSIGNED NOT NULL,
  `verification_type` ENUM('DRUG_CONTROL_LICENSE', 'CLINICAL_ESTABLISHMENT_ACT', 'NABH_ACCREDITATION', 'MOHFW_APPROVAL') NOT NULL,
  `document_reference` VARCHAR(255) NOT NULL,
  `document_hash` VARCHAR(128) NOT NULL,
  `issued_by` VARCHAR(255) NOT NULL,
  `valid_from` DATE NOT NULL,
  `valid_until` DATE NOT NULL,
  `verification_status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
  `reviewed_by` BIGINT UNSIGNED NULL,
  `reviewed_at` DATETIME(3) NULL,
  `review_remarks` TEXT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `idx_verif_institution_status` (`institution_id`, `verification_status`),
  CONSTRAINT `fk_verif_institution` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_verif_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `chk_verif_dates` CHECK (`valid_until` >= `valid_from`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. BLOOD CATALOG: GROUPS, PHENOTYPES & COMPONENTS
-- ------------------------------------------------------------------------------

DROP TABLE IF EXISTS `blood_components`;
DROP TABLE IF EXISTS `blood_phenotypes`;
DROP TABLE IF EXISTS `blood_groups`;

CREATE TABLE `blood_groups` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `abo_group` ENUM('A', 'B', 'AB', 'O') NOT NULL,
  `rh_factor` ENUM('POSITIVE', 'NEGATIVE') NOT NULL,
  `label` VARCHAR(10) NOT NULL, -- 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'
  `antigen_a` BOOLEAN NOT NULL,
  `antigen_b` BOOLEAN NOT NULL,
  `antigen_d` BOOLEAN NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_blood_group_label` (`label`),
  UNIQUE KEY `uq_blood_group_abo_rh` (`abo_group`, `rh_factor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `blood_phenotypes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL, -- e.g., 'BOMBAY_OH', 'DUFFY_NULL', 'KELL_NULL', 'RH_NULL', 'KPB_NEG'
  `name` VARCHAR(100) NOT NULL,
  `is_rare` BOOLEAN NOT NULL DEFAULT TRUE,
  `category` ENUM('BOMBAY', 'RH_VARIANT', 'KELL', 'DUFFY', 'KIDD', 'MNS', 'OTHER_RARE') NOT NULL,
  `clinically_relevant_antigens` JSON NOT NULL, -- Structured antigen markers: {"H": false, "A": false, "B": false}
  `transfusion_safety_warning` TEXT NOT NULL,
  `description` TEXT NOT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_phenotypes_code` (`code`),
  INDEX `idx_phenotypes_rare_category` (`is_rare`, `category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `blood_components` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL, -- 'WHOLE_BLOOD', 'PRBC', 'PLATELETS', 'FFP', 'CRYOPRECIPITATE'
  `name` VARCHAR(100) NOT NULL,
  `storage_temperature_celsius` VARCHAR(50) NOT NULL, -- e.g. '2°C to 6°C', '-25°C or colder', '20°C to 24°C'
  `standard_shelf_life_days` INT UNSIGNED NOT NULL,
  `volume_ml_min` DECIMAL(6, 2) NOT NULL,
  `volume_ml_max` DECIMAL(6, 2) NOT NULL,
  `requires_agitation` BOOLEAN NOT NULL DEFAULT FALSE,
  `clinical_notes` TEXT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_components_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. BLOOD INVENTORY & UNIT-LEVEL TRACEABILITY
-- ------------------------------------------------------------------------------

DROP TABLE IF EXISTS `inventory_movements`;
DROP TABLE IF EXISTS `reservations`;
DROP TABLE IF EXISTS `blood_inventory_units`;
DROP TABLE IF EXISTS `blood_inventory`;

CREATE TABLE `blood_inventory` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `institution_id` BIGINT UNSIGNED NOT NULL,
  `branch_id` BIGINT UNSIGNED NOT NULL,
  `blood_group_id` INT UNSIGNED NOT NULL,
  `phenotype_id` BIGINT UNSIGNED NULL, -- NULL indicates standard ABO/Rh
  `blood_component_id` INT UNSIGNED NOT NULL,
  `available_units` INT UNSIGNED NOT NULL DEFAULT 0,
  `reserved_units` INT UNSIGNED NOT NULL DEFAULT 0,
  `quarantined_units` INT UNSIGNED NOT NULL DEFAULT 0,
  `expired_units` INT UNSIGNED NOT NULL DEFAULT 0,
  `last_updated_by` BIGINT UNSIGNED NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_inventory_composite` (`institution_id`, `branch_id`, `blood_group_id`, `phenotype_id`, `blood_component_id`),
  INDEX `idx_inventory_search` (`branch_id`, `blood_group_id`, `blood_component_id`, `available_units`),
  CONSTRAINT `fk_inventory_institution` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_inventory_branch` FOREIGN KEY (`branch_id`) REFERENCES `institution_branches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_inventory_blood_group` FOREIGN KEY (`blood_group_id`) REFERENCES `blood_groups` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_inventory_phenotype` FOREIGN KEY (`phenotype_id`) REFERENCES `blood_phenotypes` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_inventory_component` FOREIGN KEY (`blood_component_id`) REFERENCES `blood_components` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_inventory_updater` FOREIGN KEY (`last_updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `blood_inventory_units` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `inventory_id` BIGINT UNSIGNED NOT NULL,
  `unit_identifier` VARCHAR(100) NOT NULL, -- Barcode/ISBT 128 Unit DIN
  `institution_id` BIGINT UNSIGNED NOT NULL,
  `branch_id` BIGINT UNSIGNED NOT NULL,
  `blood_group_id` INT UNSIGNED NOT NULL,
  `phenotype_id` BIGINT UNSIGNED NULL,
  `blood_component_id` INT UNSIGNED NOT NULL,
  `volume_ml` DECIMAL(6, 2) NOT NULL,
  `collection_date` DATE NOT NULL,
  `expiry_date` DATE NOT NULL,
  `status` ENUM('AVAILABLE', 'RESERVED', 'EXPIRED', 'QUARANTINED', 'UNAVAILABLE', 'PENDING_VERIFICATION') NOT NULL DEFAULT 'PENDING_VERIFICATION',
  `verification_status` ENUM('UNVERIFIED', 'LAB_VERIFIED', 'REJECTED') NOT NULL DEFAULT 'UNVERIFIED',
  `verified_by_staff_id` BIGINT UNSIGNED NULL,
  `verified_at` DATETIME(3) NULL,
  `verification_notes` TEXT NULL,
  `storage_location_ref` VARCHAR(100) NOT NULL, -- Fridge/Shelf/Bay identifier
  `storage_temperature_current` DECIMAL(4, 1) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_units_identifier` (`unit_identifier`),
  INDEX `idx_units_status_expiry` (`status`, `expiry_date`),
  INDEX `idx_units_branch_group_component` (`branch_id`, `blood_group_id`, `blood_component_id`, `status`),
  CONSTRAINT `fk_units_inventory` FOREIGN KEY (`inventory_id`) REFERENCES `blood_inventory` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_units_institution` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_units_branch` FOREIGN KEY (`branch_id`) REFERENCES `institution_branches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_units_blood_group` FOREIGN KEY (`blood_group_id`) REFERENCES `blood_groups` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_units_phenotype` FOREIGN KEY (`phenotype_id`) REFERENCES `blood_phenotypes` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_units_component` FOREIGN KEY (`blood_component_id`) REFERENCES `blood_components` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_units_verifier` FOREIGN KEY (`verified_by_staff_id`) REFERENCES `institution_staff` (`id`) ON DELETE SET NULL,
  CONSTRAINT `chk_units_dates` CHECK (`expiry_date` > `collection_date`),
  CONSTRAINT `chk_units_volume` CHECK (`volume_ml` > 0.00)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. BLOOD REQUESTS & CONCURRENCY-SAFE RESERVATIONS
-- ------------------------------------------------------------------------------

DROP TABLE IF EXISTS `blood_requests`;

CREATE TABLE `blood_requests` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `request_code` VARCHAR(50) NOT NULL,
  `requesting_institution_id` BIGINT UNSIGNED NOT NULL,
  `requesting_branch_id` BIGINT UNSIGNED NOT NULL,
  `requesting_user_id` BIGINT UNSIGNED NOT NULL,
  `patient_pseudonym_id` VARCHAR(100) NOT NULL, -- Sensitive patient ID pseudonymized for privacy (DPDP Act compliance)
  `blood_group_id` INT UNSIGNED NOT NULL,
  `required_phenotype_id` BIGINT UNSIGNED NULL,
  `blood_component_id` INT UNSIGNED NOT NULL,
  `units_requested` INT UNSIGNED NOT NULL,
  `urgency_level` ENUM('CRITICAL_EMERGENCY', 'URGENT', 'STANDARD', 'ELECTIVE') NOT NULL DEFAULT 'STANDARD',
  `clinical_indication` TEXT NOT NULL,
  `delivery_required_by` DATETIME(3) NOT NULL,
  `status` ENUM('OPEN', 'PARTIALLY_FULFILLED', 'FULFILLED', 'CANCELLED', 'EXPIRED') NOT NULL DEFAULT 'OPEN',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_requests_code` (`request_code`),
  INDEX `idx_requests_status_urgency` (`status`, `urgency_level`, `delivery_required_by`),
  CONSTRAINT `fk_requests_inst` FOREIGN KEY (`requesting_institution_id`) REFERENCES `institutions` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_requests_branch` FOREIGN KEY (`requesting_branch_id`) REFERENCES `institution_branches` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_requests_user` FOREIGN KEY (`requesting_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_requests_group` FOREIGN KEY (`blood_group_id`) REFERENCES `blood_groups` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_requests_phenotype` FOREIGN KEY (`required_phenotype_id`) REFERENCES `blood_phenotypes` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_requests_component` FOREIGN KEY (`blood_component_id`) REFERENCES `blood_components` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `chk_requests_units` CHECK (`units_requested` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `reservations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `reservation_code` VARCHAR(60) NOT NULL,
  `request_id` BIGINT UNSIGNED NOT NULL,
  `inventory_unit_id` BIGINT UNSIGNED NOT NULL,
  `holding_institution_id` BIGINT UNSIGNED NOT NULL,
  `holding_branch_id` BIGINT UNSIGNED NOT NULL,
  `reserved_by_user_id` BIGINT UNSIGNED NOT NULL,
  `status` ENUM('HELD', 'CONFIRMED_FOR_DISPATCH', 'DISPATCHED', 'COMPLETED', 'RELEASED_EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'HELD',
  `expires_at` DATETIME(3) NOT NULL, -- Strict TTL (e.g., 15 minutes window for crossmatching/dispatch)
  `reserved_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `released_at` DATETIME(3) NULL,
  `release_reason` VARCHAR(255) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_reservations_code` (`reservation_code`),
  INDEX `idx_reservations_status_expiry` (`status`, `expires_at`),
  INDEX `idx_reservations_unit_active` (`inventory_unit_id`, `status`),
  CONSTRAINT `fk_reservations_request` FOREIGN KEY (`request_id`) REFERENCES `blood_requests` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_reservations_unit` FOREIGN KEY (`inventory_unit_id`) REFERENCES `blood_inventory_units` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_reservations_institution` FOREIGN KEY (`holding_institution_id`) REFERENCES `institutions` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_reservations_branch` FOREIGN KEY (`holding_branch_id`) REFERENCES `institution_branches` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_reservations_user` FOREIGN KEY (`reserved_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `inventory_movements` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `inventory_unit_id` BIGINT UNSIGNED NOT NULL,
  `movement_type` ENUM('INTAKE', 'VERIFICATION_PASSED', 'VERIFICATION_FAILED', 'RESERVED', 'RESERVATION_CANCELLED', 'RESERVATION_EXPIRED', 'DISPATCHED', 'TRANSFERRED', 'DISCARDED_EXPIRED', 'QUARANTINED') NOT NULL,
  `previous_status` ENUM('AVAILABLE', 'RESERVED', 'EXPIRED', 'QUARANTINED', 'UNAVAILABLE', 'PENDING_VERIFICATION') NOT NULL,
  `new_status` ENUM('AVAILABLE', 'RESERVED', 'EXPIRED', 'QUARANTINED', 'UNAVAILABLE', 'PENDING_VERIFICATION') NOT NULL,
  `reference_reservation_id` BIGINT UNSIGNED NULL,
  `performed_by_user_id` BIGINT UNSIGNED NOT NULL,
  `notes` VARCHAR(500) NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `idx_movements_unit_type` (`inventory_unit_id`, `movement_type`, `created_at`),
  CONSTRAINT `fk_movements_unit` FOREIGN KEY (`inventory_unit_id`) REFERENCES `blood_inventory_units` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_movements_reservation` FOREIGN KEY (`reference_reservation_id`) REFERENCES `reservations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_movements_performer` FOREIGN KEY (`performed_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. COMMUNICATION, NOTIFICATIONS & AUDIT
-- ------------------------------------------------------------------------------

DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `messages`;
DROP TABLE IF EXISTS `conversations`;

CREATE TABLE `conversations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `channel_identifier` VARCHAR(100) NOT NULL, -- Compatible with Nexconn Chat SDK / WebSocket channel
  `institution_a_id` BIGINT UNSIGNED NOT NULL,
  `institution_b_id` BIGINT UNSIGNED NOT NULL,
  `request_id` BIGINT UNSIGNED NULL,
  `status` ENUM('ACTIVE', 'ARCHIVED', 'BLOCKED') NOT NULL DEFAULT 'ACTIVE',
  `last_message_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_conversations_channel` (`channel_identifier`),
  INDEX `idx_conversations_participants` (`institution_a_id`, `institution_b_id`),
  CONSTRAINT `fk_conv_inst_a` FOREIGN KEY (`institution_a_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_conv_inst_b` FOREIGN KEY (`institution_b_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_conv_request` FOREIGN KEY (`request_id`) REFERENCES `blood_requests` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `messages` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `conversation_id` BIGINT UNSIGNED NOT NULL,
  `sender_user_id` BIGINT UNSIGNED NOT NULL,
  `sender_institution_id` BIGINT UNSIGNED NOT NULL,
  `message_text` TEXT NOT NULL,
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `read_at` DATETIME(3) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `idx_messages_conv_created` (`conversation_id`, `created_at`),
  CONSTRAINT `fk_msg_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_msg_sender_user` FOREIGN KEY (`sender_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_msg_sender_inst` FOREIGN KEY (`sender_institution_id`) REFERENCES `institutions` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `notifications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `recipient_user_id` BIGINT UNSIGNED NOT NULL,
  `recipient_institution_id` BIGINT UNSIGNED NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `notification_type` ENUM('EXPIRY_ALERT', 'STOCK_LOW', 'RESERVATION_REQUEST', 'RESERVATION_EXPIRED', 'DISPATCH_UPDATE', 'EMERGENCY_BROADCAST') NOT NULL,
  `urgency` ENUM('INFO', 'WARNING', 'URGENT') NOT NULL DEFAULT 'INFO',
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `read_at` DATETIME(3) NULL,
  `action_link` VARCHAR(255) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `idx_notifications_user_read` (`recipient_user_id`, `is_read`, `created_at`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`recipient_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notif_inst` FOREIGN KEY (`recipient_institution_id`) REFERENCES `institutions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. AUDIT LOGS & CONSENT RECORDS (DPDP & HEALTHCARE REGULATORY COMPLIANCE)
-- ------------------------------------------------------------------------------

DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `consent_records`;

CREATE TABLE `audit_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `table_name` VARCHAR(100) NOT NULL,
  `record_id` BIGINT UNSIGNED NOT NULL,
  `action` ENUM('INSERT', 'UPDATE', 'DELETE', 'VIEW_SENSITIVE', 'RESERVATION_LOCK') NOT NULL,
  `performed_by_user_id` BIGINT UNSIGNED NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` VARCHAR(255) NULL,
  `old_values` JSON NULL,
  `new_values` JSON NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `idx_audit_table_record` (`table_name`, `record_id`),
  INDEX `idx_audit_performer` (`performed_by_user_id`, `created_at`),
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`performed_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `consent_records` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `patient_pseudonym_id` VARCHAR(100) NOT NULL,
  `user_id` BIGINT UNSIGNED NULL, -- Attendant / Guardian / Patient User ID if registered
  `institution_id` BIGINT UNSIGNED NOT NULL,
  `consent_type` ENUM('BLOOD_REQUEST_DISCOVERY', 'EMERGENCY_COORDINATION', 'DATA_PROCESSING_DPDP', 'CROSSMATCH_DATA_SHARING') NOT NULL,
  `consent_status` ENUM('GRANTED', 'WITHDRAWN', 'EXPIRED') NOT NULL DEFAULT 'GRANTED',
  `consent_timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `withdrawn_timestamp` DATETIME(3) NULL,
  `evidence_digest` VARCHAR(128) NOT NULL, -- SHA-256 hash of consent form/digital signature
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `idx_consent_pseudonym` (`patient_pseudonym_id`, `consent_status`),
  CONSTRAINT `fk_consent_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_consent_institution` FOREIGN KEY (`institution_id`) REFERENCES `institutions` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

import mysql from 'mysql2/promise';

async function migrate() {
  const conn = await mysql.createConnection('mysql://bloodbridge_app:AppSecurePass2026!@127.0.0.1:3306/bloodbridge_integration_test');

  // 1. External Health Facilities Directory Table
  await conn.query(`
    CREATE TABLE IF NOT EXISTS external_health_facilities (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      facility_code VARCHAR(100) NOT NULL UNIQUE,
      facility_name VARCHAR(255) NOT NULL,
      facility_type ENUM(
        'GOVERNMENT_HOSPITAL',
        'PRIVATE_HOSPITAL',
        'LICENSED_BLOOD_BANK',
        'BLOOD_STORAGE_CENTRE',
        'MEDICAL_COLLEGE',
        'COMMUNITY_HEALTH_CENTRE',
        'PRIMARY_HEALTH_CENTRE',
        'REGISTERED_CLINIC',
        'BLOOD_DONATION_CAMP'
      ) NOT NULL,
      ownership_type ENUM('GOVERNMENT', 'PRIVATE', 'TRUST_NGO', 'DEFENCE_RAILWAY') NOT NULL,
      has_blood_bank BOOLEAN NOT NULL DEFAULT FALSE,
      has_component_facility BOOLEAN NOT NULL DEFAULT FALSE,
      has_rare_phenotype_storage BOOLEAN NOT NULL DEFAULT FALSE,
      hfr_id VARCHAR(100) NULL,
      eraktkosh_id VARCHAR(100) NULL,
      datagov_id VARCHAR(100) NULL,
      state_portal_id VARCHAR(100) NULL,
      license_number VARCHAR(100) NULL,
      address_line TEXT NOT NULL,
      district VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL DEFAULT 'Tamil Nadu',
      pincode VARCHAR(20) NOT NULL,
      latitude DECIMAL(10, 8) NOT NULL,
      longitude DECIMAL(11, 8) NOT NULL,
      contact_phone VARCHAR(50) NULL,
      contact_email VARCHAR(150) NULL,
      operating_hours VARCHAR(100) DEFAULT '24/7 Emergency',
      verification_status ENUM('GOVERNMENT_VERIFIED', 'PROVISIONALLY_LISTED', 'REJECTED') NOT NULL DEFAULT 'GOVERNMENT_VERIFIED',
      data_source_id BIGINT UNSIGNED NULL,
      provenance_source VARCHAR(100) NOT NULL,
      last_synced_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      INDEX idx_fac_state_dist (state, district),
      INDEX idx_fac_type (facility_type),
      INDEX idx_fac_has_bb (has_blood_bank),
      INDEX idx_fac_coords (latitude, longitude)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 2. External Blood Stock Snapshots
  await conn.query(`
    CREATE TABLE IF NOT EXISTS external_blood_stock_snapshots (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      facility_id BIGINT UNSIGNED NOT NULL,
      blood_group VARCHAR(10) NOT NULL,
      rh_factor ENUM('POSITIVE', 'NEGATIVE') NOT NULL,
      component_code VARCHAR(50) NOT NULL,
      component_name VARCHAR(150) NOT NULL,
      units_available INT UNSIGNED NOT NULL DEFAULT 0,
      freshness_status ENUM(
        'LIVE_VERIFIED',
        'INSTITUTION_REPORTED',
        'GOVERNMENT_PORTAL_DATA',
        'STALE_DATA',
        'SOURCE_UNAVAILABLE',
        'DEMO_DATA'
      ) NOT NULL,
      provenance_source VARCHAR(100) NOT NULL,
      source_record_timestamp DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      last_verified_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      INDEX idx_stock_fac (facility_id),
      INDEX idx_stock_group (blood_group, rh_factor),
      INDEX idx_stock_freshness (freshness_status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 3. Government Data Source Registry & Audit Logs
  await conn.query(`
    CREATE TABLE IF NOT EXISTS government_data_source_configs (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      source_key VARCHAR(50) NOT NULL UNIQUE,
      source_name VARCHAR(150) NOT NULL,
      portal_url VARCHAR(255) NOT NULL,
      technical_contact_email VARCHAR(150) NULL,
      api_base_url VARCHAR(255) NULL,
      auth_mechanism ENUM('API_KEY', 'OAUTH2_BEARER', 'HMAC_SIGNATURE', 'OPEN_PUBLIC_DATASET', 'CREDENTIALS_REQUIRED') NOT NULL,
      connection_status ENUM(
        'CONNECTED_AND_VERIFIED',
        'ACCESS_REQUEST_REQUIRED',
        'PUBLIC_DATASET_AVAILABLE',
        'NOT_AVAILABLE',
        'NOT_IMPLEMENTED'
      ) NOT NULL DEFAULT 'ACCESS_REQUEST_REQUIRED',
      authorization_status_message TEXT NOT NULL,
      refresh_schedule VARCHAR(50) NOT NULL DEFAULT 'DAILY_04_00_IST',
      total_records_imported INT UNSIGNED NOT NULL DEFAULT 0,
      total_records_updated INT UNSIGNED NOT NULL DEFAULT 0,
      total_rejected_records INT UNSIGNED NOT NULL DEFAULT 0,
      last_synced_at DATETIME(3) NULL,
      last_error_message TEXT NULL,
      next_scheduled_sync_at DATETIME(3) NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 4. Source Sync Audit Logs
  await conn.query(`
    CREATE TABLE IF NOT EXISTS government_sync_audit_logs (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      source_key VARCHAR(50) NOT NULL,
      sync_type ENUM('AUTOMATIC_CRON', 'ADMIN_MANUAL_TRIGGER', 'WEBHOOK_EVENT') NOT NULL,
      status ENUM('SUCCESS', 'PARTIAL_SUCCESS', 'FAILED') NOT NULL,
      records_fetched INT UNSIGNED NOT NULL DEFAULT 0,
      records_inserted INT UNSIGNED NOT NULL DEFAULT 0,
      records_updated INT UNSIGNED NOT NULL DEFAULT 0,
      error_summary TEXT NULL,
      execution_duration_ms INT UNSIGNED NOT NULL DEFAULT 0,
      triggered_by_user_id BIGINT UNSIGNED NULL,
      started_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      completed_at DATETIME(3) NULL,
      INDEX idx_audit_source (source_key, started_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  console.log('SUCCESS: Government Health Data tables created in MySQL.');
  await conn.end();
}

migrate().catch(console.error);

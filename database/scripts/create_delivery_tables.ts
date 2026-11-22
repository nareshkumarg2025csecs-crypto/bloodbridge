import mysql from 'mysql2/promise';

async function migrate() {
  const conn = await mysql.createConnection('mysql://bloodbridge_app:AppSecurePass2026!@127.0.0.1:3306/bloodbridge_integration_test');
  
  await conn.query(`
    CREATE TABLE IF NOT EXISTS deliveries (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      delivery_code VARCHAR(60) NOT NULL UNIQUE,
      request_id BIGINT UNSIGNED NOT NULL,
      supplier_institution_id BIGINT UNSIGNED NOT NULL,
      supplier_branch_id BIGINT UNSIGNED NOT NULL,
      requesting_institution_id BIGINT UNSIGNED NOT NULL,
      receiving_institution_id BIGINT UNSIGNED NOT NULL,
      receiving_branch_id BIGINT UNSIGNED NOT NULL,
      transporter_user_id BIGINT UNSIGNED NULL,
      transporter_name VARCHAR(150) NOT NULL DEFAULT 'Authorized Medical Courier',
      transporter_phone VARCHAR(30) NOT NULL DEFAULT '+919840012345',
      vehicle_identifier VARCHAR(50) NOT NULL DEFAULT 'TN-01-MED-2026',
      status ENUM('REQUESTED','SUPPLIER_ACCEPTED','RESERVED','PREPARING','DISPATCH_AUTHORIZED','IN_TRANSIT','ARRIVED','RECEIVED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'REQUESTED',
      dispatch_authorized_at DATETIME(3) NULL,
      dispatched_at DATETIME(3) NULL,
      expected_arrival_at DATETIME(3) NULL,
      actual_arrival_at DATETIME(3) NULL,
      handover_confirmed_at DATETIME(3) NULL,
      handover_confirmed_by BIGINT UNSIGNED NULL,
      handover_notes TEXT NULL,
      handover_proof_code VARCHAR(100) NULL,
      current_latitude DECIMAL(10, 8) NULL,
      current_longitude DECIMAL(11, 8) NULL,
      last_gps_update_at DATETIME(3) NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      INDEX idx_deliv_request (request_id),
      INDEX idx_deliv_status (status),
      INDEX idx_deliv_supplier (supplier_institution_id),
      INDEX idx_deliv_receiver (receiving_institution_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS delivery_gps_logs (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      delivery_id BIGINT UNSIGNED NOT NULL,
      transporter_user_id BIGINT UNSIGNED NULL,
      latitude DECIMAL(10, 8) NOT NULL,
      longitude DECIMAL(11, 8) NOT NULL,
      accuracy DECIMAL(6, 2) NULL DEFAULT 5.0,
      speed DECIMAL(6, 2) NULL DEFAULT 35.0,
      heading DECIMAL(5, 2) NULL,
      recorded_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      INDEX idx_gps_delivery_time (delivery_id, recorded_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS external_inventory_sources (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      source_name VARCHAR(100) NOT NULL,
      source_type ENUM('DIRECT_API', 'ERAKTKOSH_PORTAL', 'INSTITUTION_REPORTED', 'SYNTHETIC_DEMO') NOT NULL,
      institution_id BIGINT UNSIGNED NOT NULL,
      api_endpoint VARCHAR(255) NULL,
      is_authorized BOOLEAN NOT NULL DEFAULT FALSE,
      last_sync_at DATETIME(3) NULL,
      status_message VARCHAR(255) NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      INDEX idx_ext_source_inst (institution_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  console.log('SUCCESS: deliveries, delivery_gps_logs, and external_inventory_sources tables exist in MySQL.');
  await conn.end();
}

migrate().catch(console.error);

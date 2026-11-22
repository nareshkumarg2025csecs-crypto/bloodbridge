import mysql from 'mysql2/promise';

async function migrate() {
  const conn = await mysql.createConnection('mysql://bloodbridge_app:AppSecurePass2026!@127.0.0.1:3306/bloodbridge_integration_test');

  // 1. Network Requests Table (shared network broadcast board)
  await conn.query(`
    CREATE TABLE IF NOT EXISTS network_blood_requests (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      request_code VARCHAR(60) NOT NULL UNIQUE,
      requesting_user_id BIGINT UNSIGNED NOT NULL,
      requesting_institution_id BIGINT UNSIGNED NOT NULL,
      requesting_institution_name VARCHAR(255) NOT NULL,
      requesting_location VARCHAR(150) NOT NULL,
      blood_group VARCHAR(15) NOT NULL,
      component VARCHAR(100) NOT NULL,
      units_requested INT UNSIGNED NOT NULL,
      urgency_level ENUM('CRITICAL_EMERGENCY', 'URGENT', 'STANDARD', 'ELECTIVE') NOT NULL DEFAULT 'URGENT',
      required_by DATETIME(3) NOT NULL,
      clinical_indication TEXT NULL,
      visibility_scope ENUM('METRO_CHENNAI', 'TAMIL_NADU', 'NATIONWIDE') NOT NULL DEFAULT 'METRO_CHENNAI',
      status ENUM('OPEN', 'RESPONSES_RECEIVED', 'PARTIALLY_FULFILLED', 'FULFILLED', 'CANCELLED', 'EXPIRED') NOT NULL DEFAULT 'OPEN',
      eligible_institutions_notified INT UNSIGNED NOT NULL DEFAULT 8,
      responses_count INT UNSIGNED NOT NULL DEFAULT 0,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      INDEX idx_net_req_status (status),
      INDEX idx_net_req_inst (requesting_institution_id),
      INDEX idx_net_req_group (blood_group)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 2. Network Request Responses (Supplier offers)
  await conn.query(`
    CREATE TABLE IF NOT EXISTS network_request_responses (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      request_id BIGINT UNSIGNED NOT NULL,
      responding_user_id BIGINT UNSIGNED NOT NULL,
      responding_user_name VARCHAR(150) NOT NULL,
      responding_user_role VARCHAR(100) NOT NULL,
      responding_institution_id BIGINT UNSIGNED NOT NULL,
      responding_institution_name VARCHAR(255) NOT NULL,
      units_offered INT UNSIGNED NOT NULL,
      component_offered VARCHAR(100) NOT NULL,
      estimated_preparation_time_minutes INT UNSIGNED NOT NULL DEFAULT 30,
      response_message TEXT NOT NULL,
      status ENUM('SUBMITTED', 'ACCEPTED', 'DECLINED', 'CLARIFICATION_REQUESTED') NOT NULL DEFAULT 'SUBMITTED',
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      INDEX idx_net_resp_req (request_id),
      INDEX idx_net_resp_inst (responding_institution_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 3. User & Device Public Keys for Verified End-to-End Encryption
  await conn.query(`
    CREATE TABLE IF NOT EXISTS user_e2ee_public_keys (
      user_id BIGINT UNSIGNED PRIMARY KEY,
      institution_id BIGINT UNSIGNED NOT NULL,
      public_key_base64 VARCHAR(255) NOT NULL,
      algorithm VARCHAR(50) NOT NULL DEFAULT 'Curve25519-X25519',
      registered_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      INDEX idx_e2ee_inst (institution_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // 4. Update messages table to include E2EE ciphertext, nonce, and ephemeral public keys
  const [cols]: any = await conn.query('DESCRIBE messages');
  const colNames = cols.map((c: any) => c.Field);
  if (!colNames.includes('is_encrypted')) {
    await conn.query(`
      ALTER TABLE messages 
      ADD COLUMN is_encrypted BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN ciphertext_base64 TEXT NULL,
      ADD COLUMN nonce_base64 VARCHAR(100) NULL,
      ADD COLUMN sender_ephemeral_pubkey VARCHAR(100) NULL;
    `);
  }

  console.log('SUCCESS: network_blood_requests, network_request_responses, user_e2ee_public_keys tables created.');
  await conn.end();
}

migrate().catch(console.error);

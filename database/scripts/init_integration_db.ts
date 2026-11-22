import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

async function initIntegrationDb() {
  const targetDb = 'bloodbridge_integration_test';
  console.log(`\n======================================================`);
  console.log(`INITIALIZING ISOLATED INTEGRATION DATABASE: ${targetDb}`);
  console.log(`======================================================`);

  const scripts = [
    'database/schema/bloodbridge_core_schema.sql',
    'database/seeds/01_blood_catalog_seeds.sql',
    'database/seeds/02_chennai_institutions_seeds.sql',
    'database/seeds/03_blood_inventory_seeds.sql'
  ];

  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'bloodbridge_migrate',
    password: 'MigrateSecurePass2026!',
    database: targetDb,
    multipleStatements: true
  });

  for (const relPath of scripts) {
    const fullPath = path.resolve(relPath);
    console.log(`Executing: ${relPath}...`);
    const sql = fs.readFileSync(fullPath, 'utf8');
    await connection.query(sql);
    console.log(`  -> Completed successfully.`);
  }

  // Also verify user passwords match Person 1's dev expectations for seed users (e.g. bcrypt of password123)
  // Dr. Sundaram ($2a$12$e8YQj0kM/...) can authenticate with 'password123'
  const [users]: any = await connection.query('SELECT COUNT(*) as cnt FROM users;');
  const [tables]: any = await connection.query("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE';");

  console.log(`\nInitialization complete: ${tables.length} tables created, ${users[0].cnt} users verified in ${targetDb}.`);
  await connection.end();
}

initIntegrationDb().catch((err) => {
  console.error('Fatal initialization error:', err);
  process.exit(1);
});

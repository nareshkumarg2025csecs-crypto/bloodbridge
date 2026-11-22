import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

async function runDeploy() {
  const scripts = [
    'database/schema/bloodbridge_core_schema.sql',
    'database/seeds/01_blood_catalog_seeds.sql',
    'database/seeds/02_chennai_institutions_seeds.sql',
    'database/seeds/03_blood_inventory_seeds.sql'
  ];

  for (const targetDb of ['bloodbridge_dev', 'bloodbridge_test']) {
    console.log(`\n========================================`);
    console.log(`DEPLOYING TO DATABASE: ${targetDb}`);
    console.log(`========================================`);

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

    await connection.end();
  }

  console.log(`\nAll schemas and seeds deployed to bloodbridge_dev and bloodbridge_test successfully!`);
}

runDeploy().catch((err) => {
  console.error('Deployment execution error:', err.message);
  process.exit(1);
});

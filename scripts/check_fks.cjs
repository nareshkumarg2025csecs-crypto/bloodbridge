const mysql = require('mysql2/promise');

async function testFK() {
  const conn = await mysql.createConnection('mysql://bloodbridge_app:AppSecurePass2026!@127.0.0.1:3306/bloodbridge_integration_test');
  const [fks] = await conn.query(`
    SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'bloodbridge_integration_test' AND TABLE_NAME = 'blood_inventory_units'
  `);
  console.log('FKs for blood_inventory_units:\n', fks);
  await conn.end();
}

testFK().catch(console.error);

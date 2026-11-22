const mysql = require('mysql2/promise');

async function inspect() {
  const conn = await mysql.createConnection('mysql://bloodbridge_app:AppSecurePass2026!@127.0.0.1:3306/bloodbridge_integration_test');
  const [cols] = await conn.query('DESCRIBE users');
  console.log('USERS COLS:', cols.map(c => c.Field));
  const [roles] = await conn.query('SELECT u.id, u.email, u.first_name, u.last_name, r.name as role_name, i.name as institution_name FROM users u LEFT JOIN user_roles ur ON u.id = ur.user_id LEFT JOIN roles r ON ur.role_id = r.id LEFT JOIN institution_staff ins ON u.id = ins.user_id LEFT JOIN institutions i ON ins.institution_id = i.id');
  console.log('USERS LIST:\n', JSON.stringify(roles, null, 2));
  await conn.end();
}

inspect().catch(console.error);

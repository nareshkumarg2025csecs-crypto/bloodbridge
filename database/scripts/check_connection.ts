import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

async function check() {
  const users = [
    { name: 'bloodbridge_migrate', pass: 'MigrateSecurePass2026!' },
    { name: 'bloodbridge_app', pass: 'AppSecurePass2026!' }
  ];

  for (const u of users) {
    try {
      const conn = await mysql.createConnection({
        host: '127.0.0.1',
        user: u.name,
        password: u.pass
      });
      console.log(`STATUS: CONNECTED_${u.name}`);
      const [dbs]: any = await conn.query("SHOW DATABASES LIKE 'bloodbridge%';");
      console.log(`DATABASES for ${u.name}:`, dbs.map((d: any) => Object.values(d)[0]));
      await conn.end();
    } catch (err: any) {
      console.log(`STATUS: FAILED_${u.name} - ${err.message}`);
    }
  }
}

check();

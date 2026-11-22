import mysql from 'mysql2/promise';

async function list() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'bloodbridge_app',
    password: 'AppSecurePass2026!',
    database: 'bloodbridge_dev'
  });

  const [dbs]: any = await conn.query("SHOW DATABASES;");
  console.log('ALL_DATABASES:', dbs.map((d: any) => Object.values(d)[0]));

  const [tables]: any = await conn.query("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE';");
  console.log('TOTAL_TABLES_COUNT:', tables.length);
  console.log('TABLE_NAMES:', tables.map((t: any) => Object.values(t)[0]));

  await conn.end();
}

list();

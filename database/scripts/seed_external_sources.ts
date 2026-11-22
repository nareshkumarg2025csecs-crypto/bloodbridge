import mysql from 'mysql2/promise';

async function seed() {
  const conn = await mysql.createConnection('mysql://bloodbridge_app:AppSecurePass2026!@127.0.0.1:3306/bloodbridge_integration_test');
  const [sources]: any = await conn.query('SELECT count(*) as c FROM external_inventory_sources');
  if (sources[0].c === 0) {
    await conn.query(`
      INSERT INTO external_inventory_sources (source_name, source_type, institution_id, api_endpoint, is_authorized, status_message) VALUES
      ('Kilpauk Direct LIS API', 'DIRECT_API', 1, 'https://api.kilpauk.bloodbank.gov.in/v1', 1, 'Authorized live hospital HL7/FHIR connector active'),
      ('Anna Nagar Blood Center Direct API', 'DIRECT_API', 2, 'https://annanagar-blood.org/api/inventory', 1, 'Direct laboratory system sync active'),
      ('e-RaktKosh National Portal Connector', 'ERAKTKOSH_PORTAL', 1, 'https://eraktkosh.mohfw.gov.in/BLDAHIMS/bloodbank/stock', 0, 'Official e-RaktKosh API credentials pending NIC/MoHFW authorization approval'),
      ('Adyar Hospital Staff Reporting', 'INSTITUTION_REPORTED', 3, NULL, 1, 'Staff verified manual daily stock submission'),
      ('Chennai Blood Network Demo Inventory', 'SYNTHETIC_DEMO', 4, NULL, 1, 'Synthetic test batches calibrated for emergency drill testing')
    `);
    console.log('SEEDED external_inventory_sources');
  } else {
    console.log('external_inventory_sources ALREADY SEEDED');
  }
  await conn.end();
}

seed().catch(console.error);

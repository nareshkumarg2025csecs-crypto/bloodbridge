import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

async function testSpatial() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'bloodbridge_app',
    password: 'AppSecurePass2026!',
    database: 'bloodbridge_dev'
  });

  console.log('\n--- LIVE MYSQL 8.0.46 SPATIAL QUERIES TEST (X=lon, Y=lat) ---');

  // Query 1: Validate stored coordinates and SRID in institution_branches
  const [branches]: any = await connection.query(`
    SELECT
      b.id,
      b.branch_name,
      b.area,
      b.latitude,
      b.longitude,
      ST_AsText(b.location_point) AS point_wkt,
      ST_SRID(b.location_point) AS srid,
      ST_X(b.location_point) AS mysql_x_lon,
      ST_Y(b.location_point) AS mysql_y_lat
    FROM institution_branches b
    ORDER BY b.id ASC;
  `);

  console.log('Branches in MySQL:');
  for (const b of branches) {
    console.log(`ID ${b.id}: ${b.branch_name} (${b.area})`);
    console.log(`  Stored (Lat, Lon): (${b.latitude}, ${b.longitude})`);
    console.log(`  Point WKT: ${b.point_wkt} | SRID: ${b.srid}`);
    console.log(`  MySQL ST_X() [Lon]: ${b.mysql_x_lon} | ST_Y() [Lat]: ${b.mysql_y_lat}`);
  }

  // Query 2: Real ST_Distance_Sphere from Kolathur (lat: 13.1235, lon: 80.2089)
  const kolathurLat = 13.1235;
  const kolathurLon = 80.2089;

  const [distances]: any = await connection.query(`
    SELECT
      b.branch_name,
      b.area,
      ROUND(
        ST_Distance_Sphere(
          b.location_point,
          ST_SRID(POINT(?, ?), 4326)
        ) / 1000, 2
      ) AS distance_km
    FROM institution_branches b
    ORDER BY distance_km ASC;
  `, [kolathurLon, kolathurLat]); // X = lon, Y = lat

  console.log(`\nLive MySQL ST_Distance_Sphere() Results from Kolathur (Lat: ${kolathurLat}, Lon: ${kolathurLon}):`);
  console.table(distances);

  await connection.end();
}

testSpatial().catch((err) => {
  console.error('Spatial test error:', err.message);
  process.exit(1);
});

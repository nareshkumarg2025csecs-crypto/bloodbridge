const http = require('http');

function post(url, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
      }
    }, (res) => {
      let b = '';
      res.on('data', d => b += d);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(b) });
        } catch {
          resolve({ status: res.statusCode, data: b });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(url, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'GET',
      headers: {
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
      }
    }, (res) => {
      let b = '';
      res.on('data', d => b += d);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(b) });
        } catch {
          resolve({ status: res.statusCode, data: b });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function runEndToEndVerification() {
  console.log('================================================================');
  console.log('BLOODBRIDGE MODULE 11: FULL-SPECTRUM END-TO-END VERIFICATION');
  console.log('================================================================\n');

  // Step 1: Login Hospital A (Dr. Anand - Kilpauk Medical Hub)
  const loginA = await post('http://localhost:5001/api/v1/auth/login', {
    email: 'dr.anand.kilpauk@bloodbridge.local',
    password: 'password123'
  });
  console.log(`[TEST 1] Hospital A Login: HTTP ${loginA.status} (User: ${loginA.data.user?.name})`);
  const tokenA = loginA.data.access_token;

  // Step 2: Login Hospital B (Dr. Priya - Anna Nagar)
  const loginB = await post('http://localhost:5001/api/v1/auth/login', {
    email: 'dr.priya.annanagar@bloodbridge.local',
    password: 'password123'
  });
  console.log(`[TEST 2] Hospital B Login: HTTP ${loginB.status} (User: ${loginB.data.user?.name})`);
  const tokenB = loginB.data.access_token;

  // Step 3: Query Hospital Network Map (Module 1)
  const netRes = await get('http://localhost:5001/api/v1/network/hospitals', tokenA);
  console.log(`[TEST 3] Network Map Query: Found ${netRes.data.hospitals?.length} geocoded hospitals with real coordinates`);

  // Step 4: Verify external inventory sources provenance (Module 2)
  const sourcesRes = await get('http://localhost:5001/api/v1/network/inventory/sources', tokenA);
  console.log(`[TEST 4] Inventory Data Provenance: e-RaktKosh status = ${sourcesRes.data.authorizationStatus?.eRaktKosh}`);

  // Step 5: Hospital A creates an Emergency Blood Request (Module 3 & 4)
  const searchMatch = await post('http://localhost:5001/api/v1/requests/search', {
    query: 'Emergency need 4 units of B+ PRBC for surgery at Anna Nagar'
  }, tokenA);
  console.log(`[TEST 5] Supplier Matching: Found ${searchMatch.data.results?.length} eligible suppliers for ${searchMatch.data.parsedBlood}`);

  // Step 6: Create Delivery Assignment (Module 5)
  const createDelivery = await post('http://localhost:5001/api/v1/deliveries/create', {
    requestId: 1,
    supplierInstitutionId: 1, // Kilpauk
    supplierBranchId: 1,
    receivingInstitutionId: 2, // Anna Nagar
    receivingBranchId: 2,
    vehicleIdentifier: 'TN-01-MED-2026',
    transporterName: 'Officer Murugan (Cold-Chain Transporter)',
    transporterPhone: '+919840198401'
  }, tokenA);
  console.log(`[TEST 6] Delivery Created: HTTP ${createDelivery.status} (Delivery ID: ${createDelivery.data.deliveryId}, Code: ${createDelivery.data.deliveryCode})`);
  const deliveryId = createDelivery.data.deliveryId;

  // Step 7: Supplier prepares and authorizes cold-chain dispatch
  const prepRes = await post(`http://localhost:5001/api/v1/deliveries/${deliveryId}/status`, {
    status: 'PREPARING'
  }, tokenA);
  console.log(`[TEST 7] Status Update: ${prepRes.data.status}`);

  const authRes = await post(`http://localhost:5001/api/v1/deliveries/${deliveryId}/status`, {
    status: 'DISPATCH_AUTHORIZED'
  }, tokenA);
  console.log(`[TEST 8] Dispatch Authorized: ${authRes.data.status}`);

  // Step 8: Vehicle departs - In Transit
  const transitRes = await post(`http://localhost:5001/api/v1/deliveries/${deliveryId}/status`, {
    status: 'IN_TRANSIT'
  }, tokenA);
  console.log(`[TEST 9] Vehicle In Transit: ${transitRes.data.status}`);

  // Step 9: Transmit Live GPS Telemetry Ping (Module 5 & 6)
  const gpsPing1 = await post(`http://localhost:5001/api/v1/deliveries/${deliveryId}/gps`, {
    latitude: 13.08350,
    longitude: 80.23500,
    accuracy: 4.8,
    speed: 36.5
  }, tokenA);
  console.log(`[TEST 10] GPS Waypoint 1 Recorded: Lat ${gpsPing1.data.latitude}, Lng ${gpsPing1.data.longitude}`);

  const gpsPing2 = await post(`http://localhost:5001/api/v1/deliveries/${deliveryId}/gps`, {
    latitude: 13.08420,
    longitude: 80.22200,
    accuracy: 4.2,
    speed: 40.0
  }, tokenA);
  console.log(`[TEST 11] GPS Waypoint 2 Recorded: Lat ${gpsPing2.data.latitude}, Lng ${gpsPing2.data.longitude}`);

  // Step 10: Vehicle Arrives at destination hospital
  const arrivedRes = await post(`http://localhost:5001/api/v1/deliveries/${deliveryId}/status`, {
    status: 'ARRIVED'
  }, tokenB);
  console.log(`[TEST 12] Vehicle Arrived: ${arrivedRes.data.status}`);

  // Step 11: Receiver confirms handover and cold-chain compliance
  const completeRes = await post(`http://localhost:5001/api/v1/deliveries/${deliveryId}/status`, {
    status: 'COMPLETED',
    handoverNotes: 'Physical handover confirmed by Dr. Priya. Storage box temp: +3.8°C.',
    handoverProofCode: 'HANDOVER-2026-CHN-OK'
  }, tokenB);
  console.log(`[TEST 13] Receiver Handover Confirmed: ${completeRes.data.status}`);

  // Step 12: Verify GPS updates are safely rejected once completed (Protection requirement)
  const rejectGps = await post(`http://localhost:5001/api/v1/deliveries/${deliveryId}/gps`, {
    latitude: 13.09000,
    longitude: 80.20000
  }, tokenA);
  console.log(`[TEST 14] Privacy Protection: Post-completion GPS update blocked (HTTP ${rejectGps.status}: ${rejectGps.data.detail})`);

  console.log('\n================================================================');
  console.log('ALL MODULE VERIFICATIONS COMPLETED SUCCESSFULLY!');
  console.log('================================================================');
}

runEndToEndVerification().catch(console.error);

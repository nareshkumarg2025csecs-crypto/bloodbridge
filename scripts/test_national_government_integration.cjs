const puppeteer = require('puppeteer-core');
const http = require('http');

function get(url, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
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

function post(url, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body || {});
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

async function verifyNationalGovernmentIntegration() {
  console.log('================================================================');
  console.log('BLOODBRIDGE VERIFICATION: NATIONAL GOVERNMENT DATA INTEGRATION');
  console.log('================================================================\n');

  // Step 1: Login
  console.log('[TEST 1] Logging in as Authorized Medical Officer (Dr. Anand)...');
  const login = await post('http://localhost:5001/api/v1/auth/login', {
    email: 'dr.anand.kilpauk@bloodbridge.local',
    password: 'password123'
  });
  if (login.status !== 200) throw new Error('Login failed: ' + JSON.stringify(login.data));
  const token = login.data.access_token;
  console.log(`  -> Login successful. User: ${login.data.user.name}, Institution: ${login.data.user.institution?.name}\n`);

  // Step 2: Query Chennai Facilities
  console.log('[TEST 2] Querying Chennai Metropolitan Health Facilities...');
  const chnRes = await get('http://localhost:5001/api/v1/government/facilities?scope=chennai', token);
  console.log(`  -> Found ${chnRes.data.facilities.length} healthcare facilities in Chennai.`);
  const chnBloodBanks = chnRes.data.facilities.filter(f => f.hasBloodBank);
  console.log(`  -> Licensed blood banks in Chennai: ${chnBloodBanks.length}`);
  if (chnRes.data.facilities.length < 10) throw new Error('TEST 2 Failed: Incomplete Chennai facility discovery');
  console.log('  -> TEST 2 PASSED.\n');

  // Step 3: Query Tamil Nadu Statewide Facilities
  console.log('[TEST 3] Querying All Tamil Nadu Statewide Facilities (Coimbatore, Vellore, Chennai)...');
  const tnRes = await get('http://localhost:5001/api/v1/government/facilities?scope=tamilnadu', token);
  console.log(`  -> Found ${tnRes.data.facilities.length} facilities across Tamil Nadu.`);
  const hasVellore = tnRes.data.facilities.some(f => f.district === 'Vellore');
  const hasCbe = tnRes.data.facilities.some(f => f.district === 'Coimbatore');
  console.log(`  -> Includes Vellore (CMC): ${hasVellore}`);
  console.log(`  -> Includes Coimbatore (CMCH): ${hasCbe}`);
  if (!hasVellore || !hasCbe) throw new Error('TEST 3 Failed: Statewide expansion missing');
  console.log('  -> TEST 3 PASSED.\n');

  // Step 4: Query National Capital / All India
  console.log('[TEST 4] Querying National Indian Healthcare Scope (Delhi, Tamil Nadu, etc.)...');
  const nationalRes = await get('http://localhost:5001/api/v1/government/facilities?scope=national', token);
  console.log(`  -> Total National Health Facilities: ${nationalRes.data.facilities.length}`);
  const hasAiims = nationalRes.data.facilities.some(f => f.facilityCode.includes('DEL') || f.name.includes('AIIMS'));
  console.log(`  -> Includes AIIMS New Delhi Apex Centre: ${hasAiims}`);
  if (!hasAiims) throw new Error('TEST 4 Failed: National facilities missing');
  console.log('  -> TEST 4 PASSED.\n');

  // Step 5: Verify Transfusion Stock Attribution & Freshness
  console.log('[TEST 5] Verifying Blood Stock Provenance & Freshness Status...');
  const facWithStock = nationalRes.data.facilities.find(f => f.stock && f.stock.length > 0);
  console.log(`  -> Verified stock for: ${facWithStock.name}`);
  console.log(`  -> Stock items count: ${facWithStock.stock.length}`);
  console.log(`  -> Sample item: ${facWithStock.stock[0].units} units of ${facWithStock.stock[0].bloodGroup} (${facWithStock.stock[0].componentName})`);
  console.log(`  -> Freshness label: ${facWithStock.stock[0].freshness}`);
  console.log(`  -> Provenance source: ${facWithStock.stock[0].provenance}`);
  if (!facWithStock.stock[0].freshness || !facWithStock.stock[0].provenance) throw new Error('TEST 5 Failed: Stock provenance missing');
  console.log('  -> TEST 5 PASSED.\n');

  // Step 6: Verify Government Data Integrations Registry Endpoint
  console.log('[TEST 6] Querying Government Integrations Registry & Status Dashboard API...');
  const integRes = await get('http://localhost:5001/api/v1/government/integrations', token);
  console.log(`  -> Sources configured: ${integRes.data.sources.length}`);
  integRes.data.sources.forEach(s => {
    console.log(`     • ${s.source_key}: Status = ${s.connection_status}`);
  });
  console.log(`  -> Recent sync logs count: ${integRes.data.recentSyncLogs.length}`);
  console.log('  -> TEST 6 PASSED.\n');

  // Step 7: Live Browser UI Automation
  console.log('[TEST 7] Launching browser to verify National Live Network & Data Integrations UI...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.type('input[type="email"]', 'dr.anand.kilpauk@bloodbridge.local');
  await page.type('input[type="password"]', 'password123');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
    page.click('button[type="submit"]')
  ]);

  // Navigate to National Live Network Map
  await page.goto('http://localhost:5173/national-network', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  const mapText = await page.evaluate(() => document.body.innerText);
  const hasNationalTitle = mapText.includes('National Live Hospital & Blood Bank Network');
  const hasScopeToggles = mapText.includes('Chennai Hub') && mapText.includes('All Tamil Nadu') && mapText.includes('Entire India');
  console.log(`  -> National Live Network Page rendered: ${hasNationalTitle}`);
  console.log(`  -> Scope toggle buttons present: ${hasScopeToggles}`);
  if (!hasNationalTitle || !hasScopeToggles) throw new Error('TEST 7 Failed: National Network UI error');

  // Navigate to Data Integrations Dashboard
  await page.goto('http://localhost:5173/data-integrations', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  const integText = await page.evaluate(() => document.body.innerText);
  const hasIntegTitle = integText.includes('Government Health Data Integrations');
  const hasEraktkosh = integText.includes('e-RaktKosh National Portal');
  const hasAbdm = integText.includes('Ayushman Bharat Digital Mission');
  console.log(`  -> Integrations Dashboard rendered: ${hasIntegTitle}`);
  console.log(`  -> Lists e-RaktKosh: ${hasEraktkosh}`);
  console.log(`  -> Lists ABDM HFR: ${hasAbdm}`);
  if (!hasIntegTitle || !hasEraktkosh || !hasAbdm) throw new Error('TEST 7 Failed: Integrations UI error');
  console.log('  -> TEST 7 PASSED.\n');

  await browser.close();

  console.log('================================================================');
  console.log('ALL NATIONAL INTEGRATION VERIFICATION TESTS PASSED (100%)');
  console.log('================================================================');
}

verifyNationalGovernmentIntegration().catch((err) => {
  console.error('\n❌ INTEGRATION TEST FAILED:', err.message);
  process.exit(1);
});

const puppeteer = require('puppeteer-core');

const ACCOUNTS = {
  anand: {
    email: 'dr.anand.kilpauk@bloodbridge.local',
    password: 'password123',
    expectedName: 'Dr. Anand Krishnan',
    expectedInst: 'Kilpauk',
    expectedRole: 'BLOOD_BANK_OFFICER'
  },
  priya: {
    email: 'dr.priya.annanagar@bloodbridge.local',
    password: 'password123',
    expectedName: 'Dr. Priya Venkatesh',
    expectedInst: 'Anna Nagar',
    expectedRole: 'HOSPITAL_OFFICER'
  },
  karthik: {
    email: 'dr.karthik.adyar@bloodbridge.local',
    password: 'password123',
    expectedName: 'Dr. Karthik Subramanian',
    expectedInst: 'Adyar',
    expectedRole: 'PATHOLOGIST_VERIFIER'
  },
  swetha: {
    email: 'dr.swetha.tambaram@bloodbridge.local',
    password: 'password123',
    expectedName: 'Dr. Swetha Ramesh',
    expectedInst: 'Tambaram',
    expectedRole: 'BLOOD_BANK_OFFICER'
  },
  admin: {
    email: 'admin.chennai@bloodbridge.local',
    password: 'password123',
    expectedName: 'Dr. Sundaram Rajagopal',
    expectedInst: 'Kilpauk',
    expectedRole: 'SUPER_ADMIN'
  }
};

async function testAuthAndChatFlows() {
  console.log('================================================================');
  console.log('BLOODBRIDGE VERIFICATION: AUTH SWITCHING & CHAT DEDUPLICATION');
  console.log('================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Helper login function
  async function performLogin(targetPage, email, password) {
    await targetPage.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    await targetPage.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await targetPage.reload({ waitUntil: 'networkidle0' });

    await targetPage.type('input[type="email"]', email);
    await targetPage.type('input[type="password"]', password);

    await Promise.all([
      targetPage.waitForNavigation({ waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {}),
      targetPage.click('button[type="submit"]')
    ]);

    await new Promise(r => setTimeout(r, 1000));
  }

  // -------------------------------------------------------------
  // TEST 1: Dr. Anand Login
  // -------------------------------------------------------------
  console.log('[TEST 1] Logging in as Dr. Anand (Kilpauk Medical Hub)...');
  await performLogin(page, ACCOUNTS.anand.email, ACCOUNTS.anand.password);

  const anandHomeText = await page.evaluate(() => document.body.innerText);
  const anandHasKilpauk = anandHomeText.includes('Kilpauk') || anandHomeText.includes('Dr. Anand');
  const anandHasNoRajalakshmi = !anandHomeText.includes('Rajalakshmi');
  console.log(`  -> Displays Dr. Anand / Kilpauk: ${anandHasKilpauk}`);
  console.log(`  -> Zero Rajalakshmi residue: ${anandHasNoRajalakshmi}`);
  if (!anandHasKilpauk || !anandHasNoRajalakshmi) throw new Error('TEST 1 Failed: Dr. Anand identity error');
  console.log('  -> TEST 1 PASSED.\n');

  // -------------------------------------------------------------
  // TEST 2: Logout and Login as Dr. Priya (Anna Nagar)
  // -------------------------------------------------------------
  console.log('[TEST 2] Logging out and logging in as Dr. Priya (Anna Nagar)...');
  await performLogin(page, ACCOUNTS.priya.email, ACCOUNTS.priya.password);

  const priyaHomeText = await page.evaluate(() => document.body.innerText);
  const priyaHasAnnaNagar = priyaHomeText.includes('Anna Nagar') || priyaHomeText.includes('Dr. Priya');
  const priyaHasNoRajalakshmi = !priyaHomeText.includes('Rajalakshmi');
  console.log(`  -> Displays Dr. Priya / Anna Nagar: ${priyaHasAnnaNagar}`);
  console.log(`  -> Zero Rajalakshmi residue: ${priyaHasNoRajalakshmi}`);
  if (!priyaHasAnnaNagar || !priyaHasNoRajalakshmi) throw new Error('TEST 2 Failed: Dr. Priya identity error');
  console.log('  -> TEST 2 PASSED.\n');

  // -------------------------------------------------------------
  // TEST 3: Logout and Login as Dr. Karthik (Pathologist Verifier - Adyar)
  // -------------------------------------------------------------
  console.log('[TEST 3] Logging out and logging in as Dr. Karthik (Adyar)...');
  await performLogin(page, ACCOUNTS.karthik.email, ACCOUNTS.karthik.password);

  const karthikHomeText = await page.evaluate(() => document.body.innerText);
  const karthikHasAdyar = karthikHomeText.includes('Adyar') || karthikHomeText.includes('Dr. Karthik');
  const karthikHasNoRajalakshmi = !karthikHomeText.includes('Rajalakshmi');
  console.log(`  -> Displays Dr. Karthik / Adyar: ${karthikHasAdyar}`);
  console.log(`  -> Zero Rajalakshmi residue: ${karthikHasNoRajalakshmi}`);
  if (!karthikHasAdyar || !karthikHasNoRajalakshmi) throw new Error('TEST 3 Failed: Dr. Karthik identity error');
  console.log('  -> TEST 3 PASSED.\n');

  // -------------------------------------------------------------
  // TEST 4 & 5: Two Separate Sessions & Message Deduplication
  // -------------------------------------------------------------
  console.log('[TEST 4] Opening two independent browser contexts (Dr. Anand & Dr. Priya)...');
  const contextA = await browser.createBrowserContext();
  const pageA = await contextA.newPage();
  await pageA.setViewport({ width: 1280, height: 800 });

  const contextB = await browser.createBrowserContext();
  const pageB = await contextB.newPage();
  await pageB.setViewport({ width: 1280, height: 800 });

  // Session A: Dr. Anand
  await performLogin(pageA, ACCOUNTS.anand.email, ACCOUNTS.anand.password);
  await pageA.goto('http://localhost:5173/chat', { waitUntil: 'networkidle0' });

  // Session B: Dr. Priya
  await performLogin(pageB, ACCOUNTS.priya.email, ACCOUNTS.priya.password);
  await pageB.goto('http://localhost:5173/chat', { waitUntil: 'networkidle0' });

  const testMessageText = `Audit verification ping at ${Date.now()}`;
  console.log(`  -> Sending message from Dr. Anand to channel: "${testMessageText}"`);

  await pageA.type('input[placeholder="Type a message..."]', testMessageText);
  await pageA.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 2000));

  // Count occurrences on Dr. Anand's screen
  const countInA = await pageA.evaluate((text) => {
    return Array.from(document.querySelectorAll('p')).filter(p => p.innerText.includes(text)).length;
  }, testMessageText);
  console.log(`  -> Dr. Anand (Sender) screen occurrences: ${countInA} (Expected: 1)`);

  // Refresh Dr. Priya's chat to inspect fetched messages
  await pageB.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  const countInB = await pageB.evaluate((text) => {
    return Array.from(document.querySelectorAll('p')).filter(p => p.innerText.includes(text)).length;
  }, testMessageText);
  console.log(`  -> Dr. Priya (Receiver) screen occurrences: ${countInB} (Expected: 1)`);

  if (countInA !== 1 || countInB !== 1) {
    throw new Error(`TEST 4 Failed: Message duplicated! Sender count: ${countInA}, Receiver count: ${countInB}`);
  }
  console.log('  -> TEST 4 PASSED: Message appears exactly once on both sides without duplication.\n');

  // -------------------------------------------------------------
  // TEST 5: Reply from Dr. Priya
  // -------------------------------------------------------------
  console.log('[TEST 5] Sending reply from Dr. Priya to Dr. Anand...');
  const replyMessageText = `Acknowledgment reply at ${Date.now()}`;
  await pageB.type('input[placeholder="Type a message..."]', replyMessageText);
  await pageB.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 2000));

  await pageA.reload({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));

  const replyCountA = await pageA.evaluate((text) => {
    return Array.from(document.querySelectorAll('p')).filter(p => p.innerText.includes(text)).length;
  }, replyMessageText);
  const replyCountB = await pageB.evaluate((text) => {
    return Array.from(document.querySelectorAll('p')).filter(p => p.innerText.includes(text)).length;
  }, replyMessageText);

  console.log(`  -> Reply count in Receiver (A): ${replyCountA} (Expected: 1)`);
  console.log(`  -> Reply count in Sender (B): ${replyCountB} (Expected: 1)`);

  if (replyCountA !== 1 || replyCountB !== 1) {
    throw new Error(`TEST 5 Failed: Reply duplicated! Count A: ${replyCountA}, Count B: ${replyCountB}`);
  }
  console.log('  -> TEST 5 PASSED: Reply appears exactly once on both sides.\n');

  // -------------------------------------------------------------
  // TEST 6: Dr. Swetha isolation test
  // -------------------------------------------------------------
  console.log('[TEST 6] Logging in as Dr. Swetha (Tambaram) in clean session...');
  const contextC = await browser.createBrowserContext();
  const pageC = await contextC.newPage();
  await performLogin(pageC, ACCOUNTS.swetha.email, ACCOUNTS.swetha.password);

  const swethaHomeText = await pageC.evaluate(() => document.body.innerText);
  const swethaHasTambaram = swethaHomeText.includes('Tambaram') || swethaHomeText.includes('Dr. Swetha');
  const swethaHasNoPrevious = !swethaHomeText.includes('Anand') && !swethaHomeText.includes('Priya') && !swethaHomeText.includes('Rajalakshmi');
  console.log(`  -> Displays Dr. Swetha / Tambaram: ${swethaHasTambaram}`);
  console.log(`  -> Zero leakage from previous accounts: ${swethaHasNoPrevious}`);

  if (!swethaHasTambaram || !swethaHasNoPrevious) {
    throw new Error('TEST 6 Failed: Dr. Swetha session isolation error');
  }
  console.log('  -> TEST 6 PASSED: Session perfectly isolated.\n');

  await browser.close();
  console.log('================================================================');
  console.log('ALL VERIFICATION TESTS COMPLETED WITH 100% PASS RATE');
  console.log('================================================================');
}

testAuthAndChatFlows().catch((err) => {
  console.error('\n❌ VERIFICATION TEST FAILED:', err.message);
  process.exit(1);
});

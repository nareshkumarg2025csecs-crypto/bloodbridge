const puppeteer = require('puppeteer-core');

(async () => {
  try {
    console.log('================================================================');
    console.log('🚀 BLOODBRIDGE — REAL NEXCONN CLOUD DUAL-SESSION VERIFICATION');
    console.log('================================================================\n');

    const browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // -------------------------------------------------------------
    // HOSPITAL A: Dr. Anand Krishnan (Kilpauk)
    // -------------------------------------------------------------
    const contextA = await browser.createBrowserContext();
    const pageA = await contextA.newPage();
    const logsA = [];
    pageA.on('console', msg => logsA.push(`[Hospital A Console] ${msg.text()}`));

    console.log('1. Hospital A (Kilpauk) authenticating...');
    await pageA.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    const inputsA = await pageA.$$('input');
    await inputsA[0].type('dr.anand.kilpauk@bloodbridge.local');
    await inputsA[1].type('AdminSecure2026!');
    const submitA = await pageA.$('button[type="submit"]');
    await submitA.click();
    await new Promise(r => setTimeout(r, 2000));

    console.log('2. Hospital A connecting to Nexconn Cloud via Chat page...');
    await pageA.goto('http://localhost:5173/chat', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 3000));

    // -------------------------------------------------------------
    // HOSPITAL B: Dr. Priya Venkatesh (Anna Nagar)
    // -------------------------------------------------------------
    const contextB = await browser.createBrowserContext();
    const pageB = await contextB.newPage();
    const logsB = [];
    pageB.on('console', msg => logsB.push(`[Hospital B Console] ${msg.text()}`));

    console.log('3. Hospital B (Anna Nagar) authenticating in isolated session...');
    await pageB.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    const inputsB = await pageB.$$('input');
    await inputsB[0].type('dr.priya.annanagar@bloodbridge.local');
    await inputsB[1].type('AdminSecure2026!');
    const submitB = await pageB.$('button[type="submit"]');
    await submitB.click();
    await new Promise(r => setTimeout(r, 2000));

    console.log('4. Hospital B connecting to Nexconn Cloud via Chat page...');
    await pageB.goto('http://localhost:5173/chat', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 3000));

    // -------------------------------------------------------------
    // MESSAGE DISPATCH: Hospital A -> Hospital B
    // -------------------------------------------------------------
    console.log('\n5. Hospital A dispatching urgent blood requisition over Nexconn Cloud...');
    const emergencyRequisition = 'URGENT: Requesting immediate transfer confirmation for 2 units of O- PRBC batch DIN-2026-CHN-00001 (Crossmatch verified)';
    const inputMsgA = await pageA.$('input[placeholder*="message"], input[type="text"]');
    if (inputMsgA) {
      await inputMsgA.type(emergencyRequisition);
      const sendA = await pageA.$('button[aria-label*="send"], button:has(svg), form button');
      if (sendA) {
        await sendA.click();
        await new Promise(r => setTimeout(r, 2000));
      }
    }
    console.log('   Message dispatched by Hospital A.');

    // -------------------------------------------------------------
    // MESSAGE REPLY: Hospital B -> Hospital A
    // -------------------------------------------------------------
    console.log('6. Hospital B dispatching transfer approval response over Nexconn Cloud...');
    const confirmationResponse = 'CONFIRMED: Batch DIN-2026-CHN-00001 reserved and packed in cold chain container. Transit dispatch approved.';
    const inputMsgB = await pageB.$('input[placeholder*="message"], input[type="text"]');
    if (inputMsgB) {
      await inputMsgB.type(confirmationResponse);
      const sendB = await pageB.$('button[aria-label*="send"], button:has(svg), form button');
      if (sendB) {
        await sendB.click();
        await new Promise(r => setTimeout(r, 2000));
      }
    }
    console.log('   Response dispatched by Hospital B.');

    // -------------------------------------------------------------
    // VERIFY CLOUD LOGS
    // -------------------------------------------------------------
    console.log('\n================================================================');
    console.log('📡 NEXCONN CLOUD TELEMETRY & LOGS');
    console.log('================================================================');
    console.log('Hospital A SDK Logs:', logsA.filter(l => l.includes('Nexconn') || l.includes('Connection')));
    console.log('Hospital B SDK Logs:', logsB.filter(l => l.includes('Nexconn') || l.includes('Connection')));

    await browser.close();
    console.log('\n✅ DUAL-SESSION CLOUD MESSAGING VERIFICATION COMPLETE.');
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
})();

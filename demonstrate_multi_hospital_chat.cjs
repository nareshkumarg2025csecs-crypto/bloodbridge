const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // -------------------------------------------------------------
    // HOSPITAL A SESSION: Dr. Anand Krishnan (Kilpauk)
    // -------------------------------------------------------------
    const contextA = await browser.createBrowserContext();
    const pageA = await contextA.newPage();
    const logsA = [];
    pageA.on('console', msg => logsA.push(`[Hospital A Console] ${msg.text()}`));

    console.log('--- HOSPITAL A LOGGING IN ---');
    await pageA.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    const inputsA = await pageA.$$('input');
    await inputsA[0].type('dr.anand.kilpauk@bloodbridge.local');
    await inputsA[1].type('AdminSecure2026!');
    const submitA = await pageA.$('button[type="submit"]');
    await submitA.click();
    await new Promise(r => setTimeout(r, 2000));
    console.log('Hospital A logged in. URL:', pageA.url());

    // Hospital A navigates to Chat
    await pageA.goto('http://localhost:5173/chat', { waitUntil: 'networkidle0' });
    console.log('Hospital A opened Chat channel:', pageA.url());
    const chatInputA = await pageA.$('input[placeholder*="message"], input[type="text"]');
    if (chatInputA) {
      await chatInputA.type('URGENT: Requesting immediate confirmation for 2 units of O- Negative PRBC batch DIN-2026-CHN-00001');
      const sendBtnA = await pageA.$('button[aria-label*="send"], button:has(svg), form button');
      if (sendBtnA) {
        await sendBtnA.click();
        await new Promise(r => setTimeout(r, 1500));
      }
    }
    console.log('Hospital A sent emergency blood coordination message.');

    // -------------------------------------------------------------
    // HOSPITAL B SESSION: Dr. Priya Venkatesh (Anna Nagar)
    // -------------------------------------------------------------
    const contextB = await browser.createBrowserContext();
    const pageB = await contextB.newPage();
    const logsB = [];
    pageB.on('console', msg => logsB.push(`[Hospital B Console] ${msg.text()}`));

    console.log('--- HOSPITAL B LOGGING IN ---');
    await pageB.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    const inputsB = await pageB.$$('input');
    await inputsB[0].type('dr.priya.annanagar@bloodbridge.local');
    await inputsB[1].type('AdminSecure2026!');
    const submitB = await pageB.$('button[type="submit"]');
    await submitB.click();
    await new Promise(r => setTimeout(r, 2000));
    console.log('Hospital B logged in. URL:', pageB.url());

    // Hospital B navigates to Chat
    await pageB.goto('http://localhost:5173/chat', { waitUntil: 'networkidle0' });
    console.log('Hospital B opened Chat channel:', pageB.url());

    // Hospital B verifies message or sends acknowledgment
    const chatInputB = await pageB.$('input[placeholder*="message"], input[type="text"]');
    if (chatInputB) {
      await chatInputB.type('CONFIRMED: Batch reserved and packed in cold chain container. Transit dispatch approved.');
      const sendBtnB = await pageB.$('button[aria-label*="send"], button:has(svg), form button');
      if (sendBtnB) {
        await sendBtnB.click();
        await new Promise(r => setTimeout(r, 1500));
      }
    }
    console.log('Hospital B dispatched confirmation response.');

    // Print captured Nexconn SDK logs
    console.log('\n--- CAPTURED SDK CLIENT LOGS ---');
    console.log('Hospital A SDK logs:', logsA.filter(l => l.includes('Nexconn')));
    console.log('Hospital B SDK logs:', logsB.filter(l => l.includes('Nexconn')));

    await browser.close();
    console.log('\nDEMONSTRATION WORKFLOW COMPLETED CLEANLY.');
  } catch (err) {
    console.error('Multi-hospital demo error:', err);
    process.exit(1);
  }
})();

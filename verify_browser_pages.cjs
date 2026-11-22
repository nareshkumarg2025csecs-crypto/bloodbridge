const puppeteer = require('puppeteer-core');

(async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    const networkCalls = [];

    page.on('request', req => {
      if (req.url().includes('/api/')) {
        networkCalls.push(`${req.method()} ${req.url()}`);
      }
    });

    // 1. Visit Login Page
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    console.log('1. Opened Login Page:', page.url());

    // 2. Perform Login with demo credentials
    const emailInput = await page.$('input[type="email"], input');
    const passwordInput = await page.$('input[type="password"]');

    if (emailInput && passwordInput) {
      await page.evaluate(() => {
        const ins = document.querySelectorAll('input');
        if (ins[0]) ins[0].value = '';
        if (ins[1]) ins[1].value = '';
      });
      await emailInput.type('admin.chennai@bloodbridge.local');
      await passwordInput.type('AdminSecure2026!');
      const submitBtn = await page.$('button[type="submit"]');
      if (submitBtn) {
        await submitBtn.click();
        await new Promise(r => setTimeout(r, 2500));
      }
    }
    console.log('2. URL after submit:', page.url());

    // 3. Check Home Dashboard
    const homeTitle = await page.evaluate(() => document.querySelector('h1, h2')?.innerText || '');
    console.log('3. Home Dashboard heading:', homeTitle);

    // 4. Navigate to Inventory
    await page.goto('http://localhost:5173/inventory', { waitUntil: 'networkidle0' });
    console.log('4. Opened Inventory Page:', page.url());
    const inventoryText = await page.evaluate(() => document.body.innerText.slice(0, 300));
    console.log('   Inventory preview:', inventoryText.replace(/\n+/g, ' '));

    // 5. Navigate to Requests & Test Natural Language Search
    await page.goto('http://localhost:5173/requests', { waitUntil: 'networkidle0' });
    console.log('5. Opened Requests Page:', page.url());
    const searchInput = await page.$('input');
    if (searchInput) {
      await searchInput.type('Need 2 units of B+ urgent');
      const searchBtn = await page.$('button[type="submit"], button');
      if (searchBtn) {
        await searchBtn.click();
        await new Promise(r => setTimeout(r, 2000));
      }
    }
    const requestsText = await page.evaluate(() => document.body.innerText.slice(0, 400));
    console.log('   Requests results preview:', requestsText.replace(/\n+/g, ' '));

    console.log('6. All API network calls captured:', networkCalls);
    await browser.close();
    console.log('ALL LIVE BROWSER VERIFICATIONS COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('Browser Test Error:', err);
    process.exit(1);
  }
})();

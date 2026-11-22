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
    const responses = [];

    page.on('request', req => {
      if (req.url().includes('/api/')) {
        networkCalls.push(`${req.method()} ${req.url()}`);
      }
    });

    page.on('response', async res => {
      if (res.url().includes('/api/')) {
        let text = '';
        try { text = await res.text(); } catch {}
        responses.push(`${res.status()} ${res.url()}: ${text.slice(0, 100)}`);
      }
    });

    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    console.log('Initial page URL:', page.url());

    const emailInput = await page.$('input[type="email"], input[name="email"], input');
    const passwordInput = await page.$('input[type="password"]');

    if (emailInput && passwordInput) {
      await emailInput.type('admin.chennai@bloodbridge.local');
      await passwordInput.type('AdminSecure2026!');
      const submitBtn = await page.$('button[type="submit"]');
      if (submitBtn) {
        await submitBtn.click();
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    console.log('Post-login page URL:', page.url());
    console.log('Captured network API calls:', networkCalls);
    console.log('Captured responses:', responses);

    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('Dashboard / Page text snippet:\n', bodyText.slice(0, 400));

    await browser.close();
  } catch (err) {
    console.error('Browser Test Error:', err);
    process.exit(1);
  }
})();

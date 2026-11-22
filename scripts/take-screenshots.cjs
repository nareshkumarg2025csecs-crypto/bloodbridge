const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\Nareshkumar G\\.gemini\\antigravity\\brain\\76fdbb0a-4231-46ef-a64c-a80de73db095';

async function main() {
  if (!fs.existsSync(ARTIFACT_DIR)) {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();

  console.log('1. Capturing Login (1440x900)...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'login_screenshot.png') });

  // Set fake auth session in localStorage
  await page.evaluate(() => {
    localStorage.setItem(
      'bloodbridge_auth_session',
      JSON.stringify({
        email: 'rajalakshmi@bloodbridge.in',
        name: 'Rajalakshmi Hospital',
        token: 'test_token',
      })
    );
  });

  console.log('2. Capturing Home (1440x900)...');
  await page.goto('http://localhost:5173/home', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'home_screenshot.png') });

  console.log('3. Capturing Inventory (1440x900)...');
  await page.goto('http://localhost:5173/inventory', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'inventory_screenshot.png') });

  console.log('4. Capturing Requests with Results (1440x900)...');
  await page.goto('http://localhost:5173/requests', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 400));
  // Click search button to trigger ranked results
  await page.click('button[type="submit"]');
  await new Promise((r) => setTimeout(r, 1400)); // wait for 1-sec loader
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'requests_screenshot.png') });

  console.log('5. Capturing Live Chat (1440x900)...');
  await page.goto('http://localhost:5173/chat', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'chat_screenshot.png') });

  console.log('6. Capturing Expiry Alerts (1440x900)...');
  await page.goto('http://localhost:5173/alerts', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'alerts_screenshot.png') });

  console.log('7. Capturing Profile Settings (1440x900)...');
  await page.goto('http://localhost:5173/profile', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'profile_screenshot.png') });

  // Responsive Viewports
  console.log('8. Capturing Tablet 1024px...');
  await page.setViewport({ width: 1024, height: 768 });
  await page.goto('http://localhost:5173/home', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'responsive_tablet_1024.png') });

  console.log('9. Capturing Mobile 390px (iPhone 14)...');
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:5173/home', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'responsive_mobile_390.png') });

  await browser.close();
  console.log('All verification screenshots captured successfully!');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});

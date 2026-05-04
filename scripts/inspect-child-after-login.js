const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

async function run() {
  const base = process.env.BASE_URL || 'http://localhost:3000';
  // Open the child game page (if not authenticated, the app may redirect to /login)
  const loginUrl = new URL('/game', base).toString();

  console.log('Launching headed Chromium...');
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('console>', msg.text()));
  page.on('request', req => console.log('REQ>', req.method(), req.url()));
  page.on('response', res => console.log('RES>', res.status(), res.url()));

  console.log('Navigating to', loginUrl);
  await page.goto(loginUrl, { waitUntil: 'domcontentloaded' });

  // Fill in credentials (from tests/credentials.ts)
  const email = 'bart@simpson.com';
  const password = 'g:~j)JbaA+oLTTet=di1';

  if (await page.locator('input[type="email"]').count()) {
    await page.fill('input[type="email"]', email).catch(() => null);
  }
  if (await page.locator('input[type="password"]').count()) {
    await page.fill('input[type="password"]', password).catch(() => null);
  }

  // Click submit using common selectors
  const submitSelectors = ['button[type="submit"]', 'button:has-text("Submit")', 'button.btn-gold', 'button:has-text("Enter the Number Wilds")', 'button:has-text("Start")'];
  for (const sel of submitSelectors) {
    if (await page.locator(sel).count()) {
      console.log('Clicking', sel);
      await page.click(sel).catch(() => null);
      break;
    }
  }

  // Wait up to 20s for a post-login indicator
  try {
    await page.waitForSelector('.game-canvas, .app-shell, nav, [data-testid="app-root"], .problem-card', { timeout: 20000 });
    console.log('Post-login UI appeared');
  } catch (e) {
    console.log('Post-login UI did not appear within timeout');
  }

  // Ensure test-results dir
  const outDir = path.resolve(__dirname, '..', 'test-results');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const screenshotPath = path.join(outDir, 'child-after-login.png');
  await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => null);
  console.log('Saved screenshot to', screenshotPath);

  // Save cookies
  const cookies = await context.cookies();
  fs.writeFileSync(path.join(outDir, 'child-cookies.json'), JSON.stringify(cookies, null, 2));
  console.log('Saved cookies to test-results/child-cookies.json');

  // Save localStorage and sessionStorage
  const localStorage = await page.evaluate(() => JSON.stringify(window.localStorage));
  const sessionStorage = await page.evaluate(() => JSON.stringify(window.sessionStorage));
  fs.writeFileSync(path.join(outDir, 'child-localStorage.json'), localStorage);
  fs.writeFileSync(path.join(outDir, 'child-sessionStorage.json'), sessionStorage);
  console.log('Saved storage snapshots to test-results/');

  console.log('\nBrowser is left open for manual inspection. When you are done, close the browser window to end this script.');

  // Keep process alive until browser is closed
  await new Promise(resolve => browser.on('disconnected', resolve));
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

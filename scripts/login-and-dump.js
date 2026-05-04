const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const base = process.env.BASE_URL || 'http://localhost:3000';
  const loginUrl = new URL('/login', base).toString();
  const child = { email: 'bart@simpson.com', password: 'g:~j)JbaA+oLTTet=di1' };
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    console.log('On login page:', page.url());
    // fill credentials
    if (await page.locator('input[type="email"]').count()) await page.fill('input[type="email"]', child.email);
    if (await page.locator('input[type="password"]').count()) await page.fill('input[type="password"]', child.password);

    // click the submit button (prefer the visible type=submit button)
    if (await page.locator('button[type="submit"]').count()) {
      console.log('Clicking button[type="submit"]');
      await page.locator('button[type="submit"]').first().click();
    } else if (await page.locator('button.btn-gold').count()) {
      console.log('Clicking .btn-gold');
      await page.locator('button.btn-gold').first().click();
    } else {
      console.log('No submit button found');
    }

    // wait a bit for navigation or UI update
    await page.waitForTimeout(3000);

    const url = page.url();
    console.log('After click URL:', url);

    // check for likely game elements
    const checks = {};
    const selectors = ['.problem-card', '.question-card', '[data-testid="problem-card"]', '.app-shell', 'nav', '#root', '.game-canvas', '.coin-balance', '[data-testid="coin-balance"]'];
    for (const s of selectors) {
      checks[s] = !!(await page.locator(s).count());
    }

    console.log('Selector checks:', JSON.stringify(checks, null, 2));
    // save screenshot
    const screenshotPath = 'test-results/login-after.png';
    try { fs.mkdirSync('test-results', { recursive: true }); } catch (e) {}
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('Saved screenshot to', screenshotPath);
  } catch (err) {
    console.error('ERROR', err);
  } finally {
    await browser.close();
  }
})();

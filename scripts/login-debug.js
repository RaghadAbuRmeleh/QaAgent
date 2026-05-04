const { chromium } = require('playwright');

(async () => {
  const base = process.env.BASE_URL || 'http://localhost:3000';
  const loginUrl = new URL('/login', base).toString();
  const child = { email: 'bart@simpson.com', password: 'g:~j)JbaA+oLTTet=di1' };
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const logs = [];
  page.on('console', msg => logs.push({ type: 'console', text: msg.text(), location: msg.location() }));
  page.on('requestfailed', req => logs.push({ type: 'requestfailed', url: req.url(), failure: req.failure() }));
  page.on('response', async res => {
    try {
      const ct = res.headers()['content-type'] || '';
      const body = ct.includes('application/json') ? await res.json().catch(() => null) : null;
      logs.push({ type: 'response', url: res.url(), status: res.status(), body: body });
    } catch (e) {
      logs.push({ type: 'response', url: res.url(), status: res.status(), body: 'unreadable' });
    }
  });

  try {
    await page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    if (await page.locator('input[type="email"]').count()) await page.fill('input[type="email"]', child.email);
    if (await page.locator('input[type="password"]').count()) await page.fill('input[type="password"]', child.password);

    // submit via click or Enter
    if (await page.locator('button[type="submit"]').count()) {
      await page.locator('button[type="submit"]').first().click();
    } else if (await page.locator('button.btn-gold').count()) {
      await page.locator('button.btn-gold').first().click();
    } else {
      await page.keyboard.press('Enter');
    }

    // wait for a short while to capture network
    await page.waitForTimeout(5000);
    const url = page.url();
    console.log('After click URL:', url);
    console.log('Collected logs:');
    console.log(JSON.stringify(logs.slice(-50), null, 2));
    await page.screenshot({ path: 'test-results/login-debug.png', fullPage: true });
    console.log('Saved screenshot to test-results/login-debug.png');
  } catch (err) {
    console.error('ERROR', err);
  } finally {
    await browser.close();
  }
})();

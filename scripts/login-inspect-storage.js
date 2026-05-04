const { chromium } = require('playwright');

(async () => {
  const base = process.env.BASE_URL || 'http://localhost:3000';
  const loginUrl = new URL('/login', base).toString();
  const child = { email: 'bart@simpson.com', password: 'g:~j)JbaA+oLTTet=di1' };
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    if (await page.locator('input[type="email"]').count()) await page.fill('input[type="email"]', child.email);
    if (await page.locator('input[type="password"]').count()) await page.fill('input[type="password"]', child.password);
    if (await page.locator('button[type="submit"]').count()) {
      await page.locator('button[type="submit"]').first().click();
    } else if (await page.locator('button.btn-gold').count()) {
      await page.locator('button.btn-gold').first().click();
    } else {
      await page.keyboard.press('Enter');
    }

    // wait a bit
    await page.waitForTimeout(3000);

    const url = page.url();
    const cookies = await page.context().cookies();
    const localStorage = await page.evaluate(() => { const obj = {}; for (let i=0;i<localStorage.length;i++){ const k = localStorage.key(i); obj[k]=localStorage.getItem(k);} return obj; });
    const sessionStorage = await page.evaluate(() => { const obj = {}; for (let i=0;i<sessionStorage.length;i++){ const k = sessionStorage.key(i); obj[k]=sessionStorage.getItem(k);} return obj; });

    console.log('After click URL:', url);
    console.log('Cookies:', JSON.stringify(cookies, null, 2));
    console.log('localStorage keys:', Object.keys(localStorage));
    console.log('sessionStorage keys:', Object.keys(sessionStorage));
    // print a few well-known keys if present
    ['supabase.auth.token','authToken','token','access_token','user'].forEach(k => {
      if (localStorage[k]) console.log('localStorage['+k+']=', localStorage[k]);
      if (sessionStorage[k]) console.log('sessionStorage['+k+']=', sessionStorage[k]);
    });

    await page.screenshot({ path: 'test-results/login-storage.png', fullPage: true });
    console.log('Saved screenshot to test-results/login-storage.png');
  } catch (err) {
    console.error('ERROR', err);
  } finally {
    await browser.close();
  }
})();

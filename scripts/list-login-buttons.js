const { chromium } = require('playwright');

(async () => {
  const base = process.env.BASE_URL || 'http://localhost:3000';
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    const url = new URL('/login', base).toString();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
    const buttons = await page.evaluate(() => Array.from(document.querySelectorAll('button,input[type="submit"]')).map(b => ({ text: b.innerText ? b.innerText.trim() : b.value || '', outerHTML: b.outerHTML })));
    console.log(JSON.stringify({ url, buttons }, null, 2));
  } catch (err) {
    console.error('ERROR', err);
  } finally {
    await browser.close();
  }
})();

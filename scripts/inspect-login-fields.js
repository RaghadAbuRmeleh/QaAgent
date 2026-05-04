const { chromium } = require('playwright');

(async () => {
  const base = process.env.BASE_URL || 'http://localhost:3000';
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    const url = new URL('/login', base).toString();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
    const inputs = await page.evaluate(() => Array.from(document.querySelectorAll('input')).map(i => ({ tag: i.tagName, id: i.id, name: i.name, type: i.type, placeholder: i.placeholder, outerHTML: i.outerHTML })));
    console.log(JSON.stringify({ url, inputs }, null, 2));
  } catch (err) {
    console.error('ERROR', err);
  } finally {
    await browser.close();
  }
})();

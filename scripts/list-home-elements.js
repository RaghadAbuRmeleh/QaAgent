const { chromium } = require('playwright');

(async () => {
  const base = process.env.BASE_URL || 'http://localhost:3000';
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 10000 });
    const anchors = await page.evaluate(() => Array.from(document.querySelectorAll('a')).map(a => ({ text: a.innerText.trim(), href: a.href })));
    const buttons = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map(b => ({ text: b.innerText.trim(), type: b.type })));
    console.log('Anchors with login-like hrefs:');
    anchors.filter(a => /login|signin|auth|account|sign-in/i.test(a.href) || /login|sign in|signin|auth|sign-in/i.test(a.text)).forEach(a => console.log(JSON.stringify(a)));
    console.log('\nAll buttons:');
    buttons.forEach(b => console.log(JSON.stringify(b)));
  } catch (err) {
    console.error('ERROR', err);
  } finally {
    await browser.close();
  }
})();

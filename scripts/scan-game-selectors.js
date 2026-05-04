const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

async function loadCookies(context, cookieFile) {
  if (!fs.existsSync(cookieFile)) return false;
  const raw = fs.readFileSync(cookieFile, 'utf8');
  const cookies = JSON.parse(raw);
  const normalized = cookies.map(c => ({
    name: c.name,
    value: c.value,
    domain: c.domain || 'localhost',
    path: c.path || '/',
    httpOnly: !!c.httpOnly,
    secure: !!c.secure,
    sameSite: (c.sameSite && c.sameSite.toLowerCase && c.sameSite.toLowerCase()) || 'lax',
    expires: c.expires || Math.floor(Date.now() / 1000) + 3600,
  }));
  await context.addCookies(normalized);
  return true;
}

async function run() {
  const base = process.env.BASE_URL || 'http://localhost:3000';
  const url = new URL('/game', base).toString();
  const outDir = path.resolve(__dirname, '..', 'test-results');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const cookieFile = path.resolve(process.cwd(), 'test-results', 'child-cookies.json');
  const hadCookies = await loadCookies(context, cookieFile);
  const page = await context.newPage();
  console.log('Navigating to', url, 'with cookies:', hadCookies);
  await page.goto(url, { waitUntil: 'networkidle' });

  // Give SPA a moment
  await page.waitForTimeout(500);

  const selectorsToCheck = [
    '.problem-card', '.question-card', '[data-testid="problem-card"]', '.game-canvas', 'canvas',
    'input[type="number"]', 'input[type="text"]', 'input[aria-label="answer"]',
    'button.submit-answer', 'button[type="submit"]', 'button:has-text("Submit")',
    'button:has-text("Start")', 'button.start', 'a:has-text("Play")',
    '.coin-balance', '[data-testid="coin-balance"]', '.wallet', '#coinBalance',
    '.streak', '[data-testid="streak-count"]', '.timer', '.lives', 'nav', '.app-shell', '#root'
  ];

  const results = {};
  for (const sel of selectorsToCheck) {
    try {
      const count = await page.locator(sel).count();
      results[sel] = { count };
      if (count > 0) {
        const text = await page.locator(sel).first().innerText().catch(() => null);
        results[sel].sampleText = text;
      }
    } catch (e) {
      results[sel] = { error: String(e) };
    }
  }

  // Capture some more specific info: problem stem/flavor if present
  const problemStem = await page.locator('.problem-card .stem, .question-card .stem, .problem-stem, [data-testid="problem-stem"]').first().innerText().catch(() => null);
  const flavor = await page.locator('.problem-card .flavor, .question-card .flavor, .problem-flavor, [data-testid="problem-flavor"]').first().innerText().catch(() => null);
  results['problemStem'] = problemStem;
  results['flavorText'] = flavor;

  const screenshotPath = path.join(outDir, 'game-page-scan.png');
  await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => null);
  results['screenshot'] = screenshotPath;

  const outFile = path.join(outDir, 'game-selectors.json');
  fs.writeFileSync(outFile, JSON.stringify(results, null, 2));
  console.log('Wrote selector scan to', outFile);

  await browser.close();
}

run().catch(err => { console.error(err); process.exit(1); });

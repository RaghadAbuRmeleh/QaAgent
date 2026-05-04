const { chromium } = require('playwright');

(async () => {
  const base = process.env.BASE_URL || 'http://localhost:3000';
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const report = { base, checks: [], error: null };
  try {
    await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 10000 });
    const body = await page.content();
    const checks = [];

    // Check for common markers
    const hasSignInText = await page.locator('text=/Sign in|Sign In|Sign-in|SignIn/').count();
    const hasEmailInput = await page.locator('input[name="email"]').count();
    const hasPasswordInput = await page.locator('input[name="password"]').count();
    const hasLoginRouteLink = await page.locator('a[href*="login"], a[href*="signin"], a[href*="auth"]').count();

    checks.push({ name: 'signInText', found: !!hasSignInText });
    checks.push({ name: 'emailInput', found: !!hasEmailInput });
    checks.push({ name: 'passwordInput', found: !!hasPasswordInput });
    checks.push({ name: 'loginRouteLink', found: !!hasLoginRouteLink });

    // Try visiting common login paths and look for email/password
    const paths = ['/login', '/signin', '/auth/login', '/auth', '/account/login', '/sign-in'];
    const pathResults = [];
    for (const p of paths) {
      try {
        const url = new URL(p, base).toString();
        const r = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 8000 });
        // after navigation check
        const emailCount = await page.locator('input[name="email"]').count();
        const passwordCount = await page.locator('input[name="password"]').count();
        const signInText = await page.locator('text=/Sign in|Sign In|Sign-in|SignIn/').count();
        pathResults.push({ path: p, url, emailCount, passwordCount, signInText });
      } catch (err) {
        pathResults.push({ path: p, error: String(err) });
      }
    }

    report.checks = checks;
    report.pathResults = pathResults;
  } catch (err) {
    report.error = String(err);
  } finally {
    await browser.close();
    console.log(JSON.stringify(report, null, 2));
    process.exit(0);
  }
})();

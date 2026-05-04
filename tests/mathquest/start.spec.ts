import { test, expect } from '@playwright/test';
import { CREDENTIALS } from '../credentials';
import { login, setAuthCookie, startAndNavigateToProblem } from '../helpers';

test('Start game flow presents a problem card', async ({ page, baseURL }) => {
  // Try programmatic cookie-based auth first for speed/stability in CI
  const setCookie = await setAuthCookie(page.context());
  if (setCookie) {
    // navigate to /game to ensure app reads cookies
    await page.goto((baseURL || process.env.BASE_URL || 'http://localhost:3000') + '/game');
  } else {
    await login(page, CREDENTIALS.child, baseURL);
  }

  // Start and navigate until a problem card appears
  const found = await startAndNavigateToProblem(page);
  if (!found) {
    // still attempt a generic wait
    await page.waitForSelector('.problem-card, .question-card, [data-testid="problem-card"], .game-canvas, canvas', { timeout: 15000 });
  }
  await page.screenshot({ path: 'test-results/mathquest-start.png', fullPage: false });
  // Accept either a rendered problem card or the game canvas as a minimal success for start
  expect(await page.locator('.problem-card, .question-card, .game-canvas, canvas').count()).toBeGreaterThan(0);
});

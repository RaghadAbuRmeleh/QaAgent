import { test, expect } from '@playwright/test';
import { CREDENTIALS } from '../credentials';
import { login, setAuthCookie, startGameIfNeeded, startAndNavigateToProblem } from '../helpers';

test('Problem presentation and answer submission', async ({ page, baseURL }) => {
  const setCookie = await setAuthCookie(page.context());
  if (setCookie) {
    await page.goto((baseURL || process.env.BASE_URL || 'http://localhost:3000') + '/game');
  } else {
    await login(page, CREDENTIALS.child, baseURL);
  }
  await startAndNavigateToProblem(page);
  // Now assume game UI loads; wait for problem card selectors or canvas
  await page.waitForSelector('.problem-card, .question-card, [data-testid="problem-card"], .game-canvas, .app-shell, canvas', { timeout: 30000 });
  // Take a screenshot of the first problem
  await page.screenshot({ path: 'test-results/problem-initial.png', fullPage: false });

  // Attempt to submit an answer (placeholder)
  if (await page.locator('input[type="number"], input[type="text"]').count()) {
    await page.fill('input[type="number"], input[type="text"]', '1');
    await page.click('button.submit-answer, button[type="submit"]');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-results/problem-after-submit.png' });
  }
});

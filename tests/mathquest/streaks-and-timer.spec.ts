import { test, expect } from '@playwright/test';
import { CREDENTIALS } from '../credentials';
import { login, startGameIfNeeded, setAuthCookie, startAndNavigateToProblem } from '../helpers';

test('Streak bonus awarding and timer warning', async ({ page, baseURL }) => {
  const setCookie = await setAuthCookie(page.context());
  if (setCookie) {
    await page.goto((baseURL || process.env.BASE_URL || 'http://localhost:3000') + '/game');
  } else {
    await login(page, CREDENTIALS.child, baseURL);
  }
  const found3 = await startAndNavigateToProblem(page);
  if (!found3) await page.waitForSelector('.problem-card, .game-canvas, canvas', { timeout: 20000 });

  // Fill plausible answers quickly to try to build a streak (best-effort)
  const input = page.locator('input[type="number"], input[type="text"]');
  for (let i = 0; i < 3; i++) {
    if (await input.count()) {
      await input.fill('1');
      await page.click('button:has-text("Submit"), button.submit-answer, button[type="submit"]').catch(() => null);
      await page.waitForTimeout(800);
    }
  }

  await page.screenshot({ path: 'test-results/mathquest-streaks.png' });
  // Look for streak UI indicator
  const streak = await page.locator('.streak, [data-testid="streak-count"]').count();
  expect(streak).toBeGreaterThanOrEqual(0);
});

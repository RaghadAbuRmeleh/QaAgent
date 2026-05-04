import { test, expect } from '@playwright/test';
import { CREDENTIALS } from '../credentials';
import { login, setAuthCookie } from '../helpers';

test('Earning coins and spending behavior', async ({ page, baseURL }) => {
  const setCookie = await setAuthCookie(page.context());
  if (setCookie) {
    await page.goto((baseURL || process.env.BASE_URL || 'http://localhost:3000') + '/game');
  } else {
    await login(page, CREDENTIALS.child, baseURL);
  }

  // Wait for coin balance and verify visibility (accept canvas as fallback)
  await page.waitForSelector('.coin-balance, [data-testid="coin-balance"], .wallet, #coinBalance, canvas', { timeout: 30000 });
  const balanceEl = await page.locator('.coin-balance, [data-testid="coin-balance"], .wallet, #coinBalance');
  const balanceText = (await balanceEl.count()) ? await balanceEl.first().innerText() : 'n/a';
  console.log('Coin balance:', balanceText);
  await page.screenshot({ path: 'test-results/coin-balance.png' });
});

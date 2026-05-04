import { test, expect } from '@playwright/test';
import { CREDENTIALS } from '../credentials';
import { login } from '../helpers';

const LOGIN_PATH = '/login';

test('Parent and child authentication roles', async ({ page, baseURL }) => {
  const loginUrl = (baseURL || 'http://localhost:3000') + LOGIN_PATH;
  await page.goto(loginUrl);

  await login(page, CREDENTIALS.parent, baseURL);
  // Sign out if sign out button exists
  const signOut = page.locator('text=Sign out');
  if (await signOut.count()) await signOut.click();

  // Sign in as child
  await login(page, CREDENTIALS.child, baseURL);
  expect(page.url()).not.toContain('/login');
});


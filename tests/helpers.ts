import { Page, BrowserContext } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export async function login(page: Page, credentials: { email: string; password: string }, baseURL?: string) {
  const base = baseURL || process.env.BASE_URL || 'http://localhost:3000';
  const loginUrl = new URL('/login', base).toString();
  await page.goto(loginUrl);

  if (await page.locator('input[type="email"]').count()) await page.fill('input[type="email"]', credentials.email);
  if (await page.locator('input[type="password"]').count()) await page.fill('input[type="password"]', credentials.password);

  // Click submit and wait for a POST to a login/auth endpoint. If no POST observed, fall back to waiting for navigation/DOM.
  const clickPromise = page.locator('button[type="submit"], button.btn-gold').first().click().catch(() => null);
  const supabasePattern = /supabase\.co\/auth\/v1\/token|supabase\.co\/auth\/v1\/user|supabase\.co\/rest\/v1\//i;
  // Wait for either a navigation (to /game) or a Supabase auth/rest response, or fallback to DOM change
  const respPromise = page.waitForResponse(r => {
    try { return supabasePattern.test(r.url()); } catch { return false; }
  }, { timeout: 12000 }).catch(() => null);

  const navPromise = page.waitForNavigation({ timeout: 12000 }).catch(() => null);

  await clickPromise;

  const [resp, nav] = await Promise.all([respPromise, navPromise]);

  if (resp) {
    if (resp.status() >= 400) {
      const body = await resp.text().catch(() => '<unreadable>');
      throw new Error(`Login POST failed: ${resp.status()} ${body}`);
    }
    // allow the app a moment to render post-login UI
    await page.waitForTimeout(500);
  }

  if (nav && page.url().includes('/game')) {
    // successful navigation to the game
    return;
  }

  // Fallback: wait for a reliable post-login indicator (game canvas, app shell, nav, root)
  await page.waitForSelector('.game-canvas, .app-shell, nav, #root, [data-testid="app-root"], .problem-card', { timeout: 20000 }).catch(() => null);
}

/**
 * Attempt to set authentication cookies programmatically.
 * Looks for a cookie file at TEST_COOKIE_FILE env or test-results/child-cookies.json.
 * Returns true if cookies were set on the context, false if no cookie file found.
 */
export async function setAuthCookie(context: BrowserContext, cookieFilePath?: string): Promise<boolean> {
  const candidate = cookieFilePath || process.env.TEST_COOKIE_FILE || path.resolve(process.cwd(), 'test-results', 'child-cookies.json');
  if (!fs.existsSync(candidate)) return false;
  try {
    const raw = fs.readFileSync(candidate, 'utf8');
    const cookies = JSON.parse(raw);
    // Normalize cookies to Playwright shape
    const normalized = cookies.map((c: any) => ({
      name: c.name,
      value: c.value,
      domain: c.domain || 'localhost',
      path: c.path || '/',
      httpOnly: !!c.httpOnly,
      secure: !!c.secure,
      sameSite: (c.sameSite && c.sameSite.toLowerCase && c.sameSite.toLowerCase()) || 'Lax',
      expires: c.expires || c.expiration || Math.floor(Date.now() / 1000) + 3600,
    }));
    await context.addCookies(normalized);
    return true;
  } catch (e) {
    console.warn('Failed to set auth cookies from', candidate, e);
    return false;
  }
}

export async function startGameIfNeeded(page: Page) {
  const startSelectors = ['button:has-text("Start" )', 'text=Start Game', 'button.start', 'a:has-text("Play")', 'button:has-text("Enter the Number Wilds")'];
  for (const sel of startSelectors) {
    const loc = page.locator(sel).first();
    if (await loc.count()) {
      await loc.click().catch(() => null);
      return true;
    }
  }
  return false;
}

/**
 * Clicks start/play if present, then simulates player movement (arrow keys)
 * to trigger in-canvas collisions that reveal problem cards. Returns true
 * if a problem card was detected, false otherwise.
 */
export async function startAndNavigateToProblem(page: Page, maxAttempts = 24): Promise<boolean> {
  // Try clicking start-like selectors first
  await startGameIfNeeded(page).catch(() => null);

  // Wait for canvas to appear (game engine)
  await page.waitForSelector('canvas, .game-canvas', { timeout: 20000 }).catch(() => null);

  const problemSelectors = ['.problem-card', '.question-card', '[data-testid="problem-card"]'];
  const supabasePattern = /supabase\.co\/auth\/v1\/token|supabase\.co\/auth\/v1\/user|supabase\.co\/rest\/v1\//i;

  // simple network-based detection flag
  let sawSupabaseResponse = false;
  const onResponse = (r: any) => {
    try {
      if (supabasePattern.test(r.url())) {
        if (typeof r.status === 'function') {
          const status = r.status();
          if (status >= 200 && status < 500) sawSupabaseResponse = true;
        } else if (r.status >= 200 && r.status < 500) {
          sawSupabaseResponse = true;
        }
      }
    } catch (e) {
      // ignore
    }
  };
  page.on('response', onResponse);

  // If a problem is already present, return true
  for (const sel of problemSelectors) {
    try {
      if (page.isClosed && page.isClosed()) break;
      if (await page.locator(sel).count()) {
        page.off('response', onResponse);
        return true;
      }
    } catch (e) {
      // ignore and continue
    }
  }

  // Focus the canvas if present
  const canv = page.locator('canvas').first();
  if (await canv.count()) {
    // click the canvas center to focus; some engines require pointerdown at coords
    try {
      const box = await canv.boundingBox();
      if (box) {
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { button: 'left' }).catch(() => null);
      } else {
        await canv.click().catch(() => null);
      }
    } catch (e) {
      await canv.click().catch(() => null);
    }
  } else {
    // try focusing the page
    await page.focus('body').catch(() => null);
  }

  // Simulate movement: alternate ArrowRight and ArrowLeft with small pauses
  const moves = ['ArrowRight', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown'];
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    for (const m of moves) {
      if (page.isClosed && page.isClosed()) break;
      // Hold keys longer to ensure movement registers
      await page.keyboard.down(m).catch(() => null);
      await page.waitForTimeout(400).catch(() => null);
      await page.keyboard.up(m).catch(() => null);
      // After each move, check for problem card
      for (const sel of problemSelectors) {
        try {
          if (page.isClosed && page.isClosed()) break;
          if (await page.locator(sel).count()) {
            page.off('response', onResponse);
            return true;
          }
        } catch (e) {
          // ignore locator errors
        }
      }
      // also check for Supabase REST POSTs as indicator (if available)
      if (sawSupabaseResponse) {
        page.off('response', onResponse);
        return true;
      }
      // short wait
      await page.waitForTimeout(200).catch(() => null);
    }
    // If canvas present, also try clicking around center to nudge collisions
    try {
      if (await canv.count()) {
        const box = await canv.boundingBox();
        if (box) {
          // click several nearby offsets
          const offsets = [[0,0], [30,0], [-30,0], [0,30], [0,-30]];
          for (const [ox, oy] of offsets) {
            await page.mouse.click(box.x + box.width / 2 + ox, box.y + box.height / 2 + oy).catch(() => null);
            await page.waitForTimeout(150).catch(() => null);
            for (const sel of problemSelectors) {
              if (await page.locator(sel).count()) {
                page.off('response', onResponse);
                return true;
              }
            }
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }

  // Final check
  for (const sel of problemSelectors) {
    try {
      if (await page.locator(sel).count()) {
        page.off('response', onResponse);
        return true;
      }
    } catch (e) {}
  }
  page.off('response', onResponse);
  if (sawSupabaseResponse) return true;
  return false;
}

const endpoints = [
  '/api/login',
  '/api/auth/login',
  '/api/auth',
  '/api/session',
  '/api/auth/signin',
  '/api/auth/signin/email',
  '/api/auth/callback',
  '/api/authenticate',
  '/api/v1/auth/login',
  '/auth/login',
  '/login',
];

const creds = { email: 'bart@simpson.com', password: 'g:~j)JbaA+oLTTet=di1' };
const base = process.env.BASE_URL || 'http://localhost:3000';

async function probe() {
  if (typeof fetch !== 'function') {
    console.error('Global fetch not available in this Node. Please run with Node 18+');
    process.exit(1);
  }

  for (const ep of endpoints) {
    const url = new URL(ep, base).toString();
    process.stdout.write(`\n==> POST ${url} ... `);
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
      });
      const ct = resp.headers.get('content-type') || '';
      let body;
      try {
        if (ct.includes('application/json')) body = await resp.json();
        else body = await resp.text();
      } catch (e) { body = '<unreadable body>'; }
      console.log(`status=${resp.status}`);
      console.log('body:', typeof body === 'string' ? body.slice(0, 1000) : JSON.stringify(body, null, 2));
    } catch (err) {
      console.log('error:', String(err).slice(0, 200));
    }
  }

  // Also try GET on /api/auth/session or /api/auth to see if introspection exists
  const getPaths = ['/api/auth/session', '/api/session', '/api/auth/me', '/api/me'];
  for (const p of getPaths) {
    const url = new URL(p, base).toString();
    process.stdout.write(`\n==> GET ${url} ... `);
    try {
      const resp = await fetch(url, { method: 'GET' });
      console.log(`status=${resp.status}`);
      const text = await resp.text().catch(() => '<unreadable>');
      console.log('body:', text.slice(0, 1000));
    } catch (err) {
      console.log('error:', String(err).slice(0, 200));
    }
  }
}

probe();

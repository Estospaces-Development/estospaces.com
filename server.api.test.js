import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { randomUUID } from 'node:crypto';
import nextConfig from './next.config.mjs';

process.env.RESEND_API_KEY = '';
process.env.CORS_ALLOWED_ORIGINS = '';
process.env.ALLOWED_ORIGINS = 'https://landing.example';
process.env.LANDING_RATE_LIMIT_STORE = 'memory';
process.env.LANDING_EMAIL_RATE_LIMIT_MAX = '5';
process.env.LANDING_EMAIL_RATE_LIMIT_WINDOW_MS = '60000';

const { GET: healthGET } = await import('./src/app/health/route.js');
const reservationRoute = await import('./src/app/api/send-reservation-email/route.js');
const newsletterRoute = await import('./src/app/api/send-newsletter-notification/route.js');
const chatStartRoute = await import('./src/app/api/live-chat/start/route.js');
const chatMessageRoute = await import('./src/app/api/live-chat/message/route.js');

const request = (path, { method = 'POST', body, headers = {} } = {}) => new Request(`https://estospaces.com${path}`, {
  method,
  headers: {
    'Content-Type': 'application/json',
    ...headers,
  },
  body: body === undefined ? undefined : JSON.stringify(body),
});

const expectedReservationSheetHeaders = [
  'Submitted At',
  'Market',
  'User Type',
  'Name',
  'Email',
  'Phone',
  'Newsletter Opt-In',
  'Location',
  'Looking For',
  'Landing Page',
  'UTM Source',
  'UTM Medium',
  'UTM Campaign',
  'UTM Term',
  'UTM Content',
  'GCLID',
  'FBCLID',
];

test('health endpoint and Next config expose production security headers', async () => {
  const response = healthGET();
  const payload = await response.json();
  const headerRules = await nextConfig.headers();
  const headers = new Map(headerRules.flatMap((rule) => rule.headers.map((header) => [header.key, header.value])));
  const csp = headers.get('Content-Security-Policy');

  assert.equal(response.status, 200);
  assert.equal(payload.ok, true);
  assert.equal(nextConfig.poweredByHeader, false);
  assert.equal(nextConfig.turbopack.root.endsWith(`${sep}estospaces.com${sep}`), true);
  assert.equal(headers.get('X-Content-Type-Options'), 'nosniff');
  assert.equal(headers.get('X-Frame-Options'), 'DENY');
  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /script-src 'self' 'unsafe-inline' https:\/\/www\.googletagmanager\.com/);
  assert.match(csp, /connect-src 'self' https:\/\/api\.postcodes\.io/);
});

test('allowed CORS preflight is handled for landing API routes', async () => {
  const response = reservationRoute.OPTIONS(request('/api/send-reservation-email', {
    method: 'OPTIONS',
    headers: {
      Origin: 'https://landing.example',
      'Access-Control-Request-Method': 'POST',
    },
  }));

  assert.equal(response.status, 204);
  assert.equal(response.headers.get('access-control-allow-origin'), 'https://landing.example');
});

test('reservation API validates email and accepts valid local request without external provider', async () => {
  const malformed = await reservationRoute.POST(new Request('https://estospaces.com/api/send-reservation-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{"email":',
  }));
  assert.equal(malformed.status, 400);
  assert.deepEqual(await malformed.json(), { error: 'Invalid JSON payload' });

  const invalid = await reservationRoute.POST(request('/api/send-reservation-email', {
    body: {
      userType: 'buyer',
      name: 'Maya User',
      email: 'not-an-email',
      location: 'London',
      lookingFor: 'A two bedroom flat',
    },
  }));
  assert.equal(invalid.status, 400);

  const valid = await reservationRoute.POST(request('/api/send-reservation-email', {
    body: {
      market: 'england',
      userType: 'buyer',
      name: 'Maya User',
      email: 'maya@example.com',
      location: 'London',
      lookingFor: 'A two bedroom flat',
      attribution: {
        landingPage: '/',
        utm_source: 'google',
        utm_campaign: 'england_launch',
        gclid: 'test-click-id',
      },
    },
  }));
  const payload = await valid.json();

  assert.equal(valid.status, 200);
  assert.equal(payload.success, true);
  assert.equal(payload.emailConfigured, false);
});

test('reservation API rejects unsupported launch markets', async () => {
  const response = await reservationRoute.POST(request('/api/send-reservation-email', {
    body: {
      market: 'usa',
      userType: 'buyer',
      name: 'Invalid Market User',
      email: `invalid-market-${randomUUID().slice(0, 8)}@example.com`,
      location: 'New York',
      lookingFor: 'A property enquiry',
    },
  }));

  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /market/i);
});

test('reservation API formats market phone numbers before sheet append', async () => {
  const originalSpreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const originalSheetRange = process.env.GOOGLE_SHEETS_LEADS_RANGE;
  const originalAccessToken = process.env.GOOGLE_SHEETS_TEST_ACCESS_TOKEN;
  const originalFetch = globalThis.fetch;
  const calls = [];

  process.env.GOOGLE_SHEETS_SPREADSHEET_ID = 'phone-format-sheet';
  process.env.GOOGLE_SHEETS_LEADS_RANGE = 'A:Q';
  process.env.GOOGLE_SHEETS_TEST_ACCESS_TOKEN = 'test-sheets-token';
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    if (String(url).includes('/values/A1%3AQ1')) {
      return new Response(JSON.stringify({ values: [expectedReservationSheetHeaders] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ updates: { updatedRange: 'Sheet1!A2:Q2' } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  try {
    const india = await reservationRoute.POST(request('/api/send-reservation-email', {
      body: {
        market: 'india',
        userType: 'buyer',
        name: 'Phone India Lead',
        email: `phone-india-${randomUUID().slice(0, 8)}@example.com`,
        phone: '8787675675',
        location: 'Chennai',
        lookingFor: 'Testing India phone formatting.',
      },
    }));
    assert.equal(india.status, 200);

    const england = await reservationRoute.POST(request('/api/send-reservation-email', {
      body: {
        market: 'england',
        userType: 'renter',
        name: 'Phone England Lead',
        email: `phone-england-${randomUUID().slice(0, 8)}@example.com`,
        phone: '7435537052',
        location: 'London',
        lookingFor: 'Testing England phone formatting.',
      },
    }));
    assert.equal(england.status, 200);

    const appendBodies = calls
      .filter((call) => String(call.url).includes('/values/A%3AQ:append'))
      .map((call) => JSON.parse(call.options.body).values[0]);
    assert.equal(appendBodies.length, 2);
    assert.equal(appendBodies[0][5], '+91 87876 75675');
    assert.equal(appendBodies[1][5], '+44 7435 537052');
  } finally {
    globalThis.fetch = originalFetch;
    if (originalSpreadsheetId === undefined) delete process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    else process.env.GOOGLE_SHEETS_SPREADSHEET_ID = originalSpreadsheetId;
    if (originalSheetRange === undefined) delete process.env.GOOGLE_SHEETS_LEADS_RANGE;
    else process.env.GOOGLE_SHEETS_LEADS_RANGE = originalSheetRange;
    if (originalAccessToken === undefined) delete process.env.GOOGLE_SHEETS_TEST_ACCESS_TOKEN;
    else process.env.GOOGLE_SHEETS_TEST_ACCESS_TOKEN = originalAccessToken;
  }
});

test('reservation API rejects invalid market phone before sheet append', async () => {
  const originalSpreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const originalAccessToken = process.env.GOOGLE_SHEETS_TEST_ACCESS_TOKEN;
  const originalFetch = globalThis.fetch;
  const calls = [];

  process.env.GOOGLE_SHEETS_SPREADSHEET_ID = 'invalid-phone-sheet';
  process.env.GOOGLE_SHEETS_TEST_ACCESS_TOKEN = 'test-sheets-token';
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), options });
    return new Response(JSON.stringify({ updates: { updatedRange: 'Sheet1!A2:Q2' } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  try {
    const response = await reservationRoute.POST(request('/api/send-reservation-email', {
      body: {
        market: 'india',
        userType: 'buyer',
        name: 'Invalid Phone Lead',
        email: `invalid-phone-${randomUUID().slice(0, 8)}@example.com`,
        phone: '12345',
        location: 'Chennai',
        lookingFor: 'Testing invalid India phone rejection.',
      },
    }));
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.match(payload.error, /India phone number/);
    assert.equal(calls.length, 0);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalSpreadsheetId === undefined) delete process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    else process.env.GOOGLE_SHEETS_SPREADSHEET_ID = originalSpreadsheetId;
    if (originalAccessToken === undefined) delete process.env.GOOGLE_SHEETS_TEST_ACCESS_TOKEN;
    else process.env.GOOGLE_SHEETS_TEST_ACCESS_TOKEN = originalAccessToken;
  }
});

test('reservation API rejects internal Codex automation submissions before sheet append', async () => {
  const originalSpreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const originalAccessToken = process.env.GOOGLE_SHEETS_TEST_ACCESS_TOKEN;
  const originalFetch = globalThis.fetch;
  const calls = [];

  process.env.GOOGLE_SHEETS_SPREADSHEET_ID = 'proof-sheet';
  process.env.GOOGLE_SHEETS_TEST_ACCESS_TOKEN = 'test-sheets-token';
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), options });
    return new Response(JSON.stringify({ updates: { updatedRange: 'Sheet1!A2:Q2' } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  try {
    const response = await reservationRoute.POST(request('/api/send-reservation-email', {
      body: {
        market: 'india',
        userType: 'buyer',
        name: 'Codex Manual Lead',
        email: `codex-manual-${randomUUID().slice(0, 8)}@example.com`,
        location: 'Chennai',
        lookingFor: 'Automated test reservation should not enter production sheet.',
        attribution: {
          landingPage: '/',
          utm_source: 'codex',
        },
      },
    }));
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.match(payload.error, /internal automation/i);
    assert.equal(calls.length, 0);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalSpreadsheetId === undefined) delete process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    else process.env.GOOGLE_SHEETS_SPREADSHEET_ID = originalSpreadsheetId;
    if (originalAccessToken === undefined) delete process.env.GOOGLE_SHEETS_TEST_ACCESS_TOKEN;
    else process.env.GOOGLE_SHEETS_TEST_ACCESS_TOKEN = originalAccessToken;
  }
});

test('reservation API appends Reserve Your Spot leads to configured Google Sheet', async () => {
  const originalSpreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const originalSheetRange = process.env.GOOGLE_SHEETS_LEADS_RANGE;
  const originalAccessToken = process.env.GOOGLE_SHEETS_TEST_ACCESS_TOKEN;
  const originalFetch = globalThis.fetch;
  const calls = [];

  process.env.GOOGLE_SHEETS_SPREADSHEET_ID = '1lcHZXqllQ6JT-pnnA6fN7cVqRt8xhZtU7TbBnsroUOA';
  process.env.GOOGLE_SHEETS_LEADS_RANGE = 'A:Q';
  process.env.GOOGLE_SHEETS_TEST_ACCESS_TOKEN = 'test-sheets-token';
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), options });
    if (String(url).includes('/values/A1%3AQ1')) {
      return new Response(JSON.stringify({
        values: [expectedReservationSheetHeaders],
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      updates: {
        updatedRange: 'Sheet1!A2:Q2',
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  try {
    const response = await reservationRoute.POST(request('/api/send-reservation-email', {
      body: {
        market: 'india',
        userType: 'seller',
        name: 'Sheet Lead',
        email: `sheet-lead-${randomUUID().slice(0, 8)}@example.com`,
        phone: '+91 98765 43210',
        location: 'Chennai',
        lookingFor: 'I want to list a property after the ad launch.',
        newsletterOptIn: true,
        attribution: {
          landingPage: '/',
          utm_source: 'google',
          utm_medium: 'cpc',
          utm_campaign: 'india_launch',
          gclid: 'google-click-id',
        },
      },
    }));
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.sheetConfigured, true);
    assert.equal(payload.sheetStored, true);
    assert.equal(calls.length, 2);
    assert.match(calls[0].url, /spreadsheets\/1lcHZXqllQ6JT-pnnA6fN7cVqRt8xhZtU7TbBnsroUOA\/values\/A1%3AQ1/);
    assert.match(calls[1].url, /spreadsheets\/1lcHZXqllQ6JT-pnnA6fN7cVqRt8xhZtU7TbBnsroUOA\/values\/A%3AQ:append/);
    assert.match(calls[1].url, /valueInputOption=USER_ENTERED/);
    assert.equal(calls[1].options.headers.Authorization, 'Bearer test-sheets-token');
    const sheetBody = JSON.parse(calls[1].options.body);
    assert.deepEqual(sheetBody.values[0].slice(1, 9), [
      'India',
      'seller',
      'Sheet Lead',
      sheetBody.values[0][4],
      '+91 98765 43210',
      'Yes',
      'Chennai',
      'I want to list a property after the ad launch.',
    ]);
    assert.equal(sheetBody.values[0][10], 'google');
    assert.equal(sheetBody.values[0][12], 'india_launch');
  } finally {
    globalThis.fetch = originalFetch;
    if (originalSpreadsheetId === undefined) delete process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    else process.env.GOOGLE_SHEETS_SPREADSHEET_ID = originalSpreadsheetId;
    if (originalSheetRange === undefined) delete process.env.GOOGLE_SHEETS_LEADS_RANGE;
    else process.env.GOOGLE_SHEETS_LEADS_RANGE = originalSheetRange;
    if (originalAccessToken === undefined) delete process.env.GOOGLE_SHEETS_TEST_ACCESS_TOKEN;
    else process.env.GOOGLE_SHEETS_TEST_ACCESS_TOKEN = originalAccessToken;
  }
});

test('reservation API inserts Google Sheet headers above existing lead rows', async () => {
  const originalSpreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const originalSheetRange = process.env.GOOGLE_SHEETS_LEADS_RANGE;
  const originalAccessToken = process.env.GOOGLE_SHEETS_TEST_ACCESS_TOKEN;
  const originalFetch = globalThis.fetch;
  const calls = [];

  process.env.GOOGLE_SHEETS_SPREADSHEET_ID = 'header-insert-sheet';
  process.env.GOOGLE_SHEETS_LEADS_RANGE = 'A:Q';
  process.env.GOOGLE_SHEETS_TEST_ACCESS_TOKEN = 'test-sheets-token';
  globalThis.fetch = async (url, options = {}) => {
    const requestUrl = String(url);
    const method = options.method || 'GET';
    calls.push({ url: requestUrl, options: { ...options, method } });

    if (requestUrl.includes('/values/A1%3AQ1') && method === 'GET') {
      return new Response(JSON.stringify({
        values: [['2026-07-07T15:29:23.759Z', 'India', 'buyer']],
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (requestUrl.match(/\/spreadsheets\/header-insert-sheet\?fields=/) && method === 'GET') {
      return new Response(JSON.stringify({
        sheets: [
          {
            properties: {
              sheetId: 0,
              title: 'Sheet1',
            },
          },
        ],
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (requestUrl.endsWith('/spreadsheets/header-insert-sheet:batchUpdate') && method === 'POST') {
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (requestUrl.includes('/values/A1%3AQ1') && method === 'PUT') {
      return new Response(JSON.stringify({
        updatedRange: 'Sheet1!A1:Q1',
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (requestUrl.includes('/values/A%3AQ:append') && method === 'POST') {
      return new Response(JSON.stringify({
        updates: {
          updatedRange: 'Sheet1!A4:Q4',
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    throw new Error(`Unexpected Sheets request: ${method} ${requestUrl}`);
  };

  try {
    const response = await reservationRoute.POST(request('/api/send-reservation-email', {
      body: {
        market: 'india',
        userType: 'buyer',
        name: 'Header Insert Lead',
        email: `header-insert-${randomUUID().slice(0, 8)}@example.com`,
        location: 'Chennai',
        lookingFor: 'I need the sheet headers to be understandable.',
      },
    }));
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.sheetStored, true);
    assert.equal(calls.length, 5);
    assert.match(calls[0].url, /values\/A1%3AQ1/);
    assert.match(calls[1].url, /fields=sheets\.properties/);
    assert.match(calls[2].url, /:batchUpdate$/);
    assert.match(calls[3].url, /values\/A1%3AQ1/);
    assert.match(calls[4].url, /values\/A%3AQ:append/);

    const insertBody = JSON.parse(calls[2].options.body);
    assert.deepEqual(insertBody.requests[0].insertDimension.range, {
      sheetId: 0,
      dimension: 'ROWS',
      startIndex: 0,
      endIndex: 1,
    });

    const headerBody = JSON.parse(calls[3].options.body);
    assert.deepEqual(headerBody.values[0], expectedReservationSheetHeaders);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalSpreadsheetId === undefined) delete process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    else process.env.GOOGLE_SHEETS_SPREADSHEET_ID = originalSpreadsheetId;
    if (originalSheetRange === undefined) delete process.env.GOOGLE_SHEETS_LEADS_RANGE;
    else process.env.GOOGLE_SHEETS_LEADS_RANGE = originalSheetRange;
    if (originalAccessToken === undefined) delete process.env.GOOGLE_SHEETS_TEST_ACCESS_TOKEN;
    else process.env.GOOGLE_SHEETS_TEST_ACCESS_TOKEN = originalAccessToken;
  }
});

test('reservation API fails clearly when configured Google Sheet cannot store the lead', async () => {
  const originalSpreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const originalAccessToken = process.env.GOOGLE_SHEETS_TEST_ACCESS_TOKEN;
  const originalFetch = globalThis.fetch;
  const originalConsoleError = console.error;
  const loggedErrors = [];

  process.env.GOOGLE_SHEETS_SPREADSHEET_ID = '1lcHZXqllQ6JT-pnnA6fN7cVqRt8xhZtU7TbBnsroUOA';
  process.env.GOOGLE_SHEETS_TEST_ACCESS_TOKEN = 'test-sheets-token';
  console.error = (...args) => loggedErrors.push(args);
  globalThis.fetch = async () => new Response(JSON.stringify({
    error: {
      message: 'The caller does not have permission',
    },
  }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  });

  try {
    const response = await reservationRoute.POST(request('/api/send-reservation-email', {
      body: {
        market: 'england',
        userType: 'buyer',
        name: 'Sheet Failure Lead',
        email: `sheet-failure-${randomUUID().slice(0, 8)}@example.com`,
        location: 'London',
        lookingFor: 'Looking for an England property lead.',
      },
    }));
    const payload = await response.json();

    assert.equal(response.status, 500);
    assert.match(payload.error, /Google Sheet/i);
    assert.equal(loggedErrors.length, 1);
  } finally {
    console.error = originalConsoleError;
    globalThis.fetch = originalFetch;
    if (originalSpreadsheetId === undefined) delete process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    else process.env.GOOGLE_SHEETS_SPREADSHEET_ID = originalSpreadsheetId;
    if (originalAccessToken === undefined) delete process.env.GOOGLE_SHEETS_TEST_ACCESS_TOKEN;
    else process.env.GOOGLE_SHEETS_TEST_ACCESS_TOKEN = originalAccessToken;
  }
});

test('reservation API reports Google Sheet storage errors when append throws', async () => {
  const originalSpreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const originalAccessToken = process.env.GOOGLE_SHEETS_TEST_ACCESS_TOKEN;
  const originalFetch = globalThis.fetch;
  const originalConsoleError = console.error;
  const loggedErrors = [];

  process.env.GOOGLE_SHEETS_SPREADSHEET_ID = '1lcHZXqllQ6JT-pnnA6fN7cVqRt8xhZtU7TbBnsroUOA';
  process.env.GOOGLE_SHEETS_TEST_ACCESS_TOKEN = 'test-sheets-token';
  console.error = (...args) => loggedErrors.push(args);
  globalThis.fetch = async () => {
    throw new Error('sheet append network failure');
  };

  try {
    const response = await reservationRoute.POST(request('/api/send-reservation-email', {
      body: {
        market: 'india',
        userType: 'buyer',
        name: 'Sheet Throw Lead',
        email: `sheet-throw-${randomUUID().slice(0, 8)}@example.com`,
        location: 'Chennai',
        lookingFor: 'Looking for a property lead with thrown sheet append.',
      },
    }));
    const payload = await response.json();

    assert.equal(response.status, 500);
    assert.match(payload.error, /Google Sheet/i);
    assert.equal(loggedErrors.length, 1);
  } finally {
    console.error = originalConsoleError;
    globalThis.fetch = originalFetch;
    if (originalSpreadsheetId === undefined) delete process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    else process.env.GOOGLE_SHEETS_SPREADSHEET_ID = originalSpreadsheetId;
    if (originalAccessToken === undefined) delete process.env.GOOGLE_SHEETS_TEST_ACCESS_TOKEN;
    else process.env.GOOGLE_SHEETS_TEST_ACCESS_TOKEN = originalAccessToken;
  }
});

test('reservation phone input is capped before it can submit oversized values', () => {
  const modalSource = readFileSync(resolve(process.cwd(), 'src/components/landing/WaitlistModal.jsx'), 'utf8');
  const apiSource = readFileSync(resolve(process.cwd(), 'src/lib/server/landingApi.js'), 'utf8');

  assert.match(modalSource, /normalizeReservationPhoneInput/);
  assert.match(modalSource, /normalizeReservationPhoneForMarket/);
  assert.match(modalSource, /reservation-phone-help/);
  assert.match(modalSource, /maxLength=\{20\}/);
  assert.match(apiSource, /normalizeReservationPhone/);
  assert.match(apiSource, /phoneResult = normalizeReservationPhone/);
  assert.match(apiSource, /phoneError/);
});

test('landing API rate limiter falls back when Firestore is unavailable', () => {
  const apiSource = readFileSync(resolve(process.cwd(), 'src/lib/server/landingApi.js'), 'utf8');

  assert.match(apiSource, /landingRateLimitStoreTimeoutMs/);
  assert.match(apiSource, /Firestore rate limit store timed out/);
  assert.match(apiSource, /return enforceMemoryRateLimit\(\{ scope, keys, \.\.\.config \}\);/);
  assert.doesNotMatch(apiSource, /return \{ unavailable: true \};/);
});

test('landing hero advanced search panel is separated from the main search card', () => {
  const searchBarSource = readFileSync(resolve(process.cwd(), 'src/components/ui/SearchBar.tsx'), 'utf8');

  assert.match(searchBarSource, /aria-controls="landing-search-advanced-filters"/);
  assert.match(searchBarSource, /aria-expanded=\{showAdvancedFilters\}/);
  assert.match(searchBarSource, /data-testid="landing-search-advanced-filters"/);
  assert.doesNotMatch(searchBarSource, /mt-\[-1px\]/);
});

test('waitlist reservation can opt into newsletter without closing-copy confusion', () => {
  const modalSource = readFileSync(resolve(process.cwd(), 'src/components/landing/WaitlistModal.jsx'), 'utf8');
  const hookSource = readFileSync(resolve(process.cwd(), 'src/hooks/useWaitlist.js'), 'utf8');
  const apiSource = readFileSync(resolve(process.cwd(), 'src/lib/server/landingApi.js'), 'utf8');

  assert.match(modalSource, /market:\s*'india'/);
  assert.match(modalSource, /value:\s*'england'/);
  assert.match(modalSource, /\+91 98765 43210/);
  assert.match(modalSource, /\+44 7700 900000/);
  assert.match(modalSource, /newsletterOptIn:\s*false/);
  assert.match(modalSource, /Join the newsletter/);
  assert.match(hookSource, /utm_source/);
  assert.match(hookSource, /gclid/);
  assert.match(hookSource, /fbclid/);
  assert.match(hookSource, /attribution:\s*getAttribution\(\)/);
  assert.match(hookSource, /newsletterOptIn:\s*Boolean\(data\.newsletterOptIn\)/);
  assert.match(apiSource, /allowedMarkets/);
  assert.match(apiSource, /const market = normalizeText/);
  assert.match(apiSource, /Ad Attribution/);
  assert.match(apiSource, /newsletterOptIn:\s*normalizeBoolean/);
  assert.match(apiSource, /Newsletter opt-in/);
  assert.doesNotMatch(modalSource, /Success! Closing/);
});

test('landing search supports India and England launch markets', () => {
  const searchBarSource = readFileSync(resolve(process.cwd(), 'src/components/ui/SearchBar.tsx'), 'utf8');
  const layoutSource = readFileSync(resolve(process.cwd(), 'src/app/layout.jsx'), 'utf8');
  const pageSource = readFileSync(resolve(process.cwd(), 'src/app/page.jsx'), 'utf8');

  assert.match(searchBarSource, /value:\s*'india'/);
  assert.match(searchBarSource, /value:\s*'england'/);
  assert.match(searchBarSource, /currency:\s*'INR'/);
  assert.match(searchBarSource, /currency:\s*'GBP'/);
  assert.match(searchBarSource, /market\)\s*params\.set\('market'/);
  assert.match(searchBarSource, /api\.postcodes\.io/);
  assert.match(searchBarSource, /Chennai/);
  assert.match(layoutSource, /India and England/);
  assert.match(pageSource, /areaServed:\s*\['India', 'England'\]/);
});

test('reservation API rejects duplicate reservations by email or phone', async () => {
  const suffix = randomUUID().slice(0, 8);
  const firstEmail = `duplicate-${suffix}@example.com`;
  const firstBody = {
    market: 'england',
    userType: 'buyer',
    name: 'Duplicate User',
    email: firstEmail,
    phone: '+44 7700 900000',
    location: 'London',
    lookingFor: 'A two bedroom flat',
    newsletterOptIn: true,
  };

  const first = await reservationRoute.POST(request('/api/send-reservation-email', { body: firstBody }));
  assert.equal(first.status, 200);

  const duplicateEmail = await reservationRoute.POST(request('/api/send-reservation-email', { body: firstBody }));
  assert.equal(duplicateEmail.status, 409);
  assert.match((await duplicateEmail.json()).error, /already reserved/i);

  const duplicatePhone = await reservationRoute.POST(request('/api/send-reservation-email', {
    body: {
      ...firstBody,
      email: `duplicate-phone-${suffix}@example.com`,
    },
  }));
  assert.equal(duplicatePhone.status, 409);
  assert.match((await duplicatePhone.json()).error, /phone/i);
});

test('newsletter and chat APIs keep the same no-provider behavior', async () => {
  const newsletter = await newsletterRoute.POST(request('/api/send-newsletter-notification', {
    body: {
      email: 'subscriber@example.com',
      source: 'footer',
    },
  }));
  assert.equal(newsletter.status, 200);

  const chatStart = await chatStartRoute.POST(request('/api/live-chat/start', {
    body: {
      visitorId: 'visitor-123',
      name: 'Visitor Name',
      email: 'visitor@example.com',
    },
  }));
  const startPayload = await chatStart.json();
  assert.equal(chatStart.status, 200);
  assert.equal(startPayload.conversation.id, 'visitor-123');
  assert.equal(startPayload.message.sender_type, 'admin');

  const chatMessage = await chatMessageRoute.POST(request('/api/live-chat/message', {
    body: {
      visitorId: 'visitor-123',
      conversationId: 'visitor-123',
      name: 'Visitor Name',
      email: 'visitor@example.com',
      message: 'Please contact me about a viewing.',
    },
  }));
  const messagePayload = await chatMessage.json();
  assert.equal(chatMessage.status, 200);
  assert.equal(messagePayload.success, true);
  assert.equal(messagePayload.emailConfigured, false);
  assert.equal(messagePayload.message.sender_type, 'visitor');
});

test('newsletter and chat email APIs throttle repeated public submissions', async () => {
  const suffix = randomUUID().slice(0, 8);
  const newsletterBody = {
    email: `rate-newsletter-${suffix}@example.com`,
    source: 'footer',
  };

  for (let i = 0; i < 5; i += 1) {
    const response = await newsletterRoute.POST(request('/api/send-newsletter-notification', {
      body: newsletterBody,
      headers: { 'x-forwarded-for': `203.0.113.${i + 10}` },
    }));
    assert.equal(response.status, 200);
  }

  const limitedNewsletter = await newsletterRoute.POST(request('/api/send-newsletter-notification', {
    body: newsletterBody,
    headers: { 'x-forwarded-for': '203.0.113.99' },
  }));
  assert.equal(limitedNewsletter.status, 429);
  assert.equal(limitedNewsletter.headers.has('retry-after'), true);
  assert.match((await limitedNewsletter.json()).error, /too many requests/i);

  const chatBody = {
    visitorId: `visitor-rate-${suffix}`,
    conversationId: `visitor-rate-${suffix}`,
    name: 'Visitor Name',
    email: `rate-chat-${suffix}@example.com`,
    message: 'Please contact me about a viewing.',
  };

  for (let i = 0; i < 5; i += 1) {
    const response = await chatMessageRoute.POST(request('/api/live-chat/message', {
      body: chatBody,
      headers: { 'x-forwarded-for': `198.51.100.${i + 10}` },
    }));
    assert.equal(response.status, 200);
  }

  const limitedChat = await chatMessageRoute.POST(request('/api/live-chat/message', {
    body: chatBody,
    headers: { 'x-forwarded-for': '198.51.100.99' },
  }));
  assert.equal(limitedChat.status, 429);
  assert.equal(limitedChat.headers.has('retry-after'), true);
  assert.match((await limitedChat.json()).error, /too many requests/i);
});

test('landing search price controls use market-specific currency icons', () => {
  const source = readFileSync(resolve('src/components/ui/SearchBar.tsx'), 'utf8');

  assert.doesNotMatch(source, /DollarSign/);
  assert.match(source, /IndianRupee/);
  assert.match(source, /PoundSterling/);
  assert.match(source, /const CurrencyIcon = marketConfig\.value === 'england' \? PoundSterling : IndianRupee;/);
  assert.match(source, /placeholder=\{`Min \$\{marketConfig\.currency\}`\}/);
  assert.match(source, /placeholder=\{`Max \$\{marketConfig\.currency\}`\}/);
});

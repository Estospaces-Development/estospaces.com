import assert from 'node:assert/strict';
import { test } from 'node:test';
import nextConfig from './next.config.mjs';

process.env.RESEND_API_KEY = '';
process.env.CORS_ALLOWED_ORIGINS = '';
process.env.ALLOWED_ORIGINS = 'https://landing.example';

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

test('health endpoint and Next config expose production security headers', async () => {
  const response = healthGET();
  const payload = await response.json();
  const headerRules = await nextConfig.headers();
  const headerNames = headerRules.flatMap((rule) => rule.headers.map((header) => header.key));

  assert.equal(response.status, 200);
  assert.equal(payload.ok, true);
  assert.equal(nextConfig.poweredByHeader, false);
  assert.ok(headerNames.includes('X-Content-Type-Options'));
  assert.ok(headerNames.includes('X-Frame-Options'));
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
      userType: 'buyer',
      name: 'Maya User',
      email: 'maya@example.com',
      location: 'London',
      lookingFor: 'A two bedroom flat',
    },
  }));
  const payload = await valid.json();

  assert.equal(valid.status, 200);
  assert.equal(payload.success, true);
  assert.equal(payload.emailConfigured, false);
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

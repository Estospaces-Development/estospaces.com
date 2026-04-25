import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { test } from 'node:test';

const getFreePort = async () => new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
        const { port } = server.address();
        server.close(() => resolve(port));
    });
});

const waitForHealth = async (baseUrl) => {
    const deadline = Date.now() + 10_000;
    let lastError;

    while (Date.now() < deadline) {
        try {
            const response = await fetch(`${baseUrl}/health`);
            if (response.ok) {
                return;
            }
        } catch (error) {
            lastError = error;
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    throw lastError || new Error('server did not become healthy');
};

let serverProcess;
let baseUrl;

test.before(async () => {
    const port = await getFreePort();
    baseUrl = `http://127.0.0.1:${port}`;

    serverProcess = spawn(process.execPath, ['server.js'], {
        cwd: new URL('.', import.meta.url),
        env: {
            ...process.env,
            PORT: String(port),
            RESEND_API_KEY: '',
            CORS_ALLOWED_ORIGINS: '',
            ALLOWED_ORIGINS: 'https://landing.example',
        },
        stdio: ['ignore', 'pipe', 'pipe'],
    });

    await waitForHealth(baseUrl);
});

test.after(() => {
    serverProcess?.kill();
});

const postJson = async (path, body) => fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
});

test('health endpoint returns security headers', async () => {
    const response = await fetch(`${baseUrl}/health`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.ok, true);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('x-frame-options'), 'DENY');
    assert.equal(response.headers.get('x-powered-by'), null);
});

test('allowed CORS preflight is handled for landing API routes', async () => {
    const response = await fetch(`${baseUrl}/api/send-newsletter-notification`, {
        method: 'OPTIONS',
        headers: {
            Origin: 'https://landing.example',
            'Access-Control-Request-Method': 'POST',
        },
    });

    assert.equal(response.status, 204);
    assert.equal(response.headers.get('access-control-allow-origin'), 'https://landing.example');
});

test('reservation API validates email and accepts valid local request without external provider', async () => {
    const malformed = await fetch(`${baseUrl}/api/send-reservation-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"email":',
    });
    assert.equal(malformed.status, 400);
    assert.deepEqual(await malformed.json(), { error: 'Invalid JSON payload' });

    const invalid = await postJson('/api/send-reservation-email', {
        userType: 'buyer',
        name: 'Maya User',
        email: 'not-an-email',
        location: 'London',
        lookingFor: 'A two bedroom flat',
    });
    assert.equal(invalid.status, 400);

    const valid = await postJson('/api/send-reservation-email', {
        userType: 'buyer',
        name: 'Maya User',
        email: 'maya@example.com',
        location: 'London',
        lookingFor: 'A two bedroom flat',
    });
    const payload = await valid.json();

    assert.equal(valid.status, 200);
    assert.equal(payload.success, true);
    assert.equal(payload.emailConfigured, false);
});

test('newsletter and chat APIs use GCP landing routes without frontend database clients', async () => {
    const newsletter = await postJson('/api/send-newsletter-notification', {
        email: 'subscriber@example.com',
        source: 'footer',
    });
    assert.equal(newsletter.status, 200);

    const chatStart = await postJson('/api/live-chat/start', {
        visitorId: 'visitor-123',
        name: 'Visitor Name',
        email: 'visitor@example.com',
    });
    const startPayload = await chatStart.json();
    assert.equal(chatStart.status, 200);
    assert.equal(startPayload.conversation.id, 'visitor-123');
    assert.equal(startPayload.message.sender_type, 'admin');

    const chatMessage = await postJson('/api/live-chat/message', {
        visitorId: 'visitor-123',
        conversationId: 'visitor-123',
        name: 'Visitor Name',
        email: 'visitor@example.com',
        message: 'Please contact me about a viewing.',
    });
    const messagePayload = await chatMessage.json();
    assert.equal(chatMessage.status, 200);
    assert.equal(messagePayload.success, true);
    assert.equal(messagePayload.emailConfigured, false);
    assert.equal(messagePayload.message.sender_type, 'visitor');
});

import { mkdir, writeFile } from 'node:fs/promises';

import { chromium } from 'playwright-core';

const artifactDirectory = 'artifacts/launch-readiness/production';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browserRoutes = [
  ['site-apex', 'https://estospaces.com/'],
  ['site-www', 'https://www.estospaces.com/'],
  ['login', 'https://app.estospaces.com/login/'],
  ['register', 'https://app.estospaces.com/register'],
  ['search', 'https://app.estospaces.com/search?market=england&location=London&type=rent'],
  ['privacy', 'https://app.estospaces.com/privacy'],
  ['terms', 'https://app.estospaces.com/terms'],
  ['cookies', 'https://app.estospaces.com/cookies'],
];
const healthRoutes = [
  'https://app.estospaces.com/health',
  'https://admin.estospaces.com/health',
  'https://core-api.estospaces.com/health',
  'https://booking-api.estospaces.com/health',
  'https://search-api.estospaces.com/health',
  'https://media-api.estospaces.com/health',
  'https://messaging-api.estospaces.com/health',
  'https://notification-api.estospaces.com/health',
  'https://payment-api.estospaces.com/health',
];

await mkdir(artifactDirectory, { recursive: true });
const browser = await chromium.launch({ executablePath: chromePath, headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const report = {
  generatedAt: new Date().toISOString(),
  browserRoutes: [],
  healthRoutes: [],
};

for (const [name, url] of browserRoutes) {
  const page = await context.newPage();
  const diagnostics = [];
  page.on('console', (message) => {
    if (message.type() === 'error') diagnostics.push({ type: 'console', message: message.text() });
  });
  page.on('requestfailed', (request) => {
    diagnostics.push({
      type: 'requestfailed',
      url: request.url(),
      message: request.failure()?.errorText,
    });
  });
  page.on('response', (response) => {
    if (response.status() >= 400) {
      diagnostics.push({ type: 'response', url: response.url(), status: response.status() });
    }
  });

  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await page.waitForTimeout(5_000);
    const bodyText = (await page.locator('body').innerText()).replace(/\s+/g, ' ').trim();
    const route = {
      name,
      url,
      finalUrl: page.url(),
      status: response?.status(),
      title: await page.title(),
      h1: (
        await page
          .locator('h1')
          .first()
          .textContent()
          .catch(() => '')
      )?.trim(),
      bodyPreview: bodyText.slice(0, 300),
      interactiveControls: await page.locator('a, button, input, select, textarea').count(),
      diagnostics,
    };
    report.browserRoutes.push(route);
    await page.screenshot({
      path: `${artifactDirectory}/${name}.png`,
      fullPage: true,
    });
  } catch (error) {
    report.browserRoutes.push({ name, url, error: error.message, diagnostics });
  } finally {
    await page.close();
  }
}

for (const url of healthRoutes) {
  try {
    const response = await context.request.get(url, { timeout: 20_000 });
    report.healthRoutes.push({
      url,
      status: response.status(),
      contentType: response.headers()['content-type'],
      bodyPreview: (await response.text()).replace(/\s+/g, ' ').slice(0, 200),
    });
  } catch (error) {
    report.healthRoutes.push({ url, error: error.message });
  }
}

await browser.close();
await writeFile(
  `${artifactDirectory}/production-verification.json`,
  `${JSON.stringify(report, null, 2)}\n`,
  'utf8',
);
console.log(JSON.stringify(report, null, 2));

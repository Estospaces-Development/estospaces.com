import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import process from 'node:process';

import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright-core';

const port = 3026;
const baseUrl = `http://127.0.0.1:${port}`;
const artifactDirectory = 'artifacts/launch-readiness';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const routeExpectations = [
  ['/', 'EstoSpaces', /Clear steps.*property journey\./],
  ['/about', 'About EstoSpaces', /Property journeys need clearer next steps/],
  ['/contact', 'Contact EstoSpaces', /Talk to the EstoSpaces team/],
  ['/security', 'EstoSpaces Security', /How we approach security/],
  ['/privacy', 'EstoSpaces Privacy Notice', /Privacy notice/],
  ['/terms', 'EstoSpaces Terms of Use', /Terms of use/],
  ['/cookies', 'EstoSpaces Cookie Policy', /Cookie policy/],
  ['/blogs', 'UK Property Blog', /UK property guides built for clear decisions/],
];
const viewports = [
  ['minimum-320x800', 320, 800],
  ['android-360x800', 360, 800],
  ['iphone-390x844', 390, 844],
  ['tablet-768x1024', 768, 1024],
  ['desktop-1440x900', 1440, 900],
  ['desktop-1920x1080', 1920, 1080],
];

await mkdir(artifactDirectory, { recursive: true });

const server = spawn(process.execPath, ['.next/standalone/server.js'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    PORT: String(port),
    HOSTNAME: '127.0.0.1',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
  windowsHide: true,
});

let serverOutput = '';
server.stdout.on('data', (chunk) => {
  serverOutput += chunk.toString();
});
server.stderr.on('data', (chunk) => {
  serverOutput += chunk.toString();
});

let browser;
const report = {
  generatedAt: new Date().toISOString(),
  routes: [],
  accessibility: [],
  responsive: [],
  interactions: {},
  links: [],
  security: {},
  performance: {},
  errors: [],
};

try {
  await waitForServer();
  browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  attachDiagnostics(page);

  for (const [path, title, h1Pattern] of routeExpectations) {
    const response = await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' });
    const route = {
      path,
      status: response?.status(),
      title: await page.title(),
      h1: (await page.locator('h1').first().textContent())?.trim(),
      canonical: await page.locator('link[rel="canonical"]').getAttribute('href'),
      main: await page.locator('main#main-content').count(),
    };
    assert(route.status === 200, `${path} returned ${route.status}`);
    assert(route.title.includes(title), `${path} title was ${route.title}`);
    assert(h1Pattern.test(route.h1 || ''), `${path} H1 was ${route.h1}`);
    assert(
      route.canonical === `https://estospaces.com${path === '/' ? '' : path}`,
      `${path} canonical was ${route.canonical}`,
    );
    assert(route.main === 1, `${path} did not expose main#main-content`);
    report.routes.push(route);

    const axe = await new AxeBuilder({ page }).analyze();
    report.accessibility.push({
      path,
      violations: axe.violations.map(({ id, impact, nodes }) => ({
        id,
        impact,
        nodes: nodes.map((node) => ({
          target: node.target,
          html: node.html,
          summary: node.failureSummary,
        })),
      })),
    });
  }

  const notFoundResponse = await page.goto(`${baseUrl}/deliberately-unknown-launch-route`, {
    waitUntil: 'networkidle',
  });
  report.routes.push({
    path: '/deliberately-unknown-launch-route',
    status: notFoundResponse?.status(),
    title: await page.title(),
    h1: (await page.locator('h1').first().textContent())?.trim(),
  });
  assert(notFoundResponse?.status() === 404, 'Unknown route did not return 404');

  const robotsResponse = await context.request.get(`${baseUrl}/robots.txt`);
  const sitemapResponse = await context.request.get(`${baseUrl}/sitemap.xml`);
  const securityTxtResponse = await context.request.get(`${baseUrl}/.well-known/security.txt`);
  const sitemapText = await sitemapResponse.text();
  const securityTxt = await securityTxtResponse.text();
  report.routes.push({
    path: '/robots.txt',
    status: robotsResponse.status(),
    meaningful: (await robotsResponse.text()).includes('https://estospaces.com/sitemap.xml'),
  });
  report.routes.push({
    path: '/sitemap.xml',
    status: sitemapResponse.status(),
    meaningful: sitemapText.includes('https://estospaces.com/security'),
  });
  report.routes.push({
    path: '/.well-known/security.txt',
    status: securityTxtResponse.status(),
    meaningful:
      securityTxt.includes('mailto:contact@estospaces.com') &&
      securityTxt.includes('https://estospaces.com/security'),
  });
  assert(robotsResponse.ok(), 'robots.txt did not return 200');
  assert(sitemapResponse.ok(), 'sitemap.xml did not return 200');
  assert(securityTxtResponse.ok(), 'security.txt did not return 200');
  assert(
    securityTxt.includes('Contact: mailto:contact@estospaces.com'),
    'security.txt did not expose the verified domain mailbox',
  );

  await verifySecurityHeaders(context);
  await verifyRenderedInternalLinks(context, page, sitemapText);
  await verifyInteractions(page);
  report.performance = await collectPerformance(page);
  const homeRuntimeScripts = await page
    .locator('script[src^="/_next/"]')
    .evaluateAll((scripts) => scripts.map((script) => script.getAttribute('src')));
  assert(
    homeRuntimeScripts.length === 0,
    `Static homepage loaded unexpected Next.js runtime scripts: ${homeRuntimeScripts.join(', ')}`,
  );
  report.interactions.staticHomepageRuntime = true;
  await context.close();

  for (const [name, width, height] of viewports) {
    const responsiveContext = await browser.newContext({
      viewport: { width, height },
      reducedMotion: 'reduce',
    });
    const responsivePage = await responsiveContext.newPage();
    attachDiagnostics(responsivePage);
    await responsivePage.goto(baseUrl, { waitUntil: 'networkidle' });
    const layout = await responsivePage.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      h1Visible: Boolean(document.querySelector('h1')?.getBoundingClientRect().height),
      heroHeight: Math.round(
        document.querySelector('#product')?.getBoundingClientRect().height || 0,
      ),
    }));
    assert(layout.scrollWidth <= layout.clientWidth, `${name} has horizontal overflow`);
    assert(layout.h1Visible, `${name} H1 is not visible`);
    if (width >= 560) {
      assert(layout.heroHeight <= 820, `${name} hero is too tall at ${layout.heroHeight}px`);
    } else {
      assert(layout.heroHeight <= 1100, `${name} hero is too tall at ${layout.heroHeight}px`);
    }
    await responsivePage.addStyleTag({
      content: 'section { content-visibility: visible !important; }',
    });
    await responsivePage.screenshot({
      path: `${artifactDirectory}/${name}.png`,
      fullPage: true,
    });
    report.responsive.push({ name, width, height, ...layout });
    await responsiveContext.close();
  }

  // A 1440 × 900 desktop viewport at 200% browser zoom exposes 720 × 450 CSS pixels.
  // Testing the effective CSS viewport avoids Chromium's inaccurate screenshot
  // behavior when the non-standard CSS `zoom` property is applied to <html>.
  const zoomContext = await browser.newContext({ viewport: { width: 720, height: 450 } });
  const zoomPage = await zoomContext.newPage();
  await zoomPage.goto(baseUrl, { waitUntil: 'networkidle' });
  const zoomLayout = await zoomPage.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  assert(zoomLayout.scrollWidth <= zoomLayout.clientWidth, '200% zoom has horizontal overflow');
  await zoomPage.screenshot({
    path: `${artifactDirectory}/desktop-200-percent-zoom.png`,
    fullPage: true,
  });
  report.responsive.push({ name: 'desktop-200-percent-zoom', ...zoomLayout });
  await zoomContext.close();

  const textSpacingContext = await browser.newContext({
    viewport: { width: 320, height: 800 },
    reducedMotion: 'reduce',
  });
  const textSpacingPage = await textSpacingContext.newPage();
  await textSpacingPage.goto(baseUrl, { waitUntil: 'networkidle' });
  await textSpacingPage.addStyleTag({
    content: `
      body * {
        letter-spacing: 0.12em !important;
        line-height: 1.5 !important;
        word-spacing: 0.16em !important;
      }
      p {
        margin-bottom: 2em !important;
      }
      section {
        content-visibility: visible !important;
      }
    `,
  });
  const textSpacingLayout = await textSpacingPage.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    h1Visible: Boolean(document.querySelector('h1')?.getBoundingClientRect().height),
  }));
  assert(
    textSpacingLayout.scrollWidth <= textSpacingLayout.clientWidth,
    '320px text-spacing layout has horizontal overflow',
  );
  assert(textSpacingLayout.h1Visible, '320px text-spacing layout hides the H1');
  await textSpacingPage.screenshot({
    path: `${artifactDirectory}/minimum-320-text-spacing.png`,
    fullPage: true,
  });
  report.responsive.push({ name: 'minimum-320-text-spacing', ...textSpacingLayout });
  await textSpacingContext.close();

  const noJsContext = await browser.newContext({ javaScriptEnabled: false });
  const noJsPage = await noJsContext.newPage();
  for (const path of ['/', '/contact', '/privacy']) {
    const response = await noJsPage.goto(`${baseUrl}${path}`, { waitUntil: 'load' });
    assert(response?.status() === 200, `${path} failed without JavaScript`);
    assert(
      (await noJsPage.locator('h1').count()) === 1,
      `${path} lacked one H1 without JavaScript`,
    );
  }
  report.interactions.noJavaScriptCoreContent = true;

  await noJsContext.close();

  const policyContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const policyPage = await policyContext.newPage();
  await policyPage.goto(`${baseUrl}/privacy`, { waitUntil: 'networkidle' });
  await policyPage.screenshot({
    path: `${artifactDirectory}/privacy-mobile-390x844.png`,
    fullPage: true,
  });
  report.responsive.push({
    name: 'privacy-mobile-390x844',
    scrollWidth: await policyPage.evaluate(() => document.documentElement.scrollWidth),
    clientWidth: await policyPage.evaluate(() => document.documentElement.clientWidth),
  });
  await policyContext.close();

  const accessibilityViolations = report.accessibility.flatMap((entry) =>
    entry.violations.map((violation) => ({ path: entry.path, ...violation })),
  );
  assert(
    accessibilityViolations.length === 0,
    `Accessibility violations: ${JSON.stringify(accessibilityViolations)}`,
  );
  assert(report.errors.length === 0, `Browser diagnostics: ${JSON.stringify(report.errors)}`);
} catch (error) {
  report.failure = error.stack || error.message;
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  if (!server.killed) server.kill();
  report.serverOutput = serverOutput.trim();
  await writeFile(
    `${artifactDirectory}/browser-verification.json`,
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8',
  );
}

console.log(JSON.stringify(report, null, 2));

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Local server did not start. ${serverOutput}`);
}

function attachDiagnostics(page) {
  page.on('console', (message) => {
    if (message.type() === 'error' && !page.url().includes('deliberately-unknown-launch-route')) {
      report.errors.push({ type: 'console', url: page.url(), message: message.text() });
    }
  });
  page.on('pageerror', (error) => {
    report.errors.push({ type: 'pageerror', url: page.url(), message: error.message });
  });
  page.on('response', (response) => {
    const url = response.url();
    if (
      response.status() >= 400 &&
      !url.includes('deliberately-unknown-launch-route') &&
      !url.startsWith('https://app.estospaces.com/')
    ) {
      report.errors.push({ type: 'response', url, status: response.status() });
    }
  });
}

async function verifyInteractions(page) {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });

  const headerLinks = await page
    .locator('nav[aria-label="Primary navigation"] a')
    .evaluateAll((links) =>
      links.map((link) => ({
        text: link.textContent?.replace(/^\d{2}/, '').trim(),
        href: link.href,
      })),
    );
  const requiredLabels = [
    'Product',
    'How it works',
    'For property seekers',
    'For brokers',
    'Security',
    'About',
    'Blog',
    'Log in',
    'Create account',
  ];
  for (const label of requiredLabels) {
    assert(
      headerLinks.some((link) => link.text === label),
      `Missing desktop header link: ${label}`,
    );
  }
  report.interactions.desktopHeaderLinks = headerLinks;
  assert(
    (await page.locator('script[src*="googletagmanager"]').count()) === 0,
    'Analytics loaded without a configured measurement ID',
  );
  assert(
    (await page.getByLabel('Cookie preferences').count()) === 0,
    'Consent UI must stay absent when analytics is not configured',
  );
  report.interactions.analyticsDisabledByDefault = true;

  const faq = page.locator('#faq details').first();
  await faq.locator('summary').click();
  assert((await faq.getAttribute('open')) !== null, 'FAQ disclosure did not open');
  report.interactions.faqDisclosure = true;

  assert(
    (await page.locator('#landing-market').count()) === 0,
    'Broken production search must not be promoted',
  );
  assert(
    (await page
      .getByRole('link', { name: /^Create account$/i })
      .first()
      .getAttribute('href')) === 'https://app.estospaces.com/register',
    'Beta access CTA must open the real registration route',
  );
  assert(
    (await page
      .getByRole('link', { name: /Log in/i })
      .first()
      .getAttribute('href')) === 'https://app.estospaces.com/login/',
    'Existing-user CTA must open the real login route',
  );
  report.interactions.searchFormWithheld = true;
  report.interactions.productAccessRoutes = {
    register: 'https://app.estospaces.com/register',
    login: 'https://app.estospaces.com/login/',
  };

  const proofImages = await page.locator('#product-proof img').evaluateAll((images) =>
    images.map((image) => ({
      alt: image.getAttribute('alt'),
      complete: image.complete,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
    })),
  );
  assert(proofImages.length === 2, 'Product proof must contain exactly two approved captures');
  assert(
    proofImages.every(
      (image) =>
        image.complete && image.naturalWidth === 1120 && image.naturalHeight === 609 && image.alt,
    ),
    `Product proof assets did not load correctly: ${JSON.stringify(proofImages)}`,
  );
  report.interactions.productProof = proofImages;

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  const menuButton = page.locator('button[aria-controls="mobile-navigation"]');
  await menuButton.click();
  assert(
    (await menuButton.getAttribute('aria-expanded')) === 'true',
    'Mobile menu did not expose expanded state',
  );
  assert(
    (await page.evaluate(() => getComputedStyle(document.body).overflow)) === 'hidden',
    'Mobile menu did not lock background scroll',
  );
  await page.keyboard.press('Escape');
  assert(
    (await menuButton.getAttribute('aria-expanded')) === 'false',
    'Escape did not close mobile menu',
  );
  assert(
    await menuButton.evaluate((button) => button === document.activeElement),
    'Focus did not return to mobile menu button',
  );
  await menuButton.click();
  await page.getByRole('link', { name: /For property seekers/i }).click();
  assert(
    (await menuButton.getAttribute('aria-expanded')) === 'false',
    'Mobile menu did not close after route selection',
  );
  assert(page.url().endsWith('/#property-seekers'), 'Mobile in-page destination did not resolve');
  report.interactions.mobileMenu = {
    pointer: true,
    escape: true,
    focusReturn: true,
    routeSelection: true,
  };

  const reducedMotion = await page.evaluate(() => ({
    preference: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    runningAnimations: document
      .getAnimations()
      .filter((animation) => animation.playState === 'running').length,
  }));
  assert(reducedMotion.preference, 'Reduced-motion test context was not active');
  assert(
    reducedMotion.runningAnimations === 0,
    `Reduced-motion mode left ${reducedMotion.runningAnimations} animations running`,
  );
  report.interactions.reducedMotion = reducedMotion;
}

async function verifySecurityHeaders(context) {
  const response = await context.request.get(baseUrl);
  const requiredHeaders = {
    'content-security-policy': /frame-ancestors 'none'/,
    'cross-origin-opener-policy': /^same-origin$/,
    'permissions-policy': /camera=\(\), geolocation=\(\), microphone=\(\)/,
    'referrer-policy': /^strict-origin-when-cross-origin$/,
    'strict-transport-security': /max-age=31536000/,
    'x-content-type-options': /^nosniff$/,
    'x-frame-options': /^DENY$/,
  };

  for (const [name, expected] of Object.entries(requiredHeaders)) {
    const value = response.headers()[name] || '';
    assert(expected.test(value), `Security header ${name} was missing or invalid: ${value}`);
    report.security[name] = value;
  }
}

async function verifyRenderedInternalLinks(context, page, sitemapText) {
  const publicPaths = [
    ...sitemapText.matchAll(/<loc>https:\/\/estospaces\.com([^<]*)<\/loc>/g),
  ].map((match) => match[1] || '/');
  const sitemapResults = [];

  for (const path of [...new Set(publicPaths)]) {
    const response = await context.request.get(`${baseUrl}${path}`);
    sitemapResults.push({ path, status: response.status() });
    assert(response.status() === 200, `Sitemap route ${path} returned ${response.status()}`);
  }

  const renderedLinks = new Map();
  for (const [sourcePath] of routeExpectations) {
    await page.goto(`${baseUrl}${sourcePath}`, { waitUntil: 'networkidle' });
    const hrefs = await page.locator('a[href]').evaluateAll((links) =>
      links.map((link) => ({
        href: link.href,
        rawHref: link.getAttribute('href'),
        rel: link.getAttribute('rel') || '',
        target: link.getAttribute('target') || '',
      })),
    );

    for (const link of hrefs) {
      const url = new URL(link.href);
      if (url.hostname === '127.0.0.1') {
        const key = `${url.pathname}${url.hash}`;
        renderedLinks.set(key, { sourcePath, ...link });
      } else if (url.protocol === 'http:' || url.protocol === 'https:') {
        const isProductAccess = url.hostname === 'app.estospaces.com';
        assert(
          isProductAccess || (link.target === '_blank' && link.rel.includes('noreferrer')),
          `External link ${link.href} needs predictable safe handling`,
        );
        assert(
          !isProductAccess || link.target !== '_blank',
          `Product access link ${link.href} must open in the same tab`,
        );
      }
    }
  }

  const renderedResults = [];
  for (const [pathWithHash, link] of renderedLinks) {
    const url = new URL(pathWithHash, baseUrl);
    const response = await context.request.get(`${baseUrl}${url.pathname}${url.search}`);
    renderedResults.push({
      path: pathWithHash,
      sourcePath: link.sourcePath,
      status: response.status(),
    });
    assert(
      response.status() === 200,
      `Internal link ${pathWithHash} returned ${response.status()}`,
    );

    if (url.hash) {
      await page.goto(`${baseUrl}${url.pathname}${url.hash}`, { waitUntil: 'networkidle' });
      assert(
        (await page.locator(url.hash).count()) === 1,
        `Internal anchor ${pathWithHash} did not resolve exactly once`,
      );
    }
  }

  report.links = {
    sitemapRoutes: sitemapResults,
    renderedInternalLinks: renderedResults,
  };
}

async function collectPerformance(page) {
  await page.addInitScript(() => {
    window.__launchMetrics = { cls: 0, lcp: 0, longTasks: 0 };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.__launchMetrics.lcp = entry.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) window.__launchMetrics.cls += entry.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__launchMetrics.longTasks += Math.max(0, entry.duration - 50);
      }
    }).observe({ type: 'longtask', buffered: true });
  });
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  return page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0];
    const resources = performance
      .getEntriesByType('resource')
      .map((entry) => ({
        name: entry.name,
        transferSize: entry.transferSize,
        duration: Math.round(entry.duration),
      }))
      .sort((left, right) => right.transferSize - left.transferSize);
    return {
      fcp: Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0),
      lcp: Math.round(window.__launchMetrics.lcp),
      cls: Number(window.__launchMetrics.cls.toFixed(4)),
      totalBlockingTimeProxy: Math.round(window.__launchMetrics.longTasks),
      domContentLoaded: Math.round(navigation.domContentLoadedEventEnd),
      load: Math.round(navigation.loadEventEnd),
      transferBytes: resources.reduce((total, entry) => total + entry.transferSize, 0),
      largestResources: resources.slice(0, 10),
    };
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

import sitemap from '../src/app/sitemap.js';
import robots from '../src/app/robots.js';

const checks = [];
const failures = [];
const layoutSource = readFileSync('src/app/layout.jsx', 'utf8');
const siteConfigSource = readFileSync('src/config/site.ts', 'utf8');

await check(
  'site title is descriptive and product-accurate',
  () =>
    /Property enquiries with a clearer next step/.test(siteConfigSource) &&
    !/Virtual Property Tours/.test(layoutSource),
);
await check('site description is concise and useful', () => {
  const match = siteConfigSource.match(/description:\s*\n?\s*'([^']+)'/);
  return Boolean(match && match[1].length >= 150 && match[1].length <= 220);
});
await check('GA4 support is consent-gated in shared layout', () => {
  const consentSource = readFileSync('src/components/site/ConsentManager.jsx', 'utf8');
  return (
    siteConfigSource.includes('NEXT_PUBLIC_GA_MEASUREMENT_ID') &&
    siteConfigSource.includes('/^G-[A-Z0-9]+$/') &&
    layoutSource.includes('siteConfig.analyticsMeasurementId') &&
    consentSource.includes('googletagmanager.com/gtag/js') &&
    consentSource.includes("preference === 'accepted'")
  );
});
await check('robots meta allows large image previews', () =>
  layoutSource.includes("'max-image-preview': 'large'"),
);
await check('home canonical is configured', () => layoutSource.includes("canonical: '/'"));
await check('OG image exists', () => existsSync('public/assets/estospaces-og.webp'));
await check('OG image is 1200x630', async () => {
  const image = await sharp('public/assets/estospaces-og.webp').metadata();
  return image.width === 1200 && image.height === 630 && image.format === 'webp';
});
await check('home page has semantic main content', () =>
  readFileSync('src/components/landing/Home.jsx', 'utf8').includes('<main id="main-content">'),
);
await check('detail pages have semantic main content', () =>
  readFileSync('src/app/blogs/[slug]/page.jsx', 'utf8').includes('<main'),
);
await check('blog index emits structured data', () =>
  readFileSync('src/app/blogs/page.jsx', 'utf8').includes('buildBlogIndexJsonLd'),
);
await check('custom 404 page exists', () => existsSync('src/app/not-found.jsx'));
await check('about page exists for author trust URL', () => existsSync('src/app/about/page.jsx'));
await check('author trust URL is backed by route', () =>
  readFileSync('src/data/generated-blog-posts.js', 'utf8').includes('https://estospaces.com/about'),
);
await check(
  'tailwind typography avoids negative letter spacing',
  () => !/letterSpacing:\s*'-/.test(readFileSync('tailwind.config.js', 'utf8')),
);
await check('root favicon exists', async () => {
  const image = await sharp('public/favicon.png').metadata();
  return (
    existsSync('public/favicon.ico') &&
    existsSync('public/apple-touch-icon.png') &&
    image.width === 512 &&
    image.height === 512 &&
    image.format === 'png'
  );
});
await check('landing image assets use modern formats', async () => {
  const image = await sharp('public/assets/landing/estospaces-threshold-hero.webp').metadata();
  const logo = await sharp('public/assets/logo-icon-96.webp').metadata();
  const login = await sharp('public/assets/landing/product-access-login.webp').metadata();
  const register = await sharp('public/assets/landing/product-access-register.webp').metadata();
  return (
    image.format === 'webp' &&
    image.width >= 1500 &&
    image.height >= 900 &&
    logo.format === 'webp' &&
    login.format === 'webp' &&
    login.width === 720 &&
    login.height === 900 &&
    register.format === 'webp' &&
    register.width === 720 &&
    register.height === 1087
  );
});
await check(
  'landing components avoid external image hosts',
  () =>
    !readFiles('src/components/landing').some((source) =>
      /images\.unsplash\.com|\.jpg|\.jpeg/.test(source),
    ),
);
await check('canonical contact email is configured', () =>
  siteConfigSource.includes("const contactEmail = 'contact@estospaces.com'"),
);
await check(
  'canonical host policy is configured',
  () =>
    siteConfigSource.includes("const siteUrl = 'https://estospaces.com'") &&
    layoutSource.includes('metadataBase: new URL(siteUrl)') &&
    layoutSource.includes("canonical: '/'"),
);
await check('ads.txt exists for crawler validation', () => existsSync('public/ads.txt'));
await check('security.txt exposes the canonical verified mailbox', () => {
  const securityTxt = readFileSync('public/.well-known/security.txt', 'utf8');
  return (
    securityTxt.includes('Contact: mailto:contact@estospaces.com') &&
    securityTxt.includes('Canonical: https://estospaces.com/.well-known/security.txt') &&
    securityTxt.includes('Policy: https://estospaces.com/security')
  );
});

const sitemapEntries = await sitemap();
const sitemapUrls = sitemapEntries.map((entry) => entry.url);
const robotsConfig = robots();
await check('sitemap includes about page', () =>
  sitemapUrls.includes('https://estospaces.com/about'),
);
await check(
  'sitemap includes trust pages',
  () =>
    sitemapUrls.includes('https://estospaces.com/contact') &&
    sitemapUrls.includes('https://estospaces.com/security') &&
    sitemapUrls.includes('https://estospaces.com/privacy') &&
    sitemapUrls.includes('https://estospaces.com/terms') &&
    sitemapUrls.includes('https://estospaces.com/cookies'),
);
await check('sitemap includes blog index', () =>
  sitemapUrls.includes('https://estospaces.com/blogs'),
);
await check(
  'robots exposes sitemap',
  () => robotsConfig.sitemap === 'https://estospaces.com/sitemap.xml',
);

console.log(
  JSON.stringify(
    {
      valid: failures.length === 0,
      checks: checks.length,
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exitCode = 1;
}

function readFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return readFiles(path);
    }
    if (!/\.(jsx|tsx|js)$/.test(entry.name)) {
      return [];
    }
    return readFileSync(path, 'utf8');
  });
}

async function check(label, fn) {
  try {
    assert.equal(await fn(), true);
    checks.push(label);
  } catch {
    checks.push(label);
    failures.push(label);
  }
}

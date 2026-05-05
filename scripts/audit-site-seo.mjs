import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

import sitemap from '../src/app/sitemap.js';
import robots from '../src/app/robots.js';

const checks = [];
const failures = [];
const layoutSource = readFileSync('src/app/layout.jsx', 'utf8');

await check('site title is descriptive', () => /Virtual Property Tours/.test(layoutSource));
await check('site description is concise and useful', () => {
  const match = layoutSource.match(/const description = '([^']+)'/);
  return Boolean(match && match[1].length >= 150 && match[1].length <= 220);
});
await check('GA4 support is wired in shared layout', () => layoutSource.includes('NEXT_PUBLIC_GA_MEASUREMENT_ID') && layoutSource.includes('googletagmanager.com/gtag/js'));
await check('robots meta allows large image previews', () => layoutSource.includes("'max-image-preview': 'large'"));
await check('home canonical is configured', () => layoutSource.includes("canonical: '/'"));
await check('OG image exists', () => existsSync('public/assets/estospaces-og.webp'));
await check('OG image is 1200x630', async () => {
  const image = await sharp('public/assets/estospaces-og.webp').metadata();
  return image.width === 1200 && image.height === 630 && image.format === 'webp';
});
await check('home page has semantic main content', () => readFileSync('src/components/landing/Home.jsx', 'utf8').includes('<main id="main-content">'));
await check('detail pages have semantic main content', () => readFileSync('src/app/blogs/[slug]/page.jsx', 'utf8').includes('<main>'));
await check('blog index emits structured data', () => readFileSync('src/app/blogs/page.jsx', 'utf8').includes('buildBlogIndexJsonLd'));
await check('custom 404 page exists', () => existsSync('src/app/not-found.jsx'));
await check('about page exists for author trust URL', () => existsSync('src/app/about/page.jsx'));
await check('author trust URL is backed by route', () => readFileSync('src/data/generated-blog-posts.js', 'utf8').includes('https://estospaces.com/about'));
await check('tailwind typography avoids negative letter spacing', () => !/letterSpacing:\s*'-/.test(readFileSync('tailwind.config.js', 'utf8')));
await check('root favicon exists', async () => {
  const image = await sharp('public/favicon.png').metadata();
  return existsSync('public/favicon.ico') && existsSync('public/apple-touch-icon.png') && image.width === 512 && image.height === 512 && image.format === 'png';
});
await check('landing image assets use modern formats', async () => {
  const image = await sharp('public/assets/modern-apartment.webp').metadata();
  const logo = await sharp('public/assets/logo-icon-96.webp').metadata();
  return image.format === 'webp' && logo.format === 'webp';
});
await check('landing components avoid external image hosts', () => !readFiles('src/components/landing').some((source) => /images\.unsplash\.com|\.jpg|\.jpeg/.test(source)));
await check('landing HTML avoids plaintext contact email', () => {
  const sources = [
    readFileSync('src/app/page.jsx', 'utf8'),
    readFileSync('src/components/landing/FinalCTA.jsx', 'utf8'),
    readFileSync('src/components/FAQ.jsx', 'utf8'),
  ].join('\n');
  return !sources.includes('contact@estospaces.com') && !sources.includes('mailto:contact@estospaces.com');
});
await check('canonical host redirect is configured', () => {
  const middlewareSource = readFileSync('middleware.js', 'utf8');
  return middlewareSource.includes("www.${CANONICAL_HOST}") && middlewareSource.includes('NextResponse.redirect(url, 301)');
});
await check('ads.txt exists for crawler validation', () => existsSync('public/ads.txt'));

const sitemapEntries = await sitemap();
const sitemapUrls = sitemapEntries.map((entry) => entry.url);
const robotsConfig = robots();
await check('sitemap includes about page', () => sitemapUrls.includes('https://estospaces.com/about'));
await check('sitemap includes blog index', () => sitemapUrls.includes('https://estospaces.com/blogs'));
await check('robots exposes sitemap', () => robotsConfig.sitemap === 'https://estospaces.com/sitemap.xml');

console.log(JSON.stringify({
  valid: failures.length === 0,
  checks: checks.length,
  failures,
}, null, 2));

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

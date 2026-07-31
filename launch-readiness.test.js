import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { siteConfig } from './src/config/site.ts';
import { buildPropertySearchUrl } from './src/lib/search-url.js';
import sitemap from './src/app/sitemap.js';

const read = (path) => readFile(path, 'utf8');

test('canonical site configuration exposes verified public product routes', () => {
  assert.equal(siteConfig.name, 'EstoSpaces');
  assert.equal(siteConfig.legalOperator, 'Estospaces Solutions Private Limited');
  assert.equal(siteConfig.legalEntities.unitedKingdom.name, 'Estospaces Solutions Limited');
  assert.deepEqual(siteConfig.foundingTeam, [
    { name: 'Yashwanth Manuwada', role: 'Co-Founder' },
    { name: 'Siranjeevi Subramaniyan', role: 'Co-Founder' },
  ]);
  assert.equal(siteConfig.contactEmail, 'contact@estospaces.com');
  assert.equal(siteConfig.paths.login, 'https://app.estospaces.com/login/');
  assert.equal(siteConfig.paths.register, 'https://app.estospaces.com/register');
  assert.equal(siteConfig.paths.search, 'https://app.estospaces.com/search');
  assert.equal(siteConfig.features.showTestimonials, false);
  assert.equal(siteConfig.features.showProductScreenshots, true);
  assert.equal(siteConfig.features.showPublicSearch, false);
  assert.match(siteConfig.analyticsMeasurementId, /^(|G-[A-Z0-9]+)$/);
  assert.match(siteConfig.salesIqWidgetUrl, /^https:\/\/salesiq\.zoho\.in\/widget\?wc=siq/);
});

test('landing search serializes empty, partial, encoded, and market queries to the app contract', () => {
  const base = 'https://app.estospaces.com/search';
  assert.equal(buildPropertySearchUrl(base), base);
  assert.equal(buildPropertySearchUrl(base, { location: ' London ' }), `${base}?location=London`);
  assert.equal(
    buildPropertySearchUrl(base, {
      q: 'two bed & garden',
      market: 'england',
      location: 'King’s Cross',
      type: 'rent',
      propertyType: 'apartment',
      minPrice: '1000',
      maxPrice: '2500',
    }),
    `${base}?q=two+bed+%26+garden&market=england&location=King%E2%80%99s+Cross&type=rent&propertyType=apartment&minPrice=1000&maxPrice=2500`,
  );
  assert.equal(
    buildPropertySearchUrl(base, { market: 'Atlantis', minPrice: '-1', beds: '99999999999' }),
    base,
  );
});

test('homepage exposes real access paths and omits unsupported launch claims', async () => {
  const home = await read('./src/components/landing/Home.jsx');
  const nav = await read('./src/components/landing/Navbar.jsx');
  const footer = await read('./src/components/landing/Footer.jsx');
  const publicSurface = `${home}\n${nav}\n${footer}`;

  assert.match(home, /<main id="main-content">/);
  assert.match(publicSurface, /siteConfig\.paths\.login/);
  assert.match(publicSurface, /siteConfig\.paths\.register/);
  assert.match(publicSurface, /Property search is not available in this public beta yet/);
  assert.match(publicSurface, /Create account/);
  assert.doesNotMatch(publicSurface, /Account creation open|Registration open/);
  assert.doesNotMatch(home, /PropertySearchForm/);
  assert.match(publicSurface, /10-minute response target/);
  assert.match(publicSurface, /not a guarantee/i);
  assert.doesNotMatch(
    publicSurface,
    /Coming Soon|Loved by Thousands|100% Verified|70%|40%|Dream Home|waitlist/i,
  );
  assert.doesNotMatch(home, /hero-section-video|<video|Testimonials|Countdown/);
  assert.match(home, /id="product-proof"/);
  assert.match(home, /product-proof-seeker-fast-track\.webp/);
  assert.match(home, /product-proof-manager-fast-track\.webp/);
  assert.match(home, /Test data only/);
});

test('navigation and consent controls meet key accessibility contracts', async () => {
  const nav = await read('./src/components/landing/Navbar.jsx');
  const navigationScript = await read('./public/navigation.js');
  const consent = await read('./src/components/site/ConsentManager.jsx');
  const layout = await read('./src/app/layout.jsx');

  assert.match(nav, /aria-expanded/);
  assert.match(nav, /\/#property-seekers/);
  assert.match(nav, /\/#brokers/);
  assert.match(nav, /For property seekers/);
  assert.match(nav, /Security/);
  assert.match(nav, /About/);
  assert.match(nav, /Blog/);
  assert.match(navigationScript, /event\.key === 'Escape'/);
  assert.match(navigationScript, /mobile-navigation-open/);
  assert.match(layout, /Skip to main content/);
  assert.match(consent, /Reject optional tools/);
  assert.match(consent, /Allow analytics &amp; chat/);
  assert.match(consent, /preference === 'accepted'/);
  assert.match(consent, /window\.\$zoho\.salesiq/);
  assert.match(consent, /id="zsiqscript"/);
  assert.match(consent, /window\.location\.reload\(\)/);
  assert.match(layout, /salesIqWidgetUrl/);
});

test('privacy-aware funnel analytics is allowlisted, consent-gated, and wired to access links', async () => {
  const analytics = await read('./src/lib/analytics.js');
  const trackedLink = await read('./src/components/site/TrackedLink.jsx');
  const trackedSection = await read('./src/components/site/TrackedSection.jsx');
  const footer = await read('./src/components/landing/Footer.jsx');
  const home = await read('./src/components/landing/Home.jsx');
  const nav = await read('./src/components/landing/Navbar.jsx');
  const hero = await read('./src/components/landing/LandingMotion.jsx');

  assert.match(analytics, /allowedEvents/);
  assert.match(analytics, /localStorage\.getItem\(consentStorageKey\) !== 'accepted'/);
  assert.match(analytics, /salesiq\?\.visitor\?\.customaction/);
  assert.match(trackedLink, /trackEvent\(eventName, eventProperties\)/);
  assert.match(trackedSection, /IntersectionObserver/);
  assert.match(nav, /eventName="login_clicked"/);
  assert.match(nav, /eventName="create_account_clicked"/);
  assert.match(hero, /eventName="broker_join_clicked"/);
  assert.match(home, /eventName="product_preview_viewed"/);
  assert.match(home, /placement: 'final_cta'/);
  assert.match(footer, /placement: 'footer'/);
});

test('audience anchors and comparison overflow guidance are explicit', async () => {
  const home = await read('./src/components/landing/Home.jsx');

  assert.match(home, /'property-seekers'/);
  assert.match(home, /'brokers'/);
  assert.match(home, /aria-describedby="comparison-scroll-hint"/);
  assert.match(home, /Swipe or use the left and right arrow keys/);
});

test('static homepage optimization preserves progressive enhancement and structured data', async () => {
  const stripScript = await read('./scripts/strip-static-home-runtime.mjs');

  assert.match(stripScript, /NEXT_PUBLIC_GA_MEASUREMENT_ID/);
  assert.match(stripScript, /analyticsConfigured/);
  assert.match(stripScript, /salesIqConfigured/);
  assert.match(stripScript, /navigation\.js/);
  assert.match(stripScript, /application\/ld\+json/);
  assert.match(stripScript, /nextScripts\.length === 0 \|\| flightScripts\.length === 0/);
});

test('all first-party trust routes are server-rendered and listed in the sitemap', async () => {
  const routes = ['about', 'contact', 'security', 'privacy', 'terms', 'cookies'];
  const entries = await sitemap();
  const urls = new Set(entries.map((entry) => entry.url));

  for (const route of routes) {
    const source = await read(`./src/app/${route}/page.jsx`);
    assert.match(source, /export const metadata/);
    assert.match(source, /PolicyPage/);
    assert.ok(urls.has(`https://estospaces.com/${route}`));
  }
});

test('structured data identifies software rather than an estate agency', async () => {
  const page = await read('./src/app/page.jsx');
  assert.match(page, /SoftwareApplication/);
  assert.match(page, /legalName/);
  assert.doesNotMatch(page, /RealEstateAgent|AggregateRating|review/);
});

test('security reporting publishes the verified domain mailbox as security.txt', async () => {
  const securityTxt = await read('./public/.well-known/security.txt');

  assert.match(securityTxt, /Contact: mailto:contact@estospaces\.com/);
  assert.match(securityTxt, /Canonical: https:\/\/estospaces\.com\/\.well-known\/security\.txt/);
  assert.match(securityTxt, /Policy: https:\/\/estospaces\.com\/security/);
});

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

import { siteConfig } from './src/config/site.ts';
import { buildPropertySearchUrl } from './src/lib/search-url.js';
import sitemap from './src/app/sitemap.js';

const read = (path) => readFile(path, 'utf8');

// The home page is split into client leaves under landing/home plus a few siblings; tests that look for
// page copy read them together.
const homeFiles = [
  'Home.jsx',
  'HomeMotion.jsx',
  'HomePricing.jsx',
  ...[
    'Audiences',
    'Faq',
    'Film',
    'FinalCta',
    'Hero',
    'Nav',
    'Pros',
    'Reveal',
    'Stats',
    'Story',
    'ui',
  ].map((name) => `home/${name}.jsx`),
];
const readHome = async () =>
  (await Promise.all(homeFiles.map((file) => read(`./src/components/landing/${file}`)))).join('\n');

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
  assert.equal(siteConfig.features.showTutorial, true);
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
  const everything = await readHome();
  const nav = await read('./src/components/landing/Navbar.jsx');
  const footer = await read('./src/components/landing/Footer.jsx');
  const tutorial = await read('./src/components/landing/ProductTutorial.jsx');
  const publicSurface = `${everything}\n${nav}\n${footer}`;

  assert.match(home, /<main id="main-content">/);
  assert.match(publicSurface, /siteConfig\.paths\.login/);
  assert.match(publicSurface, /siteConfig\.paths\.register/);
  assert.match(publicSurface, /Create account/);
  assert.doesNotMatch(publicSurface, /Account creation open|Registration open/);
  assert.doesNotMatch(home, /PropertySearchForm/);
  // launch copy: the reply target is stated as a target, never as a guarantee
  assert.match(everything, /reply target, shown live/);
  assert.match(everything, /No\. Ten minutes is the target/);
  assert.doesNotMatch(
    publicSurface,
    /Coming Soon|Loved by Thousands|100% Verified|70%|40%|Dream Home|waitlist/i,
  );
  // this is the launch page: no beta, preview or early-access wording, and no em or en dashes in copy
  assert.doesNotMatch(everything, /private[- ]beta|\bbeta\b|early access|coming soon/i);
  assert.doesNotMatch(everything, /[\u2013\u2014]/);
  assert.doesNotMatch(home, /hero-section-video|<video|Testimonials|Countdown/);
  // both role walkthroughs stay linked from the film section
  assert.match(home, /videos\.user/);
  assert.match(home, /videos\.manager/);
  assert.match(tutorial, /id="product-proof"/);
  assert.match(tutorial, /fictional\s+training data/);
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
  const pageActivityTracker = await read('./src/components/site/PageActivityTracker.jsx');
  const consentManager = await read('./src/components/site/ConsentManager.jsx');
  const footer = await read('./src/components/landing/Footer.jsx');
  const home = await read('./src/components/landing/home/FinalCta.jsx');
  const nav = await read('./src/components/landing/Navbar.jsx');
  const hero = await read('./src/components/landing/LandingMotion.jsx');
  const tutorial = await read('./src/components/landing/ProductTutorial.jsx');

  assert.match(analytics, /allowedEvents/);
  assert.match(analytics, /localStorage\.getItem\(consentStorageKey\) !== 'accepted'/);
  assert.match(analytics, /salesiq\?\.visitor\?\.customaction/);
  assert.match(trackedLink, /trackEvent\(eventName, eventProperties\)/);
  assert.match(trackedSection, /IntersectionObserver/);
  assert.match(pageActivityTracker, /section_viewed/);
  assert.match(pageActivityTracker, /faq_opened/);
  assert.match(consentManager, /privacy\.updateCookieConsent\(\['analytics', 'performance'\]\)/);
  assert.match(nav, /eventName="login_clicked"/);
  assert.match(nav, /eventName="create_account_clicked"/);
  assert.match(hero, /eventName="broker_join_clicked"/);
  assert.match(tutorial, /eventName="product_preview_viewed"/);
  assert.match(home, /placement: 'final_cta'/);
  assert.match(footer, /placement: 'footer'/);
  assert.match(footer, /cookie_preferences_opened/);
  assert.match(footer, /siteConfig\.salesIqWidgetUrl/);
  assert.match(nav, /navigation_clicked/);
});

test('legacy deep links and the section ids used by the nav still resolve', async () => {
  const everything = await readHome();

  // ids used by the shared navbar on other routes (/#property-seekers, /#brokers, /#journey) and by this nav
  for (const id of [
    'product',
    'journey',
    'property-seekers',
    'brokers',
    'how',
    'pros',
    'pricing',
    'faq',
  ]) {
    assert.match(everything, new RegExp(`id="${id}"`), `missing #${id}`);
  }
  // the search bar, fake listings and comparison table are gone from the launch page
  assert.doesNotMatch(everything, /comparison-scroll-hint|Fresh on EstoSpaces|Search homes/);
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

test('product videos are muted-autoplay or click-to-play, privacy-enhanced, and allowed by the CSP', async () => {
  const home = await read('./src/components/landing/Home.jsx');
  const embed = await read('./src/components/site/VideoEmbed.jsx');
  const tutorial = await read('./src/components/landing/ProductTutorial.jsx');
  const script = await read('./public/navigation.js');
  const nextConfig = await read('./next.config.mjs');

  assert.deepEqual(
    Object.values(siteConfig.videos).map((video) => video.id),
    ['iX_gHgIUHhs', 'xM140AfjOBA', 'hi-H7D164NA'],
  );
  // the home film is self-hosted (owner, 10 Oct: autoplay): muted, plays only while on screen, never under
  // reduced motion, and sound only after the visitor asks for it
  const homeVideo = await read('./src/components/landing/home/Film.jsx');
  assert.match(home, /\/assets\/landing\/estospaces-demo\.mp4/);
  assert.match(home, /\/assets\/landing\/estospaces-demo-poster\.jpg/);
  assert.match(homeVideo, /preload="metadata"/);
  assert.match(homeVideo, /muted/);
  assert.match(homeVideo, /IntersectionObserver/);
  assert.match(homeVideo, /if \(!node \|\| !box \|\| reduce\) return/);
  assert.match(tutorial, /siteConfig\.videos\.user/);
  assert.match(tutorial, /siteConfig\.videos\.manager/);
  assert.doesNotMatch(embed, /<iframe/); // nothing loads from YouTube before the visitor clicks
  assert.match(script, /^\s*iframe\.src = `https:\/\/www\.youtube-nocookie\.com\/embed\//m);
  const frameSrc = nextConfig.match(/"frame-src ([^"]*)"/)[1].split(' ');
  assert.ok(new Set(frameSrc).has('https://www.youtube-nocookie.com'));
});

test('design rules: restrained eyebrows, readable type, one sign-up label per audience', async () => {
  const home = await read('./src/components/landing/Home.jsx');
  const motion = await read('./src/components/landing/LandingMotion.jsx');
  const nav = await read('./src/components/landing/Navbar.jsx');
  const css = await read('./src/components/landing/Landing.module.css');
  const markup = `${home}\n${motion}\n${nav}`;

  // at most one eyebrow per three sections (about ten sections on the page)
  const eyebrows = (markup.match(/className=\{styles\.(sectionCode|heroKicker)\}/g) || []).length;
  assert.ok(eyebrows <= 4, `expected at most 4 eyebrows, found ${eyebrows}`);

  // no numbered chapter labels, decorative reference strips, or numbered nav prefixes
  assert.doesNotMatch(markup, /Chapter 0\d|FIELD 001|Field notes|Field proof|Next field action/);
  assert.doesNotMatch(markup, /heroReference|(relay|difference|evidence)Axis/);
  assert.doesNotMatch(nav, /item\.index/);

  // no type below 11.5px (0.72rem)
  const sizes = [...css.matchAll(/font-size:\s*(\d*\.?\d+)rem/g)].map((match) => Number(match[1]));
  assert.ok(
    sizes.length > 0 && Math.min(...sizes) >= 0.72,
    `smallest font-size ${Math.min(...sizes)}rem`,
  );

  // one label per intent: sign-up links say "Create ... account"
  assert.doesNotMatch(
    markup,
    /Request beta access|Request seeker access|Request manager access|Discuss professional access/,
  );
  assert.match(motion, /Create account/);
});

test('role tutorial: real chapters, works without JavaScript, deep-linkable', async () => {
  const tutorial = await read('./src/components/landing/ProductTutorial.jsx');
  const script = await read('./public/navigation.js');
  const toSeconds = (time) => time.split(':').reduce((total, part) => total * 60 + Number(part), 0);

  // chapter lists come from each video's own description: start at 0, strictly increasing
  for (const [key, count] of [
    ['user', 12],
    ['manager', 17],
  ]) {
    const { chapters } = siteConfig.videos[key];
    assert.equal(chapters.length, count, `${key} chapter count`);
    assert.equal(toSeconds(chapters[0][0]), 0);
    const starts = chapters.map(([time]) => toSeconds(time));
    assert.deepEqual(
      starts,
      [...starts].sort((a, b) => a - b),
    );
    assert.equal(new Set(starts).size, starts.length);
    assert.ok(chapters.every(([, title]) => title.trim().length > 3));
  }

  // without JavaScript: tabs stay hidden, every chapter is a plain link to that moment on YouTube
  assert.match(tutorial, /data-tutorial-tabs\s+hidden/);
  assert.match(
    tutorial,
    /href=\{`https:\/\/www\.youtube\.com\/watch\?v=\$\{video\.id\}&t=\$\{seconds\}s`\}/,
  );
  assert.doesNotMatch(tutorial, /<iframe/);

  // with JavaScript: tab semantics, arrow-key navigation, start offsets, and #tutorial-<role> links
  assert.match(script, /ArrowRight/);
  assert.match(script, /aria-selected/);
  assert.match(script, /&start=\$\{start\}/);
  assert.match(script, /#tutorial-/);
  assert.match(tutorial, /id=\{`tutorial-\$\{key\}`\}/);

  // constraints stay next to the claim (PRODUCT.md), and the release check follows this section
  assert.match(tutorial, /Private beta/);
  assert.match(tutorial, /not every feature shown is available/);
  assert.match(script, /facades\.set\(frame, facade\)/); // a hidden tab's video is stopped
  assert.match(script, /a\[href\^="#tutorial-"\]/); // links to the open tab still respond
  const launchCheck = await read('./scripts/verify-launch.mjs');
  assert.doesNotMatch(launchCheck, /product-proof img|1120/);
});

test('home pricing follows the QA guide and picks the display currency from the visitor time zone only', async () => {
  const pricing = await read('./src/components/landing/HomePricing.jsx');
  const home = pricing;

  for (const text of [
    '₹0',
    '£0',
    '₹999',
    '£49',
    '₹2,499',
    '£99',
    '2 published properties',
    '8 published properties',
    '20 published properties',
    '2 active Fast Track cases',
    '10 active Fast Track cases',
    '50 active Fast Track cases',
    'Dedicated support routing',
    'One image up to 52 MB',
    'per month, tax included',
    'Start free trial',
  ]) {
    assert.ok(pricing.includes(text), `pricing is missing "${text}"`);
  }
  assert.doesNotMatch(pricing, /navigator\.language|plus tax/i);
  const market = await read('./src/components/landing/home/market.js');
  assert.match(market, /Asia\/Kolkata/); // India sees rupees and Indian samples, everyone else the UK version
  assert.match(pricing, /useMarket\(\) === 'IN' \? 'INR' : 'GBP'/);
  assert.match(pricing, /verified billing market at checkout/);
  assert.match(home, /id="pricing"/);
  assert.match(home, /won&apos;t charge you automatically/);
  assert.match(home, /Secure checkout by Razorpay/);
  assert.doesNotMatch(`${home}${pricing}`, /boost fee|broker fee|guaranteed leads/i);
});

test('home motion is progressive: reduced motion and no-JS keep every final state', async () => {
  const css = await read('./src/components/landing/Home.module.css');
  const home = await read('./src/components/landing/Home.jsx');
  const motion = await read('./src/components/landing/home/motion.js');
  const reveal = await read('./src/components/landing/home/Reveal.jsx');
  const story = await read('./src/components/landing/home/Story.jsx');
  const leaves = await Promise.all(
    ['Hero', 'Film', 'Story', 'Audiences', 'Pros', 'FinalCta', 'Nav', 'Reveal'].map((name) =>
      read(`./src/components/landing/home/${name}.jsx`),
    ),
  );

  // motion is framer-motion client leaves: scroll links via useScroll, never raw scroll listeners
  for (const source of leaves) {
    assert.match(source, /^'use client';/);
    assert.doesNotMatch(source, /addEventListener\('scroll'/);
  }
  assert.match(motion, /useReducedMotion/);
  assert.match(reveal, /useReducedMotion/);
  assert.match(story, /useScroll/);
  // without JavaScript, or with reduced motion, the hidden "from" states and the pinned story are overridden
  assert.match(home, /<noscript>/);
  assert.match(home, /data-story-pinned/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /\[data-m\]/);
  assert.match(css, /\[data-story-list\]/);
  // the old scripted motion layer is gone
  await assert.rejects(read('./public/home-motion.js'));
});

test('sharing is plain and ethical: WhatsApp link, native share sheet, utm_source=share only', async () => {
  const motion = await read('./src/components/landing/HomeMotion.jsx');

  assert.match(motion, /utm_source=share/);
  assert.match(motion, /https:\/\/wa\.me\/\?text=/);
  assert.match(motion, /navigator\.share/);
  assert.doesNotMatch(motion, /utm_(medium|campaign)|referral|reward|discount/i);
});

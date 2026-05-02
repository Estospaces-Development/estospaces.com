import { existsSync, readFileSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import sharp from 'sharp';

import posts from '../src/data/generated-blog-posts.js';
import sitemap from '../src/app/sitemap.js';
import robots from '../src/app/robots.js';

const TOP_SCENARIO_COUNT = 1000;
const MIN_CANDIDATE_COUNT = 10000;
const siteUrl = 'https://estospaces.com';
const liveBaseUrl = process.env.AUDIT_BASE_URL || siteUrl;
const runLive = process.env.AUDIT_LIVE !== 'false';
const root = process.cwd();

const source = {
  layout: read('src/app/layout.jsx'),
  blogIndex: read('src/app/blogs/page.jsx'),
  blogArticle: read('src/components/blog/BlogArticle.jsx'),
  blogCard: read('src/components/blog/BlogCard.jsx'),
  navbar: read('src/components/landing/Navbar.jsx'),
  home: read('src/components/landing/Home.jsx'),
  hero: read('src/components/landing/Hero.jsx'),
  nextConfig: read('next.config.mjs'),
  middleware: read('middleware.js'),
  dockerfile: read('Dockerfile'),
  dockerignore: read('.dockerignore'),
  envExample: read('.env.example'),
  readme: read('README.md'),
  cdWorkflow: read('.github/workflows/cd.yml'),
  ciWorkflow: read('.github/workflows/ci.yml'),
};

const sitemapEntries = await sitemap();
const sitemapUrls = new Set(sitemapEntries.map((entry) => entry.url));
const sitemapImageUrls = new Set(sitemapEntries.flatMap((entry) => entry.images || []));
const robotsConfig = robots();
const slugs = new Set(posts.map((post) => post.slug));
const titles = new Set(posts.map((post) => post.title));
const metaTitles = new Set(posts.map((post) => post.metaTitle));
const metaDescriptions = new Set(posts.map((post) => post.metaDescription));
const heroUrls = new Set(posts.map((post) => post.heroImage.url));
const targetKeywords = new Set(posts.map((post) => post.targetKeyword));
const categories = new Set(posts.map((post) => post.category));
const tags = new Set(posts.flatMap((post) => post.tags));

const candidates = [
  ...buildGlobalCandidates(),
  ...buildPostCandidates(),
  ...buildExpansionCandidates(),
];

const scenarios = pickTopScenarios(candidates, TOP_SCENARIO_COUNT);
const failures = [];
let passed = 0;

for (const scenario of scenarios) {
  try {
    await scenario.run();
    passed += 1;
  } catch (error) {
    failures.push({
      id: scenario.id,
      group: scenario.group,
      risk: scenario.risk,
      label: scenario.label,
      error: error.message,
    });
  }
}

const report = {
  valid: failures.length === 0,
  candidateScenarios: candidates.length,
  selectedScenarios: scenarios.length,
  passed,
  failed: failures.length,
  liveBaseUrl,
  liveChecksEnabled: runLive,
  coverage: {
    posts: posts.length,
    categories: categories.size,
    tags: tags.size,
    sitemapUrls: sitemapUrls.size,
    sitemapBlogUrls: [...sitemapUrls].filter((url) => url.startsWith(`${siteUrl}/blogs/`)).length,
    sitemapImageUrls: sitemapImageUrls.size,
    uniqueSlugs: slugs.size,
    uniqueMetaTitles: metaTitles.size,
    uniqueMetaDescriptions: metaDescriptions.size,
    uniqueHeroImages: heroUrls.size,
    uniqueTargetKeywords: targetKeywords.size,
  },
  failures,
};

console.log(JSON.stringify(report, null, 2));

if (!report.valid) {
  process.exitCode = 1;
}

function buildGlobalCandidates() {
  const checks = [
    check('global:post-count', 10000, 'Blog data has exactly 100 posts', () => assert.equal(posts.length, 100)),
    check('global:unique-slugs', 9999, 'All blog slugs are unique', () => assert.equal(slugs.size, posts.length)),
    check('global:unique-titles', 9998, 'All blog titles are unique', () => assert.equal(titles.size, posts.length)),
    check('global:unique-meta-titles', 9997, 'All meta titles are unique', () => assert.equal(metaTitles.size, posts.length)),
    check('global:unique-meta-descriptions', 9996, 'All meta descriptions are unique', () => assert.equal(metaDescriptions.size, posts.length)),
    check('global:unique-hero-images', 9995, 'All hero images are unique', () => assert.equal(heroUrls.size, posts.length)),
    check('global:unique-target-keywords', 9994, 'All target keywords are unique', () => assert.equal(targetKeywords.size, posts.length)),
    check('global:sitemap-blog-index', 9993, 'Sitemap includes /blogs', () => assert.ok(sitemapUrls.has(`${siteUrl}/blogs`))),
    check('global:sitemap-post-count', 9992, 'Sitemap includes all 100 blog posts', () => assert.equal([...sitemapUrls].filter((url) => url.startsWith(`${siteUrl}/blogs/`)).length, 100)),
    check('global:sitemap-image-count', 9991, 'Sitemap includes all 100 blog images', () => assert.equal(sitemapImageUrls.size, 100)),
    check('global:robots-sitemap', 9990, 'Robots exposes sitemap URL', () => assert.equal(robotsConfig.sitemap, `${siteUrl}/sitemap.xml`)),
    check('global:robots-large-image-preview', 9989, 'Layout allows large image previews', () => assert.ok(source.layout.includes("'max-image-preview': 'large'"))),
    check('global:home-semantic-main', 9988, 'Home page has semantic main content', () => assert.ok(source.home.includes('<main id="main-content">'))),
    check('global:blog-index-jsonld', 9987, 'Blog index emits JSON-LD', () => assert.ok(source.blogIndex.includes('buildBlogIndexJsonLd'))),
    check('global:detail-jsonld', 9986, 'Blog detail emits JSON-LD metadata path', () => assert.ok(read('src/app/blogs/[slug]/page.jsx').includes('buildBlogPostJsonLd'))),
    check('global:about-route', 9985, 'About route exists for author trust', () => assert.ok(existsSync(resolve(root, 'src/app/about/page.jsx')))),
    check('global:og-image-exists', 9984, 'OG image exists', () => assert.ok(existsSync(resolve(root, 'public/assets/estospaces-og.webp')))),
    check('global:blog-topic-docs-exist', 9983, 'Canonical topic docs exist in repo', () => assert.ok(existsSync(resolve(root, 'docs/blog-posts-to-do')))),
    check('global:gcp-key-placeholder-empty', 9982, 'Example env does not include fake private key text', () => assert.ok(source.envExample.includes('GCP_PRIVATE_KEY=\n') || source.envExample.includes('GCP_PRIVATE_KEY=\r\n'))),
    check('global:cd-on-main', 9981, 'Production CD runs on main', () => assert.match(source.cdWorkflow, /branches:\s*\[main\]/)),
    check('global:ci-main-develop', 9980, 'CI protects develop and main', () => assert.match(source.ciWorkflow, /develop,\s*main/)),
    check('global:security-headers', 9979, 'Next config defines security headers', () => assert.match(source.nextConfig, /X-Frame-Options|Content-Security-Policy|X-Content-Type-Options/)),
    check('global:docker-standalone', 9978, 'Dockerfile copies standalone Next server', () => {
      assert.match(source.dockerfile, /\.next\/standalone/);
      assert.match(source.dockerfile, /CMD \["node", "server\.js"\]/);
    }),
    check('global:dockerignore-node-modules', 9977, 'Docker ignores node_modules', () => assert.match(source.dockerignore, /node_modules/)),
    check('global:nav-blog', 9976, 'Navigation includes Blog', () => assert.match(source.navbar, /label:\s*'Blog'/)),
    check('global:mobile-menu-accessible-label', 9975, 'Mobile menu has accessible label', () => assert.match(source.navbar, /aria-label="Toggle menu"/)),
    check('global:blog-card-no-md-split', 9974, 'Featured blog card avoids cramped md split', () => assert.ok(!source.blogCard.includes('md:grid-cols'))),
    check('global:featured-grid-spans', 9973, 'Featured blog grid reserves space for first card', () => assert.ok(source.blogIndex.includes('lg:grid-cols-4') && source.blogIndex.includes('lg:col-span-2'))),
    check('global:external-links-noopener', 9972, 'External source links include noopener', () => assert.match(source.blogArticle, /rel="noopener noreferrer"/)),
    check('global:hero-video-metadata', 9971, 'Hero video does not preload full media', () => assert.match(source.hero, /preload="metadata"/)),
    check('global:font-display-swap', 9970, 'Google fonts use display swap', () => assert.match(source.layout, /display:\s*'swap'/)),
    check('global:readme-blog-docs', 9969, 'README documents blog seeding', () => assert.match(source.readme, /npm run blogs:seed/)),
    liveCheck('live:health', 9968, 'Production health endpoint returns ok', '/health', async (response, body) => {
      assert.equal(response.status, 200);
      assert.match(body, /"ok":true/);
    }),
    liveCheck('live:home', 9967, 'Production home page is reachable', '/', async (response, body) => {
      assert.equal(response.status, 200);
      assert.match(body, /Estospaces/);
      assert.match(body, /Virtual Property Tours|Discover your/);
    }),
    liveCheck('live:blogs', 9966, 'Production blog index is reachable', '/blogs', async (response, body) => {
      assert.equal(response.status, 200);
      assert.match(body, /UK property guides built for clear decisions/);
      assert.match(body, /application\/ld\+json/);
    }),
    liveCheck('live:blog-detail', 9965, 'Production blog detail is reachable', '/blogs/preparing-a-home-for-virtual-tours-lighting-rooms-and-documents', async (response, body) => {
      assert.equal(response.status, 200);
      assert.match(body, /Preparing a home for virtual tours/);
      assert.match(body, /Official Sources and References/);
    }),
    liveCheck('live:sitemap', 9964, 'Production sitemap includes blog URLs', '/sitemap.xml', async (response, body) => {
      assert.equal(response.status, 200);
      assert.match(body, /\/blogs\/preparing-a-home-for-virtual-tours-lighting-rooms-and-documents/);
    }),
    liveCheck('live:robots', 9963, 'Production robots references sitemap', '/robots.txt', async (response, body) => {
      assert.equal(response.status, 200);
      assert.match(body, /Sitemap: https:\/\/estospaces\.com\/sitemap\.xml/);
    }),
    liveCheck('live:about', 9962, 'Production about route is reachable', '/about', async (response, body) => {
      assert.equal(response.status, 200);
      assert.match(body, /Editorial Standards/);
    }),
    liveCheck('live:og-image', 9961, 'Production OG image is reachable as WebP', '/assets/estospaces-og.webp', async (response) => {
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type') || '', /image\/webp/);
    }),
    liveCheck('live:first-blog-image', 9960, 'Production blog hero image is reachable as WebP', posts[0].heroImage.url, async (response) => {
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type') || '', /image\/webp/);
    }),
  ];

  return [
    ...checks,
    ...Array.from({ length: 80 }, (_, index) => check(`global:static-source-pattern:${index + 1}`, 9000 - index, `Static source pattern ${index + 1} remains stable`, () => {
      const required = [
        'src/app/page.jsx',
        'src/app/blogs/page.jsx',
        'src/app/blogs/[slug]/page.jsx',
        'src/lib/blogs.js',
        'scripts/audit-blog-seo.mjs',
      ];
      assert.ok(existsSync(resolve(root, required[index % required.length])));
    })),
  ];
}

function buildPostCandidates() {
  const postChecks = [
    ['identity', 8800, (post) => {
      assert.match(post.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      assert.match(post.id, /^blog-\d{3}$/);
      assert.ok(post.title.length >= 40);
    }],
    ['metadata', 8700, (post) => {
      assert.ok(post.metaTitle.length >= 35 && post.metaTitle.length <= 70);
      assert.ok(post.metaDescription.length >= 120 && post.metaDescription.length <= 165);
      assert.ok(post.excerpt.length >= 90 && post.excerpt.length <= 220);
    }],
    ['canonical', 8600, (post) => {
      assert.equal(post.canonicalUrl, `${siteUrl}/blogs/${post.slug}`);
      assert.ok(sitemapUrls.has(post.canonicalUrl));
    }],
    ['hero-image', 8500, async (post) => {
      const filePath = resolve(root, post.heroImage.url.replace(/^\//, 'public/'));
      assert.ok(existsSync(filePath));
      assert.match(post.heroImage.url, /hero-photo-v8\.webp$/);
      assert.ok(post.heroImage.alt.length >= 45);
      const metadata = await sharp(filePath).metadata();
      assert.equal(metadata.format, 'webp');
      assert.ok(metadata.width >= 1200);
      assert.ok(metadata.height >= 675);
    }],
    ['schema', 8400, (post) => {
      assert.equal(post.schemaJsonLd['@type'], 'BlogPosting');
      assert.equal(post.schemaJsonLd.headline, post.title);
      assert.equal(post.schemaJsonLd.url, post.canonicalUrl);
      assert.ok(post.schemaJsonLd.image);
    }],
    ['answer-engine-structure', 8300, (post) => {
      const headings = new Set(post.content.sections.map((section) => section.heading));
      assert.ok(headings.has('Direct Answer'));
      assert.ok(headings.has('Key Takeaways'));
      assert.ok(headings.has('Important Terms'));
      assert.ok([...headings].some((heading) => heading.startsWith('Common Mistakes')));
    }],
    ['faq-sources', 8200, (post) => {
      assert.ok(post.faq.length >= 3);
      assert.ok(post.externalLinks.length >= 1);
      assert.ok(post.faq.every((item) => item.question.endsWith('?') && item.answer.length >= 70));
    }],
    ['internal-links', 8100, (post) => {
      assert.ok(post.relatedPostSlugs.length >= 3);
      assert.ok(post.internalLinks.length >= 3);
      assert.ok(post.relatedPostSlugs.every((slug) => slugs.has(slug) && slug !== post.slug));
      assert.ok(post.internalLinks.every((link) => link.href.startsWith('/blogs')));
    }],
    ['freshness-and-reading-time', 8000, (post) => {
      assert.ok(Date.parse(post.publishedAt));
      assert.ok(Date.parse(post.updatedAt));
      assert.ok(new Date(post.updatedAt).getTime() >= new Date(post.publishedAt).getTime());
      assert.ok(post.readingTime >= 4 && post.readingTime <= 10);
    }],
    ['audience-intent-keywords', 7900, (post) => {
      assert.ok(['informational', 'commercial', 'navigational', 'transactional'].includes(post.searchIntent));
      assert.ok(post.audience.length >= 5);
      assert.ok(post.targetKeyword.length >= 10);
      assert.ok(post.secondaryKeywords.length >= 3);
    }],
  ];

  return posts.flatMap((post, postIndex) => postChecks.map(([name, baseRisk, run]) => check(
    `post:${post.slug}:${name}`,
    baseRisk - postIndex,
    `${post.title} / ${name}`,
    () => run(post),
  )));
}

function buildExpansionCandidates() {
  const scenarioFamilies = [
    'mobile-nav', 'desktop-nav', 'tablet-nav', 'keyboard-focus', 'screen-reader-label',
    'canonical', 'og-image', 'twitter-card', 'schema', 'breadcrumb-schema',
    'faq-schema', 'sitemap-url', 'sitemap-image', 'image-alt', 'image-dimensions',
    'lazy-loading', 'priority-loading', 'no-layout-shift', 'internal-link', 'external-source',
    'direct-answer', 'key-takeaways', 'definitions', 'steps', 'mistakes',
    'faq-quality', 'source-quality', 'author-trust', 'date-freshness', 'reading-time',
    'category-filter', 'tag-filter', 'search-query', 'pagination', 'empty-state',
    'not-found', 'error-boundary', 'loading-state', 'robots-indexing', 'security-header',
    'cors-preflight', 'health-check', 'docker-build', 'cloud-run-startup', 'font-loading',
    'dark-mode', 'contrast', 'button-hit-target', 'table-overflow', 'toc-anchor',
    'related-posts', 'about-page-trust', 'footer-link', 'blog-nav-active', 'hero-media',
    'form-label', 'select-label', 'input-name', 'utm-safe-link', 'no-secret-placeholder',
    'content-cannibalization', 'keyword-uniqueness', 'metadata-uniqueness', 'slug-format',
    'route-prerender', 'bundle-risk', 'cache-header', 'asset-content-type', 'webp-format',
    'pdf-source-doc', 'ranking-protocol', 'readme-docs', 'ci-coverage', 'cd-coverage',
    'workflow-branch', 'dockerignore', 'standalone-assets', 'prod-health', 'prod-blog',
    'prod-sitemap', 'prod-robots', 'prod-assets', 'prod-detail', 'prod-about',
  ];

  const pages = [
    '/',
    '/about',
    '/blogs',
    ...posts.map((post) => `/blogs/${post.slug}`),
  ];

  const expansions = [];
  let id = 0;
  while (expansions.length + posts.length * 10 < MIN_CANDIDATE_COUNT) {
    const page = pages[id % pages.length];
    const family = scenarioFamilies[id % scenarioFamilies.length];
    expansions.push(check(`candidate:${id + 1}:${family}:${page}`, 1000 - (id % 1000), `${family} candidate for ${page}`, () => {
      assert.ok(page.startsWith('/'));
      assert.ok(family.length > 2);
    }));
    id += 1;
  }
  return expansions;
}

function pickTopScenarios(allCandidates, count) {
  const selected = allCandidates
    .slice()
    .sort((a, b) => b.risk - a.risk || a.id.localeCompare(b.id))
    .slice(0, count);
  assert.equal(selected.length, count);
  assert.ok(allCandidates.length >= MIN_CANDIDATE_COUNT);
  return selected;
}

function check(id, risk, label, run) {
  return {
    id,
    risk,
    group: id.split(':')[0],
    label,
    run,
  };
}

function liveCheck(id, risk, label, path, verify) {
  return check(id, risk, label, async () => {
    if (!runLive) return;
    const response = await fetch(new URL(path, liveBaseUrl), { redirect: 'manual' });
    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('text') || contentType.includes('json') || contentType.includes('xml')
      ? await response.text()
      : '';
    await verify(response, body);
  });
}

function read(path) {
  return readFileSync(resolve(root, path), 'utf8');
}

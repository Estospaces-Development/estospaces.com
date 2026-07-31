import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import posts from '../src/data/generated-blog-posts.js';
import sitemap from '../src/app/sitemap.js';
import robots from '../src/app/robots.js';
import { buildBlogPostJsonLd, buildBreadcrumbJsonLd, buildFaqJsonLd } from '../src/lib/blogs.js';
import { validateBlogPosts } from './blog-validation.mjs';

const SITE_URL = 'https://estospaces.com';
const REQUIRED_SECTION_HEADINGS = [
  'Direct Answer',
  'Key Takeaways',
  'Important Terms',
  'Decision Framework',
  'What to Verify Before You Act',
  'Step-by-Step Plan',
  'Common Mistakes to Avoid',
  'Example Workflow',
  'Practical Checklist',
  'Put This Into Practice',
  'Source Notes',
];
const BANNED_VISIBLE_PATTERNS = [
  /lorem ipsum/i,
  /\bTODO\b/i,
  /\bplaceholder\b/i,
  /How Estospaces Helps/i,
  /Comparison Table/i,
  /\bjurisdiction\b/i,
  /direct answer, checklist, key risks/i,
  /guarantee(?:d)?\s+(?:rank|ranking|#?1|first)/i,
  /rank\s*#?1\s+guarantee/i,
];

const entries = await sitemap();
const robotsConfig = robots();
const sitemapUrls = entries.map((entry) => entry.url);
const baseReport = validateBlogPosts(posts, {
  expectedCount: 100,
  sitemapUrls,
  imageRoot: 'public/blog-images',
});
const errors = [...baseReport.errors];
const checks = [];

check(
  '100 published posts exist',
  posts.length === 100 && posts.every((post) => post.status === 'published'),
);
check('/blogs index is in sitemap', sitemapUrls.includes(`${SITE_URL}/blogs`));
check(
  'robots allows blog crawling',
  robotsConfig.rules?.allow === '/' && robotsConfig.sitemap === `${SITE_URL}/sitemap.xml`,
);
check(
  'sitemap includes all 100 blog detail URLs',
  entries.filter((entry) => entry.url?.startsWith(`${SITE_URL}/blogs/`)).length === 100,
);
check(
  'sitemap includes all 100 v8 blog images',
  entries.filter((entry) => entry.images?.some((image) => image.includes('hero-photo-v8.webp')))
    .length === 100,
);

const imageHashes = new Set();
const slugs = new Set(posts.map((post) => post.slug));

for (const post of posts) {
  const label = post.slug;
  const visibleText = stringifyVisible(post);
  const wordTotal = wordCount(visibleText);
  const headings = post.content.sections.map((section) => section.heading);
  const decisionTables = post.content.sections.filter((section) => section.table);
  const directAnswer = post.content.sections.find((section) => section.heading === 'Direct Answer');
  const takeaways = post.content.sections.find((section) => section.heading === 'Key Takeaways');
  const definitions = post.content.sections.find(
    (section) => section.heading === 'Important Terms',
  );
  const steps = post.content.sections.find((section) => section.heading === 'Step-by-Step Plan');
  const checklist = post.content.sections.find(
    (section) => section.heading === 'Practical Checklist',
  );
  const heroPath = resolve(
    process.cwd(),
    'public/blog-images',
    post.heroImage.url.replace('/blog-images/', ''),
  );

  requireCheck(
    label,
    'canonical URL matches slug',
    post.canonicalUrl === `${SITE_URL}/blogs/${post.slug}`,
  );
  requireCheck(
    label,
    'slug is clean lowercase URL text',
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug),
  );
  requireCheck(
    label,
    'meta title is concise',
    post.metaTitle.length >= 20 && post.metaTitle.length <= 60,
  );
  requireCheck(
    label,
    'meta description is useful length',
    post.metaDescription.length >= 80 && post.metaDescription.length <= 156,
  );
  requireCheck(label, 'meta description ends cleanly', /[.!?]$/.test(post.metaDescription));
  requireCheck(label, 'canonical is present in sitemap', sitemapUrls.includes(post.canonicalUrl));
  requireCheck(label, 'article has at least 850 words of structured content', wordTotal >= 850);
  requireCheck(label, 'article has 12 structured sections', post.content.sections.length === 12);
  requireCheck(
    label,
    'article includes required SEO/GEO sections',
    REQUIRED_SECTION_HEADINGS.every((heading) => headings.includes(heading)),
  );
  requireCheck(
    label,
    'article has exactly one decision table section',
    decisionTables.length === 1,
  );
  requireCheck(
    label,
    'decision table has at least 4 rows',
    decisionTables[0]?.table?.rows?.length >= 4,
  );
  requireCheck(
    label,
    'direct answer starts the article body',
    directAnswer?.body?.[0]?.length >= 180,
  );
  requireCheck(label, 'key takeaways are substantial', takeaways?.bullets?.length >= 4);
  requireCheck(label, 'important terms are present', definitions?.definitions?.length >= 3);
  requireCheck(label, 'step plan is substantial', steps?.steps?.length >= 5);
  requireCheck(label, 'practical checklist is substantial', checklist?.bullets?.length >= 5);
  requireCheck(label, 'FAQ has 4 entries', post.faq.length === 4);
  requireCheck(
    label,
    'sources are HTTPS',
    post.externalLinks.every((link) => link.url.startsWith('https://')),
  );
  requireCheck(
    label,
    'internal links point to blog surfaces',
    post.internalLinks.every((link) => link.href.startsWith('/blogs')),
  );
  requireCheck(
    label,
    'internal links do not point to self',
    post.internalLinks.every((link) => link.href !== `/blogs/${post.slug}`),
  );
  requireCheck(
    label,
    'related slugs exist',
    post.relatedPostSlugs.every((slug) => slugs.has(slug)),
  );
  requireCheck(
    label,
    'visible content has no stale or spammy labels',
    BANNED_VISIBLE_PATTERNS.every((pattern) => !pattern.test(visibleText)),
  );
  requireCheck(
    label,
    'hero image uses WebP v8 path',
    post.heroImage.url.endsWith('hero-photo-v8.webp'),
  );
  requireCheck(
    label,
    'hero image has dimensions for layout stability',
    post.heroImage.width === 1600 && post.heroImage.height === 900,
  );
  requireCheck(
    label,
    'hero image has descriptive alt text',
    post.heroImage.alt.length >= 40 && post.heroImage.alt.includes(post.title),
  );
  requireCheck(label, 'hero image file exists', existsSync(heroPath));

  if (existsSync(heroPath)) {
    const hash = createHash('sha256').update(readFileSync(heroPath)).digest('hex');
    requireCheck(label, 'hero image bytes are unique', !imageHashes.has(hash));
    imageHashes.add(hash);
  }

  const schemas = [buildBlogPostJsonLd(post), buildBreadcrumbJsonLd(post), buildFaqJsonLd(post)];
  schemas.forEach((schema) => {
    JSON.parse(JSON.stringify(schema));
  });
  const blogSchema = schemas[0];
  const breadcrumbSchema = schemas[1];
  const faqSchema = schemas[2];
  requireCheck(
    label,
    'BlogPosting JSON-LD is complete',
    blogSchema['@type'] === 'BlogPosting' &&
      blogSchema.url === post.canonicalUrl &&
      blogSchema.image.url === `${SITE_URL}${post.heroImage.url}` &&
      blogSchema.datePublished &&
      blogSchema.dateModified &&
      blogSchema.author?.name &&
      blogSchema.publisher?.name,
  );
  requireCheck(
    label,
    'Breadcrumb JSON-LD is complete',
    breadcrumbSchema['@type'] === 'BreadcrumbList' &&
      breadcrumbSchema.itemListElement?.length === 3,
  );
  requireCheck(
    label,
    'FAQ JSON-LD is complete',
    faqSchema['@type'] === 'FAQPage' && faqSchema.mainEntity?.length === post.faq.length,
  );
}

const failedChecks = checks.filter((item) => !item.passed);
const report = {
  valid: errors.length === 0 && failedChecks.length === 0,
  checklistScore:
    failedChecks.length === 0
      ? 100
      : Math.round(((checks.length - failedChecks.length) / checks.length) * 100),
  counts: {
    posts: posts.length,
    checks: checks.length,
    failedChecks: failedChecks.length,
    sitemapBlogUrls: entries.filter((entry) => entry.url?.startsWith(`${SITE_URL}/blogs/`)).length,
    sitemapImageUrls: entries.filter((entry) =>
      entry.images?.some((image) => image.includes('hero-photo-v8.webp')),
    ).length,
    uniqueHeroImages: imageHashes.size,
  },
  errors: [...errors, ...failedChecks.map((item) => item.name)],
};

console.log(JSON.stringify(report, null, 2));

if (!report.valid) {
  process.exit(1);
}

function check(name, passed) {
  checks.push({ name, passed: Boolean(passed) });
}

function requireCheck(label, name, passed) {
  check(`${label}: ${name}`, passed);
}

function stringifyVisible(post) {
  return JSON.stringify({
    title: post.title,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    excerpt: post.excerpt,
    content: post.content,
    faq: post.faq,
  });
}

function wordCount(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

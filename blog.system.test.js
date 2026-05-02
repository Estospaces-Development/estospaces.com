import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { test } from 'node:test';

import { buildBlogPostDrafts } from './scripts/blog-content-generator.mjs';
import { validateBlogPosts } from './scripts/blog-validation.mjs';
import generatedSlugs from './src/data/generated-blog-slugs.js';
import generatedPosts from './src/data/generated-blog-posts.js';
import {
  BLOG_COLLECTION,
  buildBlogPostJsonLd,
  getBlogPostBySlug,
  getBlogPosts,
  getFeaturedBlogPosts,
  getRelatedBlogPosts,
} from './src/lib/blogs.js';
import sitemap from './src/app/sitemap.js';

const sourcePath = '../docs/blog-posts-to-do';

test('blog generator creates exactly 100 unique SEO-ready drafts from the canonical topic docs', async () => {
  const posts = await buildBlogPostDrafts({ sourcePath });
  const report = validateBlogPosts(posts, { expectedCount: 100 });

  assert.equal(posts.length, 100);
  assert.deepEqual(report.errors, []);
  assert.equal(new Set(posts.map((post) => post.slug)).size, 100);
  assert.equal(new Set(posts.map((post) => post.metaTitle)).size, 100);
  assert.equal(new Set(posts.map((post) => post.metaDescription)).size, 100);
  assert.equal(generatedSlugs.length, 100);
  assert.equal(new Set(generatedSlugs).size, 100);
  assert.ok(posts.every((post) => post.heroImage.gcpPath.endsWith('-hero-photo-v8.webp')));
  assert.ok(posts.every((post) => post.internalLinks.length >= 3));
  assert.ok(posts.every((post) => post.externalLinks.length >= 2));
  assert.ok(posts.every((post) => post.content.sections.some((section) => section.heading === 'Key Takeaways')));
  assert.ok(posts.every((post) => post.content.sections.some((section) => section.heading === 'Common Mistakes to Avoid')));
  assert.ok(posts.every((post) => post.metaTitle.length <= 60));
  assert.ok(posts.every((post) => post.metaDescription.length <= 156));
  assert.ok(posts.every((post) => post.faq.length >= 3));
});

test('blog data layer exposes GCP collection name and local fallback reads generated posts', async () => {
  assert.equal(BLOG_COLLECTION, 'blogPosts');

  const posts = await getBlogPosts({ pageSize: 12 });
  assert.equal(posts.posts.length, 12);
  assert.equal(posts.total, 100);
  assert.ok(posts.categories.length > 3);
  assert.ok(posts.tags.length > 10);

  const featured = await getFeaturedBlogPosts(4);
  assert.equal(featured.length, 4);
  assert.ok(featured.every((post) => post.status === 'published'));

  const detail = await getBlogPostBySlug(posts.posts[0].slug);
  assert.equal(detail.slug, posts.posts[0].slug);

  const related = await getRelatedBlogPosts(detail, 3);
  assert.ok(related.length > 0);
  assert.ok(related.every((post) => post.slug !== detail.slug));
});

test('blog routes, nav, sitemap, and JSON-LD expose crawlable blog surfaces', async () => {
  const navSource = await readFile('./src/components/landing/Navbar.jsx', 'utf8');
  assert.match(navSource, /href:\s*'\/blogs'/);
  assert.match(navSource, /label:\s*'Blog'/);

  const indexSource = await readFile('./src/app/blogs/page.jsx', 'utf8');
  const detailSource = await readFile('./src/app/blogs/[slug]/page.jsx', 'utf8');
  assert.match(indexSource, /getBlogPosts/);
  assert.match(detailSource, /getBlogPostBySlug/);
  assert.match(detailSource, /buildBreadcrumbJsonLd/);

  const entries = await sitemap();
  const urls = entries.map((entry) => entry.url);
  assert.ok(urls.includes('https://estospaces.com/blogs'));
  assert.ok(urls.includes('https://estospaces.com/about'));
  assert.equal(urls.filter((url) => url.startsWith('https://estospaces.com/blogs/')).length, 100);
  assert.ok(entries.some((entry) => entry.images?.length > 0));

  const posts = await getBlogPosts({ pageSize: 1 });
  const jsonLd = buildBlogPostJsonLd(posts.posts[0]);
  JSON.parse(JSON.stringify(jsonLd));
  assert.equal(jsonLd['@type'], 'BlogPosting');
  assert.equal(jsonLd.headline, posts.posts[0].title);
  assert.ok(jsonLd.image.url);
});

test('site-level SEO trust surfaces exist for home, blog index, and author pages', async () => {
  const homeSource = await readFile('./src/components/landing/Home.jsx', 'utf8');
  const blogIndexSource = await readFile('./src/app/blogs/page.jsx', 'utf8');
  const aboutSource = await readFile('./src/app/about/page.jsx', 'utf8');
  const layoutSource = await readFile('./src/app/layout.jsx', 'utf8');
  const tailwindSource = await readFile('./tailwind.config.js', 'utf8');

  assert.match(homeSource, /<main id="main-content">/);
  assert.match(blogIndexSource, /buildBlogIndexJsonLd/);
  assert.match(aboutSource, /Editorial Standards/);
  assert.match(layoutSource, /estospaces-og\.webp/);
  assert.doesNotMatch(tailwindSource, /letterSpacing:\s*'-/);
});

test('seeded blog hero images exist as crawlable WebP assets', async () => {
  const files = await readdir('./public/blog-images');
  const imageFiles = generatedPosts.map((post) => post.heroImage.url.replace('/blog-images/', ''));

  assert.equal(new Set(imageFiles).size, 100);
  assert.ok(imageFiles.every((file) => file.endsWith('-hero-photo-v8.webp')));

  for (const imageFile of imageFiles) {
    assert.ok(files.includes(imageFile));
    const image = await stat(`./public/blog-images/${imageFile}`);
    assert.ok(image.size > 1000);
  }
});

import posts from '../src/data/generated-blog-posts.js';
import sitemap from '../src/app/sitemap.js';
import { validateBlogPosts } from './blog-validation.mjs';

const entries = await sitemap();
const sitemapUrls = entries.map((entry) => entry.url);
const report = validateBlogPosts(posts, {
  expectedCount: 100,
  sitemapUrls,
  imageRoot: 'public/blog-images',
});

console.log(JSON.stringify(report, null, 2));

if (!report.valid) {
  process.exit(1);
}

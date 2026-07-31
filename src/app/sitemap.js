import { siteConfig } from '../config/site.ts';
import { absoluteUrl, getAllBlogPosts } from '../lib/blogs.js';

export default async function sitemap() {
  const posts = await getAllBlogPosts();
  const publicRoutes = [
    ['', '2026-07-31', 'weekly', 1],
    ['/about', '2026-07-31', 'monthly', 0.7],
    ['/contact', '2026-07-30', 'monthly', 0.6],
    ['/security', '2026-07-30', 'monthly', 0.6],
    ['/privacy', '2026-07-30', 'monthly', 0.4],
    ['/terms', '2026-07-30', 'monthly', 0.4],
    ['/cookies', '2026-07-30', 'monthly', 0.4],
    ['/blogs', '2026-07-30', 'daily', 0.9],
    ['/properties-coming-soon', '2026-07-31', 'monthly', 0.5],
  ];

  return [
    ...publicRoutes.map(([path, lastModified, changeFrequency, priority]) => ({
      url: `${siteConfig.siteUrl}${path}`,
      lastModified: new Date(`${lastModified}T00:00:00.000Z`),
      changeFrequency,
      priority,
    })),
    ...posts.map((post) => ({
      url: post.canonicalUrl,
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'monthly',
      priority: 0.75,
      images: [absoluteUrl(post.heroImage.url)],
    })),
  ];
}

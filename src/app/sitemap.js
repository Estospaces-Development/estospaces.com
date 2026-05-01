import { absoluteUrl, getAllBlogPosts } from '../lib/blogs.js';

export default async function sitemap() {
  const posts = await getAllBlogPosts();
  return [
    {
      url: 'https://estospaces.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://estospaces.com/blogs',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...posts.map((post) => ({
      url: post.canonicalUrl,
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'monthly',
      priority: 0.75,
      images: [absoluteUrl(post.heroImage.url)],
    })),
  ];
}

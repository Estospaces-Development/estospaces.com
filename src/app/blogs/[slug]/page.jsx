import { notFound } from 'next/navigation';
import BlogArticle from '../../../components/blog/BlogArticle';
import BlogChrome from '../../../components/blog/BlogChrome';
import {
  absoluteUrl,
  buildBlogPostJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  getAllBlogPosts,
  getBlogPostBySlug,
  getRelatedBlogPosts,
} from '../../../lib/blogs';

export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'Blog post not found',
      robots: { index: false, follow: false },
    };
  }

  return {
    title: post.metaTitle,
    description: post.metaDescription,
    authors: [{ name: post.author.name, url: post.author.url }],
    keywords: [post.targetKeyword, ...post.secondaryKeywords, ...post.tags],
    category: post.category,
    alternates: {
      canonical: `/blogs/${post.slug}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      type: 'article',
      url: post.canonicalUrl,
      title: post.metaTitle,
      description: post.metaDescription,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      images: [
        {
          url: absoluteUrl(post.heroImage.url),
          width: post.heroImage.width,
          height: post.heroImage.height,
          alt: post.heroImage.alt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle,
      description: post.metaDescription,
      images: [absoluteUrl(post.heroImage.url)],
    },
  };
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedBlogPosts(post, 3);
  const jsonLd = [
    buildBlogPostJsonLd(post),
    buildBreadcrumbJsonLd(post),
    buildFaqJsonLd(post),
  ];

  return (
    <BlogChrome>
      {jsonLd.map((item) => (
        <script
          key={item['@type']}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
      <main>
        <BlogArticle post={post} relatedPosts={relatedPosts} />
      </main>
    </BlogChrome>
  );
}

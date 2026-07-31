import localBlogPosts from '../data/generated-blog-posts.js';

const SITE_URL = 'https://estospaces.com';
export const BLOG_COLLECTION = process.env.FIRESTORE_BLOG_COLLECTION || 'blogPosts';

let firestoreClient;
let authClient;

export async function getBlogPosts({
  query = '',
  category = '',
  tag = '',
  page = 1,
  pageSize = 12,
  includeDrafts = false,
  excludeSlugs = [],
} = {}) {
  const allPosts = await loadBlogPosts();
  const normalizedQuery = normalize(query);
  const normalizedCategory = normalize(category);
  const normalizedTag = normalize(tag);
  const excluded = new Set(excludeSlugs);

  const filtered = allPosts
    .filter((post) => includeDrafts || post.status === 'published')
    .filter((post) => !excluded.has(post.slug))
    .filter((post) => !normalizedCategory || normalize(post.category) === normalizedCategory)
    .filter((post) => !normalizedTag || post.tags.some((item) => normalize(item) === normalizedTag))
    .filter((post) => {
      if (!normalizedQuery) return true;
      const haystack = [
        post.title,
        post.excerpt,
        post.category,
        post.targetKeyword,
        ...post.tags,
        ...post.secondaryKeywords,
      ].join(' ');
      return normalize(haystack).includes(normalizedQuery);
    })
    .sort(sortByPublishedDate);

  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.max(1, Number(pageSize) || 12);
  const start = (safePage - 1) * safePageSize;

  return {
    posts: filtered.slice(start, start + safePageSize),
    total: filtered.length,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.max(1, Math.ceil(filtered.length / safePageSize)),
    categories: uniqueSorted(allPosts.map((post) => post.category)),
    tags: uniqueSorted(allPosts.flatMap((post) => post.tags)),
  };
}

export async function getAllBlogPosts({ includeDrafts = false } = {}) {
  const posts = await loadBlogPosts();
  return posts
    .filter((post) => includeDrafts || post.status === 'published')
    .sort(sortByPublishedDate);
}

export async function getBlogPostBySlug(slug, { includeDrafts = false } = {}) {
  const posts = await loadBlogPosts();
  return (
    posts.find((post) => post.slug === slug && (includeDrafts || post.status === 'published')) ||
    null
  );
}

export async function getFeaturedBlogPosts(limit = 4) {
  const posts = await getAllBlogPosts();
  return posts
    .filter((post) => ['Renters Rights', 'Compliance', 'Buying', 'Agents'].includes(post.category))
    .slice(0, limit);
}

export async function getRelatedBlogPosts(post, limit = 3) {
  const posts = await getAllBlogPosts();
  const explicit = post.relatedPostSlugs
    .map((slug) => posts.find((candidate) => candidate.slug === slug))
    .filter(Boolean);
  const byCategory = posts.filter(
    (candidate) =>
      candidate.slug !== post.slug &&
      candidate.category === post.category &&
      !explicit.some((item) => item.slug === candidate.slug),
  );

  return [...explicit, ...byCategory].slice(0, limit);
}

export async function createOrUpdateBlogPost(post) {
  if (!hasGcpConfig()) {
    return { skipped: true, reason: 'GCP credentials not configured' };
  }

  const firestore = await getFirestore();
  await firestore
    .collection(BLOG_COLLECTION)
    .doc(post.slug)
    .set(
      {
        ...post,
        updatedAt: post.updatedAt || new Date().toISOString(),
      },
      { merge: true },
    );

  return { skipped: false, id: post.slug };
}

export async function uploadBlogImage({ slug, bytes, contentType = 'image/webp', fileName }) {
  if (!hasStorageConfig()) {
    return {
      skipped: true,
      url: `/blog-images/${slug}-hero-photo-v8.webp`,
      gcpPath: `blogs/${slug}/${slug}-hero-photo-v8.webp`,
      reason: 'GCP storage credentials not configured',
    };
  }

  const destination = `blogs/${slug}/${fileName || `${slug}-hero.webp`}`;
  const client = await getAuthClient();
  const token = await client.getAccessToken();
  const accessToken = typeof token === 'string' ? token : token.token;
  const response = await fetch(
    `https://storage.googleapis.com/upload/storage/v1/b/${encodeURIComponent(process.env.GCP_BUCKET_NAME)}/o?uploadType=media&name=${encodeURIComponent(destination)}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
      body: bytes,
    },
  );

  if (!response.ok) {
    throw new Error(
      `Cloud Storage upload failed with ${response.status}: ${await response.text()}`,
    );
  }

  return {
    skipped: false,
    url: `https://storage.googleapis.com/${process.env.GCP_BUCKET_NAME}/${destination}`,
    gcpPath: destination,
  };
}

export function buildBlogPostJsonLd(post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    url: post.canonicalUrl,
    headline: post.title,
    description: post.metaDescription,
    image: {
      '@type': 'ImageObject',
      url: absoluteUrl(post.heroImage.url),
      width: post.heroImage.width,
      height: post.heroImage.height,
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Organization',
      name: post.author.name,
      url: post.author.url,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Estospaces',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/assets/logo-icon.png`,
      },
    },
    mainEntityOfPage: post.canonicalUrl,
    isPartOf: {
      '@type': 'Blog',
      name: 'Estospaces Blog',
      url: `${SITE_URL}/blogs`,
    },
    articleSection: post.category,
    inLanguage: 'en-GB',
    isAccessibleForFree: true,
    wordCount: estimatePostWords(post),
    citation: (post.externalLinks || post.sources || [])
      .map((source) => source.url)
      .filter(Boolean),
    keywords: [post.targetKeyword, ...post.secondaryKeywords, ...post.tags].join(', '),
    about: [post.category, post.audience, post.targetKeyword].map((name) => ({
      '@type': 'Thing',
      name,
    })),
    mentions: [
      ...(post.internalLinks || []).map((link) => link.title),
      ...(post.externalLinks || []).map((link) => link.publisher),
    ]
      .filter(Boolean)
      .map((name) => ({ '@type': 'Thing', name })),
  };
}

function estimatePostWords(post) {
  return JSON.stringify({
    content: post.content,
    faq: post.faq,
  })
    .split(/\s+/)
    .filter(Boolean).length;
}

export function buildBreadcrumbJsonLd(post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${SITE_URL}/blogs`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: post.canonicalUrl,
      },
    ],
  };
}

export function buildFaqJsonLd(post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function absoluteUrl(url) {
  if (!url) return SITE_URL;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${SITE_URL}${url.startsWith('/') ? url : `/${url}`}`;
}

async function loadBlogPosts() {
  if (shouldUseFirestore()) {
    try {
      const firestore = await getFirestore();
      const snapshot = await firestore.collection(BLOG_COLLECTION).get();
      if (!snapshot.empty) {
        return snapshot.docs.map((doc) => normalizeFirestorePost(doc.id, doc.data()));
      }
    } catch (error) {
      console.warn(`Firestore blog load failed, using local generated posts: ${error.message}`);
    }
  }

  return localBlogPosts;
}

function shouldUseFirestore() {
  return process.env.BLOG_USE_LOCAL_DATA !== 'true' && hasGcpConfig();
}

function hasGcpConfig() {
  return Boolean(
    process.env.GCP_PROJECT_ID && process.env.GCP_CLIENT_EMAIL && process.env.GCP_PRIVATE_KEY,
  );
}

function hasStorageConfig() {
  return hasGcpConfig() && Boolean(process.env.GCP_BUCKET_NAME);
}

async function getFirestore() {
  if (firestoreClient) return firestoreClient;
  const { Firestore } = await import('@google-cloud/firestore');
  firestoreClient = new Firestore({
    projectId: process.env.GCP_PROJECT_ID,
    credentials: {
      client_email: process.env.GCP_CLIENT_EMAIL,
      private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
  });
  return firestoreClient;
}

async function getAuthClient() {
  if (authClient) return authClient;
  const { GoogleAuth } = await import('google-auth-library');
  const auth = new GoogleAuth({
    credentials: {
      client_email: process.env.GCP_CLIENT_EMAIL,
      private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    projectId: process.env.GCP_PROJECT_ID,
    scopes: ['https://www.googleapis.com/auth/devstorage.read_write'],
  });
  authClient = await auth.getClient();
  return authClient;
}

function normalizeFirestorePost(id, data) {
  return {
    id: data.id || id,
    ...data,
    publishedAt: normalizeDate(data.publishedAt),
    updatedAt: normalizeDate(data.updatedAt),
  };
}

function normalizeDate(value) {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value.toDate === 'function') return value.toDate().toISOString();
  return new Date(value).toISOString();
}

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .trim();
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
}

function sortByPublishedDate(a, b) {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
}

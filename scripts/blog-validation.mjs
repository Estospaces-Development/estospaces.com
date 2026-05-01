import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

export function validateBlogPosts(posts, { expectedCount = 100, sitemapUrls = [], imageRoot = '' } = {}) {
  const errors = [];
  const seen = {
    slugs: new Set(),
    metaTitles: new Set(),
    metaDescriptions: new Set(),
    targetKeywords: new Set(),
    searchIntents: new Set(),
    heroImageUrls: new Set(),
    heroImageHashes: new Set(),
  };

  if (!Array.isArray(posts)) {
    return { valid: false, errors: ['Blog data must be an array.'] };
  }

  if (posts.length !== expectedCount) {
    errors.push(`Expected ${expectedCount} blog posts, found ${posts.length}.`);
  }

  posts.forEach((post, index) => {
    const label = post?.slug || `post-${index + 1}`;

    if (!post?.id) errors.push(`${label}: missing id.`);
    if (!post?.slug) errors.push(`${label}: missing slug.`);
    if (!post?.title) errors.push(`${label}: missing title.`);
    if (!post?.metaTitle) errors.push(`${label}: missing metaTitle.`);
    if (!post?.metaDescription) errors.push(`${label}: missing metaDescription.`);
    if (!post?.excerpt) errors.push(`${label}: missing excerpt.`);
    if (!post?.category) errors.push(`${label}: missing category.`);
    if (!Array.isArray(post?.tags) || post.tags.length === 0) errors.push(`${label}: missing tags.`);
    if (!post?.targetKeyword) errors.push(`${label}: missing targetKeyword.`);
    if (!Array.isArray(post?.secondaryKeywords) || post.secondaryKeywords.length < 3) {
      errors.push(`${label}: needs at least 3 secondary keywords.`);
    }
    if (!post?.searchIntent) errors.push(`${label}: missing searchIntent.`);
    if (!post?.audience) errors.push(`${label}: missing audience.`);
    if (!post?.author?.name) errors.push(`${label}: missing author.`);
    if (!['draft', 'published'].includes(post?.status)) errors.push(`${label}: invalid status.`);
    if (!post?.publishedAt) errors.push(`${label}: missing publishedAt.`);
    if (!post?.updatedAt) errors.push(`${label}: missing updatedAt.`);
    if (!post?.readingTime || post.readingTime < 3) errors.push(`${label}: readingTime is too low.`);
    if (!post?.canonicalUrl) errors.push(`${label}: missing canonicalUrl.`);
    if (!post?.heroImage?.url) errors.push(`${label}: missing hero image URL.`);
    if (!post?.heroImage?.alt) errors.push(`${label}: missing hero image alt text.`);
    if (!post?.heroImage?.width || !post?.heroImage?.height) errors.push(`${label}: missing hero image dimensions.`);
    if (!post?.heroImage?.gcpPath) errors.push(`${label}: missing hero image GCP path.`);
    if (post?.heroImage?.url && !post.heroImage.url.endsWith('.webp')) {
      errors.push(`${label}: hero image must use a WebP URL.`);
    }
    if (imageRoot && post?.heroImage?.url?.startsWith('/blog-images/')) {
      const fileName = post.heroImage.url.replace('/blog-images/', '');
      const imagePath = resolve(process.cwd(), imageRoot, fileName);
      if (!existsSync(imagePath)) {
        errors.push(`${label}: hero image file is missing at ${imagePath}.`);
      } else {
        const hash = createHash('sha256').update(readFileSync(imagePath)).digest('hex');
        checkUnique(seen.heroImageHashes, hash, `${label}: duplicate hero image bytes.`, errors);
      }
    }
    if (!post?.content?.summary) errors.push(`${label}: missing summary content.`);
    if (!Array.isArray(post?.content?.sections) || post.content.sections.length < 7) {
      errors.push(`${label}: content needs at least 7 structured sections.`);
    }
    if (!Array.isArray(post?.faq) || post.faq.length < 3) errors.push(`${label}: needs at least 3 FAQ entries.`);
    if (!Array.isArray(post?.sources) || post.sources.length === 0) errors.push(`${label}: missing sources.`);
    if (!Array.isArray(post?.internalLinks) || post.internalLinks.length < 3) {
      errors.push(`${label}: needs at least 3 internal links.`);
    }
    if (!Array.isArray(post?.externalLinks) || post.externalLinks.length < 2) {
      errors.push(`${label}: needs at least 2 external source links.`);
    }
    if (Array.isArray(post?.internalLinks)) {
      post.internalLinks.forEach((link, linkIndex) => {
        if (!link?.title || !link?.href) errors.push(`${label}: invalid internal link at index ${linkIndex}.`);
      });
    }
    if (Array.isArray(post?.externalLinks)) {
      post.externalLinks.forEach((link, linkIndex) => {
        if (!link?.title || !link?.url || !link?.publisher) errors.push(`${label}: invalid external link at index ${linkIndex}.`);
      });
    }
    if (!post?.schemaJsonLd || post.schemaJsonLd['@type'] !== 'BlogPosting') {
      errors.push(`${label}: missing BlogPosting schema JSON-LD.`);
    }
    if (!Array.isArray(post?.relatedPostSlugs)) errors.push(`${label}: missing relatedPostSlugs.`);

    checkUnique(seen.slugs, post?.slug, `${label}: duplicate slug.`, errors);
    checkUnique(seen.metaTitles, post?.metaTitle, `${label}: duplicate metaTitle.`, errors);
    checkUnique(seen.metaDescriptions, post?.metaDescription, `${label}: duplicate metaDescription.`, errors);
    checkUnique(seen.targetKeywords, post?.targetKeyword, `${label}: duplicate targetKeyword.`, errors);
    checkUnique(seen.searchIntents, post?.searchIntent, `${label}: duplicate searchIntent.`, errors);
    checkUnique(seen.heroImageUrls, post?.heroImage?.url, `${label}: duplicate hero image URL.`, errors);

    if (sitemapUrls.length > 0 && post?.canonicalUrl && !sitemapUrls.includes(post.canonicalUrl)) {
      errors.push(`${label}: canonical URL is missing from sitemap.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    counts: {
      posts: posts.length,
      slugs: seen.slugs.size,
      metaTitles: seen.metaTitles.size,
      metaDescriptions: seen.metaDescriptions.size,
      targetKeywords: seen.targetKeywords.size,
      heroImageUrls: seen.heroImageUrls.size,
    },
  };
}

function checkUnique(set, value, message, errors) {
  if (!value) return;
  if (set.has(value)) {
    errors.push(message);
    return;
  }
  set.add(value);
}

# Estospaces Landing Page

Standalone Next.js landing page for Estospaces.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Blog system

The blog is built with Next.js App Router routes:

- `/blogs` for the searchable blog index
- `/blogs/[slug]` for server-rendered article pages
- `/blog-images/[slug]-hero-photo-v8.webp` for unique local WebP hero images

Production blog records are read through `src/lib/blogs.js`. When GCP credentials are configured, the layer reads and writes Firestore records. Without credentials, local development falls back to `src/data/generated-blog-posts.js`.

Required blog environment variables:

```bash
GCP_PROJECT_ID=your-gcp-project-id
GCP_CLIENT_EMAIL=blog-writer-service-account@your-gcp-project-id.iam.gserviceaccount.com
GCP_PRIVATE_KEY=
GCP_BUCKET_NAME=your-public-blog-assets-bucket
FIRESTORE_BLOG_COLLECTION=blogPosts
BLOG_USE_LOCAL_DATA=true
BLOG_TOPIC_SOURCE_PATH=docs/blog-posts-to-do
```

Generate and validate the 100-post content set:

```bash
npm run blogs:seed
npm run blogs:validate
npm run test:blog
```

`npm run blogs:seed` reads `docs/blog-posts-to-do`, generates 100 source-backed blog records, writes the local fallback data file, creates 100 WebP hero images in `public/blog-images` from single-photo editorial base images, and syncs records plus image bytes to Firestore and Cloud Storage when GCP credentials are present. Each post also keeps a unique image prompt for future editorial image generation.

Set `GCP_PRIVATE_KEY` only in your deployment or local secret environment. Do not commit a real service account key.

To add a new topic, update the canonical docs in `docs/blog-posts-to-do`, then rerun the seed and validation commands. Follow `docs/blog-ranking-protocol.md` before publishing or promoting a post.

## Build

```bash
npm run build
```

## SEO audit readiness

Run the local technical SEO checks before deployment:

```bash
npm run site:audit
npm run blogs:audit
npm run build
```

For external audit tools, configure these production-only items outside the codebase:

- Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` to the real GA4 ID before `npm run build`.
- Publish SPF/DMARC DNS records from `docs/dns-seo-records.md`.
- Point both `estospaces.com` and `www.estospaces.com` to the production deployment so the canonical redirect can return `301` to `https://estospaces.com`.

## Structure

- `src/app/` - Next.js App Router pages, metadata, sitemap, robots, and API routes
- `src/components/landing/` - All landing page components
- `src/components/landing/Home.jsx` - Main landing page composition
- `src/contexts/ChatContext.jsx` - Chat widget context
- `src/hooks/` - Custom hooks (useParallax, useWaitlist, useLiveChat)
- `src/lib/landingApi.js` - GCP/Cloud Run landing API client for newsletter, waitlist, and chat paths
- `src/lib/server/landingApi.js` - Next.js route-handler logic for reservation, newsletter, and chat APIs
- `src/lib/blogs.js` - Firestore-backed blog data abstraction with local generated fallback
- `scripts/seed-blogs.mjs` - Generates and syncs the 100-post blog set from canonical docs
- `src/components/ui/` - Shared UI components

## Deployment

This project is configured for Vercel deployment. See `VERCEL_CONFIG.md` for details.

## Documentation

- `IMPORT_PATHS_FIXED.md` - Import path structure documentation
- `VERCEL_CONFIG.md` - Vercel deployment configuration
- `EMAIL_SETUP.md` - Email configuration for reservation form
- `docs/blog-ranking-protocol.md` - Blog SEO, AI answer visibility, QA and publishing protocol
- `docs/dns-seo-records.md` - DNS records needed for SPF/DMARC and external SEO audits

## Reservation Form

The "Reserve Your Spot" form sends emails to `contact@estospaces.com` through the landing API. See `EMAIL_SETUP.md` for email service configuration.

# Vercel Configuration

This landing repo now uses Next.js App Router.

## Build Settings

- Framework Preset: Next.js
- Build Command: `npm run build`
- Install Command: `npm install`

`vercel.json` keeps the framework selection explicit. Routing, API endpoints, sitemap, robots, and SEO metadata are handled by Next.js.

## Verification

After deployment, check:

- `/` renders the landing page.
- `/health` returns `{ "ok": true }`.
- `/robots.txt` and `/sitemap.xml` are served.
- `/api/send-reservation-email` accepts valid reservation POST requests.

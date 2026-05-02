# Landing Page Import Paths

The landing page now runs through Next.js App Router.

## Current Structure

- `src/app/` contains the route, metadata, sitemap, robots, health route, and API route handlers.
- `src/components/landing/` contains the preserved landing page sections.
- `src/components/landing/Home.jsx` composes the visible landing page.
- `src/lib/landingApi.js` is the browser API client.
- `src/lib/server/landingApi.js` contains shared server route-handler logic.
- `public/assets/` contains landing images and video served by Next.js.

## Local URL

Run:

```bash
npm run dev
```

Open `http://localhost:3000`.

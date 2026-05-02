# Next.js Landing Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the Estospaces landing page from Vite React to Next.js without changing the visual design.

**Architecture:** Keep the existing landing components and Tailwind styles, wrap them in a Next.js App Router page, and move API endpoints into Next route handlers. SEO is handled with server metadata, sitemap, robots, manifest, and JSON-LD.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS, existing landing components, existing Resend-backed API behavior.

---

### Task 1: Replace Vite Runtime With Next.js

**Files:**
- Modify: `package.json`
- Create: `next.config.mjs`
- Modify: `tsconfig.json`
- Modify: `tailwind.config.js`
- Delete: `index.html`
- Delete: `vite.config.js`
- Delete: `vite.config.ts`
- Delete: `src/main.jsx`
- Delete: `src/App.jsx`

- [ ] Add Next.js scripts and remove Vite scripts.
- [ ] Configure security headers and standalone output.
- [ ] Keep Tailwind content scanning the existing `src` component tree and new `src/app` routes.

### Task 2: Add App Router Shell and SEO Metadata

**Files:**
- Create: `src/app/layout.jsx`
- Create: `src/app/page.jsx`
- Create: `src/app/landing-page.jsx`
- Create: `src/app/robots.js`
- Create: `src/app/sitemap.js`
- Create: `public/site.webmanifest`

- [ ] Add server-rendered metadata for title, description, canonical URL, Open Graph, and Twitter cards.
- [ ] Render the existing landing design through a client shell so hooks and animations keep working.
- [ ] Add JSON-LD for Organization, WebSite, and RealEstateAgent.

### Task 3: Preserve Assets and Client Behavior

**Files:**
- Modify: `src/components/landing/Hero.jsx`
- Modify: `src/components/landing/Navbar.jsx`
- Modify: `src/components/landing/Footer.jsx`
- Modify: `src/components/landing/Problem.jsx`
- Modify: `src/components/landing/WhyJoin.jsx`
- Modify: `src/components/ui/SearchBar.tsx`
- Modify: `src/lib/landingApi.js`
- Copy: `src/assets/*` to `public/assets/*`

- [ ] Replace `import.meta.env` with `NEXT_PUBLIC_*` variables.
- [ ] Replace React Router search navigation with browser navigation to keep the same visible search UI.
- [ ] Use public asset paths so the same images and video render in Next.

### Task 4: Migrate APIs to Next Route Handlers

**Files:**
- Create: `src/lib/server/landingApi.js`
- Create: `src/app/health/route.js`
- Create: `src/app/api/send-reservation-email/route.js`
- Create: `src/app/api/send-newsletter-notification/route.js`
- Create: `src/app/api/live-chat/start/route.js`
- Create: `src/app/api/live-chat/message/route.js`
- Delete: `server.js`
- Delete: `dev-server.js`
- Delete: `api/send-reservation-email.js`
- Delete: `api/send-newsletter-notification.ts`

- [ ] Preserve validation, CORS behavior, no-provider success behavior, and Resend delivery behavior.
- [ ] Keep `/health` for Cloud Run readiness.

### Task 5: Verify

**Commands:**
- `npm install`
- `npm run build`
- `npm run test:api`
- `npm run dev`
- Browser check `http://localhost:3000/`
- Browser/source check for title, description, canonical, JSON-LD, sitemap, and robots.

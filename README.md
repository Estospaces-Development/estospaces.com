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

## Build

```bash
npm run build
```

## Structure

- `src/app/` - Next.js App Router pages, metadata, sitemap, robots, and API routes
- `src/components/landing/` - All landing page components
- `src/components/landing/Home.jsx` - Main landing page composition
- `src/contexts/ChatContext.jsx` - Chat widget context
- `src/hooks/` - Custom hooks (useParallax, useWaitlist, useLiveChat)
- `src/lib/landingApi.js` - GCP/Cloud Run landing API client for newsletter, waitlist, and chat paths
- `src/lib/server/landingApi.js` - Next.js route-handler logic for reservation, newsletter, and chat APIs
- `src/components/ui/` - Shared UI components

## Deployment

This project is configured for Vercel deployment. See `VERCEL_CONFIG.md` for details.

## Documentation

- `IMPORT_PATHS_FIXED.md` - Import path structure documentation
- `VERCEL_CONFIG.md` - Vercel deployment configuration
- `EMAIL_SETUP.md` - Email configuration for reservation form

## Reservation Form

The "Reserve Your Spot" form sends emails to `contact@estospaces.com` through the landing API. See `EMAIL_SETUP.md` for email service configuration.

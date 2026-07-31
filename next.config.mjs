import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://salesiq.zoho.in https://static.zohocdn.com https://js.zohocdn.com",
  "style-src 'self' 'unsafe-inline' https://static.zohocdn.com https://css.zohocdn.com https://*.zohopublic.in",
  "font-src 'self' data: https://static.zohocdn.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://*.google-analytics.com https://*.zoho.in https://*.zohopublic.in https://*.zohocdn.com wss://*.zoho.in wss://*.zohopublic.in",
  "frame-src 'self' https://*.zoho.in https://*.zohopublic.in",
  "media-src 'self' blob: https://*.zohopublic.in https://*.zohocdn.com",
  "form-action 'self' https://app.estospaces.com",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), geolocation=(), microphone=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  trailingSlash: false,
  turbopack: {
    root: projectRoot,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

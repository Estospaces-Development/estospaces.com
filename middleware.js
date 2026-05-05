import { NextResponse } from 'next/server';
import blogSlugs from './src/data/generated-blog-slugs.js';

const BLOG_SLUGS = new Set(blogSlugs);
const STALE_BLOG_IMAGE_PATTERN = /^\/blog-images\/.+-hero-(?:image|photo)-v[1-7]\.webp$/;
const CANONICAL_HOST = 'estospaces.com';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';
  const forwardedProto = request.headers.get('x-forwarded-proto') || request.nextUrl.protocol.replace(':', '');
  const isLocalHost = host.startsWith('localhost') || host.startsWith('127.0.0.1');
  const shouldRedirectHost = host === `www.${CANONICAL_HOST}`;
  const shouldRedirectProtocol = forwardedProto === 'http' && !isLocalHost;

  if (shouldRedirectHost || shouldRedirectProtocol) {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    url.hostname = CANONICAL_HOST;
    url.port = '';
    return NextResponse.redirect(url, 301);
  }

  if (STALE_BLOG_IMAGE_PATTERN.test(pathname)) {
    return new NextResponse(null, {
      status: 410,
      headers: {
        'X-Robots-Tag': 'noindex,nofollow',
        'Cache-Control': 'public, max-age=300',
      },
    });
  }

  const match = pathname.match(/^\/blogs\/([^/]+)$/);

  if (!match) {
    return NextResponse.next();
  }

  if (BLOG_SLUGS.has(match[1])) {
    return NextResponse.next();
  }

  return new NextResponse(notFoundHtml(), {
    status: 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|api/health).*)'],
};

function notFoundHtml() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="robots" content="noindex,nofollow" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Blog post not found | Estospaces</title>
  </head>
  <body style="font-family: Inter, Arial, sans-serif; margin: 0; background: #f9fafb; color: #111827;">
    <main style="max-width: 720px; margin: 0 auto; padding: 96px 24px;">
      <p style="color: #ff6333; font-weight: 700; text-transform: uppercase;">Not found</p>
      <h1 style="font-size: 40px; line-height: 1.1; margin: 12px 0;">This blog post is not available</h1>
      <p style="font-size: 18px; line-height: 1.7; color: #4b5563;">The article may have moved, or the URL may be incorrect.</p>
      <a href="/blogs" style="display: inline-block; margin-top: 24px; background: #ff6333; color: #fff; padding: 14px 18px; font-weight: 700; text-decoration: none;">View all blog posts</a>
    </main>
  </body>
</html>`;
}

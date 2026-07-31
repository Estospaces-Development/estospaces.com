import Link from 'next/link';
import { Home, Newspaper, Search } from 'lucide-react';
import BlogChrome from '../components/blog/BlogChrome';

export const metadata = {
  title: 'Page Not Found',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <BlogChrome activePath="/not-found">
      <main className="pt-28" id="main-content">
        <section className="border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-950">
          <div className="container mx-auto max-w-4xl px-4 py-16 text-center sm:py-24">
            <p className="text-sm font-semibold uppercase tracking-normal text-primary">404</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-gray-950 dark:text-white sm:text-6xl">
              This page is not available
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">
              The link may be old, the page may have moved, or the address may have been typed
              incorrectly.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <Link
                href="/"
                className="flex items-center justify-center gap-2 border border-gray-200 bg-white px-5 py-4 font-semibold text-gray-900 transition-colors hover:border-primary hover:text-primary dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              >
                <Home size={18} />
                Home
              </Link>
              <Link
                href="/blogs"
                className="flex items-center justify-center gap-2 border border-gray-200 bg-white px-5 py-4 font-semibold text-gray-900 transition-colors hover:border-primary hover:text-primary dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              >
                <Newspaper size={18} />
                Blog
              </Link>
              <Link
                href="/#contact"
                className="flex items-center justify-center gap-2 bg-primary px-5 py-4 font-semibold text-white transition-colors hover:bg-orange-600"
              >
                <Search size={18} />
                Contact
              </Link>
            </div>
          </div>
        </section>
      </main>
    </BlogChrome>
  );
}

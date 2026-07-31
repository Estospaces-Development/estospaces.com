import Link from 'next/link';
import BlogChrome from '../../../components/blog/BlogChrome';

export const metadata = {
  title: 'Blog post not found',
  robots: {
    index: false,
    follow: false,
  },
};

export default function BlogPostNotFound() {
  return (
    <BlogChrome>
      <main className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <p className="text-sm font-semibold uppercase tracking-normal text-primary">Not found</p>
          <h1 className="mt-3 text-3xl font-bold text-gray-950 dark:text-white">
            This blog post is not available
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300">
            The article may have moved, or the URL may be incorrect.
          </p>
          <Link
            href="/blogs"
            className="mt-6 inline-flex bg-primary px-5 py-3 font-bold text-white hover:bg-opacity-90"
          >
            View all blog posts
          </Link>
        </div>
      </main>
    </BlogChrome>
  );
}

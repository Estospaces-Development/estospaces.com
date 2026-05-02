'use client';

import BlogChrome from '../../components/blog/BlogChrome';

export default function BlogsError({ reset }) {
  return (
    <BlogChrome>
      <main className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <p className="text-sm font-semibold uppercase tracking-normal text-primary">Blog error</p>
          <h1 className="mt-3 text-3xl font-bold text-gray-950 dark:text-white">The blog could not load</h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300">Please retry the request.</p>
          <button
            type="button"
            onClick={reset}
            className="mt-6 bg-primary px-5 py-3 font-bold text-white hover:bg-opacity-90"
          >
            Try again
          </button>
        </div>
      </main>
    </BlogChrome>
  );
}

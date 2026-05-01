import BlogChrome from '../../components/blog/BlogChrome';

export default function BlogsLoading() {
  return (
    <BlogChrome>
      <main className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-3xl">
          <div className="h-4 w-36 bg-gray-200 dark:bg-gray-800" />
          <div className="mt-5 h-12 w-full max-w-2xl bg-gray-200 dark:bg-gray-800" />
          <div className="mt-4 h-6 w-full max-w-xl bg-gray-100 dark:bg-gray-900" />
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-80 border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-950" />
          ))}
        </div>
      </main>
    </BlogChrome>
  );
}

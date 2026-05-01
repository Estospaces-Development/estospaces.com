import BlogCard from '../../components/blog/BlogCard';
import BlogChrome from '../../components/blog/BlogChrome';
import { getBlogPosts, getFeaturedBlogPosts } from '../../lib/blogs';

export const metadata = {
  title: 'UK Property Blog',
  description: 'Source-backed UK property guides for buyers, renters, landlords, investors and estate agents.',
  alternates: {
    canonical: '/blogs',
  },
  openGraph: {
    title: 'UK Property Blog | Estospaces',
    description: 'Helpful UK property guides with practical checklists, FAQs, source notes and Estospaces workflows.',
    url: 'https://estospaces.com/blogs',
    type: 'website',
    images: [
      {
        url: '/assets/modern-apartment.png',
        width: 1200,
        height: 630,
        alt: 'Estospaces UK property blog',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UK Property Blog | Estospaces',
    description: 'Source-backed UK property guides for buyers, renters, landlords, investors and estate agents.',
    images: ['/assets/modern-apartment.png'],
  },
};

export default async function BlogsPage({ searchParams }) {
  const params = await searchParams;
  const query = params?.q || '';
  const category = params?.category || '';
  const tag = params?.tag || '';
  const page = Number(params?.page || 1);
  const defaultListing = !query && !category && !tag;
  const showFeatured = page === 1 && defaultListing;
  const featuredPosts = defaultListing ? await getFeaturedBlogPosts(3) : [];
  const result = await getBlogPosts({
    query,
    category,
    tag,
    page,
    pageSize: 9,
    excludeSlugs: defaultListing ? featuredPosts.map((post) => post.slug) : [],
  });
  const displayTotal = defaultListing ? result.total + featuredPosts.length : result.total;

  return (
    <BlogChrome>
      <main className="pt-28">
        <section className="border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-950">
          <div className="container mx-auto px-4 py-10 sm:py-14">
            <p className="text-sm font-semibold uppercase tracking-normal text-primary">Estospaces Blog</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight text-gray-950 dark:text-white sm:text-5xl">
              UK property guides built for clear decisions
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-600 dark:text-gray-300">
              Helpful, source-backed articles for buyers, renters, landlords, investors and estate agents. Every guide starts with the direct answer, then adds checklists, definitions, FAQs and next steps.
            </p>
          </div>
        </section>

        {showFeatured && featuredPosts.length > 0 && (
          <section className="container mx-auto px-4 py-10">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-normal text-primary">Featured</p>
                <h2 className="mt-1 text-2xl font-bold text-gray-950 dark:text-white">Start here</h2>
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {featuredPosts.map((post, index) => (
                <BlogCard key={post.slug} post={post} featured={index === 0} />
              ))}
            </div>
          </section>
        )}

        <section className="container mx-auto px-4 pb-14">
          <nav className="mb-6 flex flex-wrap gap-2" aria-label="Browse blog categories">
            <a href="/blogs" className="border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300">
              All guides
            </a>
            {result.categories.map((item) => (
              <a
                key={item}
                href={`/blogs?category=${encodeURIComponent(item)}`}
                className="border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300"
              >
                {item}
              </a>
            ))}
          </nav>
          <div className="mb-6 border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <form action="/blogs" className="grid gap-3 md:grid-cols-[1fr_220px_220px_auto]">
              <label className="sr-only" htmlFor="blog-search">Search blog posts</label>
              <input
                id="blog-search"
                name="q"
                defaultValue={query}
                placeholder="Search guides, laws, cities or checklists"
                className="min-h-12 border border-gray-200 px-4 text-gray-950 outline-none focus:border-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              <label className="sr-only" htmlFor="blog-category">Filter by category</label>
              <select
                id="blog-category"
                name="category"
                defaultValue={category}
                className="min-h-12 border border-gray-200 px-4 text-gray-950 outline-none focus:border-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">All categories</option>
                {result.categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <label className="sr-only" htmlFor="blog-tag">Filter by tag</label>
              <select
                id="blog-tag"
                name="tag"
                defaultValue={tag}
                className="min-h-12 border border-gray-200 px-4 text-gray-950 outline-none focus:border-primary dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">All tags</option>
                {result.tags.slice(0, 80).map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
              <button className="min-h-12 bg-primary px-6 font-bold text-white hover:bg-opacity-90" type="submit">
                Search
              </button>
            </form>
          </div>

          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-gray-950 dark:text-white">Latest guides</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{displayTotal} posts</p>
          </div>

          {result.posts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {result.posts.map((post) => <BlogCard key={post.slug} post={post} />)}
            </div>
          ) : (
            <div className="border border-gray-100 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-950">
              <h2 className="text-xl font-bold text-gray-950 dark:text-white">No blog posts found</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Try a different search, category or tag.</p>
            </div>
          )}

          <Pagination result={result} query={query} category={category} tag={tag} />
        </section>
      </main>
    </BlogChrome>
  );
}

function Pagination({ result, query, category, tag }) {
  if (result.totalPages <= 1) return null;
  const previous = result.page > 1 ? result.page - 1 : null;
  const next = result.page < result.totalPages ? result.page + 1 : null;

  return (
    <nav className="mt-10 flex items-center justify-between" aria-label="Blog pagination">
      {previous ? (
        <a className="border border-gray-200 bg-white px-4 py-2 text-sm font-semibold hover:border-primary dark:border-gray-700 dark:bg-gray-950" href={pageHref(previous, query, category, tag)}>
          Previous
        </a>
      ) : <span />}
      <span className="text-sm text-gray-500">Page {result.page} of {result.totalPages}</span>
      {next ? (
        <a className="border border-gray-200 bg-white px-4 py-2 text-sm font-semibold hover:border-primary dark:border-gray-700 dark:bg-gray-950" href={pageHref(next, query, category, tag)}>
          Next
        </a>
      ) : <span />}
    </nav>
  );
}

function pageHref(page, query, category, tag) {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (category) params.set('category', category);
  if (tag) params.set('tag', tag);
  params.set('page', String(page));
  return `/blogs?${params.toString()}`;
}

import React from 'react';

export default function BlogArticle({ post, relatedPosts }) {
  const toc = [
    ...post.content.sections.filter((section) => section.heading),
    { heading: 'Recommended Next Reads' },
    { heading: 'Frequently Asked Questions' },
    { heading: 'Official Sources and References' },
  ];
  const categoryHref = `/blogs?category=${encodeURIComponent(post.category)}`;

  return (
    <article className="bg-white dark:bg-gray-900" itemScope itemType="https://schema.org/BlogPosting">
      <header className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 pt-28">
        <div className="container mx-auto max-w-5xl px-4 py-10 sm:py-14">
          <nav className="mb-6 text-sm text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
            <ol className="flex flex-wrap gap-2">
              <li><a href="/" className="hover:text-primary">Home</a></li>
              <li>/</li>
              <li><a href="/blogs" className="hover:text-primary">Blog</a></li>
              <li>/</li>
              <li><a href={categoryHref} className="text-gray-700 hover:text-primary dark:text-gray-200">{post.category}</a></li>
            </ol>
          </nav>
          <a href={categoryHref} className="text-sm font-semibold uppercase tracking-normal text-primary hover:underline">{post.category}</a>
          <h1 itemProp="headline" className="mt-3 max-w-4xl text-4xl font-bold leading-tight text-gray-950 dark:text-white sm:text-5xl">
            {post.title}
          </h1>
          <p itemProp="description" className="mt-5 max-w-3xl text-lg leading-8 text-gray-600 dark:text-gray-300">
            {post.content.summary}
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span>
              By{' '}
              <a itemProp="author" href={post.author.url} className="font-semibold text-gray-700 hover:text-primary dark:text-gray-200">
                {post.author.name}
              </a>
            </span>
            <span>{post.author.role}</span>
            <span>Published <time itemProp="datePublished" dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time></span>
            <span>Updated <time itemProp="dateModified" dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time></span>
            <span>{post.readingTime} min read</span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {post.tags.slice(0, 6).map((tag) => (
              <a key={tag} href={`/blogs?tag=${encodeURIComponent(tag)}`} className="border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600 hover:border-primary hover:text-primary dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                {tag}
              </a>
            ))}
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <img
          src={post.heroImage.url}
          alt={post.heroImage.alt}
          width={post.heroImage.width}
          height={post.heroImage.height}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="aspect-video w-full object-cover shadow-lg"
        />

        <div className="mt-10 grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-950">
              <h2 className="text-sm font-bold uppercase tracking-normal text-gray-950 dark:text-white">Table of contents</h2>
              <ol className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                {toc.map((section) => (
                  <li key={section.heading}>
                    <a href={`#${anchor(section.heading)}`} className="hover:text-primary">
                      {section.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
            <div className="mt-5 border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
              <h2 className="text-sm font-bold uppercase tracking-normal text-gray-950 dark:text-white">Helpful links</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {post.internalLinks.slice(0, 5).map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="font-semibold text-gray-800 hover:text-primary dark:text-gray-200">
                      {link.title}
                    </a>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">{link.reason}</p>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="prose prose-gray max-w-none dark:prose-invert">
            {post.content.sections.map((section) => (
              <section key={section.heading} id={anchor(section.heading)} className="scroll-mt-28 border-b border-gray-100 py-8 last:border-b-0 dark:border-gray-800">
                <h2 className="text-2xl font-bold text-gray-950 dark:text-white">{section.heading}</h2>
                {section.body?.map((paragraph) => (
                  <p key={paragraph} className="mt-4 leading-8 text-gray-700 dark:text-gray-300">{paragraph}</p>
                ))}
                {section.bullets && (
                  <ul className="mt-4 space-y-3 text-gray-700 dark:text-gray-300">
                    {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                  </ul>
                )}
                {section.steps && (
                  <ol className="mt-4 space-y-3 text-gray-700 dark:text-gray-300">
                    {section.steps.map((step) => <li key={step}>{step}</li>)}
                  </ol>
                )}
                {section.definitions && (
                  <dl className="mt-4 space-y-4">
                    {section.definitions.map((item) => (
                      <div key={item.term}>
                        <dt className="font-semibold text-gray-950 dark:text-white">{item.term}</dt>
                        <dd className="mt-1 text-gray-700 dark:text-gray-300">{item.definition}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {section.table && (
                  <div className="mt-5 overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead>
                        <tr>
                          {section.table.headers.map((heading) => (
                            <th key={heading} className="border border-gray-200 bg-gray-50 px-4 py-3 font-semibold dark:border-gray-700 dark:bg-gray-800">
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.table.rows.map((row) => (
                          <tr key={row.join('|')}>
                            {row.map((cell) => (
                              <td key={cell} className="border border-gray-200 px-4 py-3 dark:border-gray-700">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))}

            <section id="recommended-reading" className="py-8">
              <h2 className="text-2xl font-bold text-gray-950 dark:text-white">Recommended Next Reads</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {post.internalLinks.map((link) => (
                  <a key={link.href} href={link.href} className="border border-gray-100 bg-gray-50 p-4 hover:border-primary dark:border-gray-800 dark:bg-gray-950">
                    <span className="font-semibold text-gray-950 dark:text-white">{link.title}</span>
                    <span className="mt-2 block text-sm leading-6 text-gray-600 dark:text-gray-300">{link.reason}</span>
                  </a>
                ))}
              </div>
            </section>

            <section id="frequently-asked-questions" className="py-8">
              <h2 className="text-2xl font-bold text-gray-950 dark:text-white">Frequently Asked Questions</h2>
              <div className="mt-5 space-y-4">
                {post.faq.map((item) => (
                  <details key={item.question} className="border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950" open>
                    <summary className="cursor-pointer font-semibold text-gray-950 dark:text-white">{item.question}</summary>
                    <p className="mt-3 leading-7 text-gray-700 dark:text-gray-300">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>

            <section id="official-sources-and-references" className="py-8">
              <h2 className="text-2xl font-bold text-gray-950 dark:text-white">Official Sources and References</h2>
              <ul className="mt-4 space-y-3">
                {post.externalLinks.map((source) => (
                  <li key={source.url} className="leading-7">
                    <a href={source.url} rel="noreferrer" className="font-semibold text-primary hover:underline">
                      {source.publisher}: {source.title}
                    </a>
                    <span className="block text-sm text-gray-600 dark:text-gray-300">{source.reason}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {relatedPosts.length > 0 && (
          <section className="mt-12 border-t border-gray-100 pt-10 dark:border-gray-800">
            <h2 className="text-2xl font-bold text-gray-950 dark:text-white">Related posts</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {relatedPosts.map((related) => (
                <a key={related.slug} href={`/blogs/${related.slug}`} className="border border-gray-100 bg-white p-5 shadow-sm hover:border-primary dark:border-gray-800 dark:bg-gray-950">
                  <p className="text-xs font-semibold uppercase tracking-normal text-primary">{related.category}</p>
                  <h3 className="mt-2 font-bold text-gray-950 dark:text-white">{related.title}</h3>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

function anchor(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

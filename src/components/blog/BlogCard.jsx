import React from 'react';

export default function BlogCard({ post, featured = false }) {
  return (
    <article className={`bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm ${featured ? 'md:grid md:grid-cols-[1.1fr_1fr]' : ''}`}>
      <a href={`/blogs/${post.slug}`} className="block overflow-hidden">
        <img
          src={post.heroImage.url}
          alt={post.heroImage.alt}
          width={post.heroImage.width}
          height={post.heroImage.height}
          loading={featured ? 'eager' : 'lazy'}
          className={`w-full object-cover ${featured ? 'h-64 md:h-full' : 'h-48'}`}
        />
      </a>
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-normal text-primary">
          <span>{post.category}</span>
          <span className="text-gray-300">/</span>
          <span>{post.readingTime} min read</span>
        </div>
        <h2 className={`${featured ? 'text-2xl sm:text-3xl' : 'text-xl'} mt-3 font-bold leading-tight text-gray-950 dark:text-white`}>
          <a href={`/blogs/${post.slug}`} className="hover:text-primary transition-colors">
            {post.title}
          </a>
        </h2>
        <p className="mt-3 text-sm sm:text-base leading-7 text-gray-600 dark:text-gray-300">
          {post.excerpt}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {post.tags.slice(0, 3).map((tag) => (
            <a
              key={tag}
              href={`/blogs?tag=${encodeURIComponent(tag)}`}
              className="border border-gray-200 dark:border-gray-700 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary transition-colors"
            >
              {tag}
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}

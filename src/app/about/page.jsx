import BlogChrome from '../../components/blog/BlogChrome';

const siteUrl = 'https://estospaces.com';

export const metadata = {
  title: 'About Estospaces',
  description: 'Learn about Estospaces, our editorial standards, and how we build trustworthy UK property search and virtual tour guidance.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/about`,
    title: 'About Estospaces | Editorial Standards',
    description: 'Estospaces helps buyers, renters, landlords, investors and agents make clearer UK property decisions with verified listings, virtual tours and source-backed guides.',
    images: [
      {
        url: '/assets/estospaces-og.webp',
        width: 1200,
        height: 630,
        alt: 'Estospaces editorial standards and virtual property search',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Estospaces | Editorial Standards',
    description: 'How Estospaces builds trustworthy UK property search, virtual tour and editorial guidance.',
    images: ['/assets/estospaces-og.webp'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${siteUrl}/about#about`,
  url: `${siteUrl}/about`,
  name: 'About Estospaces',
  description: metadata.description,
  inLanguage: 'en-GB',
  publisher: {
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: 'Estospaces',
    url: siteUrl,
    logo: `${siteUrl}/assets/logo-icon.png`,
  },
  mainEntity: {
    '@type': 'Organization',
    name: 'Estospaces',
    url: siteUrl,
    sameAs: [
      'https://x.com/ESTOSPACES',
      'https://www.instagram.com/estospaces/',
      'https://www.linkedin.com/company/estospaces-solutions-private-limited',
    ],
    areaServed: 'United Kingdom',
    knowsAbout: [
      'UK property search',
      'Virtual property tours',
      'Verified listings',
      'Letting compliance',
      'Home buying and renting guidance',
    ],
  },
};

export default function AboutPage() {
  return (
    <BlogChrome>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="pt-28">
        <section className="border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-950">
          <div className="container mx-auto max-w-5xl px-4 py-12 sm:py-16">
            <p className="text-sm font-semibold uppercase tracking-normal text-primary">About Estospaces</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-bold leading-tight text-gray-950 dark:text-white sm:text-5xl">
              Trustworthy property search starts with verified information
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-600 dark:text-gray-300">
              Estospaces is a virtual-first property platform for buyers, renters, landlords, investors and estate agents. We combine verified listings, immersive property media and practical editorial guidance so people can make property decisions with clearer evidence.
            </p>
          </div>
        </section>

        <section className="bg-gray-50 py-12 dark:bg-gray-900">
          <div className="container mx-auto grid max-w-5xl gap-8 px-4 lg:grid-cols-[1fr_1fr]">
            <div>
              <h2 className="text-2xl font-bold text-gray-950 dark:text-white">What We Build For</h2>
              <p className="mt-4 leading-8 text-gray-700 dark:text-gray-300">
                Property decisions are high-trust decisions. Our product and content focus on reducing uncertainty: clearer listings, better viewing context, stronger broker accountability and practical guidance that links back to official sources where facts matter.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-950 dark:text-white">Editorial Standards</h2>
              <p className="mt-4 leading-8 text-gray-700 dark:text-gray-300">
                The Estospaces Editorial Team reviews property guides for search intent, usefulness, factual clarity, source quality and reader actionability. Articles are designed to answer the main question early, explain important terms, include examples and show update dates.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 dark:bg-gray-950">
          <div className="container mx-auto max-w-5xl px-4">
            <h2 className="text-2xl font-bold text-gray-950 dark:text-white">How We Keep Guides Useful</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {[
                ['Source-backed', 'Legal, tax, compliance and policy claims are checked against official sources such as GOV.UK or relevant public bodies.'],
                ['People-first', 'Each guide is written for a real property decision, not for keyword volume alone. We avoid filler, duplicate articles and ranking guarantees.'],
                ['Kept current', 'Posts include published and updated dates, and the editorial workflow calls for refresh checks after launch.'],
              ].map(([heading, body]) => (
                <section key={heading} className="border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900">
                  <h3 className="font-bold text-gray-950 dark:text-white">{heading}</h3>
                  <p className="mt-3 leading-7 text-gray-700 dark:text-gray-300">{body}</p>
                </section>
              ))}
            </div>
          </div>
        </section>
      </main>
    </BlogChrome>
  );
}

import { Bell, Home, Search, Sparkles } from 'lucide-react';
import LandingChrome from '../../components/landing/LandingChrome';

const siteUrl = 'https://estospaces.com';

export const metadata = {
  title: 'Property Listings Coming Soon',
  description: 'Estospaces property listings are in development. Searches now lead to a clear launch message while the verified listings experience is being prepared.',
  alternates: {
    canonical: '/properties-coming-soon',
  },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/properties-coming-soon`,
    title: 'Property Listings Coming Soon | Estospaces',
    description: 'The verified listings experience is being prepared. Join the launch list or explore Estospaces property guides while we build.',
    images: [
      {
        url: '/assets/estospaces-og.webp',
        width: 1200,
        height: 630,
        alt: 'Estospaces verified property listings coming soon',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Property Listings Coming Soon | Estospaces',
    description: 'The verified listings experience is being prepared for buyers, renters, landlords and agents.',
    images: ['/assets/estospaces-og.webp'],
  },
};

export default async function PropertiesComingSoonPage({ searchParams }) {
  const params = await searchParams;
  const searchSummary = buildSearchSummary(params);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${siteUrl}/properties-coming-soon#webpage`,
    url: `${siteUrl}/properties-coming-soon`,
    name: 'Property Listings Coming Soon',
    description: metadata.description,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Estospaces',
      url: siteUrl,
    },
    inLanguage: 'en-GB',
  };

  return (
    <LandingChrome activePath="/properties-coming-soon">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="pt-20">
        <section className="relative overflow-hidden bg-gray-950 text-white">
          <img
            src="/assets/modern-apartment.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gray-950/70" />
          <div className="container relative mx-auto max-w-5xl px-4 py-16 sm:py-20 lg:py-24">
            <p className="text-sm font-semibold uppercase tracking-normal text-primary">Listings in development</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight sm:text-5xl">
              Property listings are coming soon
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-200">
              We are preparing the verified property list, virtual tour workflow and broker checks before opening search results to the public. For now, every search lands here so users get a clear, honest status instead of an unfinished listings page.
            </p>
            {searchSummary && (
              <div className="mt-6 inline-flex max-w-full flex-wrap items-center gap-2 border border-white/15 bg-white/10 px-4 py-3 text-sm text-white backdrop-blur">
                <Search size={18} className="text-primary" />
                <span>{searchSummary}</span>
              </div>
            )}
          </div>
        </section>

        <section className="bg-white py-12 dark:bg-gray-950">
          <div className="container mx-auto grid max-w-5xl gap-5 px-4 md:grid-cols-3">
            {[
              [Search, 'Verified listings first', 'Listings will open only when property details, media and broker information can be checked properly.'],
              [Home, 'Virtual-tour ready', 'The launch experience is being shaped around useful photos, tours, location context and clear next actions.'],
              [Bell, 'Launch updates', 'Users can reserve a spot now and return when the property list is ready for real searches.'],
            ].map(([Icon, title, body]) => (
              <section key={title} className="border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900">
                <Icon size={24} className="text-primary" />
                <h2 className="mt-4 text-xl font-bold text-gray-950 dark:text-white">{title}</h2>
                <p className="mt-3 leading-7 text-gray-700 dark:text-gray-300">{body}</p>
              </section>
            ))}
          </div>
        </section>

        <section className="border-y border-gray-100 bg-gray-50 py-12 dark:border-gray-800 dark:bg-gray-900">
          <div className="container mx-auto max-w-5xl px-4">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-normal text-primary">What to do next</p>
                <h2 className="mt-2 text-3xl font-bold text-gray-950 dark:text-white">Stay close to launch without hitting a dead end</h2>
                <p className="mt-4 max-w-3xl leading-8 text-gray-700 dark:text-gray-300">
                  Reserve your spot if you want launch updates, or use the blog while listings are being prepared. The guides are already live and cover renting, buying, selling, compliance and local search decisions.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <a href="/#contact" className="inline-flex min-h-12 items-center justify-center gap-2 bg-primary px-6 font-bold text-white hover:bg-primary/90">
                  <Sparkles size={18} />
                  Reserve your spot
                </a>
                <a href="/blogs" className="inline-flex min-h-12 items-center justify-center border border-gray-200 bg-white px-6 font-bold text-gray-900 hover:border-primary hover:text-primary dark:border-gray-700 dark:bg-gray-950 dark:text-white">
                  Read property guides
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </LandingChrome>
  );
}

function buildSearchSummary(params = {}) {
  const parts = [];
  const keyword = readParam(params.q) || readParam(params.keyword);
  const location = readParam(params.location);
  const propertyType = readParam(params.propertyType);
  const listingType = readParam(params.type);

  if (keyword) parts.push(`keyword "${keyword}"`);
  if (location) parts.push(`location "${location}"`);
  if (propertyType) parts.push(`${propertyType} properties`);
  if (listingType) parts.push(`${listingType === 'sale' ? 'buy' : listingType} listings`);

  if (!parts.length) return '';
  return `Your search was received: ${parts.join(', ')}.`;
}

function readParam(value) {
  if (Array.isArray(value)) return value[0] || '';
  return value || '';
}

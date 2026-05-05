import LandingPage from './landing-page';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://estospaces.com/#organization',
      name: 'Estospaces',
      url: 'https://estospaces.com',
      logo: 'https://estospaces.com/assets/logo-icon.png',
      sameAs: [
        'https://x.com/ESTOSPACES',
        'https://www.instagram.com/estospaces/',
        'https://www.linkedin.com/company/estospaces-solutions-private-limited',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        url: 'https://estospaces.com/#contact',
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://estospaces.com/#website',
      url: 'https://estospaces.com',
      name: 'Estospaces',
      publisher: {
        '@id': 'https://estospaces.com/#organization',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://app.estospaces.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'RealEstateAgent',
      '@id': 'https://estospaces.com/#real-estate-platform',
      name: 'Estospaces',
      url: 'https://estospaces.com',
      areaServed: 'United Kingdom',
      description: 'A virtual-first real estate platform for verified listings, immersive property tours, and trusted broker connections.',
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage />
    </>
  );
}

import LandingPage from './landing-page';
import { serializeJsonLd } from '../lib/json-ld';

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
      areaServed: ['India', 'England'],
      description: 'A property platform for verified listings and trusted property professional connections across India and England.',
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <LandingPage />
    </>
  );
}

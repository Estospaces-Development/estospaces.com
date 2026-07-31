import LandingPage from './landing-page';
import { serializeJsonLd } from '../lib/json-ld';
import { siteConfig } from '../config/site';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteConfig.siteUrl}/#organization`,
      name: siteConfig.name,
      legalName: siteConfig.legalOperator,
      url: siteConfig.siteUrl,
      logo: `${siteConfig.siteUrl}/assets/logo-icon.png`,
      sameAs: Object.values(siteConfig.social),
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: siteConfig.contactEmail,
        url: `${siteConfig.siteUrl}/contact`,
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${siteConfig.siteUrl}/#website`,
      url: siteConfig.siteUrl,
      name: siteConfig.name,
      publisher: {
        '@id': `${siteConfig.siteUrl}/#organization`,
      },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${siteConfig.siteUrl}/#software`,
      name: siteConfig.name,
      url: siteConfig.siteUrl,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: siteConfig.metadata.description,
      publisher: {
        '@id': `${siteConfig.siteUrl}/#organization`,
      },
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

import PolicyPage, { PolicySection } from '../../components/site/PolicyPage';
import { buildPageMetadata, siteConfig } from '../../config/site';
import { serializeJsonLd } from '../../lib/json-ld';

export const metadata = buildPageMetadata({
  title: `About ${siteConfig.name}`,
  description: `${siteConfig.name} is private-beta property-technology software backed by registered companies in India and the United Kingdom.`,
  path: '/about',
});

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': `${siteConfig.siteUrl}/about#about`,
  url: `${siteConfig.siteUrl}/about`,
  name: `About ${siteConfig.name}`,
  description: metadata.description,
  inLanguage: 'en',
  publisher: {
    '@type': 'Organization',
    '@id': `${siteConfig.siteUrl}/#organization`,
    name: siteConfig.name,
    legalName: siteConfig.legalOperator,
    url: siteConfig.siteUrl,
    logo: `${siteConfig.siteUrl}/assets/logo-icon.png`,
  },
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <PolicyPage
        description={`${siteConfig.name} is a property-technology software platform backed by registered companies in India and the United Kingdom. It is designed to help property seekers discover opportunities, connect with participating property professionals, and move enquiries toward clear next steps.`}
        eyebrow={`About ${siteConfig.name}`}
        title="Property journeys need clearer next steps"
        updated="31 July 2026"
      >
        <PolicySection title="What we are building">
          <p>
            The private-beta product brings property discovery, professional connection, response
            tracking, Fast Track cases, documents, messages, and support context into a role-based
            software experience.
          </p>
          <p>
            Availability, property inventory, and professional coverage vary by area while the
            operating model is validated. EstoSpaces is described as software and does not claim to
            be a licensed estate agency.
          </p>
        </PolicySection>
        <PolicySection title="Why private beta">
          <p>
            Property decisions carry real financial and personal consequences. The private beta is
            intended to validate reliability, response processes, support coverage, and user
            understanding before making broader availability claims.
          </p>
        </PolicySection>
        <PolicySection title="How timing is described">
          <p>
            Participating professionals are monitored against a 10-minute response target during
            supported periods. Fast Track is designed to move an enquiry toward a viewing or
            application within 24 hours. Neither target is a guaranteed outcome.
          </p>
        </PolicySection>
        <PolicySection title="Editorial Standards">
          <p>
            The blog is an educational resource, not a statement that every discussed product
            feature is currently available. Articles should identify sources where material facts
            require them, show published and updated dates, and avoid substituting general
            information for legal, financial, tax, surveying, or safety advice.
          </p>
          <p>
            A full article-by-article review remains separate from the launch-page reliability work.
            Established URLs are preserved while that review is scoped to avoid careless loss of
            useful content and search history.
          </p>
        </PolicySection>
        <PolicySection title="Operator and contact">
          <p>
            Product: {siteConfig.name}
            <br />
            India: {siteConfig.legalEntities.india.name}
            <br />
            United Kingdom: {siteConfig.legalEntities.unitedKingdom.name}
            <br />
            Category: {siteConfig.category}
            <br />
            Contact:{' '}
            <a
              className="font-bold text-primary underline"
              href={`mailto:${siteConfig.contactEmail}`}
            >
              {siteConfig.contactEmail}
            </a>
          </p>
        </PolicySection>
        <PolicySection title="Founding team">
          <p>
            {siteConfig.foundingTeam[0].name} — {siteConfig.foundingTeam[0].role}
            <br />
            {siteConfig.foundingTeam[1].name} — {siteConfig.foundingTeam[1].role}
          </p>
        </PolicySection>
      </PolicyPage>
    </>
  );
}

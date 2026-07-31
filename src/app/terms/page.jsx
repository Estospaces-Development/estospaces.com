import PolicyPage, { PolicyList, PolicySection } from '../../components/site/PolicyPage';
import { buildPageMetadata, siteConfig } from '../../config/site';

export const metadata = buildPageMetadata({
  title: `${siteConfig.name} Terms of Use`,
  description: `Terms for using the ${siteConfig.name} public website and private-beta property-technology software platform.`,
  path: '/terms',
});

export default function TermsPage() {
  return (
    <PolicyPage
      description={`These terms apply to the ${siteConfig.name} website and private-beta software.`}
      eyebrow="Legal"
      title="Terms of use"
    >
      <PolicySection title="1. The service">
        <p>
          {siteConfig.name} is property-technology software. We do not claim that the operator is an
          estate agency, legal adviser, financial adviser, surveyor, lender, insurer, or guarantor.
          Property professionals and other third parties remain responsible for their own services.
        </p>
      </PolicySection>
      <PolicySection title="2. Private-beta status">
        <p>
          Access, inventory, coverage, and features may be limited, changed, paused, or withdrawn
          during the private beta. A 10-minute broker response is an operating target during
          supported periods, not a guarantee.
        </p>
        <p>
          Fast Track is designed to help move an enquiry toward a viewing or application within 24
          hours. It does not guarantee a viewing, application decision, tenancy, purchase, or
          completion within that time.
        </p>
      </PolicySection>
      <PolicySection title="3. Accounts and acceptable use">
        <PolicyList>
          <li>Provide accurate information and keep account credentials secure.</li>
          <li>Use the service lawfully and only for genuine property-related purposes.</li>
          <li>
            Do not probe, disrupt, automate abuse, impersonate another person, or upload harmful
            content.
          </li>
          <li>
            Do not rely on the platform as a substitute for professional legal, financial, property,
            or safety checks.
          </li>
        </PolicyList>
      </PolicySection>
      <PolicySection title="4. Property and professional information">
        <p>
          Availability, descriptions, prices, documents, professional coverage, and response times
          can change. Users should independently verify material information before making a
          decision or entering an agreement. “Approved” describes the platform access process and is
          not a warranty of every act, statement, listing, or outcome.
        </p>
      </PolicySection>
      <PolicySection title="5. Content and intellectual property">
        <p>
          The website, software, brand, and original content are owned by or licensed to the
          operator. You retain responsibility for information you submit and grant the permissions
          needed to process it for the requested service.
        </p>
      </PolicySection>
      <PolicySection title="6. Availability and liability">
        <p>
          We aim to operate a useful and secure service, but do not promise uninterrupted or
          error-free availability. Nothing in these terms limits rights or liability that cannot
          lawfully be limited. The applicable contracting entity and any service-specific terms are
          identified during onboarding or in the relevant service agreement.
        </p>
      </PolicySection>
      <PolicySection title="7. Operator">
        <p>
          EstoSpaces services are provided by {siteConfig.legalEntities.india.name} in India and{' '}
          {siteConfig.legalEntities.unitedKingdom.name} in the United Kingdom, according to the
          relevant service and onboarding context.
        </p>
      </PolicySection>
      <PolicySection title="8. Contact and changes">
        <p>
          Questions can be sent to{' '}
          <a
            className="font-bold text-primary underline"
            href={`mailto:${siteConfig.contactEmail}`}
          >
            {siteConfig.contactEmail}
          </a>
          . Material updates will be reflected by the last-updated date.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}

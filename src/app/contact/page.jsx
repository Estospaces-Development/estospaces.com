import PolicyPage, { PolicySection } from '../../components/site/PolicyPage';
import { buildPageMetadata, siteConfig } from '../../config/site';

export const metadata = buildPageMetadata({
  title: `Contact ${siteConfig.name}`,
  description: `Contact ${siteConfig.name} through its verified domain mailbox for product access, professional participation, support, or company enquiries.`,
  path: '/contact',
});

export default function ContactPage() {
  return (
    <PolicyPage
      description="Use the verified domain mailbox below for product access, professional participation, support, company, or security enquiries."
      eyebrow="Contact"
      title="Talk to the EstoSpaces team"
    >
      <PolicySection title="Verified contact">
        <p>
          Email{' '}
          <a
            className="font-bold text-primary underline"
            href={`mailto:${siteConfig.contactEmail}`}
          >
            {siteConfig.contactEmail}
          </a>
          . Include the property journey, product area, or organisation involved so the enquiry can
          be routed correctly.
        </p>
      </PolicySection>
      <PolicySection title="Product and professional access">
        <p>
          Private-beta access, property inventory, and participating-professional coverage remain
          limited and vary by area. Sending an enquiry does not guarantee product access, property
          availability, or a response within a particular period.
        </p>
      </PolicySection>
      <PolicySection title="Registered companies">
        <p>
          India: {siteConfig.legalEntities.india.name}
          <br />
          United Kingdom: {siteConfig.legalEntities.unitedKingdom.name}
        </p>
      </PolicySection>
    </PolicyPage>
  );
}

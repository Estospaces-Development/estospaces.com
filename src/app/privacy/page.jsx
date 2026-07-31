import PolicyPage, { PolicyList, PolicySection } from '../../components/site/PolicyPage';
import { buildPageMetadata, siteConfig } from '../../config/site';

export const metadata = buildPageMetadata({
  title: `${siteConfig.name} Privacy Notice`,
  description: `How ${siteConfig.name} handles website, contact, account, enquiry, and optional analytics information during the private beta.`,
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <PolicyPage
      description="This notice explains how the EstoSpaces companies handle information connected with the public website and private-beta product."
      eyebrow="Privacy"
      title="Privacy notice"
    >
      <PolicySection title="Who is responsible">
        <p>
          {siteConfig.legalEntities.india.name} administers EstoSpaces services in India, and{' '}
          {siteConfig.legalEntities.unitedKingdom.name} administers EstoSpaces services in the
          United Kingdom. The applicable entity depends on the service and onboarding context.
          Questions about this notice can be sent to{' '}
          <a
            className="font-bold text-primary underline"
            href={`mailto:${siteConfig.contactEmail}`}
          >
            {siteConfig.contactEmail}
          </a>
          .
        </p>
      </PolicySection>
      <PolicySection title="Information we may handle">
        <PolicyList>
          <li>
            Basic technical request data such as IP address, browser type, requested URL, timestamp,
            and security logs.
          </li>
          <li>
            Information you choose to send by email, including your email address and message.
          </li>
          <li>
            Account, enquiry, property, message, support, and workflow information submitted through
            the separate application.
          </li>
          <li>
            Website usage, live-chat, and support interaction data only when you allow optional
            analytics and chat tools.
          </li>
        </PolicyList>
        <p>
          The landing-site analytics abstraction does not send contact details, search text,
          document metadata, or the contents of messages to Google Analytics. Information you
          intentionally submit through Zoho SalesIQ chat is processed to provide support.
        </p>
      </PolicySection>
      <PolicySection title="Why information is used">
        <PolicyList>
          <li>Provide, secure, troubleshoot, and improve the website and product.</li>
          <li>Respond to enquiries and support requests.</li>
          <li>
            Operate property enquiries and the private-beta workflow requested by an account holder.
          </li>
          <li>Meet legal obligations and protect the service against misuse.</li>
          <li>Understand aggregate website use when optional analytics consent is given.</li>
        </PolicyList>
      </PolicySection>
      <PolicySection title="Service providers and transfers">
        <p>
          Hosting, application, monitoring, email, optional analytics, and live-support providers
          may process limited information on our behalf. These providers include Google Cloud,
          Google Analytics when configured, and Zoho SalesIQ when you allow optional tools. Some
          providers may process information outside your country, subject to the safeguards required
          for the relevant service and applicable law.
        </p>
      </PolicySection>
      <PolicySection title="Retention and security">
        <p>
          Information is kept only for as long as needed for the purpose it was collected, the
          account or service status, dispute handling, security, and legal requirements. You can
          contact us for more information about retention that applies to your use of the service.
          We use technical and organisational controls, but no online service can guarantee absolute
          security.
        </p>
      </PolicySection>
      <PolicySection title="Your choices and rights">
        <p>
          You can reject optional website analytics and chat tools, reopen cookie preferences, and
          contact us about access, correction, deletion, restriction, objection, or portability
          where those rights apply. Identity checks may be required before acting on a request.
        </p>
      </PolicySection>
      <PolicySection title="Changes">
        <p>
          We may update this notice as the private beta and operating processes change. The date at
          the top identifies the current public notice.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}

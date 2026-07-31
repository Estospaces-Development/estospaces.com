import PolicyPage, { PolicyList, PolicySection } from '../../components/site/PolicyPage';
import { buildPageMetadata, siteConfig } from '../../config/site';

export const metadata = buildPageMetadata({
  title: `${siteConfig.name} Cookie Policy`,
  description: `The essential storage and optional consent-based analytics and support tools used on the ${siteConfig.name} public website.`,
  path: '/cookies',
});

export default function CookiesPage() {
  return (
    <PolicyPage
      description="This policy describes the storage and third-party requests implemented on the public website. The separate application may use additional essential storage for account sessions."
      eyebrow="Legal"
      title="Cookie policy"
    >
      <PolicySection title="What the public website uses">
        <PolicyList>
          <li>
            <strong>Cookie preference:</strong> the browser stores your accepted or rejected choice
            for optional website tools in local storage under
            <code> estospaces_cookie_consent</code>.
          </li>
          <li>
            <strong>Optional analytics:</strong> Google Analytics scripts and cookies load only
            after you choose “Allow analytics &amp; chat” and only when a measurement ID is supplied
            through the deployment environment.
          </li>
          <li>
            <strong>Optional live support and visitor tracking:</strong> Zoho SalesIQ loads only
            after you choose “Allow analytics &amp; chat”. It may use cookies or browser storage to
            provide chat, understand visits, and connect website interactions with our customer
            support and CRM workflow.
          </li>
          <li>
            <strong>Essential infrastructure:</strong> hosting and security systems may process
            technical request data without using it for advertising.
          </li>
        </PolicyList>
      </PolicySection>
      <PolicySection title="Other third-party embeds">
        <p>
          The launch homepage does not embed autoplay video, maps, advertising pixels, external font
          requests, or social-media widgets. Apart from the consent-based tools described above,
          social links make a third-party request only when you choose to follow them.
        </p>
      </PolicySection>
      <PolicySection title="Analytics events">
        <p>
          Permitted events are limited to product-funnel actions such as search submission and
          account-link clicks. Search text, location text, email, phone number, message content, and
          document information are not permitted analytics properties.
        </p>
      </PolicySection>
      <PolicySection title="Change or withdraw your choice">
        <p>
          The footer includes “Cookie preferences”. Reject is as accessible as Accept. Rejecting
          optional tools does not block core website functions.
        </p>
      </PolicySection>
      <PolicySection title="Contact">
        <p>
          Send questions to{' '}
          <a
            className="font-bold text-primary underline"
            href={`mailto:${siteConfig.contactEmail}`}
          >
            {siteConfig.contactEmail}
          </a>
          .
        </p>
      </PolicySection>
    </PolicyPage>
  );
}

import PolicyPage, { PolicyList, PolicySection } from '../../components/site/PolicyPage';
import { buildPageMetadata, siteConfig } from '../../config/site';

export const metadata = buildPageMetadata({
  title: `${siteConfig.name} Security`,
  description: `A factual overview of the public-site security controls, product access boundaries, and vulnerability reporting path used by ${siteConfig.name}.`,
  path: '/security',
});

export default function SecurityPage() {
  return (
    <PolicyPage
      description="A high-level, factual overview of public-site controls and the current reporting path. This page does not claim a certification or absolute security."
      eyebrow="Security"
      title="How we approach security"
    >
      <PolicySection title="Public website controls">
        <PolicyList>
          <li>
            HTTPS is enforced by the application path, with HSTS configured for production
            responses.
          </li>
          <li>
            A Content Security Policy limits scripts, connections, framing, and other browser
            capabilities.
          </li>
          <li>
            Browser headers prevent framing, MIME-type sniffing, and access to camera, microphone,
            and geolocation.
          </li>
          <li>Nonessential analytics is disabled unless configured and a visitor accepts it.</li>
        </PolicyList>
      </PolicySection>
      <PolicySection title="Product access">
        <p>
          Private product areas use authenticated, role-based application access. The product
          architecture separates public website content from application and service APIs. Customer
          documents are not published through this website.
        </p>
        <p>
          No website can promise perfect protection. Security controls, dependencies, and operating
          processes require ongoing review throughout the private beta.
        </p>
      </PolicySection>
      <PolicySection title="Report a security issue">
        <p>
          Email{' '}
          <a
            className="font-bold text-primary underline"
            href={`mailto:${siteConfig.contactEmail}?subject=Security%20report`}
          >
            {siteConfig.contactEmail}
          </a>{' '}
          with the subject “Security report”. Include the affected URL, what you observed, and safe
          reproduction steps. Do not include real customer data or publicly disclose an unresolved
          issue.
        </p>
        <p>
          The verified domain mailbox above is the public security-reporting path. We do not publish
          a response-time promise. A machine-readable <code>security.txt</code> points to the same
          address.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}

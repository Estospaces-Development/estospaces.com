import Image from 'next/image';

import { siteConfig } from '../../config/site';
import TrackedButton from '../site/TrackedButton';
import TrackedLink from '../site/TrackedLink';
import styles from './Landing.module.css';

const footerGroups = [
  {
    heading: 'Access',
    links: [
      ['Create account', siteConfig.paths.register, 'create_account_clicked', 'create_account'],
      ['Existing user log in', siteConfig.paths.login, 'login_clicked', 'login'],
      [
        'Professional access',
        siteConfig.paths.brokerRegister,
        'broker_join_clicked',
        'professional',
      ],
    ],
  },
  {
    heading: 'Company',
    links: [
      ['About', '/about', 'navigation_clicked', 'about'],
      ['Contact', '/contact', 'contact_clicked', 'contact'],
      ['Security', '/security', 'navigation_clicked', 'security'],
      ['Blog', '/blogs', 'navigation_clicked', 'blog'],
    ],
  },
  {
    heading: 'Legal',
    links: [
      ['Privacy', '/privacy', 'navigation_clicked', 'privacy'],
      ['Terms', '/terms', 'navigation_clicked', 'terms'],
      ['Cookies', '/cookies', 'navigation_clicked', 'cookies'],
    ],
  },
  {
    heading: 'Social',
    links: [
      ['X / Twitter', siteConfig.social.x, 'social_link_clicked', 'x'],
      ['Instagram', siteConfig.social.instagram, 'social_link_clicked', 'instagram'],
      ['LinkedIn', siteConfig.social.linkedin, 'social_link_clicked', 'linkedin'],
    ],
  },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerMain}>
        <div className={styles.footerIdentity}>
          <div>
            <Image alt="" height={96} src="/assets/logo-icon-96.webp" unoptimized width={96} />
            <strong>{siteConfig.name}</strong>
          </div>
          <p>
            Private-beta property software for a clearer route from enquiry to the next useful
            action.
          </p>
          <span>
            {siteConfig.legalEntities.india.name} · {siteConfig.legalEntities.unitedKingdom.name}
          </span>
        </div>

        <div className={styles.footerLinks}>
          {footerGroups.map((group) => (
            <nav aria-label={`${group.heading} links`} key={group.heading}>
              <h2>{group.heading}</h2>
              <ul>
                {group.links.map(([label, href, eventName, destination]) => {
                  const external = href.startsWith('http') && !href.includes('app.estospaces.com');
                  return (
                    <li key={label}>
                      <TrackedLink
                        eventName={eventName}
                        eventProperties={{ placement: 'footer', destination }}
                        href={href}
                        rel={external ? 'noreferrer' : undefined}
                        target={external ? '_blank' : undefined}
                      >
                        {label}
                      </TrackedLink>
                    </li>
                  );
                })}
                {group.heading === 'Legal' &&
                (siteConfig.analyticsMeasurementId || siteConfig.salesIqWidgetUrl) ? (
                  <li>
                    <TrackedButton
                      data-cookie-preferences
                      eventName="cookie_preferences_opened"
                      eventProperties={{ placement: 'footer' }}
                      type="button"
                    >
                      Cookie preferences
                    </TrackedButton>
                  </li>
                ) : null}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      <div className={styles.footerBase}>
        <p>
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
        <p>Private beta / Availability varies by area</p>
      </div>
    </footer>
  );
}

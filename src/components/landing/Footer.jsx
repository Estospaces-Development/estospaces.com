import Image from 'next/image';

import { siteConfig } from '../../config/site';
import TrackedLink from '../site/TrackedLink';
import styles from './Landing.module.css';

const footerGroups = [
  {
    heading: 'Access',
    links: [
      ['Create account', siteConfig.paths.register, 'create_account_clicked'],
      ['Existing user log in', siteConfig.paths.login, 'login_clicked'],
      ['Professional access', siteConfig.paths.brokerRegister, 'broker_join_clicked'],
    ],
  },
  {
    heading: 'Company',
    links: [
      ['About', '/about'],
      ['Contact', '/contact'],
      ['Security', '/security'],
      ['Blog', '/blogs'],
    ],
  },
  {
    heading: 'Legal',
    links: [
      ['Privacy', '/privacy'],
      ['Terms', '/terms'],
      ['Cookies', '/cookies'],
    ],
  },
  {
    heading: 'Social',
    links: [
      ['X / Twitter', siteConfig.social.x],
      ['Instagram', siteConfig.social.instagram],
      ['LinkedIn', siteConfig.social.linkedin],
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
                {group.links.map(([label, href, eventName]) => {
                  const external = href.startsWith('http') && !href.includes('app.estospaces.com');
                  return (
                    <li key={label}>
                      <TrackedLink
                        eventName={eventName}
                        eventProperties={eventName ? { placement: 'footer' } : undefined}
                        href={href}
                        rel={external ? 'noreferrer' : undefined}
                        target={external ? '_blank' : undefined}
                      >
                        {label}
                      </TrackedLink>
                    </li>
                  );
                })}
                {group.heading === 'Legal' && siteConfig.features.analytics ? (
                  <li>
                    <button data-cookie-preferences type="button">
                      Cookie preferences
                    </button>
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

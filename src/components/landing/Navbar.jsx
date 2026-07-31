import Image from 'next/image';

import { siteConfig } from '../../config/site';
import TrackedLink from '../site/TrackedLink';
import styles from './Landing.module.css';

const navItems = [
  { index: '01', label: 'Product', href: '/#product', destination: 'product' },
  { index: '02', label: 'How it works', href: '/#journey', destination: 'journey' },
  {
    index: '03',
    label: 'For property seekers',
    href: '/#property-seekers',
    destination: 'seekers',
  },
  { index: '04', label: 'For brokers', href: '/#brokers', destination: 'brokers' },
  { index: '05', label: 'Security', href: '/security', destination: 'security' },
  { index: '06', label: 'About', href: '/about', destination: 'about' },
  { index: '07', label: 'Blog', href: '/blogs', destination: 'blog' },
];

export default function Navbar({ activePath = '/' }) {
  return (
    <header className={styles.siteHeader}>
      <nav aria-label="Primary navigation" className={styles.navbar}>
        <TrackedLink
          className={styles.brand}
          eventName="navigation_clicked"
          eventProperties={{ placement: 'header', destination: 'home' }}
          href="/"
        >
          <Image
            alt=""
            height={96}
            priority
            src="/assets/logo-icon-96.webp"
            unoptimized
            width={96}
          />
          <span>{siteConfig.name}</span>
        </TrackedLink>

        <div className={styles.desktopNav}>
          <div className={styles.chapterNav}>
            {navItems.map((item) => (
              <TrackedLink
                aria-current={activePath === item.href ? 'page' : undefined}
                eventName="navigation_clicked"
                eventProperties={{ placement: 'header', destination: item.destination }}
                href={item.href}
                key={item.label}
              >
                <span>{item.index}</span>
                {item.label}
              </TrackedLink>
            ))}
          </div>
          <span aria-hidden="true" className={styles.navDivider} />
          <TrackedLink
            className={styles.loginLink}
            eventName="login_clicked"
            eventProperties={{ placement: 'header' }}
            href={siteConfig.paths.login}
          >
            Log in
          </TrackedLink>
          <TrackedLink
            className={styles.navAction}
            eventName="create_account_clicked"
            eventProperties={{ placement: 'header' }}
            href={siteConfig.paths.register}
          >
            Create account
          </TrackedLink>
        </div>

        <button
          aria-controls="mobile-navigation"
          aria-expanded="false"
          aria-label="Open navigation menu"
          className={styles.menuToggle}
          data-mobile-menu-toggle
          type="button"
        >
          <span data-menu-closed-icon>Menu</span>
          <span className="hidden" data-menu-open-icon>
            Close
          </span>
        </button>

        <div className={`hidden ${styles.mobilePanel}`} data-mobile-menu id="mobile-navigation">
          <div className={styles.mobilePanelInner}>
            {navItems.map((item, index) => (
              <TrackedLink
                data-mobile-menu-first={index === 0 ? '' : undefined}
                data-mobile-menu-link
                eventName="navigation_clicked"
                eventProperties={{ placement: 'mobile_header', destination: item.destination }}
                href={item.href}
                key={item.label}
              >
                <span>{item.index}</span>
                {item.label}
              </TrackedLink>
            ))}
            <TrackedLink
              className={styles.mobileLogin}
              data-mobile-menu-link
              eventName="login_clicked"
              eventProperties={{ placement: 'mobile_header' }}
              href={siteConfig.paths.login}
            >
              Existing user log in
            </TrackedLink>
            <TrackedLink
              className={styles.mobileAction}
              data-mobile-menu-link
              eventName="create_account_clicked"
              eventProperties={{ placement: 'mobile_header' }}
              href={siteConfig.paths.register}
            >
              Create account
            </TrackedLink>
          </div>
        </div>
      </nav>
    </header>
  );
}

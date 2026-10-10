import { CalendarClock, FileCheck2, ShieldCheck, Timer } from 'lucide-react';
import { Bricolage_Grotesque, Geist, Geist_Mono } from 'next/font/google';

import { siteConfig } from '../../config/site';
import PageActivityTracker from '../site/PageActivityTracker';
import TrackedButton from '../site/TrackedButton';
import TrackedLink from '../site/TrackedLink';
import Audiences from './home/Audiences';
import Faq from './home/Faq';
import Film from './home/Film';
import FinalCta from './home/FinalCta';
import Hero from './home/Hero';
import Nav, { BrandMark } from './home/Nav';
import Pros from './home/Pros';
import Reveal from './home/Reveal';
import Story from './home/Story';
import { StickyCta } from './HomeMotion';
import HomePricing from './HomePricing';
import styles from './Home.module.css';

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  axes: ['opsz'],
  display: 'swap',
  variable: '--font-display',
});
const body = Geist({ subsets: ['latin'], display: 'swap', variable: '--font-body' });
const mono = Geist_Mono({ subsets: ['latin'], display: 'swap', variable: '--font-mono' });

// Swapping the film only means replacing these files; update the length label with it.
const demo = {
  src: '/assets/landing/estospaces-demo.mp4',
  poster: '/assets/landing/estospaces-demo-poster.jpg',
  length: '1:54',
};

const { paths, videos } = siteConfig;
const youtube = (id) => `https://www.youtube.com/watch?v=${id}`;

const proof = [
  [ShieldCheck, 'Verified', 'Verified professionals only'],
  [Timer, 'Live clock', '10-minute reply target, shown live'],
  [CalendarClock, 'Fast Track', '24-hour Fast Track to a viewing'],
  [FileCheck2, 'One case', 'Every document stays on your case'],
];

const footerGroups = [
  [
    'Product',
    [
      ['How it works', '#how', 'navigation_clicked', 'how'],
      ['Pricing', '#pricing', 'navigation_clicked', 'pricing'],
      ['FAQ', '#faq', 'navigation_clicked', 'faq'],
    ],
  ],
  [
    'Company',
    [
      ['About', paths.about, 'navigation_clicked', 'about'],
      ['Security', paths.security, 'navigation_clicked', 'security'],
      ['Blog', paths.blog, 'navigation_clicked', 'blog'],
      ['Contact', paths.contact, 'contact_clicked', 'contact'],
    ],
  ],
  [
    'Legal',
    [
      ['Privacy', paths.privacy, 'navigation_clicked', 'privacy'],
      ['Terms', paths.terms, 'navigation_clicked', 'terms'],
      ['Cookies', paths.cookies, 'navigation_clicked', 'cookies'],
    ],
  ],
  [
    'Follow',
    [
      ['X / Twitter', siteConfig.social.x, 'social_link_clicked', 'x'],
      ['Instagram', siteConfig.social.instagram, 'social_link_clicked', 'instagram'],
      ['LinkedIn', siteConfig.social.linkedin, 'social_link_clicked', 'linkedin'],
    ],
  ],
];

// Without JavaScript the server HTML still shows every section in its final state.
const noScript = `[data-m]{opacity:1!important;transform:none!important;clip-path:none!important}
[data-story-pinned]{display:none!important}[data-story-list]{display:grid!important}`;

export default function Home() {
  return (
    <div className={`${styles.page} ${display.variable} ${body.variable} ${mono.variable}`}>
      <noscript>
        <style>{noScript}</style>
      </noscript>
      <PageActivityTracker />
      <Nav loginUrl={paths.login} registerUrl={paths.register} />

      <main id="main-content">
        <Hero
          brokerUrl={paths.brokerRegister}
          photo="/assets/landing/photos/hero-lounge.webp"
          registerUrl={paths.register}
        />

        <section aria-label="What you can rely on" className={styles.proof}>
          <ul className={`${styles.container} ${styles.proofGrid}`}>
            {proof.map(([Icon, label, text], i) => (
              <Reveal as="li" className={styles.proofItem} delay={i * 0.07} key={label}>
                <Icon aria-hidden="true" size={22} strokeWidth={1.75} />
                <span className={styles.proofLabel}>{label}</span>
                <span className={styles.proofText}>{text}</span>
              </Reveal>
            ))}
          </ul>
        </section>

        <Film
          length={demo.length}
          managerUrl={youtube(videos.manager.id)}
          poster={demo.poster}
          src={demo.src}
          userUrl={youtube(videos.user.id)}
        />
        <Story />
        <Audiences brokerUrl={paths.brokerRegister} seekerUrl={paths.register} />
        <Pros brokerUrl={paths.brokerRegister} loginUrl={paths.login} />
        <HomePricing registerUrl={paths.brokerRegister} />
        <Faq contactUrl={paths.contact} />
        <FinalCta brokerUrl={paths.brokerRegister} registerUrl={paths.register} />
      </main>

      <footer className={styles.footer} data-hide-sticky>
        <div className={`${styles.container} ${styles.footerGrid}`}>
          <div className={styles.footerBrand}>
            <a aria-label="EstoSpaces home" className={styles.brand} href="/">
              <BrandMark />
              <span className={styles.wordmark}>estospaces</span>
            </a>
            <p>One brief, verified replies, one case to the keys.</p>
          </div>
          {footerGroups.map(([heading, links]) => (
            <nav aria-label={heading} className={styles.footerNav} key={heading}>
              <h2>{heading}</h2>
              {links.map(([label, href, eventName, destination]) => {
                const external = href.startsWith('http') && !href.includes('app.estospaces.com');
                return (
                  <TrackedLink
                    className={styles.footerLink}
                    eventName={eventName}
                    eventProperties={{ placement: 'footer', destination }}
                    href={href}
                    key={label}
                    rel={external ? 'noreferrer' : undefined}
                    target={external ? '_blank' : undefined}
                  >
                    {label}
                  </TrackedLink>
                );
              })}
              {heading === 'Legal' &&
              (siteConfig.analyticsMeasurementId || siteConfig.salesIqWidgetUrl) ? (
                <TrackedButton
                  className={styles.footerLink}
                  data-cookie-preferences
                  eventName="cookie_preferences_opened"
                  eventProperties={{ placement: 'footer' }}
                  type="button"
                >
                  Cookie preferences
                </TrackedButton>
              ) : null}
            </nav>
          ))}
        </div>
        <div className={styles.container}>
          <div className={styles.footerBase}>
            <span>
              © {new Date().getFullYear()} EstoSpaces · {siteConfig.legalEntities.india.name}{' '}
              (India) · {siteConfig.legalEntities.unitedKingdom.name} (UK)
            </span>
          </div>
        </div>
      </footer>

      <StickyCta registerUrl={paths.register} />
    </div>
  );
}

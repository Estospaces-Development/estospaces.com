import Image from 'next/image';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

import TrackedLink from '../site/TrackedLink';
import styles from './Landing.module.css';

export function LandingHero({ brokerRegisterPath, loginPath, registerPath, searchNotice }) {
  return (
    <section className={styles.hero} id="product">
      <div aria-hidden="true" className={styles.heroImage}>
        <Image
          alt=""
          fill
          loading="eager"
          priority
          sizes="100vw"
          src="/assets/landing/estospaces-threshold-hero.webp"
          unoptimized
        />
      </div>
      <div aria-hidden="true" className={styles.heroShade} />
      <div aria-hidden="true" className={styles.heroSurveyGrid}>
        <span />
        <span />
        <span />
        <span />
      </div>

      <div className={styles.heroContent}>
        <p className={styles.heroKicker}>
          <span aria-hidden="true" />
          Operating status / Private beta
        </p>
        <h1>
          <span>Clear steps</span>
          <span>for the property journey.</span>
        </h1>
        <p className={styles.heroCopy}>
          One connected workspace for property discovery, professional response, documents,
          viewings, and the next useful action.
        </p>
        <div className={styles.heroActions}>
          <TrackedLink
            className={styles.primaryAction}
            eventName="create_account_clicked"
            eventProperties={{ placement: 'hero' }}
            href={registerPath}
          >
            Request beta access <ArrowRight aria-hidden="true" size={18} />
          </TrackedLink>
          <TrackedLink
            className={styles.secondaryAction}
            eventName="login_clicked"
            eventProperties={{ placement: 'hero' }}
            href={loginPath}
          >
            Existing user log in
          </TrackedLink>
        </div>
        <TrackedLink
          className={styles.heroProfessionalLink}
          eventName="broker_join_clicked"
          eventProperties={{ placement: 'hero' }}
          href={brokerRegisterPath}
        >
          Broker or property manager access <ArrowUpRight aria-hidden="true" size={16} />
        </TrackedLink>
      </div>

      <aside className={styles.serviceNotice}>
        <span>System advisory / Search</span>
        <strong>{searchNotice}</strong>
        <p>Account registration remains active. Coverage, inventory, and response times vary.</p>
      </aside>

      <div aria-hidden="true" className={styles.heroRouteLine} />
      <div aria-hidden="true" className={styles.heroReference}>
        <span>ESTO / FIELD 001</span>
        <span>PRIVATE BETA / AREA VARIES</span>
      </div>
    </section>
  );
}

export function JourneyRoute({ stages }) {
  return (
    <section className={styles.journey} id="journey">
      <div className={styles.journeyStatic}>
        <div className={styles.sectionIntro} data-scroll-reveal>
          <p className={styles.sectionCode}>Chapter 01 / Documented route</p>
          <h2>The next useful step, kept in view.</h2>
        </div>
        <ol>
          {stages.map((stage) => (
            <li data-scroll-reveal key={stage.number}>
              <span>{stage.number}</span>
              <div>
                <p>{stage.label}</p>
                <h3>{stage.title}</h3>
                <p>{stage.body}</p>
                <strong>{stage.note}</strong>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function SectionReveal({ children, className = '', delay = 0, style, ...props }) {
  return (
    <article
      className={className}
      data-section-reveal
      style={{ ...style, '--reveal-delay': `${delay}s` }}
      {...props}
    >
      {children}
    </article>
  );
}

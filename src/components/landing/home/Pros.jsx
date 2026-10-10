'use client';

import { AnimatePresence, motion, useInView, useReducedMotion } from 'framer-motion';
import { BadgeCheck } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { LiveClock } from '../HomeMotion';
import TrackedLink from '../../site/TrackedLink';
import styles from '../Home.module.css';
import { ease } from './motion';
import Reveal from './Reveal';
import { TrackUi } from './ui';

const leads = [
  { initials: 'AR', name: 'Ananya R.', detail: '2BHK to rent · ₹35-40k · Nov', from: 6 * 60 + 41 },
  { initials: 'TH', name: 'Tom H.', detail: '1-bed flat · £1,150 pcm', from: 8 * 60 + 14 },
  { initials: 'FZ', name: 'Farhan & Zoya', detail: '3BHK to buy · ₹1.6 Cr', badge: 'Docs in' },
];

function QueueCell() {
  return (
    <Reveal className={`${styles.cell} ${styles.cellA}`}>
      <h3 className={styles.cellTitle}>Leads that arrive ready</h3>
      <p className={styles.cellText}>
        Every lead is a brief with a clock, so you know who is waiting and for how long.
      </p>
      <ul className={styles.queue}>
        {leads.map((lead, i) => (
          <li className={styles.lead} data-hot={i === 0} key={lead.name}>
            <span aria-hidden="true" className={styles.avatar}>
              {lead.initials}
            </span>
            <span className={styles.leadText}>
              <strong>{lead.name}</strong>
              <span>{lead.detail}</span>
            </span>
            {lead.badge ? (
              <span className={styles.leadDocs}>{lead.badge}</span>
            ) : (
              <LiveClock className={styles.leadClock} from={lead.from} />
            )}
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

function SealCell() {
  const reduce = useReducedMotion();
  return (
    <Reveal className={`${styles.cell} ${styles.cellB}`} delay={0.08}>
      <h3 className={styles.cellTitle}>Verified, then visible</h3>
      <motion.div
        className={styles.seal}
        data-m
        initial={reduce ? false : { scale: 1.4, opacity: 0, rotate: -8 }}
        transition={{ type: 'spring', stiffness: 150, damping: 14, delay: 0.25 }}
        viewport={{ once: true, margin: '0px 0px -15% 0px' }}
        whileInView={{ scale: 1, opacity: 1, rotate: -4 }}
      >
        <BadgeCheck aria-hidden="true" size={44} strokeWidth={1.5} />
        <span>Verified &amp; Approved</span>
      </motion.div>
      <p className={styles.cellText}>Only verified professionals can publish.</p>
    </Reveal>
  );
}

function ListingCell() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -20% 0px' });
  const [live, setLive] = useState(false);

  // "Pending review" flips to "Available · Live" a moment after the card is seen.
  useEffect(() => {
    if (!inView) return undefined;
    const timer = window.setTimeout(() => setLive(true), 1400);
    return () => window.clearTimeout(timer);
  }, [inView]);

  return (
    <Reveal className={`${styles.cell} ${styles.cellC}`} delay={0.08}>
      <h3 className={styles.cellTitle}>Listings that go live after a check</h3>
      <div className={styles.listingPhoto} ref={ref}>
        <Image
          alt="A bright living room in a listed apartment"
          className={styles.cover}
          fill
          sizes="(min-width: 900px) 38vw, 100vw"
          src="/assets/landing/photos/bento-listing.webp"
          unoptimized
        />
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            animate={{ opacity: 1, y: 0 }}
            className={live ? styles.chipLive : styles.chipPending}
            exit={{ opacity: 0, y: -8 }}
            initial={{ opacity: 0, y: 8 }}
            key={live ? 'live' : 'pending'}
            transition={{ duration: 0.35, ease }}
          >
            <span aria-hidden="true" className={styles.chipDot} />
            {live ? 'Available · Live' : 'Pending review'}
          </motion.span>
        </AnimatePresence>
      </div>
    </Reveal>
  );
}

function TrackCell() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -20% 0px' });
  return (
    <Reveal className={`${styles.cell} ${styles.cellD}`} delay={0.16}>
      <div className={styles.cellDText}>
        <h3 className={styles.cellTitle}>One case, six clear stages</h3>
        <p className={styles.cellText}>
          From the first viewing to the handover, nothing leaves the case.
        </p>
      </div>
      <div ref={ref}>
        <TrackUi caption={false} dark play={inView} />
      </div>
    </Reveal>
  );
}

export default function Pros({ brokerUrl, loginUrl }) {
  return (
    <section
      aria-labelledby="pros-title"
      className={styles.section}
      data-analytics-section="professionals"
      id="pros"
    >
      <span aria-hidden="true" id="brokers" />
      <div className={styles.container}>
        <Reveal as="h2" className={styles.h2} id="pros-title">
          Turn enquiries into viewings.
        </Reveal>
        <Reveal as="p" className={styles.lede} delay={0.08}>
          Every lead arrives as a brief with a clock. Your listings, cases and documents live in one
          workspace.
        </Reveal>

        <div className={styles.bento}>
          <QueueCell />
          <SealCell />
          <ListingCell />
          <TrackCell />
        </div>

        <Reveal className={styles.proCta}>
          <TrackedLink
            className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLg}`}
            eventName="broker_join_clicked"
            eventProperties={{ placement: 'professionals' }}
            href={brokerUrl}
          >
            List your properties
          </TrackedLink>
          <TrackedLink
            className={styles.textLink}
            eventName="login_clicked"
            eventProperties={{ placement: 'professionals' }}
            href={loginUrl}
          >
            Already a partner? Log in
          </TrackedLink>
        </Reveal>
      </div>
    </section>
  );
}

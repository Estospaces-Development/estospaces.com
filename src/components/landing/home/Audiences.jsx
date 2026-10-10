'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import TrackedLink from '../../site/TrackedLink';
import styles from '../Home.module.css';
import { spring } from './motion';
import Reveal from './Reveal';

// Two tall photo panels. The focused or hovered one grows to 64% of the row (36% for the other).
export default function Audiences({ seekerUrl, brokerUrl }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);

  const panels = [
    {
      id: 'seekers',
      label: 'For home seekers',
      copy: 'Free to use. One brief, verified replies, one case to the keys.',
      lines: ['Free to use', 'Verified replies on a live clock', 'One case to the keys'],
      cta: 'Find a home',
      href: seekerUrl,
      event: 'create_account_clicked',
      photo: '/assets/landing/photos/aud-seekers.webp',
      alt: 'Coloured terrace houses on a quiet street',
    },
    {
      id: 'professionals',
      label: 'For brokers and property managers',
      copy: 'Leads arrive as briefs. Reply fast, run Fast Track, close in one place.',
      lines: ['Leads arrive as briefs', 'Reply fast, run Fast Track', 'Close in one place'],
      cta: 'List your properties',
      href: brokerUrl,
      event: 'broker_join_clicked',
      photo: '/assets/landing/photos/aud-pros.webp',
      alt: 'Apartment towers at sunset',
    },
  ];

  return (
    <section
      aria-labelledby="audiences-title"
      className={styles.section}
      data-analytics-section="audiences"
      id="audiences"
    >
      <span aria-hidden="true" id="property-seekers" />
      <div className={styles.container}>
        <Reveal as="h2" className={styles.h2} id="audiences-title">
          Built for both sides of the door.
        </Reveal>
        <Reveal className={styles.panels} delay={0.1}>
          {panels.map((p, i) => (
            <motion.article
              animate={{ flexGrow: active === i ? 1.78 : 1 }}
              className={styles.panel}
              data-active={active === i}
              initial={false}
              key={p.id}
              onMouseEnter={() => setActive(i)}
              transition={reduce ? { duration: 0 } : spring}
            >
              <Image
                alt={p.alt}
                className={styles.cover}
                fill
                sizes="(min-width: 900px) 64vw, 100vw"
                src={p.photo}
                unoptimized
              />
              <span aria-hidden="true" className={styles.panelScrim} />
              <div className={styles.panelBody}>
                <button
                  aria-expanded={active === i}
                  className={styles.panelHead}
                  onClick={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  type="button"
                >
                  <h3 className={styles.h3}>{p.label}</h3>
                </button>
                <div className={styles.panelMore}>
                  <div className={styles.panelMoreInner}>
                    <p className={styles.panelCopy}>{p.copy}</p>
                    <ul className={styles.panelLines}>
                      {p.lines.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                    <TrackedLink
                      className={`${styles.btn} ${styles.btnWhite}`}
                      eventName={p.event}
                      eventProperties={{ placement: `audience_${p.id}` }}
                      href={p.href}
                    >
                      {p.cta}
                      <ArrowRight
                        aria-hidden="true"
                        className={styles.btnArrow}
                        size={20}
                        strokeWidth={1.75}
                      />
                    </TrackedLink>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

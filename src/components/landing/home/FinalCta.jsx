'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useRef } from 'react';

import TrackedLink from '../../site/TrackedLink';
import { ShareButton } from '../HomeMotion';
import styles from '../Home.module.css';
import { ease } from './motion';
import Reveal from './Reveal';

export default function FinalCta({ registerUrl, brokerUrl }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const drift = useTransform(scrollYProgress, [0, 1], [-30, 30]);

  return (
    <section
      aria-labelledby="cta-title"
      className={styles.finalCta}
      data-analytics-section="final_cta"
      data-hide-sticky
      ref={ref}
    >
      <motion.div className={styles.finalPhoto} style={reduce ? undefined : { y: drift }}>
        <Image
          alt=""
          className={styles.cover}
          fill
          sizes="100vw"
          src="/assets/landing/photos/cta-villa.webp"
          unoptimized
        />
      </motion.div>
      <span aria-hidden="true" className={styles.finalScrim} />
      <div className={`${styles.container} ${styles.finalBody}`}>
        {/* The brand thread draws the house from the logo. */}
        <svg
          aria-hidden="true"
          className={styles.house}
          fill="none"
          focusable="false"
          height="84"
          stroke="#FFFFFF"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
          viewBox="0 0 24 24"
          width="84"
        >
          <motion.path
            d="M4 11.5 12 5l8 6.5V20H4z"
            initial={{ pathLength: reduce ? 1 : 0 }}
            transition={{ duration: 1.3, ease }}
            viewport={{ once: true, margin: '0px 0px -20% 0px' }}
            whileInView={{ pathLength: 1 }}
          />
          <motion.path
            d="M10 20v-5h4v5"
            initial={{ pathLength: reduce ? 1 : 0 }}
            transition={{ duration: 0.6, ease, delay: 1.1 }}
            viewport={{ once: true, margin: '0px 0px -20% 0px' }}
            whileInView={{ pathLength: 1 }}
          />
        </svg>
        <Reveal as="h2" className={styles.finalH2} delay={0.1} id="cta-title">
          Your next home is one brief away.
        </Reveal>
        <Reveal className={styles.finalButtons} delay={0.2}>
          <TrackedLink
            className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLg}`}
            eventName="create_account_clicked"
            eventProperties={{ placement: 'final_cta' }}
            href={registerUrl}
          >
            Find a home
            <ArrowRight
              aria-hidden="true"
              className={styles.btnArrow}
              size={20}
              strokeWidth={1.75}
            />
          </TrackedLink>
          <TrackedLink
            className={`${styles.btn} ${styles.btnGhostWhite} ${styles.btnLg}`}
            eventName="broker_join_clicked"
            eventProperties={{ placement: 'final_cta' }}
            href={brokerUrl}
          >
            List your properties
          </TrackedLink>
        </Reveal>
        <Reveal delay={0.3}>
          <ShareButton className={styles.ctaShare} />
        </Reveal>
      </div>
    </section>
  );
}

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
        {/* The real EstoSpaces mark. */}
        {/* biome-ignore lint/performance/noImgElement: small static logo animated in with framer-motion */}
        <motion.img
          alt=""
          className={styles.finalLogo}
          height={84}
          initial={reduce ? false : { opacity: 0, y: 16, scale: 0.9 }}
          src="/assets/logo-mark.png"
          transition={{ duration: 0.8, ease }}
          viewport={{ once: true, amount: 0.6 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          width={160}
        />
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

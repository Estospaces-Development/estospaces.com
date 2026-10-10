'use client';

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import Image from 'next/image';
import { Fragment, useEffect, useRef, useState } from 'react';

import TrackedLink from '../../site/TrackedLink';
import styles from '../Home.module.css';
import { ease, spring } from './motion';

const words = [
  ['Homes', false],
  ['that', false],
  ['answer', true],
  ['back.', true],
];

// Primary button that leans toward the pointer (max 8px) and slides its arrow on hover.
function MagneticLink({ href, children, eventProperties }) {
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), spring);
  const y = useSpring(useMotionValue(0), spring);
  const ref = useRef(null);

  const onMove = (event) => {
    if (reduce || !ref.current) return;
    const box = ref.current.getBoundingClientRect();
    const dx = event.clientX - (box.left + box.width / 2);
    const dy = event.clientY - (box.top + box.height / 2);
    x.set(Math.max(-8, Math.min(8, dx * 0.18)));
    y.set(Math.max(-8, Math.min(8, dy * 0.18)));
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      className={styles.magnet}
      onPointerLeave={onLeave}
      onPointerMove={onMove}
      ref={ref}
      style={{ x, y }}
    >
      <TrackedLink
        className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLg}`}
        eventName="create_account_clicked"
        eventProperties={eventProperties}
        href={href}
      >
        {children}
        <ArrowRight aria-hidden="true" className={styles.btnArrow} size={20} strokeWidth={1.75} />
      </TrackedLink>
    </motion.span>
  );
}

export default function Hero({ photo, registerUrl, brokerUrl }) {
  const reduce = useReducedMotion();
  const stage = useRef(null);
  const textRef = useRef(null);
  const mediaRef = useRef(null);
  const dotRef = useRef(null);
  const replyRef = useRef(null);
  const [thread, setThread] = useState('');

  // Photo parallax: drifts up 40px and settles from 1.08 to 1 as the hero scrolls away.
  const { scrollYProgress } = useScroll({ target: mediaRef, offset: ['start start', 'end start'] });
  const drift = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const zoom = useTransform(scrollYProgress, [0, 1], [1.08, 1]);

  // Pointer parallax for the two cards (desktop with a real pointer only).
  const px = useSpring(useMotionValue(0), spring);
  const py = useSpring(useMotionValue(0), spring);
  const cardAx = useTransform(px, (v) => v * -10);
  const cardAy = useTransform(py, (v) => v * -10);
  const cardBx = useTransform(px, (v) => v * 10);
  const cardBy = useTransform(py, (v) => v * 10);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media || reduce) return undefined;
    const query = window.matchMedia('(hover: hover) and (min-width: 900px)');
    const move = (event) => {
      if (!query.matches) return;
      const box = media.getBoundingClientRect();
      px.set(((event.clientX - box.left) / box.width - 0.5) * 2);
      py.set(((event.clientY - box.top) / box.height - 0.5) * 2);
    };
    const leave = () => {
      px.set(0);
      py.set(0);
    };
    media.addEventListener('pointermove', move);
    media.addEventListener('pointerleave', leave);
    return () => {
      media.removeEventListener('pointermove', move);
      media.removeEventListener('pointerleave', leave);
    };
  }, [reduce, px, py]);

  // The thread: from the eyebrow dot, along the eyebrow line (under the pill), down the gutter between the
  // text and the photo, into the reply row. Re-measured whenever the layout changes. Hidden under 900px.
  useEffect(() => {
    const root = stage.current;
    if (!root) return undefined;
    const measure = () => {
      const dot = dotRef.current;
      const reply = replyRef.current;
      if (!dot || !reply || window.innerWidth < 900) {
        setThread('');
        return;
      }
      const o = root.getBoundingClientRect();
      const d = dot.getBoundingClientRect();
      const r = reply.getBoundingClientRect();
      const textRight = textRef.current.getBoundingClientRect().right;
      const photoLeft = mediaRef.current.getBoundingClientRect().left;
      const sx = d.left + d.width / 2 - o.left;
      const sy = d.top + d.height / 2 - o.top;
      const gx = (textRight + photoLeft) / 2 - o.left;
      const ey = r.top + r.height / 2 - o.top;
      const ex = r.left - o.left - 6;
      const c = 18;
      setThread(
        `M${sx} ${sy} H${gx - c} Q${gx} ${sy} ${gx} ${sy + c} V${ey - c} Q${gx} ${ey} ${gx + c} ${ey} H${ex}`,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.hero} data-analytics-section="hero" data-hero id="product">
      <div className={`${styles.container} ${styles.heroGrid}`} ref={stage}>
        {thread ? (
          <svg aria-hidden="true" className={styles.thread} focusable="false">
            <motion.path
              animate={{ pathLength: 1 }}
              d={thread}
              fill="none"
              initial={{ pathLength: reduce ? 1 : 0 }}
              stroke="var(--accent)"
              strokeLinecap="round"
              strokeWidth="2.5"
              transition={{ duration: 1.5, ease, delay: 1.3 }}
            />
          </svg>
        ) : null}

        <div className={styles.heroText} ref={textRef}>
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className={styles.eyebrow}
            data-m
            initial={reduce ? false : { opacity: 0, y: 12 }}
            transition={{ duration: 0.7, ease }}
          >
            <span aria-hidden="true" className={styles.liveDot} ref={dotRef} />
            Now live in India and the UK
          </motion.p>

          <h1 className={styles.h1}>
            {words.map(([word, accent], i) => (
              <Fragment key={word}>
                <span className={styles.word}>
                  <motion.span
                    animate={{ y: '0%' }}
                    className={accent ? styles.accentWord : styles.wordIn}
                    data-m
                    initial={reduce ? false : { y: '110%' }}
                    transition={{ duration: 0.9, ease, delay: 0.1 + i * 0.07 }}
                  >
                    {word}
                  </motion.span>
                </span>{' '}
              </Fragment>
            ))}
          </h1>

          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className={styles.heroSub}
            data-m
            initial={reduce ? false : { opacity: 0, y: 16 }}
            transition={{ duration: 0.8, ease, delay: 0.55 }}
          >
            Send one brief. Verified agents reply on a live clock. Viewing, documents and keys stay
            in one case.
          </motion.p>

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className={styles.ctaRow}
            data-m
            initial={reduce ? false : { opacity: 0, y: 16 }}
            transition={{ duration: 0.8, ease, delay: 0.7 }}
          >
            <MagneticLink eventProperties={{ placement: 'hero' }} href={registerUrl}>
              Find a home
            </MagneticLink>
            <TrackedLink
              className={`${styles.btn} ${styles.btnGhost} ${styles.btnLg}`}
              eventName="broker_join_clicked"
              eventProperties={{ placement: 'hero' }}
              href={brokerUrl}
            >
              List your properties
            </TrackedLink>
          </motion.div>
        </div>

        <div className={styles.heroMedia} ref={mediaRef}>
          <motion.div
            animate={{ clipPath: 'inset(0% 0% 0% 0% round 24px)' }}
            className={styles.heroPhoto}
            data-m
            initial={reduce ? false : { clipPath: 'inset(100% 0% 0% 0% round 24px)' }}
            transition={{ duration: 1.1, ease, delay: 0.15 }}
          >
            <motion.div
              className={styles.heroImgWrap}
              style={reduce ? undefined : { y: drift, scale: zoom }}
            >
              <Image
                alt="A sunlit living room in a modern apartment"
                className={styles.cover}
                fill
                priority
                sizes="(max-width: 900px) 100vw, 44vw"
                src={photo}
                unoptimized
              />
            </motion.div>
            <span aria-hidden="true" className={styles.heroScrim} />
          </motion.div>

          <motion.div
            className={`${styles.glass} ${styles.briefCard}`}
            style={{ x: cardAx, y: cardAy }}
          >
            <p className={styles.glassTitle}>Your brief</p>
            <p className={styles.glassLine}>2BHK to rent · Anna Nagar · ₹35-40k</p>
            <motion.div
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={styles.replyLive}
              data-m
              initial={reduce ? false : { opacity: 0, y: 18, scale: 0.94 }}
              ref={replyRef}
              transition={{ type: 'spring', stiffness: 160, damping: 20, delay: 0.8 + 0.9 }}
            >
              <span aria-hidden="true" className={styles.avatar}>
                RK
              </span>
              <span className={styles.replyCopy}>
                <strong>Rahul K. replied</strong>
                <span>10-min target</span>
              </span>
              <span className={styles.replyRing}>
                <svg aria-hidden="true" height="32" viewBox="0 0 40 40" width="32">
                  <circle
                    className={styles.ringTrack}
                    cx="20"
                    cy="20"
                    fill="none"
                    r="16"
                    strokeWidth="4"
                  />
                  <motion.circle
                    animate={{ pathLength: 0.6 }}
                    className={styles.ringFill}
                    cx="20"
                    cy="20"
                    fill="none"
                    initial={{ pathLength: reduce ? 0.6 : 0 }}
                    r="16"
                    strokeLinecap="round"
                    strokeWidth="4"
                    transform="rotate(-90 20 20)"
                    transition={{ duration: 1.2, ease, delay: 2 }}
                  />
                </svg>
                <b>6 min</b>
              </span>
            </motion.div>
          </motion.div>

          <motion.div
            className={`${styles.glass} ${styles.trackChip}`}
            style={{ x: cardBx, y: cardBy }}
          >
            <p className={styles.glassTitle}>Fast Track</p>
            <span aria-hidden="true" className={styles.dots}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <motion.i
                  animate={{ scale: 1 }}
                  className={i < 3 ? styles.dotOn : styles.dotOff}
                  data-m
                  initial={reduce ? false : { scale: i < 3 ? 0.4 : 1 }}
                  key={i}
                  transition={{
                    type: 'spring',
                    stiffness: 220,
                    damping: 14,
                    delay: 1.2 + i * 0.12,
                  }}
                />
              ))}
            </span>
            <p className={styles.glassLine}>
              <Check aria-hidden="true" size={15} strokeWidth={2.25} /> Viewing booked · Sat 11:00
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

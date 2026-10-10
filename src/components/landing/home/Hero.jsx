'use client';

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { ArrowRight, Check, KeyRound, Send } from 'lucide-react';
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

// Cinematic stills that slowly cross-fade behind the headline (Unsplash licence, see photos/CREDITS.md).
const stills = [
  ['/assets/landing/photos/hero-1.webp', 'A sunlit living room with sculpted lounge chairs'],
  ['/assets/landing/photos/hero-2.webp', 'A modern family home lit up at dusk'],
  ['/assets/landing/photos/hero-3.webp', 'A warm kitchen with an island and pendant light'],
];
const STILL_MS = 6500;

// The live case: what happens after one brief, revealed step by step on a loop.
const steps = [
  { icon: 'send', title: 'Brief sent', meta: '9:41' },
  { icon: 'reply', title: 'Rahul K. replied', meta: '6 min', ring: 0.6, who: 'RK' },
  { icon: 'reply', title: 'Priya N. replied', meta: '9 min', ring: 0.9, who: 'PN' },
  { icon: 'check', title: 'Viewing booked', meta: 'Sat 11:00' },
  { icon: 'key', title: 'Fast Track started', meta: '24h aim' },
];
const STEP_MS = 1500;
const HOLD_STEPS = 3; // extra beats with every step shown before the loop restarts

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

function StepIcon({ step }) {
  if (step.who) {
    return (
      <span aria-hidden="true" className={styles.liveAvatar}>
        {step.who}
      </span>
    );
  }
  const Icon = { send: Send, check: Check, key: KeyRound }[step.icon] ?? Check;
  return (
    <span aria-hidden="true" className={styles.liveIcon}>
      <Icon size={16} strokeWidth={2} />
    </span>
  );
}

// Hero: a framed, full-height photo panel. Stills cross-fade with a slow zoom behind a white headline,
// and a glass "live case" card plays out what one brief triggers. Same look in light and dark mode.
export default function Hero({ registerUrl, brokerUrl }) {
  const reduce = useReducedMotion();
  const panel = useRef(null);
  const [still, setStill] = useState(0);
  const [shown, setShown] = useState(reduce ? steps.length : 0);

  // Scroll: the photo drifts and the copy lifts away as the hero leaves.
  const { scrollYProgress } = useScroll({ target: panel, offset: ['start start', 'end start'] });
  const photoY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const copyFade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Pointer: the live card floats a little against the photo (desktop pointers only).
  const px = useSpring(useMotionValue(0), spring);
  const py = useSpring(useMotionValue(0), spring);
  const cardX = useTransform(px, (v) => v * -12);
  const cardY = useTransform(py, (v) => v * -10);
  const photoX = useTransform(px, (v) => v * 10);

  useEffect(() => {
    const el = panel.current;
    if (!el || reduce) return undefined;
    const query = window.matchMedia('(hover: hover) and (min-width: 900px)');
    const move = (event) => {
      if (!query.matches) return;
      const box = el.getBoundingClientRect();
      px.set(((event.clientX - box.left) / box.width - 0.5) * 2);
      py.set(((event.clientY - box.top) / box.height - 0.5) * 2);
    };
    const leave = () => {
      px.set(0);
      py.set(0);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, [reduce, px, py]);

  // Timers run only while the hero is on screen, and never under reduced motion.
  useEffect(() => {
    const el = panel.current;
    if (!el || reduce) {
      setShown(steps.length);
      return undefined;
    }
    let a = 0;
    let b = 0;
    let beat = 1;
    const stop = () => {
      window.clearInterval(a);
      window.clearInterval(b);
    };
    const start = () => {
      stop();
      a = window.setInterval(() => setStill((i) => (i + 1) % stills.length), STILL_MS);
      b = window.setInterval(() => {
        beat = (beat + 1) % (steps.length + HOLD_STEPS + 1);
        setShown(Math.min(beat, steps.length));
      }, STEP_MS);
    };
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    io.observe(el);
    const first = window.setTimeout(() => setShown(1), 900);
    return () => {
      io.disconnect();
      stop();
      window.clearTimeout(first);
    };
  }, [reduce]);

  return (
    <section className={styles.heroP} data-analytics-section="hero" data-hero id="product">
      <div className={styles.heroPanel} ref={panel}>
        <motion.div
          aria-hidden="true"
          className={styles.heroStills}
          style={reduce ? undefined : { y: photoY, x: photoX }}
        >
          {stills.map(([src], i) => (
            // biome-ignore lint/performance/noImgElement: animated cross-fade stills, already sized WebP
            <motion.img
              alt=""
              animate={
                reduce
                  ? { opacity: i === 0 ? 1 : 0 }
                  : { opacity: i === still ? 1 : 0, scale: i === still ? 1 : 1.1 }
              }
              className={styles.heroStill}
              decoding="async"
              fetchPriority={i === 0 ? 'high' : 'low'}
              initial={false}
              key={src}
              loading={i === 0 ? 'eager' : 'lazy'}
              src={src}
              transition={{
                opacity: { duration: 1.4, ease: 'easeInOut' },
                scale: { duration: STILL_MS / 1000 + 1.4, ease: 'linear' },
              }}
            />
          ))}
        </motion.div>
        <span aria-hidden="true" className={styles.heroShade} />

        <motion.div
          className={styles.heroCopy}
          style={reduce ? undefined : { y: copyY, opacity: copyFade }}
        >
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className={styles.heroPill}
            data-m
            initial={reduce ? false : { opacity: 0, y: 12 }}
            transition={{ duration: 0.7, ease, delay: 0.2 }}
          >
            <span aria-hidden="true" className={styles.liveDot} />
            Now live in India and the UK
          </motion.p>

          <h1 className={styles.heroTitle}>
            {words.map(([word, accent], i) => (
              <Fragment key={word}>
                <span className={styles.word}>
                  <motion.span
                    animate={{ y: '0%', rotate: 0 }}
                    className={accent ? styles.heroAccent : styles.wordIn}
                    data-m
                    initial={reduce ? false : { y: '115%', rotate: 4 }}
                    transition={{ duration: 1, ease, delay: 0.3 + i * 0.08 }}
                  >
                    {word}
                  </motion.span>
                </span>
                {i === 1 ? <br /> : ' '}
              </Fragment>
            ))}
          </h1>

          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className={styles.heroLede}
            data-m
            initial={reduce ? false : { opacity: 0, y: 16 }}
            transition={{ duration: 0.8, ease, delay: 0.75 }}
          >
            Send one brief. Verified agents reply on a live clock. Viewing, documents and keys stay
            in one case.
          </motion.p>

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className={styles.ctaRow}
            data-m
            initial={reduce ? false : { opacity: 0, y: 16 }}
            transition={{ duration: 0.8, ease, delay: 0.9 }}
          >
            <MagneticLink eventProperties={{ placement: 'hero' }} href={registerUrl}>
              Find a home
            </MagneticLink>
            <TrackedLink
              className={`${styles.btn} ${styles.btnGlass} ${styles.btnLg}`}
              eventName="broker_join_clicked"
              eventProperties={{ placement: 'hero' }}
              href={brokerUrl}
            >
              List your properties
            </TrackedLink>
          </motion.div>
        </motion.div>

        <motion.aside
          animate={{ opacity: 1, y: 0 }}
          aria-label="Example of a live case"
          className={styles.liveCard}
          data-m
          initial={reduce ? false : { opacity: 0, y: 40 }}
          style={reduce ? undefined : { x: cardX, translateY: cardY }}
          transition={{ duration: 1, ease, delay: 0.6 }}
        >
          <header className={styles.liveHead}>
            <span className={styles.liveLabel}>
              <span aria-hidden="true" className={styles.liveDot} /> Live case
            </span>
            <span className={styles.liveBrief}>2BHK to rent · Anna Nagar · ₹35-40k</span>
          </header>
          <div className={styles.liveBody}>
            <span aria-hidden="true" className={styles.liveSpine}>
              <motion.span
                animate={{ scaleY: shown / steps.length }}
                className={styles.liveSpineFill}
                initial={false}
                transition={{ duration: 0.6, ease }}
              />
            </span>
            <ol className={styles.liveList}>
              <AnimatePresence initial={false}>
                {steps.slice(0, shown).map((step) => (
                  <motion.li
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={styles.liveItem}
                    exit={{ opacity: 0, transition: { duration: 0.3 } }}
                    initial={reduce ? false : { opacity: 0, y: 14, scale: 0.97 }}
                    key={step.title}
                    transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                  >
                    <StepIcon step={step} />
                    <span className={styles.liveTitle}>{step.title}</span>
                    {step.ring ? (
                      <span className={styles.liveRing}>
                        <svg aria-hidden="true" height="26" viewBox="0 0 40 40" width="26">
                          <circle
                            className={styles.ringTrack}
                            cx="20"
                            cy="20"
                            fill="none"
                            r="16"
                            strokeWidth="5"
                          />
                          <motion.circle
                            animate={{ pathLength: step.ring }}
                            className={styles.ringFill}
                            cx="20"
                            cy="20"
                            fill="none"
                            initial={{ pathLength: reduce ? step.ring : 0 }}
                            r="16"
                            strokeLinecap="round"
                            strokeWidth="5"
                            transform="rotate(-90 20 20)"
                            transition={{ duration: 0.9, ease, delay: 0.15 }}
                          />
                        </svg>
                        <b>{step.meta}</b>
                      </span>
                    ) : (
                      <span className={styles.liveMeta}>{step.meta}</span>
                    )}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ol>
          </div>
          <p className={styles.liveFoot}>10-minute reply target, shown live</p>
        </motion.aside>
      </div>
    </section>
  );
}

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

// Hero: big headline over a tilted product stage. The stage plays a silent, caption-free loop of the film's
// key moments (verified seal, reply clock, Fast Track, keys); it flattens and grows as the page scrolls.
export default function Hero({ loop, registerUrl, brokerUrl }) {
  const reduce = useReducedMotion();
  const root = useRef(null);
  const stage = useRef(null);
  const video = useRef(null);
  const dotRef = useRef(null);
  const replyRef = useRef(null);
  const [thread, setThread] = useState('');

  // Scroll: the stage tilts from 16deg to flat and scales up as it rises into view.
  const { scrollYProgress } = useScroll({ target: stage, offset: ['start end', 'start 20%'] });
  const tilt = useTransform(scrollYProgress, [0, 1], [16, 0]);
  const grow = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const glow = useTransform(scrollYProgress, [0, 1], [0.55, 1]);

  // Pointer parallax for the floating cards and a gentle tilt of the stage (desktop pointers only).
  const px = useSpring(useMotionValue(0), spring);
  const py = useSpring(useMotionValue(0), spring);
  const cardAx = useTransform(px, (v) => v * -14);
  const cardAy = useTransform(py, (v) => v * -10);
  const cardBx = useTransform(px, (v) => v * 14);
  const cardBy = useTransform(py, (v) => v * 10);
  const turn = useTransform(px, (v) => v * 3);

  useEffect(() => {
    const el = root.current;
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

  // The loop only plays while the hero is on screen, never under reduced motion.
  useEffect(() => {
    const node = video.current;
    const el = stage.current;
    if (!node || !el) return undefined;
    if (reduce) {
      node.pause();
      return undefined;
    }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) node.play().catch(() => {});
      else node.pause();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  // The thread: from the live dot straight down the left gutter beside the stage, into the reply row.
  useEffect(() => {
    const el = root.current;
    if (!el) return undefined;
    const measure = () => {
      const dot = dotRef.current;
      const reply = replyRef.current;
      if (!dot || !reply || window.innerWidth < 900) {
        setThread('');
        return;
      }
      const o = el.getBoundingClientRect();
      const d = dot.getBoundingClientRect();
      const r = reply.getBoundingClientRect();
      const sx = d.left + d.width / 2 - o.left;
      const sy = d.top + d.height / 2 - o.top;
      const ey = r.top + r.height / 2 - o.top;
      const ex = r.left - o.left - 6;
      const c = 20;
      setThread(`M${sx} ${sy} V${ey - c} Q${sx} ${ey} ${sx + c} ${ey} H${ex}`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    document.fonts?.ready.then(measure);
    const late = window.setTimeout(measure, 2400);
    return () => {
      observer.disconnect();
      window.clearTimeout(late);
    };
  }, []);

  return (
    <section
      className={styles.heroX}
      data-analytics-section="hero"
      data-hero
      id="product"
      ref={root}
    >
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
            transition={{ duration: 1.6, ease, delay: 1.2 }}
          />
        </svg>
      ) : null}

      <div className={`${styles.container} ${styles.heroTop}`}>
        <div className={styles.heroHead}>
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

          <h1 className={`${styles.h1} ${styles.h1X}`}>
            {words.map(([word, accent], i) => (
              <Fragment key={word}>
                <span className={styles.word}>
                  <motion.span
                    animate={{ y: '0%', rotate: 0 }}
                    className={accent ? styles.accentWord : styles.wordIn}
                    data-m
                    initial={reduce ? false : { y: '115%', rotate: 4 }}
                    transition={{ duration: 1, ease, delay: 0.1 + i * 0.08 }}
                  >
                    {word}
                  </motion.span>
                </span>
                {i === 1 ? <br className={styles.heroBreak} /> : ' '}
              </Fragment>
            ))}
          </h1>
        </div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className={styles.heroAside}
          data-m
          initial={reduce ? false : { opacity: 0, y: 18 }}
          transition={{ duration: 0.8, ease, delay: 0.55 }}
        >
          <p className={styles.heroSub}>
            Send one brief. Verified agents reply on a live clock. Viewing, documents and keys stay
            in one case.
          </p>
          <div className={styles.ctaRow}>
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
          </div>
        </motion.div>
      </div>

      <div className={`${styles.container} ${styles.heroStageWrap}`}>
        <motion.span
          aria-hidden="true"
          className={styles.heroGlow}
          style={reduce ? undefined : { opacity: glow }}
        />
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className={styles.heroStage}
          data-m
          initial={reduce ? false : { opacity: 0, y: 60 }}
          ref={stage}
          style={reduce ? undefined : { rotateX: tilt, rotateY: turn, scale: grow }}
          transition={{ duration: 1.2, ease, delay: 0.35 }}
        >
          <video
            aria-label="EstoSpaces in motion: a verified seal, a live reply clock, a Fast Track case and the keys"
            autoPlay={!reduce}
            className={styles.heroVideo}
            loop
            muted
            playsInline
            poster={loop.poster}
            preload="auto"
            ref={video}
          >
            <source src={loop.webm} type="video/webm" />
            <source src={loop.mp4} type="video/mp4" />
          </video>
        </motion.div>

        <motion.div
          className={`${styles.glass} ${styles.briefCardX}`}
          style={reduce ? undefined : { x: cardAx, y: cardAy }}
        >
          <p className={styles.glassTitle}>Your brief</p>
          <p className={styles.glassLine}>2BHK to rent · Anna Nagar · ₹35-40k</p>
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={styles.replyLive}
            data-m
            initial={reduce ? false : { opacity: 0, y: 18, scale: 0.94 }}
            ref={replyRef}
            transition={{ type: 'spring', stiffness: 160, damping: 20, delay: 1.5 }}
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
                  transition={{ duration: 1.2, ease, delay: 1.9 }}
                />
              </svg>
              <b>6 min</b>
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          className={`${styles.glass} ${styles.trackChipX}`}
          style={reduce ? undefined : { x: cardBx, y: cardBy }}
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
                transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 1.2 + i * 0.12 }}
              />
            ))}
          </span>
          <p className={styles.glassLine}>
            <Check aria-hidden="true" size={15} strokeWidth={2.25} /> Viewing booked · Sat 11:00
          </p>
        </motion.div>
      </div>
    </section>
  );
}

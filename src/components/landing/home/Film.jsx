'use client';

import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { Play } from 'lucide-react';
import { useRef, useState } from 'react';

import { ShareButton } from '../HomeMotion';
import styles from '../Home.module.css';
import Reveal from './Reveal';

// Placeholder chapter marks (label, seconds). Correct them in this one place when the final film lands.
const chapters = [
  ['Sign up & verify', 14],
  ['List a home', 38],
  ['Answer leads', 49],
  ['Fast Track', 61],
  ['Find a home', 74],
  ['Move in', 88],
];

const clock = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

export default function Film({ src, poster, length, userUrl, managerUrl }) {
  const reduce = useReducedMotion();
  const frame = useRef(null);
  const video = useRef(null);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(-1);

  // Scroll-linked entrance: the frame grows from 0.86 to full size and its corners tighten.
  const { scrollYProgress } = useScroll({ target: frame, offset: ['start end', 'center center'] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.86, 1]);
  const radius = useTransform(scrollYProgress, [0, 1], [32, 16]);
  const borderRadius = useMotionTemplate`${radius}px`;

  const play = () => {
    const node = video.current;
    if (!node) return;
    setStarted(true);
    node.muted = false;
    node.play().catch(() => {});
    node.focus({ preventScroll: true });
    window.dispatchEvent(
      new CustomEvent('estospaces:video-play', { detail: { placement: 'film' } }),
    );
  };

  const seek = (seconds) => {
    const node = video.current;
    if (!node) return;
    const go = () => {
      node.currentTime = seconds;
      play();
    };
    if (node.readyState >= 1) go();
    else {
      // preload="none": begin loading, then jump once the duration is known
      node.addEventListener('loadedmetadata', go, { once: true });
      setStarted(true);
      node.play().catch(() => {});
    }
  };

  const onTime = () => {
    const t = video.current?.currentTime ?? 0;
    let index = -1;
    chapters.forEach(([, start], i) => {
      if (t >= start) index = i;
    });
    setCurrent((prev) => (prev === index ? prev : index));
  };

  return (
    <section
      aria-labelledby="film-title"
      className={`${styles.section} ${styles.film}`}
      data-analytics-section="film"
      id="film"
    >
      <div className={styles.container}>
        <Reveal as="h2" className={`${styles.h2} ${styles.center}`} id="film-title">
          See EstoSpaces in two minutes.
        </Reveal>
      </div>

      <motion.div
        className={styles.filmFrame}
        data-m
        ref={frame}
        style={reduce ? undefined : { scale, borderRadius }}
      >
        {/* biome-ignore lint/a11y/useMediaCaption: captions are burned into the film */}
        <video
          className={styles.filmVideo}
          controls={started}
          onEnded={() => setStarted(false)}
          onTimeUpdate={onTime}
          playsInline
          poster={poster}
          preload="none"
          ref={video}
        >
          <source src={src} type="video/mp4" />
        </video>
        {started ? null : (
          <button
            aria-label="Play the EstoSpaces film"
            className={styles.playBtn}
            onClick={play}
            type="button"
          >
            <span aria-hidden="true" className={styles.playRing} />
            <Play aria-hidden="true" fill="currentColor" size={34} strokeWidth={1.75} />
          </button>
        )}
        {started ? null : <span className={styles.durationChip}>{length}</span>}
      </motion.div>

      <div className={styles.container}>
        <Reveal className={styles.filmMeta}>
          <fieldset className={styles.rail}>
            <legend className={styles.srOnly}>Jump to a chapter</legend>
            {chapters.map(([label, start], index) => (
              <button
                aria-current={current === index ? 'true' : undefined}
                className={styles.chapter}
                key={label}
                onClick={() => seek(start)}
                type="button"
              >
                {current === index ? (
                  <motion.span
                    aria-hidden="true"
                    className={styles.chapterOn}
                    layoutId="chapter-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                ) : null}
                <span className={styles.chapterText}>
                  {label}
                  <span className={styles.chapterTime}>{clock(start)}</span>
                </span>
              </button>
            ))}
          </fieldset>
          <p className={styles.filmLinks}>
            Full walkthroughs:{' '}
            <a href={userUrl} rel="noopener noreferrer" target="_blank">
              for home seekers
            </a>{' '}
            ·{' '}
            <a href={managerUrl} rel="noopener noreferrer" target="_blank">
              for professionals
            </a>
          </p>
          <ShareButton className={styles.shareLink} />
        </Reveal>
      </div>
    </section>
  );
}

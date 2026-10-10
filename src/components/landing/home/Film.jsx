'use client';

import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { Maximize2, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ShareButton } from '../HomeMotion';
import styles from '../Home.module.css';
import Reveal from './Reveal';

// Chapter marks of the v3 film (label, seconds), from the marketing-videos demo3 timing.
const chapters = [
  ['Sign up & verify', 14],
  ['List a home', 38],
  ['Answer leads', 49],
  ['Fast Track', 61],
  ['Find a home', 74],
  ['Move in', 88],
];
const LENGTH = 114;

const clock = (seconds) => {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export default function Film({ src, poster, userUrl, managerUrl }) {
  const reduce = useReducedMotion();
  const frame = useRef(null);
  const video = useRef(null);
  const idle = useRef(0);
  const userPaused = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(LENGTH);
  const [current, setCurrent] = useState(-1);
  const [chrome, setChrome] = useState(true);

  // Scroll-linked entrance: the frame grows from 0.88 to full size and its corners tighten.
  const { scrollYProgress } = useScroll({ target: frame, offset: ['start end', 'center center'] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.88, 1]);
  const radius = useTransform(scrollYProgress, [0, 1], [32, 18]);
  const borderRadius = useMotionTemplate`${radius}px`;

  // Autoplay muted while at least half the frame is on screen; pause when it leaves.
  // Reduced motion: never autoplay. A visitor who pressed pause stays paused.
  useEffect(() => {
    const node = video.current;
    const box = frame.current;
    if (!node || !box || reduce) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !userPaused.current) node.play().catch(() => {});
        else if (!entry.isIntersecting) node.pause();
      },
      { threshold: 0.5 },
    );
    io.observe(box);
    return () => io.disconnect();
  }, [reduce]);

  // Controls fade out after 2.5 s without pointer movement while playing.
  const wake = useCallback(() => {
    setChrome(true);
    window.clearTimeout(idle.current);
    idle.current = window.setTimeout(() => setChrome(false), 2500);
  }, []);
  useEffect(() => () => window.clearTimeout(idle.current), []);

  const toggle = () => {
    const node = video.current;
    if (!node) return;
    if (node.paused) {
      userPaused.current = false;
      node.play().catch(() => {});
    } else {
      userPaused.current = true;
      node.pause();
    }
    wake();
  };

  const toggleSound = () => {
    const node = video.current;
    if (!node) return;
    node.muted = !node.muted;
    setMuted(node.muted);
    if (!node.muted) {
      userPaused.current = false;
      node.play().catch(() => {});
      window.dispatchEvent(
        new CustomEvent('estospaces:video-play', { detail: { placement: 'film' } }),
      );
    }
    wake();
  };

  const seek = (seconds, withSound = false) => {
    const node = video.current;
    if (!node) return;
    const go = () => {
      node.currentTime = seconds;
      if (withSound) {
        node.muted = false;
        setMuted(false);
      }
      userPaused.current = false;
      node.play().catch(() => {});
    };
    if (node.readyState >= 1) go();
    else node.addEventListener('loadedmetadata', go, { once: true });
    wake();
  };

  const onBar = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    seek(((event.clientX - rect.left) / rect.width) * duration);
  };

  const onBarKey = (event) => {
    const node = video.current;
    if (!node) return;
    if (event.key === 'ArrowRight') seek(Math.min(duration, node.currentTime + 5));
    if (event.key === 'ArrowLeft') seek(Math.max(0, node.currentTime - 5));
  };

  const fullscreen = () => {
    const box = frame.current;
    const node = video.current;
    if (!box || !node) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else if (box.requestFullscreen) box.requestFullscreen();
    else node.webkitEnterFullscreen?.();
  };

  const onTime = () => {
    const t = video.current?.currentTime ?? 0;
    setTime(t);
    let index = -1;
    chapters.forEach(([, start], i) => {
      if (t >= start) index = i;
    });
    setCurrent((prev) => (prev === index ? prev : index));
  };

  const showChrome = chrome || !playing;

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
        data-chrome={showChrome ? 'on' : 'off'}
        data-m
        onPointerMove={wake}
        ref={frame}
        style={reduce ? undefined : { scale, borderRadius }}
      >
        <video
          className={styles.filmVideo}
          muted
          onClick={toggle}
          onEnded={() => {
            userPaused.current = true;
            setPlaying(false);
          }}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || LENGTH)}
          onPause={() => setPlaying(false)}
          onPlay={() => {
            setPlaying(true);
            wake();
          }}
          onTimeUpdate={onTime}
          playsInline
          poster={poster}
          preload="metadata"
          ref={video}
        >
          <source src={src} type="video/mp4" />
        </video>

        {muted ? (
          <button className={styles.soundChip} onClick={toggleSound} type="button">
            <VolumeX aria-hidden="true" size={18} strokeWidth={1.75} />
            Tap for sound
          </button>
        ) : null}

        <div className={styles.ctrls}>
          <button
            aria-label={playing ? 'Pause the film' : 'Play the film'}
            className={styles.ctrlBtn}
            onClick={toggle}
            type="button"
          >
            {playing ? (
              <Pause aria-hidden="true" fill="currentColor" size={18} strokeWidth={1.75} />
            ) : (
              <Play aria-hidden="true" fill="currentColor" size={18} strokeWidth={1.75} />
            )}
          </button>
          <div
            aria-label="Film progress"
            aria-valuemax={Math.round(duration)}
            aria-valuemin={0}
            aria-valuenow={Math.round(time)}
            aria-valuetext={`${clock(time)} of ${clock(duration)}`}
            className={styles.bar}
            onClick={onBar}
            onKeyDown={onBarKey}
            role="slider"
            tabIndex={0}
          >
            <span className={styles.barTrack} />
            <span
              className={styles.barFill}
              style={{ transform: `scaleX(${Math.min(1, time / duration)})` }}
            />
            {chapters.map(([label, start]) => (
              <span
                aria-hidden="true"
                className={styles.barTick}
                key={label}
                style={{ left: `${(start / duration) * 100}%` }}
              />
            ))}
          </div>
          <span className={styles.ctrlTime}>
            {clock(time)} / {clock(duration)}
          </span>
          <button
            aria-label={muted ? 'Turn sound on' : 'Mute'}
            className={styles.ctrlBtn}
            onClick={toggleSound}
            type="button"
          >
            {muted ? (
              <VolumeX aria-hidden="true" size={18} strokeWidth={1.75} />
            ) : (
              <Volume2 aria-hidden="true" size={18} strokeWidth={1.75} />
            )}
          </button>
          <button
            aria-label="Full screen"
            className={styles.ctrlBtn}
            onClick={fullscreen}
            type="button"
          >
            <Maximize2 aria-hidden="true" size={18} strokeWidth={1.75} />
          </button>
        </div>
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
                onClick={() => seek(start, true)}
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

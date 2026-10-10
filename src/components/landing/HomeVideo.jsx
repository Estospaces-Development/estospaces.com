'use client';

import { useRef, useState } from 'react';

import { ShareButton } from './HomeMotion';
import styles from './Home.module.css';

// Chapter marks of the v3 demo film (label, seconds), from marketing-videos demo3 timing. Update them with
// the file; the buttons seek the video and play from there.
const chapters = [
  ['Sign up & verify', 14],
  ['List a home', 38],
  ['Answer leads', 49],
  ['Fast Track', 61],
  ['Find a home', 74],
  ['Move in', 88],
];

const clock = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

export default function HomeVideo({ src, poster, title, length }) {
  const video = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(-1);

  const seek = (seconds) => {
    const node = video.current;
    if (!node) return;
    const go = () => {
      node.currentTime = seconds;
      node.play().catch(() => {});
    };
    if (node.readyState >= 1) {
      go();
      return;
    }
    // preload="none": start loading, then jump once the duration is known.
    node.addEventListener('loadedmetadata', go, { once: true });
    node.play().catch(() => {});
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
    <div className={styles.videoCard}>
      <div className={styles.videoStage}>
        {/* The demo is narrated and captioned on screen. */}
        {/* biome-ignore lint/a11y/useMediaCaption: captions are burned into the video */}
        <video
          className={styles.video}
          controls
          onEnded={() => setPlaying(false)}
          onPlay={() => {
            setPlaying(true);
            window.dispatchEvent(
              new CustomEvent('estospaces:video-play', { detail: { placement: 'overview' } }),
            );
          }}
          onTimeUpdate={onTime}
          playsInline
          poster={poster}
          preload="none"
          ref={video}
        >
          <source src={src} type="video/mp4" />
        </video>
        {playing ? null : (
          <button
            aria-label="Play the product overview video"
            className={styles.playBtn}
            onClick={() => video.current?.play().catch(() => {})}
            type="button"
          >
            <svg aria-hidden="true" height="26" viewBox="0 0 24 24" width="26">
              <path d="M8 5v14l11-7z" fill="#16130F" />
            </svg>
          </button>
        )}
      </div>
      <fieldset className={styles.chapters}>
        <legend className={styles.srOnly}>Jump to a chapter</legend>
        {chapters.map(([label, start], index) => (
          <button
            aria-current={current === index ? 'true' : undefined}
            className={`${styles.chapter} ${current === index ? styles.chapterOn : ''}`}
            key={label}
            onClick={() => seek(start)}
            type="button"
          >
            {label}
            <span className={styles.mono}>{clock(start)}</span>
          </button>
        ))}
      </fieldset>
      <div className={styles.videoCaption}>
        <span className={`${styles.display} ${styles.videoTitle}`}>{title}</span>
        <span className={`${styles.mono} ${styles.videoLength}`}>
          <span className={styles.srOnly}>Length </span>
          {length}
        </span>
      </div>
      <div className={styles.videoShare}>
        <ShareButton className={styles.shareLink} />
      </div>
    </div>
  );
}

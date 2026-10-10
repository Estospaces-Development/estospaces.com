'use client';

import { useRef, useState } from 'react';

import styles from './Home.module.css';

export default function HomeVideo({ src, poster, title, length }) {
  const video = useRef(null);
  const [playing, setPlaying] = useState(false);

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
      <div className={styles.videoCaption}>
        <span className={`${styles.display} ${styles.videoTitle}`}>{title}</span>
        <span className={`${styles.mono} ${styles.videoLength}`}>
          <span className={styles.srOnly}>Length </span>
          {length}
        </span>
      </div>
    </div>
  );
}

import { Play } from 'lucide-react';
import Image from 'next/image';

import styles from '../landing/Landing.module.css';

/**
 * Click-to-play YouTube facade. Renders a plain link (works without JavaScript);
 * /navigation.js swaps it for a youtube-nocookie iframe on click, so no YouTube
 * request happens until the visitor chooses to play.
 */
export default function VideoEmbed({ video, label, placement }) {
  return (
    <div className={styles.videoFrame}>
      <a
        className={styles.videoFacade}
        data-video-id={video.id}
        data-video-placement={placement}
        data-video-title={video.title}
        href={`https://www.youtube.com/watch?v=${video.id}`}
        rel="noreferrer"
        target="_blank"
      >
        <Image alt="" height={720} loading="lazy" src={video.thumbnail} unoptimized width={1280} />
        <span aria-hidden="true" className={styles.videoPlay}>
          <Play fill="currentColor" size={26} />
        </span>
        <span className={styles.videoLabel}>
          <span className="sr-only">Play video: </span>
          {label || video.title}
        </span>
      </a>
    </div>
  );
}

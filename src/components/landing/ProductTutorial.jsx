import { siteConfig } from '../../config/site';
import TrackedSection from '../site/TrackedSection';
import VideoEmbed from '../site/VideoEmbed';
import styles from './Landing.module.css';

const roles = [
  { key: 'user', video: siteConfig.videos.user },
  { key: 'manager', video: siteConfig.videos.manager },
];

const toSeconds = (time) => time.split(':').reduce((total, part) => total * 60 + Number(part), 0);

/**
 * Role-based tutorial. Without JavaScript both tutorials are shown one after the other and every
 * chapter is a link to the same moment on YouTube. /navigation.js adds the role tabs, loads the
 * player on demand, and makes the chapters jump inside it.
 */
export default function ProductTutorial() {
  return (
    <TrackedSection
      aria-labelledby="tutorial-title"
      className={styles.tutorialSection}
      eventName="product_preview_viewed"
      eventProperties={{ placement: 'tutorial' }}
      id="product-proof"
    >
      <div className={styles.tutorialIntro}>
        <h2 id="tutorial-title">Learn it live, in the real app.</h2>
        <p>
          Choose your role and follow a full walkthrough recorded on the real EstoSpaces app. Jump
          to any chapter, or watch it start to finish.
        </p>
      </div>

      <div className={styles.tutorial} data-tutorial>
        <div
          aria-label="Choose a tutorial"
          className={styles.tutorialTabs}
          data-tutorial-tabs
          hidden
          role="tablist"
        >
          {roles.map(({ key, video }, index) => (
            <button
              aria-controls={`tutorial-${key}`}
              aria-selected={index === 0}
              data-tutorial-tab={key}
              id={`tutorial-tab-${key}`}
              key={key}
              role="tab"
              tabIndex={index === 0 ? 0 : -1}
              type="button"
            >
              <strong>{video.label}</strong>
              <span>
                {video.duration} / {video.chapters.length} chapters
              </span>
            </button>
          ))}
        </div>

        {roles.map(({ key, video }) => (
          <div
            aria-labelledby={`tutorial-tab-${key}`}
            className={styles.tutorialPanel}
            data-tutorial-panel={key}
            data-video-id={video.id}
            data-video-placement={`tutorial_${key}`}
            data-video-title={video.title}
            id={`tutorial-${key}`}
            key={key}
            role="tabpanel"
          >
            <div className={styles.tutorialPanelHead}>
              <h3>{video.label} tutorial</h3>
              <p>{video.summary}</p>
            </div>

            <div className={styles.tutorialStage}>
              <VideoEmbed placement={`tutorial_${key}`} video={video} />
              <ol
                aria-label={`${video.label} tutorial chapters`}
                className={styles.tutorialChapters}
              >
                {video.chapters.map(([time, title]) => {
                  const seconds = toSeconds(time);
                  return (
                    <li key={time}>
                      <a
                        data-chapter-start={seconds}
                        href={`https://www.youtube.com/watch?v=${video.id}&t=${seconds}s`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <span>{time}</span>
                        {title}
                      </a>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        ))}

        <p className={styles.tutorialNote}>
          Every screen is the real EstoSpaces app. Names, homes, and records shown are fictional
          training data. The video loads from YouTube only when you press play.
        </p>
      </div>
    </TrackedSection>
  );
}

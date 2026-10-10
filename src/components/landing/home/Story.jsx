'use client';

import { motion, useInView, useMotionValueEvent, useScroll, useSpring } from 'framer-motion';
import Image from 'next/image';
import { useRef, useState } from 'react';

import styles from '../Home.module.css';
import { ease } from './motion';
import Reveal from './Reveal';
import { BriefUi, CalendarUi, KeysUi, RepliesUi, TrackUi } from './ui';

const steps = [
  {
    title: 'Send one brief',
    body: 'Area, budget and move-in date, written once. It goes to verified agents instead of a dozen separate calls.',
    photo: '/assets/landing/photos/story-brief.webp',
    alt: 'A bright bedroom with a made bed and a view of the city',
    Ui: BriefUi,
  },
  {
    title: 'Hear back on a live clock',
    body: 'Agents reply against a 10-minute target. You see who answered, how fast, and what they need from you.',
    photo: '/assets/landing/photos/story-replies.webp',
    alt: 'A designer living room with large windows',
    Ui: RepliesUi,
  },
  {
    title: 'Shortlist and book a viewing',
    body: 'Save the homes you like, pick a slot and get it confirmed on the same case.',
    photo: '/assets/landing/photos/story-viewing.webp',
    alt: 'A modern open kitchen with a dining table',
    Ui: CalendarUi,
  },
  {
    title: 'Fast Track the paperwork',
    body: 'Documents, decision and agreement move through six clear stages, with a 24-hour aim once the manager accepts.',
    photo: '/assets/landing/photos/story-track.webp',
    alt: 'A white apartment block with balconies among trees',
    Ui: TrackUi,
  },
  {
    title: 'Collect your keys',
    body: 'Handover is confirmed on the case, so the whole deal ends where it started: in one place.',
    photo: '/assets/landing/photos/story-keys.webp',
    alt: 'A modern villa lit at dusk',
    Ui: KeysUi,
  },
];

// Pinned scroll story (desktop). A 350vh track holds a sticky 100dvh stage; scroll progress picks the step
// and fills the thread rail. The same five steps render as a plain list on small screens, with reduced
// motion and without JavaScript (see StoryList and the display rules in Home.module.css).
export default function Story() {
  const track = useRef(null);
  const anchors = useRef([]);
  const [step, setStep] = useState(0);
  // entrances only play while the pinned stage is actually on screen
  const live = useInView(track, { margin: '-35% 0px -35% 0px' });

  const { scrollYProgress } = useScroll({ target: track, offset: ['start start', 'end end'] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 22, restDelta: 0.001 });
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    setStep((prev) => {
      const next = Math.max(0, Math.min(steps.length - 1, Math.floor(p * steps.length)));
      return prev === next ? prev : next;
    });
  });

  const go = (i) => anchors.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <section
      aria-labelledby="how-title"
      className={styles.story}
      data-analytics-section="how_it_works"
      id="how"
    >
      <span aria-hidden="true" id="journey" />

      <div className={styles.storyPinned} data-story-pinned ref={track}>
        {steps.map((s, i) => (
          <span
            aria-hidden="true"
            className={styles.storyAnchor}
            key={s.title}
            ref={(el) => {
              anchors.current[i] = el;
            }}
            style={{ top: `calc(${i + 0.5} * 50vh)` }}
          />
        ))}
        <div className={styles.storySticky}>
          <div className={`${styles.container} ${styles.storyGrid}`}>
            <div className={styles.storyLeft}>
              <span aria-hidden="true" className={styles.storyGhost}>
                {steps.map((s, i) => (
                  <motion.span
                    animate={{
                      opacity: i === step ? 1 : 0,
                      y: i === step ? 0 : i < step ? -30 : 30,
                    }}
                    className={styles.storyGhostNum}
                    initial={false}
                    key={s.title}
                    transition={{ duration: 0.7, ease }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </motion.span>
                ))}
              </span>

              <div className={styles.storyTop}>
                <h2 className={styles.storyLabel} id="how-title">
                  How it works
                </h2>
                <p className={styles.storyCount}>
                  <span className={styles.storyCountNow}>{String(step + 1).padStart(2, '0')}</span>{' '}
                  / {String(steps.length).padStart(2, '0')}
                </p>
              </div>

              <div aria-live="polite" className={styles.storyCopy}>
                {steps.map((s, i) => (
                  <motion.div
                    animate={{
                      opacity: i === step ? 1 : 0,
                      y: i === step ? 0 : i < step ? -18 : 18,
                    }}
                    aria-hidden={i !== step}
                    className={styles.storyCopyItem}
                    initial={false}
                    key={s.title}
                    transition={{ duration: 0.5, ease, delay: i === step ? 0.12 : 0 }}
                  >
                    <h3 className={styles.storyTitle}>{s.title}</h3>
                    <p className={styles.storyBody}>{s.body}</p>
                  </motion.div>
                ))}
              </div>

              <ol className={styles.stepList}>
                <span aria-hidden="true" className={styles.threadRail} />
                <motion.span
                  aria-hidden="true"
                  className={styles.threadFill}
                  style={{ scaleY: fill, transformOrigin: 'top' }}
                />
                {steps.map((s, i) => (
                  <li key={s.title}>
                    <button
                      aria-current={i === step ? 'step' : undefined}
                      className={styles.stepItem}
                      data-active={i === step}
                      data-done={i < step}
                      onClick={() => go(i)}
                      type="button"
                    >
                      <span className={styles.stepNum}>{String(i + 1).padStart(2, '0')}</span>
                      {s.title}
                    </button>
                  </li>
                ))}
              </ol>
            </div>

            <div className={styles.stage}>
              {steps.map((s, i) => (
                <motion.div
                  animate={{
                    clipPath: i <= step ? 'inset(0% 0% 0% 0%)' : 'inset(0% 0% 0% 100%)',
                  }}
                  aria-hidden={i !== step}
                  className={styles.stageCard}
                  initial={false}
                  key={s.title}
                  style={{ zIndex: i, pointerEvents: i === step ? 'auto' : 'none' }}
                  transition={{ duration: 0.8, ease }}
                >
                  <motion.div
                    animate={{ scale: i <= step ? 1 : 1.06 }}
                    className={styles.stageImg}
                    initial={false}
                    transition={{ duration: 1.3, ease }}
                  >
                    <Image
                      alt={s.alt}
                      className={styles.cover}
                      fill
                      sizes="(min-width: 900px) 52vw, 100vw"
                      src={s.photo}
                      unoptimized
                    />
                  </motion.div>
                  <span aria-hidden="true" className={styles.stageScrim} />
                  <motion.div
                    animate={i === step ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                    className={styles.stageUi}
                    initial={false}
                    transition={
                      i === step
                        ? { type: 'spring', stiffness: 130, damping: 20, delay: 0.55 }
                        : { duration: 0.2 }
                    }
                  >
                    <s.Ui play={live && i === step} />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <StoryList />
    </section>
  );
}

function StoryList() {
  return (
    <div className={`${styles.container} ${styles.storyList}`} data-story-list>
      <Reveal as="h2" className={styles.h2}>
        How it works
      </Reveal>
      {steps.map((s, i) => (
        <StoryCard index={i} key={s.title} step={s} />
      ))}
    </div>
  );
}

function StoryCard({ step, index }) {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true, margin: '0px 0px -25% 0px' });
  return (
    <Reveal as="article" className={styles.storyCard}>
      <div className={styles.storyCardMedia} ref={ref}>
        <Image
          alt={step.alt}
          className={styles.cover}
          fill
          sizes="(min-width: 640px) 90vw, 100vw"
          src={step.photo}
          unoptimized
        />
        <span aria-hidden="true" className={styles.stageScrim} />
        <div className={styles.stageUi}>
          <step.Ui play={seen} />
        </div>
      </div>
      <p className={styles.storyCardNum}>{String(index + 1).padStart(2, '0')}</p>
      <h3 className={styles.storyCardTitle}>{step.title}</h3>
      <p className={styles.storyBody}>{step.body}</p>
    </Reveal>
  );
}

'use client';

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { Check, KeyRound } from 'lucide-react';
import { useLayoutEffect } from 'react';

import styles from '../Home.module.css';
import { SAMPLE, useMarket } from './market';
import { ease, useSweep } from './motion';

// Small, crisp product moments used over photos (story, hero, bento). Each takes `play`: true starts its
// entrance. At rest every piece shows its final state, so the server render and reduced motion are complete.

export function Pop({ play, delay = 0, y = 14, scale = 1, className, children }) {
  const v = useSweep(play, 1, { duration: 0.7, delay });
  const style = {
    opacity: v,
    y: useTransform(v, [0, 1], [y, 0]),
    scale: useTransform(v, [0, 1], [scale, 1]),
  };
  return (
    <motion.div className={className} style={style}>
      {children}
    </motion.div>
  );
}

export function Typed({ text, play, delay = 0 }) {
  const reduce = useReducedMotion();
  const count = useMotionValue(text.length);
  const shown = useTransform(count, (n) => text.slice(0, Math.round(n)));

  useLayoutEffect(() => {
    if (!play || reduce) {
      count.set(text.length);
      return undefined;
    }
    count.set(0);
    const controls = animate(count, text.length, {
      duration: text.length * 0.04,
      delay,
      ease: 'linear',
    });
    return () => controls.stop();
  }, [play, reduce, text, delay, count]);

  return <motion.span>{shown}</motion.span>;
}

export function Ring({ play, value = 0.6, label, delay = 0.2 }) {
  const progress = useSweep(play, value, { duration: 1.2, delay });
  return (
    <span className={styles.ring}>
      <svg aria-hidden="true" height="44" viewBox="0 0 44 44" width="44">
        <circle className={styles.ringTrack} cx="22" cy="22" fill="none" r="18" strokeWidth="4" />
        <motion.circle
          className={styles.ringFill}
          cx="22"
          cy="22"
          fill="none"
          r="18"
          strokeLinecap="round"
          strokeWidth="4"
          style={{ pathLength: progress }}
          transform="rotate(-90 22 22)"
        />
      </svg>
      <span className={styles.ringLabel}>{label}</span>
    </span>
  );
}

export function BriefUi({ play }) {
  const { brief } = SAMPLE[useMarket()];
  const fields = [
    ['Area', brief.area],
    ['Budget', brief.budget],
    ['Move-in', brief.moveIn],
  ];
  return (
    <div className={styles.ui}>
      <p className={styles.uiTitle}>Your brief</p>
      {fields.map(([label, value], i) => (
        <div className={styles.field} key={label}>
          <span className={styles.fieldLabel}>{label}</span>
          <span className={styles.fieldValue}>
            <Typed delay={0.3 + i * 0.9} play={play} text={value} />
          </span>
        </div>
      ))}
    </div>
  );
}

export function RepliesUi({ play }) {
  const rows = SAMPLE[useMarket()].replies;
  return (
    <div className={styles.ui}>
      <div className={styles.uiHeadRow}>
        <p className={styles.uiTitle}>Replies</p>
        <Ring label="10-min target" play={play} value={0.6} />
      </div>
      {rows.map(([initials, name, time], i) => (
        <Pop className={styles.replyRow} delay={0.4 + i * 0.35} key={name} play={play}>
          <span aria-hidden="true" className={styles.avatar}>
            {initials}
          </span>
          <span className={styles.replyName}>{name}</span>
          <span className={styles.replyTime}>
            <Check aria-hidden="true" size={16} strokeWidth={2.25} />
            {time}
          </span>
        </Pop>
      ))}
    </div>
  );
}

const days = [
  ['WED', 11],
  ['THU', 12],
  ['FRI', 13],
  ['SAT', 14],
  ['SUN', 15],
];

export function CalendarUi({ play }) {
  return (
    <div className={styles.ui}>
      <p className={styles.uiTitle}>Pick a viewing</p>
      <div className={styles.cal}>
        {days.map(([name, num]) =>
          name === 'SAT' ? (
            <Pop className={styles.dayOn} delay={0.4} key={name} play={play} scale={0.7}>
              <span>{name}</span>
              <strong>{num}</strong>
            </Pop>
          ) : (
            <div className={styles.day} key={name}>
              <span>{name}</span>
              <strong>{num}</strong>
            </div>
          ),
        )}
      </div>
      <Pop className={styles.booked} delay={0.9} play={play}>
        <Check aria-hidden="true" size={18} strokeWidth={2.25} />
        Viewing booked · 11:00
      </Pop>
    </div>
  );
}

const stages = ['Selected', 'Documents', 'Viewing', 'Decision', 'Agreement', 'Handover'];

export function TrackUi({ play, dark = false, caption = true }) {
  // fills to "Agreement" (stage 5 of 6)
  const fill = useSweep(play, 4 / 5, { duration: 2.2, delay: 0.3 });
  const scaleY = useTransform(fill, (v) => v / (4 / 5));
  return (
    <div className={dark ? `${styles.ui} ${styles.uiDark}` : styles.ui}>
      <ol className={styles.track}>
        <span aria-hidden="true" className={styles.trackLine} />
        <motion.span
          aria-hidden="true"
          className={styles.trackFill}
          style={{ scaleY, transformOrigin: 'top' }}
        />
        {stages.map((name, i) => (
          <TrackStage fill={fill} index={i} key={name} name={name} />
        ))}
      </ol>
      {caption ? (
        <p className={styles.trackCaption}>24-hour aim, once the manager accepts</p>
      ) : null}
    </div>
  );
}

function TrackStage({ fill, index, name }) {
  const threshold = index / 5;
  const on = useTransform(fill, (v) => (v >= threshold - 0.001 ? 1 : 0));
  const scale = useTransform(on, [0, 1], [0.7, 1]);
  return (
    <li className={styles.tStage}>
      <motion.span aria-hidden="true" className={styles.tDot} style={{ opacity: on, scale }}>
        <Check size={12} strokeWidth={3} />
      </motion.span>
      <span aria-hidden="true" className={styles.tRing} />
      <span className={styles.tName}>{name}</span>
    </li>
  );
}

// Deterministic burst (no Math.random, so server and client agree).
const confetti = Array.from({ length: 18 }, (_, i) => {
  const angle = (i / 18) * Math.PI * 2 + (i % 3) * 0.2;
  const power = 70 + (i % 5) * 18;
  return {
    dx: Math.round(Math.cos(angle) * power),
    dy: Math.round(Math.sin(angle) * power - 30),
    hue: i % 3,
    rot: i * 47,
  };
});

export function KeysUi({ play }) {
  const burst = useSweep(play, 1, { duration: 1.3, delay: 0.5 });
  return (
    <div className={`${styles.ui} ${styles.keys}`}>
      <span aria-hidden="true" className={styles.keyIcon}>
        <KeyRound size={26} strokeWidth={1.75} />
      </span>
      <p className={styles.keysText}>Keys and handover confirmed</p>
      <span aria-hidden="true" className={styles.confetti}>
        {confetti.map((p) => (
          <Particle burst={burst} key={p.rot} p={p} />
        ))}
      </span>
    </div>
  );
}

function Particle({ burst, p }) {
  const x = useTransform(burst, [0, 1], [0, p.dx]);
  const y = useTransform(burst, [0, 0.6, 1], [0, p.dy, p.dy + 90]);
  const opacity = useTransform(burst, [0, 0.1, 0.75, 1], [0, 1, 1, 0]);
  const rotate = useTransform(burst, [0, 1], [0, p.rot + 240]);
  return (
    <motion.i
      className={styles.piece}
      data-hue={p.hue}
      style={{ x, y, opacity, rotate }}
      transition={{ ease }}
    />
  );
}

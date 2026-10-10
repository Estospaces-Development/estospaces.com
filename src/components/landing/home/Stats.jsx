'use client';

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion';
import { useLayoutEffect, useRef } from 'react';

import styles from '../Home.module.css';
import { ease } from './motion';
import Reveal from './Reveal';

const stats = [
  [10, ' min', 'reply target, shown live'],
  [24, ' h', 'Fast Track aim once accepted'],
  [6, ' stages', 'one case, start to finish'],
  [2, ' markets', 'India and the UK'],
];

// Counts up once when the tile is in view. The server render and reduced motion show the final number.
function Count({ to }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const seen = useInView(ref, { once: true, margin: '0px 0px -12% 0px' });
  const value = useMotionValue(to);
  const text = useTransform(value, (v) => String(Math.round(v)));

  useLayoutEffect(() => {
    if (!seen || reduce) return undefined;
    value.set(0);
    const controls = animate(value, to, { duration: 1.5, ease });
    return () => controls.stop();
  }, [seen, reduce, to, value]);

  return <motion.span ref={ref}>{text}</motion.span>;
}

export default function Stats() {
  return (
    <section aria-label="EstoSpaces in numbers" className={styles.stats}>
      <ul className={`${styles.container} ${styles.statGrid}`}>
        {stats.map(([to, unit, label], i) => (
          <Reveal as="li" className={styles.stat} delay={i * 0.07} key={label}>
            <span className={styles.statNum}>
              <Count to={to} />
              <span className={styles.statUnit}>{unit}</span>
            </span>
            <span className={styles.statLabel}>{label}</span>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

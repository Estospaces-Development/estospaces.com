import { animate, useMotionValue, useReducedMotion } from 'framer-motion';
import { useLayoutEffect } from 'react';

// Motion system for the home page. Every animated piece is a client leaf built on framer-motion.
export const ease = [0.16, 1, 0.3, 1];
export const spring = { type: 'spring', stiffness: 120, damping: 22 };

/**
 * A motion value that rests at `target` (the final state, which is also what the server renders and what
 * visitors with reduced motion get) and sweeps 0 -> target each time `play` turns true.
 */
export function useSweep(play, target = 1, { duration = 1, delay = 0 } = {}) {
  const reduce = useReducedMotion();
  const value = useMotionValue(target);

  useLayoutEffect(() => {
    if (!play || reduce) {
      value.set(target);
      return undefined;
    }
    value.set(0);
    const controls = animate(value, target, { duration, delay, ease });
    return () => controls.stop();
  }, [play, reduce, target, duration, delay, value]);

  return value;
}

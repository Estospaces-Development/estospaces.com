'use client';

import { motion, useReducedMotion } from 'framer-motion';

import { ease } from './motion';

// Fade-up on view. The server HTML carries the hidden state inline, so a <noscript> rule and the
// reduced-motion rule in Home.module.css show the final state without JavaScript or motion.
export default function Reveal({ as = 'div', delay = 0, y = 24, className, children, ...rest }) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      data-m
      initial={reduce ? false : { opacity: 0, y }}
      transition={{ duration: 0.8, ease, delay }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      whileInView={{ opacity: 1, y: 0 }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

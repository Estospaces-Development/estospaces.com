'use client';

import { useEffect, useRef, useState } from 'react';

import { siteConfig } from '../../config/site';
import { trackEvent } from '../../lib/analytics';
import TrackedLink from '../site/TrackedLink';
import styles from './Home.module.css';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const formatClock = (seconds) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

// Live mm:ss countdown. Server render and first client render show `from`, so there is no mismatch;
// it only ticks while on screen and never when the visitor prefers reduced motion.
export function LiveClock({ from, className }) {
  const ref = useRef(null);
  const [left, setLeft] = useState(from);

  useEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion()) return undefined;
    let timer = 0;
    const stop = () => {
      window.clearInterval(timer);
      timer = 0;
    };
    // Illustrative queue: when a timer runs out it starts again rather than sitting at 0:00.
    const tick = () => setLeft((value) => (value <= 1 ? from : value - 1));
    const observer = new IntersectionObserver(([entry]) => {
      stop();
      if (entry.isIntersecting) timer = window.setInterval(tick, 1000);
    });
    observer.observe(node);
    return () => {
      stop();
      observer.disconnect();
    };
  }, [from]);

  return (
    <span className={className} ref={ref}>
      {formatClock(left)}
    </span>
  );
}

// Thumb-zone bar for small screens: shown once the hero has scrolled away, hidden again while the final
// call to action or the footer is on screen (so it never sits on top of the same button or the legal links).
export function StickyCta({ registerUrl }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hero = document.querySelector('[data-hero]');
    const blockers = [...document.querySelectorAll('[data-hide-sticky]')];
    if (!hero || typeof IntersectionObserver !== 'function') return undefined;
    const visible = new Map();
    const update = () => setShow(!visible.get(hero) && !blockers.some((el) => visible.get(el)));
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) visible.set(entry.target, entry.isIntersecting);
      update();
    });
    for (const el of [hero, ...blockers]) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <aside aria-label="Quick actions" className={styles.sticky} data-show={show}>
      <TrackedLink
        className={styles.stickyPrimary}
        eventName="create_account_clicked"
        eventProperties={{ placement: 'sticky_bar' }}
        href={registerUrl}
      >
        Create account
      </TrackedLink>
      <a className={styles.stickySecondary} href="#pros">
        For professionals
      </a>
    </aside>
  );
}

const shareText = 'Homes that answer back — one brief, verified replies, one case to the keys.';

// Ethical sharing: a plain WhatsApp link everywhere, upgraded to the native share sheet where it exists.
// No incentives; the only parameter added is utm_source=share.
export function ShareButton({ className, label = "Send this to someone who's house-hunting" }) {
  const [origin, setOrigin] = useState(siteConfig.siteUrl);
  useEffect(() => setOrigin(window.location.origin), []);

  const url = `${origin}/?utm_source=share`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`;

  const onClick = (event) => {
    trackEvent('navigation_clicked', { placement: 'share', destination: 'share' });
    if (typeof navigator.share !== 'function') return;
    event.preventDefault();
    navigator.share({ title: document.title, text: shareText, url }).catch(() => {}); // closing the sheet is not an error
  };

  return (
    <a
      className={className}
      href={whatsapp}
      onClick={onClick}
      rel="noopener noreferrer"
      target="_blank"
    >
      <svg
        aria-hidden="true"
        fill="none"
        height="16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="16"
      >
        <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13" />
      </svg>
      {label}
    </a>
  );
}

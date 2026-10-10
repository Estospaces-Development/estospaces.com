'use client';

import Image from 'next/image';

import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import TrackedLink from '../../site/TrackedLink';
import styles from '../Home.module.css';
import { ease } from './motion';

// The real EstoSpaces mark (roof, window and wave), trimmed from public/assets/logo-icon.png.
export function BrandMark({ size = 36 }) {
  return (
    <Image
      alt=""
      className={styles.brandMark}
      height={Math.round(size * 0.84)}
      priority
      src="/assets/logo-mark.png"
      width={Math.round(size * 1.6)}
    />
  );
}

const links = [
  ['How it works', '#how'],
  ['For professionals', '#pros'],
  ['Pricing', '#pricing'],
  ['FAQ', '#faq'],
];

export default function Nav({ loginUrl, registerUrl }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const { scrollY } = useScroll();
  // 0 at the top, 1 once the page has scrolled 40px: the frosted bar fades in
  const frost = useTransform(scrollY, [0, 40], [0, 1]);

  return (
    <header className={styles.nav}>
      <motion.div aria-hidden="true" className={styles.navBg} style={{ opacity: frost }} />
      <div className={`${styles.container} ${styles.navInner}`}>
        <a aria-label="EstoSpaces home" className={styles.brand} href="/">
          <BrandMark />
          <span className={styles.wordmark}>estospaces</span>
        </a>

        <nav aria-label="Main" className={styles.navLinks}>
          {links.map(([label, href]) => (
            <a className={styles.navLink} href={href} key={label}>
              {label}
            </a>
          ))}
        </nav>

        <div className={styles.navRight}>
          <TrackedLink
            className={styles.loginLink}
            eventName="login_clicked"
            eventProperties={{ placement: 'header' }}
            href={loginUrl}
          >
            Log in
          </TrackedLink>
          <TrackedLink
            className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm}`}
            eventName="create_account_clicked"
            eventProperties={{ placement: 'header' }}
            href={registerUrl}
          >
            Get started
          </TrackedLink>
          <button
            aria-controls="mobile-menu"
            aria-expanded={open}
            aria-label="Open menu"
            className={styles.menuBtn}
            onClick={() => setOpen(true)}
            type="button"
          >
            <Menu aria-hidden="true" size={22} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? <Sheet loginUrl={loginUrl} onClose={close} registerUrl={registerUrl} /> : null}
      </AnimatePresence>
    </header>
  );
}

function Sheet({ onClose, loginUrl, registerUrl }) {
  const ref = useRef(null);

  // Focus trap, Escape to close, page scroll locked while open.
  useEffect(() => {
    const previous = document.activeElement;
    const focusable = () => [...ref.current.querySelectorAll('a[href], button')];
    focusable()[0]?.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusable();
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [onClose]);

  return (
    <motion.div
      animate={{ opacity: 1 }}
      aria-label="Menu"
      aria-modal="true"
      className={styles.sheet}
      exit={{ opacity: 0 }}
      id="mobile-menu"
      initial={{ opacity: 0 }}
      ref={ref}
      role="dialog"
      transition={{ duration: 0.25, ease }}
    >
      <div className={`${styles.container} ${styles.sheetTop}`}>
        <a aria-label="EstoSpaces home" className={styles.brand} href="/" onClick={onClose}>
          <BrandMark />
          <span className={styles.wordmark}>estospaces</span>
        </a>
        <button aria-label="Close menu" className={styles.menuBtn} onClick={onClose} type="button">
          <X aria-hidden="true" size={22} strokeWidth={1.75} />
        </button>
      </div>
      <nav aria-label="Menu" className={`${styles.container} ${styles.sheetNav}`}>
        {links.map(([label, href], i) => (
          <motion.a
            animate={{ opacity: 1, y: 0 }}
            className={styles.sheetLink}
            href={href}
            initial={{ opacity: 0, y: 18 }}
            key={label}
            onClick={onClose}
            transition={{ duration: 0.5, ease, delay: 0.08 + i * 0.06 }}
          >
            {label}
          </motion.a>
        ))}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className={styles.sheetActions}
          initial={{ opacity: 0, y: 18 }}
          transition={{ duration: 0.5, ease, delay: 0.4 }}
        >
          <TrackedLink
            className={`${styles.btn} ${styles.btnPrimary}`}
            eventName="create_account_clicked"
            eventProperties={{ placement: 'mobile_menu' }}
            href={registerUrl}
            onClick={onClose}
          >
            Get started
          </TrackedLink>
          <TrackedLink
            className={`${styles.btn} ${styles.btnGhost}`}
            eventName="login_clicked"
            eventProperties={{ placement: 'mobile_menu' }}
            href={loginUrl}
            onClick={onClose}
          >
            Log in
          </TrackedLink>
        </motion.div>
      </nav>
    </motion.div>
  );
}

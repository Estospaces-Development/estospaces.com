'use client';

import { useEffect, useRef, useState } from 'react';

import { trackEvent } from '../../lib/analytics';
import { buildPropertySearchUrl } from '../../lib/search-url';
import styles from './Home.module.css';

const categories = [
  ['all', 'All homes'],
  ['apt', 'Apartments'],
  ['villa', 'Villas & houses'],
  ['studio', 'Studios'],
  ['metro', 'Near metro'],
  ['pets', 'Pet-friendly'],
  ['furn', 'Furnished'],
  ['new', 'New launches'],
];

// Only categories that map to the app's property types are sent; the rest are visual filters for now.
const propertyTypes = { apt: 'apartment', villa: 'villa', studio: 'studio' };

const defaultPlaceholder = 'City, neighbourhood or landmark';
const examples = ['Anna Nagar, Chennai', 'Didsbury, Manchester', 'Whitefield, Bengaluru'];

// Types example places into the "Where" placeholder. It only ever touches the placeholder (never the
// value), stops while the field is focused or filled, pauses off screen, and is skipped entirely when the
// visitor prefers reduced motion.
function useTypewriterPlaceholder(inputRef) {
  const [placeholder, setPlaceholder] = useState(defaultPlaceholder);

  useEffect(() => {
    const input = inputRef.current;
    if (!input || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    let timer = 0;
    let onScreen = false;
    let word = 0;
    let chars = 0;
    let deleting = false;
    const idle = () => document.activeElement === input || input.value !== '' || !onScreen;

    const step = () => {
      if (idle()) {
        setPlaceholder(defaultPlaceholder);
        return;
      }
      const text = examples[word];
      chars += deleting ? -1 : 1;
      setPlaceholder(text.slice(0, chars));
      let wait = deleting ? 28 : 55;
      if (!deleting && chars === text.length) {
        deleting = true;
        wait = 1700;
      } else if (deleting && chars === 0) {
        deleting = false;
        word = (word + 1) % examples.length;
        wait = 350;
      }
      timer = window.setTimeout(step, wait);
    };
    const restart = () => {
      window.clearTimeout(timer);
      chars = 0;
      deleting = false;
      if (!idle()) timer = window.setTimeout(step, 400);
      else setPlaceholder(defaultPlaceholder);
    };

    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      restart();
    });
    observer.observe(input);
    input.addEventListener('focus', restart);
    input.addEventListener('blur', restart);
    input.addEventListener('input', restart);
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      input.removeEventListener('focus', restart);
      input.removeEventListener('blur', restart);
      input.removeEventListener('input', restart);
    };
  }, [inputRef]);

  return placeholder;
}

export default function HomeSearch({ searchUrl }) {
  const [mode, setMode] = useState('rent');
  const [category, setCategory] = useState('all');
  const whereRef = useRef(null);
  const wherePlaceholder = useTypewriterPlaceholder(whereRef);
  const rent = mode === 'rent';

  const submit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    trackEvent('landing_search_submitted', { listing_type: mode });
    window.location.assign(
      buildPropertySearchUrl(searchUrl, {
        type: rent ? 'rent' : 'sale',
        location: data.get('location'),
        maxPrice: String(data.get('maxPrice') || '').replace(/[,\s]/g, ''),
        propertyType: propertyTypes[category],
      }),
    );
  };

  return (
    <search aria-label="Search homes">
      <form action={searchUrl} className={styles.search} method="get" onSubmit={submit}>
        <input name="type" type="hidden" value={rent ? 'rent' : 'sale'} />
        <div className={styles.modeToggle}>
          {[
            ['rent', 'Rent'],
            ['buy', 'Buy'],
          ].map(([id, label]) => (
            <button
              aria-pressed={mode === id}
              className={`${styles.modeBtn} ${mode === id ? styles.modeBtnOn : ''}`}
              key={id}
              onClick={() => setMode(id)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
        <label className={`${styles.field} ${styles.fieldWide}`}>
          <span className={styles.fieldLabel}>Where</span>
          <input
            className={styles.fieldInput}
            name="location"
            placeholder={wherePlaceholder}
            ref={whereRef}
            type="text"
          />
        </label>
        <div aria-hidden="true" className={styles.divider} />
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Budget</span>
          <input
            className={styles.fieldInput}
            inputMode="numeric"
            name="maxPrice"
            placeholder={rent ? 'Any monthly rent' : 'Any price'}
            type="text"
          />
        </label>
        <div aria-hidden="true" className={styles.divider} />
        <label className={styles.field}>
          <span className={styles.fieldLabel}>{rent ? 'Move in' : 'Ready by'}</span>
          <input className={styles.fieldInput} name="when" placeholder="Flexible" type="text" />
        </label>
        <button className={styles.searchBtn} type="submit">
          <svg
            aria-hidden="true"
            fill="none"
            height="18"
            stroke="#FFFFFF"
            strokeLinecap="round"
            strokeWidth="2.6"
            viewBox="0 0 24 24"
            width="18"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          Search homes
        </button>
      </form>

      <div className={styles.chips}>
        {categories.map(([id, label]) => (
          <button
            aria-pressed={category === id}
            className={`${styles.chip} ${category === id ? styles.chipOn : ''}`}
            key={id}
            onClick={() => setCategory(id)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
    </search>
  );
}

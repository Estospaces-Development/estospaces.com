'use client';

import { useState } from 'react';

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

export default function HomeSearch({ searchUrl }) {
  const [mode, setMode] = useState('rent');
  const [category, setCategory] = useState('all');
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
            placeholder="City, neighbourhood or landmark"
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

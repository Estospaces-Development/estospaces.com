'use client';

import { useState } from 'react';

import TrackedLink from '../site/TrackedLink';
import styles from './Home.module.css';

// Source of truth: Estospaces-Pricing-Payments-QA-Guide-v2 / the live payment catalog (monthly, tax included).
// Update here when it changes. No fees on Fast Track, boosts or brokers, and nothing here promises leads,
// bookings or sales.
const plans = [
  {
    id: 'free',
    name: 'Free',
    badge: 'Start here',
    price: { INR: '₹0', GBP: '£0' },
    features: ['2 published properties', '2 active Fast Track cases', 'Basic support'],
    cta: 'Create free account',
  },
  {
    id: 'growth',
    name: 'Growth',
    badge: 'Included free for 60 days',
    price: { INR: '₹999', GBP: '£49' },
    features: ['8 published properties', '10 active Fast Track cases', 'Standard support'],
    cta: 'Start 60-day Growth trial',
  },
  {
    id: 'premium',
    name: 'Premium',
    badge: 'Featured',
    price: { INR: '₹2,499', GBP: '£99' },
    features: [
      '20 published properties',
      '50 active Fast Track cases',
      'Dedicated support routing',
    ],
    cta: 'Choose Premium',
  },
];

// Shown on every plan.
const allPlans = 'One image up to 52 MB';

const currencies = [
  ['INR', '₹ INR'],
  ['GBP', '£ GBP'],
];

export default function HomePricing({ registerUrl }) {
  // Plain toggle, INR first. The market is never guessed from the browser language.
  const [currency, setCurrency] = useState('INR');

  return (
    <>
      <fieldset className={styles.priceToggle}>
        <legend className={styles.srOnly}>Currency</legend>
        {currencies.map(([code, label]) => (
          <button
            aria-pressed={currency === code}
            className={`${styles.priceToggleBtn} ${currency === code ? styles.priceToggleOn : ''}`}
            key={code}
            onClick={() => setCurrency(code)}
            type="button"
          >
            {label}
          </button>
        ))}
      </fieldset>

      <div className={styles.plans}>
        {plans.map((plan, index) => (
          <article
            className={`${styles.plan} ${plan.id === 'growth' ? styles.planGrowth : ''} ${plan.id === 'premium' ? `${styles.planPremium} ${styles.onDark}` : ''}`}
            data-reveal="rise"
            suppressHydrationWarning
            key={plan.id}
            style={{ '--d': `${index * 0.08}s` }}
          >
            <div className={styles.planHead}>
              <h3 className={styles.planName}>{plan.name}</h3>
              {plan.badge ? <span className={styles.planBadge}>{plan.badge}</span> : null}
            </div>
            <p className={styles.planPrice}>
              <span className={styles.display}>{plan.price[currency]}</span>
              <span className={styles.planUnit}> per month, tax included</span>
            </p>
            <ul className={styles.planList}>
              {[...plan.features, allPlans].map((feature) => (
                <li key={feature}>
                  <svg
                    aria-hidden="true"
                    fill="none"
                    height="16"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.6"
                    viewBox="0 0 24 24"
                    width="16"
                  >
                    <path d="m5 12 5 5 9-10" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <TrackedLink
              className={styles.planCta}
              eventName="broker_join_clicked"
              eventProperties={{ placement: `pricing_${plan.id}` }}
              href={registerUrl}
            >
              {plan.cta}
            </TrackedLink>
          </article>
        ))}
      </div>
    </>
  );
}

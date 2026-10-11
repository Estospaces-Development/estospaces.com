'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import TrackedLink from '../site/TrackedLink';
import styles from './Home.module.css';
import { ease } from './home/motion';
import { useMarket } from './home/market';
import Reveal from './home/Reveal';

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
    badge: 'Free for 60 days',
    price: { INR: '₹999', GBP: '£49' },
    features: ['8 published properties', '10 active Fast Track cases', 'Standard support'],
    cta: 'Start free trial',
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

// Display only (owner, 11 Oct): show rupees to visitors in India and pounds to visitors in the UK, using the
// device time zone (no network call, nothing stored). Anyone else sees pounds. There is no currency switch.
// The price actually charged is set by the verified billing market at checkout, never by this guess.
export default function HomePricing({ registerUrl }) {
  // Server render and first paint use GBP; after mount the visitor's region picks the currency.
  const currency = useMarket() === 'IN' ? 'INR' : 'GBP';
  const row = useRef(null);
  const [active, setActive] = useState(1);

  // Phones: the plans become a swipeable row that opens on Growth; dots follow the card in view.
  useEffect(() => {
    const el = row.current;
    if (!el || !window.matchMedia('(max-width: 899px)').matches) return undefined;
    const cards = [...el.children];
    const growth = cards[1];
    if (growth) el.scrollLeft = growth.offsetLeft - (el.clientWidth - growth.clientWidth) / 2;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(cards.indexOf(entry.target));
        }
      },
      { root: el, threshold: 0.6 },
    );
    for (const card of cards) io.observe(card);
    return () => io.disconnect();
  }, []);

  const goTo = (index) => {
    const el = row.current;
    const card = el?.children[index];
    if (!el || !card) return;
    el.scrollTo({
      left: card.offsetLeft - (el.clientWidth - card.clientWidth) / 2,
      behavior: 'smooth',
    });
  };

  return (
    <section
      aria-labelledby="pricing-title"
      className={styles.section}
      data-analytics-section="pricing"
      id="pricing"
    >
      <div className={styles.container}>
        <Reveal as="h2" className={styles.h2} id="pricing-title">
          Simple plans for professionals.
        </Reveal>
        <Reveal as="p" className={styles.lede} delay={0.08}>
          Every new manager gets Growth free for 60 days. We don&apos;t take card details and
          won&apos;t charge you automatically.
        </Reveal>

        <div className={styles.plans} ref={row}>
          {plans.map((plan, index) => (
            <Reveal
              as="article"
              className={`${styles.plan} ${plan.id === 'growth' ? styles.planGrowth : ''}`}
              delay={index * 0.08}
              key={plan.id}
            >
              <div className={styles.planHead}>
                <h3 className={styles.planName}>{plan.name}</h3>
                <span className={styles.planBadge}>{plan.badge}</span>
              </div>
              <p className={styles.planPrice}>
                <span className={styles.priceRoll}>
                  <AnimatePresence initial={false} mode="popLayout">
                    <motion.span
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -14 }}
                      initial={{ opacity: 0, y: 14 }}
                      key={currency}
                      transition={{ duration: 0.35, ease }}
                    >
                      {plan.price[currency]}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <span className={styles.planUnit}>per month, tax included</span>
              </p>
              <ul className={styles.planList}>
                {[...plan.features, allPlans].map((feature) => (
                  <li key={feature}>
                    <Check aria-hidden="true" size={18} strokeWidth={1.75} />
                    {feature}
                  </li>
                ))}
              </ul>
              <TrackedLink
                className={`${styles.btn} ${plan.id === 'growth' ? styles.btnPrimary : styles.btnGhost} ${styles.planCta}`}
                eventName="broker_join_clicked"
                eventProperties={{ placement: `pricing_${plan.id}` }}
                href={registerUrl}
              >
                {plan.cta}
              </TrackedLink>
            </Reveal>
          ))}
        </div>

        <fieldset className={styles.planDots}>
          <legend className={styles.srOnly}>Choose a plan</legend>
          {plans.map((plan, index) => (
            <button
              aria-current={active === index ? 'true' : undefined}
              aria-label={`Show the ${plan.name} plan`}
              className={styles.planDot}
              key={plan.id}
              onClick={() => goTo(index)}
              type="button"
            >
              <span aria-hidden="true" />
            </button>
          ))}
        </fieldset>

        <p className={styles.pricingTerms}>
          After 60 days you move to Free unless you choose a plan. Your price is set by your
          verified billing market at checkout. Secure checkout by Razorpay.
        </p>
      </div>
    </section>
  );
}

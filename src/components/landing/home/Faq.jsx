'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import styles from '../Home.module.css';
import Reveal from './Reveal';

const faqs = [
  [
    'free-for-seekers',
    'Is EstoSpaces free for home seekers?',
    'Yes. Creating an account, sending a brief and requesting Fast Track are free for home seekers. Plans are only for property professionals.',
  ],
  [
    'ten-minutes',
    'Is a reply within 10 minutes guaranteed?',
    'No. Ten minutes is the target we hold professionals to, and you see the real time on the clock.',
  ],
  [
    'fast-track',
    'What does Fast Track mean?',
    'One case for the whole deal: selected home, documents, viewing, decision, agreement and handover. The 24-hour aim starts once the manager accepts.',
  ],
  [
    'trial',
    'What happens after the 60-day Growth trial?',
    'You move to the Free plan unless you choose a paid plan. We never take card details for the trial and never charge automatically.',
  ],
  [
    'availability',
    'Where is EstoSpaces available?',
    'In India and the UK. Coverage grows area by area, and the app shows what is available where you search.',
  ],
  [
    'agency',
    'Is EstoSpaces an estate agency?',
    'No. EstoSpaces is software that connects home seekers with verified professionals and keeps the deal in one case.',
  ],
];

export default function Faq({ contactUrl }) {
  const [open, setOpen] = useState(0);

  return (
    <section
      aria-labelledby="faq-title"
      className={styles.section}
      data-analytics-section="faq"
      id="faq"
    >
      <div className={`${styles.container} ${styles.faqWrap}`}>
        <Reveal as="h2" className={styles.h2} id="faq-title">
          Questions, answered.
        </Reveal>
        <Reveal className={styles.faqList} delay={0.1}>
          {faqs.map(([key, question, answer], i) => {
            const isOpen = open === i;
            return (
              <div className={styles.faqItem} data-open={isOpen} key={key}>
                <h3>
                  <button
                    aria-controls={`faq-${key}`}
                    aria-expanded={isOpen}
                    className={styles.faqBtn}
                    id={`faq-btn-${key}`}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    type="button"
                  >
                    {question}
                    <Plus
                      aria-hidden="true"
                      className={styles.faqIcon}
                      size={24}
                      strokeWidth={1.75}
                    />
                  </button>
                </h3>
                <div className={styles.faqPanel} id={`faq-${key}`}>
                  <div className={styles.faqInner}>
                    <p>{answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </Reveal>
        <Reveal as="p" className={styles.faqFoot} delay={0.15}>
          Still have a question?{' '}
          <a className={styles.inlineLink} href={contactUrl}>
            Talk to our team
          </a>
        </Reveal>
      </div>
    </section>
  );
}

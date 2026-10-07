'use client';

import { useEffect } from 'react';

import { trackEvent } from '../../lib/analytics';

export default function PageActivityTracker() {
  useEffect(() => {
    const sections = document.querySelectorAll('[data-analytics-section]');
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          trackEvent('section_viewed', { section: entry.target.dataset.analyticsSection });
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.35 },
    );

    for (const section of sections) observer.observe(section);

    const trackDetails = (event) => {
      const details = event.target;
      if (!(details instanceof HTMLDetailsElement) || !details.open) return;
      const item = details.dataset.analyticsItem;
      if (item) trackEvent('faq_opened', { item });
    };

    const trackVideo = (event) =>
      trackEvent('video_played', { placement: event.detail?.placement });

    document.addEventListener('toggle', trackDetails, true);
    window.addEventListener('estospaces:video-play', trackVideo);
    return () => {
      observer.disconnect();
      document.removeEventListener('toggle', trackDetails, true);
      window.removeEventListener('estospaces:video-play', trackVideo);
    };
  }, []);

  return null;
}

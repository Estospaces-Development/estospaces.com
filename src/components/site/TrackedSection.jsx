'use client';

import { useEffect, useRef } from 'react';

import { trackEvent } from '../../lib/analytics';

export default function TrackedSection({ eventName, eventProperties, children, ...props }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        trackEvent(eventName, eventProperties);
        observer.disconnect();
      },
      { threshold: 0.35 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [eventName, eventProperties]);

  return (
    <section ref={sectionRef} {...props}>
      {children}
    </section>
  );
}

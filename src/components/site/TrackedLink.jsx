'use client';

import { trackEvent } from '../../lib/analytics';

export default function TrackedLink({
  eventName,
  eventProperties,
  children,
  href,
  onClick,
  ...props
}) {
  const handleClick = (event) => {
    trackEvent(eventName, eventProperties);
    onClick?.(event);
  };

  return (
    <a href={href} {...props} onClick={handleClick}>
      {children}
    </a>
  );
}

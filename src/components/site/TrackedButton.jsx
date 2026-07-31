'use client';

import { trackEvent } from '../../lib/analytics';

export default function TrackedButton({ eventName, eventProperties, onClick, ...props }) {
  const handleClick = (event) => {
    trackEvent(eventName, eventProperties);
    onClick?.(event);
  };

  return <button {...props} onClick={handleClick} />;
}

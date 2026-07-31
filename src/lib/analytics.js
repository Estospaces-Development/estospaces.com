const consentStorageKey = 'estospaces_cookie_consent';

const allowedEvents = new Set([
  'landing_search_submitted',
  'login_clicked',
  'create_account_clicked',
  'broker_join_clicked',
  'product_preview_viewed',
  'contact_clicked',
]);

const allowedProperties = new Set(['placement', 'market', 'listing_type']);

export function trackEvent(name, properties = {}) {
  if (
    typeof window === 'undefined' ||
    !allowedEvents.has(name) ||
    window.localStorage.getItem(consentStorageKey) !== 'accepted' ||
    typeof window.gtag !== 'function'
  ) {
    return false;
  }

  const safeProperties = Object.fromEntries(
    Object.entries(properties).filter(
      ([key, value]) =>
        allowedProperties.has(key) && typeof value === 'string' && value.length <= 40,
    ),
  );

  window.gtag('event', name, safeProperties);
  return true;
}

export { consentStorageKey };

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
    window.localStorage.getItem(consentStorageKey) !== 'accepted'
  ) {
    return false;
  }

  const safeProperties = Object.fromEntries(
    Object.entries(properties).filter(
      ([key, value]) =>
        allowedProperties.has(key) && typeof value === 'string' && value.length <= 40,
    ),
  );

  let tracked = false;

  if (typeof window.gtag === 'function') {
    window.gtag('event', name, safeProperties);
    tracked = true;
  }

  if (typeof window.$zoho?.salesiq?.visitor?.customaction === 'function') {
    const context = Object.entries(safeProperties)
      .map(([key, value]) => `${key}=${value}`)
      .join('|');
    const action = context ? `estospaces:${name}|${context}` : `estospaces:${name}`;
    window.$zoho.salesiq.visitor.customaction(action);
    tracked = true;
  }

  return tracked;
}

export { consentStorageKey };

const consentStorageKey = 'estospaces_cookie_consent';
const zohoActionQueueKey = '__estospacesZohoActions';
const maxZohoActionQueueSize = 100;

const allowedEvents = new Set([
  'landing_search_submitted',
  'login_clicked',
  'create_account_clicked',
  'broker_join_clicked',
  'product_preview_viewed',
  'contact_clicked',
  'navigation_clicked',
  'social_link_clicked',
  'source_link_clicked',
  'cookie_preferences_opened',
  'section_viewed',
  'faq_opened',
]);

const allowedProperties = new Set([
  'placement',
  'market',
  'listing_type',
  'destination',
  'section',
  'item',
]);

function sanitizePropertyValue(value) {
  if (typeof value !== 'string') return '';
  const normalized = value.trim();
  return /^[a-z0-9][a-z0-9_.:/-]{0,39}$/i.test(normalized) ? normalized : '';
}

export function trackEvent(name, properties = {}) {
  if (
    typeof window === 'undefined' ||
    !allowedEvents.has(name) ||
    window.localStorage.getItem(consentStorageKey) !== 'accepted'
  ) {
    return false;
  }

  const safeProperties = Object.fromEntries(
    Object.entries(properties)
      .filter(([key]) => allowedProperties.has(key))
      .map(([key, value]) => [key, sanitizePropertyValue(value)])
      .filter(([, value]) => value),
  );

  let tracked = false;

  if (typeof window.gtag === 'function') {
    window.gtag('event', name, safeProperties);
    tracked = true;
  }

  const context = Object.entries(safeProperties)
    .map(([key, value]) => `${key}=${value}`)
    .join('|');
  const action = (context ? `estospaces:${name}|${context}` : `estospaces:${name}`).slice(0, 250);

  if (typeof window.$zoho?.salesiq?.visitor?.customaction === 'function') {
    window.$zoho.salesiq.visitor.customaction(action);
    tracked = true;
  } else {
    window[zohoActionQueueKey] = Array.isArray(window[zohoActionQueueKey])
      ? window[zohoActionQueueKey]
      : [];
    if (window[zohoActionQueueKey].length >= maxZohoActionQueueSize) {
      window[zohoActionQueueKey].shift();
    }
    window[zohoActionQueueKey].push(action);
    tracked = true;
  }

  return tracked;
}

export { consentStorageKey };

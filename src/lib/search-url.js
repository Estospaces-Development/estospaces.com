const allowedMarkets = new Set(['india', 'england']);
const allowedListingTypes = new Set(['sale', 'rent']);
const allowedPropertyTypes = new Set([
  'apartment',
  'house',
  'villa',
  'studio',
  'penthouse',
  'duplex',
  'condo',
  'townhouse',
  'commercial',
  'office',
  'land',
]);

const appendText = (params, key, value, maxLength = 120) => {
  const normalized = String(value || '')
    .trim()
    .slice(0, maxLength);
  if (normalized) params.set(key, normalized);
};

const appendNumber = (params, key, value) => {
  const normalized = String(value || '').trim();
  if (/^\d{1,9}$/.test(normalized)) params.set(key, normalized);
};

export function buildPropertySearchUrl(baseUrl, values = {}) {
  const params = new URLSearchParams();
  const market = String(values.market || '').toLowerCase();
  const listingType = String(values.type || '').toLowerCase();
  const propertyType = String(values.propertyType || '').toLowerCase();

  appendText(params, 'q', values.q);
  if (allowedMarkets.has(market)) params.set('market', market);
  appendText(params, 'location', values.location);
  if (allowedListingTypes.has(listingType)) params.set('type', listingType);
  if (allowedPropertyTypes.has(propertyType)) params.set('propertyType', propertyType);
  appendNumber(params, 'minPrice', values.minPrice);
  appendNumber(params, 'maxPrice', values.maxPrice);
  appendNumber(params, 'beds', values.beds);
  appendNumber(params, 'baths', values.baths);

  const query = params.toString();
  return query ? `${baseUrl}?${query}` : baseUrl;
}

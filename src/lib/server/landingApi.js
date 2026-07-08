import { createHash } from 'node:crypto';

const reservationRecipient = process.env.RESERVATION_EMAIL || 'contact@estospaces.com';
const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'Estospaces <contact@estospaces.com>';
const allowedUserTypes = new Set(['buyer', 'renter', 'seller']);
const allowedMarkets = new Set(['india', 'england']);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const internalAutomationPattern = /\bcodex\b/i;
const reservationDuplicateWindowMs = 24 * 60 * 60 * 1000;
const reservationSubmissionKeys = new Map();
const memoryRateLimitKeys = new Map();
const htmlEscapes = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};
let firestoreClient;
const googleSheetHeaderCache = new Set();

const normalizeText = (value, maxLength) => String(value || '').trim().slice(0, maxLength);
const normalizeReservationPhone = (value) => (
  String(value || '').replace(/[^\d+()\-\s]/g, '').trim().slice(0, 20)
);
const normalizeBoolean = (value) => value === true || value === 'true' || value === 'on';
const normalizePhoneKey = (value) => String(value || '').replace(/\D/g, '');
const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (char) => htmlEscapes[char]);
const isValidEmail = (email) => emailPattern.test(email) && email.length <= 254;
const parsePositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(String(value || ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const googleSheetsSpreadsheetId = () => normalizeText(process.env.GOOGLE_SHEETS_SPREADSHEET_ID, 160);
const googleSheetsLeadsRange = () => normalizeText(
  process.env.GOOGLE_SHEETS_LEADS_RANGE || 'A:Q',
  200,
) || 'A:Q';
const googleSheetsClientEmail = () => normalizeText(
  process.env.GOOGLE_SHEETS_CLIENT_EMAIL || process.env.GCP_CLIENT_EMAIL,
  254,
);
const googleSheetsPrivateKey = () => String(
  process.env.GOOGLE_SHEETS_PRIVATE_KEY || process.env.GCP_PRIVATE_KEY || '',
).replace(/\\n/g, '\n');

const landingEmailRateLimit = () => ({
  limit: parsePositiveInteger(process.env.LANDING_EMAIL_RATE_LIMIT_MAX, 5),
  windowMs: parsePositiveInteger(process.env.LANDING_EMAIL_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
});

const landingChatStartRateLimit = () => ({
  limit: parsePositiveInteger(process.env.LANDING_CHAT_START_RATE_LIMIT_MAX, 30),
  windowMs: parsePositiveInteger(process.env.LANDING_CHAT_START_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
});

const landingRateLimitStoreTimeoutMs = () => parsePositiveInteger(
  process.env.LANDING_RATE_LIMIT_STORE_TIMEOUT_MS,
  1500,
);

const rateLimitCollectionName = () => normalizeText(
  process.env.LANDING_RATE_LIMIT_COLLECTION || 'landingApiRateLimits',
  80,
) || 'landingApiRateLimits';

const firestoreProjectId = () => normalizeText(
  process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT,
  120,
);

const hasExplicitFirestoreCredentials = () => Boolean(
  process.env.GCP_CLIENT_EMAIL && process.env.GCP_PRIVATE_KEY,
);

const shouldUseFirestoreRateLimit = () => {
  const store = normalizeText(process.env.LANDING_RATE_LIMIT_STORE, 20).toLowerCase();
  if (store === 'memory') return false;
  if (store === 'firestore') return true;
  return Boolean(process.env.K_SERVICE || firestoreProjectId() || hasExplicitFirestoreCredentials());
};

const getRateLimitFirestore = async () => {
  if (firestoreClient) return firestoreClient;
  const { Firestore } = await import('@google-cloud/firestore');
  const options = {};
  const projectId = firestoreProjectId();
  if (projectId) {
    options.projectId = projectId;
  }
  if (hasExplicitFirestoreCredentials()) {
    options.credentials = {
      client_email: process.env.GCP_CLIENT_EMAIL,
      private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }
  firestoreClient = new Firestore(options);
  return firestoreClient;
};

const rateLimitDocId = (scope, key) => {
  const digest = createHash('sha256').update(`${scope}:${key}`).digest('hex');
  return `${scope}-${digest}`;
};

const requestClientIdentifier = (request) => {
  const headerValue = request.headers.get('x-forwarded-for')
    || request.headers.get('x-real-ip')
    || request.headers.get('cf-connecting-ip')
    || request.headers.get('fastly-client-ip')
    || '';
  return normalizeText(headerValue.split(',')[0], 120).toLowerCase();
};

const landingRateLimitKeys = (request, identifiers) => {
  const clientIdentifier = requestClientIdentifier(request);
  return [
    clientIdentifier ? `client:${clientIdentifier}` : '',
    ...identifiers,
  ].map((key) => normalizeText(key, 220).toLowerCase()).filter(Boolean);
};

const pruneMemoryRateLimitKeys = (now) => {
  for (const [key, entry] of memoryRateLimitKeys.entries()) {
    if (entry.expiresAt <= now) {
      memoryRateLimitKeys.delete(key);
    }
  }
};

const enforceMemoryRateLimit = async ({ scope, keys, limit, windowMs }) => {
  const now = Date.now();
  pruneMemoryRateLimitKeys(now);

  for (const key of keys) {
    const id = `${scope}:${key}`;
    const entry = memoryRateLimitKeys.get(id);
    if (entry && entry.expiresAt > now && entry.count >= limit) {
      return { limited: true, retryAfterSeconds: Math.ceil((entry.expiresAt - now) / 1000) };
    }
  }

  keys.forEach((key) => {
    const id = `${scope}:${key}`;
    const entry = memoryRateLimitKeys.get(id);
    const expiresAt = entry && entry.expiresAt > now ? entry.expiresAt : now + windowMs;
    memoryRateLimitKeys.set(id, {
      count: entry && entry.expiresAt > now ? entry.count + 1 : 1,
      expiresAt,
    });
  });

  return { limited: false };
};

const enforceFirestoreRateLimit = async ({ scope, keys, limit, windowMs }) => {
  const firestore = await getRateLimitFirestore();
  const now = Date.now();
  const refs = keys.map((key) => firestore.collection(rateLimitCollectionName()).doc(rateLimitDocId(scope, key)));
  let limitedResult = null;

  await firestore.runTransaction(async (transaction) => {
    const snapshots = [];
    for (const ref of refs) {
      snapshots.push(await transaction.get(ref));
    }

    const writes = [];
    snapshots.forEach((snapshot, index) => {
      const data = snapshot.exists ? snapshot.data() : {};
      const expiresAt = Number(data.expires_at || 0);
      const active = expiresAt > now;
      const count = active ? Number(data.count || 0) : 0;

      if (count >= limit) {
        limitedResult = {
          limited: true,
          retryAfterSeconds: Math.ceil((expiresAt - now) / 1000),
        };
        return;
      }

      writes.push({
        ref: refs[index],
        data: {
          count: count + 1,
          expires_at: active ? expiresAt : now + windowMs,
          key_hash: refs[index].id,
          scope,
          updated_at: now,
        },
      });
    });

    if (limitedResult) return;
    writes.forEach(({ ref, data }) => transaction.set(ref, data, { merge: true }));
  });

  return limitedResult || { limited: false };
};

const withTimeout = async (promise, timeoutMs, message) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
    timeoutId.unref?.();
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
};

const enforceLandingAbuseLimit = async (request, scope, identifiers, config) => {
  const keys = landingRateLimitKeys(request, identifiers);
  if (!keys.length) {
    return { limited: false };
  }

  if (!shouldUseFirestoreRateLimit()) {
    return enforceMemoryRateLimit({ scope, keys, ...config });
  }

  try {
    return await withTimeout(
      enforceFirestoreRateLimit({ scope, keys, ...config }),
      landingRateLimitStoreTimeoutMs(),
      'Firestore rate limit store timed out',
    );
  } catch (error) {
    console.error('Landing API rate limit store failed', { scope, error });
    return enforceMemoryRateLimit({ scope, keys, ...config });
  }
};

const corsAllowedOrigins = () => (process.env.CORS_ALLOWED_ORIGINS || process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsHeaders = (request) => {
  const headers = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  const origin = request.headers.get('origin');
  const allowedOrigins = corsAllowedOrigins();

  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers.Vary = 'Origin';
  }

  return headers;
};

const jsonResponse = (request, payload, status = 200, extraHeaders = {}) => new Response(JSON.stringify(payload), {
  status,
  headers: {
    'Content-Type': 'application/json',
    ...corsHeaders(request),
    ...extraHeaders,
  },
});

const rateLimitResponse = (request, result) => {
  if (result?.unavailable) {
    return jsonResponse(request, {
      error: 'Email submission protection is temporarily unavailable. Please try again shortly.',
    }, 503);
  }

  return jsonResponse(request, {
    error: 'Too many requests. Please try again later.',
  }, 429, {
    'Retry-After': String(Math.max(1, result?.retryAfterSeconds || 60)),
  });
};

const parseJson = async (request) => {
  try {
    return await request.json();
  } catch {
    return null;
  }
};

const formatTimestamp = () => new Date().toLocaleString('en-US', {
  timeZone: 'UTC',
  dateStyle: 'long',
  timeStyle: 'short',
});

const normalizeReservationForm = (body) => ({
  market: normalizeText(body?.market || 'india', 20).toLowerCase(),
  userType: normalizeText(body?.userType, 20).toLowerCase(),
  name: normalizeText(body?.name, 120),
  email: normalizeText(body?.email, 254).toLowerCase(),
  phone: normalizeReservationPhone(body?.phone),
  location: normalizeText(body?.location, 120),
  lookingFor: normalizeText(body?.lookingFor, 2000),
  newsletterOptIn: normalizeBoolean(body?.newsletterOptIn),
  attribution: normalizeAttribution(body?.attribution),
});

const isInternalAutomationReservation = (formData) => [
  formData.name,
  formData.email,
  formData.location,
  formData.lookingFor,
  ...Object.values(formData.attribution || {}),
].some((value) => internalAutomationPattern.test(String(value || '')));

const normalizeAttribution = (value) => {
  const source = value && typeof value === 'object' ? value : {};
  return {
    landingPage: normalizeText(source.landingPage, 200),
    utm_source: normalizeText(source.utm_source, 120),
    utm_medium: normalizeText(source.utm_medium, 120),
    utm_campaign: normalizeText(source.utm_campaign, 160),
    utm_term: normalizeText(source.utm_term, 160),
    utm_content: normalizeText(source.utm_content, 160),
    gclid: normalizeText(source.gclid, 220),
    fbclid: normalizeText(source.fbclid, 220),
  };
};

const marketLabels = {
  india: 'India',
  england: 'England',
};

const reservationSheetHeaders = [
  'Submitted At',
  'Market',
  'User Type',
  'Name',
  'Email',
  'Phone',
  'Newsletter Opt-In',
  'Location',
  'Looking For',
  'Landing Page',
  'UTM Source',
  'UTM Medium',
  'UTM Campaign',
  'UTM Term',
  'UTM Content',
  'GCLID',
  'FBCLID',
];

const attributionEntries = (attribution) => Object.entries(attribution || {})
  .filter(([, value]) => value)
  .map(([key, value]) => [key.replace(/_/g, ' '), value]);

const getGoogleSheetsAccessToken = async () => {
  if (process.env.GOOGLE_SHEETS_TEST_ACCESS_TOKEN) {
    return process.env.GOOGLE_SHEETS_TEST_ACCESS_TOKEN;
  }

  const { GoogleAuth } = await import('google-auth-library');
  const clientEmail = googleSheetsClientEmail();
  const privateKey = googleSheetsPrivateKey();
  const auth = new GoogleAuth({
    credentials: clientEmail && privateKey ? {
      client_email: clientEmail,
      private_key: privateKey,
    } : undefined,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  const token = typeof tokenResponse === 'string' ? tokenResponse : tokenResponse?.token;

  if (!token) {
    throw new Error('Google Sheets access token was not available');
  }

  return token;
};

const reservationSheetRow = (formData) => [
  new Date().toISOString(),
  marketLabels[formData.market] || formData.market,
  formData.userType,
  formData.name,
  formData.email,
  formData.phone,
  formData.newsletterOptIn ? 'Yes' : 'No',
  formData.location,
  formData.lookingFor,
  formData.attribution?.landingPage || '',
  formData.attribution?.utm_source || '',
  formData.attribution?.utm_medium || '',
  formData.attribution?.utm_campaign || '',
  formData.attribution?.utm_term || '',
  formData.attribution?.utm_content || '',
  formData.attribution?.gclid || '',
  formData.attribution?.fbclid || '',
];

const sheetApiJson = async (url, accessToken, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  return {
    ok: response.ok,
    status: response.status,
    payload,
  };
};

const quoteSheetName = (sheetName) => (
  /^[A-Za-z0-9_]+$/.test(sheetName)
    ? sheetName
    : `'${sheetName.replace(/'/g, "''")}'`
);

const splitA1Range = (range) => {
  const bangIndex = range.lastIndexOf('!');
  if (bangIndex === -1) {
    return {
      sheetName: '',
      columns: range,
    };
  }

  const rawSheetName = range.slice(0, bangIndex).trim();
  const sheetName = rawSheetName.startsWith("'") && rawSheetName.endsWith("'")
    ? rawSheetName.slice(1, -1).replace(/''/g, "'")
    : rawSheetName;

  return {
    sheetName,
    columns: range.slice(bangIndex + 1),
  };
};

const columnLetters = (value, fallback) => {
  const match = String(value || '').match(/[A-Za-z]+/);
  return match ? match[0].toUpperCase() : fallback;
};

const reservationHeaderRange = (range) => {
  const { sheetName, columns } = splitA1Range(range);
  const [startColumn, endColumn] = columns.split(':');
  const start = columnLetters(startColumn, 'A');
  const end = columnLetters(endColumn, 'Q');
  const prefix = sheetName ? `${quoteSheetName(sheetName)}!` : '';
  return `${prefix}${start}1:${end}1`;
};

const normalizedHeaderCell = (value) => normalizeText(value, 120).toLowerCase();

const rowMatchesReservationHeaders = (row = []) => reservationSheetHeaders.every(
  (header, index) => normalizedHeaderCell(row[index]) === normalizedHeaderCell(header),
);

const rowHasValues = (row = []) => row.some((value) => normalizeText(value, 200));

const getTargetSheet = async (spreadsheetId, accessToken, range) => {
  const { sheetName } = splitA1Range(range);
  const metadataUrl = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}`);
  metadataUrl.searchParams.set('fields', 'sheets.properties(sheetId,title)');
  const metadataResult = await sheetApiJson(metadataUrl, accessToken);
  if (!metadataResult.ok) {
    return metadataResult;
  }

  const sheets = metadataResult.payload?.sheets || [];
  const targetSheet = sheetName
    ? sheets.find((sheet) => sheet.properties?.title === sheetName)
    : sheets[0];

  if (!targetSheet?.properties) {
    return {
      ok: false,
      status: 404,
      payload: {
        error: {
          message: `Google Sheet tab was not found${sheetName ? `: ${sheetName}` : ''}`,
        },
      },
    };
  }

  return {
    ok: true,
    sheetId: targetSheet.properties.sheetId,
  };
};

const insertHeaderRow = async (spreadsheetId, accessToken, sheetId) => sheetApiJson(
  `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}:batchUpdate`,
  accessToken,
  {
    method: 'POST',
    body: JSON.stringify({
      requests: [
        {
          insertDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: 0,
              endIndex: 1,
            },
            inheritFromBefore: false,
          },
        },
      ],
    }),
  },
);

const updateHeaderRow = async (spreadsheetId, accessToken, range) => {
  const url = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(reservationHeaderRange(range))}`);
  url.searchParams.set('valueInputOption', 'USER_ENTERED');
  return sheetApiJson(url, accessToken, {
    method: 'PUT',
    body: JSON.stringify({
      majorDimension: 'ROWS',
      values: [reservationSheetHeaders],
    }),
  });
};

const ensureReservationSheetHeaders = async (spreadsheetId, accessToken, range) => {
  const cacheKey = `${spreadsheetId}:${range}`;
  if (googleSheetHeaderCache.has(cacheKey)) {
    return { ok: true };
  }

  const headerUrl = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(reservationHeaderRange(range))}`);
  const headerResult = await sheetApiJson(headerUrl, accessToken);
  if (!headerResult.ok) {
    return headerResult;
  }

  const firstRow = headerResult.payload?.values?.[0] || [];
  if (rowMatchesReservationHeaders(firstRow)) {
    googleSheetHeaderCache.add(cacheKey);
    return { ok: true };
  }

  if (rowHasValues(firstRow)) {
    const sheetResult = await getTargetSheet(spreadsheetId, accessToken, range);
    if (!sheetResult.ok) {
      return sheetResult;
    }

    const insertResult = await insertHeaderRow(spreadsheetId, accessToken, sheetResult.sheetId);
    if (!insertResult.ok) {
      return insertResult;
    }
  }

  const updateResult = await updateHeaderRow(spreadsheetId, accessToken, range);
  if (!updateResult.ok) {
    return updateResult;
  }

  googleSheetHeaderCache.add(cacheKey);
  return { ok: true };
};

const appendReservationToGoogleSheet = async (formData) => {
  const spreadsheetId = googleSheetsSpreadsheetId();
  if (!spreadsheetId) {
    return { configured: false, ok: true, skipped: true };
  }

  const range = googleSheetsLeadsRange();
  const accessToken = await getGoogleSheetsAccessToken();
  const headerResult = await ensureReservationSheetHeaders(spreadsheetId, accessToken, range);
  if (!headerResult.ok) {
    return {
      configured: true,
      ok: false,
      status: headerResult.status,
      payload: headerResult.payload,
    };
  }

  const url = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}:append`);
  url.searchParams.set('valueInputOption', 'USER_ENTERED');
  url.searchParams.set('insertDataOption', 'INSERT_ROWS');

  const appendResult = await sheetApiJson(url, accessToken, {
    method: 'POST',
    body: JSON.stringify({
      majorDimension: 'ROWS',
      values: [reservationSheetRow(formData)],
    }),
  });

  if (!appendResult.ok) {
    return {
      configured: true,
      ok: false,
      status: appendResult.status,
      payload: appendResult.payload,
    };
  }

  return {
    configured: true,
    ok: true,
    updatedRange: appendResult.payload?.updates?.updatedRange || '',
  };
};

const reservationDuplicateKeys = (formData) => {
  const keys = [`email:${formData.email}`];
  const phoneKey = normalizePhoneKey(formData.phone);
  if (phoneKey) {
    keys.push(`phone:${phoneKey}`);
  }
  return keys;
};

const pruneReservationSubmissionKeys = (now = Date.now()) => {
  for (const [key, expiresAt] of reservationSubmissionKeys.entries()) {
    if (expiresAt <= now) {
      reservationSubmissionKeys.delete(key);
    }
  }
};

const findDuplicateReservation = (formData) => {
  pruneReservationSubmissionKeys();
  const duplicateKey = reservationDuplicateKeys(formData).find((key) => reservationSubmissionKeys.has(key));
  if (!duplicateKey) {
    return null;
  }
  return duplicateKey.startsWith('phone:') ? 'phone number' : 'email address';
};

const rememberReservationSubmission = (formData) => {
  const expiresAt = Date.now() + reservationDuplicateWindowMs;
  reservationDuplicateKeys(formData).forEach((key) => {
    reservationSubmissionKeys.set(key, expiresAt);
  });
};

const normalizeChatStart = (body) => ({
  visitorId: normalizeText(body?.visitorId, 80),
  name: normalizeText(body?.name, 120),
  email: normalizeText(body?.email, 254).toLowerCase(),
});

const normalizeChatMessage = (body) => ({
  visitorId: normalizeText(body?.visitorId, 80),
  conversationId: normalizeText(body?.conversationId, 100),
  name: normalizeText(body?.name, 120),
  email: normalizeText(body?.email, 254).toLowerCase(),
  message: normalizeText(body?.message, 2000),
});

const getReservationEmailHtml = (formData) => {
  const userTypeLabels = {
    buyer: 'Buyer',
    renter: 'Renter',
    seller: 'Seller',
  };
  const attributionRows = attributionEntries(formData.attribution);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Reserve Your Spot Lead</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f5f5f5;">
  <table role="presentation" style="width:100%;border-collapse:collapse;background-color:#f5f5f5;padding:20px;">
    <tr>
      <td align="center">
        <table role="presentation" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#f97316 0%,#ea580c 100%);padding:30px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:0;">New Reserve Your Spot Lead</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:30px 40px 20px;">
              <p style="margin:0 0 20px;color:#374151;font-size:16px;line-height:1.6;">A new user has reserved their spot on the Estospaces landing page.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 40px 30px;">
              <table role="presentation" style="width:100%;border-collapse:collapse;background-color:#f9fafb;border-radius:6px;overflow:hidden;">
                <tr>
                  <td style="padding:20px;">
                    <table role="presentation" style="width:100%;border-collapse:collapse;">
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
                          <strong style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0;display:block;margin-bottom:4px;">Market</strong>
                          <span style="color:#111827;font-size:16px;font-weight:600;">${escapeHtml(marketLabels[formData.market] || formData.market)}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
                          <strong style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0;display:block;margin-bottom:4px;">User Type</strong>
                          <span style="color:#111827;font-size:16px;font-weight:600;">${escapeHtml(userTypeLabels[formData.userType] || formData.userType)}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
                          <strong style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0;display:block;margin-bottom:4px;">Full Name</strong>
                          <span style="color:#111827;font-size:16px;font-weight:600;">${escapeHtml(formData.name || 'Not provided')}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
                          <strong style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0;display:block;margin-bottom:4px;">Email Address</strong>
                          <a href="mailto:${escapeHtml(formData.email)}" style="color:#f97316;font-size:16px;font-weight:600;text-decoration:none;">${escapeHtml(formData.email || 'Not provided')}</a>
                        </td>
                      </tr>
                      ${formData.phone ? `
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
                          <strong style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0;display:block;margin-bottom:4px;">Phone Number</strong>
                          <a href="tel:${escapeHtml(formData.phone)}" style="color:#111827;font-size:16px;font-weight:600;text-decoration:none;">${escapeHtml(formData.phone)}</a>
                        </td>
                      </tr>` : ''}
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
                          <strong style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0;display:block;margin-bottom:4px;">Newsletter opt-in</strong>
                          <span style="color:#111827;font-size:16px;font-weight:600;">${formData.newsletterOptIn ? 'Yes' : 'No'}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
                          <strong style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0;display:block;margin-bottom:4px;">Location/City</strong>
                          <span style="color:#111827;font-size:16px;font-weight:600;">${escapeHtml(formData.location || 'Not provided')}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;">
                          <strong style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0;display:block;margin-bottom:4px;">What They're Looking For</strong>
                          <p style="color:#111827;font-size:16px;line-height:1.6;margin:8px 0 0;white-space:pre-wrap;">${escapeHtml(formData.lookingFor || 'Not provided')}</p>
                        </td>
                      </tr>
                      ${attributionRows.length ? `
                      <tr>
                        <td style="padding:12px 0;">
                          <strong style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0;display:block;margin-bottom:4px;">Ad Attribution</strong>
                          <p style="color:#111827;font-size:14px;line-height:1.6;margin:8px 0 0;white-space:pre-wrap;">${escapeHtml(attributionRows.map(([key, value]) => `${key}: ${value}`).join('\n'))}</p>
                        </td>
                      </tr>` : ''}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;background-color:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;color:#6b7280;font-size:12px;">This email was sent from the Estospaces landing page reservation form.</p>
              <p style="margin:8px 0 0;color:#9ca3af;font-size:11px;">Submitted at ${formatTimestamp()} UTC</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

const getReservationEmailText = (formData) => {
  const userTypeLabels = {
    buyer: 'Buyer',
    renter: 'Renter',
    seller: 'Seller',
  };
  const attributionRows = attributionEntries(formData.attribution);

  return `
New Reserve Your Spot Lead

A new user has reserved their spot on the Estospaces landing page.

Market: ${marketLabels[formData.market] || formData.market}
User Type: ${userTypeLabels[formData.userType] || formData.userType}
Full Name: ${formData.name || 'Not provided'}
Email Address: ${formData.email || 'Not provided'}
${formData.phone ? `Phone Number: ${formData.phone}` : ''}
Newsletter opt-in: ${formData.newsletterOptIn ? 'Yes' : 'No'}
Location/City: ${formData.location || 'Not provided'}

What They're Looking For:
${formData.lookingFor || 'Not provided'}
${attributionRows.length ? `
Ad Attribution:
${attributionRows.map(([key, value]) => `${key}: ${value}`).join('\n')}
` : ''}

Submitted at ${formatTimestamp()} UTC
  `.trim();
};

const getNewsletterEmailHtml = (email, source) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Newsletter Subscriber</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f5f5f5;">
  <table role="presentation" style="width:100%;border-collapse:collapse;background-color:#f5f5f5;padding:20px;">
    <tr>
      <td align="center">
        <table role="presentation" style="max-width:500px;width:100%;background-color:#ffffff;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:24px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">New Newsletter Subscriber</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;">
              <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">Someone just subscribed to your newsletter.</p>
              <table role="presentation" style="width:100%;background-color:#f9fafb;border-radius:6px;padding:16px;">
                <tr>
                  <td>
                    <p style="margin:0 0 8px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0;">Email Address</p>
                    <a href="mailto:${escapeHtml(email)}" style="color:#f97316;font-size:16px;font-weight:600;text-decoration:none;">${escapeHtml(email)}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:12px;">
                    <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0;">Source</p>
                    <span style="color:#111827;font-size:14px;">${escapeHtml(source === 'footer' ? 'Footer Newsletter Signup' : source)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;background-color:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:11px;">Subscribed at ${formatTimestamp()} UTC</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const getNewsletterEmailText = (email, source) => `
New Newsletter Subscriber

Email Address: ${email}
Source: ${source === 'footer' ? 'Footer Newsletter Signup' : source}

Subscribed at ${formatTimestamp()} UTC
`.trim();

const getChatMessageEmailHtml = (formData) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Landing Chat Message</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f5f5f5;">
  <table role="presentation" style="width:100%;border-collapse:collapse;background-color:#f5f5f5;padding:20px;">
    <tr>
      <td align="center">
        <table role="presentation" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#f97316 0%,#ea580c 100%);padding:24px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">New Landing Chat Message</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;">
              <table role="presentation" style="width:100%;background-color:#f9fafb;border-radius:6px;padding:16px;">
                <tr>
                  <td style="padding-bottom:12px;">
                    <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0;">Name</p>
                    <span style="color:#111827;font-size:15px;font-weight:600;">${escapeHtml(formData.name)}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:12px;">
                    <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0;">Email</p>
                    <a href="mailto:${escapeHtml(formData.email)}" style="color:#f97316;font-size:15px;font-weight:600;text-decoration:none;">${escapeHtml(formData.email)}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:12px;">
                    <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0;">Conversation ID</p>
                    <span style="color:#111827;font-size:13px;">${escapeHtml(formData.conversationId)}</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0;">Message</p>
                    <p style="color:#111827;font-size:15px;line-height:1.6;margin:0;white-space:pre-wrap;">${escapeHtml(formData.message)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;background-color:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:11px;">Submitted at ${formatTimestamp()} UTC</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const getChatMessageEmailText = (formData) => `
New Landing Chat Message

Name: ${formData.name}
Email: ${formData.email}
Conversation ID: ${formData.conversationId}

Message:
${formData.message}

Submitted at ${formatTimestamp()} UTC
`.trim();

const sendResendEmail = async ({ subject, html, text }) => {
  if (!process.env.RESEND_API_KEY) {
    return { ok: true, skipped: true };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: resendFromEmail,
      to: [reservationRecipient],
      subject,
      html,
      text,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, payload };
};

export const optionsResponse = (request) => new Response(null, {
  status: 204,
  headers: corsHeaders(request),
});

export const handleReservation = async (request) => {
  const body = await parseJson(request);
  if (!body) {
    return jsonResponse(request, { error: 'Invalid JSON payload' }, 400);
  }

  const formData = normalizeReservationForm(body);

  if (!formData.name || !formData.email || !formData.location || !formData.lookingFor || !formData.userType) {
    return jsonResponse(request, {
      error: 'Missing required fields',
      required: ['name', 'email', 'location', 'lookingFor', 'userType'],
    }, 400);
  }
  if (!allowedUserTypes.has(formData.userType)) {
    return jsonResponse(request, { error: 'Invalid user type' }, 400);
  }
  if (!allowedMarkets.has(formData.market)) {
    return jsonResponse(request, { error: 'Invalid market' }, 400);
  }
  if (!isValidEmail(formData.email)) {
    return jsonResponse(request, { error: 'Invalid email address' }, 400);
  }
  if (isInternalAutomationReservation(formData)) {
    return jsonResponse(request, { error: 'Internal automation test submissions are not accepted on the public reservation form.' }, 400);
  }

  const duplicateReason = findDuplicateReservation(formData);
  if (duplicateReason) {
    return jsonResponse(request, { error: `This waitlist reservation is already reserved for that ${duplicateReason}.` }, 409);
  }

  const rateLimit = await enforceLandingAbuseLimit(request, 'reservation', [
    `email:${formData.email}`,
    normalizePhoneKey(formData.phone) ? `phone:${normalizePhoneKey(formData.phone)}` : '',
  ], landingEmailRateLimit());
  if (rateLimit.limited || rateLimit.unavailable) {
    return rateLimitResponse(request, rateLimit);
  }

  try {
    const emailResult = await sendResendEmail({
      subject: 'New Reserve Your Spot Lead',
      html: getReservationEmailHtml(formData),
      text: getReservationEmailText(formData),
    });

    if (!emailResult.ok) {
      console.error('Reservation email provider failed', { status: emailResult.status });
      return jsonResponse(request, { error: 'Failed to send reservation email' }, 500);
    }

    let sheetResult;
    try {
      sheetResult = await appendReservationToGoogleSheet(formData);
    } catch (error) {
      console.error('Reservation Google Sheet append failed', { error });
      return jsonResponse(request, { error: 'Failed to store reservation lead in Google Sheet' }, 500);
    }

    if (!sheetResult.ok) {
      console.error('Reservation Google Sheet append failed', {
        status: sheetResult.status,
        payload: sheetResult.payload,
      });
      return jsonResponse(request, { error: 'Failed to store reservation lead in Google Sheet' }, 500);
    }

    rememberReservationSubmission(formData);

    return jsonResponse(request, {
      success: true,
      message: emailResult.skipped
        ? 'Reservation received (email service not configured)'
        : 'Reservation email sent successfully',
      emailConfigured: !emailResult.skipped,
      sheetConfigured: sheetResult.configured,
      sheetStored: sheetResult.configured && sheetResult.ok,
    });
  } catch (error) {
    console.error('Reservation email request failed', error);
    return jsonResponse(request, { error: 'Failed to send reservation email' }, 500);
  }
};

export const handleNewsletter = async (request) => {
  const body = await parseJson(request);
  if (!body) {
    return jsonResponse(request, { error: 'Invalid JSON payload' }, 400);
  }

  const email = normalizeText(body?.email, 254).toLowerCase();
  const source = normalizeText(body?.source || 'unknown', 80);

  if (!email) {
    return jsonResponse(request, { error: 'Email is required' }, 400);
  }
  if (!isValidEmail(email)) {
    return jsonResponse(request, { error: 'Invalid email address' }, 400);
  }

  const rateLimit = await enforceLandingAbuseLimit(request, 'newsletter', [
    `email:${email}`,
  ], landingEmailRateLimit());
  if (rateLimit.limited || rateLimit.unavailable) {
    return rateLimitResponse(request, rateLimit);
  }

  try {
    const emailResult = await sendResendEmail({
      subject: `New Newsletter Subscriber: ${email}`,
      html: getNewsletterEmailHtml(email, source),
      text: getNewsletterEmailText(email, source),
    });

    if (!emailResult.ok) {
      console.error('Newsletter email provider failed', { status: emailResult.status });
      return jsonResponse(request, { error: 'Failed to send notification' }, 500);
    }

    return jsonResponse(request, {
      success: true,
      message: emailResult.skipped
        ? 'Subscription received (email notification not configured)'
        : 'Newsletter notification sent',
      emailConfigured: !emailResult.skipped,
    });
  } catch (error) {
    console.error('Newsletter email request failed', error);
    return jsonResponse(request, { error: 'Failed to send newsletter notification' }, 500);
  }
};

export const handleChatStart = async (request) => {
  const body = await parseJson(request);
  if (!body) {
    return jsonResponse(request, { error: 'Invalid JSON payload' }, 400);
  }

  const formData = normalizeChatStart(body);

  if (!formData.name || !formData.email || !formData.visitorId) {
    return jsonResponse(request, { error: 'Name, email, and visitor identifier are required' }, 400);
  }
  if (!isValidEmail(formData.email)) {
    return jsonResponse(request, { error: 'Invalid email address' }, 400);
  }

  const rateLimit = await enforceLandingAbuseLimit(request, 'chat_start', [
    `email:${formData.email}`,
    `visitor:${formData.visitorId}`,
  ], landingChatStartRateLimit());
  if (rateLimit.limited || rateLimit.unavailable) {
    return rateLimitResponse(request, rateLimit);
  }

  const conversationId = formData.visitorId;
  return jsonResponse(request, {
    success: true,
    conversationId,
    conversation: {
      id: conversationId,
      visitor_id: formData.visitorId,
      visitor_name: formData.name,
      visitor_email: formData.email,
    },
    message: {
      id: `welcome-${Date.now()}`,
      conversation_id: conversationId,
      sender_type: 'admin',
      message: `Hi ${formData.name}. Thanks for reaching out. Send us your question and our team will follow up shortly.`,
      created_at: new Date().toISOString(),
    },
  });
};

export const handleChatMessage = async (request) => {
  const body = await parseJson(request);
  if (!body) {
    return jsonResponse(request, { error: 'Invalid JSON payload' }, 400);
  }

  const formData = normalizeChatMessage(body);

  if (!formData.name || !formData.email || !formData.visitorId || !formData.conversationId || !formData.message) {
    return jsonResponse(request, { error: 'Name, email, conversation, and message are required' }, 400);
  }
  if (!isValidEmail(formData.email)) {
    return jsonResponse(request, { error: 'Invalid email address' }, 400);
  }

  const rateLimit = await enforceLandingAbuseLimit(request, 'chat_message', [
    `email:${formData.email}`,
    `visitor:${formData.visitorId}`,
    `conversation:${formData.conversationId}`,
  ], landingEmailRateLimit());
  if (rateLimit.limited || rateLimit.unavailable) {
    return rateLimitResponse(request, rateLimit);
  }

  try {
    const emailResult = await sendResendEmail({
      subject: `New Landing Chat Message from ${formData.name}`,
      html: getChatMessageEmailHtml(formData),
      text: getChatMessageEmailText(formData),
    });

    if (!emailResult.ok) {
      console.error('Chat email provider failed', { status: emailResult.status });
      return jsonResponse(request, { error: 'Failed to send chat message' }, 500);
    }

    return jsonResponse(request, {
      success: true,
      emailConfigured: !emailResult.skipped,
      message: {
        id: `visitor-${Date.now()}`,
        conversation_id: formData.conversationId,
        sender_type: 'visitor',
        message: formData.message,
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Chat message request failed', error);
    return jsonResponse(request, { error: 'Failed to send chat message' }, 500);
  }
};

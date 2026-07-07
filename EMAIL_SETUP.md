# Email Setup for Landing API

The landing API sends reservation, newsletter, and chat emails to `contact@estospaces.com`.

## Production Provider

Production is configured for Resend through the GCP Cloud Run service `estospaces-landing-prod`.

Required Cloud Run environment variables:

- `RESEND_API_KEY` - Resend API key stored in GCP Secret Manager.
- `RESEND_FROM_EMAIL` - Sender email, currently `Estospaces <contact@estospaces.com>`.
- `RESERVATION_EMAIL` - Recipient email, currently `contact@estospaces.com`.
- `GOOGLE_SHEETS_SPREADSHEET_ID` - Reserve Your Spot lead sheet, currently `1lcHZXqllQ6JT-pnnA6fN7cVqRt8xhZtU7TbBnsroUOA`.
- `GOOGLE_SHEETS_LEADS_RANGE` - Sheet append range, default `A:Q`.
- `GOOGLE_SHEETS_CLIENT_EMAIL` and `GOOGLE_SHEETS_PRIVATE_KEY` - Optional dedicated Google Sheets service account credentials. If omitted, Cloud Run uses its runtime service account.
- `CORS_ALLOWED_ORIGINS` or `ALLOWED_ORIGINS` - Comma-separated allowed landing origins.
- `LANDING_RATE_LIMIT_STORE=firestore` - Shared abuse throttle for public reservation, newsletter, and chat endpoints.
- `LANDING_RATE_LIMIT_COLLECTION` - Firestore collection for throttle counters, default `landingApiRateLimits`.

Before launch, the `estospaces.com` domain must be verified in Resend for `contact@estospaces.com` sending. Resend generates account-specific DNS records, so do not guess these values.

## Reserve Your Spot Google Sheet

Every successful Reserve Your Spot submission is appended to:

`https://docs.google.com/spreadsheets/d/1lcHZXqllQ6JT-pnnA6fN7cVqRt8xhZtU7TbBnsroUOA/edit`

Before enabling the campaign:

1. Share the Google Sheet with the service account in `GOOGLE_SHEETS_CLIENT_EMAIL`, or with the Cloud Run runtime service account if dedicated Sheets credentials are not configured.
2. Give that account Editor access.
3. Keep the append range as `A:Q` unless a specific tab name is required.
4. Add this header row to row 1:

```text
Submitted At | Market | User Type | Name | Email | Phone | Newsletter Opt-In | Location | Looking For | Landing Page | UTM Source | UTM Medium | UTM Campaign | UTM Term | UTM Content | GCLID | FBCLID
```

If the sheet is configured and the append fails, the API returns an error instead of silently accepting the lead. This prevents ad traffic from being collected without appearing in the live sheet.

## Required Resend Domain Verification

1. Open the Resend dashboard.
2. Add or open the `estospaces.com` domain.
3. Copy the generated DNS records for verification and DKIM signing.
4. Add those records to the GCP Cloud DNS public zone `estospaces-com`.
5. Wait for DNS propagation.
6. Click verify in Resend.
7. Submit one safe production smoke test through `/api/send-reservation-email`.

If the current API key is send-only, use the Resend dashboard or an unrestricted Resend API key to retrieve the generated DNS records.

## Local Development

Run the landing API locally with:

```bash
npm run server
```

Run the API regression tests with:

```bash
npm run test:api
```

## API Endpoints

- `POST /api/send-reservation-email`
- `POST /api/send-newsletter-notification`
- `POST /api/live-chat/start`
- `POST /api/live-chat/message`

Reservation request example:

```json
{
  "market": "india",
  "userType": "buyer",
  "name": "Example User",
  "email": "example.user@example.com",
  "phone": "+91 98765 43210",
  "location": "Chennai",
  "lookingFor": "Looking for a verified home.",
  "attribution": {
    "landingPage": "/",
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "india_launch"
  }
}
```

Successful response example:

```json
{
  "success": true,
  "message": "Reservation email sent successfully",
  "emailConfigured": true,
  "sheetConfigured": true,
  "sheetStored": true
}
```

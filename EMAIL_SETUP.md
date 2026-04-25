# Email Setup for Landing API

The landing API sends reservation, newsletter, and chat emails to `contact@estospaces.com`.

## Production Provider

Production is configured for Resend through the GCP Cloud Run service `estospaces-landing-prod`.

Required Cloud Run environment variables:

- `RESEND_API_KEY` - Resend API key stored in GCP Secret Manager.
- `RESEND_FROM_EMAIL` - Sender email, currently `Estospaces <contact@estospaces.com>`.
- `RESERVATION_EMAIL` - Recipient email, currently `contact@estospaces.com`.
- `CORS_ALLOWED_ORIGINS` or `ALLOWED_ORIGINS` - Comma-separated allowed landing origins.

Before launch, the `estospaces.com` domain must be verified in Resend for `contact@estospaces.com` sending. Resend generates account-specific DNS records, so do not guess these values.

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
  "userType": "buyer",
  "name": "Example User",
  "email": "example.user@example.com",
  "phone": "+15551234567",
  "location": "London",
  "lookingFor": "Looking for a private office."
}
```

Successful response example:

```json
{
  "success": true,
  "message": "Reservation email sent successfully"
}
```

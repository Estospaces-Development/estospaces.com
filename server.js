import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist');
const indexHtml = path.join(distDir, 'index.html');
const port = Number(process.env.PORT || 8080);

const app = express();

app.disable('x-powered-by');
const corsAllowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const optionalCors = (req, res, next) => {
    const origin = req.headers.origin;

    if (!origin || corsAllowedOrigins.length === 0) {
        next();
        return;
    }

    if (!corsAllowedOrigins.includes(origin)) {
        next();
        return;
    }

    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.sendStatus(204);
        return;
    }

    next();
};

app.use('/api/send-reservation-email', optionalCors);
app.use(express.json({ limit: '1mb' }));

const reservationRecipient = process.env.RESERVATION_EMAIL || 'contact@estospaces.com';
const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'Estospaces <onboarding@resend.dev>';

const formatTimestamp = () => new Date().toLocaleString('en-US', {
    timeZone: 'UTC',
    dateStyle: 'long',
    timeStyle: 'short',
});

const getReservationEmailHtml = (formData) => {
    const userTypeLabels = {
        buyer: 'Buyer',
        renter: 'Renter',
        seller: 'Seller',
    };

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
                            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">New Reserve Your Spot Lead</h1>
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
                                                    <strong style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:4px;">User Type</strong>
                                                    <span style="color:#111827;font-size:16px;font-weight:600;">${userTypeLabels[formData.userType] || formData.userType}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
                                                    <strong style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:4px;">Full Name</strong>
                                                    <span style="color:#111827;font-size:16px;font-weight:600;">${formData.name || 'Not provided'}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
                                                    <strong style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:4px;">Email Address</strong>
                                                    <a href="mailto:${formData.email}" style="color:#f97316;font-size:16px;font-weight:600;text-decoration:none;">${formData.email || 'Not provided'}</a>
                                                </td>
                                            </tr>
                                            ${formData.phone ? `
                                            <tr>
                                                <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
                                                    <strong style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:4px;">Phone Number</strong>
                                                    <a href="tel:${formData.phone}" style="color:#111827;font-size:16px;font-weight:600;text-decoration:none;">${formData.phone}</a>
                                                </td>
                                            </tr>
                                            ` : ''}
                                            <tr>
                                                <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
                                                    <strong style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:4px;">Location/City</strong>
                                                    <span style="color:#111827;font-size:16px;font-weight:600;">${formData.location || 'Not provided'}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:12px 0;">
                                                    <strong style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:4px;">What They're Looking For</strong>
                                                    <p style="color:#111827;font-size:16px;line-height:1.6;margin:8px 0 0;white-space:pre-wrap;">${formData.lookingFor || 'Not provided'}</p>
                                                </td>
                                            </tr>
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

    return `
New Reserve Your Spot Lead

A new user has reserved their spot on the Estospaces landing page.

User Type: ${userTypeLabels[formData.userType] || formData.userType}
Full Name: ${formData.name || 'Not provided'}
Email Address: ${formData.email || 'Not provided'}
${formData.phone ? `Phone Number: ${formData.phone}` : ''}
Location/City: ${formData.location || 'Not provided'}

What They're Looking For:
${formData.lookingFor || 'Not provided'}

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
                                        <p style="margin:0 0 8px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Email Address</p>
                                        <a href="mailto:${email}" style="color:#f97316;font-size:16px;font-weight:600;text-decoration:none;">${email}</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-top:12px;">
                                        <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Source</p>
                                        <span style="color:#111827;font-size:14px;">${source === 'footer' ? 'Footer Newsletter Signup' : source}</span>
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

    const payload = await response.json();
    return { ok: response.ok, status: response.status, payload };
};

app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true, service: 'estospaces-landing' });
});

app.post('/api/send-reservation-email', async (req, res) => {
    const formData = req.body || {};

    if (!formData.name || !formData.email || !formData.location || !formData.lookingFor || !formData.userType) {
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['name', 'email', 'location', 'lookingFor', 'userType'],
        });
    }

    try {
        const emailResult = await sendResendEmail({
            subject: 'New Reserve Your Spot Lead',
            html: getReservationEmailHtml(formData),
            text: getReservationEmailText(formData),
        });

        if (!emailResult.ok) {
            return res.status(500).json({
                error: 'Failed to send reservation email',
                details: emailResult.payload,
            });
        }

        return res.status(200).json({
            success: true,
            message: emailResult.skipped
                ? 'Reservation received (email service not configured)'
                : 'Reservation email sent successfully',
            emailConfigured: !emailResult.skipped,
            emailId: emailResult.payload?.id || null,
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Failed to send reservation email',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

app.post('/api/send-newsletter-notification', async (req, res) => {
    const email = String(req.body?.email || '').trim();
    const source = String(req.body?.source || 'unknown');

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const emailResult = await sendResendEmail({
            subject: `New Newsletter Subscriber: ${email}`,
            html: getNewsletterEmailHtml(email, source),
            text: getNewsletterEmailText(email, source),
        });

        if (!emailResult.ok) {
            return res.status(500).json({
                error: 'Failed to send notification',
                details: emailResult.payload,
            });
        }

        return res.status(200).json({
            success: true,
            message: emailResult.skipped
                ? 'Subscription received (email notification not configured)'
                : 'Newsletter notification sent',
            emailConfigured: !emailResult.skipped,
            emailId: emailResult.payload?.id || null,
        });
    } catch (error) {
        return res.status(500).json({
            error: 'Failed to send newsletter notification',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

app.use(express.static(distDir));

app.get(/^(?!\/api\/|\/health$).*/, (_req, res) => {
    res.sendFile(indexHtml);
});

app.listen(port, '0.0.0.0', () => {
    console.log(`estospaces-landing listening on ${port}`);
});

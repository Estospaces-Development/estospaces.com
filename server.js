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
app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), geolocation=(), microphone=()');
    next();
});

const corsAllowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || process.env.ALLOWED_ORIGINS || '')
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

app.use('/api', optionalCors);
app.use(express.json({ limit: '1mb' }));
app.use((err, _req, res, next) => {
    if (err?.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Invalid JSON payload' });
    }
    return next(err);
});

const reservationRecipient = process.env.RESERVATION_EMAIL || 'contact@estospaces.com';
const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'Estospaces <contact@estospaces.com>';
const allowedUserTypes = new Set(['buyer', 'renter', 'seller']);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};

const normalizeText = (value, maxLength) => String(value || '').trim().slice(0, maxLength);
const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (char) => htmlEscapes[char]);
const isValidEmail = (email) => emailPattern.test(email) && email.length <= 254;

const normalizeReservationForm = (body) => ({
    userType: normalizeText(body?.userType, 20).toLowerCase(),
    name: normalizeText(body?.name, 120),
    email: normalizeText(body?.email, 254).toLowerCase(),
    phone: normalizeText(body?.phone, 40),
    location: normalizeText(body?.location, 120),
    lookingFor: normalizeText(body?.lookingFor, 2000),
});

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
                                                    <span style="color:#111827;font-size:16px;font-weight:600;">${escapeHtml(userTypeLabels[formData.userType] || formData.userType)}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
                                                    <strong style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:4px;">Full Name</strong>
                                                    <span style="color:#111827;font-size:16px;font-weight:600;">${escapeHtml(formData.name || 'Not provided')}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
                                                    <strong style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:4px;">Email Address</strong>
                                                    <a href="mailto:${escapeHtml(formData.email)}" style="color:#f97316;font-size:16px;font-weight:600;text-decoration:none;">${escapeHtml(formData.email || 'Not provided')}</a>
                                                </td>
                                            </tr>
                                            ${formData.phone ? `
                                            <tr>
                                                <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
                                                    <strong style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:4px;">Phone Number</strong>
                                                    <a href="tel:${escapeHtml(formData.phone)}" style="color:#111827;font-size:16px;font-weight:600;text-decoration:none;">${escapeHtml(formData.phone)}</a>
                                                </td>
                                            </tr>
                                            ` : ''}
                                            <tr>
                                                <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
                                                    <strong style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:4px;">Location/City</strong>
                                                    <span style="color:#111827;font-size:16px;font-weight:600;">${escapeHtml(formData.location || 'Not provided')}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:12px 0;">
                                                    <strong style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;display:block;margin-bottom:4px;">What They're Looking For</strong>
                                                    <p style="color:#111827;font-size:16px;line-height:1.6;margin:8px 0 0;white-space:pre-wrap;">${escapeHtml(formData.lookingFor || 'Not provided')}</p>
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
                                        <a href="mailto:${escapeHtml(email)}" style="color:#f97316;font-size:16px;font-weight:600;text-decoration:none;">${escapeHtml(email)}</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-top:12px;">
                                        <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Source</p>
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
                                        <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Name</p>
                                        <span style="color:#111827;font-size:15px;font-weight:600;">${escapeHtml(formData.name)}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom:12px;">
                                        <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Email</p>
                                        <a href="mailto:${escapeHtml(formData.email)}" style="color:#f97316;font-size:15px;font-weight:600;text-decoration:none;">${escapeHtml(formData.email)}</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-bottom:12px;">
                                        <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Conversation ID</p>
                                        <span style="color:#111827;font-size:13px;">${escapeHtml(formData.conversationId)}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <p style="margin:0 0 4px;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Message</p>
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

app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true, service: 'estospaces-landing' });
});

app.post('/api/send-reservation-email', async (req, res) => {
    const formData = normalizeReservationForm(req.body || {});

    if (!formData.name || !formData.email || !formData.location || !formData.lookingFor || !formData.userType) {
        return res.status(400).json({
            error: 'Missing required fields',
            required: ['name', 'email', 'location', 'lookingFor', 'userType'],
        });
    }
    if (!allowedUserTypes.has(formData.userType)) {
        return res.status(400).json({ error: 'Invalid user type' });
    }
    if (!isValidEmail(formData.email)) {
        return res.status(400).json({ error: 'Invalid email address' });
    }

    try {
        const emailResult = await sendResendEmail({
            subject: 'New Reserve Your Spot Lead',
            html: getReservationEmailHtml(formData),
            text: getReservationEmailText(formData),
        });

        if (!emailResult.ok) {
            console.error('Reservation email provider failed', { status: emailResult.status });
            return res.status(500).json({
                error: 'Failed to send reservation email',
            });
        }

        return res.status(200).json({
            success: true,
            message: emailResult.skipped
                ? 'Reservation received (email service not configured)'
                : 'Reservation email sent successfully',
            emailConfigured: !emailResult.skipped,
        });
    } catch (error) {
        console.error('Reservation email request failed', error);
        return res.status(500).json({
            error: 'Failed to send reservation email',
        });
    }
});

app.post('/api/send-newsletter-notification', async (req, res) => {
    const email = normalizeText(req.body?.email, 254).toLowerCase();
    const source = normalizeText(req.body?.source || 'unknown', 80);

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Invalid email address' });
    }

    try {
        const emailResult = await sendResendEmail({
            subject: `New Newsletter Subscriber: ${email}`,
            html: getNewsletterEmailHtml(email, source),
            text: getNewsletterEmailText(email, source),
        });

        if (!emailResult.ok) {
            console.error('Newsletter email provider failed', { status: emailResult.status });
            return res.status(500).json({
                error: 'Failed to send notification',
            });
        }

        return res.status(200).json({
            success: true,
            message: emailResult.skipped
                ? 'Subscription received (email notification not configured)'
                : 'Newsletter notification sent',
            emailConfigured: !emailResult.skipped,
        });
    } catch (error) {
        console.error('Newsletter email request failed', error);
        return res.status(500).json({
            error: 'Failed to send newsletter notification',
        });
    }
});

app.post('/api/live-chat/start', async (req, res) => {
    const formData = normalizeChatStart(req.body || {});

    if (!formData.name || !formData.email || !formData.visitorId) {
        return res.status(400).json({
            error: 'Name, email, and visitor identifier are required',
        });
    }
    if (!isValidEmail(formData.email)) {
        return res.status(400).json({ error: 'Invalid email address' });
    }

    const conversationId = formData.visitorId;
    return res.status(200).json({
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
});

app.post('/api/live-chat/message', async (req, res) => {
    const formData = normalizeChatMessage(req.body || {});

    if (!formData.name || !formData.email || !formData.visitorId || !formData.conversationId || !formData.message) {
        return res.status(400).json({
            error: 'Name, email, conversation, and message are required',
        });
    }
    if (!isValidEmail(formData.email)) {
        return res.status(400).json({ error: 'Invalid email address' });
    }

    try {
        const emailResult = await sendResendEmail({
            subject: `New Landing Chat Message from ${formData.name}`,
            html: getChatMessageEmailHtml(formData),
            text: getChatMessageEmailText(formData),
        });

        if (!emailResult.ok) {
            console.error('Chat email provider failed', { status: emailResult.status });
            return res.status(500).json({
                error: 'Failed to send chat message',
            });
        }

        return res.status(200).json({
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
        return res.status(500).json({
            error: 'Failed to send chat message',
        });
    }
});

app.use(express.static(distDir));

app.get(/^(?!\/api\/|\/health$).*/, (_req, res) => {
    res.sendFile(indexHtml);
});

app.listen(port, '0.0.0.0', () => {
    console.info(`estospaces-landing listening on ${port}`);
});

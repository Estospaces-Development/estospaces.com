/**
 * Local development server that handles API routes
 * Runs alongside Vite or as a standalone Express server
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Email template HTML
const getEmailHTML = (formData) => {
    const userTypeLabels = {
        buyer: 'Buyer',
        renter: 'Renter',
        seller: 'Seller'
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Reserve Your Spot Lead</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5; padding: 20px;">
        <tr>
            <td align="center">
                <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px 40px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                                New Reserve Your Spot Lead
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Intro -->
                    <tr>
                        <td style="padding: 30px 40px 20px;">
                            <p style="margin: 0 0 20px; color: #374151; font-size: 16px; line-height: 1.6;">
                                A new user has reserved their spot on the Estospaces landing page.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Lead Details -->
                    <tr>
                        <td style="padding: 0 40px 30px;">
                            <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 6px; overflow: hidden;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                                    <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">User Type</strong>
                                                    <span style="color: #111827; font-size: 16px; font-weight: 600;">${userTypeLabels[formData.userType] || formData.userType}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                                    <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Full Name</strong>
                                                    <span style="color: #111827; font-size: 16px; font-weight: 600;">${formData.name || 'Not provided'}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                                    <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Email Address</strong>
                                                    <a href="mailto:${formData.email}" style="color: #f97316; font-size: 16px; font-weight: 600; text-decoration: none;">${formData.email || 'Not provided'}</a>
                                                </td>
                                            </tr>
                                            ${formData.phone ? `
                                            <tr>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                                    <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Phone Number</strong>
                                                    <a href="tel:${formData.phone}" style="color: #111827; font-size: 16px; font-weight: 600; text-decoration: none;">${formData.phone}</a>
                                                </td>
                                            </tr>
                                            ` : ''}
                                            <tr>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                                                    <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">Location/City</strong>
                                                    <span style="color: #111827; font-size: 16px; font-weight: 600;">${formData.location || 'Not provided'}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 0;">
                                                    <strong style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 4px;">What They're Looking For</strong>
                                                    <p style="color: #111827; font-size: 16px; line-height: 1.6; margin: 8px 0 0; white-space: pre-wrap;">${formData.lookingFor || 'Not provided'}</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
                            <p style="margin: 0; color: #6b7280; font-size: 12px;">
                                This email was sent from the Estospaces landing page reservation form.
                            </p>
                            <p style="margin: 8px 0 0; color: #9ca3af; font-size: 11px;">
                                Submitted at ${new Date().toLocaleString('en-US', {
        timeZone: 'UTC',
        dateStyle: 'long',
        timeStyle: 'short'
    })}
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
};

// Plain text version
const getEmailText = (formData) => {
    const userTypeLabels = {
        buyer: 'Buyer',
        renter: 'Renter',
        seller: 'Seller'
    };

    return `
New Reserve Your Spot Lead

A new user has reserved their spot on the Estospaces landing page.

LEAD DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
User Type: ${userTypeLabels[formData.userType] || formData.userType}
Full Name: ${formData.name || 'Not provided'}
Email Address: ${formData.email || 'Not provided'}
${formData.phone ? `Phone Number: ${formData.phone}` : ''}
Location/City: ${formData.location || 'Not provided'}

What They're Looking For:
${formData.lookingFor || 'Not provided'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Submitted at ${new Date().toLocaleString('en-US', {
        timeZone: 'UTC',
        dateStyle: 'long',
        timeStyle: 'short'
    })}

This email was sent from the Estospaces landing page reservation form.
  `.trim();
};

async function startServer() {
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
    app.use(express.json());

    // API route for sending reservation emails
    app.post('/api/send-reservation-email', async (req, res) => {
        console.log('📬 [API] POST /api/send-reservation-email');

        try {
            const formData = req.body;
            console.log('📬 [API] Form data:', formData);

            // Validate required fields
            if (!formData.name || !formData.email || !formData.location || !formData.lookingFor || !formData.userType) {
                console.log('⚠️ [API] Missing required fields');
                return res.status(400).json({
                    error: 'Missing required fields',
                    required: ['name', 'email', 'location', 'lookingFor', 'userType']
                });
            }

            const recipientEmail = process.env.RESERVATION_EMAIL || 'contact@estospaces.com';
            console.log('📬 [API] Sending to:', recipientEmail);

            // Check for Resend API key
            if (!process.env.RESEND_API_KEY) {
                console.log('⚠️ [API] RESEND_API_KEY not configured');
                return res.status(200).json({
                    success: true,
                    message: 'Reservation received (email service not configured)',
                    emailConfigured: false
                });
            }

            // Send via Resend
            console.log('📬 [API] Sending via Resend...');
            const resendResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
                },
                body: JSON.stringify({
                    from: process.env.RESEND_FROM_EMAIL || 'Estospaces <onboarding@resend.dev>',
                    to: [recipientEmail],
                    subject: 'New Reserve Your Spot Lead',
                    html: getEmailHTML(formData),
                    text: getEmailText(formData)
                })
            });

            const resendData = await resendResponse.json();
            console.log('📬 [API] Resend response:', resendResponse.status, resendData);

            if (resendResponse.ok) {
                console.log('✅ [API] Email sent successfully!');
                return res.status(200).json({
                    success: true,
                    message: 'Reservation email sent successfully',
                    emailId: resendData.id
                });
            } else {
                console.error('❌ [API] Resend error:', resendData);
                return res.status(500).json({
                    error: 'Failed to send email',
                    details: resendData
                });
            }

        } catch (err) {
            console.error('❌ [API] Error:', err);
            return res.status(500).json({
                error: 'Failed to send reservation email',
                message: err.message
            });
        }
    });

    app.post('/api/send-newsletter-notification', async (req, res) => {
        const timestamp = new Date().toISOString();
        console.log(`\n[${timestamp}] 📬 RECEIVED Newsletter Request`);
        console.log('Request Body:', JSON.stringify(req.body, null, 2));

        try {
            const { email, source } = req.body;

            if (!email) {
                console.error('❌ [API] Email missing in body');
                return res.status(400).json({ error: 'Email is required' });
            }

            const recipientEmail = process.env.RESERVATION_EMAIL || 'contact@estospaces.com';
            console.log(`[API] Configuration Check:`);
            console.log(`- Recipient: ${recipientEmail}`);
            console.log(`- From: ${process.env.RESEND_FROM_EMAIL}`);
            console.log(`- API Key Configured: ${!!process.env.RESEND_API_KEY}`);

            // Try to save to Supabase if configured (skipping for now to focus on email)

            // Send notification email
            const resendResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
                },
                body: JSON.stringify({
                    from: process.env.RESEND_FROM_EMAIL || 'Estospaces <onboarding@resend.dev>',
                    to: [recipientEmail],
                    subject: `📬 New Newsletter Subscriber: ${email}`,
                    html: `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; padding: 20px;">
    <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 24px; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 20px;">📬 New Newsletter Subscriber</h1>
        </div>
        <div style="padding: 24px;">
            <p style="color: #374151; margin-bottom: 16px;">Someone just subscribed to your newsletter!</p>
            <div style="background: #f9fafb; padding: 16px; border-radius: 6px;">
                <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; text-transform: uppercase;">Email Address</p>
                <a href="mailto:${email}" style="color: #f97316; font-size: 16px; font-weight: 600; text-decoration: none;">${email}</a>
                <p style="margin: 12px 0 4px; color: #6b7280; font-size: 12px; text-transform: uppercase;">Source</p>
                <span style="color: #111827; font-size: 14px;">${source === 'footer' ? 'Footer Newsletter Signup' : source || 'Unknown'}</span>
            </div>
        </div>
        <div style="padding: 16px; background: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="margin: 0; color: #9ca3af; font-size: 11px;">Subscribed at ${new Date().toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'long', timeStyle: 'short' })} UTC</p>
        </div>
    </div>
</body>
</html>`,
                    text: `New Newsletter Subscriber\n\nEmail: ${email}\nSource: ${source || 'Unknown'}\nSubscribed at: ${new Date().toISOString()}`
                })
            });

            const resendData = await resendResponse.json();

            if (resendResponse.ok) {
                console.log('✅ [API] Newsletter notification sent!');
                return res.status(200).json({
                    success: true,
                    message: 'Newsletter notification sent',
                    emailId: resendData.id
                });
            } else {
                console.error('❌ [API] Resend error:', resendData);
                return res.status(500).json({
                    error: 'Failed to send notification',
                    details: resendData
                });
            }
        } catch (err) {
            console.error('❌ [API] Error:', err);
            return res.status(500).json({
                error: 'Failed to send newsletter notification',
                message: err.message
            });
        }
    });

    // Create Vite server in middleware mode
    const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa'
    });

    // Use vite's connect instance as middleware
    app.use(vite.middlewares);

    const PORT = process.env.PORT || 5173;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`\n  🚀 Dev server running at:`);
        console.log(`  ➜  Local:   http://localhost:${PORT}/`);
        console.log(`  ➜  Network: http://0.0.0.0:${PORT}/`);
        console.log(`\n  📬 API endpoints:`);
        console.log(`  ➜  POST /api/send-reservation-email`);
        console.log(`\n  Environment:`);
        console.log(`  ➜  RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✅ Configured' : '❌ Not set'}`);
        console.log(`  ➜  RESERVATION_EMAIL: ${process.env.RESERVATION_EMAIL || 'contact@estospaces.com'}`);
        console.log('');
    });
}

startServer().catch(console.error);

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Email template for newsletter subscriber notification
const getEmailHTML = (email: string, source: string) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Newsletter Subscriber</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5; padding: 20px;">
        <tr>
            <td align="center">
                <table role="presentation" style="max-width: 500px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 24px 32px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700;">
                                📬 New Newsletter Subscriber
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 24px 32px;">
                            <p style="margin: 0 0 16px; color: #374151; font-size: 15px; line-height: 1.6;">
                                Someone just subscribed to your newsletter!
                            </p>
                            
                            <table role="presentation" style="width: 100%; background-color: #f9fafb; border-radius: 6px; padding: 16px;">
                                <tr>
                                    <td>
                                        <p style="margin: 0 0 8px; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                                            Email Address
                                        </p>
                                        <a href="mailto:${email}" style="color: #f97316; font-size: 16px; font-weight: 600; text-decoration: none;">
                                            ${email}
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-top: 12px;">
                                        <p style="margin: 0 0 4px; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                                            Source
                                        </p>
                                        <span style="color: #111827; font-size: 14px;">
                                            ${source === 'footer' ? 'Footer Newsletter Signup' : source}
                                        </span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 16px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center;">
                            <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                                Subscribed at ${new Date().toLocaleString('en-US', {
        timeZone: 'UTC',
        dateStyle: 'long',
        timeStyle: 'short'
    })} UTC
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
const getEmailText = (email: string, source: string) => {
    return `
New Newsletter Subscriber

Someone just subscribed to your newsletter!

Email Address: ${email}
Source: ${source === 'footer' ? 'Footer Newsletter Signup' : source}

Subscribed at ${new Date().toLocaleString('en-US', {
        timeZone: 'UTC',
        dateStyle: 'long',
        timeStyle: 'short'
    })} UTC
  `.trim();
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, source } = req.body;

        // Validate required fields
        if (!email) {
            return res.status(400).json({
                error: 'Email is required'
            });
        }

        const recipientEmail = process.env.RESERVATION_EMAIL || 'contact@estospaces.com';

        // Check for Resend API key
        if (!process.env.RESEND_API_KEY) {
            console.warn('[Newsletter] Email notification provider is not configured');
            return res.status(200).json({
                success: true,
                message: 'Subscription received (email notification not configured)',
                emailConfigured: false
            });
        }

        // Send via Resend
        const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
            },
            body: JSON.stringify({
                from: process.env.RESEND_FROM_EMAIL || 'Estospaces <contact@estospaces.com>',
                to: [recipientEmail],
                subject: `📬 New Newsletter Subscriber: ${email}`,
                html: getEmailHTML(email, source || 'unknown'),
                text: getEmailText(email, source || 'unknown')
            })
        });

        const resendData = await resendResponse.json();

        if (resendResponse.ok) {
            return res.status(200).json({
                success: true,
                message: 'Newsletter notification sent',
                emailId: resendData.id
            });
        } else {
            console.error('[Newsletter] Resend error:', resendData);
            return res.status(500).json({
                error: 'Failed to send notification',
                details: resendData
            });
        }

    } catch (err) {
        console.error('[Newsletter] Error:', err);
        return res.status(500).json({
            error: 'Failed to send newsletter notification',
            message: err instanceof Error ? err.message : 'Unknown error'
        });
    }
}

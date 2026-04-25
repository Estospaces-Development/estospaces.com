/**
 * Vercel Serverless Function to send reservation emails
 * Sends form submission data to contact@estospaces.com
 */

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

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const formData = req.body;

    // Validate required fields
    if (!formData.name || !formData.email || !formData.location || !formData.lookingFor || !formData.userType) {
      console.warn('Reservation request missing required fields');
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'email', 'location', 'lookingFor', 'userType']
      });
    }
    // Email configuration
    // Option 1: Using Resend (recommended - add to env: RESEND_API_KEY)
    // Option 2: Using SendGrid (add to env: SENDGRID_API_KEY)
    // Option 3: Using SMTP (add to env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)

    const emailService = process.env.EMAIL_SERVICE || 'resend'; // 'resend', 'sendgrid', or 'smtp'
    const recipientEmail = process.env.RESERVATION_EMAIL || 'contact@estospaces.com';

    let emailSent = false;
    let error = null;

    // Try Resend first
    if (emailService === 'resend' && process.env.RESEND_API_KEY) {
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || 'Estospaces <contact@estospaces.com>',
            to: [recipientEmail],
            subject: 'New Reserve Your Spot Lead',
            html: getEmailHTML(formData),
            text: getEmailText(formData)
          })
        });

        if (resendResponse.ok) {
          emailSent = true;
        } else {
          const errorData = await resendResponse.json();
          console.error('❌ Resend API error:', errorData);
          error = `Resend error: ${errorData.message || 'Unknown error'}`;
        }
      } catch (err) {
        console.error('❌ Resend request exception:', err);
        error = `Resend request failed: ${err.message}`;
      }
    }

    // Try SendGrid if Resend failed or not configured
    if (!emailSent && emailService === 'sendgrid' && process.env.SENDGRID_API_KEY) {
      try {
        const sendgridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`
          },
          body: JSON.stringify({
            personalizations: [{
              to: [{ email: recipientEmail }]
            }],
            from: {
              email: process.env.SENDGRID_FROM_EMAIL || 'contact@estospaces.com',
              name: 'Estospaces'
            },
            subject: 'New Reserve Your Spot Lead',
            content: [
              {
                type: 'text/plain',
                value: getEmailText(formData)
              },
              {
                type: 'text/html',
                value: getEmailHTML(formData)
              }
            ]
          })
        });

        if (sendgridResponse.ok) {
          emailSent = true;
        } else {
          const errorText = await sendgridResponse.text();
          error = `SendGrid error: ${errorText}`;
        }
      } catch (err) {
        error = `SendGrid request failed: ${err.message}`;
      }
    }

    // Fallback: Use mailto link approach (client-side will handle)
    // This is a fallback if no email service is configured
    if (!emailSent) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Reservation email provider is not configured');
      }

      // Return success but indicate email service not configured
      return res.status(200).json({
        success: true,
        message: 'Reservation received (email service not configured - check logs)',
        emailConfigured: false
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Reservation email sent successfully'
    });

  } catch (err) {
    console.error('Error sending reservation email:', err);
    return res.status(500).json({
      error: 'Failed to send reservation email',
      message: err.message
    });
  }
}

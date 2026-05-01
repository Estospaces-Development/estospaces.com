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

const jsonResponse = (request, payload, status = 200) => new Response(JSON.stringify(payload), {
  status,
  headers: {
    'Content-Type': 'application/json',
    ...corsHeaders(request),
  },
});

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
  if (!isValidEmail(formData.email)) {
    return jsonResponse(request, { error: 'Invalid email address' }, 400);
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

    return jsonResponse(request, {
      success: true,
      message: emailResult.skipped
        ? 'Reservation received (email service not configured)'
        : 'Reservation email sent successfully',
      emailConfigured: !emailResult.skipped,
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

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import crypto from 'crypto';

/**
 * Email Service using Brevo HTTP API (primary) or Nodemailer SMTP (fallback)
 *
 * Sends booking confirmation emails to customers and notifications to support team.
 * Supports both Brevo HTTP API and SMTP configuration via environment variables.
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

/**
 * Send email via Brevo HTTP API
 * This bypasses SMTP ports which may be blocked by cloud providers
 */
async function sendViaBrevoAPI(options: EmailOptions): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error('[Email] BREVO_API_KEY not configured');
    throw new Error('BREVO_API_KEY not configured');
  }

  const fromEmail = process.env.SMTP_FROM_EMAIL || 'no-reply@astralisone.com';
  const fromName = process.env.SMTP_FROM_NAME || 'Astralis One';

  console.log(`[Email] Attempting to send via Brevo API to ${options.to}`);
  console.log(`[Email] Subject: ${options.subject}`);
  console.log(`[Email] From: ${fromName} <${fromEmail}>`);
  console.log(`[Email] Attachments: ${options.attachments?.length || 0}`);

  const payload: Record<string, unknown> = {
    sender: { email: fromEmail, name: fromName },
    to: [{ email: options.to }],
    subject: options.subject,
    htmlContent: options.html,
  };

  if (options.text) {
    payload.textContent = options.text;
  }

  // Handle attachments if present
  if (options.attachments && options.attachments.length > 0) {
    payload.attachment = options.attachments.map(att => ({
      name: att.filename,
      content: Buffer.isBuffer(att.content)
        ? att.content.toString('base64')
        : Buffer.from(att.content).toString('base64'),
    }));
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error(`[Email] Brevo API error: ${response.status} - ${errorData}`);
    throw new Error(`Brevo API error: ${response.status} - ${errorData}`);
  }

  const responseData = await response.json();
  console.log(`[Email] ✅ SUCCESS - Sent via Brevo API to ${options.to} (Message ID: ${responseData.messageId || 'N/A'})`);
}

/**
 * Create nodemailer transporter (SMTP fallback)
 * Configure SMTP settings in environment variables
 */
function createTransporter(): Transporter {
  const smtpConfig = {
   host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // port 587 = STARTTLS, so false
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS,
    },
    // Add timeouts to prevent blocking when SMTP is unreachable
    connectionTimeout: 5000, // 5 seconds to establish connection
    greetingTimeout: 5000,   // 5 seconds for server greeting
    socketTimeout: 10000,    // 10 seconds for socket inactivity
  };

  return nodemailer.createTransport(smtpConfig);
}

/**
 * Send email via SMTP (fallback method)
 */
async function sendViaSMTP(options: EmailOptions): Promise<void> {
  console.log(`[Email] Attempting to send via SMTP to ${options.to}`);
  console.log(`[Email] SMTP Config - Host: ${process.env.SMTP_HOST}, Port: ${process.env.SMTP_PORT}, User: ${process.env.SMTP_USER}`);

  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'Astralis'}" <${process.env.SMTP_FROM_EMAIL || 'support@astralisone.com'}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
    attachments: options.attachments,
  };

  const result = await transporter.sendMail(mailOptions);
  console.log(`[Email] ✅ SUCCESS - Sent via SMTP to ${options.to} (Message ID: ${result.messageId})`);
}

/**
 * Send an email - tries Brevo API first, falls back to SMTP
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  console.log(`[Email] ========== EMAIL SEND START ==========`);
  console.log(`[Email] To: ${options.to}`);
  console.log(`[Email] Subject: ${options.subject}`);

  // Try Brevo API first (bypasses SMTP port blocks)
  if (process.env.BREVO_API_KEY) {
    console.log('[Email] Brevo API key found, attempting Brevo API send...');
    try {
      await sendViaBrevoAPI(options);
      console.log(`[Email] ========== EMAIL SEND COMPLETE (BREVO) ==========`);
      return;
    } catch (error) {
      console.error('[Email] ❌ FAILED - Brevo API send failed, attempting SMTP fallback...');
      console.error('[Email] Brevo error details:', error instanceof Error ? error.message : String(error));
    }
  } else {
    console.log('[Email] No Brevo API key found, using SMTP directly');
  }

  // Fall back to SMTP
  try {
    await sendViaSMTP(options);
    console.log(`[Email] ========== EMAIL SEND COMPLETE (SMTP) ==========`);
  } catch (error) {
    console.error('[Email] ❌ FAILED - SMTP send failed');
    console.error('[Email] SMTP error details:', error instanceof Error ? error.message : String(error));
    console.log(`[Email] ========== EMAIL SEND FAILED ==========`);
    throw error; // Re-throw so calling code knows it failed
  }
}

interface EmailTemplateOptions {
  preheader?: string;
  heroTitle: string;
  heroSubtitle?: string;
  introHtml?: string;
  bodyHtml: string;
  cta?: {
    label: string;
    url: string;
  };
  footerNote?: string;
}

function buildEmailTemplate({
  preheader = '',
  heroTitle,
  heroSubtitle,
  introHtml,
  bodyHtml,
  cta,
  footerNote,
}: EmailTemplateOptions): string {
  const ctaBlock = cta
    ? `<tr>
        <td align="center" style="padding: 32px 0 8px;">
          <a href="${cta.url}" target="_blank" rel="noopener noreferrer"
            style="display: inline-block; padding: 14px 28px; font-weight: 600; border-radius: 9999px; background: linear-gradient(135deg, #2B6CB0 0%, #2b8fdc 100%); color: #ffffff; text-decoration: none;">
            ${cta.label}
          </a>
        </td>
      </tr>`
    : '';

  const footer = footerNote
    ? `<tr>
        <td style="padding: 24px 0 0; font-size: 12px; line-height: 1.6; color: #94a3b8; text-align: center;">
          ${footerNote}
        </td>
      </tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${heroTitle}</title>
  <style>
    @media (max-width: 600px) {
      .container { width: 100% !important; margin: 0 !important; border-radius: 0 !important; }
      .content { padding: 24px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#0a1829; font-family:'Inter', Arial, sans-serif;">
  <span style="display:none; color:transparent; visibility:hidden; opacity:0; height:0; width:0;">${preheader}</span>
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding: 48px 16px;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" class="container" role="presentation" style="width:640px; max-width:640px; background-color:#ffffff; border-radius:28px; overflow:hidden; box-shadow:0 30px 90px rgba(3,15,35,0.35);">
          <tr>
            <td style="background: radial-gradient(circle at top, rgba(43,108,176,0.65), rgba(10,27,43,0.95)); padding: 40px 32px; text-align:center;">
              <div style="display:inline-flex; align-items:center; gap:12px; padding:6px 16px; border-radius:9999px; background: rgba(255,255,255,0.12); color:#ffffff; font-size:12px; font-weight:600; letter-spacing:0.2em; text-transform:uppercase;">
                Astralis One
              </div>
              <h1 style="margin:24px 0 12px; font-size:32px; line-height:1.25; color:#ffffff;">${heroTitle}</h1>
              ${heroSubtitle ? `<p style="margin:0; font-size:16px; color:#dbeafe; line-height:1.7;">${heroSubtitle}</p>` : ''}
            </td>
          </tr>
          <tr>
            <td class="content" style="padding:32px 40px 40px; background-color:#ffffff;">
              ${introHtml ? `<div style="font-size:16px; color:#334155; line-height:1.7; margin-bottom:24px;">${introHtml}</div>` : ''}
              <div style="font-size:15px; color:#1e293b; line-height:1.75;">${bodyHtml}</div>
            </td>
          </tr>
          ${ctaBlock}
          <tr>
            <td style="padding: 16px 40px 32px; background-color:#f8fafc; border-top:1px solid #e2e8f0;">
              <p style="margin:0; font-size:13px; color:#475569; line-height:1.6; text-align:center;">
                Astralis Operations Platform<br/>
                <a href="mailto:support@astralisone.com" style="color:#2B6CB0; text-decoration:none;">support@astralisone.com</a> ·
                <a href="tel:+13412234433" style="color:#2B6CB0; text-decoration:none;">+1 (341) 223-4433</a>
              </p>
            </td>
          </tr>
          ${footer}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Generate HTML email for customer booking confirmation
 */
export function generateCustomerConfirmationEmail(booking: {
  bookingId: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  date: string;
  time: string;
  meetingType: string;
  message?: string;
}): string {
  const meetingTypeLabel = {
    VIDEO_CALL: 'Video Call',
    PHONE_CALL: 'Phone Call',
    IN_PERSON: 'In-Person Meeting',
  }[booking.meetingType] || booking.meetingType;

  const detailsTable = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 12px 0 24px; background-color:#f8fafc; border-radius:16px;">
      <tbody>
        <tr>
          <td style="padding:22px 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tbody>
                <tr>
                  <td style="padding:6px 0; color:#64748b; font-size:13px; text-transform:uppercase; letter-spacing:0.08em;">Booking ID</td>
                  <td style="padding:6px 0; color:#1e293b; font-size:14px; font-weight:600; text-align:right;">${booking.bookingId}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#64748b; font-size:13px; text-transform:uppercase; letter-spacing:0.08em;">Date</td>
                  <td style="padding:6px 0; color:#1e293b; font-size:14px; font-weight:600; text-align:right;">${booking.date}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#64748b; font-size:13px; text-transform:uppercase; letter-spacing:0.08em;">Time</td>
                  <td style="padding:6px 0; color:#1e293b; font-size:14px; font-weight:600; text-align:right;">${booking.time}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#64748b; font-size:13px; text-transform:uppercase; letter-spacing:0.08em;">Meeting type</td>
                  <td style="padding:6px 0; color:#1e293b; font-size:14px; font-weight:600; text-align:right;">${meetingTypeLabel}</td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>`;

  const preparationList = `
    <div style="padding: 18px 24px; border-radius: 16px; background-color: #eff6ff;">
      <p style="margin:0 0 12px; font-size:14px; font-weight:600; color:#0f172a;">Before we meet</p>
      <ul style="margin:0; padding:0 0 0 18px; color:#1e293b; font-size:14px; line-height:1.8;">
        <li>Review the attached calendar invite and add it to your schedule.</li>
        ${booking.meetingType === 'VIDEO_CALL' ? '<li>We\'ll email a secure video link 1 hour before the session.</li>' : ''}
        ${booking.meetingType === 'PHONE_CALL' ? `<li>We&#39;ll call you at <strong>${booking.phone}</strong> at the scheduled time.</li>` : ''}
        <li>Bring any questions or workflows you want us to examine.</li>
      </ul>
    </div>`;

  const supportBlock = `
    <div style="margin-top:28px; padding: 18px 24px; border-radius: 16px; background-color:#fef9c3; border:1px solid #fde68a; color:#854d0e; font-size:13px; line-height:1.7;">
      <strong>Need to make a change?</strong><br/>
      Reply to this email, or contact <a href="mailto:support@astralisone.com" style="color:#b45309; text-decoration:none;">support@astralisone.com</a> ·
      <a href="tel:+13412234433" style="color:#b45309; text-decoration:none;">+1 (341) 223-4433</a>
    </div>`;

  const introHtml = `Hi <strong>${booking.name}</strong>,<br/><br/>Thanks for scheduling time with Astralis. We&apos;re ready to dive into your automation roadmap and identify the fastest wins for your team.`;

  const bodyHtml = `${detailsTable}${preparationList}${supportBlock}`;

  return buildEmailTemplate({
    preheader: 'Your Astralis consultation is confirmed.',
    heroTitle: 'Your consultation is booked',
    heroSubtitle: `${booking.date} · ${booking.time} (${meetingTypeLabel})`,
    introHtml,
    bodyHtml,
    footerNote: 'You are receiving this email because you requested a consultation with Astralis. If this wasn’t you, please ignore this message or contact support.'
  });
}

/**
 * Generate plain text version of customer confirmation email
 */
export function generateCustomerConfirmationText(booking: {
  bookingId: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  date: string;
  time: string;
  meetingType: string;
  message?: string;
}): string {
  const meetingTypeLabel = {
    VIDEO_CALL: 'Video Call',
    PHONE_CALL: 'Phone Call',
    IN_PERSON: 'In-Person Meeting',
  }[booking.meetingType] || booking.meetingType;

  const lines = [
    'ASTRALIS CONSULTATION CONFIRMED',
    '',
    `Hi ${booking.name},`,
    '',
    `Your consultation is scheduled for ${booking.date} at ${booking.time} (${meetingTypeLabel}).`,
    '',
    `Booking ID: ${booking.bookingId}`,
    '',
    'NEXT STEPS',
    '- Calendar invite attached for quick add to your schedule',
  ];

  if (booking.meetingType === 'VIDEO_CALL') {
    lines.push('- A secure video link will arrive 1 hour before we meet');
  }

  if (booking.meetingType === 'PHONE_CALL') {
    lines.push(`- We will call you at ${booking.phone} at the scheduled time`);
  }

  lines.push('- Bring any workflows or questions you would like to review together');
  lines.push('', 'NEED TO RESCHEDULE?', 'Email support@astralisone.com or call +1 (341) 223-4433.', '', 'Looking forward to collaborating,', 'The Astralis Team');

  return lines.join('\n');
}

/**
 * Scheduling booking details interface
 */
interface SchedulingBookingDetails {
  eventId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  timezone: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  meetingType: string;
  hostName: string;
  hostEmail: string;
}

/**
 * Generate HTML email for scheduling confirmation (public booking)
 */
export function generateSchedulingConfirmationEmail(
  booking: SchedulingBookingDetails,
  isHost: boolean
): string {
  const meetingTypeLabel = {
    VIDEO_CALL: 'Video Call',
    PHONE_CALL: 'Phone Call',
    IN_PERSON: 'In-Person Meeting',
  }[booking.meetingType] || booking.meetingType;

  const dateStr = booking.startTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: booking.timezone,
  });

  const startTime = booking.startTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: booking.timezone,
  });

  const endTime = booking.endTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: booking.timezone,
  });

  const recipientName = isHost ? booking.hostName : booking.guestName;
  const counterpartyName = isHost ? booking.guestName : booking.hostName;
  const counterpartLabel = isHost ? 'Guest' : 'Host';

  const introHtml = isHost
    ? `Hi <strong>${recipientName}</strong>,<br/><br/>Your meeting with ${counterpartyName} is confirmed. Everything is set for ${dateStr}.`
    : `Hi <strong>${recipientName}</strong>,<br/><br/>Your meeting with ${counterpartyName} is booked. We&apos;ll be ready for you on ${dateStr}.`;

  const detailsTable = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 12px 0 24px; background-color:#f8fafc; border-radius:16px;">
      <tbody>
        <tr>
          <td style="padding:22px 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tbody>
                <tr>
                  <td style="padding:6px 0; color:#64748b; font-size:13px; text-transform:uppercase; letter-spacing:0.08em;">Title</td>
                  <td style="padding:6px 0; color:#1e293b; font-size:14px; font-weight:600; text-align:right;">${booking.title}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#64748b; font-size:13px; text-transform:uppercase; letter-spacing:0.08em;">Date</td>
                  <td style="padding:6px 0; color:#1e293b; font-size:14px; font-weight:600; text-align:right;">${dateStr}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#64748b; font-size:13px; text-transform:uppercase; letter-spacing:0.08em;">Time</td>
                  <td style="padding:6px 0; color:#1e293b; font-size:14px; font-weight:600; text-align:right;">${startTime} – ${endTime}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#64748b; font-size:13px; text-transform:uppercase; letter-spacing:0.08em;">Timezone</td>
                  <td style="padding:6px 0; color:#1e293b; font-size:14px; font-weight:600; text-align:right;">${booking.timezone}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#64748b; font-size:13px; text-transform:uppercase; letter-spacing:0.08em;">Meeting type</td>
                  <td style="padding:6px 0; color:#1e293b; font-size:14px; font-weight:600; text-align:right;">${meetingTypeLabel}</td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>`;

  const participantsBlock = `
    <div style="padding: 18px 22px; border-radius: 16px; background-color:#eef2ff; display:flex; justify-content:space-between; font-size:13px; color:#312e81;">
      <span style="font-weight:600;">${counterpartLabel}</span>
      <span style="font-weight:600;">${counterpartyName} · ${isHost ? booking.guestEmail : booking.hostEmail}</span>
    </div>`;

  const supportBlock = `
    <div style="margin-top:28px; padding: 18px 24px; border-radius: 16px; background-color:#f1f5f9; font-size:13px; color:#475569; line-height:1.7;">
      Need to adjust anything? Reply to this email or contact <a href="mailto:support@astralisone.com" style="color:#2B6CB0; text-decoration:none;">support@astralisone.com</a>.
    </div>`;

  const bodyHtml = `${detailsTable}${participantsBlock}${supportBlock}`;

  return buildEmailTemplate({
    preheader: `Meeting confirmed with ${counterpartyName} on ${dateStr}.`,
    heroTitle: `Meeting confirmed with ${counterpartyName}`,
    heroSubtitle: `${dateStr} · ${startTime} ${booking.timezone}`,
    introHtml,
    bodyHtml,
    footerNote: 'This scheduling update was generated by Astralis. If something looks off, please contact the meeting organizer.'
  });
}

/**
 * Generate plain text email for scheduling confirmation (public booking)
 */
export function generateSchedulingConfirmationText(
  booking: SchedulingBookingDetails,
  isHost: boolean
): string {
  const meetingTypeLabel = {
    VIDEO_CALL: 'Video Call',
    PHONE_CALL: 'Phone Call',
    IN_PERSON: 'In-Person Meeting',
  }[booking.meetingType] || booking.meetingType;

  const dateStr = booking.startTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: booking.timezone,
  });

  const startTime = booking.startTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: booking.timezone,
  });

  const endTime = booking.endTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: booking.timezone,
  });

  const recipientName = isHost ? booking.hostName : booking.guestName;
  const counterpartyName = isHost ? booking.guestName : booking.hostName;
  const counterpartLabel = isHost ? 'Guest' : 'Host';

  const lines = [
    'ASTRALIS MEETING CONFIRMED',
    '',
    `Hi ${recipientName},`,
    '',
    `Your meeting with ${counterpartyName} is scheduled for ${dateStr} from ${startTime} to ${endTime} (${booking.timezone}).`,
    '',
    `Title: ${booking.title}`,
    `Meeting type: ${meetingTypeLabel}`,
    `${counterpartLabel}: ${counterpartyName} · ${isHost ? booking.guestEmail : booking.hostEmail}`,
    '',
    'Need to adjust anything? Reply to this email or contact support@astralisone.com.',
    '',
    'The Astralis Team',
  ];

  return lines.join('\n');
}


/**
 * Generate HTML email for host notification (new booking received)
 */
export function generateHostNotificationEmail(booking: SchedulingBookingDetails): string {
  const meetingTypeLabel = {
    VIDEO_CALL: 'Video Call',
    PHONE_CALL: 'Phone Call',
    IN_PERSON: 'In-Person Meeting',
  }[booking.meetingType] || booking.meetingType;

  const dateStr = booking.startTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: booking.timezone,
  });

  const timeStr = booking.startTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: booking.timezone,
  });

  const endTimeStr = booking.endTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: booking.timezone,
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Booking Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">New Booking Received</h1>
              <p style="margin: 10px 0 0 0; color: #dbeafe; font-size: 14px;">Event ID: ${booking.eventId}</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 20px; color: #0A1B2B; font-size: 20px;">Guest Information</h2>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 14px; font-weight: 600; width: 40%;">Name:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">${booking.guestName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 14px; font-weight: 600;">Email:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">
                          <a href="mailto:${booking.guestEmail}" style="color: #3b82f6; text-decoration: none;">${booking.guestEmail}</a>
                        </td>
                      </tr>
                      ${booking.guestPhone ? `
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 14px; font-weight: 600;">Phone:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">
                          <a href="tel:${booking.guestPhone}" style="color: #3b82f6; text-decoration: none;">${booking.guestPhone}</a>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <h2 style="margin: 30px 0 20px; color: #0A1B2B; font-size: 20px;">Meeting Details</h2>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f9ff; border-radius: 8px; border: 2px solid #3b82f6; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 6px 0; color: #1e40af; font-size: 14px; font-weight: 600; width: 40%;">Title:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px; font-weight: bold;">${booking.title}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #1e40af; font-size: 14px; font-weight: 600;">Date:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px; font-weight: bold;">${dateStr}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #1e40af; font-size: 14px; font-weight: 600;">Time:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px; font-weight: bold;">${timeStr} - ${endTimeStr}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #1e40af; font-size: 14px; font-weight: 600;">Timezone:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">${booking.timezone}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #1e40af; font-size: 14px; font-weight: 600;">Meeting Type:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">${meetingTypeLabel}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 12px;">
                This is an automated notification from the Astralis booking system.
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
}

/**
 * Team invite email options interface
 */
export interface TeamInviteEmailOptions {
  inviteeEmail: string;
  inviterName: string;
  organizationName: string;
  role: string;
  inviteToken: string;
}

/**
 * Generate HTML email for team member invitation
 */
export function generateTeamInviteEmail(options: TeamInviteEmailOptions): string {
  const { inviteeEmail, inviterName, organizationName, role, inviteToken } = options;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
  const acceptUrl = `${baseUrl}/auth/accept-invite?token=${inviteToken}`;

  const roleLabel = {
    ADMIN: 'Administrator',
    OPERATOR: 'Operator',
    CLIENT: 'Client',
  }[role] || role;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited to Join ${organizationName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0A1B2B 0%, #1a3a52 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">ASTRALIS</h1>
              <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 16px;">You've been invited to join a team!</p>
            </td>
          </tr>

          <!-- Envelope Icon -->
          <tr>
            <td style="padding: 40px 30px 20px; text-align: center;">
              <div style="width: 60px; height: 60px; background-color: #2B6CB0; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 28px;">&#9993;</span>
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h2 style="margin: 0 0 20px; color: #0A1B2B; font-size: 22px; text-align: center;">Hello!</h2>
              <p style="margin: 0 0 20px; color: #475569; font-size: 16px; line-height: 1.6; text-align: center;">
                <strong style="color: #0A1B2B;">${inviterName}</strong> has invited you to join
                <strong style="color: #0A1B2B;">${organizationName}</strong> on Astralis.
              </p>

              <!-- Invitation Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 25px;">
                    <h3 style="margin: 0 0 15px; color: #0A1B2B; font-size: 18px;">Invitation Details</h3>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Organization:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${organizationName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Your Role:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${roleLabel}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Invited By:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${inviterName}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Accept Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${acceptUrl}" style="display: inline-block; background: linear-gradient(135deg, #2B6CB0 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Link fallback -->
              <p style="margin: 20px 0; color: #64748b; font-size: 13px; text-align: center; line-height: 1.6;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${acceptUrl}" style="color: #2B6CB0; word-break: break-all;">${acceptUrl}</a>
              </p>

              <!-- Expiration notice -->
              <div style="margin: 30px 0; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                  <strong>Note:</strong> This invitation will expire in 7 days. If you don't recognize this invitation or didn't expect it, you can safely ignore this email.
                </p>
              </div>

              <p style="margin: 30px 0 0; color: #475569; font-size: 15px; line-height: 1.6;">
                We're excited to have you join the team!
              </p>
              <p style="margin: 10px 0 0; color: #475569; font-size: 15px; line-height: 1.6;">
                Best regards,<br>
                <strong style="color: #0A1B2B;">The Astralis Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px; color: #64748b; font-size: 14px;">
                <strong>ASTRALIS</strong>
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                <a href="mailto:support@astralisone.com" style="color: #3b82f6; text-decoration: none;">support@astralisone.com</a> |
                <a href="tel:+13412234433" style="color: #3b82f6; text-decoration: none;">+1 (341) 223-4433</a>
              </p>
              <p style="margin: 15px 0 0 0; color: #94a3b8; font-size: 11px;">
                You're receiving this email because ${inviterName} invited ${inviteeEmail} to join ${organizationName}.
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
}

/**
 * Generate plain text version of team invite email
 */
export function generateTeamInviteText(options: TeamInviteEmailOptions): string {
  const { inviteeEmail, inviterName, organizationName, role, inviteToken } = options;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
  const acceptUrl = `${baseUrl}/auth/accept-invite?token=${inviteToken}`;

  const roleLabel = {
    ADMIN: 'Administrator',
    OPERATOR: 'Operator',
    CLIENT: 'Client',
  }[role] || role;

  return `
ASTRALIS - You've been invited to join a team!

Hello!

${inviterName} has invited you to join ${organizationName} on Astralis.

INVITATION DETAILS
------------------
Organization: ${organizationName}
Your Role: ${roleLabel}
Invited By: ${inviterName}

ACCEPT YOUR INVITATION
----------------------
Click the link below or copy and paste it into your browser:
${acceptUrl}

IMPORTANT
---------
This invitation will expire in 7 days. If you don't recognize this invitation or didn't expect it, you can safely ignore this email.

We're excited to have you join the team!

Best regards,
The Astralis Team

---
ASTRALIS
support@astralisone.com | +1 (341) 223-4433

You're receiving this email because ${inviterName} invited ${inviteeEmail} to join ${organizationName}.
  `.trim();
}

/**
 * Send team invitation email
 * Returns true if sent successfully, false if failed (but logs the error)
 */
export async function sendTeamInviteEmail(options: TeamInviteEmailOptions): Promise<boolean> {
  try {
    const html = generateTeamInviteEmail(options);
    const text = generateTeamInviteText(options);

    await sendEmail({
      to: options.inviteeEmail,
      subject: `You've been invited to join ${options.organizationName} on Astralis`,
      html,
      text,
    });

    console.log(`[Email] Team invite sent successfully to ${options.inviteeEmail}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send team invite to ${options.inviteeEmail}:`, error);
    return false;
  }
}

/**
 * Generate a secure invite token
 */
export function generateInviteToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Scheduling Agent Email Options
 */
export interface SchedulingAgentEmailOptions {
  recipientEmail: string;
  recipientName: string;
  taskId: string;
  responseType: 'confirmation' | 'alternatives' | 'clarification' | 'cancellation';
  meetingDetails?: {
    title: string;
    startTime: Date;
    endTime: Date;
    timezone: string;
    location?: string;
    participants?: string[];
  };
  alternativeSlots?: Array<{
    startTime: string;
    endTime: string;
    confidence?: number;
  }>;
  clarificationNeeded?: string;
  cancellationReason?: string;
}

/**
 * Generate HTML email for scheduling agent confirmation
 */
export function generateSchedulingAgentConfirmationEmail(options: SchedulingAgentEmailOptions): string {
  const { recipientName, meetingDetails } = options;

  if (!meetingDetails) {
    throw new Error('Meeting details required for confirmation email');
  }

  const dateStr = meetingDetails.startTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: meetingDetails.timezone,
  });

  const startTime = meetingDetails.startTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: meetingDetails.timezone,
  });

  const endTime = meetingDetails.endTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: meetingDetails.timezone,
  });

  const detailsTable = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 12px 0 24px; background-color:#f8fafc; border-radius:16px;">
      <tbody>
        <tr>
          <td style="padding:22px 24px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tbody>
                <tr>
                  <td style="padding:6px 0; color:#64748b; font-size:13px; text-transform:uppercase; letter-spacing:0.08em;">Title</td>
                  <td style="padding:6px 0; color:#1e293b; font-size:14px; font-weight:600; text-align:right;">${meetingDetails.title}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#64748b; font-size:13px; text-transform:uppercase; letter-spacing:0.08em;">Date</td>
                  <td style="padding:6px 0; color:#1e293b; font-size:14px; font-weight:600; text-align:right;">${dateStr}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#64748b; font-size:13px; text-transform:uppercase; letter-spacing:0.08em;">Time</td>
                  <td style="padding:6px 0; color:#1e293b; font-size:14px; font-weight:600; text-align:right;">${startTime} – ${endTime}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; color:#64748b; font-size:13px; text-transform:uppercase; letter-spacing:0.08em;">Timezone</td>
                  <td style="padding:6px 0; color:#1e293b; font-size:14px; font-weight:600; text-align:right;">${meetingDetails.timezone}</td>
                </tr>
                ${meetingDetails.location ? `
                <tr>
                  <td style="padding:6px 0; color:#64748b; font-size:13px; text-transform:uppercase; letter-spacing:0.08em;">Location</td>
                  <td style="padding:6px 0; color:#1e293b; font-size:14px; font-weight:600; text-align:right;">${meetingDetails.location}</td>
                </tr>
                ` : ''}
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>`;

  const introHtml = `Hi <strong>${recipientName}</strong>,<br/><br/>Great news! Your meeting has been successfully scheduled.`;

  const bodyHtml = `${detailsTable}
    <div style="padding: 18px 24px; border-radius: 16px; background-color: #f0fdf4; border-left: 4px solid #22c55e;">
      <p style="margin:0; font-size:14px; color:#166534; line-height:1.7;">
        Your scheduling request has been confirmed. You should receive a calendar invite shortly.
      </p>
    </div>`;

  return buildEmailTemplate({
    preheader: 'Your meeting has been scheduled successfully.',
    heroTitle: 'Meeting Scheduled',
    heroSubtitle: `${dateStr} · ${startTime} ${meetingDetails.timezone}`,
    introHtml,
    bodyHtml,
    footerNote: 'This is an automated confirmation from the Astralis scheduling system.'
  });
}

/**
 * Generate HTML email for scheduling agent alternatives
 */
export function generateSchedulingAgentAlternativesEmail(options: SchedulingAgentEmailOptions): string {
  const { recipientName, alternativeSlots, meetingDetails } = options;

  if (!alternativeSlots || alternativeSlots.length === 0) {
    throw new Error('Alternative slots required for alternatives email');
  }

  const slotsHtml = alternativeSlots.slice(0, 5).map((slot, index) => {
    const start = new Date(slot.startTime);
    const end = new Date(slot.endTime);
    const timezone = meetingDetails?.timezone || 'UTC';

    const dateStr = start.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      timeZone: timezone,
    });

    const timeStr = `${start.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timezone,
    })} - ${end.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timezone,
    })}`;

    return `
      <tr>
        <td style="padding: 12px 20px; border-bottom: 1px solid #e2e8f0;">
          <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">Option ${index + 1}</div>
          <div style="font-size: 14px; color: #64748b;">${dateStr}</div>
          <div style="font-size: 14px; color: #2B6CB0; font-weight: 600; margin-top: 4px;">${timeStr}</div>
        </td>
      </tr>`;
  }).join('');

  const introHtml = `Hi <strong>${recipientName}</strong>,<br/><br/>We found a scheduling conflict with your requested time. Here are some alternative times that work for all participants:`;

  const bodyHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 12px 0 24px; background-color:#f8fafc; border-radius:16px; overflow: hidden;">
      <tbody>
        ${slotsHtml}
      </tbody>
    </table>
    <div style="padding: 18px 24px; border-radius: 16px; background-color: #fef3c7; border-left: 4px solid #f59e0b;">
      <p style="margin:0; font-size:14px; color: #92400e; line-height:1.7;">
        <strong>Action needed:</strong> Please reply to this email with your preferred time slot, or contact us to discuss other options.
      </p>
    </div>`;

  return buildEmailTemplate({
    preheader: 'Alternative meeting times available.',
    heroTitle: 'Alternative Times Available',
    heroSubtitle: meetingDetails?.title || 'Your Meeting',
    introHtml,
    bodyHtml,
    footerNote: 'Reply to this email to select your preferred time slot.'
  });
}

/**
 * Generate HTML email for scheduling agent clarification request
 */
export function generateSchedulingAgentClarificationEmail(options: SchedulingAgentEmailOptions): string {
  const { recipientName, clarificationNeeded, meetingDetails } = options;

  const introHtml = `Hi <strong>${recipientName}</strong>,<br/><br/>We need a bit more information to schedule your meeting.`;

  const clarificationText = clarificationNeeded ||
    'We need more details about your meeting request. Please provide the date, time, and any other relevant information.';

  const bodyHtml = `
    <div style="padding: 20px 24px; border-radius: 16px; background-color: #eff6ff; border-left: 4px solid #2B6CB0; margin: 12px 0 24px;">
      <p style="margin:0; font-size:14px; color: #1e40af; line-height:1.7; white-space: pre-wrap;">${clarificationText}</p>
    </div>
    ${meetingDetails ? `
    <div style="margin-top: 20px;">
      <p style="font-size:14px; color:#64748b; margin-bottom: 8px;">What we have so far:</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc; border-radius:12px; padding: 16px;">
        <tbody>
          ${meetingDetails.title ? `<tr><td style="padding:4px 0; color:#475569; font-size:13px;"><strong>Title:</strong> ${meetingDetails.title}</td></tr>` : ''}
          ${meetingDetails.location ? `<tr><td style="padding:4px 0; color:#475569; font-size:13px;"><strong>Location:</strong> ${meetingDetails.location}</td></tr>` : ''}
        </tbody>
      </table>
    </div>
    ` : ''}
    <div style="margin-top: 24px; padding: 18px 24px; border-radius: 16px; background-color: #f0fdf4;">
      <p style="margin:0; font-size:14px; color:#166534; line-height:1.7;">
        Simply reply to this email with the missing information and we'll get your meeting scheduled right away.
      </p>
    </div>`;

  return buildEmailTemplate({
    preheader: 'We need more information to schedule your meeting.',
    heroTitle: 'More Information Needed',
    heroSubtitle: meetingDetails?.title || 'Your Meeting Request',
    introHtml,
    bodyHtml,
    footerNote: 'Reply to this email with the requested information.'
  });
}

/**
 * Generate HTML email for scheduling agent cancellation
 */
export function generateSchedulingAgentCancellationEmail(options: SchedulingAgentEmailOptions): string {
  const { recipientName, cancellationReason, meetingDetails } = options;

  const introHtml = `Hi <strong>${recipientName}</strong>,<br/><br/>Your meeting has been cancelled as requested.`;

  const detailsHtml = meetingDetails ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 12px 0 24px; background-color:#fef2f2; border-radius:16px; border: 2px solid #fecaca;">
      <tbody>
        <tr>
          <td style="padding:22px 24px;">
            <div style="font-size:14px; color:#991b1b; margin-bottom: 12px;"><strong>Cancelled Meeting:</strong></div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tbody>
                <tr>
                  <td style="padding:4px 0; color:#7f1d1d; font-size:13px;">${meetingDetails.title}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0; color:#991b1b; font-size:13px;">
                    ${meetingDetails.startTime.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      timeZone: meetingDetails.timezone,
                    })} at ${meetingDetails.startTime.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      timeZone: meetingDetails.timezone,
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>` : '';

  const reasonHtml = cancellationReason ? `
    <div style="padding: 18px 24px; border-radius: 16px; background-color: #f8fafc; margin-bottom: 24px;">
      <p style="margin:0; font-size:14px; color:#475569; line-height:1.7;">
        <strong>Reason:</strong> ${cancellationReason}
      </p>
    </div>` : '';

  const bodyHtml = `${detailsHtml}${reasonHtml}
    <div style="padding: 18px 24px; border-radius: 16px; background-color: #eff6ff;">
      <p style="margin:0; font-size:14px; color:#1e40af; line-height:1.7;">
        Need to reschedule? Just reply to this email and we'll help you find a new time.
      </p>
    </div>`;

  return buildEmailTemplate({
    preheader: 'Your meeting has been cancelled.',
    heroTitle: 'Meeting Cancelled',
    heroSubtitle: meetingDetails?.title || 'Meeting Cancellation',
    introHtml,
    bodyHtml,
    footerNote: 'Reply to this email if you need assistance.'
  });
}

/**
 * Generate plain text versions for scheduling agent emails
 */
export function generateSchedulingAgentEmailText(options: SchedulingAgentEmailOptions): string {
  const { recipientName, responseType, meetingDetails, alternativeSlots, clarificationNeeded, cancellationReason } = options;

  const lines: string[] = [
    'ASTRALIS SCHEDULING ASSISTANT',
    '',
    `Hi ${recipientName},`,
    '',
  ];

  switch (responseType) {
    case 'confirmation':
      if (meetingDetails) {
        const dateStr = meetingDetails.startTime.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: meetingDetails.timezone,
        });
        const timeStr = meetingDetails.startTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          timeZone: meetingDetails.timezone,
        });
        const endTimeStr = meetingDetails.endTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          timeZone: meetingDetails.timezone,
        });

        lines.push(
          'Your meeting has been successfully scheduled!',
          '',
          'MEETING DETAILS',
          `Title: ${meetingDetails.title}`,
          `Date: ${dateStr}`,
          `Time: ${timeStr} - ${endTimeStr} (${meetingDetails.timezone})`,
        );
        if (meetingDetails.location) {
          lines.push(`Location: ${meetingDetails.location}`);
        }
        lines.push('', 'You should receive a calendar invite shortly.');
      }
      break;

    case 'alternatives':
      lines.push(
        'We found a scheduling conflict. Here are alternative times:',
        '',
      );
      if (alternativeSlots) {
        alternativeSlots.slice(0, 5).forEach((slot, index) => {
          const start = new Date(slot.startTime);
          const end = new Date(slot.endTime);
          const timezone = meetingDetails?.timezone || 'UTC';
          const dateStr = start.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            timeZone: timezone,
          });
          const timeStr = `${start.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            timeZone: timezone,
          })} - ${end.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            timeZone: timezone,
          })}`;
          lines.push(`Option ${index + 1}: ${dateStr}, ${timeStr}`);
        });
      }
      lines.push('', 'Reply with your preferred time slot.');
      break;

    case 'clarification':
      lines.push(
        'We need more information to schedule your meeting.',
        '',
        clarificationNeeded || 'Please provide the date, time, and any other relevant information.',
        '',
        'Reply to this email with the missing details.',
      );
      break;

    case 'cancellation':
      lines.push('Your meeting has been cancelled as requested.');
      if (meetingDetails) {
        const dateStr = meetingDetails.startTime.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: meetingDetails.timezone,
        });
        const timeStr = meetingDetails.startTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          timeZone: meetingDetails.timezone,
        });
        lines.push('', `Cancelled: ${meetingDetails.title}`, `${dateStr} at ${timeStr}`);
      }
      if (cancellationReason) {
        lines.push('', `Reason: ${cancellationReason}`);
      }
      lines.push('', 'Need to reschedule? Just reply to this email.');
      break;
  }

  lines.push('', 'Best regards,', 'The Astralis Scheduling Team');

  return lines.join('\n');
}

/**
 * Send scheduling agent email
 */
export async function sendSchedulingAgentEmail(options: SchedulingAgentEmailOptions): Promise<void> {
  let html: string;
  let subject: string;

  switch (options.responseType) {
    case 'confirmation':
      html = generateSchedulingAgentConfirmationEmail(options);
      subject = 'Meeting Scheduled Successfully';
      break;
    case 'alternatives':
      html = generateSchedulingAgentAlternativesEmail(options);
      subject = 'Alternative Meeting Times Available';
      break;
    case 'clarification':
      html = generateSchedulingAgentClarificationEmail(options);
      subject = 'More Information Needed for Your Meeting';
      break;
    case 'cancellation':
      html = generateSchedulingAgentCancellationEmail(options);
      subject = 'Meeting Cancelled';
      break;
    default:
      throw new Error(`Unknown response type: ${options.responseType}`);
  }

  const text = generateSchedulingAgentEmailText(options);

  await sendEmail({
    to: options.recipientEmail,
    subject,
    html,
    text,
  });

  console.log(`[Email] Scheduling agent ${options.responseType} email sent to ${options.recipientEmail}`);
}

export function generateInternalNotificationEmail(booking: {
  bookingId: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  date: string;
  time: string;
  meetingType: string;
  message?: string;
}): string {
  const meetingTypeLabel = {
    VIDEO_CALL: 'Video Call',
    PHONE_CALL: 'Phone Call',
    IN_PERSON: 'In-Person Meeting',
  }[booking.meetingType] || booking.meetingType;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Booking Received</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">🔔 New Consultation Booking</h1>
              <p style="margin: 10px 0 0 0; color: #dbeafe; font-size: 14px;">Booking ID: ${booking.bookingId}</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 20px; color: #0A1B2B; font-size: 20px;">Client Information</h2>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 14px; font-weight: 600; width: 40%;">Name:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">${booking.name}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 14px; font-weight: 600;">Email:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">
                          <a href="mailto:${booking.email}" style="color: #3b82f6; text-decoration: none;">${booking.email}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 14px; font-weight: 600;">Phone:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">
                          <a href="tel:${booking.phone}" style="color: #3b82f6; text-decoration: none;">${booking.phone}</a>
                        </td>
                      </tr>
                      ${booking.company ? `
                      <tr>
                        <td style="padding: 6px 0; color: #64748b; font-size: 14px; font-weight: 600;">Company:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">${booking.company}</td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <h2 style="margin: 30px 0 20px; color: #0A1B2B; font-size: 20px;">Meeting Details</h2>

              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0f9ff; border-radius: 8px; border: 2px solid #3b82f6; margin-bottom: 20px;">
                <tr>
                  <td style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 6px 0; color: #1e40af; font-size: 14px; font-weight: 600; width: 40%;">Date:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px; font-weight: bold;">${booking.date}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #1e40af; font-size: 14px; font-weight: 600;">Time:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px; font-weight: bold;">${booking.time}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #1e40af; font-size: 14px; font-weight: 600;">Duration:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">30 minutes</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: #1e40af; font-size: 14px; font-weight: 600;">Meeting Type:</td>
                        <td style="padding: 6px 0; color: #1e293b; font-size: 14px;">${meetingTypeLabel}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${booking.message ? `
              <h2 style="margin: 30px 0 15px; color: #0A1B2B; font-size: 20px;">Discussion Topics</h2>
              <div style="background-color: #fefce8; border-left: 4px solid #eab308; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
                <p style="margin: 0; color: #713f12; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${booking.message}</p>
              </div>
              ` : ''}

              <!-- Action Items -->
              <div style="margin: 30px 0; padding: 20px; background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
                <h3 style="margin: 0 0 10px; color: #166534; font-size: 16px;">Action Required</h3>
                <ul style="margin: 0; padding: 0 0 0 20px; color: #166534; font-size: 14px; line-height: 1.8;">
                  <li>Add this consultation to your calendar (ICS file attached)</li>
                  <li>Review client information and discussion topics</li>
                  ${booking.meetingType === 'VIDEO_CALL' ? '<li>Prepare video call link and send 1 hour before meeting</li>' : ''}
                  ${booking.meetingType === 'PHONE_CALL' ? '<li>Ensure you have the client\'s phone number ready</li>' : ''}
                  <li>Prepare any relevant materials or questions</li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 12px;">
                This is an automated notification from the Astralis booking system.
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
}

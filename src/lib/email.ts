import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

/**
 * Email Service using Nodemailer
 *
 * Sends booking confirmation emails to customers and notifications to support team.
 * Supports SMTP configuration via environment variables.
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
 * Create nodemailer transporter
 * Configure SMTP settings in environment variables
 */
function createTransporter(): Transporter {
  const smtpConfig = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  };

  return nodemailer.createTransport(smtpConfig);
}

/**
 * Send an email
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'Astralis'}" <${process.env.SMTP_FROM_EMAIL || 'support@astralisone.com'}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
    attachments: options.attachments,
  };

  await transporter.sendMail(mailOptions);
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

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
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
              <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 16px;">Your consultation is confirmed!</p>
            </td>
          </tr>

          <!-- Success Icon -->
          <tr>
            <td style="padding: 40px 30px 20px; text-align: center;">
              <div style="width: 60px; height: 60px; background-color: #22c55e; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 30px;">✓</span>
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h2 style="margin: 0 0 20px; color: #0A1B2B; font-size: 22px; text-align: center;">Hi ${booking.name},</h2>
              <p style="margin: 0 0 20px; color: #475569; font-size: 16px; line-height: 1.6;">
                Thank you for scheduling a consultation with us! We're excited to discuss your automation needs and explore how Astralis can help transform your operations.
              </p>

              <!-- Booking Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 25px;">
                    <h3 style="margin: 0 0 15px; color: #0A1B2B; font-size: 18px;">Meeting Details</h3>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Booking ID:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${booking.bookingId}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Date:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${booking.date}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Time:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${booking.time}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Duration:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">30 minutes</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Meeting Type:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${meetingTypeLabel}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- What's Next -->
              <div style="margin: 30px 0;">
                <h3 style="margin: 0 0 15px; color: #0A1B2B; font-size: 18px;">What happens next?</h3>
                <ul style="margin: 0; padding: 0 0 0 20px; color: #475569; font-size: 15px; line-height: 1.8;">
                  <li>We'll send you a calendar invite (attached to this email)</li>
                  <li>A confirmation email will be sent to your calendar</li>
                  ${booking.meetingType === 'VIDEO_CALL' ? '<li>You\'ll receive a video call link 1 hour before the meeting</li>' : ''}
                  ${booking.meetingType === 'PHONE_CALL' ? '<li>We\'ll call you at ' + booking.phone + ' at the scheduled time</li>' : ''}
                  <li>Feel free to prepare any questions or materials you'd like to discuss</li>
                </ul>
              </div>

              <!-- Need to Reschedule -->
              <div style="margin: 30px 0; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                  <strong>Need to reschedule?</strong><br>
                  Contact us at <a href="mailto:support@astralisone.com" style="color: #f59e0b; text-decoration: none;">support@astralisone.com</a>
                  or call <a href="tel:+13412234433" style="color: #f59e0b; text-decoration: none;">+1 (341) 223-4433</a>
                </p>
              </div>

              <p style="margin: 30px 0 0; color: #475569; font-size: 15px; line-height: 1.6;">
                We look forward to speaking with you!
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

  return `
ASTRALIS - Your consultation is confirmed!

Hi ${booking.name},

Thank you for scheduling a consultation with us! We're excited to discuss your automation needs.

MEETING DETAILS
----------------
Booking ID: ${booking.bookingId}
Date: ${booking.date}
Time: ${booking.time}
Duration: 30 minutes
Meeting Type: ${meetingTypeLabel}

WHAT HAPPENS NEXT?
-------------------
- We'll send you a calendar invite (attached to this email)
- A confirmation will be sent to your calendar
${booking.meetingType === 'VIDEO_CALL' ? '- You\'ll receive a video call link 1 hour before the meeting' : ''}
${booking.meetingType === 'PHONE_CALL' ? '- We\'ll call you at ' + booking.phone + ' at the scheduled time' : ''}
- Feel free to prepare any questions or materials you'd like to discuss

NEED TO RESCHEDULE?
-------------------
Contact us at support@astralisone.com or call +1 (341) 223-4433

We look forward to speaking with you!

Best regards,
The Astralis Team

---
ASTRALIS
support@astralisone.com | +1 (341) 223-4433
  `.trim();
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

  const recipientName = isHost ? booking.hostName : booking.guestName;
  const otherPartyName = isHost ? booking.guestName : booking.hostName;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
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
              <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 16px;">Booking Confirmed</p>
            </td>
          </tr>

          <!-- Success Icon -->
          <tr>
            <td style="padding: 40px 30px 20px; text-align: center;">
              <div style="width: 60px; height: 60px; background-color: #22c55e; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 30px;">&#10003;</span>
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h2 style="margin: 0 0 20px; color: #0A1B2B; font-size: 22px; text-align: center;">Hi ${recipientName},</h2>
              <p style="margin: 0 0 20px; color: #475569; font-size: 16px; line-height: 1.6;">
                Your meeting with ${otherPartyName} has been confirmed.
              </p>

              <!-- Booking Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 25px;">
                    <h3 style="margin: 0 0 15px; color: #0A1B2B; font-size: 18px;">Meeting Details</h3>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Title:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${booking.title}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Date:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${dateStr}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Time:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${timeStr} - ${endTimeStr}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Timezone:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${booking.timezone}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Meeting Type:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${meetingTypeLabel}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0; color: #475569; font-size: 15px; line-height: 1.6;">
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
                <a href="mailto:support@astralisone.com" style="color: #3b82f6; text-decoration: none;">support@astralisone.com</a>
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

  const recipientName = isHost ? booking.hostName : booking.guestName;
  const otherPartyName = isHost ? booking.guestName : booking.hostName;

  return `
ASTRALIS - Booking Confirmed

Hi ${recipientName},

Your meeting with ${otherPartyName} has been confirmed.

MEETING DETAILS
----------------
Title: ${booking.title}
Date: ${dateStr}
Time: ${timeStr} - ${endTimeStr}
Timezone: ${booking.timezone}
Meeting Type: ${meetingTypeLabel}

Best regards,
The Astralis Team

---
ASTRALIS
support@astralisone.com
  `.trim();
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

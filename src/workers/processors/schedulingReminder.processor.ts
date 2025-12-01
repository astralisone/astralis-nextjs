import { Job } from 'bullmq';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { generateBookingCalendarEvent } from '@/lib/calendar';
import type { ReminderJobData, ScanRemindersJobData } from '../queues/schedulingReminders.queue';
import { scanAndQueuePendingReminders } from '../jobs/reminder-scheduler.job';

/**
 * Scheduling Reminder Processor
 *
 * Handles two types of jobs:
 * 1. 'send-reminder': Sends email reminders for scheduled events
 * 2. 'scan-pending-reminders': Cron job that scans and queues pending reminders
 */
export async function processSchedulingReminder(
  job: Job<ReminderJobData | ScanRemindersJobData>
) {
  // Handle cron job - scan for pending reminders
  if (job.name === 'scan-pending-reminders') {
    console.log('[Worker:Reminder] Processing scheduled reminder scan');
    return await scanAndQueuePendingReminders();
  }

  // Handle individual reminder - send email
  const { reminderId, eventId } = job.data as ReminderJobData;

  console.log(`[Worker:Reminder] Processing reminder ${reminderId} for event ${eventId}`);

  try {
    // Update job progress
    await job.updateProgress(10);

    // Fetch EventReminder and SchedulingEvent
    const reminder = await prisma.eventReminder.findUnique({
      where: { id: reminderId },
      include: {
        event: {
          include: {
            user: true,
            organization: true,
          },
        },
      },
    });

    if (!reminder) {
      throw new Error(`Reminder ${reminderId} not found`);
    }

    if (reminder.status !== 'PENDING') {
      console.log(`[Worker:Reminder] Reminder ${reminderId} already processed (${reminder.status})`);
      return { success: true, skipped: true, reason: 'Already processed' };
    }

    const event = reminder.event;

    if (!event) {
      throw new Error(`Event ${eventId} not found`);
    }

    console.log(`[Worker:Reminder] Found event: ${event.title} at ${event.startTime}`);

    await job.updateProgress(30);

    // Calculate time until event
    const now = new Date();
    const eventStart = new Date(event.startTime);
    const diffMs = eventStart.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);

    let timeUntil = '';
    if (diffHours >= 24) {
      const days = Math.floor(diffHours / 24);
      timeUntil = `${days} day${days > 1 ? 's' : ''}`;
    } else if (diffHours >= 1) {
      timeUntil = `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else {
      timeUntil = `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    }

    // Format event date and time
    const eventDate = eventStart.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: event.timezone || 'UTC',
    });

    const eventTime = eventStart.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: event.timezone || 'UTC',
    });

    // Generate ICS calendar attachment
    await job.updateProgress(50);
    let icsContent: string | undefined;

    try {
      icsContent = await generateBookingCalendarEvent({
        title: event.title,
        description: event.description || '',
        location: event.location || event.meetingLink || 'TBD',
        startDate: eventStart,
        duration: Math.floor((new Date(event.endTime).getTime() - eventStart.getTime()) / (1000 * 60)),
        attendeeEmail: event.user.email,
        attendeeName: event.user.name || event.user.email,
        organizerEmail: process.env.SMTP_FROM_EMAIL || 'support@astralisone.com',
        organizerName: process.env.SMTP_FROM_NAME || 'Astralis',
      });
    } catch (calendarError) {
      console.error('[Worker:Reminder] Failed to generate calendar file:', calendarError);
      // Continue without calendar attachment
    }

    // Generate email content
    await job.updateProgress(70);

    const subject = `Reminder: ${event.title} starts in ${timeUntil}`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Event Reminder</title>
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
              <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 16px;">Event Reminder</p>
            </td>
          </tr>

          <!-- Reminder Icon -->
          <tr>
            <td style="padding: 40px 30px 20px; text-align: center;">
              <div style="width: 60px; height: 60px; background-color: #f59e0b; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 30px;">⏰</span>
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h2 style="margin: 0 0 20px; color: #0A1B2B; font-size: 22px; text-align: center;">Your meeting starts in ${timeUntil}</h2>
              <p style="margin: 0 0 20px; color: #475569; font-size: 16px; line-height: 1.6;">
                This is a reminder that you have an upcoming meeting scheduled.
              </p>

              <!-- Event Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 25px;">
                    <h3 style="margin: 0 0 15px; color: #0A1B2B; font-size: 18px;">Event Details</h3>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Title:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${event.title}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Date:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${eventDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Time:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${eventTime}</td>
                      </tr>
                      ${event.location ? `
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Location:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${event.location}</td>
                      </tr>
                      ` : ''}
                      ${event.meetingLink ? `
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Meeting Link:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">
                          <a href="${event.meetingLink}" style="color: #2B6CB0; text-decoration: none;">Join Meeting</a>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              ${event.description ? `
              <div style="margin: 20px 0;">
                <h3 style="margin: 0 0 10px; color: #0A1B2B; font-size: 16px;">Description</h3>
                <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6;">${event.description}</p>
              </div>
              ` : ''}

              ${event.participantEmails && event.participantEmails.length > 0 ? `
              <div style="margin: 20px 0;">
                <h3 style="margin: 0 0 10px; color: #0A1B2B; font-size: 16px;">Participants</h3>
                <p style="margin: 0; color: #475569; font-size: 14px;">${event.participantEmails.join(', ')}</p>
              </div>
              ` : ''}

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

    const textContent = `
ASTRALIS - Event Reminder

Your meeting starts in ${timeUntil}

EVENT DETAILS
-------------
Title: ${event.title}
Date: ${eventDate}
Time: ${eventTime}
${event.location ? `Location: ${event.location}` : ''}
${event.meetingLink ? `Meeting Link: ${event.meetingLink}` : ''}

${event.description ? `Description:\n${event.description}\n` : ''}
${event.participantEmails && event.participantEmails.length > 0 ? `Participants: ${event.participantEmails.join(', ')}\n` : ''}

Best regards,
The Astralis Team

---
ASTRALIS
support@astralisone.com
    `.trim();

    // Send email with calendar attachment
    await job.updateProgress(90);

    const attachments = icsContent
      ? [
          {
            filename: `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`,
            content: icsContent,
            contentType: 'text/calendar',
          },
        ]
      : undefined;

    await sendEmail({
      to: event.user.email,
      subject,
      html: htmlContent,
      text: textContent,
      attachments,
    });

    console.log(`[Worker:Reminder] Email sent to ${event.user.email}`);

    // Update reminder status
    await prisma.eventReminder.update({
      where: { id: reminderId },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    await job.updateProgress(100);

    console.log(`[Worker:Reminder] Reminder ${reminderId} completed successfully`);

    return {
      success: true,
      reminderId,
      eventId,
      sentTo: event.user.email,
      sentAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`[Worker:Reminder] Error processing reminder ${reminderId}:`, error);

    // Update reminder status to FAILED
    try {
      await prisma.eventReminder.update({
        where: { id: reminderId },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          retryCount: { increment: 1 },
        },
      });
    } catch (dbError) {
      console.error('[Worker:Reminder] Failed to update reminder status:', dbError);
    }

    throw error;
  }
}

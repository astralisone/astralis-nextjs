/**
 * Reminder Scheduler Job Setup
 *
 * This module sets up the recurring reminder scheduler cron job.
 * The job runs every 5 minutes to scan for pending reminders that need to be sent.
 *
 * Usage:
 * ```typescript
 * import { initializeReminderSchedulerJob } from './jobs/reminder-scheduler.job';
 * await initializeReminderSchedulerJob();
 * ```
 */

import { setupReminderSchedulerCron, queueReminder } from '../queues/schedulingReminders.queue';
import { prisma } from '@/lib/prisma';

/**
 * Initialize the reminder scheduler cron job
 *
 * This should be called once when the worker starts up.
 * It will set up a repeatable job that runs every 5 minutes.
 */
export async function initializeReminderSchedulerJob(): Promise<void> {
  console.log('[Job:ReminderScheduler] Initializing reminder scheduler cron job...');

  try {
    await setupReminderSchedulerCron();
    console.log('[Job:ReminderScheduler] Reminder scheduler cron job initialized successfully');
    console.log('[Job:ReminderScheduler] Schedule: Every 5 minutes (*/5 * * * *)');
  } catch (error) {
    console.error('[Job:ReminderScheduler] Failed to initialize reminder scheduler cron job', error);
    throw error;
  }
}

/**
 * Scan for pending reminders and queue them
 *
 * Finds all reminders that:
 * - Have status PENDING
 * - Have reminderTime <= now
 * - Need to be sent
 *
 * @returns Object with count of reminders queued
 */
export async function scanAndQueuePendingReminders(): Promise<{
  scanned: number;
  queued: number;
  errors: number;
}> {
  const startTime = Date.now();
  const now = new Date();

  console.log('[Job:ReminderScheduler] Scanning for pending reminders...');

  try {
    // Find reminders that are due (reminderTime <= now) and still PENDING
    const pendingReminders = await prisma.eventReminder.findMany({
      where: {
        status: 'PENDING',
        reminderTime: {
          lte: now,
        },
      },
      take: 100, // Process in batches to avoid overwhelming the system
      orderBy: {
        reminderTime: 'asc', // Process oldest reminders first
      },
    });

    console.log(`[Job:ReminderScheduler] Found ${pendingReminders.length} pending reminders`);

    let queued = 0;
    let errors = 0;

    // Queue each reminder
    for (const reminder of pendingReminders) {
      try {
        await queueReminder({
          reminderId: reminder.id,
          eventId: reminder.eventId,
        });
        queued++;

        console.log(`[Job:ReminderScheduler] Queued reminder ${reminder.id} for event ${reminder.eventId}`);
      } catch (error) {
        errors++;
        console.error(`[Job:ReminderScheduler] Failed to queue reminder ${reminder.id}:`, error);

        // Mark reminder as failed if we can't queue it
        try {
          await prisma.eventReminder.update({
            where: { id: reminder.id },
            data: {
              status: 'FAILED',
              errorMessage: `Failed to queue: ${error instanceof Error ? error.message : 'Unknown error'}`,
              retryCount: { increment: 1 },
            },
          });
        } catch (updateError) {
          console.error(`[Job:ReminderScheduler] Failed to update reminder status:`, updateError);
        }
      }
    }

    const duration = Date.now() - startTime;

    console.log('[Job:ReminderScheduler] Scan completed', {
      scanned: pendingReminders.length,
      queued,
      errors,
      durationMs: duration,
    });

    return {
      scanned: pendingReminders.length,
      queued,
      errors,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[Job:ReminderScheduler] Scan failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      durationMs: duration,
    });
    throw error;
  }
}

/**
 * Trigger an immediate reminder scan (useful for testing or manual triggers)
 */
export async function triggerReminderScan(): Promise<void> {
  console.log('[Job:ReminderScheduler] Triggering immediate reminder scan');

  const result = await scanAndQueuePendingReminders();

  console.log('[Job:ReminderScheduler] Manual scan completed', result);
}

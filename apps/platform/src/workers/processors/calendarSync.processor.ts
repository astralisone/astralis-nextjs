import { Job } from 'bullmq';
import { prisma } from '@/lib/prisma';
import * as googleCalendarService from '@/lib/services/googleCalendar.service';
import type { CalendarSyncJobData } from '../queues/calendarSync.queue';

/**
 * Calendar Sync Processor
 *
 * Synchronizes events from external calendar providers (Google Calendar)
 * to local SchedulingEvent database
 */
export async function processCalendarSync(job: Job<CalendarSyncJobData>) {
  const { connectionId, userId, orgId, syncType } = job.data;

  console.log(`[Worker:CalendarSync] Starting ${syncType} sync for user ${userId}, connection ${connectionId}`);

  try {
    // Validate orgId for multi-tenant isolation
    if (!orgId) {
      throw new Error('orgId is required for multi-tenant isolation');
    }

    // Update job progress
    await job.updateProgress(10);

    // Fetch CalendarConnection with orgId filter (defense in depth)
    const connection = await prisma.calendarConnection.findFirst({
      where: {
        id: connectionId,
        user: {
          orgId: orgId,
        },
      },
      include: {
        user: true,
      },
    });

    if (!connection) {
      throw new Error('CalendarConnection not found or access denied');
    }

    if (!connection.isActive) {
      console.log(`[Worker:CalendarSync] Connection ${connectionId} is inactive, skipping sync`);
      return {
        success: true,
        skipped: true,
        reason: 'Connection is inactive',
      };
    }

    console.log(`[Worker:CalendarSync] Found active ${connection.provider} connection for user ${connection.user.email}`);

    await job.updateProgress(30);

    // Currently only Google Calendar is supported
    if (connection.provider !== 'GOOGLE') {
      throw new Error(`Provider ${connection.provider} not yet supported`);
    }

    // Perform sync from Google Calendar
    await job.updateProgress(50);

    let syncResult: { synced: number; errors: string[] };

    try {
      syncResult = await googleCalendarService.syncFromGoogle(userId);

      console.log(
        `[Worker:CalendarSync] Sync completed: ${syncResult.synced} events synced, ${syncResult.errors.length} errors`
      );
    } catch (syncError: any) {
      console.error('[Worker:CalendarSync] Sync failed:', syncError);

      // Increment sync error count
      const updatedConnection = await prisma.calendarConnection.update({
        where: { id: connectionId },
        data: {
          syncErrorCount: { increment: 1 },
        },
      });

      // Deactivate connection if too many consecutive errors
      if (updatedConnection.syncErrorCount >= 5) {
        await prisma.calendarConnection.update({
          where: { id: connectionId },
          data: {
            isActive: false,
          },
        });

        console.error(
          `[Worker:CalendarSync] Connection ${connectionId} deactivated due to ${updatedConnection.syncErrorCount} consecutive errors`
        );
      }

      throw new Error(`Sync failed: ${syncError.message}`);
    }

    await job.updateProgress(90);

    // Update connection: reset error count and update lastSyncAt
    await prisma.calendarConnection.update({
      where: { id: connectionId },
      data: {
        lastSyncAt: new Date(),
        syncErrorCount: 0, // Reset error count on successful sync
      },
    });

    await job.updateProgress(100);

    console.log(`[Worker:CalendarSync] Successfully completed sync for connection ${connectionId}`);

    return {
      success: true,
      connectionId,
      userId,
      provider: connection.provider,
      syncType,
      eventsSynced: syncResult.synced,
      errors: syncResult.errors,
      syncedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`[Worker:CalendarSync] Error syncing calendar ${connectionId}:`, error);
    throw error;
  }
}

import type { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import type { SLAMonitorJobData } from '../queues/sla-monitor.queue';
import { createSLAMonitorService } from '@/lib/agent/services/SLAMonitorService';

const prisma = new PrismaClient();

/**
 * Process SLA Monitor Job
 *
 * Checks tasks for SLA warnings and breaches.
 * Can process:
 * - Single task (if taskId provided)
 * - All tasks in an org (if orgId provided)
 * - All tasks across all orgs (if neither provided)
 */
export async function processSLAMonitor(job: Job<SLAMonitorJobData>): Promise<any> {
  const startTime = Date.now();
  const { orgId, taskId } = job.data;

  console.log('[Worker:SLAMonitor] Starting SLA check', {
    jobId: job.id,
    orgId,
    taskId,
  });

  try {
    // Create service instance
    const slaService = createSLAMonitorService({
      prisma,
      logger: {
        debug: (msg, data) => console.debug(`[Worker:SLAMonitor] ${msg}`, data ?? ''),
        info: (msg, data) => console.info(`[Worker:SLAMonitor] ${msg}`, data ?? ''),
        warn: (msg, data) => console.warn(`[Worker:SLAMonitor] ${msg}`, data ?? ''),
        error: (msg, err, data) => console.error(`[Worker:SLAMonitor] ${msg}`, err, data ?? ''),
      },
    });

    // Check specific task
    if (taskId) {
      console.log('[Worker:SLAMonitor] Checking specific task', { taskId });
      const result = await slaService.checkTaskSLA(taskId);

      const duration = Date.now() - startTime;
      console.log('[Worker:SLAMonitor] Task check completed', {
        jobId: job.id,
        taskId,
        status: result.status,
        eventEmitted: result.eventEmitted,
        durationMs: duration,
      });

      return {
        type: 'single_task',
        taskId,
        result,
        durationMs: duration,
      };
    }

    // Check specific org
    if (orgId) {
      console.log('[Worker:SLAMonitor] Checking all tasks for org', { orgId });
      const summary = await slaService.checkAllPendingTasks(orgId);

      const duration = Date.now() - startTime;
      console.log('[Worker:SLAMonitor] Org check completed', {
        jobId: job.id,
        orgId,
        summary: {
          total: summary.totalChecked,
          warnings: summary.warningCount,
          breaches: summary.breachedCount,
          errors: summary.errorCount,
        },
        durationMs: duration,
      });

      return {
        type: 'org',
        orgId,
        summary,
        durationMs: duration,
      };
    }

    // Check all orgs
    console.log('[Worker:SLAMonitor] Checking all organizations');

    // Get all organizations
    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    console.log('[Worker:SLAMonitor] Found organizations to check', {
      count: organizations.length,
    });

    const orgResults: Array<{
      orgId: string;
      orgName: string;
      summary: any;
      error?: string;
    }> = [];

    // Check each organization
    for (const org of organizations) {
      try {
        console.log('[Worker:SLAMonitor] Checking org', {
          orgId: org.id,
          orgName: org.name,
        });

        const summary = await slaService.checkAllPendingTasks(org.id);

        orgResults.push({
          orgId: org.id,
          orgName: org.name,
          summary,
        });

        console.log('[Worker:SLAMonitor] Org check completed', {
          orgId: org.id,
          orgName: org.name,
          warnings: summary.warningCount,
          breaches: summary.breachedCount,
        });
      } catch (error) {
        console.error('[Worker:SLAMonitor] Error checking org', {
          orgId: org.id,
          orgName: org.name,
          error: (error as Error).message,
        });

        orgResults.push({
          orgId: org.id,
          orgName: org.name,
          summary: null,
          error: (error as Error).message,
        });
      }
    }

    // Calculate totals
    const totalSummary = {
      orgsChecked: organizations.length,
      totalTasks: orgResults.reduce((sum, r) => sum + (r.summary?.totalChecked ?? 0), 0),
      totalWarnings: orgResults.reduce((sum, r) => sum + (r.summary?.warningCount ?? 0), 0),
      totalBreaches: orgResults.reduce((sum, r) => sum + (r.summary?.breachedCount ?? 0), 0),
      totalErrors: orgResults.reduce((sum, r) => sum + (r.summary?.errorCount ?? 0), 0),
      orgErrors: orgResults.filter((r) => r.error).length,
    };

    const duration = Date.now() - startTime;
    console.log('[Worker:SLAMonitor] All orgs check completed', {
      jobId: job.id,
      ...totalSummary,
      durationMs: duration,
    });

    return {
      type: 'all_orgs',
      totalSummary,
      orgResults,
      durationMs: duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[Worker:SLAMonitor] Job failed', {
      jobId: job.id,
      error: (error as Error).message,
      stack: (error as Error).stack,
      durationMs: duration,
    });

    throw error;
  }
}

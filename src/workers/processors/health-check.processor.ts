import { Job } from 'bullmq';
import { prisma } from '@/lib/prisma';
import { ActionExecutor } from '@/lib/agent/core/ActionExecutor';
import { DecisionType } from '@/lib/agent/types/agent.types';
import { AgentEventBus } from '@/lib/agent/inputs/EventBus';
import type { HealthCheckJobData } from '../queues/health-check.queue';

/**
 * Health Check Processor
 * 
 * Executes the business pulse check and emits events if issues are detected.
 */
export async function processHealthCheck(job: Job<HealthCheckJobData>) {
    const { orgId } = job.data;

    // If orgId not provided, we might need to loop through all orgs or default to a main one
    // For this implementation, we'll fetch all active organizations
    const orgs = orgId ? [{ id: orgId }] : await prisma.organization.findMany({
        where: { isActive: true },
        select: { id: true }
    });

    console.log(`[HealthCheck] Starting health check for ${orgs.length} organizations`);

    const actionExecutor = new ActionExecutor({ dryRun: false });
    const eventBus = AgentEventBus.getInstance();

    for (const org of orgs) {
        try {
            console.log(`[HealthCheck] Checking pulse for org ${org.id}`);

            const result = await actionExecutor.execute([
                {
                    type: DecisionType.GET_BUSINESS_PULSE,
                    params: {},
                    priority: 1,
                    requiresConfirmation: false
                }
            ], {
                orgId: org.id,
                userId: 'system-worker',
                dryRun: false,
            });

            const pulseResult = result.results[0];

            if (pulseResult.success && pulseResult.data?.pulse !== 'HEALTHY') {
                console.log(`[HealthCheck] Pulse anomaly detected for org ${org.id}: ${pulseResult.data.pulse}`);

                // Emit system health warning event
                eventBus.emit('system:health_warning', {
                    type: 'SYSTEM_EVENT',
                    source: 'HEALTH_CHECK_WORKER',
                    timestamp: new Date(),
                    orgId: org.id,
                    payload: {
                        pulse: pulseResult.data.pulse,
                        insights: pulseResult.data.insights,
                        summary: pulseResult.data.summary,
                        recommendation: 'Check the dashboard for proactive business insights.'
                    },
                });
            }
        } catch (error) {
            console.error(`[HealthCheck] Failed to check pulse for org ${org.id}:`, error);
        }
    }

    return { processedOrgs: orgs.length };
}

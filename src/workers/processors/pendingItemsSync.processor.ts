import { Job } from 'bullmq';
import { prisma } from '@/lib/prisma';
import { queueDocumentProcessing } from '../queues/document-processing.queue';
import { getEventBus } from '@/lib/agent/inputs/EventBus';
import type { PendingItemsSyncJobData } from '../queues/pending-items-sync.queue';

/**
 * Pending Items Sync Processor
 *
 * Finds items in PENDING/NEW status that should have been processed
 * and re-queues them or emits the necessary events.
 */
export async function processPendingItemsSync(job: Job<PendingItemsSyncJobData>) {
    const { dryRun = false } = job.data;
    console.log(`[Sync:Pending] Starting sync (dryRun: ${dryRun})`);

    try {
        // 1. Find Pending Documents
        const pendingDocuments = await prisma.document.findMany({
            where: {
                status: 'PENDING',
                createdAt: {
                    lte: new Date(Date.now() - 5 * 60 * 1000), // Only items older than 5 mins
                },
            },
            take: 50,
        });

        console.log(`[Sync:Pending] Found ${pendingDocuments.length} pending documents`);

        if (!dryRun) {
            for (const doc of pendingDocuments) {
                console.log(`[Sync:Pending] Re-queueing document ${doc.id}`);
                await queueDocumentProcessing({
                    documentId: doc.id,
                    orgId: doc.orgId,
                });
            }
        }

        await job.updateProgress(50);

        // 2. Find New Intake Requests
        const newIntakes = await prisma.intakeRequest.findMany({
            where: {
                status: 'NEW',
                createdAt: {
                    lte: new Date(Date.now() - 5 * 60 * 1000), // Only items older than 5 mins
                },
            },
            take: 50,
        });

        console.log(`[Sync:Pending] Found ${newIntakes.length} new intake requests`);

        if (!dryRun) {
            const eventBus = getEventBus();
            for (const intake of newIntakes) {
                console.log(`[Sync:Pending] Re-emitting intake:created for ${intake.id}`);

                // Emitting event will trigger the Orchestration Agent or IntakeRouting worker
                await eventBus.emit('intake:created', {
                    id: intake.id,
                    source: 'system-sync',
                    timestamp: new Date(),
                    payload: {
                        intakeId: intake.id,
                        type: 'intake_request',
                        data: {
                            title: intake.title,
                            description: intake.description,
                            source: intake.source,
                            status: intake.status,
                            priority: intake.priority,
                            requestData: intake.requestData,
                        },
                        contactInfo: {
                            email: (intake.requestData as any)?.email,
                            name: (intake.requestData as any)?.name,
                            phone: (intake.requestData as any)?.phone,
                        },
                        businessContext: {
                            industry: (intake.requestData as any)?.industry,
                            customerSegment: (intake.requestData as any)?.segment,
                            existingCustomer: (intake.requestData as any)?.isExisting,
                        }
                    }
                }, {
                    source: 'system',
                    correlationId: intake.id,
                    orgId: intake.orgId,
                });
            }
        }

        await job.updateProgress(100);

        return {
            success: true,
            processedDocuments: pendingDocuments.length,
            processedIntakes: newIntakes.length,
        };
    } catch (error) {
        console.error('[Sync:Pending] Sync failed:', error);
        throw error;
    }
}

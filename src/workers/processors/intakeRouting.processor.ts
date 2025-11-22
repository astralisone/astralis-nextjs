import { Job } from 'bullmq';
import { prisma } from '@/lib/prisma';
import { getDefaultPipeline } from '@/lib/services/defaultPipelines.service';
import type { IntakeRoutingJobData } from '../queues/intakeRouting.queue';

/**
 * Intake Routing Processor
 *
 * Processes intake requests through AI-powered routing to determine
 * the appropriate pipeline, user assignment, or workflow
 */
export async function processIntakeRouting(job: Job<IntakeRoutingJobData>) {
  const { intakeRequestId, orgId, priority, source } = job.data;

  console.log(`[IntakeRouting] Processing intake ${intakeRequestId} for org ${orgId}`);
  console.log(`[IntakeRouting] Priority: ${priority || 'normal'}, Source: ${source || 'unknown'}`);

  try {
    // Update intake status to ROUTING
    await prisma.intakeRequest.update({
      where: { id: intakeRequestId },
      data: { status: 'ROUTING' },
    });

    await job.updateProgress(10);

    // Fetch the intake request with related data
    const intakeRequest = await prisma.intakeRequest.findUnique({
      where: { id: intakeRequestId },
      include: {
        organization: true,
      },
    });

    if (!intakeRequest) {
      throw new Error(`Intake request not found: ${intakeRequestId}`);
    }

    //console.log(`[IntakeRouting] Found intake: ${intakeRequest.subject || 'No subject'}`);

    await job.updateProgress(30);

    // Get available pipelines for routing decision
    const pipelines = await prisma.pipeline.findMany({
      where: {
        orgId: orgId,
        isActive: true,
      },
      include: {
        stages: {
          orderBy: { order: 'asc' },
        },
      },
    });

    console.log(`[IntakeRouting] Found ${pipelines.length} active pipelines`);

    await job.updateProgress(50);

    // Perform routing logic
    // TODO: Integrate with aiRoutingService when available
    // For now, use rule-based routing as fallback
    const routingResult = await performRouting(intakeRequest, pipelines);

    await job.updateProgress(70);

    // If no pipeline matched, get/create the default "General Intake" pipeline
    let finalPipelineId = routingResult.pipelineId;
    let pipelineName = routingResult.metadata.matchedPipeline as string | undefined;

    if (!finalPipelineId) {
      console.log(`[IntakeRouting] No matching pipeline found, using default "General Intake" pipeline`);

      const defaultPipeline = await getDefaultPipeline(orgId);
      finalPipelineId = defaultPipeline.id;
      pipelineName = defaultPipeline.name;
      routingResult.assigned = true;
      routingResult.method = 'default';
      routingResult.metadata = {
        ...routingResult.metadata,
        reason: 'No matching pipeline found, assigned to default General Intake pipeline',
        defaultPipeline: defaultPipeline.name,
        defaultPipelineCreated: false, // Pipeline already existed or was just created by getDefaultPipeline
      };

      console.log(`[IntakeRouting] Default pipeline retrieved: ${defaultPipeline.name} (${defaultPipeline.id})`);
    }

    await job.updateProgress(80);

    // Update intake with routing decision
    await prisma.intakeRequest.update({
      where: { id: intakeRequestId },
      data: {
        status: routingResult.assigned ? 'ASSIGNED' : 'PROCESSING',
        assignedPipeline: finalPipelineId || undefined,
        aiRoutingMeta: {
          ...routingResult.metadata,
          assignedUserId: routingResult.assignedUserId,
          routedAt: new Date().toISOString(),
        },
      },
    });

    await job.updateProgress(85);

    // Create a PipelineItem to track this intake in the pipeline
    let pipelineItemId: string | null = null;
    if (finalPipelineId) {
      // Get the first stage of the pipeline
      const firstStage = await prisma.pipelineStage.findFirst({
        where: { pipelineId: finalPipelineId },
        orderBy: { order: 'asc' },
        select: { id: true, name: true },
      });

      if (firstStage) {
        // Check if a pipeline item already exists for this intake
        const existingItem = await prisma.pipelineItem.findFirst({
          where: {
            data: {
              path: ['intakeRequestId'],
              equals: intakeRequestId,
            },
          },
        });

        if (!existingItem) {
          const newPipelineItem = await prisma.pipelineItem.create({
            data: {
              title: intakeRequest.title,
              description: intakeRequest.description,
              stageId: firstStage.id,
              priority: intakeRequest.priority,
              status: 'NOT_STARTED',
              data: {
                intakeRequestId: intakeRequestId,
                source: source || 'unknown',
                routedAt: new Date().toISOString(),
                routingMethod: routingResult.method,
              },
            },
          });

          pipelineItemId = newPipelineItem.id;
          console.log(`[IntakeRouting] Created PipelineItem ${pipelineItemId} in stage "${firstStage.name}"`);
        } else {
          pipelineItemId = existingItem.id;
          console.log(`[IntakeRouting] PipelineItem already exists: ${pipelineItemId}`);
        }
      } else {
        console.warn(`[IntakeRouting] No stages found for pipeline ${finalPipelineId}, skipping PipelineItem creation`);
      }
    }

    // Log classification results
    console.log(`[IntakeRouting] === Routing Summary ===`);
    console.log(`[IntakeRouting] Intake ID: ${intakeRequestId}`);
    console.log(`[IntakeRouting] Title: ${intakeRequest.title}`);
    console.log(`[IntakeRouting] Classification: ${routingResult.method}`);
    console.log(`[IntakeRouting] Pipeline: ${pipelineName || 'None'} (${finalPipelineId || 'N/A'})`);
    console.log(`[IntakeRouting] PipelineItem: ${pipelineItemId || 'Not created'}`);
    console.log(`[IntakeRouting] Status: ${routingResult.assigned ? 'ASSIGNED' : 'PROCESSING'}`);
    console.log(`[IntakeRouting] ========================`);

    await job.updateProgress(100);

    return {
      success: true,
      intakeRequestId,
      pipelineId: finalPipelineId,
      pipelineItemId,
      assignedUserId: routingResult.assignedUserId,
      routingMethod: routingResult.method,
    };
  } catch (error) {
    console.error(`[IntakeRouting] Error processing intake ${intakeRequestId}:`, error);

    // Update intake status to indicate routing failed
    try {
      await prisma.intakeRequest.update({
        where: { id: intakeRequestId },
        data: {
          status: 'NEW', // Reset to NEW for manual handling
          aiRoutingMeta: {
            error: error instanceof Error ? error.message : 'Unknown routing error',
            failedAt: new Date().toISOString(),
          },
        },
      });
    } catch (updateError) {
      console.error(`[IntakeRouting] Failed to update intake status:`, updateError);
    }

    throw error;
  }
}

/**
 * Routing result interface
 */
interface RoutingResult {
  assigned: boolean;
  pipelineId: string | null;
  assignedUserId: string | null;
  method: 'ai' | 'rule-based' | 'default';
  metadata: Record<string, unknown>;
}

/**
 * Perform routing logic
 * Currently rule-based, will integrate with AI service
 */
async function performRouting(
  intakeRequest: {
    id: string;
    title: string;
    description: string | null;
    source: string;
    priority: number;
    requestData: unknown;
  },
  pipelines: Array<{
    id: string;
    name: string;
    description: string | null;
    stages: Array<{ id: string; name: string; order: number }>;
  }>
): Promise<RoutingResult> {
  // Default routing result
  const result: RoutingResult = {
    assigned: false,
    pipelineId: null,
    assignedUserId: null,
    method: 'rule-based',
    metadata: {
      analyzedAt: new Date().toISOString(),
      pipelinesEvaluated: pipelines.length,
    },
  };

  if (pipelines.length === 0) {
    console.log('[IntakeRouting] No active pipelines available for routing');
    result.metadata = {
      ...result.metadata,
      reason: 'No active pipelines available',
    };
    return result;
  }

  // Simple keyword-based routing
  const title = (intakeRequest.title || '').toLowerCase();
  const description = (intakeRequest.description || '').toLowerCase();
  const combinedText = `${title} ${description}`;

  // Find matching pipeline based on keywords in name/description
  for (const pipeline of pipelines) {
    const pipelineName = pipeline.name.toLowerCase();
    const pipelineDesc = (pipeline.description || '').toLowerCase();

    // Check if intake content relates to pipeline
    const keywords = pipelineName.split(/\s+/);
    const matchScore = keywords.filter((keyword) =>
      keyword.length > 3 && combinedText.includes(keyword)
    ).length;

    if (matchScore > 0) {
      result.assigned = true;
      result.pipelineId = pipeline.id;
      result.metadata = {
        ...result.metadata,
        matchedPipeline: pipeline.name,
        matchScore,
        matchedKeywords: keywords.filter((k) => k.length > 3 && combinedText.includes(k)),
      };
      console.log(`[IntakeRouting] Matched pipeline: ${pipeline.name} (score: ${matchScore})`);
      break;
    }
  }

  // If no match found from keyword analysis, return without assigning a pipeline
  // The processor will handle fallback to the default "General Intake" pipeline
  if (!result.pipelineId) {
    console.log(`[IntakeRouting] No keyword match found in ${pipelines.length} pipelines`);
    result.metadata = {
      ...result.metadata,
      reason: 'No keyword match found',
    };
  }

  return result;
}

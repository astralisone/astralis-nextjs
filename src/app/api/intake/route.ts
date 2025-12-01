import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { IntakeSource, IntakeStatus } from "@prisma/client";
import { quotaTrackingService, QuotaExceededError } from "@/lib/services/quotaTracking.service";
import { AIRoutingService } from "@/lib/services/aiRouting.service";
import { getEventBus, getAgentInstance } from "@/lib/agent";

// Extend global type to include our custom property
declare global {
  var agentSystemInitialized: boolean | undefined;
}

const intakeRequestSchema = z.object({
  source: z.enum(["FORM", "EMAIL", "CHAT", "API"]),
  title: z.string().min(2),
  description: z.string().optional(),
  requestData: z.any(),
  orgId: z.string(),
  priority: z.number().int().min(0).max(10).optional().default(0),
});

const intakeFiltersSchema = z.object({
  orgId: z.string().min(1),
  status: z.enum(["NEW", "ROUTING", "ASSIGNED", "PROCESSING", "COMPLETED", "REJECTED"]).optional().nullable(),
  source: z.enum(["FORM", "EMAIL", "CHAT", "API"]).optional().nullable(),
  search: z.string().optional().nullable(),
  limit: z.string().optional().nullable(),
  offset: z.string().optional().nullable(),
});

/**
 * Check if OpenAI API key is configured
 */
function isOpenAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

/**
 * POST /api/intake
 * Capture intake request and route using AI logic
 *
 * This endpoint:
 * 1. Validates and stores the intake request
 * 2. Checks quota limits before processing
 * 3. Applies AI routing logic (uses AIRoutingService if OpenAI configured, fallback otherwise)
 * 4. Assigns to appropriate pipeline
 * 5. Returns routing result
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = intakeRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { source, title, description, requestData, orgId, priority } = parsed.data;

    // Verify organization exists
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    // Check quota before creating intake request
    try {
      await quotaTrackingService.enforceIntakeQuota(orgId);
    } catch (quotaError) {
      if (quotaError instanceof QuotaExceededError) {
        console.error(`[Intake API] Quota exceeded for org ${orgId}:`, quotaError.message);
        return NextResponse.json(
          {
            error: "Quota exceeded",
            details: {
              quotaType: quotaError.quotaType,
              used: quotaError.used,
              limit: quotaError.limit,
              plan: quotaError.plan,
              message: `Monthly intake request quota exceeded (${quotaError.used}/${quotaError.limit}). Please upgrade your plan to continue.`,
            },
          },
          { status: 429 },
        );
      }
      throw quotaError;
    }

    // Use AI routing if OpenAI is configured, otherwise use fallback
    const useAIRouting = isOpenAIConfigured();
    let aiRoutingResult: {
      assignedPipeline: string | null;
      confidence: number;
      reasoning: string;
      suggestedPipelines: string[];
      usedAIRouting: boolean;
    };

    if (useAIRouting) {
      console.log(`[Intake API] Using AIRoutingService for intake request (org: ${orgId})`);

      // First create the intake request with NEW status
      const intakeRequest = await prisma.intakeRequest.create({
        data: {
          source: source as IntakeSource,
          status: IntakeStatus.NEW,
          title,
          description,
          requestData,
          priority: priority || 0,
          orgId,
          aiRoutingMeta: {
            routingMethod: "ai",
            routedAt: new Date().toISOString(),
            pending: true,
          },
        },
        include: {
          pipeline: true,
        },
      });

      // Process with AIRoutingService (updates the intake request directly)
      try {
        const aiService = new AIRoutingService();
        await aiService.processIntakeRequest(intakeRequest.id);

        // Fetch updated intake request after AI processing
        const updatedIntake = await prisma.intakeRequest.findUnique({
          where: { id: intakeRequest.id },
          include: { pipeline: true },
        });

        if (!updatedIntake) {
          throw new Error("Intake request not found after AI processing");
        }

        const routingMeta = updatedIntake.aiRoutingMeta as Record<string, unknown> | null;

        // Ensure agent is running for this organization BEFORE emitting event
        try {
          const agent = getAgentInstance(updatedIntake.orgId);
          if (!agent.isActive()) {
            agent.start();
          }
        } catch (agentError) {
          console.log('Agent not available, attempting to initialize system...');
          // Try to initialize the agent system if not already done
          if (!globalThis.agentSystemInitialized) {
            try {
              const { initializeAgentSystem } = await import('@/lib/agent');
              const hasClaudeKey = !!process.env.ANTHROPIC_API_KEY;
              const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

              if (hasClaudeKey || hasOpenAIKey) {
                await initializeAgentSystem({
                  enableWebhooks: true,
                  enableEmail: true,
                  enableDBTriggers: true,
                  enableWorkerEvents: true,
                });
                globalThis.agentSystemInitialized = true;
                console.log('✅ Agent system initialized during intake processing');

                // Now try to get the agent again
                const agent = getAgentInstance(updatedIntake.orgId);
                if (!agent.isActive()) {
                  agent.start();
                }
              }
            } catch (initError) {
              console.log('Agent system initialization failed:', initError instanceof Error ? initError.message : String(initError));
            }
          }
        }

        // Emit intake:created event to trigger orchestration agent
        const eventBus = getEventBus();
        await eventBus.emit('intake:created', {
          id: updatedIntake.id,
          source: 'api',
          timestamp: new Date(),
          payload: {
            intakeId: updatedIntake.id,
            type: 'intake_request',
            data: {
              title: updatedIntake.title,
              description: updatedIntake.description,
              source: updatedIntake.source,
              status: updatedIntake.status,
              priority: updatedIntake.priority,
              requestData: updatedIntake.requestData,
            },
            contactInfo: {
              // Extract contact info from requestData if available
              email: (updatedIntake.requestData as any)?.email,
              name: (updatedIntake.requestData as any)?.name,
              phone: (updatedIntake.requestData as any)?.phone,
            },
          },
        });

        return NextResponse.json(
          {
            intakeRequest: updatedIntake,
            routing: {
              assigned: Boolean(updatedIntake.assignedPipeline),
              confidence: (routingMeta?.confidence as number) ?? 0,
              reasoning: (routingMeta?.reasoning as string) ?? "AI routing completed",
              usedAIRouting: true,
            },
          },
          { status: 201 },
        );
      } catch (aiError) {
        // If AI routing fails, the intake request still exists with NEW status
        console.error("[Intake API] AI routing failed, intake created with NEW status:", aiError);

        // Update routing meta to indicate AI failure
        await prisma.intakeRequest.update({
          where: { id: intakeRequest.id },
          data: {
            aiRoutingMeta: {
              routingMethod: "ai_failed",
              error: aiError instanceof Error ? aiError.message : "Unknown error",
              routedAt: new Date().toISOString(),
              fallbackRequired: true,
            },
          },
        });

        const finalIntake = await prisma.intakeRequest.findUnique({
          where: { id: intakeRequest.id },
          include: { pipeline: true },
        });

        // Ensure agent is running for this organization BEFORE emitting event
        try {
          const agent = getAgentInstance(finalIntake!.orgId);
          if (!agent.isActive()) {
            agent.start();
          }
        } catch (agentError) {
          console.log('Agent not available, attempting to initialize system...');
          // Try to initialize the agent system if not already done
          if (!globalThis.agentSystemInitialized) {
            try {
              const { initializeAgentSystem } = await import('@/lib/agent');
              const hasClaudeKey = !!process.env.ANTHROPIC_API_KEY;
              const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

              if (hasClaudeKey || hasOpenAIKey) {
                await initializeAgentSystem({
                  enableWebhooks: true,
                  enableEmail: true,
                  enableDBTriggers: true,
                  enableWorkerEvents: true,
                });
                globalThis.agentSystemInitialized = true;
                console.log('✅ Agent system initialized during intake processing');

                // Now try to get the agent again
                const agent = getAgentInstance(finalIntake!.orgId);
                if (!agent.isActive()) {
                  agent.start();
                }
              }
            } catch (initError) {
              console.log('Agent system initialization failed:', initError instanceof Error ? initError.message : String(initError));
            }
          }
        }

        // Emit intake:created event even on AI failure
        const eventBus = getEventBus();
        await eventBus.emit('intake:created', {
          id: finalIntake!.id,
          source: 'api',
          timestamp: new Date(),
          payload: {
            intakeId: finalIntake!.id,
            type: 'intake_request',
            data: {
              title: finalIntake!.title,
              description: finalIntake!.description,
              source: finalIntake!.source,
              status: finalIntake!.status,
              priority: finalIntake!.priority,
              requestData: finalIntake!.requestData,
            },
            contactInfo: {
              email: (finalIntake!.requestData as any)?.email,
              name: (finalIntake!.requestData as any)?.name,
              phone: (finalIntake!.requestData as any)?.phone,
            },
          },
        });

        return NextResponse.json(
          {
            intakeRequest: intakeRequest,
            routing: {
              assigned: false,
              confidence: 0,
              reasoning: "AI routing failed - manual routing required",
              usedAIRouting: false,
              error: "AI routing failed",
            },
          },
          { status: 201 },
        );
      }
    } else {
      // Fallback to basic keyword routing (no OpenAI key configured)
      console.log(`[Intake API] Using fallback routing for intake request (org: ${orgId}) - OpenAI not configured`);

      aiRoutingResult = {
        ...(await performFallbackRouting({
          title,
          description,
          requestData,
          orgId,
        })),
        usedAIRouting: false,
      };

      // Create intake request with fallback routing metadata
      const intakeRequest = await prisma.intakeRequest.create({
        data: {
          source: source as IntakeSource,
          status: aiRoutingResult.assignedPipeline ? IntakeStatus.ASSIGNED : IntakeStatus.NEW,
          title,
          description,
          requestData,
          priority: priority || 0,
          orgId,
          assignedPipeline: aiRoutingResult.assignedPipeline,
          aiRoutingMeta: {
            confidence: aiRoutingResult.confidence,
            reasoning: aiRoutingResult.reasoning,
            suggestedPipelines: aiRoutingResult.suggestedPipelines,
            routingMethod: "fallback_keyword",
            routedAt: new Date().toISOString(),
          },
        },
        include: {
          pipeline: true,
        },
      });

      // Ensure agent is running for this organization BEFORE emitting event
      try {
        const agent = getAgentInstance(intakeRequest.orgId);
        if (!agent.isActive()) {
          agent.start();
        }
      } catch (agentError) {
        console.log('Agent not available, attempting to initialize system...');
        // Try to initialize the agent system if not already done
        if (!globalThis.agentSystemInitialized) {
          try {
            const { initializeAgentSystem } = await import('@/lib/agent');
            const hasClaudeKey = !!process.env.ANTHROPIC_API_KEY;
            const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

            if (hasClaudeKey || hasOpenAIKey) {
              await initializeAgentSystem({
                enableWebhooks: true,
                enableEmail: true,
                enableDBTriggers: true,
                enableWorkerEvents: true,
              });
              globalThis.agentSystemInitialized = true;
              console.log('✅ Agent system initialized during intake processing');

              // Now try to get the agent again
              const agent = getAgentInstance(intakeRequest.orgId);
              if (!agent.isActive()) {
                agent.start();
              }
            }
          } catch (initError) {
            console.log('Agent system initialization failed:', initError instanceof Error ? initError.message : String(initError));
          }
        }
      }

      // Emit intake:created event to trigger orchestration agent
      const eventBus = getEventBus();
      await eventBus.emit('intake:created', {
        id: intakeRequest.id,
        source: 'api',
        timestamp: new Date(),
        payload: {
          intakeId: intakeRequest.id,
          type: 'intake_request',
          data: {
            title: intakeRequest.title,
            description: intakeRequest.description,
            source: intakeRequest.source,
            status: intakeRequest.status,
            priority: intakeRequest.priority,
            requestData: intakeRequest.requestData,
          },
          contactInfo: {
            email: (intakeRequest.requestData as any)?.email,
            name: (intakeRequest.requestData as any)?.name,
            phone: (intakeRequest.requestData as any)?.phone,
          },
        },
      });

      return NextResponse.json(
        {
          intakeRequest,
          routing: {
            assigned: Boolean(aiRoutingResult.assignedPipeline),
            confidence: aiRoutingResult.confidence,
            reasoning: aiRoutingResult.reasoning,
            usedAIRouting: false,
          },
        },
        { status: 201 },
      );
    }
  }
  catch (error) {
    console.error("Error processing intake request:", error);
    return NextResponse.json(
      {
        error: "Failed to process intake request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * Fallback Routing Logic (Keyword-based)
 *
 * Used when OpenAI API key is not configured.
 * Provides basic keyword-based routing as a fallback.
 *
 * Features:
 * - Basic keyword pattern matching
 * - Pipeline name matching
 * - Priority keywords detection (urgent, emergency)
 *
 * For production AI routing, see AIRoutingService.
 */
async function performFallbackRouting(params: {
  title: string;
  description?: string;
  requestData: unknown;
  orgId: string;
}): Promise<{
  assignedPipeline: string | null;
  confidence: number;
  reasoning: string;
  suggestedPipelines: string[];
}> {
  // Fetch available pipelines for the organization
  const pipelines = await prisma.pipeline.findMany({
    where: { orgId: params.orgId },
    select: { id: true, name: true },
  });

  if (pipelines.length === 0) {
    return {
      assignedPipeline: null,
      confidence: 0,
      reasoning: "No pipelines available for this organization",
      suggestedPipelines: [],
    };
  }

  // Basic keyword-based routing (fallback when OpenAI not configured)
  const content = `${params.title} ${params.description || ""}`.toLowerCase();

  // Simple pattern matching (fallback - use AIRoutingService for production AI routing)
  let selectedPipeline = null;
  let confidence = 0.3; // Low confidence for keyword-based routing
  let reasoning = "Fallback routing to first available pipeline (AI routing not configured)";

  // Example routing patterns
  if (content.includes("urgent") || content.includes("emergency")) {
    selectedPipeline = pipelines[0].id;
    confidence = 0.7;
    reasoning = "Urgent request detected - routed to priority pipeline";
  } else if (content.includes("document") || content.includes("invoice")) {
    selectedPipeline = pipelines.find(p => p.name.toLowerCase().includes("document"))?.id || pipelines[0].id;
    confidence = 0.6;
    reasoning = "Document processing request detected";
  } else {
    selectedPipeline = pipelines[0].id;
  }

  return {
    assignedPipeline: selectedPipeline,
    confidence,
    reasoning,
    suggestedPipelines: pipelines.map(p => p.id),
  };
}

/**
 * GET /api/intake
 * List intake requests with optional filtering
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const filters = {
      orgId: searchParams.get("orgId"),
      status: searchParams.get("status"),
      source: searchParams.get("source"),
      search: searchParams.get("search"),
      limit: searchParams.get("limit"),
      offset: searchParams.get("offset"),
    };

    const parsed = intakeFiltersSchema.safeParse(filters);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid filters", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { orgId, status, source, search, limit: limitStr, offset: offsetStr } = parsed.data;
    const limit = parseInt(limitStr || "50");
    const offset = parseInt(offsetStr || "0");

    const where: any = {};

    if (orgId) where.orgId = orgId;
    if (status) where.status = status as IntakeStatus;
    if (source) where.source = source as IntakeSource;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [intakeRequests, total] = await Promise.all([
      prisma.intakeRequest.findMany({
        where,
        include: {
          pipeline: {
            select: { id: true, name: true },
          },
        },
        orderBy: [
          { priority: "desc" },
          { createdAt: "desc" },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.intakeRequest.count({ where }),
    ]);

    return NextResponse.json({
      intakeRequests,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching intake requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch intake requests" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { IntakeSource, IntakeStatus } from "@prisma/client";
import { quotaTrackingService, QuotaExceededError } from "@/lib/services/quotaTracking.service";
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
 * POST /api/intake
 * Capture intake request and route using Orchestration Agent
 *
 * This endpoint:
 * 1. Validates and stores the intake request
 * 2. Checks quota limits before processing
 * 3. Emits intake:created event for Orchestration Agent to handle routing
 * 4. OA determines appropriate pipeline and assignments
 * 5. Returns intake request (routing happens asynchronously via OA)
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

    // OA (Orchestration Agent) now handles all routing via events
    // Check if OpenAI is configured for backward compatibility
    const useAIRouting = Boolean(process.env.OPENAI_API_KEY);

    if (useAIRouting) {
      console.log(`[Intake API] OpenAI configured - creating intake for OA routing (org: ${orgId})`);

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

      // OA (Orchestration Agent) handles all routing via events
      try {
        // Emit event - OA will handle routing decisions
        console.log('[Intake API] Relying on OA for routing via intake:created event');

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
      // No OpenAI configured - OA will still handle routing via events
      console.log(`[Intake API] No OpenAI configured - OA will handle routing via events (org: ${orgId})`);

      // Create intake request with NEW status - OA will route it
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
            routingMethod: "oa_event_based",
            routedAt: new Date().toISOString(),
            pending: true,
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
            assigned: false,
            confidence: 0,
            reasoning: "OA will handle routing via events",
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

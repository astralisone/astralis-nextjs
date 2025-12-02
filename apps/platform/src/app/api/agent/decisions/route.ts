import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/config";
import {
  AgentInputSource,
  DecisionStatus,
  DecisionType,
  Prisma,
} from "@prisma/client";
import {
  OrchestrationAgent,
  createOrchestrationAgent,
} from "@/lib/agent/core";
import {
  AgentInputSource as TypeAgentInputSource,
  LLMProvider,
  DecisionType as TypeDecisionType,
} from "@/lib/agent/types";

// ============================================================================
// Validation Schemas
// ============================================================================

const listDecisionsSchema = z.object({
  status: z
    .enum(["PENDING", "EXECUTED", "FAILED", "REJECTED", "REQUIRES_APPROVAL"])
    .optional(),
  inputSource: z
    .enum(["EMAIL", "WEBHOOK", "DB_TRIGGER", "WORKER", "API", "SCHEDULE"])
    .optional(),
  decisionType: z
    .enum([
      "ASSIGN_PIPELINE",
      "CREATE_EVENT",
      "UPDATE_EVENT",
      "CANCEL_EVENT",
      "SEND_NOTIFICATION",
      "TRIGGER_AUTOMATION",
      "ESCALATE",
      "NO_ACTION",
    ])
    .optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

const createDecisionSchema = z.object({
  inputSource: z.enum(["EMAIL", "WEBHOOK", "DB_TRIGGER", "WORKER", "API", "SCHEDULE"]),
  inputType: z.string().min(1, "Input type is required"),
  inputData: z.record(z.unknown()),
  orgId: z.string().optional(),
});

// ============================================================================
// GET /api/agent/decisions - List decisions with filters
// ============================================================================

/**
 * GET /api/agent/decisions
 *
 * Lists agent decisions with optional filtering and pagination.
 *
 * Query parameters:
 * - status: Filter by decision status
 * - inputSource: Filter by input source
 * - decisionType: Filter by decision type
 * - startDate: Filter decisions created after this date
 * - endDate: Filter decisions created before this date
 * - limit: Number of results (default 20, max 100)
 * - offset: Pagination offset (default 0)
 *
 * Returns:
 * - 200: List of decisions with pagination and total count
 * - 400: Validation error
 * - 401: Unauthorized
 * - 500: Server error
 */
export async function GET(req: NextRequest) {
  try {
    // Get session for authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          details: "Authentication required to list decisions.",
        },
        { status: 401 }
      );
    }

    // Get user to determine org context
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { id: true, orgId: true, role: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Parse query parameters
    const { searchParams } = req.nextUrl;
    const params = {
      status: searchParams.get("status") || undefined,
      inputSource: searchParams.get("inputSource") || undefined,
      decisionType: searchParams.get("decisionType") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      limit: searchParams.get("limit") || "20",
      offset: searchParams.get("offset") || "0",
    };

    const parsed = listDecisionsSchema.safeParse(params);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid query parameters",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { status, inputSource, decisionType, startDate, endDate, limit, offset } =
      parsed.data;

    // Build where clause
    const where: Prisma.AgentDecisionWhereInput = {};

    // Scope to user's organization if they have one
    if (user.orgId) {
      where.orgId = user.orgId;
    }

    if (status) {
      where.status = status as DecisionStatus;
    }
    if (inputSource) {
      where.inputSource = inputSource as AgentInputSource;
    }
    if (decisionType) {
      where.decisionType = decisionType as DecisionType;
    }
    if (startDate) {
      where.createdAt = {
        ...(where.createdAt as Prisma.DateTimeFilter || {}),
        gte: new Date(startDate),
      };
    }
    if (endDate) {
      where.createdAt = {
        ...(where.createdAt as Prisma.DateTimeFilter || {}),
        lte: new Date(endDate),
      };
    }

    // Fetch decisions with pagination
    const [decisions, total] = await Promise.all([
      prisma.agentDecision.findMany({
        where,
        select: {
          id: true,
          agentId: true,
          orgId: true,
          inputSource: true,
          inputType: true,
          inputData: true,
          llmPrompt: true,
          llmResponse: true,
          confidence: true,
          reasoning: true,
          decisionType: true,
          actions: true,
          status: true,
          executionTime: true,
          errorMessage: true,
          createdAt: true,
          executedAt: true,
          agent: {
            select: {
              id: true,
              name: true,
              llmProvider: true,
              llmModel: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.agentDecision.count({ where }),
    ]);

    return NextResponse.json(
      {
        success: true,
        decisions,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Agent Decisions] Error listing decisions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/agent/decisions - Manually trigger agent processing
// ============================================================================

/**
 * POST /api/agent/decisions
 *
 * Manually triggers agent processing for a given input.
 * Creates an input and processes it through the orchestration agent.
 *
 * Request body:
 * - inputSource: 'EMAIL' | 'WEBHOOK' | 'DB_TRIGGER' | 'WORKER' | 'API' | 'SCHEDULE'
 * - inputType: string - Type of input (e.g., 'intake_created', 'form_submitted')
 * - inputData: object - The input data to process
 * - orgId?: string - Organization context (optional, uses user's org if not provided)
 *
 * Returns:
 * - 201: Decision created and processed
 * - 400: Validation error
 * - 401: Unauthorized
 * - 500: Server error
 */
export async function POST(req: NextRequest) {
  try {
    // Get session for authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          details: "Authentication required to trigger agent processing.",
        },
        { status: 401 }
      );
    }

    // Get user to determine org context
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { id: true, orgId: true, role: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const parsed = createDecisionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { inputSource, inputType, inputData } = parsed.data;
    const orgId = parsed.data.orgId || user.orgId;

    if (!orgId) {
      return NextResponse.json(
        {
          success: false,
          error: "Organization required",
          details: "User must belong to an organization or provide orgId.",
        },
        { status: 400 }
      );
    }

    // Verify organization exists
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { id: true, name: true },
    });

    if (!org) {
      return NextResponse.json(
        {
          success: false,
          error: "Organization not found",
        },
        { status: 404 }
      );
    }

    // Get or create an orchestration agent for this organization
    let orchestrationAgent = await prisma.orchestrationAgent.findFirst({
      where: {
        orgId,
        isActive: true,
      },
    });

    if (!orchestrationAgent) {
      // Create a default agent for the organization
      orchestrationAgent = await prisma.orchestrationAgent.create({
        data: {
          orgId,
          name: `${org.name} Agent`,
          llmProvider: "CLAUDE",
          llmModel: "claude-sonnet-4-20250514",
          systemPrompt: "You are an intelligent orchestration agent.",
          temperature: 0.3,
          maxTokens: 2000,
          isActive: true,
        },
      });
    }

    // Map Prisma enum to TypeScript enum
    const inputSourceMap: Record<string, TypeAgentInputSource> = {
      EMAIL: TypeAgentInputSource.EMAIL,
      WEBHOOK: TypeAgentInputSource.WEBHOOK,
      DB_TRIGGER: TypeAgentInputSource.DB_TRIGGER,
      WORKER: TypeAgentInputSource.WORKER,
      API: TypeAgentInputSource.API,
      SCHEDULE: TypeAgentInputSource.SCHEDULE,
    };

    // Create the orchestration agent instance
    const agent = createOrchestrationAgent({
      id: orchestrationAgent.id,
      orgId,
      name: orchestrationAgent.name,
      llmProvider:
        orchestrationAgent.llmProvider === "OPENAI"
          ? LLMProvider.OPENAI
          : LLMProvider.CLAUDE,
      llmModel: orchestrationAgent.llmModel,
      temperature: orchestrationAgent.temperature,
      maxTokens: orchestrationAgent.maxTokens,
      autoExecuteThreshold: 0.85,
      requireApprovalThreshold: 0.5,
      enabledActions: Object.values(TypeDecisionType),
      maxActionsPerMinute: orchestrationAgent.maxActionsPerMinute,
      maxActionsPerHour: orchestrationAgent.maxActionsPerHour,
      notifyOnHighPriority: true,
      notifyOnFailure: true,
      escalationEmail: user.email || "admin@example.com",
      dryRun: false,
    });

    const startTime = Date.now();

    // Process the input through the agent
    const result = await agent.process({
      source: inputSourceMap[inputSource],
      type: inputType,
      rawContent: JSON.stringify(inputData),
      structuredData: inputData as Record<string, unknown>,
      timestamp: new Date(),
      metadata: {
        senderEmail: user.email || undefined,
        senderName: user.name || undefined,
        relatedEntityIds: {
          userId: user.id,
        },
      },
    });

    const processingTime = Date.now() - startTime;

    // Store the decision in the database
    const decision = await prisma.agentDecision.create({
      data: {
        agentId: orchestrationAgent.id,
        orgId,
        inputSource: inputSource as AgentInputSource,
        inputType,
        inputData: inputData as Prisma.InputJsonValue,
        llmPrompt: `Input: ${inputType}`,
        llmResponse: result.reasoning,
        confidence: result.confidence,
        reasoning: result.reasoning,
        decisionType: (result.actions[0]?.type || "NO_ACTION") as DecisionType,
        actions: result.actions as unknown as Prisma.InputJsonValue,
        status: result.requiresApproval
          ? DecisionStatus.REQUIRES_APPROVAL
          : result.confidence >= 0.85
            ? DecisionStatus.EXECUTED
            : DecisionStatus.PENDING,
        executionTime: processingTime,
        executedAt: result.confidence >= 0.85 && !result.requiresApproval ? new Date() : null,
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            llmProvider: true,
            llmModel: true,
          },
        },
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Update agent statistics
    await prisma.orchestrationAgent.update({
      where: { id: orchestrationAgent.id },
      data: {
        totalDecisions: { increment: 1 },
        ...(decision.status === DecisionStatus.EXECUTED && {
          successfulDecisions: { increment: 1 },
        }),
      },
    });

    console.log(
      `[Agent Decisions] Decision created: ${decision.id} (type: ${decision.decisionType}, status: ${decision.status})`
    );

    return NextResponse.json(
      {
        success: true,
        decision: {
          id: decision.id,
          agentId: decision.agentId,
          orgId: decision.orgId,
          inputSource: decision.inputSource,
          inputType: decision.inputType,
          confidence: decision.confidence,
          reasoning: decision.reasoning,
          decisionType: decision.decisionType,
          actions: decision.actions,
          status: decision.status,
          executionTime: decision.executionTime,
          createdAt: decision.createdAt.toISOString(),
          executedAt: decision.executedAt?.toISOString() || null,
          agent: decision.agent,
          organization: decision.organization,
        },
        result: {
          intent: result.intent,
          confidence: result.confidence,
          requiresApproval: result.requiresApproval,
          actions: result.actions,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Agent Decisions] Error processing input:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

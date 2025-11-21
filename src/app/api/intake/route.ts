import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { IntakeSource, IntakeStatus } from "@prisma/client";

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
 * Capture intake request and route using AI logic
 *
 * This endpoint:
 * 1. Validates and stores the intake request
 * 2. Applies AI routing logic (placeholder for now)
 * 3. Assigns to appropriate pipeline
 * 4. Returns routing result
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

    // AI Routing Logic Placeholder
    // TODO: Implement actual AI routing based on:
    // - Request content analysis
    // - Historical patterns
    // - Available pipelines
    // - Current workload
    const aiRoutingResult = await performAIRouting({
      title,
      description,
      requestData,
      orgId,
    });

    // Create intake request with routing metadata
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
          routedAt: new Date().toISOString(),
        },
      },
      include: {
        pipeline: true,
      },
    });

    return NextResponse.json(
      {
        intakeRequest,
        routing: {
          assigned: !!aiRoutingResult.assignedPipeline,
          confidence: aiRoutingResult.confidence,
          reasoning: aiRoutingResult.reasoning,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error processing intake request:", error);
    return NextResponse.json(
      { error: "Failed to process intake request" },
      { status: 500 },
    );
  }
}

/**
 * AI Routing Logic Placeholder
 *
 * In production, this would:
 * - Analyze request content using NLP/LLM
 * - Match against pipeline definitions
 * - Consider current workload and capacity
 * - Apply business rules and priorities
 *
 * For now, returns a basic routing decision
 */
async function performAIRouting(params: {
  title: string;
  description?: string;
  requestData: any;
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

  // Basic keyword-based routing (placeholder for AI logic)
  const content = `${params.title} ${params.description || ""}`.toLowerCase();

  // Simple pattern matching (to be replaced with actual AI)
  let selectedPipeline = null;
  let confidence = 0.3; // Low confidence for basic routing
  let reasoning = "Default routing to first available pipeline";

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

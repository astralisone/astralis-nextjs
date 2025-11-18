import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createAutomationSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  workflowId: z.string().optional(),
  webhookUrl: z.string().url().optional(),
  triggerConfig: z.any(),
  isActive: z.boolean().optional().default(true),
  orgId: z.string(),
});

const updateAutomationSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  workflowId: z.string().optional(),
  webhookUrl: z.string().url().optional(),
  triggerConfig: z.any().optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /api/automations
 * List all automations for an organization
 *
 * Query params:
 * - orgId: Filter by organization
 * - isActive: Filter by active status
 * - limit: Number of results (default: 50)
 * - offset: Pagination offset (default: 0)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const orgId = searchParams.get("orgId");
    const isActive = searchParams.get("isActive");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {};

    if (orgId) where.orgId = orgId;
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    const [automations, total] = await Promise.all([
      prisma.automation.findMany({
        where,
        orderBy: [
          { isActive: "desc" },
          { lastRunAt: "desc" },
          { createdAt: "desc" },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.automation.count({ where }),
    ]);

    return NextResponse.json({
      automations,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching automations:", error);
    return NextResponse.json(
      { error: "Failed to fetch automations" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/automations
 * Create a new automation workflow
 *
 * Body:
 * {
 *   name: string
 *   description?: string
 *   workflowId?: string (n8n workflow ID)
 *   webhookUrl?: string (webhook endpoint)
 *   triggerConfig: any (trigger configuration)
 *   isActive?: boolean
 *   orgId: string
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createAutomationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { name, description, workflowId, webhookUrl, triggerConfig, isActive, orgId } = parsed.data;

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

    // Create automation
    const automation = await prisma.automation.create({
      data: {
        name,
        description,
        workflowId,
        webhookUrl,
        triggerConfig,
        isActive: isActive ?? true,
        orgId,
        runCount: 0,
      },
    });

    return NextResponse.json(automation, { status: 201 });
  } catch (error) {
    console.error("Error creating automation:", error);
    return NextResponse.json(
      { error: "Failed to create automation" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/automations
 * Update an existing automation
 *
 * Body:
 * {
 *   id: string
 *   ...update fields
 * }
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Automation ID is required" },
        { status: 400 },
      );
    }

    const parsed = updateAutomationSchema.safeParse(updateData);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // Check if automation exists
    const existingAutomation = await prisma.automation.findUnique({
      where: { id },
    });

    if (!existingAutomation) {
      return NextResponse.json(
        { error: "Automation not found" },
        { status: 404 },
      );
    }

    // Update automation
    const automation = await prisma.automation.update({
      where: { id },
      data: {
        ...parsed.data,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(automation);
  } catch (error) {
    console.error("Error updating automation:", error);
    return NextResponse.json(
      { error: "Failed to update automation" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/automations
 * Toggle automation active status or update webhook URL
 *
 * Body:
 * {
 *   id: string
 *   isActive?: boolean
 *   webhookUrl?: string
 * }
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, isActive, webhookUrl } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Automation ID is required" },
        { status: 400 },
      );
    }

    // Check if automation exists
    const existingAutomation = await prisma.automation.findUnique({
      where: { id },
    });

    if (!existingAutomation) {
      return NextResponse.json(
        { error: "Automation not found" },
        { status: 404 },
      );
    }

    const updateData: any = { updatedAt: new Date() };

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    if (webhookUrl !== undefined) {
      // Validate webhook URL format
      if (webhookUrl && !z.string().url().safeParse(webhookUrl).success) {
        return NextResponse.json(
          { error: "Invalid webhook URL format" },
          { status: 400 },
        );
      }
      updateData.webhookUrl = webhookUrl;
    }

    // Update automation
    const automation = await prisma.automation.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      automation,
      message: isActive !== undefined
        ? `Automation ${automation.isActive ? "activated" : "deactivated"} successfully`
        : "Automation updated successfully",
    });
  } catch (error) {
    console.error("Error patching automation:", error);
    return NextResponse.json(
      { error: "Failed to update automation" },
      { status: 500 },
    );
  }
}

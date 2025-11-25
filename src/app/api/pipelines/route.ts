import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createPipelineSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  orgId: z.string(),
});

const pipelineFiltersSchema = z.object({
  orgId: z.string().min(1),
  search: z.string().optional().nullable(),
  isActive: z.enum(["true", "false"]).optional().nullable(),
});

/**
 * GET /api/pipelines
 * List pipelines with optional filters
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const filters = {
      orgId: searchParams.get("orgId"),
      search: searchParams.get("search"),
      isActive: searchParams.get("isActive"),
    };

    const parsed = pipelineFiltersSchema.safeParse(filters);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid filters", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { orgId, search, isActive } = parsed.data;

    // Build where clause
    const where: any = { orgId };

    if (isActive !== undefined && isActive !== null) {
      where.isActive = isActive === "true";
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const pipelines = await prisma.pipeline.findMany({
      where,
      include: {
        stages: {
          orderBy: { order: "asc" },
          include: {
            _count: {
              select: { items: true },
            },
          },
        },
        _count: {
          select: { stages: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      pipelines,
      total: pipelines.length,
    });
  } catch (error) {
    console.error("Error fetching pipelines:", error);
    return NextResponse.json(
      { error: "Failed to fetch pipelines" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pipelines
 * Create a new pipeline
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createPipelineSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Generate key from name (kebab-case)
    const key = parsed.data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const pipeline = await prisma.pipeline.create({
      data: {
        name: parsed.data.name,
        key,
        description: parsed.data.description,
        orgId: parsed.data.orgId,
      },
      include: {
        stages: true,
      },
    });

    return NextResponse.json(pipeline, { status: 201 });
  } catch (error) {
    console.error("Error creating pipeline:", error);
    return NextResponse.json(
      { error: "Failed to create pipeline" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createPipelineSchema,
  pipelineFiltersSchema,
} from "@/lib/validators/pipeline.validators";
import { getTemplateByKey } from "@/lib/services/defaultPipelines.service";

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
 *
 * Create a new pipeline, either from a template or as a custom pipeline.
 *
 * Request Body:
 * - name: string (required) - Pipeline name
 * - description: string (optional) - Pipeline description
 * - orgId: string (required) - Organization ID
 * - templateKey: string (optional) - Template to use (e.g., 'sales', 'support', 'generic')
 * - type: PipelineType (optional) - Pipeline type, inferred from template if not provided
 *
 * Template-based Creation:
 * If templateKey is provided, the pipeline will be created with stages from that template.
 * The type will be set from the template unless explicitly overridden.
 *
 * Custom Creation:
 * If no templateKey is provided, an empty pipeline is created with type CUSTOM.
 * Stages must be added separately via the stages API.
 *
 * Response: Created pipeline with stages (if from template)
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

    const { name, description, orgId, templateKey, type } = parsed.data;

    // Generate key from name (kebab-case)
    const key = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if template-based creation
    if (templateKey) {
      const template = getTemplateByKey(templateKey);

      if (!template) {
        return NextResponse.json(
          { error: `Invalid template key: ${templateKey}` },
          { status: 400 }
        );
      }

      // Create pipeline with stages from template
      const pipeline = await prisma.pipeline.create({
        data: {
          name,
          key,
          description: description || template.description,
          type: type || template.type,
          isActive: true,
          orgId,
          stages: {
            create: template.stages.map((stage) => ({
              name: stage.name,
              key: stage.key,
              description: stage.description,
              order: stage.order,
              color: stage.color,
              isTerminal: stage.isTerminal,
            })),
          },
        },
        include: {
          stages: {
            orderBy: { order: 'asc' },
          },
        },
      });

      return NextResponse.json(pipeline, { status: 201 });
    }

    // Custom pipeline creation (no template)
    const pipeline = await prisma.pipeline.create({
      data: {
        name,
        key,
        description,
        type: type || 'CUSTOM',
        isActive: true,
        orgId,
      },
      include: {
        stages: true,
      },
    });

    return NextResponse.json(pipeline, { status: 201 });
  } catch (error) {
    console.error("Error creating pipeline:", error);

    // Handle unique constraint violation (duplicate pipeline name)
    if (error instanceof Error && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: "A pipeline with this name already exists in your organization" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create pipeline" },
      { status: 500 }
    );
  }
}

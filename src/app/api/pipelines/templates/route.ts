import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getPipelineTemplates, getTemplateByKey } from "@/lib/services/defaultPipelines.service";
import type { PipelineTemplate, PipelineTemplatesResponse } from "@/types/pipeline-templates";

/**
 * Template metadata enrichment
 * Adds UI-friendly metadata to each template for better presentation
 */
const TEMPLATE_METADATA: Record<
  string,
  {
    icon: string;
    category: string;
    tags: string[];
    useCases: string[];
    estimatedVolume: "low" | "medium" | "high";
    supportsAutomation: boolean;
  }
> = {
  sales: {
    icon: "chart-line",
    category: "revenue",
    tags: ["crm", "deals", "revenue", "b2b"],
    useCases: [
      "Track leads from initial contact to closed deal",
      "Manage sales funnel metrics and conversion rates",
      "Coordinate sales team activities and handoffs",
    ],
    estimatedVolume: "high",
    supportsAutomation: true,
  },
  support: {
    icon: "headset",
    category: "customer_service",
    tags: ["tickets", "helpdesk", "customer support", "service"],
    useCases: [
      "Manage customer support tickets and inquiries",
      "Track issue resolution and response times",
      "Coordinate support team workload distribution",
    ],
    estimatedVolume: "high",
    supportsAutomation: true,
  },
  billing: {
    icon: "dollar-sign",
    category: "finance",
    tags: ["invoices", "payments", "accounts receivable", "finance"],
    useCases: [
      "Track invoice creation and delivery",
      "Monitor payment status and overdue accounts",
      "Manage collections and payment disputes",
    ],
    estimatedVolume: "medium",
    supportsAutomation: true,
  },
  internal: {
    icon: "briefcase",
    category: "operations",
    tags: ["tasks", "projects", "internal", "team"],
    useCases: [
      "Manage internal team tasks and projects",
      "Track operational initiatives and dependencies",
      "Coordinate cross-functional team efforts",
    ],
    estimatedVolume: "medium",
    supportsAutomation: false,
  },
  generic: {
    icon: "list-check",
    category: "general",
    tags: ["simple", "flexible", "basic", "starter"],
    useCases: [
      "Quick start for any workflow type",
      "Flexible task management without complexity",
      "Test and prototype new processes",
    ],
    estimatedVolume: "low",
    supportsAutomation: false,
  },
  custom: {
    icon: "wrench",
    category: "custom",
    tags: ["custom", "flexible", "adaptable"],
    useCases: [
      "Build a completely custom workflow from scratch",
      "Tailor stages to unique business processes",
      "Experiment with new pipeline configurations",
    ],
    estimatedVolume: "low",
    supportsAutomation: false,
  },
};

/**
 * Convert DefaultPipelineDefinition to PipelineTemplate with metadata
 */
function enrichTemplateWithMetadata(
  definition: ReturnType<typeof getPipelineTemplates>[0]
): PipelineTemplate {
  const metadata = TEMPLATE_METADATA[definition.key] || {
    icon: "folder",
    category: "other",
    tags: [],
    useCases: [],
    estimatedVolume: "low" as const,
    supportsAutomation: false,
  };

  return {
    key: definition.key,
    name: definition.name,
    type: definition.type,
    description: definition.description,
    isDefault: definition.isDefault,
    stages: definition.stages,
    metadata,
  };
}

/**
 * GET /api/pipelines/templates
 * Get all available pipeline templates with enhanced metadata
 *
 * Query Parameters:
 * - key: Filter to a specific template by key
 * - type: Filter by PipelineType (SALES, SUPPORT, etc.)
 * - category: Filter by category (revenue, customer_service, etc.)
 * - search: Search in name/description/tags
 * - automationOnly: Only show templates with automation support (true/false)
 *
 * Response Formats:
 * - If key is provided: Single PipelineTemplate object
 * - Otherwise: PipelineTemplatesResponse with templates, total, categories
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const templateKey = searchParams.get("key");

    // Get all template definitions
    const rawTemplates = getPipelineTemplates();

    // If specific template requested, return it with metadata
    if (templateKey) {
      const template = rawTemplates.find((t) => t.key === templateKey);

      if (!template) {
        return NextResponse.json(
          { error: `Template not found: ${templateKey}` },
          { status: 404 }
        );
      }

      const enrichedTemplate = enrichTemplateWithMetadata(template);
      return NextResponse.json(enrichedTemplate);
    }

    // Parse optional filters
    const filters = {
      type: searchParams.get("type"),
      category: searchParams.get("category"),
      search: searchParams.get("search"),
      automationOnly: searchParams.get("automationOnly") === "true",
    };

    // Enrich all templates with metadata
    let templates: PipelineTemplate[] = rawTemplates.map(enrichTemplateWithMetadata);

    // Apply filters
    if (filters.type) {
      templates = templates.filter((t) => t.type === filters.type);
    }

    if (filters.category) {
      templates = templates.filter((t) => t.metadata.category === filters.category);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      templates = templates.filter(
        (t) =>
          t.name.toLowerCase().includes(searchLower) ||
          t.description.toLowerCase().includes(searchLower) ||
          t.metadata.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    if (filters.automationOnly) {
      templates = templates.filter((t) => t.metadata.supportsAutomation);
    }

    // Find default template
    const defaultTemplate = templates.find((t) => t.isDefault);
    const defaultTemplateKey = defaultTemplate?.key || "generic";

    // Group by category for easier UI rendering
    const categories = templates.reduce(
      (acc, template) => {
        const category = template.metadata.category || "other";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(template);
        return acc;
      },
      {} as Record<string, PipelineTemplate[]>
    );

    // Build comprehensive response
    const response: PipelineTemplatesResponse = {
      templates,
      total: templates.length,
      defaultTemplateKey,
      categories,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching pipeline templates:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch pipeline templates",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Validation schema for creating a pipeline from a template
 */
const createFromTemplateSchema = z.object({
  templateKey: z.string().min(1, "Template key is required"),
  name: z.string().optional(),
  description: z.string().optional(),
  orgId: z.string().min(1, "Organization ID is required"),
  stageColorOverrides: z.record(z.string()).optional(),
  includeStages: z.array(z.string()).optional(),
});

/**
 * POST /api/pipelines/templates
 * Create a new pipeline from a template
 *
 * Request Body:
 * {
 *   templateKey: string;              // Required: Template to use (e.g., 'sales')
 *   name?: string;                    // Optional: Custom pipeline name
 *   description?: string;             // Optional: Custom description
 *   orgId: string;                    // Required: Organization ID
 *   stageColorOverrides?: {           // Optional: Override stage colors
 *     [stageKey: string]: string;     // e.g., { "new_lead": "#FF0000" }
 *   };
 *   includeStages?: string[];         // Optional: Only include specific stages
 * }
 *
 * Response: Created pipeline with stages
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createFromTemplateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { templateKey, name, description, orgId, stageColorOverrides, includeStages } =
      parsed.data;

    // Get the template definition
    const template = getTemplateByKey(templateKey);
    if (!template) {
      return NextResponse.json(
        {
          error: "Template not found",
          details: `No template found with key: ${templateKey}`,
        },
        { status: 404 }
      );
    }

    // Verify organization exists
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { id: true },
    });

    if (!org) {
      return NextResponse.json(
        {
          error: "Organization not found",
          details: `No organization found with ID: ${orgId}`,
        },
        { status: 404 }
      );
    }

    // Prepare stages (filter if includeStages specified)
    let stagesToCreate = template.stages;
    if (includeStages && includeStages.length > 0) {
      stagesToCreate = template.stages.filter((stage) => includeStages.includes(stage.key));

      if (stagesToCreate.length === 0) {
        return NextResponse.json(
          {
            error: "No valid stages selected",
            details: "includeStages filter resulted in no stages to create",
          },
          { status: 400 }
        );
      }

      // Re-order stages after filtering
      stagesToCreate = stagesToCreate.map((stage, index) => ({
        ...stage,
        order: index,
      }));
    }

    // Apply color overrides if provided
    if (stageColorOverrides) {
      stagesToCreate = stagesToCreate.map((stage) => ({
        ...stage,
        color: stageColorOverrides[stage.key] || stage.color,
      }));
    }

    // Generate pipeline key from name or template
    const pipelineName = name || template.name;
    const pipelineKey = pipelineName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Create pipeline with stages
    const pipeline = await prisma.pipeline.create({
      data: {
        name: pipelineName,
        key: pipelineKey,
        type: template.type,
        description: description || template.description,
        isActive: true,
        orgId,
        stages: {
          create: stagesToCreate.map((stage) => ({
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
          orderBy: { order: "asc" },
        },
      },
    });

    // Build response
    return NextResponse.json(
      {
        id: pipeline.id,
        name: pipeline.name,
        key: pipeline.key,
        type: pipeline.type,
        templateKey: template.key,
        stages: pipeline.stages.map((stage) => ({
          id: stage.id,
          key: stage.key,
          name: stage.name,
          order: stage.order,
          color: stage.color || "",
          isTerminal: stage.isTerminal,
        })),
        createdAt: pipeline.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating pipeline from template:", error);

    // Handle Prisma unique constraint violation
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        {
          error: "Pipeline already exists",
          details: "A pipeline with this name or key already exists for this organization",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create pipeline from template",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

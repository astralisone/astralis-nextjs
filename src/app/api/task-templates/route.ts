import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const templateFiltersSchema = z.object({
  category: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  search: z.string().optional().nullable(),
});

/**
 * GET /api/task-templates
 * List available task templates
 *
 * Task templates define the behavior and workflow for different task types.
 * They are used by OrchestrationAgent to create TaskInstances.
 *
 * Query parameters:
 * - category: Filter by category (e.g., SALES_INQUIRY, SUPPORT_TICKET)
 * - department: Filter by department (e.g., Sales, Support)
 * - search: Text search in label
 *
 * Returns:
 * - Array of task templates with metadata
 * - Each template includes:
 *   - Basic info (id, label, category)
 *   - Pipeline routing (preferredPipelineKey, defaultStageKey)
 *   - SLA info (typicalMinutes, defaultPriority)
 *   - Full definition (steps, agentConfig, etc.)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const filters = {
      category: searchParams.get("category"),
      department: searchParams.get("department"),
      search: searchParams.get("search"),
    };

    const parsed = templateFiltersSchema.safeParse(filters);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid filters", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { category, department, search } = parsed.data;

    const where: any = {};

    if (category) where.category = category;
    if (department) where.department = department;
    if (search) {
      where.label = {
        contains: search,
        mode: "insensitive",
      };
    }

    const templates = await prisma.taskTemplate.findMany({
      where,
      orderBy: [
        { category: "asc" },
        { label: "asc" },
      ],
      include: {
        _count: {
          select: {
            tasks: true,
            decisionLogs: true,
          },
        },
      },
    });

    // Transform to include parsed definition data
    const templatesWithStats = templates.map(template => {
      const definition = template.definition as any;

      return {
        id: template.id,
        label: template.label,
        category: template.category,
        department: template.department,
        staffRole: template.staffRole,
        typicalMinutes: template.typicalMinutes,
        defaultPriority: template.defaultPriority,
        applicableSources: template.applicableSources,
        pipeline: {
          preferredPipelineKey: template.preferredPipelineKey,
          defaultStageKey: template.defaultStageKey,
        },
        steps: definition?.steps || [],
        agentConfig: definition?.agentConfig || null,
        stats: {
          totalTasks: template._count.tasks,
          totalDecisions: template._count.decisionLogs,
        },
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      };
    });

    return NextResponse.json({
      templates: templatesWithStats,
      total: templatesWithStats.length,
    });
  } catch (error) {
    console.error("Error fetching task templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch task templates" },
      { status: 500 }
    );
  }
}

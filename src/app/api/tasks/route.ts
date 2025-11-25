import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { TaskSource, TaskStatus } from "@prisma/client";
import { emitTaskCreated } from "@/lib/events/taskEvents";

const createTaskSchema = z.object({
  templateId: z.string().min(1),
  orgId: z.string().min(1),
  source: z.enum(["FORM", "EMAIL", "CHAT", "API", "CALL"]),
  sourceId: z.string().optional(),
  title: z.string().min(2),
  description: z.string().optional(),
  priority: z.number().int().min(1).max(5).optional(),
  data: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  assignedToUserId: z.string().optional(),
});

const taskFiltersSchema = z.object({
  orgId: z.string().min(1),
  status: z.enum(["NEW", "IN_PROGRESS", "NEEDS_REVIEW", "BLOCKED", "DONE", "CANCELLED"]).optional().nullable(),
  source: z.enum(["FORM", "EMAIL", "CHAT", "API", "CALL"]).optional().nullable(),
  pipelineKey: z.string().optional().nullable(),
  stageKey: z.string().optional().nullable(),
  assignedToUserId: z.string().optional().nullable(),
  templateId: z.string().optional().nullable(),
  search: z.string().optional().nullable(),
  tags: z.string().optional().nullable(), // Comma-separated tags
  overridden: z.enum(["true", "false"]).optional().nullable(),
  limit: z.string().optional().nullable(),
  offset: z.string().optional().nullable(),
});

/**
 * POST /api/tasks
 * Create a new task instance from a template
 *
 * This endpoint:
 * 1. Validates the task creation payload
 * 2. Loads the task template to get default values
 * 3. Creates a new task instance
 * 4. Emits task:created event to trigger BaseTaskAgent
 * 5. Returns the created task
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      templateId,
      orgId,
      source,
      sourceId,
      title,
      description,
      priority,
      data,
      tags,
      assignedToUserId,
    } = parsed.data;

    // Verify organization exists
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Load task template
    const template = await prisma.taskTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Task template not found" },
        { status: 404 }
      );
    }

    const templateDef = template.definition as any;

    // Find pipeline and default stage
    const pipeline = await prisma.pipeline.findFirst({
      where: {
        orgId,
        key: template.preferredPipelineKey,
      },
      include: {
        stages: {
          where: { key: template.defaultStageKey },
        },
      },
    });

    const defaultStage = pipeline?.stages?.[0];

    // Create task instance
    const task = await prisma.task.create({
      data: {
        templateId: template.id,
        orgId,
        source: source as TaskSource,
        sourceId,
        title,
        description,
        type: template.id,
        category: template.category,
        department: template.department,
        staffRole: template.staffRole,
        priority: priority || template.defaultPriority,
        status: TaskStatus.NEW,
        pipelineId: pipeline?.id,
        pipelineKey: template.preferredPipelineKey,
        stageId: defaultStage?.id,
        stageKey: template.defaultStageKey,
        typicalMinutes: template.typicalMinutes,
        timeline: {
          typicalMinutes: template.typicalMinutes,
          startedAt: new Date().toISOString(),
          dueAt: new Date(Date.now() + template.typicalMinutes * 60 * 1000).toISOString(),
        },
        steps: templateDef?.steps?.map((s: any) => ({
          id: s.id,
          status: "NEW",
        })) || [],
        data: data || {},
        tags: tags || [],
        assignedToUserId,
        overridden: false,
        agentDecisionIds: [],
      },
      include: {
        template: true,
        pipeline: true,
        stage: true,
      },
    });

    // Emit task:created event to trigger BaseTaskAgent
    await emitTaskCreated(
      {
        id: task.id,
        orgId: task.orgId,
        source: task.source as TaskSource,
        type: task.type,
        category: task.category,
        priority: task.priority,
      },
      { correlationId: task.id }
    );

    return NextResponse.json(
      {
        task,
        message: "Task created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      {
        error: "Failed to create task",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/tasks
 * List tasks with optional filtering
 *
 * Query parameters:
 * - orgId: Required organization ID
 * - status: Filter by task status
 * - source: Filter by source channel
 * - pipelineKey: Filter by pipeline
 * - stageKey: Filter by stage
 * - assignedToUserId: Filter by assignee
 * - templateId: Filter by template
 * - search: Text search in title/description
 * - tags: Comma-separated tags to filter by
 * - overridden: Filter by override flag (true/false)
 * - limit: Number of results (default 50)
 * - offset: Pagination offset (default 0)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const filters = {
      orgId: searchParams.get("orgId"),
      status: searchParams.get("status"),
      source: searchParams.get("source"),
      pipelineKey: searchParams.get("pipelineKey"),
      stageKey: searchParams.get("stageKey"),
      assignedToUserId: searchParams.get("assignedToUserId"),
      templateId: searchParams.get("templateId"),
      search: searchParams.get("search"),
      tags: searchParams.get("tags"),
      overridden: searchParams.get("overridden"),
      limit: searchParams.get("limit"),
      offset: searchParams.get("offset"),
    };

    const parsed = taskFiltersSchema.safeParse(filters);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid filters", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      orgId,
      status,
      source,
      pipelineKey,
      stageKey,
      assignedToUserId,
      templateId,
      search,
      tags,
      overridden,
      limit: limitStr,
      offset: offsetStr,
    } = parsed.data;

    const limit = parseInt(limitStr || "50");
    const offset = parseInt(offsetStr || "0");

    const where: any = { orgId };

    if (status) where.status = status as TaskStatus;
    if (source) where.source = source as TaskSource;
    if (pipelineKey) where.pipelineKey = pipelineKey;
    if (stageKey) where.stageKey = stageKey;
    if (assignedToUserId) where.assignedToUserId = assignedToUserId;
    if (templateId) where.templateId = templateId;
    if (overridden !== null && overridden !== undefined) {
      where.overridden = overridden === "true";
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (tags) {
      const tagArray = tags.split(",").map(t => t.trim());
      where.tags = {
        hasSome: tagArray,
      };
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          template: {
            select: { id: true, label: true, category: true },
          },
          pipeline: {
            select: { id: true, name: true, key: true },
          },
          stage: {
            select: { id: true, name: true, key: true },
          },
        },
        orderBy: [
          { priority: "desc" },
          { createdAt: "desc" },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.task.count({ where }),
    ]);

    return NextResponse.json({
      tasks,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

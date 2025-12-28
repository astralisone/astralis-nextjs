import { ActionExecutor } from '../core/ActionExecutor';
import { DecisionType } from '../types/agent.types';
import { prisma } from '@/lib/prisma';

/**
 * Register Omniscient Tools handlers to the ActionExecutor
 */
export function registerOmniscientHandlers(executor: ActionExecutor): void {

    // GET_INTEGRATIONS_STATUS
    executor.registerHandler(
        DecisionType.GET_INTEGRATIONS_STATUS,
        async (_params, context) => {
            const orgId = context.orgId;
            if (!orgId) return { success: false, error: 'No Organization ID in context' };

            try {
                const integrations = await prisma.organizationIntegrationConfig.findMany({
                    where: { orgId },
                    select: {
                        provider: true,
                        isEnabled: true,
                        createdAt: true,
                        updatedAt: true
                    }
                });

                return {
                    success: true,
                    data: {
                        integrations: integrations.map(i => ({
                            provider: i.provider,
                            status: i.isEnabled ? 'ACTIVE' : 'INACTIVE',
                            lastUpdated: i.updatedAt
                        })),
                        count: integrations.length
                    }
                };
            } catch (error) {
                return { success: false, error: `Failed to fetch integrations: ${(error as Error).message}` };
            }
        }
    );

    // LIST_ACTIVE_AUTOMATIONS
    executor.registerHandler(
        DecisionType.LIST_ACTIVE_AUTOMATIONS,
        async (_params, context) => {
            const orgId = context.orgId;
            if (!orgId) return { success: false, error: 'No Organization ID in context' };

            try {
                const automations = await prisma.automation.findMany({
                    where: { orgId, isEnabled: true },
                    select: {
                        id: true,
                        name: true,
                        triggerType: true,
                        description: true
                    }
                });

                return {
                    success: true,
                    data: {
                        automations: automations,
                        count: automations.length
                    }
                };
            } catch (error) {
                return { success: false, error: `Failed to fetch automations: ${(error as Error).message}` };
            }
        }
    );

    // GET_KANBAN_STATE
    executor.registerHandler(
        DecisionType.GET_KANBAN_STATE,
        async (params: any, context) => {
            const orgId = context.orgId;
            if (!orgId) return { success: false, error: 'No Organization ID in context' };

            const limit = params.limit || 50;
            const statusFilter = params.status; // Optional filter

            try {
                const where: any = { orgId };
                if (statusFilter) {
                    where.status = statusFilter;
                }

                const tasks = await prisma.task.findMany({
                    where,
                    take: limit,
                    orderBy: { updatedAt: 'desc' },
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        priority: true,
                        assigneeId: true,
                        pipelineKey: true,
                        stageKey: true
                    }
                });

                // Group by status/stage for "Kanban" view
                const kanban: Record<string, any[]> = {};
                tasks.forEach(task => {
                    const key = task.stageKey || task.status;
                    if (!kanban[key]) kanban[key] = [];
                    kanban[key].push(task);
                });

                return {
                    success: true,
                    data: {
                        tasks,
                        kanbanView: kanban,
                        total: tasks.length
                    }
                };
            } catch (error) {
                return { success: false, error: `Failed to fetch Kanban state: ${(error as Error).message}` };
            }
        }
    );

    // SEARCH_DOCUMENTS
    executor.registerHandler(
        DecisionType.SEARCH_DOCUMENTS,
        async (params: any, context) => {
            const orgId = context.orgId;
            if (!orgId) return { success: false, error: 'No Organization ID in context' };

            const query = params.query as string;
            if (!query) return { success: false, error: 'Missing query parameter' };

            try {
                // Dynamic import to avoid circular interactions or load only when needed
                const { getVectorSearchService } = await import('@/lib/services/vector-search.service');
                const vectorService = getVectorSearchService();

                // Use authentic vector search
                const results = await vectorService.search(query, orgId, undefined, 5);

                return {
                    success: true,
                    data: {
                        documents: results.map(r => ({
                            documentId: r.documentId,
                            score: r.similarity,
                            contentSnippet: r.content.substring(0, 200) + '...',
                            metadata: r.metadata
                        })),
                        matches: results.length,
                        provider: 'VectorSearchService'
                    }
                };
            } catch (error) {
                return { success: false, error: `Vector search failed: ${(error as Error).message}` };
            }
        }
    );

    // LIST_TASK_TEMPLATES
    executor.registerHandler(
        DecisionType.LIST_TASK_TEMPLATES,
        async (_params, _context) => {
            try {
                const templates = await prisma.taskTemplate.findMany({
                    select: {
                        id: true,
                        label: true,
                        category: true,
                        department: true,
                        typicalMinutes: true,
                        definition: true
                    }
                });

                return {
                    success: true,
                    data: {
                        templates: templates.map(t => ({
                            id: t.id,
                            label: t.label,
                            category: t.category,
                            department: t.department,
                            typicalMinutes: t.typicalMinutes,
                            // Minimal definition info to avoid overwhelming context
                            requiresInfo: (t.definition as any)?.steps?.map((s: any) => s.label) || []
                        })),
                        count: templates.length
                    }
                };
            } catch (error) {
                return { success: false, error: `Failed to fetch task templates: ${(error as Error).message}` };
            }
        }
    );

    // LIST_PIPELINES
    executor.registerHandler(
        DecisionType.LIST_PIPELINES,
        async (_params, context) => {
            const orgId = context.orgId;
            if (!orgId) return { success: false, error: 'No Organization ID in context' };

            try {
                const pipelines = await prisma.pipeline.findMany({
                    where: { orgId },
                    include: {
                        stages: {
                            orderBy: { order: 'asc' }
                        }
                    }
                });

                return {
                    success: true,
                    data: {
                        pipelines: pipelines.map(p => ({
                            id: p.id,
                            name: p.name,
                            type: p.type,
                            stages: p.stages.map(s => ({
                                id: s.id,
                                name: s.name,
                                key: s.key
                            }))
                        })),
                        count: pipelines.length
                    }
                };
            } catch (error) {
                return { success: false, error: `Failed to fetch pipelines: ${(error as Error).message}` };
            }
        }
    );

    // CREATE_PIPELINE
    executor.registerHandler(
        DecisionType.CREATE_PIPELINE,
        async (params: any, context) => {
            const orgId = context.orgId;
            if (!orgId) return { success: false, error: 'No Organization ID in context' };

            try {
                const pipeline = await prisma.pipeline.create({
                    data: {
                        orgId,
                        name: params.name,
                        description: params.description,
                        type: params.type || 'CUSTOM',
                        isActive: true,
                        stages: {
                            create: params.stages.map((s: any) => ({
                                name: s.name,
                                key: s.name.toLowerCase().replace(/ /g, '_'),
                                description: s.description || '',
                                order: s.order || 0,
                                color: s.color || '#3B82F6',
                                isTerminal: s.isTerminal || false
                            }))
                        }
                    },
                    include: { stages: true }
                });

                return {
                    success: true,
                    data: {
                        pipelineId: pipeline.id,
                        name: pipeline.name,
                        stageCount: pipeline.stages.length
                    }
                };
            } catch (error) {
                return { success: false, error: `Failed to create pipeline: ${(error as Error).message}` };
            }
        }
    );
}

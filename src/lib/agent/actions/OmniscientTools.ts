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
}

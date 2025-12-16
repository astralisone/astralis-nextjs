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
                // Basic search using contains
                // In a real implementation, this would use vector search or full-text search
                const documents = await prisma.document.findMany({
                    where: {
                        orgId,
                        OR: [
                            { fileName: { contains: query, mode: 'insensitive' } },
                            { summary: { contains: query, mode: 'insensitive' } }
                        ]
                    },
                    take: 5,
                    select: {
                        id: true,
                        fileName: true,
                        documentType: true,
                        summary: true,
                        createdAt: true
                    }
                });

                return {
                    success: true,
                    data: {
                        documents,
                        matches: documents.length
                    }
                };
            } catch (error) {
                return { success: false, error: `Search failed: ${(error as Error).message}` };
            }
        }
    );
}

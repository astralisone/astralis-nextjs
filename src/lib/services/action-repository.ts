/**
 * Action Repository Service
 *
 * Core service for storing, retrieving, and managing AI-discovered actions.
 * Actions are cached to avoid repeated AI inference costs.
 */

import { prisma } from '@/lib/prisma';
import {
  IActionRepository,
  ActionDefinition,
  ActionSearchFilters,
  ActionStats,
  IntegrationProvider
} from '@/lib/types/action';
import { ActionStatus } from '@prisma/client';

export class ActionRepository implements IActionRepository {
  /**
   * Save a new action definition
   */
  async save(action: Omit<ActionDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<ActionDefinition> {
    const saved = await prisma.actionDefinition.create({
      data: {
        actionKey: action.actionKey,
        provider: action.provider,
        name: action.name,
        description: action.description,
        category: action.category,
        inputSchema: action.inputSchema as any,
        outputSchema: action.outputSchema as any,
        executionSpec: action.executionSpec as any,
        version: action.version,
        status: action.status,
        tags: action.tags,
        executionCount: action.executionCount,
        lastExecutedAt: action.lastExecutedAt,
      },
    });

    return this.mapToActionDefinition(saved);
  }

  /**
   * Find action by ID
   */
  async findById(id: string): Promise<ActionDefinition | null> {
    const action = await prisma.actionDefinition.findUnique({
      where: { id },
    });

    return action ? this.mapToActionDefinition(action) : null;
  }

  /**
   * Find action by unique key
   */
  async findByKey(actionKey: string): Promise<ActionDefinition | null> {
    const action = await prisma.actionDefinition.findUnique({
      where: { actionKey },
    });

    return action ? this.mapToActionDefinition(action) : null;
  }

  /**
   * Find all actions for a provider
   */
  async findByProvider(provider: IntegrationProvider): Promise<ActionDefinition[]> {
    const actions = await prisma.actionDefinition.findMany({
      where: { provider, status: ActionStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
    });

    return actions.map(this.mapToActionDefinition);
  }

  /**
   * Search actions with filters
   */
  async search(filters: ActionSearchFilters): Promise<ActionDefinition[]> {
    const where: any = {};

    if (filters.provider?.length) {
      where.provider = { in: filters.provider };
    }

    if (filters.category?.length) {
      where.category = { in: filters.category };
    }

    if (filters.status?.length) {
      where.status = { in: filters.status };
    }

    if (filters.tags?.length) {
      where.tags = { hasSome: filters.tags };
    }

    if (filters.searchQuery) {
      where.OR = [
        { name: { contains: filters.searchQuery, mode: 'insensitive' } },
        { description: { contains: filters.searchQuery, mode: 'insensitive' } },
        { tags: { hasSome: [filters.searchQuery] } },
      ];
    }

    const actions = await prisma.actionDefinition.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 50,
      skip: filters.offset || 0,
    });

    return actions.map(this.mapToActionDefinition);
  }

  /**
   * Update an action
   */
  async update(id: string, updates: Partial<ActionDefinition>): Promise<ActionDefinition> {
    const updateData: any = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.inputSchema !== undefined) updateData.inputSchema = updates.inputSchema;
    if (updates.outputSchema !== undefined) updateData.outputSchema = updates.outputSchema;
    if (updates.executionSpec !== undefined) updateData.executionSpec = updates.executionSpec;
    if (updates.version !== undefined) updateData.version = updates.version;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.executionCount !== undefined) updateData.executionCount = updates.executionCount;
    if (updates.lastExecutedAt !== undefined) updateData.lastExecutedAt = updates.lastExecutedAt;

    const updated = await prisma.actionDefinition.update({
      where: { id },
      data: updateData,
    });

    return this.mapToActionDefinition(updated);
  }

  /**
   * Delete an action
   */
  async delete(id: string): Promise<void> {
    await prisma.actionDefinition.delete({
      where: { id },
    });
  }

  /**
   * Save multiple actions at once
   */
  async saveBulk(actions: Omit<ActionDefinition, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<ActionDefinition[]> {
    const savedActions = await prisma.$transaction(
      actions.map(action =>
        prisma.actionDefinition.create({
          data: {
            actionKey: action.actionKey,
            provider: action.provider,
            name: action.name,
            description: action.description,
            category: action.category,
            inputSchema: action.inputSchema as any,
            outputSchema: action.outputSchema as any,
            executionSpec: action.executionSpec as any,
            version: action.version,
            status: action.status,
            tags: action.tags,
            executionCount: action.executionCount,
            lastExecutedAt: action.lastExecutedAt,
          },
        })
      )
    );

    return savedActions.map(this.mapToActionDefinition);
  }

  /**
   * Get most popular actions
   */
  async getPopularActions(limit: number = 10): Promise<ActionDefinition[]> {
    const actions = await prisma.actionDefinition.findMany({
      where: { status: ActionStatus.ACTIVE },
      orderBy: { executionCount: 'desc' },
      take: limit,
    });

    return actions.map(this.mapToActionDefinition);
  }

  /**
   * Get recently used actions
   */
  async getRecentlyUsed(limit: number = 10): Promise<ActionDefinition[]> {
    const actions = await prisma.actionDefinition.findMany({
      where: {
        status: ActionStatus.ACTIVE,
        lastExecutedAt: { not: null },
      },
      orderBy: { lastExecutedAt: 'desc' },
      take: limit,
    });

    return actions.map(this.mapToActionDefinition);
  }

  /**
   * Get detailed stats for an action
   */
  async getActionStats(actionId: string): Promise<ActionStats> {
    const executions = await prisma.actionExecution.findMany({
      where: { actionId },
      select: {
        status: true,
        executionTime: true,
      },
    });

    const totalExecutions = executions.length;
    const successfulExecutions = executions.filter(e => e.status === 'success').length;
    const failedExecutions = executions.filter(e => e.status === 'failed').length;

    const executionTimes = executions
      .filter(e => e.executionTime !== null)
      .map(e => e.executionTime!);

    const averageExecutionTime = executionTimes.length > 0
      ? executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length
      : 0;

    return {
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      averageExecutionTime,
    };
  }

  /**
   * Map Prisma model to ActionDefinition interface
   */
  private mapToActionDefinition(prismaAction: any): ActionDefinition {
    return {
      id: prismaAction.id,
      actionKey: prismaAction.actionKey,
      provider: prismaAction.provider,
      name: prismaAction.name,
      description: prismaAction.description,
      category: prismaAction.category,
      inputSchema: prismaAction.inputSchema,
      outputSchema: prismaAction.outputSchema,
      executionSpec: prismaAction.executionSpec,
      version: prismaAction.version,
      status: prismaAction.status,
      tags: prismaAction.tags,
      executionCount: prismaAction.executionCount,
      lastExecutedAt: prismaAction.lastExecutedAt,
      createdAt: prismaAction.createdAt,
      updatedAt: prismaAction.updatedAt,
    };
  }
}

// Export singleton instance
export const actionRepository = new ActionRepository();
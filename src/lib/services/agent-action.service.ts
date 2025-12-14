/**
 * Agent Action Service
 *
 * Integrates the action repository with the OrchestrationAgent system.
 * Handles action discovery, execution, and escalation for failed actions.
 */

import { actionRepository } from './action-repository';
import { actionRuntime } from './action-runtime';
import { actionDiscoveryService } from './action-discovery';
import {
  IAgentActionService,
  ActionDefinition,
  ExecutionResult,
  AgentContext
} from '@/lib/types/action';
import { prisma } from '@/lib/prisma';

export class AgentActionService implements IAgentActionService {
  /**
   * Get available actions for an organization
   */
  async getAvailableActions(orgId: string): Promise<ActionDefinition[]> {
    try {
      // Get active integrations for this org
      const integrations = await prisma.integrationCredential.findMany({
        where: {
          orgId,
          isActive: true,
        },
        select: {
          id: true,
          provider: true,
        },
      });

      // Get actions for each integration
      const allActions: ActionDefinition[] = [];
      for (const integration of integrations) {
        try {
          // Try to discover actions for this integration
          const actions = await actionDiscoveryService.discoverActionsForIntegration(integration.id);
          allActions.push(...actions);
        } catch (error) {
          console.warn(`Failed to discover actions for integration ${integration.id}:`, error);
          // Continue with other integrations
        }
      }

      return allActions;
    } catch (error) {
      console.error('Failed to get available actions:', error);
      return [];
    }
  }

  /**
   * Execute action via agent with escalation support
   */
  async executeActionViaAgent(
    actionKey: string,
    params: Record<string, any>,
    agentContext: AgentContext
  ): Promise<ExecutionResult> {
    try {
      // Execute the action
      const result = await actionRuntime.executeAction(actionKey, params, {
        userId: agentContext.userId,
        orgId: agentContext.orgId,
        // integrationId would need to be determined based on action and org
      });

      // If execution failed, escalate to admin
      if (!result.success && result.error) {
        await this.escalateFailedExecution(
          result.executionId,
          result.error,
          agentContext
        );
      }

      return result;
    } catch (error) {
      // If execution throws an error, escalate
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.escalateFailedExecution(
        `error_${Date.now()}`,
        errorMessage,
        agentContext
      );

      return {
        success: false,
        error: errorMessage,
        executionTime: 0,
        executionId: `error_${Date.now()}`,
      };
    }
  }

  /**
   * Escalate failed execution to admin user
   */
  async escalateFailedExecution(
    executionId: string,
    error: string,
    agentContext: AgentContext
  ): Promise<void> {
    try {
      console.log(`🚨 Escalating failed execution ${executionId} to admin`);

      // Find admin users in the organization
      const adminUsers = await prisma.organizationMember.findMany({
        where: {
          orgId: agentContext.orgId,
          role: 'ADMIN',
        },
        include: {
          user: true,
        },
      });

      if (adminUsers.length === 0) {
        console.warn('No admin users found for escalation');
        return;
      }

      // Create escalation task in pipeline
      const escalationTask = await prisma.task.create({
        data: {
          title: `Action Execution Failed: ${executionId}`,
          description: `An automated action failed during execution.\n\n**Error:** ${error}\n\n**Agent Decision:** ${agentContext.decisionId}\n\n**Execution ID:** ${executionId}\n\nPlease review and take appropriate action.`,
          status: 'NEW',
          priority: 4, // High priority
          source: 'API',
          sourceId: executionId,
          orgId: agentContext.orgId,
          createdById: agentContext.userId || adminUsers[0].userId,
          data: {
            escalationType: 'action_failure',
            executionId,
            error,
            agentDecisionId: agentContext.decisionId,
            actionKey: 'unknown', // Would need to be passed in
            timestamp: new Date().toISOString(),
          },
        },
      });

      // Assign to first available admin
      await prisma.taskAssignment.create({
        data: {
          taskId: escalationTask.id,
          userId: adminUsers[0].userId,
          assignedById: agentContext.userId || adminUsers[0].userId,
        },
      });

      // Create activity log entry
      await prisma.activityLog.create({
        data: {
          userId: agentContext.userId || adminUsers[0].userId,
          orgId: agentContext.orgId,
          action: 'CREATE',
          entity: 'TASK',
          entityId: escalationTask.id,
          metadata: {
            type: 'escalation',
            reason: 'action_execution_failed',
            executionId,
            error,
            agentDecisionId: agentContext.decisionId,
          },
        },
      });

      // Emit event for orchestration agent to handle
      const eventBus = await this.getEventBus();
      await eventBus.emit('escalation:created', {
        escalationId: escalationTask.id,
        type: 'action_failure',
        executionId,
        error,
        agentDecisionId: agentContext.decisionId,
        orgId: agentContext.orgId,
        assignedToId: adminUsers[0].userId,
      });

      console.log(`✅ Escalation created: Task ${escalationTask.id} assigned to admin ${adminUsers[0].userId}`);

    } catch (escalationError) {
      console.error('Failed to create escalation:', escalationError);
      // Don't throw - escalation failure shouldn't break the main flow
    }
  }

  /**
   * Get event bus instance
   */
  private async getEventBus() {
    // Import dynamically to avoid circular dependencies
    const { getEventBus } = await import('@/lib/agent');
    return getEventBus();
  }
}

// Export singleton instance
export const agentActionService = new AgentActionService();
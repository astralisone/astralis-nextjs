import { prisma } from '@/lib/prisma';
import { n8nService } from './n8n.service';
import type {
  Automation,
  WorkflowExecution,
  AutomationTrigger,
  ExecutionStatus,
  CreateAutomationInput,
  AutomationFilters,
} from '@/types/automation';

/**
 * Automation Service
 *
 * Manages business automations with n8n workflow integration.
 * Handles creation, execution, monitoring, and lifecycle management
 * of automated workflows.
 *
 * Features:
 * - Create automations with n8n workflow generation
 * - Execute workflows manually or via triggers
 * - Track execution history and statistics
 * - Manage automation lifecycle (activate/deactivate/delete)
 * - Generate webhook URLs for trigger endpoints
 *
 * Note: Requires Phase 6 database migration to be applied.
 * Current schema has minimal automation table.
 */

interface CreateAutomationData extends CreateAutomationInput {
  orgId: string;
  createdById: string;
  metadata?: any;
}

interface UpdateAutomationData {
  name?: string;
  description?: string | null;
  isActive?: boolean;
  tags?: string[];
  metadata?: any | null;
}

export class AutomationService {
  /**
   * Create new automation with n8n workflow
   *
   * Steps:
   * 1. Create workflow in n8n
   * 2. Store automation record in database
   * 3. Generate webhook URL if trigger type is WEBHOOK
   * 4. Return automation with relations
   */
  /**
   * Extract webhook URL from n8n workflow nodes
   */
  private extractWebhookUrl(workflowNodes: any[]): string | null {
    // Find webhook node in the workflow
    const webhookNode = workflowNodes.find((node: any) =>
      node.type === 'n8n-nodes-base.webhook'
    );

    if (!webhookNode) {
      return null;
    }

    // Get webhook path from node parameters
    const webhookPath = webhookNode.parameters?.path || webhookNode.webhookId || 'webhook';

    // Construct full n8n webhook URL
    const protocol = process.env.N8N_PROTOCOL || 'http';
    const host = process.env.N8N_HOST || 'localhost';
    const port = process.env.N8N_PORT || '5678';

    // n8n webhook URLs follow the pattern: http://host:port/webhook-test/path
    const webhookUrl = `${protocol}://${host}:${port}/webhook-test/${webhookPath}`;

    console.log('[Automation Service] Extracted webhook URL from n8n:', webhookUrl);
    return webhookUrl;
  }

  async createAutomation(data: CreateAutomationData): Promise<any> {
    try {
      console.log('[Automation Service] Creating automation:', data.name);

      // 1. Create workflow in n8n (optional - skip if no API key in development)
      let n8nWorkflowId: string | null = null;
      let n8nWebhookUrl: string | null = null;
      const hasN8nAuth = !!(process.env.N8N_API_KEY || (process.env.N8N_BASIC_AUTH_USER && process.env.N8N_BASIC_AUTH_PASSWORD));

      if (hasN8nAuth) {
        console.log('[Automation Service] Creating workflow in n8n...');
        const n8nWorkflow = await n8nService.createWorkflow({
          name: data.name,
          nodes: data.workflowJson.nodes,
          connections: data.workflowJson.connections,
          active: true,
        });
        n8nWorkflowId = n8nWorkflow.id;
        console.log('[Automation Service] N8N workflow created:', n8nWorkflowId);

        // Extract webhook URL from workflow nodes if webhook trigger
        if (data.triggerType === 'WEBHOOK') {
          n8nWebhookUrl = this.extractWebhookUrl(n8nWorkflow.nodes);
        }
      } else {
        console.warn('[Automation Service] Skipping n8n workflow creation (no API key configured)');
        console.warn('[Automation Service] Workflow JSON will be stored locally only');
        // Store workflow JSON in metadata for later sync
        if (!data.metadata) {
          data.metadata = {};
        }
        data.metadata.workflowJson = data.workflowJson;
      }

      // 2. Create automation record with webhook URL from n8n
      const automation = await prisma.automation.create({
        data: {
          name: data.name,
          description: data.description || null,
          n8nWorkflowId: n8nWorkflowId,
          webhookUrl: n8nWebhookUrl, // Use n8n webhook URL directly
          triggerType: data.triggerType,
          triggerConfig: data.triggerConfig as any,
          isActive: true,
          orgId: data.orgId,
          createdById: data.createdById,
          executionCount: 0,
          successCount: 0,
          failureCount: 0,
          tags: data.tags || [],
          metadata: data.metadata || null,
        },
      });

      // 3. Log creation activity
      try {
        await prisma.activityLog.create({
          data: {
            userId: data.createdById,
            orgId: data.orgId,
            action: 'CREATE',
            entity: 'AUTOMATION',
            entityId: automation.id,
            metadata: {
              name: data.name,
              triggerType: data.triggerType,
              n8nWorkflowId: n8nWorkflowId,
              webhookUrl: n8nWebhookUrl,
            },
          },
        });
      } catch (logError) {
        console.error('[Automation Service] Failed to log activity:', logError);
        // Don't fail automation creation if logging fails
      }

      console.log('[Automation Service] Automation created successfully:', automation.id);
      if (n8nWebhookUrl) {
        console.log('[Automation Service] Webhook URL:', n8nWebhookUrl);
      }

      return automation;
    } catch (error) {
      console.error('[Automation Service] Failed to create automation:', error);
      throw new Error(
        `Failed to create automation: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get automation by ID with relations
   */
  async getAutomation(id: string, orgId: string): Promise<any | null> {
    try {
      const automation = await prisma.automation.findFirst({
        where: { id, orgId },
      });

      if (!automation) {
        return null;
      }

      // After Phase 6 migration, this will include:
      // - createdBy relation
      // - executions relation
      // - triggers relation
      return automation;
    } catch (error) {
      console.error('[Automation Service] Failed to get automation:', error);
      throw new Error(
        `Failed to get automation: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * List automations for organization with filters
   */
  async listAutomations(
    orgId: string,
    filters?: Partial<AutomationFilters>
  ): Promise<any[]> {
    try {
      const where: any = { orgId };

      if (filters?.isActive !== undefined) {
        where.isActive = filters.isActive;
      }

      if (filters?.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      const automations = await prisma.automation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      return automations;
    } catch (error) {
      console.error('[Automation Service] Failed to list automations:', error);
      throw new Error(
        `Failed to list automations: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Execute automation manually
   *
   * Steps:
   * 1. Validate automation exists and is active
   * 2. Create execution record (after migration)
   * 3. Execute workflow in n8n
   * 4. Update execution record with results
   * 5. Update automation statistics
   */
  async executeAutomation(
    id: string,
    orgId: string,
    triggerData: any
  ): Promise<any> {
    try {
      console.log('[Automation Service] Executing automation:', id);

      // 1. Get automation
      const automation = await this.getAutomation(id, orgId);

      if (!automation) {
        throw new Error('Automation not found');
      }

      if (!automation.isActive) {
        throw new Error('Automation is not active');
      }

      if (!automation.n8nWorkflowId) {
        throw new Error('Automation has no associated n8n workflow');
      }

      const startTime = Date.now();

      // 2. Execute workflow in n8n
      const n8nExecution = await n8nService.executeWorkflow(automation.n8nWorkflowId, triggerData);

      const executionTime = Date.now() - startTime;

      console.log(
        '[Automation Service] N8N execution completed:',
        n8nExecution.id,
        `(${executionTime}ms)`
      );

      // 3. Update automation stats
      await prisma.automation.update({
        where: { id },
        data: {
          executionCount: { increment: 1 },
          successCount: { increment: 1 },
          lastExecutedAt: new Date(),
        },
      });

      // 4. Log execution activity
      try {
        await prisma.activityLog.create({
          data: {
            userId: null, // System action
            orgId,
            action: 'EXECUTE',
            entity: 'AUTOMATION',
            entityId: id,
            metadata: {
              n8nExecutionId: n8nExecution.id,
              executionTime,
              status: 'SUCCESS',
            },
          },
        });
      } catch (logError) {
        console.error('[Automation Service] Failed to log execution:', logError);
      }

      return {
        id: automation.id,
        n8nExecutionId: n8nExecution.id,
        status: 'SUCCESS',
        executionTime,
        data: n8nExecution.data,
      };
    } catch (error) {
      console.error('[Automation Service] Execution failed:', error);

      // Log failed execution
      try {
        await prisma.activityLog.create({
          data: {
            userId: null,
            orgId,
            action: 'EXECUTE',
            entity: 'AUTOMATION',
            entityId: id,
            metadata: {
              status: 'FAILED',
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          },
        });
      } catch (logError) {
        console.error('[Automation Service] Failed to log error:', logError);
      }

      throw new Error(
        `Failed to execute automation: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Toggle automation active status
   *
   * Also activates/deactivates the workflow in n8n
   */
  async toggleAutomation(
    id: string,
    orgId: string,
    isActive: boolean
  ): Promise<any> {
    try {
      const automation = await this.getAutomation(id, orgId);

      if (!automation) {
        throw new Error('Automation not found');
      }

      // Update n8n workflow status
      if (automation.n8nWorkflowId) {
        if (isActive) {
          await n8nService.activateWorkflow(automation.n8nWorkflowId);
        } else {
          await n8nService.deactivateWorkflow(automation.n8nWorkflowId);
        }
      }

      // Update database
      const updated = await prisma.automation.update({
        where: { id },
        data: { isActive },
      });

      console.log(
        `[Automation Service] Automation ${isActive ? 'activated' : 'deactivated'}:`,
        id
      );

      // Log activity
      try {
        await prisma.activityLog.create({
          data: {
            userId: null,
            orgId,
            action: 'UPDATE',
            entity: 'AUTOMATION',
            entityId: id,
            metadata: {
              isActive,
              action: isActive ? 'activated' : 'deactivated',
            },
          },
        });
      } catch (logError) {
        console.error('[Automation Service] Failed to log toggle:', logError);
      }

      return updated;
    } catch (error) {
      console.error('[Automation Service] Failed to toggle automation:', error);
      throw new Error(
        `Failed to toggle automation: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete automation
   *
   * Deletes both the database record and the n8n workflow
   */
  async deleteAutomation(id: string, orgId: string): Promise<void> {
    try {
      const automation = await this.getAutomation(id, orgId);

      if (!automation) {
        throw new Error('Automation not found');
      }

      // Delete n8n workflow first
      if (automation.n8nWorkflowId) {
        try {
          await n8nService.deleteWorkflow(automation.n8nWorkflowId);
          console.log('[Automation Service] N8N workflow deleted:', automation.n8nWorkflowId);
        } catch (n8nError) {
          console.error('[Automation Service] Failed to delete n8n workflow:', n8nError);
          // Continue with database deletion even if n8n delete fails
        }
      }

      // Delete from database (cascade will delete executions and triggers after migration)
      await prisma.automation.delete({
        where: { id },
      });

      console.log('[Automation Service] Automation deleted:', id);

      // Log deletion
      try {
        await prisma.activityLog.create({
          data: {
            userId: null,
            orgId,
            action: 'DELETE',
            entity: 'AUTOMATION',
            entityId: id,
            metadata: {
              name: automation.name,
              n8nWorkflowId: automation.n8nWorkflowId,
            },
          },
        });
      } catch (logError) {
        console.error('[Automation Service] Failed to log deletion:', logError);
      }
    } catch (error) {
      console.error('[Automation Service] Failed to delete automation:', error);
      throw new Error(
        `Failed to delete automation: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Update automation
   */
  async updateAutomation(
    id: string,
    orgId: string,
    data: UpdateAutomationData
  ): Promise<any> {
    try {
      const automation = await this.getAutomation(id, orgId);

      if (!automation) {
        throw new Error('Automation not found');
      }

      // Update n8n workflow name if changed
      if (data.name && automation.n8nWorkflowId) {
        await n8nService.updateWorkflow(automation.n8nWorkflowId, {
          name: data.name,
        });
      }

      // Update database
      const updated = await prisma.automation.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
          ...(data.tags && { tags: data.tags }),
          ...(data.metadata !== undefined && { metadata: data.metadata }),
        },
      });

      console.log('[Automation Service] Automation updated:', id);

      return updated;
    } catch (error) {
      console.error('[Automation Service] Failed to update automation:', error);
      throw new Error(
        `Failed to update automation: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get execution history for automation
   * Note: Requires Phase 6 migration for WorkflowExecution table
   */
  async getExecutionHistory(
    automationId: string,
    orgId: string,
    limit: number = 50
  ): Promise<any[]> {
    try {
      // After Phase 6 migration, this will query the WorkflowExecution table
      console.log('[Automation Service] Execution history not yet available (requires migration)');
      return [];
    } catch (error) {
      console.error('[Automation Service] Failed to get execution history:', error);
      throw new Error(
        `Failed to get execution history: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

export const automationService = new AutomationService();

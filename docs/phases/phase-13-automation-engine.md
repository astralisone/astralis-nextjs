# Phase 13: Automation Engine Integration

**Duration**: 2 weeks
**Prerequisites**: Phase 6 complete (automation infrastructure)
**Priority**: High - Core AstralisOps feature

---

## Overview

Connect the existing automation infrastructure to a workflow execution engine (n8n or custom) to enable true automated workflows triggered by form submissions, document uploads, and scheduled events.

**Marketing Promise:**
> "Set up automated workflows once, then let them run on autopilot. When a client submits a form, it can automatically send emails, update your database, and create tasks for your team."

---

## Current State (as of Phase 6)

### What Exists
- `Automation` database model with trigger types, workflow config
- `WorkflowExecution` for tracking execution history
- `WorkflowTrigger` for multiple trigger configurations
- `AutomationTemplate` for pre-built workflow templates
- API routes for automation CRUD operations
- UI pages for automation management
- n8n schema field (`n8nWorkflowId`) but no integration

### What's Missing
- Actual n8n instance connection
- Workflow execution engine
- Form submission triggers (contact forms don't trigger automations)
- Email sending actions
- Database update actions
- Task creation actions
- Scheduled execution worker (cron jobs)
- Visual workflow builder

---

## Implementation Plan

### 1. n8n Service Integration

Create `src/lib/services/n8n.service.ts`:

```typescript
import axios, { AxiosInstance } from 'axios';

interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: N8nNode[];
  connections: Record<string, unknown>;
  settings?: Record<string, unknown>;
}

interface N8nNode {
  name: string;
  type: string;
  position: [number, number];
  parameters: Record<string, unknown>;
}

interface N8nExecution {
  id: string;
  finished: boolean;
  mode: string;
  startedAt: string;
  stoppedAt?: string;
  workflowId: string;
  data: {
    resultData: {
      runData: Record<string, unknown>;
    };
  };
}

interface WorkflowTriggerPayload {
  webhookUrl?: string;
  data: Record<string, unknown>;
}

export class N8nService {
  private client: AxiosInstance;

  constructor() {
    const baseURL = process.env.N8N_API_URL || 'http://localhost:5678/api/v1';
    const apiKey = process.env.N8N_API_KEY;

    this.client = axios.create({
      baseURL,
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Create a new workflow in n8n
   */
  async createWorkflow(
    name: string,
    nodes: N8nNode[],
    connections: Record<string, unknown>
  ): Promise<N8nWorkflow> {
    const response = await this.client.post('/workflows', {
      name,
      nodes,
      connections,
      settings: {
        executionOrder: 'v1',
      },
    });

    return response.data;
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(workflowId: string): Promise<N8nWorkflow> {
    const response = await this.client.get(`/workflows/${workflowId}`);
    return response.data;
  }

  /**
   * Activate/deactivate a workflow
   */
  async setWorkflowActive(workflowId: string, active: boolean): Promise<void> {
    await this.client.patch(`/workflows/${workflowId}`, { active });
  }

  /**
   * Delete a workflow
   */
  async deleteWorkflow(workflowId: string): Promise<void> {
    await this.client.delete(`/workflows/${workflowId}`);
  }

  /**
   * Execute a workflow manually
   */
  async executeWorkflow(
    workflowId: string,
    data: Record<string, unknown>
  ): Promise<N8nExecution> {
    const response = await this.client.post(`/workflows/${workflowId}/execute`, {
      data,
    });

    return response.data;
  }

  /**
   * Trigger a webhook workflow
   */
  async triggerWebhook(
    webhookPath: string,
    data: Record<string, unknown>
  ): Promise<unknown> {
    const webhookUrl =
      process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook';

    const response = await axios.post(`${webhookUrl}/${webhookPath}`, data);
    return response.data;
  }

  /**
   * Get execution history for a workflow
   */
  async getExecutions(
    workflowId: string,
    limit = 20
  ): Promise<N8nExecution[]> {
    const response = await this.client.get('/executions', {
      params: {
        workflowId,
        limit,
      },
    });

    return response.data.data;
  }

  /**
   * Get execution details
   */
  async getExecution(executionId: string): Promise<N8nExecution> {
    const response = await this.client.get(`/executions/${executionId}`);
    return response.data;
  }

  /**
   * Create workflow from template
   */
  async createFromTemplate(
    templateType: string,
    config: Record<string, unknown>
  ): Promise<N8nWorkflow> {
    const template = this.getTemplate(templateType, config);
    return this.createWorkflow(template.name, template.nodes, template.connections);
  }

  /**
   * Get pre-built workflow templates
   */
  private getTemplate(
    type: string,
    config: Record<string, unknown>
  ): {
    name: string;
    nodes: N8nNode[];
    connections: Record<string, unknown>;
  } {
    const templates: Record<string, () => { name: string; nodes: N8nNode[]; connections: Record<string, unknown> }> = {
      // Form submission -> Email notification
      form_notification: () => ({
        name: `Form Notification - ${config.formName || 'Contact'}`,
        nodes: [
          {
            name: 'Webhook',
            type: 'n8n-nodes-base.webhook',
            position: [250, 300],
            parameters: {
              path: config.webhookPath || 'form-submission',
              responseMode: 'onReceived',
            },
          },
          {
            name: 'Send Email',
            type: 'n8n-nodes-base.emailSend',
            position: [450, 300],
            parameters: {
              fromEmail: config.fromEmail || 'noreply@astralisone.com',
              toEmail: config.notifyEmail,
              subject: `New ${config.formName || 'Form'} Submission`,
              text: '={{$json["message"]}}',
            },
          },
        ],
        connections: {
          Webhook: {
            main: [[{ node: 'Send Email', type: 'main', index: 0 }]],
          },
        },
      }),

      // Document uploaded -> Process + Notify
      document_processing: () => ({
        name: `Document Processing - ${config.documentType || 'General'}`,
        nodes: [
          {
            name: 'Webhook',
            type: 'n8n-nodes-base.webhook',
            position: [250, 300],
            parameters: {
              path: config.webhookPath || 'document-uploaded',
              responseMode: 'onReceived',
            },
          },
          {
            name: 'HTTP Request',
            type: 'n8n-nodes-base.httpRequest',
            position: [450, 300],
            parameters: {
              method: 'POST',
              url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/documents/{{$json["documentId"]}}/extract`,
              authentication: 'genericCredentialType',
            },
          },
          {
            name: 'Send Email',
            type: 'n8n-nodes-base.emailSend',
            position: [650, 300],
            parameters: {
              fromEmail: 'noreply@astralisone.com',
              toEmail: config.notifyEmail,
              subject: 'Document Processed',
              text: 'Document {{$json["filename"]}} has been processed.',
            },
          },
        ],
        connections: {
          Webhook: {
            main: [[{ node: 'HTTP Request', type: 'main', index: 0 }]],
          },
          'HTTP Request': {
            main: [[{ node: 'Send Email', type: 'main', index: 0 }]],
          },
        },
      }),

      // Scheduled report
      scheduled_report: () => ({
        name: `Scheduled Report - ${config.reportName || 'Daily'}`,
        nodes: [
          {
            name: 'Schedule',
            type: 'n8n-nodes-base.scheduleTrigger',
            position: [250, 300],
            parameters: {
              rule: {
                interval: [{ field: 'cronExpression', expression: config.cronExpression || '0 9 * * *' }],
              },
            },
          },
          {
            name: 'HTTP Request',
            type: 'n8n-nodes-base.httpRequest',
            position: [450, 300],
            parameters: {
              method: 'GET',
              url: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/dashboard/stats`,
            },
          },
          {
            name: 'Send Email',
            type: 'n8n-nodes-base.emailSend',
            position: [650, 300],
            parameters: {
              fromEmail: 'noreply@astralisone.com',
              toEmail: config.recipientEmail,
              subject: `${config.reportName || 'Daily'} Report`,
              html: '<h1>Dashboard Report</h1><pre>{{JSON.stringify($json, null, 2)}}</pre>',
            },
          },
        ],
        connections: {
          Schedule: {
            main: [[{ node: 'HTTP Request', type: 'main', index: 0 }]],
          },
          'HTTP Request': {
            main: [[{ node: 'Send Email', type: 'main', index: 0 }]],
          },
        },
      }),
    };

    const templateFn = templates[type];
    if (!templateFn) {
      throw new Error(`Unknown template type: ${type}`);
    }

    return templateFn();
  }
}

export const n8nService = new N8nService();
```

### 2. Automation Execution Service

Create `src/lib/services/automationExecution.service.ts`:

```typescript
import { prisma } from '@/lib/prisma';
import { n8nService } from './n8n.service';

interface TriggerContext {
  source: 'WEBHOOK' | 'SCHEDULE' | 'INTAKE_CREATED' | 'DOCUMENT_UPLOADED' | 'PIPELINE_STAGE_CHANGED';
  data: Record<string, unknown>;
  orgId: string;
  userId?: string;
}

export class AutomationExecutionService {
  /**
   * Find and execute automations matching a trigger
   */
  async processTrigger(context: TriggerContext): Promise<void> {
    // Find active automations matching this trigger type
    const automations = await prisma.automation.findMany({
      where: {
        orgId: context.orgId,
        isActive: true,
        triggers: {
          some: {
            triggerType: context.source,
            isActive: true,
          },
        },
      },
      include: {
        triggers: true,
      },
    });

    console.log(
      `[AutomationExecution] Found ${automations.length} automations for trigger ${context.source}`
    );

    for (const automation of automations) {
      await this.executeAutomation(automation.id, context.data);
    }
  }

  /**
   * Execute a single automation
   */
  async executeAutomation(
    automationId: string,
    inputData: Record<string, unknown>
  ): Promise<string> {
    const automation = await prisma.automation.findUnique({
      where: { id: automationId },
    });

    if (!automation) {
      throw new Error(`Automation ${automationId} not found`);
    }

    // Create execution record
    const execution = await prisma.workflowExecution.create({
      data: {
        automationId,
        status: 'RUNNING',
        inputData,
        startedAt: new Date(),
      },
    });

    try {
      let result: Record<string, unknown>;

      // Execute via n8n if connected
      if (automation.n8nWorkflowId) {
        const n8nExecution = await n8nService.executeWorkflow(
          automation.n8nWorkflowId,
          inputData
        );
        result = { n8nExecutionId: n8nExecution.id, data: n8nExecution.data };
      } else {
        // Execute local workflow (for simple automations without n8n)
        result = await this.executeLocalWorkflow(automation, inputData);
      }

      // Update execution as completed
      await prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          outputData: result,
        },
      });

      // Update automation last run
      await prisma.automation.update({
        where: { id: automationId },
        data: {
          lastRunAt: new Date(),
          runCount: { increment: 1 },
        },
      });

      console.log(`[AutomationExecution] Completed execution ${execution.id}`);
      return execution.id;
    } catch (error) {
      // Update execution as failed
      await prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      console.error(`[AutomationExecution] Failed execution ${execution.id}:`, error);
      throw error;
    }
  }

  /**
   * Execute a simple workflow without n8n
   */
  private async executeLocalWorkflow(
    automation: { workflowConfig: unknown },
    inputData: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const config = automation.workflowConfig as {
      actions?: Array<{
        type: string;
        config: Record<string, unknown>;
      }>;
    };

    const results: Record<string, unknown>[] = [];

    for (const action of config.actions || []) {
      const actionResult = await this.executeAction(action, inputData);
      results.push(actionResult);
    }

    return { actions: results };
  }

  /**
   * Execute a single workflow action
   */
  private async executeAction(
    action: { type: string; config: Record<string, unknown> },
    inputData: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    switch (action.type) {
      case 'SEND_EMAIL':
        return this.sendEmailAction(action.config, inputData);
      case 'CREATE_INTAKE':
        return this.createIntakeAction(action.config, inputData);
      case 'CREATE_PIPELINE_ITEM':
        return this.createPipelineItemAction(action.config, inputData);
      case 'WEBHOOK':
        return this.webhookAction(action.config, inputData);
      default:
        console.warn(`[AutomationExecution] Unknown action type: ${action.type}`);
        return { skipped: true, reason: `Unknown action type: ${action.type}` };
    }
  }

  private async sendEmailAction(
    config: Record<string, unknown>,
    inputData: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const { sendEmail } = await import('@/lib/email');

    const to = this.interpolate(config.to as string, inputData);
    const subject = this.interpolate(config.subject as string, inputData);
    const body = this.interpolate(config.body as string, inputData);

    await sendEmail({
      to,
      subject,
      text: body,
      html: `<p>${body}</p>`,
    });

    return { action: 'SEND_EMAIL', to, subject, sent: true };
  }

  private async createIntakeAction(
    config: Record<string, unknown>,
    inputData: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const intake = await prisma.intakeRequest.create({
      data: {
        orgId: config.orgId as string,
        source: 'API',
        status: 'NEW',
        title: this.interpolate(config.title as string, inputData),
        description: this.interpolate(config.description as string, inputData),
        priority: (config.priority as number) || 2,
        requestData: inputData,
      },
    });

    return { action: 'CREATE_INTAKE', intakeId: intake.id };
  }

  private async createPipelineItemAction(
    config: Record<string, unknown>,
    inputData: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    // Get first stage of pipeline
    const firstStage = await prisma.pipelineStage.findFirst({
      where: { pipelineId: config.pipelineId as string },
      orderBy: { order: 'asc' },
    });

    if (!firstStage) {
      throw new Error('Pipeline has no stages');
    }

    const item = await prisma.pipelineItem.create({
      data: {
        pipelineId: config.pipelineId as string,
        stageId: firstStage.id,
        title: this.interpolate(config.title as string, inputData),
        description: this.interpolate(config.description as string, inputData),
        status: 'ACTIVE',
        priority: (config.priority as number) || 2,
        metadata: inputData,
      },
    });

    return { action: 'CREATE_PIPELINE_ITEM', itemId: item.id };
  }

  private async webhookAction(
    config: Record<string, unknown>,
    inputData: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const response = await fetch(config.url as string, {
      method: (config.method as string) || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.headers as Record<string, string>),
      },
      body: JSON.stringify(inputData),
    });

    return {
      action: 'WEBHOOK',
      url: config.url,
      status: response.status,
      success: response.ok,
    };
  }

  /**
   * Simple template interpolation
   */
  private interpolate(template: string, data: Record<string, unknown>): string {
    if (!template) return '';

    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return String(data[key] ?? '');
    });
  }
}

export const automationExecutionService = new AutomationExecutionService();
```

### 3. Trigger Integration Points

Update `src/app/api/contact/route.ts` to trigger automations:

```typescript
// Add at the end of successful form processing:

import { automationExecutionService } from '@/lib/services/automationExecution.service';

// Trigger automations
await automationExecutionService.processTrigger({
  source: 'INTAKE_CREATED',
  data: {
    name: parsed.data.name,
    email: parsed.data.email,
    message: parsed.data.message,
    formType: 'contact',
  },
  orgId: defaultOrgId,
});
```

Update `src/workers/processors/ocr.processor.ts`:

```typescript
// Add after document processing completes:

import { automationExecutionService } from '@/lib/services/automationExecution.service';

// Trigger automations
await automationExecutionService.processTrigger({
  source: 'DOCUMENT_UPLOADED',
  data: {
    documentId: document.id,
    filename: document.filename,
    mimeType: document.mimeType,
    ocrComplete: true,
    extractedData: document.extractedData,
  },
  orgId: document.orgId,
});
```

### 4. Scheduled Automation Worker

Create `src/workers/processors/scheduledAutomation.processor.ts`:

```typescript
import { Job } from 'bullmq';
import { prisma } from '@/lib/prisma';
import { automationExecutionService } from '@/lib/services/automationExecution.service';

interface ScheduledAutomationJobData {
  automationId: string;
  triggerId: string;
}

export async function processScheduledAutomation(
  job: Job<ScheduledAutomationJobData>
): Promise<void> {
  const { automationId, triggerId } = job.data;

  console.log(`[ScheduledAutomation] Executing automation ${automationId}`);

  const trigger = await prisma.workflowTrigger.findUnique({
    where: { id: triggerId },
    include: { automation: true },
  });

  if (!trigger || !trigger.isActive || !trigger.automation.isActive) {
    console.log(`[ScheduledAutomation] Trigger or automation inactive, skipping`);
    return;
  }

  // Execute the automation
  await automationExecutionService.executeAutomation(automationId, {
    triggeredBy: 'schedule',
    triggerConfig: trigger.config,
    executedAt: new Date().toISOString(),
  });
}
```

---

## Environment Variables Required

```bash
# n8n Integration
N8N_API_URL="http://localhost:5678/api/v1"
N8N_API_KEY="<your-n8n-api-key>"
N8N_WEBHOOK_URL="http://localhost:5678/webhook"
```

---

## Testing Checklist

- [ ] n8n service connects and creates workflows
- [ ] Contact form submissions trigger automations
- [ ] Document uploads trigger automations
- [ ] Scheduled automations execute on time
- [ ] Execution history is recorded correctly
- [ ] Failed executions are logged with errors
- [ ] Local workflow actions work without n8n
- [ ] Email actions send successfully
- [ ] Pipeline item creation works

---

## Success Criteria

1. Form submissions can trigger automated email notifications
2. Document uploads can trigger processing workflows
3. Scheduled automations run reliably
4. Execution history available in UI
5. 95%+ automation execution success rate
6. Execution time <5 seconds for simple workflows
7. n8n integration optional (local execution fallback)


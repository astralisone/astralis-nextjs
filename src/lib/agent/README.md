# AstralisOps Orchestration Agent

An LLM-powered scheduling and task management agent that unifies intake routing, calendar management, notifications, and automation workflows into a single orchestration layer.

## Overview

The Orchestration Agent processes inputs from multiple channels (email, webhooks, database triggers, worker events) and makes intelligent decisions about:

- **Pipeline Assignment**: Route intake requests to appropriate pipelines and team members
- **Calendar Management**: Create, update, and cancel calendar events with conflict detection
- **Notifications**: Send contextual notifications via email, in-app, SMS, or push
- **Automation**: Trigger n8n workflows and external integrations

## Architecture

```
+---------------------------------------------------------------------+
|                    ORCHESTRATION AGENT                               |
|  +---------------------------------------------------------------+  |
|  |                    LLM Core (Claude/OpenAI)                    |  |
|  |         - Intent Classification                                |  |
|  |         - Decision Making                                      |  |
|  |         - Response Generation                                  |  |
|  +---------------------------------------------------------------+  |
|                              |                                       |
|  +-------+  +---------+  +----------+  +---------+  +---------+     |
|  | Email |  | Webhook |  |DB Trigger|  | Worker  |  |   API   |     |
|  | Input |  |  Input  |  |  Input   |  |  Input  |  |  Input  |     |
|  +-------+  +---------+  +----------+  +---------+  +---------+     |
+---------------------------------------------------------------------+
                               |
                               v
+---------------------------------------------------------------------+
|                      ACTION EXECUTORS                                |
|  +----------+ +----------+ +---------+ +----------+ +-------------+ |
|  | Pipeline | | Calendar | | Email   | |   n8n    | | Notification| |
|  | Assigner | | Manager  | | Sender  | | Trigger  | |  Dispatcher | |
|  +----------+ +----------+ +---------+ +----------+ +-------------+ |
+---------------------------------------------------------------------+
```

## Quick Start

### Installation

The agent module is included in the Next.js application. Ensure you have the required dependencies:

```bash
npm install openai @anthropic-ai/sdk bullmq ioredis zod
```

### Basic Usage

```typescript
import {
  createAgentForOrg,
  initializeAgentSystem,
  getAgentInstance,
  LLMProvider,
  AgentInputSource,
  DecisionType,
} from '@/lib/agent';

// 1. Initialize the system (do this once at app startup)
await initializeAgentSystem({
  enableWebhooks: true,
  enableEmail: true,
  enableDBTriggers: true,
});

// 2. Create an agent for your organization
const agent = createAgentForOrg('org-123', {
  llmProvider: LLMProvider.CLAUDE,
  llmModel: 'claude-sonnet-4-20250514',
  autoExecuteThreshold: 0.85,
  requireApprovalThreshold: 0.5,
});

// 3. Start the agent
agent.start();

// 4. Process an input
const result = await agent.process({
  source: AgentInputSource.WEBHOOK,
  type: 'form_submitted',
  rawContent: 'Customer inquiry about enterprise pricing',
  structuredData: {
    email: 'customer@company.com',
    name: 'John Doe',
    company: 'Acme Corp',
  },
  timestamp: new Date(),
});

console.log(result.decision.intent);      // 'SALES_INQUIRY'
console.log(result.decision.confidence);   // 0.92
console.log(result.decision.actions);      // Actions to execute
```

### Using the Singleton Pattern

```typescript
// Get or create agent instance (singleton per org)
const agent = getAgentInstance('org-123');

// Always returns the same instance for this org
const sameAgent = getAgentInstance('org-123');
```

## Configuration Options

### Agent Configuration

```typescript
interface AgentFactoryOptions {
  // LLM Settings
  llmProvider?: LLMProvider;       // CLAUDE or OPENAI
  llmModel?: string;               // Model identifier
  temperature?: number;            // 0.0-1.0 (default: 0.3)
  maxTokens?: number;              // Max response tokens (default: 2000)

  // Decision Thresholds
  autoExecuteThreshold?: number;       // Auto-execute above this (default: 0.85)
  requireApprovalThreshold?: number;   // Require approval below this (default: 0.5)

  // Capabilities
  enabledActions?: DecisionType[];     // Which actions are allowed

  // Rate Limits
  maxActionsPerMinute?: number;        // Default: 60
  maxActionsPerHour?: number;          // Default: 500

  // Notifications
  escalationEmail?: string;            // Where to send escalations
  notifyOnHighPriority?: boolean;      // Default: true
  notifyOnFailure?: boolean;           // Default: true
}
```

### System Initialization Options

```typescript
interface AgentSystemOptions {
  enableWebhooks?: boolean;      // Enable webhook input handling
  enableEmail?: boolean;         // Enable email input handling
  enableDBTriggers?: boolean;    // Enable database trigger handling
  enableWorkerEvents?: boolean;  // Enable BullMQ worker events
  eventBusConfig?: {
    maxListeners?: number;       // Max event listeners (default: 100)
    historySize?: number;        // Event history size (default: 1000)
    enableHistory?: boolean;     // Enable event history (default: true)
  };
  logger?: Logger;               // Custom logger instance
  prisma?: unknown;              // Prisma client for DB operations
}
```

## Event Types

The agent can process events from various sources:

### Input Sources

| Source      | Description                        | Event Examples                    |
|-------------|------------------------------------|------------------------------------|
| EMAIL       | Incoming emails via webhook        | `email:received`, `email:replied` |
| WEBHOOK     | Form submissions, API callbacks    | `webhook:form_submitted`          |
| DB_TRIGGER  | Database change events             | `intake:created`, `pipeline:stage_changed` |
| WORKER      | BullMQ job events                  | `automation:completed`            |
| API         | Direct API requests                | Custom events                     |
| SCHEDULE    | Cron-based triggers                | `schedule:triggered`              |

### Event Type Reference

```typescript
// Intake events
'intake:created'
'intake:updated'
'intake:assigned'
'intake:escalated'

// Webhook events
'webhook:form_submitted'
'webhook:booking_requested'
'webhook:callback_received'

// Email events
'email:received'
'email:replied'

// Pipeline events
'pipeline:stage_changed'
'pipeline:completed'

// Calendar events
'calendar:event_created'
'calendar:event_updated'
'calendar:event_cancelled'
'calendar:reminder_due'

// Automation events
'automation:triggered'
'automation:completed'
'automation:failed'
```

## Action Types

The agent can execute these action types:

| Action Type         | Description                           | Executor              |
|---------------------|---------------------------------------|-----------------------|
| ASSIGN_PIPELINE     | Assign intake to pipeline/stage       | PipelineAssigner      |
| CREATE_EVENT        | Create calendar event                 | CalendarManager       |
| UPDATE_EVENT        | Update existing event                 | CalendarManager       |
| CANCEL_EVENT        | Cancel calendar event                 | CalendarManager       |
| SEND_NOTIFICATION   | Send email/in-app/push notification   | NotificationDispatcher|
| TRIGGER_AUTOMATION  | Trigger n8n workflow                  | AutomationTrigger     |
| ESCALATE            | Escalate to human review              | Built-in              |
| NO_ACTION           | No action required                    | Built-in              |

## API Endpoints

The agent exposes these API endpoints (when configured):

```
POST   /api/agent/config           # Create/update agent config
GET    /api/agent/config           # Get current config
POST   /api/agent/process          # Process input manually
GET    /api/agent/decisions        # List decisions with filters
GET    /api/agent/decisions/:id    # Get decision details
POST   /api/agent/decisions/:id/approve   # Approve pending decision
POST   /api/agent/decisions/:id/reject    # Reject pending decision
GET    /api/agent/analytics        # Performance metrics
```

## Module Structure

```
src/lib/agent/
+-- index.ts                 # Main barrel export
+-- README.md                # This file
+-- core/
|   +-- OrchestrationAgent.ts    # Main agent class
|   +-- LLMClient.ts             # Base LLM client
|   +-- OpenAIClient.ts          # OpenAI implementation
|   +-- ClaudeClient.ts          # Claude implementation
|   +-- LLMFactory.ts            # Client factory
|   +-- DecisionEngine.ts        # Decision processing
|   +-- ActionExecutor.ts        # Action execution
|   +-- index.ts
+-- inputs/
|   +-- EventBus.ts              # Central event dispatcher
|   +-- BaseInputHandler.ts      # Abstract handler base
|   +-- WebhookInputHandler.ts   # Webhook processing
|   +-- EmailInputHandler.ts     # Email processing
|   +-- DBTriggerHandler.ts      # DB change events
|   +-- WorkerEventHandler.ts    # BullMQ events
|   +-- index.ts
+-- actions/
|   +-- PipelineAssigner.ts      # Pipeline assignment
|   +-- CalendarManager.ts       # Calendar operations
|   +-- NotificationDispatcher.ts # Notifications
|   +-- AutomationTrigger.ts     # n8n workflows
|   +-- index.ts
+-- prompts/
|   +-- system-prompt.ts         # Base system prompt
|   +-- intake-routing.ts        # Intake classification
|   +-- scheduling.ts            # Scheduling decisions
|   +-- notification.ts          # Notification routing
|   +-- index.ts                 # PromptBuilder utility
+-- types/
|   +-- agent.types.ts           # All TypeScript types
|   +-- index.ts
+-- utils/
    +-- index.ts                 # Factory functions
```

## Environment Variables

```env
# LLM Provider Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Agent Configuration
AGENT_DEFAULT_PROVIDER=claude
AGENT_AUTO_EXECUTE_THRESHOLD=0.85
AGENT_REQUIRE_APPROVAL_THRESHOLD=0.5
AGENT_ESCALATION_EMAIL=admin@example.com

# n8n Integration
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your-n8n-api-key

# Optional: Rate Limiting
AGENT_MAX_ACTIONS_PER_MINUTE=60
AGENT_MAX_ACTIONS_PER_HOUR=500
```

## Example: Complete Integration

```typescript
// app/api/webhooks/form/route.ts
import { NextResponse } from 'next/server';
import {
  getEventBus,
  getAgentInstance,
  AgentInputSource,
} from '@/lib/agent';

export async function POST(request: Request) {
  const formData = await request.json();

  // Get the event bus and emit the event
  const eventBus = getEventBus();
  await eventBus.emit('webhook:form_submitted', {
    id: crypto.randomUUID(),
    source: AgentInputSource.WEBHOOK,
    timestamp: new Date(),
    formId: formData.formId,
    formType: formData.type,
    fields: formData.fields,
    submitterEmail: formData.email,
    submitterName: formData.name,
  });

  // Or process directly through the agent
  const agent = getAgentInstance(formData.orgId);
  const result = await agent.process({
    source: AgentInputSource.WEBHOOK,
    type: 'form_submitted',
    rawContent: JSON.stringify(formData),
    structuredData: formData,
    timestamp: new Date(),
  });

  return NextResponse.json({
    success: true,
    decisionId: result.decisionId,
    intent: result.decision.intent,
    confidence: result.decision.confidence,
  });
}
```

## Troubleshooting

### Agent Not Processing Events

1. Ensure the agent is started:
   ```typescript
   const agent = getAgentInstance('org-123');
   if (!agent.isRunning()) {
     agent.start();
   }
   ```

2. Check if the event type is being handled:
   ```typescript
   const eventBus = getEventBus();
   console.log(eventBus.listenerCount('intake:created'));
   ```

### Low Confidence Decisions

1. Verify the system prompt includes proper context
2. Ensure structured data is provided when available
3. Check if the input type matches expected patterns

### Rate Limit Errors

1. Check your LLM provider rate limits
2. Adjust `maxActionsPerMinute` and `maxActionsPerHour`
3. Implement request queuing for high-volume scenarios

### Missing API Keys

```typescript
import { hasAPIKey, LLMProvider } from '@/lib/agent';

if (!hasAPIKey(LLMProvider.CLAUDE)) {
  console.error('ANTHROPIC_API_KEY not set');
}
```

## Testing

```typescript
// Test agent decision making
import { createAgentForOrg, AgentInputSource } from '@/lib/agent';

describe('OrchestrationAgent', () => {
  it('should classify sales inquiry correctly', async () => {
    const agent = createAgentForOrg('test-org');
    agent.start();

    const result = await agent.process({
      source: AgentInputSource.WEBHOOK,
      type: 'form_submitted',
      rawContent: 'I want to learn about your enterprise pricing',
      timestamp: new Date(),
    });

    expect(result.decision.intent).toBe('SALES_INQUIRY');
    expect(result.decision.confidence).toBeGreaterThan(0.7);
  });
});
```

## Related Documentation

- [Orchestration Agent Plan](/docs/ORCHESTRATION_AGENT_PLAN.md) - Full development plan
- [API Integration Summary](/API_INTEGRATION_SUMMARY.md) - Backend API details
- [Migration Checklist](/MIGRATION_CHECKLIST.md) - Project migration status

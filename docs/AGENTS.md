# Multi-Agent AI System Documentation

**Version**: 1.0.0
**Last Updated**: 2025-12-02
**Astralis One Multi-Agent Engineering Platform**

---

## Table of Contents

1. [Overview](#1-overview)
2. [OrchestrationAgent](#2-orchestrationagent)
3. [DecisionEngine](#3-decisionengine)
4. [ActionExecutor](#4-actionexecutor)
5. [Event Bus (AgentEventBus)](#5-event-bus-agenteventbus)
6. [LLM Integration](#6-llm-integration)
7. [Confidence-Based Execution](#7-confidence-based-execution)
8. [Database Models](#8-database-models)
9. [Usage Examples](#9-usage-examples)
10. [Debugging & Monitoring](#10-debugging--monitoring)

---

## 1. Overview

### What is the Multi-Agent AI System?

The Astralis One Multi-Agent AI System is an LLM-powered orchestration framework that intelligently routes, processes, and automates workflows across the platform. It serves as the "brain" of the platform, making autonomous decisions about how to handle incoming requests, schedule events, assign work, and trigger automations.

### Key Capabilities

- **Intelligent Routing**: Automatically assigns intake requests to appropriate pipelines based on content analysis
- **Event-Driven Architecture**: Responds to real-time events from multiple channels (email, webhooks, API, workers)
- **Dual-LLM Strategy**: Primary Claude Sonnet 4.5 with automatic OpenAI GPT-4o fallback
- **Confidence-Based Execution**: Auto-executes high-confidence decisions, requires approval for medium confidence
- **Multi-Action Orchestration**: Chains multiple actions with priorities, delays, and conditional execution
- **Audit Trail**: Complete decision history with reasoning, prompts, and outcomes
- **Rate Limiting**: Protects against runaway automation (60/min, 500/hour default)
- **Rollback Support**: Automatic rollback of failed action sequences

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Input Sources                            │
│  Email │ Webhooks │ DB Triggers │ Workers │ API │ Schedule      │
└──────┬──────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AgentEventBus                               │
│            (Pub/Sub Event Distribution)                          │
└──────┬──────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│                   OrchestrationAgent                             │
│  ┌───────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │  LLM Client   │→ │DecisionEngine  │→ │ActionExecutor    │  │
│  │ Claude/OpenAI │  │(Parse & Validate│  │(Execute Actions) │  │
│  └───────────────┘  └────────────────┘  └──────────────────┘  │
└──────┬──────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Action Handlers                              │
│  Pipeline │ Tasks │ Events │ Notifications │ Automations │ ...  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. OrchestrationAgent

### Purpose and Responsibilities

The `OrchestrationAgent` is the central coordinating component that:
- Subscribes to events from the event bus
- Processes inputs through LLM analysis
- Makes intelligent routing and action decisions
- Executes or queues actions based on confidence
- Maintains decision history and audit trails
- Enforces rate limits and error handling

**Source**: `/src/lib/agent/core/OrchestrationAgent.ts` (1288 lines)

### Configuration Options

```typescript
interface OrchestrationAgentConfig {
  // Required
  orgId: string;                    // Organization ID
  llmProvider: LLMProvider;         // 'OPENAI' | 'CLAUDE'
  llmModel: string;                 // Model ID (e.g., 'claude-sonnet-4-5-20250929')

  // Decision Thresholds
  temperature: number;              // LLM temperature (default: 0.3)
  autoExecuteThreshold: number;     // Auto-execute if confidence ≥ (default: 0.85)
  requireApprovalThreshold: number; // Require approval if confidence < (default: 0.5)

  // Capabilities
  enabledActions: DecisionType[];   // Allowed action types

  // Rate Limiting
  maxActionsPerMinute: number;      // Default: 60
  maxActionsPerHour: number;        // Default: 500

  // Notifications
  notifyOnHighPriority: boolean;    // Send notifications for high-priority items
  notifyOnFailure: boolean;         // Send notifications on failures
  escalationEmail: string;          // Email for escalations

  // Optional
  systemPrompt?: string;            // Custom system prompt override
  dryRun?: boolean;                 // Test mode (no actual execution)
  logger?: Logger;                  // Custom logger
}
```

### Rate Limiting

The agent enforces rate limits to prevent runaway automation:

- **Per Minute**: 60 actions (configurable)
- **Per Hour**: 500 actions (configurable)

Rate limits are enforced **per agent instance** and reset automatically. When rate limited, new requests are rejected with an error.

```typescript
// Rate limiter tracks timestamps and auto-cleans old ones
private rateLimiter: RateLimiterState = {
  minuteTimestamps: [],
  hourTimestamps: [],
};
```

### Statistics Tracking

The agent tracks comprehensive statistics:

```typescript
interface AgentStats {
  totalDecisions: number;
  successfulDecisions: number;
  failedDecisions: number;
  pendingApprovals: number;
  totalActionsExecuted: number;
  totalEventsProcessed: number;
  totalErrors: number;
  averageDecisionTimeMs: number;
  rateLimitStatus: {
    actionsThisMinute: number;
    actionsThisHour: number;
    isLimited: boolean;
  };
  uptimeMs: number;
  timeSinceLastDecisionMs: number | null;
}

// Access stats
const stats = agent.getStats();
console.log(`Success rate: ${stats.successfulDecisions / stats.totalDecisions * 100}%`);
```

### Decision History

Every decision is recorded for audit purposes:

```typescript
interface DecisionRecord {
  id: string;
  agentId: string;
  orgId: string;
  inputSource: AgentInputSource;
  inputType: string;
  inputData: Record<string, unknown>;
  llmPrompt: string;               // Full prompt sent to LLM
  llmResponse: string;             // Raw LLM response
  confidence: number;              // Confidence score (0-1)
  reasoning: string;               // LLM's reasoning
  decisionType: DecisionType;
  actions: AgentAction[];
  status: DecisionStatus;
  executionTime: number;
  errorMessage?: string;
  createdAt: Date;
  executedAt?: Date;
}

// Access history
const history = agent.getDecisionHistory(10); // Last 10 decisions
```

### 2.1 Initialization

```typescript
import { OrchestrationAgent, LLMProvider } from '@/lib/agent/core/OrchestrationAgent';
import { DecisionType } from '@/lib/agent/types/agent.types';

const agent = new OrchestrationAgent({
  orgId: 'org-123',
  llmProvider: LLMProvider.CLAUDE,
  llmModel: 'claude-sonnet-4-5-20250929',
  temperature: 0.3,
  autoExecuteThreshold: 0.85,
  requireApprovalThreshold: 0.5,
  enabledActions: [
    DecisionType.ASSIGN_PIPELINE,
    DecisionType.CREATE_TASK,
    DecisionType.CREATE_EVENT,
    DecisionType.SEND_NOTIFICATION,
  ],
  maxActionsPerMinute: 60,
  maxActionsPerHour: 500,
  notifyOnHighPriority: true,
  notifyOnFailure: true,
  escalationEmail: 'admin@astralisone.com',
});

// Start the agent (subscribes to events)
agent.start();

// Check if agent is running
if (agent.isActive()) {
  console.log('Agent is processing events');
}
```

### 2.2 Event Handling

The agent subscribes to specific event types by default:

```typescript
const DEFAULT_SUBSCRIBED_EVENTS: AgentEventType[] = [
  'intake:created',
  'intake:updated',
  'intake:escalated',
  'webhook:form_submitted',
  'webhook:booking_requested',
  'email:received',
  'pipeline:stage_changed',
  'calendar:reminder_due',
  'schedule:triggered',
];
```

**Event Payload Structure**:

```typescript
interface AgentEvent<T> {
  type: AgentEventType;              // Event type
  payload: T;                        // Event data
  timestamp: Date;                   // When event occurred
  source: AgentInputSource;          // Where it came from
  eventId?: string;                  // Unique event ID
  correlationId?: string;            // For tracking related events
  orgId?: string;                    // Organization context
  metadata?: Record<string, unknown>;
}
```

**Processing Flow**:

1. Event received from event bus
2. Converted to `AgentInput` format
3. Organization context loaded (pipelines, users, settings)
4. LLM prompt constructed with full context
5. LLM decision made (with fallback if primary fails)
6. DecisionEngine parses and validates response
7. Confidence threshold evaluated
8. Action executed or queued for approval

---

## 3. DecisionEngine

### Purpose

The `DecisionEngine` converts raw LLM responses into validated, executable actions:

- Parses JSON responses (with fallback for non-JSON)
- Validates decisions against agent capabilities
- Applies confidence thresholds
- Provides rule-based fallback when LLM fails
- Sanitizes and normalizes action parameters

**Source**: `/src/lib/agent/core/DecisionEngine.ts` (813 lines)

### LLM Response Parsing

The engine expects LLM responses in this format:

```json
{
  "intent": "SALES_INQUIRY",
  "confidence": 0.92,
  "reasoning": "Customer asking about pricing for enterprise plan. High urgency based on 'urgent' keyword.",
  "requiresApproval": false,
  "priority": 4,
  "actions": [
    {
      "type": "ASSIGN_PIPELINE",
      "params": {
        "intakeId": "int-789",
        "pipelineId": "pipe-sales-123",
        "stageId": "stage-new-lead",
        "priority": 4
      },
      "priority": 5,
      "requiresConfirmation": false
    },
    {
      "type": "SEND_NOTIFICATION",
      "params": {
        "recipientIds": ["user-sales-manager"],
        "type": "email",
        "subject": "Urgent Sales Inquiry",
        "body": "New high-priority lead requires attention."
      },
      "priority": 4,
      "requiresConfirmation": false
    }
  ],
  "warnings": [],
  "alternatives": [
    {
      "intent": "GENERAL_INQUIRY",
      "confidence": 0.45,
      "reason": "Could be general question, but sales keywords dominate"
    }
  ]
}
```

### Confidence Scoring

The engine evaluates confidence in three tiers:

| Confidence Range | Action | Description |
|------------------|--------|-------------|
| **≥ 0.85** (High) | Auto-execute | Decision is executed immediately |
| **0.5 - 0.85** (Medium) | Require approval | Human must approve before execution |
| **< 0.5** (Low) | Reject | Decision is rejected, no action taken |

```typescript
const engine = new DecisionEngine({
  autoExecuteThreshold: 0.85,
  requireApprovalThreshold: 0.5,
  enabledActions: [DecisionType.ASSIGN_PIPELINE, DecisionType.SEND_NOTIFICATION],
  enableFallback: true,
});

const decision = engine.processLLMResponse(rawResponse, context);

if (engine.shouldAutoExecute(decision)) {
  // Execute immediately
  await executor.execute(decision.actions);
} else if (engine.requiresApproval(decision)) {
  // Queue for human approval
  await queueForApproval(decision);
} else {
  // Reject (confidence too low)
  logger.warn('Decision rejected', { confidence: decision.confidence });
}
```

### Action Extraction

The engine validates each action against its type-specific requirements:

```typescript
// ASSIGN_PIPELINE requires:
// - intakeId (string)
// - pipelineId (string)
// - stageId (optional string)
// - assigneeId (optional string)

// CREATE_TASK requires:
// - templateId (string)
// - orgId (string)
// - source ('FORM' | 'EMAIL' | 'CHAT' | 'API' | 'CALL')
// - title (string)
// - priority (optional 1-5)

// CREATE_EVENT requires:
// - title (string)
// - startTime (Date)
// - endTime (Date)
// - attendees (string[])

// SEND_NOTIFICATION requires:
// - recipientIds or recipientEmails
// - type (string)
// - subject (string)
// - body (string)
```

### Fallback Handling

When LLM fails or returns invalid responses, the engine uses rule-based logic:

```typescript
// Keyword-based intent detection
const INTENT_KEYWORDS: Record<string, string[]> = {
  SALES_INQUIRY: ['price', 'pricing', 'cost', 'quote', 'buy', 'demo'],
  SUPPORT_REQUEST: ['help', 'support', 'issue', 'problem', 'error', 'bug'],
  BILLING_QUESTION: ['billing', 'invoice', 'payment', 'refund'],
  SCHEDULING: ['schedule', 'meeting', 'appointment', 'book'],
};

// Urgency detection
const URGENCY_KEYWORDS = {
  HIGH: ['urgent', 'emergency', 'asap', 'immediately', 'critical'],
  MEDIUM: ['important', 'soon', 'priority'],
  LOW: ['whenever', 'no rush', 'low priority'],
};

const fallback = engine.createFallbackDecision(context, 'LLM parsing failed');
// Fallback always requires approval
// Selects pipeline based on detected intent
// Adds escalation if high urgency
```

---

## 4. ActionExecutor

### Purpose

The `ActionExecutor` coordinates the execution of validated actions:

- Executes actions sequentially by priority
- Handles retries with exponential backoff
- Supports rollback on failure
- Evaluates conditional execution
- Tracks execution timing and outcomes

**Source**: `/src/lib/agent/core/ActionExecutor.ts` (983 lines)

### Supported Actions

#### ASSIGN_PIPELINE

Assigns an intake request to a pipeline and stage.

```typescript
{
  type: 'ASSIGN_PIPELINE',
  params: {
    intakeId: 'int-123',
    pipelineId: 'pipe-support',
    stageId: 'stage-triage',
    assigneeId: 'user-456',
    priority: 3,
    notes: 'Routed by AI agent'
  },
  priority: 5,
  requiresConfirmation: false
}
```

**Execution**: Calls `PipelineAssigner` to update database and emit `intake:assigned` event.

#### CREATE_TASK

Creates a task from a template.

```typescript
{
  type: 'CREATE_TASK',
  params: {
    templateId: 'tmpl-onboarding',
    orgId: 'org-123',
    source: 'FORM',
    title: 'New Client Onboarding',
    description: 'Set up account for Acme Corp',
    intakeId: 'int-789',
    priority: 4
  },
  priority: 4,
  requiresConfirmation: false
}
```

**Execution**: Loads template, creates task in database, emits `task:created` event.

#### CREATE_EVENT

Creates a calendar event with attendees.

```typescript
{
  type: 'CREATE_EVENT',
  params: {
    title: 'Discovery Call - Acme Corp',
    description: 'Initial consultation meeting',
    startTime: new Date('2025-12-05T14:00:00Z'),
    endTime: new Date('2025-12-05T15:00:00Z'),
    attendees: ['user-sales-1', 'client@acme.com'],
    location: 'https://meet.astralisone.com/xyz',
    sendInvites: true,
    type: 'meeting'
  },
  priority: 4,
  requiresConfirmation: false
}
```

**Execution**: Creates event, sends calendar invites, emits `calendar:event_created`.

#### SEND_NOTIFICATION

Sends notifications via email, in-app, push, or SMS.

```typescript
{
  type: 'SEND_NOTIFICATION',
  params: {
    recipientIds: ['user-manager-1'],
    recipientEmails: ['external@client.com'],
    type: 'email',
    subject: 'High-Priority Lead Assigned',
    body: 'A new sales lead has been assigned to you...',
    priority: 'high'
  },
  priority: 3,
  requiresConfirmation: false
}
```

**Execution**: Queues notification for sending.

#### TRIGGER_AUTOMATION

Triggers an n8n workflow.

```typescript
{
  type: 'TRIGGER_AUTOMATION',
  params: {
    workflowId: 'wf-send-welcome-email',
    payload: {
      customerId: 'cust-456',
      email: 'newclient@example.com'
    },
    waitForCompletion: false
  },
  priority: 3,
  requiresConfirmation: false
}
```

**Execution**: Calls n8n webhook, emits `automation:triggered` event.

#### ESCALATE

Escalates to human review or management.

```typescript
{
  type: 'ESCALATE',
  params: {
    reason: 'Unable to determine appropriate pipeline',
    level: 1,
    priority: 'high',
    escalateToEmail: 'admin@astralisone.com',
    relatedEntityIds: { intakeId: 'int-999' }
  },
  priority: 5,
  requiresConfirmation: false
}
```

**Execution**: Sends escalation notification, emits `intake:escalated` event.

### Action Validation

```typescript
const executor = new ActionExecutor({
  dryRun: false,
  stopOnFailure: false,
  enableRollback: true,
  orgId: 'org-123',
});

// Validate actions have handlers
const validation = executor.validateActions(decision.actions);
if (!validation.valid) {
  console.error('Missing handlers:', validation.missing);
}

// Execute with tracking
const outcome = await executor.execute(decision.actions, {
  executionId: 'exec-456',
  correlationId: 'decision-789',
});

console.log(`Status: ${outcome.status}`);
console.log(`Time: ${outcome.executionTime}ms`);
console.log(`Success: ${outcome.results.filter(r => r.success).length}`);
console.log(`Errors: ${outcome.errors.length}`);
```

### Execution Flow

1. **Sort by Priority**: Actions executed in priority order (5 = highest)
2. **Check Conditions**: Evaluate time_range, user_available, slot_available
3. **Apply Delays**: Wait if `delayMs` specified
4. **Execute with Retry**: Retry up to 3 times with exponential backoff
5. **Track Rollback**: Store rollback functions for successful actions
6. **Handle Failure**: Rollback if `enableRollback` and errors occur

```typescript
// Actions with delays
{
  type: 'SEND_NOTIFICATION',
  params: { /* ... */ },
  priority: 3,
  delayMs: 5000, // Wait 5 seconds before sending
}

// Conditional actions
{
  type: 'CREATE_EVENT',
  params: { /* ... */ },
  priority: 4,
  condition: {
    type: 'time_range',
    params: {
      start: '2025-12-05T00:00:00Z',
      end: '2025-12-31T23:59:59Z'
    }
  }
}
```

### Dry-Run Mode

Test decisions without actual execution:

```typescript
const executor = new ActionExecutor({ dryRun: true });

const outcome = await executor.execute(actions);
// outcome.results will have success: true but no real changes
```

---

## 5. Event Bus (AgentEventBus)

### Pub/Sub Pattern

The `AgentEventBus` is a singleton event distribution system:

- **Publishers** emit events (e.g., intake created, webhook received)
- **Subscribers** register handlers for specific event types
- **Wildcard listeners** receive all events (useful for logging)
- **Error isolation**: One handler's failure doesn't affect others

**Source**: `/src/lib/agent/inputs/EventBus.ts`

### Event Types

```typescript
type AgentEventType =
  // Intake events
  | 'intake:created'
  | 'intake:updated'
  | 'intake:assigned'
  | 'intake:escalated'
  | 'intake:routing_failed'

  // Task events
  | 'task:created'
  | 'task:status_changed'
  | 'task:assignee_changed'

  // Webhook events
  | 'webhook:form_submitted'
  | 'webhook:booking_requested'

  // Email events
  | 'email:received'
  | 'email:replied'

  // Pipeline events
  | 'pipeline:stage_changed'
  | 'pipeline:item_assigned'

  // Calendar events
  | 'calendar:event_created'
  | 'calendar:event_updated'
  | 'calendar:reminder_due'

  // Automation events
  | 'automation:triggered'
  | 'automation:completed'
  | 'automation:failed'

  // Agent events
  | 'agent:decision_made'
  | 'agent:action_executed'
  | 'agent:error'

  // Schedule events
  | 'schedule:triggered'

  // Custom
  | `custom:${string}`;
```

### Subscription Management

```typescript
import { AgentEventBus } from '@/lib/agent/inputs/EventBus';

const eventBus = AgentEventBus.getInstance();

// Subscribe to specific event
const subId = eventBus.on('intake:created', async (event) => {
  console.log('New intake:', event.payload.intakeId);
  console.log('Source:', event.source);
  console.log('Timestamp:', event.timestamp);
});

// Subscribe once (auto-removes after first invocation)
eventBus.once('automation:completed', (event) => {
  console.log('Automation finished:', event.payload.workflowId);
});

// Subscribe to all events (wildcard)
const wildcardId = eventBus.onAny((event) => {
  console.log(`[${event.type}]`, event.payload);
});

// Unsubscribe
eventBus.off(subId);
eventBus.off(wildcardId);

// Remove all listeners for a type
eventBus.removeAllListeners('intake:created');

// Remove ALL listeners
eventBus.removeAllListeners();
```

### Correlation IDs

Track related events across the system:

```typescript
// Initial event
await eventBus.emit('intake:created', {
  intakeId: 'int-123',
  /* ... */
}, {
  source: 'API',
  correlationId: 'corr-abc-123', // Unique tracking ID
});

// Related events use same correlationId
await eventBus.emit('agent:decision_made', {
  decisionId: 'dec-456',
  /* ... */
}, {
  source: 'agent',
  correlationId: 'corr-abc-123', // Same ID
});

await eventBus.emit('intake:assigned', {
  intakeId: 'int-123',
  pipelineId: 'pipe-789',
}, {
  source: 'agent',
  correlationId: 'corr-abc-123', // Same ID
});

// Query logs for correlationId to see full trace
```

---

## 6. LLM Integration

### 6.1 Dual-LLM Strategy

Astralis uses a **primary + fallback** approach for resilience:

- **Primary**: Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`)
- **Fallback**: OpenAI GPT-4o (`gpt-4o`)

When the primary LLM fails (API error, rate limit, timeout), the system automatically retries with the fallback LLM.

```typescript
// In OrchestrationAgent.makeLLMDecision():
try {
  // Try Claude first
  const response = await this.llmClient.complete([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);
  return response.content;
} catch (claudeError) {
  logger.error('Primary LLM failed, attempting OpenAI fallback', claudeError);

  try {
    // Fallback to OpenAI
    const openaiClient = createLLMClient({
      provider: LLMProvider.OPENAI,
      model: 'gpt-4o',
      defaultOptions: {
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens,
      },
    });

    const fallbackResponse = await openaiClient.complete([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);

    logger.info('OpenAI fallback succeeded');
    return fallbackResponse.content;
  } catch (openaiError) {
    // Both failed - emit routing_failed event
    await eventBus.emit('intake:routing_failed', {
      error: 'Both Claude and OpenAI LLM calls failed',
      primaryError: claudeError.message,
      fallbackError: openaiError.message,
    });

    throw new Error(`LLM routing failed - both providers unavailable`);
  }
}
```

### 6.2 ClaudeClient

**Features**:
- Tool use for structured JSON output
- Automatic retry with exponential backoff
- Rate limit handling (429 errors)
- Content filter detection
- Token usage tracking

**Configuration**:

```typescript
import { ClaudeClient } from '@/lib/agent/core/ClaudeClient';

const claudeClient = new ClaudeClient({
  model: 'claude-sonnet-4-5-20250929',
  apiKey: process.env.ANTHROPIC_API_KEY, // Optional, reads from env by default
  defaultOptions: {
    temperature: 0.3,
    maxTokens: 4096,
    timeout: 30000, // 30 seconds
  },
  maxRetries: 3,
  retryBaseDelay: 1000, // 1 second base, exponential backoff
});

// Simple completion
const response = await claudeClient.complete([
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'What is the capital of France?' },
]);

console.log(response.content); // "The capital of France is Paris."
console.log(`Tokens: ${response.usage.totalTokens}`);
console.log(`Latency: ${response.latencyMs}ms`);
```

**Message Formatting**:

```typescript
// Claude requires system message separate
const messages = [
  { role: 'system', content: 'You are an expert sales assistant.' },
  { role: 'user', content: 'Analyze this inquiry: "Looking for enterprise pricing"' },
];

// ClaudeClient automatically separates:
// systemMessage: "You are an expert sales assistant."
// conversationMessages: [{ role: 'user', content: '...' }]
```

**Error Handling**:

```typescript
try {
  const response = await claudeClient.complete(messages);
} catch (error) {
  if (error instanceof RateLimitError) {
    console.log('Rate limited, retry after:', error.retryAfterMs);
  } else if (error instanceof AuthenticationError) {
    console.log('Invalid API key');
  } else if (error instanceof ContentFilterError) {
    console.log('Content violated policy');
  } else if (error instanceof ModelOverloadedError) {
    console.log('Model overloaded, retry later');
  }
}
```

### 6.3 OpenAIClient

**Features**:
- Native JSON mode support (for supported models)
- Structured output with response_format
- Function calling support
- Automatic retry with exponential backoff
- Rate limit handling

**Configuration**:

```typescript
import { OpenAIClient } from '@/lib/agent/core/OpenAIClient';

const openaiClient = new OpenAIClient({
  model: 'gpt-4o',
  apiKey: process.env.OPENAI_API_KEY, // Optional
  organizationId: 'org-xyz', // Optional
  jsonMode: true, // Enable JSON mode for supported models
  defaultOptions: {
    temperature: 0.3,
    maxTokens: 2000,
    timeout: 30000,
  },
  maxRetries: 3,
  retryBaseDelay: 1000,
});

// Simple completion
const response = await openaiClient.complete([
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'Explain quantum computing in one sentence.' },
]);
```

**JSON Mode**:

```typescript
// OpenAI native JSON mode (GPT-4 Turbo, GPT-4o)
const messages = [
  {
    role: 'system',
    content: 'You are a helpful assistant that always responds with JSON.'
  },
  {
    role: 'user',
    content: 'Classify this: "urgent billing issue" - respond with JSON'
  },
];

const response = await openaiClient.complete(messages);
// OpenAI will enforce JSON output format
const parsed = JSON.parse(response.content);
```

---

## 7. Confidence-Based Execution

### Overview

The system uses confidence scores to determine whether to:
1. **Auto-execute** (high confidence)
2. **Require approval** (medium confidence)
3. **Reject** (low confidence)

This provides a balance between automation and safety.

### Confidence Thresholds

| Threshold | Default | Description |
|-----------|---------|-------------|
| `autoExecuteThreshold` | 0.85 | Execute immediately if confidence ≥ this value |
| `requireApprovalThreshold` | 0.5 | Require approval if between this and auto-execute |

```typescript
// Configuration
const agent = new OrchestrationAgent({
  orgId: 'org-123',
  autoExecuteThreshold: 0.85,     // 85% confidence to auto-execute
  requireApprovalThreshold: 0.5,  // 50% minimum to consider
  // ...
});

// LLM returns confidence
const decision = {
  intent: 'SALES_INQUIRY',
  confidence: 0.92,  // 92% confidence
  actions: [/* ... */],
};

// System logic:
if (confidence >= 0.85) {
  // AUTO-EXECUTE: confidence 92% is high
  await executor.execute(decision.actions);
}
```

### High Confidence (≥0.85): Auto-Execute

**Characteristics**:
- LLM is very confident in its classification
- Keywords and patterns match clearly
- Historical context supports the decision
- Urgency indicators are present

**Example**:

```json
{
  "intent": "SUPPORT_REQUEST",
  "confidence": 0.94,
  "reasoning": "Clear support keywords: 'error', 'not working', 'help needed'. User previously submitted support tickets. High urgency indicated by 'urgent' and 'asap'.",
  "actions": [
    {
      "type": "ASSIGN_PIPELINE",
      "params": {
        "intakeId": "int-456",
        "pipelineId": "pipe-support",
        "stageId": "stage-triage",
        "priority": 5
      }
    }
  ]
}
```

**Outcome**: Action executes immediately, user notified of assignment.

### Medium Confidence (0.5-0.85): Require Approval

**Characteristics**:
- LLM has some confidence but not certain
- Mixed signals or ambiguous language
- Could fit multiple categories
- No clear urgency indicators

**Example**:

```json
{
  "intent": "PARTNERSHIP_INQUIRY",
  "confidence": 0.68,
  "reasoning": "Mentions 'integration' and 'partnership' but also talks about pricing. Could be sales or partnership. Requires human review.",
  "requiresApproval": true,
  "actions": [
    {
      "type": "ASSIGN_PIPELINE",
      "params": {
        "intakeId": "int-789",
        "pipelineId": "pipe-partnerships",
        "stageId": "stage-new-inquiry"
      }
    }
  ],
  "alternatives": [
    {
      "intent": "SALES_INQUIRY",
      "confidence": 0.52,
      "reason": "Pricing discussion suggests potential sales lead"
    }
  ]
}
```

**Outcome**: Decision stored as pending, notification sent to approver, awaits human decision.

### Low Confidence (<0.5): Reject

**Characteristics**:
- LLM cannot confidently classify
- Insufficient information
- Conflicting signals
- Unusual or unexpected content

**Example**:

```json
{
  "intent": "UNKNOWN",
  "confidence": 0.32,
  "reasoning": "Content is unclear and does not match any known patterns. Insufficient information to make routing decision.",
  "actions": [
    {
      "type": "ESCALATE",
      "params": {
        "reason": "Unable to classify with confidence",
        "level": 1,
        "priority": "normal"
      }
    }
  ]
}
```

**Outcome**: Decision rejected, escalation triggered for human review.

### Human-in-the-Loop Workflows

**Pending Approval Flow**:

```typescript
// 1. Decision made, stored as pending
const decision = await agent.process(input);
// decision.requiresApproval === true

// 2. Get pending decisions
const pending = agent.getPendingDecisions();
// [{ id: 'pending-123', decision, input, context, createdAt, expiresAt }]

// 3. Human approves
await agent.approveDecision('pending-123');
// Actions execute, outcome returned

// 4. Or human rejects
await agent.rejectDecision('pending-123', 'Incorrect classification');
// Decision recorded as rejected
```

**Approval API**:

```typescript
// POST /api/agent/approve
{
  "decisionId": "pending-123",
  "approved": true,
  "approverId": "user-admin",
  "reason": "Verified correct pipeline assignment"
}

// POST /api/agent/approve
{
  "decisionId": "pending-456",
  "approved": false,
  "approverId": "user-admin",
  "reason": "Should be routed to billing, not support",
  "modifiedActions": [
    {
      "type": "ASSIGN_PIPELINE",
      "params": {
        "intakeId": "int-789",
        "pipelineId": "pipe-billing",  // Corrected
        "stageId": "stage-new-inquiry"
      }
    }
  ]
}
```

---

## 8. Database Models

The agent system uses Prisma models for persistence:

### OrchestrationAgent Table

```prisma
model OrchestrationAgent {
  id                      String        @id @default(cuid())
  orgId                   String
  name                    String?

  // LLM Configuration
  llmProvider             LLMProvider   // OPENAI | CLAUDE
  llmModel                String
  temperature             Float         @default(0.3)
  maxTokens               Int?
  systemPrompt            String?       @db.Text

  // Decision Thresholds
  autoExecuteThreshold    Float         @default(0.85)
  requireApprovalThreshold Float        @default(0.5)

  // Capabilities (JSON array of DecisionType)
  enabledActions          Json

  // Rate Limits
  maxActionsPerMinute     Int           @default(60)
  maxActionsPerHour       Int           @default(500)

  // Notifications
  notifyOnHighPriority    Boolean       @default(true)
  notifyOnFailure         Boolean       @default(true)
  escalationEmail         String?

  // Statistics
  totalDecisions          Int           @default(0)
  successfulDecisions     Int           @default(0)

  // Timestamps
  createdAt               DateTime      @default(now())
  updatedAt               DateTime      @updatedAt

  // Relations
  organization            Organization  @relation(fields: [orgId], references: [id])
  decisions               AgentDecision[]

  @@index([orgId])
}
```

### AgentDecision Table

```prisma
model AgentDecision {
  id                String              @id @default(cuid())
  agentId           String
  orgId             String

  // Input Context
  inputSource       AgentInputSource    // EMAIL | WEBHOOK | DB_TRIGGER | WORKER | API
  inputType         String
  inputData         Json                // Raw input data

  // LLM Interaction
  llmPrompt         String              @db.Text
  llmResponse       String              @db.Text
  llmProvider       LLMProvider
  llmModel          String

  // Decision Details
  intent            String
  confidence        Float
  reasoning         String              @db.Text
  decisionType      DecisionType

  // Actions (JSON array of AgentAction)
  actions           Json

  // Execution
  status            DecisionStatus      // PENDING | EXECUTED | FAILED | REJECTED | REQUIRES_APPROVAL
  executionTime     Int?                // ms
  errorMessage      String?             @db.Text

  // Approval (if requiresApproval)
  requiresApproval  Boolean             @default(false)
  approvedBy        String?
  approvedAt        DateTime?
  rejectedBy        String?
  rejectedAt        DateTime?
  rejectionReason   String?

  // Timestamps
  createdAt         DateTime            @default(now())
  executedAt        DateTime?

  // Relations
  agent             OrchestrationAgent  @relation(fields: [agentId], references: [id])
  organization      Organization        @relation(fields: [orgId], references: [id])

  @@index([agentId])
  @@index([orgId])
  @@index([status])
  @@index([createdAt])
}
```

### Enums

```prisma
enum LLMProvider {
  OPENAI
  CLAUDE
}

enum AgentInputSource {
  EMAIL
  WEBHOOK
  DB_TRIGGER
  WORKER
  API
  SCHEDULE
}

enum DecisionType {
  ASSIGN_PIPELINE
  CREATE_TASK
  CREATE_EVENT
  UPDATE_EVENT
  CANCEL_EVENT
  SEND_NOTIFICATION
  TRIGGER_AUTOMATION
  ESCALATE
  NO_ACTION
}

enum DecisionStatus {
  PENDING
  EXECUTED
  FAILED
  REJECTED
  REQUIRES_APPROVAL
}
```

---

## 9. Usage Examples

### 9.1 Creating an Agent

```typescript
import { OrchestrationAgent, LLMProvider } from '@/lib/agent/core/OrchestrationAgent';
import { DecisionType } from '@/lib/agent/types/agent.types';

// Initialize agent
const agent = new OrchestrationAgent({
  orgId: 'org-abc123',
  llmProvider: LLMProvider.CLAUDE,
  llmModel: 'claude-sonnet-4-5-20250929',
  temperature: 0.3,
  maxTokens: 4096,
  autoExecuteThreshold: 0.85,
  requireApprovalThreshold: 0.5,
  enabledActions: [
    DecisionType.ASSIGN_PIPELINE,
    DecisionType.CREATE_TASK,
    DecisionType.CREATE_EVENT,
    DecisionType.SEND_NOTIFICATION,
    DecisionType.TRIGGER_AUTOMATION,
  ],
  maxActionsPerMinute: 60,
  maxActionsPerHour: 500,
  notifyOnHighPriority: true,
  notifyOnFailure: true,
  escalationEmail: 'ops@astralisone.com',
});

// Start processing events
agent.start();

console.log('Agent started:', agent.isActive());
```

### 9.2 Processing an Intake Request

```typescript
import { AgentInputSource } from '@/lib/agent/types/agent.types';

// Process incoming form submission
const result = await agent.process({
  source: AgentInputSource.WEBHOOK,
  type: 'form_submitted',
  rawContent: `
    Name: John Doe
    Email: john@acmecorp.com
    Subject: Need help with API integration
    Message: We're experiencing errors when calling the /v1/customers endpoint.
             Getting 500 errors intermittently. This is urgent as it's blocking
             our production deployment.
    Company: Acme Corp
  `,
  structuredData: {
    formId: 'contact-form-v2',
    fields: {
      name: 'John Doe',
      email: 'john@acmecorp.com',
      subject: 'Need help with API integration',
      message: 'We\'re experiencing errors...',
      company: 'Acme Corp'
    }
  },
  metadata: {
    senderEmail: 'john@acmecorp.com',
    senderName: 'John Doe',
    priorityHint: 4,
  },
  timestamp: new Date(),
  correlationId: 'corr-webhook-789',
});

// Agent analyzes and decides
console.log('Intent:', result.intent);           // "SUPPORT_REQUEST"
console.log('Confidence:', result.confidence);   // 0.92
console.log('Actions:', result.actions.length);  // 2
console.log('Auto-executed:', result.confidence >= 0.85);

// Result:
// - Assigned to support pipeline
// - Created support ticket task
// - Notified on-call engineer
```

### 9.3 Handling a Webhook Event

```typescript
import { AgentEventBus } from '@/lib/agent/inputs/EventBus';

const eventBus = AgentEventBus.getInstance();

// Webhook endpoint receives event
app.post('/api/webhooks/n8n', async (req, res) => {
  const { workflowId, eventType, payload } = req.body;

  // Emit event to bus
  await eventBus.emit('webhook:callback_received', {
    id: `webhook-${Date.now()}`,
    workflowId,
    eventType,
    payload,
    timestamp: new Date(),
    source: 'WEBHOOK',
  }, {
    source: 'API',
    correlationId: req.headers['x-correlation-id'],
  });

  res.json({ success: true });
});

// Agent subscribed to this event will process it
// - Analyze payload
// - Determine appropriate actions
// - Execute or queue for approval
```

### 9.4 Monitoring Agent Decisions

```typescript
// Get agent statistics
const stats = agent.getStats();

console.log(`Total Decisions: ${stats.totalDecisions}`);
console.log(`Success Rate: ${(stats.successfulDecisions / stats.totalDecisions * 100).toFixed(1)}%`);
console.log(`Pending Approvals: ${stats.pendingApprovals}`);
console.log(`Avg Decision Time: ${stats.averageDecisionTimeMs}ms`);
console.log(`Rate Limit Status: ${stats.rateLimitStatus.actionsThisMinute}/60 per min`);

// Get decision history
const recentDecisions = agent.getDecisionHistory(20);

for (const decision of recentDecisions) {
  console.log(`
    [${decision.id}] ${decision.decisionType}
    Confidence: ${decision.confidence.toFixed(2)}
    Status: ${decision.status}
    Execution Time: ${decision.executionTime}ms
    Created: ${decision.createdAt.toISOString()}
  `);
}

// Get pending approvals
const pending = agent.getPendingDecisions();

for (const item of pending) {
  console.log(`
    [${item.id}] Awaiting Approval
    Intent: ${item.decision.intent}
    Confidence: ${item.decision.confidence.toFixed(2)}
    Actions: ${item.decision.actions.length}
    Expires: ${item.expiresAt.toISOString()}
  `);
}
```

---

## 10. Debugging & Monitoring

### Decision Logs

All decisions are logged with full context:

```typescript
// Enable debug logging
const agent = new OrchestrationAgent({
  // ...
  logger: {
    debug: (msg, data) => console.debug(`[Agent] ${msg}`, data),
    info: (msg, data) => console.info(`[Agent] ${msg}`, data),
    warn: (msg, data) => console.warn(`[Agent] ${msg}`, data),
    error: (msg, err, data) => console.error(`[Agent] ${msg}`, err, data),
  },
});

// Logs will show:
// [Agent] Processing input { source: 'WEBHOOK', type: 'form_submitted', correlationId: 'corr-123' }
// [Agent] Loaded organization context from database { orgId: 'org-abc', pipelineCount: 5, userCount: 12 }
// [ClaudeClient] Sending request to Anthropic API { model: 'claude-sonnet-4-5-20250929', messages: 2 }
// [ClaudeClient] Received response in 1250ms { responseId: 'msg_xyz', tokens: 450 }
// [DecisionEngine] Decision processed successfully { intent: 'SUPPORT_REQUEST', confidence: 0.92, actionCount: 2 }
// [Agent] Auto-executing decision { intent: 'SUPPORT_REQUEST', confidence: 0.92 }
// [ActionExecutor] Starting action execution { executionId: 'exec-456', actionCount: 2 }
// [ActionExecutor] Executing ASSIGN_PIPELINE { intakeId: 'int-789', pipelineId: 'pipe-support' }
// [ActionExecutor] Executing SEND_NOTIFICATION { recipientIds: ['user-oncall'] }
// [ActionExecutor] Action execution complete { status: 'EXECUTED', executionTime: 345, successCount: 2 }
```

### Statistics API

Query agent performance metrics:

```typescript
// GET /api/agent/stats
{
  "totalDecisions": 1247,
  "successfulDecisions": 1189,
  "failedDecisions": 34,
  "pendingApprovals": 24,
  "totalActionsExecuted": 2803,
  "totalEventsProcessed": 3891,
  "totalErrors": 58,
  "averageDecisionTimeMs": 1834,
  "rateLimitStatus": {
    "actionsThisMinute": 8,
    "actionsThisHour": 142,
    "isLimited": false
  },
  "uptimeMs": 7234567,
  "timeSinceLastDecisionMs": 2340
}
```

### Error Tracking

```typescript
// Errors are emitted as events
eventBus.on('agent:error', (event) => {
  console.error('Agent error:', event.payload);

  // Send to error tracking service
  Sentry.captureException(event.payload.error, {
    contexts: {
      agent: {
        agentId: event.payload.agentId,
        inputType: event.payload.inputType,
        correlationId: event.correlationId,
      }
    }
  });
});

// Track routing failures
eventBus.on('intake:routing_failed', (event) => {
  console.error('Routing failed:', event.payload);

  // Alert operations team
  await sendSlackAlert({
    channel: '#ops-alerts',
    message: `⚠️ Agent routing failed: ${event.payload.error}`,
    context: {
      primaryError: event.payload.primaryError,
      fallbackError: event.payload.fallbackError,
    }
  });
});
```

### Performance Metrics

```typescript
// Track decision latency
const metrics = {
  llmLatency: [],
  decisionLatency: [],
  executionLatency: [],
};

eventBus.on('agent:decision_made', (event) => {
  const decision = event.payload;

  metrics.decisionLatency.push({
    timestamp: event.timestamp,
    latency: decision.executionTime,
    confidence: decision.confidence,
  });

  // Calculate percentiles
  const p50 = percentile(metrics.decisionLatency.map(d => d.latency), 50);
  const p95 = percentile(metrics.decisionLatency.map(d => d.latency), 95);
  const p99 = percentile(metrics.decisionLatency.map(d => d.latency), 99);

  console.log(`Decision Latency - P50: ${p50}ms, P95: ${p95}ms, P99: ${p99}ms`);
});
```

### Debugging Failing Decisions

```typescript
// Query failed decisions
const failedDecisions = await prisma.agentDecision.findMany({
  where: {
    orgId: 'org-abc',
    status: 'FAILED',
    createdAt: {
      gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    }
  },
  include: {
    agent: true,
  },
  orderBy: {
    createdAt: 'desc'
  },
  take: 50
});

for (const decision of failedDecisions) {
  console.log(`
    Decision ID: ${decision.id}
    Input Type: ${decision.inputType}
    Intent: ${decision.intent}
    Confidence: ${decision.confidence}
    Error: ${decision.errorMessage}

    LLM Prompt:
    ${decision.llmPrompt.substring(0, 500)}...

    LLM Response:
    ${decision.llmResponse.substring(0, 500)}...

    Actions:
    ${JSON.stringify(decision.actions, null, 2)}
  `);
}
```

### Health Checks

```typescript
// GET /api/agent/health
app.get('/api/agent/health', (req, res) => {
  const agent = getAgentInstance();

  const health = {
    status: agent.isActive() ? 'healthy' : 'stopped',
    uptime: agent.getStats().uptimeMs,
    lastDecision: agent.getStats().timeSinceLastDecisionMs,
    pendingApprovals: agent.getStats().pendingApprovals,
    rateLimited: agent.getStats().rateLimitStatus.isLimited,
    llmProvider: agent.getConfig().llmProvider,
    llmModel: agent.getConfig().llmModel,
  };

  res.json(health);
});
```

---

## Quick Reference

### Key Files

| File | Purpose | Lines |
|------|---------|-------|
| `/src/lib/agent/core/OrchestrationAgent.ts` | Main agent coordinator | 1288 |
| `/src/lib/agent/core/DecisionEngine.ts` | LLM response parser & validator | 813 |
| `/src/lib/agent/core/ActionExecutor.ts` | Action execution & orchestration | 983 |
| `/src/lib/agent/inputs/EventBus.ts` | Pub/sub event system | 400+ |
| `/src/lib/agent/core/ClaudeClient.ts` | Claude API integration | 699 |
| `/src/lib/agent/core/OpenAIClient.ts` | OpenAI API integration | 636 |
| `/src/lib/agent/types/agent.types.ts` | Type definitions | 1752 |

### Environment Variables

```bash
# LLM API Keys
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Database
DATABASE_URL=postgresql://...

# Redis (for event bus persistence)
REDIS_URL=redis://localhost:6379

# n8n Automation
N8N_WEBHOOK_URL=https://automation.astralisone.com
```

### Common Commands

```bash
# Start agent in development
npm run dev

# Run agent worker
npm run worker

# View agent logs
pm2 logs astralis-worker

# Monitor agent statistics
curl http://localhost:3001/api/agent/stats | jq

# View pending approvals
curl http://localhost:3001/api/agent/pending | jq
```

### Support

For issues with the agent system:
1. Check logs: `pm2 logs astralis-worker`
2. Verify LLM API keys are set
3. Check rate limits: `GET /api/agent/stats`
4. Review recent decisions: `GET /api/agent/decisions?limit=20`
5. Test with dry-run mode: `{ dryRun: true }`

---

**End of Documentation**

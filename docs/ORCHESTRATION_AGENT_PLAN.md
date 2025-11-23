# AstralisOps Orchestration Agent - Development Plan

## Overview

This document outlines the development plan for an LLM-powered Scheduling & Task Management Agent that unifies existing disparate services into a single orchestration layer.

### Existing Infrastructure (to leverage)
- `SchedulingAgentTask` model for multi-channel input processing
- `AIRoutingService` for intake classification (GPT-4)
- `AISchedulingService` for time slot suggestions
- n8n automation framework with webhook triggers
- Queue-based processing architecture (BullMQ)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATION AGENT                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    LLM Core (Claude/OpenAI)                  │   │
│  │         - Intent Classification                              │   │
│  │         - Decision Making                                    │   │
│  │         - Response Generation                                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│  ┌───────────┬───────────────┼───────────────┬───────────────┐     │
│  ▼           ▼               ▼               ▼               ▼     │
│ ┌─────┐  ┌─────────┐  ┌───────────┐  ┌──────────┐  ┌─────────┐    │
│ │Email│  │Webhooks │  │DB Triggers│  │Worker    │  │API      │    │
│ │Inbox│  │(Forms)  │  │(Changes)  │  │Events    │  │Requests │    │
│ └─────┘  └─────────┘  └───────────┘  └──────────┘  └─────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      ACTION EXECUTORS                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │Pipeline  │ │Calendar  │ │Email     │ │n8n       │ │Notification│ │
│  │Assigner  │ │Manager   │ │Sender    │ │Trigger   │ │Dispatcher │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Data Models

### 2.1 OrchestrationAgent Model

```prisma
model OrchestrationAgent {
  id                String   @id @default(cuid())
  orgId             String
  name              String
  llmProvider       LLMProvider  // OPENAI, CLAUDE
  llmModel          String       // "gpt-4-turbo", "claude-sonnet-4-20250514"
  systemPrompt      String       @db.Text
  temperature       Float        @default(0.3)
  maxTokens         Int          @default(2000)
  isActive          Boolean      @default(true)

  // Capabilities
  canAssignPipelines    Boolean @default(true)
  canCreateEvents       Boolean @default(true)
  canSendNotifications  Boolean @default(true)
  canTriggerAutomations Boolean @default(true)

  // Rate limiting
  maxActionsPerMinute   Int     @default(60)
  maxActionsPerHour     Int     @default(500)

  // Audit
  totalDecisions        Int     @default(0)
  successfulDecisions   Int     @default(0)

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  organization      organization @relation(fields: [orgId], references: [id])
  decisions         AgentDecision[]

  @@index([orgId, isActive])
}

enum LLMProvider {
  OPENAI
  CLAUDE
}
```

### 2.2 AgentDecision Model

```prisma
model AgentDecision {
  id              String   @id @default(cuid())
  agentId         String
  orgId           String

  // Input
  inputSource     AgentInputSource  // EMAIL, WEBHOOK, DB_TRIGGER, WORKER, API
  inputType       String            // "intake_created", "form_submitted", etc.
  inputData       Json

  // LLM Processing
  llmPrompt       String   @db.Text
  llmResponse     String   @db.Text
  confidence      Float
  reasoning       String?

  // Decision
  decisionType    DecisionType  // ASSIGN_PIPELINE, CREATE_EVENT, SEND_NOTIFICATION, etc.
  actions         Json          // Array of actions taken

  // Outcome
  status          DecisionStatus  // PENDING, EXECUTED, FAILED, REJECTED
  executionTime   Int?
  errorMessage    String?

  createdAt       DateTime @default(now())
  executedAt      DateTime?

  agent           OrchestrationAgent @relation(fields: [agentId], references: [id])

  @@index([orgId, createdAt])
  @@index([agentId, status])
  @@index([inputSource])
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

## 3. Directory Structure

```
src/lib/agent/
├── core/
│   ├── OrchestrationAgent.ts      # Main agent class
│   ├── LLMClient.ts               # OpenAI/Claude abstraction
│   ├── DecisionEngine.ts          # Decision making logic
│   └── ActionExecutor.ts          # Execute decided actions
├── inputs/
│   ├── EventBus.ts                # Central event dispatcher
│   ├── EmailInputHandler.ts       # Process incoming emails
│   ├── WebhookInputHandler.ts     # Process webhook payloads
│   ├── DBTriggerHandler.ts        # Process database changes
│   └── WorkerEventHandler.ts      # Process worker queue events
├── actions/
│   ├── PipelineAssigner.ts        # Assign intake to pipeline
│   ├── CalendarManager.ts         # Create/update calendar events
│   ├── NotificationDispatcher.ts  # Send notifications
│   └── AutomationTrigger.ts       # Trigger n8n workflows
├── prompts/
│   ├── system-prompt.ts           # Base system prompt
│   ├── intake-routing.ts          # Intake classification prompt
│   ├── scheduling.ts              # Scheduling decision prompt
│   └── notification.ts            # Notification decision prompt
└── types/
    └── agent.types.ts             # TypeScript definitions
```

---

## 4. TypeScript Interfaces

### 4.1 LLM Client Interface

```typescript
interface LLMClient {
  provider: 'openai' | 'claude';
  model: string;

  complete(prompt: string, options?: LLMOptions): Promise<LLMResponse>;
  classifyIntent(input: AgentInput): Promise<IntentClassification>;
  makeDecision(context: DecisionContext): Promise<AgentDecision>;
}
```

### 4.2 Decision Context

```typescript
interface DecisionContext {
  // Input details
  input: {
    source: AgentInputSource;
    type: string;
    rawContent: string;
    structuredData?: Record<string, any>;
    metadata?: Record<string, any>;
  };

  // Organization context
  org: {
    id: string;
    name: string;
    pipelines: PipelineSummary[];
    users: UserSummary[];
    settings: OrgSettings;
  };

  // Historical context
  history?: {
    recentDecisions: AgentDecision[];
    relatedIntakes: IntakeSummary[];
    relatedEvents: EventSummary[];
  };

  // Available actions
  availableActions: DecisionType[];
}
```

### 4.3 Agent Configuration

```typescript
interface AgentConfig {
  // LLM Settings
  llmProvider: 'openai' | 'claude';
  llmModel: string;
  temperature: number;

  // Decision Thresholds
  autoExecuteThreshold: number;  // Above this confidence, execute automatically
  requireApprovalThreshold: number;  // Below this, require human approval

  // Capabilities
  enabledActions: DecisionType[];

  // Rate Limits
  maxActionsPerMinute: number;
  maxActionsPerHour: number;

  // Notifications
  notifyOnHighPriority: boolean;
  notifyOnFailure: boolean;
  escalationEmail: string;
}
```

---

## 5. Decision Flow Examples

### 5.1 Intake Routing Flow

```
Input: New intake request from contact form
    ↓
EventBus.emit('intake:created', intakeData)
    ↓
OrchestrationAgent.process()
    ↓
LLM Analysis:
  - Classify intent (SALES, SUPPORT, BILLING, etc.)
  - Assess urgency (1-5)
  - Identify keywords/entities
    ↓
Decision Engine:
  - Match to pipeline (by category + confidence)
  - Identify assignee (by role + load balancing)
  - Determine notifications needed
    ↓
Actions Executed:
  1. PipelineAssigner.assign(intakeId, pipelineId, stageId)
  2. NotificationDispatcher.send(assigneeId, 'new_intake', data)
  3. AutomationTrigger.fire('intake_assigned', payload)
    ↓
AgentDecision logged with full audit trail
```

### 5.2 Form → Calendar Event Flow

```
Input: Booking form webhook (date, time, guest info)
    ↓
EventBus.emit('webhook:form_submitted', formData)
    ↓
OrchestrationAgent.process()
    ↓
LLM Analysis:
  - Extract: date, time, duration, attendees, purpose
  - Check for conflicts
  - Assess if confirmation needed
    ↓
Decision Engine:
  - Validate availability
  - Select best time slot (if conflict)
  - Prepare event details
    ↓
Actions Executed:
  1. CalendarManager.createEvent(eventData)
  2. CalendarManager.createReminders(eventId, [24h, 1h])
  3. NotificationDispatcher.sendConfirmation(guestEmail)
  4. NotificationDispatcher.notifyHost(hostId)
    ↓
AgentDecision logged
```

---

## 6. System Prompt Template

```typescript
// src/lib/agent/prompts/system-prompt.ts
export const ORCHESTRATION_SYSTEM_PROMPT = `
You are the AstralisOps Orchestration Agent for organization "{orgName}".

## Your Role
You process incoming requests from multiple channels (email, forms, webhooks,
database events) and make intelligent decisions about:
1. Pipeline assignment for intake requests
2. Calendar event creation and management
3. Notification routing
4. Automation triggering

## Available Pipelines
{pipelinesJson}

## Team Members
{teamMembersJson}

## Decision Guidelines

### For Intake Requests:
- SALES_INQUIRY → "Sales Inquiries" pipeline, notify sales team
- SUPPORT_REQUEST → "Support Requests" pipeline, assess urgency
- BILLING_QUESTION → Route to ADMIN role user
- PARTNERSHIP → "General Intake" + notify ADMIN
- HIGH URGENCY (keywords: urgent, emergency, ASAP) → Priority 5, immediate notification

### For Scheduling Requests:
- Always check conflicts before creating events
- Default duration: 30 minutes
- Prefer 9 AM - 5 PM slots
- Avoid lunch hour (12-1 PM)
- Include calendar invites for all participants

### For Notifications:
- ADMIN: Organization-wide issues, billing, partnerships
- OPERATOR: Support requests, technical issues
- PM: Project-related intakes, deadline-sensitive items

## Response Format
Always respond with valid JSON:
{
  "intent": "string",
  "confidence": 0.0-1.0,
  "reasoning": "string",
  "actions": [
    {
      "type": "ASSIGN_PIPELINE|CREATE_EVENT|SEND_NOTIFICATION|TRIGGER_AUTOMATION",
      "params": { ... }
    }
  ],
  "requiresApproval": boolean
}
`;
```

---

## 7. API Endpoints

```
POST   /api/agent/config           # Create/update agent config
GET    /api/agent/config           # Get current config
POST   /api/agent/process          # Manual input processing
GET    /api/agent/decisions        # List decisions with filters
GET    /api/agent/decisions/:id    # Get decision details
POST   /api/agent/decisions/:id/approve  # Approve pending decision
POST   /api/agent/decisions/:id/reject   # Reject pending decision
GET    /api/agent/analytics        # Performance metrics
```

---

## 8. Integration Points

| System   | Integration Method          | Events                                   |
|----------|-----------------------------|------------------------------------------|
| Email    | Webhook /api/webhooks/email | Incoming emails → email:received         |
| Forms    | Webhook /api/webhooks/form  | Form submit → form:submitted             |
| Booking  | API hook in /api/booking    | New booking → booking:created            |
| Intake   | Prisma middleware           | Intake created → intake:created          |
| Pipeline | Prisma middleware           | Stage changed → pipeline:stage_changed   |
| Calendar | Cron job                    | Reminder due → reminder:due              |
| n8n      | Webhook callback            | Workflow complete → automation:completed |

---

## 9. Implementation Phases

### Phase 1: Core Infrastructure (Week 1-2)
- [ ] Create Prisma models (OrchestrationAgent, AgentDecision)
- [ ] Build LLMClient abstraction (OpenAI + Claude support)
- [ ] Implement EventBus for unified input processing
- [ ] Create base OrchestrationAgent class
- [ ] Define all TypeScript types

### Phase 2: Input Handlers (Week 2-3)
- [ ] EmailInputHandler - Parse incoming emails via webhook
- [ ] WebhookInputHandler - Process form submissions
- [ ] DBTriggerHandler - Listen to Prisma events
- [ ] WorkerEventHandler - Integrate with BullMQ workers

### Phase 3: Action Executors (Week 3-4)
- [ ] PipelineAssigner - Intake → Pipeline assignment
- [ ] CalendarManager - Event CRUD + conflict detection
- [ ] NotificationDispatcher - Email/in-app notifications
- [ ] AutomationTrigger - n8n workflow execution

### Phase 4: Decision Engine (Week 4-5)
- [ ] Prompt engineering for each decision type
- [ ] Confidence threshold configuration
- [ ] Human-in-the-loop for low-confidence decisions
- [ ] Fallback handling

### Phase 5: API & Dashboard (Week 5-6)
- [ ] REST API for agent configuration
- [ ] Decision audit log viewer
- [ ] Real-time decision monitoring
- [ ] Agent performance analytics

---

## 10. Design Decisions (To Be Made)

### Decision 1: Approval Workflow
- **Option A:** All decisions execute automatically (faster, riskier)
- **Option B:** Low-confidence decisions require human approval (safer, slower)
- **Option C:** Configurable per decision type
- **Recommended:** Option C

### Decision 2: Event Processing
- **Option A:** Synchronous (immediate response, blocks caller)
- **Option B:** Queue-based with BullMQ (async, scalable, existing infrastructure)
- **Option C:** Hybrid (urgent = sync, normal = queue)
- **Recommended:** Option C

### Decision 3: LLM Fallback Strategy
- **Option A:** Hard fail if LLM unavailable
- **Option B:** Fall back to rule-based routing (existing keyword matching)
- **Option C:** Queue for retry with exponential backoff
- **Recommended:** Option B + C combined

---

## 11. Dependencies

### Required Packages
```json
{
  "openai": "^4.x",
  "@anthropic-ai/sdk": "^0.x",
  "bullmq": "existing",
  "ioredis": "existing",
  "zod": "existing"
}
```

### Environment Variables
```env
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
AGENT_DEFAULT_PROVIDER=claude
AGENT_AUTO_EXECUTE_THRESHOLD=0.85
AGENT_REQUIRE_APPROVAL_THRESHOLD=0.5
```

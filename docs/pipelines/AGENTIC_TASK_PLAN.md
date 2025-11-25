# Agentic Task System Implementation Plan

> **Persistent Plan**: This document is the source of truth for implementing the Agentic Task System.
> Agents should read this file at the start of context to understand the full implementation plan.

## Architecture Overview

This plan implements an **Agentic Task System** where:
- **Each Task is an intelligent agent** that drives itself through pipelines
- **One Base Task Agent** handles ANY task type via JSON-defined **TaskTemplates**
- **Every decision is logged** in a **DecisionLog** for audit and replay
- **Pipelines become configuration + UI views**, not the controlling brain
- **OrchestrationAgent** (existing 1,152-line LLM brain) classifies intake → creates TaskInstance
- **BaseTaskAgent** (new) subscribes to task.* events → drives task lifecycle

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         TWO-AGENT ARCHITECTURE                                │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  Form/Email/Chat/API/Call                                                    │
│           │                                                                   │
│           ▼                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                     AgentEventBus (Singleton)                           │ │
│  │  Events: intake:*, webhook:*, email:*, task:*, pipeline:*, calendar:*   │ │
│  └────────────┬───────────────────────────────────────┬────────────────────┘ │
│               │                                       │                       │
│               ▼                                       ▼                       │
│  ┌─────────────────────┐                 ┌─────────────────────┐            │
│  │ OrchestrationAgent  │                 │   BaseTaskAgent     │            │
│  │   (1,152 lines)     │                 │      (NEW)          │            │
│  │                     │                 │                     │            │
│  │ Subscribes to:      │                 │ Subscribes to:      │            │
│  │ • intake:created    │    task.created │ • task.created      │            │
│  │ • webhook:*         │ ───────────────▶│ • task.status_changed│           │
│  │ • email:received    │                 │ • task.stage_changed │           │
│  │ • schedule:*        │                 │ • task.sla_breached  │           │
│  │                     │                 │ • task.reprocess_*   │           │
│  │ Actions:            │                 │                     │            │
│  │ • ASSIGN_PIPELINE   │                 │ Actions (per template):│          │
│  │ • CREATE_EVENT      │                 │ • SET_STATUS         │           │
│  │ • SEND_NOTIFICATION │                 │ • SET_STAGE          │           │
│  │ • TRIGGER_AUTOMATION│                 │ • ASSIGN_STAFF       │           │
│  │ • ESCALATE          │                 │ • PING_CUSTOMER      │           │
│  │ • **CREATE_TASK**   │                 │ • ADD_INTERNAL_NOTE  │           │
│  │   (NEW)             │                 │ • ESCALATE           │           │
│  │                     │                 │ • NO_OP              │           │
│  └──────────┬──────────┘                 └──────────┬──────────┘            │
│             │                                       │                        │
│             │ Uses: DecisionEngine                  │ Uses: TaskTemplate     │
│             │       ActionExecutor                  │       LLM + template   │
│             │       PromptBuilder                   │       systemPrompt     │
│             ▼                                       ▼                        │
│  ┌─────────────────────┐                 ┌─────────────────────┐            │
│  │  DecisionRecord     │                 │    DecisionLog      │            │
│  │  (existing audit)   │                 │  (new task audit)   │            │
│  └─────────────────────┘                 └─────────────────────┘            │
│                                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

### How OrchestrationAgent Creates Tasks

The existing OrchestrationAgent (1,152 lines) is the **central brain** that:
1. **Receives inputs** via EventBus subscriptions
2. **Builds context** (org, pipelines, users, history)
3. **Calls LLM** with PromptBuilder prompts
4. **Processes response** through DecisionEngine (validates, applies thresholds)
5. **Executes actions** via ActionExecutor (pluggable handlers per DecisionType)
6. **Records decisions** in audit trail

**New addition**: Add `CREATE_TASK` decision type to OrchestrationAgent:
```typescript
// New handler in ActionExecutor
case DecisionTypeEnum.CREATE_TASK:
  // 1. Find TaskTemplate by classification
  const template = await this.findTemplate(params.templateId);

  // 2. Create TaskInstance in DB
  const task = await prisma.task.create({
    data: {
      templateId: template.id,
      orgId: params.orgId,
      source: params.source,
      status: 'NEW',
      pipelineKey: template.pipeline.preferredPipelineKey,
      stageKey: template.pipeline.defaultStageKey,
      steps: template.steps.map(s => ({ id: s.id, status: 'new' })),
      timeline: { typicalMinutes: template.typicalMinutes, startedAt: new Date() }
    }
  });

  // 3. Emit task.created → BaseTaskAgent picks it up
  await eventBus.emit('task.created', { taskId: task.id, ... });
```

### How BaseTaskAgent Drives Tasks

The new BaseTaskAgent is **complementary** to OrchestrationAgent:
1. **Subscribes** to task.* events via same EventBus singleton
2. **Loads context**: TaskInstance + TaskTemplate (with agentConfig.systemPrompt)
3. **Calls LLM** with template-specific system prompt
4. **Validates response** against template.agentConfig.allowedActions
5. **Executes actions** via TaskActionExecutor
6. **Logs decisions** to DecisionLog (separate from OrchestrationAgent's audit)
7. **Respects override flag** - stops processing if human took over

---

## Key Concepts

### 1. TaskTemplate (Static Definition)
JSON config that defines how a task type behaves:
```typescript
{
  id: "BOOKING_REQUEST_V1",
  label: "Booking Request",
  applicableSources: ["FORM", "EMAIL", "CHAT", "CALL"],
  category: "SALES_INQUIRY",
  department: "Sales",
  staffRole: "AGENT",
  typicalMinutes: 240,
  defaultPriority: 3,
  pipeline: { preferredPipelineKey: "sales-tasks", defaultStageKey: "new_intake" },
  steps: [
    { id: "capture-details", label: "Verify contact & request", order: 1 },
    { id: "propose-slots", label: "Send available time slots", order: 2 },
    { id: "confirm-booking", label: "Confirm appointment", order: 3 }
  ],
  agentConfig: {
    systemPrompt: "You are a task agent handling booking requests...",
    allowedActions: ["SET_STATUS", "SET_STAGE", "ASSIGN_STAFF", "PING_CUSTOMER"],
    completionCriteria: { status: "done", requiredStepsCompleted: ["capture-details", "confirm-booking"] }
  }
}
```

### 2. TaskInstance (Concrete Task)
Created per intake, tracks state through pipelines:
```typescript
{
  id: "task_abc123",
  templateId: "BOOKING_REQUEST_V1",
  orgId: "org-123",
  source: "FORM",
  title: "Demo booking for Acme Corp",
  status: "in_progress",
  pipelineKey: "sales-tasks",
  stageKey: "qualification",
  steps: [{ id: "capture-details", status: "done" }, ...],
  timeline: { typicalMinutes: 240, startedAt: "...", dueAt: "..." },
  agentState: { lastDecisionId: "dec_xyz", decisionIds: ["dec_001", "dec_002", "dec_xyz"] },
  override: { overridden: false }
}
```

### 3. Base Task Agent
Single LLM-powered agent that:
- Reacts to events: `task.created`, `task.status_changed`, `task.sla_breached`, etc.
- Loads TaskTemplate to understand behavior rules
- Emits AgentDecision: `{ reasoning: "...", actions: [{ type: "SET_STAGE", ... }] }`
- Respects `override.overridden` flag (human takeover = NO_OP)

### 4. DecisionLog
Append-only log for audit and replay:
```typescript
{
  id: "dec_xyz",
  taskId: "task_abc123",
  eventName: "task.created",
  inputSnapshot: { status: "new", stageKey: "new_intake", ... },
  llmCall: { model: "gpt-4.1-mini", tokensIn: 1200, tokensOut: 150 },
  decision: { reasoning: "New booking, moving to qualification", actions: [...] },
  appliedAt: "2025-01-15T10:30:00Z"
}
```

---

## Existing Infrastructure to Leverage

```
src/lib/agent/
├── core/
│   ├── OrchestrationAgent.ts    (1,152 lines) ← Keep for intake classification
│   ├── DecisionEngine.ts        (795 lines)   ← Reuse decision validation
│   ├── ActionExecutor.ts        (862 lines)   ← Extend for task actions
│   ├── LLMClient.ts / OpenAIClient / ClaudeClient
├── inputs/
│   ├── EventBus.ts              ← Use for task.*/pipeline.* events
│   ├── WebhookInputHandler.ts   ← Intake source
│   ├── EmailInputHandler.ts     ← Intake source
├── actions/
│   ├── PipelineAssigner.ts      ← Enhance for task-based routing
└── types/
    └── agent.types.ts           ← Extend with new types
```

---

## Implementation Chunks (Sub-Agent Consumable)

### Chunk 1: Prisma Schema Update
**Agent**: `backend-engineer`
**Estimated complexity**: Medium
**Dependencies**: None
**Status**: NOT STARTED

**Tasks**:
1. Add enums: `PipelineType`, `TaskSource`, `TaskStatus`
2. Create `TaskTemplate` model
3. Rename `pipelineItem` → `Task` with all new fields
4. Create `DecisionLog` model
5. Enhance `Pipeline` model with `key`, `type`
6. Enhance `PipelineStage` model with `key`, `isTerminal`
7. Run migration: `npx prisma migrate dev --name agentic_tasks`

**Files to Modify**:
- `prisma/schema.prisma`

**Prisma Schema Changes**:
```prisma
enum PipelineType {
  SALES
  SUPPORT
  BILLING
  INTERNAL
  GENERIC
  CUSTOM
}

enum TaskSource {
  FORM
  EMAIL
  CHAT
  API
  CALL
}

enum TaskStatus {
  NEW
  IN_PROGRESS
  NEEDS_REVIEW
  BLOCKED
  DONE
  CANCELLED
}

model TaskTemplate {
  id                   String   @id  // e.g., BOOKING_REQUEST_V1
  label                String
  category             String
  department           String?
  staffRole            String?
  typicalMinutes       Int
  defaultPriority      Int
  applicableSources    String[]
  preferredPipelineKey String
  defaultStageKey      String
  definition           Json     // Full JSON template
  tasks                Task[]
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}

model Task {
  id         String      @id @default(cuid())
  orgId      String
  templateId String
  template   TaskTemplate @relation(fields: [templateId], references: [id])
  // ... (see full schema in zip at /tmp/pipelines-extract-new/astralis-agentic-tasks/)
}

model DecisionLog {
  id             String   @id @default(cuid())
  taskId         String
  task           Task     @relation(fields: [taskId], references: [id])
  orgId          String
  templateId     String
  eventName      String
  eventId        String?
  agentConfigHash String?
  inputSnapshot  Json
  llmCall        Json?
  decision       Json     // AgentDecision
  appliedAt      DateTime @default(now())
  createdAt      DateTime @default(now())
  @@index([taskId])
}
```

---

### Chunk 2: TypeScript Types
**Agent**: `backend-engineer`
**Estimated complexity**: Low
**Dependencies**: Chunk 1
**Status**: NOT STARTED

**Tasks**:
1. Create `src/lib/types/tasks.ts` - TaskTemplate, TaskInstance, AgentDecision, AgentAction types
2. Create `src/lib/events/types.ts` - EventEnvelope, TaskEvent, PipelineEvent types
3. Update `src/lib/agent/types/agent.types.ts` with new event types

**Source Files** (copy from zip at `/tmp/pipelines-extract-new/astralis-agentic-tasks/`):
- `src/lib/types/tasks.ts`
- `src/lib/events/types.ts`

**Files to Modify**:
- `src/lib/agent/types/agent.types.ts`
- `src/types/pipelines.ts`

**Key Types**:
```typescript
// AgentAction types
type AgentAction =
  | { type: "SET_STATUS"; toStatus: TaskStatus }
  | { type: "SET_STAGE"; toStageKey: string }
  | { type: "ASSIGN_STAFF"; strategy: "LEAST_BUSY_IN_ROLE" | "KEEP_EXISTING" | "UNASSIGN"; role?: string }
  | { type: "TAG_TASK"; add: string[]; remove?: string[] }
  | { type: "PING_CUSTOMER"; channel: "EMAIL" | "SMS" | "CHAT"; templateHint: string }
  | { type: "ADD_INTERNAL_NOTE"; note: string }
  | { type: "ESCALATE"; reason: string; targetRole?: string }
  | { type: "NO_OP"; reason: string };

// AgentDecision
interface AgentDecision {
  reasoning: string;
  actions: AgentAction[];
}

// TaskEvent names
type TaskEventName =
  | "task.created"
  | "task.status_changed"
  | "task.stage_changed"
  | "task.assignee_changed"
  | "task.override_set"
  | "task.reprocess_requested"
  | "task.sla_breached";
```

---

### Chunk 3: Base Task Agent
**Agent**: `backend-engineer`
**Estimated complexity**: High
**Dependencies**: Chunks 1, 2
**Status**: NOT STARTED

**Tasks**:
1. Create `src/lib/agent/core/BaseTaskAgent.ts` - Main agent runner
2. Create `src/lib/agent/prompts/base-task-agent.ts` - System + user prompt templates
3. Create `src/lib/agent/core/TaskActionExecutor.ts` - Execute AgentAction types
4. Wire into EventBus for task.* events

**Source Files** (copy from zip):
- `src/lib/agent/baseTaskAgentPrompt.md` → adapt to `src/lib/agent/prompts/base-task-agent.ts`
- `src/lib/agent/baseTaskAgent.ts` → adapt to `src/lib/agent/core/BaseTaskAgent.ts`

**Files to Create**:
- `src/lib/agent/core/BaseTaskAgent.ts`
- `src/lib/agent/prompts/base-task-agent.ts`
- `src/lib/agent/core/TaskActionExecutor.ts`

---

### Chunk 4: Action Executor for Tasks
**Agent**: `backend-engineer`
**Estimated complexity**: Medium
**Dependencies**: Chunks 1, 2, 3
**Status**: NOT STARTED

**Tasks**:
1. Implement action handlers for each AgentAction type
2. Emit corresponding events (task.*, pipeline.*)
3. Integrate with existing ActionExecutor or create parallel TaskActionExecutor

---

### Chunk 5: Task Templates Seed
**Agent**: `backend-engineer`
**Estimated complexity**: Low
**Dependencies**: Chunk 1
**Status**: NOT STARTED

**Tasks**:
1. Create `config/task-templates.json` with 7 default templates
2. Create `prisma/seeds/task-templates.seed.ts`
3. Create `prisma/seeds/pipelines.seed.ts`
4. Add npm scripts: `seed:templates`, `seed:pipelines`

**Source Files** (copy from zip at `/tmp/pipelines-extract-new/astralis-agentic-tasks/`):
- `config/task-templates.json`
- `prisma/seed-pipelines.ts` → adapt to `prisma/seeds/pipelines.seed.ts`

---

### Chunk 6: OrchestrationAgent Integration
**Agent**: `backend-engineer`
**Estimated complexity**: Medium
**Dependencies**: Chunks 1-5
**Status**: NOT STARTED

**Tasks**:
1. Update OrchestrationAgent to classify intake → select TaskTemplate
2. Create TaskInstance from template + intake data
3. Emit `task.created` event to trigger Base Task Agent
4. Add decision type `CREATE_TASK` to existing DecisionEngine

---

### Chunk 7: EventBus Enhancement
**Agent**: `backend-engineer`
**Estimated complexity**: Low
**Dependencies**: Chunk 2
**Status**: NOT STARTED

**Tasks**:
1. Register task.* and pipeline.* event types in EventBus
2. Wire BaseTaskAgent as subscriber to task.* events
3. Ensure events are emitted with correct payloads

---

### Chunk 8: API Endpoints
**Agent**: `backend-engineer`
**Estimated complexity**: Medium
**Dependencies**: Chunks 1-4
**Status**: NOT STARTED

**Tasks**:
1. Create `GET /api/tasks` - List tasks with filters
2. Create `GET /api/tasks/[id]` - Get task details
3. Create `POST /api/tasks/[id]/override` - Set human override
4. Create `POST /api/tasks/[id]/reprocess` - Request agent reprocessing
5. Create `GET /api/task-templates` - List available templates
6. Create `GET /api/decisions/[taskId]` - Get decision log for task

---

### Chunk 9: Update Existing pipelineItem References
**Agent**: `Explore` + `backend-engineer`
**Estimated complexity**: Medium
**Dependencies**: Chunk 1
**Status**: NOT STARTED

**Tasks**:
1. Find all `pipelineItem` references in codebase
2. Update to use new `Task` model
3. Update related API routes
4. Update TypeScript types
5. Verify with `npx tsc --noEmit`

---

### Chunk 10: SLA Monitoring
**Agent**: `backend-engineer`
**Estimated complexity**: Low
**Dependencies**: Chunks 1-4
**Status**: NOT STARTED

**Tasks**:
1. Create scheduled job to check SLA breaches
2. Emit `task.sla_breached` events
3. BaseTaskAgent handles breach with ESCALATE action

---

## Execution Order

```
Chunk 1 (Schema) ────────────────────────────────────────────────▶
       │
       ├──▶ Chunk 2 (Types) ──────────────────────────────────────▶
       │           │
       │           ├──▶ Chunk 3 (BaseTaskAgent) ──────────────────▶
       │           │           │
       │           │           ├──▶ Chunk 4 (ActionExecutor) ─────▶
       │           │           │           │
       │           │           │           ├──▶ Chunk 6 (Orchestrator) ───▶
       │           │           │           │
       │           │           │           └──▶ Chunk 8 (APIs) ───────────▶
       │           │           │
       │           │           └──▶ Chunk 10 (SLA Monitor) ───────────────▶
       │           │
       │           └──▶ Chunk 7 (EventBus) ───────────────────────▶
       │
       ├──▶ Chunk 5 (Seeds) ──────────────────────────────────────▶
       │
       └──▶ Chunk 9 (Rename refs) ────────────────────────────────▶
```

**Parallel Execution Groups**:
- **Group A** (can run in parallel): Chunk 1
- **Group B** (after A): Chunks 2, 5, 9
- **Group C** (after B): Chunks 3, 7
- **Group D** (after C): Chunks 4, 6, 8, 10

---

## Files Summary

### Files to Create

| File | Source | Purpose |
|------|--------|---------|
| `src/lib/types/tasks.ts` | zip | TaskTemplate, TaskInstance, AgentDecision types |
| `src/lib/events/types.ts` | zip | EventEnvelope, TaskEvent, PipelineEvent |
| `src/lib/agent/core/BaseTaskAgent.ts` | new | Main task agent runner |
| `src/lib/agent/core/TaskActionExecutor.ts` | new | Execute AgentAction types |
| `src/lib/agent/prompts/base-task-agent.ts` | zip (adapted) | System + user prompt |
| `config/task-templates.json` | zip | 7 default task templates |
| `prisma/seeds/task-templates.seed.ts` | new | Seed task templates |
| `prisma/seeds/pipelines.seed.ts` | zip (adapted) | Seed 5 pipelines |
| `src/app/api/tasks/route.ts` | new | Task list API |
| `src/app/api/tasks/[id]/route.ts` | new | Task detail API |
| `src/app/api/tasks/[id]/override/route.ts` | new | Human override API |
| `src/app/api/tasks/[id]/reprocess/route.ts` | new | Reprocess request API |
| `src/app/api/task-templates/route.ts` | new | Template list API |
| `src/app/api/decisions/[taskId]/route.ts` | new | Decision log API |

### Files to Modify

| File | Changes |
|------|---------|
| `prisma/schema.prisma` | Add enums, TaskTemplate, Task, DecisionLog models |
| `src/lib/agent/types/agent.types.ts` | Add new event types |
| `src/lib/agent/inputs/EventBus.ts` | Register task.*/pipeline.* events |
| `src/lib/agent/core/OrchestrationAgent.ts` | Add intake→task creation flow |
| `src/lib/agent/core/ActionExecutor.ts` | Register task action handlers |
| `src/types/pipelines.ts` | Update for Task model |
| Various files | Rename pipelineItem → Task references |

---

## Reference Files (from zip extraction)

The source templates are located at:
- `/tmp/pipelines-extract-new/astralis-agentic-tasks/` - New agentic task system files
- `/tmp/pipelines-extract/astralis-pipelines/` - Original pipeline files

Key reference files:
- `/tmp/pipelines-extract-new/astralis-agentic-tasks/prisma/schema.prisma` - Schema reference
- `/tmp/pipelines-extract-new/astralis-agentic-tasks/config/task-templates.json` - Template definitions
- `/tmp/pipelines-extract-new/astralis-agentic-tasks/src/lib/types/tasks.ts` - Type definitions
- `/tmp/pipelines-extract-new/astralis-agentic-tasks/src/lib/events/types.ts` - Event types
- `/tmp/pipelines-extract-new/astralis-agentic-tasks/src/lib/agent/baseTaskAgentPrompt.md` - Agent prompt
- `/tmp/pipelines-extract-new/astralis-agentic-tasks/src/lib/agent/baseTaskAgent.ts` - Agent skeleton

---

## Verification Checklist

- [ ] `npx prisma migrate dev` succeeds
- [ ] `npx prisma generate` succeeds
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds
- [ ] Task templates seeded successfully
- [ ] Pipelines seeded successfully
- [ ] OrchestrationAgent creates TaskInstance from intake
- [ ] BaseTaskAgent receives task.created event
- [ ] BaseTaskAgent makes LLM decision
- [ ] DecisionLog entry created
- [ ] Actions executed (SET_STATUS, SET_STAGE, etc.)
- [ ] Override flag respected (NO_OP when overridden)
- [ ] SLA breach detection works
- [ ] APIs return correct data

---

## User Decisions (Confirmed)

1. **Model Naming**: Rename `pipelineItem` to `Task` in Prisma schema
2. **Pipeline Keys**: Use GUID/CUID (auto-generated unique IDs)
3. **Seed Org ID**: Read from `SEED_ORG_ID` environment variable
4. **Architecture**: Single Base Task Agent with JSON templates (NOT sub-agents per pipeline type)

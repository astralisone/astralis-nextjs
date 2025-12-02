# Astralis One - Architecture Documentation

**Version:** 1.0.0
**Last Updated:** December 2, 2025
**Platform:** Next.js 15 Multi-Agent Engineering Platform

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Core Components](#2-core-components)
3. [Data Flow Diagrams](#3-data-flow-diagrams)
4. [Design Patterns](#4-design-patterns)
5. [Security Architecture](#5-security-architecture)
6. [Performance Considerations](#6-performance-considerations)
7. [Technology Stack](#7-technology-stack)
8. [Deployment Architecture](#8-deployment-architecture)

---

## 1. System Overview

### 1.1 Platform Description

**Astralis One** is an enterprise-grade AI operations platform that orchestrates complex workflows through intelligent multi-agent systems. The platform combines traditional SaaS capabilities with advanced AI-powered automation to handle:

- Intelligent intake request routing
- Document processing with OCR and RAG (Retrieval-Augmented Generation)
- Automated scheduling and calendar management
- Pipeline-based workflow management
- Real-time event-driven automation via n8n integration
- Multi-tenant organization management
- Marketplace for digital products and services

### 1.2 Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Next.js 15 App Router** | Server-first architecture with streaming, improved data fetching, and React Server Components |
| **Multi-Agent AI Architecture** | Separates concerns: Orchestration Agent (decision-making), Scheduling Agent (calendar), Task Agents (specialized workflows) |
| **BullMQ + Redis** | Reliable background job processing with persistence, retries, and rate limiting |
| **Prisma ORM** | Type-safe database access with automatic migrations and client generation |
| **Dual-LLM Strategy** | Claude Sonnet 4.5 (primary) + OpenAI GPT-4 (fallback) for reliability and cost optimization |
| **Event-Driven Architecture** | Decoupled components communicate via EventBus, enabling scalable integrations |
| **PostgreSQL** | Robust relational database with JSON support for flexible metadata storage |
| **PM2 Process Manager** | Zero-downtime deployments with automatic restarts and log management |

### 1.3 System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile/API Clients]
    end

    subgraph "Next.js Application - Port 3001"
        Pages[App Router Pages]
        API[API Routes]
        Middleware[Auth Middleware]
        ServerComponents[React Server Components]
        ClientComponents[Client Components]
    end

    subgraph "Multi-Agent AI System"
        OA[Orchestration Agent]
        SA[Scheduling Agent]
        TA[Task Agents]
        DecisionEngine[Decision Engine]
        ActionExecutor[Action Executor]
        EventBus[Agent Event Bus]
    end

    subgraph "Background Workers"
        OCRWorker[Document OCR Worker]
        EmbeddingWorker[Embedding Worker]
        IntakeWorker[Intake Routing Worker]
        CalendarWorker[Calendar Sync Worker]
        ReminderWorker[Reminder Worker]
        SLAWorker[SLA Monitor Worker]
        AgentWorker[Scheduling Agent Worker]
    end

    subgraph "Data Layer"
        PostgreSQL[(PostgreSQL)]
        Redis[(Redis)]
        S3[DigitalOcean Spaces]
    end

    subgraph "External Services"
        OpenAI[OpenAI API]
        Anthropic[Anthropic Claude API]
        N8N[n8n Automation]
        GoogleCal[Google Calendar]
        SMTP[SMTP Email]
        Twilio[Twilio SMS]
    end

    Browser --> Pages
    Mobile --> API
    Pages --> ServerComponents
    Pages --> ClientComponents
    API --> Middleware
    Middleware --> OA

    OA --> DecisionEngine
    OA --> ActionExecutor
    OA --> EventBus
    SA --> EventBus
    TA --> EventBus

    EventBus --> OCRWorker
    EventBus --> EmbeddingWorker
    EventBus --> IntakeWorker

    OCRWorker --> Redis
    EmbeddingWorker --> Redis
    IntakeWorker --> Redis
    CalendarWorker --> Redis
    ReminderWorker --> Redis
    SLAWorker --> Redis
    AgentWorker --> Redis

    API --> PostgreSQL
    ServerComponents --> PostgreSQL
    OCRWorker --> PostgreSQL

    OCRWorker --> S3
    EmbeddingWorker --> OpenAI
    OA --> Anthropic
    OA --> OpenAI

    IntakeWorker --> N8N
    CalendarWorker --> GoogleCal
    ReminderWorker --> SMTP
    AgentWorker --> Twilio

    style OA fill:#00D4FF,stroke:#0A1B2B,stroke-width:3px
    style EventBus fill:#00E676,stroke:#0A1B2B,stroke-width:2px
    style PostgreSQL fill:#2B6CB0,stroke:#0A1B2B,stroke-width:2px
    style Redis fill:#DD6B20,stroke:#0A1B2B,stroke-width:2px
```

---

## 2. Core Components

### 2.1 Next.js Application (Port 3001)

#### 2.1.1 App Router Structure

The application uses Next.js 15's App Router with server-first architecture:

```
src/app/
├── page.tsx                 # Homepage (Server Component)
├── layout.tsx               # Root layout with providers
├── globals.css              # Tailwind + Astralis brand theme
├── (auth)/                  # Auth route group
│   ├── signin/
│   ├── signup/
│   └── verify-email/
├── astralisops/             # Product pages
│   ├── page.tsx
│   ├── features/
│   └── pricing/
├── api/                     # API Routes
│   ├── auth/[...nextauth]/
│   ├── intake/
│   ├── documents/
│   ├── pipeline/
│   └── webhooks/
├── dashboard/               # Protected dashboard
├── engagements/             # Client engagement wizard
└── marketplace/             # Digital product marketplace
```

**Server Components vs Client Components:**

| Component Type | Use Cases | Examples |
|----------------|-----------|----------|
| **Server Components** | Data fetching, layout, SEO-critical content | Page layouts, marketing pages, data tables |
| **Client Components** | Interactivity, state management, event handlers | Forms, modals, drag-and-drop, charts |

#### 2.1.2 API Routes Pattern

All API routes follow a consistent pattern with Zod validation:

```typescript
// src/app/api/[resource]/route.ts
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

const schema = z.object({
  field: z.string().min(1),
  // ... more validation
});

export async function POST(req: NextRequest) {
  // 1. Authenticate
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 2. Validate input
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  // 3. Process with Prisma
  try {
    const result = await prisma.resource.create({
      data: parsed.data,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

#### 2.1.3 Middleware (Auth & RBAC)

Next.js middleware handles authentication and role-based access control:

```typescript
// src/middleware.ts
export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/engagements/:path*',
    '/api/protected/:path*',
  ],
};
```

Roles supported:
- **ADMIN** - Full system access
- **OPERATOR** - Operations management
- **PM** - Project management
- **CLIENT** - Client portal access
- **USER** - Basic authenticated user

---

### 2.2 Multi-Agent AI System

#### 2.2.1 Orchestration Agent Overview

The **OrchestrationAgent** is the central intelligence coordinator:

**Key Responsibilities:**
- Processes inputs from multiple channels (email, webhooks, forms, API)
- Uses LLM for intelligent decision-making with confidence scoring
- Executes actions through ActionExecutor
- Maintains audit trail in `agent_decisions` table
- Implements rate limiting (60/min, 500/hour)

**Architecture:**

```typescript
class OrchestrationAgent {
  private llmClient: ILLMClient;           // Claude or OpenAI
  private decisionEngine: DecisionEngine;   // Converts LLM responses to actions
  private actionExecutor: ActionExecutor;   // Executes validated actions
  private eventBus: AgentEventBus;         // Event subscription system

  async processInput(input: AgentInput): Promise<AgentDecisionResult>
  async makeDecision(context: DecisionContext): Promise<AgentDecisionResult>
  async executeActions(actions: AgentAction[]): Promise<ActionResult[]>
}
```

**Decision Flow:**

1. **Input Reception** → Receive event from EventBus
2. **Context Building** → Gather org settings, pipelines, historical data
3. **LLM Call** → Send structured prompt to Claude/OpenAI
4. **Decision Parsing** → DecisionEngine validates and structures response
5. **Confidence Check** → Auto-execute (>0.85), require approval (0.5-0.85), reject (<0.5)
6. **Action Execution** → ActionExecutor performs database operations
7. **Audit Logging** → Store decision in `agent_decisions` table

#### 2.2.2 Decision Engine

**Purpose:** Converts raw LLM responses into type-safe, executable actions.

**Capabilities:**
- Parse JSON responses from LLM
- Apply confidence thresholds
- Validate against agent capabilities
- Fallback logic when LLM fails
- Keyword-based intent detection

**Confidence Thresholds:**

| Confidence | Behavior | Use Case |
|------------|----------|----------|
| **≥ 0.85** | Auto-execute | Clear, unambiguous requests |
| **0.5 - 0.85** | Require approval | Moderate confidence, human review needed |
| **< 0.5** | Reject/fallback | Ambiguous or unclear intent |

**Fallback Strategies:**
```typescript
const INTENT_KEYWORDS = {
  SALES_INQUIRY: ['price', 'pricing', 'demo', 'quote'],
  SUPPORT_REQUEST: ['help', 'issue', 'problem', 'bug'],
  BILLING_QUESTION: ['billing', 'invoice', 'payment'],
  SCHEDULING: ['schedule', 'meeting', 'calendar', 'book'],
};
```

#### 2.2.3 Action Executor

**Purpose:** Safely executes validated actions with rollback capability.

**Supported Actions:**
- `ASSIGN_PIPELINE` - Route intake to appropriate pipeline
- `CREATE_EVENT` - Schedule calendar events
- `UPDATE_EVENT` - Modify existing events
- `CANCEL_EVENT` - Cancel scheduled events
- `SEND_NOTIFICATION` - Email/SMS notifications
- `TRIGGER_AUTOMATION` - Fire n8n workflows
- `ESCALATE` - Alert human operators

**Execution Pattern:**
```typescript
class ActionExecutor {
  async execute(action: AgentAction): Promise<ActionResult> {
    // 1. Validate action
    // 2. Begin transaction (if needed)
    // 3. Execute action
    // 4. Log to audit trail
    // 5. Commit or rollback
    // 6. Return result
  }
}
```

#### 2.2.4 Event-Driven Architecture

**AgentEventBus** enables loose coupling between components:

```typescript
// Event types
type AgentEventType =
  | 'intake:created'
  | 'intake:updated'
  | 'webhook:form_submitted'
  | 'email:received'
  | 'pipeline:stage_changed'
  | 'calendar:reminder_due'
  | 'schedule:triggered';

// Usage
eventBus.emit('intake:created', { intakeId, data });
eventBus.on('intake:created', async (event) => {
  await orchestrationAgent.processInput(event);
});
```

**Event Flow:**

```mermaid
sequenceDiagram
    participant API as API Route
    participant EB as EventBus
    participant OA as Orchestration Agent
    participant DE as Decision Engine
    participant AE as Action Executor
    participant DB as PostgreSQL

    API->>EB: emit('intake:created')
    EB->>OA: notify subscribers
    OA->>OA: buildContext()
    OA->>DE: makeDecision(context)
    DE->>DE: callLLM()
    DE->>DE: parseResponse()
    DE->>OA: return decision
    OA->>AE: executeActions(actions)
    AE->>DB: update pipeline, create tasks
    AE->>OA: return results
    OA->>DB: log decision to agent_decisions
    OA->>EB: emit('decision:completed')
```

#### 2.2.5 Dual-LLM Strategy

**Primary:** Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`)
- Higher reasoning quality
- Better instruction following
- Preferred for complex decisions

**Fallback:** OpenAI GPT-4 Turbo
- Used when Claude API fails
- Embeddings generation (text-embedding-3-small)
- Cost-effective for high-volume tasks

**LLM Client Factory:**
```typescript
class LLMFactory {
  static create(provider: 'CLAUDE' | 'OPENAI'): ILLMClient {
    if (provider === 'CLAUDE') {
      return new ClaudeClient({
        apiKey: process.env.ANTHROPIC_API_KEY,
        model: 'claude-sonnet-4-5-20250929',
      });
    }
    return new OpenAIClient({
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4-turbo',
    });
  }
}
```

---

### 2.3 Background Processing

#### 2.3.1 BullMQ + Redis Architecture

**Why BullMQ?**
- Job persistence and recovery
- Delayed/scheduled jobs
- Rate limiting and priority queues
- Automatic retries with exponential backoff
- Job progress tracking

**Redis Configuration:**
```typescript
// src/workers/redis.ts
import IORedis from 'ioredis';

export const redisConnection = new IORedis(
  process.env.REDIS_URL || 'redis://localhost:6379',
  {
    maxRetriesPerRequest: null, // Required for BullMQ
    enableReadyCheck: false,
  }
);
```

#### 2.3.2 Seven Worker Queues

| Queue | Concurrency | Purpose | Triggers |
|-------|-------------|---------|----------|
| **document-processing** | 3 | OCR extraction from PDFs/images | Document upload |
| **document-embedding** | 2 | Generate embeddings for RAG | Post-OCR |
| **intake-routing** | 5 | AI-powered request routing | Intake form submission |
| **calendar-sync** | 2 | Google Calendar integration | Event CRUD operations |
| **scheduling-reminders** | 5 | Email reminders for events | Cron job (every 5 min) |
| **sla-monitor** | 2 | Task SLA compliance checks | Cron job (every 15 min) |
| **scheduling-agent** | 3 | AI scheduling classification | SMS/Email/Chat input |

#### 2.3.3 Job Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Queued: Job Added
    Queued --> Active: Worker Available
    Active --> Processing: Worker Executes
    Processing --> Completed: Success
    Processing --> Failed: Error
    Failed --> Retry: Retry Count < Max
    Retry --> Queued: Backoff Delay
    Failed --> Dead: Max Retries Exceeded
    Completed --> [*]
    Dead --> [*]
```

**Retry Strategy:**
```typescript
const jobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2000, // Start with 2 seconds
  },
  removeOnComplete: 100, // Keep last 100 completed
  removeOnFail: false,   // Keep failed jobs for debugging
};
```

#### 2.3.4 Worker Process Management

**PM2 Configuration** (`ecosystem.config.js`):

```javascript
module.exports = {
  apps: [
    {
      name: 'astralis-nextjs',
      script: 'npm run start',
      instances: 1,
      max_memory_restart: '1G',
      error_file: '/var/log/pm2/astralis-error.log',
      out_file: '/var/log/pm2/astralis-out.log',
    },
    {
      name: 'astralis-worker',
      script: 'npm run worker',
      instances: 1,
      max_memory_restart: '512M',
      error_file: '/var/log/pm2/astralis-worker-error.log',
      out_file: '/var/log/pm2/astralis-worker-out.log',
    }
  ]
};
```

**Commands:**
```bash
npm run prod:start    # Start both app + worker
npm run prod:reload   # Zero-downtime reload
npm run prod:logs     # Tail logs
```

---

### 2.4 Data Layer

#### 2.4.1 PostgreSQL + Prisma ORM

**Database Statistics:**
- **89 models** in Prisma schema
- **Multi-tenant architecture** via `orgId` scoping
- **JSON fields** for flexible metadata storage
- **Composite indexes** for query optimization

**Key Model Categories:**

| Category | Models | Purpose |
|----------|--------|---------|
| **Organization & Users** | `organization`, `users`, `Account`, `Session` | Multi-tenant structure, authentication |
| **Intake & Routing** | `intakeRequest`, `pipeline`, `pipelineStage`, `pipelineItem` | Request intake and workflow management |
| **Task System** | `Task`, `TaskTemplate`, `DecisionLog` | Agentic task system with LLM decisions |
| **Scheduling** | `SchedulingEvent`, `EventReminder`, `AvailabilityRule`, `SchedulingAgentTask` | Calendar management and AI scheduling |
| **Documents** | `Document`, `DocumentEmbedding`, `DocumentChat` | File storage, OCR, RAG chat |
| **Automation** | `Automation`, `WorkflowExecution`, `WorkflowTrigger` | n8n integration and workflow tracking |
| **Agents** | `OrchestrationAgent`, `AgentDecision` | LLM-powered decision system |
| **Engagements** | `Engagement`, `Company`, `Contact`, `Milestone` | Client project management |
| **Marketplace** | `marketplace_items`, `orders`, `order_items` | Digital product sales |
| **Booking System** | `audit_bookings`, `consultations`, `revenue_audits` | Business audit scheduling |
| **Content** | `posts`, `comments`, `newsletter_campaigns` | CMS and email marketing |

#### 2.4.2 Multi-Tenant Architecture

**Organizational Scoping:**

Every query is scoped to an organization:

```typescript
// Automatic orgId scoping
const tasks = await prisma.task.findMany({
  where: {
    orgId: session.user.orgId, // Always included
    status: 'NEW',
  },
});

// Row-level security via middleware
prisma.$use(async (params, next) => {
  if (params.model && params.action === 'findMany') {
    params.args.where = {
      ...params.args.where,
      orgId: getCurrentOrgId(),
    };
  }
  return next(params);
});
```

**Organization Plans:**
- `FREE` - Limited features, low quotas
- `STARTER` - Small teams
- `PROFESSIONAL` - Mid-market
- `ENTERPRISE` - Custom SLAs, unlimited

#### 2.4.3 Key Relationships

```mermaid
erDiagram
    organization ||--o{ users : contains
    organization ||--o{ intakeRequest : receives
    organization ||--o{ pipeline : owns
    organization ||--o{ Document : stores
    organization ||--o{ OrchestrationAgent : configures

    users ||--o{ Task : assigned
    users ||--o{ SchedulingEvent : owns
    users ||--o{ DocumentChat : participates

    intakeRequest }o--|| pipeline : routed_to

    pipeline ||--o{ pipelineStage : contains
    pipelineStage ||--o{ pipelineItem : contains
    pipelineStage ||--o{ Task : contains

    Task }o--|| TaskTemplate : instantiated_from
    Task ||--o{ DecisionLog : tracks

    OrchestrationAgent ||--o{ AgentDecision : makes

    Document ||--o{ DocumentEmbedding : has
    Document ||--o{ DocumentChat : enables

    SchedulingEvent ||--o{ EventReminder : triggers
    SchedulingEvent }o--|| SchedulingAgentTask : scheduled_by
```

---

### 2.5 External Integrations

#### 2.5.1 n8n Workflow Automation

**Integration Points:**
- Webhook triggers from Astralis → n8n
- n8n webhook callbacks → Astralis API
- Workflow execution tracking in `WorkflowExecution` table

**Example Workflow:**
```json
{
  "trigger": "intake:created",
  "webhookUrl": "https://automation.astralisone.com/webhook/intake",
  "actions": [
    "Send Slack notification",
    "Create Asana task",
    "Update Google Sheets"
  ]
}
```

#### 2.5.2 DigitalOcean Spaces (S3-Compatible)

**Use Cases:**
- Document storage (PDFs, images, videos)
- CDN for static assets
- Presigned URLs for secure downloads

**Configuration:**
```typescript
import { S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  endpoint: process.env.SPACES_ENDPOINT, // nyc3.digitaloceanspaces.com
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.SPACES_ACCESS_KEY!,
    secretAccessKey: process.env.SPACES_SECRET_KEY!,
  },
});
```

#### 2.5.3 Google Calendar Integration

**OAuth2 Flow:**
1. User authorizes via Google OAuth
2. Store refresh token in `calendar_integrations`
3. Background worker syncs events every 15 minutes
4. Conflict detection via calendar busy times

#### 2.5.4 Twilio (SMS)

**Use Cases:**
- SMS reminders for appointments
- Two-factor authentication
- Scheduling agent SMS interface

#### 2.5.5 OpenAI & Anthropic APIs

**OpenAI Usage:**
- Embeddings: `text-embedding-3-small`
- Fallback LLM: `gpt-4-turbo`
- Cost-effective for high-volume tasks

**Anthropic Usage:**
- Primary LLM: `claude-sonnet-4-5-20250929`
- Better reasoning quality
- Preferred for complex decisions

---

## 3. Data Flow Diagrams

### 3.1 Intake Request Flow

```mermaid
sequenceDiagram
    participant User
    participant API as API Route
    participant Queue as intake-routing Queue
    participant Worker as Intake Routing Worker
    participant OA as Orchestration Agent
    participant LLM as Claude/OpenAI
    participant DB as PostgreSQL

    User->>API: Submit intake form
    API->>DB: Create intakeRequest (status: NEW)
    API->>Queue: Add job { intakeId }
    API-->>User: 202 Accepted

    Queue->>Worker: Process job
    Worker->>DB: Fetch intakeRequest + org context
    Worker->>OA: processInput(intakeData)

    OA->>OA: buildDecisionContext()
    OA->>LLM: Analyze intent, extract entities
    LLM-->>OA: Classification result

    OA->>OA: DecisionEngine.parseResponse()

    alt Confidence >= 0.85
        OA->>DB: Assign to pipeline
        OA->>DB: Create Task(s)
        OA->>DB: Update intakeRequest (status: ASSIGNED)
    else Confidence < 0.5
        OA->>DB: Mark for manual review
        OA->>API: Send notification to operators
    end

    OA->>DB: Log AgentDecision
    Worker-->>Queue: Job completed
```

**Key Steps:**
1. **User submits intake form** (web, email, API)
2. **API creates intakeRequest** with status `NEW`
3. **Job queued** in `intake-routing` queue
4. **Worker processes** with OrchestrationAgent
5. **LLM analyzes** intent and extracts entities
6. **Auto-route** if confidence ≥ 0.85
7. **Manual review** if confidence < 0.5
8. **Audit trail** logged in `agent_decisions`

### 3.2 Document Processing Flow

```mermaid
flowchart LR
    A[User Upload] --> B[API: /api/documents]
    B --> C{File Type}

    C -->|PDF/Image| D[Upload to S3]
    C -->|Other| E[Reject]

    D --> F[Create Document Record]
    F --> G[Queue: document-processing]

    G --> H[OCR Worker]
    H --> I[Tesseract.js]
    I --> J[Extract Text]
    J --> K[Update Document.ocrText]

    K --> L[Queue: document-embedding]
    L --> M[Embedding Worker]
    M --> N[Chunk Text]
    N --> O[OpenAI Embeddings API]
    O --> P[Store in DocumentEmbedding]

    P --> Q[Document Ready for RAG]

    style A fill:#00D4FF
    style Q fill:#00E676
    style H fill:#2B6CB0
    style M fill:#2B6CB0
```

**Processing Steps:**
1. **Upload** → File stored in DigitalOcean Spaces
2. **OCR Queue** → Tesseract.js extracts text
3. **Embedding Queue** → Text chunked and embedded
4. **Vector Storage** → Embeddings stored for RAG
5. **Status Update** → Document marked `COMPLETED`

**Chunking Strategy:**
- Chunk size: 1000 characters
- Overlap: 200 characters
- Metadata: page number, section heading

### 3.3 Scheduling Agent Flow

```mermaid
sequenceDiagram
    participant User
    participant SMS as Twilio SMS
    participant API as /api/scheduling-agent
    participant Queue as scheduling-agent Queue
    participant Worker as Scheduling Agent Worker
    participant LLM as Claude/OpenAI
    participant DB as PostgreSQL
    participant Cal as Google Calendar

    User->>SMS: "Schedule meeting with John tomorrow at 2pm"
    SMS->>API: Webhook POST
    API->>DB: Create SchedulingAgentTask (status: PENDING)
    API->>Queue: Add job { taskId }
    API-->>SMS: 200 OK
    SMS-->>User: "Processing your request..."

    Queue->>Worker: Process job
    Worker->>DB: Fetch task + user context
    Worker->>LLM: Classify intent & extract entities
    LLM-->>Worker: { taskType: SCHEDULE_MEETING, entities: {...} }

    Worker->>DB: Update task (taskType, entities, confidence)

    alt Confidence >= 0.85 && No Conflicts
        Worker->>Cal: Check availability
        Cal-->>Worker: Available slots
        Worker->>DB: Create SchedulingEvent
        Worker->>Cal: Create calendar event
        Worker->>DB: Update task (status: SCHEDULED)
        Worker->>SMS: Send confirmation
        SMS-->>User: "Meeting scheduled for tomorrow at 2pm"
    else Conflicts Found
        Worker->>DB: Store proposed slots
        Worker->>SMS: Send options
        SMS-->>User: "2pm is busy. Available: 3pm, 4pm?"
        Worker->>DB: Update task (status: AWAITING_INPUT)
    else Low Confidence
        Worker->>DB: Mark for review
        Worker->>SMS: Send clarification request
        SMS-->>User: "Please clarify: meeting duration? attendees?"
    end

    Worker->>DB: Log processing metadata
    Worker-->>Queue: Job completed
```

**Key Features:**
- Natural language understanding
- Conflict detection
- Multi-turn conversations
- Fallback to human operators

### 3.4 Task Lifecycle Flow (Agentic Task System)

```mermaid
stateDiagram-v2
    [*] --> NEW: Task Created from Template
    NEW --> IN_PROGRESS: Agent/Human Assigns
    IN_PROGRESS --> NEEDS_REVIEW: Agent Requests Review
    IN_PROGRESS --> BLOCKED: Dependency/External Wait
    BLOCKED --> IN_PROGRESS: Blocker Resolved
    NEEDS_REVIEW --> IN_PROGRESS: Feedback Given
    NEEDS_REVIEW --> DONE: Approved
    IN_PROGRESS --> DONE: Completed
    NEW --> CANCELLED: Manual Cancel
    IN_PROGRESS --> CANCELLED: Manual Cancel
    DONE --> [*]
    CANCELLED --> [*]

    note right of NEW: Agent emits "task.created" event
    note right of IN_PROGRESS: Agent monitors SLA
    note right of NEEDS_REVIEW: Agent pings stakeholders
    note right of DONE: Agent triggers follow-up actions
```

**Event-Driven Task Management:**
- `task.created` → Orchestration Agent evaluates priority
- `task.status_changed` → Agent updates dependencies
- `task.sla_breached` → Agent escalates to operators
- `task.completed` → Agent triggers follow-up workflows

---

## 4. Design Patterns

### 4.1 Event-Driven Architecture (EDA)

**AgentEventBus** provides publish-subscribe pattern:

```typescript
// Publisher
eventBus.emit('intake:created', {
  intakeId: 'abc123',
  orgId: 'org_xyz',
  data: { ... },
});

// Subscriber
eventBus.on('intake:created', async (event) => {
  await orchestrationAgent.processInput(event);
});

// Multiple subscribers
eventBus.on('intake:created', async (event) => {
  await analyticsService.track('intake_created', event);
});
```

**Benefits:**
- Loose coupling between components
- Scalable to multiple workers
- Easy to add new integrations
- Built-in retry logic

### 4.2 Confidence-Based Execution

**Decision Confidence Levels:**

```typescript
enum ConfidenceLevel {
  AUTO_EXECUTE = 0.85,   // High confidence, execute immediately
  REQUIRE_APPROVAL = 0.5, // Moderate confidence, human review
  REJECT = 0.0,           // Low confidence, reject or fallback
}

if (decision.confidence >= ConfidenceLevel.AUTO_EXECUTE) {
  await actionExecutor.execute(decision.actions);
} else if (decision.confidence >= ConfidenceLevel.REQUIRE_APPROVAL) {
  await notifyOperators(decision);
} else {
  await applyFallback(decision);
}
```

### 4.3 Queue-Based Processing

**BullMQ Job Pattern:**

```typescript
// Add job to queue
await documentQueue.add('process-ocr', {
  documentId: 'doc_123',
  orgId: 'org_xyz',
}, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
  priority: 5, // 1 = highest priority
});

// Worker processor
export async function processDocumentOCR(job: Job) {
  const { documentId, orgId } = job.data;

  try {
    // 1. Fetch document
    const doc = await prisma.document.findUnique({
      where: { id: documentId },
    });

    // 2. Download from S3
    const buffer = await downloadFromS3(doc.filePath);

    // 3. OCR
    const ocrResult = await Tesseract.recognize(buffer);

    // 4. Update database
    await prisma.document.update({
      where: { id: documentId },
      data: {
        ocrText: ocrResult.data.text,
        ocrConfidence: ocrResult.data.confidence,
        status: 'COMPLETED',
      },
    });

    // 5. Queue next step
    await embeddingQueue.add('generate-embeddings', { documentId });

    return { success: true };
  } catch (error) {
    throw error; // Will trigger retry
  }
}
```

### 4.4 Repository Pattern (Prisma)

**Type-Safe Data Access:**

```typescript
// Repository layer
export class TaskRepository {
  async findByOrg(orgId: string, filters?: TaskFilters) {
    return prisma.task.findMany({
      where: {
        orgId,
        status: filters?.status,
        priority: filters?.priority,
      },
      include: {
        template: true,
        pipeline: true,
        stage: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(data: TaskCreateInput) {
    return prisma.task.create({ data });
  }

  async updateStatus(taskId: string, status: TaskStatus) {
    return prisma.task.update({
      where: { id: taskId },
      data: { status, updatedAt: new Date() },
    });
  }
}
```

### 4.5 Factory Pattern (LLMFactory)

**LLM Client Abstraction:**

```typescript
interface ILLMClient {
  generateCompletion(prompt: string, options?: LLMOptions): Promise<string>;
  generateStructured<T>(prompt: string, schema: z.Schema<T>): Promise<T>;
}

class LLMFactory {
  static create(provider: LLMProvider): ILLMClient {
    switch (provider) {
      case LLMProvider.CLAUDE:
        return new ClaudeClient({ apiKey: process.env.ANTHROPIC_API_KEY });
      case LLMProvider.OPENAI:
        return new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY });
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  static createWithFallback(): ILLMClient {
    const primary = this.create(LLMProvider.CLAUDE);
    const fallback = this.create(LLMProvider.OPENAI);
    return new FallbackLLMClient(primary, fallback);
  }
}
```

### 4.6 Builder Pattern (PromptBuilder)

**Structured Prompt Construction:**

```typescript
class PromptBuilder {
  private systemPrompt: string = '';
  private context: string[] = [];
  private instructions: string[] = [];

  setSystem(prompt: string) {
    this.systemPrompt = prompt;
    return this;
  }

  addContext(key: string, value: any) {
    this.context.push(`${key}: ${JSON.stringify(value)}`);
    return this;
  }

  addInstruction(instruction: string) {
    this.instructions.push(instruction);
    return this;
  }

  build(): string {
    return `
      ${this.systemPrompt}

      CONTEXT:
      ${this.context.join('\n')}

      INSTRUCTIONS:
      ${this.instructions.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}
    `;
  }
}
```

---

## 5. Security Architecture

### 5.1 Authentication (NextAuth.js)

**Authentication Flow:**

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant NextAuth
    participant Prisma
    participant DB

    User->>Browser: Enter credentials
    Browser->>NextAuth: POST /api/auth/signin
    NextAuth->>Prisma: findUnique({ email })
    Prisma->>DB: Query users table
    DB-->>Prisma: User record
    Prisma-->>NextAuth: User data
    NextAuth->>NextAuth: bcrypt.compare(password, hash)

    alt Valid Credentials
        NextAuth->>Prisma: Create session
        Prisma->>DB: Insert into sessions
        NextAuth-->>Browser: Set session cookie (httpOnly)
        Browser-->>User: Redirect to dashboard
    else Invalid Credentials
        NextAuth-->>Browser: 401 Unauthorized
        Browser-->>User: Show error
    end
```

**Session Storage:**
- Database sessions via Prisma adapter
- HttpOnly cookies (not accessible via JavaScript)
- 30-day session expiry
- Automatic refresh on activity

### 5.2 RBAC (Role-Based Access Control)

**Role Hierarchy:**

| Role | Permissions | Use Cases |
|------|-------------|-----------|
| **ADMIN** | Full system access, org settings, user management | System administrators |
| **OPERATOR** | Pipeline management, intake routing, task assignment | Operations team |
| **PM** | Project management, client communications, reporting | Project managers |
| **CLIENT** | View own engagements, documents, reports | External clients |
| **USER** | Basic authenticated access | Default role |

**Permission Checks:**

```typescript
// API route protection
export async function GET(req: NextRequest) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!['ADMIN', 'OPERATOR'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Proceed with logic
}
```

### 5.3 Multi-Tenant Data Isolation

**Organizational Scoping:**

Every database query is scoped to the user's organization:

```typescript
// Middleware enforces orgId
prisma.$use(async (params, next) => {
  const session = await getCurrentSession();

  if (params.model && params.action.includes('find')) {
    params.args.where = {
      ...params.args.where,
      orgId: session.user.orgId,
    };
  }

  if (params.model && params.action.includes('create')) {
    params.args.data.orgId = session.user.orgId;
  }

  return next(params);
});
```

### 5.4 API Route Protection

**Middleware Chain:**

```typescript
// src/middleware.ts
export default withAuth(
  function middleware(req) {
    // Additional checks can go here
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/protected/:path*',
  ],
};
```

### 5.5 Environment Variable Management

**Security Best Practices:**
- **Never commit** `.env.local` to git
- **Use `.env.local.template`** with placeholder values
- **Rotate secrets** regularly (quarterly recommended)
- **Limit access** to production environment variables
- **Use environment-specific** keys (dev, staging, prod)

**Critical Variables:**
```bash
# Authentication
NEXTAUTH_SECRET=<random-32-char-string>
NEXTAUTH_URL=https://app.astralisone.com

# Database
DATABASE_URL=postgresql://...

# APIs
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
SPACES_ACCESS_KEY=...
SPACES_SECRET_KEY=...
```

---

## 6. Performance Considerations

### 6.1 React Query Caching

**Client-Side Data Caching:**

```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Usage in components
const { data: tasks } = useQuery({
  queryKey: ['tasks', filters],
  queryFn: () => fetchTasks(filters),
});
```

**Benefits:**
- Reduced API calls
- Instant UI updates (optimistic updates)
- Background refetching
- Automatic cache invalidation

### 6.2 ISR (Incremental Static Regeneration)

**Marketing Pages:**

```typescript
// src/app/about/page.tsx
export const revalidate = 3600; // Revalidate every hour

export default async function AboutPage() {
  const data = await fetchAboutData();
  return <AboutContent data={data} />;
}
```

**Benefits:**
- Fast page loads (pre-rendered)
- SEO-friendly
- Reduced server load
- Fresh content on revalidation

### 6.3 Worker Concurrency Limits

**Queue Configuration:**

| Queue | Concurrency | Reasoning |
|-------|-------------|-----------|
| **document-processing** | 3 | CPU-intensive OCR operations |
| **document-embedding** | 2 | OpenAI API rate limits |
| **intake-routing** | 5 | Lightweight LLM calls |
| **calendar-sync** | 2 | Google Calendar API rate limits |
| **scheduling-reminders** | 5 | Email sending parallelization |
| **sla-monitor** | 2 | Thorough checks, database-intensive |
| **scheduling-agent** | 3 | Balance between LLM calls and responsiveness |

**Tuning Guidelines:**
- **CPU-bound tasks** → Lower concurrency (3-5)
- **I/O-bound tasks** → Higher concurrency (5-10)
- **API rate limits** → Match provider limits
- **Database load** → Monitor with pgBouncer

### 6.4 Database Connection Pooling

**Prisma Configuration:**

```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Connection pool settings (DATABASE_URL)
postgresql://user:password@host:5432/db?connection_limit=10&pool_timeout=20
```

**Recommended Pool Sizes:**
- **Development:** 5-10 connections
- **Production:** 20-50 connections
- **Worker processes:** 10 connections per worker

### 6.5 Next.js Build Optimizations

**Build Configuration:**

```javascript
// next.config.js
module.exports = {
  reactStrictMode: true,
  swcMinify: true, // Faster minification
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    domains: ['nyc3.digitaloceanspaces.com'],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizeCss: true,
  },
};
```

**Build Command:**
```bash
NODE_OPTIONS='--max-old-space-size=4096' next build
```

---

## 7. Technology Stack

### 7.1 Complete Technology Matrix

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | Next.js | 15.5.6 | React framework with App Router |
| **Language** | TypeScript | 5.9.3 | Type-safe development |
| **Database** | PostgreSQL | 16+ | Relational database |
| **ORM** | Prisma | 5.22.0 | Type-safe database client |
| **Queue System** | BullMQ | 5.64.0 | Background job processing |
| **Cache/Queue** | Redis | 7+ (via IORedis 5.8.2) | In-memory data store |
| **Authentication** | NextAuth.js | 4.24.13 | Auth with Prisma adapter |
| **Styling** | Tailwind CSS | 3.4.16 | Utility-first CSS |
| **UI Components** | Radix UI | Various | Accessible primitives |
| **State Management** | Zustand | 5.0.8 | Lightweight state management |
| **Data Fetching** | React Query | 5.90.10 | Server state management |
| **Form Handling** | React Hook Form | 7.66.1 | Performant forms |
| **Validation** | Zod | 3.23.8 | Schema validation |
| **Email** | Nodemailer | 7.0.10 | SMTP email sending |
| **Calendar** | ICS | 3.8.1 | iCalendar file generation |
| **File Storage** | AWS SDK S3 | 3.937.0 | DigitalOcean Spaces |
| **AI - Primary** | Anthropic SDK | 0.70.1 | Claude Sonnet 4.5 |
| **AI - Fallback** | OpenAI SDK | 6.9.1 | GPT-4 Turbo, embeddings |
| **OCR** | Tesseract.js | 6.0.1 | Document text extraction |
| **SMS** | Twilio | 5.10.6 | SMS notifications |
| **Analytics** | Google APIs | 166.0.0 | GA4 & Google Ads |
| **Process Manager** | PM2 | 6.0.13 | Production process management |
| **Testing (E2E)** | Playwright | 1.56.1 | End-to-end testing |
| **Testing (Component)** | Storybook | 10.0.8 | Component development |
| **Date/Time** | date-fns | 4.1.0 | Date manipulation |
| **Charts** | Recharts | 3.4.1 | Data visualization |
| **Drag & Drop** | dnd-kit | 6.3.1 | Accessible drag and drop |

### 7.2 API Integrations

| Service | Purpose | API Version |
|---------|---------|-------------|
| **Anthropic Claude** | Primary LLM for decision-making | API v1 (claude-sonnet-4-5-20250929) |
| **OpenAI** | Fallback LLM, embeddings generation | API v1 (gpt-4-turbo, text-embedding-3-small) |
| **n8n** | Workflow automation platform | REST API v1 |
| **Google Calendar** | Calendar synchronization | Google Calendar API v3 |
| **Google Analytics** | Website analytics tracking | GA4 Measurement Protocol |
| **Twilio** | SMS notifications and 2FA | REST API v2 |
| **DigitalOcean Spaces** | S3-compatible file storage | S3 API |
| **SMTP** | Email delivery | Standard SMTP |

### 7.3 Development Tools

| Tool | Purpose | Configuration |
|------|---------|---------------|
| **ESLint** | Code linting | `eslint-config-next` |
| **Prettier** | Code formatting | (via ESLint) |
| **tsx** | TypeScript execution | Dev/Worker scripts |
| **Playwright** | E2E testing | Chromium, Firefox, WebKit |
| **Storybook** | Component development | Port 6006 |
| **Prisma Studio** | Database GUI | `npx prisma studio` |

---

## 8. Deployment Architecture

### 8.1 Production Environment

**Server Specifications:**
- **Provider:** DigitalOcean Droplet
- **IP:** 137.184.31.207
- **OS:** Ubuntu 22.04 LTS
- **CPU:** 4 vCPU
- **RAM:** 8 GB
- **Storage:** 160 GB SSD

**Application Structure:**
```
/home/deploy/astralis-nextjs/
├── .next/                    # Next.js build output
├── node_modules/             # Dependencies
├── prisma/                   # Database schema & migrations
├── src/                      # Application source
├── public/                   # Static assets
├── .env.local                # Environment variables (production)
├── package.json
└── ecosystem.config.js       # PM2 configuration
```

### 8.2 Process Management (PM2)

**Running Processes:**

| Process | Name | Port | Memory | Purpose |
|---------|------|------|--------|---------|
| Next.js App | `astralis-nextjs` | 3001 | 1 GB | Main web application |
| BullMQ Worker | `astralis-worker` | - | 512 MB | Background job processing |

**PM2 Commands:**
```bash
# Start all processes
npm run prod:start

# Reload without downtime
npm run prod:reload

# View logs
npm run prod:logs

# Monitor status
npm run prod:status

# Restart specific process
pm2 restart astralis-nextjs
```

**Log Files:**
- `/var/log/pm2/astralis-out.log` - Application stdout
- `/var/log/pm2/astralis-error.log` - Application errors
- `/var/log/pm2/astralis-worker-out.log` - Worker stdout
- `/var/log/pm2/astralis-worker-error.log` - Worker errors

### 8.3 Deployment Process

**Automated Deployment Script** (`scripts/deploy.sh`):

```bash
#!/bin/bash
set -e

echo "🚀 Deploying Astralis One to production..."

# 1. SSH to server
ssh -i ~/.ssh/id_ed25519 root@137.184.31.207 << 'EOF'
  cd /home/deploy/astralis-nextjs

  # 2. Pull latest code
  git pull origin main

  # 3. Install dependencies
  npm install --legacy-peer-deps

  # 4. Run database migrations
  npx prisma migrate deploy

  # 5. Generate Prisma client
  npx prisma generate

  # 6. Build Next.js application
  npm run build

  # 7. Reload PM2 processes (zero-downtime)
  npm run prod:reload

  echo "✅ Deployment completed successfully!"
EOF
```

**Manual Deployment Steps:**
1. SSH: `ssh -i ~/.ssh/id_ed25519 root@137.184.31.207`
2. Navigate: `cd /home/deploy/astralis-nextjs`
3. Pull: `git pull origin main`
4. Install: `npm install --legacy-peer-deps`
5. Migrate: `npx prisma migrate deploy`
6. Build: `npm run build`
7. Reload: `npm run prod:reload`

### 8.4 Environment Configuration

**Production Environment Variables** (`.env.local`):

```bash
# Application
NODE_ENV=production
NEXTAUTH_URL=https://app.astralisone.com
NEXTAUTH_SECRET=<production-secret>

# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://localhost:6379

# AI APIs
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# File Storage
SPACES_ACCESS_KEY=...
SPACES_SECRET_KEY=...
SPACES_ENDPOINT=nyc3.digitaloceanspaces.com
SPACES_BUCKET=astralis-production

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@astralisone.com
SMTP_PASSWORD=...

# Integrations
N8N_WEBHOOK_URL=https://automation.astralisone.com
GOOGLE_CALENDAR_CLIENT_ID=...
GOOGLE_CALENDAR_CLIENT_SECRET=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...
NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID=AW-...
```

### 8.5 Database Hosting

**PostgreSQL Setup:**
- **Hosting:** DigitalOcean Managed Database
- **Version:** PostgreSQL 16
- **Connection Pooling:** PgBouncer (max 25 connections)
- **Backups:** Daily automated backups (7-day retention)
- **Monitoring:** DigitalOcean Insights + custom alerts

**Database URL Format:**
```
postgresql://username:password@host:25060/astralis_one?sslmode=require
```

### 8.6 Redis Configuration

**Redis Setup:**
- **Hosting:** Co-located on application server
- **Port:** 6379
- **Persistence:** AOF (Append-Only File) enabled
- **Max Memory:** 2 GB
- **Eviction Policy:** `allkeys-lru`

**Redis Configuration** (`/etc/redis/redis.conf`):
```conf
bind 127.0.0.1
port 6379
maxmemory 2gb
maxmemory-policy allkeys-lru
appendonly yes
appendfsync everysec
```

### 8.7 Monitoring & Alerts

**Application Monitoring:**
- **PM2 Dashboard:** `pm2 monit` for real-time metrics
- **Log Aggregation:** PM2 logs → CloudWatch/Logtail
- **Error Tracking:** Sentry (future integration)
- **Uptime Monitoring:** UptimeRobot (5-minute checks)

**Key Metrics:**
- Application response time (p50, p95, p99)
- Worker queue length
- Database connection pool usage
- Redis memory usage
- Error rate

**Alert Thresholds:**
- App downtime > 2 minutes
- Error rate > 1%
- Queue backlog > 1000 jobs
- Database CPU > 80%
- Memory usage > 90%

### 8.8 Scaling Strategy

**Vertical Scaling (Current):**
- Increase droplet size (CPU/RAM)
- Suitable for current traffic

**Horizontal Scaling (Future):**

```mermaid
graph TB
    LB[Load Balancer - nginx]

    subgraph "App Servers"
        APP1[Next.js Instance 1]
        APP2[Next.js Instance 2]
        APP3[Next.js Instance 3]
    end

    subgraph "Worker Servers"
        WORKER1[Worker Instance 1]
        WORKER2[Worker Instance 2]
    end

    DB[(PostgreSQL Cluster)]
    REDIS[(Redis Cluster)]
    S3[S3/Spaces]

    LB --> APP1
    LB --> APP2
    LB --> APP3

    APP1 --> DB
    APP2 --> DB
    APP3 --> DB

    APP1 --> REDIS
    APP2 --> REDIS
    APP3 --> REDIS

    WORKER1 --> REDIS
    WORKER2 --> REDIS

    WORKER1 --> DB
    WORKER2 --> DB

    APP1 --> S3
    WORKER1 --> S3

    style LB fill:#00D4FF
    style DB fill:#2B6CB0
    style REDIS fill:#DD6B20
```

**Scaling Triggers:**
- Traffic > 10,000 concurrent users
- Queue processing time > 5 minutes
- Database connections saturated

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **Orchestration Agent** | Central AI coordinator that makes routing and scheduling decisions |
| **Decision Engine** | Component that parses LLM responses into executable actions |
| **Action Executor** | Component that safely executes validated actions |
| **Event Bus** | Pub/sub system for decoupled component communication |
| **Intake Request** | User-submitted request awaiting AI routing |
| **Pipeline** | Workflow with multiple stages (e.g., Sales, Support) |
| **Task Template** | Predefined task blueprint with steps and agent config |
| **SLA** | Service Level Agreement - expected completion time |
| **RAG** | Retrieval-Augmented Generation - AI with document context |
| **OCR** | Optical Character Recognition - text extraction from images |
| **Embedding** | Vector representation of text for semantic search |
| **Multi-Tenant** | Single application instance serving multiple organizations |

---

## Appendix B: Key File Locations

| File Path | Description |
|-----------|-------------|
| `/Users/gadmin/Projects/astralis-nextjs/src/app/` | Next.js App Router pages |
| `/Users/gadmin/Projects/astralis-nextjs/src/lib/agent/` | Multi-agent AI system |
| `/Users/gadmin/Projects/astralis-nextjs/src/workers/` | BullMQ worker definitions |
| `/Users/gadmin/Projects/astralis-nextjs/prisma/schema.prisma` | Database schema (89 models) |
| `/Users/gadmin/Projects/astralis-nextjs/ecosystem.config.js` | PM2 configuration |
| `/Users/gadmin/Projects/astralis-nextjs/tailwind.config.ts` | Astralis brand theme |
| `/Users/gadmin/Projects/astralis-nextjs/.env.local` | Environment variables (not in git) |
| `/Users/gadmin/Projects/astralis-nextjs/CLAUDE.md` | AI assistant instructions |

---

## Appendix C: Related Documentation

- [README.md](../README.md) - Quick start guide
- [SETUP_GUIDE.md](../SETUP_GUIDE.md) - Detailed setup instructions
- [CLAUDE.md](../CLAUDE.md) - AI assistant project instructions
- [.env.local.template](../.env.local.template) - All environment variables
- [docs/BOOKING_SETUP.md](./BOOKING_SETUP.md) - Email configuration
- [ecosystem.config.js](../ecosystem.config.js) - PM2 configuration
- [playwright.config.ts](../playwright.config.ts) - E2E test setup

---

**Document Status:** Ready for Production
**Maintained By:** Astralis Engineering Team
**Review Cycle:** Quarterly or on major architectural changes

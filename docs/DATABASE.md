# Database Documentation

## Overview

**Astralis One** uses PostgreSQL with Prisma ORM for type-safe database access. The database supports multi-tenant operations, AI-powered workflows, document processing, booking systems, and e-commerce functionality.

- **Database**: PostgreSQL (production-grade relational database)
- **ORM**: Prisma Client (generated TypeScript client)
- **Models**: 89 database tables
- **Architecture**: Multi-tenant with organization-scoped isolation
- **Migrations**: Version-controlled schema changes via `prisma migrate`

---

## Model Categories

### 2.1 Authentication & Users

Core models for user management, authentication, and password recovery.

| Model | Purpose | Key Fields |
|-------|---------|------------|
| `users` | User accounts with roles and preferences | `email`, `role`, `orgId`, `timezone`, `onboardingCompleted` |
| `Account` | NextAuth OAuth provider accounts | `provider`, `providerAccountId`, `access_token` |
| `Session` | NextAuth active sessions | `sessionToken`, `userId`, `expires` |
| `VerificationToken` | Email verification tokens | `identifier`, `token`, `expires` |
| `password_reset_tokens` | Password reset flow | `token`, `userId`, `expiresAt`, `used` |
| `organization` | Multi-tenant root entity | `name`, `slug`, `plan`, `quotaResetAt` |

**Key Relationships**:
- `users.orgId` → `organization.id` (many users belong to one org)
- `Account.userId` → `users.id` (one user can have multiple OAuth accounts)
- `Session.userId` → `users.id` (one user can have multiple active sessions)

**User Roles** (enum `UserRole`):
- `USER` - Standard user
- `AUTHOR` - Content creator
- `EDITOR` - Content editor
- `ADMIN` - Full system access
- `PM` - Project manager
- `OPERATOR` - Operations staff
- `CLIENT` - External client user

---

### 2.2 Pipeline System

Kanban-style workflow management with customizable pipelines and stages.

| Model | Purpose | Key Fields |
|-------|---------|------------|
| `pipeline` | Customizable pipelines (Sales, Support, Billing) | `key`, `name`, `type`, `isActive` |
| `pipelineStage` | Stages within pipelines | `key`, `name`, `order`, `isTerminal`, `color` |
| `pipelineItem` | Cards/items in stages | `title`, `stageId`, `assignedToId`, `dueDate`, `priority` |
| `Task` | AI-powered task tracking | `templateId`, `source`, `status`, `pipelineId`, `stageId` |
| `TaskTemplate` | Pre-defined task templates | `id`, `label`, `category`, `preferredPipelineKey`, `definition` |
| `DecisionLog` | AI decision audit trail for tasks | `taskId`, `eventName`, `decision`, `llmCall` |

**Pipeline Types** (enum `PipelineType`):
- `SALES` - Sales pipeline
- `SUPPORT` - Customer support
- `BILLING` - Billing workflow
- `INTERNAL` - Internal operations
- `GENERIC` - General purpose
- `CUSTOM` - Custom pipeline

**Task Statuses** (enum `TaskStatus`):
- `NEW` - Just created
- `IN_PROGRESS` - Being worked on
- `NEEDS_REVIEW` - Requires review
- `BLOCKED` - Blocked by dependency
- `DONE` - Completed
- `CANCELLED` - Cancelled

**Key Relationships**:
- `pipeline` → `pipelineStage[]` (one-to-many)
- `pipelineStage` → `pipelineItem[]` (one-to-many)
- `Task.templateId` → `TaskTemplate.id` (tasks instantiated from templates)
- `Task.pipelineId` → `pipeline.id` (task assigned to pipeline)

---

### 2.3 Intake & Routing

AI-powered request intake and intelligent routing to appropriate pipelines.

| Model | Purpose | Key Fields |
|-------|---------|------------|
| `intakeRequest` | Incoming requests for AI routing | `source`, `status`, `title`, `requestData`, `assignedPipeline`, `aiRoutingMeta` |
| `IntakeRequestContext` | Not in schema - context stored in `requestData` | |

**Intake Sources** (enum `IntakeSource`):
- `FORM` - Web form submission
- `EMAIL` - Email-based intake
- `CHAT` - Chat message
- `API` - API submission

**Intake Status Flow**:
```
NEW → ROUTING → ASSIGNED → PROCESSING → COMPLETED/REJECTED
```

**AI Routing**:
- `aiRoutingMeta` stores AI decision metadata
- Orchestration Agent determines `assignedPipeline`
- Creates `Task` instances from `TaskTemplate`

---

### 2.4 Document Processing

OCR, embeddings, and RAG (Retrieval-Augmented Generation) for document understanding.

| Model | Purpose | Key Fields |
|-------|---------|------------|
| `Document` | Uploaded documents with OCR | `fileName`, `filePath`, `status`, `ocrText`, `ocrConfidence`, `cdnUrl` |
| `DocumentEmbedding` | RAG embeddings for semantic search | `documentId`, `chunkIndex`, `content`, `embedding` |
| `DocumentChat` | Chat sessions with documents | `documentId`, `userId`, `messages`, `lastMessageAt` |

**Document Status Flow**:
```
PENDING → PROCESSING → COMPLETED/FAILED
```

**Processing Pipeline**:
1. **Upload** → `Document` created with `status=PENDING`
2. **Queue** → BullMQ job enqueued
3. **OCR** → Tesseract.js extracts text (`ocrText`, `ocrConfidence`)
4. **Embeddings** → OpenAI creates chunks → `DocumentEmbedding` records
5. **Storage** → Files stored in DigitalOcean Spaces (`cdnUrl`)
6. **Chat** → RAG-powered chat via `DocumentChat`

**Supported MIME Types**:
- PDFs: `application/pdf`
- Images: `image/png`, `image/jpeg`
- Documents: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

---

### 2.5 AI Orchestration

LLM-powered agents that make decisions and take actions across the platform.

| Model | Purpose | Key Fields |
|-------|---------|------------|
| `OrchestrationAgent` | LLM-powered decision agents | `llmProvider`, `llmModel`, `systemPrompt`, `canAssignPipelines`, `isActive` |
| `AgentDecision` | Decision audit trail | `agentId`, `inputSource`, `decisionType`, `actions`, `confidence`, `reasoning` |

**LLM Providers** (enum `LLMProvider`):
- `OPENAI` - OpenAI GPT models
- `CLAUDE` - Anthropic Claude models

**Decision Types** (enum `DecisionType`):
- `ASSIGN_PIPELINE` - Route intake to pipeline
- `CREATE_EVENT` - Schedule a calendar event
- `UPDATE_EVENT` - Modify existing event
- `CANCEL_EVENT` - Cancel event
- `SEND_NOTIFICATION` - Send email/SMS
- `TRIGGER_AUTOMATION` - Trigger n8n workflow
- `ESCALATE` - Escalate to human
- `NO_ACTION` - No action needed

**Agent Capabilities**:
- `canAssignPipelines` - Can route requests
- `canCreateEvents` - Can schedule meetings
- `canSendNotifications` - Can send alerts
- `canTriggerAutomations` - Can trigger n8n

**Decision Flow**:
```typescript
Input (email/form/webhook)
  → OrchestrationAgent.systemPrompt
  → LLM generates decision
  → AgentDecision created
  → Actions executed
  → Status updated (EXECUTED/FAILED)
```

---

### 2.6 Automation & Workflows

Integration with n8n for workflow automation, templates, and credentials.

| Model | Purpose | Key Fields |
|-------|---------|------------|
| `Automation` | n8n workflow definitions | `n8nWorkflowId`, `webhookUrl`, `triggerType`, `triggerConfig`, `isActive` |
| `WorkflowExecution` | Execution history | `automationId`, `status`, `executionTime`, `errorMessage` |
| `WorkflowTrigger` | Event-based triggers | `automationId`, `triggerType`, `triggerEvent`, `cronSchedule` |
| `AutomationTemplate` | Marketplace templates | `name`, `category`, `n8nWorkflowJson`, `useCount`, `rating` |
| `IntegrationCredential` | OAuth/API credentials | `userId`, `provider`, `credentialData` (encrypted), `expiresAt` |

**Trigger Types** (enum `TriggerType`):
- `WEBHOOK` - HTTP webhook
- `SCHEDULE` - Cron schedule
- `INTAKE_CREATED` - New intake request
- `INTAKE_ASSIGNED` - Intake routed
- `DOCUMENT_UPLOADED` - Document uploaded
- `DOCUMENT_PROCESSED` - OCR completed
- `PIPELINE_STAGE_CHANGED` - Item moved
- `FORM_SUBMITTED` - Form submission
- `EMAIL_RECEIVED` - Email received
- `API_CALL` - API endpoint called

**Integration Providers** (enum `IntegrationProvider`):
- **Email**: `GMAIL`, `OUTLOOK`, `SENDGRID`, `MAILCHIMP`
- **Calendar**: `GOOGLE_CALENDAR`, `OUTLOOK`
- **Communication**: `SLACK`, `MICROSOFT_TEAMS`, `TWILIO`, `ZOOM`
- **CRM**: `HUBSPOT`, `SALESFORCE`
- **Payment**: `STRIPE`, `PAYPAL`
- **Productivity**: `TRELLO`, `ASANA`, `NOTION`, `AIRTABLE`
- **Storage**: `GOOGLE_DRIVE`, `DROPBOX`
- **AI**: `OPENAI`, `ANTHROPIC`

---

### 2.7 Calendar & Scheduling

AI-powered scheduling with conflict detection, availability rules, and reminders.

| Model | Purpose | Key Fields |
|-------|---------|------------|
| `SchedulingEvent` | Calendar events | `title`, `startTime`, `endTime`, `status`, `participantEmails`, `meetingLink` |
| `SchedulingAgentTask` | AI scheduling tasks | `rawContent`, `taskType`, `intent`, `entities`, `confidence`, `proposedSlots` |
| `EventReminder` | Automated reminders | `eventId`, `reminderTime`, `status`, `sentAt` |
| `AvailabilityRule` | User availability | `userId`, `dayOfWeek`, `startTime`, `endTime`, `timezone` |
| `CalendarConnection` | External calendars | `userId`, `provider`, `accessToken`, `lastSyncAt` |

**Scheduling Agent Task Types** (enum `AgentTaskType`):
- `SCHEDULE_MEETING` - Create new meeting
- `RESCHEDULE_MEETING` - Change meeting time
- `CANCEL_MEETING` - Cancel meeting
- `CHECK_AVAILABILITY` - Check free slots
- `CREATE_TASK` - Create task
- `UPDATE_TASK` - Update task
- `INQUIRY` - General question
- `REMINDER` - Set reminder
- `UNKNOWN` - Unclassified

**AI Scheduling Flow**:
```
User input (email/SMS/form)
  → SchedulingAgentTask created
  → AI extracts entities (date, time, participants)
  → Check AvailabilityRule
  → Detect conflicts in SchedulingEvent
  → Propose slots or create event
  → Send EventReminder
```

**Supported Calendar Providers**:
- `GOOGLE` - Google Calendar
- `OUTLOOK` - Microsoft Outlook
- `APPLE` - Apple iCloud
- `ZOOM` - Zoom
- `CALENDLY` - Calendly
- `MICROSOFT` - Microsoft 365

---

### 2.8 Booking System

Audit/consultation booking with availability management and notifications.

| Model | Purpose | Key Fields |
|-------|---------|------------|
| `audit_bookings` | Audit/consultation bookings | `scheduledDate`, `scheduledTime`, `clientEmail`, `auditType`, `status`, `assignedToId` |
| `audit_availability` | Availability slots | `dayOfWeek`, `startTime`, `endTime`, `maxBookings`, `assignedToId` |
| `audit_blocked_dates` | Blocked time periods | `blockedDate`, `startTime`, `endTime`, `reason` |
| `audit_notifications` | Email notifications | `bookingId`, `type`, `scheduledFor`, `sent`, `attempts` |
| `audit_templates` | Audit checklists | `auditType`, `sections`, `questions`, `checklists` |
| `consultations` | General consultations | `consultationType`, `scheduledAt`, `status`, `actionItems`, `proposalGenerated` |
| `revenue_audits` | Revenue operations audits | `currentChallenges`, `specificAreas`, `auditResults`, `recommendations` |

**Audit Types** (enum `AuditType`):
- `GENERAL` - General audit
- `SALES_PROCESS` - Sales process review
- `MARKETING_FUNNEL` - Marketing funnel analysis
- `PRICING_STRATEGY` - Pricing optimization
- `CUSTOMER_RETENTION` - Retention analysis
- `DIGITAL_TRANSFORMATION` - Digital transformation
- `OPERATIONAL_EFFICIENCY` - Operations optimization

**Consultation Types** (enum `ConsultationType`):
- `STRATEGY` - Strategic consulting
- `TECHNICAL` - Technical advisory
- `IMPLEMENTATION` - Implementation support
- `OPTIMIZATION` - Optimization consulting
- `TRAINING` - Training sessions
- `GENERAL` - General consultation

**Notification Types** (enum `NotificationType`):
- `CONFIRMATION` - Booking confirmation
- `REMINDER_24H` - 24-hour reminder
- `REMINDER_2H` - 2-hour reminder
- `FOLLOW_UP` - Post-meeting follow-up
- `CANCELLATION` - Cancellation notice
- `RESCHEDULE` - Reschedule notice

**Booking Flow**:
```
Form submission
  → Check audit_availability
  → Check audit_blocked_dates
  → Create audit_bookings
  → Queue audit_notifications (CONFIRMATION, REMINDER_24H, REMINDER_2H)
  → Send ICS calendar file
```

---

### 2.9 Engagement Management

Client project management with companies, contacts, milestones, and environments.

| Model | Purpose | Key Fields |
|-------|---------|------------|
| `Engagement` | Client projects | `companyId`, `name`, `status`, `startDate`, `budgetAmount`, `billingModel`, `scopeSummary` |
| `Company` | Client companies | `name`, `website`, `industry`, `size`, `billingEmail` |
| `Contact` | Company contacts | `companyId`, `firstName`, `lastName`, `email`, `role`, `isPrimary` |
| `EngagementStakeholder` | Project stakeholders | `engagementId`, `contactId`, `role` |
| `Environment` | Deployment environments | `engagementId`, `name`, `url`, `notes` |
| `Milestone` | Payment milestones | `engagementId`, `title`, `dueDate`, `amount`, `status` |
| `AccessRequest` | Access permissions | `engagementId`, `type`, `details`, `status` |

**Engagement Status Flow**:
```
DRAFT → ACTIVE → PAUSED/CLOSED
```

**Billing Models** (enum `BillingModel`):
- `TIME_AND_MATERIALS` - Hourly/daily billing
- `FIXED_FEE` - Fixed project fee
- `RETAINER` - Monthly retainer

**Access Types** (enum `AccessType`):
- `GITHUB` - GitHub repository access
- `CLOUD` - Cloud platform (AWS/Azure/GCP)
- `DATABASE` - Database access
- `ANALYTICS` - Analytics platform
- `PM_TOOL` - Project management tool
- `OTHER` - Other access

**Milestone Status Flow**:
```
PLANNED → IN_PROGRESS → COMPLETE → INVOICED
```

---

### 2.10 Marketplace

E-commerce for digital products, services, and automation templates.

| Model | Purpose | Key Fields |
|-------|---------|------------|
| `marketplace_items` | Digital products/services | `title`, `slug`, `price`, `itemType`, `categoryId`, `stock`, `paypalProductId` |
| `orders` | Customer orders | `orderNumber`, `status`, `total`, `paymentMethod`, `paymentStatus`, `userId` |
| `order_items` | Line items | `orderId`, `marketplaceItemId`, `quantity`, `subtotal`, `fulfillmentStatus` |
| `wishlists` | User wishlists | `userId`, `itemId` |
| `categories` | Product categories | `name`, `slug`, `description` |
| `tags` | Product tags | `name`, `slug` |

**Item Types** (enum `ItemType`):
- `PRODUCT` - Digital product
- `SERVICE` - Service offering

**Delivery Methods** (enum `DeliveryMethod`):
- `DIGITAL` - Digital download
- `CONSULTATION` - Consultation service
- `DEVELOPMENT` - Development work
- `DESIGN` - Design service
- `MAINTENANCE` - Maintenance service
- `TRAINING` - Training service

**Duration Types** (enum `DurationType`):
- `ONE_TIME` - One-time purchase
- `HOURLY` - Per hour
- `DAILY` - Per day
- `WEEKLY` - Per week
- `MONTHLY` - Per month
- `YEARLY` - Per year
- `PROJECT_BASED` - Project-based pricing

**Order Status Flow**:
```
PENDING → PROCESSING → CONFIRMED → SHIPPED → DELIVERED
         ↓
    CANCELLED/REFUNDED
```

**Payment Methods** (enum `PaymentMethod`):
- `PAYPAL` - PayPal payment
- `STRIPE` - Stripe payment
- `BANK_TRANSFER` - Bank transfer
- `OTHER` - Other method

---

### 2.11 Content Management

Blog posts, comments, likes, and testimonials.

| Model | Purpose | Key Fields |
|-------|---------|------------|
| `posts` | Blog posts | `title`, `slug`, `content`, `status`, `authorId`, `categoryId`, `publishedAt`, `viewCount` |
| `comments` | Post comments | `content`, `postId`, `authorId` |
| `likes` | Post likes | `postId`, `userId` |
| `testimonials` | Customer testimonials | `content`, `rating`, `authorId`, `company`, `featured`, `published` |

**Post Status Flow**:
```
DRAFT → PUBLISHED → ARCHIVED
```

**SEO Fields**:
- `metaTitle` - SEO title
- `metaDescription` - Meta description
- `keywords` - SEO keywords (array)
- `slug` - URL-friendly identifier

---

### 2.12 Newsletter

Email campaigns, subscribers, and preferences.

| Model | Purpose | Key Fields |
|-------|---------|------------|
| `newsletter_subscribers` | Email subscribers | `email`, `status`, `confirmationToken`, `unsubscribeToken`, `consentGiven` |
| `newsletter_campaigns` | Email campaigns | `name`, `subject`, `htmlContent`, `status`, `scheduledAt`, `totalRecipients` |
| `newsletter_emails` | Individual campaign emails | `campaignId`, `subscriberId`, `status`, `sentAt`, `openedAt`, `clickedAt` |
| `newsletter_templates` | Email templates | `name`, `htmlContent`, `variables`, `isDefault` |
| `subscriber_preferences` | Subscriber preferences | `subscriberId`, `blogUpdates`, `productUpdates`, `frequency` |

**Subscription Status Flow**:
```
PENDING → ACTIVE → UNSUBSCRIBED/BOUNCED/COMPLAINED
```

**Campaign Status Flow**:
```
DRAFT → SCHEDULED → SENDING → SENT/PAUSED/CANCELLED
```

**Email Status Flow**:
```
PENDING → SENT → DELIVERED → OPENED → CLICKED
         ↓
    BOUNCED/COMPLAINED/FAILED
```

**Email Frequency** (enum `EmailFrequency`):
- `DAILY` - Daily emails
- `WEEKLY` - Weekly digest
- `MONTHLY` - Monthly newsletter
- `QUARTERLY` - Quarterly updates

---

### 2.13 Other Models

**Contact Forms**:
- `contact_forms` - Website contact submissions
- `ClientCall` - Scheduled client calls

**AI Optimization Reports**:
- `ai_optimization_reports` - AI-powered business optimization reports

**Audit Logging**:
- `AuditLog` - System-wide audit trail
- `ActivityLog` - User activity tracking

**Follow-ups**:
- `follow_ups` - Scheduled follow-up tasks for consultations/audits

**Chat Messages**:
- `ChatMessage` - Real-time chat messages for scheduling agent

---

## Common Patterns

### 3.1 Multi-Tenancy

**Organization-Scoped Models**:
All tenant-scoped models include `orgId` field:
```prisma
model Example {
  id    String       @id
  orgId String
  // ... other fields
  organization organization @relation(fields: [orgId], references: [id])

  @@index([orgId])
}
```

**Row-Level Security**:
Queries MUST filter by `orgId`:
```typescript
// CORRECT: Scoped to organization
const documents = await prisma.document.findMany({
  where: { orgId: user.orgId }
});

// WRONG: Returns data from all organizations
const documents = await prisma.document.findMany();
```

**Organization Plans** (enum `PlanType`):
- `FREE` - Free tier
- `STARTER` - Starter plan
- `PROFESSIONAL` - Professional plan
- `ENTERPRISE` - Enterprise plan

---

### 3.2 Soft Deletes

Some models use `deletedAt` timestamp for soft deletion:
```prisma
model Example {
  id        String    @id
  deletedAt DateTime? // NULL = active, timestamp = deleted
}
```

**Query Pattern**:
```typescript
// Active records only
const active = await prisma.example.findMany({
  where: { deletedAt: null }
});

// Include soft-deleted
const all = await prisma.example.findMany();
```

---

### 3.3 Audit Fields

Most models include standard audit timestamps:
```prisma
model Example {
  id        String   @id
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Some models also track the user:
```prisma
model Example {
  id          String   @id
  createdById String
  createdBy   users    @relation(fields: [createdById], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

### 3.4 JSON Fields

**Flexible Data Storage**:
Many models use `Json` type for flexible data:
```prisma
model Example {
  id       String @id
  metadata Json?  // Optional metadata
  data     Json   // Required data
  context  Json?  // Optional context
  options  Json?  // Optional configuration
}
```

**TypeScript Usage**:
```typescript
// Type-safe JSON with Zod
const MetadataSchema = z.object({
  source: z.string(),
  tags: z.array(z.string()),
});

const record = await prisma.example.create({
  data: {
    metadata: { source: 'web', tags: ['important'] }
  }
});

const parsed = MetadataSchema.parse(record.metadata);
```

---

### 3.5 Array Fields

**String Arrays**:
```prisma
model Example {
  id   String   @id
  tags String[] @default([])
}
```

**Usage**:
```typescript
// Search in array
const items = await prisma.example.findMany({
  where: {
    tags: { has: 'urgent' }
  }
});

// Add to array
await prisma.example.update({
  where: { id },
  data: {
    tags: { push: 'new-tag' }
  }
});
```

---

## Key Relationships

### Entity Relationship Diagram

```mermaid
erDiagram
    organization ||--o{ users : has
    organization ||--o{ intakeRequest : receives
    organization ||--o{ Document : owns
    organization ||--o{ Automation : configures
    organization ||--o{ OrchestrationAgent : uses

    users ||--o{ posts : writes
    users ||--o{ comments : creates
    users ||--o{ audit_bookings : schedules
    users ||--o{ SchedulingEvent : organizes
    users ||--o{ Task : assigned

    pipeline ||--o{ pipelineStage : contains
    pipelineStage ||--o{ pipelineItem : holds
    pipeline ||--o{ Task : manages

    TaskTemplate ||--o{ Task : instantiates
    Task ||--o{ DecisionLog : tracks

    Document ||--o{ DocumentEmbedding : generates
    Document ||--o{ DocumentChat : enables

    Automation ||--o{ WorkflowExecution : runs
    Automation ||--o{ WorkflowTrigger : triggers

    OrchestrationAgent ||--o{ AgentDecision : makes

    Company ||--o{ Contact : employs
    Company ||--o{ Engagement : contracts
    Engagement ||--o{ EngagementStakeholder : involves
    Engagement ||--o{ Milestone : defines
    Engagement ||--o{ Environment : deploys

    marketplace_items ||--o{ order_items : purchased
    orders ||--o{ order_items : contains
    users ||--o{ orders : places

    newsletter_campaigns ||--o{ newsletter_emails : sends
    newsletter_subscribers ||--o{ newsletter_emails : receives

    SchedulingEvent ||--o{ EventReminder : schedules
    SchedulingAgentTask ||--o{ SchedulingEvent : creates
```

---

### Foreign Key Conventions

**Naming Pattern**:
```prisma
// Field name: {referencedModel}Id (camelCase)
// Relation name: lowercase of referenced model
model Example {
  userId String
  user   users  @relation(fields: [userId], references: [id])
}
```

**Cascade Deletes**:
```prisma
// Child deleted when parent deleted
@relation(fields: [parentId], references: [id], onDelete: Cascade)

// Child orphaned (set to NULL) when parent deleted
@relation(fields: [parentId], references: [id], onDelete: SetNull)

// Prevent parent deletion if children exist
@relation(fields: [parentId], references: [id], onDelete: Restrict)
```

---

## Database Commands

### Prisma CLI Commands

```bash
# Generate TypeScript client
npx prisma generate

# Create new migration (development)
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (WARNING: destroys all data)
npx prisma migrate reset

# View database in browser
npx prisma studio

# Seed database with test data
npx prisma db seed

# Format schema file
npx prisma format

# Validate schema
npx prisma validate

# Pull schema from existing database
npx prisma db pull

# Push schema changes without migration (dev only)
npx prisma db push
```

---

### Migration Workflow

**Development**:
```bash
# 1. Edit prisma/schema.prisma
# 2. Create migration
npx prisma migrate dev --name add_new_feature

# 3. Migration auto-applied, client regenerated
# 4. Commit schema.prisma + migration files
```

**Production**:
```bash
# 1. Pull latest code
git pull origin main

# 2. Apply pending migrations
npx prisma migrate deploy

# 3. Restart application
npm run prod:reload
```

---

### Seeding Database

**Seed Script**: `prisma/seed.ts`

```bash
# Run seed script
npx prisma db seed

# Seed script populates:
# - Default organization
# - Admin user
# - Sample pipelines & stages
# - Task templates
# - Automation templates
```

---

## Connection Configuration

### DATABASE_URL Format

**PostgreSQL Connection String**:
```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

**Example (Local)**:
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/astralis?schema=public"
```

**Example (Production)**:
```bash
DATABASE_URL="postgresql://deploy:securepass@db.astralisone.com:5432/astralis_prod?schema=public&sslmode=require"
```

---

### Connection Pooling

**Prisma Connection Pool**:
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**Connection Limits**:
- Development: Default pool size (10 connections)
- Production: Configure via `DATABASE_URL` query params:
  ```
  ?connection_limit=20&pool_timeout=10
  ```

---

### SSL Configuration

**Enable SSL** (required for hosted databases):
```bash
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

**SSL Modes**:
- `disable` - No SSL (local only)
- `prefer` - Use SSL if available
- `require` - Require SSL (fail if unavailable)
- `verify-ca` - Verify CA certificate
- `verify-full` - Full certificate verification

---

## Performance Optimization

### Indexes

**Current Indexes**:
All major query patterns are indexed:
```prisma
@@index([orgId])              // Multi-tenant queries
@@index([userId])             // User-scoped queries
@@index([createdAt])          // Time-range queries
@@index([status])             // Status filtering
@@index([email])              // Email lookups
@@index([orgId, status])      // Composite queries
```

**Adding Custom Indexes**:
```prisma
model Example {
  id     String @id
  field1 String
  field2 String

  @@index([field1, field2]) // Composite index
  @@index([field1])         // Single-field index
}
```

---

### Query Optimization

**Use `select` to limit fields**:
```typescript
// BAD: Fetches all fields
const user = await prisma.users.findUnique({
  where: { id }
});

// GOOD: Fetch only needed fields
const user = await prisma.users.findUnique({
  where: { id },
  select: { email: true, name: true }
});
```

**Use pagination**:
```typescript
// Paginate large result sets
const items = await prisma.pipelineItem.findMany({
  take: 20,
  skip: page * 20,
  orderBy: { createdAt: 'desc' }
});
```

**Batch queries**:
```typescript
// GOOD: Single query with relation
const users = await prisma.users.findMany({
  include: { organization: true }
});

// BAD: N+1 queries
const users = await prisma.users.findMany();
for (const user of users) {
  const org = await prisma.organization.findUnique({
    where: { id: user.orgId }
  });
}
```

---

## Security Best Practices

### 1. Input Validation

**ALWAYS validate with Zod before Prisma**:
```typescript
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

export async function POST(req: Request) {
  const parsed = CreateUserSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const user = await prisma.users.create({
    data: parsed.data
  });

  return NextResponse.json(user);
}
```

---

### 2. Parameterized Queries

**Prisma handles parameterization automatically**:
```typescript
// SAFE: Prisma uses parameterized queries
const user = await prisma.users.findUnique({
  where: { email: userInput }
});

// NEVER use raw SQL with user input
// UNSAFE:
// await prisma.$executeRaw`SELECT * FROM users WHERE email = ${userInput}`;
```

---

### 3. Sensitive Data

**Encrypt sensitive fields**:
```typescript
// Store encrypted credentials
await prisma.integrationCredential.create({
  data: {
    provider: 'GMAIL',
    credentialData: encrypt(apiKey), // Use crypto to encrypt
    userId,
    orgId,
  }
});

// Decrypt on retrieval
const cred = await prisma.integrationCredential.findFirst({
  where: { userId, provider: 'GMAIL' }
});
const decrypted = decrypt(cred.credentialData);
```

**Never log sensitive data**:
```typescript
// BAD: Logs password
console.log('User:', user);

// GOOD: Omit sensitive fields
const { password, ...safeUser } = user;
console.log('User:', safeUser);
```

---

### 4. Row-Level Security

**Always scope by organization**:
```typescript
// CORRECT: Organization-scoped
const documents = await prisma.document.findMany({
  where: {
    orgId: user.orgId,
    status: 'COMPLETED'
  }
});

// WRONG: Cross-organization data leak
const documents = await prisma.document.findMany({
  where: { status: 'COMPLETED' }
});
```

---

## Troubleshooting

### Common Issues

**Issue**: `prisma.schema out of sync`
```bash
# Solution: Regenerate client
npx prisma generate
```

**Issue**: Migration conflicts
```bash
# Solution: Resolve conflicts and apply
npx prisma migrate resolve --applied <migration_name>
npx prisma migrate deploy
```

**Issue**: Connection pool exhausted
```bash
# Solution: Increase connection limit
DATABASE_URL="postgresql://user:pass@host/db?connection_limit=50"
```

**Issue**: Slow queries
```bash
# Solution: Add indexes or use EXPLAIN
npx prisma studio
# Or check query logs for slow queries
```

---

## Migration History

**View Applied Migrations**:
```bash
# List all migrations
npx prisma migrate status

# View migration SQL
cat prisma/migrations/20250101000000_migration_name/migration.sql
```

**Rollback Strategy**:
Prisma does not support automatic rollback. Manual process:
1. Create new migration that reverses changes
2. Apply with `npx prisma migrate dev`
3. Or restore database from backup

---

## Related Documentation

- **Schema File**: `/Users/gadmin/Projects/astralis-nextjs/prisma/schema.prisma`
- **Seed Script**: `/Users/gadmin/Projects/astralis-nextjs/prisma/seed.ts`
- **Prisma Client**: Generated in `node_modules/.prisma/client`
- **Migrations**: `/Users/gadmin/Projects/astralis-nextjs/prisma/migrations/`
- **Setup Guide**: `/Users/gadmin/Projects/astralis-nextjs/SETUP_GUIDE.md`
- **Booking Setup**: `/Users/gadmin/Projects/astralis-nextjs/docs/BOOKING_SETUP.md`

---

## Quick Reference

### Count by Category

| Category | Model Count |
|----------|-------------|
| Authentication & Users | 6 |
| Pipeline System | 6 |
| Intake & Routing | 1 |
| Document Processing | 3 |
| AI Orchestration | 2 |
| Automation & Workflows | 5 |
| Calendar & Scheduling | 5 |
| Booking System | 7 |
| Engagement Management | 7 |
| Marketplace | 6 |
| Content Management | 4 |
| Newsletter | 5 |
| Other | 7 |
| Join Tables | 2 |
| **TOTAL** | **89 models** |

### Top Enums

| Enum | Values |
|------|--------|
| `UserRole` | 7 roles (USER, AUTHOR, EDITOR, ADMIN, PM, OPERATOR, CLIENT) |
| `TriggerType` | 10 types (WEBHOOK, SCHEDULE, INTAKE_CREATED, etc.) |
| `IntegrationProvider` | 26 providers (GMAIL, SLACK, HUBSPOT, OPENAI, etc.) |
| `NotificationType` | 6 types (CONFIRMATION, REMINDER_24H, etc.) |
| `DecisionType` | 8 types (ASSIGN_PIPELINE, CREATE_EVENT, etc.) |

---

**Last Updated**: 2025-12-02
**Schema Version**: Latest (89 models, ~2000 lines)
**Database**: PostgreSQL with Prisma ORM

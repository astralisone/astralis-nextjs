# Phase 6: Business Automation Database Architecture

**Project**: AstralisOps - AI Operations Automation Platform
**Phase**: Phase 6 - Business Automation & n8n Integration
**Database**: PostgreSQL 16 with Prisma ORM
**Date**: 2025-11-21

---

## Executive Summary

Phase 6 introduces a comprehensive business automation system powered by n8n, enabling small businesses to automate repetitive tasks, streamline workflows, and integrate 400+ business tools. The database schema supports workflow management, execution tracking, template marketplace, and secure credential storage.

### Key Capabilities

- **Visual Workflow Builder**: n8n integration for drag-and-drop automation creation
- **Multi-Trigger Support**: Webhooks, schedules, events, manual, and API triggers
- **Execution Monitoring**: Complete audit trail of all workflow runs with success/failure tracking
- **Template Marketplace**: Pre-built automation templates for common business processes
- **Integration Management**: Secure OAuth credential storage for 30+ service providers
- **Multi-Tenant**: Full organization-level isolation and access control

---

## Database Schema Overview

### New Tables (Phase 6)

1. **Automation** - Core automation workflow definitions
2. **WorkflowExecution** - Execution history and results
3. **WorkflowTrigger** - Trigger configurations for automations
4. **AutomationTemplate** - Pre-built workflow templates
5. **IntegrationCredential** - Encrypted OAuth credentials

### Updated Tables

- **organization**: Added relations for automations, executions, triggers, credentials
- **users**: Added relations for created automations and integration credentials

---

## Data Models (Detailed)

### 1. Automation Model

**Purpose**: Stores automation workflow definitions and metadata.

**Table Name**: `automations`

```prisma
model Automation {
  id               String              @id @default(cuid())
  name             String
  description      String?
  n8nWorkflowId    String?              // Reference to n8n workflow
  webhookUrl       String?              // Webhook endpoint for this automation
  isActive         Boolean              @default(true)
  triggerType      AutomationTrigger
  triggerConfig    Json                 // Trigger-specific configuration
  lastExecutedAt   DateTime?
  executionCount   Int                  @default(0)
  successCount     Int                  @default(0)
  failureCount     Int                  @default(0)
  avgExecutionTime Float?               // Average execution time in ms
  orgId            String
  organization     organization         @relation(fields: [orgId], references: [id])
  createdById      String
  createdBy        users                @relation("AutomationCreatedBy", fields: [createdById], references: [id])
  tags             String[]             @default([])
  metadata         Json?                // Custom metadata
  createdAt        DateTime             @default(now())
  updatedAt        DateTime             @updatedAt

  executions       WorkflowExecution[]
  triggers         WorkflowTrigger[]

  @@index([orgId, isActive])
  @@index([triggerType])
  @@index([createdById])
  @@index([createdAt])
  @@map("automations")
}
```

**Key Fields**:
- `n8nWorkflowId`: Links to n8n's internal workflow ID for execution
- `webhookUrl`: Generated webhook endpoint when triggerType is WEBHOOK
- `triggerConfig`: JSON storing trigger-specific settings (cron schedule, event filters, etc.)
- `executionCount`, `successCount`, `failureCount`: Performance metrics
- `avgExecutionTime`: Rolling average of execution duration in milliseconds

**Indexes**:
- `[orgId, isActive]`: Fast lookup of active automations per organization
- `[triggerType]`: Filter by trigger mechanism (webhook, schedule, event, etc.)
- `[createdById]`: Track automations created by specific user
- `[createdAt]`: Chronological ordering

**Business Logic**:
- When `isActive = false`, workflow will not execute even if triggered
- `lastExecutedAt` updates on every execution attempt
- Stats (`executionCount`, `successCount`, `failureCount`) increment atomically
- `avgExecutionTime` recalculates using exponential moving average

---

### 2. WorkflowExecution Model

**Purpose**: Records every automation execution with full audit trail.

**Table Name**: `workflow_executions`

```prisma
model WorkflowExecution {
  id             String          @id @default(cuid())
  automationId   String
  automation     Automation      @relation(fields: [automationId], references: [id], onDelete: Cascade)
  orgId          String
  organization   organization    @relation(fields: [orgId], references: [id])
  n8nExecutionId String?         // Reference to n8n execution
  status         ExecutionStatus @default(RUNNING)
  startedAt      DateTime        @default(now())
  completedAt    DateTime?
  executionTime  Int?            // Execution time in ms
  triggerData    Json            // Input data that triggered workflow
  outputData     Json?           // Output/result data
  errorMessage   String?         @db.Text
  errorStack     String?         @db.Text
  retryCount     Int             @default(0)
  metadata       Json?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt

  @@index([automationId, status])
  @@index([orgId, startedAt])
  @@index([status])
  @@index([createdAt])
  @@map("workflow_executions")
}
```

**Key Fields**:
- `n8nExecutionId`: Links to n8n's execution record for debugging
- `status`: Tracks lifecycle (QUEUED → RUNNING → SUCCESS/FAILED/TIMEOUT/CANCELLED)
- `triggerData`: Full JSON payload that initiated the workflow
- `outputData`: Results from workflow execution (last node output)
- `errorMessage` + `errorStack`: Complete error details for failed executions
- `retryCount`: Number of automatic retry attempts (max 3)

**Status Enum**:
```prisma
enum ExecutionStatus {
  QUEUED    // Waiting in job queue
  RUNNING   // Currently executing
  SUCCESS   // Completed successfully
  FAILED    // Error occurred
  TIMEOUT   // Exceeded max execution time
  CANCELLED // Manually stopped
}
```

**Indexes**:
- `[automationId, status]`: Fast filtering of executions by status per automation
- `[orgId, startedAt]`: Organization-wide execution timeline
- `[status]`: Global status filtering (e.g., find all failed executions)
- `[createdAt]`: Chronological ordering

**Lifecycle**:
1. Record created with `status = QUEUED` when trigger fires
2. Status changes to `RUNNING` when worker picks up job
3. On completion:
   - Success: `status = SUCCESS`, `outputData` populated
   - Failure: `status = FAILED`, `errorMessage` populated
4. `executionTime` calculated as `completedAt - startedAt` in ms

---

### 3. WorkflowTrigger Model

**Purpose**: Defines when and how automations should execute.

**Table Name**: `workflow_triggers`

```prisma
model WorkflowTrigger {
  id              String       @id @default(cuid())
  automationId    String
  automation      Automation   @relation(fields: [automationId], references: [id], onDelete: Cascade)
  orgId           String
  organization    organization @relation(fields: [orgId], references: [id])
  triggerType     TriggerType
  triggerEvent    String       // Specific event (e.g., "document.uploaded", "form.submitted")
  webhookUrl      String?      // If webhook trigger
  cronSchedule    String?      // If schedule trigger (cron format)
  eventFilters    Json?        // Conditions for when to trigger
  isActive        Boolean      @default(true)
  lastTriggeredAt DateTime?
  triggerCount    Int          @default(0)
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  @@index([automationId, isActive])
  @@index([orgId])
  @@index([triggerType])
  @@map("workflow_triggers")
}
```

**Trigger Types**:
```prisma
enum TriggerType {
  WEBHOOK                 // External HTTP POST to webhook URL
  SCHEDULE                // Cron-based schedule
  INTAKE_CREATED          // New intake request submitted
  INTAKE_ASSIGNED         // Intake assigned to pipeline
  DOCUMENT_UPLOADED       // Document added to system
  DOCUMENT_PROCESSED      // OCR/AI processing completed
  PIPELINE_STAGE_CHANGED  // Pipeline item moved to new stage
  FORM_SUBMITTED          // Contact form submission
  EMAIL_RECEIVED          // Incoming email processed
  API_CALL                // Direct API endpoint invocation
}
```

**Key Fields**:
- `triggerEvent`: String identifier for event type (e.g., "document.uploaded")
- `webhookUrl`: Unique webhook endpoint if `triggerType = WEBHOOK`
- `cronSchedule`: Cron expression if `triggerType = SCHEDULE` (e.g., "0 9 * * *" = daily at 9am)
- `eventFilters`: JSON conditions for selective triggering
  ```json
  {
    "documentType": "invoice",
    "fileSize": { "lessThan": 10485760 },
    "tags": ["urgent"]
  }
  ```
- `lastTriggeredAt`: Timestamp of most recent trigger
- `triggerCount`: Total number of times this trigger has fired

**Indexes**:
- `[automationId, isActive]`: Active triggers per automation
- `[orgId]`: Organization-wide trigger management
- `[triggerType]`: Filter by trigger mechanism

---

### 4. AutomationTemplate Model

**Purpose**: Pre-built workflow templates for common business processes.

**Table Name**: `automation_templates`

```prisma
model AutomationTemplate {
  id                   String           @id @default(cuid())
  name                 String
  description          String           @db.Text
  category             TemplateCategory
  difficulty           String           @default("beginner") // beginner, intermediate, advanced
  n8nWorkflowJson      String           @db.Text // JSON export of n8n workflow
  thumbnailUrl         String?
  demoVideoUrl         String?
  requiredIntegrations String[]         @default([]) // e.g., ["gmail", "slack", "googlesheets"]
  useCount             Int              @default(0)
  rating               Float            @default(0.0)
  tags                 String[]         @default([])
  isOfficial           Boolean          @default(false) // Created by Astralis team
  publishedById        String?
  publishedAt          DateTime?
  createdAt            DateTime         @default(now())
  updatedAt            DateTime         @updatedAt

  @@index([category])
  @@index([useCount])
  @@index([rating])
  @@index([isOfficial])
  @@map("automation_templates")
}
```

**Categories**:
```prisma
enum TemplateCategory {
  LEAD_MANAGEMENT        // Lead capture, qualification, routing
  CUSTOMER_ONBOARDING    // New customer welcome sequences
  REPORTING              // Daily/weekly/monthly reports
  NOTIFICATIONS          // Team alerts, reminders
  DATA_SYNC              // Sync data between tools
  CONTENT_PUBLISHING     // Blog/social media automation
  INVOICING              // Payment processing, receipts
  SUPPORT_AUTOMATION     // Ticket routing, auto-responses
  SALES_PIPELINE         // Deal tracking, follow-ups
  MARKETING              // Email campaigns, lead nurturing
  HR_OPERATIONS          // Onboarding, time-off requests
  OTHER                  // Miscellaneous automations
}
```

**Key Fields**:
- `n8nWorkflowJson`: Complete n8n workflow export (nodes, connections, settings)
- `requiredIntegrations`: Array of service providers needed (e.g., `["gmail", "slack"]`)
- `difficulty`: Complexity level for users (`beginner`, `intermediate`, `advanced`)
- `useCount`: Number of times template has been deployed
- `rating`: Average user rating (0.0 to 5.0)
- `isOfficial`: True for Astralis-provided templates

**Indexes**:
- `[category]`: Browse by category
- `[useCount]`: Sort by popularity
- `[rating]`: Sort by user ratings
- `[isOfficial]`: Filter official vs community templates

**Template Usage Flow**:
1. User selects template from marketplace
2. System clones `n8nWorkflowJson` to new n8n workflow
3. User configures integration credentials
4. Automation record created with reference to n8n workflow
5. Template `useCount` increments

---

### 5. IntegrationCredential Model

**Purpose**: Securely store OAuth tokens and API keys for third-party integrations.

**Table Name**: `integration_credentials`

```prisma
model IntegrationCredential {
  id             String              @id @default(cuid())
  userId         String
  user           users               @relation(fields: [userId], references: [id], onDelete: Cascade)
  orgId          String
  organization   organization        @relation(fields: [orgId], references: [id])
  provider       IntegrationProvider
  credentialName String              // User-friendly name (e.g., "Main Gmail Account")
  credentialData String              @db.Text // Encrypted credentials JSON
  scope          String?             // OAuth scopes
  expiresAt      DateTime?           // For OAuth tokens
  isActive       Boolean             @default(true)
  lastUsedAt     DateTime?
  createdAt      DateTime            @default(now())
  updatedAt      DateTime            @updatedAt

  @@unique([userId, provider, credentialName])
  @@index([orgId])
  @@index([userId, isActive])
  @@map("integration_credentials")
}
```

**Supported Providers**:
```prisma
enum IntegrationProvider {
  GMAIL
  GOOGLE_SHEETS
  GOOGLE_DRIVE
  GOOGLE_CALENDAR
  SLACK
  MICROSOFT_TEAMS
  OUTLOOK
  HUBSPOT
  SALESFORCE
  STRIPE
  PAYPAL
  MAILCHIMP
  SENDGRID
  TWILIO
  ZOOM
  DROPBOX
  TRELLO
  ASANA
  NOTION
  AIRTABLE
  WEBHOOK
  HTTP_REQUEST
  DATABASE
  OPENAI
  ANTHROPIC
  OTHER
}
```

**Key Fields**:
- `credentialData`: Encrypted JSON containing OAuth tokens or API keys
  ```json
  {
    "access_token": "ya29.a0AfH6SMB...",
    "refresh_token": "1//0gZ8K5X...",
    "token_type": "Bearer",
    "scope": "https://www.googleapis.com/auth/gmail.send"
  }
  ```
- `credentialName`: User-defined label (e.g., "Work Gmail", "Personal Slack")
- `scope`: OAuth permission scopes granted by user
- `expiresAt`: Token expiration timestamp (triggers automatic refresh)
- `lastUsedAt`: Tracks when credential was last used in automation

**Security**:
- All credentials encrypted at rest using AES-256-GCM
- Encryption key stored in environment variable `ENCRYPTION_KEY` (32-byte hex)
- Credentials only decrypted during workflow execution
- OAuth tokens refreshed automatically before expiration

**Indexes**:
- `[userId, provider, credentialName]`: Unique constraint prevents duplicate credential names
- `[orgId]`: Organization-wide credential management
- `[userId, isActive]`: Active credentials per user

---

## Data Flows

### 1. Webhook-Triggered Automation

```
User Submits Form
  → POST /api/webhooks/automation/{id}
  → Verify automation exists and isActive = true
  → Create WorkflowExecution record (status = QUEUED)
  → Add job to BullMQ queue "automation-triggers"
  → Worker picks up job
  → Update status = RUNNING
  → Execute n8n workflow via n8nService.executeWorkflow()
  → n8n runs nodes (send email, post to Slack, update sheet)
  → On completion:
    - Update status = SUCCESS
    - Store outputData
    - Calculate executionTime
    - Increment Automation.executionCount and successCount
    - Update avgExecutionTime
  → On failure:
    - Update status = FAILED
    - Store errorMessage and errorStack
    - Increment failureCount
    - Retry up to 3 times with exponential backoff
```

### 2. Schedule-Based Automation

```
Cron Job Scheduler (runs every minute)
  → Query WorkflowTrigger where triggerType = SCHEDULE
  → Parse cronSchedule for each trigger
  → If current time matches cron expression:
    → Get associated Automation
    → Verify isActive = true
    → Create WorkflowExecution record (status = QUEUED)
    → Add job to "automation-triggers" queue
    → Update lastTriggeredAt
    → Increment triggerCount
  → [Same execution flow as webhook]
```

### 3. Event-Triggered Automation

```
Document Upload Completed
  → Check for WorkflowTrigger where:
    - triggerType = DOCUMENT_UPLOADED
    - triggerEvent = "document.uploaded"
    - isActive = true
  → Apply eventFilters (if any)
  → For each matching trigger:
    → Get associated Automation
    → Create WorkflowExecution with document metadata in triggerData
    → Queue execution
    → [Same execution flow as webhook]
```

### 4. Template Deployment

```
User Clicks "Use Template"
  → Fetch AutomationTemplate by ID
  → Parse n8nWorkflowJson
  → Create new n8n workflow via n8nService.createWorkflow()
  → Create Automation record:
    - name = template.name (copied)
    - triggerType = extracted from workflow
    - n8nWorkflowId = new workflow ID
    - orgId = user's organization
    - createdById = current user
  → Increment template.useCount
  → Redirect to automation configuration page
```

---

## Integration Architecture

### n8n Container Configuration

```yaml
n8n:
  image: n8nio/n8n:latest
  environment:
    - DB_TYPE=postgresdb
    - DB_POSTGRESDB_HOST=postgres
    - DB_POSTGRESDB_DATABASE=astralis_one
    - DB_POSTGRESDB_SCHEMA=n8n
    - WEBHOOK_URL=https://automation.astralisone.com/
    - EXECUTIONS_DATA_SAVE_ON_SUCCESS=all
  volumes:
    - n8n-data:/home/node/.n8n
```

**Database Isolation**:
- n8n uses separate schema `n8n` within same PostgreSQL database
- AstralisOps uses default `public` schema
- No direct foreign keys between schemas
- References via string IDs (`n8nWorkflowId`, `n8nExecutionId`)

**Communication**:
- AstralisOps → n8n: REST API calls to `http://n8n:5678/api/v1/`
- n8n → AstralisOps: Webhook callbacks to `http://app:3001/api/webhooks/`

---

## Query Patterns & Performance

### Common Queries

**1. List Active Automations for Organization**:
```sql
SELECT * FROM automations
WHERE "orgId" = $1 AND "isActive" = true
ORDER BY "createdAt" DESC;
```
*Index used*: `[orgId, isActive]`

**2. Get Recent Execution History**:
```sql
SELECT * FROM workflow_executions
WHERE "automationId" = $1
ORDER BY "startedAt" DESC
LIMIT 50;
```
*Index used*: `[automationId, status]` (partial match on automationId)

**3. Find Failed Executions Needing Attention**:
```sql
SELECT we.*, a.name as automation_name
FROM workflow_executions we
JOIN automations a ON we."automationId" = a.id
WHERE we.status = 'FAILED' AND we."retryCount" < 3
ORDER BY we."startedAt" DESC;
```
*Index used*: `[status]` on workflow_executions

**4. Calculate Success Rate per Automation**:
```sql
SELECT
  id,
  name,
  "executionCount",
  "successCount",
  "failureCount",
  CASE
    WHEN "executionCount" > 0
    THEN ("successCount"::float / "executionCount" * 100)
    ELSE 0
  END as success_rate_pct
FROM automations
WHERE "orgId" = $1
ORDER BY success_rate_pct DESC;
```

**5. Most Popular Templates**:
```sql
SELECT * FROM automation_templates
WHERE "isOfficial" = true
ORDER BY "useCount" DESC, rating DESC
LIMIT 20;
```
*Index used*: `[isOfficial]`, then sort on `useCount`

---

## Migration Strategy

### Step 1: Generate Migration

```bash
npx prisma migrate dev --name add_automation_tables
```

This creates:
- `prisma/migrations/{timestamp}_add_automation_tables/migration.sql`

### Step 2: Migration SQL (Generated)

```sql
-- CreateEnum
CREATE TYPE "AutomationTrigger" AS ENUM ('WEBHOOK', 'SCHEDULE', 'EVENT', 'MANUAL', 'API');
CREATE TYPE "ExecutionStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCESS', 'FAILED', 'TIMEOUT', 'CANCELLED');
CREATE TYPE "TriggerType" AS ENUM ('WEBHOOK', 'SCHEDULE', 'INTAKE_CREATED', 'INTAKE_ASSIGNED', 'DOCUMENT_UPLOADED', 'DOCUMENT_PROCESSED', 'PIPELINE_STAGE_CHANGED', 'FORM_SUBMITTED', 'EMAIL_RECEIVED', 'API_CALL');
CREATE TYPE "TemplateCategory" AS ENUM ('LEAD_MANAGEMENT', 'CUSTOMER_ONBOARDING', 'REPORTING', 'NOTIFICATIONS', 'DATA_SYNC', 'CONTENT_PUBLISHING', 'INVOICING', 'SUPPORT_AUTOMATION', 'SALES_PIPELINE', 'MARKETING', 'HR_OPERATIONS', 'OTHER');
CREATE TYPE "IntegrationProvider" AS ENUM ('GMAIL', 'GOOGLE_SHEETS', 'GOOGLE_DRIVE', 'GOOGLE_CALENDAR', 'SLACK', 'MICROSOFT_TEAMS', 'OUTLOOK', 'HUBSPOT', 'SALESFORCE', 'STRIPE', 'PAYPAL', 'MAILCHIMP', 'SENDGRID', 'TWILIO', 'ZOOM', 'DROPBOX', 'TRELLO', 'ASANA', 'NOTION', 'AIRTABLE', 'WEBHOOK', 'HTTP_REQUEST', 'DATABASE', 'OPENAI', 'ANTHROPIC', 'OTHER');

-- CreateTable: Automation
CREATE TABLE "automations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "n8nWorkflowId" TEXT,
    "webhookUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "triggerType" "AutomationTrigger" NOT NULL,
    "triggerConfig" JSONB NOT NULL,
    "lastExecutedAt" TIMESTAMP(3),
    "executionCount" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "avgExecutionTime" DOUBLE PRECISION,
    "orgId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automations_pkey" PRIMARY KEY ("id")
);

-- CreateTable: WorkflowExecution
CREATE TABLE "workflow_executions" (
    "id" TEXT NOT NULL,
    "automationId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "n8nExecutionId" TEXT,
    "status" "ExecutionStatus" NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "executionTime" INTEGER,
    "triggerData" JSONB NOT NULL,
    "outputData" JSONB,
    "errorMessage" TEXT,
    "errorStack" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: WorkflowTrigger
CREATE TABLE "workflow_triggers" (
    "id" TEXT NOT NULL,
    "automationId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "triggerType" "TriggerType" NOT NULL,
    "triggerEvent" TEXT NOT NULL,
    "webhookUrl" TEXT,
    "cronSchedule" TEXT,
    "eventFilters" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastTriggeredAt" TIMESTAMP(3),
    "triggerCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_triggers_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AutomationTemplate
CREATE TABLE "automation_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "TemplateCategory" NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'beginner',
    "n8nWorkflowJson" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "demoVideoUrl" TEXT,
    "requiredIntegrations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isOfficial" BOOLEAN NOT NULL DEFAULT false,
    "publishedById" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable: IntegrationCredential
CREATE TABLE "integration_credentials" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "credentialName" TEXT NOT NULL,
    "credentialData" TEXT NOT NULL,
    "scope" TEXT,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes
CREATE INDEX "automations_orgId_isActive_idx" ON "automations"("orgId", "isActive");
CREATE INDEX "automations_triggerType_idx" ON "automations"("triggerType");
CREATE INDEX "automations_createdById_idx" ON "automations"("createdById");
CREATE INDEX "automations_createdAt_idx" ON "automations"("createdAt");

CREATE INDEX "workflow_executions_automationId_status_idx" ON "workflow_executions"("automationId", "status");
CREATE INDEX "workflow_executions_orgId_startedAt_idx" ON "workflow_executions"("orgId", "startedAt");
CREATE INDEX "workflow_executions_status_idx" ON "workflow_executions"("status");
CREATE INDEX "workflow_executions_createdAt_idx" ON "workflow_executions"("createdAt");

CREATE INDEX "workflow_triggers_automationId_isActive_idx" ON "workflow_triggers"("automationId", "isActive");
CREATE INDEX "workflow_triggers_orgId_idx" ON "workflow_triggers"("orgId");
CREATE INDEX "workflow_triggers_triggerType_idx" ON "workflow_triggers"("triggerType");

CREATE INDEX "automation_templates_category_idx" ON "automation_templates"("category");
CREATE INDEX "automation_templates_useCount_idx" ON "automation_templates"("useCount");
CREATE INDEX "automation_templates_rating_idx" ON "automation_templates"("rating");
CREATE INDEX "automation_templates_isOfficial_idx" ON "automation_templates"("isOfficial");

CREATE UNIQUE INDEX "integration_credentials_userId_provider_credentialName_key" ON "integration_credentials"("userId", "provider", "credentialName");
CREATE INDEX "integration_credentials_orgId_idx" ON "integration_credentials"("orgId");
CREATE INDEX "integration_credentials_userId_isActive_idx" ON "integration_credentials"("userId", "isActive");

-- AddForeignKeys
ALTER TABLE "automations" ADD CONSTRAINT "automations_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "automations" ADD CONSTRAINT "automations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "workflow_executions" ADD CONSTRAINT "workflow_executions_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "automations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "workflow_executions" ADD CONSTRAINT "workflow_executions_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "workflow_triggers" ADD CONSTRAINT "workflow_triggers_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "automations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "workflow_triggers" ADD CONSTRAINT "workflow_triggers_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "integration_credentials" ADD CONSTRAINT "integration_credentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "integration_credentials" ADD CONSTRAINT "integration_credentials_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

### Step 3: Apply Migration

```bash
# Development
npx prisma migrate dev

# Production (DO NOT RUN WITHOUT USER CONFIRMATION)
npx prisma migrate deploy
```

### Step 4: Generate Prisma Client

```bash
npx prisma generate
```

---

## Security Considerations

### 1. Credential Encryption

**Implementation**:
```typescript
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'); // 32 bytes

export function encryptCredentials(data: object): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return JSON.stringify({
    iv: iv.toString('hex'),
    data: encrypted,
    tag: authTag.toString('hex'),
  });
}

export function decryptCredentials(encryptedData: string): object {
  const { iv, data, tag } = JSON.parse(encryptedData);

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    ENCRYPTION_KEY,
    Buffer.from(iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(tag, 'hex'));

  let decrypted = decipher.update(data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return JSON.parse(decrypted);
}
```

**Key Management**:
- Encryption key stored in environment variable `ENCRYPTION_KEY`
- Key generated once: `openssl rand -hex 32`
- Key rotation requires re-encrypting all credentials

### 2. Webhook Security

**Signature Verification**:
```typescript
export function generateWebhookSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = generateWebhookSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

**Rate Limiting**:
- Max 100 webhook calls per minute per automation
- Exponential backoff on failures (2s, 4s, 8s)
- Circuit breaker pattern for failing automations

### 3. Access Control

**Row-Level Security**:
- All queries filtered by `orgId` from session
- Users can only access their organization's automations
- RBAC enforced at API layer:
  - ADMIN: Full automation management
  - OPERATOR: Create, view, execute automations
  - CLIENT: View-only access

---

## Performance Optimization

### 1. Database Indexes

All critical query paths are covered by indexes:
- Organization filtering: `[orgId, isActive]`
- Status filtering: `[status]`
- Time-based queries: `[startedAt]`, `[createdAt]`
- Composite indexes for common filters: `[automationId, status]`

### 2. Execution Tracking

**Metrics Pre-Calculation**:
- `executionCount`, `successCount`, `failureCount` updated atomically
- `avgExecutionTime` calculated incrementally (no aggregate queries)
- Dashboard stats cached in Redis for 60 seconds

**Example**:
```typescript
// Instead of: SELECT AVG(executionTime) FROM workflow_executions...
// Use pre-calculated: automation.avgExecutionTime

// Update formula (exponential moving average):
const alpha = 0.1; // Smoothing factor
automation.avgExecutionTime =
  (alpha * currentExecutionTime) +
  ((1 - alpha) * automation.avgExecutionTime);
```

### 3. Background Job Processing

**BullMQ Configuration**:
```typescript
const automationTriggersQueue = new Queue('automation-triggers', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
});
```

**Worker Concurrency**:
- Default: 10 concurrent jobs
- Adjustable based on server capacity
- Separate queues for different trigger types

---

## Monitoring & Observability

### Key Metrics

1. **Execution Health**:
   - Success rate (% of successful executions)
   - Average execution time
   - Error rate by automation

2. **System Health**:
   - Queue depth (pending jobs)
   - Processing latency (time in queue)
   - n8n API response time

3. **Business Metrics**:
   - Active automations per organization
   - Most-used templates
   - Total automation executions per day

### Dashboard Queries

**Success Rate Over Time**:
```sql
SELECT
  DATE_TRUNC('day', "startedAt") as day,
  COUNT(*) as total_executions,
  SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END) as successful,
  (SUM(CASE WHEN status = 'SUCCESS' THEN 1 ELSE 0 END)::float / COUNT(*) * 100) as success_rate
FROM workflow_executions
WHERE "orgId" = $1
  AND "startedAt" >= NOW() - INTERVAL '30 days'
GROUP BY day
ORDER BY day DESC;
```

**Slowest Automations**:
```sql
SELECT
  a.id,
  a.name,
  a."avgExecutionTime",
  a."executionCount"
FROM automations a
WHERE a."orgId" = $1
  AND a."executionCount" > 10
ORDER BY a."avgExecutionTime" DESC
LIMIT 10;
```

---

## Rollback Plan

If issues arise after migration:

1. **Immediate Rollback** (< 1 hour):
   ```bash
   npx prisma migrate resolve --rolled-back {migration_name}
   ```

2. **Data Preservation**:
   - All Phase 6 tables are new (no data loss risk)
   - Organization and Users tables only have new relations added
   - Can drop Phase 6 tables without affecting existing data

3. **Rollback SQL**:
   ```sql
   DROP TABLE IF EXISTS integration_credentials CASCADE;
   DROP TABLE IF EXISTS automation_templates CASCADE;
   DROP TABLE IF EXISTS workflow_triggers CASCADE;
   DROP TABLE IF EXISTS workflow_executions CASCADE;
   DROP TABLE IF EXISTS automations CASCADE;

   DROP TYPE IF EXISTS IntegrationProvider;
   DROP TYPE IF EXISTS TemplateCategory;
   DROP TYPE IF EXISTS TriggerType;
   DROP TYPE IF EXISTS ExecutionStatus;
   DROP TYPE IF EXISTS AutomationTrigger;
   ```

---

## File Locations

### Schema Files
- **Prisma Schema**: `/Users/gregorystarr/projects/astralis-nextjs/prisma/schema.prisma`
- **Migration Files**: `/Users/gregorystarr/projects/astralis-nextjs/prisma/migrations/`

### Service Files (To Be Created in Phase 6 Implementation)
- **n8n Service**: `src/lib/services/n8n.service.ts`
- **Automation Service**: `src/lib/services/automation.service.ts`
- **Integration Service**: `src/lib/services/integration.service.ts`
- **Webhook Service**: `src/lib/services/webhook.service.ts`

### API Routes (To Be Created)
- **Automation Management**: `src/app/api/automations/route.ts`
- **Webhook Handlers**: `src/app/api/webhooks/automation/[id]/route.ts`
- **Template Marketplace**: `src/app/api/automations/templates/route.ts`

### Background Workers (To Be Created)
- **Automation Processor**: `src/workers/processors/automation-processor.ts`
- **Queue Setup**: `src/workers/queues/automation-triggers.ts`

---

## Next Steps

1. **Review this architecture document** with the team
2. **Generate the migration**: `npx prisma migrate dev --name add_automation_tables`
3. **Inspect the generated SQL** in `prisma/migrations/` folder
4. **Run migration in development**: `npx prisma migrate dev`
5. **Generate Prisma Client**: `npx prisma generate`
6. **Verify tables created**: `psql` → `\dt automations`, `\d automations`
7. **Proceed to Phase 6 service implementation**

---

**END OF PHASE 6 DATABASE ARCHITECTURE DOCUMENT**

This document is complete and self-contained. Any developer can use this to understand the Phase 6 database design without requiring additional context.

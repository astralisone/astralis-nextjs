# Astralis One - Feature Documentation

**Version:** 1.0
**Last Updated:** December 2, 2025
**Platform:** Multi-Agent Engineering Operations Platform

---

## Table of Contents

1. [Overview](#overview)
2. [Feature Catalog](#feature-catalog)
   - [2.1 Multi-Agent AI Orchestration](#21-multi-agent-ai-orchestration)
   - [2.2 AI-Powered Intake Routing](#22-ai-powered-intake-routing)
   - [2.3 Document Processing & RAG Chat](#23-document-processing--rag-chat)
   - [2.4 AI Scheduling Agent](#24-ai-scheduling-agent)
   - [2.5 Pipeline Management (Kanban)](#25-pipeline-management-kanban)
   - [2.6 Automation Workflows (n8n)](#26-automation-workflows-n8n)
   - [2.7 Public Booking System](#27-public-booking-system)
   - [2.8 Calendar Integration](#28-calendar-integration)
   - [2.9 Team Management & RBAC](#29-team-management--rbac)
   - [2.10 Analytics & Monitoring](#210-analytics--monitoring)
3. [Feature Matrix](#3-feature-matrix)
4. [Configuration Guide](#4-configuration-guide)
5. [Integration Architecture](#5-integration-architecture)
6. [Roadmap](#6-roadmap)

---

## 1. Overview

Astralis One is an enterprise-grade multi-agent AI operations platform designed to automate, route, and manage complex business workflows. Built on Next.js 15 and powered by cutting-edge LLMs (Claude Sonnet 4.5 and GPT-4o), the platform provides intelligent automation for intake management, document processing, scheduling, and task orchestration.

### Platform Capabilities Summary

- **Intelligent Request Routing:** Automatically classifies and routes incoming requests to appropriate pipelines using LLM-powered analysis
- **Autonomous Scheduling:** Natural language scheduling with calendar conflict detection and automatic reminders
- **Document Intelligence:** OCR, embedding generation, and RAG-powered conversational document analysis
- **Workflow Automation:** Visual workflow builder with n8n integration for complex multi-step automations
- **Pipeline Management:** Kanban-style task boards with drag-and-drop, custom stages, and automation triggers
- **Multi-Tenant Architecture:** Full RBAC with organization-level isolation and user role management
- **Real-Time Processing:** Background job queue system (BullMQ + Redis) for async task processing
- **Public Booking Interface:** Client-facing scheduling pages with availability management

---

## 2. Feature Catalog

### 2.1 Multi-Agent AI Orchestration

**Location:** `src/lib/agent/`
**Database Models:** `OrchestrationAgent`, `AgentDecision`

#### Description

The OrchestrationAgent is the central nervous system of Astralis One. It uses LLM-powered decision-making to analyze inputs from multiple sources (webhooks, emails, database triggers, form submissions) and autonomously execute actions like routing requests, scheduling events, sending notifications, and triggering workflows.

#### Key Capabilities

- **Multi-LLM Decision Making**
  - Primary: Anthropic Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`)
  - Fallback: OpenAI GPT-4o (`gpt-4o`)
  - Automatic fallback on API failure for high availability

- **Event-Driven Architecture**
  - Subscribes to system events via EventBus
  - Listens for: `intake:created`, `webhook:form_submitted`, `email:received`, `pipeline:stage_changed`, `calendar:reminder_due`
  - Emits decisions: `agent:decision_made`, `intake:routing_failed`

- **Intelligent Action Execution**
  - Pipeline assignment with confidence scoring
  - Calendar event creation/modification
  - Notification dispatch (email, SMS)
  - Workflow automation triggers
  - Escalation handling for low-confidence decisions

- **Decision Confidence Thresholds**
  - Auto-execute threshold: 0.85 (high confidence)
  - Require approval threshold: 0.5-0.84 (medium confidence)
  - Reject threshold: <0.5 (low confidence)

- **Rate Limiting & Safety**
  - Configurable rate limits: 60 actions/minute, 500 actions/hour
  - Dry-run mode for testing
  - Complete audit trail of all decisions

#### Key Components

| Component | File | Purpose |
|-----------|------|---------|
| `OrchestrationAgent` | `core/OrchestrationAgent.ts` | Main agent coordinator |
| `DecisionEngine` | `core/DecisionEngine.ts` | Parses LLM responses, applies business rules |
| `ActionExecutor` | `core/ActionExecutor.ts` | Safe execution of agent actions |
| `AgentEventBus` | `inputs/EventBus.ts` | Event subscription and emission |
| `LLMFactory` | `core/LLMFactory.ts` | Multi-provider LLM client creation |
| `PipelineAssigner` | `actions/PipelineAssigner.ts` | Routes requests to pipelines |
| `CalendarManager` | `actions/CalendarManager.ts` | Calendar event management |
| `NotificationDispatcher` | `actions/NotificationDispatcher.ts` | Email/SMS notifications |
| `AutomationTrigger` | `actions/AutomationTrigger.ts` | Workflow automation triggers |

#### Configuration

```typescript
// Example OrchestrationAgent configuration
const agent = new OrchestrationAgent({
  orgId: 'org-123',
  llmProvider: LLMProvider.CLAUDE,
  llmModel: 'claude-sonnet-4-5-20250929',
  temperature: 0.3,
  autoExecuteThreshold: 0.85,
  requireApprovalThreshold: 0.5,
  enabledActions: [
    DecisionType.ASSIGN_PIPELINE,
    DecisionType.CREATE_EVENT,
    DecisionType.SEND_NOTIFICATION,
    DecisionType.TRIGGER_AUTOMATION,
  ],
  maxActionsPerMinute: 60,
  maxActionsPerHour: 500,
  notifyOnHighPriority: true,
  notifyOnFailure: true,
  escalationEmail: 'admin@example.com',
});
```

#### API Endpoints

- `POST /api/agent/process` - Process an input directly through the agent
- `GET /api/agent/decisions` - Retrieve decision history
- `POST /api/agent/decisions/:id/approve` - Approve a pending decision
- `POST /api/agent/decisions/:id/reject` - Reject a pending decision
- `GET /api/agent/stats` - Agent statistics and health metrics

#### Environment Variables

```bash
# LLM Configuration
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Agent Settings (optional overrides)
AGENT_AUTO_EXECUTE_THRESHOLD=0.85
AGENT_REQUIRE_APPROVAL_THRESHOLD=0.5
AGENT_MAX_ACTIONS_PER_MINUTE=60
AGENT_ESCALATION_EMAIL=admin@example.com
```

#### Monitoring

- Decision success rate tracked in `AgentStats`
- Failed decisions logged with error details
- Rate limit status exposed via API
- Real-time event processing metrics

---

### 2.2 AI-Powered Intake Routing

**Location:** `src/app/(app)/intakes/`, `src/workers/processors/intakeRouting.processor.ts`
**Database Models:** `intakeRequest`, `pipeline`, `pipelineStage`, `pipelineItem`

#### Description

Automatically classifies and routes incoming requests (forms, emails, API calls, chat) to the appropriate workflow pipeline. The OrchestrationAgent analyzes request content, extracts metadata (priority, category, urgency), and assigns it to the correct pipeline and stage based on organizational context.

#### Features

- **Multi-Source Intake Support**
  - Web forms (`FORM`)
  - Email inbox monitoring (`EMAIL`)
  - Chat/messaging integrations (`CHAT`)
  - Direct API submissions (`API`)
  - Phone call transcripts (`CALL`)

- **AI Classification**
  - Intent detection (sales inquiry, support ticket, billing issue, partnership request)
  - Priority scoring (1-5 scale)
  - Category extraction (technical, sales, billing, general)
  - Confidence scoring for routing decisions
  - Metadata enrichment (customer type, urgency level)

- **Smart Routing Logic**
  - Matches request characteristics to pipeline types
  - Considers historical patterns and team availability
  - Fallback to "General Intake" pipeline for low-confidence matches
  - User assignment based on current workload and expertise

- **Audit Trail**
  - Complete routing history stored in `aiRoutingMeta` JSON field
  - Confidence scores, reasoning, and alternative suggestions
  - Timestamped decision points

#### Flow Diagram

```
┌─────────────────┐
│ Request Source  │ (Form, Email, Chat, API)
└────────┬────────┘
         ↓
┌─────────────────┐
│ Create Intake   │ intakeRequest (status: NEW)
│ Request Record  │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Queue to Worker │ BullMQ: intakeRouting queue
└────────┬────────┘
         ↓
┌─────────────────┐
│ Emit Event      │ intake:created → EventBus
└────────┬────────┘
         ↓
┌─────────────────┐
│ OA Analyzes     │ LLM classifies content + context
└────────┬────────┘
         ↓
┌─────────────────┐
│ Decision        │ Assign to pipeline + stage
│ Execution       │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Create Pipeline │ pipelineItem created in stage
│ Item            │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Update Status   │ intakeRequest (status: ASSIGNED)
└─────────────────┘
```

#### Configuration

Routing behavior can be customized per organization:

```typescript
// Organization-level pipeline preferences
interface OrgSettings {
  defaultPipeline: string;        // Fallback pipeline ID
  autoAssignUsers: boolean;       // Auto-assign to team members
  requireManualReview: boolean;   // High-stakes intakes need approval
  escalationEmail: string;        // Notify on routing failures
}
```

#### API Endpoints

- `POST /api/intakes` - Create new intake request
- `GET /api/intakes` - List intake requests (with filters)
- `GET /api/intakes/:id` - View intake details
- `PUT /api/intakes/:id` - Update intake (override routing)
- `DELETE /api/intakes/:id` - Delete intake

#### Environment Variables

```bash
# Intake Routing Settings
INTAKE_AUTO_ROUTE=true
INTAKE_MIN_CONFIDENCE=0.5
INTAKE_DEFAULT_PRIORITY=3
```

#### UI Components

- **Intake Dashboard** (`/intakes`): List view with filters (status, source, priority)
- **Intake Detail** (`/intakes/:id`): Full request view with routing metadata
- **Manual Override**: Operators can manually reassign incorrectly routed intakes

---

### 2.3 Document Processing & RAG Chat

**Location:** `src/app/(app)/documents/`, `src/workers/processors/ocr.processor.ts`, `src/workers/processors/embedding.processor.ts`
**Database Models:** `Document`, `DocumentEmbedding`, `DocumentChat`

#### Description

Upload documents (PDF, images, Office files), extract text via OCR, generate embeddings, and chat with documents using Retrieval-Augmented Generation (RAG). Powered by Tesseract.js for OCR, OpenAI for embeddings, and Claude/GPT for conversational analysis.

#### Features

- **Multi-Format Document Support**
  - **Images:** PNG, JPG, JPEG, GIF, BMP, WEBP
  - **Documents:** PDF (multi-page)
  - **Office Files:** DOCX, XLSX, PPTX (via conversion)
  - **Text Files:** TXT, CSV, JSON, XML, Markdown

- **OCR Pipeline**
  - Tesseract.js for image-based text extraction
  - GPT-4 Vision for enhanced OCR on complex layouts (invoices, forms, receipts)
  - Confidence scoring per extracted text block
  - Language detection (supports 100+ languages)

- **Embedding Generation**
  - OpenAI `text-embedding-3-small` (1536 dimensions)
  - Chunking strategy: 1000 chars per chunk with 200-char overlap
  - Stored embeddings indexed by chunk for fast retrieval
  - Metadata: page number, section, confidence

- **RAG Chat Interface**
  - Contextual Q&A over document content
  - Source citations with page numbers
  - Multi-document conversations
  - Follow-up question handling
  - Export chat history

- **Document Management**
  - Upload to DigitalOcean Spaces (S3-compatible)
  - Thumbnail generation for visual preview
  - Version control (track document updates)
  - Tagging and categorization
  - Full-text search across all documents

#### Processing Flow

```
┌─────────────┐
│ File Upload │ → DigitalOcean Spaces
└──────┬──────┘
       ↓
┌─────────────┐
│ Queue OCR   │ → BullMQ: document-processing queue
└──────┬──────┘
       ↓
┌─────────────┐
│ OCR Extract │ → Tesseract.js / GPT-4 Vision
│ Text        │
└──────┬──────┘
       ↓
┌─────────────┐
│ Save OCR    │ → Document.ocrText (DB)
│ Results     │
└──────┬──────┘
       ↓
┌─────────────┐
│ Queue       │ → BullMQ: document-embedding queue
│ Embeddings  │
└──────┬──────┘
       ↓
┌─────────────┐
│ Generate    │ → OpenAI embeddings API
│ Embeddings  │
└──────┬──────┘
       ↓
┌─────────────┐
│ Store       │ → DocumentEmbedding (DB)
│ Vectors     │
└──────┬──────┘
       ↓
┌─────────────┐
│ Ready for   │ → Status: COMPLETED
│ Chat        │
└─────────────┘
```

#### API Endpoints

- `POST /api/documents/upload` - Upload document
- `GET /api/documents` - List documents
- `GET /api/documents/:id` - Document details
- `DELETE /api/documents/:id` - Delete document
- `POST /api/documents/:id/chat` - Chat with document (RAG)
- `GET /api/documents/:id/chats` - List chat sessions
- `GET /api/documents/:id/download` - Download original file

#### Environment Variables

```bash
# DigitalOcean Spaces (S3-compatible storage)
SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
SPACES_BUCKET=astralis-documents
SPACES_ACCESS_KEY=DO00...
SPACES_SECRET_KEY=...

# OpenAI (for embeddings and GPT-4 Vision)
OPENAI_API_KEY=sk-...

# OCR Settings
OCR_LANGUAGE=eng
OCR_CONFIDENCE_THRESHOLD=0.7
```

#### UI Components

- **Document Library** (`/documents`): Grid/list view with upload button
- **Document Viewer** (`/documents/:id`): Preview with OCR overlay
- **Chat Interface** (`/documents/:id/chat`): Conversational Q&A panel with source citations

#### Performance Considerations

- **Large Files:** Documents >10MB are chunked and processed incrementally
- **OCR Queue:** Processes 5 documents concurrently to prevent API rate limits
- **Embedding Batching:** Groups chunks into batches of 100 for API efficiency
- **Caching:** Embeddings cached indefinitely; OCR results cached for 30 days

---

### 2.4 AI Scheduling Agent

**Location:** `src/app/(app)/scheduling/`, `src/workers/processors/schedulingAgent.processor.ts`, `src/workers/processors/schedulingReminder.processor.ts`
**Database Models:** `SchedulingAgentTask`, `SchedulingEvent`, `EventReminder`, `AvailabilityRule`

#### Description

Natural language scheduling assistant that understands requests like "Schedule a meeting with John next Tuesday at 2pm" and autonomously handles calendar operations. Integrates with Google Calendar, detects conflicts, and sends automated reminders.

#### Features

- **Natural Language Processing**
  - Intent detection: SCHEDULE_MEETING, RESCHEDULE_MEETING, CANCEL_MEETING, CHECK_AVAILABILITY
  - Entity extraction: date, time, duration, participants, subject, location
  - Multi-turn conversations for clarification
  - Support for relative dates ("next week", "tomorrow afternoon")

- **Intelligent Time Slot Suggestions**
  - Analyzes availability rules (working hours, blocked dates)
  - Checks existing events for conflicts
  - Respects user preferences (meeting duration, buffer times)
  - Proposes 3-5 alternative slots on conflict

- **Conflict Detection**
  - Real-time calendar event checking
  - Overlap detection with existing meetings
  - Buffer time enforcement (e.g., 15-min break between meetings)
  - Timezone-aware scheduling

- **Automated Reminders**
  - Email notifications: 24 hours before, 2 hours before
  - SMS reminders (optional, via Twilio)
  - Configurable reminder schedule per user
  - Retry logic on delivery failure

- **Calendar Integration**
  - Google Calendar bidirectional sync
  - ICS file generation for calendar imports
  - Event updates propagate to all attendees
  - Cancellation notifications

#### Processing Flow

```
┌─────────────────┐
│ User Request    │ "Schedule a demo next week with Alice"
└────────┬────────┘
         ↓
┌─────────────────┐
│ Create Task     │ SchedulingAgentTask (status: PENDING)
└────────┬────────┘
         ↓
┌─────────────────┐
│ Queue Task      │ BullMQ: schedulingAgent queue
└────────┬────────┘
         ↓
┌─────────────────┐
│ OA Analyzes     │ Extract intent + entities
└────────┬────────┘
         ↓
┌─────────────────┐
│ Check           │ Query AvailabilityRule + SchedulingEvent
│ Availability    │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Propose Slots   │ Return 3-5 available time slots
└────────┬────────┘
         ↓
┌─────────────────┐
│ User Confirms   │ Select preferred slot
└────────┬────────┘
         ↓
┌─────────────────┐
│ Create Event    │ SchedulingEvent (status: SCHEDULED)
└────────┬────────┘
         ↓
┌─────────────────┐
│ Create          │ EventReminder (24h, 2h before)
│ Reminders       │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Send            │ Email confirmation with ICS attachment
│ Confirmation    │
└─────────────────┘
```

#### API Endpoints

- `POST /api/scheduling/tasks` - Create scheduling task (natural language input)
- `GET /api/scheduling/tasks` - List scheduling tasks
- `GET /api/scheduling/tasks/:id` - Task details
- `POST /api/scheduling/tasks/:id/confirm` - Confirm selected time slot
- `GET /api/scheduling/events` - List scheduled events
- `PUT /api/scheduling/events/:id` - Update event
- `DELETE /api/scheduling/events/:id` - Cancel event
- `GET /api/scheduling/availability` - Check user availability

#### Environment Variables

```bash
# Google Calendar Integration
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:3001/api/calendar/callback

# Twilio (for SMS reminders - optional)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890

# Reminder Settings
REMINDER_24H_ENABLED=true
REMINDER_2H_ENABLED=true
REMINDER_RETRY_MAX=3
```

#### UI Components

- **Scheduling Dashboard** (`/scheduling`): Natural language input + task list
- **Calendar View** (`/calendar-chat`): FullCalendar with drag-and-drop rescheduling
- **Availability Settings** (`/settings/availability`): Configure working hours and blocked dates

---

### 2.5 Pipeline Management (Kanban)

**Location:** `src/app/(app)/pipelines/`
**Database Models:** `pipeline`, `pipelineStage`, `pipelineItem`, `Task`, `TaskTemplate`

#### Description

Visual kanban-style workflow management with customizable pipelines for different business processes (sales, support, billing, operations). Features drag-and-drop task movement, custom stages, automation triggers, and due date tracking.

#### Features

- **Multiple Pipeline Types**
  - **Sales Pipeline:** Lead → Qualified → Proposal → Negotiation → Closed Won/Lost
  - **Support Pipeline:** New Ticket → In Progress → Awaiting Customer → Resolved
  - **Billing Pipeline:** Invoice Created → Sent → Overdue → Paid
  - **Custom Pipelines:** Define stages specific to your workflow

- **Kanban Board Interface**
  - Drag-and-drop card movement between stages
  - Inline editing of task details
  - Color-coded priority levels (1-5)
  - Visual progress indicators
  - Filtering by assignee, due date, tags

- **Task Management**
  - Rich text descriptions with Markdown support
  - File attachments (linked to documents)
  - Comments and activity feed
  - Due date tracking with overdue alerts
  - Subtasks and checklists
  - Time tracking (optional)

- **Automation Triggers**
  - Stage change webhooks (trigger n8n workflows)
  - Auto-assignment rules based on team workload
  - SLA monitoring with breach alerts
  - Status change notifications

- **Pipeline Templates**
  - Pre-built templates for common workflows
  - Clone pipelines across organizations
  - Stage customization (add/remove/reorder)
  - Default assignees per stage

#### Database Schema

```typescript
// Pipeline structure
pipeline
├── pipelineStage (ordered by stage.order)
│   └── pipelineItem (tasks in this stage)
│       ├── title: string
│       ├── description: string
│       ├── priority: number (1-5)
│       ├── status: enum (NOT_STARTED, IN_PROGRESS, BLOCKED, DONE)
│       ├── dueDate: Date
│       ├── assignedToId: string (user ID)
│       └── data: JSON (custom fields)
```

#### API Endpoints

- `GET /api/pipelines` - List pipelines
- `POST /api/pipelines` - Create pipeline
- `GET /api/pipelines/:id` - Pipeline details with stages and items
- `PUT /api/pipelines/:id` - Update pipeline
- `DELETE /api/pipelines/:id` - Delete pipeline
- `POST /api/pipelines/:id/stages` - Add stage
- `POST /api/pipelines/:id/items` - Create task/item
- `PUT /api/pipelines/items/:id` - Update item (move stage, assign, etc.)
- `DELETE /api/pipelines/items/:id` - Delete item

#### Environment Variables

```bash
# Pipeline Settings
PIPELINE_MAX_ITEMS_PER_STAGE=100
PIPELINE_ENABLE_AUTOMATION_TRIGGERS=true
PIPELINE_SLA_MONITORING=true
```

#### UI Components

- **Pipeline List** (`/pipelines`): Grid view of all pipelines with quick stats
- **Pipeline Board** (`/pipelines/:id`): Full kanban view with drag-and-drop
- **Task Detail Modal**: Slide-out panel with full task information
- **Pipeline Settings**: Configure stages, automation rules, templates

#### Integration Points

- **Intake Routing:** Intakes auto-create pipeline items in assigned pipeline
- **Automation:** Stage changes trigger n8n workflows
- **Analytics:** Pipeline metrics feed into dashboard widgets

---

### 2.6 Automation Workflows (n8n)

**Location:** `src/app/(app)/automations/`, `src/lib/agent/webhooks/`
**Database Models:** `Automation`, `WorkflowExecution`, `WorkflowTrigger`, `AutomationTemplate`

#### Description

Visual workflow automation system powered by n8n. Build multi-step workflows with a drag-and-drop editor, connect to 300+ services, and automate repetitive tasks. Workflows can be triggered by webhooks, schedules, or database events.

#### Features

- **Visual Workflow Builder**
  - n8n-powered editor (hosted separately at `automation.astralisone.com`)
  - 300+ pre-built integrations (Google Workspace, Slack, Salesforce, Stripe, etc.)
  - Conditional branching (if/else logic)
  - Loops and iteration over data
  - Data transformation (JSON, XML, CSV)
  - Error handling with retries

- **Trigger Types**
  - **Webhook:** HTTP POST triggers from Astralis events
  - **Schedule:** Cron-based recurring workflows (hourly, daily, weekly)
  - **Database Events:** `INTAKE_CREATED`, `DOCUMENT_PROCESSED`, `PIPELINE_STAGE_CHANGED`, `FORM_SUBMITTED`
  - **Manual:** User-initiated workflow runs

- **Pre-Built Templates**
  - **Lead Enrichment:** New intake → Lookup in CRM → Update pipeline
  - **Invoice Automation:** Pipeline stage "Closed Won" → Generate invoice → Email client
  - **Support Escalation:** Ticket overdue → Notify manager → Create Slack alert
  - **Document Processing:** Document uploaded → OCR → Extract data → Update database
  - **Customer Onboarding:** New client → Create accounts → Send welcome email → Schedule kickoff

- **Execution Tracking**
  - Real-time execution logs with step-by-step details
  - Success/failure metrics per workflow
  - Average execution time tracking
  - Error notifications via email/Slack
  - Retry logic for transient failures (up to 3 retries)

- **Credential Management**
  - Encrypted storage of API keys and OAuth tokens
  - Per-user credential isolation
  - Credential expiration monitoring
  - Secure credential sharing across workflows

#### Workflow Architecture

```
┌─────────────────┐
│ Astralis Event  │ (e.g., intake:created)
└────────┬────────┘
         ↓
┌─────────────────┐
│ Emit Webhook    │ POST to n8n webhook URL
│ to n8n          │
└────────┬────────┘
         ↓
┌─────────────────┐
│ n8n Workflow    │ Process data through nodes
│ Execution       │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Log Execution   │ WorkflowExecution record
│ in Database     │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Update Stats    │ Success/failure counters
└─────────────────┘
```

#### API Endpoints

- `GET /api/automations` - List automations
- `POST /api/automations` - Create automation
- `GET /api/automations/:id` - Automation details
- `PUT /api/automations/:id` - Update automation
- `DELETE /api/automations/:id` - Delete automation
- `POST /api/automations/:id/execute` - Manually trigger workflow
- `GET /api/automations/:id/executions` - Execution history
- `GET /api/automations/templates` - Browse template marketplace

#### Environment Variables

```bash
# n8n Integration
N8N_WEBHOOK_URL=https://automation.astralisone.com
N8N_API_KEY=...
N8N_WEBHOOK_SECRET=...

# Execution Settings
AUTOMATION_MAX_RETRIES=3
AUTOMATION_TIMEOUT_MS=300000
AUTOMATION_ENABLE_ERROR_NOTIFICATIONS=true
```

#### UI Components

- **Automation List** (`/automations`): Table view with execution stats
- **Automation Detail** (`/automations/:id`): View/edit workflow, execution logs
- **Template Marketplace** (`/automations/templates`): Browse and install templates
- **Execution Logs** (`/automations/:id/executions`): Detailed step-by-step logs

#### Integration Points

- **OrchestrationAgent:** Agent can trigger workflows via `TRIGGER_AUTOMATION` action
- **Pipelines:** Stage changes emit events to n8n webhooks
- **Documents:** Document processing triggers OCR workflows
- **Webhooks:** External services can trigger workflows via authenticated webhook endpoints

---

### 2.7 Public Booking System

**Location:** `src/app/book/[userId]/`
**Database Models:** `audit_bookings`, `audit_availability`, `audit_blocked_dates`, `audit_notifications`, `AvailabilityRule`

#### Description

Client-facing booking pages where external users can schedule appointments without creating an account. Each team member gets a personalized booking link (`/book/[userId]`) with their availability, which can be shared via email signature, website, or social media.

#### Features

- **Personalized Booking Pages**
  - Public URLs: `https://app.astralisone.com/book/[userId]`
  - Custom branding (user avatar, bio, organization logo)
  - No login required for clients
  - Mobile-responsive design

- **Availability Management**
  - Weekly recurring availability (e.g., Mon-Fri 9am-5pm)
  - Blocked dates for vacations/holidays
  - Buffer time between meetings (e.g., 15-min break)
  - Timezone conversion for international clients
  - Maximum bookings per day/week

- **Booking Form**
  - Collects: Name, email, phone, company, meeting type, notes
  - Custom questions per booking type (e.g., "What's your budget?")
  - File attachment support (e.g., upload RFP document)
  - Booking confirmation page with meeting details

- **Email Confirmations**
  - Immediate confirmation email to client
  - Notification email to team member
  - ICS calendar file attachment for easy import
  - Includes meeting details, timezone, and cancellation link

- **Reminder System**
  - 24-hour reminder email
  - 2-hour reminder email (optional SMS via Twilio)
  - Configurable reminder schedule per user
  - Automatic retry on delivery failure

- **Cancellation & Rescheduling**
  - Self-service cancellation via email link
  - Reschedule requests trigger new availability check
  - Cancellation notifications to both parties

#### Booking Flow

```
┌─────────────────┐
│ Client Visits   │ /book/[userId]
│ Booking Page    │
└────────┬────────┘
         ↓
┌─────────────────┐
│ View Available  │ Calendar with open slots
│ Time Slots      │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Select Slot &   │ Fill out booking form
│ Submit Form     │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Create Booking  │ audit_bookings (status: SCHEDULED)
└────────┬────────┘
         ↓
┌─────────────────┐
│ Send            │ Email with ICS attachment
│ Confirmation    │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Schedule        │ EventReminder (24h, 2h before)
│ Reminders       │
└─────────────────┘
```

#### API Endpoints

- `GET /api/booking/:userId/availability` - Fetch available time slots
- `POST /api/booking/:userId/book` - Create booking
- `GET /api/booking/:id` - Booking details
- `PUT /api/booking/:id/cancel` - Cancel booking
- `POST /api/booking/:id/reschedule` - Request reschedule

#### Environment Variables

```bash
# Booking System Settings
BOOKING_DEFAULT_DURATION=60
BOOKING_BUFFER_MINUTES=15
BOOKING_MAX_PER_DAY=8
BOOKING_ALLOW_SAME_DAY=false

# Email Notifications
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG...
SMTP_FROM_EMAIL=bookings@astralisone.com
SMTP_FROM_NAME="Astralis Bookings"

# SMS Reminders (optional)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890
```

#### UI Components

- **Booking Page** (`/book/[userId]`): Public-facing scheduling interface
- **Calendar Selector**: Interactive date/time picker with availability visualization
- **Booking Form**: Multi-step form with validation
- **Confirmation Page**: Success message with meeting details

#### Admin Features

- **Booking Dashboard** (`/bookings`): View all bookings for your account
- **Availability Settings** (`/settings/availability`): Configure working hours, blocked dates
- **Booking Templates** (`/settings/booking-types`): Create different meeting types (demo, consultation, support call)

---

### 2.8 Calendar Integration

**Location:** `src/app/(app)/calendar-chat/`, `src/workers/processors/calendarSync.processor.ts`
**Database Models:** `CalendarConnection`, `calendar_integrations`, `SchedulingEvent`

#### Description

Bidirectional sync with Google Calendar, ICS file generation, and calendar event management. Events created in Astralis are pushed to external calendars, and external calendar updates sync back to Astralis.

#### Features

- **Provider Support**
  - **Google Calendar:** Full OAuth2 integration with read/write access
  - **Outlook Calendar:** Microsoft Graph API integration
  - **Apple Calendar:** iCloud CalDAV sync (coming soon)
  - **Generic ICS:** Export to any calendar app via `.ics` files

- **Bidirectional Sync**
  - Events created in Astralis → Push to Google Calendar
  - Events created in Google Calendar → Pull into Astralis (if configured)
  - Event updates (time, description, attendees) sync automatically
  - Conflict detection prevents duplicate events

- **Event Management**
  - Create, update, delete calendar events
  - Recurring events (daily, weekly, monthly)
  - Attendee management with RSVP tracking
  - Meeting links (Zoom, Google Meet, Microsoft Teams)
  - Attachments and notes

- **ICS File Generation**
  - Standard iCalendar format (RFC 5545)
  - Includes timezone information
  - Supports all-day events and recurring patterns
  - Downloadable or email attachment

- **Conflict Detection**
  - Real-time availability checking
  - Overlapping event detection
  - Buffer time enforcement
  - Busy/free status visualization

#### Sync Architecture

```
┌─────────────────┐
│ Astralis Event  │ Create/Update SchedulingEvent
└────────┬────────┘
         ↓
┌─────────────────┐
│ Queue Sync Job  │ BullMQ: calendarSync queue
└────────┬────────┘
         ↓
┌─────────────────┐
│ Check           │ Query CalendarConnection for tokens
│ Integration     │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Google Calendar │ POST to Google Calendar API
│ API Call        │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Store External  │ calendarEventId in SchedulingEvent
│ Event ID        │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Update Status   │ calendarIntegrationData JSON
└─────────────────┘
```

#### API Endpoints

- `GET /api/calendar/connections` - List connected calendars
- `POST /api/calendar/connect/google` - Initiate Google Calendar OAuth
- `GET /api/calendar/callback` - OAuth callback handler
- `DELETE /api/calendar/connections/:id` - Disconnect calendar
- `POST /api/calendar/sync` - Manual sync trigger
- `GET /api/calendar/events` - List calendar events
- `POST /api/calendar/events` - Create event
- `PUT /api/calendar/events/:id` - Update event
- `DELETE /api/calendar/events/:id` - Delete event
- `GET /api/calendar/availability` - Check availability

#### Environment Variables

```bash
# Google Calendar OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:3001/api/calendar/callback

# Microsoft Outlook OAuth
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...
MICROSOFT_REDIRECT_URI=http://localhost:3001/api/calendar/microsoft/callback

# Sync Settings
CALENDAR_SYNC_INTERVAL_MINUTES=15
CALENDAR_SYNC_DAYS_PAST=30
CALENDAR_SYNC_DAYS_FUTURE=90
```

#### UI Components

- **Calendar View** (`/calendar-chat`): FullCalendar with month/week/day views
- **Event Detail Modal**: View/edit event details
- **Calendar Settings** (`/settings/calendar`): Connect/disconnect calendars, sync preferences

---

### 2.9 Team Management & RBAC

**Location:** `src/app/(app)/settings/`
**Database Models:** `users`, `organization`, `Account`, `Session`

#### Description

Multi-tenant organization management with role-based access control (RBAC). Users are isolated by organization, and permissions are enforced based on role assignments.

#### Features

- **User Roles**
  - **ADMIN:** Full system access, user management, organization settings
  - **OPERATOR:** Manage pipelines, intakes, automations
  - **PM (Project Manager):** View pipelines, assign tasks, track progress
  - **CLIENT:** Limited read-only access to assigned projects
  - **USER:** Basic access, can view own tasks and documents

- **Organization Management**
  - Create and manage organizations
  - Organization-level settings (timezone, branding, quotas)
  - User invitations via email with role assignment
  - Organization transfer and ownership management

- **Permission Enforcement**
  - API-level permission checks on all endpoints
  - UI components conditionally rendered based on role
  - Middleware-based route protection
  - Audit logging of permission changes

- **User Profile Management**
  - Name, email, avatar
  - Timezone and language preferences
  - Notification settings (email, SMS, in-app)
  - API key generation for integrations

- **Invitation System**
  - Email invitations with role pre-assignment
  - Single-use invitation tokens (expires in 7 days)
  - Accept/decline invitation workflow
  - Invitation status tracking (pending, accepted, expired)

#### Database Schema

```typescript
// Multi-tenant structure
organization
├── users[] (all users in this org)
├── pipelines[]
├── intakeRequests[]
├── documents[]
├── automations[]
└── schedulingEvents[]

// User roles
enum UserRole {
  ADMIN,
  OPERATOR,
  PM,
  CLIENT,
  USER
}
```

#### API Endpoints

- `GET /api/users` - List users (filtered by org)
- `POST /api/users/invite` - Send user invitation
- `GET /api/users/:id` - User profile
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user
- `GET /api/organizations` - List organizations
- `POST /api/organizations` - Create organization
- `PUT /api/organizations/:id` - Update organization settings

#### Environment Variables

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3001

# Email Invitations
INVITATION_FROM_EMAIL=invites@astralisone.com
INVITATION_EXPIRY_DAYS=7
```

#### UI Components

- **User List** (`/settings/users`): Table view with role management
- **User Profile** (`/settings/profile`): Edit personal settings
- **Organization Settings** (`/settings/organization`): Org-level configuration

#### Permission Matrix

| Action | ADMIN | OPERATOR | PM | CLIENT | USER |
|--------|-------|----------|-----|--------|------|
| Create users | ✓ | ✗ | ✗ | ✗ | ✗ |
| Manage pipelines | ✓ | ✓ | ✗ | ✗ | ✗ |
| Assign tasks | ✓ | ✓ | ✓ | ✗ | ✗ |
| Upload documents | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create automations | ✓ | ✓ | ✗ | ✗ | ✗ |
| View analytics | ✓ | ✓ | ✓ | ✗ | ✗ |

---

### 2.10 Analytics & Monitoring

**Location:** `src/app/(app)/dashboard/`
**Database Models:** `ActivityLog`, `AuditLog`, `AgentDecision`

#### Description

Platform analytics dashboard with key performance metrics, agent decision statistics, worker health monitoring, and activity logs.

#### Features

- **Dashboard Widgets**
  - **Intake Stats:** Total requests, new this week, routing success rate
  - **Pipeline Metrics:** Active pipelines, tasks in progress, completion rate
  - **Agent Decisions:** Total decisions, success rate, avg confidence score
  - **Document Processing:** Documents processed, OCR success rate, storage usage
  - **Calendar Events:** Upcoming events, meeting utilization rate
  - **Automation Executions:** Workflow runs, success rate, avg execution time

- **Agent Decision Analytics**
  - Decision history with confidence scores
  - Success/failure breakdown by decision type
  - LLM provider performance (Claude vs. OpenAI)
  - Average decision time
  - Manual override rate

- **Worker Health Monitoring**
  - Queue depth (jobs waiting in BullMQ)
  - Processing rate (jobs/minute)
  - Failed job count with retry status
  - Worker uptime and restart count
  - Redis connection status

- **Activity Logs**
  - User actions (login, create, update, delete)
  - Audit trail with timestamps and IP addresses
  - Export logs to CSV for compliance
  - Retention policy: 90 days

- **Google Analytics Integration**
  - Page view tracking
  - Event tracking (form submissions, document uploads)
  - Conversion tracking (bookings, pipeline completions)
  - Custom dimensions for user roles and organizations

- **Google Ads Tracking**
  - Conversion tracking for marketing campaigns
  - ROI calculation for ad spend
  - Attribution modeling

#### Dashboard Metrics

```typescript
interface DashboardStats {
  intakes: {
    total: number;
    new: number;
    routingSuccessRate: number;
  };
  pipelines: {
    active: number;
    totalItems: number;
    completionRate: number;
  };
  documents: {
    total: number;
    processed: number;
    storageUsedMB: number;
  };
  agent: {
    totalDecisions: number;
    successRate: number;
    avgConfidence: number;
    avgDecisionTimeMs: number;
  };
  workers: {
    queueDepth: number;
    processingRate: number;
    failedJobs: number;
  };
}
```

#### API Endpoints

- `GET /api/analytics/dashboard` - Dashboard stats
- `GET /api/analytics/agent-decisions` - Agent decision history
- `GET /api/analytics/worker-health` - Worker status
- `GET /api/analytics/activity-logs` - Activity log feed
- `GET /api/analytics/export` - Export analytics data (CSV/JSON)

#### Environment Variables

```bash
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...
GOOGLE_ANALYTICS_VIEW_ID=...

# Google Ads
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-...
GOOGLE_ADS_CONVERSION_LABEL=...

# Analytics Settings
ANALYTICS_RETENTION_DAYS=90
ANALYTICS_EXPORT_ENABLED=true
```

#### UI Components

- **Dashboard** (`/dashboard`): Main analytics view with widget grid
- **Agent Insights** (`/analytics/agent`): Deep dive into agent performance
- **Worker Health** (`/analytics/workers`): Queue and worker monitoring
- **Activity Feed** (`/analytics/activity`): Real-time activity log stream

---

## 3. Feature Matrix

Mapping of features to user roles and availability across Astralis One.

### Feature Availability by Role

| Feature | Description | ADMIN | OPERATOR | PM | CLIENT | USER |
|---------|-------------|-------|----------|-----|--------|------|
| **Multi-Agent Orchestration** | LLM-powered decision-making | View | View | ✗ | ✗ | ✗ |
| **Intake Routing** | AI-powered request classification | Full | Full | View | ✗ | ✗ |
| **Document Processing** | OCR + RAG chat | Full | Full | Full | View assigned | View assigned |
| **AI Scheduling** | Natural language calendar management | Full | Full | Full | Request only | Request only |
| **Pipeline Management** | Kanban boards | Full | Full | View/Edit | View assigned | View assigned |
| **Automation Workflows** | n8n integration | Full | Full | ✗ | ✗ | ✗ |
| **Public Booking** | Client-facing scheduling | Configure | Configure | ✗ | ✗ | ✗ |
| **Calendar Integration** | Google Calendar sync | Full | Full | Full | ✗ | Own calendar |
| **Team Management** | User and role management | Full | ✗ | ✗ | ✗ | ✗ |
| **Analytics Dashboard** | Platform metrics | Full | Full | View | ✗ | ✗ |

### Feature Maturity Status

| Feature | Status | Notes |
|---------|--------|-------|
| Multi-Agent Orchestration | ✅ Production | Full Claude + OpenAI fallback |
| Intake Routing | ✅ Production | Tested with 100+ intakes |
| Document Processing | ✅ Production | Supports PDF, images, Office files |
| AI Scheduling | ✅ Production | Google Calendar integration complete |
| Pipeline Management | ✅ Production | Drag-and-drop, custom stages |
| Automation Workflows | ✅ Production | n8n integration tested |
| Public Booking | ✅ Production | Email confirmations + reminders |
| Calendar Integration | ✅ Production | Google Calendar bidirectional sync |
| Team Management | ✅ Production | RBAC enforced across platform |
| Analytics Dashboard | ✅ Production | Real-time metrics |

---

## 4. Configuration Guide

### Required Environment Variables

```bash
# ============================================
# Core Application
# ============================================
NODE_ENV=production
PORT=3001
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=https://app.astralisone.com

# ============================================
# Database
# ============================================
DATABASE_URL=postgresql://user:password@host:5432/astralis_db

# ============================================
# Redis (for BullMQ workers)
# ============================================
REDIS_URL=redis://localhost:6379

# ============================================
# AI APIs
# ============================================
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# ============================================
# File Storage (DigitalOcean Spaces)
# ============================================
SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
SPACES_BUCKET=astralis-documents
SPACES_ACCESS_KEY=DO00...
SPACES_SECRET_KEY=...

# ============================================
# Email (SMTP)
# ============================================
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG...
SMTP_FROM_EMAIL=noreply@astralisone.com
SMTP_FROM_NAME="Astralis"

# ============================================
# Google Calendar Integration
# ============================================
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:3001/api/calendar/callback

# ============================================
# n8n Automation
# ============================================
N8N_WEBHOOK_URL=https://automation.astralisone.com
N8N_API_KEY=...
N8N_WEBHOOK_SECRET=...

# ============================================
# Analytics
# ============================================
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-...

# ============================================
# Optional: SMS Reminders (Twilio)
# ============================================
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890
```

### Optional Environment Variables

```bash
# Agent Configuration
AGENT_AUTO_EXECUTE_THRESHOLD=0.85
AGENT_REQUIRE_APPROVAL_THRESHOLD=0.5
AGENT_MAX_ACTIONS_PER_MINUTE=60
AGENT_ESCALATION_EMAIL=admin@example.com

# Intake Routing
INTAKE_AUTO_ROUTE=true
INTAKE_MIN_CONFIDENCE=0.5
INTAKE_DEFAULT_PRIORITY=3

# Document Processing
OCR_LANGUAGE=eng
OCR_CONFIDENCE_THRESHOLD=0.7

# Booking System
BOOKING_DEFAULT_DURATION=60
BOOKING_BUFFER_MINUTES=15
BOOKING_MAX_PER_DAY=8
BOOKING_ALLOW_SAME_DAY=false

# Calendar Sync
CALENDAR_SYNC_INTERVAL_MINUTES=15
CALENDAR_SYNC_DAYS_PAST=30
CALENDAR_SYNC_DAYS_FUTURE=90

# Automation
AUTOMATION_MAX_RETRIES=3
AUTOMATION_TIMEOUT_MS=300000
AUTOMATION_ENABLE_ERROR_NOTIFICATIONS=true

# Analytics
ANALYTICS_RETENTION_DAYS=90
ANALYTICS_EXPORT_ENABLED=true
```

### Feature Flags

Enable/disable features at runtime:

```bash
# Feature Flags
FEATURE_AGENT_ORCHESTRATION=true
FEATURE_INTAKE_ROUTING=true
FEATURE_DOCUMENT_PROCESSING=true
FEATURE_AI_SCHEDULING=true
FEATURE_PUBLIC_BOOKING=true
FEATURE_CALENDAR_INTEGRATION=true
FEATURE_N8N_AUTOMATION=true
FEATURE_SMS_REMINDERS=false
```

---

## 5. Integration Architecture

### System-Wide Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         Astralis One Platform                     │
│                                                                   │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐    │
│  │   Next.js   │◄────►│   Prisma    │◄────►│ PostgreSQL  │    │
│  │  App Router │      │     ORM     │      │  (89 models)│    │
│  └──────┬──────┘      └─────────────┘      └─────────────┘    │
│         │                                                        │
│         ↓                                                        │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              OrchestrationAgent                     │       │
│  │  ┌──────────┐   ┌──────────┐   ┌──────────┐       │       │
│  │  │ Claude   │◄─►│ OpenAI   │◄─►│ Decision │       │       │
│  │  │ Sonnet   │   │ GPT-4o   │   │ Engine   │       │       │
│  │  └──────────┘   └──────────┘   └──────────┘       │       │
│  └─────────────────────────────────────────────────────┘       │
│         │                                                        │
│         ↓                                                        │
│  ┌─────────────────────────────────────────────────────┐       │
│  │                 BullMQ Workers                      │       │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐           │       │
│  │  │  Intake  │ │ Document │ │  Calendar│           │       │
│  │  │  Routing │ │    OCR   │ │   Sync   │           │       │
│  │  └──────────┘ └──────────┘ └──────────┘           │       │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐           │       │
│  │  │ Embedding│ │Scheduling│ │    SLA   │           │       │
│  │  │Generator │ │ Reminders│ │  Monitor │           │       │
│  │  └──────────┘ └──────────┘ └──────────┘           │       │
│  └─────────────────────────────────────────────────────┘       │
│         ↑                                                        │
│         │                                                        │
│  ┌──────┴──────┐                                                │
│  │    Redis    │ (Job Queue + Event Bus)                       │
│  └─────────────┘                                                │
└─────────────────────────────────────────────────────────────────┘
         ↑                           ↑
         │                           │
┌────────┴────────┐         ┌───────┴────────┐
│   External APIs  │         │   n8n Workflows│
│  - Google Cal    │         │   (Automations)│
│  - OpenAI        │         └────────────────┘
│  - Anthropic     │
│  - Twilio        │
│  - DO Spaces     │
└──────────────────┘
```

### Event Flow Example: Intake → Pipeline Assignment

```
1. User submits form on website
   ↓
2. POST /api/intakes (create intakeRequest)
   ↓
3. Emit event: intake:created → EventBus
   ↓
4. OrchestrationAgent receives event
   ↓
5. LLM analyzes content + organization context
   ↓
6. Decision: ASSIGN_PIPELINE (confidence: 0.92)
   ↓
7. ActionExecutor creates pipelineItem in stage 1
   ↓
8. Update intakeRequest status: ASSIGNED
   ↓
9. Emit event: intake:assigned → Trigger n8n workflow
   ↓
10. n8n sends Slack notification to team
```

---

## 6. Roadmap

### Planned Enhancements

#### Q1 2026

- **Advanced RAG Features**
  - Multi-document cross-referencing
  - Semantic search across document library
  - Auto-generated document summaries

- **Expanded Calendar Integrations**
  - Microsoft Outlook bidirectional sync
  - Apple iCloud Calendar support
  - Zoom/Meet link auto-generation

- **Enhanced Automation**
  - Visual workflow debugger
  - A/B testing for workflow variants
  - Workflow performance analytics

#### Q2 2026

- **Mobile Apps**
  - iOS app (React Native)
  - Android app (React Native)
  - Push notifications for task assignments

- **Voice Interface**
  - Voice-to-text for task creation
  - Voice commands for scheduling
  - Integration with Alexa/Google Assistant

- **Advanced Analytics**
  - Custom report builder
  - Predictive analytics (task completion time estimates)
  - Team productivity insights

#### Q3 2026

- **Marketplace**
  - Third-party automation templates
  - Plugin ecosystem for custom integrations
  - Paid add-ons and services

- **AI Enhancements**
  - Fine-tuned models for specialized workflows
  - Agentic workflows with multi-step planning
  - Predictive pipeline routing based on historical data

#### Q4 2026

- **Enterprise Features**
  - SSO integration (SAML, OIDC)
  - Advanced audit logging and compliance reports
  - Custom SLAs and escalation policies
  - White-label platform options

---

## Document Metadata

**Created:** December 2, 2025
**Last Updated:** December 2, 2025
**Version:** 1.0
**Maintained By:** Astralis Documentation Team
**Related Docs:** [ARCHITECTURE.md](./ARCHITECTURE.md), [AGENTS.md](./AGENTS.md), [WORKERS.md](./WORKERS.md), [CLAUDE.md](../CLAUDE.md)

---

**Need Help?**

- Documentation: [docs/](../docs/)
- GitHub Issues: [github.com/astralisone/astralis-nextjs/issues](https://github.com/astralisone/astralis-nextjs/issues)
- Support: support@astralisone.com

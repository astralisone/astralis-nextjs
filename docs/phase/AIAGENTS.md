# SMB Scheduling Task Automation Agent - Implementation Plan

## Executive Summary

Build an intelligent scheduling agent that accepts multi-channel inputs (forms, emails, SMS, text), classifies and prioritizes tasks, generates actionable items, and handles calendar scheduling with conflict resolution and smart recommendations.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         INPUT CHANNELS                                   │
├──────────┬──────────┬──────────┬──────────┬────────────────────────────┤
│  Forms   │  Emails  │   SMS    │   API    │  Generic Text              │
└────┬─────┴────┬─────┴────┬─────┴────┬─────┴──────────┬─────────────────┘
     │          │          │          │                │
     └──────────┴──────────┴──────────┴────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  UNIFIED INTAKE   │
                    │  /api/agent/inbox │
                    └─────────┬─────────┘
                              │
              ┌───────────────▼───────────────┐
              │      AI CLASSIFICATION        │
              │  ┌─────────────────────────┐  │
              │  │ Intent Detection        │  │
              │  │ Entity Extraction       │  │
              │  │ Priority Scoring        │  │
              │  │ Task Type Recognition   │  │
              │  └─────────────────────────┘  │
              └───────────────┬───────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼───────┐     ┌───────▼───────┐     ┌───────▼───────┐
│  TASK AGENT   │     │ SCHEDULE AGENT│     │ FOLLOWUP AGENT│
│               │     │               │     │               │
│ - Create task │     │ - Find slots  │     │ - Reminders   │
│ - Set due date│     │ - Check       │     │ - Escalation  │
│ - Assign owner│     │   conflicts   │     │ - Rebooking   │
│ - Track status│     │ - Book event  │     │ - Confirmations│
└───────────────┘     │ - Suggest     │     └───────────────┘
                      │   alternatives│
                      └───────────────┘
```

---

## Phase 1: Core Agent Infrastructure

**Status**: 🔄 In Progress

### Deliverables
1. `SchedulingAgentTask` Prisma model for task tracking
2. `SchedulingAgentService` - Core agent orchestration
3. `/api/agent/inbox` - Unified intake endpoint
4. BullMQ queue for async processing

### Database Models

```prisma
model SchedulingAgentTask {
  id              String            @id @default(uuid())
  userId          String
  orgId           String?

  // Source tracking
  source          AgentTaskSource   // FORM, EMAIL, SMS, API, CHAT
  sourceId        String?           // Reference to original message
  rawContent      String            // Original input text

  // AI Classification
  taskType        AgentTaskType     // SCHEDULE_MEETING, CREATE_TASK, RESCHEDULE, CANCEL, INQUIRY
  intent          String            // Extracted intent
  entities        Json              // { date, time, duration, participants, subject }
  priority        Int               @default(3) // 1-5
  confidence      Float             // AI confidence 0-1

  // Task Details (if taskType = CREATE_TASK)
  title           String?
  description     String?
  dueDate         DateTime?
  assignedTo      String?

  // Scheduling Details (if taskType = SCHEDULE_*)
  schedulingEventId String?
  proposedSlots   Json?             // AI suggested alternatives

  // Status
  status          AgentTaskStatus   // PENDING, PROCESSING, AWAITING_INPUT, COMPLETED, FAILED
  resolution      String?           // How it was resolved

  // Metadata
  aiMetadata      Json?             // Full AI response for audit
  processingTime  Int?              // ms
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  completedAt     DateTime?

  // Relations
  user            users             @relation(fields: [userId], references: [id])
  organization    organization?     @relation(fields: [orgId], references: [id])
  schedulingEvent SchedulingEvent?  @relation(fields: [schedulingEventId], references: [id])
}

enum AgentTaskSource {
  FORM
  EMAIL
  SMS
  API
  CHAT
  VOICE
}

enum AgentTaskType {
  SCHEDULE_MEETING
  RESCHEDULE_MEETING
  CANCEL_MEETING
  CHECK_AVAILABILITY
  CREATE_TASK
  UPDATE_TASK
  INQUIRY
  REMINDER
  UNKNOWN
}

enum AgentTaskStatus {
  PENDING
  PROCESSING
  AWAITING_INPUT
  SCHEDULED
  COMPLETED
  FAILED
  CANCELLED
}
```

---

## Phase 2: AI Classification Engine

**Status**: ⏳ Pending

### File: `src/lib/services/schedulingAgent.service.ts`

### Capabilities

#### 1. Intent Detection
What does the user want?
- Schedule a meeting
- Reschedule existing meeting
- Cancel a meeting
- Check availability
- Create a task/todo
- General inquiry

#### 2. Entity Extraction
Parse from natural language:
- **Date/time**: relative ("next Tuesday", "tomorrow at 3pm")
- **Duration**: "30 minutes", "1 hour"
- **Participants**: emails, names
- **Subject/title**
- **Location**: virtual/physical
- **Priority indicators**: "urgent", "ASAP", "when convenient"

#### 3. Priority Scoring (1-5)
- Keywords: "urgent", "ASAP", "emergency" → 5
- Client/customer mentions → +1
- Revenue/deal mentions → +1
- Time pressure indicators → +1
- Default: 3

---

## Phase 3: Smart Scheduling Engine

**Status**: ⏳ Pending

### Enhancements to Existing Services

#### 1. Overbooking Detection & Recommendations
- Detect when calendar is >80% full for a day
- Suggest spreading meetings across days
- Recommend buffer time between meetings

#### 2. Intelligent Slot Suggestions
- Rank by: time-of-day preference, meeting type, participant availability
- Avoid back-to-back meetings
- Respect focus time blocks
- Consider travel/commute time

#### 3. Conflict Resolution Strategies
- **Option A**: Suggest alternative times
- **Option B**: Offer to reschedule lower-priority meeting
- **Option C**: Double-book with warning
- **Option D**: Waitlist with auto-notify

#### 4. Batch Scheduling
- Group similar meetings
- Optimize for minimal context switching

---

## Phase 4: Multi-Channel Input Handlers

**Status**: ⏳ Pending

### Email Handler (`/api/agent/email`)
- Parse email headers (From, Subject, Date)
- Extract body content
- Handle attachments (ICS files, etc.)
- Thread tracking for conversations

### SMS Handler (`/api/agent/sms`)
- Twilio webhook integration
- Short message parsing
- Quick reply generation

### Form Handler (`/api/agent/form`)
- Structured input processing
- Validation and enrichment

### Generic Text (`/api/agent/inbox`)
- Unified endpoint for all text-based input
- Auto-detect source type

---

## Phase 5: Response Generation & Actions

**Status**: ⏳ Pending

### Auto-Actions
1. **Schedule Confirmed** → Create SchedulingEvent, send confirmations
2. **Conflict Detected** → Generate alternatives, send options
3. **Task Created** → Add to task list, set reminders
4. **Clarification Needed** → Generate follow-up question

### Response Templates
- Booking confirmation (email/SMS)
- Alternative time suggestions
- Conflict notification
- Task creation confirmation
- Reminder messages

---

## Phase 6: Background Processing

**Status**: ⏳ Pending

### New BullMQ Queues

```typescript
// src/workers/queues/schedulingAgent.queue.ts
export const schedulingAgentQueue = new Queue('scheduling-agent', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 }
  }
});

// Job types:
// - process-inbox: Classify and route incoming messages
// - schedule-meeting: Execute scheduling with conflict check
// - send-alternatives: Generate and send alternative slots
// - send-reminder: Dispatch meeting reminders
// - process-followup: Handle user responses
```

---

## Implementation Phases Summary

| Phase | Description                    | Files                                          | Priority | Status |
|-------|--------------------------------|------------------------------------------------|----------|--------|
| 1     | Database models & core service | schema.prisma, schedulingAgent.service.ts      | High     | 🔄     |
| 2     | AI classification engine       | schedulingAgent.service.ts                     | High     | ⏳     |
| 3     | Unified inbox API              | /api/agent/inbox/route.ts                      | High     | ⏳     |
| 4     | Smart scheduling enhancements  | conflict.service.ts, aiScheduling.service.ts   | High     | ⏳     |
| 5     | Email channel handler          | /api/agent/email/route.ts                      | Medium   | ⏳     |
| 6     | SMS channel handler (Twilio)   | /api/agent/sms/route.ts                        | Medium   | ⏳     |
| 7     | Background job processing      | src/workers/schedulingAgent/                   | Medium   | ⏳     |
| 8     | Response generation            | schedulingAgentResponse.service.ts             | Medium   | ⏳     |
| 9     | Dashboard UI                   | /app/(app)/agent/page.tsx                      | Low      | ⏳     |
| 10    | Analytics & reporting          | Agent performance metrics                      | Low      | ⏳     |

---

## Key Features Summary

| Feature               | Description                                                     |
|-----------------------|-----------------------------------------------------------------|
| Multi-Channel Intake  | Forms, emails, SMS, API, chat                                   |
| AI Classification     | Intent detection, entity extraction, priority scoring           |
| Smart Scheduling      | Conflict detection, alternative suggestions, overbooking alerts |
| Task Generation       | Auto-create tasks from messages with due dates                  |
| Conflict Resolution   | Multiple strategies: reschedule, alternatives, waitlist         |
| Auto-Responses        | Confirmations, alternatives, reminders                          |
| Background Processing | Async via BullMQ for scalability                                |
| Audit Trail           | Full AI metadata stored for debugging                           |

---

## Environment Variables Required

```bash
# AI Provider (for classification)
OPENAI_API_KEY=sk-...

# SMS (Phase 6)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# Email Processing (Phase 5)
IMAP_HOST=...
IMAP_USER=...
IMAP_PASSWORD=...
```

---

## API Endpoints

| Endpoint                    | Method | Description                          |
|-----------------------------|--------|--------------------------------------|
| `/api/agent/inbox`          | POST   | Unified intake for all text inputs   |
| `/api/agent/inbox`          | GET    | List agent tasks with filters        |
| `/api/agent/inbox/[id]`     | GET    | Get specific task details            |
| `/api/agent/inbox/[id]`     | PATCH  | Update task status/resolution        |
| `/api/agent/email`          | POST   | Email webhook handler                |
| `/api/agent/sms`            | POST   | SMS/Twilio webhook handler           |
| `/api/agent/availability`   | GET    | Check availability for scheduling    |
| `/api/agent/suggest`        | POST   | Get AI-suggested time slots          |

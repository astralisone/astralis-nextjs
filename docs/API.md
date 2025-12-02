# Astralis One API Documentation

**Version:** 1.0
**Base URL:** `http://localhost:3001/api` (dev) | `https://astralisone.com/api` (prod)
**Last Updated:** 2025-12-02

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Conventions](#api-conventions)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Pagination](#pagination)
7. [API Endpoints](#api-endpoints)
   - [Authentication](#authentication-endpoints)
   - [Agent & Orchestration](#agent--orchestration-endpoints)
   - [Intake Requests](#intake-request-endpoints)
   - [Pipelines](#pipeline-endpoints)
   - [Documents](#document-endpoints)
   - [Chat & RAG](#chat--rag-endpoints)
   - [Calendar & Scheduling](#calendar--scheduling-endpoints)
   - [Automations](#automation-endpoints)
   - [Users & Organizations](#users--organizations-endpoints)
   - [Booking (Public)](#booking-endpoints-public)
   - [Webhooks](#webhook-endpoints)
   - [Tasks & Decisions](#tasks--decisions-endpoints)
8. [WebSocket Events](#websocket-events)
9. [SDK Examples](#sdk-examples)

---

## Overview

The Astralis One API is a RESTful API built with Next.js 15 App Router. It provides comprehensive access to:

- **AI Orchestration**: Intelligent routing and decision-making via Orchestration Agent
- **Intake Management**: Multi-channel request intake with AI routing
- **Pipeline Management**: Kanban-style workflow pipelines
- **Document Processing**: OCR, embeddings, and RAG-powered chat
- **Automation**: n8n workflow integration
- **Scheduling**: Calendar management with conflict detection
- **Multi-tenancy**: Organization-level data isolation

### Architecture Patterns

- **Next.js App Router**: API routes in `src/app/api/`
- **Validation**: Zod schemas for all inputs
- **Database**: Prisma ORM with PostgreSQL
- **Queue System**: BullMQ + Redis for background jobs
- **AI/ML**: OpenAI (embeddings, chat), Anthropic Claude (orchestration)

---

## Authentication

### Session-Based Auth

Astralis uses **NextAuth.js** with JWT strategy for authentication.

#### Getting Session in API Routes

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Access user info
  const { id, email, role, orgId } = session.user;
  // ... your logic
}
```

#### Protected Routes Pattern

All authenticated endpoints follow this pattern:

1. Get session via `getServerSession(authOptions)`
2. Verify `session.user.id` exists
3. Enforce organization isolation via `session.user.orgId`
4. Return 401 if not authenticated
5. Return 403 if unauthorized

#### Authentication Providers

- **Email/Password**: Credentials provider with bcrypt hashing
- **Google OAuth**: OAuth2.0 flow with automatic organization creation

#### Session Structure

```typescript
{
  user: {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'OPERATOR' | 'CLIENT' | 'PM';
    orgId: string;
    image?: string;
  }
}
```

---

## API Conventions

### Request Format

- **Content-Type**: `application/json` (unless file upload)
- **Method**: GET, POST, PUT, DELETE, PATCH
- **Headers**: Standard HTTP headers + custom auth headers

### Response Format

#### Success Response (200, 201)

```json
{
  "success": true,
  "data": { ... },
  "pagination": { ... } // if applicable
}
```

#### Error Response (4xx, 5xx)

```json
{
  "error": "Error type",
  "details": "Human-readable message",
  "validationErrors": [ ... ] // if validation failed
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input/validation failed |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (e.g., scheduling) |
| 422 | Unprocessable Entity | Semantic errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily down |

---

## Error Handling

### Validation Errors

Zod validation errors are returned with field-level details:

```json
{
  "error": "Validation failed",
  "details": {
    "email": ["Invalid email address"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

### Common Error Types

| Error | Description | Resolution |
|-------|-------------|------------|
| `Unauthorized` | Missing or invalid auth | Sign in and retry |
| `Forbidden` | Insufficient permissions | Check user role |
| `Validation failed` | Input validation error | Fix request payload |
| `Not found` | Resource doesn't exist | Verify ID is correct |
| `Quota exceeded` | Organization quota hit | Upgrade plan |
| `Configuration error` | Missing env variables | Contact admin |

---

## Rate Limiting

### Current Limits

| Endpoint Category | Per Minute | Per Hour | Per Day |
|-------------------|------------|----------|---------|
| Agent endpoints | 60 | 500 | 5,000 |
| Public endpoints | 100 | 1,000 | 10,000 |
| Authenticated endpoints | 120 | 2,000 | 20,000 |
| Webhooks | 300 | 5,000 | 50,000 |

### Rate Limit Headers

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640995200
```

### Rate Limit Response

```json
{
  "error": "Too Many Requests",
  "details": "Rate limit exceeded. Retry after 1640995200",
  "retryAfter": 60
}
```

---

## Pagination

### Query Parameters

```
?limit=50      // Items per page (default: 50, max: 100)
?offset=0      // Offset for pagination (default: 0)
?cursor=xyz    // Cursor-based pagination (some endpoints)
```

### Response Format

```json
{
  "data": [ ... ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

### Cursor-Based Pagination

For high-volume endpoints, cursor-based pagination is used:

```json
{
  "data": [ ... ],
  "pagination": {
    "nextCursor": "eyJpZCI6MTIzfQ==",
    "prevCursor": null,
    "hasMore": true
  }
}
```

---

## API Endpoints

---

## Authentication Endpoints

### POST /api/auth/signup

Create a new user account.

**Auth:** None (public)
**Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "orgName": "Acme Corp" // optional
}
```

**Response:** 201 Created

```json
{
  "success": true,
  "user": {
    "id": "clx...",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Errors:**
- 400: Validation failed
- 409: Email already registered

---

### POST /api/auth/signin

Handled by NextAuth.js. Use credentials provider:

**POST /api/auth/callback/credentials**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

---

### POST /api/auth/accept-invite

Accept an organization invite.

**Auth:** Required
**Body:**

```json
{
  "inviteToken": "abc123xyz"
}
```

**Response:** 200 OK

---

### POST /api/auth/resend-verification

Resend email verification link.

**Auth:** None
**Body:**

```json
{
  "email": "john@example.com"
}
```

---

## Agent & Orchestration Endpoints

### POST /api/agent/process

Process an input through the Orchestration Agent.

**Auth:** Optional (can use API key or session)
**Body:**

```json
{
  "source": "EMAIL" | "WEBHOOK" | "DB_TRIGGER" | "WORKER" | "API" | "SCHEDULE",
  "type": "form_submitted",
  "content": "Customer inquiry about enterprise pricing",
  "metadata": {
    "senderEmail": "customer@example.com",
    "senderName": "Jane Smith",
    "priorityHint": 3,
    "tags": ["sales", "enterprise"]
  },
  "structuredData": {
    "formType": "contact",
    "company": "Tech Corp"
  },
  "options": {
    "orgId": "org_123", // optional
    "dryRun": false, // optional
    "forceApproval": false // optional
  }
}
```

**Response:** 200 OK

```json
{
  "success": true,
  "correlationId": "uuid-123",
  "processingTimeMs": 450,
  "decision": {
    "intent": "ROUTE_TO_SALES",
    "confidence": 0.92,
    "reasoning": "Enterprise inquiry detected with high priority",
    "requiresApproval": false,
    "priority": 4,
    "warnings": [],
    "alternatives": []
  },
  "actions": [
    {
      "type": "CREATE_PIPELINE_ITEM",
      "priority": 1,
      "requiresConfirmation": false,
      "params": { ... }
    }
  ],
  "executionStatus": "executed" | "pending_approval" | "dry_run"
}
```

**Errors:**
- 400: Invalid payload
- 429: Rate limit exceeded
- 500: LLM provider not configured

---

### GET /api/agent/process

Get API documentation and configuration status.

**Auth:** None
**Response:** 200 OK

```json
{
  "success": true,
  "service": "agent-process-api",
  "status": "active",
  "config": {
    "llmProvider": "CLAUDE",
    "llmModel": "claude-sonnet-4-20250514",
    "autoExecuteThreshold": 0.85,
    "requireApprovalThreshold": 0.5
  },
  "supportedSources": ["EMAIL", "WEBHOOK", ...],
  "supportedActions": ["CREATE_PIPELINE_ITEM", ...]
}
```

---

### GET /api/agent/decisions

List agent decisions with filters.

**Auth:** Required
**Query Params:**
- `status`: PENDING | APPROVED | REJECTED | EXECUTED
- `limit`: 50 (default)
- `offset`: 0 (default)

**Response:** 200 OK

```json
{
  "decisions": [ ... ],
  "pagination": { ... }
}
```

---

### GET /api/agent/decisions/[id]

Get specific decision details.

**Auth:** Required
**Response:** 200 OK

---

### POST /api/agent/decisions/[id]/approve

Approve a pending decision.

**Auth:** Required (ADMIN or OPERATOR)
**Response:** 200 OK

---

### POST /api/agent/decisions/[id]/reject

Reject a pending decision.

**Auth:** Required (ADMIN or OPERATOR)
**Body:**

```json
{
  "reason": "Not relevant for this pipeline"
}
```

---

### GET /api/agent/inbox

Get agent task inbox.

**Auth:** Required
**Response:** 200 OK

```json
{
  "tasks": [
    {
      "id": "task_123",
      "type": "ROUTE_REQUEST",
      "status": "PENDING",
      "priority": 3,
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

### GET /api/agent/availability

Check agent availability and health.

**Auth:** None
**Response:** 200 OK

```json
{
  "available": true,
  "provider": "CLAUDE",
  "model": "claude-sonnet-4-20250514",
  "queueDepth": 5
}
```

---

### GET /api/agent/analytics

Get agent performance analytics.

**Auth:** Required (ADMIN)
**Response:** 200 OK

---

### POST /api/agent/suggest

Get AI suggestions for a given context.

**Auth:** Required
**Body:**

```json
{
  "context": "Customer wants enterprise pricing",
  "type": "routing" | "scheduling" | "response"
}
```

---

### POST /api/agent/init

Initialize or re-initialize the agent system.

**Auth:** Required (ADMIN)
**Response:** 200 OK

---

## Intake Request Endpoints

### POST /api/intake

Create a new intake request. Routes via Orchestration Agent.

**Auth:** Optional (can be public for forms)
**Body:**

```json
{
  "source": "FORM" | "EMAIL" | "CHAT" | "API",
  "title": "Support request",
  "description": "Customer needs help with...",
  "requestData": {
    "email": "customer@example.com",
    "name": "Jane Doe",
    "company": "Tech Corp"
  },
  "orgId": "org_123",
  "priority": 2 // 0-10, default: 0
}
```

**Response:** 201 Created

```json
{
  "intakeRequest": {
    "id": "clx...",
    "status": "NEW",
    "title": "Support request",
    "createdAt": "2025-01-15T10:00:00Z"
  },
  "routing": {
    "assigned": false,
    "confidence": 0,
    "reasoning": "OA will handle routing via events",
    "usedAIRouting": false
  }
}
```

**Errors:**
- 400: Invalid payload
- 404: Organization not found
- 429: Quota exceeded

---

### GET /api/intake

List intake requests with filters.

**Auth:** Required
**Query Params:**
- `orgId`: Required
- `status`: NEW | ROUTING | ASSIGNED | PROCESSING | COMPLETED | REJECTED
- `source`: FORM | EMAIL | CHAT | API
- `search`: Full-text search
- `limit`: 50 (default)
- `offset`: 0 (default)

**Response:** 200 OK

```json
{
  "intakeRequests": [
    {
      "id": "clx...",
      "title": "Support request",
      "status": "NEW",
      "source": "FORM",
      "priority": 2,
      "createdAt": "2025-01-15T10:00:00Z",
      "pipeline": {
        "id": "pipe_123",
        "name": "Support Pipeline"
      }
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 50,
    "offset": 0,
    "hasMore": false
  }
}
```

---

### GET /api/intake/[id]

Get intake request details.

**Auth:** Required
**Response:** 200 OK

---

### PUT /api/intake/[id]

Update intake request.

**Auth:** Required
**Body:**

```json
{
  "status": "PROCESSING",
  "assignedPipeline": "pipe_123"
}
```

---

### POST /api/intake/[id]/assign

Assign intake to pipeline.

**Auth:** Required
**Body:**

```json
{
  "pipelineId": "pipe_123",
  "stageId": "stage_456" // optional
}
```

---

### POST /api/intake/bulk

Create multiple intake requests.

**Auth:** Required
**Body:**

```json
{
  "requests": [ ... ] // array of intake objects
}
```

---

## Pipeline Endpoints

### GET /api/pipelines

List pipelines for organization.

**Auth:** Required
**Query Params:**
- `orgId`: Required
- `isActive`: true | false
- `search`: Search by name/description

**Response:** 200 OK

```json
{
  "pipelines": [
    {
      "id": "pipe_123",
      "name": "Sales Pipeline",
      "description": "Enterprise sales workflow",
      "isActive": true,
      "stages": [
        {
          "id": "stage_1",
          "name": "New Leads",
          "order": 0,
          "_count": { "items": 5 }
        }
      ],
      "_count": { "stages": 4 }
    }
  ],
  "total": 3
}
```

---

### POST /api/pipelines

Create a new pipeline.

**Auth:** Required (ADMIN or OPERATOR)
**Body:**

```json
{
  "name": "Sales Pipeline",
  "description": "Track enterprise sales opportunities",
  "orgId": "org_123"
}
```

**Response:** 201 Created

---

### GET /api/pipelines/[id]

Get pipeline with stages and items.

**Auth:** Required
**Response:** 200 OK

---

### PUT /api/pipelines/[id]

Update pipeline.

**Auth:** Required (ADMIN or OPERATOR)
**Body:**

```json
{
  "name": "Updated Pipeline Name",
  "isActive": true
}
```

---

### DELETE /api/pipelines/[id]

Delete pipeline (soft delete).

**Auth:** Required (ADMIN)
**Response:** 200 OK

---

### GET /api/pipelines/[id]/stages

List stages for pipeline.

**Auth:** Required
**Response:** 200 OK

---

### POST /api/pipelines/[id]/stages

Create a new stage.

**Auth:** Required (ADMIN or OPERATOR)
**Body:**

```json
{
  "name": "Qualified Leads",
  "order": 1,
  "color": "#3182CE"
}
```

---

### PUT /api/pipelines/[id]/stages/[stageId]

Update stage.

**Auth:** Required
**Response:** 200 OK

---

### DELETE /api/pipelines/[id]/stages/[stageId]

Delete stage.

**Auth:** Required (ADMIN)
**Response:** 200 OK

---

### GET /api/pipelines/[id]/items

List items in pipeline.

**Auth:** Required
**Response:** 200 OK

---

### POST /api/pipelines/[id]/items

Create pipeline item.

**Auth:** Required
**Body:**

```json
{
  "title": "Acme Corp - Enterprise Deal",
  "description": "500+ user license",
  "stageId": "stage_1",
  "metadata": {
    "value": 50000,
    "contacts": ["john@acme.com"]
  }
}
```

---

### GET /api/pipelines/[id]/items/[itemId]

Get item details.

**Auth:** Required
**Response:** 200 OK

---

### PUT /api/pipelines/[id]/items/[itemId]

Update pipeline item.

**Auth:** Required
**Response:** 200 OK

---

### DELETE /api/pipelines/[id]/items/[itemId]

Delete pipeline item.

**Auth:** Required
**Response:** 200 OK

---

### PUT /api/pipelines/[id]/items/[itemId]/move

Move item between stages.

**Auth:** Required
**Body:**

```json
{
  "targetStageId": "stage_2",
  "order": 0 // optional
}
```

**Response:** 200 OK

---

## Document Endpoints

### GET /api/documents

List documents with filters.

**Auth:** Required
**Query Params:**
- `status`: PENDING | PROCESSING | COMPLETED | FAILED
- `mimeType`: Filter by type
- `uploadedBy`: User ID
- `search`: Full-text search
- `startDate`: ISO date
- `endDate`: ISO date
- `limit`: 50 (default, max 100)
- `offset`: 0 (default)

**Response:** 200 OK

```json
{
  "documents": [
    {
      "id": "doc_123",
      "fileName": "contract.pdf",
      "originalName": "Enterprise Contract.pdf",
      "cdnUrl": "https://cdn.../contract.pdf",
      "thumbnailUrl": "https://cdn.../thumb.jpg",
      "fileSize": 524288,
      "mimeType": "application/pdf",
      "status": "COMPLETED",
      "ocrText": "Extracted text...",
      "ocrConfidence": 0.95,
      "uploadedBy": "user_123",
      "createdAt": "2025-01-15T10:00:00Z",
      "processedAt": "2025-01-15T10:02:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### POST /api/documents/upload

Upload a document. Triggers OCR and embedding pipeline.

**Auth:** Required
**Content-Type:** multipart/form-data
**Body:**
- `file`: File (required)
- `description`: String (optional)
- `tags`: String[] (optional)

**Response:** 201 Created

```json
{
  "success": true,
  "document": {
    "id": "doc_123",
    "fileName": "document.pdf",
    "status": "PENDING"
  }
}
```

---

### GET /api/documents/[id]

Get document details.

**Auth:** Required
**Response:** 200 OK

---

### DELETE /api/documents/[id]

Delete document.

**Auth:** Required
**Response:** 200 OK

---

### GET /api/documents/[id]/download

Download document file.

**Auth:** Required
**Response:** Binary file stream

---

### GET /api/documents/[id]/url

Get temporary signed URL for document.

**Auth:** Required
**Response:** 200 OK

```json
{
  "url": "https://cdn.../document.pdf?signature=...",
  "expiresAt": "2025-01-15T11:00:00Z"
}
```

---

### POST /api/documents/[id]/retry

Retry failed OCR processing.

**Auth:** Required
**Response:** 200 OK

---

### POST /api/documents/[id]/embed

Trigger embedding generation for document.

**Auth:** Required
**Response:** 200 OK

---

### GET /api/documents/search

Search documents by content.

**Auth:** Required
**Query Params:**
- `q`: Search query (required)
- `limit`: 20 (default)

**Response:** 200 OK

---

### GET /api/documents/stats

Get document statistics.

**Auth:** Required
**Response:** 200 OK

```json
{
  "total": 150,
  "byStatus": {
    "COMPLETED": 140,
    "PROCESSING": 5,
    "FAILED": 5
  },
  "totalSize": 524288000,
  "byMimeType": {
    "application/pdf": 100,
    "image/png": 50
  }
}
```

---

### DELETE /api/documents (Bulk Delete)

Delete multiple documents.

**Auth:** Required
**Body:**

```json
{
  "documentIds": ["doc_1", "doc_2", "doc_3"]
}
```

**Response:** 200 OK

```json
{
  "success": true,
  "deletedCount": 3,
  "errors": []
}
```

---

## Chat & RAG Endpoints

### POST /api/chat

Send chat message with RAG context.

**Auth:** Required
**Body:**

```json
{
  "chatId": "chat_123", // optional, creates new if not provided
  "documentId": "doc_123", // optional
  "message": "What does this document say about pricing?",
  "maxContextChunks": 5, // optional, default: 5
  "temperature": 0.7 // optional, default: 0.7
}
```

**Response:** 200 OK

```json
{
  "success": true,
  "data": {
    "chatId": "chat_123",
    "message": "Based on the document, pricing is structured as...",
    "sources": [
      {
        "documentId": "doc_123",
        "documentName": "Pricing Guide.pdf",
        "chunkIndex": 2,
        "content": "Enterprise pricing: $50/user/month",
        "similarity": 0.92
      }
    ],
    "tokensUsed": 450
  }
}
```

**Errors:**
- 401: Not authenticated
- 404: Chat or document not found
- 500: OpenAI API not configured

---

### GET /api/chat

List user's chat conversations.

**Auth:** Required
**Query Params:**
- `limit`: 50 (default, max 100)
- `offset`: 0 (default)
- `documentId`: Filter by document

**Response:** 200 OK

```json
{
  "success": true,
  "data": {
    "chats": [
      {
        "id": "chat_123",
        "title": "Chat about Pricing",
        "documentId": "doc_123",
        "document": {
          "id": "doc_123",
          "originalName": "Pricing Guide.pdf",
          "fileName": "pricing-guide.pdf"
        },
        "messageCount": 5,
        "lastMessageAt": "2025-01-15T10:30:00Z",
        "createdAt": "2025-01-15T10:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

### GET /api/chat/[id]

Get chat conversation with messages.

**Auth:** Required
**Response:** 200 OK

---

### DELETE /api/chat/[id]

Delete chat conversation.

**Auth:** Required
**Response:** 200 OK

---

### GET /api/chat-messages

List messages across chats.

**Auth:** Required
**Response:** 200 OK

---

### GET /api/chat-messages/[taskId]

Get messages for specific task.

**Auth:** Required
**Response:** 200 OK

---

### POST /api/chat/calendar

Chat about calendar and scheduling.

**Auth:** Required
**Body:**

```json
{
  "message": "Schedule a meeting with John next Tuesday at 2pm"
}
```

**Response:** 200 OK

---

## Calendar & Scheduling Endpoints

### GET /api/calendar/events

List calendar events.

**Auth:** Required
**Query Params:**
- `startDate`: ISO date
- `endDate`: ISO date
- `status`: SCHEDULED | COMPLETED | CANCELLED

**Response:** 200 OK

```json
{
  "events": [
    {
      "id": "event_123",
      "title": "Client Meeting",
      "startTime": "2025-01-20T14:00:00Z",
      "endTime": "2025-01-20T15:00:00Z",
      "timezone": "America/New_York",
      "status": "SCHEDULED",
      "participantEmails": ["client@example.com"]
    }
  ]
}
```

---

### POST /api/calendar/events

Create calendar event.

**Auth:** Required
**Body:**

```json
{
  "title": "Team Standup",
  "description": "Daily standup meeting",
  "startTime": "2025-01-20T09:00:00Z",
  "endTime": "2025-01-20T09:30:00Z",
  "timezone": "America/New_York",
  "participantEmails": ["team@example.com"]
}
```

**Response:** 201 Created

---

### GET /api/calendar/events/[id]

Get event details.

**Auth:** Required
**Response:** 200 OK

---

### PUT /api/calendar/events/[id]

Update event.

**Auth:** Required
**Response:** 200 OK

---

### DELETE /api/calendar/events/[id]

Cancel event.

**Auth:** Required
**Response:** 200 OK

---

### POST /api/calendar/connect

Connect external calendar (Google, Outlook).

**Auth:** Required
**Body:**

```json
{
  "provider": "google" | "outlook"
}
```

**Response:** 200 OK

```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

---

### GET /api/calendar/callback

OAuth callback for calendar integration.

**Auth:** None
**Query Params:**
- `code`: OAuth code
- `state`: OAuth state

**Response:** Redirect to dashboard

---

### POST /api/calendar/disconnect

Disconnect external calendar.

**Auth:** Required
**Response:** 200 OK

---

### POST /api/calendar/sync

Sync events with external calendar.

**Auth:** Required
**Response:** 200 OK

---

### GET /api/scheduling/conflicts

Check for scheduling conflicts.

**Auth:** Required
**Query Params:**
- `userId`: User ID
- `startTime`: ISO datetime
- `endTime`: ISO datetime

**Response:** 200 OK

```json
{
  "hasConflict": true,
  "severity": "high" | "medium" | "low",
  "conflicts": [
    {
      "eventId": "event_123",
      "eventTitle": "Existing Meeting",
      "startTime": "2025-01-20T14:00:00Z",
      "endTime": "2025-01-20T15:00:00Z",
      "conflictType": "HARD_CONFLICT"
    }
  ],
  "availabilityIssues": [
    {
      "message": "User marked unavailable",
      "affectedTime": "2025-01-20T14:00:00Z"
    }
  ]
}
```

---

### POST /api/scheduling/suggest

Get AI scheduling suggestions.

**Auth:** Required
**Body:**

```json
{
  "participantEmails": ["alice@example.com", "bob@example.com"],
  "duration": 60, // minutes
  "preferredTimes": ["morning", "afternoon"],
  "startDate": "2025-01-20",
  "endDate": "2025-01-27"
}
```

**Response:** 200 OK

```json
{
  "suggestions": [
    {
      "startTime": "2025-01-22T10:00:00Z",
      "endTime": "2025-01-22T11:00:00Z",
      "confidence": 0.95,
      "reasoning": "All participants available, morning preference met"
    }
  ]
}
```

---

### GET /api/availability

Get user availability.

**Auth:** Required
**Query Params:**
- `userId`: User ID
- `date`: ISO date

**Response:** 200 OK

---

### POST /api/availability

Set availability preferences.

**Auth:** Required
**Body:**

```json
{
  "dayOfWeek": "MONDAY",
  "startTime": "09:00",
  "endTime": "17:00",
  "timezone": "America/New_York"
}
```

---

### PUT /api/availability/[id]

Update availability.

**Auth:** Required
**Response:** 200 OK

---

### DELETE /api/availability/[id]

Delete availability rule.

**Auth:** Required
**Response:** 200 OK

---

## Automation Endpoints

### GET /api/automations

List automations.

**Auth:** Required
**Query Params:**
- `isActive`: true | false
- `search`: Search by name
- `page`: 1 (default)
- `pageSize`: 20 (default)

**Response:** 200 OK

```json
{
  "success": true,
  "automations": [
    {
      "id": "auto_123",
      "name": "Lead Notification",
      "description": "Send Slack notification on new lead",
      "triggerType": "WEBHOOK",
      "isActive": true,
      "n8nWorkflowId": "wf_456",
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### POST /api/automations

Create automation with n8n workflow.

**Auth:** Required (ADMIN or OPERATOR)
**Body:**

```json
{
  "name": "Lead Notification",
  "description": "Notify team of new leads",
  "triggerType": "WEBHOOK" | "SCHEDULE" | "EVENT" | "MANUAL" | "API",
  "triggerConfig": {
    "webhookPath": "/webhooks/lead-created"
  },
  "workflowJson": {
    "nodes": [ ... ],
    "connections": { ... }
  },
  "tags": ["sales", "notification"]
}
```

**Response:** 201 Created

```json
{
  "success": true,
  "data": {
    "id": "auto_123",
    "n8nWorkflowId": "wf_456",
    "webhookUrl": "https://automation.astralisone.com/webhook/..."
  }
}
```

---

### GET /api/automations/[id]

Get automation details.

**Auth:** Required
**Response:** 200 OK

---

### PUT /api/automations/[id]

Update automation.

**Auth:** Required (ADMIN or OPERATOR)
**Response:** 200 OK

---

### DELETE /api/automations/[id]

Delete automation.

**Auth:** Required (ADMIN)
**Response:** 200 OK

---

### POST /api/automations/[id]/execute

Manually execute automation.

**Auth:** Required
**Body:**

```json
{
  "input": {
    "leadId": "lead_123",
    "customData": { ... }
  }
}
```

**Response:** 200 OK

```json
{
  "success": true,
  "executionId": "exec_789",
  "status": "running"
}
```

---

### GET /api/automations/[id]/executions

Get execution history.

**Auth:** Required
**Query Params:**
- `limit`: 50 (default)
- `offset`: 0

**Response:** 200 OK

```json
{
  "executions": [
    {
      "id": "exec_789",
      "status": "COMPLETED",
      "startedAt": "2025-01-15T10:00:00Z",
      "completedAt": "2025-01-15T10:00:05Z",
      "duration": 5000,
      "result": { ... }
    }
  ]
}
```

---

### GET /api/automations/[id]/workflow

Get n8n workflow definition.

**Auth:** Required
**Response:** 200 OK

---

### GET /api/automations/templates

List automation templates.

**Auth:** Required
**Response:** 200 OK

---

### POST /api/automations/templates/[id]/deploy

Deploy template as new automation.

**Auth:** Required (ADMIN or OPERATOR)
**Body:**

```json
{
  "name": "My Automation",
  "customConfig": { ... }
}
```

---

## Users & Organizations Endpoints

### GET /api/users/me

Get current user profile.

**Auth:** Required
**Response:** 200 OK

```json
{
  "user": {
    "id": "user_123",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "ADMIN",
    "orgId": "org_123",
    "avatar": "https://cdn.../avatar.jpg",
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

---

### PUT /api/users/me

Update current user profile.

**Auth:** Required
**Body:**

```json
{
  "name": "John Smith",
  "avatar": "https://cdn.../new-avatar.jpg"
}
```

---

### PUT /api/users/me/password

Change password.

**Auth:** Required
**Body:**

```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}
```

---

### POST /api/users/me/avatar

Upload avatar image.

**Auth:** Required
**Content-Type:** multipart/form-data
**Response:** 200 OK

---

### GET /api/users/me/settings

Get user preferences.

**Auth:** Required
**Response:** 200 OK

---

### PUT /api/users/me/settings

Update user preferences.

**Auth:** Required
**Body:**

```json
{
  "notifications": {
    "email": true,
    "slack": false
  },
  "timezone": "America/New_York",
  "theme": "dark"
}
```

---

### GET /api/users

List users (admin only).

**Auth:** Required (ADMIN)
**Query Params:**
- `orgId`: Organization ID
- `role`: ADMIN | OPERATOR | CLIENT | PM
- `isActive`: true | false

**Response:** 200 OK

---

### POST /api/users/invite

Invite user to organization.

**Auth:** Required (ADMIN)
**Body:**

```json
{
  "email": "newuser@example.com",
  "role": "OPERATOR",
  "name": "Jane Doe"
}
```

---

### GET /api/organization

Get current organization.

**Auth:** Required
**Response:** 200 OK

---

### PUT /api/organization

Update organization settings.

**Auth:** Required (ADMIN)
**Body:**

```json
{
  "name": "Updated Org Name",
  "settings": { ... }
}
```

---

### GET /api/organization/quota

Get organization quota usage.

**Auth:** Required
**Response:** 200 OK

```json
{
  "quotas": {
    "intake_requests": {
      "used": 150,
      "limit": 500,
      "percentage": 30
    },
    "documents": {
      "used": 50,
      "limit": 100,
      "percentage": 50
    }
  },
  "plan": "PROFESSIONAL"
}
```

---

### GET /api/orgs

List organizations (super admin).

**Auth:** Required (SUPER_ADMIN)
**Response:** 200 OK

---

### POST /api/orgs

Create organization.

**Auth:** Required (SUPER_ADMIN)
**Response:** 201 Created

---

### GET /api/orgs/[id]/members

List organization members.

**Auth:** Required (ADMIN)
**Response:** 200 OK

---

### PUT /api/orgs/[id]/settings

Update organization settings.

**Auth:** Required (ADMIN)
**Response:** 200 OK

---

## Booking Endpoints (Public)

### POST /api/booking

Create consultation booking.

**Auth:** None (public)
**Body:**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1-555-123-4567",
  "company": "Tech Corp", // optional
  "date": "2025-01-25",
  "time": "02:00 PM",
  "meetingType": "VIDEO_CALL" | "PHONE_CALL" | "IN_PERSON",
  "message": "Looking to discuss enterprise features" // optional
}
```

**Response:** 200 OK

```json
{
  "success": true,
  "bookingId": "BK-1640995200-ABC12",
  "schedulingEventId": "event_123",
  "intakeRequestId": "intake_456",
  "message": "Booking confirmed! Check your email for details and calendar invite."
}
```

**Errors:**
- 400: Invalid booking data
- 409: Scheduling conflict (includes alternative times)
- 500: Booking system configuration error

---

### GET /api/booking/availability

Get available time slots.

**Auth:** None (public)
**Query Params:**
- `date`: ISO date (YYYY-MM-DD)
- `duration`: Minutes (default: 60)

**Response:** 200 OK

```json
{
  "date": "2025-01-25",
  "availableSlots": [
    {
      "time": "09:00 AM",
      "startTime": "2025-01-25T09:00:00Z",
      "endTime": "2025-01-25T10:00:00Z",
      "available": true
    },
    {
      "time": "10:00 AM",
      "startTime": "2025-01-25T10:00:00Z",
      "endTime": "2025-01-25T11:00:00Z",
      "available": false,
      "reason": "Already booked"
    }
  ]
}
```

---

### GET /api/booking/events

List booking events.

**Auth:** Required
**Response:** 200 OK

---

### POST /api/book

Alias for /api/booking (legacy).

---

## Webhook Endpoints

### POST /api/webhooks/form

Receive form submissions.

**Auth:** Optional (signature verification)
**Query Params:**
- `source`: contact_form | booking_form | intake_form | survey_form | newsletter_signup | callback_request | generic

**Headers:**
- `X-Webhook-Signature`: HMAC-SHA256 signature (optional)
- `X-Webhook-Timestamp`: Unix timestamp (optional)
- `X-Org-ID`: Organization ID (optional)

**Body:** JSON form data

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "I'm interested in your services",
  "company": "Acme Corp"
}
```

**Response:** 200 OK (immediate)

```json
{
  "success": true,
  "correlationId": "uuid-123",
  "status": "accepted",
  "message": "Form submission received and queued for processing"
}
```

---

### GET /api/webhooks/form

Health check for form webhook.

**Auth:** None
**Response:** 200 OK

```json
{
  "success": true,
  "service": "form-webhook",
  "status": "active",
  "supportedSources": ["contact_form", ...],
  "config": {
    "signatureVerification": true,
    "defaultOrgConfigured": true
  }
}
```

---

### POST /api/webhooks/automation

n8n automation webhook handler.

**Auth:** Optional (webhook signature)
**Response:** 200 OK

---

### POST /api/webhooks/automation/[id]

Specific automation webhook.

**Auth:** Optional
**Response:** 200 OK

---

### POST /api/webhooks/email

Email event webhook (from email provider).

**Auth:** Webhook signature
**Response:** 200 OK

---

## Tasks & Decisions Endpoints

### GET /api/tasks

List tasks.

**Auth:** Required
**Query Params:**
- `status`: PENDING | IN_PROGRESS | COMPLETED | FAILED
- `type`: Task type filter
- `assignedTo`: User ID

**Response:** 200 OK

---

### POST /api/tasks

Create task.

**Auth:** Required
**Body:**

```json
{
  "title": "Review intake request",
  "type": "REVIEW",
  "priority": 3,
  "assignedTo": "user_123",
  "metadata": { ... }
}
```

---

### GET /api/tasks/[id]

Get task details.

**Auth:** Required
**Response:** 200 OK

---

### PUT /api/tasks/[id]

Update task.

**Auth:** Required
**Response:** 200 OK

---

### POST /api/tasks/[id]/reprocess

Reprocess failed task.

**Auth:** Required
**Response:** 200 OK

---

### POST /api/tasks/[id]/override

Override task decision.

**Auth:** Required (ADMIN)
**Body:**

```json
{
  "decision": "APPROVED",
  "reason": "Manual override based on business rules"
}
```

---

### GET /api/decisions/[taskId]

Get decisions for task.

**Auth:** Required
**Response:** 200 OK

---

### GET /api/task-templates

List task templates.

**Auth:** Required
**Response:** 200 OK

---

## Additional Endpoints

### GET /api/health

Health check endpoint.

**Auth:** None
**Response:** 200 OK

```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:00:00Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "openai": "configured",
    "anthropic": "configured"
  }
}
```

---

### GET /api/dashboard/stats

Get dashboard statistics.

**Auth:** Required
**Response:** 200 OK

```json
{
  "intake": {
    "total": 150,
    "new": 10,
    "processing": 5
  },
  "pipelines": {
    "active": 3,
    "totalItems": 45
  },
  "documents": {
    "total": 100,
    "processing": 2
  }
}
```

---

### GET /api/contact

Public contact endpoint.

**Auth:** None
**Response:** 200 OK

---

### POST /api/contact

Submit contact form.

**Auth:** None
**Body:**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "message": "I have a question..."
}
```

---

### GET /api/integrations

List integrations.

**Auth:** Required
**Response:** 200 OK

---

### GET /api/integrations/[provider]/[id]

Get integration details.

**Auth:** Required
**Response:** 200 OK

---

### GET /api/integrations/[provider]/oauth/callback

OAuth callback for integrations.

**Auth:** None
**Response:** Redirect

---

### GET /api/user/preferences

Get user preferences.

**Auth:** Required
**Response:** 200 OK

---

### PUT /api/user/preferences

Update user preferences.

**Auth:** Required
**Response:** 200 OK

---

## WebSocket Events

For real-time updates, Astralis uses event-driven architecture via internal event bus. WebSocket support is planned for future releases.

### Event Types

- `intake:created` - New intake request
- `intake:updated` - Intake status changed
- `pipeline:item:moved` - Item moved between stages
- `document:processed` - Document OCR completed
- `chat:message` - New chat message
- `agent:decision` - Agent made decision
- `automation:executed` - Automation completed

---

## SDK Examples

### JavaScript/TypeScript

```typescript
// Initialize client
const astralis = new AstralisClient({
  baseUrl: 'https://astralisone.com/api',
  apiKey: process.env.ASTRALIS_API_KEY
});

// Create intake request
const intake = await astralis.intake.create({
  source: 'API',
  title: 'Support Request',
  description: 'Customer needs help',
  orgId: 'org_123',
  priority: 2
});

// Process with agent
const decision = await astralis.agent.process({
  source: 'API',
  type: 'support_request',
  content: 'Customer needs urgent help with billing',
  metadata: {
    senderEmail: 'customer@example.com',
    priorityHint: 5
  }
});

// Upload document
const document = await astralis.documents.upload({
  file: fileBuffer,
  description: 'Contract document'
});

// Chat with document
const response = await astralis.chat.send({
  documentId: document.id,
  message: 'What are the key terms?'
});
```

### Python

```python
from astralis import AstralisClient

# Initialize
client = AstralisClient(
    base_url='https://astralisone.com/api',
    api_key=os.getenv('ASTRALIS_API_KEY')
)

# Create intake
intake = client.intake.create(
    source='API',
    title='Support Request',
    org_id='org_123'
)

# Process with agent
decision = client.agent.process(
    source='API',
    type='support_request',
    content='Customer inquiry',
    metadata={'priority': 3}
)
```

### cURL

```bash
# Create intake request
curl -X POST https://astralisone.com/api/intake \
  -H "Content-Type: application/json" \
  -d '{
    "source": "API",
    "title": "Support Request",
    "orgId": "org_123",
    "priority": 2
  }'

# Process with agent
curl -X POST https://astralisone.com/api/agent/process \
  -H "Content-Type: application/json" \
  -d '{
    "source": "API",
    "type": "support_request",
    "content": "Customer inquiry"
  }'

# Upload document
curl -X POST https://astralisone.com/api/documents/upload \
  -H "Authorization: Bearer $SESSION_TOKEN" \
  -F "file=@document.pdf" \
  -F "description=Contract"
```

---

## Support & Resources

- **Documentation**: https://docs.astralisone.com
- **Status Page**: https://status.astralisone.com
- **Support Email**: support@astralisone.com
- **GitHub Issues**: https://github.com/astralisone/astralis-nextjs/issues

---

## Changelog

### v1.0 (2025-01-15)
- Initial API release
- 88+ endpoints across 10 categories
- Agent orchestration system
- RAG-powered chat
- Calendar management with conflict detection
- n8n automation integration

---

**End of API Documentation**

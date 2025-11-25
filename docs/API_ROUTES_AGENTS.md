# Agent API Routes

Multi-agent orchestration system for AI-powered decision making, scheduling, and task management.

## Table of Contents
- [Agent Initialization](#agent-initialization)
- [Agent Analytics](#agent-analytics)
- [Agent Availability](#agent-availability)
- [Agent Configuration](#agent-configuration)
- [Agent Decisions](#agent-decisions)
- [Agent Inbox](#agent-inbox)
- [Agent Processing](#agent-processing)
- [Agent Suggestions](#agent-suggestions)

---

## Agent Initialization

Initialize a new orchestration agent instance.

**Endpoint**: `POST /api/agent/init`
**Auth**: Required
**Description**: Creates and configures a new orchestration agent with LLM settings and capabilities.

### Request Body
```json
{
  "orgId": "org_123456",
  "name": "Sales Pipeline Agent",
  "llmProvider": "OPENAI" | "CLAUDE",
  "llmModel": "gpt-4-turbo" | "claude-sonnet-4-20250514",
  "systemPrompt": "You are an AI agent that helps route sales inquiries...",
  "temperature": 0.3,
  "maxTokens": 2000,
  "capabilities": {
    "canAssignPipelines": true,
    "canCreateEvents": true,
    "canSendNotifications": true,
    "canTriggerAutomations": true
  }
}
```

### Response
```json
{
  "success": true,
  "agent": {
    "id": "agent_abc123",
    "orgId": "org_123456",
    "name": "Sales Pipeline Agent",
    "llmProvider": "OPENAI",
    "llmModel": "gpt-4-turbo",
    "isActive": true,
    "createdAt": "2024-11-24T10:00:00Z"
  }
}
```

### Error Codes
- `400`: Invalid request body or missing required fields
- `401`: Unauthorized - invalid or missing API token
- `403`: Forbidden - insufficient permissions
- `500`: Internal server error

---

## Agent Analytics

Retrieve analytics and performance metrics for agent operations.

**Endpoint**: `GET /api/agent/analytics`
**Auth**: Required
**Query Parameters**:
- `agentId` (optional): Filter by specific agent
- `startDate` (optional): Start date for metrics (ISO 8601)
- `endDate` (optional): End date for metrics (ISO 8601)

### Response
```json
{
  "totalDecisions": 1247,
  "successfulDecisions": 1189,
  "failedDecisions": 58,
  "averageConfidence": 0.87,
  "averageExecutionTime": 342,
  "decisionsByType": {
    "ASSIGN_PIPELINE": 523,
    "CREATE_EVENT": 312,
    "SEND_NOTIFICATION": 245,
    "TRIGGER_AUTOMATION": 167
  },
  "topAgents": [
    {
      "id": "agent_abc123",
      "name": "Sales Pipeline Agent",
      "totalDecisions": 523,
      "successRate": 0.96
    }
  ]
}
```

---

## Agent Availability

Check agent availability and status.

**Endpoint**: `GET /api/agent/availability`
**Auth**: Required
**Query Parameters**:
- `agentId` (required): Agent ID to check

### Response
```json
{
  "agentId": "agent_abc123",
  "isAvailable": true,
  "status": "active",
  "currentLoad": 12,
  "maxLoad": 100,
  "lastActivity": "2024-11-24T10:30:00Z"
}
```

---

## Agent Configuration

Retrieve agent configuration settings.

**Endpoint**: `GET /api/agent/config`
**Auth**: Required
**Query Parameters**:
- `agentId` (required): Agent ID

### Response
```json
{
  "id": "agent_abc123",
  "name": "Sales Pipeline Agent",
  "llmProvider": "OPENAI",
  "llmModel": "gpt-4-turbo",
  "systemPrompt": "You are an AI agent...",
  "temperature": 0.3,
  "maxTokens": 2000,
  "capabilities": {
    "canAssignPipelines": true,
    "canCreateEvents": true,
    "canSendNotifications": true,
    "canTriggerAutomations": true
  },
  "rateLimits": {
    "maxActionsPerMinute": 60,
    "maxActionsPerHour": 500
  }
}
```

---

## Agent Decisions

### List Agent Decisions

Get a list of all decisions made by agents.

**Endpoint**: `GET /api/agent/decisions`
**Auth**: Required
**Query Parameters**:
- `agentId` (optional): Filter by agent
- `status` (optional): Filter by status (PENDING, EXECUTED, FAILED, REJECTED)
- `limit` (optional): Number of results (default: 50, max: 100)
- `offset` (optional): Pagination offset

### Response
```json
{
  "decisions": [
    {
      "id": "decision_xyz789",
      "agentId": "agent_abc123",
      "inputSource": "EMAIL",
      "inputType": "contact_form_submitted",
      "decisionType": "ASSIGN_PIPELINE",
      "confidence": 0.92,
      "reasoning": "Based on the inquiry content mentioning 'enterprise solution', this should be routed to the Enterprise Sales pipeline.",
      "status": "EXECUTED",
      "createdAt": "2024-11-24T10:15:00Z",
      "executedAt": "2024-11-24T10:15:02Z",
      "executionTime": 1842
    }
  ],
  "pagination": {
    "total": 1247,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

### Get Single Decision

**Endpoint**: `GET /api/agent/decisions/[id]`
**Auth**: Required

### Response
```json
{
  "id": "decision_xyz789",
  "agentId": "agent_abc123",
  "orgId": "org_123456",
  "inputSource": "EMAIL",
  "inputType": "contact_form_submitted",
  "inputData": {
    "from": "client@example.com",
    "subject": "Enterprise Solution Inquiry",
    "body": "We're interested in your enterprise automation platform..."
  },
  "llmPrompt": "Analyze this inquiry and determine the appropriate pipeline...",
  "llmResponse": "This is an enterprise-level inquiry...",
  "confidence": 0.92,
  "reasoning": "Based on the inquiry content...",
  "decisionType": "ASSIGN_PIPELINE",
  "actions": [
    {
      "type": "assign_to_pipeline",
      "pipelineId": "pipeline_enterprise",
      "priority": 5
    }
  ],
  "status": "EXECUTED",
  "executionTime": 1842,
  "createdAt": "2024-11-24T10:15:00Z",
  "executedAt": "2024-11-24T10:15:02Z"
}
```

### Approve Decision

Manually approve a pending decision.

**Endpoint**: `POST /api/agent/decisions/[id]/approve`
**Auth**: Required (Admin only)

### Response
```json
{
  "success": true,
  "decision": {
    "id": "decision_xyz789",
    "status": "EXECUTED",
    "approvedBy": "user_admin123",
    "approvedAt": "2024-11-24T10:20:00Z"
  }
}
```

### Reject Decision

Reject a pending decision.

**Endpoint**: `POST /api/agent/decisions/[id]/reject`
**Auth**: Required (Admin only)

### Request Body
```json
{
  "reason": "Incorrect pipeline assignment - should be routed to SMB sales"
}
```

### Response
```json
{
  "success": true,
  "decision": {
    "id": "decision_xyz789",
    "status": "REJECTED",
    "rejectedBy": "user_admin123",
    "rejectedAt": "2024-11-24T10:20:00Z",
    "rejectionReason": "Incorrect pipeline assignment..."
  }
}
```

---

## Agent Inbox

### Get Inbox Tasks

Retrieve pending agent tasks from the inbox.

**Endpoint**: `GET /api/agent/inbox`
**Auth**: Required
**Query Parameters**:
- `status` (optional): Filter by task status
- `taskType` (optional): Filter by task type
- `priority` (optional): Filter by priority (1-5)
- `limit` (optional): Number of results (default: 50)

### Response
```json
{
  "tasks": [
    {
      "id": "task_123",
      "source": "EMAIL",
      "taskType": "SCHEDULE_MEETING",
      "status": "PENDING",
      "priority": 4,
      "rawContent": "Can we schedule a demo for next Tuesday at 2pm?",
      "intent": "Schedule product demo",
      "confidence": 0.89,
      "createdAt": "2024-11-24T09:30:00Z"
    }
  ],
  "total": 15
}
```

### Get Single Inbox Task

**Endpoint**: `GET /api/agent/inbox/[taskId]`
**Auth**: Required

### Response
```json
{
  "id": "task_123",
  "userId": "user_456",
  "orgId": "org_789",
  "source": "EMAIL",
  "sourceId": "email_abc123",
  "rawContent": "Can we schedule a demo for next Tuesday at 2pm?",
  "taskType": "SCHEDULE_MEETING",
  "intent": "Schedule product demo for next Tuesday",
  "entities": {
    "date": "2024-11-28",
    "time": "14:00",
    "duration": 60,
    "participants": ["client@example.com"],
    "subject": "Product Demo",
    "meetingType": "video_call"
  },
  "priority": 4,
  "confidence": 0.89,
  "status": "PENDING",
  "proposedSlots": [
    {
      "startTime": "2024-11-28T14:00:00Z",
      "endTime": "2024-11-28T15:00:00Z",
      "confidence": 0.95
    }
  ],
  "aiMetadata": {
    "model": "gpt-4-turbo",
    "tokensUsed": 245,
    "processingTime": 892
  },
  "createdAt": "2024-11-24T09:30:00Z",
  "processedAt": "2024-11-24T09:30:01Z"
}
```

---

## Agent Processing

Process raw input through the agent system.

**Endpoint**: `POST /api/agent/process`
**Auth**: Required
**Description**: Submit raw input for AI agent processing and decision-making.

### Request Body
```json
{
  "source": "EMAIL" | "FORM" | "CHAT" | "API" | "SMS" | "VOICE",
  "sourceId": "email_abc123",
  "content": "I need to schedule a meeting with the sales team to discuss enterprise pricing for 500 users.",
  "metadata": {
    "from": "client@example.com",
    "subject": "Enterprise Pricing Discussion",
    "timestamp": "2024-11-24T09:00:00Z"
  },
  "userId": "user_456",
  "orgId": "org_789"
}
```

### Response
```json
{
  "success": true,
  "task": {
    "id": "task_123",
    "status": "PROCESSING",
    "taskType": "SCHEDULE_MEETING",
    "confidence": 0.89,
    "estimatedCompletionTime": "2024-11-24T09:01:00Z"
  }
}
```

### Processing Flow
1. Input received and validated
2. AI classification determines task type and intent
3. Entities extracted (dates, times, people, etc.)
4. Task queued for appropriate agent
5. Agent makes decision based on context
6. Actions executed (create event, send notification, etc.)
7. Confirmation sent to user

---

## Agent Suggestions

Get AI-powered suggestions for actions.

**Endpoint**: `POST /api/agent/suggest`
**Auth**: Required
**Description**: Get suggestions for actions based on context without executing them.

### Request Body
```json
{
  "context": {
    "type": "intake_request",
    "data": {
      "title": "Need help with API integration",
      "description": "Our team is trying to integrate your API but facing authentication issues...",
      "source": "contact_form"
    }
  },
  "suggestionType": "pipeline_assignment" | "scheduling" | "automation_trigger"
}
```

### Response
```json
{
  "suggestions": [
    {
      "type": "ASSIGN_PIPELINE",
      "confidence": 0.94,
      "reasoning": "The inquiry mentions API integration issues, which should be routed to Technical Support pipeline",
      "action": {
        "pipelineId": "pipeline_technical_support",
        "priority": 4,
        "estimatedResolutionTime": "4 hours"
      },
      "alternativeOptions": [
        {
          "pipelineId": "pipeline_enterprise_support",
          "confidence": 0.72,
          "reasoning": "Could also be enterprise-level support if client is on enterprise plan"
        }
      ]
    }
  ]
}
```

---

## Example Usage

### Complete Agent Workflow

```bash
# 1. Initialize Agent
curl -X POST http://localhost:3001/api/agent/init \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "orgId": "org_123",
    "name": "Sales Agent",
    "llmProvider": "OPENAI",
    "llmModel": "gpt-4-turbo",
    "systemPrompt": "You are a sales routing agent..."
  }'

# 2. Process Incoming Request
curl -X POST http://localhost:3001/api/agent/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "source": "EMAIL",
    "content": "Need enterprise solution for 500 users",
    "metadata": {"from": "client@example.com"}
  }'

# 3. Check Decision Status
curl -X GET "http://localhost:3001/api/agent/decisions/decision_xyz" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. View Analytics
curl -X GET "http://localhost:3001/api/agent/analytics?startDate=2024-11-01" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Rate Limits

- **Default**: 60 requests/minute per agent
- **Burst**: 100 requests/minute for short periods
- **Daily**: 10,000 decisions per agent per day

---

## Webhooks

Agents can trigger webhooks on decision execution:

```json
{
  "event": "agent.decision.executed",
  "timestamp": "2024-11-24T10:15:02Z",
  "data": {
    "decisionId": "decision_xyz789",
    "agentId": "agent_abc123",
    "decisionType": "ASSIGN_PIPELINE",
    "status": "EXECUTED"
  }
}
```

---

## Best Practices

1. **System Prompts**: Write clear, specific prompts that define agent behavior
2. **Confidence Thresholds**: Set minimum confidence levels for auto-execution
3. **Human Review**: Require approval for high-impact decisions
4. **Monitoring**: Track agent performance and adjust prompts as needed
5. **Rate Limiting**: Respect rate limits to avoid throttling
6. **Error Handling**: Implement retry logic for failed decisions
7. **Logging**: Log all agent decisions for audit trails

---

## Related Documentation

- [Multi-Agent System Architecture](./MULTI_AGENT_SYSTEM.md)
- [Orchestration Agent Plan](./ORCHESTRATION_AGENT_PLAN.md)
- [API Routes Index](./API_ROUTES_INDEX.md)

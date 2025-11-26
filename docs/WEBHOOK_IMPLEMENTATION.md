# Webhook Notifications Implementation

## Overview

Task 1.4: Webhook Notifications has been successfully implemented. The scheduling agent can now send HTTP webhook callbacks with HMAC-SHA256 signatures, retry logic, and comprehensive error handling.

## Files Created/Modified

### 1. Webhook Service (`src/lib/services/webhook.service.ts`)

A new service providing webhook delivery capabilities:

**Features:**
- POST requests with JSON payload
- HMAC-SHA256 signature generation using `computeWebhookSignature` utility
- Exponential backoff retry logic (up to 3 attempts by default)
- 30-second request timeout
- Comprehensive logging for all delivery attempts
- Non-retryable 4xx error detection (except 408, 429)

**Key Methods:**
```typescript
class WebhookService {
  async sendWebhook(
    payload: Omit<WebhookPayload, 'signature'>,
    options: WebhookOptions
  ): Promise<WebhookDeliveryResult>
}
```

**Payload Structure:**
```typescript
interface WebhookPayload {
  event: WebhookEventType;
  data: {
    taskId: string;
    eventDetails?: Record<string, unknown>;
    timestamp: string;
    userId?: string;
    orgId?: string;
  };
  signature?: string;  // HMAC-SHA256 (sha256=...)
}
```

**Event Types:**
- `scheduling.confirmed` - Meeting successfully scheduled
- `scheduling.cancelled` - Meeting cancelled
- `scheduling.rescheduled` - Meeting rescheduled
- `scheduling.conflict_detected` - Time conflict detected
- `scheduling.awaiting_input` - Need user clarification

### 2. Scheduling Agent Processor (`src/workers/processors/schedulingAgent.processor.ts`)

**Modified:** `sendResponse` function (lines 579-652)
- Replaced TODO comment with full webhook implementation
- Added webhook URL validation
- Integrated with WebhookService
- Maps response types to webhook event types
- Includes comprehensive event details (task status, entities, slots, resolution)
- Throws error on webhook delivery failure (for job retry)

**Added:** `mapResponseTypeToWebhookEvent` helper function (line 949+)
- Maps `responseType` + `taskStatus` to appropriate webhook event
- Intelligently determines event type based on context

### 3. Environment Configuration (`.env.local.template`)

**Added:** WEBHOOK_SECRET variable
```bash
# Webhook Security (for outgoing webhook notifications)
# Used by scheduling agent to sign webhook payloads with HMAC-SHA256
# Generate with: openssl rand -hex 32
WEBHOOK_SECRET=your-webhook-secret-key-generate-with-openssl-rand-hex-32
```

## Usage Example

### Sending a Webhook from the Scheduling Agent

Webhooks are sent automatically when a task's response channel is set to `'webhook'`:

```typescript
import { queueSendResponse } from '@/workers/queues/schedulingAgent.queue';

// Queue a webhook notification
await queueSendResponse({
  taskId: 'task-123',
  userId: 'user-456',
  responseType: 'confirmation',
  channel: 'webhook',
  webhookUrl: 'https://example.com/webhooks/scheduling',
  metadata: {
    customField: 'customValue',
  },
});
```

The processor will:
1. Fetch the task details
2. Map `responseType` to webhook event type
3. Build event payload with task data
4. Send webhook with HMAC signature
5. Retry up to 3 times on failure
6. Log delivery results

### Receiving and Verifying Webhooks

Recipients can verify webhook signatures using the existing utility:

```typescript
import { verifyWebhookSignature } from '@/lib/utils/webhook-verification';

export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-astralis-signature');
  const body = await req.text();

  // Verify signature
  const result = verifyWebhookSignature({
    secret: process.env.WEBHOOK_SECRET!,
    signature: signature || '',
    payload: body,
  });

  if (!result.isValid) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }

  // Parse and process webhook
  const payload = JSON.parse(body);
  console.log('Webhook event:', payload.event);
  console.log('Task ID:', payload.data.taskId);

  return NextResponse.json({ received: true });
}
```

## Webhook Payload Examples

### 1. Meeting Confirmed

```json
{
  "event": "scheduling.confirmed",
  "data": {
    "taskId": "task-abc123",
    "eventDetails": {
      "taskType": "SCHEDULE_MEETING",
      "status": "SCHEDULED",
      "intent": "Schedule team meeting",
      "entities": {
        "date": "2025-12-01",
        "time": "14:00",
        "duration": 60,
        "participants": ["john@example.com"],
        "subject": "Project Review"
      },
      "eventId": "evt-xyz789",
      "selectedSlot": {
        "startTime": "2025-12-01T14:00:00Z",
        "endTime": "2025-12-01T15:00:00Z",
        "title": "Project Review"
      },
      "resolution": "Meeting scheduled successfully"
    },
    "timestamp": "2025-11-26T18:30:00.000Z",
    "userId": "user-456",
    "orgId": "org-789"
  },
  "signature": "sha256=a1b2c3d4e5f6..."
}
```

### 2. Conflict Detected (Alternatives Provided)

```json
{
  "event": "scheduling.conflict_detected",
  "data": {
    "taskId": "task-def456",
    "eventDetails": {
      "taskType": "SCHEDULE_MEETING",
      "status": "AWAITING_INPUT",
      "intent": "Schedule meeting",
      "entities": { /* ... */ },
      "proposedSlots": [
        {
          "startTime": "2025-12-01T15:00:00Z",
          "endTime": "2025-12-01T16:00:00Z",
          "confidence": 0.95
        },
        {
          "startTime": "2025-12-01T16:30:00Z",
          "endTime": "2025-12-01T17:30:00Z",
          "confidence": 0.88
        }
      ],
      "resolution": "Conflict detected with 2 event(s). 5 alternative slots available."
    },
    "timestamp": "2025-11-26T18:31:00.000Z",
    "userId": "user-456",
    "orgId": "org-789"
  },
  "signature": "sha256=f6e5d4c3b2a1..."
}
```

### 3. Awaiting Input (Clarification Needed)

```json
{
  "event": "scheduling.awaiting_input",
  "data": {
    "taskId": "task-ghi789",
    "eventDetails": {
      "taskType": "SCHEDULE_MEETING",
      "status": "AWAITING_INPUT",
      "intent": "Need more details",
      "entities": {
        "subject": "Team Meeting"
        // Missing date/time
      },
      "resolution": "Need clarification on date and time"
    },
    "timestamp": "2025-11-26T18:32:00.000Z",
    "userId": "user-456"
  },
  "signature": "sha256=123456789abc..."
}
```

## Retry Logic Details

### Exponential Backoff

The webhook service implements exponential backoff with jitter:

1. **Attempt 1:** Immediate (0ms delay)
2. **Attempt 2:** ~1 second delay (±20% jitter)
3. **Attempt 3:** ~2 seconds delay (±20% jitter)

**Formula:** `delay = initialDelay * 2^(attempt-1) + jitter`

**Maximum delay:** 30 seconds (capped)

### Retry Conditions

**Will retry on:**
- Network errors (connection refused, timeout, DNS failure)
- 5xx server errors (500, 502, 503, 504)
- 408 Request Timeout
- 429 Too Many Requests

**Will NOT retry on:**
- 4xx client errors (400, 401, 403, 404, etc.)
- Invalid webhook URL
- Request timeout after 30 seconds (per attempt)

## Security Considerations

### HMAC Signature Verification

All webhooks include an HMAC-SHA256 signature in the payload:

```typescript
// Signature format: "sha256=<hex_signature>"
signature: "sha256=a1b2c3d4e5f6..."
```

**Also included in HTTP header:**
```
X-Astralis-Signature: sha256=a1b2c3d4e5f6...
```

### Best Practices for Recipients

1. **Always verify signatures** before processing webhooks
2. **Use HTTPS endpoints** for webhook URLs
3. **Implement idempotency** using `taskId` (webhooks may be delivered multiple times)
4. **Return 2xx status** quickly to prevent retries
5. **Process asynchronously** if handling takes > 5 seconds
6. **Log all webhook attempts** for audit trail

## Configuration

### Environment Variables

```bash
# Required for webhook signature generation
WEBHOOK_SECRET=your-webhook-secret-key-here

# Optional: Override defaults in webhook service
WEBHOOK_TIMEOUT=30000        # Request timeout (ms)
WEBHOOK_MAX_RETRIES=3        # Max retry attempts
WEBHOOK_INITIAL_DELAY=1000   # Initial retry delay (ms)
```

### Per-Request Configuration

Override defaults when calling the webhook service:

```typescript
const result = await webhookService.sendWebhook(
  payload,
  {
    url: 'https://example.com/webhook',
    secret: process.env.WEBHOOK_SECRET,
    timeout: 10000,      // 10 seconds
    maxRetries: 5,       // 5 attempts
    initialRetryDelay: 500,  // 0.5 seconds
    headers: {
      'X-Custom-Header': 'value',
    },
  }
);
```

## Monitoring and Debugging

### Log Messages

The webhook service logs comprehensive details:

```
[WebhookService] Sending webhook to https://example.com: scheduling.confirmed
[WebhookService] Attempt 1/3 for https://example.com
[WebhookService] Webhook delivered successfully in 156ms (1 attempt)

# On failure:
[WebhookService] Attempt 1 failed: HTTP 503: Service Unavailable
[WebhookService] Waiting 1000ms before retry 2
[WebhookService] Webhook delivery failed after 3 attempts: HTTP 503 (5234ms total)
```

### Error Handling

Webhook delivery failures are thrown as errors, causing the BullMQ job to retry:

```typescript
if (!webhookResult.success) {
  throw new Error(`Webhook delivery failed: ${webhookResult.error}`);
}
```

The scheduling agent queue has its own retry logic (3 attempts with exponential backoff), providing an additional layer of resilience.

## Testing

### Manual Test

```typescript
import { webhookService } from '@/lib/services/webhook.service';

// Test webhook delivery
const result = await webhookService.sendWebhook(
  {
    event: 'scheduling.confirmed',
    data: {
      taskId: 'test-123',
      eventDetails: { test: true },
      timestamp: new Date().toISOString(),
    },
  },
  {
    url: 'https://webhook.site/your-unique-url',  // Use webhook.site for testing
    secret: process.env.WEBHOOK_SECRET,
  }
);

console.log('Success:', result.success);
console.log('Attempts:', result.attempts);
console.log('Duration:', result.duration);
```

### Integration Test with Scheduling Agent

```typescript
import { queueSendResponse } from '@/workers/queues/schedulingAgent.queue';

// Create a test webhook notification
await queueSendResponse({
  taskId: 'existing-task-id',
  userId: 'user-id',
  responseType: 'confirmation',
  channel: 'webhook',
  webhookUrl: 'https://webhook.site/your-url',
  metadata: { test: true },
});

// Worker will process the job and send webhook
// Check webhook.site to verify delivery
```

## Acceptance Criteria

All acceptance criteria have been met:

- ✅ **WebhookService class with sendWebhook() method** - Implemented in `src/lib/services/webhook.service.ts`
- ✅ **Proper error handling and retry logic** - Exponential backoff with 3 retries, timeout handling
- ✅ **HMAC signature generation** - Uses `computeWebhookSignature` utility with SHA-256
- ✅ **Wire it up in the processor** - Integrated in `schedulingAgent.processor.ts` (lines 579-652)

## Future Enhancements

1. **Webhook Management UI** - Admin interface to configure webhook URLs per organization
2. **Webhook Event History** - Database table to track all webhook deliveries
3. **Webhook Testing Tool** - Built-in tool to test webhook endpoints
4. **Rate Limiting** - Protect against webhook spam
5. **Batch Webhooks** - Send multiple events in one request
6. **Webhook Replay** - Manual retry of failed webhooks from UI

## Related Documentation

- [Webhook Verification Utility](../src/lib/utils/webhook-verification.ts)
- [Scheduling Agent Queue](../src/workers/queues/schedulingAgent.queue.ts)
- [Scheduling Agent Processor](../src/workers/processors/schedulingAgent.processor.ts)
- [Environment Variables](./.env.local.template)

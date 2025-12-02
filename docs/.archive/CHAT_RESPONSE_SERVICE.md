# Chat Response Service - Implementation Guide

## Overview

The Chat Response Service provides real-time chat messaging for the scheduling agent with graceful fallback mechanisms. It supports multiple delivery methods:

1. **Pusher** (real-time WebSocket delivery, if configured)
2. **Database storage** (for polling/retrieval, always enabled)

The system is designed to never crash if Pusher is not configured - messages are always stored in the database as a fallback.

## Architecture

### Files Created/Modified

1. **Database Schema** (`prisma/schema.prisma`)
   - Added `ChatMessageType` enum
   - Added `ChatMessage` model for message storage

2. **Migration** (`prisma/migrations/20251126000000_add_chat_messages/migration.sql`)
   - Creates `chat_messages` table and enum

3. **Chat Response Service** (`src/lib/services/chat-response.service.ts`)
   - Core service for sending and retrieving chat messages
   - Handles Pusher integration (optional)
   - Handles database storage (always enabled)

4. **API Routes**
   - `src/app/api/chat-messages/route.ts` - Get unread messages, mark as read
   - `src/app/api/chat-messages/[taskId]/route.ts` - Get task-specific messages

5. **Scheduling Agent Processor** (`src/workers/processors/schedulingAgent.processor.ts`)
   - Integrated chat message sending for 'chat' channel

6. **Environment Template** (`.env.local.template`)
   - Added Pusher configuration variables (optional)

## Database Schema

### ChatMessage Model

```prisma
enum ChatMessageType {
  SCHEDULING_UPDATE
  CONFIRMATION
  CLARIFICATION
  CANCELLATION
  ERROR
  INFO
}

model ChatMessage {
  id        String          @id @default(cuid())
  userId    String
  orgId     String?
  taskId    String?         // Related SchedulingAgentTask ID
  type      ChatMessageType
  content   String          @db.Text
  data      Json?           // Additional structured data
  read      Boolean         @default(false)
  createdAt DateTime        @default(now())

  @@index([userId, createdAt])
  @@index([taskId])
  @@index([read])
  @@map("chat_messages")
}
```

## Environment Variables (Optional)

Add to `.env.local` to enable Pusher real-time delivery:

```bash
# Pusher configuration (optional - if not set, falls back to database only)
PUSHER_APP_ID="your-app-id"
PUSHER_KEY="your-pusher-key"
PUSHER_SECRET="your-pusher-secret"
PUSHER_CLUSTER="us2"  # or eu, ap-southeast-1, etc.
```

**Get credentials**: https://dashboard.pusher.com/

## Service API

### Send Chat Message

```typescript
import * as chatResponseService from '@/lib/services/chat-response.service';

const result = await chatResponseService.sendChatMessage(
  {
    type: 'confirmation',
    taskId: 'task_123',
    userId: 'user_456',
    content: 'Your meeting has been scheduled successfully.',
    data: { eventId: 'event_789' },
    timestamp: new Date().toISOString(),
  },
  'org_abc' // optional
);

console.log(result);
// {
//   success: true,
//   pusherSent: true,      // true if Pusher is configured and successful
//   databaseStored: true,  // true if stored in database
//   messageId: 'msg_xyz',  // database message ID
// }
```

### Helper Functions

```typescript
// Send specific message types
await chatResponseService.sendSchedulingUpdate(taskId, userId, content, data, orgId);
await chatResponseService.sendConfirmation(taskId, userId, content, data, orgId);
await chatResponseService.sendClarification(taskId, userId, content, data, orgId);
await chatResponseService.sendCancellation(taskId, userId, content, data, orgId);
```

### Get Unread Messages

```typescript
const { messages, total } = await chatResponseService.getUnreadMessages(
  'user_456',
  50 // limit
);
```

### Mark Messages as Read

```typescript
const { count } = await chatResponseService.markMessagesAsRead(
  ['msg_1', 'msg_2', 'msg_3'],
  'user_456'
);
```

### Get Task Messages

```typescript
const { messages } = await chatResponseService.getTaskMessages(
  'task_123',
  'user_456'
);
```

## API Endpoints

### GET /api/chat-messages

Retrieve unread chat messages for the authenticated user.

**Query Parameters:**
- `limit` (optional): Number of messages to retrieve (1-100, default: 50)

**Response:**
```json
{
  "messages": [
    {
      "id": "msg_123",
      "type": "CONFIRMATION",
      "taskId": "task_456",
      "content": "Your meeting has been scheduled.",
      "data": { "eventId": "event_789" },
      "createdAt": "2025-11-26T10:30:00Z"
    }
  ],
  "total": 5,
  "hasMore": false
}
```

### POST /api/chat-messages/mark-read

Mark messages as read.

**Request Body:**
```json
{
  "messageIds": ["msg_1", "msg_2", "msg_3"]
}
```

**Response:**
```json
{
  "success": true,
  "markedCount": 3
}
```

### GET /api/chat-messages/[taskId]

Retrieve all chat messages for a specific task.

**Response:**
```json
{
  "taskId": "task_123",
  "messages": [
    {
      "id": "msg_1",
      "type": "SCHEDULING_UPDATE",
      "content": "Processing your request...",
      "data": {},
      "read": true,
      "createdAt": "2025-11-26T10:25:00Z"
    },
    {
      "id": "msg_2",
      "type": "CONFIRMATION",
      "content": "Meeting scheduled!",
      "data": { "eventId": "event_789" },
      "read": false,
      "createdAt": "2025-11-26T10:30:00Z"
    }
  ],
  "count": 2
}
```

## Integration with Scheduling Agent

The chat response service is integrated into the scheduling agent processor at line 716:

```typescript
case 'chat':
  // Build chat message based on response type
  const chatResult = await chatResponseService.sendChatMessage({
    type: responseType === 'error' ? 'error' : responseType,
    taskId,
    userId: data.userId,
    content: chatContent,
    data: chatData,
    timestamp: new Date().toISOString(),
  }, task.orgId || undefined);

  if (!chatResult.success) {
    throw new Error(`Chat message delivery failed: ${chatResult.error}`);
  }
  break;
```

## Message Types

| Type | Description | Use Case |
|------|-------------|----------|
| `SCHEDULING_UPDATE` | Status updates during processing | "Processing your request...", "Checking availability..." |
| `CONFIRMATION` | Successful completion | "Meeting scheduled successfully!" |
| `CLARIFICATION` | Request for more information | "Please provide a meeting title" |
| `CANCELLATION` | Cancellation notification | "Meeting cancelled" |
| `ERROR` | Error occurred | "Failed to schedule meeting" |
| `INFO` | General information | "Alternative slots available" |

## Message Flow

### With Pusher Configured

```
User makes scheduling request
         ↓
Scheduling Agent processes
         ↓
sendChatMessage() called
         ↓
    ┌────────────────┐
    │  Send to Pusher │ → WebSocket → User receives instantly
    └────────────────┘
         ↓
    ┌────────────────┐
    │ Store in DB    │ → Available for polling/history
    └────────────────┘
```

### Without Pusher (Database Only)

```
User makes scheduling request
         ↓
Scheduling Agent processes
         ↓
sendChatMessage() called
         ↓
    ┌────────────────┐
    │ Pusher check   │ → Not configured, skip gracefully
    └────────────────┘
         ↓
    ┌────────────────┐
    │ Store in DB    │ → Available for polling
    └────────────────┘
         ↓
User polls /api/chat-messages
         ↓
Receives messages
```

## Frontend Integration Examples

### With Pusher (Real-time)

```typescript
import Pusher from 'pusher-js';

// Initialize Pusher
const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  authEndpoint: '/api/pusher/auth',
});

// Subscribe to user's private channel
const channel = pusher.subscribe(`private-user-${userId}`);

// Listen for chat messages
channel.bind('chat-message', (message: any) => {
  console.log('New message:', message);
  // Update UI with new message
});
```

### Without Pusher (Polling)

```typescript
// Poll for unread messages every 5 seconds
useEffect(() => {
  const pollMessages = async () => {
    const response = await fetch('/api/chat-messages?limit=50');
    const data = await response.json();

    if (data.messages.length > 0) {
      // Update UI with new messages
      setMessages(data.messages);

      // Mark as read
      await fetch('/api/chat-messages/mark-read', {
        method: 'POST',
        body: JSON.stringify({
          messageIds: data.messages.map((m: any) => m.id)
        }),
      });
    }
  };

  const interval = setInterval(pollMessages, 5000);
  return () => clearInterval(interval);
}, []);
```

## Error Handling

The service is designed to be resilient:

1. **Pusher not configured**: Logs info message, continues with database storage
2. **Pusher send fails**: Logs error, continues with database storage
3. **Database storage fails**: Logs error, returns error to caller
4. **All methods fail**: Returns error but doesn't crash the system

## Migration

To apply the database migration:

```bash
# Development
npx prisma migrate dev

# Production
npx prisma migrate deploy
```

## Testing

### Manual Test (Development)

```typescript
// In a worker or API route
import * as chatResponseService from '@/lib/services/chat-response.service';

const result = await chatResponseService.sendChatMessage({
  type: 'confirmation',
  taskId: 'test_task',
  userId: 'test_user',
  content: 'Test message',
  timestamp: new Date().toISOString(),
});

console.log('Send result:', result);

// Retrieve messages
const unread = await chatResponseService.getUnreadMessages('test_user', 10);
console.log('Unread messages:', unread);
```

### API Test

```bash
# Get unread messages
curl -X GET http://localhost:3001/api/chat-messages \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"

# Mark messages as read
curl -X POST http://localhost:3001/api/chat-messages/mark-read \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"messageIds": ["msg_1", "msg_2"]}'

# Get task messages
curl -X GET http://localhost:3001/api/chat-messages/task_123 \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

## Security Considerations

1. **Authentication**: All API endpoints require authentication via NextAuth session
2. **Authorization**: Users can only access their own messages (userId check)
3. **Rate Limiting**: Consider adding rate limiting for polling endpoints
4. **Private Channels**: Pusher uses private channels (requires auth endpoint)

## Performance

- Database queries use indexes on `userId`, `taskId`, and `read` fields
- Polling should be limited to reasonable intervals (5-10 seconds)
- Consider implementing pagination for large message volumes
- Pusher provides better UX with instant delivery (when configured)

## Future Enhancements

1. Add WebSocket fallback if Pusher is not available
2. Implement message retention policies (auto-delete old messages)
3. Add message priority levels
4. Support for message attachments
5. Real-time typing indicators
6. Read receipts with timestamps

## Troubleshooting

### Messages not appearing in real-time

- Check Pusher credentials in `.env.local`
- Verify Pusher is initialized correctly
- Check browser console for connection errors
- Test with polling endpoint to verify database storage works

### Database errors

- Ensure migration has been applied: `npx prisma migrate deploy`
- Check PostgreSQL connection
- Verify user has permissions on `chat_messages` table

### Import errors

- Run `npx prisma generate` to regenerate Prisma client
- Restart TypeScript server
- Clear Next.js cache: `rm -rf .next`

## Related Documentation

- [Scheduling Agent Documentation](./SCHEDULING_AGENT.md)
- [API Routes Documentation](./API_ROUTES.md)
- [Pusher Documentation](https://pusher.com/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)

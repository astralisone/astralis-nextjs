# AI Calendar Chat Feature

## Overview

The AI Calendar Chat feature provides a conversational interface for managing calendar events using natural language. Users can query their schedule, schedule meetings, find available time slots, and cancel events through a chat-based UI powered by OpenAI GPT-4.

## Architecture

### Components

1. **CalendarChatService** (`src/lib/services/calendarChat.service.ts`)
   - Core business logic for calendar operations
   - OpenAI function calling integration
   - Natural language processing
   - Intent classification and entity extraction

2. **API Endpoint** (`src/app/api/chat/calendar/route.ts`)
   - REST API for calendar chat requests
   - Authentication via NextAuth
   - Request validation with Zod
   - Error handling and logging

3. **UI Component** (`src/components/calendar/CalendarChatPanel.tsx`)
   - React chat interface
   - Message history display
   - Confirmation flow for destructive actions
   - Loading states and error handling

## Features

### Natural Language Queries

Users can interact with their calendar using everyday language:

**View Schedule**
- "What meetings do I have tomorrow?"
- "Show my schedule for next week"
- "What's on my calendar today?"

**Schedule Meetings**
- "Schedule a meeting with john@example.com next Tuesday at 2pm"
- "Book a 30-minute call with Sarah tomorrow at 10am"
- "Set up a meeting titled 'Project Review' on Friday at 3pm"

**Find Time Slots**
- "Find me 2 hours of focus time this week"
- "When am I available tomorrow?"
- "Show me open slots for a 1-hour meeting next week"

**Cancel Events**
- "Cancel my 3pm meeting"
- "Remove the meeting with John tomorrow"

### Confirmation Flow

For destructive actions (schedule, cancel, reschedule), the system requires explicit user confirmation:

1. User makes a request: "Schedule a meeting with john@example.com tomorrow at 2pm"
2. AI responds with details and asks for confirmation
3. User clicks "Confirm" or "Cancel"
4. Action is executed or cancelled

## Implementation Details

### OpenAI Function Calling

The service uses OpenAI's function calling feature to interpret user intent and extract entities:

**Available Functions:**
- `list_events` - List calendar events in a date range
- `check_availability` - Check availability or find free time slots
- `schedule_event` - Schedule a new calendar event
- `find_time_slots` - Find available time slots for meetings
- `cancel_event` - Cancel an existing calendar event

**Function Call Flow:**
```typescript
User Message → OpenAI GPT-4 → Function Call → Execute → Response
```

### Entity Extraction

The service extracts structured data from natural language:

- **Dates**: "tomorrow", "next Tuesday", "June 15th"
- **Times**: "2pm", "14:00", "morning"
- **Participants**: Email addresses
- **Duration**: "30 minutes", "1 hour", "2 hours"
- **Titles**: Inferred from context

### Date Parsing

Natural language date parsing using `date-fns`:

```typescript
"tomorrow" → addDays(new Date(), 1)
"next week" → addWeeks(new Date(), 1)
"next Tuesday" → next occurrence of Tuesday
"in 2 hours" → addHours(new Date(), 2)
```

### Calendar Integration

Currently integrates with:
- Consultations (from `consultations` table)
- Audit Bookings (from `audit_bookings` table)

**Future integrations:**
- Google Calendar API
- Microsoft Outlook Calendar
- Apple Calendar

## API Reference

### POST /api/chat/calendar

Send a calendar chat message.

**Request Body:**
```json
{
  "message": "What meetings do I have tomorrow?",
  "context": {
    "previousMessages": [
      { "role": "user", "content": "..." },
      { "role": "assistant", "content": "..." }
    ],
    "confirmed": false,
    "pendingAction": null
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Here are your 3 upcoming events:\n\n1. Team Standup...",
  "requiresConfirmation": false,
  "action": null,
  "data": {
    "events": [...]
  }
}
```

**Response (Confirmation Required):**
```json
{
  "success": true,
  "message": "I'll schedule the following event:\n\n**Meeting with John**...\n\nPlease confirm to proceed.",
  "requiresConfirmation": true,
  "action": {
    "type": "schedule_event",
    "data": {
      "title": "Meeting with John",
      "startDateTime": "2025-11-22T14:00:00Z",
      "duration": 60,
      "participants": ["john@example.com"]
    }
  }
}
```

**Error Response:**
```json
{
  "error": "Validation failed",
  "details": {
    "message": ["Message is required"]
  }
}
```

## Usage

### Basic Usage

```tsx
import { CalendarChatPanel } from '@/components/calendar/CalendarChatPanel';

function CalendarPage() {
  const session = useSession();

  return (
    <div className="h-screen">
      <CalendarChatPanel
        userId={session.user.id}
        orgId={session.user.orgId}
      />
    </div>
  );
}
```

### Custom Styling

```tsx
<CalendarChatPanel
  userId={userId}
  orgId={orgId}
  className="shadow-2xl"
/>
```

### Mobile Layout

```tsx
<div className="h-screen w-screen">
  <CalendarChatPanel
    userId={userId}
    orgId={orgId}
  />
</div>
```

## Configuration

### Environment Variables

Required:
```env
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3001
```

### OpenAI Model

Default model: `gpt-4-turbo-preview`

To change:
```typescript
// src/lib/services/calendarChat.service.ts
private chatModel = 'gpt-4-turbo-preview'; // Change here
```

### Business Hours

Default: 9 AM - 5 PM, Monday - Friday

To customize:
```typescript
// In findTimeSlots method
const businessHours = { start: 8, end: 18 }; // 8 AM - 6 PM
```

## Testing

### Manual Testing

1. Start the development server:
```bash
npm run dev
```

2. Navigate to the calendar chat page

3. Try example queries:
   - "What meetings do I have tomorrow?"
   - "Schedule a meeting with test@example.com next Tuesday at 2pm"
   - "Find me 2 hours this week"

### Storybook

View the component in Storybook:
```bash
npm run storybook
```

Navigate to: `Components > Calendar > CalendarChatPanel`

## Error Handling

### User-Facing Errors

- **Authentication**: "You must be signed in to use the calendar chat"
- **Validation**: "Message is required"
- **API Errors**: "I encountered an error: [details]. Please try again."

### Logging

All errors are logged to console with context:
```typescript
console.error('[CalendarChat] Process message error:', error);
```

## Performance

### Response Times

- Average: 2-4 seconds (OpenAI API call)
- Timeout: 30 seconds
- Retries: 2 attempts

### Optimization

- Message context limited to last 5 messages
- Business hours filtering for time slot searches
- Efficient database queries with indexes

## Security

### Authentication

- All requests require valid NextAuth session
- User ID and Org ID verified server-side
- No cross-user access possible

### Authorization

- Users can only access their own events
- Org-scoped data isolation
- Confirmation required for destructive actions

### Input Validation

- Zod schema validation on all inputs
- Message length limits (1000 characters)
- SQL injection prevention via Prisma

## Limitations

### Current Limitations

1. **Calendar Sources**: Only internal consultations and audit bookings
2. **Recurring Events**: Not supported yet
3. **Time Zones**: Currently uses UTC
4. **Multi-User Events**: Limited participant management
5. **Event Updates**: Cannot reschedule events yet

### Future Enhancements

- [ ] Google Calendar integration
- [ ] Recurring event support
- [ ] Timezone detection and conversion
- [ ] Advanced participant management
- [ ] Event rescheduling
- [ ] Calendar sharing
- [ ] Meeting room booking
- [ ] Video conference integration
- [ ] Email notifications
- [ ] Calendar analytics

## Troubleshooting

### "OpenAI API timeout"

**Solution**: Increase timeout in service constructor:
```typescript
this.openai = new OpenAI({
  timeout: 60000, // 60 seconds
});
```

### "Event not found"

**Cause**: User doesn't have permission or event doesn't exist

**Solution**: Verify userId and orgId match event ownership

### "No available time slots"

**Cause**: Calendar is fully booked during search period

**Solution**: Expand date range or adjust business hours

## Support

For issues or questions:
- Check console logs for detailed error messages
- Review API responses in Network tab
- Consult `docs/CALENDAR_CHAT.md` (this file)
- Contact development team

## Version History

### v1.0.0 (2025-11-21)
- Initial release
- Natural language calendar queries
- Event scheduling with confirmation
- Time slot finding
- Event cancellation
- OpenAI GPT-4 integration

# Phase 5 Calendar & Scheduling API Routes

Complete implementation of all API endpoints for calendar integration and scheduling functionality.

## Summary

All 10 API routes have been implemented with:
- NextAuth authentication
- Zod validation
- Proper error handling
- Consistent response formats
- Production-ready code

## API Endpoints

### 1. Calendar Connection

#### POST /api/calendar/connect
Initiates Google Calendar OAuth flow.

**Authentication:** Required

**Request:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?...",
    "message": "Redirect user to this URL to authorize Google Calendar access"
  }
}
```

**File:** `/src/app/api/calendar/connect/route.ts`

---

#### GET /api/calendar/callback
Handles Google Calendar OAuth callback.

**Authentication:** Not required (validated via OAuth state)

**Query Parameters:**
- `code` (string): Authorization code from Google
- `state` (string): User ID for validation
- `error` (string, optional): OAuth error if user denied access

**Response:** Redirects to `/calendar/connections?success=true` or `/calendar/connections?error=...`

**File:** `/src/app/api/calendar/callback/route.ts`

---

### 2. Calendar Management

#### POST /api/calendar/disconnect
Disconnects a Google Calendar integration.

**Authentication:** Required

**Request:**
```json
{
  "connectionId": "clx123456789"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Calendar disconnected successfully"
}
```

**Errors:**
- 401: Unauthorized
- 403: Permission denied
- 404: Connection not found

**File:** `/src/app/api/calendar/disconnect/route.ts`

---

#### POST /api/calendar/sync
Manually triggers calendar synchronization.

**Authentication:** Required

**Request:**
```json
{
  "connectionId": "clx123456789"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "eventsCreated": 5,
    "eventsUpdated": 2,
    "eventsDeleted": 1,
    "syncedAt": "2025-11-21T12:00:00.000Z",
    "message": "Successfully synced 8 events"
  }
}
```

**Errors:**
- 401: Unauthorized or token expired
- 403: Permission denied
- 404: Connection not found

**File:** `/src/app/api/calendar/sync/route.ts`

---

### 3. Event Management

#### GET /api/calendar/events
Lists calendar events for the authenticated user.

**Authentication:** Required

**Query Parameters:**
- `startDate` (ISO date string, optional): Filter events starting from this date
- `endDate` (ISO date string, optional): Filter events ending before this date

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "evt_123",
      "title": "Team Meeting",
      "startTime": "2025-11-21T14:00:00.000Z",
      "endTime": "2025-11-21T15:00:00.000Z",
      "status": "CONFIRMED"
    }
  ],
  "count": 1
}
```

**File:** `/src/app/api/calendar/events/route.ts`

---

#### POST /api/calendar/events
Creates a new calendar event.

**Authentication:** Required

**Request:**
```json
{
  "title": "Client Meeting",
  "description": "Quarterly review",
  "startTime": "2025-11-22T10:00:00.000Z",
  "endTime": "2025-11-22T11:00:00.000Z",
  "location": "Conference Room A",
  "attendees": ["client@example.com"],
  "calendarConnectionId": "clx123456789",
  "metadata": {
    "projectId": "proj_123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "evt_456",
    "title": "Client Meeting",
    "startTime": "2025-11-22T10:00:00.000Z",
    "endTime": "2025-11-22T11:00:00.000Z",
    "status": "SCHEDULED"
  },
  "message": "Event created successfully"
}
```

**Errors:**
- 400: Validation failed or invalid time range
- 409: Scheduling conflict

**File:** `/src/app/api/calendar/events/route.ts`

---

#### GET /api/calendar/events/[id]
Retrieves a single calendar event.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "evt_123",
    "title": "Team Meeting",
    "description": "Weekly sync",
    "startTime": "2025-11-21T14:00:00.000Z",
    "endTime": "2025-11-21T15:00:00.000Z",
    "status": "CONFIRMED",
    "attendees": ["team@example.com"]
  }
}
```

**Errors:**
- 404: Event not found

**File:** `/src/app/api/calendar/events/[id]/route.ts`

---

#### PUT /api/calendar/events/[id]
Updates a calendar event.

**Authentication:** Required

**Request:**
```json
{
  "title": "Updated Meeting Title",
  "startTime": "2025-11-22T15:00:00.000Z",
  "endTime": "2025-11-22T16:00:00.000Z",
  "status": "CONFIRMED"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "evt_123",
    "title": "Updated Meeting Title",
    "startTime": "2025-11-22T15:00:00.000Z",
    "endTime": "2025-11-22T16:00:00.000Z",
    "status": "CONFIRMED"
  },
  "message": "Event updated successfully"
}
```

**Errors:**
- 403: Permission denied
- 404: Event not found
- 409: Scheduling conflict

**File:** `/src/app/api/calendar/events/[id]/route.ts`

---

#### DELETE /api/calendar/events/[id]
Deletes a calendar event.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

**Errors:**
- 403: Permission denied
- 404: Event not found

**File:** `/src/app/api/calendar/events/[id]/route.ts`

---

### 4. Availability Management

#### GET /api/availability
Lists availability rules for the authenticated user.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "avail_123",
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "17:00",
      "timezone": "America/New_York"
    }
  ],
  "count": 1
}
```

**File:** `/src/app/api/availability/route.ts`

---

#### POST /api/availability
Creates a new availability rule.

**Authentication:** Required

**Request:**
```json
{
  "dayOfWeek": 1,
  "startTime": "09:00",
  "endTime": "17:00",
  "timezone": "America/New_York"
}
```

**Validation:**
- `dayOfWeek`: 0 (Sunday) to 6 (Saturday)
- `startTime`: HH:mm format (e.g., "09:00")
- `endTime`: HH:mm format, must be after startTime
- `timezone`: Valid IANA timezone string

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "avail_123",
    "dayOfWeek": 1,
    "startTime": "09:00",
    "endTime": "17:00",
    "timezone": "America/New_York"
  },
  "message": "Availability rule created successfully"
}
```

**Errors:**
- 400: Invalid time format or range
- 409: Rule already exists for this day/time

**File:** `/src/app/api/availability/route.ts`

---

#### PUT /api/availability/[id]
Updates an availability rule.

**Authentication:** Required

**Request:**
```json
{
  "startTime": "08:00",
  "endTime": "18:00"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "avail_123",
    "dayOfWeek": 1,
    "startTime": "08:00",
    "endTime": "18:00",
    "timezone": "America/New_York"
  },
  "message": "Availability rule updated successfully"
}
```

**Errors:**
- 403: Permission denied
- 404: Rule not found
- 409: Conflict with existing rule

**File:** `/src/app/api/availability/[id]/route.ts`

---

#### DELETE /api/availability/[id]
Deletes an availability rule.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Availability rule deleted successfully"
}
```

**Errors:**
- 403: Permission denied
- 404: Rule not found

**File:** `/src/app/api/availability/[id]/route.ts`

---

### 5. AI Scheduling

#### POST /api/scheduling/suggest
Generates AI-powered time slot suggestions.

**Authentication:** Required

**Request:**
```json
{
  "duration": 60,
  "participantEmails": ["colleague@example.com"],
  "preferredDates": ["2025-11-22T00:00:00.000Z", "2025-11-23T00:00:00.000Z"],
  "context": "Product roadmap planning session"
}
```

**Validation:**
- `duration`: 15-480 minutes (15 min to 8 hours)
- `participantEmails`: Array of valid email addresses
- `preferredDates`: ISO date strings
- `context`: Optional context for AI optimization

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "startTime": "2025-11-22T14:00:00.000Z",
        "endTime": "2025-11-22T15:00:00.000Z",
        "score": 0.95,
        "reasoning": "All participants available, falls within preferred working hours"
      }
    ],
    "count": 5,
    "requestedDuration": 60,
    "participantsConsidered": 1
  },
  "message": "Found 5 optimal time slots"
}
```

**File:** `/src/app/api/scheduling/suggest/route.ts`

---

#### POST /api/scheduling/conflicts
Checks for scheduling conflicts.

**Authentication:** Required

**Request:**
```json
{
  "startTime": "2025-11-22T14:00:00.000Z",
  "endTime": "2025-11-22T15:00:00.000Z",
  "participantEmails": ["colleague@example.com"],
  "excludeEventId": "evt_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hasConflicts": false,
    "totalConflicts": 0,
    "userConflicts": [],
    "participantConflicts": [
      {
        "email": "colleague@example.com",
        "conflicts": []
      }
    ],
    "timeSlot": {
      "startTime": "2025-11-22T14:00:00.000Z",
      "endTime": "2025-11-22T15:00:00.000Z"
    }
  },
  "message": "No conflicts detected"
}
```

**File:** `/src/app/api/scheduling/conflicts/route.ts`

---

## Common Patterns

### Authentication
All routes (except callback) require authentication:
```typescript
const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### Validation
Request bodies are validated with Zod:
```typescript
const schema = z.object({ /* ... */ });
const result = schema.safeParse(body);
if (!result.success) {
  return NextResponse.json(
    { error: "Validation failed", details: result.error.flatten().fieldErrors },
    { status: 400 }
  );
}
```

### Error Handling
Consistent error response format:
```typescript
try {
  // ... logic
} catch (error) {
  console.error("Error:", error);
  return NextResponse.json(
    { error: "Operation failed", details: error.message },
    { status: 500 }
  );
}
```

### Response Format
Consistent success response:
```typescript
return NextResponse.json(
  {
    success: true,
    data: result,
    message: "Operation successful"
  },
  { status: 200 }
);
```

## HTTP Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation failed)
- **401**: Unauthorized (not authenticated or token expired)
- **403**: Forbidden (no permission)
- **404**: Not Found
- **409**: Conflict (duplicate or scheduling conflict)
- **500**: Internal Server Error

## Testing

Test each endpoint using:

```bash
# Connect calendar
curl -X POST http://localhost:3001/api/calendar/connect \
  -H "Authorization: Bearer <token>"

# Create event
curl -X POST http://localhost:3001/api/calendar/events \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Meeting",
    "startTime": "2025-11-22T14:00:00.000Z",
    "endTime": "2025-11-22T15:00:00.000Z"
  }'

# Check conflicts
curl -X POST http://localhost:3001/api/scheduling/conflicts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "startTime": "2025-11-22T14:00:00.000Z",
    "endTime": "2025-11-22T15:00:00.000Z"
  }'
```

## Next Steps

1. Test all endpoints with Postman or similar tool
2. Add rate limiting for production
3. Implement webhook handlers for Google Calendar events
4. Add comprehensive logging and monitoring
5. Create frontend components to consume these APIs

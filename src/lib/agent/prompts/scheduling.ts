/**
 * Specialized Prompt for Scheduling Decisions
 *
 * This prompt handles calendar event creation, scheduling conflicts,
 * time slot optimization, and attendee coordination.
 *
 * Focuses on:
 * - Time slot preference and optimization
 * - Conflict detection and resolution
 * - Duration estimation based on meeting type
 * - Attendee identification and availability
 * - Reminder scheduling logic
 * - Buffer time management
 *
 * Example Input:
 * ```typescript
 * const schedulingRequest = {
 *   requestType: 'CREATE_EVENT',
 *   requestedTime: '2024-01-15T14:00:00Z',
 *   duration: 30,
 *   attendees: [{ id: '1', email: 'john@company.com', name: 'John' }],
 *   purpose: 'Product Demo',
 *   existingEvents: [{ start: '2024-01-15T13:00:00Z', end: '2024-01-15T13:30:00Z' }]
 * };
 * ```
 */

/**
 * Meeting types with default durations
 */
export const MEETING_TYPES = {
  QUICK_SYNC: {
    name: 'Quick Sync',
    defaultDuration: 15,
    keywords: ['quick', 'sync', 'check-in', 'standup', 'brief', 'touch base'],
    description: 'Short status update or quick question',
  },
  STANDARD_MEETING: {
    name: 'Standard Meeting',
    defaultDuration: 30,
    keywords: ['meeting', 'discuss', 'talk', 'chat', 'call'],
    description: 'Standard business meeting or discussion',
  },
  DEMO: {
    name: 'Demo/Presentation',
    defaultDuration: 45,
    keywords: ['demo', 'presentation', 'walkthrough', 'show', 'showcase'],
    description: 'Product demonstration or presentation',
  },
  DISCOVERY_CALL: {
    name: 'Discovery Call',
    defaultDuration: 30,
    keywords: ['discovery', 'intro', 'introduction', 'learn about', 'explore'],
    description: 'Initial call to understand needs',
  },
  WORKSHOP: {
    name: 'Workshop/Training',
    defaultDuration: 90,
    keywords: ['workshop', 'training', 'session', 'hands-on', 'learning'],
    description: 'Extended session for training or workshops',
  },
  INTERVIEW: {
    name: 'Interview',
    defaultDuration: 45,
    keywords: ['interview', 'candidate', 'hiring', 'recruiting'],
    description: 'Job interview or candidate screening',
  },
  ONE_ON_ONE: {
    name: '1:1 Meeting',
    defaultDuration: 30,
    keywords: ['1:1', 'one-on-one', '1-on-1', 'personal', 'private'],
    description: 'Private meeting between two people',
  },
  PLANNING: {
    name: 'Planning Session',
    defaultDuration: 60,
    keywords: ['planning', 'strategy', 'roadmap', 'kickoff', 'sprint'],
    description: 'Planning or strategy session',
  },
  REVIEW: {
    name: 'Review Meeting',
    defaultDuration: 45,
    keywords: ['review', 'retrospective', 'feedback', 'assessment'],
    description: 'Review or retrospective meeting',
  },
} as const;

/**
 * Time slot preferences configuration
 */
export const TIME_PREFERENCES = {
  businessHours: {
    start: 9, // 9:00 AM
    end: 17, // 5:00 PM
  },
  lunchHours: {
    start: 12, // 12:00 PM
    end: 13, // 1:00 PM
  },
  preferredSlots: [
    { start: 9, end: 11, preference: 'high', reason: 'Morning focus time' },
    { start: 14, end: 16, preference: 'high', reason: 'Afternoon productivity' },
    { start: 11, end: 12, preference: 'medium', reason: 'Pre-lunch slot' },
    { start: 16, end: 17, preference: 'medium', reason: 'End of day wrap-up' },
  ],
  bufferMinutes: 15,
  maxMeetingsPerDay: 8,
  maxConsecutiveHours: 3,
} as const;

/**
 * Reminder presets
 */
export const REMINDER_PRESETS = {
  standard: [
    { minutes: 60, method: 'email' as const },
    { minutes: 15, method: 'popup' as const },
  ],
  important: [
    { minutes: 1440, method: 'email' as const }, // 24 hours
    { minutes: 60, method: 'email' as const },
    { minutes: 15, method: 'popup' as const },
  ],
  quick: [{ minutes: 5, method: 'popup' as const }],
  external: [
    { minutes: 1440, method: 'email' as const }, // 24 hours
    { minutes: 120, method: 'email' as const }, // 2 hours
    { minutes: 30, method: 'popup' as const },
  ],
} as const;

/**
 * Main scheduling prompt
 */
export const SCHEDULING_PROMPT = `
You are a scheduling specialist for the AstralisOps platform. Your task is to analyze scheduling requests and make optimal decisions about calendar event management.

## Current Context
- Current Date/Time: {currentDateTime}
- Timezone: {timezone}
- Organization: {orgName}

## Request Details
Request Type: {requestType}
Raw Request: {rawRequest}

## Existing Calendar State
Existing Events Today: {existingEventsToday}
Existing Events This Week: {existingEventsThisWeek}
Busy Slots: {busySlots}

## Available Attendees
{attendeesJson}

## Your Tasks

### 1. Parse Scheduling Request
Extract the following from the request:
- **Requested Date/Time**: Specific time or date range
- **Duration**: Explicit or estimated based on meeting type
- **Attendees**: Internal team members and/or external guests
- **Purpose**: Meeting title and description
- **Location**: Physical location or virtual meeting preference
- **Priority**: Standard or high-priority

### 2. Identify Meeting Type
Classify the meeting type to determine default duration:
- **Quick Sync** (15 min): Brief check-ins, status updates
- **Standard Meeting** (30 min): Regular discussions
- **Demo/Presentation** (45 min): Product demos, presentations
- **Discovery Call** (30 min): Initial conversations
- **Workshop/Training** (90 min): Extended collaborative sessions
- **Interview** (45 min): Candidate interviews
- **1:1 Meeting** (30 min): Private two-person meetings
- **Planning Session** (60 min): Strategy and planning
- **Review Meeting** (45 min): Retrospectives, reviews

### 3. Check for Conflicts
Analyze the requested time against:
- Existing events for all attendees
- Blocked time / focus time
- Buffer requirements (15 min minimum between meetings)
- Daily meeting limits (max 8 meetings/day)
- Consecutive meeting limits (max 3 hours back-to-back)

### 4. Suggest Time Slots
If conflicts exist or no specific time requested:
- Suggest 3 alternative time slots within the next 48 hours
- Prioritize during business hours (9 AM - 5 PM)
- Avoid lunch hours (12 PM - 1 PM)
- Prefer morning slots (9-11 AM) for important meetings
- Consider attendee timezone differences

### 5. Determine Reminders
Set appropriate reminders based on meeting type:
- **Standard**: 1 hour (email) + 15 minutes (popup)
- **Important/External**: 24 hours (email) + 1 hour (email) + 15 minutes (popup)
- **Quick**: 5 minutes (popup)

### 6. Generate Event Details
Prepare complete event details for creation:
- Title (concise, descriptive)
- Description (agenda, context)
- Start and end times
- Attendees with email addresses
- Location or video conference link
- Reminders
- Any recurring pattern

## Time Slot Preference Logic

**High Preference:**
- 9:00 AM - 11:00 AM (Morning focus)
- 2:00 PM - 4:00 PM (Afternoon productivity)

**Medium Preference:**
- 11:00 AM - 12:00 PM (Pre-lunch)
- 4:00 PM - 5:00 PM (End of day)

**Low Preference:**
- 12:00 PM - 1:00 PM (Lunch - avoid if possible)
- Before 9:00 AM (Too early)
- After 5:00 PM (After hours)

## Conflict Resolution Strategies

1. **Same-time Conflict**: Suggest next available slot respecting buffer
2. **Buffer Violation**: Suggest slot with proper spacing
3. **Lunch Conflict**: Move to before or after lunch
4. **Outside Business Hours**: Move to business hours
5. **Daily Limit Reached**: Suggest next day or combine meetings
6. **Consecutive Limit**: Find slot with break between

## Response Format

Respond with valid JSON:

\`\`\`json
{
  "analysis": {
    "requestType": "CREATE_EVENT|UPDATE_EVENT|CANCEL_EVENT|FIND_SLOT|RESCHEDULE",
    "meetingType": "QUICK_SYNC|STANDARD_MEETING|DEMO|DISCOVERY_CALL|WORKSHOP|INTERVIEW|ONE_ON_ONE|PLANNING|REVIEW",
    "parsedRequest": {
      "title": "string",
      "description": "string | null",
      "requestedStart": "ISO datetime | null",
      "requestedEnd": "ISO datetime | null",
      "duration": 30,
      "attendees": [
        {"id": "string | null", "email": "string", "name": "string", "isExternal": false}
      ],
      "location": "string | null",
      "isVirtual": true,
      "priority": "normal|high"
    },
    "confidence": 0.0-1.0
  },
  "conflicts": {
    "hasConflicts": false,
    "conflictingEvents": [
      {
        "eventId": "string",
        "title": "string",
        "start": "ISO datetime",
        "end": "ISO datetime",
        "conflictType": "OVERLAP|BUFFER_VIOLATION|DAILY_LIMIT|CONSECUTIVE_LIMIT"
      }
    ],
    "conflictResolution": "string describing how conflicts can be resolved"
  },
  "recommendation": {
    "action": "CREATE|SUGGEST_ALTERNATIVES|REQUIRE_CONFIRMATION|REJECT",
    "reasoning": "string",
    "primarySlot": {
      "start": "ISO datetime",
      "end": "ISO datetime",
      "score": 0.0-1.0,
      "reasoning": "Why this slot is recommended"
    },
    "alternativeSlots": [
      {
        "start": "ISO datetime",
        "end": "ISO datetime",
        "score": 0.0-1.0,
        "reasoning": "string"
      }
    ]
  },
  "eventDetails": {
    "title": "string",
    "description": "string",
    "start": "ISO datetime",
    "end": "ISO datetime",
    "duration": 30,
    "attendees": [
      {"id": "string | null", "email": "string", "name": "string", "responseStatus": "needsAction"}
    ],
    "location": "string | null",
    "conferenceData": {
      "createRequest": true,
      "provider": "google_meet|zoom|teams"
    },
    "reminders": [
      {"minutes": 60, "method": "email"},
      {"minutes": 15, "method": "popup"}
    ],
    "visibility": "default|public|private",
    "transparency": "opaque|transparent"
  },
  "notifications": {
    "notifyAttendees": true,
    "sendInvites": true,
    "includeNotes": "string | null"
  },
  "followUp": {
    "createReminder": false,
    "reminderTime": "ISO datetime | null",
    "followUpTask": "string | null"
  },
  "requiresApproval": false,
  "approvalReason": "string | null"
}
\`\`\`

## Important Rules

1. **Respect business hours** - Default to 9 AM - 5 PM unless explicitly requested otherwise
2. **Buffer time is mandatory** - Always maintain 15-minute buffer between meetings
3. **External attendees need extra lead time** - Send invites at least 24 hours in advance
4. **Consider timezone differences** - Calculate correct times for all attendees
5. **Never double-book** - If conflict exists, suggest alternatives rather than overlapping
6. **Include video links** - Default to virtual unless physical location specified
7. **Be conservative with duration** - Better to schedule longer and end early
8. **Validate attendee availability** - Check calendar before confirming slot

## Examples

### Example 1: Simple Meeting Request

**Input:**
- Request Type: CREATE_EVENT
- Raw Request: "Schedule a 30-minute call with John about the new project next Tuesday at 2pm"
- Attendees: [{ id: "user-1", email: "john@company.com", name: "John Smith" }]
- Existing Events: [{ start: "2024-01-16T15:00:00Z", end: "2024-01-16T16:00:00Z", title: "Team Standup" }]

**Output:**
\`\`\`json
{
  "analysis": {
    "requestType": "CREATE_EVENT",
    "meetingType": "STANDARD_MEETING",
    "parsedRequest": {
      "title": "Project Discussion with John",
      "description": "Discussion about the new project",
      "requestedStart": "2024-01-16T14:00:00Z",
      "requestedEnd": "2024-01-16T14:30:00Z",
      "duration": 30,
      "attendees": [{"id": "user-1", "email": "john@company.com", "name": "John Smith", "isExternal": false}],
      "location": null,
      "isVirtual": true,
      "priority": "normal"
    },
    "confidence": 0.92
  },
  "conflicts": {
    "hasConflicts": false,
    "conflictingEvents": [],
    "conflictResolution": null
  },
  "recommendation": {
    "action": "CREATE",
    "reasoning": "Requested slot is available with proper buffer before the 3 PM standup",
    "primarySlot": {
      "start": "2024-01-16T14:00:00Z",
      "end": "2024-01-16T14:30:00Z",
      "score": 0.95,
      "reasoning": "Afternoon slot during high-preference time, 30 min buffer before next meeting"
    },
    "alternativeSlots": []
  },
  "eventDetails": {
    "title": "Project Discussion with John",
    "description": "Discussion about the new project\\n\\nAgenda:\\n- Project overview\\n- Next steps\\n- Action items",
    "start": "2024-01-16T14:00:00Z",
    "end": "2024-01-16T14:30:00Z",
    "duration": 30,
    "attendees": [{"id": "user-1", "email": "john@company.com", "name": "John Smith", "responseStatus": "needsAction"}],
    "location": null,
    "conferenceData": {"createRequest": true, "provider": "google_meet"},
    "reminders": [{"minutes": 60, "method": "email"}, {"minutes": 15, "method": "popup"}],
    "visibility": "default",
    "transparency": "opaque"
  },
  "notifications": {
    "notifyAttendees": true,
    "sendInvites": true,
    "includeNotes": null
  },
  "followUp": {
    "createReminder": false,
    "reminderTime": null,
    "followUpTask": null
  },
  "requiresApproval": false,
  "approvalReason": null
}
\`\`\`

### Example 2: Conflict Resolution

**Input:**
- Request Type: CREATE_EVENT
- Raw Request: "Demo for enterprise client at 10am tomorrow, need 1 hour"
- Attendees: [{ email: "prospect@enterprise.com", name: "Sarah Chen" }]
- Existing Events: [{ start: "2024-01-15T10:00:00Z", end: "2024-01-15T11:00:00Z", title: "Team Meeting" }]

**Output:**
\`\`\`json
{
  "analysis": {
    "requestType": "CREATE_EVENT",
    "meetingType": "DEMO",
    "parsedRequest": {
      "title": "Enterprise Demo - Sarah Chen",
      "description": "Product demonstration for enterprise prospect",
      "requestedStart": "2024-01-15T10:00:00Z",
      "requestedEnd": "2024-01-15T11:00:00Z",
      "duration": 60,
      "attendees": [{"id": null, "email": "prospect@enterprise.com", "name": "Sarah Chen", "isExternal": true}],
      "location": null,
      "isVirtual": true,
      "priority": "high"
    },
    "confidence": 0.88
  },
  "conflicts": {
    "hasConflicts": true,
    "conflictingEvents": [
      {
        "eventId": "evt-123",
        "title": "Team Meeting",
        "start": "2024-01-15T10:00:00Z",
        "end": "2024-01-15T11:00:00Z",
        "conflictType": "OVERLAP"
      }
    ],
    "conflictResolution": "Existing Team Meeting occupies requested slot. Suggesting alternative morning and afternoon slots."
  },
  "recommendation": {
    "action": "SUGGEST_ALTERNATIVES",
    "reasoning": "Requested time has conflict with Team Meeting. Suggesting 3 alternative slots prioritizing similar time of day.",
    "primarySlot": {
      "start": "2024-01-15T11:15:00Z",
      "end": "2024-01-15T12:15:00Z",
      "score": 0.85,
      "reasoning": "Same day, immediately after existing meeting with 15-min buffer"
    },
    "alternativeSlots": [
      {
        "start": "2024-01-15T14:00:00Z",
        "end": "2024-01-15T15:00:00Z",
        "score": 0.90,
        "reasoning": "Afternoon slot during high-preference time, no conflicts"
      },
      {
        "start": "2024-01-16T10:00:00Z",
        "end": "2024-01-16T11:00:00Z",
        "score": 0.80,
        "reasoning": "Same time next day, original requested time available"
      }
    ]
  },
  "eventDetails": {
    "title": "Enterprise Demo - Sarah Chen",
    "description": "Product demonstration for enterprise prospect\\n\\nAgenda:\\n- Platform overview\\n- Key features demo\\n- Q&A\\n- Next steps",
    "start": "2024-01-15T14:00:00Z",
    "end": "2024-01-15T15:00:00Z",
    "duration": 60,
    "attendees": [{"id": null, "email": "prospect@enterprise.com", "name": "Sarah Chen", "responseStatus": "needsAction"}],
    "location": null,
    "conferenceData": {"createRequest": true, "provider": "google_meet"},
    "reminders": [{"minutes": 1440, "method": "email"}, {"minutes": 120, "method": "email"}, {"minutes": 30, "method": "popup"}],
    "visibility": "default",
    "transparency": "opaque"
  },
  "notifications": {
    "notifyAttendees": true,
    "sendInvites": true,
    "includeNotes": "Please select your preferred time from the suggested alternatives."
  },
  "followUp": {
    "createReminder": true,
    "reminderTime": "2024-01-15T09:00:00Z",
    "followUpTask": "Confirm demo time with prospect if no response within 24 hours"
  },
  "requiresApproval": true,
  "approvalReason": "External attendee with scheduling conflict - please confirm preferred alternative slot"
}
\`\`\`
`.trim();

/**
 * Build the scheduling prompt with request data
 */
export function buildSchedulingPrompt(request: {
  requestType: 'CREATE_EVENT' | 'UPDATE_EVENT' | 'CANCEL_EVENT' | 'FIND_SLOT' | 'RESCHEDULE';
  rawRequest: string;
  orgName: string;
  timezone?: string;
  currentDateTime?: Date;
  existingEventsToday?: Array<{
    id: string;
    title: string;
    start: string;
    end: string;
  }>;
  existingEventsThisWeek?: Array<{
    id: string;
    title: string;
    start: string;
    end: string;
  }>;
  busySlots?: Array<{ start: string; end: string }>;
  attendees?: Array<{
    id: string;
    name: string;
    email: string;
    role?: string;
    availability?: Array<{ start: string; end: string }>;
  }>;
}): string {
  const {
    requestType,
    rawRequest,
    orgName,
    timezone = 'UTC',
    currentDateTime = new Date(),
    existingEventsToday = [],
    existingEventsThisWeek = [],
    busySlots = [],
    attendees = [],
  } = request;

  return SCHEDULING_PROMPT.replace('{requestType}', requestType)
    .replace('{rawRequest}', rawRequest)
    .replace('{orgName}', orgName)
    .replace('{timezone}', timezone)
    .replace('{currentDateTime}', currentDateTime.toISOString())
    .replace('{existingEventsToday}', JSON.stringify(existingEventsToday, null, 2))
    .replace('{existingEventsThisWeek}', JSON.stringify(existingEventsThisWeek, null, 2))
    .replace('{busySlots}', JSON.stringify(busySlots, null, 2))
    .replace('{attendeesJson}', JSON.stringify(attendees, null, 2));
}

/**
 * Utility to estimate meeting duration based on type
 */
export function estimateDuration(meetingTypeOrKeywords: string): number {
  const normalizedInput = meetingTypeOrKeywords.toLowerCase();

  for (const [, config] of Object.entries(MEETING_TYPES)) {
    for (const keyword of config.keywords) {
      if (normalizedInput.includes(keyword)) {
        return config.defaultDuration;
      }
    }
  }

  // Default to 30 minutes if no match
  return 30;
}

/**
 * Utility to check if a time slot is within business hours
 */
export function isWithinBusinessHours(
  date: Date,
  timezone: string = 'UTC'
): { isValid: boolean; reason?: string } {
  // Convert to timezone-aware hour
  const hour = new Date(
    date.toLocaleString('en-US', { timeZone: timezone })
  ).getHours();

  if (hour < TIME_PREFERENCES.businessHours.start) {
    return { isValid: false, reason: 'Before business hours (9 AM)' };
  }

  if (hour >= TIME_PREFERENCES.businessHours.end) {
    return { isValid: false, reason: 'After business hours (5 PM)' };
  }

  return { isValid: true };
}

/**
 * Utility to check if time is during lunch
 */
export function isDuringLunch(date: Date, timezone: string = 'UTC'): boolean {
  const hour = new Date(
    date.toLocaleString('en-US', { timeZone: timezone })
  ).getHours();

  return (
    hour >= TIME_PREFERENCES.lunchHours.start &&
    hour < TIME_PREFERENCES.lunchHours.end
  );
}

/**
 * Utility to get reminder preset based on meeting characteristics
 */
export function getRecommendedReminders(options: {
  hasExternalAttendees: boolean;
  isHighPriority: boolean;
  duration: number;
}): Array<{ minutes: number; method: 'email' | 'popup' }> {
  const { hasExternalAttendees, isHighPriority, duration } = options;

  if (hasExternalAttendees) {
    return [...REMINDER_PRESETS.external];
  }

  if (isHighPriority) {
    return [...REMINDER_PRESETS.important];
  }

  if (duration <= 15) {
    return [...REMINDER_PRESETS.quick];
  }

  return [...REMINDER_PRESETS.standard];
}

export default SCHEDULING_PROMPT;

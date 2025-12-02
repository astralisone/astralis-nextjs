/**
 * Specialized Prompt for Notification Decisions
 *
 * This prompt handles notification routing, channel selection,
 * message content generation, and escalation logic.
 *
 * Focuses on:
 * - Who to notify based on event type and roles
 * - Notification urgency levels and timing
 * - Channel selection (email, in-app, SMS, push)
 * - Message tone and content guidelines
 * - Escalation criteria and chains
 * - Batching and deduplication
 *
 * Example Input:
 * ```typescript
 * const notificationEvent = {
 *   eventType: 'INTAKE_CREATED',
 *   eventData: { intakeId: '123', title: 'Support Request', urgency: 4 },
 *   context: { orgId: 'org-1', userId: 'user-1' },
 *   teamMembers: [{ id: 'user-2', role: 'SUPPORT', name: 'Jane' }]
 * };
 * ```
 */

/**
 * Event types that can trigger notifications
 */
export const NOTIFICATION_EVENT_TYPES = {
  // Intake Events
  INTAKE_CREATED: {
    code: 'INTAKE_CREATED',
    description: 'New intake request created',
    defaultUrgency: 'MEDIUM',
    defaultChannels: ['IN_APP', 'EMAIL'],
    notifyRoles: ['ADMIN', 'OPERATOR'],
  },
  INTAKE_ASSIGNED: {
    code: 'INTAKE_ASSIGNED',
    description: 'Intake assigned to team member',
    defaultUrgency: 'MEDIUM',
    defaultChannels: ['IN_APP'],
    notifyRoles: [], // Notify specific assignee
  },
  INTAKE_ESCALATED: {
    code: 'INTAKE_ESCALATED',
    description: 'Intake escalated due to urgency or time',
    defaultUrgency: 'HIGH',
    defaultChannels: ['IN_APP', 'EMAIL'],
    notifyRoles: ['ADMIN', 'OPERATOR'],
  },

  // Pipeline Events
  PIPELINE_STAGE_CHANGED: {
    code: 'PIPELINE_STAGE_CHANGED',
    description: 'Item moved to different stage',
    defaultUrgency: 'LOW',
    defaultChannels: ['IN_APP'],
    notifyRoles: [], // Notify assignee and watchers
  },
  PIPELINE_ITEM_OVERDUE: {
    code: 'PIPELINE_ITEM_OVERDUE',
    description: 'Pipeline item past due date',
    defaultUrgency: 'HIGH',
    defaultChannels: ['IN_APP', 'EMAIL'],
    notifyRoles: ['PM'],
  },
  PIPELINE_ITEM_COMPLETED: {
    code: 'PIPELINE_ITEM_COMPLETED',
    description: 'Pipeline item marked complete',
    defaultUrgency: 'LOW',
    defaultChannels: ['IN_APP'],
    notifyRoles: [],
  },

  // Calendar Events
  EVENT_REMINDER: {
    code: 'EVENT_REMINDER',
    description: 'Upcoming event reminder',
    defaultUrgency: 'MEDIUM',
    defaultChannels: ['IN_APP', 'EMAIL'],
    notifyRoles: [], // Notify attendees
  },
  EVENT_CANCELLED: {
    code: 'EVENT_CANCELLED',
    description: 'Calendar event cancelled',
    defaultUrgency: 'HIGH',
    defaultChannels: ['IN_APP', 'EMAIL'],
    notifyRoles: [], // Notify attendees
  },
  EVENT_RESCHEDULED: {
    code: 'EVENT_RESCHEDULED',
    description: 'Calendar event time changed',
    defaultUrgency: 'HIGH',
    defaultChannels: ['IN_APP', 'EMAIL'],
    notifyRoles: [], // Notify attendees
  },

  // System Events
  SYSTEM_ALERT: {
    code: 'SYSTEM_ALERT',
    description: 'System-level alert or warning',
    defaultUrgency: 'CRITICAL',
    defaultChannels: ['IN_APP', 'EMAIL', 'SMS'],
    notifyRoles: ['ADMIN'],
  },
  AUTOMATION_FAILED: {
    code: 'AUTOMATION_FAILED',
    description: 'n8n workflow or automation failed',
    defaultUrgency: 'HIGH',
    defaultChannels: ['IN_APP', 'EMAIL'],
    notifyRoles: ['ADMIN', 'OPERATOR'],
  },
  AUTOMATION_COMPLETED: {
    code: 'AUTOMATION_COMPLETED',
    description: 'Automation workflow completed',
    defaultUrgency: 'LOW',
    defaultChannels: ['IN_APP'],
    notifyRoles: [],
  },

  // User Events
  USER_MENTIONED: {
    code: 'USER_MENTIONED',
    description: 'User was @mentioned in comment',
    defaultUrgency: 'MEDIUM',
    defaultChannels: ['IN_APP', 'EMAIL'],
    notifyRoles: [], // Notify mentioned user
  },
  TASK_ASSIGNED: {
    code: 'TASK_ASSIGNED',
    description: 'Task assigned to user',
    defaultUrgency: 'MEDIUM',
    defaultChannels: ['IN_APP'],
    notifyRoles: [], // Notify assignee
  },

  // Approval Events
  APPROVAL_REQUESTED: {
    code: 'APPROVAL_REQUESTED',
    description: 'Agent decision requires approval',
    defaultUrgency: 'HIGH',
    defaultChannels: ['IN_APP', 'EMAIL'],
    notifyRoles: ['ADMIN'],
  },
  APPROVAL_GRANTED: {
    code: 'APPROVAL_GRANTED',
    description: 'Pending action was approved',
    defaultUrgency: 'LOW',
    defaultChannels: ['IN_APP'],
    notifyRoles: [],
  },
  APPROVAL_DENIED: {
    code: 'APPROVAL_DENIED',
    description: 'Pending action was denied',
    defaultUrgency: 'MEDIUM',
    defaultChannels: ['IN_APP'],
    notifyRoles: [],
  },
} as const;

/**
 * Notification urgency levels with timing
 */
export const URGENCY_LEVELS = {
  CRITICAL: {
    level: 'CRITICAL',
    priority: 1,
    deliveryTiming: 'immediate',
    maxDelay: 0, // seconds
    channels: ['IN_APP', 'EMAIL', 'SMS', 'PUSH'],
    retryCount: 3,
    escalateAfter: 300, // 5 minutes
    description: 'System down, security issues, data loss',
  },
  HIGH: {
    level: 'HIGH',
    priority: 2,
    deliveryTiming: 'within 5 minutes',
    maxDelay: 300, // 5 minutes
    channels: ['IN_APP', 'EMAIL', 'PUSH'],
    retryCount: 2,
    escalateAfter: 1800, // 30 minutes
    description: 'Blocking issues, urgent requests, deadlines',
  },
  MEDIUM: {
    level: 'MEDIUM',
    priority: 3,
    deliveryTiming: 'within 15 minutes',
    maxDelay: 900, // 15 minutes
    channels: ['IN_APP', 'EMAIL'],
    retryCount: 1,
    escalateAfter: 7200, // 2 hours
    description: 'Standard notifications, new items',
  },
  LOW: {
    level: 'LOW',
    priority: 4,
    deliveryTiming: 'batched hourly',
    maxDelay: 3600, // 1 hour
    channels: ['IN_APP'],
    retryCount: 0,
    escalateAfter: null, // No escalation
    description: 'Informational, can be batched',
  },
} as const;

/**
 * Channel configurations
 */
export const NOTIFICATION_CHANNELS = {
  IN_APP: {
    code: 'IN_APP',
    name: 'In-App Notification',
    supportsRichContent: true,
    supportsActions: true,
    costPerMessage: 0,
    deliverySpeed: 'instant',
    fallbackChannel: 'EMAIL',
  },
  EMAIL: {
    code: 'EMAIL',
    name: 'Email',
    supportsRichContent: true,
    supportsActions: true,
    costPerMessage: 0,
    deliverySpeed: 'seconds to minutes',
    fallbackChannel: null,
  },
  SMS: {
    code: 'SMS',
    name: 'SMS Text Message',
    supportsRichContent: false,
    supportsActions: false,
    costPerMessage: 0.01,
    deliverySpeed: 'instant',
    fallbackChannel: 'EMAIL',
    maxLength: 160,
  },
  PUSH: {
    code: 'PUSH',
    name: 'Push Notification',
    supportsRichContent: false,
    supportsActions: true,
    costPerMessage: 0,
    deliverySpeed: 'instant',
    fallbackChannel: 'IN_APP',
    maxLength: 100,
  },
} as const;

/**
 * Role-based notification routing
 */
export const ROLE_NOTIFICATION_ROUTING = {
  ADMIN: {
    role: 'ADMIN',
    notifyFor: [
      'SYSTEM_ALERT',
      'AUTOMATION_FAILED',
      'APPROVAL_REQUESTED',
      'INTAKE_ESCALATED',
      'BILLING_QUESTION',
      'PARTNERSHIP',
    ],
    preferredChannels: ['IN_APP', 'EMAIL'],
    quietHours: false, // Always notify
  },
  OPERATOR: {
    role: 'OPERATOR',
    notifyFor: [
      'SUPPORT_REQUEST',
      'INTAKE_CREATED',
      'INTAKE_ESCALATED',
      'AUTOMATION_FAILED',
      'SYSTEM_ALERT',
    ],
    preferredChannels: ['IN_APP', 'EMAIL'],
    quietHours: true,
  },
  PM: {
    role: 'PM',
    notifyFor: [
      'PIPELINE_ITEM_OVERDUE',
      'PIPELINE_STAGE_CHANGED',
      'TASK_ASSIGNED',
      'PROJECT_INTAKE',
    ],
    preferredChannels: ['IN_APP', 'EMAIL'],
    quietHours: true,
  },
  SALES: {
    role: 'SALES',
    notifyFor: [
      'SALES_INQUIRY',
      'INTAKE_ASSIGNED',
      'PARTNERSHIP',
    ],
    preferredChannels: ['IN_APP', 'EMAIL'],
    quietHours: true,
  },
  SUPPORT: {
    role: 'SUPPORT',
    notifyFor: [
      'SUPPORT_REQUEST',
      'INTAKE_ASSIGNED',
      'INTAKE_ESCALATED',
      'USER_MENTIONED',
    ],
    preferredChannels: ['IN_APP', 'EMAIL'],
    quietHours: true,
  },
} as const;

/**
 * Message templates for different event types
 */
export const MESSAGE_TEMPLATES = {
  INTAKE_CREATED: {
    subject: 'New {intakeType} Intake: {title}',
    shortMessage: 'New intake "{title}" received from {source}',
    body: `A new {intakeType} intake has been received.

**Title:** {title}
**Source:** {source}
**Priority:** {priority}
**Submitted by:** {submitterName} ({submitterEmail})

{description}

[View Intake]({actionUrl})`,
  },
  INTAKE_ASSIGNED: {
    subject: 'Intake Assigned: {title}',
    shortMessage: 'You have been assigned "{title}"',
    body: `You have been assigned a new intake.

**Title:** {title}
**Pipeline:** {pipelineName}
**Stage:** {stageName}
**Priority:** {priority}

{description}

[View Details]({actionUrl})`,
  },
  INTAKE_ESCALATED: {
    subject: '[ESCALATED] {title}',
    shortMessage: 'ESCALATED: "{title}" requires attention',
    body: `An intake has been escalated and requires immediate attention.

**Title:** {title}
**Reason:** {escalationReason}
**Original Priority:** {originalPriority}
**New Priority:** {newPriority}
**Time Since Created:** {timeSinceCreated}

[View Intake]({actionUrl})`,
  },
  EVENT_REMINDER: {
    subject: 'Reminder: {eventTitle} in {timeUntil}',
    shortMessage: '{eventTitle} starts in {timeUntil}',
    body: `You have an upcoming event.

**Event:** {eventTitle}
**Time:** {startTime} - {endTime}
**Location:** {location}
**Attendees:** {attendeeList}

{description}

[View Event]({actionUrl})`,
  },
  APPROVAL_REQUESTED: {
    subject: 'Approval Required: {actionType}',
    shortMessage: 'Agent requires approval for {actionType}',
    body: `The orchestration agent has requested approval for an action.

**Action Type:** {actionType}
**Confidence:** {confidence}%
**Reason for Approval:** {approvalReason}

**Proposed Action:**
{actionDetails}

[Approve]({approveUrl}) | [Deny]({denyUrl}) | [View Details]({actionUrl})`,
  },
  SYSTEM_ALERT: {
    subject: '[ALERT] {alertTitle}',
    shortMessage: 'SYSTEM ALERT: {alertTitle}',
    body: `A system alert has been triggered.

**Alert:** {alertTitle}
**Severity:** {severity}
**Component:** {component}
**Time:** {timestamp}

**Details:**
{alertDetails}

[View System Status]({actionUrl})`,
  },
} as const;

/**
 * Main notification prompt
 */
export const NOTIFICATION_PROMPT = `
You are a notification specialist for the AstralisOps platform. Your task is to determine the optimal notification strategy for events occurring in the system.

## Current Context
- Current Date/Time: {currentDateTime}
- Timezone: {timezone}
- Organization: {orgName}
- Business Hours: {businessHours}

## Event Details
Event Type: {eventType}
Event Data: {eventDataJson}
Source Context: {sourceContext}

## Available Recipients
Team Members: {teamMembersJson}
On-Call: {onCallJson}

## User Notification Preferences
{userPreferencesJson}

## Your Tasks

### 1. Determine Recipients
Based on the event type and context, identify who should be notified:
- **Primary Recipients**: Must be notified immediately
- **Secondary Recipients**: Should be notified but can be delayed
- **CC Recipients**: Informed but no action required

Consider:
- User roles and responsibilities
- Assignment relationships (assignee, watchers, stakeholders)
- Escalation chains
- On-call schedules
- User notification preferences

### 2. Assess Urgency
Determine the notification urgency level:
- **CRITICAL**: System down, security issues, data loss - immediate notification via all channels
- **HIGH**: Blocking issues, tight deadlines - notify within 5 minutes
- **MEDIUM**: Standard notifications - deliver within 15 minutes
- **LOW**: Informational updates - can be batched hourly

### 3. Select Channels
Choose appropriate notification channels based on:
- Urgency level
- User preferences
- Channel capabilities
- Cost considerations (SMS)
- Time of day (quiet hours)

Channel priority:
1. **IN_APP** - Always include for tracking
2. **EMAIL** - For detailed information
3. **PUSH** - For mobile alerts
4. **SMS** - Reserved for critical only

### 4. Generate Message Content
Create appropriate message content:
- **Subject/Title**: Concise, action-oriented
- **Short Message**: For push/SMS (max 100-160 chars)
- **Full Body**: For email/in-app with context and actions

Tone guidelines:
- Critical: Direct, urgent, clear action required
- High: Professional, emphasize importance
- Medium: Friendly, informative
- Low: Brief, conversational

### 5. Consider Escalation
Determine if escalation is needed:
- No response within expected time → escalate to next level
- Business hours consideration
- Multiple failed notifications → try alternate channels

### 6. Handle Deduplication
Check for potential duplicates:
- Same event within short timeframe
- Similar events that could be batched
- Follow-up events that should update existing notification

## Response Format

Respond with valid JSON:

\`\`\`json
{
  "analysis": {
    "eventType": "string",
    "eventSummary": "Brief description of what happened",
    "urgencyLevel": "CRITICAL|HIGH|MEDIUM|LOW",
    "urgencyReasoning": "Why this urgency level"
  },
  "recipients": {
    "primary": [
      {
        "userId": "string",
        "name": "string",
        "email": "string",
        "role": "string",
        "reason": "Why they are a primary recipient"
      }
    ],
    "secondary": [],
    "cc": []
  },
  "notifications": [
    {
      "recipientId": "string",
      "channels": ["IN_APP", "EMAIL"],
      "timing": "immediate|delayed|batched",
      "delayMinutes": 0,
      "content": {
        "subject": "string",
        "shortMessage": "string (max 160 chars)",
        "body": "string (markdown supported)",
        "actionUrl": "string | null",
        "actions": [
          {
            "label": "View Details",
            "url": "/path/to/resource",
            "style": "primary|secondary"
          }
        ]
      },
      "metadata": {
        "eventId": "string",
        "correlationId": "string | null",
        "category": "intake|calendar|system|approval"
      }
    }
  ],
  "escalation": {
    "enabled": false,
    "escalateAfterMinutes": 30,
    "escalateTo": ["userId"],
    "escalationMessage": "string"
  },
  "batching": {
    "canBatch": false,
    "batchKey": "string | null",
    "batchWindow": 60
  },
  "deduplication": {
    "isDuplicate": false,
    "existingNotificationId": "string | null",
    "action": "send|update|skip"
  },
  "quietHours": {
    "isQuietTime": false,
    "affectedRecipients": [],
    "deferUntil": "ISO datetime | null"
  },
  "cost": {
    "estimatedCost": 0.00,
    "smsCount": 0,
    "emailCount": 0,
    "requiresApproval": false
  }
}
\`\`\`

## Important Rules

1. **Always include IN_APP** - Every notification should have an in-app component for audit
2. **Respect quiet hours** - Unless CRITICAL, defer notifications outside business hours
3. **SMS is expensive** - Only use for CRITICAL urgency or explicit user preference
4. **Personalize content** - Use recipient's name and relevant context
5. **Include actions** - Make it easy to take action directly from notification
6. **Consider batching** - Group related low-priority notifications
7. **Never spam** - Deduplicate similar notifications within short timeframes
8. **Clear call-to-action** - Every notification should have a clear next step
9. **Respect preferences** - Honor user notification settings
10. **Track everything** - Include correlation IDs for tracking

## Tone Guidelines

**CRITICAL Notifications:**
- Direct and urgent
- Use action words: "IMMEDIATE ACTION REQUIRED"
- Clear impact statement
- Specific next steps

**HIGH Notifications:**
- Professional and important
- Emphasize time sensitivity
- Clear context
- Specific action required

**MEDIUM Notifications:**
- Informative and helpful
- Provide sufficient context
- Suggest (not demand) action
- Include relevant details

**LOW Notifications:**
- Brief and friendly
- Informational tone
- Optional action
- Can be summarized

## Examples

### Example 1: Critical System Alert

**Input:**
- Event Type: SYSTEM_ALERT
- Event Data: { alert: "Database connection pool exhausted", severity: "critical" }
- Team Members: [{ id: "admin-1", role: "ADMIN", name: "Sarah" }]

**Output:**
\`\`\`json
{
  "analysis": {
    "eventType": "SYSTEM_ALERT",
    "eventSummary": "Database connection pool exhausted - may cause service degradation",
    "urgencyLevel": "CRITICAL",
    "urgencyReasoning": "Database connectivity issues can cause widespread service disruption"
  },
  "recipients": {
    "primary": [
      {
        "userId": "admin-1",
        "name": "Sarah",
        "email": "sarah@company.com",
        "role": "ADMIN",
        "reason": "Admin responsible for system health"
      }
    ],
    "secondary": [],
    "cc": []
  },
  "notifications": [
    {
      "recipientId": "admin-1",
      "channels": ["IN_APP", "EMAIL", "SMS"],
      "timing": "immediate",
      "delayMinutes": 0,
      "content": {
        "subject": "[CRITICAL] Database Connection Pool Exhausted",
        "shortMessage": "CRITICAL: DB connection pool exhausted. Immediate action required.",
        "body": "**CRITICAL SYSTEM ALERT**\\n\\nThe database connection pool has been exhausted.\\n\\n**Impact:** Service degradation likely\\n**Component:** Database\\n**Time:** 2024-01-15T10:30:00Z\\n\\n**Recommended Actions:**\\n1. Check database server health\\n2. Review connection pool settings\\n3. Check for connection leaks\\n\\n[View System Dashboard](/admin/system)",
        "actionUrl": "/admin/system/alerts/db-pool-123",
        "actions": [
          {"label": "View Dashboard", "url": "/admin/system", "style": "primary"},
          {"label": "Acknowledge", "url": "/admin/alerts/ack/123", "style": "secondary"}
        ]
      },
      "metadata": {
        "eventId": "alert-db-pool-123",
        "correlationId": null,
        "category": "system"
      }
    }
  ],
  "escalation": {
    "enabled": true,
    "escalateAfterMinutes": 5,
    "escalateTo": ["cto-1"],
    "escalationMessage": "Database alert not acknowledged within 5 minutes - escalating to CTO"
  },
  "batching": {
    "canBatch": false,
    "batchKey": null,
    "batchWindow": 0
  },
  "deduplication": {
    "isDuplicate": false,
    "existingNotificationId": null,
    "action": "send"
  },
  "quietHours": {
    "isQuietTime": false,
    "affectedRecipients": [],
    "deferUntil": null
  },
  "cost": {
    "estimatedCost": 0.01,
    "smsCount": 1,
    "emailCount": 1,
    "requiresApproval": false
  }
}
\`\`\`

### Example 2: New Intake Assignment

**Input:**
- Event Type: INTAKE_ASSIGNED
- Event Data: { intakeId: "intake-456", title: "API Integration Help", assigneeId: "user-2" }
- Team Members: [{ id: "user-2", role: "SUPPORT", name: "Mike" }]

**Output:**
\`\`\`json
{
  "analysis": {
    "eventType": "INTAKE_ASSIGNED",
    "eventSummary": "Support request assigned to Mike: API Integration Help",
    "urgencyLevel": "MEDIUM",
    "urgencyReasoning": "Standard intake assignment, no urgency indicators"
  },
  "recipients": {
    "primary": [
      {
        "userId": "user-2",
        "name": "Mike",
        "email": "mike@company.com",
        "role": "SUPPORT",
        "reason": "Assigned to handle this intake"
      }
    ],
    "secondary": [],
    "cc": []
  },
  "notifications": [
    {
      "recipientId": "user-2",
      "channels": ["IN_APP"],
      "timing": "immediate",
      "delayMinutes": 0,
      "content": {
        "subject": "New Assignment: API Integration Help",
        "shortMessage": "You've been assigned: API Integration Help",
        "body": "Hi Mike,\\n\\nYou have been assigned a new support request.\\n\\n**Title:** API Integration Help\\n**Pipeline:** Support Requests\\n**Stage:** New\\n**Priority:** Medium\\n\\n[View Request](/support/intake/intake-456)",
        "actionUrl": "/support/intake/intake-456",
        "actions": [
          {"label": "View Request", "url": "/support/intake/intake-456", "style": "primary"},
          {"label": "Mark In Progress", "url": "/support/intake/intake-456/start", "style": "secondary"}
        ]
      },
      "metadata": {
        "eventId": "intake-assigned-456",
        "correlationId": "intake-456",
        "category": "intake"
      }
    }
  ],
  "escalation": {
    "enabled": false,
    "escalateAfterMinutes": 0,
    "escalateTo": [],
    "escalationMessage": null
  },
  "batching": {
    "canBatch": false,
    "batchKey": null,
    "batchWindow": 0
  },
  "deduplication": {
    "isDuplicate": false,
    "existingNotificationId": null,
    "action": "send"
  },
  "quietHours": {
    "isQuietTime": false,
    "affectedRecipients": [],
    "deferUntil": null
  },
  "cost": {
    "estimatedCost": 0,
    "smsCount": 0,
    "emailCount": 0,
    "requiresApproval": false
  }
}
\`\`\`
`.trim();

/**
 * Build the notification prompt with event data
 */
export function buildNotificationPrompt(event: {
  eventType: keyof typeof NOTIFICATION_EVENT_TYPES;
  eventData: Record<string, unknown>;
  sourceContext?: string;
  orgName: string;
  timezone?: string;
  currentDateTime?: Date;
  businessHours?: { start: number; end: number };
  teamMembers?: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    preferences?: {
      quietHoursEnabled?: boolean;
      preferredChannels?: string[];
    };
  }>;
  onCall?: Array<{ id: string; name: string; role: string }>;
  userPreferences?: Record<
    string,
    {
      emailEnabled?: boolean;
      smsEnabled?: boolean;
      pushEnabled?: boolean;
      quietHoursStart?: number;
      quietHoursEnd?: number;
    }
  >;
}): string {
  const {
    eventType,
    eventData,
    sourceContext = 'system',
    orgName,
    timezone = 'UTC',
    currentDateTime = new Date(),
    businessHours = { start: 9, end: 17 },
    teamMembers = [],
    onCall = [],
    userPreferences = {},
  } = event;

  return NOTIFICATION_PROMPT.replace('{eventType}', eventType)
    .replace('{eventDataJson}', JSON.stringify(eventData, null, 2))
    .replace('{sourceContext}', sourceContext)
    .replace('{orgName}', orgName)
    .replace('{timezone}', timezone)
    .replace('{currentDateTime}', currentDateTime.toISOString())
    .replace('{businessHours}', `${businessHours.start}:00 - ${businessHours.end}:00`)
    .replace('{teamMembersJson}', JSON.stringify(teamMembers, null, 2))
    .replace('{onCallJson}', JSON.stringify(onCall, null, 2))
    .replace('{userPreferencesJson}', JSON.stringify(userPreferences, null, 2));
}

/**
 * Utility to determine urgency level from event type and data
 */
export function determineUrgencyLevel(
  eventType: keyof typeof NOTIFICATION_EVENT_TYPES,
  eventData: Record<string, unknown>
): keyof typeof URGENCY_LEVELS {
  // Check for explicit urgency in event data
  if (eventData.urgency) {
    const urgency = eventData.urgency as number;
    if (urgency >= 5) return 'CRITICAL';
    if (urgency >= 4) return 'HIGH';
    if (urgency >= 3) return 'MEDIUM';
    return 'LOW';
  }

  // Check for urgency keywords in content
  const content = JSON.stringify(eventData).toLowerCase();
  const criticalKeywords = ['critical', 'emergency', 'down', 'outage', 'security'];
  const highKeywords = ['urgent', 'important', 'blocking', 'escalate', 'deadline'];

  if (criticalKeywords.some((kw) => content.includes(kw))) {
    return 'CRITICAL';
  }
  if (highKeywords.some((kw) => content.includes(kw))) {
    return 'HIGH';
  }

  // Fall back to event type default
  const eventConfig = NOTIFICATION_EVENT_TYPES[eventType];
  return eventConfig?.defaultUrgency as keyof typeof URGENCY_LEVELS || 'MEDIUM';
}

/**
 * Utility to get recipients by role
 */
export function getRecipientsByRole(
  eventType: keyof typeof NOTIFICATION_EVENT_TYPES,
  teamMembers: Array<{ id: string; name: string; email: string; role: string }>
): Array<{ id: string; name: string; email: string; role: string }> {
  const eventConfig = NOTIFICATION_EVENT_TYPES[eventType];
  if (!eventConfig || eventConfig.notifyRoles.length === 0) {
    return [];
  }

  const notifyRoles = eventConfig.notifyRoles as readonly string[];
  return teamMembers.filter((member) => notifyRoles.includes(member.role));
}

/**
 * Utility to check if current time is within quiet hours
 */
export function isQuietHours(
  currentHour: number,
  quietHoursStart: number = 22, // 10 PM
  quietHoursEnd: number = 7 // 7 AM
): boolean {
  if (quietHoursStart < quietHoursEnd) {
    return currentHour >= quietHoursStart || currentHour < quietHoursEnd;
  }
  // Handle overnight quiet hours (e.g., 22:00 - 07:00)
  return currentHour >= quietHoursStart || currentHour < quietHoursEnd;
}

/**
 * Utility to select optimal channels based on urgency and preferences
 */
export function selectChannels(
  urgency: keyof typeof URGENCY_LEVELS,
  userPreferences?: {
    emailEnabled?: boolean;
    smsEnabled?: boolean;
    pushEnabled?: boolean;
  }
): Array<keyof typeof NOTIFICATION_CHANNELS> {
  const urgencyConfig = URGENCY_LEVELS[urgency];
  // Create mutable copy of channels array
  const availableChannels: Array<keyof typeof NOTIFICATION_CHANNELS> = [...urgencyConfig.channels];

  if (!userPreferences) {
    return availableChannels;
  }

  // Filter based on user preferences
  return availableChannels.filter((channel) => {
    if (channel === 'EMAIL' && userPreferences.emailEnabled === false) return false;
    if (channel === 'SMS' && userPreferences.smsEnabled === false) return false;
    if (channel === 'PUSH' && userPreferences.pushEnabled === false) return false;
    return true;
  });
}

/**
 * Utility to generate short message (SMS/Push compatible)
 */
export function generateShortMessage(
  eventType: keyof typeof NOTIFICATION_EVENT_TYPES,
  data: Record<string, string>,
  maxLength: number = 160
): string {
  const template = MESSAGE_TEMPLATES[eventType as keyof typeof MESSAGE_TEMPLATES];
  if (!template) {
    return `New ${eventType.replace(/_/g, ' ').toLowerCase()} notification`;
  }

  // Create mutable copy of the message string
  let message: string = String(template.shortMessage);
  for (const [key, value] of Object.entries(data)) {
    message = message.replace(`{${key}}`, value || '');
  }

  // Truncate if needed
  if (message.length > maxLength) {
    return message.substring(0, maxLength - 3) + '...';
  }

  return message;
}

export default NOTIFICATION_PROMPT;

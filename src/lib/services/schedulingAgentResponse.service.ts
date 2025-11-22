/**
 * Scheduling Agent Response Service
 *
 * Generates responses for the scheduling agent across all channels (email, SMS, chat, webhook).
 * Handles booking confirmations, alternatives, conflict notifications, and error messages.
 *
 * Reference: docs/phase/AIAGENTS.md Phase 5
 */

import { createEvent, DateArray, EventAttributes } from 'ics';
import { agentLogger } from '@/lib/services/agentLogger.service';
import type { SchedulingEvent, SchedulingAgentTask } from '@prisma/client';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Supported response channels
 */
export type ResponseChannel = 'email' | 'sms' | 'chat' | 'webhook';

/**
 * Types of responses the agent can generate
 */
export type ResponseType =
  | 'booking_confirmation'
  | 'booking_alternatives'
  | 'booking_conflict'
  | 'booking_cancelled'
  | 'task_created'
  | 'task_updated'
  | 'clarification_needed'
  | 'error'
  | 'acknowledgment';

/**
 * Generated response structure
 */
export interface GeneratedResponse {
  /** Response channel */
  channel: ResponseChannel;
  /** Type of response */
  type: ResponseType;
  /** Email subject (for email channel) */
  subject?: string;
  /** Main text content */
  body: string;
  /** HTML version (for email channel) */
  htmlBody?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
  /** File attachments */
  attachments?: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
}

/**
 * Time slot structure for alternatives
 */
export interface TimeSlot {
  startTime: Date | string;
  endTime: Date | string;
  score?: number;
}

/**
 * Recipient information for personalization
 */
export interface RecipientInfo {
  name?: string;
  email?: string;
  phone?: string;
}

// ============================================================================
// RESPONSE TEMPLATES
// ============================================================================

/**
 * Response templates organized by type and channel
 */
const templates = {
  booking_confirmation: {
    email: {
      subject: 'Your booking is confirmed: {{title}}',
      body: `Hi {{recipientName}},

Your booking has been confirmed!

MEETING DETAILS
---------------
Title: {{title}}
Date: {{date}}
Time: {{time}}
Duration: {{duration}}
{{#location}}Location: {{location}}{{/location}}
{{#meetingLink}}Meeting Link: {{meetingLink}}{{/meetingLink}}

A calendar invite is attached to this email.

If you need to reschedule or cancel, please reply to this email or contact us.

Best regards,
The Astralis Team`,
    },
    sms: {
      body: 'Confirmed: {{title}} on {{shortDate}} at {{shortTime}}. Reply HELP for options.',
    },
    chat: {
      body: `**Booking Confirmed**

Your meeting "{{title}}" has been scheduled for **{{date}}** at **{{time}}**.

{{#location}}**Location:** {{location}}{{/location}}
{{#meetingLink}}[Join Meeting]({{meetingLink}}){{/meetingLink}}`,
    },
    webhook: {
      body: '{"type":"booking_confirmation","event_id":"{{eventId}}","title":"{{title}}","start_time":"{{isoStartTime}}","end_time":"{{isoEndTime}}"}',
    },
  },

  booking_alternatives: {
    email: {
      subject: 'Alternative times available for your booking',
      body: `Hi {{recipientName}},

The requested time slot is not available. Here are some alternative options:

{{#slots}}
{{index}}. {{date}} at {{time}} ({{duration}})
{{/slots}}

Reply with the number of your preferred option, or let us know if you need different times.

Best regards,
The Astralis Team`,
    },
    sms: {
      body: 'Your slot is unavailable. Options: {{shortSlots}}. Reply 1, 2, or 3 to select.',
    },
    chat: {
      body: `**Alternative Times Available**

Your requested time isn't available. Here are some alternatives:

{{#slots}}
{{index}}. **{{date}}** at {{time}} {{#score}}(Recommended){{/score}}
{{/slots}}

Select your preferred option or request different times.`,
    },
    webhook: {
      body: '{"type":"booking_alternatives","slots":{{slotsJson}},"original_request":"{{originalRequest}}"}',
    },
  },

  booking_conflict: {
    email: {
      subject: 'Scheduling conflict detected',
      body: `Hi {{recipientName}},

We detected a conflict with your requested time slot.

CONFLICT DETAILS
----------------
Requested: {{requestedDate}} at {{requestedTime}}
Conflicts with: {{conflictTitle}}

{{#alternatives}}
AVAILABLE ALTERNATIVES
{{#slots}}
{{index}}. {{date}} at {{time}}
{{/slots}}
{{/alternatives}}

Please select an alternative time or let us know if you'd like us to suggest different options.

Best regards,
The Astralis Team`,
    },
    sms: {
      body: 'Conflict: Your {{shortDate}} {{shortTime}} slot overlaps with another event. Reply for options.',
    },
    chat: {
      body: `**Scheduling Conflict**

Your requested time conflicts with an existing event: "{{conflictTitle}}"

{{#alternatives}}
**Available alternatives:**
{{#slots}}
- {{date}} at {{time}}
{{/slots}}
{{/alternatives}}`,
    },
    webhook: {
      body: '{"type":"booking_conflict","requested_time":"{{isoRequestedTime}}","conflict":{"title":"{{conflictTitle}}","start":"{{isoConflictStart}}"}}',
    },
  },

  booking_cancelled: {
    email: {
      subject: 'Booking cancelled: {{title}}',
      body: `Hi {{recipientName}},

Your booking has been cancelled.

CANCELLED MEETING
-----------------
Title: {{title}}
Originally scheduled: {{date}} at {{time}}

If this was a mistake or you'd like to reschedule, please contact us.

Best regards,
The Astralis Team`,
    },
    sms: {
      body: 'Cancelled: {{title}} ({{shortDate}} {{shortTime}}). Reply to reschedule.',
    },
    chat: {
      body: `**Booking Cancelled**

Your meeting "{{title}}" scheduled for {{date}} at {{time}} has been cancelled.`,
    },
    webhook: {
      body: '{"type":"booking_cancelled","event_id":"{{eventId}}","title":"{{title}}","original_time":"{{isoStartTime}}"}',
    },
  },

  task_created: {
    email: {
      subject: 'Task created: {{title}}',
      body: `Hi {{recipientName}},

A new task has been created based on your request.

TASK DETAILS
------------
Title: {{title}}
{{#dueDate}}Due: {{dueDate}}{{/dueDate}}
{{#description}}Description: {{description}}{{/description}}
Priority: {{priority}}

You can view and manage this task in your dashboard.

Best regards,
The Astralis Team`,
    },
    sms: {
      body: 'Task created: {{title}}{{#dueDate}} - Due {{shortDueDate}}{{/dueDate}}. Reply VIEW for details.',
    },
    chat: {
      body: `**Task Created**

**{{title}}**
{{#dueDate}}Due: {{dueDate}}{{/dueDate}}
{{#description}}_{{description}}_{{/description}}
Priority: {{priorityEmoji}} {{priority}}`,
    },
    webhook: {
      body: '{"type":"task_created","task_id":"{{taskId}}","title":"{{title}}","due_date":"{{isoDueDate}}","priority":{{priority}}}',
    },
  },

  task_updated: {
    email: {
      subject: 'Task updated: {{title}}',
      body: `Hi {{recipientName}},

Your task has been updated.

UPDATED TASK
------------
Title: {{title}}
Status: {{status}}
{{#dueDate}}Due: {{dueDate}}{{/dueDate}}

Changes: {{changes}}

Best regards,
The Astralis Team`,
    },
    sms: {
      body: 'Task updated: {{title}} - {{status}}. Reply VIEW for details.',
    },
    chat: {
      body: `**Task Updated**

**{{title}}** - {{status}}
{{#changes}}_Changes: {{changes}}_{{/changes}}`,
    },
    webhook: {
      body: '{"type":"task_updated","task_id":"{{taskId}}","title":"{{title}}","status":"{{status}}","changes":{{changesJson}}}',
    },
  },

  clarification_needed: {
    email: {
      subject: 'We need a bit more information',
      body: `Hi {{recipientName}},

To complete your request, we need some additional information:

{{#missingInfo}}
- {{item}}
{{/missingInfo}}

Please reply with the missing details.

ORIGINAL REQUEST
----------------
"{{originalRequest}}"

Best regards,
The Astralis Team`,
    },
    sms: {
      body: 'Need more info: {{missingInfoShort}}. Reply with details.',
    },
    chat: {
      body: `**Clarification Needed**

I need a few more details to help you:

{{#missingInfo}}
- {{item}}
{{/missingInfo}}

_Original request: "{{originalRequest}}"_`,
    },
    webhook: {
      body: '{"type":"clarification_needed","task_id":"{{taskId}}","missing_info":{{missingInfoJson}},"original_request":"{{originalRequest}}"}',
    },
  },

  error: {
    email: {
      subject: 'Unable to process your request',
      body: `Hi {{recipientName}},

We encountered an issue while processing your request.

{{errorMessage}}

WHAT YOU CAN DO
---------------
{{#suggestions}}
- {{suggestion}}
{{/suggestions}}

If the problem persists, please contact our support team.

Best regards,
The Astralis Team`,
    },
    sms: {
      body: 'Error: {{shortErrorMessage}}. Reply HELP or try again.',
    },
    chat: {
      body: `**Error**

{{errorMessage}}

{{#suggestions}}
**Suggestions:**
{{#suggestions}}
- {{suggestion}}
{{/suggestions}}
{{/suggestions}}`,
    },
    webhook: {
      body: '{"type":"error","error":"{{errorCode}}","message":"{{errorMessage}}","task_id":"{{taskId}}"}',
    },
  },

  acknowledgment: {
    email: {
      subject: 'Request received',
      body: `Hi {{recipientName}},

We've received your request and are working on it.

REQUEST SUMMARY
---------------
"{{requestSummary}}"

You'll receive a follow-up message once we have more information.

Best regards,
The Astralis Team`,
    },
    sms: {
      body: 'Got it! Working on your request. We\'ll follow up soon.',
    },
    chat: {
      body: `**Request Received**

I'm processing your request: _"{{requestSummary}}"_

I'll update you shortly.`,
    },
    webhook: {
      body: '{"type":"acknowledgment","task_id":"{{taskId}}","request":"{{requestSummary}}","status":"processing"}',
    },
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format a date for display based on channel
 */
function formatDate(date: Date | string, channel: ResponseChannel): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (channel === 'sms') {
    // Short format for SMS: "Dec 15"
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // Full format for other channels
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a time for display based on channel
 */
function formatTime(date: Date | string, channel: ResponseChannel, timezone?: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (channel === 'sms') {
    // Short format for SMS: "3pm"
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      timeZone: timezone,
    }).toLowerCase();
  }

  // Full format for other channels
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
    timeZone: timezone,
  });
}

/**
 * Calculate duration between two dates in minutes
 */
function calculateDuration(start: Date | string, end: Date | string): number {
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;
  return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
}

/**
 * Format duration for display
 */
function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  return `${hours}h ${mins}m`;
}

/**
 * Simple mustache-like template replacement
 */
function renderTemplate(template: string, data: Record<string, unknown>): string {
  let result = template;

  // Handle conditional sections {{#key}}...{{/key}}
  const conditionalRegex = /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g;
  result = result.replace(conditionalRegex, (match, key, content) => {
    const value = data[key];
    if (!value) return '';
    if (Array.isArray(value)) {
      return value.map((item, index) => {
        const itemData = typeof item === 'object' ? { ...item, index: index + 1 } : { item, index: index + 1 };
        return renderTemplate(content, itemData);
      }).join('');
    }
    return content;
  });

  // Handle simple variable replacement {{key}}
  const variableRegex = /\{\{(\w+)\}\}/g;
  result = result.replace(variableRegex, (match, key) => {
    const value = data[key];
    if (value === undefined || value === null) return '';
    return String(value);
  });

  return result.trim();
}

/**
 * Convert Date to ICS DateArray format
 */
function dateToIcsArray(date: Date): DateArray {
  return [
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
  ];
}

/**
 * Get priority emoji for display
 */
function getPriorityEmoji(priority: number): string {
  const emojis: Record<number, string> = {
    1: '',
    2: '',
    3: '',
    4: '',
    5: '',
  };
  return emojis[priority] || '';
}

/**
 * Truncate text to fit SMS length constraints
 */
function truncateForSms(text: string, maxLength: number = 140): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

// ============================================================================
// SCHEDULING AGENT RESPONSE SERVICE CLASS
// ============================================================================

/**
 * Service for generating agent responses across all channels
 */
class SchedulingAgentResponseService {
  /**
   * Main method to generate a response based on type and channel
   */
  async generateResponse(
    task: SchedulingAgentTask,
    type: ResponseType,
    channel: ResponseChannel,
    data?: Record<string, unknown>
  ): Promise<GeneratedResponse> {
    const templateSet = templates[type];
    if (!templateSet) {
      throw new Error(`Unknown response type: ${type}`);
    }

    const template = templateSet[channel];
    if (!template) {
      throw new Error(`No template for channel ${channel} and type ${type}`);
    }

    // Build template data from task and additional data
    const templateData: Record<string, unknown> = {
      taskId: task.id,
      originalRequest: task.rawContent,
      ...data,
    };

    // Render the body
    const body = renderTemplate(template.body, templateData);

    // Build response
    const response: GeneratedResponse = {
      channel,
      type,
      body,
      metadata: {
        taskId: task.id,
        generatedAt: new Date().toISOString(),
      },
    };

    // Add subject for email
    if (channel === 'email' && 'subject' in template) {
      response.subject = renderTemplate(template.subject as string, templateData);
    }

    // Log template rendering
    agentLogger.log('debug', 'delivery', 'template.rendered',
      `Rendered ${type} template for ${channel}`, {
      metadata: { responseType: type, channel },
    });

    return response;
  }

  /**
   * Generate a booking confirmation response
   */
  async generateBookingConfirmation(
    event: SchedulingEvent,
    channel: ResponseChannel,
    recipient?: RecipientInfo
  ): Promise<GeneratedResponse> {
    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);
    const durationMinutes = calculateDuration(startTime, endTime);

    const templateData: Record<string, unknown> = {
      eventId: event.id,
      title: event.title,
      date: formatDate(startTime, channel),
      shortDate: formatDate(startTime, 'sms'),
      time: formatTime(startTime, channel, event.timezone),
      shortTime: formatTime(startTime, 'sms', event.timezone),
      duration: formatDuration(durationMinutes),
      location: event.location,
      meetingLink: event.meetingLink,
      recipientName: recipient?.name || 'there',
      isoStartTime: startTime.toISOString(),
      isoEndTime: endTime.toISOString(),
    };

    const template = templates.booking_confirmation[channel];
    const body = renderTemplate(template.body, templateData);

    const response: GeneratedResponse = {
      channel,
      type: 'booking_confirmation',
      body,
      metadata: {
        eventId: event.id,
        generatedAt: new Date().toISOString(),
      },
    };

    // Add subject for email
    if (channel === 'email') {
      response.subject = renderTemplate(templates.booking_confirmation.email.subject, templateData);
      response.htmlBody = this.generateBookingConfirmationHtml(event, recipient);
    }

    // Add ICS attachment for email
    if (channel === 'email') {
      try {
        const icsAttachment = await this.generateIcsAttachment(event);
        response.attachments = [icsAttachment];
        // Log ICS generation success
        agentLogger.log('debug', 'delivery', 'ics.generated',
          `Generated ICS attachment for event ${event.id}`, {
          metadata: { eventId: event.id },
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        // Log ICS generation failure
        agentLogger.log('warn', 'delivery', 'ics.failed',
          `Failed to generate ICS attachment: ${errorMsg}`, {
          metadata: { eventId: event.id, error: errorMsg },
        });
      }
    }

    // Log response generation
    agentLogger.log('debug', 'delivery', 'response.generated',
      `Generated booking_confirmation response for ${channel}`, {
      metadata: {
        eventId: event.id,
        responseType: 'booking_confirmation',
        channel,
        hasAttachments: response.attachments && response.attachments.length > 0,
      },
    });

    return response;
  }

  /**
   * Generate alternative time slots response
   */
  async generateAlternatives(
    slots: TimeSlot[],
    task: SchedulingAgentTask,
    channel: ResponseChannel,
    recipient?: RecipientInfo
  ): Promise<GeneratedResponse> {
    // Format slots for template
    const formattedSlots = slots.map((slot, index) => {
      const start = typeof slot.startTime === 'string' ? new Date(slot.startTime) : slot.startTime;
      const end = typeof slot.endTime === 'string' ? new Date(slot.endTime) : slot.endTime;
      const duration = calculateDuration(start, end);

      return {
        index: index + 1,
        date: formatDate(start, channel),
        time: formatTime(start, channel),
        duration: formatDuration(duration),
        score: slot.score && slot.score > 0.8,
      };
    });

    // For SMS, create short format
    const shortSlots = slots.slice(0, 3).map((slot, index) => {
      const start = typeof slot.startTime === 'string' ? new Date(slot.startTime) : slot.startTime;
      return `${index + 1}:${formatDate(start, 'sms')} ${formatTime(start, 'sms')}`;
    }).join(', ');

    const templateData: Record<string, unknown> = {
      taskId: task.id,
      slots: formattedSlots,
      shortSlots: truncateForSms(shortSlots, 80),
      slotsJson: JSON.stringify(slots),
      originalRequest: task.rawContent,
      recipientName: recipient?.name || 'there',
    };

    const template = templates.booking_alternatives[channel];
    const body = renderTemplate(template.body, templateData);

    const response: GeneratedResponse = {
      channel,
      type: 'booking_alternatives',
      body,
      metadata: {
        taskId: task.id,
        slotsCount: slots.length,
        generatedAt: new Date().toISOString(),
      },
    };

    if (channel === 'email') {
      response.subject = renderTemplate(templates.booking_alternatives.email.subject, templateData);
      response.htmlBody = this.generateAlternativesHtml(slots, task, recipient);
    }

    // Log response generation
    agentLogger.log('debug', 'delivery', 'response.generated',
      `Generated booking_alternatives response for ${channel}`, {
      taskId: task.id,
      metadata: { responseType: 'booking_alternatives', channel, slotsCount: slots.length },
    });

    return response;
  }

  /**
   * Generate a clarification request response
   */
  async generateClarificationRequest(
    task: SchedulingAgentTask,
    missingInfo: string[],
    channel: ResponseChannel,
    recipient?: RecipientInfo
  ): Promise<GeneratedResponse> {
    // Provide examples for common missing info types
    const infoWithExamples = missingInfo.map(info => {
      const examples: Record<string, string> = {
        'date': 'Date (e.g., "next Tuesday", "December 15th")',
        'time': 'Time (e.g., "3pm", "14:00")',
        'duration': 'Duration (e.g., "30 minutes", "1 hour")',
        'participants': 'Participants (e.g., email addresses or names)',
        'subject': 'Meeting subject or purpose',
      };
      return examples[info.toLowerCase()] || info;
    });

    const templateData: Record<string, unknown> = {
      taskId: task.id,
      missingInfo: infoWithExamples.map(item => ({ item })),
      missingInfoShort: truncateForSms(missingInfo.join(', '), 60),
      missingInfoJson: JSON.stringify(missingInfo),
      originalRequest: task.rawContent,
      recipientName: recipient?.name || 'there',
    };

    const template = templates.clarification_needed[channel];
    const body = renderTemplate(template.body, templateData);

    const response: GeneratedResponse = {
      channel,
      type: 'clarification_needed',
      body,
      metadata: {
        taskId: task.id,
        missingInfo,
        generatedAt: new Date().toISOString(),
      },
    };

    if (channel === 'email') {
      response.subject = renderTemplate(templates.clarification_needed.email.subject, templateData);
      response.htmlBody = this.generateClarificationHtml(task, missingInfo, recipient);
    }

    // Log response generation
    agentLogger.log('debug', 'delivery', 'response.generated',
      `Generated clarification_needed response for ${channel}`, {
      taskId: task.id,
      metadata: { responseType: 'clarification_needed', channel, missingInfoCount: missingInfo.length },
    });

    return response;
  }

  /**
   * Generate an error response
   */
  async generateError(
    task: SchedulingAgentTask,
    error: string,
    channel: ResponseChannel,
    recipient?: RecipientInfo
  ): Promise<GeneratedResponse> {
    // Don't expose technical details to users
    const userFriendlyErrors: Record<string, string> = {
      'DATABASE_ERROR': 'We\'re experiencing technical difficulties. Please try again later.',
      'CALENDAR_SYNC_FAILED': 'We couldn\'t sync with your calendar. Please check your integration settings.',
      'INVALID_DATE': 'The date you provided couldn\'t be recognized. Please try a different format.',
      'INVALID_TIME': 'The time you provided couldn\'t be recognized. Please try a different format.',
      'NO_AVAILABILITY': 'No available time slots found for the requested period.',
      'PERMISSION_DENIED': 'You don\'t have permission to perform this action.',
    };

    const errorMessage = userFriendlyErrors[error] || 'We couldn\'t complete your request. Please try again or contact support.';

    // Generate helpful suggestions
    const suggestions = [
      'Try rephrasing your request',
      'Check that all dates and times are in a recognizable format',
      'Contact support if the issue persists',
    ];

    const templateData: Record<string, unknown> = {
      taskId: task.id,
      errorCode: error,
      errorMessage,
      shortErrorMessage: truncateForSms(errorMessage, 100),
      suggestions: suggestions.map(suggestion => ({ suggestion })),
      recipientName: recipient?.name || 'there',
    };

    const template = templates.error[channel];
    const body = renderTemplate(template.body, templateData);

    const response: GeneratedResponse = {
      channel,
      type: 'error',
      body,
      metadata: {
        taskId: task.id,
        errorCode: error,
        generatedAt: new Date().toISOString(),
      },
    };

    if (channel === 'email') {
      response.subject = renderTemplate(templates.error.email.subject, templateData);
      response.htmlBody = this.generateErrorHtml(error, errorMessage, suggestions, recipient);
    }

    // Log response generation
    agentLogger.log('debug', 'delivery', 'response.generated',
      `Generated error response for ${channel}`, {
      taskId: task.id,
      metadata: { responseType: 'error', channel, errorCode: error },
    });

    return response;
  }

  /**
   * Generate a booking conflict response
   */
  async generateBookingConflict(
    task: SchedulingAgentTask,
    requestedTime: Date,
    conflictTitle: string,
    alternatives: TimeSlot[] | null,
    channel: ResponseChannel,
    recipient?: RecipientInfo
  ): Promise<GeneratedResponse> {
    const formattedAlternatives = alternatives?.map((slot, index) => {
      const start = typeof slot.startTime === 'string' ? new Date(slot.startTime) : slot.startTime;
      return {
        index: index + 1,
        date: formatDate(start, channel),
        time: formatTime(start, channel),
      };
    });

    const templateData: Record<string, unknown> = {
      taskId: task.id,
      requestedDate: formatDate(requestedTime, channel),
      shortDate: formatDate(requestedTime, 'sms'),
      requestedTime: formatTime(requestedTime, channel),
      shortTime: formatTime(requestedTime, 'sms'),
      isoRequestedTime: requestedTime.toISOString(),
      conflictTitle,
      isoConflictStart: requestedTime.toISOString(),
      alternatives: formattedAlternatives && formattedAlternatives.length > 0,
      slots: formattedAlternatives,
      recipientName: recipient?.name || 'there',
    };

    const template = templates.booking_conflict[channel];
    const body = renderTemplate(template.body, templateData);

    const response: GeneratedResponse = {
      channel,
      type: 'booking_conflict',
      body,
      metadata: {
        taskId: task.id,
        conflictTitle,
        alternativesCount: alternatives?.length || 0,
        generatedAt: new Date().toISOString(),
      },
    };

    if (channel === 'email') {
      response.subject = renderTemplate(templates.booking_conflict.email.subject, templateData);
      response.htmlBody = this.generateConflictHtml(requestedTime, conflictTitle, alternatives, recipient);
    }

    // Log response generation
    agentLogger.log('debug', 'delivery', 'response.generated',
      `Generated booking_conflict response for ${channel}`, {
      taskId: task.id,
      metadata: { responseType: 'booking_conflict', channel, alternativesCount: alternatives?.length || 0 },
    });

    return response;
  }

  /**
   * Generate a booking cancelled response
   */
  async generateBookingCancelled(
    event: SchedulingEvent,
    channel: ResponseChannel,
    recipient?: RecipientInfo
  ): Promise<GeneratedResponse> {
    const startTime = new Date(event.startTime);

    const templateData: Record<string, unknown> = {
      eventId: event.id,
      title: event.title,
      date: formatDate(startTime, channel),
      shortDate: formatDate(startTime, 'sms'),
      time: formatTime(startTime, channel, event.timezone),
      shortTime: formatTime(startTime, 'sms', event.timezone),
      isoStartTime: startTime.toISOString(),
      recipientName: recipient?.name || 'there',
    };

    const template = templates.booking_cancelled[channel];
    const body = renderTemplate(template.body, templateData);

    const response: GeneratedResponse = {
      channel,
      type: 'booking_cancelled',
      body,
      metadata: {
        eventId: event.id,
        generatedAt: new Date().toISOString(),
      },
    };

    if (channel === 'email') {
      response.subject = renderTemplate(templates.booking_cancelled.email.subject, templateData);
      response.htmlBody = this.generateCancelledHtml(event, recipient);
    }

    return response;
  }

  /**
   * Generate a task created response
   */
  async generateTaskCreated(
    task: SchedulingAgentTask,
    channel: ResponseChannel,
    recipient?: RecipientInfo
  ): Promise<GeneratedResponse> {
    const templateData: Record<string, unknown> = {
      taskId: task.id,
      title: task.title || 'New Task',
      description: task.description,
      dueDate: task.dueDate ? formatDate(task.dueDate, channel) : null,
      shortDueDate: task.dueDate ? formatDate(task.dueDate, 'sms') : null,
      isoDueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
      priority: task.priority,
      priorityEmoji: getPriorityEmoji(task.priority),
      recipientName: recipient?.name || 'there',
    };

    const template = templates.task_created[channel];
    const body = renderTemplate(template.body, templateData);

    const response: GeneratedResponse = {
      channel,
      type: 'task_created',
      body,
      metadata: {
        taskId: task.id,
        generatedAt: new Date().toISOString(),
      },
    };

    if (channel === 'email') {
      response.subject = renderTemplate(templates.task_created.email.subject, templateData);
      response.htmlBody = this.generateTaskCreatedHtml(task, recipient);
    }

    return response;
  }

  /**
   * Generate an acknowledgment response
   */
  async generateAcknowledgment(
    task: SchedulingAgentTask,
    channel: ResponseChannel,
    recipient?: RecipientInfo
  ): Promise<GeneratedResponse> {
    // Truncate long requests for display
    const requestSummary = task.rawContent.length > 100
      ? task.rawContent.substring(0, 100) + '...'
      : task.rawContent;

    const templateData: Record<string, unknown> = {
      taskId: task.id,
      requestSummary,
      recipientName: recipient?.name || 'there',
    };

    const template = templates.acknowledgment[channel];
    const body = renderTemplate(template.body, templateData);

    const response: GeneratedResponse = {
      channel,
      type: 'acknowledgment',
      body,
      metadata: {
        taskId: task.id,
        generatedAt: new Date().toISOString(),
      },
    };

    if (channel === 'email') {
      response.subject = renderTemplate(templates.acknowledgment.email.subject, templateData);
    }

    return response;
  }

  // ============================================================================
  // ICS GENERATION
  // ============================================================================

  /**
   * Generate an ICS calendar attachment for a scheduling event
   */
  async generateIcsAttachment(event: SchedulingEvent): Promise<{
    filename: string;
    content: string;
    contentType: string;
  }> {
    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);
    const durationMinutes = calculateDuration(startTime, endTime);

    const icsEvent: EventAttributes = {
      start: dateToIcsArray(startTime),
      duration: { minutes: durationMinutes },
      title: event.title,
      description: event.description || '',
      location: event.location || event.meetingLink || '',
      status: 'CONFIRMED',
      busyStatus: 'BUSY',
      organizer: {
        name: 'Astralis',
        email: 'support@astralisone.com',
      },
      attendees: event.participantEmails?.map(email => ({
        name: email,
        email,
        rsvp: true,
        partstat: 'NEEDS-ACTION' as const,
        role: 'REQ-PARTICIPANT' as const,
      })) || [],
      method: 'REQUEST',
    };

    return new Promise((resolve, reject) => {
      createEvent(icsEvent, (error, value) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            filename: `${event.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics`,
            content: value,
            contentType: 'text/calendar',
          });
        }
      });
    });
  }

  // ============================================================================
  // HTML TEMPLATE GENERATORS
  // ============================================================================

  /**
   * Generate HTML email for booking confirmation
   */
  private generateBookingConfirmationHtml(
    event: SchedulingEvent,
    recipient?: RecipientInfo
  ): string {
    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);
    const duration = formatDuration(calculateDuration(startTime, endTime));
    const dateStr = formatDate(startTime, 'email');
    const timeStr = formatTime(startTime, 'email', event.timezone);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0A1B2B 0%, #1a3a52 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">ASTRALIS</h1>
              <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 16px;">Booking Confirmed</p>
            </td>
          </tr>

          <!-- Success Icon -->
          <tr>
            <td style="padding: 40px 30px 20px; text-align: center;">
              <div style="width: 60px; height: 60px; background-color: #22c55e; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 30px;">&#10003;</span>
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 30px 30px;">
              <h2 style="margin: 0 0 20px; color: #0A1B2B; font-size: 22px; text-align: center;">Hi ${recipient?.name || 'there'},</h2>
              <p style="margin: 0 0 20px; color: #475569; font-size: 16px; line-height: 1.6;">
                Your booking has been confirmed!
              </p>

              <!-- Booking Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 25px;">
                    <h3 style="margin: 0 0 15px; color: #0A1B2B; font-size: 18px;">Meeting Details</h3>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Title:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${event.title}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Date:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${dateStr}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Time:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${timeStr}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Duration:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${duration}</td>
                      </tr>
                      ${event.location ? `
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Location:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${event.location}</td>
                      </tr>
                      ` : ''}
                      ${event.meetingLink ? `
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Meeting Link:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">
                          <a href="${event.meetingLink}" style="color: #3b82f6; text-decoration: none;">Join Meeting</a>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 30px 0 0; color: #475569; font-size: 15px; line-height: 1.6;">
                A calendar invite is attached to this email.
              </p>
              <p style="margin: 10px 0 0; color: #475569; font-size: 15px; line-height: 1.6;">
                Best regards,<br>
                <strong style="color: #0A1B2B;">The Astralis Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px; color: #64748b; font-size: 14px;">
                <strong>ASTRALIS</strong>
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                <a href="mailto:support@astralisone.com" style="color: #3b82f6; text-decoration: none;">support@astralisone.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Generate HTML email for alternatives
   */
  private generateAlternativesHtml(
    slots: TimeSlot[],
    task: SchedulingAgentTask,
    recipient?: RecipientInfo
  ): string {
    const slotRows = slots.map((slot, index) => {
      const start = typeof slot.startTime === 'string' ? new Date(slot.startTime) : slot.startTime;
      const end = typeof slot.endTime === 'string' ? new Date(slot.endTime) : slot.endTime;
      const duration = formatDuration(calculateDuration(start, end));
      const dateStr = formatDate(start, 'email');
      const timeStr = formatTime(start, 'email');
      const recommended = slot.score && slot.score > 0.8;

      return `
        <tr>
          <td style="padding: 15px; border-bottom: 1px solid #e2e8f0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width: 40px; vertical-align: top;">
                  <div style="width: 32px; height: 32px; background-color: ${recommended ? '#22c55e' : '#3b82f6'}; border-radius: 50%; text-align: center; line-height: 32px; color: white; font-weight: bold;">
                    ${index + 1}
                  </div>
                </td>
                <td style="padding-left: 15px;">
                  <strong style="color: #0A1B2B; font-size: 15px;">${dateStr}</strong>
                  <br>
                  <span style="color: #64748b; font-size: 14px;">${timeStr} (${duration})</span>
                  ${recommended ? '<br><span style="color: #22c55e; font-size: 12px; font-weight: 600;">Recommended</span>' : ''}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    }).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alternative Times Available</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">ASTRALIS</h1>
              <p style="margin: 10px 0 0 0; color: #fef3c7; font-size: 16px;">Alternative Times Available</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 20px; color: #0A1B2B; font-size: 22px;">Hi ${recipient?.name || 'there'},</h2>
              <p style="margin: 0 0 20px; color: #475569; font-size: 16px; line-height: 1.6;">
                The requested time slot is not available. Here are some alternative options:
              </p>

              <!-- Slots Table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin: 20px 0;">
                ${slotRows}
              </table>

              <p style="margin: 20px 0; color: #475569; font-size: 15px; line-height: 1.6;">
                Reply with the number of your preferred option, or let us know if you need different times.
              </p>

              <p style="margin: 30px 0 0; color: #475569; font-size: 15px; line-height: 1.6;">
                Best regards,<br>
                <strong style="color: #0A1B2B;">The Astralis Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 14px;"><strong>ASTRALIS</strong></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Generate HTML email for clarification request
   */
  private generateClarificationHtml(
    task: SchedulingAgentTask,
    missingInfo: string[],
    recipient?: RecipientInfo
  ): string {
    const infoItems = missingInfo.map(info => `<li style="padding: 5px 0; color: #1e293b;">${info}</li>`).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Clarification Needed</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">ASTRALIS</h1>
              <p style="margin: 10px 0 0 0; color: #dbeafe; font-size: 16px;">We need a bit more information</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 20px; color: #0A1B2B; font-size: 22px;">Hi ${recipient?.name || 'there'},</h2>
              <p style="margin: 0 0 20px; color: #475569; font-size: 16px; line-height: 1.6;">
                To complete your request, we need some additional information:
              </p>

              <ul style="background-color: #f8fafc; padding: 20px 40px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                ${infoItems}
              </ul>

              <div style="margin: 20px 0; padding: 15px; background-color: #f1f5f9; border-radius: 8px;">
                <p style="margin: 0; color: #64748b; font-size: 13px;">
                  <strong>Your original request:</strong><br>
                  <em>"${task.rawContent}"</em>
                </p>
              </div>

              <p style="margin: 20px 0; color: #475569; font-size: 15px; line-height: 1.6;">
                Please reply with the missing details.
              </p>

              <p style="margin: 30px 0 0; color: #475569; font-size: 15px; line-height: 1.6;">
                Best regards,<br>
                <strong style="color: #0A1B2B;">The Astralis Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 14px;"><strong>ASTRALIS</strong></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Generate HTML email for error message
   */
  private generateErrorHtml(
    errorCode: string,
    errorMessage: string,
    suggestions: string[],
    recipient?: RecipientInfo
  ): string {
    const suggestionItems = suggestions.map(s => `<li style="padding: 5px 0; color: #166534;">${s}</li>`).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unable to Process Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">ASTRALIS</h1>
              <p style="margin: 10px 0 0 0; color: #fecaca; font-size: 16px;">Unable to Process Request</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 20px; color: #0A1B2B; font-size: 22px;">Hi ${recipient?.name || 'there'},</h2>

              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px 20px; border-radius: 4px; margin-bottom: 20px;">
                <p style="margin: 0; color: #991b1b; font-size: 15px;">
                  ${errorMessage}
                </p>
              </div>

              <h3 style="margin: 25px 0 15px; color: #0A1B2B; font-size: 16px;">What you can do:</h3>
              <ul style="background-color: #f0fdf4; padding: 15px 40px; border-radius: 8px; border-left: 4px solid #22c55e;">
                ${suggestionItems}
              </ul>

              <p style="margin: 30px 0 0; color: #475569; font-size: 15px; line-height: 1.6;">
                Best regards,<br>
                <strong style="color: #0A1B2B;">The Astralis Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 14px;"><strong>ASTRALIS</strong></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Generate HTML email for booking conflict
   */
  private generateConflictHtml(
    requestedTime: Date,
    conflictTitle: string,
    alternatives: TimeSlot[] | null,
    recipient?: RecipientInfo
  ): string {
    const dateStr = formatDate(requestedTime, 'email');
    const timeStr = formatTime(requestedTime, 'email');

    let alternativesHtml = '';
    if (alternatives && alternatives.length > 0) {
      const altRows = alternatives.map((slot, index) => {
        const start = typeof slot.startTime === 'string' ? new Date(slot.startTime) : slot.startTime;
        return `<li style="padding: 8px 0; color: #1e293b;">${index + 1}. ${formatDate(start, 'email')} at ${formatTime(start, 'email')}</li>`;
      }).join('');

      alternativesHtml = `
        <h3 style="margin: 25px 0 15px; color: #0A1B2B; font-size: 16px;">Available Alternatives:</h3>
        <ul style="background-color: #f0fdf4; padding: 15px 40px; border-radius: 8px; border-left: 4px solid #22c55e;">
          ${altRows}
        </ul>
      `;
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Scheduling Conflict</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">ASTRALIS</h1>
              <p style="margin: 10px 0 0 0; color: #fef3c7; font-size: 16px;">Scheduling Conflict Detected</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 20px; color: #0A1B2B; font-size: 22px;">Hi ${recipient?.name || 'there'},</h2>

              <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px 20px; border-radius: 4px; margin-bottom: 20px;">
                <p style="margin: 0 0 10px; color: #92400e; font-size: 15px;">
                  <strong>Conflict Details:</strong>
                </p>
                <p style="margin: 0; color: #78350f; font-size: 14px;">
                  Requested: ${dateStr} at ${timeStr}<br>
                  Conflicts with: "${conflictTitle}"
                </p>
              </div>

              ${alternativesHtml}

              <p style="margin: 20px 0; color: #475569; font-size: 15px; line-height: 1.6;">
                Please select an alternative time or let us know if you'd like different options.
              </p>

              <p style="margin: 30px 0 0; color: #475569; font-size: 15px; line-height: 1.6;">
                Best regards,<br>
                <strong style="color: #0A1B2B;">The Astralis Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 14px;"><strong>ASTRALIS</strong></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Generate HTML email for booking cancelled
   */
  private generateCancelledHtml(
    event: SchedulingEvent,
    recipient?: RecipientInfo
  ): string {
    const startTime = new Date(event.startTime);
    const dateStr = formatDate(startTime, 'email');
    const timeStr = formatTime(startTime, 'email', event.timezone);

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Cancelled</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">ASTRALIS</h1>
              <p style="margin: 10px 0 0 0; color: #d1d5db; font-size: 16px;">Booking Cancelled</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 20px; color: #0A1B2B; font-size: 22px;">Hi ${recipient?.name || 'there'},</h2>
              <p style="margin: 0 0 20px; color: #475569; font-size: 16px; line-height: 1.6;">
                Your booking has been cancelled.
              </p>

              <!-- Cancelled Booking Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin: 20px 0; border: 1px dashed #d1d5db;">
                <tr>
                  <td style="padding: 25px;">
                    <h3 style="margin: 0 0 15px; color: #6b7280; font-size: 18px; text-decoration: line-through;">Cancelled Meeting</h3>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 8px 0; color: #9ca3af; font-size: 14px; font-weight: 600;">Title:</td>
                        <td style="padding: 8px 0; color: #9ca3af; font-size: 14px; text-align: right;">${event.title}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #9ca3af; font-size: 14px; font-weight: 600;">Date:</td>
                        <td style="padding: 8px 0; color: #9ca3af; font-size: 14px; text-align: right;">${dateStr}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #9ca3af; font-size: 14px; font-weight: 600;">Time:</td>
                        <td style="padding: 8px 0; color: #9ca3af; font-size: 14px; text-align: right;">${timeStr}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0; color: #475569; font-size: 15px; line-height: 1.6;">
                If this was a mistake or you'd like to reschedule, please contact us.
              </p>

              <p style="margin: 30px 0 0; color: #475569; font-size: 15px; line-height: 1.6;">
                Best regards,<br>
                <strong style="color: #0A1B2B;">The Astralis Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 14px;"><strong>ASTRALIS</strong></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Generate HTML email for task created
   */
  private generateTaskCreatedHtml(
    task: SchedulingAgentTask,
    recipient?: RecipientInfo
  ): string {
    const dueDateStr = task.dueDate ? formatDate(task.dueDate, 'email') : null;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Task Created</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">ASTRALIS</h1>
              <p style="margin: 10px 0 0 0; color: #ddd6fe; font-size: 16px;">Task Created</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px;">
              <h2 style="margin: 0 0 20px; color: #0A1B2B; font-size: 22px;">Hi ${recipient?.name || 'there'},</h2>
              <p style="margin: 0 0 20px; color: #475569; font-size: 16px; line-height: 1.6;">
                A new task has been created based on your request.
              </p>

              <!-- Task Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #faf5ff; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6;">
                <tr>
                  <td style="padding: 25px;">
                    <h3 style="margin: 0 0 15px; color: #5b21b6; font-size: 18px;">${task.title || 'New Task'}</h3>

                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${task.description ? `
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; line-height: 1.5;" colspan="2">
                          ${task.description}
                        </td>
                      </tr>
                      ` : ''}
                      ${dueDateStr ? `
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Due:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${dueDateStr}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-weight: 600;">Priority:</td>
                        <td style="padding: 8px 0; color: #1e293b; font-size: 14px; text-align: right;">${task.priority}/5</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0; color: #475569; font-size: 15px; line-height: 1.6;">
                You can view and manage this task in your dashboard.
              </p>

              <p style="margin: 30px 0 0; color: #475569; font-size: 15px; line-height: 1.6;">
                Best regards,<br>
                <strong style="color: #0A1B2B;">The Astralis Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; color: #64748b; font-size: 14px;"><strong>ASTRALIS</strong></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Singleton instance of SchedulingAgentResponseService
 */
export const schedulingAgentResponseService = new SchedulingAgentResponseService();

/**
 * Export the class for testing or custom instantiation
 */
export { SchedulingAgentResponseService };

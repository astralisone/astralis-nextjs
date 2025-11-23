/**
 * Orchestration Agent Prompts
 *
 * This module exports all prompts and provides a PromptBuilder utility
 * for constructing prompts with dynamic context.
 *
 * Usage:
 * ```typescript
 * import { PromptBuilder, ORCHESTRATION_SYSTEM_PROMPT } from '@/lib/agent/prompts';
 *
 * // Using PromptBuilder (recommended)
 * const systemPrompt = PromptBuilder.buildSystemPrompt({
 *   orgName: 'Acme Corp',
 *   pipelines: [...],
 *   teamMembers: [...],
 * });
 *
 * const intakePrompt = PromptBuilder.buildIntakePrompt({
 *   source: 'EMAIL',
 *   subject: 'Support Request',
 *   body: '...',
 *   senderEmail: 'user@example.com',
 * });
 *
 * // Or use raw templates directly
 * const rawPrompt = ORCHESTRATION_SYSTEM_PROMPT
 *   .replace('{orgName}', 'Acme Corp');
 * ```
 */

// Export raw prompt templates
import {
  ORCHESTRATION_SYSTEM_PROMPT,
  buildSystemPrompt as buildSystemPromptFn,
} from './system-prompt';

import {
  INTAKE_ROUTING_PROMPT,
  buildIntakeRoutingPrompt as buildIntakeRoutingPromptFn,
  INTENT_CATEGORIES,
  URGENCY_KEYWORDS,
  detectUrgencyLevel,
  detectIntentCategory,
} from './intake-routing';

import {
  SCHEDULING_PROMPT,
  buildSchedulingPrompt as buildSchedulingPromptFn,
  MEETING_TYPES,
  TIME_PREFERENCES,
  REMINDER_PRESETS,
  estimateDuration,
  isWithinBusinessHours,
  isDuringLunch,
  getRecommendedReminders,
} from './scheduling';

import {
  NOTIFICATION_PROMPT,
  buildNotificationPrompt as buildNotificationPromptFn,
  NOTIFICATION_EVENT_TYPES,
  URGENCY_LEVELS,
  NOTIFICATION_CHANNELS,
  ROLE_NOTIFICATION_ROUTING,
  MESSAGE_TEMPLATES,
  determineUrgencyLevel,
  getRecipientsByRole,
  isQuietHours,
  selectChannels,
  generateShortMessage,
} from './notification';

// Re-export everything
export {
  // System prompt
  ORCHESTRATION_SYSTEM_PROMPT,
  buildSystemPromptFn as buildSystemPrompt,
  // Intake routing
  INTAKE_ROUTING_PROMPT,
  buildIntakeRoutingPromptFn as buildIntakeRoutingPrompt,
  INTENT_CATEGORIES,
  URGENCY_KEYWORDS,
  detectUrgencyLevel,
  detectIntentCategory,
  // Scheduling
  SCHEDULING_PROMPT,
  buildSchedulingPromptFn as buildSchedulingPrompt,
  MEETING_TYPES,
  TIME_PREFERENCES,
  REMINDER_PRESETS,
  estimateDuration,
  isWithinBusinessHours,
  isDuringLunch,
  getRecommendedReminders,
  // Notification
  NOTIFICATION_PROMPT,
  buildNotificationPromptFn as buildNotificationPrompt,
  NOTIFICATION_EVENT_TYPES,
  URGENCY_LEVELS,
  NOTIFICATION_CHANNELS,
  ROLE_NOTIFICATION_ROUTING,
  MESSAGE_TEMPLATES,
  determineUrgencyLevel,
  getRecipientsByRole,
  isQuietHours,
  selectChannels,
  generateShortMessage,
};

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Organization context for system prompt
 */
export interface OrgContext {
  /** Organization name */
  orgName: string;
  /** Available pipelines with stages */
  pipelines: Array<{
    id: string;
    name: string;
    description?: string | null;
    stages: Array<{
      id: string;
      name: string;
      order: number;
    }>;
  }>;
  /** Team members with roles */
  teamMembers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    isAvailable?: boolean;
  }>;
  /** Current date/time (defaults to now) */
  currentDateTime?: Date;
  /** Organization timezone (defaults to UTC) */
  timezone?: string;
}

/**
 * Intake data for classification
 */
export interface IntakeData {
  /** Source channel of the intake */
  source: 'FORM' | 'EMAIL' | 'CHAT' | 'API';
  /** Subject line or title */
  subject: string;
  /** Main content body */
  body: string;
  /** Sender's email address */
  senderEmail: string;
  /** Sender's name (optional) */
  senderName?: string;
  /** Additional form fields or metadata */
  additionalFields?: Record<string, unknown>;
  /** Timestamp of submission */
  timestamp?: Date;
}

/**
 * Scheduling request for calendar operations
 */
export interface SchedulingRequest {
  /** Type of scheduling operation */
  requestType: 'CREATE_EVENT' | 'UPDATE_EVENT' | 'CANCEL_EVENT' | 'FIND_SLOT' | 'RESCHEDULE';
  /** Raw request text from user */
  rawRequest: string;
  /** Organization name */
  orgName: string;
  /** Organization timezone */
  timezone?: string;
  /** Current date/time */
  currentDateTime?: Date;
  /** Existing events for today */
  existingEventsToday?: Array<{
    id: string;
    title: string;
    start: string;
    end: string;
  }>;
  /** Existing events this week */
  existingEventsThisWeek?: Array<{
    id: string;
    title: string;
    start: string;
    end: string;
  }>;
  /** Blocked/busy time slots */
  busySlots?: Array<{
    start: string;
    end: string;
  }>;
  /** Available attendees */
  attendees?: Array<{
    id: string;
    name: string;
    email: string;
    role?: string;
    availability?: Array<{
      start: string;
      end: string;
    }>;
  }>;
}

/**
 * Notification event for routing decisions
 */
export interface NotificationEvent {
  /** Type of event triggering notification */
  eventType:
    | 'INTAKE_CREATED'
    | 'INTAKE_ASSIGNED'
    | 'INTAKE_ESCALATED'
    | 'PIPELINE_STAGE_CHANGED'
    | 'PIPELINE_ITEM_OVERDUE'
    | 'PIPELINE_ITEM_COMPLETED'
    | 'EVENT_REMINDER'
    | 'EVENT_CANCELLED'
    | 'EVENT_RESCHEDULED'
    | 'SYSTEM_ALERT'
    | 'AUTOMATION_FAILED'
    | 'AUTOMATION_COMPLETED'
    | 'USER_MENTIONED'
    | 'TASK_ASSIGNED'
    | 'APPROVAL_REQUESTED'
    | 'APPROVAL_GRANTED'
    | 'APPROVAL_DENIED';
  /** Event-specific data */
  eventData: Record<string, unknown>;
  /** Source context description */
  sourceContext?: string;
  /** Organization name */
  orgName: string;
  /** Organization timezone */
  timezone?: string;
  /** Current date/time */
  currentDateTime?: Date;
  /** Business hours configuration */
  businessHours?: {
    start: number;
    end: number;
  };
  /** Available team members */
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
  /** Currently on-call team members */
  onCall?: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  /** User notification preferences */
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
}

// ============================================================================
// PromptBuilder Utility Class
// ============================================================================

/**
 * PromptBuilder provides a unified interface for building all agent prompts.
 *
 * This class offers static methods to construct prompts with proper context
 * and validation.
 *
 * @example
 * ```typescript
 * // Build system prompt
 * const systemPrompt = PromptBuilder.buildSystemPrompt({
 *   orgName: 'Acme Corp',
 *   pipelines: [{ id: 'sales', name: 'Sales', stages: [...] }],
 *   teamMembers: [{ id: 'user-1', name: 'John', email: 'john@acme.com', role: 'SALES' }],
 * });
 *
 * // Build intake routing prompt
 * const intakePrompt = PromptBuilder.buildIntakePrompt({
 *   source: 'EMAIL',
 *   subject: 'Question about pricing',
 *   body: 'I would like to know about your enterprise plan...',
 *   senderEmail: 'prospect@company.com',
 *   senderName: 'Jane Doe',
 * });
 *
 * // Build scheduling prompt
 * const schedulingPrompt = PromptBuilder.buildSchedulingPrompt({
 *   requestType: 'CREATE_EVENT',
 *   rawRequest: 'Schedule a demo with John tomorrow at 2pm',
 *   orgName: 'Acme Corp',
 *   existingEventsToday: [...],
 *   attendees: [...],
 * });
 *
 * // Build notification prompt
 * const notificationPrompt = PromptBuilder.buildNotificationPrompt({
 *   eventType: 'INTAKE_CREATED',
 *   eventData: { intakeId: '123', title: 'Support Request' },
 *   orgName: 'Acme Corp',
 *   teamMembers: [...],
 * });
 * ```
 */
export class PromptBuilder {
  /**
   * Build the main orchestration system prompt with organization context.
   *
   * @param context - Organization context including pipelines and team members
   * @returns Fully populated system prompt string
   *
   * @example
   * ```typescript
   * const prompt = PromptBuilder.buildSystemPrompt({
   *   orgName: 'Acme Corp',
   *   pipelines: [
   *     {
   *       id: 'sales-inquiries',
   *       name: 'Sales Inquiries',
   *       stages: [
   *         { id: 'new', name: 'New Leads', order: 1 },
   *         { id: 'qualified', name: 'Qualified', order: 2 },
   *       ],
   *     },
   *   ],
   *   teamMembers: [
   *     { id: 'user-1', name: 'Alice', email: 'alice@acme.com', role: 'SALES' },
   *     { id: 'user-2', name: 'Bob', email: 'bob@acme.com', role: 'ADMIN' },
   *   ],
   *   timezone: 'America/New_York',
   * });
   * ```
   */
  static buildSystemPrompt(context: OrgContext): string {
    return buildSystemPromptFn(context);
  }

  /**
   * Build the intake routing prompt for classification.
   *
   * @param intake - Intake data to classify
   * @returns Fully populated intake routing prompt string
   *
   * @example
   * ```typescript
   * const prompt = PromptBuilder.buildIntakePrompt({
   *   source: 'FORM',
   *   subject: 'Partnership Inquiry',
   *   body: 'We are interested in becoming a reseller for your product...',
   *   senderEmail: 'partner@company.com',
   *   senderName: 'John Smith',
   *   additionalFields: {
   *     company: 'PartnerCo',
   *     employees: '50-100',
   *   },
   * });
   * ```
   */
  static buildIntakePrompt(intake: IntakeData): string {
    return buildIntakeRoutingPromptFn(intake);
  }

  /**
   * Build the scheduling prompt for calendar operations.
   *
   * @param request - Scheduling request with calendar context
   * @returns Fully populated scheduling prompt string
   *
   * @example
   * ```typescript
   * const prompt = PromptBuilder.buildSchedulingPrompt({
   *   requestType: 'CREATE_EVENT',
   *   rawRequest: 'Set up a 45-minute product demo with the marketing team next Tuesday',
   *   orgName: 'Acme Corp',
   *   timezone: 'America/Los_Angeles',
   *   existingEventsToday: [
   *     { id: 'evt-1', title: 'Standup', start: '2024-01-15T09:00:00Z', end: '2024-01-15T09:30:00Z' },
   *   ],
   *   attendees: [
   *     { id: 'user-1', name: 'Sarah', email: 'sarah@acme.com', role: 'PM' },
   *   ],
   * });
   * ```
   */
  static buildSchedulingPrompt(request: SchedulingRequest): string {
    return buildSchedulingPromptFn(request);
  }

  /**
   * Build the notification prompt for routing decisions.
   *
   * @param event - Notification event with context
   * @returns Fully populated notification prompt string
   *
   * @example
   * ```typescript
   * const prompt = PromptBuilder.buildNotificationPrompt({
   *   eventType: 'INTAKE_ESCALATED',
   *   eventData: {
   *     intakeId: 'intake-123',
   *     title: 'Urgent Support Request',
   *     originalPriority: 3,
   *     newPriority: 5,
   *     escalationReason: 'No response in 4 hours',
   *   },
   *   orgName: 'Acme Corp',
   *   teamMembers: [
   *     { id: 'admin-1', name: 'Admin', email: 'admin@acme.com', role: 'ADMIN' },
   *   ],
   *   onCall: [
   *     { id: 'ops-1', name: 'On-Call Engineer', role: 'OPERATOR' },
   *   ],
   * });
   * ```
   */
  static buildNotificationPrompt(event: NotificationEvent): string {
    return buildNotificationPromptFn(event);
  }

  /**
   * Get all available prompt templates.
   *
   * @returns Object containing all raw prompt templates
   */
  static getTemplates(): {
    system: string;
    intakeRouting: string;
    scheduling: string;
    notification: string;
  } {
    return {
      system: ORCHESTRATION_SYSTEM_PROMPT,
      intakeRouting: INTAKE_ROUTING_PROMPT,
      scheduling: SCHEDULING_PROMPT,
      notification: NOTIFICATION_PROMPT,
    };
  }

  /**
   * Validate that all required context fields are present.
   *
   * @param context - Context object to validate
   * @param requiredFields - Array of required field names
   * @throws Error if any required field is missing
   */
  static validateContext(
    context: Record<string, unknown>,
    requiredFields: string[]
  ): void {
    const missing = requiredFields.filter(
      (field) => context[field] === undefined || context[field] === null
    );

    if (missing.length > 0) {
      throw new Error(
        `Missing required context fields: ${missing.join(', ')}`
      );
    }
  }

  /**
   * Estimate token count for a prompt string.
   * Uses rough estimation of 4 characters per token.
   *
   * @param prompt - Prompt string to estimate
   * @returns Estimated token count
   */
  static estimateTokens(prompt: string): number {
    // Rough estimation: ~4 characters per token for English text
    return Math.ceil(prompt.length / 4);
  }

  /**
   * Truncate prompt to fit within token limit.
   *
   * @param prompt - Prompt to truncate
   * @param maxTokens - Maximum token limit
   * @returns Truncated prompt string
   */
  static truncatePrompt(prompt: string, maxTokens: number): string {
    const estimatedTokens = this.estimateTokens(prompt);

    if (estimatedTokens <= maxTokens) {
      return prompt;
    }

    // Calculate target character count
    const targetChars = maxTokens * 4;
    const truncated = prompt.substring(0, targetChars - 50);

    // Add truncation indicator
    return truncated + '\n\n[... content truncated for length ...]';
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a minimal system prompt for quick operations.
 * Useful when full context is not needed.
 */
export function createMinimalSystemPrompt(orgName: string): string {
  return `You are the AstralisOps Orchestration Agent for "${orgName}".

Analyze the input and respond with valid JSON containing:
- intent: The classified intent
- confidence: Score from 0.0 to 1.0
- actions: Array of actions to take
- requiresApproval: Boolean indicating if human approval is needed

Be concise and accurate.`;
}

/**
 * Combine multiple prompts into a single context.
 * Useful for complex operations requiring multiple capabilities.
 */
export function combinePrompts(
  systemPrompt: string,
  taskPrompt: string
): string {
  return `${systemPrompt}

---
CURRENT TASK:
---

${taskPrompt}`;
}

/**
 * Extract JSON from LLM response that may contain markdown code blocks.
 */
export function extractJsonFromResponse(response: string): Record<string, unknown> | null {
  // Try to extract from markdown code block
  const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim()) as Record<string, unknown>;
    } catch {
      // Continue to try direct parse
    }
  }

  // Try direct JSON parse
  try {
    return JSON.parse(response.trim()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Validate agent response structure matches expected schema.
 */
export function validateAgentResponse(
  response: Record<string, unknown>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required top-level fields
  if (typeof response.confidence !== 'number') {
    errors.push('Missing or invalid "confidence" field (expected number)');
  } else if (response.confidence < 0 || response.confidence > 1) {
    errors.push('"confidence" must be between 0 and 1');
  }

  if (!Array.isArray(response.actions)) {
    errors.push('Missing or invalid "actions" field (expected array)');
  }

  if (typeof response.requiresApproval !== 'boolean') {
    errors.push('Missing or invalid "requiresApproval" field (expected boolean)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default PromptBuilder;

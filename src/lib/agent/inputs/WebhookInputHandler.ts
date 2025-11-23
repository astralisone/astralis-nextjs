/**
 * WebhookInputHandler - Handler for webhook and form submissions
 *
 * Processes incoming webhooks from various sources:
 * - Contact forms
 * - Booking forms
 * - Survey forms
 * - Newsletter signups
 * - Intake forms
 * - Generic webhooks
 *
 * Features:
 * - Source-specific validation
 * - Field extraction and normalization
 * - Automatic event type detection
 * - Signature verification (optional)
 */

import { z } from 'zod';
import {
  BaseInputHandler,
  type InputHandlerConfig,
  type ValidationResult,
  type ProcessingResult,
} from './BaseInputHandler';
import {
  AgentInputSource,
  type AgentInput,
  type AgentEventType,
} from '../types/agent.types';

// Simple UUID v4 generator (crypto-safe when available)
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// =============================================================================
// Webhook Source Types
// =============================================================================

export type WebhookSource =
  | 'contact_form'
  | 'booking_form'
  | 'survey_form'
  | 'newsletter_signup'
  | 'intake_form'
  | 'callback_request'
  | 'generic';

// =============================================================================
// Zod Schemas for Validation
// =============================================================================

/**
 * Base webhook payload schema
 */
const WebhookPayloadSchema = z.object({
  source: z.string().min(1),
  timestamp: z.union([z.string(), z.date()]).optional(),
  data: z.record(z.unknown()),
  headers: z.record(z.string()).optional(),
  signature: z.string().optional(),
});

/**
 * Contact form specific schema
 */
const ContactFormSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().optional(),
  subject: z.string().optional(),
  company: z.string().optional(),
});

/**
 * Booking form specific schema
 */
const BookingFormSchema = z.object({
  date: z.string().min(1),
  time: z.string().min(1),
  duration: z.number().optional(),
  guestEmail: z.string().email(),
  guestName: z.string().optional(),
  purpose: z.string().optional(),
  hostId: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * Intake form specific schema
 */
const IntakeFormSchema = z.object({
  type: z.string().min(1),
  email: z.string().email(),
  name: z.string().optional(),
  phone: z.string().optional(),
  details: z.record(z.unknown()).optional(),
  urgency: z.number().min(1).max(5).optional(),
});

// =============================================================================
// Webhook Payload Interface
// =============================================================================

export interface WebhookPayload {
  source: WebhookSource | string;
  timestamp?: string | Date;
  data: Record<string, unknown>;
  headers?: Record<string, string>;
  signature?: string;
}

// =============================================================================
// Configuration Types
// =============================================================================

export interface WebhookHandlerConfig extends InputHandlerConfig {
  /** Allowed webhook sources (if specified, only these sources are accepted) */
  allowedSources?: WebhookSource[];
  /** Secret for signature verification */
  webhookSecret?: string;
  /** Enable signature verification */
  requireSignature?: boolean;
  /** Custom source-to-event mapping */
  sourceEventMapping?: Partial<Record<WebhookSource, AgentEventType>>;
}

// =============================================================================
// Default Event Mapping
// =============================================================================

const DEFAULT_SOURCE_EVENT_MAP: Record<WebhookSource, AgentEventType> = {
  contact_form: 'webhook:form_submitted',
  booking_form: 'webhook:booking_requested',
  survey_form: 'webhook:form_submitted',
  newsletter_signup: 'webhook:form_submitted',
  intake_form: 'intake:created',
  callback_request: 'webhook:callback_received',
  generic: 'webhook:form_submitted',
};

// =============================================================================
// Event Payload Types
// =============================================================================

interface FormSubmittedPayload {
  formId: string;
  formType: string;
  fields: Record<string, unknown>;
  submitterEmail?: string;
  submitterName?: string;
  submittedAt: Date;
}

interface BookingRequestedPayload {
  bookingId: string;
  date: string;
  time: string;
  duration?: number;
  guestEmail?: string;
  guestName?: string;
  purpose?: string;
  hostId?: string;
  requestedAt: Date;
}

interface IntakeCreatedPayload {
  intakeId: string;
  type: string;
  data: Record<string, unknown>;
  contactInfo: {
    email?: string;
    name?: string;
    phone?: string;
  };
  urgency?: number;
  createdAt: Date;
}

interface CallbackReceivedPayload {
  callbackId: string;
  phone?: string;
  email?: string;
  name?: string;
  preferredTime?: string;
  message?: string;
  receivedAt: Date;
}

// =============================================================================
// WebhookInputHandler Class
// =============================================================================

/**
 * Handler for webhook and form submission inputs
 *
 * @example
 * ```typescript
 * const handler = new WebhookInputHandler({
 *   orgId: 'org-123',
 *   allowedSources: ['contact_form', 'booking_form'],
 * });
 *
 * const result = await handler.handleInput({
 *   source: 'contact_form',
 *   data: {
 *     name: 'John Doe',
 *     email: 'john@example.com',
 *     message: 'Hello!'
 *   }
 * });
 * ```
 */
export class WebhookInputHandler extends BaseInputHandler {
  private allowedSources?: WebhookSource[];
  private webhookSecret?: string;
  private requireSignature: boolean;
  private sourceEventMapping: Record<WebhookSource | string, AgentEventType>;

  // ==========================================================================
  // Constructor
  // ==========================================================================

  constructor(config: WebhookHandlerConfig = {}) {
    super(config);
    this.allowedSources = config.allowedSources;
    this.webhookSecret = config.webhookSecret;
    this.requireSignature = config.requireSignature ?? false;
    this.sourceEventMapping = {
      ...DEFAULT_SOURCE_EVENT_MAP,
      ...config.sourceEventMapping,
    };
  }

  // ==========================================================================
  // Abstract Method Implementations
  // ==========================================================================

  protected getSource(): AgentInputSource {
    return AgentInputSource.WEBHOOK;
  }

  /**
   * Validate webhook payload
   */
  public validate(input: unknown): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic type check
    if (typeof input !== 'object' || input === null) {
      return {
        isValid: false,
        errors: ['Input must be an object'],
        warnings: [],
      };
    }

    // Validate against base schema
    const baseValidation = WebhookPayloadSchema.safeParse(input);
    if (!baseValidation.success) {
      return {
        isValid: false,
        errors: baseValidation.error.errors.map(
          (e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`
        ),
        warnings: [],
      };
    }

    const payload = baseValidation.data;

    // Check allowed sources
    if (this.allowedSources && this.allowedSources.length > 0) {
      if (!this.allowedSources.includes(payload.source as WebhookSource)) {
        errors.push(
          `Source "${payload.source}" is not allowed. Allowed sources: ${this.allowedSources.join(', ')}`
        );
      }
    }

    // Check signature if required
    if (this.requireSignature && !payload.signature) {
      errors.push('Webhook signature is required but not provided');
    }

    // Validate source-specific data
    const sourceValidation = this.validateSourceData(
      payload.source as WebhookSource,
      payload.data
    );
    errors.push(...sourceValidation.errors);
    warnings.push(...sourceValidation.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedInput: errors.length === 0 ? payload : undefined,
    };
  }

  /**
   * Process webhook input and emit appropriate event
   */
  public async handleInput(input: unknown): Promise<ProcessingResult> {
    const startTime = Date.now();

    // Validate input
    const validation = this.validate(input);
    if (!validation.isValid) {
      this.stats.validationErrors++;
      const errorInput = this.normalizeInput(input, 'webhook_validation_error');
      return this.createErrorResult(
        errorInput,
        new Error(`Validation failed: ${validation.errors.join(', ')}`),
        startTime
      );
    }

    const payload = validation.sanitizedInput as WebhookPayload;

    try {
      // Verify signature if present
      if (payload.signature && this.webhookSecret) {
        const isValid = await this.verifySignature(payload);
        if (!isValid) {
          const errorInput = this.normalizeInput(input, 'webhook_signature_error');
          return this.createErrorResult(
            errorInput,
            new Error('Webhook signature verification failed'),
            startTime
          );
        }
      }

      // Normalize input
      const normalizedInput = this.normalizeWebhookInput(payload);

      // Determine event type and emit
      const eventType = this.determineEventType(payload.source as WebhookSource);
      const eventPayload = this.createEventPayload(payload, normalizedInput);
      const emitResult = await this.emitEvent(
        eventType,
        eventPayload,
        normalizedInput.correlationId
      );

      return this.createSuccessResult(
        normalizedInput,
        { type: eventType, result: emitResult },
        startTime
      );
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      const errorInput = this.normalizeInput(input, 'webhook_processing_error');
      return this.createErrorResult(errorInput, errorObj, startTime);
    }
  }

  // ==========================================================================
  // Source-Specific Handlers
  // ==========================================================================

  /**
   * Handle contact form submission
   */
  public async handleContactForm(data: Record<string, unknown>): Promise<ProcessingResult> {
    return this.handleInput({
      source: 'contact_form',
      timestamp: new Date(),
      data,
    });
  }

  /**
   * Handle booking form submission
   */
  public async handleBookingForm(data: Record<string, unknown>): Promise<ProcessingResult> {
    return this.handleInput({
      source: 'booking_form',
      timestamp: new Date(),
      data,
    });
  }

  /**
   * Handle intake form submission
   */
  public async handleIntakeForm(data: Record<string, unknown>): Promise<ProcessingResult> {
    return this.handleInput({
      source: 'intake_form',
      timestamp: new Date(),
      data,
    });
  }

  /**
   * Handle callback request
   */
  public async handleCallbackRequest(data: Record<string, unknown>): Promise<ProcessingResult> {
    return this.handleInput({
      source: 'callback_request',
      timestamp: new Date(),
      data,
    });
  }

  /**
   * Handle generic webhook
   */
  public async handleGenericWebhook(
    source: string,
    data: Record<string, unknown>,
    options?: { headers?: Record<string, string>; signature?: string }
  ): Promise<ProcessingResult> {
    return this.handleInput({
      source,
      timestamp: new Date(),
      data,
      headers: options?.headers,
      signature: options?.signature,
    });
  }

  // ==========================================================================
  // Private Helper Methods
  // ==========================================================================

  /**
   * Validate source-specific data
   */
  private validateSourceData(
    source: WebhookSource,
    data: Record<string, unknown>
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    switch (source) {
      case 'contact_form': {
        const result = ContactFormSchema.safeParse(data);
        if (!result.success) {
          errors.push(
            ...result.error.errors.map((e: z.ZodIssue) => `Contact form: ${e.path.join('.')}: ${e.message}`)
          );
        }
        break;
      }

      case 'booking_form': {
        const result = BookingFormSchema.safeParse(data);
        if (!result.success) {
          errors.push(
            ...result.error.errors.map((e: z.ZodIssue) => `Booking form: ${e.path.join('.')}: ${e.message}`)
          );
        }
        break;
      }

      case 'intake_form': {
        const result = IntakeFormSchema.safeParse(data);
        if (!result.success) {
          errors.push(
            ...result.error.errors.map((e: z.ZodIssue) => `Intake form: ${e.path.join('.')}: ${e.message}`)
          );
        }
        break;
      }

      case 'survey_form':
      case 'newsletter_signup':
        // Minimal validation - just need an email
        if (!data.email || typeof data.email !== 'string') {
          warnings.push(`${source}: email field is recommended`);
        }
        break;

      case 'callback_request':
        // Need either phone or email
        if (!data.phone && !data.email) {
          warnings.push('Callback request: phone or email is recommended');
        }
        break;

      case 'generic':
      default:
        // No specific validation for generic webhooks
        if (Object.keys(data).length === 0) {
          warnings.push('Webhook data is empty');
        }
        break;
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Verify webhook signature
   */
  private async verifySignature(payload: WebhookPayload): Promise<boolean> {
    if (!this.webhookSecret || !payload.signature) {
      return true; // Skip verification if no secret or signature
    }

    // Simple HMAC verification placeholder
    // In production, implement proper signature verification using crypto
    try {
      // Example: const crypto = await import('crypto');
      // const expectedSignature = crypto.createHmac('sha256', this.webhookSecret)
      //   .update(JSON.stringify(payload.data))
      //   .digest('hex');
      // return expectedSignature === payload.signature;

      this.logger.debug('Signature verification would be performed', {
        hasSignature: !!payload.signature,
        hasSecret: !!this.webhookSecret,
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Normalize webhook input to AgentInput
   */
  private normalizeWebhookInput(payload: WebhookPayload): AgentInput {
    const source = payload.source as WebhookSource;
    const timestamp = payload.timestamp
      ? new Date(payload.timestamp)
      : new Date();
    const correlationId = generateUUID();

    return {
      source: AgentInputSource.WEBHOOK,
      type: `webhook:${source}`,
      rawContent: JSON.stringify(payload.data, null, 2),
      structuredData: payload.data,
      metadata: {
        headers: payload.headers,
        webhookSignature: payload.signature,
        tags: [source, 'webhook'],
      },
      timestamp,
      correlationId,
    };
  }

  /**
   * Determine the event type based on webhook source
   */
  private determineEventType(source: WebhookSource | string): AgentEventType {
    return this.sourceEventMapping[source] ?? 'webhook:form_submitted';
  }

  /**
   * Create appropriate event payload based on source
   */
  private createEventPayload(
    payload: WebhookPayload,
    normalizedInput: AgentInput
  ): FormSubmittedPayload | BookingRequestedPayload | IntakeCreatedPayload | CallbackReceivedPayload {
    const source = payload.source as WebhookSource;
    const correlationId = normalizedInput.correlationId ?? generateUUID();

    switch (source) {
      case 'booking_form':
        return this.createBookingPayload(correlationId, payload.data);

      case 'intake_form':
        return this.createIntakePayload(correlationId, payload.data);

      case 'callback_request':
        return this.createCallbackPayload(correlationId, payload.data);

      case 'contact_form':
      case 'survey_form':
      case 'newsletter_signup':
      case 'generic':
      default:
        return this.createFormPayload(correlationId, source, payload.data);
    }
  }

  /**
   * Create form submission payload
   */
  private createFormPayload(
    correlationId: string,
    source: WebhookSource | string,
    data: Record<string, unknown>
  ): FormSubmittedPayload {
    return {
      formId: `${source}_${correlationId.slice(0, 8)}`,
      formType: source,
      fields: data,
      submitterEmail: this.extractEmail(data),
      submitterName: this.extractName(data),
      submittedAt: new Date(),
    };
  }

  /**
   * Create booking request payload
   */
  private createBookingPayload(
    correlationId: string,
    data: Record<string, unknown>
  ): BookingRequestedPayload {
    return {
      bookingId: `booking_${correlationId.slice(0, 8)}`,
      date: String(data.date ?? ''),
      time: String(data.time ?? ''),
      duration: typeof data.duration === 'number' ? data.duration : undefined,
      guestEmail: this.extractEmail(data),
      guestName: this.extractName(data),
      purpose: typeof data.purpose === 'string' ? data.purpose : undefined,
      hostId: typeof data.hostId === 'string' ? data.hostId : undefined,
      requestedAt: new Date(),
    };
  }

  /**
   * Create intake payload
   */
  private createIntakePayload(
    correlationId: string,
    data: Record<string, unknown>
  ): IntakeCreatedPayload {
    return {
      intakeId: `intake_${correlationId.slice(0, 8)}`,
      type: typeof data.type === 'string' ? data.type : 'general',
      data,
      contactInfo: {
        email: this.extractEmail(data),
        name: this.extractName(data),
        phone: this.extractPhone(data),
      },
      urgency: typeof data.urgency === 'number' ? data.urgency : undefined,
      createdAt: new Date(),
    };
  }

  /**
   * Create callback request payload
   */
  private createCallbackPayload(
    correlationId: string,
    data: Record<string, unknown>
  ): CallbackReceivedPayload {
    return {
      callbackId: `callback_${correlationId.slice(0, 8)}`,
      phone: this.extractPhone(data),
      email: this.extractEmail(data),
      name: this.extractName(data),
      preferredTime: typeof data.preferredTime === 'string' ? data.preferredTime : undefined,
      message: typeof data.message === 'string' ? data.message : undefined,
      receivedAt: new Date(),
    };
  }

  /**
   * Extract email from data object
   */
  private extractEmail(data: Record<string, unknown>): string | undefined {
    const emailFields = ['email', 'guestEmail', 'submitterEmail', 'userEmail', 'contact_email'];
    for (const field of emailFields) {
      if (typeof data[field] === 'string' && data[field]) {
        return data[field] as string;
      }
    }
    return undefined;
  }

  /**
   * Extract name from data object
   */
  private extractName(data: Record<string, unknown>): string | undefined {
    const nameFields = ['name', 'guestName', 'submitterName', 'userName', 'fullName', 'full_name'];
    for (const field of nameFields) {
      if (typeof data[field] === 'string' && data[field]) {
        return data[field] as string;
      }
    }

    // Try to combine first and last name
    const firstName = data.firstName || data.first_name;
    const lastName = data.lastName || data.last_name;
    if (firstName || lastName) {
      return [firstName, lastName].filter(Boolean).join(' ');
    }

    return undefined;
  }

  /**
   * Extract phone from data object
   */
  private extractPhone(data: Record<string, unknown>): string | undefined {
    const phoneFields = ['phone', 'phoneNumber', 'phone_number', 'mobile', 'tel'];
    for (const field of phoneFields) {
      if (typeof data[field] === 'string' && data[field]) {
        return data[field] as string;
      }
    }
    return undefined;
  }

  // ==========================================================================
  // Type Override
  // ==========================================================================

  protected override determineInputType(input: unknown): string {
    if (typeof input === 'object' && input !== null) {
      const obj = input as Record<string, unknown>;
      if ('source' in obj && typeof obj.source === 'string') {
        return `webhook:${obj.source}`;
      }
    }
    return 'webhook:unknown';
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a new WebhookInputHandler instance
 */
export function createWebhookHandler(
  config?: WebhookHandlerConfig
): WebhookInputHandler {
  return new WebhookInputHandler(config);
}

// =============================================================================
// Type Exports
// =============================================================================

// Note: WebhookHandlerConfig and WebhookPayload are exported inline above
// Export internal payload types for consumers who need them
export type {
  FormSubmittedPayload,
  BookingRequestedPayload,
  IntakeCreatedPayload,
  CallbackReceivedPayload,
};

/**
 * DBTriggerHandler - Database change event handler for the Orchestration Agent
 *
 * Processes database change events from Prisma middleware or change data capture (CDC).
 * Detects significant changes and emits appropriate agent events.
 *
 * Features:
 * - Entity type detection and mapping
 * - Change type handling (CREATE, UPDATE, DELETE)
 * - Field-level change detection with diff utilities
 * - Significant change filtering (ignores minor updates)
 * - Event mapping based on entity type and change type
 *
 * @module DBTriggerHandler
 * @see BaseInputHandler
 *
 * @example Prisma Middleware Integration
 * ```typescript
 * // In your Prisma client setup (e.g., src/lib/prisma.ts)
 * import { PrismaClient } from '@prisma/client';
 * import { DBTriggerHandler, createPrismaMiddleware } from '@/lib/agent/inputs/DBTriggerHandler';
 *
 * const prisma = new PrismaClient();
 * const dbHandler = new DBTriggerHandler({ orgId: 'default-org' });
 *
 * // Option 1: Use the helper function
 * prisma.$use(createPrismaMiddleware(dbHandler));
 *
 * // Option 2: Manual middleware setup
 * prisma.$use(async (params, next) => {
 *   // Capture the before state for updates
 *   let before = null;
 *   if (params.action === 'update' || params.action === 'delete') {
 *     before = await prisma[params.model].findUnique({ where: params.args.where });
 *   }
 *
 *   const result = await next(params);
 *
 *   // Only process specific models
 *   const trackedModels = ['Intake', 'Pipeline', 'PipelineItem', 'CalendarEvent', 'User', 'Booking'];
 *   if (trackedModels.includes(params.model)) {
 *     await dbHandler.handleInput({
 *       model: params.model,
 *       action: params.action,
 *       before,
 *       after: result,
 *       args: params.args,
 *     });
 *   }
 *
 *   return result;
 * });
 * ```
 */

import {
  BaseInputHandler,
  type InputHandlerConfig,
  type ValidationResult,
  type ProcessingResult,
} from './BaseInputHandler';
import type {
  AgentInputSource,
  AgentEventType,
  IntakeEventPayload,
  PipelineEventPayload,
  BookingEventPayload,
  BaseEventPayload,
} from '../types/agent.types';
import { AgentInputSource as InputSource } from '../types/agent.types';

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Database change operation types
 */
export enum DBChangeType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

/**
 * Supported entity types for database triggers
 */
export enum DBEntityType {
  INTAKE = 'Intake',
  PIPELINE = 'Pipeline',
  PIPELINE_ITEM = 'PipelineItem',
  PIPELINE_STAGE = 'PipelineStage',
  CALENDAR_EVENT = 'CalendarEvent',
  BOOKING = 'Booking',
  USER = 'User',
  CONTACT = 'Contact',
  ORGANIZATION = 'Organization',
  NOTIFICATION = 'Notification',
  TASK = 'Task',
  // Add more entity types as needed
}

/**
 * Raw database trigger input from Prisma middleware
 */
export interface DBTriggerInput {
  /** Prisma model name (e.g., 'Intake', 'Pipeline') */
  model: string;
  /** Prisma action (e.g., 'create', 'update', 'delete', 'updateMany') */
  action: string;
  /** Entity state before the change (null for creates) */
  before: Record<string, unknown> | null;
  /** Entity state after the change (null for deletes) */
  after: Record<string, unknown> | null;
  /** Original Prisma args (for context) */
  args?: Record<string, unknown>;
  /** Timestamp of the change */
  timestamp?: Date;
  /** User who initiated the change */
  triggeredBy?: string;
}

/**
 * Detected field change with old and new values
 */
export interface FieldChange {
  /** Field name that changed */
  field: string;
  /** Previous value */
  oldValue: unknown;
  /** New value */
  newValue: unknown;
  /** Whether this is considered a significant change */
  isSignificant: boolean;
}

/**
 * Result of change detection analysis
 */
export interface ChangeDetectionResult {
  /** Type of change (CREATE, UPDATE, DELETE) */
  changeType: DBChangeType;
  /** Entity type detected */
  entityType: DBEntityType | string;
  /** List of field changes */
  changes: FieldChange[];
  /** Whether any significant changes were detected */
  hasSignificantChanges: boolean;
  /** Fields that triggered significance */
  significantFields: string[];
  /** Change summary for logging */
  summary: string;
}

/**
 * Event mapping result
 */
export interface EventMapping {
  /** The event type to emit */
  eventType: AgentEventType;
  /** Whether this mapping should trigger an event */
  shouldEmit: boolean;
  /** Reason for not emitting (if applicable) */
  skipReason?: string;
}

/**
 * Configuration specific to DB trigger handling
 */
export interface DBTriggerHandlerConfig extends InputHandlerConfig {
  /**
   * Fields to ignore when detecting changes
   * These fields will not trigger significant change detection
   */
  ignoredFields?: string[];

  /**
   * Significant fields per entity type
   * Changes to these fields will always be considered significant
   */
  significantFields?: Record<string, string[]>;

  /**
   * Enable processing of batch operations (updateMany, deleteMany)
   * Default: false (only single record operations)
   */
  processBatchOperations?: boolean;

  /**
   * Minimum confidence threshold for emitting events
   * Default: 0.5
   */
  minConfidenceThreshold?: number;

  /**
   * Custom entity type mapper (for non-standard model names)
   */
  entityTypeMapper?: (model: string) => DBEntityType | string;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Default fields to ignore in change detection
 * These typically don't warrant agent notification
 */
const DEFAULT_IGNORED_FIELDS: string[] = [
  'updatedAt',
  'createdAt',
  'version',
  'lastModified',
  'modifiedAt',
  'lastAccessed',
  'accessedAt',
  'viewCount',
  'impressions',
  'checksum',
  'hash',
  'etag',
];

/**
 * Default significant fields per entity type
 * Changes to these fields will always trigger events
 */
const DEFAULT_SIGNIFICANT_FIELDS: Record<string, string[]> = {
  [DBEntityType.INTAKE]: [
    'status',
    'priority',
    'assignedTo',
    'assignedToId',
    'pipelineId',
    'stageId',
    'category',
    'urgency',
  ],
  [DBEntityType.PIPELINE]: [
    'name',
    'isActive',
    'isArchived',
  ],
  [DBEntityType.PIPELINE_ITEM]: [
    'stageId',
    'pipelineId',
    'assignedToId',
    'status',
    'priority',
    'dueDate',
  ],
  [DBEntityType.PIPELINE_STAGE]: [
    'name',
    'order',
    'isActive',
  ],
  [DBEntityType.CALENDAR_EVENT]: [
    'startTime',
    'endTime',
    'title',
    'status',
    'isCancelled',
    'attendees',
  ],
  [DBEntityType.BOOKING]: [
    'status',
    'date',
    'time',
    'duration',
    'isCancelled',
    'isConfirmed',
  ],
  [DBEntityType.USER]: [
    'role',
    'isActive',
    'permissions',
  ],
  [DBEntityType.CONTACT]: [
    'email',
    'status',
    'tags',
  ],
  [DBEntityType.TASK]: [
    'status',
    'priority',
    'assignedToId',
    'dueDate',
    'completedAt',
  ],
};

/**
 * Mapping of Prisma actions to change types
 */
const ACTION_TO_CHANGE_TYPE: Record<string, DBChangeType> = {
  create: DBChangeType.CREATE,
  createMany: DBChangeType.CREATE,
  update: DBChangeType.UPDATE,
  updateMany: DBChangeType.UPDATE,
  upsert: DBChangeType.UPDATE, // Could be CREATE, but UPDATE is safer default
  delete: DBChangeType.DELETE,
  deleteMany: DBChangeType.DELETE,
};

/**
 * Event type mappings based on entity type and change type
 */
const EVENT_MAPPINGS: Record<string, Record<DBChangeType, AgentEventType | null>> = {
  [DBEntityType.INTAKE]: {
    [DBChangeType.CREATE]: 'intake:created',
    [DBChangeType.UPDATE]: 'intake:updated',
    [DBChangeType.DELETE]: null, // No event for intake deletion
  },
  [DBEntityType.PIPELINE_ITEM]: {
    [DBChangeType.CREATE]: 'intake:created', // Pipeline items often represent intakes
    [DBChangeType.UPDATE]: 'pipeline:stage_changed',
    [DBChangeType.DELETE]: null,
  },
  [DBEntityType.CALENDAR_EVENT]: {
    [DBChangeType.CREATE]: 'calendar:event_created',
    [DBChangeType.UPDATE]: 'calendar:event_updated',
    [DBChangeType.DELETE]: 'calendar:event_cancelled',
  },
  [DBEntityType.BOOKING]: {
    [DBChangeType.CREATE]: 'webhook:booking_requested',
    [DBChangeType.UPDATE]: 'webhook:booking_requested', // Re-emit for updates
    [DBChangeType.DELETE]: 'calendar:event_cancelled',
  },
  [DBEntityType.PIPELINE]: {
    [DBChangeType.CREATE]: null, // No event for pipeline creation
    [DBChangeType.UPDATE]: 'pipeline:completed', // Only significant pipeline changes
    [DBChangeType.DELETE]: null,
  },
};

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Simple UUID v4 generator
 */
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Deep comparison of two values
 */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime();
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    const aKeys = Object.keys(aObj);
    const bKeys = Object.keys(bObj);

    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((key) => deepEqual(aObj[key], bObj[key]));
  }

  return false;
}

/**
 * Format a value for display in change summaries
 */
function formatValue(value: unknown, maxLength = 50): string {
  if (value === null || value === undefined) return 'null';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') {
    const str = JSON.stringify(value);
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
  }
  const str = String(value);
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
}

// =============================================================================
// DBTriggerHandler Class
// =============================================================================

/**
 * Handler for database trigger events from Prisma middleware
 *
 * @example
 * ```typescript
 * const handler = new DBTriggerHandler({
 *   orgId: 'org-123',
 *   debug: true,
 *   significantFields: {
 *     Intake: ['status', 'priority', 'customField'],
 *   },
 * });
 *
 * // Process a database change
 * const result = await handler.handleInput({
 *   model: 'Intake',
 *   action: 'update',
 *   before: { id: '1', status: 'new', priority: 1 },
 *   after: { id: '1', status: 'in_progress', priority: 2 },
 * });
 * ```
 */
export class DBTriggerHandler extends BaseInputHandler {
  private ignoredFields: Set<string>;
  private significantFields: Record<string, string[]>;
  private processBatchOperations: boolean;
  private minConfidenceThreshold: number;
  private entityTypeMapper?: (model: string) => DBEntityType | string;

  // Extended statistics
  private dbStats = {
    byEntityType: new Map<string, number>(),
    byChangeType: new Map<DBChangeType, number>(),
    significantChanges: 0,
    filteredChanges: 0,
  };

  constructor(config: DBTriggerHandlerConfig = {}) {
    super(config);

    // Initialize ignored fields
    this.ignoredFields = new Set([
      ...DEFAULT_IGNORED_FIELDS,
      ...(config.ignoredFields ?? []),
    ]);

    // Merge significant fields with defaults
    this.significantFields = {
      ...DEFAULT_SIGNIFICANT_FIELDS,
      ...config.significantFields,
    };

    this.processBatchOperations = config.processBatchOperations ?? false;
    this.minConfidenceThreshold = config.minConfidenceThreshold ?? 0.5;
    this.entityTypeMapper = config.entityTypeMapper;
  }

  // ===========================================================================
  // Abstract Method Implementations
  // ===========================================================================

  /**
   * Returns the input source type for this handler
   */
  protected getSource(): AgentInputSource {
    return InputSource.DB_TRIGGER;
  }

  /**
   * Validates the raw database trigger input
   */
  public validate(input: unknown): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Type check
    if (!input || typeof input !== 'object') {
      errors.push('Input must be a non-null object');
      return { isValid: false, errors, warnings };
    }

    const dbInput = input as Partial<DBTriggerInput>;

    // Required fields
    if (!dbInput.model || typeof dbInput.model !== 'string') {
      errors.push('model is required and must be a string');
    }

    if (!dbInput.action || typeof dbInput.action !== 'string') {
      errors.push('action is required and must be a string');
    }

    // Validate action is supported
    if (dbInput.action && !ACTION_TO_CHANGE_TYPE[dbInput.action]) {
      warnings.push(`Unknown action "${dbInput.action}", will attempt to process`);
    }

    // At least one of before/after should be present
    if (dbInput.before === undefined && dbInput.after === undefined) {
      errors.push('At least one of before or after must be provided');
    }

    // Check for batch operations
    if (!this.processBatchOperations && dbInput.action?.includes('Many')) {
      warnings.push(
        `Batch operation "${dbInput.action}" detected. Set processBatchOperations: true to enable.`
      );
    }

    // Validate before/after are objects if present
    if (
      dbInput.before !== null &&
      dbInput.before !== undefined &&
      typeof dbInput.before !== 'object'
    ) {
      errors.push('before must be an object or null');
    }

    if (
      dbInput.after !== null &&
      dbInput.after !== undefined &&
      typeof dbInput.after !== 'object'
    ) {
      errors.push('after must be an object or null');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedInput: dbInput,
    };
  }

  /**
   * Processes a database trigger input and emits appropriate events
   */
  public async handleInput(input: unknown): Promise<ProcessingResult> {
    return this.processWithErrorHandling(input, async (normalizedInput) => {
      const startTime = Date.now();

      // Extract structured data - this should always be present after validation
      if (!normalizedInput.structuredData) {
        throw new Error('No structured data in normalized input');
      }
      const dbInput = normalizedInput.structuredData as unknown as DBTriggerInput;

      // Detect entity type
      const entityType = this.detectEntityType(dbInput.model);

      // Analyze changes
      const changeResult = this.detectChanges(dbInput, entityType);

      // Update statistics
      this.updateDbStats(entityType, changeResult.changeType, changeResult.hasSignificantChanges);

      // Determine if we should emit an event
      const eventMapping = this.mapToEvent(entityType, changeResult);

      if (!eventMapping.shouldEmit) {
        this.dbStats.filteredChanges++;
        return this.createSuccessResult(normalizedInput, undefined, startTime);
      }

      // Build event payload
      const payload = this.buildEventPayload(dbInput, entityType, changeResult);

      // Emit the event
      const emitResult = await this.emitEvent(
        eventMapping.eventType,
        payload,
        normalizedInput.correlationId
      );

      return this.createSuccessResult(
        normalizedInput,
        { type: eventMapping.eventType, result: emitResult },
        startTime
      );
    });
  }

  // ===========================================================================
  // Change Detection Methods
  // ===========================================================================

  /**
   * Detect the entity type from the model name
   */
  public detectEntityType(model: string): DBEntityType | string {
    // Use custom mapper if provided
    if (this.entityTypeMapper) {
      return this.entityTypeMapper(model);
    }

    // Check if it's a known entity type
    const entityValues = Object.values(DBEntityType);
    for (const entityType of entityValues) {
      if (model === entityType || model.toLowerCase() === entityType.toLowerCase()) {
        return entityType;
      }
    }

    // Return the model name as-is for unknown types
    return model;
  }

  /**
   * Analyze changes between before and after states
   */
  public detectChanges(
    input: DBTriggerInput,
    entityType: DBEntityType | string
  ): ChangeDetectionResult {
    const changeType = this.getChangeType(input.action);
    const changes: FieldChange[] = [];
    const significantFields: string[] = [];

    // For CREATE, all fields in 'after' are changes
    if (changeType === DBChangeType.CREATE && input.after) {
      const significantFieldsForEntity = this.significantFields[entityType] ?? [];

      for (const [field, value] of Object.entries(input.after)) {
        if (this.ignoredFields.has(field)) continue;

        const isSignificant =
          significantFieldsForEntity.includes(field) ||
          this.isFieldInherentlySignificant(field, value);

        changes.push({
          field,
          oldValue: null,
          newValue: value,
          isSignificant,
        });

        if (isSignificant) {
          significantFields.push(field);
        }
      }
    }

    // For DELETE, all fields in 'before' are changes
    if (changeType === DBChangeType.DELETE && input.before) {
      for (const [field, value] of Object.entries(input.before)) {
        if (this.ignoredFields.has(field)) continue;

        changes.push({
          field,
          oldValue: value,
          newValue: null,
          isSignificant: true, // Deletes are always significant
        });
        significantFields.push(field);
      }
    }

    // For UPDATE, compare before and after
    if (changeType === DBChangeType.UPDATE && input.before && input.after) {
      const significantFieldsForEntity = this.significantFields[entityType] ?? [];
      const allFields = new Set([
        ...Object.keys(input.before),
        ...Object.keys(input.after),
      ]);

      for (const field of allFields) {
        if (this.ignoredFields.has(field)) continue;

        const oldValue = input.before[field];
        const newValue = input.after[field];

        // Skip if values are equal
        if (deepEqual(oldValue, newValue)) continue;

        const isSignificant =
          significantFieldsForEntity.includes(field) ||
          this.isFieldChangeSignificant(field, oldValue, newValue, entityType);

        changes.push({
          field,
          oldValue,
          newValue,
          isSignificant,
        });

        if (isSignificant) {
          significantFields.push(field);
        }
      }
    }

    const hasSignificantChanges =
      significantFields.length > 0 || changeType === DBChangeType.DELETE;

    return {
      changeType,
      entityType,
      changes,
      hasSignificantChanges,
      significantFields,
      summary: this.buildChangeSummary(changeType, entityType, changes, significantFields),
    };
  }

  /**
   * Get the field changes between two objects
   * Useful for external consumers who need the diff
   */
  public getFieldChanges(
    before: Record<string, unknown> | null,
    after: Record<string, unknown> | null
  ): FieldChange[] {
    const changes: FieldChange[] = [];

    if (!before && after) {
      // CREATE
      for (const [field, value] of Object.entries(after)) {
        if (!this.ignoredFields.has(field)) {
          changes.push({ field, oldValue: null, newValue: value, isSignificant: false });
        }
      }
    } else if (before && !after) {
      // DELETE
      for (const [field, value] of Object.entries(before)) {
        if (!this.ignoredFields.has(field)) {
          changes.push({ field, oldValue: value, newValue: null, isSignificant: true });
        }
      }
    } else if (before && after) {
      // UPDATE
      const allFields = new Set([...Object.keys(before), ...Object.keys(after)]);
      for (const field of allFields) {
        if (this.ignoredFields.has(field)) continue;
        const oldValue = before[field];
        const newValue = after[field];
        if (!deepEqual(oldValue, newValue)) {
          changes.push({ field, oldValue, newValue, isSignificant: false });
        }
      }
    }

    return changes;
  }

  /**
   * Check if a specific field changed between before and after
   */
  public didFieldChange(
    field: string,
    before: Record<string, unknown> | null,
    after: Record<string, unknown> | null
  ): boolean {
    const oldValue = before?.[field];
    const newValue = after?.[field];
    return !deepEqual(oldValue, newValue);
  }

  // ===========================================================================
  // Event Mapping Methods
  // ===========================================================================

  /**
   * Map entity type and change result to an appropriate event
   */
  public mapToEvent(
    entityType: DBEntityType | string,
    changeResult: ChangeDetectionResult
  ): EventMapping {
    // Check if we have a mapping for this entity type
    const entityMappings = EVENT_MAPPINGS[entityType];

    if (!entityMappings) {
      return {
        eventType: `custom:db_${entityType.toLowerCase()}_${changeResult.changeType.toLowerCase()}` as AgentEventType,
        shouldEmit: changeResult.hasSignificantChanges,
        skipReason: changeResult.hasSignificantChanges
          ? undefined
          : 'No significant changes detected',
      };
    }

    const eventType = entityMappings[changeResult.changeType];

    if (!eventType) {
      return {
        eventType: 'agent:action_executed', // Fallback
        shouldEmit: false,
        skipReason: `No event mapping for ${entityType}:${changeResult.changeType}`,
      };
    }

    // Special handling for pipeline stage changes
    if (
      entityType === DBEntityType.PIPELINE_ITEM &&
      changeResult.changeType === DBChangeType.UPDATE
    ) {
      const stageChanged = changeResult.changes.some(
        (c) => c.field === 'stageId' || c.field === 'pipelineStageId'
      );
      if (!stageChanged) {
        // Check if other significant changes warrant an event
        if (!changeResult.hasSignificantChanges) {
          return {
            eventType,
            shouldEmit: false,
            skipReason: 'Pipeline item update without stage change or significant fields',
          };
        }
      }
    }

    // For updates, only emit if there are significant changes
    if (
      changeResult.changeType === DBChangeType.UPDATE &&
      !changeResult.hasSignificantChanges
    ) {
      return {
        eventType,
        shouldEmit: false,
        skipReason: 'Update without significant changes',
      };
    }

    return {
      eventType,
      shouldEmit: true,
    };
  }

  /**
   * Get the appropriate event type for an entity change
   * Convenience method for simple lookups
   */
  public getEventType(
    entityType: DBEntityType | string,
    changeType: DBChangeType
  ): AgentEventType | null {
    const entityMappings = EVENT_MAPPINGS[entityType];
    return entityMappings?.[changeType] ?? null;
  }

  // ===========================================================================
  // Payload Building Methods
  // ===========================================================================

  /**
   * Build the event payload based on entity type and changes
   */
  private buildEventPayload(
    input: DBTriggerInput,
    entityType: DBEntityType | string,
    changeResult: ChangeDetectionResult
  ): BaseEventPayload | IntakeEventPayload | PipelineEventPayload | BookingEventPayload {
    const basePayload: BaseEventPayload = {
      id: this.extractEntityId(input) ?? generateUUID(),
      timestamp: input.timestamp ?? new Date(),
      source: InputSource.DB_TRIGGER,
      orgId: this.orgId,
      metadata: {
        entityType,
        changeType: changeResult.changeType,
        changedFields: changeResult.changes.map((c) => c.field),
        significantFields: changeResult.significantFields,
        triggeredBy: input.triggeredBy,
        model: input.model,
        action: input.action,
      },
    };

    // Entity-specific payload building
    switch (entityType) {
      case DBEntityType.INTAKE:
        return this.buildIntakePayload(input, basePayload, changeResult);

      case DBEntityType.PIPELINE_ITEM:
        return this.buildPipelinePayload(input, basePayload, changeResult);

      case DBEntityType.BOOKING:
      case DBEntityType.CALENDAR_EVENT:
        return this.buildBookingPayload(input, basePayload, changeResult);

      default:
        return {
          ...basePayload,
          data: input.after ?? input.before ?? {},
        };
    }
  }

  /**
   * Build payload for intake events
   */
  private buildIntakePayload(
    input: DBTriggerInput,
    basePayload: BaseEventPayload,
    changeResult: ChangeDetectionResult
  ): IntakeEventPayload {
    const data = (input.after ?? input.before) as Record<string, unknown>;

    return {
      ...basePayload,
      intakeId: this.extractEntityId(input) ?? '',
      type: (data.type as string) ?? (data.category as string) ?? 'unknown',
      data: {
        ...data,
        changes: changeResult.changes,
      },
      contactInfo: this.extractContactInfo(data),
    };
  }

  /**
   * Build payload for pipeline events
   */
  private buildPipelinePayload(
    input: DBTriggerInput,
    basePayload: BaseEventPayload,
    changeResult: ChangeDetectionResult
  ): PipelineEventPayload {
    const before = input.before as Record<string, unknown> | null;
    const after = input.after as Record<string, unknown> | null;
    const current = after ?? before ?? {};

    // Find stage change
    const stageChange = changeResult.changes.find(
      (c) => c.field === 'stageId' || c.field === 'pipelineStageId' || c.field === 'stage'
    );

    return {
      ...basePayload,
      pipelineId: (current.pipelineId as string) ?? '',
      entityId: this.extractEntityId(input) ?? '',
      entityType: (current.entityType as string) ?? 'intake',
      previousStage: stageChange?.oldValue as string | undefined,
      newStage: (stageChange?.newValue as string) ?? (current.stageId as string) ?? '',
      triggeredBy: input.triggeredBy,
    };
  }

  /**
   * Build payload for booking/calendar events
   */
  private buildBookingPayload(
    input: DBTriggerInput,
    basePayload: BaseEventPayload,
    changeResult: ChangeDetectionResult
  ): BookingEventPayload {
    const data = (input.after ?? input.before) as Record<string, unknown>;

    let eventType: 'created' | 'updated' | 'cancelled' = 'updated';
    if (changeResult.changeType === DBChangeType.CREATE) {
      eventType = 'created';
    } else if (
      changeResult.changeType === DBChangeType.DELETE ||
      data.isCancelled === true ||
      data.status === 'cancelled'
    ) {
      eventType = 'cancelled';
    }

    return {
      ...basePayload,
      bookingId: this.extractEntityId(input) ?? '',
      eventType,
      bookingData: {
        date: this.formatDate(data.date ?? data.startTime ?? data.startDate),
        time: this.formatTime(data.time ?? data.startTime),
        duration: (data.duration as number) ?? (data.durationMinutes as number),
        guestEmail: (data.guestEmail as string) ?? (data.email as string),
        guestName: (data.guestName as string) ?? (data.name as string),
        purpose: (data.purpose as string) ?? (data.title as string) ?? (data.description as string),
        hostId: (data.hostId as string) ?? (data.userId as string),
      },
    };
  }

  // ===========================================================================
  // Helper Methods
  // ===========================================================================

  /**
   * Determine change type from Prisma action
   */
  private getChangeType(action: string): DBChangeType {
    return ACTION_TO_CHANGE_TYPE[action] ?? DBChangeType.UPDATE;
  }

  /**
   * Determine the input type string for normalization
   */
  protected override determineInputType(input: unknown): string {
    const dbInput = input as DBTriggerInput;
    const entityType = this.detectEntityType(dbInput.model);
    const changeType = this.getChangeType(dbInput.action);
    return `db_${entityType.toLowerCase()}_${changeType.toLowerCase()}`;
  }

  /**
   * Check if a field value is inherently significant (regardless of entity type)
   */
  private isFieldInherentlySignificant(field: string, value: unknown): boolean {
    // ID fields for relationships
    if (field.endsWith('Id') && value !== null) return true;

    // Status and priority fields
    if (field === 'status' || field === 'priority') return true;

    // Boolean state flags
    if (field.startsWith('is') && typeof value === 'boolean') return true;

    return false;
  }

  /**
   * Check if a field change is significant based on context
   */
  private isFieldChangeSignificant(
    field: string,
    oldValue: unknown,
    newValue: unknown,
    entityType: DBEntityType | string
  ): boolean {
    // Null to non-null or vice versa is often significant
    if ((oldValue === null && newValue !== null) || (oldValue !== null && newValue === null)) {
      // Unless it's a timestamp field
      if (!field.includes('At') && !field.includes('Date') && !field.includes('Time')) {
        return true;
      }
    }

    // Status changes are always significant
    if (field === 'status' || field.includes('Status')) {
      return true;
    }

    // Priority changes
    if (field === 'priority' || field.includes('Priority')) {
      return true;
    }

    // Assignment changes
    if (field.includes('assignee') || field.includes('Assigned')) {
      return true;
    }

    return false;
  }

  /**
   * Build a human-readable summary of the changes
   */
  private buildChangeSummary(
    changeType: DBChangeType,
    entityType: DBEntityType | string,
    changes: FieldChange[],
    significantFields: string[]
  ): string {
    const action =
      changeType === DBChangeType.CREATE
        ? 'Created'
        : changeType === DBChangeType.DELETE
          ? 'Deleted'
          : 'Updated';

    let summary = `${action} ${entityType}`;

    if (changeType === DBChangeType.UPDATE && changes.length > 0) {
      const fieldList = changes.map((c) => c.field).slice(0, 5).join(', ');
      const moreCount = changes.length > 5 ? ` (+${changes.length - 5} more)` : '';
      summary += `: ${fieldList}${moreCount}`;

      if (significantFields.length > 0) {
        summary += ` [significant: ${significantFields.join(', ')}]`;
      }
    }

    return summary;
  }

  /**
   * Extract entity ID from the input
   */
  private extractEntityId(input: DBTriggerInput): string | undefined {
    const data = input.after ?? input.before;
    if (!data) return undefined;

    // Common ID field names
    const idFields = ['id', 'Id', '_id', 'uuid', 'uid'];
    for (const field of idFields) {
      if (data[field] !== undefined) {
        return String(data[field]);
      }
    }

    return undefined;
  }

  /**
   * Extract contact information from entity data
   */
  private extractContactInfo(
    data: Record<string, unknown>
  ): { email?: string; name?: string; phone?: string } | undefined {
    const email =
      (data.email as string) ??
      (data.contactEmail as string) ??
      (data.senderEmail as string);
    const name =
      (data.name as string) ??
      (data.contactName as string) ??
      (data.senderName as string) ??
      (data.fullName as string);
    const phone =
      (data.phone as string) ??
      (data.phoneNumber as string) ??
      (data.contactPhone as string);

    if (!email && !name && !phone) return undefined;

    return { email, name, phone };
  }

  /**
   * Format a date value to string
   */
  private formatDate(value: unknown): string {
    if (!value) return '';
    if (value instanceof Date) return value.toISOString().split('T')[0];
    if (typeof value === 'string') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? value : date.toISOString().split('T')[0];
    }
    return String(value);
  }

  /**
   * Format a time value to string
   */
  private formatTime(value: unknown): string {
    if (!value) return '';
    if (value instanceof Date) return value.toISOString().split('T')[1]?.slice(0, 5) ?? '';
    if (typeof value === 'string') {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[1]?.slice(0, 5) ?? value;
      }
      return value;
    }
    return String(value);
  }

  /**
   * Update internal statistics
   */
  private updateDbStats(
    entityType: DBEntityType | string,
    changeType: DBChangeType,
    isSignificant: boolean
  ): void {
    // Update entity type counter
    this.dbStats.byEntityType.set(
      entityType,
      (this.dbStats.byEntityType.get(entityType) ?? 0) + 1
    );

    // Update change type counter
    this.dbStats.byChangeType.set(
      changeType,
      (this.dbStats.byChangeType.get(changeType) ?? 0) + 1
    );

    if (isSignificant) {
      this.dbStats.significantChanges++;
    }
  }

  // ===========================================================================
  // Public Utility Methods
  // ===========================================================================

  /**
   * Get extended statistics including DB-specific metrics
   */
  public getExtendedStats(): ReturnType<typeof this.getStats> & {
    byEntityType: Record<string, number>;
    byChangeType: Record<string, number>;
    significantChanges: number;
    filteredChanges: number;
  } {
    const baseStats = this.getStats();

    const byEntityType: Record<string, number> = {};
    for (const [type, count] of this.dbStats.byEntityType) {
      byEntityType[type] = count;
    }

    const byChangeType: Record<string, number> = {};
    for (const [type, count] of this.dbStats.byChangeType) {
      byChangeType[type] = count;
    }

    return {
      ...baseStats,
      byEntityType,
      byChangeType,
      significantChanges: this.dbStats.significantChanges,
      filteredChanges: this.dbStats.filteredChanges,
    };
  }

  /**
   * Reset all statistics including DB-specific metrics
   */
  public override resetStats(): void {
    super.resetStats();
    this.dbStats = {
      byEntityType: new Map(),
      byChangeType: new Map(),
      significantChanges: 0,
      filteredChanges: 0,
    };
  }

  /**
   * Add fields to the ignore list
   */
  public addIgnoredFields(...fields: string[]): void {
    for (const field of fields) {
      this.ignoredFields.add(field);
    }
  }

  /**
   * Remove fields from the ignore list
   */
  public removeIgnoredFields(...fields: string[]): void {
    for (const field of fields) {
      this.ignoredFields.delete(field);
    }
  }

  /**
   * Set significant fields for an entity type
   */
  public setSignificantFields(
    entityType: DBEntityType | string,
    fields: string[]
  ): void {
    this.significantFields[entityType] = fields;
  }

  /**
   * Get the current significant fields for an entity type
   */
  public getSignificantFields(entityType: DBEntityType | string): string[] {
    return this.significantFields[entityType] ?? [];
  }
}

// =============================================================================
// Prisma Middleware Factory
// =============================================================================

/**
 * Configuration for the Prisma middleware factory
 */
export interface PrismaMiddlewareConfig {
  /** Models to track (if not specified, tracks all supported models) */
  trackedModels?: string[];
  /** Whether to enable logging */
  debug?: boolean;
  /** Async handler to avoid blocking the middleware */
  async?: boolean;
}

/**
 * Type for Prisma middleware params
 * Compatible with Prisma's internal types without requiring the import
 */
interface PrismaMiddlewareParams {
  model?: string;
  action: string;
  args: Record<string, unknown>;
  dataPath: string[];
  runInTransaction: boolean;
}

/**
 * Type for the Prisma next function
 */
type PrismaNext = (params: PrismaMiddlewareParams) => Promise<unknown>;

/**
 * Create a Prisma middleware that sends database changes to the DBTriggerHandler
 *
 * @param handler - The DBTriggerHandler instance
 * @param prismaClient - Your Prisma client instance (for fetching before state)
 * @param config - Optional configuration
 * @returns Prisma middleware function
 *
 * @example
 * ```typescript
 * import { PrismaClient } from '@prisma/client';
 * import { DBTriggerHandler, createPrismaMiddleware } from '@/lib/agent/inputs/DBTriggerHandler';
 *
 * const prisma = new PrismaClient();
 * const dbHandler = new DBTriggerHandler({ orgId: 'org-123' });
 *
 * prisma.$use(createPrismaMiddleware(dbHandler, prisma, {
 *   trackedModels: ['Intake', 'Pipeline', 'Booking'],
 *   async: true,
 * }));
 * ```
 */
export function createPrismaMiddleware(
  handler: DBTriggerHandler,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prismaClient: any,
  config: PrismaMiddlewareConfig = {}
): (params: PrismaMiddlewareParams, next: PrismaNext) => Promise<unknown> {
  const DEFAULT_TRACKED_MODELS = [
    'Intake',
    'Pipeline',
    'PipelineItem',
    'PipelineStage',
    'CalendarEvent',
    'Booking',
    'User',
    'Contact',
    'Task',
  ];

  const trackedModels = new Set(config.trackedModels ?? DEFAULT_TRACKED_MODELS);
  const debug = config.debug ?? false;
  const isAsync = config.async ?? true;

  return async (
    params: PrismaMiddlewareParams,
    next: PrismaNext
  ): Promise<unknown> => {
    // Skip if model is not tracked
    if (!params.model || !trackedModels.has(params.model)) {
      return next(params);
    }

    // Skip batch operations unless explicitly enabled
    if (params.action.includes('Many')) {
      return next(params);
    }

    // Capture before state for updates and deletes
    let before: Record<string, unknown> | null = null;
    if (params.action === 'update' || params.action === 'delete') {
      try {
        // Access the model dynamically
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const modelDelegate = (prismaClient as any)[
          params.model.charAt(0).toLowerCase() + params.model.slice(1)
        ];
        if (modelDelegate?.findUnique) {
          before = await modelDelegate.findUnique({
            where: params.args.where,
          });
        }
      } catch (error) {
        if (debug) {
          console.warn(
            `[DBTriggerHandler] Failed to fetch before state for ${params.model}:`,
            error
          );
        }
      }
    }

    // Execute the operation
    const result = await next(params);

    // Build the trigger input
    const triggerInput: DBTriggerInput = {
      model: params.model,
      action: params.action,
      before,
      after: result as Record<string, unknown> | null,
      args: params.args,
      timestamp: new Date(),
    };

    // Process the change
    const processChange = async () => {
      try {
        await handler.handleInput(triggerInput);
      } catch (error) {
        if (debug) {
          console.error(`[DBTriggerHandler] Error processing ${params.model} change:`, error);
        }
      }
    };

    if (isAsync) {
      // Fire and forget
      processChange().catch(() => {
        // Silently ignore errors in async mode
      });
    } else {
      // Wait for processing
      await processChange();
    }

    return result;
  };
}

// =============================================================================
// Exports
// =============================================================================

export { DEFAULT_IGNORED_FIELDS, DEFAULT_SIGNIFICANT_FIELDS, EVENT_MAPPINGS };

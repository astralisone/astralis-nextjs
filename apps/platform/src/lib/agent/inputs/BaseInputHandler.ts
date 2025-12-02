/**
 * BaseInputHandler - Abstract base class for agent input handlers
 *
 * Provides common functionality for all input handlers:
 * - Event bus integration
 * - Logging infrastructure
 * - Input normalization
 * - Validation framework
 */

import { AgentEventBus, type EmitResult } from './EventBus';
import type {
  AgentInput,
  AgentInputSource,
  AgentInputMetadata,
  AgentEventType,
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
// Logger Interface
// =============================================================================

interface Logger {
  debug(message: string, data?: Record<string, unknown>): void;
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void;
}

const isDevelopment = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';

/**
 * Default console-based logger with component prefix
 */
const createDefaultLogger = (componentName: string): Logger => ({
  debug: (message: string, data?: Record<string, unknown>) => {
    if (isDevelopment) {
      console.debug(`[${componentName}] ${message}`, data ?? '');
    }
  },
  info: (message: string, data?: Record<string, unknown>) => {
    console.info(`[${componentName}] ${message}`, data ?? '');
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    console.warn(`[${componentName}] ${message}`, data ?? '');
  },
  error: (message: string, error?: Error | unknown, data?: Record<string, unknown>) => {
    console.error(`[${componentName}] ${message}`, error, data ?? '');
  },
});

// =============================================================================
// Handler Configuration
// =============================================================================

export interface InputHandlerConfig {
  /** Custom logger implementation */
  logger?: Logger;
  /** Organization ID for multi-tenant setups */
  orgId?: string;
  /** Enable debug logging */
  debug?: boolean;
  /** Custom EventBus instance (defaults to singleton) */
  eventBus?: AgentEventBus;
}

// =============================================================================
// Validation Result Types
// =============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedInput?: unknown;
}

// =============================================================================
// Processing Result Types
// =============================================================================

export interface ProcessingResult {
  success: boolean;
  input: AgentInput;
  eventEmitted?: {
    type: AgentEventType;
    result: EmitResult;
  };
  error?: Error;
  processingTimeMs: number;
  correlationId?: string;
}

// =============================================================================
// BaseInputHandler Abstract Class
// =============================================================================

/**
 * Abstract base class for input handlers
 *
 * Subclasses must implement:
 * - getSource(): Returns the input source type
 * - validate(): Validates raw input
 * - handleInput(): Processes and transforms input
 *
 * @example
 * ```typescript
 * class MyInputHandler extends BaseInputHandler {
 *   protected getSource(): AgentInputSource {
 *     return AgentInputSource.WEBHOOK;
 *   }
 *
 *   public validate(input: unknown): ValidationResult {
 *     // Validation logic
 *   }
 *
 *   public async handleInput(input: unknown): Promise<ProcessingResult> {
 *     // Processing logic
 *   }
 * }
 * ```
 */
export abstract class BaseInputHandler {
  protected eventBus: AgentEventBus;
  protected logger: Logger;
  protected orgId?: string;
  protected debug: boolean;

  // Statistics
  protected stats = {
    totalInputsProcessed: 0,
    successfulInputs: 0,
    failedInputs: 0,
    validationErrors: 0,
  };

  // ==========================================================================
  // Constructor
  // ==========================================================================

  constructor(config: InputHandlerConfig = {}) {
    this.eventBus = config.eventBus ?? AgentEventBus.getInstance();
    this.logger = config.logger ?? createDefaultLogger(this.constructor.name);
    this.orgId = config.orgId;
    this.debug = config.debug ?? false;

    this.logger.info(`${this.constructor.name} initialized`, {
      source: this.getSource(),
      orgId: this.orgId,
    });
  }

  // ==========================================================================
  // Abstract Methods (must be implemented by subclasses)
  // ==========================================================================

  /**
   * Get the input source type this handler processes
   */
  protected abstract getSource(): AgentInputSource;

  /**
   * Validate raw input before processing
   *
   * @param input - The raw input to validate
   * @returns Validation result with errors/warnings
   */
  public abstract validate(input: unknown): ValidationResult;

  /**
   * Process and transform raw input into an AgentInput
   *
   * @param input - The validated input to process
   * @returns Processing result with the normalized input
   */
  public abstract handleInput(input: unknown): Promise<ProcessingResult>;

  // ==========================================================================
  // Protected Helper Methods
  // ==========================================================================

  /**
   * Emit an event to the event bus
   *
   * @param type - The event type to emit
   * @param payload - The event payload
   * @param correlationId - Optional correlation ID for tracking
   * @returns The emit result
   */
  protected async emitEvent<T>(
    type: AgentEventType,
    payload: T,
    correlationId?: string
  ): Promise<EmitResult> {
    if (this.debug) {
      this.logger.debug(`Emitting event "${type}"`, { correlationId });
    }

    try {
      const result = await this.eventBus.emit(type, payload, {
        source: this.getSource(),
        correlationId,
        orgId: this.orgId,
        metadata: {
          handlerClass: this.constructor.name,
        },
      });

      if (result.errors.length > 0) {
        this.logger.warn(`Event "${type}" had ${result.errors.length} handler errors`, {
          eventId: result.eventId,
          errorCount: result.errors.length,
        });
      }

      return result;
    } catch (error) {
      this.logger.error(`Failed to emit event "${type}"`, error);
      throw error;
    }
  }

  /**
   * Normalize raw input into a standardized AgentInput format
   *
   * @param raw - The raw input data
   * @param type - The input type identifier
   * @param options - Additional options for normalization
   * @returns Normalized AgentInput
   */
  protected normalizeInput(
    raw: unknown,
    type: string,
    options: {
      correlationId?: string;
      metadata?: Partial<AgentInputMetadata>;
    } = {}
  ): AgentInput {
    const correlationId = options.correlationId ?? generateUUID();
    const timestamp = new Date();

    // Convert raw input to string for rawContent
    let rawContent: string;
    if (typeof raw === 'string') {
      rawContent = raw;
    } else if (raw === null || raw === undefined) {
      rawContent = '';
    } else {
      try {
        rawContent = JSON.stringify(raw, null, 2);
      } catch {
        rawContent = String(raw);
      }
    }

    // Extract structured data if possible
    let structuredData: Record<string, unknown> | undefined;
    if (typeof raw === 'object' && raw !== null) {
      structuredData = raw as Record<string, unknown>;
    }

    // Build metadata
    const metadata: AgentInputMetadata = {
      ...options.metadata,
      tags: [...(options.metadata?.tags ?? []), this.constructor.name],
    };

    return {
      source: this.getSource(),
      type,
      rawContent,
      structuredData,
      metadata,
      timestamp,
      correlationId,
    };
  }

  /**
   * Create a successful processing result
   */
  protected createSuccessResult(
    input: AgentInput,
    eventEmitted?: { type: AgentEventType; result: EmitResult },
    startTime?: number
  ): ProcessingResult {
    this.stats.totalInputsProcessed++;
    this.stats.successfulInputs++;

    return {
      success: true,
      input,
      eventEmitted,
      processingTimeMs: startTime ? Date.now() - startTime : 0,
      correlationId: input.correlationId,
    };
  }

  /**
   * Create a failed processing result
   */
  protected createErrorResult(
    input: AgentInput,
    error: Error,
    startTime?: number
  ): ProcessingResult {
    this.stats.totalInputsProcessed++;
    this.stats.failedInputs++;

    this.logger.error('Input processing failed', error, {
      inputType: input.type,
      correlationId: input.correlationId,
    });

    return {
      success: false,
      input,
      error,
      processingTimeMs: startTime ? Date.now() - startTime : 0,
      correlationId: input.correlationId,
    };
  }

  /**
   * Wrap processing logic with error handling and timing
   */
  protected async processWithErrorHandling(
    input: unknown,
    processor: (normalizedInput: AgentInput) => Promise<ProcessingResult>
  ): Promise<ProcessingResult> {
    const startTime = Date.now();

    // Validate input first
    const validation = this.validate(input);
    if (!validation.isValid) {
      this.stats.validationErrors++;
      const errorInput = this.normalizeInput(input, 'validation_error');
      return this.createErrorResult(
        errorInput,
        new Error(`Validation failed: ${validation.errors.join(', ')}`),
        startTime
      );
    }

    // Log warnings if any
    if (validation.warnings.length > 0) {
      this.logger.warn('Input validation warnings', {
        warnings: validation.warnings,
      });
    }

    try {
      // Use sanitized input if available
      const processInput = validation.sanitizedInput ?? input;
      const normalizedInput = this.normalizeInput(
        processInput,
        this.determineInputType(processInput)
      );

      return await processor(normalizedInput);
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      const errorInput = this.normalizeInput(input, 'processing_error');
      return this.createErrorResult(errorInput, errorObj, startTime);
    }
  }

  /**
   * Determine the input type from the raw input
   * Override in subclasses for custom type detection
   */
  protected determineInputType(input: unknown): string {
    if (typeof input === 'object' && input !== null) {
      const obj = input as Record<string, unknown>;
      if ('type' in obj && typeof obj.type === 'string') {
        return obj.type;
      }
    }
    return 'unknown';
  }

  // ==========================================================================
  // Public Utility Methods
  // ==========================================================================

  /**
   * Get handler statistics
   */
  public getStats(): typeof this.stats & { source: AgentInputSource } {
    return {
      ...this.stats,
      source: this.getSource(),
    };
  }

  /**
   * Reset handler statistics
   */
  public resetStats(): void {
    this.stats = {
      totalInputsProcessed: 0,
      successfulInputs: 0,
      failedInputs: 0,
      validationErrors: 0,
    };
  }

  /**
   * Check if the handler can process a given input
   */
  public canHandle(input: unknown): boolean {
    return this.validate(input).isValid;
  }
}

// =============================================================================
// Type Re-exports (convenience - interfaces exported inline above)
// =============================================================================

// Note: InputHandlerConfig, ValidationResult, ProcessingResult exported inline
export type { Logger };

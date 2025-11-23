/**
 * LLM Client - Abstract base class for LLM provider implementations
 *
 * This module provides:
 * - ILLMClient interface defining the contract for all LLM clients
 * - BaseLLMClient abstract class with common functionality
 * - Rate limiting, retry logic, and error handling
 *
 * @module LLMClient
 */

import { z } from 'zod';
import type {
  LLMProvider,
  LLMModel,
  ChatMessage,
  LLMOptions,
  LLMResponse,
  LLMClientConfig,
  TokenUsage,
} from '../types/agent.types';
import {
  LLMError,
  RateLimitError,
  TimeoutError,
  ValidationError,
  DEFAULT_LLM_OPTIONS,
  DEFAULT_CLIENT_CONFIG,
  ChatMessageSchema,
} from '../types/agent.types';

// =============================================================================
// ILLMClient Interface
// =============================================================================

/**
 * Interface defining the contract for all LLM clients.
 *
 * All LLM provider implementations must implement this interface to ensure
 * consistent behavior across different providers (OpenAI, Claude, etc.).
 */
export interface ILLMClient {
  /** The LLM provider (openai, claude) */
  readonly provider: LLMProvider;

  /** The specific model being used */
  readonly model: LLMModel;

  /**
   * Complete a chat conversation with the LLM.
   *
   * @param messages - Array of chat messages forming the conversation
   * @param options - Optional configuration for this specific request
   * @returns Promise resolving to the LLM response
   * @throws {LLMError} On any LLM-related error
   * @throws {RateLimitError} When rate limits are exceeded
   * @throws {TimeoutError} When the request times out
   *
   * @example
   * ```typescript
   * const response = await client.complete([
   *   { role: 'system', content: 'You are a helpful assistant.' },
   *   { role: 'user', content: 'Hello, how are you?' }
   * ]);
   * console.log(response.content);
   * ```
   */
  complete(messages: ChatMessage[], options?: LLMOptions): Promise<LLMResponse>;

  /**
   * Complete a chat conversation and parse the response as JSON.
   *
   * This method enforces structured output by:
   * 1. Instructing the LLM to respond in JSON format
   * 2. Validating the response against the provided Zod schema
   * 3. Returning the parsed, type-safe result
   *
   * @param messages - Array of chat messages forming the conversation
   * @param schema - Zod schema defining the expected response structure
   * @param options - Optional configuration for this specific request
   * @returns Promise resolving to the validated, typed response
   * @throws {ValidationError} When the response doesn't match the schema
   * @throws {LLMError} On any LLM-related error
   *
   * @example
   * ```typescript
   * const schema = z.object({
   *   intent: z.string(),
   *   confidence: z.number().min(0).max(1),
   * });
   *
   * const result = await client.completeWithJSON(messages, schema);
   * // result is typed as { intent: string; confidence: number }
   * ```
   */
  completeWithJSON<T>(
    messages: ChatMessage[],
    schema: z.ZodSchema<T>,
    options?: LLMOptions
  ): Promise<T>;

  /**
   * Check if the client is properly configured and ready to use.
   *
   * @returns true if the client is ready, false otherwise
   */
  isReady(): boolean;

  /**
   * Get the current rate limit status.
   *
   * @returns Object containing rate limit information
   */
  getRateLimitStatus(): RateLimitStatus;
}

// =============================================================================
// Rate Limiting Types
// =============================================================================

/**
 * Rate limit status information
 */
export interface RateLimitStatus {
  /** Whether rate limiting is active */
  isLimited: boolean;
  /** Requests made in the current window */
  requestsInWindow: number;
  /** Maximum requests allowed per window */
  maxRequestsPerWindow: number;
  /** Time until the rate limit resets (ms) */
  resetInMs: number;
  /** Tokens used in the current window (if applicable) */
  tokensUsedInWindow?: number;
}

/**
 * Internal rate limiter state
 */
interface RateLimiterState {
  requestTimestamps: number[];
  tokensUsed: number;
  windowStartTime: number;
}

// =============================================================================
// BaseLLMClient Abstract Class
// =============================================================================

/**
 * Abstract base class providing common functionality for LLM clients.
 *
 * This class handles:
 * - Rate limiting with configurable windows
 * - Retry logic with exponential backoff
 * - Error handling and classification
 * - Request logging and telemetry
 * - Input validation
 *
 * Subclasses must implement the protected `_complete` method to handle
 * provider-specific API calls.
 */
export abstract class BaseLLMClient implements ILLMClient {
  public abstract readonly provider: LLMProvider;
  public readonly model: LLMModel;

  protected readonly config: LLMClientConfig & Required<Pick<LLMClientConfig, 'maxRetries' | 'retryBaseDelay'>>;
  protected readonly defaultOptions: Required<Pick<LLMOptions, 'temperature' | 'maxTokens' | 'timeout'>>;

  private rateLimiter: RateLimiterState;
  private readonly RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
  private readonly MAX_REQUESTS_PER_WINDOW = 60;
  private readonly MAX_TOKENS_PER_WINDOW = 100000;

  /**
   * Create a new LLM client instance.
   *
   * @param config - Configuration options for the client
   */
  constructor(config: LLMClientConfig) {
    this.model = config.model;
    this.config = {
      ...DEFAULT_CLIENT_CONFIG,
      model: config.model,
      apiKey: config.apiKey,
      defaultOptions: config.defaultOptions,
      organizationId: config.organizationId,
      baseUrl: config.baseUrl,
      maxRetries: config.maxRetries ?? DEFAULT_CLIENT_CONFIG.maxRetries,
      retryBaseDelay: config.retryBaseDelay ?? DEFAULT_CLIENT_CONFIG.retryBaseDelay,
    };

    this.defaultOptions = {
      temperature: config.defaultOptions?.temperature ?? DEFAULT_LLM_OPTIONS.temperature,
      maxTokens: config.defaultOptions?.maxTokens ?? DEFAULT_LLM_OPTIONS.maxTokens,
      timeout: config.defaultOptions?.timeout ?? DEFAULT_LLM_OPTIONS.timeout,
    };

    this.rateLimiter = {
      requestTimestamps: [],
      tokensUsed: 0,
      windowStartTime: Date.now(),
    };

    // Note: this.provider is abstract and set by subclass
    console.log(`[LLMClient] Initialized client with model: ${this.model}`);
  }

  /**
   * Abstract method that subclasses must implement for provider-specific API calls.
   *
   * @param messages - Chat messages to send
   * @param options - Request options
   * @returns Promise resolving to the LLM response
   */
  protected abstract _complete(
    messages: ChatMessage[],
    options: LLMOptions
  ): Promise<LLMResponse>;

  /**
   * Abstract method to check if the client is properly configured.
   */
  public abstract isReady(): boolean;

  /**
   * Complete a chat conversation with rate limiting and retry logic.
   */
  public async complete(
    messages: ChatMessage[],
    options?: LLMOptions
  ): Promise<LLMResponse> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    console.log(`[LLMClient] [${requestId}] Starting completion request`);
    console.log(`[LLMClient] [${requestId}] Messages: ${messages.length}, Model: ${this.model}`);

    // Validate input messages
    this.validateMessages(messages);

    // Check rate limits
    await this.checkRateLimit(requestId);

    // Merge options with defaults
    const mergedOptions = this.mergeOptions(options);

    // Execute with retry logic
    let lastError: Error | undefined;
    let attempt = 0;

    while (attempt <= this.config.maxRetries) {
      try {
        if (attempt > 0) {
          console.log(`[LLMClient] [${requestId}] Retry attempt ${attempt}/${this.config.maxRetries}`);
        }

        const response = await this.executeWithTimeout(
          () => this._complete(messages, mergedOptions),
          mergedOptions.timeout ?? this.defaultOptions.timeout,
          requestId
        );

        // Update rate limiter with token usage
        this.updateRateLimiter(response.usage);

        const latencyMs = Date.now() - startTime;
        response.latencyMs = latencyMs;

        console.log(`[LLMClient] [${requestId}] Completed successfully in ${latencyMs}ms`);
        console.log(`[LLMClient] [${requestId}] Tokens used: ${response.usage?.totalTokens ?? 'unknown'}`);

        return response;
      } catch (error) {
        lastError = error as Error;
        attempt++;

        if (!this.shouldRetry(error as Error, attempt)) {
          console.log(`[LLMClient] [${requestId}] Error is not retryable, throwing`);
          break;
        }

        const delay = this.calculateBackoffDelay(attempt, error as Error);
        console.log(`[LLMClient] [${requestId}] Waiting ${delay}ms before retry`);
        await this.sleep(delay);
      }
    }

    const latencyMs = Date.now() - startTime;
    console.log(`[LLMClient] [${requestId}] Failed after ${attempt} attempts in ${latencyMs}ms`);

    throw this.normalizeError(lastError!);
  }

  /**
   * Complete a chat and parse the response as validated JSON.
   */
  public async completeWithJSON<T>(
    messages: ChatMessage[],
    schema: z.ZodSchema<T>,
    options?: LLMOptions
  ): Promise<T> {
    const requestId = this.generateRequestId();
    console.log(`[LLMClient] [${requestId}] Starting JSON completion request`);

    // Add JSON instruction to the last system message or create one
    const enhancedMessages = this.addJSONInstruction(messages, schema);

    // Get completion
    const response = await this.complete(enhancedMessages, options);

    // Parse and validate JSON
    const jsonResult = this.parseJSON<T>(response.content, schema, requestId);

    console.log(`[LLMClient] [${requestId}] JSON parsing and validation successful`);

    return jsonResult;
  }

  /**
   * Get current rate limit status.
   */
  public getRateLimitStatus(): RateLimitStatus {
    this.cleanupRateLimiter();

    const requestsInWindow = this.rateLimiter.requestTimestamps.length;
    const isLimited = requestsInWindow >= this.MAX_REQUESTS_PER_WINDOW ||
                      this.rateLimiter.tokensUsed >= this.MAX_TOKENS_PER_WINDOW;

    const oldestRequest = this.rateLimiter.requestTimestamps[0] ?? Date.now();
    const resetInMs = Math.max(0, oldestRequest + this.RATE_LIMIT_WINDOW_MS - Date.now());

    return {
      isLimited,
      requestsInWindow,
      maxRequestsPerWindow: this.MAX_REQUESTS_PER_WINDOW,
      resetInMs,
      tokensUsedInWindow: this.rateLimiter.tokensUsed,
    };
  }

  // ===========================================================================
  // Protected Helper Methods
  // ===========================================================================

  /**
   * Normalize provider-specific errors into standard error types.
   * Subclasses should override to handle provider-specific error codes.
   */
  protected normalizeError(error: Error): LLMError {
    if (error instanceof LLMError) {
      return error;
    }

    return new LLMError(
      error.message,
      'UNKNOWN_ERROR',
      this.provider,
      undefined,
      false,
      error
    );
  }

  /**
   * Get the JSON mode instruction for this provider.
   * Subclasses can override to use provider-specific JSON modes.
   */
  protected getJSONModeInstruction(schemaDescription: string): string {
    return `\n\nIMPORTANT: You MUST respond with valid JSON only. No explanations, no markdown formatting, just raw JSON.\n\nExpected JSON structure:\n${schemaDescription}`;
  }

  // ===========================================================================
  // Private Helper Methods
  // ===========================================================================

  /**
   * Validate chat messages against the schema.
   */
  private validateMessages(messages: ChatMessage[]): void {
    if (!messages || messages.length === 0) {
      throw new ValidationError(
        'Messages array cannot be empty',
        this.provider
      );
    }

    for (const message of messages) {
      const result = ChatMessageSchema.safeParse(message);
      if (!result.success) {
        throw new ValidationError(
          `Invalid message format: ${result.error.message}`,
          this.provider,
          result.error
        );
      }
    }
  }

  /**
   * Check rate limits and wait if necessary.
   */
  private async checkRateLimit(requestId: string): Promise<void> {
    this.cleanupRateLimiter();

    const status = this.getRateLimitStatus();

    if (status.isLimited) {
      console.log(`[LLMClient] [${requestId}] Rate limit reached, waiting ${status.resetInMs}ms`);

      if (status.resetInMs > 0) {
        await this.sleep(status.resetInMs);
        this.cleanupRateLimiter();
      }
    }

    // Record this request
    this.rateLimiter.requestTimestamps.push(Date.now());
  }

  /**
   * Update rate limiter with token usage from response.
   */
  private updateRateLimiter(usage?: TokenUsage): void {
    if (usage) {
      this.rateLimiter.tokensUsed += usage.totalTokens;
    }
  }

  /**
   * Clean up old entries from rate limiter.
   */
  private cleanupRateLimiter(): void {
    const cutoff = Date.now() - this.RATE_LIMIT_WINDOW_MS;

    this.rateLimiter.requestTimestamps = this.rateLimiter.requestTimestamps.filter(
      (timestamp) => timestamp > cutoff
    );

    // Reset token counter if window has passed
    if (Date.now() - this.rateLimiter.windowStartTime > this.RATE_LIMIT_WINDOW_MS) {
      this.rateLimiter.tokensUsed = 0;
      this.rateLimiter.windowStartTime = Date.now();
    }
  }

  /**
   * Merge provided options with defaults.
   */
  private mergeOptions(options?: LLMOptions): LLMOptions {
    return {
      ...this.defaultOptions,
      ...this.config.defaultOptions,
      ...options,
    };
  }

  /**
   * Execute a function with a timeout.
   */
  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number,
    requestId: string
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new TimeoutError(this.provider, timeoutMs));
      }, timeoutMs);
    });

    return Promise.race([fn(), timeoutPromise]);
  }

  /**
   * Determine if an error should trigger a retry.
   */
  private shouldRetry(error: Error, attempt: number): boolean {
    if (attempt > this.config.maxRetries) {
      return false;
    }

    if (error instanceof LLMError) {
      return error.retryable;
    }

    // Retry on network errors
    const message = error.message.toLowerCase();
    if (
      message.includes('network') ||
      message.includes('econnreset') ||
      message.includes('socket') ||
      message.includes('timeout')
    ) {
      return true;
    }

    return false;
  }

  /**
   * Calculate exponential backoff delay with jitter.
   */
  private calculateBackoffDelay(attempt: number, error: Error): number {
    // Use retry-after header if available
    if (error instanceof RateLimitError && error.retryAfterMs) {
      return error.retryAfterMs;
    }

    // Exponential backoff with jitter
    const baseDelay = this.config.retryBaseDelay;
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 0.1 * exponentialDelay;

    return Math.min(exponentialDelay + jitter, 60000); // Cap at 60 seconds
  }

  /**
   * Add JSON instruction to messages.
   */
  private addJSONInstruction<T>(
    messages: ChatMessage[],
    schema: z.ZodSchema<T>
  ): ChatMessage[] {
    const schemaDescription = this.getSchemaDescription(schema);
    const instruction = this.getJSONModeInstruction(schemaDescription);

    // Find existing system message or create one
    const enhancedMessages = [...messages];
    const systemIndex = enhancedMessages.findIndex((m) => m.role === 'system');

    if (systemIndex >= 0) {
      enhancedMessages[systemIndex] = {
        ...enhancedMessages[systemIndex],
        content: enhancedMessages[systemIndex].content + instruction,
      };
    } else {
      enhancedMessages.unshift({
        role: 'system',
        content: `You are a helpful assistant that responds in JSON format.${instruction}`,
      });
    }

    return enhancedMessages;
  }

  /**
   * Get a human-readable description of a Zod schema.
   */
  private getSchemaDescription(schema: z.ZodSchema): string {
    try {
      // Try to get shape if it's an object schema
      const schemaAny = schema as z.ZodObject<z.ZodRawShape>;
      if (schemaAny._def && schemaAny._def.shape) {
        const shape = schemaAny._def.shape();
        const keys = Object.keys(shape);
        return `{\n${keys.map((k) => `  "${k}": ...`).join(',\n')}\n}`;
      }
    } catch {
      // Fall back to generic description
    }

    return '{ ... }';
  }

  /**
   * Parse and validate JSON from LLM response.
   */
  private parseJSON<T>(
    content: string,
    schema: z.ZodSchema<T>,
    requestId: string
  ): T {
    // Try to extract JSON from potential markdown code blocks
    let jsonString = content.trim();

    // Remove markdown code block if present
    const codeBlockMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonString = codeBlockMatch[1].trim();
    }

    // Parse JSON
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch (parseError) {
      console.log(`[LLMClient] [${requestId}] Failed to parse JSON: ${(parseError as Error).message}`);
      console.log(`[LLMClient] [${requestId}] Raw content: ${content.substring(0, 500)}...`);

      throw new ValidationError(
        `Failed to parse LLM response as JSON: ${(parseError as Error).message}`,
        this.provider
      );
    }

    // Validate against schema
    const result = schema.safeParse(parsed);
    if (!result.success) {
      console.log(`[LLMClient] [${requestId}] JSON validation failed: ${result.error.message}`);

      throw new ValidationError(
        `LLM response does not match expected schema: ${result.error.message}`,
        this.provider,
        result.error
      );
    }

    return result.data;
  }

  /**
   * Generate a unique request ID for logging.
   */
  private generateRequestId(): string {
    return `${this.provider}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  }

  /**
   * Sleep for a specified duration.
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// =============================================================================
// Type Exports
// =============================================================================

export type { LLMClientConfig, LLMOptions, LLMResponse, ChatMessage };

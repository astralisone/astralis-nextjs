/**
 * OpenAI Client - Implementation of LLM client for OpenAI models
 *
 * This module provides an OpenAI-specific implementation of the LLM client,
 * supporting GPT-4 and GPT-4-turbo models with JSON mode support.
 *
 * @module OpenAIClient
 */

import OpenAI from 'openai';
import { z } from 'zod';
import { BaseLLMClient, type ILLMClient } from './LLMClient';
import {
  LLMProvider,
  LLMError,
  RateLimitError,
  AuthenticationError,
  APIKeyError,
  ContentFilterError,
  ModelOverloadedError,
} from '../types/agent.types';
import type {
  ChatMessage,
  LLMOptions,
  LLMResponse,
  LLMClientConfig,
  OpenAIModel,
  LLMFinishReason,
} from '../types/agent.types';

// =============================================================================
// Environment Configuration
// =============================================================================

/**
 * Get OpenAI API key from environment
 */
function getOpenAIApiKey(configKey?: string): string {
  const apiKey = configKey ?? process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new APIKeyError(LLMProvider.OPENAI);
  }

  return apiKey;
}

// =============================================================================
// OpenAI Client Configuration
// =============================================================================

/**
 * Configuration specific to OpenAI client
 */
export interface OpenAIClientConfig extends LLMClientConfig {
  model: OpenAIModel;
  /** Organization ID for OpenAI API */
  organizationId?: string;
  /** Enable JSON mode for responses */
  jsonMode?: boolean;
}

/**
 * Models that support JSON mode
 */
const JSON_MODE_SUPPORTED_MODELS: OpenAIModel[] = [
  'gpt-4-turbo',
  'gpt-4-turbo-preview',
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-3.5-turbo',
];

// =============================================================================
// OpenAIClient Implementation
// =============================================================================

/**
 * OpenAI implementation of the LLM client.
 *
 * Supports:
 * - GPT-4, GPT-4-turbo, GPT-4o, GPT-3.5-turbo models
 * - JSON mode for structured outputs
 * - Automatic rate limit handling
 * - Comprehensive error mapping
 *
 * @example
 * ```typescript
 * const client = new OpenAIClient({
 *   model: 'gpt-4-turbo',
 *   defaultOptions: { temperature: 0.3 }
 * });
 *
 * const response = await client.complete([
 *   { role: 'system', content: 'You are a helpful assistant.' },
 *   { role: 'user', content: 'Hello!' }
 * ]);
 * ```
 */
export class OpenAIClient extends BaseLLMClient implements ILLMClient {
  public readonly provider: LLMProvider = LLMProvider.OPENAI;

  private readonly openai: OpenAI;
  private readonly jsonModeEnabled: boolean;

  /**
   * Create a new OpenAI client instance.
   *
   * @param config - Configuration options
   * @throws {APIKeyError} If no API key is configured
   */
  constructor(config: OpenAIClientConfig) {
    super(config);

    const apiKey = getOpenAIApiKey(config.apiKey);

    this.openai = new OpenAI({
      apiKey,
      organization: config.organizationId,
      baseURL: config.baseUrl,
      timeout: config.defaultOptions?.timeout ?? 30000,
      maxRetries: 0, // We handle retries ourselves
    });

    this.jsonModeEnabled = config.jsonMode ?? false;

    console.log(`[OpenAIClient] Initialized with model: ${this.model}`);
    console.log(`[OpenAIClient] JSON mode: ${this.jsonModeEnabled ? 'enabled' : 'disabled'}`);
    console.log(`[OpenAIClient] Organization: ${config.organizationId ?? 'default'}`);
  }

  /**
   * Check if the client is properly configured and ready.
   */
  public isReady(): boolean {
    try {
      // Check if API key exists
      getOpenAIApiKey(this.config.apiKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Execute a completion request to OpenAI.
   *
   * @param messages - Chat messages
   * @param options - Request options
   * @returns LLM response
   */
  protected async _complete(
    messages: ChatMessage[],
    options: LLMOptions
  ): Promise<LLMResponse> {
    console.log(`[OpenAIClient] Sending request to OpenAI API`);
    console.log(`[OpenAIClient] Model: ${this.model}, Messages: ${messages.length}`);

    try {
      // Map messages to OpenAI format
      const openaiMessages = this.mapToOpenAIMessages(messages);

      // Determine if JSON mode should be used
      const useJsonMode = this.shouldUseJsonMode(messages);

      // Build request parameters
      const requestParams: OpenAI.Chat.ChatCompletionCreateParams = {
        model: this.model,
        messages: openaiMessages,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        top_p: options.topP,
        presence_penalty: options.presencePenalty,
        frequency_penalty: options.frequencyPenalty,
        stop: options.stopSequences,
        user: options.user,
      };

      // Add JSON response format if supported and enabled
      if (useJsonMode && this.supportsJsonMode()) {
        requestParams.response_format = { type: 'json_object' };
        console.log(`[OpenAIClient] Using JSON mode`);
      }

      // Execute the request
      const startTime = Date.now();
      const completion = await this.openai.chat.completions.create(requestParams);
      const latencyMs = Date.now() - startTime;

      console.log(`[OpenAIClient] Received response in ${latencyMs}ms`);

      // Extract response
      const choice = completion.choices[0];
      if (!choice) {
        throw new LLMError(
          'No completion choice returned from OpenAI',
          'NO_COMPLETION',
          LLMProvider.OPENAI,
          500
        );
      }

      // Check for content filter
      if (choice.finish_reason === 'content_filter') {
        throw new ContentFilterError(
          'Response was filtered due to content policy',
          LLMProvider.OPENAI
        );
      }

      // Map OpenAI finish reason to our type
      const finishReason = this.mapFinishReason(choice.finish_reason);

      // Build response
      const response: LLMResponse = {
        id: completion.id,
        content: choice.message.content ?? '',
        model: completion.model,
        finishReason,
        usage: {
          promptTokens: completion.usage?.prompt_tokens ?? 0,
          completionTokens: completion.usage?.completion_tokens ?? 0,
          totalTokens: completion.usage?.total_tokens ?? 0,
        },
        latencyMs,
      };

      console.log(`[OpenAIClient] Completion ID: ${response.id}`);
      console.log(`[OpenAIClient] Finish reason: ${response.finishReason}`);
      console.log(`[OpenAIClient] Tokens: ${response.usage?.totalTokens ?? 'unknown'}`);

      return response;
    } catch (error) {
      console.log(`[OpenAIClient] Error during completion: ${(error as Error).message}`);
      throw this.normalizeError(error as Error);
    }
  }

  /**
   * Complete with JSON using OpenAI's native JSON mode when available.
   *
   * @override
   */
  public async completeWithJSON<T>(
    messages: ChatMessage[],
    schema: z.ZodSchema<T>,
    options?: LLMOptions
  ): Promise<T> {
    console.log(`[OpenAIClient] Starting JSON completion`);

    // If JSON mode is supported, use it
    if (this.supportsJsonMode()) {
      console.log(`[OpenAIClient] Using native JSON mode`);

      // Add JSON instruction to messages
      const enhancedMessages = this.addJSONInstructionForOpenAI(messages, schema);

      // Create temporary client config with JSON mode enabled
      const response = await this._complete(enhancedMessages, {
        ...this.config.defaultOptions,
        ...options,
      });

      // Parse and validate response
      return this.parseAndValidate(response.content, schema);
    }

    // Fall back to base implementation
    return super.completeWithJSON(messages, schema, options);
  }

  // ===========================================================================
  // Protected Methods
  // ===========================================================================

  /**
   * Normalize OpenAI-specific errors into standard error types.
   *
   * @override
   */
  protected normalizeError(error: Error): LLMError {
    // Already normalized
    if (error instanceof LLMError) {
      return error;
    }

    // Handle OpenAI API errors
    if (error instanceof OpenAI.APIError) {
      const statusCode = error.status;
      const message = error.message;

      console.log(`[OpenAIClient] API error - Status: ${statusCode}, Message: ${message}`);

      // Rate limit error
      if (statusCode === 429) {
        const retryAfter = this.extractRetryAfter(error);
        return new RateLimitError(
          message,
          LLMProvider.OPENAI,
          retryAfter,
          error
        );
      }

      // Authentication error
      if (statusCode === 401) {
        return new AuthenticationError(
          message,
          LLMProvider.OPENAI,
          error
        );
      }

      // Invalid API key
      if (statusCode === 403) {
        return new AuthenticationError(
          'Invalid API key or insufficient permissions',
          LLMProvider.OPENAI,
          error
        );
      }

      // Model overloaded
      if (statusCode === 503) {
        return new ModelOverloadedError(
          LLMProvider.OPENAI,
          undefined,
          error
        );
      }

      // Bad request (validation errors)
      if (statusCode === 400) {
        return new LLMError(
          message,
          'BAD_REQUEST',
          LLMProvider.OPENAI,
          400,
          false,
          error
        );
      }

      // Server errors are retryable
      if (statusCode && statusCode >= 500) {
        return new LLMError(
          message,
          'SERVER_ERROR',
          LLMProvider.OPENAI,
          statusCode,
          true,
          error
        );
      }

      // Unknown API error
      return new LLMError(
        message,
        'API_ERROR',
        LLMProvider.OPENAI,
        statusCode,
        false,
        error
      );
    }

    // Connection errors are retryable
    if (error instanceof OpenAI.APIConnectionError) {
      return new LLMError(
        error.message,
        'CONNECTION_ERROR',
        LLMProvider.OPENAI,
        undefined,
        true,
        error
      );
    }

    // Rate limit errors
    if (error instanceof OpenAI.RateLimitError) {
      return new RateLimitError(
        error.message,
        LLMProvider.OPENAI,
        undefined,
        error
      );
    }

    // Generic error
    return new LLMError(
      error.message,
      'UNKNOWN_ERROR',
      LLMProvider.OPENAI,
      undefined,
      false,
      error
    );
  }

  /**
   * Get JSON mode instruction for OpenAI.
   *
   * @override
   */
  protected getJSONModeInstruction(schemaDescription: string): string {
    if (this.supportsJsonMode()) {
      // OpenAI JSON mode requires explicit instruction
      return `\n\nYou must respond with a JSON object. ${schemaDescription}`;
    }

    return super.getJSONModeInstruction(schemaDescription);
  }

  // ===========================================================================
  // Private Methods
  // ===========================================================================

  /**
   * Map internal ChatMessage format to OpenAI format.
   */
  private mapToOpenAIMessages(
    messages: ChatMessage[]
  ): OpenAI.Chat.ChatCompletionMessageParam[] {
    return messages.map((message) => ({
      role: message.role as 'system' | 'user' | 'assistant',
      content: message.content,
      name: message.name,
    }));
  }

  /**
   * Check if the current model supports JSON mode.
   */
  private supportsJsonMode(): boolean {
    return JSON_MODE_SUPPORTED_MODELS.includes(this.model as OpenAIModel);
  }

  /**
   * Determine if JSON mode should be used for this request.
   */
  private shouldUseJsonMode(messages: ChatMessage[]): boolean {
    if (!this.jsonModeEnabled) {
      return false;
    }

    // Check if any message requests JSON output
    const jsonKeywords = ['json', 'JSON', 'structured', 'object'];
    return messages.some((m) =>
      jsonKeywords.some((kw) => m.content.includes(kw))
    );
  }

  /**
   * Add JSON instruction for OpenAI-specific JSON mode.
   */
  private addJSONInstructionForOpenAI<T>(
    messages: ChatMessage[],
    schema: z.ZodSchema<T>
  ): ChatMessage[] {
    const schemaDescription = this.getSchemaDescriptionForOpenAI(schema);
    const enhancedMessages = [...messages];

    // Find or create system message
    const systemIndex = enhancedMessages.findIndex((m) => m.role === 'system');

    const jsonInstruction = `\n\nYou MUST respond with valid JSON only. The JSON must conform to this schema:\n${schemaDescription}`;

    if (systemIndex >= 0) {
      enhancedMessages[systemIndex] = {
        ...enhancedMessages[systemIndex],
        content: enhancedMessages[systemIndex].content + jsonInstruction,
      };
    } else {
      enhancedMessages.unshift({
        role: 'system',
        content: `You are a helpful assistant that always responds with valid JSON.${jsonInstruction}`,
      });
    }

    return enhancedMessages;
  }

  /**
   * Get schema description formatted for OpenAI.
   */
  private getSchemaDescriptionForOpenAI(schema: z.ZodSchema): string {
    try {
      // Try to introspect the schema
      const schemaAny = schema as z.ZodObject<z.ZodRawShape>;
      if (schemaAny._def && schemaAny._def.shape) {
        const shape = schemaAny._def.shape();
        const fields = Object.entries(shape).map(([key, value]) => {
          const zodType = value as z.ZodTypeAny;
          const typeName = this.getZodTypeName(zodType);
          return `  "${key}": ${typeName}`;
        });
        return `{\n${fields.join(',\n')}\n}`;
      }
    } catch {
      // Fall back to generic
    }

    return '{ ... }';
  }

  /**
   * Get human-readable type name from Zod type.
   */
  private getZodTypeName(zodType: z.ZodTypeAny): string {
    const typeName = zodType._def?.typeName;

    switch (typeName) {
      case 'ZodString':
        return 'string';
      case 'ZodNumber':
        return 'number';
      case 'ZodBoolean':
        return 'boolean';
      case 'ZodArray':
        return 'array';
      case 'ZodObject':
        return 'object';
      case 'ZodOptional':
        return `${this.getZodTypeName(zodType._def.innerType)} (optional)`;
      default:
        return 'any';
    }
  }

  /**
   * Parse and validate JSON response.
   */
  private parseAndValidate<T>(content: string, schema: z.ZodSchema<T>): T {
    let jsonString = content.trim();

    // Remove markdown code blocks if present
    const codeBlockMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonString = codeBlockMatch[1].trim();
    }

    // Parse JSON
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonString);
    } catch (error) {
      console.log(`[OpenAIClient] Failed to parse JSON: ${(error as Error).message}`);
      throw new LLMError(
        `Failed to parse response as JSON: ${(error as Error).message}`,
        'JSON_PARSE_ERROR',
        LLMProvider.OPENAI,
        undefined,
        false
      );
    }

    // Validate against schema
    const result = schema.safeParse(parsed);
    if (!result.success) {
      console.log(`[OpenAIClient] Schema validation failed: ${result.error.message}`);
      throw new LLMError(
        `Response does not match expected schema: ${result.error.message}`,
        'SCHEMA_VALIDATION_ERROR',
        LLMProvider.OPENAI,
        undefined,
        false
      );
    }

    return result.data;
  }

  /**
   * Map OpenAI finish reason to our LLMFinishReason type.
   */
  private mapFinishReason(reason: string | null): LLMFinishReason {
    switch (reason) {
      case 'stop':
        return 'stop';
      case 'length':
        return 'length';
      case 'content_filter':
        return 'content_filter';
      case 'tool_calls':
      case 'function_call':
        return 'tool_calls';
      default:
        return 'stop'; // Default to stop for unknown reasons
    }
  }

  /**
   * Extract retry-after header from error if available.
   */
  private extractRetryAfter(error: InstanceType<typeof OpenAI.APIError>): number | undefined {
    // Try to get retry-after from headers
    const headers = error.headers;
    if (headers && typeof headers.get === 'function') {
      const retryAfter = headers.get('retry-after');
      if (retryAfter) {
        const seconds = parseInt(retryAfter, 10);
        if (!isNaN(seconds)) {
          return seconds * 1000; // Convert to ms
        }
      }
    }

    // Default retry delay for rate limits
    return 60000; // 1 minute
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a new OpenAI client with the given configuration.
 *
 * @param config - Client configuration
 * @returns Configured OpenAI client
 *
 * @example
 * ```typescript
 * const client = createOpenAIClient({
 *   model: 'gpt-4-turbo',
 *   defaultOptions: { temperature: 0.3, maxTokens: 2000 }
 * });
 * ```
 */
export function createOpenAIClient(config: OpenAIClientConfig): OpenAIClient {
  return new OpenAIClient(config);
}

// Note: OpenAIClientConfig is already exported when the interface is defined

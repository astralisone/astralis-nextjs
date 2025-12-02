/**
 * Claude Client - Implementation of LLM client for Anthropic Claude models
 *
 * This module provides a Claude/Anthropic-specific implementation of the LLM client,
 * supporting Claude 3 models (Opus, Sonnet, Haiku) with tool use for structured outputs.
 *
 * NOTE: Requires @anthropic-ai/sdk package to be installed:
 *   npm install @anthropic-ai/sdk
 *
 * @module ClaudeClient
 */

import Anthropic from '@anthropic-ai/sdk';
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
  ClaudeModel,
  LLMFinishReason,
} from '../types/agent.types';

// =============================================================================
// Environment Configuration
// =============================================================================

/**
 * Get Anthropic API key from environment
 */
function getAnthropicApiKey(configKey?: string): string {
  const apiKey = configKey ?? process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new APIKeyError(LLMProvider.CLAUDE);
  }

  return apiKey;
}

// =============================================================================
// Claude Client Configuration
// =============================================================================

/**
 * Configuration specific to Claude client
 */
export interface ClaudeClientConfig extends LLMClientConfig {
  model: ClaudeModel;
  /** Maximum tokens to sample (Claude-specific terminology) */
  maxTokensToSample?: number;
}

/**
 * Default max tokens for Claude models
 */
const CLAUDE_DEFAULT_MAX_TOKENS = 4096;

// =============================================================================
// Tool Definition for Structured Output
// =============================================================================

/**
 * Build a tool definition for JSON schema extraction
 */
function buildJSONExtractionTool(
  schemaDescription: Record<string, unknown>
): Anthropic.Tool {
  return {
    name: 'respond_with_json',
    description: 'Use this tool to provide your response in the required JSON format. You MUST use this tool to respond.',
    input_schema: {
      type: 'object',
      properties: schemaDescription,
      required: Object.keys(schemaDescription),
    },
  };
}

// =============================================================================
// ClaudeClient Implementation
// =============================================================================

/**
 * Claude/Anthropic implementation of the LLM client.
 *
 * Supports:
 * - Claude 3 Opus, Sonnet, and Haiku models
 * - Claude Sonnet 4
 * - Tool use for structured JSON outputs
 * - Automatic rate limit handling
 * - Comprehensive error mapping
 *
 * @example
 * ```typescript
 * const client = new ClaudeClient({
 *   model: 'claude-sonnet-4-20250514',
 *   defaultOptions: { temperature: 0.3 }
 * });
 *
 * const response = await client.complete([
 *   { role: 'system', content: 'You are a helpful assistant.' },
 *   { role: 'user', content: 'Hello!' }
 * ]);
 * ```
 */
export class ClaudeClient extends BaseLLMClient implements ILLMClient {
  public readonly provider: LLMProvider = LLMProvider.CLAUDE;

  private readonly anthropic: Anthropic;
  private readonly maxTokensToSample: number;

  /**
   * Create a new Claude client instance.
   *
   * @param config - Configuration options
   * @throws {APIKeyError} If no API key is configured
   */
  constructor(config: ClaudeClientConfig) {
    super(config);

    const apiKey = getAnthropicApiKey(config.apiKey);

    this.anthropic = new Anthropic({
      apiKey,
      baseURL: config.baseUrl,
      timeout: config.defaultOptions?.timeout ?? 30000,
      maxRetries: 0, // We handle retries ourselves
    });

    this.maxTokensToSample = config.maxTokensToSample ?? CLAUDE_DEFAULT_MAX_TOKENS;

    console.log(`[ClaudeClient] Initialized with model: ${this.model}`);
    console.log(`[ClaudeClient] Max tokens to sample: ${this.maxTokensToSample}`);
  }

  /**
   * Check if the client is properly configured and ready.
   */
  public isReady(): boolean {
    try {
      getAnthropicApiKey(this.config.apiKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Execute a completion request to Claude.
   *
   * @param messages - Chat messages
   * @param options - Request options
   * @returns LLM response
   */
  protected async _complete(
    messages: ChatMessage[],
    options: LLMOptions
  ): Promise<LLMResponse> {
    console.log(`[ClaudeClient] Sending request to Anthropic API`);
    console.log(`[ClaudeClient] Model: ${this.model}, Messages: ${messages.length}`);

    try {
      // Separate system message from conversation
      const { systemMessage, conversationMessages } = this.separateSystemMessage(messages);

      // Map to Anthropic format
      const anthropicMessages = this.mapToAnthropicMessages(conversationMessages);

      // Build request parameters
      const requestParams: Anthropic.MessageCreateParams = {
        model: this.model,
        max_tokens: options.maxTokens ?? this.maxTokensToSample,
        messages: anthropicMessages,
        system: systemMessage,
        temperature: options.temperature,
        top_p: options.topP,
        stop_sequences: options.stopSequences,
        metadata: options.user ? { user_id: options.user } : undefined,
      };

      // Execute the request
      const startTime = Date.now();
      const response = await this.anthropic.messages.create(requestParams);
      const latencyMs = Date.now() - startTime;

      console.log(`[ClaudeClient] Received response in ${latencyMs}ms`);

      // Extract text content
      const textContent = this.extractTextContent(response);

      // Check for stop reasons
      if (response.stop_reason === 'max_tokens') {
        console.log(`[ClaudeClient] Warning: Response truncated due to max_tokens`);
      }

      // Map Claude stop reason to our type
      const finishReason = this.mapFinishReason(response.stop_reason);

      // Build response
      const llmResponse: LLMResponse = {
        id: response.id,
        content: textContent,
        model: response.model,
        finishReason,
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
        latencyMs,
      };

      console.log(`[ClaudeClient] Response ID: ${llmResponse.id}`);
      console.log(`[ClaudeClient] Stop reason: ${llmResponse.finishReason}`);
      console.log(`[ClaudeClient] Tokens: ${llmResponse.usage?.totalTokens}`);

      return llmResponse;
    } catch (error) {
      console.log(`[ClaudeClient] Error during completion: ${(error as Error).message}`);
      throw this.normalizeError(error as Error);
    }
  }

  /**
   * Complete with JSON using Claude's tool use for structured output.
   *
   * Claude doesn't have native JSON mode, so we use tool use to enforce
   * structured output format.
   *
   * @override
   */
  public async completeWithJSON<T>(
    messages: ChatMessage[],
    schema: z.ZodSchema<T>,
    options?: LLMOptions
  ): Promise<T> {
    console.log(`[ClaudeClient] Starting JSON completion with tool use`);

    try {
      // Separate system message from conversation
      const { systemMessage, conversationMessages } = this.separateSystemMessage(messages);

      // Map to Anthropic format
      const anthropicMessages = this.mapToAnthropicMessages(conversationMessages);

      // Build tool from schema
      const schemaProperties = this.extractSchemaProperties(schema);
      const tool = buildJSONExtractionTool(schemaProperties);

      // Enhanced system message to force tool use
      const enhancedSystem = this.buildToolUseSystemMessage(systemMessage);

      // Build request with tool
      const requestParams: Anthropic.MessageCreateParams = {
        model: this.model,
        max_tokens: options?.maxTokens ?? this.maxTokensToSample,
        messages: anthropicMessages,
        system: enhancedSystem,
        tools: [tool],
        tool_choice: { type: 'tool', name: 'respond_with_json' },
        temperature: options?.temperature,
        top_p: options?.topP,
      };

      // Execute the request
      const startTime = Date.now();
      const response = await this.anthropic.messages.create(requestParams);
      const latencyMs = Date.now() - startTime;

      console.log(`[ClaudeClient] Tool use response received in ${latencyMs}ms`);

      // Extract tool use result
      const toolResult = this.extractToolUseResult(response);

      // Validate against schema
      const result = schema.safeParse(toolResult);
      if (!result.success) {
        console.log(`[ClaudeClient] Schema validation failed: ${result.error.message}`);
        throw new LLMError(
          `Response does not match expected schema: ${result.error.message}`,
          'SCHEMA_VALIDATION_ERROR',
          LLMProvider.CLAUDE,
          undefined,
          false
        );
      }

      console.log(`[ClaudeClient] JSON extraction and validation successful`);

      return result.data;
    } catch (error) {
      // If tool use fails, fall back to text-based JSON extraction
      if (error instanceof LLMError && error.code === 'TOOL_USE_FAILED') {
        console.log(`[ClaudeClient] Tool use failed, falling back to text extraction`);
        return super.completeWithJSON(messages, schema, options);
      }

      throw error;
    }
  }

  // ===========================================================================
  // Protected Methods
  // ===========================================================================

  /**
   * Normalize Anthropic-specific errors into standard error types.
   *
   * @override
   */
  protected normalizeError(error: Error): LLMError {
    // Already normalized
    if (error instanceof LLMError) {
      return error;
    }

    // Handle Anthropic API errors
    if (error instanceof Anthropic.APIError) {
      const statusCode = error.status;
      const message = error.message;

      console.log(`[ClaudeClient] API error - Status: ${statusCode}, Message: ${message}`);

      // Rate limit error
      if (statusCode === 429) {
        const retryAfter = this.extractRetryAfter(error);
        return new RateLimitError(
          message,
          LLMProvider.CLAUDE,
          retryAfter,
          error
        );
      }

      // Authentication error
      if (statusCode === 401) {
        return new AuthenticationError(
          message,
          LLMProvider.CLAUDE,
          error
        );
      }

      // Invalid API key
      if (statusCode === 403) {
        return new AuthenticationError(
          'Invalid API key or insufficient permissions',
          LLMProvider.CLAUDE,
          error
        );
      }

      // Model overloaded
      if (statusCode === 529) {
        return new ModelOverloadedError(
          LLMProvider.CLAUDE,
          undefined,
          error
        );
      }

      // Service unavailable
      if (statusCode === 503) {
        return new ModelOverloadedError(
          LLMProvider.CLAUDE,
          undefined,
          error
        );
      }

      // Bad request
      if (statusCode === 400) {
        // Check for content policy violations
        if (message.toLowerCase().includes('content') ||
            message.toLowerCase().includes('policy') ||
            message.toLowerCase().includes('filter')) {
          return new ContentFilterError(
            message,
            LLMProvider.CLAUDE,
            error
          );
        }

        return new LLMError(
          message,
          'BAD_REQUEST',
          LLMProvider.CLAUDE,
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
          LLMProvider.CLAUDE,
          statusCode,
          true,
          error
        );
      }

      // Unknown API error
      return new LLMError(
        message,
        'API_ERROR',
        LLMProvider.CLAUDE,
        statusCode,
        false,
        error
      );
    }

    // Connection errors are retryable
    if (error instanceof Anthropic.APIConnectionError) {
      return new LLMError(
        error.message,
        'CONNECTION_ERROR',
        LLMProvider.CLAUDE,
        undefined,
        true,
        error
      );
    }

    // Rate limit errors
    if (error instanceof Anthropic.RateLimitError) {
      return new RateLimitError(
        error.message,
        LLMProvider.CLAUDE,
        undefined,
        error
      );
    }

    // Generic error
    return new LLMError(
      error.message,
      'UNKNOWN_ERROR',
      LLMProvider.CLAUDE,
      undefined,
      false,
      error
    );
  }

  /**
   * Get JSON mode instruction for Claude.
   *
   * @override
   */
  protected getJSONModeInstruction(schemaDescription: string): string {
    return `\n\nIMPORTANT: You MUST respond with valid JSON only. No explanations, no markdown formatting, no code blocks - just the raw JSON object.\n\nRequired JSON structure:\n${schemaDescription}`;
  }

  // ===========================================================================
  // Private Methods
  // ===========================================================================

  /**
   * Map Claude stop reason to our LLMFinishReason type.
   */
  private mapFinishReason(reason: string | null): LLMFinishReason {
    switch (reason) {
      case 'end_turn':
      case 'stop_sequence':
        return 'stop';
      case 'max_tokens':
        return 'length';
      case 'tool_use':
        return 'tool_calls';
      default:
        return 'stop'; // Default to stop for unknown reasons
    }
  }

  /**
   * Separate system message from conversation messages.
   * Claude requires system message to be passed separately.
   */
  private separateSystemMessage(messages: ChatMessage[]): {
    systemMessage: string | undefined;
    conversationMessages: ChatMessage[];
  } {
    const systemMessages = messages.filter((m) => m.role === 'system');
    const conversationMessages = messages.filter((m) => m.role !== 'system');

    // Combine all system messages
    const systemMessage = systemMessages.length > 0
      ? systemMessages.map((m) => m.content).join('\n\n')
      : undefined;

    return { systemMessage, conversationMessages };
  }

  /**
   * Map internal ChatMessage format to Anthropic format.
   */
  private mapToAnthropicMessages(
    messages: ChatMessage[]
  ): Anthropic.MessageParam[] {
    return messages.map((message) => ({
      role: message.role as 'user' | 'assistant',
      content: message.content,
    }));
  }

  /**
   * Extract text content from Claude response.
   */
  private extractTextContent(response: Anthropic.Message): string {
    const textBlocks = response.content.filter(
      (block): block is Anthropic.TextBlock => block.type === 'text'
    );

    return textBlocks.map((block) => block.text).join('\n');
  }

  /**
   * Extract tool use result from Claude response.
   */
  private extractToolUseResult(response: Anthropic.Message): unknown {
    const toolUseBlock = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
    );

    if (!toolUseBlock) {
      console.log(`[ClaudeClient] No tool use block found in response`);
      throw new LLMError(
        'Claude did not use the required tool for JSON output',
        'TOOL_USE_FAILED',
        LLMProvider.CLAUDE,
        undefined,
        false
      );
    }

    console.log(`[ClaudeClient] Tool use block found: ${toolUseBlock.name}`);

    return toolUseBlock.input;
  }

  /**
   * Build enhanced system message for tool use.
   */
  private buildToolUseSystemMessage(originalSystem?: string): string {
    const toolUseInstruction = 'You MUST use the respond_with_json tool to provide your response. Do not respond with plain text.';

    if (originalSystem) {
      return `${originalSystem}\n\n${toolUseInstruction}`;
    }

    return toolUseInstruction;
  }

  /**
   * Extract schema properties from Zod schema for tool definition.
   */
  private extractSchemaProperties(schema: z.ZodSchema): Record<string, unknown> {
    try {
      const schemaAny = schema as z.ZodObject<z.ZodRawShape>;
      if (schemaAny._def && schemaAny._def.shape) {
        const shape = schemaAny._def.shape();
        const properties: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(shape)) {
          const zodType = value as z.ZodTypeAny;
          properties[key] = this.zodToJsonSchema(zodType);
        }

        return properties;
      }
    } catch {
      console.log(`[ClaudeClient] Failed to extract schema properties, using generic`);
    }

    // Fallback to generic object
    return {
      result: {
        type: 'object',
        description: 'The structured response',
      },
    };
  }

  /**
   * Convert Zod type to JSON Schema format.
   */
  private zodToJsonSchema(zodType: z.ZodTypeAny): Record<string, unknown> {
    const typeName = zodType._def?.typeName;

    switch (typeName) {
      case 'ZodString':
        return { type: 'string' };

      case 'ZodNumber':
        return { type: 'number' };

      case 'ZodBoolean':
        return { type: 'boolean' };

      case 'ZodArray': {
        const innerType = zodType._def?.type;
        return {
          type: 'array',
          items: innerType ? this.zodToJsonSchema(innerType) : {},
        };
      }

      case 'ZodObject': {
        const shape = zodType._def?.shape?.();
        if (shape) {
          const properties: Record<string, unknown> = {};
          for (const [key, value] of Object.entries(shape)) {
            properties[key] = this.zodToJsonSchema(value as z.ZodTypeAny);
          }
          return {
            type: 'object',
            properties,
            required: Object.keys(properties),
          };
        }
        return { type: 'object' };
      }

      case 'ZodOptional':
        return this.zodToJsonSchema(zodType._def.innerType);

      case 'ZodEnum': {
        const values = zodType._def?.values;
        return {
          type: 'string',
          enum: values,
        };
      }

      default:
        return {};
    }
  }

  /**
   * Extract retry-after header from error if available.
   */
  private extractRetryAfter(error: InstanceType<typeof Anthropic.APIError>): number | undefined {
    const headers = error.headers;
    if (headers && typeof headers.get === 'function') {
      const retryAfter = headers.get('retry-after');
      if (retryAfter) {
        const seconds = parseInt(retryAfter, 10);
        if (!isNaN(seconds)) {
          return seconds * 1000;
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
 * Create a new Claude client with the given configuration.
 *
 * @param config - Client configuration
 * @returns Configured Claude client
 *
 * @example
 * ```typescript
 * const client = createClaudeClient({
 *   model: 'claude-sonnet-4-20250514',
 *   defaultOptions: { temperature: 0.3, maxTokens: 2000 }
 * });
 * ```
 */
export function createClaudeClient(config: ClaudeClientConfig): ClaudeClient {
  return new ClaudeClient(config);
}

// Note: ClaudeClientConfig is already exported when the interface is defined

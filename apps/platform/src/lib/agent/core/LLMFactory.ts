/**
 * LLM Factory - Factory functions for creating LLM clients
 *
 * This module provides factory functions and utilities for creating
 * LLM clients based on provider configuration. It supports:
 * - Dynamic client creation based on provider type
 * - Environment-based default configuration
 * - Client validation and readiness checks
 *
 * @module LLMFactory
 */

import type { ILLMClient, LLMClientConfig } from './LLMClient';
import { OpenAIClient, type OpenAIClientConfig } from './OpenAIClient';
import { ClaudeClient, type ClaudeClientConfig } from './ClaudeClient';
import { LLMProvider, LLMError } from '../types/agent.types';
import type {
  LLMModel,
  OpenAIModel,
  ClaudeModel,
  LLMOptions,
} from '../types/agent.types';

// =============================================================================
// Factory Configuration Types
// =============================================================================

/**
 * Configuration for creating an LLM client via the factory
 */
export interface LLMFactoryConfig {
  /** LLM provider to use */
  provider: LLMProvider;
  /** Model identifier */
  model: LLMModel;
  /** API key (defaults to environment variable) */
  apiKey?: string;
  /** Default options for all requests */
  defaultOptions?: LLMOptions;
  /** Maximum retries for failed requests */
  maxRetries?: number;
  /** Base delay for exponential backoff (ms) */
  retryBaseDelay?: number;
  /** Organization ID (for OpenAI) */
  organizationId?: string;
  /** Base URL override (for proxies or custom endpoints) */
  baseUrl?: string;
  /** Enable JSON mode (for OpenAI) */
  jsonMode?: boolean;
  /** Max tokens to sample (for Claude) */
  maxTokensToSample?: number;
}

/**
 * Environment configuration for LLM factory
 */
export interface LLMEnvironmentConfig {
  /** Default provider if not specified */
  defaultProvider: LLMProvider;
  /** Default models per provider */
  defaultModels: Record<LLMProvider, OpenAIModel | ClaudeModel>;
  /** Default options */
  defaultOptions: LLMOptions;
}

// =============================================================================
// Environment Defaults
// =============================================================================

/**
 * Get environment configuration with sensible defaults
 */
function getEnvironmentConfig(): LLMEnvironmentConfig {
  const envProvider = process.env.AGENT_DEFAULT_PROVIDER?.toUpperCase();
  const defaultProvider = envProvider === 'OPENAI' ? LLMProvider.OPENAI : LLMProvider.CLAUDE;

  return {
    defaultProvider,
    defaultModels: {
      [LLMProvider.OPENAI]: (process.env.AGENT_DEFAULT_OPENAI_MODEL as OpenAIModel) || 'gpt-4-turbo',
      [LLMProvider.CLAUDE]: (process.env.AGENT_DEFAULT_CLAUDE_MODEL as ClaudeModel) || 'claude-sonnet-4-20250514',
    },
    defaultOptions: {
      temperature: parseFloat(process.env.AGENT_DEFAULT_TEMPERATURE || '0.3'),
      maxTokens: parseInt(process.env.AGENT_DEFAULT_MAX_TOKENS || '2000', 10),
      timeout: parseInt(process.env.AGENT_DEFAULT_TIMEOUT || '30000', 10),
    },
  };
}

/**
 * Model mapping for validation
 */
const OPENAI_MODELS: OpenAIModel[] = [
  'gpt-4',
  'gpt-4-turbo',
  'gpt-4-turbo-preview',
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-3.5-turbo',
];

const CLAUDE_MODELS: ClaudeModel[] = [
  'claude-3-opus-20240229',
  'claude-3-sonnet-20240229',
  'claude-3-haiku-20240307',
  'claude-sonnet-4-20250514',
  'claude-3-5-sonnet-20241022',
];

// =============================================================================
// Validation Functions
// =============================================================================

/**
 * Check if a model is a valid OpenAI model
 */
export function isOpenAIModel(model: string): model is OpenAIModel {
  return OPENAI_MODELS.includes(model as OpenAIModel);
}

/**
 * Check if a model is a valid Claude model
 */
export function isClaudeModel(model: string): model is ClaudeModel {
  return CLAUDE_MODELS.includes(model as ClaudeModel);
}

/**
 * Validate provider and model compatibility
 */
function validateProviderModel(provider: LLMProvider, model: LLMModel): void {
  if (provider === LLMProvider.OPENAI && !isOpenAIModel(model)) {
    throw new LLMError(
      `Model '${model}' is not a valid OpenAI model. Valid models: ${OPENAI_MODELS.join(', ')}`,
      'INVALID_MODEL',
      provider,
      400,
      false
    );
  }

  if (provider === LLMProvider.CLAUDE && !isClaudeModel(model)) {
    throw new LLMError(
      `Model '${model}' is not a valid Claude model. Valid models: ${CLAUDE_MODELS.join(', ')}`,
      'INVALID_MODEL',
      provider,
      400,
      false
    );
  }
}

/**
 * Check if API key is available for a provider
 */
export function hasAPIKey(provider: LLMProvider): boolean {
  if (provider === LLMProvider.OPENAI) {
    return !!process.env.OPENAI_API_KEY;
  }

  if (provider === LLMProvider.CLAUDE) {
    return !!process.env.ANTHROPIC_API_KEY;
  }

  return false;
}

// =============================================================================
// Factory Functions
// =============================================================================

/**
 * Create an LLM client based on provider configuration.
 *
 * This is the primary factory function for creating LLM clients. It:
 * - Validates the provider and model combination
 * - Applies environment defaults where configuration is missing
 * - Creates the appropriate client instance
 *
 * @param config - Factory configuration
 * @returns Configured LLM client
 * @throws {LLMError} If provider/model combination is invalid
 * @throws {APIKeyError} If required API key is not configured
 *
 * @example
 * ```typescript
 * // Create with explicit configuration
 * const client = createLLMClient({
 *   provider: 'openai',
 *   model: 'gpt-4-turbo',
 *   defaultOptions: { temperature: 0.3 }
 * });
 *
 * // Create with minimal config (uses environment defaults)
 * const defaultClient = createLLMClient({
 *   provider: 'claude',
 *   model: 'claude-sonnet-4-20250514'
 * });
 * ```
 */
export function createLLMClient(config: LLMFactoryConfig): ILLMClient {
  console.log(`[LLMFactory] Creating ${config.provider} client with model: ${config.model}`);

  // Validate provider and model
  validateProviderModel(config.provider, config.model);

  // Get environment defaults
  const envConfig = getEnvironmentConfig();

  // Merge options with defaults
  const mergedOptions: LLMOptions = {
    ...envConfig.defaultOptions,
    ...config.defaultOptions,
  };

  // Create appropriate client
  if (config.provider === LLMProvider.OPENAI) {
    const openaiConfig: OpenAIClientConfig = {
      model: config.model as OpenAIModel,
      apiKey: config.apiKey,
      defaultOptions: mergedOptions,
      maxRetries: config.maxRetries,
      retryBaseDelay: config.retryBaseDelay,
      organizationId: config.organizationId,
      baseUrl: config.baseUrl,
      jsonMode: config.jsonMode,
    };

    console.log(`[LLMFactory] Creating OpenAI client`);
    return new OpenAIClient(openaiConfig);
  }

  if (config.provider === LLMProvider.CLAUDE) {
    const claudeConfig: ClaudeClientConfig = {
      model: config.model as ClaudeModel,
      apiKey: config.apiKey,
      defaultOptions: mergedOptions,
      maxRetries: config.maxRetries,
      retryBaseDelay: config.retryBaseDelay,
      baseUrl: config.baseUrl,
      maxTokensToSample: config.maxTokensToSample,
    };

    console.log(`[LLMFactory] Creating Claude client`);
    return new ClaudeClient(claudeConfig);
  }

  // This should never happen due to TypeScript, but handle it anyway
  throw new LLMError(
    `Unknown provider: ${config.provider}`,
    'INVALID_PROVIDER',
    config.provider,
    400,
    false
  );
}

/**
 * Create a client using environment defaults.
 *
 * This function creates a client using the default provider and model
 * from environment variables. Useful for quick setup.
 *
 * @param options - Optional overrides for default options
 * @returns Configured LLM client
 *
 * @example
 * ```typescript
 * // Uses AGENT_DEFAULT_PROVIDER and corresponding model
 * const client = createDefaultClient();
 *
 * // Override default options
 * const customClient = createDefaultClient({ temperature: 0.7 });
 * ```
 */
export function createDefaultClient(options?: LLMOptions): ILLMClient {
  const envConfig = getEnvironmentConfig();
  const provider = envConfig.defaultProvider;
  const model = envConfig.defaultModels[provider];

  console.log(`[LLMFactory] Creating default client: ${provider}/${model}`);

  return createLLMClient({
    provider,
    model,
    defaultOptions: options,
  });
}

/**
 * Create an OpenAI client with sensible defaults.
 *
 * Convenience function for creating an OpenAI client with minimal configuration.
 *
 * @param model - OpenAI model to use (defaults to gpt-4-turbo)
 * @param options - Optional configuration overrides
 * @returns Configured OpenAI client
 *
 * @example
 * ```typescript
 * const client = createOpenAI('gpt-4o');
 * const response = await client.complete([
 *   { role: 'user', content: 'Hello!' }
 * ]);
 * ```
 */
export function createOpenAI(
  model: OpenAIModel = 'gpt-4-turbo',
  options?: Partial<OpenAIClientConfig>
): ILLMClient {
  console.log(`[LLMFactory] Creating OpenAI client with model: ${model}`);

  return createLLMClient({
    provider: LLMProvider.OPENAI,
    model,
    ...options,
  });
}

/**
 * Create a Claude client with sensible defaults.
 *
 * Convenience function for creating a Claude client with minimal configuration.
 *
 * @param model - Claude model to use (defaults to claude-sonnet-4-20250514)
 * @param options - Optional configuration overrides
 * @returns Configured Claude client
 *
 * @example
 * ```typescript
 * const client = createClaude('claude-sonnet-4-20250514');
 * const response = await client.complete([
 *   { role: 'user', content: 'Hello!' }
 * ]);
 * ```
 */
export function createClaude(
  model: ClaudeModel = 'claude-sonnet-4-20250514',
  options?: Partial<ClaudeClientConfig>
): ILLMClient {
  console.log(`[LLMFactory] Creating Claude client with model: ${model}`);

  return createLLMClient({
    provider: LLMProvider.CLAUDE,
    model,
    ...options,
  });
}

// =============================================================================
// Client Pool / Singleton Management
// =============================================================================

/**
 * Cache of created clients for reuse
 */
const clientCache = new Map<string, ILLMClient>();

/**
 * Generate a cache key for a client configuration
 */
function getCacheKey(config: LLMFactoryConfig): string {
  return `${config.provider}:${config.model}:${config.apiKey || 'default'}`;
}

/**
 * Get or create a cached client.
 *
 * This function maintains a cache of created clients to avoid
 * recreating clients for the same configuration.
 *
 * @param config - Factory configuration
 * @returns Cached or newly created client
 *
 * @example
 * ```typescript
 * // First call creates the client
 * const client1 = getOrCreateClient({ provider: 'openai', model: 'gpt-4' });
 *
 * // Second call returns the cached client
 * const client2 = getOrCreateClient({ provider: 'openai', model: 'gpt-4' });
 *
 * console.log(client1 === client2); // true
 * ```
 */
export function getOrCreateClient(config: LLMFactoryConfig): ILLMClient {
  const cacheKey = getCacheKey(config);

  const cached = clientCache.get(cacheKey);
  if (cached) {
    console.log(`[LLMFactory] Returning cached client for: ${cacheKey}`);
    return cached;
  }

  console.log(`[LLMFactory] Creating new client for: ${cacheKey}`);
  const client = createLLMClient(config);
  clientCache.set(cacheKey, client);

  return client;
}

/**
 * Clear the client cache.
 *
 * Useful for testing or when API keys change.
 */
export function clearClientCache(): void {
  console.log(`[LLMFactory] Clearing client cache (${clientCache.size} clients)`);
  clientCache.clear();
}

/**
 * Get the number of cached clients.
 */
export function getCacheSize(): number {
  return clientCache.size;
}

// =============================================================================
// Health Check Utilities
// =============================================================================

/**
 * Result of a provider health check
 */
export interface ProviderHealthCheck {
  provider: LLMProvider;
  available: boolean;
  hasApiKey: boolean;
  error?: string;
}

/**
 * Check health of a specific provider.
 *
 * @param provider - Provider to check
 * @returns Health check result
 */
export async function checkProviderHealth(
  provider: LLMProvider
): Promise<ProviderHealthCheck> {
  console.log(`[LLMFactory] Checking health for provider: ${provider}`);

  const result: ProviderHealthCheck = {
    provider,
    available: false,
    hasApiKey: hasAPIKey(provider),
  };

  if (!result.hasApiKey) {
    result.error = `API key not configured for ${provider}`;
    return result;
  }

  try {
    const envConfig = getEnvironmentConfig();
    const model = envConfig.defaultModels[provider];

    const client = createLLMClient({ provider, model });

    if (!client.isReady()) {
      result.error = 'Client is not ready';
      return result;
    }

    result.available = true;
    console.log(`[LLMFactory] Provider ${provider} is healthy`);
  } catch (error) {
    result.error = (error as Error).message;
    console.log(`[LLMFactory] Provider ${provider} health check failed: ${result.error}`);
  }

  return result;
}

/**
 * Check health of all providers.
 *
 * @returns Array of health check results
 */
export async function checkAllProvidersHealth(): Promise<ProviderHealthCheck[]> {
  const providers: LLMProvider[] = [LLMProvider.OPENAI, LLMProvider.CLAUDE];
  const results = await Promise.all(providers.map(checkProviderHealth));
  return results;
}

/**
 * Get the first available provider.
 *
 * Useful for fallback scenarios.
 *
 * @param preferredOrder - Preferred order of providers
 * @returns First available provider or null
 */
export async function getFirstAvailableProvider(
  preferredOrder: LLMProvider[] = [LLMProvider.CLAUDE, LLMProvider.OPENAI]
): Promise<LLMProvider | null> {
  for (const provider of preferredOrder) {
    const health = await checkProviderHealth(provider);
    if (health.available) {
      console.log(`[LLMFactory] First available provider: ${provider}`);
      return provider;
    }
  }

  console.log(`[LLMFactory] No available providers found`);
  return null;
}

// =============================================================================
// Exports
// =============================================================================

export {
  OPENAI_MODELS,
  CLAUDE_MODELS,
  getEnvironmentConfig,
};

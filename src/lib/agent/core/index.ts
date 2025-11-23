/**
 * Agent Core - Orchestration Agent System
 *
 * This module exports the core components of the Orchestration Agent system:
 * - LLM Client abstraction (OpenAI & Claude)
 * - DecisionEngine for processing LLM responses
 * - ActionExecutor for executing agent actions
 * - OrchestrationAgent for coordinating all components
 *
 * @module agent/core
 *
 * @example
 * ```typescript
 * import {
 *   OrchestrationAgent,
 *   createOrchestrationAgent,
 *   createLLMClient,
 *   DecisionEngine,
 *   ActionExecutor,
 *   type ILLMClient,
 *   type AgentStats,
 * } from '@/lib/agent/core';
 *
 * // Create and start the orchestration agent
 * const agent = createOrchestrationAgent({
 *   orgId: 'org-123',
 *   llmProvider: LLMProvider.CLAUDE,
 *   llmModel: 'claude-sonnet-4-20250514',
 *   autoExecuteThreshold: 0.85,
 *   requireApprovalThreshold: 0.5,
 *   enabledActions: Object.values(DecisionType),
 *   escalationEmail: 'admin@example.com',
 * });
 *
 * agent.start();
 *
 * // Process an input
 * const result = await agent.process({
 *   source: AgentInputSource.WEBHOOK,
 *   type: 'form_submitted',
 *   rawContent: 'Customer inquiry...',
 *   timestamp: new Date(),
 * });
 *
 * // Or create individual components
 * const client = createLLMClient({
 *   provider: LLMProvider.CLAUDE,
 *   model: 'claude-sonnet-4-20250514',
 * });
 * ```
 */

// =============================================================================
// Base Client
// =============================================================================

export {
  BaseLLMClient,
  type ILLMClient,
  type RateLimitStatus,
  type LLMClientConfig,
  type LLMOptions,
  type LLMResponse,
  type ChatMessage,
} from './LLMClient';

// =============================================================================
// Provider Implementations
// =============================================================================

export {
  OpenAIClient,
  createOpenAIClient,
  type OpenAIClientConfig,
} from './OpenAIClient';

export {
  ClaudeClient,
  createClaudeClient,
  type ClaudeClientConfig,
} from './ClaudeClient';

// =============================================================================
// Factory Functions
// =============================================================================

export {
  createLLMClient,
  createDefaultClient,
  createOpenAI,
  createClaude,
  getOrCreateClient,
  clearClientCache,
  getCacheSize,
  checkProviderHealth,
  checkAllProvidersHealth,
  getFirstAvailableProvider,
  isOpenAIModel,
  isClaudeModel,
  hasAPIKey,
  OPENAI_MODELS,
  CLAUDE_MODELS,
  getEnvironmentConfig,
  type LLMFactoryConfig,
  type LLMEnvironmentConfig,
  type ProviderHealthCheck,
} from './LLMFactory';

// =============================================================================
// Re-export Types from agent.types
// =============================================================================

export {
  LLMProvider,
  LLMError,
  RateLimitError,
  AuthenticationError,
  APIKeyError,
  ValidationError,
  TimeoutError,
  ContentFilterError,
  ModelOverloadedError,
  DEFAULT_LLM_OPTIONS,
  DEFAULT_CLIENT_CONFIG,
  ChatMessageSchema,
} from '../types/agent.types';

export type {
  LLMModel,
  OpenAIModel,
  ClaudeModel,
  ChatMessageRole,
  TokenUsage,
  LLMFinishReason,
} from '../types/agent.types';

// =============================================================================
// Decision Engine
// =============================================================================

export {
  DecisionEngine,
  createDecisionEngine,
  type DecisionEngineConfig,
  type ValidationResult,
  type FallbackDecision,
} from './DecisionEngine';

// =============================================================================
// Action Executor
// =============================================================================

export {
  ActionExecutor,
  createActionExecutor,
  type ActionExecutorConfig,
  type ActionHandler,
  type ActionHandlerResult,
  type ActionExecutionContext,
} from './ActionExecutor';

// =============================================================================
// Orchestration Agent
// =============================================================================

export {
  OrchestrationAgent,
  createOrchestrationAgent,
  type OrchestrationAgentConfig,
  type AgentStats,
  type PendingDecision,
  type DecisionRecord,
} from './OrchestrationAgent';

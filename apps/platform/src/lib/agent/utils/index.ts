/**
 * Agent Utilities
 *
 * Factory functions and system management utilities for the Orchestration Agent.
 *
 * @module agent/utils
 * @version 1.0.0
 */

import {
  OrchestrationAgent,
  createOrchestrationAgent,
  type OrchestrationAgentConfig,
} from '../core';
import {
  AgentEventBus,
  WebhookInputHandler,
  EmailInputHandler,
  DBTriggerHandler,
  WorkerEventHandler,
  createWebhookHandler,
} from '../inputs';
import {
  PipelineAssigner,
  CalendarManager,
  notificationDispatcher,
  AutomationTrigger,
  createPipelineAssigner,
  createCalendarManager,
  createAutomationTrigger,
} from '../actions';
import {
  LLMProvider,
  DecisionType,
  type Logger,
} from '../types';

// Declare process for environments where it may not exist
declare const process: { env?: { NODE_ENV?: string; [key: string]: string | undefined } } | undefined;

// =============================================================================
// TYPES
// =============================================================================

/**
 * Options for creating an agent for a specific organization.
 */
export interface AgentFactoryOptions {
  /** LLM provider to use (defaults to CLAUDE) */
  llmProvider?: LLMProvider;
  /** Specific LLM model to use */
  llmModel?: string;
  /** Temperature for LLM responses (0.0-1.0) */
  temperature?: number;
  /** Maximum tokens for LLM responses */
  maxTokens?: number;
  /** Confidence threshold above which decisions execute automatically */
  autoExecuteThreshold?: number;
  /** Confidence threshold below which human approval is required */
  requireApprovalThreshold?: number;
  /** Enabled action types for this agent */
  enabledActions?: DecisionType[];
  /** Email address for escalations */
  escalationEmail?: string;
  /** Whether to notify on high-priority items */
  notifyOnHighPriority?: boolean;
  /** Whether to notify on failures */
  notifyOnFailure?: boolean;
  /** Maximum actions per minute */
  maxActionsPerMinute?: number;
  /** Maximum actions per hour */
  maxActionsPerHour?: number;
  /** Custom system prompt */
  systemPrompt?: string;
  /** Custom logger instance */
  logger?: Logger;
}

/**
 * Options for initializing the agent system.
 */
export interface AgentSystemOptions {
  /** Enable webhook input handling */
  enableWebhooks?: boolean;
  /** Enable email input handling */
  enableEmail?: boolean;
  /** Enable database trigger handling */
  enableDBTriggers?: boolean;
  /** Enable worker event handling */
  enableWorkerEvents?: boolean;
  /** Custom event bus configuration */
  eventBusConfig?: {
    historySize?: number;
    debug?: boolean;
    defaultOrgId?: string;
  };
  /** Custom logger instance */
  logger?: Logger;
}

/**
 * State of the initialized agent system.
 */
interface AgentSystemState {
  eventBus: AgentEventBus;
  handlers: {
    webhook?: WebhookInputHandler;
    email?: EmailInputHandler;
    dbTrigger?: DBTriggerHandler;
    workerEvent?: WorkerEventHandler;
  };
  actions: {
    pipelineAssigner?: PipelineAssigner;
    calendarManager?: CalendarManager;
    notificationDispatcher?: typeof notificationDispatcher;
    automationTrigger?: AutomationTrigger;
  };
  initialized: boolean;
}

// =============================================================================
// MODULE STATE
// =============================================================================

/**
 * Map of organization IDs to their agent instances.
 */
const agentInstances = new Map<string, OrchestrationAgent>();

/**
 * Global system state.
 */
let systemState: AgentSystemState | null = null;

/**
 * Default logger implementation.
 */
const defaultLogger: Logger = {
  debug: (message: string, data?: Record<string, unknown>) => {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      console.debug(`[Agent] ${message}`, data || '');
    }
  },
  info: (message: string, data?: Record<string, unknown>) => {
    console.info(`[Agent] ${message}`, data || '');
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    console.warn(`[Agent] ${message}`, data || '');
  },
  error: (message: string, error?: Error | unknown, data?: Record<string, unknown>) => {
    console.error(`[Agent] ${message}`, error, data || '');
  },
};

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

/**
 * Create a configured OrchestrationAgent for a specific organization.
 *
 * This is the primary factory function for creating agent instances.
 * It handles all configuration with sensible defaults.
 *
 * @param orgId - The organization ID this agent belongs to
 * @param options - Configuration options
 * @returns A configured OrchestrationAgent instance
 *
 * @example
 * ```typescript
 * // Create agent with defaults
 * const agent = createAgentForOrg('org-123');
 *
 * // Create agent with custom configuration
 * const agent = createAgentForOrg('org-123', {
 *   llmProvider: LLMProvider.OPENAI,
 *   llmModel: 'gpt-4-turbo',
 *   autoExecuteThreshold: 0.9,
 *   enabledActions: [DecisionType.ASSIGN_PIPELINE, DecisionType.SEND_NOTIFICATION],
 * });
 *
 * // Start the agent
 * agent.start();
 *
 * // Process an input
 * const result = await agent.process(input);
 * ```
 */
export function createAgentForOrg(
  orgId: string,
  options: AgentFactoryOptions = {}
): OrchestrationAgent {
  const {
    llmProvider = LLMProvider.CLAUDE,
    llmModel = llmProvider === LLMProvider.CLAUDE
      ? 'claude-sonnet-4-20250514'
      : 'gpt-4-turbo',
    temperature = 0.3,
    maxTokens = 2000,
    autoExecuteThreshold = 0.85,
    requireApprovalThreshold = 0.5,
    enabledActions = Object.values(DecisionType),
    escalationEmail = getEnvVar('AGENT_ESCALATION_EMAIL', 'admin@localhost'),
    notifyOnHighPriority = true,
    notifyOnFailure = true,
    maxActionsPerMinute = 60,
    maxActionsPerHour = 500,
    systemPrompt,
    logger = defaultLogger,
  } = options;

  const config: OrchestrationAgentConfig = {
    orgId,
    llmProvider,
    llmModel,
    temperature,
    maxTokens,
    autoExecuteThreshold,
    requireApprovalThreshold,
    enabledActions,
    escalationEmail,
    notifyOnHighPriority,
    notifyOnFailure,
    maxActionsPerMinute,
    maxActionsPerHour,
    systemPrompt,
    logger,
  };

  logger.info('Creating agent for organization', { orgId, llmProvider, llmModel });

  return createOrchestrationAgent(config);
}

/**
 * Get an existing agent instance or create a new one for the organization.
 *
 * This function maintains a singleton pattern per organization ID,
 * ensuring only one agent instance exists per organization.
 *
 * @param orgId - The organization ID
 * @param options - Configuration options (only used if creating new instance)
 * @returns The OrchestrationAgent instance for this organization
 *
 * @example
 * ```typescript
 * // Get or create agent (first call creates, subsequent calls return same instance)
 * const agent = getAgentInstance('org-123');
 *
 * // Force options on first creation
 * const agent = getAgentInstance('org-123', {
 *   llmProvider: LLMProvider.OPENAI,
 * });
 *
 * // Later calls return the same instance regardless of options
 * const sameAgent = getAgentInstance('org-123'); // Same instance
 * ```
 */
export function getAgentInstance(
  orgId: string,
  options?: AgentFactoryOptions
): OrchestrationAgent {
  let agent = agentInstances.get(orgId);

  if (!agent) {
    agent = createAgentForOrg(orgId, options);
    agentInstances.set(orgId, agent);
  }

  return agent;
}

/**
 * Remove an agent instance for an organization.
 *
 * This stops the agent and removes it from the instance cache.
 *
 * @param orgId - The organization ID
 * @returns True if an instance was removed, false otherwise
 *
 * @example
 * ```typescript
 * // Clean up agent when organization is deleted
 * const removed = removeAgentInstance('org-123');
 * ```
 */
export function removeAgentInstance(orgId: string): boolean {
  const agent = agentInstances.get(orgId);

  if (agent) {
    agent.stop();
    agentInstances.delete(orgId);
    return true;
  }

  return false;
}

/**
 * Get all active agent instances.
 *
 * @returns Map of organization IDs to their agent instances
 */
export function getAllAgentInstances(): Map<string, OrchestrationAgent> {
  return new Map(agentInstances);
}

// =============================================================================
// SYSTEM INITIALIZATION
// =============================================================================

/**
 * Initialize the agent system with event bus, input handlers, and action executors.
 *
 * This function sets up the complete agent infrastructure:
 * - Event bus for communication
 * - Input handlers for various sources
 * - Action executors for performing operations
 *
 * Call this once during application startup.
 *
 * @param options - System initialization options
 * @returns The initialized system state
 *
 * @example
 * ```typescript
 * // Initialize with all features enabled
 * const system = await initializeAgentSystem({
 *   enableWebhooks: true,
 *   enableEmail: true,
 *   enableDBTriggers: true,
 *   enableWorkerEvents: true,
 * });
 *
 * // Access components
 * system.eventBus.emit('intake:created', payload);
 *
 * // Initialize with selective features
 * const system = await initializeAgentSystem({
 *   enableWebhooks: true,
 *   enableEmail: false,
 * });
 * ```
 */
export async function initializeAgentSystem(
  options: AgentSystemOptions = {}
): Promise<AgentSystemState> {
  const {
    enableWebhooks = true,
    enableEmail = true,
    enableDBTriggers = false,
    enableWorkerEvents = false,
    eventBusConfig = {},
    logger = defaultLogger,
  } = options;

  logger.info('Initializing agent system', {
    enableWebhooks,
    enableEmail,
    enableDBTriggers,
    enableWorkerEvents,
  });

  // Get or create event bus
  const eventBus = AgentEventBus.getInstance({
    historySize: eventBusConfig.historySize ?? 1000,
    debug: eventBusConfig.debug ?? false,
    defaultOrgId: eventBusConfig.defaultOrgId,
    logger,
  });

  // Initialize handlers
  const handlers: AgentSystemState['handlers'] = {};

  if (enableWebhooks) {
    handlers.webhook = createWebhookHandler({
      eventBus,
      logger,
    });
    logger.debug('Webhook handler initialized');
  }

  if (enableEmail) {
    handlers.email = new EmailInputHandler({
      eventBus,
      logger,
    });
    logger.debug('Email handler initialized');
  }

  if (enableDBTriggers) {
    handlers.dbTrigger = new DBTriggerHandler({
      eventBus,
      logger,
    });
    logger.debug('DB trigger handler initialized');
  }

  if (enableWorkerEvents) {
    handlers.workerEvent = new WorkerEventHandler({
      eventBus,
      logger,
    });
    logger.debug('Worker event handler initialized');
  }

  // Initialize action executors
  const actions: AgentSystemState['actions'] = {};

  // Notification dispatcher is a singleton
  actions.notificationDispatcher = notificationDispatcher;

  // Automation trigger (no config required)
  actions.automationTrigger = createAutomationTrigger();

  // Store system state
  systemState = {
    eventBus,
    handlers,
    actions,
    initialized: true,
  };

  logger.info('Agent system initialized successfully');

  return systemState;
}

/**
 * Gracefully shutdown the agent system.
 *
 * This function:
 * - Stops all agent instances
 * - Cleans up event subscriptions
 * - Releases resources
 *
 * Call this during application shutdown.
 *
 * @returns Promise that resolves when shutdown is complete
 *
 * @example
 * ```typescript
 * // In your app shutdown handler
 * process.on('SIGTERM', async () => {
 *   await shutdownAgentSystem();
 *   process.exit(0);
 * });
 * ```
 */
export async function shutdownAgentSystem(): Promise<void> {
  const logger = defaultLogger;
  logger.info('Shutting down agent system');

  // Stop all agent instances
  for (const [orgId, agent] of agentInstances) {
    logger.debug('Stopping agent', { orgId });
    agent.stop();
  }
  agentInstances.clear();

  // Reset event bus singleton
  AgentEventBus.resetInstance();

  // Clear system state
  systemState = null;

  logger.info('Agent system shutdown complete');
}

/**
 * Get the current system state.
 *
 * @returns The current system state or null if not initialized
 *
 * @example
 * ```typescript
 * const state = getSystemState();
 * if (state?.initialized) {
 *   // System is ready
 *   state.eventBus.emit('intake:created', payload);
 * }
 * ```
 */
export function getSystemState(): AgentSystemState | null {
  return systemState;
}

/**
 * Check if the agent system is initialized.
 *
 * @returns True if the system has been initialized
 */
export function isSystemInitialized(): boolean {
  return systemState?.initialized ?? false;
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Process an input through an organization's agent.
 *
 * This is a convenience function that gets or creates an agent
 * and processes the input in one call.
 *
 * @param orgId - The organization ID
 * @param input - The input to process
 * @param options - Agent configuration options
 * @returns The processing result
 *
 * @example
 * ```typescript
 * const result = await processWithAgent('org-123', {
 *   source: AgentInputSource.WEBHOOK,
 *   type: 'form_submitted',
 *   rawContent: 'Contact form submission...',
 *   timestamp: new Date(),
 * });
 *
 * console.log(result.decision.intent);
 * console.log(result.decision.confidence);
 * ```
 */
export async function processWithAgent(
  orgId: string,
  input: Parameters<OrchestrationAgent['process']>[0],
  options?: AgentFactoryOptions
): Promise<ReturnType<OrchestrationAgent['process']>> {
  const agent = getAgentInstance(orgId, options);

  // Start agent if needed (start() checks internally if already running)
  agent.start();

  return agent.process(input);
}

/**
 * Create action executors for an organization.
 *
 * @param orgId - Organization ID for the executors
 * @param logger - Optional logger instance
 * @returns Object containing all action executor instances
 */
export function createActionExecutors(
  orgId: string,
  logger: Logger = defaultLogger
): AgentSystemState['actions'] {
  return {
    pipelineAssigner: createPipelineAssigner({ orgId, logger }),
    notificationDispatcher: notificationDispatcher,
    automationTrigger: createAutomationTrigger(),
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Safe environment variable access that works in both Node.js and browser
 */
function getEnvVar(key: string, defaultValue: string): string {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] ?? defaultValue;
  }
  return defaultValue;
}

/**
 * OrchestrationAgent - Main Agent Class
 *
 * The OrchestrationAgent is the central coordinating component that:
 * - Processes inputs from multiple channels (email, webhooks, DB triggers, etc.)
 * - Uses LLM for intelligent decision-making
 * - Executes actions through the ActionExecutor
 * - Manages event subscriptions and lifecycle
 * - Provides rate limiting and error handling
 * - Maintains decision audit trail
 *
 * @module OrchestrationAgent
 */

import type {
  AgentConfig,
  AgentInput,
  AgentEvent,
  AgentEventType,
  AgentDecisionResult,
  DecisionContext,
  DecisionOutcome,
  OrgContext,
  HistoricalContext,
  DecisionType,
  DecisionStatus,
  Logger,
  PipelineSummary,
  UserSummary,
  OrgSettings,
  AgentAction,
  LLMModel,
} from '../types/agent.types';
import {
  AgentInputSource,
  DecisionType as DecisionTypeEnum,
  DecisionStatus as DecisionStatusEnum,
  LLMProvider,
  DEFAULT_AGENT_CONFIG,
} from '../types/agent.types';
import type { ILLMClient } from './LLMClient';
import { createLLMClient } from './LLMFactory';
import { AgentEventBus, type EmitResult, type EventBusConfig } from '../inputs/EventBus';
import { DecisionEngine, type DecisionEngineConfig } from './DecisionEngine';
import { ActionExecutor, type ActionExecutorConfig } from './ActionExecutor';
import { PromptBuilder, type OrgContext as PromptOrgContext } from '../prompts';
import { communicationClassifier, type CommunicationClassification, type CommunicationChannel } from '../communication-classifier';

interface IntegrationStatus {
  provider: string;
  available: boolean;
  reason?: string;
}
import { prisma } from '@/lib/prisma';
import type { BaseOperationalAgent } from '../operational/BaseOperationalAgent';
import type { DocumentProcessedEvent as OperationalDocumentEvent } from '../operational/BaseOperationalAgent';
import {
  apClerkAgent,
  complianceSentinelAgent,
  logisticsCoordinatorAgent,
  getAgentForDocumentType,
} from '../operational';

// =============================================================================
// Constants
// =============================================================================

/** Default rate limit: actions per minute */
const DEFAULT_RATE_LIMIT_PER_MINUTE = 60;

/** Default rate limit: actions per hour */
const DEFAULT_RATE_LIMIT_PER_HOUR = 500;

/** Event types the agent listens to by default */
const DEFAULT_SUBSCRIBED_EVENTS: AgentEventType[] = [
  'intake:created',
  'intake:updated',
  'intake:escalated',
  'webhook:form_submitted',
  'webhook:booking_requested',
  'email:received',
  'pipeline:stage_changed',
  'calendar:reminder_due',
  'calendar:event_created',
  'calendar:event_updated',
  'calendar:event_cancelled',
  'schedule:triggered',
  'document:processed', // Added for operational agents
];

// =============================================================================
// Types
// =============================================================================

/**
 * Full configuration for the OrchestrationAgent
 */
export interface OrchestrationAgentConfig extends AgentConfig {
  /** Custom LLM client (optional, will create from config if not provided) */
  llmClient?: ILLMClient;
  /** Event bus configuration */
  eventBusConfig?: EventBusConfig;
  /** Decision engine configuration overrides */
  decisionEngineConfig?: Partial<DecisionEngineConfig>;
  /** Action executor configuration overrides */
  actionExecutorConfig?: Partial<ActionExecutorConfig>;
  /** Event types to subscribe to */
  subscribedEvents?: AgentEventType[];
  /** Custom logger */
  logger?: Logger;
  /** Dry run mode (no actions executed) */
  dryRun?: boolean;
}

/**
 * Statistics tracked by the agent
 */
export interface AgentStats {
  /** Total decisions made */
  totalDecisions: number;
  /** Successful decisions */
  successfulDecisions: number;
  /** Failed decisions */
  failedDecisions: number;
  /** Decisions requiring approval */
  pendingApprovals: number;
  /** Actions executed */
  totalActionsExecuted: number;
  /** Events processed */
  totalEventsProcessed: number;
  /** Errors encountered */
  totalErrors: number;
  /** Average decision time (ms) */
  averageDecisionTimeMs: number;
  /** Rate limit status */
  rateLimitStatus: {
    actionsThisMinute: number;
    actionsThisHour: number;
    isLimited: boolean;
  };
  /** Agent uptime (ms) */
  uptimeMs: number;
  /** Time since last decision (ms) */
  timeSinceLastDecisionMs: number | null;
}

/**
 * Pending decision awaiting approval
 */
export interface PendingDecision {
  /** Decision ID */
  id: string;
  /** The decision result */
  decision: AgentDecisionResult;
  /** Original input */
  input: AgentInput;
  /** Context used for decision */
  context: DecisionContext;
  /** When the decision was made */
  createdAt: Date;
  /** Expiration time for approval */
  expiresAt: Date;
}

/**
 * Decision record for audit trail
 */
export interface DecisionRecord {
  /** Decision ID */
  id: string;
  /** Agent ID */
  agentId: string;
  /** Organization ID */
  orgId: string;
  /** Input source */
  inputSource: AgentInputSource;
  /** Input type */
  inputType: string;
  /** Input data */
  inputData: Record<string, unknown>;
  /** LLM prompt used */
  llmPrompt: string;
  /** LLM response */
  llmResponse: string;
  /** Confidence score */
  confidence: number;
  /** Reasoning */
  reasoning: string;
  /** Decision type */
  decisionType: DecisionType;
  /** Actions taken */
  actions: AgentAction[];
  /** Status */
  status: DecisionStatus;
  /** Execution time (ms) */
  executionTime: number;
  /** Error message if failed */
  errorMessage?: string;
  /** Created timestamp */
  createdAt: Date;
  /** Executed timestamp */
  executedAt?: Date;
}

/**
 * Rate limiter state
 */
interface RateLimiterState {
  minuteTimestamps: number[];
  hourTimestamps: number[];
}

// =============================================================================
// Default Logger
// =============================================================================

const defaultLogger: Logger = {
  debug: (msg, data) => console.debug(`[OrchestrationAgent] ${msg}`, data ?? ''),
  info: (msg, data) => console.info(`[OrchestrationAgent] ${msg}`, data ?? ''),
  warn: (msg, data) => console.warn(`[OrchestrationAgent] ${msg}`, data ?? ''),
  error: (msg, err, data) => console.error(`[OrchestrationAgent] ${msg}`, err, data ?? ''),
};

// =============================================================================
// OrchestrationAgent Class
// =============================================================================

/**
 * The main orchestration agent that coordinates all agent operations.
 *
 * @example
 * ```typescript
 * // Create agent with configuration
 * const agent = new OrchestrationAgent({
 *   orgId: 'org-123',
 *   llmProvider: LLMProvider.CLAUDE,
 *   llmModel: 'claude-sonnet-4-20250514',
 *   temperature: 0.3,
 *   autoExecuteThreshold: 0.85,
 *   requireApprovalThreshold: 0.5,
 *   enabledActions: Object.values(DecisionType),
 *   maxActionsPerMinute: 60,
 *   maxActionsPerHour: 500,
 *   notifyOnHighPriority: true,
 *   notifyOnFailure: true,
 *   escalationEmail: 'admin@example.com',
 * });
 *
 * // Start the agent (subscribe to events)
 * agent.start();
 *
 * // Process an input directly
 * const result = await agent.process({
 *   source: AgentInputSource.WEBHOOK,
 *   type: 'form_submitted',
 *   rawContent: 'Customer inquiry about pricing...',
 *   timestamp: new Date(),
 * });
 *
 * // Handle pending approvals
 * await agent.approveDecision('decision-123');
 *
 * // Stop the agent
 * agent.stop();
 * ```
 */
export class OrchestrationAgent {
  // Core configuration
  private config: OrchestrationAgentConfig;
  private logger: Logger;
  private agentId: string;

  // Core components
  private llmClient: ILLMClient;
  private eventBus: AgentEventBus;
  private decisionEngine: DecisionEngine;
  private actionExecutor: ActionExecutor;

  // State
  private isRunning: boolean = false;
  private startTime: Date | null = null;
  private subscriptionIds: string[] = [];
  private pendingDecisions: Map<string, PendingDecision> = new Map();
  private decisionHistory: DecisionRecord[] = [];

  // Rate limiting
  private rateLimiter: RateLimiterState = {
    minuteTimestamps: [],
    hourTimestamps: [],
  };

  // Statistics
  private stats: {
    totalDecisions: number;
    successfulDecisions: number;
    failedDecisions: number;
    pendingApprovals: number;
    totalActionsExecuted: number;
    totalEventsProcessed: number;
    totalErrors: number;
    decisionTimes: number[];
    lastDecisionTime: Date | null;
  } = {
    totalDecisions: 0,
    successfulDecisions: 0,
    failedDecisions: 0,
    pendingApprovals: 0,
    totalActionsExecuted: 0,
    totalEventsProcessed: 0,
    totalErrors: 0,
    decisionTimes: [],
    lastDecisionTime: null,
  };

  // Organization context cache
  private orgContextCache: OrgContext | null = null;
  private orgContextCacheTime: Date | null = null;
  private readonly ORG_CONTEXT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  // Operational agents
  private operationalAgents: BaseOperationalAgent[] = [];

  constructor(config: OrchestrationAgentConfig) {
    this.config = this.validateAndMergeConfig(config);
    this.logger = config.logger ?? defaultLogger;
    this.agentId = config.id ?? `agent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    this.logger.info('Initializing OrchestrationAgent', {
      agentId: this.agentId,
      orgId: this.config.orgId,
      llmProvider: this.config.llmProvider,
      llmModel: this.config.llmModel,
    });

    // Initialize LLM client
    this.llmClient = config.llmClient ?? createLLMClient({
      provider: this.config.llmProvider,
      model: this.config.llmModel,
      defaultOptions: {
        temperature: this.config.temperature,
      },
    });

    // Initialize event bus
    this.eventBus = AgentEventBus.getInstance(config.eventBusConfig);

    // Initialize decision engine
    this.decisionEngine = new DecisionEngine({
      autoExecuteThreshold: this.config.autoExecuteThreshold,
      requireApprovalThreshold: this.config.requireApprovalThreshold,
      enabledActions: this.config.enabledActions,
      enableFallback: true,
      logger: this.logger,
      ...config.decisionEngineConfig,
    });

    // Initialize action executor
    this.actionExecutor = new ActionExecutor({
      dryRun: config.dryRun ?? false,
      orgId: this.config.orgId,
      logger: this.logger,
      ...config.actionExecutorConfig,
    });

    // Initialize operational agents
    this.initializeOperationalAgents();

    this.logger.info('OrchestrationAgent initialized successfully', {
      agentId: this.agentId,
      operationalAgents: this.operationalAgents.map(a => a.getName()),
    });
  }

  // ===========================================================================
  // Operational Agents Integration
  // ===========================================================================

  /**
   * Initialize operational agents for document processing.
   * Sets up handlers for document:processed events and routes them to appropriate agents.
   */
  private initializeOperationalAgents(): void {
    this.logger.info('Initializing operational agents');

    // Register operational agents
    this.operationalAgents = [
      apClerkAgent,
      complianceSentinelAgent,
      logisticsCoordinatorAgent,
    ];

    this.logger.info('Operational agents registered', {
      agents: this.operationalAgents.map(a => ({
        name: a.getName(),
        supportedTypes: a.getSupportedTypes(),
      })),
    });
  }

  /**
   * Handle document:processed events by routing to appropriate operational agent.
   */
  private async handleDocumentProcessed(event: AgentEvent<unknown>): Promise<void> {
    const docEvent = event.payload as OperationalDocumentEvent;

    this.logger.debug('Handling document:processed event', {
      documentId: docEvent.documentId,
      documentType: docEvent.documentType,
      orgId: docEvent.orgId,
    });

    // Only process documents for this organization
    if (docEvent.orgId !== this.config.orgId) {
      this.logger.debug('Skipping document from different organization', {
        eventOrgId: docEvent.orgId,
        agentOrgId: this.config.orgId,
      });
      return;
    }

    // Find appropriate operational agent
    const agent = getAgentForDocumentType(docEvent.documentType);

    if (!agent) {
      this.logger.warn('No operational agent found for document type', {
        documentType: docEvent.documentType,
        documentId: docEvent.documentId,
      });
      return;
    }

    try {
      this.logger.info('Routing document to operational agent', {
        documentId: docEvent.documentId,
        documentType: docEvent.documentType,
        agent: agent.getName(),
      });

      // Process document with the operational agent
      const result = await agent.process(docEvent);

      if (result.success) {
        this.logger.info('Document processed successfully by operational agent', {
          documentId: docEvent.documentId,
          agent: agent.getName(),
          actionsTaken: result.actionsTaken,
          pipelineItemId: result.pipelineItemId,
        });
      } else {
        this.logger.error('Document processing failed', new Error(result.error || 'Unknown error'), {
          documentId: docEvent.documentId,
          agent: agent.getName(),
          error: result.error,
        });
      }

      if (result.warnings && result.warnings.length > 0) {
        this.logger.warn('Document processing warnings', {
          documentId: docEvent.documentId,
          agent: agent.getName(),
          warnings: result.warnings,
        });
      }
    } catch (error) {
      this.logger.error('Error in operational agent processing', error as Error, {
        documentId: docEvent.documentId,
        documentType: docEvent.documentType,
        agent: agent.getName(),
      });
    }
  }

  // ===========================================================================
  // Lifecycle Methods
  // ===========================================================================

  /**
   * Start the agent - subscribe to events and begin processing.
   */
  start(): void {
    if (this.isRunning) {
      this.logger.warn('Agent is already running');
      return;
    }

    this.logger.info('Starting OrchestrationAgent', { agentId: this.agentId });

    this.isRunning = true;
    this.startTime = new Date();

    // Subscribe to configured events
    const eventsToSubscribe = this.config.subscribedEvents ?? DEFAULT_SUBSCRIBED_EVENTS;

    for (const eventType of eventsToSubscribe) {
      const subscriptionId = this.eventBus.on(eventType, async (event) => {
        await this.handleEvent(event);
      });
      this.subscriptionIds.push(subscriptionId);
      this.logger.debug(`Subscribed to event: ${eventType}`, { subscriptionId });
    }

    this.logger.info('OrchestrationAgent started', {
      agentId: this.agentId,
      subscribedEvents: eventsToSubscribe.length,
    });
  }

  /**
   * Stop the agent - unsubscribe from events and cleanup.
   */
  stop(): void {
    if (!this.isRunning) {
      this.logger.warn('Agent is not running');
      return;
    }

    this.logger.info('Stopping OrchestrationAgent', { agentId: this.agentId });

    // Unsubscribe from all events
    for (const subscriptionId of this.subscriptionIds) {
      this.eventBus.off(subscriptionId);
    }
    this.subscriptionIds = [];

    this.isRunning = false;

    this.logger.info('OrchestrationAgent stopped', {
      agentId: this.agentId,
      totalDecisions: this.stats.totalDecisions,
    });
  }

  /**
   * Check if the agent is running.
   */
  isActive(): boolean {
    return this.isRunning;
  }

  // ===========================================================================
  // Main Processing Methods
  // ===========================================================================

  /**
   * Process an input and return the decision result.
   *
   * @param input - The agent input to process
   * @returns The decision result with actions
   */
  async process(input: AgentInput): Promise<AgentDecisionResult> {
    const startTime = Date.now();
    const correlationId = input.correlationId ?? `proc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    this.logger.info('Processing input', {
      source: input.source,
      type: input.type,
      correlationId,
    });

    // Check rate limits
    if (this.isRateLimited()) {
      this.logger.warn('Rate limit exceeded, rejecting input');
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    try {
      // Build decision context
      const context = await this.buildDecisionContext(input);

      // Build LLM prompt
      const systemPrompt = this.buildSystemPrompt(context.org);
      const userPrompt = this.buildUserPrompt(input, context);

      // Make LLM call
      const llmResponse = await this.makeLLMDecision(systemPrompt, userPrompt);

      // Process LLM response through decision engine
      const decision = this.decisionEngine.processLLMResponse(llmResponse, context);

      // Add integration suggestions based on context
      decision.suggestions = this.generateIntegrationSuggestions(decision, context);

      // Record decision time
      const decisionTime = Date.now() - startTime;
      this.stats.decisionTimes.push(decisionTime);
      this.stats.lastDecisionTime = new Date();
      this.stats.totalDecisions++;

      // Update rate limiter
      this.recordRateLimitAction();

      // Determine execution path
      if (this.decisionEngine.shouldAutoExecute(decision)) {
        // Auto-execute
        this.logger.info('Auto-executing decision', {
          intent: decision.intent,
          confidence: decision.confidence,
          actionCount: decision.actions.length,
        });

        const outcome = await this.executeDecision(decision, correlationId);

        // Record outcome
        await this.recordDecision(input, decision, outcome, systemPrompt, llmResponse);

        if (outcome.status === DecisionStatusEnum.EXECUTED) {
          this.stats.successfulDecisions++;
        } else {
          this.stats.failedDecisions++;
        }

        return decision;

      } else if (this.decisionEngine.requiresApproval(decision)) {
        // Requires approval
        this.logger.info('Decision requires approval', {
          intent: decision.intent,
          confidence: decision.confidence,
        });

        const pendingId = this.storePendingDecision(decision, input, context);
        this.stats.pendingApprovals++;

        // Record as pending
        await this.recordDecision(input, decision, {
          status: DecisionStatusEnum.REQUIRES_APPROVAL,
          executionTime: 0,
          results: [],
          errors: [],
          completedAt: new Date(),
        }, systemPrompt, llmResponse);

        // Notify if configured
        if (this.config.notifyOnHighPriority && (decision.priority ?? 3) >= 4) {
          await this.sendApprovalNotification(pendingId, decision);
        }

        return decision;

      } else {
        // Rejected due to low confidence
        this.logger.warn('Decision rejected due to low confidence', {
          intent: decision.intent,
          confidence: decision.confidence,
        });

        this.stats.failedDecisions++;

        await this.recordDecision(input, decision, {
          status: DecisionStatusEnum.REJECTED,
          executionTime: 0,
          results: [],
          errors: [{ action: DecisionTypeEnum.NO_ACTION, code: 'LOW_CONFIDENCE', message: 'Confidence below threshold', retryable: false }],
          completedAt: new Date(),
        }, systemPrompt, llmResponse);

        return decision;
      }

    } catch (error) {
      this.stats.totalErrors++;
      this.logger.error('Error processing input', error as Error, { correlationId });

      // Notify on failure if configured
      if (this.config.notifyOnFailure) {
        await this.sendErrorNotification(error as Error, input);
      }

      throw error;
    }
  }

  /**
   * Handle an incoming event from the event bus.
   */
  async handleEvent(event: AgentEvent): Promise<void> {
    this.stats.totalEventsProcessed++;

    this.logger.debug('Handling event', {
      type: event.type,
      eventId: event.eventId,
    });

    // Skip agent's own events to prevent loops
    if (event.source === 'agent') {
      return;
    }

    // Route document:processed events to operational agents
    if (event.type === 'document:processed') {
      try {
        await this.handleDocumentProcessed(event);
      } catch (error) {
        this.logger.error('Error handling document:processed event', error as Error, {
          eventType: event.type,
          eventId: event.eventId,
        });
      }
      return;
    }

    // Convert event to AgentInput for other event types
    const input = this.eventToInput(event);

    try {
      await this.process(input);
    } catch (error) {
      this.logger.error('Error handling event', error as Error, {
        eventType: event.type,
        eventId: event.eventId,
      });
    }
  }

  // ===========================================================================
  // Approval Methods
  // ===========================================================================

  /**
   * Approve a pending decision and execute it.
   */
  async approveDecision(decisionId: string): Promise<DecisionOutcome> {
    const pending = this.pendingDecisions.get(decisionId);

    if (!pending) {
      throw new Error(`Pending decision not found: ${decisionId}`);
    }

    this.logger.info('Approving decision', { decisionId });

    // Check if expired
    if (new Date() > pending.expiresAt) {
      this.pendingDecisions.delete(decisionId);
      this.stats.pendingApprovals--;
      throw new Error('Decision has expired');
    }

    // Execute the decision
    const outcome = await this.executeDecision(pending.decision, decisionId);

    // Update stats
    this.pendingDecisions.delete(decisionId);
    this.stats.pendingApprovals--;

    if (outcome.status === DecisionStatusEnum.EXECUTED) {
      this.stats.successfulDecisions++;
    } else {
      this.stats.failedDecisions++;
    }

    return outcome;
  }

  /**
   * Reject a pending decision.
   */
  async rejectDecision(decisionId: string, reason: string): Promise<void> {
    const pending = this.pendingDecisions.get(decisionId);

    if (!pending) {
      throw new Error(`Pending decision not found: ${decisionId}`);
    }

    this.logger.info('Rejecting decision', { decisionId, reason });

    this.pendingDecisions.delete(decisionId);
    this.stats.pendingApprovals--;
    this.stats.failedDecisions++;

    // Record rejection
    await this.recordDecision(pending.input, pending.decision, {
      status: DecisionStatusEnum.REJECTED,
      executionTime: 0,
      results: [],
      errors: [{ action: DecisionTypeEnum.NO_ACTION, code: 'REJECTED', message: reason, retryable: false }],
      completedAt: new Date(),
    }, '', '');
  }

  /**
   * Get all pending decisions.
   */
  getPendingDecisions(): PendingDecision[] {
    return [...this.pendingDecisions.values()];
  }

  // ===========================================================================
  // Private: Integration & Communication Methods
  // ===========================================================================

  /**
   * Generate integration suggestions based on decision and context
   */
  private generateIntegrationSuggestions(
    decision: AgentDecisionResult,
    context: DecisionContext
  ): IntegrationSuggestion[] {
    const suggestions: IntegrationSuggestion[] = [];
    const availableProviders = new Set(
      context.availableIntegrations?.map(i => i.provider) || []
    );

    // Check each action for missing integration requirements
    for (const action of decision.actions) {
      switch (action.type) {
        case 'SEND_BUSINESS_EMAIL':
          if (!availableProviders.has('GMAIL')) {
            suggestions.push({
              type: 'connect_integration',
              provider: 'GMAIL',
              reason: 'Needed to send business emails automatically',
              benefit: 'Send personalized business emails directly from your Gmail account',
              priority: 4
            });
          }
          break;

        case 'CREATE_EVENT':
          if (!availableProviders.has('GOOGLE_CALENDAR')) {
            suggestions.push({
              type: 'connect_integration',
              provider: 'GOOGLE_CALENDAR',
              reason: 'Needed to schedule meetings and appointments',
              benefit: 'Automatically create calendar events and manage your schedule',
              priority: 3
            });
          }
          break;

        case 'UPDATE_CRM':
          if (!availableProviders.has('SALESFORCE') && !availableProviders.has('HUBSPOT')) {
            suggestions.push({
              type: 'connect_integration',
              provider: 'SALESFORCE', // Prefer Salesforce as primary suggestion
              reason: 'Needed to sync customer data and track sales activities',
              benefit: 'Keep your CRM updated with new leads and customer interactions',
              priority: 4
            });
          }
          break;
      }
    }

    // Check communication classification for additional suggestions
    const classification = context.communicationClassification;
    if (classification?.channel === 'business' && !availableProviders.has('GMAIL')) {
      suggestions.push({
        type: 'connect_integration',
        provider: 'GMAIL',
        reason: 'Your request involves business communication',
        benefit: 'Send professional emails from your connected Gmail account',
        priority: 5
      });
    }

    // Remove duplicates and sort by priority
    const uniqueSuggestions = suggestions.filter((suggestion, index, array) =>
      array.findIndex(s => s.provider === suggestion.provider && s.type === suggestion.type) === index
    );

    return uniqueSuggestions.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  /**
   * Get available integrations for an organization
   */
  private async getAvailableIntegrations(orgId: string): Promise<IntegrationStatus[]> {
    try {
      const response = await fetch(
        `${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/api/integrations/available`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.INTERNAL_API_TOKEN || 'internal'}`,
            'Content-Type': 'application/json',
            'X-Org-ID': orgId
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.allProviders || [];
      }
    } catch (error) {
      this.logger.warn('Failed to fetch available integrations', { orgId, error });
    }

    return [];
  }

  /**
   * Filter actions based on communication classification and available integrations
   */
  private filterActionsByCommunicationType(
    enabledActions: DecisionType[],
    classification: CommunicationClassification,
    integrations: IntegrationStatus[]
  ): DecisionType[] {
    const availableProviders = new Set(
      integrations.filter(i => i.available).map(i => i.provider)
    );

    return enabledActions.filter(action => {
      switch (classification.channel) {
        case 'system':
          // System communications only use internal services
          return ['SEND_SYSTEM_EMAIL', 'SEND_SYSTEM_NOTIFICATION'].includes(action);

        case 'business':
          // Business emails require Gmail integration
          if (action === 'SEND_BUSINESS_EMAIL') {
            return availableProviders.has('GMAIL');
          }
          return true;

        case 'integration':
          // Integration actions require specific integrations
          if (action === 'CREATE_EVENT') {
            return availableProviders.has('GOOGLE_CALENDAR');
          }
          if (action === 'UPDATE_CRM') {
            return availableProviders.has('SALESFORCE') || availableProviders.has('HUBSPOT');
          }
          return true;

        default:
          return true;
      }
    });
  }

  // ===========================================================================
  // Private: Configuration Methods
  // ===========================================================================

  /**
   * Validate and merge configuration with defaults.
   */
  private validateAndMergeConfig(config: OrchestrationAgentConfig): OrchestrationAgentConfig {
    // Spread config first, then override with defaults where not provided
    const merged: OrchestrationAgentConfig = {
      ...config,
      // Required fields with defaults
      orgId: config.orgId,
      llmProvider: config.llmProvider ?? LLMProvider.OPENAI,
      llmModel: config.llmModel ?? 'gpt-4.1',
      // Decision thresholds
      temperature: config.temperature ?? DEFAULT_AGENT_CONFIG.temperature,
      autoExecuteThreshold: config.autoExecuteThreshold ?? DEFAULT_AGENT_CONFIG.autoExecuteThreshold,
      requireApprovalThreshold: config.requireApprovalThreshold ?? DEFAULT_AGENT_CONFIG.requireApprovalThreshold,
      // Capabilities
      enabledActions: config.enabledActions ?? Object.values(DecisionTypeEnum),
      // Rate limits
      maxActionsPerMinute: config.maxActionsPerMinute ?? DEFAULT_AGENT_CONFIG.maxActionsPerMinute,
      maxActionsPerHour: config.maxActionsPerHour ?? DEFAULT_AGENT_CONFIG.maxActionsPerHour,
      // Notifications
      notifyOnHighPriority: config.notifyOnHighPriority ?? true,
      notifyOnFailure: config.notifyOnFailure ?? true,
      escalationEmail: config.escalationEmail ?? 'admin@example.com',
    };

    return merged;
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a new OrchestrationAgent instance.
 *
 * @example
 * ```typescript
 * const agent = createOrchestrationAgent({
 *   orgId: 'org-123',
 *   llmProvider: LLMProvider.CLAUDE,
 *   llmModel: 'claude-sonnet-4-20250514',
 *   autoExecuteThreshold: 0.85,
 *   enabledActions: [DecisionType.ASSIGN_PIPELINE, DecisionType.SEND_NOTIFICATION],
 * });
 *
 * agent.start();
 * ```
 */
export function createOrchestrationAgent(
  config: OrchestrationAgentConfig
): OrchestrationAgent {
  return new OrchestrationAgent(config);
}


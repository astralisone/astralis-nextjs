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
import { prisma } from '@/lib/prisma';

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
  'schedule:triggered',
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
    this.llmClient = config.llmClient ?? this.createLLMClient();

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

    this.logger.info('OrchestrationAgent initialized successfully', {
      agentId: this.agentId,
    });
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

    // Convert event to AgentInput
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
  // Configuration Methods
  // ===========================================================================

  /**
   * Update agent configuration.
   */
  updateConfig(config: Partial<OrchestrationAgentConfig>): void {
    this.config = { ...this.config, ...config };

    // Update sub-components if needed
    if (config.autoExecuteThreshold !== undefined || config.requireApprovalThreshold !== undefined) {
      this.decisionEngine.updateConfig({
        autoExecuteThreshold: this.config.autoExecuteThreshold,
        requireApprovalThreshold: this.config.requireApprovalThreshold,
      });
    }

    if (config.dryRun !== undefined) {
      this.actionExecutor.setDryRun(config.dryRun);
    }

    this.logger.info('Configuration updated');
  }

  /**
   * Get current configuration.
   */
  getConfig(): Readonly<OrchestrationAgentConfig> {
    return { ...this.config };
  }

  // ===========================================================================
  // Statistics Methods
  // ===========================================================================

  /**
   * Get agent statistics.
   */
  getStats(): AgentStats {
    const avgDecisionTime = this.stats.decisionTimes.length > 0
      ? this.stats.decisionTimes.reduce((a, b) => a + b, 0) / this.stats.decisionTimes.length
      : 0;

    const now = Date.now();

    return {
      totalDecisions: this.stats.totalDecisions,
      successfulDecisions: this.stats.successfulDecisions,
      failedDecisions: this.stats.failedDecisions,
      pendingApprovals: this.stats.pendingApprovals,
      totalActionsExecuted: this.stats.totalActionsExecuted,
      totalEventsProcessed: this.stats.totalEventsProcessed,
      totalErrors: this.stats.totalErrors,
      averageDecisionTimeMs: avgDecisionTime,
      rateLimitStatus: {
        actionsThisMinute: this.rateLimiter.minuteTimestamps.filter(t => now - t < 60000).length,
        actionsThisHour: this.rateLimiter.hourTimestamps.filter(t => now - t < 3600000).length,
        isLimited: this.isRateLimited(),
      },
      uptimeMs: this.startTime ? now - this.startTime.getTime() : 0,
      timeSinceLastDecisionMs: this.stats.lastDecisionTime
        ? now - this.stats.lastDecisionTime.getTime()
        : null,
    };
  }

  /**
   * Get decision history.
   */
  getDecisionHistory(limit?: number): DecisionRecord[] {
    if (limit) {
      return this.decisionHistory.slice(-limit);
    }
    return [...this.decisionHistory];
  }

  // ===========================================================================
  // Private: LLM Methods
  // ===========================================================================

  /**
   * Create the LLM client based on configuration.
   */
  private createLLMClient(): ILLMClient {
    return createLLMClient({
      provider: this.config.llmProvider,
      model: this.config.llmModel as LLMModel,
      defaultOptions: {
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens,
      },
    });
  }

  /**
   * Build the system prompt for LLM.
   */
  private buildSystemPrompt(org: OrgContext): string {
    const promptOrg: PromptOrgContext = {
      orgName: org.name,
      pipelines: org.pipelines.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        stages: p.stages.map((s, i) => ({ id: s, name: s, order: i })),
      })),
      teamMembers: org.users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        isAvailable: u.isAvailable,
      })),
      timezone: org.settings.timezone,
      currentDateTime: new Date(),
    };

    return PromptBuilder.buildSystemPrompt(promptOrg);
  }

  /**
   * Build the user prompt for LLM.
   */
  private buildUserPrompt(input: AgentInput, context: DecisionContext): string {
    let prompt = `## Input Information\n\n`;
    prompt += `- **Source:** ${input.source}\n`;
    prompt += `- **Type:** ${input.type}\n`;
    prompt += `- **Timestamp:** ${input.timestamp.toISOString()}\n`;

    if (input.metadata?.senderEmail) {
      prompt += `- **Sender Email:** ${input.metadata.senderEmail}\n`;
    }
    if (input.metadata?.senderName) {
      prompt += `- **Sender Name:** ${input.metadata.senderName}\n`;
    }

    prompt += `\n## Content\n\n${input.rawContent}\n`;

    if (input.structuredData && Object.keys(input.structuredData).length > 0) {
      prompt += `\n## Structured Data\n\n\`\`\`json\n${JSON.stringify(input.structuredData, null, 2)}\n\`\`\`\n`;
    }

    if (context.history && context.history.recentDecisions.length > 0) {
      prompt += `\n## Recent Decisions\n\n`;
      for (const decision of context.history.recentDecisions.slice(0, 5)) {
        prompt += `- ${decision.decisionType} (${decision.inputType}): Confidence ${decision.confidence.toFixed(2)}, Status: ${decision.status}\n`;
      }
    }

    prompt += `\n## Available Actions\n\n`;
    prompt += context.availableActions.map(a => `- ${a}`).join('\n');

    prompt += `\n\n---\n\nBased on the above information, analyze the input and provide your decision in the required JSON format.`;

    return prompt;
  }

  /**
   * Make LLM decision call with Claude→OpenAI fallback.
   */
  private async makeLLMDecision(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      // Try Claude first (or configured primary provider)
      const response = await this.llmClient.complete([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]);

      return response.content;
    } catch (claudeError) {
      this.logger.error('[OA] Primary LLM failed, attempting OpenAI fallback', claudeError as Error, {
        primaryProvider: this.config.llmProvider,
      });

      try {
        // Fallback to OpenAI
        const openaiClient = createLLMClient({
          provider: LLMProvider.OPENAI,
          model: 'gpt-4o' as LLMModel,
          defaultOptions: {
            temperature: this.config.temperature,
            maxTokens: this.config.maxTokens,
          },
        });

        const fallbackResponse = await openaiClient.complete([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ]);

        this.logger.info('[OA] OpenAI fallback succeeded', {
          primaryProvider: this.config.llmProvider,
        });

        return fallbackResponse.content;
      } catch (openaiError) {
        this.logger.error('[OA] OpenAI fallback also failed', openaiError as Error);

        // Emit routing failure event for UI visibility
        await this.eventBus.emit('intake:routing_failed', {
          error: 'Both Claude and OpenAI LLM calls failed',
          primaryError: claudeError instanceof Error ? claudeError.message : String(claudeError),
          fallbackError: openaiError instanceof Error ? openaiError.message : String(openaiError),
          timestamp: new Date(),
        }, { source: 'agent' });

        // Surface error with details
        throw new Error(
          `LLM routing failed - Primary (${this.config.llmProvider}): ${claudeError instanceof Error ? claudeError.message : String(claudeError)}, Fallback (OpenAI): ${openaiError instanceof Error ? openaiError.message : String(openaiError)}`
        );
      }
    }
  }

  // ===========================================================================
  // Private: Context Methods
  // ===========================================================================

  /**
   * Build the full decision context.
   */
  private async buildDecisionContext(input: AgentInput): Promise<DecisionContext> {
    const org = await this.getOrganizationContext();
    const history = await this.getHistoricalContext(input);

    return {
      input,
      org,
      history,
      availableActions: this.config.enabledActions,
      decisionTimestamp: new Date(),
      sessionId: this.agentId,
    };
  }

  /**
   * Get organization context (with caching).
   * Fetches real pipelines, stages, and users from the database.
   */
  private async getOrganizationContext(): Promise<OrgContext> {
    const now = new Date();

    // Check cache
    if (
      this.orgContextCache &&
      this.orgContextCacheTime &&
      now.getTime() - this.orgContextCacheTime.getTime() < this.ORG_CONTEXT_CACHE_TTL
    ) {
      return this.orgContextCache;
    }

    try {
      // Fetch organization details
      const org = await prisma.organization.findUnique({
        where: { id: this.config.orgId },
        select: { id: true, name: true },
      });

      // Fetch real pipelines with stages from database
      const pipelines = await prisma.pipeline.findMany({
        where: { orgId: this.config.orgId, isActive: true },
        include: {
          stages: {
            orderBy: { order: 'asc' },
            select: { id: true, name: true, order: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      // Fetch real users from database
      const users = await prisma.users.findMany({
        where: { orgId: this.config.orgId, isActive: true },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      // Find default pipeline (prefer one named "General Intake" or first available)
      const defaultPipeline = pipelines.find(p =>
        p.name.toLowerCase().includes('general') ||
        p.name.toLowerCase().includes('intake')
      ) || pipelines[0];

      const context: OrgContext = {
        id: this.config.orgId,
        name: org?.name || 'Organization',
        pipelines: pipelines.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description ?? undefined,
          stages: p.stages.map(s => s.name),
          category: this.inferPipelineCategory(p.name),
          isActive: true,
        })),
        users: users.map(u => ({
          id: u.id,
          name: u.name || 'Unknown',
          email: u.email,
          role: u.role,
          currentLoad: 0, // Could be calculated from active assignments
          isAvailable: true,
        })),
        settings: {
          timezone: 'America/New_York',
          workingHours: { start: '09:00', end: '17:00', workingDays: [1, 2, 3, 4, 5] },
          defaultPipeline: defaultPipeline?.id || 'general',
          escalationEmail: this.config.escalationEmail,
          defaultEventDuration: 30,
          lunchBreak: { start: '12:00', end: '13:00' },
        },
      };

      this.logger.info('Loaded organization context from database', {
        orgId: this.config.orgId,
        pipelineCount: pipelines.length,
        userCount: users.length,
        pipelines: pipelines.map(p => ({ id: p.id, name: p.name })),
      });

      // Cache the context
      this.orgContextCache = context;
      this.orgContextCacheTime = now;

      return context;

    } catch (error) {
      this.logger.error('Failed to load organization context from database, using fallback', error as Error);

      // Fallback to minimal context if database fails
      const fallbackContext: OrgContext = {
        id: this.config.orgId,
        name: 'Organization',
        pipelines: [],
        users: [],
        settings: {
          timezone: 'America/New_York',
          workingHours: { start: '09:00', end: '17:00', workingDays: [1, 2, 3, 4, 5] },
          defaultPipeline: 'general',
          escalationEmail: this.config.escalationEmail,
          defaultEventDuration: 30,
          lunchBreak: { start: '12:00', end: '13:00' },
        },
      };

      return fallbackContext;
    }
  }

  /**
   * Infer pipeline category from its name for routing hints.
   */
  private inferPipelineCategory(name: string): string {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('sales') || lowerName.includes('lead') || lowerName.includes('opportunity')) {
      return 'sales';
    }
    if (lowerName.includes('support') || lowerName.includes('ticket') || lowerName.includes('help')) {
      return 'support';
    }
    if (lowerName.includes('billing') || lowerName.includes('invoice') || lowerName.includes('payment')) {
      return 'billing';
    }
    if (lowerName.includes('partner') || lowerName.includes('integration')) {
      return 'partnership';
    }
    return 'general';
  }

  /**
   * Get historical context for decision-making.
   */
  private async getHistoricalContext(_input: AgentInput): Promise<HistoricalContext> {
    // Get recent decisions from history
    const recentDecisions = this.decisionHistory.slice(-10).map(d => ({
      id: d.id,
      decisionType: d.decisionType,
      inputType: d.inputType,
      confidence: d.confidence,
      status: d.status,
      createdAt: d.createdAt,
    }));

    return {
      recentDecisions,
      relatedIntakes: [],
      relatedEvents: [],
    };
  }

  // ===========================================================================
  // Private: Execution Methods
  // ===========================================================================

  /**
   * Execute a decision's actions.
   */
  private async executeDecision(
    decision: AgentDecisionResult,
    correlationId: string
  ): Promise<DecisionOutcome> {
    const outcome = await this.actionExecutor.execute(decision.actions, {
      executionId: correlationId,
      correlationId,
      dryRun: this.config.dryRun,
    });

    this.stats.totalActionsExecuted += decision.actions.length;

    return outcome;
  }

  /**
   * Store a pending decision for approval.
   */
  private storePendingDecision(
    decision: AgentDecisionResult,
    input: AgentInput,
    context: DecisionContext
  ): string {
    const id = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    this.pendingDecisions.set(id, {
      id,
      decision,
      input,
      context,
      createdAt: new Date(),
      expiresAt,
    });

    return id;
  }

  /**
   * Record a decision for audit trail.
   */
  private async recordDecision(
    input: AgentInput,
    decision: AgentDecisionResult,
    outcome: DecisionOutcome,
    llmPrompt: string,
    llmResponse: string
  ): Promise<void> {
    const record: DecisionRecord = {
      id: `dec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      agentId: this.agentId,
      orgId: this.config.orgId,
      inputSource: input.source,
      inputType: input.type,
      inputData: { rawContent: input.rawContent, structuredData: input.structuredData },
      llmPrompt,
      llmResponse,
      confidence: decision.confidence,
      reasoning: decision.reasoning,
      decisionType: decision.actions[0]?.type ?? DecisionTypeEnum.NO_ACTION,
      actions: decision.actions,
      status: outcome.status,
      executionTime: outcome.executionTime,
      errorMessage: outcome.errors[0]?.message,
      createdAt: new Date(),
      executedAt: outcome.status === DecisionStatusEnum.EXECUTED ? outcome.completedAt : undefined,
    };

    this.decisionHistory.push(record);

    // Emit decision event
    await this.eventBus.emit('agent:decision_made', {
      id: record.id,
      decisionId: record.id,
      agentId: this.agentId,
      decisionType: record.decisionType,
      status: record.status,
      confidence: record.confidence,
      actions: record.actions,
      timestamp: new Date(),
      source: 'agent' as const,
    }, { source: 'agent' });
  }

  // ===========================================================================
  // Private: Rate Limiting
  // ===========================================================================

  /**
   * Check if rate limited.
   */
  private isRateLimited(): boolean {
    const now = Date.now();

    // Clean old timestamps
    this.rateLimiter.minuteTimestamps = this.rateLimiter.minuteTimestamps.filter(t => now - t < 60000);
    this.rateLimiter.hourTimestamps = this.rateLimiter.hourTimestamps.filter(t => now - t < 3600000);

    const perMinute = this.config.maxActionsPerMinute ?? DEFAULT_RATE_LIMIT_PER_MINUTE;
    const perHour = this.config.maxActionsPerHour ?? DEFAULT_RATE_LIMIT_PER_HOUR;

    return (
      this.rateLimiter.minuteTimestamps.length >= perMinute ||
      this.rateLimiter.hourTimestamps.length >= perHour
    );
  }

  /**
   * Record an action for rate limiting.
   */
  private recordRateLimitAction(): void {
    const now = Date.now();
    this.rateLimiter.minuteTimestamps.push(now);
    this.rateLimiter.hourTimestamps.push(now);
  }

  // ===========================================================================
  // Private: Notification Methods
  // ===========================================================================

  /**
   * Send notification for pending approval.
   */
  private async sendApprovalNotification(decisionId: string, decision: AgentDecisionResult): Promise<void> {
    this.logger.info('Sending approval notification', { decisionId, intent: decision.intent });

    // In production, this would send email/notification
    // For now, just log
  }

  /**
   * Send error notification.
   */
  private async sendErrorNotification(error: Error, input: AgentInput): Promise<void> {
    this.logger.info('Sending error notification', {
      error: error.message,
      inputSource: input.source,
      inputType: input.type,
    });

    // In production, this would send email/notification to escalation address
  }

  // ===========================================================================
  // Private: Utility Methods
  // ===========================================================================

  /**
   * Convert an AgentEvent to AgentInput.
   */
  private eventToInput(event: AgentEvent): AgentInput {
    const payload = event.payload as Record<string, unknown>;

    // Build relatedEntityIds, only including eventId if defined
    const relatedEntityIds: Record<string, string> = {};
    if (event.eventId) {
      relatedEntityIds.eventId = event.eventId;
    }

    return {
      source: this.mapEventSourceToInputSource(event.source),
      type: event.type,
      rawContent: JSON.stringify(payload),
      structuredData: payload,
      metadata: {
        relatedEntityIds,
        ...event.metadata,
      },
      timestamp: event.timestamp,
      correlationId: event.correlationId,
    };
  }

  /**
   * Map event source to input source.
   */
  private mapEventSourceToInputSource(source: string | AgentInputSource): AgentInputSource {
    if (Object.values(AgentInputSource).includes(source as AgentInputSource)) {
      return source as AgentInputSource;
    }

    // Map 'agent' and 'system' to appropriate source
    switch (source) {
      case 'agent':
      case 'system':
        return AgentInputSource.WORKER;
      default:
        return AgentInputSource.API;
    }
  }

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


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
  AgentDecisionResult,
  DecisionContext,
  DecisionOutcome,
  DecisionStatus,
  Logger,
  AgentAction,
  LLMModel,
  AgentStats,
  DecisionRecord,
} from '../types/agent.types';
import {
  AgentEventType,
  LLMProvider,
  DecisionType,
  AgentInputSource,
  DecisionType as DecisionTypeEnum,
  DecisionStatus as DecisionStatusEnum,
  DEFAULT_AGENT_CONFIG,
} from '../types/agent.types';
import type { ILLMClient } from './LLMClient';
import { createLLMClient, createFallbackClient } from './LLMFactory';
import { AgentEventBus, type EmitResult } from '../inputs/EventBus';
import { DecisionEngine } from './DecisionEngine';
import { ActionExecutor } from './ActionExecutor';
import { TaskExecutionAgent } from './TaskExecutionAgent';
import { AgentContextService } from '../services/AgentContextService';
import { AgentRateLimiter } from '../services/AgentRateLimiter';
import { AgentStatsManager } from '../services/AgentStatsManager';

// =============================================================================
// Interfaces
// =============================================================================

export interface OrchestrationAgentConfig extends AgentConfig {
  orgId: string;
}

interface PendingDecision {
  id: string;
  decision: AgentDecisionResult;
  input: AgentInput;
  context: DecisionContext;
  createdAt: Date;
  expiresAt: Date;
}

// =============================================================================
// OrchestrationAgent Class
// =============================================================================

export class OrchestrationAgent {
  private config: OrchestrationAgentConfig;
  private logger: Logger;
  private eventBus: AgentEventBus;
  private decisionEngine: DecisionEngine;
  private actionExecutor: ActionExecutor;
  private llmClient: ILLMClient;
  private taskExecutionAgent: TaskExecutionAgent;

  // Services
  private contextService: AgentContextService;
  private rateLimiter: AgentRateLimiter;
  private statsManager: AgentStatsManager;

  // State
  private isRunning: boolean = false;
  private pendingDecisions: Map<string, PendingDecision> = new Map();
  private agentId: string;

  constructor(config: OrchestrationAgentConfig) {
    this.config = this.validateAndMergeConfig(config);
    this.agentId = `agent-${this.config.orgId}`;

    // Initialize logger: use from config if provided, otherwise default to console
    this.logger = this.config.logger || {
      debug: (msg, data) => console.debug(`[OrchestrationAgent] ${msg}`, data ?? ''),
      info: (msg, data) => console.info(`[OrchestrationAgent] ${msg}`, data ?? ''),
      warn: (msg, data) => console.warn(`[OrchestrationAgent] ${msg}`, data ?? ''),
      error: (msg, err, data) => console.error(`[OrchestrationAgent] ${msg}`, err, data ?? ''),
    };

    // Initialize components
    this.eventBus = AgentEventBus.getInstance();

    this.decisionEngine = new DecisionEngine({
      autoExecuteThreshold: this.config.autoExecuteThreshold,
      requireApprovalThreshold: this.config.requireApprovalThreshold,
      logger: this.logger,
    });

    this.actionExecutor = new ActionExecutor({
      dryRun: this.config.dryRun ?? false,
      orgId: this.config.orgId,
      logger: this.logger,
    });

    this.llmClient = this.initializeLLMClient();
    this.taskExecutionAgent = new TaskExecutionAgent(this.logger);

    // Initialize Services
    this.contextService = new AgentContextService({
      orgId: this.config.orgId,
      enabledActions: this.config.enabledActions!
    });
    this.rateLimiter = new AgentRateLimiter();
    this.statsManager = new AgentStatsManager();
  }

  // ===========================================================================
  // Lifecycle Methods
  // ===========================================================================

  /**
   * Start the agent.
   */
  async start(): Promise<void> {
    if (this.isRunning) return;

    this.logger.info('Starting Orchestration Agent', { orgId: this.config.orgId });
    this.isRunning = true;

    // Subscribe to events
    // Subscribe to events using wildcard handlers for broad categories
    this.eventBus.onAny(this.handleEvent.bind(this));

    this.logger.info('Orchestration Agent started');
  }

  /**
   * Check if the agent is currently running.
   */
  public isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Stop the agent.
   */
  async stop(): Promise<void> {
    if (!this.isRunning) return;

    this.logger.info('Stopping Orchestration Agent');
    this.isRunning = false;

    // Unsubscribe (would need tracked subscriptions to do generically)
    // For now assuming event bus handles cleanup or we restart process
  }

  // ===========================================================================
  // Core Processing Loop
  // ===========================================================================

  /**
   * Process a single input through the agent loop.
   */
  async process(input: AgentInput): Promise<AgentDecisionResult> {
    const startTime = Date.now();
    const correlationId = input.correlationId || `req-${startTime}`;

    this.logger.info('Processing input', {
      type: input.type,
      source: input.source,
      correlationId
    });

    // Detect Slash Commands as special intents
    if (input.rawContent.startsWith('/task add')) {
      this.logger.info('Detected /task add command, initiating task creation mission');
      input.rawContent = `MISSION: Help me create a new task. Guide me through selecting a type (use LIST_TASK_TEMPLATES if I'm not specific) and gathering details. ${input.rawContent.replace('/task add', '').trim()}`;
    } else if (input.rawContent.startsWith('/task report')) {
      this.logger.info('Detected /task report command');
      input.rawContent = `MISSION: Show me the current status of the task board. Use GET_KANBAN_STATE and provide a summary of what's in progress, new, and blocked.`;
    } else if (input.rawContent.startsWith('/automation report')) {
      this.logger.info('Detected /automation report command');
      input.rawContent = `MISSION: Give me a status report on automations. Use LIST_ACTIVE_AUTOMATIONS and summarize the current state.`;
    } else if (input.rawContent.startsWith('/')) {
      this.logger.debug('Detected other slash command', { command: input.rawContent.split(' ')[0] });
    }

    // Check rate limits
    if (this.rateLimiter.isRateLimited(this.config.maxActionsPerMinute, this.config.maxActionsPerHour)) {
      this.logger.warn('Rate limit exceeded, rejecting input');
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    try {
      // Build decision context
      const context = await this.contextService.buildDecisionContext(input, this.agentId);

      // Build LLM prompts
      const systemPrompt = await this.contextService.buildSystemPrompt(context.org);
      const userPrompt = this.contextService.buildUserPrompt(input, context);

      // Make LLM call
      const llmResponse = await this.makeLLMDecision(systemPrompt, userPrompt);

      // Process LLM response through decision engine
      const decision = this.decisionEngine.processLLMResponse(llmResponse, context);

      // Record stats
      const decisionTime = Date.now() - startTime;
      this.statsManager.recordDecisionTime(decisionTime);
      this.statsManager.incrementTotalDecisions();
      this.rateLimiter.recordAction();

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
        await this.statsManager.recordDecision(
          this.agentId,
          this.config.orgId,
          input,
          decision,
          outcome,
          { prompt: systemPrompt, response: llmResponse }
        );

        if (outcome.status === DecisionStatusEnum.EXECUTED) {
          this.statsManager.incrementSuccessfulDecisions();
        } else {
          this.statsManager.incrementFailedDecisions();
        }

        return {
          ...decision,
          executionResults: outcome.results,
          errors: outcome.errors,
        };

      } else if (this.decisionEngine.requiresApproval(decision)) {
        // Requires approval
        this.logger.info('Decision requires approval', {
          intent: decision.intent,
          confidence: decision.confidence,
        });

        const pendingId = this.storePendingDecision(decision, input, context);
        this.statsManager.incrementPendingApprovals();

        // Record as pending
        await this.statsManager.recordDecision(
          this.agentId,
          this.config.orgId,
          input,
          decision,
          {
            status: DecisionStatusEnum.REQUIRES_APPROVAL,
            executionTime: 0,
            results: [],
            errors: [],
            completedAt: new Date(),
          },
          { prompt: systemPrompt, response: llmResponse }
        );

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

        this.statsManager.incrementFailedDecisions();

        await this.statsManager.recordDecision(
          this.agentId,
          this.config.orgId,
          input,
          decision,
          {
            status: DecisionStatusEnum.REJECTED,
            executionTime: 0,
            results: [],
            errors: [{ action: DecisionTypeEnum.NO_ACTION, code: 'LOW_CONFIDENCE', message: 'Confidence below threshold', retryable: false }],
            completedAt: new Date(),
          },
          { prompt: systemPrompt, response: llmResponse }
        );

        return decision;
      }

    } catch (error) {
      this.statsManager.incrementTotalErrors();
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
    this.statsManager.incrementTotalEvents();

    this.logger.debug('Handling event', {
      type: event.type,
      eventId: event.eventId,
    });

    // Handle task:created events for autonomous execution
    if (event.type === 'task:created') {
      try {
        const taskId = (event.payload as any).id;
        if (taskId) {
          // Fire and forget - don't await strictly effectively
          this.taskExecutionAgent.handleTaskCreated(taskId);
        }
      } catch (error) {
        this.logger.error('Error handling task:created event', error as Error);
      }
      return;
    }

    // Skip agent's own events to prevent loops
    if (event.source === 'agent' || event.type === 'agent:action_executed') {
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

  async approveDecision(decisionId: string): Promise<DecisionOutcome> {
    const pending = this.pendingDecisions.get(decisionId);

    if (!pending) {
      throw new Error(`Pending decision not found: ${decisionId}`);
    }

    this.logger.info('Approving decision', { decisionId });

    if (new Date() > pending.expiresAt) {
      this.pendingDecisions.delete(decisionId);
      this.statsManager.decrementPendingApprovals();
      throw new Error('Decision has expired');
    }

    const outcome = await this.executeDecision(pending.decision, decisionId);

    this.pendingDecisions.delete(decisionId);
    this.statsManager.decrementPendingApprovals();

    if (outcome.status === DecisionStatusEnum.EXECUTED) {
      this.statsManager.incrementSuccessfulDecisions();
    } else {
      this.statsManager.incrementFailedDecisions();
    }

    return outcome;
  }

  async rejectDecision(decisionId: string, reason: string): Promise<void> {
    const pending = this.pendingDecisions.get(decisionId);

    if (!pending) {
      throw new Error(`Pending decision not found: ${decisionId}`);
    }

    this.logger.info('Rejecting decision', { decisionId, reason });

    this.pendingDecisions.delete(decisionId);
    this.statsManager.decrementPendingApprovals();
    this.statsManager.incrementFailedDecisions();

    // Record rejection
    await this.statsManager.recordDecision(
      this.agentId,
      this.config.orgId,
      pending.input,
      pending.decision,
      {
        status: DecisionStatusEnum.REJECTED,
        executionTime: 0,
        results: [],
        errors: [{ action: DecisionTypeEnum.NO_ACTION, code: 'REJECTED', message: reason, retryable: false }],
        completedAt: new Date(),
      },
      { prompt: '', response: '' } // Context lost for brevity
    );
  }

  // ===========================================================================
  // Configuration Methods
  // ===========================================================================

  updateConfig(config: Partial<OrchestrationAgentConfig>): void {
    this.config = { ...this.config, ...config };

    // Update sub-components
    this.decisionEngine.updateConfig({
      autoExecuteThreshold: this.config.autoExecuteThreshold,
      requireApprovalThreshold: this.config.requireApprovalThreshold,
    });

    if (config.dryRun !== undefined) {
      this.actionExecutor.setDryRun(config.dryRun);
    }

    this.contextService.updateConfig({
      orgId: config.orgId,
      enabledActions: config.enabledActions
    });

    this.logger.info('Configuration updated');
  }

  getConfig(): Readonly<OrchestrationAgentConfig> {
    return { ...this.config };
  }

  // ===========================================================================
  // Statistics Methods
  // ===========================================================================

  getStats(): AgentStats {
    const rateLimitUse = this.rateLimiter.getUsage();
    return this.statsManager.getStats({
      ...rateLimitUse,
      isLimited: this.rateLimiter.isRateLimited(this.config.maxActionsPerMinute, this.config.maxActionsPerHour)
    });
  }

  getDecisionHistory(limit?: number): DecisionRecord[] {
    return this.statsManager.getDecisionHistory(limit);
  }

  // ===========================================================================
  // Private: LLM & Execution Helpers
  // ===========================================================================

  protected initializeLLMClient(): ILLMClient {
    // We now construct a fallback chain:
    // 1. Primary configured provider (from config or env)
    // 2. Gemini (Free Tier) - if invalid key, will fail fast
    // 3. Ollama (Local) - if not running, will fail fast

    const clients: ILLMClient[] = [];

    // 1. Primary Client
    try {
      const primaryClient = createLLMClient({
        provider: this.config.llmProvider || LLMProvider.OPENAI,
        model: (this.config.llmModel as LLMModel) || 'gpt-4o',
        defaultOptions: {
          temperature: this.config.temperature,
          maxTokens: this.config.maxTokens,
        }
      });
      clients.push(primaryClient);
    } catch (e) {
      this.logger.warn('Failed to create primary LLM client', { error: e });
    }

    // 2. Free Tier / Fallbacks (Added automatically for robustness)
    // Only add if they aren't the primary one
    const currentProvider = this.config.llmProvider;

    if (currentProvider !== LLMProvider.GEMINI) {
      try {
        // Try to add Gemini
        const gemini = createLLMClient({
          provider: LLMProvider.GEMINI,
          model: 'gemini-2.0-flash'
        });
        if (gemini.isReady()) clients.push(gemini);
      } catch { }
    }

    if (currentProvider !== LLMProvider.OLLAMA) {
      try {
        // Try to add Ollama
        // Use env var or default to llama3. This allows users to set specific models like 'gemma:2b'
        const ollamaModel = (process.env.AGENT_DEFAULT_OLLAMA_MODEL as any) || 'llama3';

        const ollama = createLLMClient({
          provider: LLMProvider.OLLAMA,
          model: ollamaModel
        });
        // Ollama client is always "ready" if baseUrl is set (default), 
        // connectivity check happens at request time.
        clients.push(ollama);
      } catch { }
    }

    if (clients.length === 0) {
      throw new Error('No compatible LLM clients could be initialized.');
    }

    if (clients.length === 1) {
      return clients[0];
    }

    return createFallbackClient(clients);
  }

  private async makeLLMDecision(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      const response = await this.llmClient.complete([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]);
      return response.content;
    } catch (claudeError) {
      this.logger.error('[OA] Primary LLM failed, attempting OpenAI fallback', claudeError as Error);

      try {
        const openaiClient = createLLMClient({
          provider: LLMProvider.OPENAI,
          model: 'gpt-4o' as LLMModel,
          defaultOptions: { temperature: this.config.temperature },
        });

        const fallbackResponse = await openaiClient.complete([
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ]);
        return fallbackResponse.content;
      } catch (openaiError) {
        await this.eventBus.emit('intake:routing_failed', {
          error: 'LLM routing failed',
          timestamp: new Date(),
        }, { source: 'agent' });
        throw new Error('LLM routing failed');
      }
    }
  }

  private async executeDecision(
    decision: AgentDecisionResult,
    correlationId: string
  ): Promise<DecisionOutcome> {
    const outcome = await this.actionExecutor.execute(decision.actions, {
      executionId: correlationId,
      correlationId,
      dryRun: this.config.dryRun,
    });
    this.statsManager.incrementTotalActions(decision.actions.length);
    return outcome;
  }

  private storePendingDecision(
    decision: AgentDecisionResult,
    input: AgentInput,
    context: DecisionContext
  ): string {
    const id = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

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

  // ===========================================================================
  // Private: Notification & Utility Helpers
  // ===========================================================================

  private async sendApprovalNotification(decisionId: string, decision: AgentDecisionResult): Promise<void> {
    this.logger.info('Sending approval notification', { decisionId, intent: decision.intent });
    // Implementation would go here
  }

  private async sendErrorNotification(error: Error, input: AgentInput): Promise<void> {
    this.logger.info('Sending error notification', { error: error.message });
    // Implementation would go here
  }

  private eventToInput(event: AgentEvent): AgentInput {
    const payload = event.payload as Record<string, unknown>;
    const relatedEntityIds: Record<string, string> = {};
    if (event.eventId) relatedEntityIds.eventId = event.eventId;

    return {
      source: this.mapEventSourceToInputSource(event.source),
      type: event.type,
      rawContent: JSON.stringify(payload),
      structuredData: payload,
      metadata: { relatedEntityIds, ...event.metadata },
      timestamp: event.timestamp,
      correlationId: event.correlationId,
    };
  }

  private mapEventSourceToInputSource(source: string | AgentInputSource): AgentInputSource {
    if (Object.values(AgentInputSource).includes(source as AgentInputSource)) {
      return source as AgentInputSource;
    }
    switch (source) {
      case 'agent':
      case 'system': return AgentInputSource.WORKER;
      default: return AgentInputSource.API;
    }
  }

  private validateAndMergeConfig(config: OrchestrationAgentConfig): OrchestrationAgentConfig {
    return {
      ...config,
      orgId: config.orgId,
      llmProvider: config.llmProvider ?? LLMProvider.OPENAI,
      llmModel: config.llmModel ?? 'gpt-4o',
      temperature: config.temperature ?? DEFAULT_AGENT_CONFIG.temperature,
      autoExecuteThreshold: config.autoExecuteThreshold ?? DEFAULT_AGENT_CONFIG.autoExecuteThreshold,
      requireApprovalThreshold: config.requireApprovalThreshold ?? DEFAULT_AGENT_CONFIG.requireApprovalThreshold,
      enabledActions: config.enabledActions ?? Object.values(DecisionTypeEnum),
      maxActionsPerMinute: config.maxActionsPerMinute ?? DEFAULT_AGENT_CONFIG.maxActionsPerMinute,
      maxActionsPerHour: config.maxActionsPerHour ?? DEFAULT_AGENT_CONFIG.maxActionsPerHour,
      notifyOnHighPriority: config.notifyOnHighPriority ?? true,
      notifyOnFailure: config.notifyOnFailure ?? true,
      escalationEmail: config.escalationEmail ?? 'admin@example.com',
      logger: config.logger,
    };
  }
}

/**
 * Factory Function
 */
export function createOrchestrationAgent(config: Partial<OrchestrationAgentConfig> & { orgId: string }): OrchestrationAgent {
  // @ts-ignore - OrchestrationAgent constructor handles merging defaults
  return new OrchestrationAgent(config as OrchestrationAgentConfig);
}

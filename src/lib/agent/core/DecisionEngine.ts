/**
 * DecisionEngine - Converts LLM responses into executable actions
 *
 * The DecisionEngine is responsible for:
 * - Parsing and validating LLM responses
 * - Converting raw responses to typed AgentAction objects
 * - Applying confidence thresholds (auto-execute vs require approval)
 * - Validating decisions against agent capabilities
 * - Providing fallback logic when LLM fails
 *
 * @module DecisionEngine
 */

import type {
  AgentDecisionResult,
  AgentAction,
  DecisionType,
  AgentInput,
  IntentClassification,
  Logger,
  DecisionContext,
} from '../types/agent.types';
import {
  DecisionType as DecisionTypeEnum,
  DEFAULT_AGENT_CONFIG,
} from '../types/agent.types';

// =============================================================================
// Constants
// =============================================================================

/** Default confidence when LLM cannot determine */
const DEFAULT_FALLBACK_CONFIDENCE = 0.3;

/** Minimum confidence to consider a decision valid */
const MIN_VALID_CONFIDENCE = 0.1;

/** Keywords for fallback intent detection */
const INTENT_KEYWORDS: Record<string, string[]> = {
  SALES_INQUIRY: ['price', 'pricing', 'cost', 'quote', 'buy', 'purchase', 'demo', 'trial'],
  SUPPORT_REQUEST: ['help', 'support', 'issue', 'problem', 'error', 'bug', 'not working', 'broken'],
  BILLING_QUESTION: ['billing', 'invoice', 'payment', 'charge', 'subscription', 'refund'],
  PARTNERSHIP: ['partnership', 'partner', 'reseller', 'affiliate', 'integrate', 'api'],
  SCHEDULING: ['schedule', 'meeting', 'appointment', 'calendar', 'book', 'slot', 'availability'],
  GENERAL: [],
};

/** Urgency keywords for priority detection */
const URGENCY_KEYWORDS = {
  HIGH: ['urgent', 'emergency', 'asap', 'immediately', 'critical', 'down', 'outage'],
  MEDIUM: ['important', 'soon', 'priority', 'deadline'],
  LOW: ['whenever', 'no rush', 'low priority', 'when possible'],
};

// =============================================================================
// Types
// =============================================================================

/**
 * Configuration for the DecisionEngine
 */
export interface DecisionEngineConfig {
  /** Confidence threshold for automatic execution (default: 0.85) */
  autoExecuteThreshold: number;
  /** Confidence threshold requiring approval (default: 0.5) */
  requireApprovalThreshold: number;
  /** Enabled action types */
  enabledActions: DecisionType[];
  /** Custom logger */
  logger?: Logger;
  /** Enable fallback mode when LLM fails */
  enableFallback: boolean;
  /** Default pipeline ID for fallback routing */
  fallbackPipelineId?: string;
  /** Fallback assignee ID */
  fallbackAssigneeId?: string;
}

/**
 * Result of decision validation
 */
export interface ValidationResult {
  /** Whether the decision is valid */
  isValid: boolean;
  /** Validation errors */
  errors: string[];
  /** Validation warnings */
  warnings: string[];
  /** Sanitized decision (if valid) */
  sanitizedDecision?: AgentDecisionResult;
}

/**
 * Fallback decision when LLM fails
 */
export interface FallbackDecision {
  /** The fallback decision result */
  decision: AgentDecisionResult;
  /** Reason for fallback */
  reason: string;
  /** Whether this was a complete failure or partial */
  isPartialFailure: boolean;
}

/**
 * Raw LLM response before validation
 */
interface RawLLMResponse {
  intent?: string;
  confidence?: number;
  reasoning?: string;
  actions?: unknown[];
  requiresApproval?: boolean;
  priority?: number;
  warnings?: string[];
  alternatives?: unknown[];
}

// =============================================================================
// Default Logger
// =============================================================================

const defaultLogger: Logger = {
  debug: (msg, data) => console.debug(`[DecisionEngine] ${msg}`, data ?? ''),
  info: (msg, data) => console.info(`[DecisionEngine] ${msg}`, data ?? ''),
  warn: (msg, data) => console.warn(`[DecisionEngine] ${msg}`, data ?? ''),
  error: (msg, err, data) => console.error(`[DecisionEngine] ${msg}`, err, data ?? ''),
};

// =============================================================================
// DecisionEngine Class
// =============================================================================

/**
 * DecisionEngine processes LLM outputs and converts them to executable decisions.
 *
 * @example
 * ```typescript
 * const engine = new DecisionEngine({
 *   autoExecuteThreshold: 0.85,
 *   requireApprovalThreshold: 0.5,
 *   enabledActions: [DecisionType.ASSIGN_PIPELINE, DecisionType.SEND_NOTIFICATION],
 *   enableFallback: true,
 * });
 *
 * // Process LLM response
 * const result = engine.processLLMResponse(rawResponse, context);
 *
 * // Check if should auto-execute
 * if (engine.shouldAutoExecute(result)) {
 *   await actionExecutor.execute(result.actions);
 * }
 * ```
 */
export class DecisionEngine {
  private config: DecisionEngineConfig;
  private logger: Logger;

  constructor(config: Partial<DecisionEngineConfig> = {}) {
    this.config = {
      autoExecuteThreshold: config.autoExecuteThreshold ?? DEFAULT_AGENT_CONFIG.autoExecuteThreshold,
      requireApprovalThreshold: config.requireApprovalThreshold ?? DEFAULT_AGENT_CONFIG.requireApprovalThreshold,
      enabledActions: config.enabledActions ?? Object.values(DecisionTypeEnum),
      enableFallback: config.enableFallback ?? true,
      fallbackPipelineId: config.fallbackPipelineId,
      fallbackAssigneeId: config.fallbackAssigneeId,
      logger: config.logger,
    };

    this.logger = config.logger ?? defaultLogger;
    this.logger.info('DecisionEngine initialized', {
      autoExecuteThreshold: this.config.autoExecuteThreshold,
      requireApprovalThreshold: this.config.requireApprovalThreshold,
      enabledActions: this.config.enabledActions.length,
    });
  }

  // ===========================================================================
  // Main Processing Methods
  // ===========================================================================

  /**
   * Process raw LLM response and convert to validated decision result.
   *
   * @param rawResponse - Raw response string or object from LLM
   * @param context - Decision context for validation
   * @returns Validated and sanitized decision result
   * @throws Error if response cannot be processed and fallback is disabled
   */
  processLLMResponse(
    rawResponse: string | Record<string, unknown>,
    context?: DecisionContext
  ): AgentDecisionResult {
    this.logger.debug('Processing LLM response');

    // Parse response
    let parsed: RawLLMResponse;
    try {
      parsed = this.parseResponse(rawResponse);
    } catch (error) {
      this.logger.warn('Failed to parse LLM response', { error: (error as Error).message });
      if (this.config.enableFallback && context) {
        return this.createFallbackDecision(context, `Parse error: ${(error as Error).message}`).decision;
      }
      throw error;
    }

    // Validate response
    const validation = this.validateDecision(parsed, context);

    if (!validation.isValid) {
      this.logger.warn('Decision validation failed', { errors: validation.errors });
      if (this.config.enableFallback && context) {
        return this.createFallbackDecision(context, `Validation failed: ${validation.errors.join(', ')}`).decision;
      }
      throw new Error(`Invalid decision: ${validation.errors.join(', ')}`);
    }

    // Log warnings if any
    if (validation.warnings.length > 0) {
      this.logger.warn('Decision has warnings', { warnings: validation.warnings });
    }

    const decision = validation.sanitizedDecision!;

    // Apply confidence thresholds
    const finalDecision = this.applyThresholds(decision);

    this.logger.info('Decision processed successfully', {
      intent: finalDecision.intent,
      confidence: finalDecision.confidence,
      actionCount: finalDecision.actions.length,
      requiresApproval: finalDecision.requiresApproval,
    });

    return finalDecision;
  }

  /**
   * Check if a decision should be auto-executed based on confidence.
   */
  shouldAutoExecute(decision: AgentDecisionResult): boolean {
    if (decision.requiresApproval) {
      return false;
    }
    return decision.confidence >= this.config.autoExecuteThreshold;
  }

  /**
   * Check if a decision requires human approval.
   */
  requiresApproval(decision: AgentDecisionResult): boolean {
    if (decision.requiresApproval) {
      return true;
    }
    return decision.confidence < this.config.autoExecuteThreshold &&
           decision.confidence >= this.config.requireApprovalThreshold;
  }

  /**
   * Check if a decision should be rejected (too low confidence).
   */
  shouldReject(decision: AgentDecisionResult): boolean {
    return decision.confidence < this.config.requireApprovalThreshold;
  }

  // ===========================================================================
  // Validation Methods
  // ===========================================================================

  /**
   * Validate a raw decision against the schema and agent capabilities.
   */
  validateDecision(
    raw: RawLLMResponse,
    context?: DecisionContext
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic structure validation
    if (typeof raw.intent !== 'string' || !raw.intent.trim()) {
      errors.push('Missing or empty "intent" field');
    }

    if (typeof raw.confidence !== 'number' || isNaN(raw.confidence)) {
      errors.push('Missing or invalid "confidence" field');
    } else if (raw.confidence < 0 || raw.confidence > 1) {
      errors.push('"confidence" must be between 0 and 1');
    } else if (raw.confidence < MIN_VALID_CONFIDENCE) {
      warnings.push(`Very low confidence (${raw.confidence}), consider rejecting`);
    }

    if (typeof raw.reasoning !== 'string') {
      warnings.push('Missing "reasoning" field - audit trail may be incomplete');
    }

    if (!Array.isArray(raw.actions)) {
      errors.push('Missing or invalid "actions" field (expected array)');
    }

    if (typeof raw.requiresApproval !== 'boolean') {
      warnings.push('Missing "requiresApproval" field, defaulting to false');
    }

    // If there are structural errors, return early
    if (errors.length > 0) {
      return { isValid: false, errors, warnings };
    }

    // Validate actions
    const validatedActions: AgentAction[] = [];
    for (let i = 0; i < raw.actions!.length; i++) {
      const action = raw.actions![i];
      const actionValidation = this.validateAction(action, i, context);

      if (actionValidation.errors.length > 0) {
        errors.push(...actionValidation.errors);
      }
      if (actionValidation.warnings.length > 0) {
        warnings.push(...actionValidation.warnings);
      }
      if (actionValidation.validatedAction) {
        validatedActions.push(actionValidation.validatedAction);
      }
    }

    // If there are action errors, return
    if (errors.length > 0) {
      return { isValid: false, errors, warnings };
    }

    // Build sanitized decision
    const sanitizedDecision: AgentDecisionResult = {
      intent: raw.intent!.trim(),
      confidence: raw.confidence!,
      reasoning: raw.reasoning ?? 'No reasoning provided',
      actions: validatedActions,
      requiresApproval: raw.requiresApproval ?? false,
      priority: typeof raw.priority === 'number' ? Math.min(5, Math.max(1, raw.priority)) : undefined,
      warnings: [...(raw.warnings as string[] || []), ...warnings],
    };

    // Validate alternatives if present
    if (Array.isArray(raw.alternatives) && raw.alternatives.length > 0) {
      sanitizedDecision.alternatives = raw.alternatives
        .filter((alt): alt is Record<string, unknown> =>
          typeof alt === 'object' && alt !== null &&
          typeof (alt as Record<string, unknown>).intent === 'string' &&
          typeof (alt as Record<string, unknown>).confidence === 'number'
        )
        .map(alt => ({
          intent: String(alt.intent),
          confidence: Number(alt.confidence),
          reason: String(alt.reason ?? 'No reason provided'),
        }));
    }

    return {
      isValid: true,
      errors: [],
      warnings,
      sanitizedDecision,
    };
  }

  /**
   * Validate a single action.
   */
  private validateAction(
    rawAction: unknown,
    index: number,
    context?: DecisionContext
  ): { validatedAction?: AgentAction; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (typeof rawAction !== 'object' || rawAction === null) {
      errors.push(`Action ${index}: Invalid action format`);
      return { errors, warnings };
    }

    const action = rawAction as Record<string, unknown>;

    // Validate action type
    if (typeof action.type !== 'string') {
      errors.push(`Action ${index}: Missing or invalid "type" field`);
      return { errors, warnings };
    }

    const actionType = action.type as DecisionType;

    // Check if action type is valid
    if (!Object.values(DecisionTypeEnum).includes(actionType)) {
      errors.push(`Action ${index}: Unknown action type "${action.type}"`);
      return { errors, warnings };
    }

    // Check if action type is enabled
    if (!this.config.enabledActions.includes(actionType)) {
      errors.push(`Action ${index}: Action type "${action.type}" is not enabled`);
      return { errors, warnings };
    }

    // Check if action is in available actions (from context)
    if (context?.availableActions && !context.availableActions.includes(actionType)) {
      warnings.push(`Action ${index}: Action type "${action.type}" may not be available in current context`);
    }

    // Validate params
    if (typeof action.params !== 'object' || action.params === null) {
      errors.push(`Action ${index}: Missing or invalid "params" field`);
      return { errors, warnings };
    }

    // Validate action-specific params
    const paramsValidation = this.validateActionParams(actionType, action.params as Record<string, unknown>, index);
    errors.push(...paramsValidation.errors);
    warnings.push(...paramsValidation.warnings);

    if (errors.length > 0) {
      return { errors, warnings };
    }

    // Build validated action
    const validatedAction: AgentAction = {
      type: actionType,
      params: action.params as Record<string, unknown>,
      priority: typeof action.priority === 'number' ? Math.min(5, Math.max(1, action.priority)) : 3,
      requiresConfirmation: typeof action.requiresConfirmation === 'boolean' ? action.requiresConfirmation : false,
    };

    // Optional fields
    if (typeof action.delayMs === 'number' && action.delayMs > 0) {
      validatedAction.delayMs = action.delayMs;
    }

    if (typeof action.condition === 'object' && action.condition !== null) {
      const cond = action.condition as Record<string, unknown>;
      if (typeof cond.type === 'string' && typeof cond.params === 'object') {
        validatedAction.condition = {
          type: cond.type as 'time_range' | 'user_available' | 'slot_available' | 'custom',
          params: cond.params as Record<string, unknown>,
        };
      }
    }

    return { validatedAction, errors, warnings };
  }

  /**
   * Validate action-specific parameters.
   */
  private validateActionParams(
    type: DecisionType,
    params: Record<string, unknown>,
    index: number
  ): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const prefix = `Action ${index}:`;

    switch (type) {
      case DecisionTypeEnum.ASSIGN_PIPELINE:
        if (typeof params.intakeId !== 'string') {
          errors.push(`${prefix} ASSIGN_PIPELINE requires "intakeId" string`);
        }
        if (typeof params.pipelineId !== 'string') {
          errors.push(`${prefix} ASSIGN_PIPELINE requires "pipelineId" string`);
        }
        break;

      case DecisionTypeEnum.CREATE_EVENT:
        if (typeof params.title !== 'string') {
          errors.push(`${prefix} CREATE_EVENT requires "title" string`);
        }
        if (!params.startTime) {
          errors.push(`${prefix} CREATE_EVENT requires "startTime"`);
        }
        if (!params.endTime) {
          errors.push(`${prefix} CREATE_EVENT requires "endTime"`);
        }
        if (!Array.isArray(params.attendees)) {
          warnings.push(`${prefix} CREATE_EVENT missing "attendees" array`);
        }
        break;

      case DecisionTypeEnum.UPDATE_EVENT:
      case DecisionTypeEnum.CANCEL_EVENT:
        if (typeof params.eventId !== 'string') {
          errors.push(`${prefix} ${type} requires "eventId" string`);
        }
        break;

      case DecisionTypeEnum.SEND_NOTIFICATION:
        if (!params.recipientIds && !params.recipientEmails) {
          errors.push(`${prefix} SEND_NOTIFICATION requires "recipientIds" or "recipientEmails"`);
        }
        if (typeof params.type !== 'string') {
          errors.push(`${prefix} SEND_NOTIFICATION requires "type" string`);
        }
        if (typeof params.subject !== 'string') {
          errors.push(`${prefix} SEND_NOTIFICATION requires "subject" string`);
        }
        if (typeof params.body !== 'string') {
          errors.push(`${prefix} SEND_NOTIFICATION requires "body" string`);
        }
        break;

      case DecisionTypeEnum.TRIGGER_AUTOMATION:
        if (typeof params.workflowId !== 'string') {
          errors.push(`${prefix} TRIGGER_AUTOMATION requires "workflowId" string`);
        }
        if (typeof params.payload !== 'object') {
          warnings.push(`${prefix} TRIGGER_AUTOMATION missing "payload" object`);
        }
        break;

      case DecisionTypeEnum.ESCALATE:
        if (typeof params.reason !== 'string') {
          errors.push(`${prefix} ESCALATE requires "reason" string`);
        }
        if (typeof params.level !== 'number') {
          errors.push(`${prefix} ESCALATE requires "level" number`);
        }
        if (typeof params.priority !== 'string') {
          errors.push(`${prefix} ESCALATE requires "priority" string`);
        }
        break;

      case DecisionTypeEnum.NO_ACTION:
        // No params required
        break;
    }

    return { errors, warnings };
  }

  // ===========================================================================
  // Threshold & Decision Methods
  // ===========================================================================

  /**
   * Apply confidence thresholds to determine if approval is needed.
   */
  private applyThresholds(decision: AgentDecisionResult): AgentDecisionResult {
    // If LLM explicitly said approval is needed, respect that
    if (decision.requiresApproval) {
      return decision;
    }

    // Check if any action requires confirmation
    const hasConfirmationRequired = decision.actions.some(a => a.requiresConfirmation);
    if (hasConfirmationRequired) {
      return { ...decision, requiresApproval: true };
    }

    // Apply confidence threshold
    if (decision.confidence < this.config.autoExecuteThreshold) {
      return { ...decision, requiresApproval: true };
    }

    return decision;
  }

  // ===========================================================================
  // Fallback Methods
  // ===========================================================================

  /**
   * Create a fallback decision when LLM fails or returns invalid response.
   * Uses rule-based logic to make a basic routing decision.
   */
  createFallbackDecision(context: DecisionContext, reason: string): FallbackDecision {
    this.logger.info('Creating fallback decision', { reason });

    const input = context.input;
    const intent = this.detectIntentFromContent(input.rawContent);
    const urgency = this.detectUrgencyFromContent(input.rawContent);

    // Build basic actions based on detected intent
    const actions: AgentAction[] = [];

    // Default action: assign to pipeline with escalation note
    if (this.config.enabledActions.includes(DecisionTypeEnum.ASSIGN_PIPELINE)) {
      const pipelineId = this.selectFallbackPipeline(context, intent);

      if (pipelineId) {
        actions.push({
          type: DecisionTypeEnum.ASSIGN_PIPELINE,
          params: {
            intakeId: input.structuredData?.intakeId ?? 'unknown',
            pipelineId,
            priority: urgency,
            notes: `[FALLBACK] ${reason}. Intent detected: ${intent}`,
          },
          priority: urgency,
          requiresConfirmation: true,
        });
      }
    }

    // If high urgency, also escalate
    if (urgency >= 4 && this.config.enabledActions.includes(DecisionTypeEnum.ESCALATE)) {
      actions.push({
        type: DecisionTypeEnum.ESCALATE,
        params: {
          reason: `High urgency item routed via fallback: ${reason}`,
          level: 1,
          priority: 'high',
        },
        priority: 5,
        requiresConfirmation: false,
      });
    }

    // If no actions could be created, add NO_ACTION
    if (actions.length === 0) {
      actions.push({
        type: DecisionTypeEnum.NO_ACTION,
        params: { reason: `Fallback with no suitable action: ${reason}` },
        priority: 3,
        requiresConfirmation: false,
      });
    }

    const decision: AgentDecisionResult = {
      intent,
      confidence: DEFAULT_FALLBACK_CONFIDENCE,
      reasoning: `[FALLBACK] ${reason}. Rule-based detection used.`,
      actions,
      requiresApproval: true, // Always require approval for fallback
      priority: urgency,
      warnings: [`Decision made via fallback logic: ${reason}`],
    };

    return {
      decision,
      reason,
      isPartialFailure: true,
    };
  }

  /**
   * Detect intent from content using keyword matching.
   */
  private detectIntentFromContent(content: string): string {
    const lowerContent = content.toLowerCase();

    for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        return intent;
      }
    }

    return 'GENERAL';
  }

  /**
   * Detect urgency level from content (1-5).
   */
  private detectUrgencyFromContent(content: string): number {
    const lowerContent = content.toLowerCase();

    if (URGENCY_KEYWORDS.HIGH.some(kw => lowerContent.includes(kw))) {
      return 5;
    }
    if (URGENCY_KEYWORDS.MEDIUM.some(kw => lowerContent.includes(kw))) {
      return 3;
    }
    if (URGENCY_KEYWORDS.LOW.some(kw => lowerContent.includes(kw))) {
      return 1;
    }

    return 2; // Default to low-medium
  }

  /**
   * Select appropriate fallback pipeline based on context and intent.
   */
  private selectFallbackPipeline(context: DecisionContext, intent: string): string | undefined {
    // If configured fallback pipeline, use it
    if (this.config.fallbackPipelineId) {
      return this.config.fallbackPipelineId;
    }

    // Try to match by intent/category
    const pipelines = context.org.pipelines;

    // Look for matching category
    const intentLower = intent.toLowerCase();
    for (const pipeline of pipelines) {
      if (pipeline.category.toLowerCase().includes(intentLower) ||
          pipeline.name.toLowerCase().includes(intentLower)) {
        return pipeline.id;
      }
    }

    // Use default from org settings
    if (context.org.settings.defaultPipeline) {
      return context.org.settings.defaultPipeline;
    }

    // Use first active pipeline
    const activePipeline = pipelines.find(p => p.isActive !== false);
    return activePipeline?.id;
  }

  // ===========================================================================
  // Utility Methods
  // ===========================================================================

  /**
   * Parse raw LLM response (string or object).
   */
  private parseResponse(response: string | Record<string, unknown>): RawLLMResponse {
    if (typeof response === 'object') {
      return response as RawLLMResponse;
    }

    // Try to extract JSON from string
    let jsonString = response.trim();

    // Remove markdown code blocks if present
    const codeBlockMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      jsonString = codeBlockMatch[1].trim();
    }

    try {
      return JSON.parse(jsonString) as RawLLMResponse;
    } catch (error) {
      throw new Error(`Failed to parse LLM response as JSON: ${(error as Error).message}`);
    }
  }

  /**
   * Create a basic intent classification from input.
   */
  classifyIntentBasic(input: AgentInput): IntentClassification {
    const intent = this.detectIntentFromContent(input.rawContent);
    const urgency = this.detectUrgencyFromContent(input.rawContent);

    return {
      intent,
      confidence: DEFAULT_FALLBACK_CONFIDENCE,
      urgency,
      keywords: this.extractKeywords(input.rawContent),
      entities: [], // Basic classification doesn't extract entities
    };
  }

  /**
   * Extract keywords from content (simple extraction).
   */
  private extractKeywords(content: string): string[] {
    const allKeywords = Object.values(INTENT_KEYWORDS).flat();
    const lowerContent = content.toLowerCase();

    return allKeywords.filter(keyword => lowerContent.includes(keyword));
  }

  /**
   * Update engine configuration.
   */
  updateConfig(config: Partial<DecisionEngineConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.info('Configuration updated', {
      autoExecuteThreshold: this.config.autoExecuteThreshold,
      requireApprovalThreshold: this.config.requireApprovalThreshold,
    });
  }

  /**
   * Get current configuration.
   */
  getConfig(): Readonly<DecisionEngineConfig> {
    return { ...this.config };
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a new DecisionEngine instance.
 */
export function createDecisionEngine(
  config?: Partial<DecisionEngineConfig>
): DecisionEngine {
  return new DecisionEngine(config);
}


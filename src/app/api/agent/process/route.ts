import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import {
  OrchestrationAgent,
  createOrchestrationAgent,
  LLMProvider,
  type OrchestrationAgentConfig,
} from '@/lib/agent/core';
import {
  AgentInputSource,
  DecisionType,
  type AgentInput,
  type AgentDecisionResult,
} from '@/lib/agent/types/agent.types';

/**
 * Agent Process API Configuration
 *
 * Environment variables:
 * - DEFAULT_ORG_ID: Default organization ID
 * - AGENT_LLM_PROVIDER: 'OPENAI' | 'CLAUDE' (default: CLAUDE)
 * - AGENT_LLM_MODEL: Model identifier
 * - AGENT_AUTO_EXECUTE_THRESHOLD: Confidence threshold for auto-execution
 * - AGENT_REQUIRE_APPROVAL_THRESHOLD: Confidence threshold below which approval is required
 */
const DEFAULT_ORG_ID = process.env.DEFAULT_ORG_ID || '';
const LLM_PROVIDER = (process.env.AGENT_LLM_PROVIDER as 'OPENAI' | 'CLAUDE') || 'CLAUDE';
const LLM_MODEL = process.env.AGENT_LLM_MODEL || 'claude-sonnet-4-20250514';
const AUTO_EXECUTE_THRESHOLD = parseFloat(process.env.AGENT_AUTO_EXECUTE_THRESHOLD || '0.85');
const REQUIRE_APPROVAL_THRESHOLD = parseFloat(process.env.AGENT_REQUIRE_APPROVAL_THRESHOLD || '0.5');

/**
 * Logger utility
 */
const logger = {
  info: (message: string, data?: Record<string, unknown>) => {
    console.info(`[Agent Process API] ${message}`, data ?? '');
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    console.warn(`[Agent Process API] ${message}`, data ?? '');
  },
  error: (message: string, error?: unknown, data?: Record<string, unknown>) => {
    console.error(`[Agent Process API] ${message}`, error, data ?? '');
  },
  debug: (message: string, data?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[Agent Process API] ${message}`, data ?? '');
    }
  },
};

/**
 * Valid input sources
 */
const VALID_SOURCES = Object.values(AgentInputSource);

/**
 * Zod schema for the process input request
 */
const ProcessInputSchema = z.object({
  // Required fields
  source: z.enum(VALID_SOURCES as [string, ...string[]]),
  type: z.string().min(1, 'type is required'),
  content: z.string().min(1, 'content is required'),

  // Optional metadata
  metadata: z.object({
    senderEmail: z.string().email().optional(),
    senderName: z.string().optional(),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
    webhookSignature: z.string().optional(),
    headers: z.record(z.string()).optional(),
    relatedEntityIds: z.record(z.string()).optional(),
    priorityHint: z.number().int().min(1).max(5).optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),

  // Structured data (parsed form data, etc.)
  structuredData: z.record(z.unknown()).optional(),

  // Processing options
  options: z.object({
    // Organization ID (defaults to DEFAULT_ORG_ID)
    orgId: z.string().optional(),
    // Dry run mode - don't execute actions, just return decision
    dryRun: z.boolean().optional(),
    // Force approval requirement regardless of confidence
    forceApproval: z.boolean().optional(),
    // Custom confidence thresholds
    autoExecuteThreshold: z.number().min(0).max(1).optional(),
    requireApprovalThreshold: z.number().min(0).max(1).optional(),
  }).optional(),
});

type ProcessInputRequest = z.infer<typeof ProcessInputSchema>;

/**
 * Agent instance cache
 * In production, you might want to use a more sophisticated caching mechanism
 */
const agentCache = new Map<string, OrchestrationAgent>();

/**
 * Get or create an agent instance for the organization
 */
function getOrCreateAgent(orgId: string, options?: ProcessInputRequest['options']): OrchestrationAgent {
  const cacheKey = `${orgId}-${options?.dryRun ? 'dry' : 'live'}`;

  if (agentCache.has(cacheKey)) {
    return agentCache.get(cacheKey)!;
  }

  const config: OrchestrationAgentConfig = {
    orgId,
    llmProvider: LLMProvider[LLM_PROVIDER] || LLMProvider.CLAUDE,
    llmModel: LLM_MODEL,
    temperature: 0.3,
    autoExecuteThreshold: options?.autoExecuteThreshold ?? AUTO_EXECUTE_THRESHOLD,
    requireApprovalThreshold: options?.requireApprovalThreshold ?? REQUIRE_APPROVAL_THRESHOLD,
    enabledActions: Object.values(DecisionType),
    maxActionsPerMinute: 60,
    maxActionsPerHour: 500,
    notifyOnHighPriority: true,
    notifyOnFailure: true,
    escalationEmail: process.env.ESCALATION_EMAIL || 'admin@example.com',
    dryRun: options?.dryRun ?? false,
    logger,
  };

  const agent = createOrchestrationAgent(config);
  agentCache.set(cacheKey, agent);

  logger.info('Created new agent instance', { orgId, cacheKey, dryRun: options?.dryRun });

  return agent;
}

/**
 * Convert request to AgentInput
 */
function requestToAgentInput(request: ProcessInputRequest, correlationId: string): AgentInput {
  return {
    source: request.source as AgentInputSource,
    type: request.type,
    rawContent: request.content,
    structuredData: request.structuredData,
    metadata: request.metadata,
    timestamp: new Date(),
    correlationId,
  };
}

/**
 * Format decision result for API response
 */
function formatDecisionResult(
  decision: AgentDecisionResult,
  correlationId: string,
  processingTimeMs: number
): Record<string, unknown> {
  return {
    success: true,
    correlationId,
    processingTimeMs,
    decision: {
      intent: decision.intent,
      confidence: decision.confidence,
      reasoning: decision.reasoning,
      requiresApproval: decision.requiresApproval,
      priority: decision.priority,
      warnings: decision.warnings,
      alternatives: decision.alternatives,
    },
    actions: decision.actions.map((action) => ({
      type: action.type,
      priority: action.priority,
      requiresConfirmation: action.requiresConfirmation,
      params: action.params,
      delayMs: action.delayMs,
    })),
  };
}

/**
 * POST /api/agent/process
 *
 * Manually process an input through the orchestration agent.
 *
 * Body:
 * {
 *   source: 'EMAIL' | 'WEBHOOK' | 'DB_TRIGGER' | 'WORKER' | 'API' | 'SCHEDULE',
 *   type: string,
 *   content: string,
 *   metadata?: { senderEmail?, senderName?, tags?, ... },
 *   structuredData?: Record<string, unknown>,
 *   options?: { orgId?, dryRun?, forceApproval?, ... }
 * }
 *
 * Returns: Decision result with actions
 *
 * Authentication: Should be protected in production (implement your auth middleware)
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const correlationId = crypto.randomUUID();

  logger.info('Received agent process request', { correlationId });

  try {
    // 1. Parse and validate request body
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch (parseError) {
      logger.error('Failed to parse JSON', parseError, { correlationId });
      return NextResponse.json(
        { error: 'Bad Request', details: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const validation = ProcessInputSchema.safeParse(rawBody);
    if (!validation.success) {
      logger.warn('Validation failed', {
        errors: validation.error.errors,
        correlationId,
      });
      return NextResponse.json(
        {
          error: 'Bad Request',
          details: 'Invalid request payload',
          validationErrors: validation.error.errors.map((e: { path: (string | number)[]; message: string }) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const request = validation.data;

    // 2. Determine organization ID
    const orgId = request.options?.orgId || DEFAULT_ORG_ID;

    if (!orgId) {
      logger.error('No organization ID available', { correlationId });
      return NextResponse.json(
        { error: 'Configuration Error', details: 'No organization configured' },
        { status: 500 }
      );
    }

    logger.info('Processing input', {
      source: request.source,
      type: request.type,
      orgId,
      dryRun: request.options?.dryRun,
      correlationId,
    });

    // 3. Get or create agent instance
    const agent = getOrCreateAgent(orgId, request.options);

    // 4. Convert request to AgentInput
    const agentInput = requestToAgentInput(request, correlationId);

    // 5. Process through agent
    let decision: AgentDecisionResult;
    try {
      decision = await agent.process(agentInput);
    } catch (processError) {
      logger.error('Agent processing failed', processError, {
        source: request.source,
        type: request.type,
        correlationId,
      });

      // Check for specific error types
      if (processError instanceof Error) {
        if (processError.message.includes('Rate limit')) {
          return NextResponse.json(
            {
              error: 'Too Many Requests',
              correlationId,
              details: processError.message,
            },
            { status: 429 }
          );
        }

        if (processError.message.includes('API key')) {
          return NextResponse.json(
            {
              error: 'Configuration Error',
              correlationId,
              details: 'LLM provider not configured',
            },
            { status: 500 }
          );
        }
      }

      throw processError;
    }

    // 6. Format and return response
    const processingTime = Date.now() - startTime;
    const response = formatDecisionResult(decision, correlationId, processingTime);

    // Add execution status if not dry run
    if (!request.options?.dryRun) {
      (response as Record<string, unknown>).executionStatus = decision.requiresApproval
        ? 'pending_approval'
        : 'executed';
    } else {
      (response as Record<string, unknown>).executionStatus = 'dry_run';
    }

    logger.info('Request processed successfully', {
      intent: decision.intent,
      confidence: decision.confidence,
      actionCount: decision.actions.length,
      requiresApproval: decision.requiresApproval,
      processingTimeMs: processingTime,
      correlationId,
    });

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    const processingTime = Date.now() - startTime;

    logger.error('Error processing request', error, {
      correlationId,
      processingTimeMs: processingTime,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        correlationId,
        processingTimeMs: processingTime,
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/agent/process
 *
 * Get API documentation and configuration status.
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    service: 'agent-process-api',
    status: 'active',
    timestamp: new Date().toISOString(),
    description: 'Manually process inputs through the orchestration agent',
    config: {
      llmProvider: LLM_PROVIDER,
      llmModel: LLM_MODEL,
      autoExecuteThreshold: AUTO_EXECUTE_THRESHOLD,
      requireApprovalThreshold: REQUIRE_APPROVAL_THRESHOLD,
      defaultOrgConfigured: !!DEFAULT_ORG_ID,
    },
    supportedSources: VALID_SOURCES,
    supportedActions: Object.values(DecisionType),
    requestSchema: {
      source: `'${VALID_SOURCES.join("' | '")}' (required)`,
      type: 'string (required) - e.g., "form_submitted", "email_received"',
      content: 'string (required) - The raw content/body to process',
      metadata: {
        senderEmail: 'string (optional)',
        senderName: 'string (optional)',
        priorityHint: 'number 1-5 (optional)',
        tags: 'string[] (optional)',
      },
      structuredData: 'Record<string, unknown> (optional) - Parsed/structured data',
      options: {
        orgId: 'string (optional) - Organization ID',
        dryRun: 'boolean (optional) - If true, returns decision without executing',
        forceApproval: 'boolean (optional) - Force approval requirement',
        autoExecuteThreshold: 'number 0-1 (optional) - Custom auto-execute threshold',
        requireApprovalThreshold: 'number 0-1 (optional) - Custom approval threshold',
      },
    },
    exampleRequest: {
      source: 'WEBHOOK',
      type: 'contact_form_submitted',
      content: 'Customer inquiry about enterprise pricing for 500+ users',
      metadata: {
        senderEmail: 'john@example.com',
        senderName: 'John Doe',
        tags: ['sales', 'enterprise'],
      },
      structuredData: {
        formType: 'contact',
        company: 'Acme Corp',
        employees: '500+',
        message: 'Looking for enterprise pricing',
      },
      options: {
        dryRun: true,
      },
    },
  });
}

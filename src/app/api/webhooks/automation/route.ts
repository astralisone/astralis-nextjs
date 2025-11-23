import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { emitAgentEvent, getEventBus } from '@/lib/agent/inputs';
import { AgentInputSource } from '@/lib/agent/types/agent.types';

/**
 * Automation Callback Webhook Configuration
 *
 * Environment variables:
 * - N8N_WEBHOOK_SECRET: HMAC secret for signature verification
 * - DEFAULT_ORG_ID: Fallback organization ID
 */
const N8N_WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET || '';
const DEFAULT_ORG_ID = process.env.DEFAULT_ORG_ID || '';

// Signature validation window (5 minutes)
const SIGNATURE_VALIDITY_WINDOW_MS = 5 * 60 * 1000;

/**
 * Logger utility
 */
const logger = {
  info: (message: string, data?: Record<string, unknown>) => {
    console.info(`[Automation Callback] ${message}`, data ?? '');
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    console.warn(`[Automation Callback] ${message}`, data ?? '');
  },
  error: (message: string, error?: unknown, data?: Record<string, unknown>) => {
    console.error(`[Automation Callback] ${message}`, error, data ?? '');
  },
  debug: (message: string, data?: Record<string, unknown>) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[Automation Callback] ${message}`, data ?? '');
    }
  },
};

/**
 * Zod schema for n8n workflow callback payload
 */
const AutomationCallbackSchema = z.object({
  // Execution identification
  executionId: z.string().min(1, 'executionId is required'),
  workflowId: z.string().min(1, 'workflowId is required'),

  // Status information
  status: z.enum(['success', 'error', 'running', 'waiting', 'cancelled']),

  // Workflow data/result
  data: z.record(z.unknown()).optional(),

  // Error information (if status is error)
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
    stack: z.string().optional(),
  }).optional(),

  // Timing information
  startedAt: z.string().optional(),
  finishedAt: z.string().optional(),
  executionTimeMs: z.number().optional(),

  // Metadata
  workflowName: z.string().optional(),
  mode: z.enum(['trigger', 'webhook', 'manual', 'scheduled']).optional(),
  retryCount: z.number().optional(),

  // Context passed from original trigger
  context: z.object({
    orgId: z.string().optional(),
    userId: z.string().optional(),
    correlationId: z.string().optional(),
    sourceEvent: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
  }).optional(),
});

type AutomationCallbackPayload = z.infer<typeof AutomationCallbackSchema>;

/**
 * Verify webhook signature using HMAC-SHA256
 */
function verifyWebhookSignature(
  signature: string,
  timestamp: string,
  body: string
): { valid: boolean; error?: string } {
  if (!N8N_WEBHOOK_SECRET) {
    // Skip verification if secret not configured
    logger.warn('N8N_WEBHOOK_SECRET not configured, skipping signature verification');
    return { valid: true };
  }

  if (!signature || !timestamp) {
    return { valid: false, error: 'Missing signature or timestamp' };
  }

  // Validate timestamp is within acceptable window
  const timestampMs = parseInt(timestamp, 10) * 1000;
  const now = Date.now();
  if (isNaN(timestampMs) || Math.abs(now - timestampMs) > SIGNATURE_VALIDITY_WINDOW_MS) {
    return { valid: false, error: 'Timestamp outside validity window' };
  }

  // Compute expected signature
  const payload = `${timestamp}.${body}`;
  const expectedSignature = crypto
    .createHmac('sha256', N8N_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  // Use timing-safe comparison
  try {
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (signatureBuffer.length !== expectedBuffer.length) {
      return { valid: false, error: 'Invalid signature length' };
    }

    const isValid = crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
    return { valid: isValid, error: isValid ? undefined : 'Invalid signature' };
  } catch (error) {
    return { valid: false, error: 'Signature comparison error' };
  }
}

/**
 * Determine the event type based on status
 */
function getEventType(status: AutomationCallbackPayload['status']): 'automation:completed' | 'automation:failed' | 'automation:triggered' {
  switch (status) {
    case 'success':
      return 'automation:completed';
    case 'error':
    case 'cancelled':
      return 'automation:failed';
    case 'running':
    case 'waiting':
    default:
      return 'automation:triggered';
  }
}

/**
 * Process follow-up actions based on workflow result
 */
async function processFollowUpActions(
  payload: AutomationCallbackPayload,
  correlationId: string
): Promise<void> {
  const { status, workflowId, data, context } = payload;

  // Check if workflow result requires follow-up actions
  if (status !== 'success' || !data) {
    return;
  }

  // Check for follow-up action instructions in the data
  const followUpActions = data.followUpActions as Array<{
    type: string;
    params: Record<string, unknown>;
  }> | undefined;

  if (!followUpActions || !Array.isArray(followUpActions)) {
    return;
  }

  logger.info('Processing follow-up actions', {
    workflowId,
    actionCount: followUpActions.length,
    correlationId,
  });

  // Emit events for each follow-up action
  const eventBus = getEventBus();

  for (const action of followUpActions) {
    try {
      // Map action types to events
      switch (action.type) {
        case 'send_notification':
          await eventBus.emit('webhook:callback_received', {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            source: AgentInputSource.WORKER,
            orgId: context?.orgId,
            metadata: {
              correlationId,
              sourceWorkflowId: workflowId,
              actionType: action.type,
            },
            ...action.params,
          });
          break;

        case 'create_intake':
          await eventBus.emit('intake:created', {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            source: AgentInputSource.WORKER,
            orgId: context?.orgId,
            intakeId: crypto.randomUUID(),
            type: 'automation_followup',
            data: action.params,
            metadata: {
              correlationId,
              sourceWorkflowId: workflowId,
            },
          });
          break;

        case 'schedule_event':
          await eventBus.emit('calendar:event_created', {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            source: AgentInputSource.WORKER,
            orgId: context?.orgId,
            metadata: {
              correlationId,
              sourceWorkflowId: workflowId,
              actionType: action.type,
              eventData: action.params,
            },
          });
          break;

        default:
          logger.warn('Unknown follow-up action type', {
            actionType: action.type,
            correlationId,
          });
      }
    } catch (error) {
      logger.error('Failed to process follow-up action', error, {
        actionType: action.type,
        correlationId,
      });
    }
  }
}

/**
 * POST /api/webhooks/automation
 *
 * Receive n8n workflow callbacks/completion notifications.
 *
 * Body:
 * {
 *   executionId: string,
 *   workflowId: string,
 *   status: 'success' | 'error' | 'running' | 'waiting' | 'cancelled',
 *   data?: Record<string, unknown>,
 *   error?: { message: string, code?: string },
 *   context?: { orgId?, correlationId?, ... }
 * }
 *
 * Headers (optional):
 * - X-Webhook-Signature: HMAC-SHA256 signature
 * - X-Webhook-Timestamp: Unix timestamp
 *
 * Returns 200 quickly, processes async
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const requestCorrelationId = crypto.randomUUID();

  logger.info('Received automation callback', { correlationId: requestCorrelationId });

  try {
    // 1. Read raw body for signature verification
    const rawBody = await req.text();

    if (!rawBody) {
      logger.warn('Empty request body', { correlationId: requestCorrelationId });
      return NextResponse.json(
        { error: 'Bad Request', details: 'Empty request body' },
        { status: 400 }
      );
    }

    // 2. Verify webhook signature
    const signature = req.headers.get('X-Webhook-Signature') || req.headers.get('x-webhook-signature') || '';
    const timestamp = req.headers.get('X-Webhook-Timestamp') || req.headers.get('x-webhook-timestamp') || '';

    const signatureCheck = verifyWebhookSignature(signature, timestamp, rawBody);
    if (!signatureCheck.valid) {
      logger.warn('Signature verification failed', {
        error: signatureCheck.error,
        correlationId: requestCorrelationId,
      });
      return NextResponse.json(
        { error: 'Unauthorized', details: signatureCheck.error },
        { status: 401 }
      );
    }

    // 3. Parse JSON body
    let rawPayload: unknown;
    try {
      rawPayload = JSON.parse(rawBody);
    } catch (parseError) {
      logger.error('Failed to parse JSON', parseError, { correlationId: requestCorrelationId });
      return NextResponse.json(
        { error: 'Bad Request', details: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // 4. Validate payload structure
    const validation = AutomationCallbackSchema.safeParse(rawPayload);
    if (!validation.success) {
      logger.warn('Payload validation failed', {
        errors: validation.error.errors,
        correlationId: requestCorrelationId,
      });
      return NextResponse.json(
        {
          error: 'Bad Request',
          details: 'Invalid payload structure',
          validationErrors: validation.error.errors.map((e: { path: (string | number)[]; message: string }) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const payload = validation.data;
    const correlationId = payload.context?.correlationId || requestCorrelationId;

    logger.info('Processing automation callback', {
      executionId: payload.executionId,
      workflowId: payload.workflowId,
      status: payload.status,
      correlationId,
    });

    // 5. Determine organization ID
    const orgId = payload.context?.orgId || DEFAULT_ORG_ID;

    // 6. Emit appropriate event based on status
    const eventType = getEventType(payload.status);

    try {
      await emitAgentEvent(eventType, {
        id: payload.executionId,
        timestamp: new Date(),
        source: AgentInputSource.WORKER,
        orgId,
        workflowId: payload.workflowId,
        workflowName: payload.workflowName || 'Unknown Workflow',
        status: payload.status,
        executionTime: payload.executionTimeMs || 0,
        result: payload.data,
        error: payload.error?.message,
        metadata: {
          correlationId,
          mode: payload.mode,
          retryCount: payload.retryCount,
          startedAt: payload.startedAt,
          finishedAt: payload.finishedAt,
          context: payload.context,
        },
      });

      logger.info('Emitted automation event', {
        eventType,
        executionId: payload.executionId,
        correlationId,
      });
    } catch (emitError) {
      logger.error('Failed to emit event', emitError, {
        eventType,
        executionId: payload.executionId,
        correlationId,
      });
    }

    // 7. Process follow-up actions (async, don't block response)
    processFollowUpActions(payload, correlationId).catch((error) => {
      logger.error('Follow-up action processing failed', error, { correlationId });
    });

    // 8. Return success response
    const processingTime = Date.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        correlationId,
        executionId: payload.executionId,
        workflowId: payload.workflowId,
        status: 'acknowledged',
        eventEmitted: eventType,
        processingTimeMs: processingTime,
      },
      { status: 200 }
    );

  } catch (error) {
    logger.error('Error processing automation callback', error, {
      correlationId: requestCorrelationId,
    });

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        correlationId: requestCorrelationId,
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/automation
 *
 * Health check and documentation endpoint.
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    service: 'automation-callback-webhook',
    status: 'active',
    timestamp: new Date().toISOString(),
    description: 'Receives n8n workflow completion callbacks',
    expectedPayload: {
      executionId: 'string (required)',
      workflowId: 'string (required)',
      status: "'success' | 'error' | 'running' | 'waiting' | 'cancelled' (required)",
      data: 'Record<string, unknown> (optional)',
      error: '{ message: string, code?: string } (optional)',
      context: '{ orgId?, userId?, correlationId?, sourceEvent?, metadata? } (optional)',
    },
    config: {
      signatureVerification: !!N8N_WEBHOOK_SECRET,
      defaultOrgConfigured: !!DEFAULT_ORG_ID,
    },
  });
}

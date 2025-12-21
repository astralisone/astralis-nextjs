import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { emitAgentEvent } from '@/lib/agent/inputs';
import { AgentInputSource } from '@/lib/agent/types/agent.types';

/**
 * QuickBooks Webhook Receiver
 * 
 * Receives real-time notifications from QuickBooks Online when
 * data changes (invoices created, customers updated, etc).
 * 
 * Verifies Intuit-Signature header to ensure authenticity.
 */

const QUICKBOOKS_WEBHOOK_VERIFIER_TOKEN = process.env.QUICKBOOKS_WEBHOOK_VERIFIER_TOKEN || '';

/**
 * POST /api/webhooks/quickbooks
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 1. Get raw body for signature verification
    const rawBody = await req.text();
    
    // 2. Verify signature
    const signature = req.headers.get('intuit-signature');
    
    if (QUICKBOOKS_WEBHOOK_VERIFIER_TOKEN && signature) {
      const hash = crypto
        .createHmac('sha256', QUICKBOOKS_WEBHOOK_VERIFIER_TOKEN)
        .update(rawBody)
        .digest('base64');
        
      if (hash !== signature) {
        console.warn('[QuickBooks Webhook] Invalid signature received');
        return new NextResponse('Invalid signature', { status: 401 });
      }
    } else if (QUICKBOOKS_WEBHOOK_VERIFIER_TOKEN) {
      console.warn('[QuickBooks Webhook] Missing signature header');
      return new NextResponse('Missing signature', { status: 401 });
    }

    // 3. Parse payload
    const payload = JSON.parse(rawBody);
    console.log('[QuickBooks Webhook] Received event:', JSON.stringify(payload, null, 2));

    // 4. Process events
    // QuickBooks sends an array of events in eventNotifications
    const events = payload.eventNotifications || [];
    
    for (const notification of events) {
      const realmId = notification.realmId;
      const dataEvents = notification.dataChangeEvent?.entities || [];
      
      for (const entityEvent of dataEvents) {
        const entityName = entityEvent.name; // e.g., Invoice, Customer
        const entityId = entityEvent.id;
        const operation = entityEvent.operation; // Create, Update, Delete
        
        console.log(`[QuickBooks Webhook] ${operation} on ${entityName} (${entityId}) for realm ${realmId}`);

        // 5. Emit event to platform agent system
        await emitAgentEvent('webhook:callback_received', {
          id: `qb-${entityId}-${Date.now()}`,
          timestamp: new Date(),
          source: AgentInputSource.API,
          orgId: realmId, // We use realmId as the org identifier for QB
          metadata: {
            provider: 'QUICKBOOKS',
            entityType: entityName,
            entityId: entityId,
            operation: operation,
            realmId: realmId,
            rawEvent: entityEvent
          }
        });
      }
    }

    return NextResponse.json({ success: true, processed: events.length }, { status: 200 });

  } catch (error) {
    console.error('[QuickBooks Webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/quickbooks
 * For Intuit endpoint verification if needed
 */
export async function GET() {
  return NextResponse.json({
    status: 'active',
    service: 'quickbooks-webhook-receiver',
    veriferConfigured: !!QUICKBOOKS_WEBHOOK_VERIFIER_TOKEN,
    endpoint: 'https://astralisone.com/api/webhooks/quickbooks'
  });
}

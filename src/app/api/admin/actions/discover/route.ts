import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { actionDiscoveryService } from '@/lib/services/action-discovery';
import { getOrgOAuthCredentials, validateOAuthCredentials } from '@/lib/integrations/oauth-config';
import type { IntegrationProvider } from '@prisma/client';

/**
 * POST /api/admin/actions/discover
 *
 * Discover new actions for all available integrations.
 * This endpoint will scan all integrations with valid credentials
 * and discover new actions using AI.
 *
 * Auth: Required (admin)
 * Returns: Discovery results with success/failure status
 */
export async function POST(req: NextRequest) {
  try {
    console.log('[API /api/admin/actions/discover] Starting action discovery');

    // 1. Verify authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!session.user.orgId) {
      return NextResponse.json(
        { error: 'Forbidden', details: 'Organization required' },
        { status: 403 }
      );
    }

    // 2. Get all available integrations
    const availableIntegrations: IntegrationProvider[] = [
      'GMAIL',
      'GOOGLE_DRIVE',
      'GOOGLE_DOCS',
      'GOOGLE_SHEETS',
      'GOOGLE_CALENDAR',
      'SLACK',
      'DROPBOX',
      'HUBSPOT',
      'SALESFORCE',
      'QUICKBOOKS',
      'XERO',
      'SHOPIFY',
      'FACEBOOK',
      'MICROSOFT_TEAMS',
    ];

    const discoveryResults = [];
    let totalDiscovered = 0;

    // 3. Discover actions for each available integration
    for (const provider of availableIntegrations) {
      try {
        console.log(`[Action Discovery] Checking credentials for ${provider}`);

        // Check if we have valid credentials for this provider
        const credentials = await getOrgOAuthCredentials(provider, session.user.orgId);
        const validation = validateOAuthCredentials(provider, credentials);

        if (!validation.available) {
          console.log(`[Action Discovery] Skipping ${provider}: ${validation.reason}`);
          discoveryResults.push({
            provider,
            status: 'skipped',
            reason: validation.reason,
            actionsDiscovered: 0,
          });
          continue;
        }

        console.log(`[Action Discovery] Discovering actions for ${provider}`);

        // Discover actions for this provider
        const actions = await actionDiscoveryService.discoverActionsForIntegration(provider);

        console.log(`[Action Discovery] Discovered ${actions.length} actions for ${provider}`);

        discoveryResults.push({
          provider,
          status: 'success',
          actionsDiscovered: actions.length,
          actions: actions.map(a => ({ actionKey: a.actionKey, name: a.name })),
        });

        totalDiscovered += actions.length;

      } catch (error) {
        console.error(`[Action Discovery] Failed for ${provider}:`, error);
        discoveryResults.push({
          provider,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          actionsDiscovered: 0,
        });
      }
    }

    console.log(`[Action Discovery] Completed. Total actions discovered: ${totalDiscovered}`);

    return NextResponse.json({
      success: true,
      message: `Action discovery completed. ${totalDiscovered} new actions discovered.`,
      results: discoveryResults,
      totalDiscovered,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[API /api/admin/actions/discover] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to discover actions',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
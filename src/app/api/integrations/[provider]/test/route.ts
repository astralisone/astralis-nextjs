import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { integrationService } from '@/lib/services/integration.service';
import {
  quickBooksService,
  xeroService,
  hubSpotService,
  salesforceService,
  slackService,
  gmailService,
  teamsService,
  googleDriveService,
  dropboxService,
} from '@/lib/integrations';
import type { IntegrationProvider } from '@prisma/client';
import type { BaseIntegrationService } from '@/lib/integrations/base-integration.service';

/**
 * POST /api/integrations/[provider]/test
 *
 * Test a connected integration to verify it's working.
 *
 * Body: { credentialId: string }
 *
 * Auth: Required
 * Returns: { success: boolean, message: string, accountInfo?: object }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider: providerParam } = await params;
  const provider = providerParam.toUpperCase().replace(/-/g, '_') as IntegrationProvider;

  try {
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

    // 2. Parse body
    const body = await req.json();
    const { credentialId } = body;

    if (!credentialId) {
      return NextResponse.json(
        { error: 'Validation failed', details: { credentialId: ['Required'] } },
        { status: 400 }
      );
    }

    // 3. Get the appropriate service
    const service = getServiceForProvider(provider);

    if (!service) {
      return NextResponse.json(
        { error: 'Unsupported provider', details: `No service available for ${provider}` },
        { status: 400 }
      );
    }

    // 4. Initialize the service with credentials
    await service.initialize(credentialId, session.user.id, session.user.orgId);

    // 5. Test the connection
    const isConnected = await service.testConnection();

    if (!isConnected) {
      return NextResponse.json({
        success: false,
        message: 'Connection test failed',
      });
    }

    // 6. Get account info
    const accountInfo = await service.getAccountInfo();

    // 7. Return success
    return NextResponse.json({
      success: true,
      message: 'Connection test successful',
      accountInfo: accountInfo.success ? accountInfo.data : undefined,
    });

  } catch (error) {
    console.error(`[API /api/integrations/${provider}/test POST] Error:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Connection test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Get the service instance for a provider
 */
function getServiceForProvider(provider: IntegrationProvider): BaseIntegrationService | null {
  const serviceMap: Partial<Record<IntegrationProvider, BaseIntegrationService>> = {
    QUICKBOOKS: quickBooksService,
    XERO: xeroService,
    HUBSPOT: hubSpotService,
    SALESFORCE: salesforceService,
    SLACK: slackService,
    GMAIL: gmailService,
    MICROSOFT_TEAMS: teamsService,
    GOOGLE_DRIVE: googleDriveService,
    DROPBOX: dropboxService,
  };

  return serviceMap[provider] || null;
}

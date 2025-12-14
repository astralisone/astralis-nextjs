import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import {
  generateAuthorizationUrlWithCredentials,
  generateOAuthState,
  getOrgOAuthCredentials,
  supportsOAuth,
} from '@/lib/integrations/oauth-config';
import type { IntegrationProvider } from '@prisma/client';

/**
 * GET /api/integrations/[provider]/connect
 *
 * Initiates OAuth authorization flow for a third-party integration.
 * Uses organization-specific OAuth credentials if configured,
 * otherwise falls back to platform-level credentials.
 *
 * Query params:
 * - returnUrl: URL to redirect back to after OAuth (default: /app/integrations)
 *
 * Auth: Required (via session)
 * Redirects: To provider's OAuth authorization URL
 */
export async function GET(
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

    // 2. Check if provider supports OAuth
    if (!supportsOAuth(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider', details: `${provider} does not support OAuth` },
        { status: 400 }
      );
    }

    // 3. Get OAuth credentials for this organization
    const credentials = await getOrgOAuthCredentials(provider, session.user.orgId);

    if (!credentials) {
      // Get provider info for better error messaging
      const providerInfo = {
        DROPBOX: {
          name: 'Dropbox',
          setupUrl: 'https://www.dropbox.com/developers/apps',
          description: 'Create a Dropbox app to get OAuth credentials',
        },
        GITHUB: {
          name: 'GitHub',
          setupUrl: 'https://github.com/settings/developers',
          description: 'Create a GitHub OAuth App to get credentials',
        },
        FACEBOOK: {
          name: 'Facebook',
          setupUrl: 'https://developers.facebook.com/apps/',
          description: 'Create a Facebook app to get OAuth credentials',
        },
        SHOPIFY: {
          name: 'Shopify',
          setupUrl: 'https://shopify.dev/apps/auth/oauth',
          description: 'Create a Shopify app to get API credentials',
        },
        QUICKBOOKS: {
          name: 'QuickBooks',
          setupUrl: 'https://developer.intuit.com/app/developer/dashboard',
          description: 'Create a QuickBooks app to get OAuth credentials',
        },
        XERO: {
          name: 'Xero',
          setupUrl: 'https://developer.xero.com/app/manage',
          description: 'Create a Xero app to get OAuth credentials',
        },
        HUBSPOT: {
          name: 'HubSpot',
          setupUrl: 'https://app.hubspot.com/developer',
          description: 'Create a HubSpot app to get OAuth credentials',
        },
        SALESFORCE: {
          name: 'Salesforce',
          setupUrl: 'https://login.salesforce.com/',
          description: 'Create a Salesforce Connected App',
        },
        SLACK: {
          name: 'Slack',
          setupUrl: 'https://api.slack.com/apps',
          description: 'Create a Slack app to get OAuth credentials',
        },
        GMAIL: {
          name: 'Google',
          setupUrl: 'https://console.cloud.google.com/apis/credentials',
          description: 'Create OAuth 2.0 credentials in Google Cloud',
        },
        GOOGLE_DRIVE: {
          name: 'Google Drive',
          setupUrl: 'https://console.cloud.google.com/apis/credentials',
          description: 'Enable Google Drive API and create credentials',
        },
        MICROSOFT_TEAMS: {
          name: 'Microsoft',
          setupUrl: 'https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade',
          description: 'Register an app in Azure AD',
        },
      };

      const info = providerInfo[provider as keyof typeof providerInfo] || {
        name: provider.replace(/_/g, ' '),
        setupUrl: '#',
        description: 'Create an OAuth app to get credentials',
      };

      return NextResponse.json(
        {
          error: 'OAuth credentials required',
          details: `${info.name} OAuth credentials have not been configured.`,
          code: 'OAUTH_CREDENTIALS_REQUIRED',
          provider: provider,
          setupRequired: true,
          setupGuide: {
            name: info.name,
            description: info.description,
            setupUrl: info.setupUrl,
            steps: [
              'Go to the developer portal',
              'Create a new OAuth application',
              'Configure redirect URI',
              'Copy Client ID and Client Secret',
              'Enter credentials in Astralis settings',
            ],
          },
        },
        { status: 400 }
      );
    }

    // 4. Get return URL from query params
    const { searchParams } = req.nextUrl;
    const returnUrl = searchParams.get('returnUrl') || '/app/integrations';

    // 5. Generate OAuth state for CSRF protection
    const state = generateOAuthState({
      provider,
      returnUrl,
      userId: session.user.id,
      orgId: session.user.orgId,
    });

    // 6. Build redirect URI (callback URL)
    const callbackUrl = new URL(
      `/api/integrations/${providerParam}/oauth/callback`,
      req.nextUrl.origin
    );

    // 7. Generate authorization URL with org credentials
    const authUrl = generateAuthorizationUrlWithCredentials(
      provider,
      callbackUrl.toString(),
      state,
      credentials
    );

    if (!authUrl) {
      return NextResponse.json(
        { error: 'Configuration error', details: `OAuth not configured for ${provider}` },
        { status: 500 }
      );
    }

    console.log(`[OAuth Connect] Redirecting to ${provider} authorization (org: ${session.user.orgId})`);

    // 8. Redirect to provider's OAuth authorization URL
    return NextResponse.redirect(authUrl);

  } catch (error) {
    console.error(`[API /api/integrations/${provider}/connect GET] Error:`, error);
    return NextResponse.json(
      {
        error: 'Failed to initiate OAuth',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

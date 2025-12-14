import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { integrationService } from '@/lib/services/integration.service';
import {
  exchangeCodeForTokensWithCredentials,
  getOrgOAuthCredentials,
  parseOAuthState,
  validateOAuthState,
  supportsOAuth,
  getOAuthConfig,
} from '@/lib/integrations/oauth-config';
import type { IntegrationProvider } from '@prisma/client';

/**
 * GET /api/integrations/[provider]/oauth/callback
 *
 * OAuth callback handler for third-party integrations.
 *
 * Query params:
 * - code: OAuth authorization code
 * - state: CSRF token (encoded state data)
 * - error: OAuth error (if authorization failed)
 * - error_description: OAuth error description
 * - realmId: QuickBooks specific - company ID
 *
 * Auth: Required (via session or state)
 * Redirects: /app/integrations?success=true or ?error=message
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider: providerParam } = await params;
  const provider = providerParam.toUpperCase().replace(/-/g, '_') as IntegrationProvider;

  try {
    // 1. Parse query parameters
    const { searchParams } = req.nextUrl;
    const code = searchParams.get('code');
    const stateParam = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Provider-specific params
    const realmId = searchParams.get('realmId'); // QuickBooks

    // 2. Handle OAuth errors
    if (error) {
      console.error('[OAuth Callback] OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        new URL(
          `/integrations?error=${encodeURIComponent(errorDescription || error)}`,
          req.url
        )
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/app/integrations?error=NoAuthorizationCode', req.url)
      );
    }

    // 3. Parse and validate state
    let userId: string;
    let orgId: string;
    let returnUrl = '/app/integrations';

    if (stateParam) {
      const stateData = parseOAuthState(stateParam);

      if (!stateData) {
        console.error('[OAuth Callback] Invalid state parameter');
        return NextResponse.redirect(
          new URL('/app/integrations?error=InvalidState', req.url)
        );
      }

      if (!validateOAuthState(stateData)) {
        console.error('[OAuth Callback] State expired');
        return NextResponse.redirect(
          new URL('/app/integrations?error=StateExpired', req.url)
        );
      }

      userId = stateData.userId;
      orgId = stateData.orgId;
      returnUrl = stateData.returnUrl || returnUrl;
    } else {
      // Fallback to session authentication
      const session = await auth();

      if (!session?.user?.id) {
        return NextResponse.redirect(
          new URL('/auth/signin?error=Unauthorized', req.url)
        );
      }

      if (!session.user.orgId) {
        return NextResponse.redirect(
          new URL('/auth/signin?error=OrganizationRequired', req.url)
        );
      }

      userId = session.user.id;
      orgId = session.user.orgId;
    }

    // 4. Validate provider
    if (!supportsOAuth(provider)) {
      return NextResponse.redirect(
        new URL(`/app/integrations?error=UnsupportedProvider`, req.url)
      );
    }

    // 5. Get OAuth credentials for this organization
    const credentials = await getOrgOAuthCredentials(provider, orgId);

    if (!credentials) {
      console.error(`[OAuth Callback] No credentials configured for ${provider} in org ${orgId}`);
      return NextResponse.redirect(
        new URL('/app/integrations?error=IntegrationNotConfigured', req.url)
      );
    }

    // 6. Build redirect URI (must match the one used in authorization request)
    const redirectUri = new URL(
      `/api/integrations/${providerParam}/oauth/callback`,
      req.nextUrl.origin
    ).toString();

    // 7. Exchange code for tokens using org credentials
    const tokenData = await exchangeCodeForTokensWithCredentials(
      provider,
      code,
      redirectUri,
      credentials
    );

    // 8. Add provider-specific data
    const credentialData: Record<string, unknown> = {
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      expiresIn: tokenData.expiresIn,
      scope: tokenData.scope,
      tokenType: tokenData.tokenType,
    };

    // Add provider-specific fields
    if (realmId) {
      credentialData.realmId = realmId; // QuickBooks company ID
    }
    if (tokenData.realmId) {
      credentialData.realmId = tokenData.realmId;
    }
    if (tokenData.tenantId) {
      credentialData.tenantId = tokenData.tenantId; // Xero tenant ID
    }
    if (tokenData.teamId) {
      credentialData.teamId = tokenData.teamId; // Slack team ID
    }
    if (tokenData.instanceUrl) {
      credentialData.instanceUrl = tokenData.instanceUrl; // Salesforce instance URL
    }

    // 9. Fetch additional info if available (e.g., Xero tenant ID)
    if (provider === 'XERO' && !credentialData.tenantId) {
      try {
        const config = getOAuthConfig(provider);
        if (config?.userInfoUrl) {
          const connectionsResponse = await fetch(config.userInfoUrl, {
            headers: {
              Authorization: `Bearer ${tokenData.accessToken}`,
              'Content-Type': 'application/json',
            },
          });
          if (connectionsResponse.ok) {
            const connections = await connectionsResponse.json();
            if (Array.isArray(connections) && connections.length > 0) {
              credentialData.tenantId = connections[0].tenantId;
              credentialData.tenantName = connections[0].tenantName;
            }
          }
        }
      } catch (e) {
        console.warn('[OAuth Callback] Failed to fetch Xero tenant info:', e);
      }
    }

    // 10. Generate credential name
    const providerName = provider.replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const credentialName = `${providerName} - ${new Date().toLocaleDateString()}`;

    // 11. Save credential
    await integrationService.saveCredential(userId, orgId, {
      provider,
      credentialName,
      credentialData,
      scope: tokenData.scope,
      expiresAt: tokenData.expiresIn
        ? new Date(Date.now() + tokenData.expiresIn * 1000)
        : undefined,
    });

    console.log(`[OAuth Callback] Successfully connected ${provider} (org: ${orgId})`);

    // 12. Redirect with success
    const successUrl = new URL(returnUrl, req.url);
    successUrl.searchParams.set('success', 'true');
    successUrl.searchParams.set('provider', providerParam);

    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error(`[API /api/integrations/${provider}/oauth/callback GET] Error:`, error);

    return NextResponse.redirect(
      new URL(
        `/app/integrations?error=${encodeURIComponent(
          error instanceof Error ? error.message : 'OAuth callback failed'
        )}`,
        req.url
      )
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { integrationService } from '@/lib/services/integration.service';
import { encrypt } from '@/lib/utils/crypto';
import { prisma } from '@/lib/prisma';
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
    console.log(`[API /api/integrations/${provider}/oauth/callback GET] Starting request for provider: ${provider}`);

    // 1. Parse query parameters
    const { searchParams } = req.nextUrl;
    const code = searchParams.get('code');
    const stateParam = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    console.log(`[OAuth Callback] Query params - code: ${!!code}, state: ${!!stateParam}, error: ${error}`);

    // Declare variables at function scope
    let stateData: OAuthStateData | null = null;
    let userId: string;
    let orgId: string;
    let returnUrl = '/integrations';

    // 2. Handle OAuth errors
    if (error) {
      console.error('[OAuth Callback] OAuth error:', error, errorDescription);

      // Provide specific guidance for common OAuth errors
      let userFriendlyError = errorDescription || error;
      let setupGuide = null;

      if (error === 'invalid_request' && errorDescription?.includes('redirect_uri')) {
        userFriendlyError = 'Invalid redirect URI. The OAuth app needs to be configured with the correct redirect URI.';
        setupGuide = {
          name: provider.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()),
          description: 'Update your OAuth app configuration to include the correct redirect URI.',
          redirectUri: `https://astralisone.com/api/integrations/${providerParam}/oauth/callback`,
          steps: [
            'Go to your OAuth app settings',
            'Add or update the redirect URI to match the one shown below',
            'Save the changes and try connecting again'
          ]
        };
      } else if (error === 'redirect_uri_mismatch') {
        userFriendlyError = 'Redirect URI mismatch. Please check your OAuth app configuration.';
        setupGuide = {
          name: provider.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()),
          description: 'The redirect URI in your OAuth app doesn\'t match the expected value.',
          redirectUri: `https://astralisone.com/api/integrations/${providerParam}/oauth/callback`,
          steps: [
            'Check your OAuth app\'s redirect URI settings',
            'Ensure it matches exactly: ' + `https://astralisone.com/api/integrations/${providerParam}/oauth/callback`,
            'Remove any trailing slashes or extra parameters'
          ]
        };
      }

      const errorUrl = new URL('/integrations', req.url);
      errorUrl.searchParams.set('error', encodeURIComponent(userFriendlyError));

      if (setupGuide) {
        errorUrl.searchParams.set('setupGuide', encodeURIComponent(JSON.stringify(setupGuide)));
      }

      return NextResponse.redirect(errorUrl);
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/integrations?error=NoAuthorizationCode', req.url)
      );
    }

    // 3. Parse and validate state

    if (stateParam) {
      console.log('[OAuth Callback] Processing state parameter');

      try {
        stateData = parseOAuthState(stateParam);

        if (!stateData) {
          console.error('[OAuth Callback] State parsing returned null, raw state:', stateParam);
          return NextResponse.redirect(
            new URL('/integrations?error=InvalidState', req.url)
          );
        }

        console.log('[OAuth Callback] State parsed successfully:', {
          provider: stateData.provider,
          hasCodeVerifier: !!stateData.codeVerifier,
          userId: stateData.userId,
          orgId: stateData.orgId
        });

        if (!validateOAuthState(stateData)) {
          console.error('[OAuth Callback] State validation failed - expired');
          return NextResponse.redirect(
            new URL('/integrations?error=StateExpired', req.url)
          );
        }

        userId = stateData.userId;
        orgId = stateData.orgId;
        returnUrl = stateData.returnUrl || returnUrl;

        console.log('[OAuth Callback] State processing completed successfully');

      } catch (error) {
        console.error('[OAuth Callback] Exception during state processing:', error);
        console.error('[OAuth Callback] Raw state parameter:', stateParam);
        return NextResponse.redirect(
          new URL('/integrations?error=StateProcessingError', req.url)
        );
      }
    } else {
      console.log('[OAuth Callback] No state parameter, using session fallback');
      // Fallback to session authentication
      const session = await auth();

      if (!session?.user?.id) {
        console.error('[OAuth Callback] No session found');
        return NextResponse.redirect(
          new URL('/auth/signin?error=Unauthorized', req.url)
        );
      }

      if (!session.user.orgId) {
        console.error('[OAuth Callback] No orgId in session');
        return NextResponse.redirect(
          new URL('/auth/signin?error=OrganizationRequired', req.url)
        );
      }

      userId = session.user.id;
      orgId = session.user.orgId;
      console.log('[OAuth Callback] Using session auth:', { userId, orgId });
    }

    // 4. Validate provider
    if (!supportsOAuth(provider)) {
      return NextResponse.redirect(
        new URL(`/integrations?error=UnsupportedProvider`, req.url)
      );
    }

    // 5. Get OAuth credentials for this organization
    const credentials = await getOrgOAuthCredentials(provider, orgId);

    if (!credentials) {
      console.error(`[OAuth Callback] No credentials configured for ${provider} in org ${orgId}`);
      return NextResponse.redirect(
        new URL('/integrations?error=IntegrationNotConfigured', req.url)
      );
    }

    // 6. Build redirect URI (must match the one used in authorization request)
    const redirectUri = new URL(
      `/api/integrations/${providerParam}/oauth/callback`,
      req.nextUrl.origin
    ).toString();

    // 7. Exchange code for tokens using org credentials
    // Get code verifier from stored state data (for PKCE providers)
    const codeVerifier = stateData?.codeVerifier;

    console.log(`[OAuth Callback] About to exchange tokens - provider: ${provider}, hasCodeVerifier: ${!!codeVerifier}, userId: ${userId}, orgId: ${orgId}`);

    const tokenData = await exchangeCodeForTokensWithCredentials(
      provider,
      code,
      redirectUri,
      credentials,
      codeVerifier // Include code verifier for PKCE if present
    );

    console.log(`[OAuth Callback] Token exchange successful for ${provider}:`, {
      hasAccessToken: !!tokenData.accessToken,
      hasRefreshToken: !!tokenData.refreshToken,
      scope: tokenData.scope,
      providerSpecific: {
        teamId: tokenData.teamId,
        instanceUrl: tokenData.instanceUrl,
        tenantId: tokenData.tenantId,
      }
    });

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

    console.log(`[OAuth Callback] Final credential data for ${provider}:`, {
      hasAccessToken: !!credentialData.accessToken,
      scope: credentialData.scope,
      providerSpecific: {
        realmId: credentialData.realmId,
        tenantId: credentialData.tenantId,
        teamId: credentialData.teamId,
        instanceUrl: credentialData.instanceUrl,
      }
    });

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

    // 10. Check for existing credential and generate name
    const providerName = provider.replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

    // Check if user already has a credential for this provider
    const existingCredential = await prisma.integrationCredential.findFirst({
      where: {
        userId,
        provider,
        isActive: true,
      },
    });

    let credentialName: string;
    if (existingCredential) {
      // Update existing credential
      console.log(`[OAuth Callback] Updating existing credential for ${provider} (user: ${userId})`);

      const encryptedData = encrypt(JSON.stringify(credentialData));

      await prisma.integrationCredential.update({
        where: { id: existingCredential.id },
        data: {
          credentialData: encryptedData,
          scope: tokenData.scope,
          expiresAt: tokenData.expiresIn
            ? new Date(Date.now() + tokenData.expiresIn * 1000)
            : null,
          status: 'CONNECTED_ACTIVE',
          lastUsedAt: new Date(),
        },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId,
          orgId,
          action: 'UPDATE',
          entity: 'INTEGRATION_CREDENTIAL',
          entityId: existingCredential.id,
          metadata: {
            provider,
            credentialName: existingCredential.credentialName,
            reason: 'OAuth refresh',
          },
        },
      });

    } else {
      // Create new credential with unique timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      credentialName = `${providerName} - ${timestamp}`;

      console.log(`[OAuth Callback] Creating new credential for ${provider} (user: ${userId})`);

      await integrationService.saveCredential(userId, orgId, {
        provider,
        credentialName,
        credentialData,
        scope: tokenData.scope,
        expiresAt: tokenData.expiresIn
          ? new Date(Date.now() + tokenData.expiresIn * 1000)
          : undefined,
      });
    }

    console.log(`[OAuth Callback] Successfully ${existingCredential ? 'updated' : 'connected'} ${provider} (org: ${orgId})`);

    // 12. Redirect with success
    const successUrl = new URL(returnUrl, req.url);
    successUrl.searchParams.set('success', 'true');
    successUrl.searchParams.set('provider', providerParam);

    console.log(`[OAuth Callback] Redirecting to success URL: ${successUrl.toString()}`);
    return NextResponse.redirect(successUrl);

    } catch (error) {
      console.error(`[API /api/integrations/${provider}/oauth/callback GET] Error:`, error);

      let userFriendlyError = 'OAuth callback failed';

      if (error instanceof Error) {
        // Check for specific error patterns
        if (error.message.includes('Unexpected token')) {
          userFriendlyError = 'OAuth credentials are misconfigured. The integration provider rejected the authentication request.';
        } else if (error.message.includes('invalid_client')) {
          userFriendlyError = 'Invalid OAuth client credentials. Please check that the client ID and secret are correct.';
        } else if (error.message.includes('redirect_uri')) {
          userFriendlyError = 'Redirect URI mismatch. The OAuth app configuration needs to be updated.';
        } else {
          userFriendlyError = error.message;
        }
      }

      return NextResponse.redirect(
        new URL(
          `/integrations?error=${encodeURIComponent(userFriendlyError)}`,
          req.url
        )
      );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { integrationService } from '@/lib/services/integration.service';

/**
 * GET /api/integrations/[provider]/oauth/callback
 *
 * OAuth callback handler for third-party integrations.
 *
 * Query params:
 * - code: OAuth authorization code
 * - state: CSRF token (optional)
 * - error: OAuth error (if authorization failed)
 *
 * Auth: Required (via session)
 * Redirects: /app/integrations?success=true or ?error=message
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  try {
    // 1. Verify authentication
    const session = await auth();

    if (!session?.user?.id) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(
        new URL('/auth/signin?error=Unauthorized', req.url)
      );
    }

    if (!session.user.orgId) {
      return NextResponse.redirect(
        new URL('/auth/signin?error=OrganizationRequired', req.url)
      );
    }

    // 2. Parse query parameters
    const { searchParams } = req.nextUrl;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // 3. Handle OAuth errors
    if (error) {
      console.error('[OAuth Callback] OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        new URL(
          `/app/integrations?error=${encodeURIComponent(errorDescription || error)}`,
          req.url
        )
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/app/integrations?error=NoAuthorizationCode', req.url)
      );
    }

    // 4. Exchange code for tokens (provider-specific)
    const providerTokens = await exchangeCodeForTokens(
      provider,
      code,
      req.url
    );

    // 5. Save credential
    await integrationService.saveCredential(session.user.id, session.user.orgId, {
      provider: provider.toUpperCase() as any,
      credentialName: `${provider} OAuth - ${new Date().toLocaleDateString()}`,
      credentialData: providerTokens,
      scope: providerTokens.scope,
      expiresAt: providerTokens.expiresAt
        ? new Date(Date.now() + providerTokens.expiresAt * 1000)
        : undefined,
    });

    // 6. Redirect to integrations page with success
    return NextResponse.redirect(
      new URL(
        `/app/integrations?success=true&provider=${provider}`,
        req.url
      )
    );

  } catch (error) {
    console.error('[API /api/integrations/[provider]/oauth/callback GET] Error:', error);

    // Redirect with error
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

/**
 * Exchange OAuth authorization code for access tokens
 *
 * NOTE: This is a simplified implementation.
 * In production, implement provider-specific token exchange logic.
 */
async function exchangeCodeForTokens(
  provider: string,
  code: string,
  callbackUrl: string
): Promise<any> {
  console.log('[OAuth] Exchanging code for tokens:', provider);

  // Provider-specific token exchange endpoints
  const tokenEndpoints: Record<string, string> = {
    google: 'https://oauth2.googleapis.com/token',
    microsoft: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    slack: 'https://slack.com/api/oauth.v2.access',
    // Add more providers as needed
  };

  const endpoint = tokenEndpoints[provider.toLowerCase()];

  if (!endpoint) {
    throw new Error(`Unsupported OAuth provider: ${provider}`);
  }

  // Build redirect URI (must match the one used in authorization request)
  const redirectUri = new URL(callbackUrl);
  redirectUri.search = '';
  const redirectUriStr = redirectUri.toString();

  // Exchange code for tokens
  // NOTE: This requires provider-specific client credentials
  const clientId = process.env[`${provider.toUpperCase()}_CLIENT_ID`];
  const clientSecret = process.env[`${provider.toUpperCase()}_CLIENT_SECRET`];

  if (!clientId || !clientSecret) {
    throw new Error(`OAuth credentials not configured for ${provider}`);
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUriStr,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[OAuth] Token exchange failed:', errorText);
    throw new Error(`Token exchange failed: ${response.statusText}`);
  }

  const tokens = await response.json();

  console.log('[OAuth] Token exchange successful for:', provider);

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: tokens.expires_in,
    scope: tokens.scope,
    tokenType: tokens.token_type,
  };
}

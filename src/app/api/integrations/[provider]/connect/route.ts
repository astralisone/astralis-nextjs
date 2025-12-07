import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import {
  generateAuthorizationUrl,
  generateOAuthState,
  supportsOAuth,
} from '@/lib/integrations/oauth-config';
import type { IntegrationProvider } from '@prisma/client';

/**
 * GET /api/integrations/[provider]/connect
 *
 * Initiates OAuth authorization flow for a third-party integration.
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

    // 3. Get return URL from query params
    const { searchParams } = req.nextUrl;
    const returnUrl = searchParams.get('returnUrl') || '/app/integrations';

    // 4. Generate OAuth state for CSRF protection
    const state = generateOAuthState({
      provider,
      returnUrl,
      userId: session.user.id,
      orgId: session.user.orgId,
    });

    // 5. Build redirect URI (callback URL)
    const callbackUrl = new URL(
      `/api/integrations/${providerParam}/oauth/callback`,
      req.nextUrl.origin
    );

    // 6. Generate authorization URL
    const authUrl = generateAuthorizationUrl(
      provider,
      callbackUrl.toString(),
      state
    );

    if (!authUrl) {
      return NextResponse.json(
        { error: 'Configuration error', details: `OAuth not configured for ${provider}` },
        { status: 500 }
      );
    }

    console.log(`[OAuth Connect] Redirecting to ${provider} authorization`);

    // 7. Redirect to provider's authorization URL
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

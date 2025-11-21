import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { integrationService } from '@/lib/services/integration.service';
import { createIntegrationCredentialSchema } from '@/lib/validators/automation.validators';

/**
 * GET /api/integrations
 *
 * List user's integration credentials (without decrypted data).
 *
 * Query params:
 * - provider: Filter by integration provider
 *
 * Auth: Required
 * Returns: CredentialData[] (without credentialData field)
 */
export async function GET(req: NextRequest) {
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

    // 2. Parse query parameters
    const { searchParams } = req.nextUrl;
    const provider = searchParams.get('provider') || undefined;

    // 3. Get credentials (without decrypted data)
    const credentials = await integrationService.listCredentials(
      session.user.id,
      session.user.orgId,
      provider as any
    );

    // 4. Return credentials
    return NextResponse.json({
      success: true,
      data: credentials,
    });

  } catch (error) {
    console.error('[API /api/integrations GET] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch integrations',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/integrations
 *
 * Save a new integration credential.
 *
 * Body: CreateIntegrationCredentialInput {
 *   provider: IntegrationProvider
 *   credentialName: string
 *   credentialData: Record<string, any> (will be encrypted)
 *   scope?: string
 *   expiresAt?: string (ISO datetime)
 * }
 *
 * Auth: Required
 * Returns: CredentialData (without credentialData field)
 */
export async function POST(req: NextRequest) {
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

    // 2. Validate input
    const body = await req.json();
    const parsed = createIntegrationCredentialSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // 3. Save credential (encrypted)
    const credential = await integrationService.saveCredential(
      session.user.id,
      session.user.orgId,
      {
        provider: parsed.data.provider,
        credentialName: parsed.data.credentialName,
        credentialData: parsed.data.credentialData,
        scope: parsed.data.scope,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
      }
    );

    // 4. Return credential (without decrypted data)
    return NextResponse.json(
      {
        success: true,
        data: credential,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('[API /api/integrations POST] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to save integration credential',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

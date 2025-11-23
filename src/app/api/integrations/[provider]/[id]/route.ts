import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { integrationService } from '@/lib/services/integration.service';

/**
 * DELETE /api/integrations/[provider]/[id]
 *
 * Delete an integration credential.
 *
 * Auth: Required (must own the credential)
 * Returns: Success message
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string; id: string }> }
) {
  const { provider, id } = await params;
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

    // 2. Delete credential
    await integrationService.deleteCredential(
      id,
      session.user.id,
      session.user.orgId
    );

    // 3. Return success
    return NextResponse.json({
      success: true,
      message: 'Integration credential deleted successfully',
    });

  } catch (error) {
    console.error('[API /api/integrations/[provider]/[id] DELETE] Error:', error);

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Not found', details: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to delete integration credential',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

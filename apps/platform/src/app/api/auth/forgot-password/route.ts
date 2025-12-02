import { NextRequest, NextResponse } from 'next/server';
import { resetPasswordRequestSchema } from '@/lib/validators/auth.validators';
import { authService } from '@/lib/services/auth.service';

/**
 * POST /api/auth/forgot-password
 *
 * Initiates password reset flow by sending a reset link to the user's email.
 *
 * Request body:
 * - email: string (required) - The user's email address
 *
 * Response:
 * - 200: Password reset email sent (or would have been sent if account exists)
 * - 400: Validation error
 * - 500: Internal server error
 *
 * Note: Always returns success message regardless of whether email exists
 * to prevent email enumeration attacks.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const parsed = resetPasswordRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Call auth service to request password reset
    const result = await authService.requestPasswordReset(parsed.data.email);

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('[API /api/auth/forgot-password POST] Error:', error);

    // Don't reveal specific errors for security reasons
    // Always return generic message
    return NextResponse.json(
      {
        error: 'Failed to process password reset request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

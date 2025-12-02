import { NextRequest, NextResponse } from 'next/server';
import { resetPasswordSchema } from '@/lib/validators/auth.validators';
import { authService } from '@/lib/services/auth.service';

/**
 * POST /api/auth/reset-password
 *
 * Resets a user's password using a valid reset token.
 *
 * Request body:
 * - token: string (required) - The password reset token from the email link
 * - password: string (required) - The new password (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
 *
 * Response:
 * - 200: Password reset successfully
 * - 400: Validation error, invalid token, or expired token
 * - 500: Internal server error
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Call auth service to reset password
    const result = await authService.resetPassword(
      parsed.data.token,
      parsed.data.password
    );

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('[API /api/auth/reset-password POST] Error:', error);

    // Handle specific errors
    if (error instanceof Error) {
      // Invalid or expired token
      if (error.message.includes('Invalid') || error.message.includes('expired')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    // Generic error
    return NextResponse.json(
      {
        error: 'Password reset failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth.service';

/**
 * POST /api/auth/verify-email
 *
 * Verifies a user's email address using a verification token.
 *
 * Request body:
 * - token: string (required) - The verification token from the email link
 *
 * Response:
 * - 200: Email verified successfully
 * - 400: Invalid or expired token
 * - 500: Internal server error
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    // Validate token presence
    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Call auth service to verify email
    const result = await authService.verifyEmail(token);

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('[API /api/auth/verify-email POST] Error:', error);

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
        error: 'Email verification failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

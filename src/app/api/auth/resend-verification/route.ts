import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authService } from '@/lib/services/auth.service';

/**
 * POST /api/auth/resend-verification
 *
 * Resend email verification link
 *
 * Request body:
 * {
 *   "email": "user@example.com"
 * }
 *
 * Rate limited: 1 request per minute per email
 */

const ResendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const parsed = ResendVerificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    console.log(`[API] Resend verification request for: ${email}`);

    // Call auth service to resend verification email
    const result = await authService.resendVerificationEmail(email);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: result.message },
      { status: 200 }
    );

  } catch (error) {
    console.error('[API] Resend verification error:', error);

    if (error instanceof Error) {
      // Handle rate limit errors
      if (error.message.includes('Please wait')) {
        return NextResponse.json(
          { error: error.message },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

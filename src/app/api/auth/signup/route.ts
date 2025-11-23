import { NextRequest, NextResponse } from 'next/server';
import { signUpSchema } from '@/lib/validators/auth.validators';
import { authService } from '@/lib/services/auth.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const parsed = signUpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Call auth service to create user
    const result = await authService.signUp(parsed.data);

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('[API /api/auth/signup POST] Error:', error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message === 'User with this email already exists') {
        return NextResponse.json(
          {
            error: 'Email already registered',
            details: { email: ['An account with this email already exists'] },
          },
          { status: 409 }
        );
      }
    }

    // Generic error
    return NextResponse.json(
      {
        error: 'Failed to create account',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

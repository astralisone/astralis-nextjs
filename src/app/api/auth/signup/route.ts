import { NextRequest, NextResponse } from 'next/server';
import { signUpSchema } from '@/lib/validators/auth.validators';
import { authService } from '@/lib/services/auth.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validatedData = signUpSchema.parse(body);

    // Create account
    const result = await authService.signUp(validatedData);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Sign up error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

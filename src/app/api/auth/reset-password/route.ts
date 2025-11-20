import { NextRequest, NextResponse } from 'next/server';
import { resetPasswordSchema } from '@/lib/validators/auth.validators';
import { authService } from '@/lib/services/auth.service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validatedData = resetPasswordSchema.parse(body);

    // Reset password
    const result = await authService.resetPassword(
      validatedData.token,
      validatedData.password
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Reset password error:', error);

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

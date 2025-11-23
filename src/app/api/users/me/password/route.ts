import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { userProfileService, UserProfileServiceError } from '@/lib/services/userProfile.service';
import { changePasswordSchema } from '@/lib/validators/userProfile.validators';

/**
 * PUT /api/users/me/password
 * Change current authenticated user's password
 */
export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to change your password' },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validate request body
    const validationResult = changePasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid password data',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validationResult.data;

    const result = await userProfileService.changePassword(
      session.user.id,
      currentPassword,
      newPassword
    );

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Error changing password:', error);

    const serviceError = error as UserProfileServiceError;

    if (serviceError.code === 'NOT_FOUND') {
      return NextResponse.json(
        { error: 'Not Found', message: 'User not found' },
        { status: 404 }
      );
    }

    if (serviceError.code === 'INVALID_PASSWORD') {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to change password',
      },
      { status: 500 }
    );
  }
}

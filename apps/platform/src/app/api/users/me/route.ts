import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { userProfileService, UserProfileServiceError } from '@/lib/services/userProfile.service';
import { updateProfileSchema } from '@/lib/validators/userProfile.validators';

/**
 * GET /api/users/me
 * Get current authenticated user's profile
 */
export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to access this resource' },
        { status: 401 }
      );
    }

    const profile = await userProfileService.getUserProfile(session.user.id);

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);

    if ((error as UserProfileServiceError).code === 'NOT_FOUND') {
      return NextResponse.json(
        { error: 'Not Found', message: 'User profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to fetch user profile',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/me
 * Update current authenticated user's profile
 */
export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to update your profile' },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validate request body
    const validationResult = updateProfileSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid profile data',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updatedProfile = await userProfileService.updateUserProfile(
      session.user.id,
      validationResult.data
    );

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);

    if ((error as UserProfileServiceError).code === 'NOT_FOUND') {
      return NextResponse.json(
        { error: 'Not Found', message: 'User profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to update user profile',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/me
 * Delete (soft delete) current authenticated user's account
 */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to delete your account' },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Require password confirmation for account deletion
    if (!body.password || typeof body.password !== 'string') {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Password is required to delete your account',
        },
        { status: 400 }
      );
    }

    // Require confirmation string
    if (body.confirmation !== 'DELETE') {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Please type DELETE to confirm account deletion',
        },
        { status: 400 }
      );
    }

    const result = await userProfileService.deleteAccount(
      session.user.id,
      body.password
    );

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Error deleting user account:', error);

    const serviceError = error as UserProfileServiceError;

    if (serviceError.code === 'NOT_FOUND') {
      return NextResponse.json(
        { error: 'Not Found', message: 'User account not found' },
        { status: 404 }
      );
    }

    if (serviceError.code === 'INVALID_PASSWORD') {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Incorrect password' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to delete account',
      },
      { status: 500 }
    );
  }
}

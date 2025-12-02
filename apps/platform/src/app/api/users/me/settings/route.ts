import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { userSettingsService, UserSettingsServiceError } from '@/lib/services/userSettings.service';
import { userSettingsSchema, notificationSettingsSchema } from '@/lib/validators/userProfile.validators';

/**
 * GET /api/users/me/settings
 * Get current authenticated user's settings (notifications and preferences)
 */
export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to access settings' },
        { status: 401 }
      );
    }

    const settings = await userSettingsService.getUserSettings(session.user.id);

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);

    if ((error as UserSettingsServiceError).code === 'NOT_FOUND') {
      return NextResponse.json(
        { error: 'Not Found', message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to fetch settings',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/me/settings
 * Update current authenticated user's settings
 * Accepts partial updates for notifications and/or preferences
 */
export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to update settings' },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validate request body
    const validationResult = userSettingsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid settings data',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updatedSettings = await userSettingsService.updateUserSettings(
      session.user.id,
      validationResult.data
    );

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      data: updatedSettings,
    });
  } catch (error) {
    console.error('Error updating user settings:', error);

    const serviceError = error as UserSettingsServiceError;

    if (serviceError.code === 'NOT_FOUND') {
      return NextResponse.json(
        { error: 'Not Found', message: 'User not found' },
        { status: 404 }
      );
    }

    if (serviceError.code === 'VALIDATION_ERROR') {
      return NextResponse.json(
        { error: 'Validation Error', message: serviceError.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to update settings',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/me/settings
 * Partially update notification settings only
 * Convenience endpoint for updating just notifications
 */
export async function PATCH(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to update settings' },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validate as notification settings
    const validationResult = notificationSettingsSchema.partial().safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid notification settings',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Get current settings and merge
    const currentSettings = await userSettingsService.getUserSettings(session.user.id);
    const mergedNotifications = {
      ...currentSettings.notifications,
      ...validationResult.data,
    };

    const updatedSettings = await userSettingsService.updateUserSettings(
      session.user.id,
      { notifications: mergedNotifications }
    );

    return NextResponse.json({
      success: true,
      message: 'Notification settings updated successfully',
      data: updatedSettings.notifications,
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);

    const serviceError = error as UserSettingsServiceError;

    if (serviceError.code === 'NOT_FOUND') {
      return NextResponse.json(
        { error: 'Not Found', message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to update notification settings',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/me/settings
 * Reset settings to defaults
 */
export async function DELETE(): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to reset settings' },
        { status: 401 }
      );
    }

    const defaultSettings = await userSettingsService.resetToDefaults(session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Settings reset to defaults',
      data: defaultSettings,
    });
  } catch (error) {
    console.error('Error resetting user settings:', error);

    if ((error as UserSettingsServiceError).code === 'NOT_FOUND') {
      return NextResponse.json(
        { error: 'Not Found', message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to reset settings',
      },
      { status: 500 }
    );
  }
}

import { prisma } from '@/lib/prisma';
import {
  UserSettingsInput,
  NotificationSettingsInput,
  UserPreferencesInput,
  notificationSettingsSchema,
  userPreferencesSchema,
} from '@/lib/validators/userProfile.validators';

/**
 * User Settings Service
 * Handles user preferences and notification settings
 *
 * Since the Prisma schema doesn't have dedicated UserPreferences/NotificationSettings models,
 * we store settings in the users table metadata or a JSON approach.
 * For this implementation, we use a simple key-value approach storing in subscriber_preferences
 * or we can extend to use a new user_settings table.
 *
 * Current approach: Store settings in JSON format linked to user
 */

export interface UserSettings {
  notifications: NotificationSettingsInput;
  preferences: UserPreferencesInput;
}

export interface UserSettingsServiceError extends Error {
  code: 'NOT_FOUND' | 'VALIDATION_ERROR' | 'INTERNAL_ERROR';
}

function createServiceError(
  message: string,
  code: UserSettingsServiceError['code']
): UserSettingsServiceError {
  const error = new Error(message) as UserSettingsServiceError;
  error.code = code;
  return error;
}

// Default settings when user has none configured
const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettingsInput = {
  emailNotifications: true,
  marketingEmails: false,
  securityAlerts: true,
  weeklyDigest: false,
  productUpdates: true,
  bookingReminders: true,
  taskNotifications: true,
};

const DEFAULT_PREFERENCES: UserPreferencesInput = {
  theme: 'system',
  language: 'en',
  timezone: 'UTC',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
};

export class UserSettingsService {
  /**
   * Get user settings
   * Returns notification settings and preferences
   * Uses defaults if user hasn't configured settings yet
   */
  async getUserSettings(userId: string): Promise<UserSettings> {
    // Verify user exists
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        additionalInfo: true, // We can use this field to store JSON settings
      },
    });

    if (!user) {
      throw createServiceError('User not found', 'NOT_FOUND');
    }

    // Try to parse settings from additionalInfo or return defaults
    let settings: UserSettings = {
      notifications: { ...DEFAULT_NOTIFICATION_SETTINGS },
      preferences: { ...DEFAULT_PREFERENCES },
    };

    if (user.additionalInfo) {
      try {
        const parsedInfo = JSON.parse(user.additionalInfo);
        if (parsedInfo.userSettings) {
          const storedSettings = parsedInfo.userSettings as Partial<UserSettings>;

          // Merge with defaults to ensure all fields exist
          if (storedSettings.notifications) {
            settings.notifications = {
              ...DEFAULT_NOTIFICATION_SETTINGS,
              ...storedSettings.notifications,
            };
          }
          if (storedSettings.preferences) {
            settings.preferences = {
              ...DEFAULT_PREFERENCES,
              ...storedSettings.preferences,
            };
          }
        }
      } catch {
        // If parsing fails, use defaults
        console.warn('Failed to parse user settings, using defaults');
      }
    }

    return settings;
  }

  /**
   * Update user settings
   * Updates both notification settings and preferences
   */
  async updateUserSettings(
    userId: string,
    settings: UserSettingsInput
  ): Promise<UserSettings> {
    // Verify user exists and get current additionalInfo
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        additionalInfo: true,
      },
    });

    if (!user) {
      throw createServiceError('User not found', 'NOT_FOUND');
    }

    // Parse existing additionalInfo or create new object
    let additionalInfoObj: Record<string, unknown> = {};
    if (user.additionalInfo) {
      try {
        additionalInfoObj = JSON.parse(user.additionalInfo);
      } catch {
        // Start fresh if parsing fails
        additionalInfoObj = {};
      }
    }

    // Get current settings or defaults
    const currentSettings: UserSettings = {
      notifications: { ...DEFAULT_NOTIFICATION_SETTINGS },
      preferences: { ...DEFAULT_PREFERENCES },
    };

    if (additionalInfoObj.userSettings) {
      const stored = additionalInfoObj.userSettings as Partial<UserSettings>;
      if (stored.notifications) {
        currentSettings.notifications = {
          ...DEFAULT_NOTIFICATION_SETTINGS,
          ...stored.notifications,
        };
      }
      if (stored.preferences) {
        currentSettings.preferences = {
          ...DEFAULT_PREFERENCES,
          ...stored.preferences,
        };
      }
    }

    // Merge new settings with current
    const updatedSettings: UserSettings = {
      notifications: settings.notifications
        ? { ...currentSettings.notifications, ...settings.notifications }
        : currentSettings.notifications,
      preferences: settings.preferences
        ? { ...currentSettings.preferences, ...settings.preferences }
        : currentSettings.preferences,
    };

    // Validate merged settings
    const validatedNotifications = notificationSettingsSchema.safeParse(
      updatedSettings.notifications
    );
    const validatedPreferences = userPreferencesSchema.safeParse(
      updatedSettings.preferences
    );

    if (!validatedNotifications.success) {
      throw createServiceError(
        'Invalid notification settings',
        'VALIDATION_ERROR'
      );
    }

    if (!validatedPreferences.success) {
      throw createServiceError(
        'Invalid preferences',
        'VALIDATION_ERROR'
      );
    }

    // Store updated settings
    additionalInfoObj.userSettings = updatedSettings;

    await prisma.users.update({
      where: { id: userId },
      data: {
        additionalInfo: JSON.stringify(additionalInfoObj),
      },
    });

    return updatedSettings;
  }

  /**
   * Update only notification settings
   */
  async updateNotificationSettings(
    userId: string,
    notifications: NotificationSettingsInput
  ): Promise<NotificationSettingsInput> {
    const result = await this.updateUserSettings(userId, { notifications });
    return result.notifications;
  }

  /**
   * Update only user preferences
   */
  async updateUserPreferences(
    userId: string,
    preferences: UserPreferencesInput
  ): Promise<UserPreferencesInput> {
    const result = await this.updateUserSettings(userId, { preferences });
    return result.preferences;
  }

  /**
   * Reset settings to defaults
   */
  async resetToDefaults(userId: string): Promise<UserSettings> {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        additionalInfo: true,
      },
    });

    if (!user) {
      throw createServiceError('User not found', 'NOT_FOUND');
    }

    // Parse existing additionalInfo
    let additionalInfoObj: Record<string, unknown> = {};
    if (user.additionalInfo) {
      try {
        additionalInfoObj = JSON.parse(user.additionalInfo);
      } catch {
        additionalInfoObj = {};
      }
    }

    // Reset settings to defaults
    const defaultSettings: UserSettings = {
      notifications: { ...DEFAULT_NOTIFICATION_SETTINGS },
      preferences: { ...DEFAULT_PREFERENCES },
    };

    additionalInfoObj.userSettings = defaultSettings;

    await prisma.users.update({
      where: { id: userId },
      data: {
        additionalInfo: JSON.stringify(additionalInfoObj),
      },
    });

    return defaultSettings;
  }

  /**
   * Get notification settings only
   */
  async getNotificationSettings(
    userId: string
  ): Promise<NotificationSettingsInput> {
    const settings = await this.getUserSettings(userId);
    return settings.notifications;
  }

  /**
   * Get user preferences only
   */
  async getUserPreferences(userId: string): Promise<UserPreferencesInput> {
    const settings = await this.getUserSettings(userId);
    return settings.preferences;
  }
}

// Export singleton instance
export const userSettingsService = new UserSettingsService();

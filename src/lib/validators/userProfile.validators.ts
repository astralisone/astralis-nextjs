import { z } from 'zod';

/**
 * User Profile Validators
 * Zod schemas for user profile and settings management
 */

// Base profile fields schema
export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  avatar: z.string().url('Invalid avatar URL').optional().nullable(),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional().nullable(),
  company: z.string().max(100, 'Company name too long').optional().nullable(),
  teamSize: z.string().max(50, 'Team size too long').optional().nullable(),
  budget: z.string().max(100, 'Budget too long').optional().nullable(),
  timeline: z.string().max(100, 'Timeline too long').optional().nullable(),
  businessGoals: z.string().max(1000, 'Business goals too long').optional().nullable(),
  interestArea: z.string().max(200, 'Interest area too long').optional().nullable(),
  additionalInfo: z.string().max(2000, 'Additional info too long').optional().nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// Password change schema with validation
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// Delete account schema
export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required to delete account'),
  confirmation: z.literal('DELETE', {
    errorMap: () => ({ message: 'Please type DELETE to confirm' }),
  }),
});

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;

// User notification settings schema
export const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
  securityAlerts: z.boolean().default(true),
  weeklyDigest: z.boolean().default(false),
  productUpdates: z.boolean().default(true),
  bookingReminders: z.boolean().default(true),
  taskNotifications: z.boolean().default(true),
});

export type NotificationSettingsInput = z.infer<typeof notificationSettingsSchema>;

// User preferences schema
export const userPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  language: z.string().max(10).default('en'),
  timezone: z.string().max(50).default('UTC'),
  dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).default('MM/DD/YYYY'),
  timeFormat: z.enum(['12h', '24h']).default('12h'),
});

export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;

// Combined user settings schema
export const userSettingsSchema = z.object({
  notifications: notificationSettingsSchema.optional(),
  preferences: userPreferencesSchema.optional(),
});

export type UserSettingsInput = z.infer<typeof userSettingsSchema>;

// Full user profile response type (for API responses)
export const userProfileResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  emailVerified: z.date().nullable(),
  name: z.string().nullable(),
  avatar: z.string().nullable(),
  bio: z.string().nullable(),
  role: z.string(),
  isActive: z.boolean(),
  lastLoginAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  company: z.string().nullable(),
  teamSize: z.string().nullable(),
  budget: z.string().nullable(),
  timeline: z.string().nullable(),
  businessGoals: z.string().nullable(),
  interestArea: z.string().nullable(),
  additionalInfo: z.string().nullable(),
  onboardingCompleted: z.boolean(),
  orgId: z.string().nullable(),
});

export type UserProfileResponse = z.infer<typeof userProfileResponseSchema>;

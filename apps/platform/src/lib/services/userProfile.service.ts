import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/utils/crypto';
import {
  UpdateProfileInput,
  UserProfileResponse,
} from '@/lib/validators/userProfile.validators';

/**
 * User Profile Service
 * Handles user profile management operations including:
 * - Profile retrieval and updates
 * - Password changes
 * - Account deletion (soft delete)
 */

export interface UserProfileServiceError extends Error {
  code: 'NOT_FOUND' | 'INVALID_PASSWORD' | 'VALIDATION_ERROR' | 'INTERNAL_ERROR';
}

function createServiceError(
  message: string,
  code: UserProfileServiceError['code']
): UserProfileServiceError {
  const error = new Error(message) as UserProfileServiceError;
  error.code = code;
  return error;
}

export class UserProfileService {
  /**
   * Get full user profile by ID
   * Returns user profile with all fields except password
   */
  async getUserProfile(userId: string): Promise<UserProfileResponse> {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        name: true,
        avatar: true,
        bio: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        company: true,
        teamSize: true,
        budget: true,
        timeline: true,
        businessGoals: true,
        interestArea: true,
        additionalInfo: true,
        onboardingCompleted: true,
        orgId: true,
      },
    });

    if (!user) {
      throw createServiceError('User not found', 'NOT_FOUND');
    }

    return user as UserProfileResponse;
  }

  /**
   * Update user profile fields
   * Only updates provided fields, leaves others unchanged
   */
  async updateUserProfile(
    userId: string,
    data: UpdateProfileInput
  ): Promise<UserProfileResponse> {
    // Verify user exists first
    const existingUser = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!existingUser) {
      throw createServiceError('User not found', 'NOT_FOUND');
    }

    // Filter out undefined values to only update provided fields
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.company !== undefined) updateData.company = data.company;
    if (data.teamSize !== undefined) updateData.teamSize = data.teamSize;
    if (data.budget !== undefined) updateData.budget = data.budget;
    if (data.timeline !== undefined) updateData.timeline = data.timeline;
    if (data.businessGoals !== undefined) updateData.businessGoals = data.businessGoals;
    if (data.interestArea !== undefined) updateData.interestArea = data.interestArea;
    if (data.additionalInfo !== undefined) updateData.additionalInfo = data.additionalInfo;

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        emailVerified: true,
        name: true,
        avatar: true,
        bio: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        company: true,
        teamSize: true,
        budget: true,
        timeline: true,
        businessGoals: true,
        interestArea: true,
        additionalInfo: true,
        onboardingCompleted: true,
        orgId: true,
      },
    });

    return updatedUser as UserProfileResponse;
  }

  /**
   * Change user password
   * Requires current password verification before updating
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    // Get user with password hash
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user) {
      throw createServiceError('User not found', 'NOT_FOUND');
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, user.password);

    if (!isValidPassword) {
      throw createServiceError('Current password is incorrect', 'INVALID_PASSWORD');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.users.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }

  /**
   * Soft delete user account
   * Deactivates account instead of hard deleting for data retention
   * Requires password verification for security
   */
  async deleteAccount(
    userId: string,
    password: string
  ): Promise<{ success: boolean; message: string }> {
    // Get user with password hash
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, password: true, email: true },
    });

    if (!user) {
      throw createServiceError('User not found', 'NOT_FOUND');
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      throw createServiceError('Password is incorrect', 'INVALID_PASSWORD');
    }

    // Soft delete: deactivate account and anonymize email
    const anonymizedEmail = `deleted_${Date.now()}_${user.id}@deleted.local`;

    await prisma.users.update({
      where: { id: userId },
      data: {
        isActive: false,
        email: anonymizedEmail,
        name: 'Deleted User',
        avatar: null,
        bio: null,
        company: null,
        teamSize: null,
        budget: null,
        timeline: null,
        businessGoals: null,
        interestArea: null,
        additionalInfo: null,
      },
    });

    // Delete active sessions for security
    await prisma.session.deleteMany({
      where: { userId },
    });

    return {
      success: true,
      message: 'Account has been deactivated successfully',
    };
  }

  /**
   * Mark user onboarding as completed
   */
  async completeOnboarding(userId: string): Promise<{ success: boolean }> {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw createServiceError('User not found', 'NOT_FOUND');
    }

    await prisma.users.update({
      where: { id: userId },
      data: { onboardingCompleted: true },
    });

    return { success: true };
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId: string): Promise<void> {
    await prisma.users.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  /**
   * Verify user email
   */
  async verifyEmail(userId: string): Promise<{ success: boolean }> {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw createServiceError('User not found', 'NOT_FOUND');
    }

    await prisma.users.update({
      where: { id: userId },
      data: { emailVerified: new Date() },
    });

    return { success: true };
  }
}

// Export singleton instance
export const userProfileService = new UserProfileService();

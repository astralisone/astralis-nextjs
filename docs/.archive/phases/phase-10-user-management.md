# Phase 10: User Management, User Profile & Settings

**Duration**: 1-2 weeks
**Prerequisites**: Phase 1 complete (authentication/RBAC infrastructure)
**Priority**: High - Essential for multi-tenant user experience

---

## Overview

Implement comprehensive user management, profile editing, and settings functionality that allows users to manage their accounts, preferences, and organization settings. This phase enables self-service account management and administrative control over organization members.

**Marketing Promise:**
> "Take full control of your account with easy profile management, customizable preferences, and powerful team administration tools. Update your settings, manage notifications, and keep your organization running smoothly."

---

## Current State (as of Phase 6)

### What Exists
- `users` model with basic fields (email, name, password, avatar, bio, role)
- `organization` model with name and basic fields
- NextAuth.js authentication with session management
- UserRole enum: USER, AUTHOR, EDITOR, ADMIN, PM, OPERATOR, CLIENT
- Password reset token system
- Basic user-organization relationship (users.orgId)
- Session and Account models for OAuth

### What's Missing
- User profile edit UI and API endpoints
- Password change functionality (authenticated)
- Avatar upload to DigitalOcean Spaces
- User preferences/settings storage
- Notification preferences
- Theme preference (light/dark/system)
- Timezone and locale settings
- Two-factor authentication
- Organization settings management
- Team member invite/remove functionality
- API key management
- Account deletion (soft delete)

---

## Goals

1. **User Profile Management** - Allow users to view and edit their personal information
2. **Account Security** - Password changes and 2FA setup
3. **User Preferences** - Notification, theme, timezone, and locale settings
4. **Organization Administration** - Org settings and team management for admins
5. **Self-Service** - Reduce admin overhead with self-service account management

---

## Technical Implementation

### 1. Database Schema Changes

Add new models and fields to `prisma/schema.prisma`:

```prisma
// Add to users model
model users {
  // ... existing fields ...

  // Profile fields
  avatarUrl           String?
  phoneNumber         String?
  jobTitle            String?
  department          String?

  // Settings
  timezone            String    @default("UTC")
  locale              String    @default("en")
  theme               Theme     @default(SYSTEM)

  // Security
  twoFactorEnabled    Boolean   @default(false)
  twoFactorSecret     String?
  backupCodes         String[]  @default([])

  // Account status
  deletedAt           DateTime?  // Soft delete
  deletedReason       String?

  // Relations
  preferences         UserPreferences?
  apiKeys             ApiKey[]
  notificationSettings NotificationSettings?
}

model UserPreferences {
  id                  String   @id @default(cuid())
  userId              String   @unique

  // Notification preferences
  emailNotifications  Boolean  @default(true)
  inAppNotifications  Boolean  @default(true)

  // Email notification types
  emailOnNewAssignment Boolean @default(true)
  emailOnMention      Boolean  @default(true)
  emailOnComment      Boolean  @default(true)
  emailDigestFrequency EmailFrequency @default(DAILY)

  // UI preferences
  sidebarCollapsed    Boolean  @default(false)
  dashboardLayout     Json?

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  user                users    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_preferences")
}

model NotificationSettings {
  id                  String   @id @default(cuid())
  userId              String   @unique

  // In-app notification preferences
  intakeRequests      Boolean  @default(true)
  documentProcessing  Boolean  @default(true)
  automationAlerts    Boolean  @default(true)
  teamUpdates         Boolean  @default(true)
  systemAnnouncements Boolean  @default(true)

  // Quiet hours
  quietHoursEnabled   Boolean  @default(false)
  quietHoursStart     String?  // "22:00"
  quietHoursEnd       String?  // "08:00"
  quietHoursTimezone  String?

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  user                users    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notification_settings")
}

model ApiKey {
  id                  String    @id @default(cuid())
  userId              String
  orgId               String
  name                String
  keyPrefix           String    // First 8 characters for identification
  keyHash             String    // Hashed key for verification
  lastUsedAt          DateTime?
  expiresAt           DateTime?
  scopes              String[]  @default([])
  isActive            Boolean   @default(true)
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  user                users     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([keyPrefix])
  @@index([userId, isActive])
  @@map("api_keys")
}

model OrganizationInvite {
  id                  String           @id @default(cuid())
  orgId               String
  email               String
  role                UserRole         @default(USER)
  invitedById         String
  token               String           @unique
  status              InviteStatus     @default(PENDING)
  expiresAt           DateTime
  acceptedAt          DateTime?
  createdAt           DateTime         @default(now())
  updatedAt           DateTime         @updatedAt
  organization        organization     @relation(fields: [orgId], references: [id], onDelete: Cascade)

  @@index([token])
  @@index([orgId, status])
  @@index([email])
  @@map("organization_invites")
}

// Add to organization model
model organization {
  // ... existing fields ...

  // Branding
  logoUrl             String?
  brandColor          String?   @default("#2B6CB0")

  // Settings
  defaultTimezone     String    @default("UTC")
  defaultLocale       String    @default("en")

  // Billing (display only)
  billingEmail        String?
  billingAddress      String?
  planName            String    @default("starter")
  planExpiresAt       DateTime?

  // Relations
  invites             OrganizationInvite[]
  settings            OrganizationSettings?
}

model OrganizationSettings {
  id                  String       @id @default(cuid())
  orgId               String       @unique

  // Security settings
  enforceSSO          Boolean      @default(false)
  allowedEmailDomains String[]     @default([])
  sessionTimeout      Int          @default(1440) // minutes
  require2FA          Boolean      @default(false)

  // Feature flags
  aiRoutingEnabled    Boolean      @default(true)
  documentOCREnabled  Boolean      @default(true)
  automationsEnabled  Boolean      @default(true)

  createdAt           DateTime     @default(now())
  updatedAt           DateTime     @updatedAt
  organization        organization @relation(fields: [orgId], references: [id], onDelete: Cascade)

  @@map("organization_settings")
}

enum Theme {
  LIGHT
  DARK
  SYSTEM
}

enum InviteStatus {
  PENDING
  ACCEPTED
  EXPIRED
  REVOKED
}
```

### 2. User Profile Service

Create `src/lib/services/userProfile.service.ts`:

```typescript
import { prisma } from '@/lib/prisma';
import { spacesService } from '@/lib/services/spaces.service';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phoneNumber: z.string().max(20).optional().nullable(),
  jobTitle: z.string().max(100).optional().nullable(),
  department: z.string().max(100).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
  theme: z.enum(['LIGHT', 'DARK', 'SYSTEM']).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;

export class UserProfileService {
  /**
   * Get user profile with preferences
   */
  async getProfile(userId: string) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        preferences: true,
        notificationSettings: true,
        organization: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Remove sensitive fields
    const { password, twoFactorSecret, backupCodes, ...profile } = user;

    return profile;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: UpdateProfileData) {
    const parsed = updateProfileSchema.parse(data);

    const user = await prisma.users.update({
      where: { id: userId },
      data: parsed,
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        jobTitle: true,
        department: true,
        bio: true,
        timezone: true,
        locale: true,
        theme: true,
        avatar: true,
        avatarUrl: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Upload and update avatar
   */
  async updateAvatar(userId: string, file: Buffer, mimeType: string) {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(mimeType)) {
      throw new Error('Invalid file type. Allowed: JPEG, PNG, WebP, GIF');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.length > maxSize) {
      throw new Error('File too large. Maximum size: 5MB');
    }

    // Generate unique filename
    const extension = mimeType.split('/')[1];
    const filename = `avatars/${userId}/${Date.now()}.${extension}`;

    // Upload to DigitalOcean Spaces
    const cdnUrl = await spacesService.uploadFile(file, filename, mimeType);

    // Update user record
    const user = await prisma.users.update({
      where: { id: userId },
      data: {
        avatar: cdnUrl,
        avatarUrl: cdnUrl,
      },
      select: {
        id: true,
        avatar: true,
        avatarUrl: true,
      },
    });

    return user;
  }

  /**
   * Delete avatar
   */
  async deleteAvatar(userId: string) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    });

    if (user?.avatarUrl) {
      // Delete from Spaces
      await spacesService.deleteFile(user.avatarUrl);
    }

    await prisma.users.update({
      where: { id: userId },
      data: {
        avatar: null,
        avatarUrl: null,
      },
    });

    return { success: true };
  }

  /**
   * Change password
   */
  async changePassword(userId: string, data: ChangePasswordData) {
    const parsed = changePasswordSchema.parse(data);

    // Get current user
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValid = await bcrypt.compare(parsed.currentPassword, user.password);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Check new password is different
    const isSame = await bcrypt.compare(parsed.newPassword, user.password);
    if (isSame) {
      throw new Error('New password must be different from current password');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(parsed.newPassword, 12);

    // Update password
    await prisma.users.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // TODO: Invalidate all other sessions
    // TODO: Send email notification about password change

    return { success: true };
  }

  /**
   * Soft delete account
   */
  async deleteAccount(userId: string, password: string, reason?: string) {
    // Verify password
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { password: true, role: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Prevent admin deletion if they're the only admin
    if (user.role === 'ADMIN') {
      const adminCount = await prisma.users.count({
        where: {
          orgId: userId,
          role: 'ADMIN',
          deletedAt: null,
        },
      });

      if (adminCount <= 1) {
        throw new Error('Cannot delete account: You are the only admin. Transfer ownership first.');
      }
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Password is incorrect');
    }

    // Soft delete
    await prisma.users.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        deletedReason: reason,
        isActive: false,
      },
    });

    // Delete all sessions
    await prisma.session.deleteMany({
      where: { userId },
    });

    return { success: true };
  }
}

export const userProfileService = new UserProfileService();
```

### 3. User Settings Service

Create `src/lib/services/userSettings.service.ts`:

```typescript
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const preferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  inAppNotifications: z.boolean().optional(),
  emailOnNewAssignment: z.boolean().optional(),
  emailOnMention: z.boolean().optional(),
  emailOnComment: z.boolean().optional(),
  emailDigestFrequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY']).optional(),
  sidebarCollapsed: z.boolean().optional(),
  dashboardLayout: z.any().optional(),
});

const notificationSettingsSchema = z.object({
  intakeRequests: z.boolean().optional(),
  documentProcessing: z.boolean().optional(),
  automationAlerts: z.boolean().optional(),
  teamUpdates: z.boolean().optional(),
  systemAnnouncements: z.boolean().optional(),
  quietHoursEnabled: z.boolean().optional(),
  quietHoursStart: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  quietHoursEnd: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  quietHoursTimezone: z.string().optional().nullable(),
});

export type PreferencesData = z.infer<typeof preferencesSchema>;
export type NotificationSettingsData = z.infer<typeof notificationSettingsSchema>;

export class UserSettingsService {
  /**
   * Get or create user preferences
   */
  async getPreferences(userId: string) {
    let preferences = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) {
      preferences = await prisma.userPreferences.create({
        data: { userId },
      });
    }

    return preferences;
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId: string, data: PreferencesData) {
    const parsed = preferencesSchema.parse(data);

    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: parsed,
      create: {
        userId,
        ...parsed,
      },
    });

    return preferences;
  }

  /**
   * Get or create notification settings
   */
  async getNotificationSettings(userId: string) {
    let settings = await prisma.notificationSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await prisma.notificationSettings.create({
        data: { userId },
      });
    }

    return settings;
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(userId: string, data: NotificationSettingsData) {
    const parsed = notificationSettingsSchema.parse(data);

    const settings = await prisma.notificationSettings.upsert({
      where: { userId },
      update: parsed,
      create: {
        userId,
        ...parsed,
      },
    });

    return settings;
  }

  /**
   * Get all user settings combined
   */
  async getAllSettings(userId: string) {
    const [user, preferences, notificationSettings] = await Promise.all([
      prisma.users.findUnique({
        where: { id: userId },
        select: {
          timezone: true,
          locale: true,
          theme: true,
          twoFactorEnabled: true,
        },
      }),
      this.getPreferences(userId),
      this.getNotificationSettings(userId),
    ]);

    return {
      general: user,
      preferences,
      notifications: notificationSettings,
    };
  }
}

export const userSettingsService = new UserSettingsService();
```

### 4. Two-Factor Authentication Service

Create `src/lib/services/twoFactor.service.ts`:

```typescript
import { prisma } from '@/lib/prisma';
import { authenticator } from 'otplib';
import crypto from 'crypto';
import QRCode from 'qrcode';

const APP_NAME = 'Astralis One';

export class TwoFactorService {
  /**
   * Generate 2FA setup data
   */
  async generateSetup(userId: string) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { email: true, twoFactorEnabled: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.twoFactorEnabled) {
      throw new Error('Two-factor authentication is already enabled');
    }

    // Generate secret
    const secret = authenticator.generateSecret();

    // Generate OTP auth URL
    const otpAuthUrl = authenticator.keyuri(user.email, APP_NAME, secret);

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

    // Generate backup codes
    const backupCodes = this.generateBackupCodes(8);

    return {
      secret,
      qrCode: qrCodeDataUrl,
      backupCodes,
    };
  }

  /**
   * Verify and enable 2FA
   */
  async enable(userId: string, secret: string, token: string, backupCodes: string[]) {
    // Verify the token
    const isValid = authenticator.verify({ token, secret });

    if (!isValid) {
      throw new Error('Invalid verification code');
    }

    // Hash backup codes before storing
    const hashedBackupCodes = backupCodes.map(code =>
      crypto.createHash('sha256').update(code).digest('hex')
    );

    // Enable 2FA
    await prisma.users.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        backupCodes: hashedBackupCodes,
      },
    });

    return { success: true };
  }

  /**
   * Verify 2FA token during login
   */
  async verify(userId: string, token: string): Promise<boolean> {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true, backupCodes: true },
    });

    if (!user?.twoFactorSecret) {
      throw new Error('Two-factor authentication is not enabled');
    }

    // Try regular TOTP first
    const isValidToken = authenticator.verify({
      token,
      secret: user.twoFactorSecret,
    });

    if (isValidToken) {
      return true;
    }

    // Try backup code
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const backupCodeIndex = user.backupCodes.indexOf(tokenHash);

    if (backupCodeIndex !== -1) {
      // Remove used backup code
      const updatedBackupCodes = [...user.backupCodes];
      updatedBackupCodes.splice(backupCodeIndex, 1);

      await prisma.users.update({
        where: { id: userId },
        data: { backupCodes: updatedBackupCodes },
      });

      return true;
    }

    return false;
  }

  /**
   * Disable 2FA
   */
  async disable(userId: string, password: string) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify password
    const bcrypt = await import('bcryptjs');
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new Error('Password is incorrect');
    }

    // Disable 2FA
    await prisma.users.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: [],
      },
    });

    return { success: true };
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(userId: string, password: string) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { password: true, twoFactorEnabled: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.twoFactorEnabled) {
      throw new Error('Two-factor authentication is not enabled');
    }

    // Verify password
    const bcrypt = await import('bcryptjs');
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new Error('Password is incorrect');
    }

    // Generate new backup codes
    const backupCodes = this.generateBackupCodes(8);
    const hashedBackupCodes = backupCodes.map(code =>
      crypto.createHash('sha256').update(code).digest('hex')
    );

    // Update backup codes
    await prisma.users.update({
      where: { id: userId },
      data: { backupCodes: hashedBackupCodes },
    });

    return { backupCodes };
  }

  /**
   * Generate random backup codes
   */
  private generateBackupCodes(count: number): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
    }
    return codes;
  }
}

export const twoFactorService = new TwoFactorService();
```

### 5. Organization Settings Service

Create `src/lib/services/organizationSettings.service.ts`:

```typescript
import { prisma } from '@/lib/prisma';
import { spacesService } from '@/lib/services/spaces.service';
import { z } from 'zod';
import crypto from 'crypto';

const orgSettingsSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  defaultTimezone: z.string().optional(),
  defaultLocale: z.string().optional(),
  brandColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  billingEmail: z.string().email().optional().nullable(),
  billingAddress: z.string().max(500).optional().nullable(),
});

const orgSecuritySchema = z.object({
  enforceSSO: z.boolean().optional(),
  allowedEmailDomains: z.array(z.string()).optional(),
  sessionTimeout: z.number().min(15).max(10080).optional(), // 15 min to 7 days
  require2FA: z.boolean().optional(),
});

const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['USER', 'AUTHOR', 'EDITOR', 'ADMIN', 'PM', 'OPERATOR', 'CLIENT']),
});

export type OrgSettingsData = z.infer<typeof orgSettingsSchema>;
export type OrgSecurityData = z.infer<typeof orgSecuritySchema>;
export type InviteMemberData = z.infer<typeof inviteMemberSchema>;

export class OrganizationSettingsService {
  /**
   * Get organization settings
   */
  async getSettings(orgId: string, userId: string) {
    // Verify user is admin
    await this.verifyAdmin(orgId, userId);

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        settings: true,
        users: {
          where: { deletedAt: null },
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            role: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true,
          },
        },
        invites: {
          where: { status: 'PENDING' },
          select: {
            id: true,
            email: true,
            role: true,
            expiresAt: true,
            createdAt: true,
          },
        },
      },
    });

    if (!org) {
      throw new Error('Organization not found');
    }

    return org;
  }

  /**
   * Update organization settings
   */
  async updateSettings(orgId: string, userId: string, data: OrgSettingsData) {
    await this.verifyAdmin(orgId, userId);
    const parsed = orgSettingsSchema.parse(data);

    const org = await prisma.organization.update({
      where: { id: orgId },
      data: parsed,
    });

    return org;
  }

  /**
   * Update organization logo
   */
  async updateLogo(orgId: string, userId: string, file: Buffer, mimeType: string) {
    await this.verifyAdmin(orgId, userId);

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(mimeType)) {
      throw new Error('Invalid file type. Allowed: JPEG, PNG, SVG, WebP');
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.length > maxSize) {
      throw new Error('File too large. Maximum size: 2MB');
    }

    // Upload to Spaces
    const extension = mimeType.split('/')[1];
    const filename = `org-logos/${orgId}/${Date.now()}.${extension}`;
    const cdnUrl = await spacesService.uploadFile(file, filename, mimeType);

    // Update org
    const org = await prisma.organization.update({
      where: { id: orgId },
      data: { logoUrl: cdnUrl },
    });

    return org;
  }

  /**
   * Update security settings
   */
  async updateSecuritySettings(orgId: string, userId: string, data: OrgSecurityData) {
    await this.verifyAdmin(orgId, userId);
    const parsed = orgSecuritySchema.parse(data);

    const settings = await prisma.organizationSettings.upsert({
      where: { orgId },
      update: parsed,
      create: {
        orgId,
        ...parsed,
      },
    });

    return settings;
  }

  /**
   * Invite team member
   */
  async inviteMember(orgId: string, userId: string, data: InviteMemberData) {
    await this.verifyAdmin(orgId, userId);
    const parsed = inviteMemberSchema.parse(data);

    // Check if user already exists
    const existingUser = await prisma.users.findFirst({
      where: { email: parsed.email, orgId },
    });

    if (existingUser) {
      throw new Error('User is already a member of this organization');
    }

    // Check for pending invite
    const existingInvite = await prisma.organizationInvite.findFirst({
      where: {
        orgId,
        email: parsed.email,
        status: 'PENDING',
      },
    });

    if (existingInvite) {
      throw new Error('An invitation has already been sent to this email');
    }

    // Create invite
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const invite = await prisma.organizationInvite.create({
      data: {
        orgId,
        email: parsed.email,
        role: parsed.role,
        invitedById: userId,
        token,
        expiresAt,
      },
      include: {
        organization: {
          select: { name: true },
        },
      },
    });

    // TODO: Send invitation email with token link
    // await emailService.sendInvitation(invite);

    return invite;
  }

  /**
   * Revoke invitation
   */
  async revokeInvite(orgId: string, userId: string, inviteId: string) {
    await this.verifyAdmin(orgId, userId);

    await prisma.organizationInvite.update({
      where: { id: inviteId, orgId },
      data: { status: 'REVOKED' },
    });

    return { success: true };
  }

  /**
   * Remove team member
   */
  async removeMember(orgId: string, adminUserId: string, memberUserId: string) {
    await this.verifyAdmin(orgId, adminUserId);

    // Can't remove yourself
    if (adminUserId === memberUserId) {
      throw new Error('Cannot remove yourself from the organization');
    }

    // Verify member belongs to org
    const member = await prisma.users.findFirst({
      where: { id: memberUserId, orgId },
    });

    if (!member) {
      throw new Error('Member not found in this organization');
    }

    // Check if removing last admin
    if (member.role === 'ADMIN') {
      const adminCount = await prisma.users.count({
        where: { orgId, role: 'ADMIN', deletedAt: null },
      });

      if (adminCount <= 1) {
        throw new Error('Cannot remove the last admin from the organization');
      }
    }

    // Soft delete user from org
    await prisma.users.update({
      where: { id: memberUserId },
      data: {
        orgId: null,
        deletedAt: new Date(),
        deletedReason: 'Removed from organization',
      },
    });

    return { success: true };
  }

  /**
   * Change member role
   */
  async changeMemberRole(
    orgId: string,
    adminUserId: string,
    memberUserId: string,
    newRole: string
  ) {
    await this.verifyAdmin(orgId, adminUserId);

    // Can't change own role
    if (adminUserId === memberUserId) {
      throw new Error('Cannot change your own role');
    }

    // Verify member belongs to org
    const member = await prisma.users.findFirst({
      where: { id: memberUserId, orgId },
    });

    if (!member) {
      throw new Error('Member not found in this organization');
    }

    // Check if demoting last admin
    if (member.role === 'ADMIN' && newRole !== 'ADMIN') {
      const adminCount = await prisma.users.count({
        where: { orgId, role: 'ADMIN', deletedAt: null },
      });

      if (adminCount <= 1) {
        throw new Error('Cannot demote the last admin');
      }
    }

    // Update role
    await prisma.users.update({
      where: { id: memberUserId },
      data: { role: newRole as any },
    });

    return { success: true };
  }

  /**
   * Get team members
   */
  async getTeamMembers(orgId: string, userId: string) {
    // Any org member can view team
    const user = await prisma.users.findFirst({
      where: { id: userId, orgId },
    });

    if (!user) {
      throw new Error('Not a member of this organization');
    }

    const members = await prisma.users.findMany({
      where: { orgId, deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        jobTitle: true,
        department: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: [
        { role: 'asc' },
        { name: 'asc' },
      ],
    });

    return members;
  }

  /**
   * Verify user is admin of org
   */
  private async verifyAdmin(orgId: string, userId: string) {
    const user = await prisma.users.findFirst({
      where: {
        id: userId,
        orgId,
        role: 'ADMIN',
        deletedAt: null,
      },
    });

    if (!user) {
      throw new Error('Unauthorized: Admin access required');
    }

    return user;
  }
}

export const organizationSettingsService = new OrganizationSettingsService();
```

### 6. API Key Service

Create `src/lib/services/apiKey.service.ts`:

```typescript
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { z } from 'zod';

const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(z.string()).default([]),
  expiresInDays: z.number().min(1).max(365).optional(),
});

export type CreateApiKeyData = z.infer<typeof createApiKeySchema>;

export class ApiKeyService {
  /**
   * Create new API key
   */
  async create(userId: string, orgId: string, data: CreateApiKeyData) {
    const parsed = createApiKeySchema.parse(data);

    // Generate key
    const rawKey = `ak_${crypto.randomBytes(32).toString('hex')}`;
    const keyPrefix = rawKey.substring(0, 10);
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    // Calculate expiry
    let expiresAt: Date | undefined;
    if (parsed.expiresInDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parsed.expiresInDays);
    }

    // Create key record
    const apiKey = await prisma.apiKey.create({
      data: {
        userId,
        orgId,
        name: parsed.name,
        keyPrefix,
        keyHash,
        scopes: parsed.scopes,
        expiresAt,
      },
    });

    // Return raw key only once
    return {
      id: apiKey.id,
      name: apiKey.name,
      key: rawKey, // Only returned on creation
      keyPrefix: apiKey.keyPrefix,
      scopes: apiKey.scopes,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
    };
  }

  /**
   * List user's API keys
   */
  async list(userId: string) {
    const keys = await prisma.apiKey.findMany({
      where: { userId, isActive: true },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        scopes: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return keys;
  }

  /**
   * Revoke API key
   */
  async revoke(userId: string, keyId: string) {
    await prisma.apiKey.updateMany({
      where: { id: keyId, userId },
      data: { isActive: false },
    });

    return { success: true };
  }

  /**
   * Verify API key
   */
  async verify(rawKey: string): Promise<{
    valid: boolean;
    userId?: string;
    orgId?: string;
    scopes?: string[];
  }> {
    const keyPrefix = rawKey.substring(0, 10);
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const apiKey = await prisma.apiKey.findFirst({
      where: {
        keyPrefix,
        keyHash,
        isActive: true,
      },
    });

    if (!apiKey) {
      return { valid: false };
    }

    // Check expiry
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return { valid: false };
    }

    // Update last used
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    });

    return {
      valid: true,
      userId: apiKey.userId,
      orgId: apiKey.orgId,
      scopes: apiKey.scopes,
    };
  }
}

export const apiKeyService = new ApiKeyService();
```

---

## API Endpoints

### User Profile APIs

Create `src/app/api/users/me/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { userProfileService } from '@/lib/services/userProfile.service';

// GET /api/users/me - Get current user profile
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const profile = await userProfileService.getProfile(session.user.id);
    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error('[Profile] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get profile', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

// PUT /api/users/me - Update current user profile
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const profile = await userProfileService.updateProfile(session.user.id, body);
    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error('[Profile] Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 400 }
    );
  }
}
```

Create `src/app/api/users/me/password/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { userProfileService } from '@/lib/services/userProfile.service';

// PUT /api/users/me/password - Change password
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    await userProfileService.changePassword(session.user.id, body);
    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('[Password] Change error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to change password' },
      { status: 400 }
    );
  }
}
```

Create `src/app/api/users/me/avatar/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { userProfileService } from '@/lib/services/userProfile.service';

// PUT /api/users/me/avatar - Upload avatar
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await userProfileService.updateAvatar(
      session.user.id,
      buffer,
      file.type
    );

    return NextResponse.json({ success: true, avatar: result });
  } catch (error) {
    console.error('[Avatar] Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload avatar' },
      { status: 400 }
    );
  }
}

// DELETE /api/users/me/avatar - Delete avatar
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await userProfileService.deleteAvatar(session.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Avatar] Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete avatar' },
      { status: 500 }
    );
  }
}
```

Create `src/app/api/users/me/settings/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { userSettingsService } from '@/lib/services/userSettings.service';

// GET /api/users/me/settings - Get all user settings
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const settings = await userSettingsService.getAllSettings(session.user.id);
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('[Settings] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get settings' },
      { status: 500 }
    );
  }
}

// PUT /api/users/me/settings - Update user settings
export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { preferences, notifications } = body;

    const results: Record<string, unknown> = {};

    if (preferences) {
      results.preferences = await userSettingsService.updatePreferences(
        session.user.id,
        preferences
      );
    }

    if (notifications) {
      results.notifications = await userSettingsService.updateNotificationSettings(
        session.user.id,
        notifications
      );
    }

    return NextResponse.json({ success: true, ...results });
  } catch (error) {
    console.error('[Settings] Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 400 }
    );
  }
}
```

### Organization Settings APIs

Create `src/app/api/orgs/[id]/settings/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { organizationSettingsService } from '@/lib/services/organizationSettings.service';

// GET /api/orgs/[id]/settings - Get organization settings
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: orgId } = await params;

  try {
    const settings = await organizationSettingsService.getSettings(
      orgId,
      session.user.id
    );
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('[OrgSettings] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get settings' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 403 : 500 }
    );
  }
}

// PUT /api/orgs/[id]/settings - Update organization settings
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: orgId } = await params;
  const body = await req.json();

  try {
    const settings = await organizationSettingsService.updateSettings(
      orgId,
      session.user.id,
      body
    );
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('[OrgSettings] Update error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update settings' },
      { status: 400 }
    );
  }
}
```

Create `src/app/api/orgs/[id]/members/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { organizationSettingsService } from '@/lib/services/organizationSettings.service';

// GET /api/orgs/[id]/members - List team members
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: orgId } = await params;

  try {
    const members = await organizationSettingsService.getTeamMembers(
      orgId,
      session.user.id
    );
    return NextResponse.json({ success: true, members });
  } catch (error) {
    console.error('[Members] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get members' },
      { status: 500 }
    );
  }
}

// POST /api/orgs/[id]/members - Invite new member
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: orgId } = await params;
  const body = await req.json();

  try {
    const invite = await organizationSettingsService.inviteMember(
      orgId,
      session.user.id,
      body
    );
    return NextResponse.json({ success: true, invite }, { status: 201 });
  } catch (error) {
    console.error('[Members] Invite error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send invite' },
      { status: 400 }
    );
  }
}

// DELETE /api/orgs/[id]/members - Remove member
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: orgId } = await params;
  const { memberId } = await req.json();

  try {
    await organizationSettingsService.removeMember(
      orgId,
      session.user.id,
      memberId
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Members] Remove error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to remove member' },
      { status: 400 }
    );
  }
}
```

---

## UI Pages

### File Structure

```
src/app/(app)/settings/
├── layout.tsx              # Settings layout with sidebar navigation
├── profile/
│   └── page.tsx            # User profile page
├── account/
│   └── page.tsx            # Account settings (password, 2FA, delete)
├── preferences/
│   └── page.tsx            # Notifications, theme, timezone
├── organization/
│   └── page.tsx            # Org settings (admin only)
├── team/
│   └── page.tsx            # Team member management (admin only)
└── api-keys/
    └── page.tsx            # API key management
```

### Settings Layout

Create `src/app/(app)/settings/layout.tsx`:

```typescript
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  User,
  Shield,
  Bell,
  Building2,
  Users,
  Key,
} from 'lucide-react';

const settingsNav = [
  { href: '/settings/profile', label: 'Profile', icon: User },
  { href: '/settings/account', label: 'Account', icon: Shield },
  { href: '/settings/preferences', label: 'Preferences', icon: Bell },
  { href: '/settings/organization', label: 'Organization', icon: Building2, adminOnly: true },
  { href: '/settings/team', label: 'Team', icon: Users, adminOnly: true },
  { href: '/settings/api-keys', label: 'API Keys', icon: Key },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-astralis-navy">Settings</h2>
        </div>
        <nav className="px-3">
          {settingsNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-astralis-blue/10 text-astralis-blue'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 bg-slate-50">
        <div className="max-w-4xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}
```

### Profile Page

Create `src/app/(app)/settings/profile/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Loader2 } from 'lucide-react';

interface Profile {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  avatarUrl: string | null;
  bio: string | null;
  phoneNumber: string | null;
  jobTitle: string | null;
  department: string | null;
  timezone: string;
  locale: string;
}

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/users/me');
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile.name,
          bio: profile.bio,
          phoneNumber: profile.phoneNumber,
          jobTitle: profile.jobTitle,
          department: profile.department,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully' });
        updateSession(); // Refresh session data
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/users/me/avatar', {
        method: 'PUT',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setProfile((prev) =>
          prev ? { ...prev, avatar: data.avatar.avatar, avatarUrl: data.avatar.avatarUrl } : prev
        );
        setMessage({ type: 'success', text: 'Avatar updated successfully' });
        updateSession();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to upload avatar' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload avatar' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-astralis-blue" />
      </div>
    );
  }

  if (!profile) {
    return <div>Failed to load profile</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-astralis-navy">Profile</h1>
        <p className="text-slate-600 mt-1">Manage your personal information</p>
      </div>

      {message && (
        <Alert variant={message.type === 'success' ? 'success' : 'error'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Avatar Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatarUrl || profile.avatar || undefined} />
                <AvatarFallback className="text-2xl">
                  {profile.name?.charAt(0) || profile.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 p-1.5 bg-astralis-blue text-white rounded-full cursor-pointer hover:bg-astralis-blue/90 transition-colors"
              >
                {uploadingAvatar ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                />
              </label>
            </div>
            <div>
              <p className="text-sm text-slate-600">
                Upload a profile picture. Accepted formats: JPEG, PNG, WebP, GIF.
              </p>
              <p className="text-sm text-slate-500 mt-1">Maximum file size: 5MB</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name || ''}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profile.email} disabled className="bg-slate-50" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profile.phoneNumber || ''}
                  onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={profile.jobTitle || ''}
                  onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={profile.department || ''}
                onChange={(e) => setProfile({ ...profile, department: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                rows={3}
                value={profile.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell us a bit about yourself..."
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Security Considerations

### 1. Authentication & Authorization
- All settings endpoints require authentication
- Organization settings restricted to ADMIN role users
- Team management actions logged in audit trail
- API keys use SHA-256 hashing (key only shown once on creation)

### 2. Password Security
- Current password required to change password
- Bcrypt hashing with 12 rounds
- Password change invalidates all other sessions
- Email notification sent on password change

### 3. Two-Factor Authentication
- TOTP-based using authenticator apps
- 8 backup codes generated (SHA-256 hashed)
- Password required to disable 2FA
- Backup codes single-use

### 4. Data Protection
- Avatar uploads validated for type and size
- Soft delete for account deletion (data retained for compliance)
- Sensitive fields excluded from API responses
- Rate limiting on sensitive endpoints

### 5. Invitation Security
- Invite tokens use crypto.randomBytes(32)
- 7-day expiration on invites
- Invites can be revoked
- Email domain restrictions configurable

---

## Environment Variables Required

```bash
# Existing (should already have)
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3001"

# DigitalOcean Spaces (for avatar uploads)
DO_SPACES_KEY="..."
DO_SPACES_SECRET="..."
DO_SPACES_REGION="nyc3"
DO_SPACES_BUCKET="astralis-uploads"
DO_SPACES_CDN_ENDPOINT="https://astralis-uploads.nyc3.cdn.digitaloceanspaces.com"

# 2FA (optional, uses TOTP standard)
TWO_FACTOR_APP_NAME="Astralis One"
```

---

## Testing Checklist

### User Profile
- [ ] View profile with all fields populated
- [ ] Update name, phone, job title, department, bio
- [ ] Upload avatar (JPEG, PNG, WebP, GIF)
- [ ] Delete avatar
- [ ] Avatar size validation (max 5MB)
- [ ] Avatar type validation

### Account Settings
- [ ] Change password successfully
- [ ] Change password with incorrect current password fails
- [ ] Enable 2FA with QR code scan
- [ ] Verify 2FA with authenticator code
- [ ] Verify 2FA with backup code
- [ ] Disable 2FA requires password
- [ ] Regenerate backup codes
- [ ] Soft delete account

### User Preferences
- [ ] Update notification preferences
- [ ] Update theme preference (light/dark/system)
- [ ] Update timezone
- [ ] Update locale
- [ ] Quiet hours configuration

### Organization Settings (Admin)
- [ ] View organization settings
- [ ] Update organization name and branding
- [ ] Upload organization logo
- [ ] Update default timezone/locale
- [ ] Update security settings

### Team Management (Admin)
- [ ] View team members list
- [ ] Invite new member by email
- [ ] Change member role
- [ ] Remove member (not self)
- [ ] Revoke pending invitation
- [ ] Cannot remove last admin
- [ ] Non-admin cannot access

### API Keys
- [ ] Create new API key
- [ ] Key shown only once on creation
- [ ] List API keys (without full key)
- [ ] Revoke API key
- [ ] API key authentication works
- [ ] Expired keys rejected

---

## Success Criteria

1. **User Profile Management**
   - Users can view and edit all profile fields
   - Avatar upload/delete works with DigitalOcean Spaces
   - Profile changes reflected immediately in session

2. **Account Security**
   - Password change requires current password
   - 2FA setup with QR code and backup codes
   - Account deletion soft-deletes with data retention

3. **User Preferences**
   - Notification preferences save and apply
   - Theme preference persists across sessions
   - Timezone affects all date/time displays

4. **Organization Administration**
   - Admins can manage org settings and branding
   - Team invitations sent via email with secure tokens
   - Role changes and removals logged

5. **API Key Management**
   - Keys generated securely with prefix identification
   - Key verification works for API authentication
   - Expired/revoked keys properly rejected

6. **Performance**
   - Settings pages load in <500ms
   - Avatar upload completes in <3 seconds
   - All API responses <200ms average

---

## Related Documentation

- Phase 1: Authentication & RBAC - `/docs/phases/phase-1-authentication-rbac.md`
- Phase 6: Automation - `/docs/phases/phase-6-automation.md`
- Booking Setup Guide - `/docs/BOOKING_SETUP.md`

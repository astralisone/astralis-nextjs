import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

// Types for organization settings
export interface OrgSettingsInput {
  name?: string;
}

export interface OrgMember {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
}

export interface InviteMemberResult {
  success: boolean;
  message: string;
  userId?: string;
}

export interface OrgSettings {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  memberCount: number;
}

/**
 * Check if a user is an admin of the specified organization
 */
export async function isOrgAdmin(userId: string, orgId: string): Promise<boolean> {
  const user = await prisma.users.findFirst({
    where: {
      id: userId,
      orgId: orgId,
      role: UserRole.ADMIN,
      isActive: true,
    },
    select: { id: true },
  });

  return user !== null;
}

/**
 * Check if a user belongs to the specified organization
 */
export async function isOrgMember(userId: string, orgId: string): Promise<boolean> {
  const user = await prisma.users.findFirst({
    where: {
      id: userId,
      orgId: orgId,
      isActive: true,
    },
    select: { id: true },
  });

  return user !== null;
}

export class OrgSettingsService {
  /**
   * Get organization settings by ID
   */
  async getOrgSettings(orgId: string): Promise<OrgSettings | null> {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!org) {
      return null;
    }

    return {
      id: org.id,
      name: org.name,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
      memberCount: org._count.users,
    };
  }

  /**
   * Update organization settings (admin only)
   */
  async updateOrgSettings(
    orgId: string,
    userId: string,
    data: OrgSettingsInput
  ): Promise<OrgSettings> {
    // Verify user is admin
    const isAdmin = await isOrgAdmin(userId, orgId);
    if (!isAdmin) {
      throw new Error('Only organization admins can update settings');
    }

    // Update organization
    const updatedOrg = await prisma.organization.update({
      where: { id: orgId },
      data: {
        name: data.name,
      },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        userId,
        orgId,
        action: 'UPDATE',
        entity: 'ORGANIZATION',
        entityId: orgId,
        metadata: {
          changes: JSON.parse(JSON.stringify(data)),
        },
      },
    });

    return {
      id: updatedOrg.id,
      name: updatedOrg.name,
      createdAt: updatedOrg.createdAt,
      updatedAt: updatedOrg.updatedAt,
      memberCount: updatedOrg._count.users,
    };
  }

  /**
   * Get all members of an organization
   */
  async getOrgMembers(orgId: string): Promise<OrgMember[]> {
    const members = await prisma.users.findMany({
      where: {
        orgId: orgId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: [
        { role: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    return members;
  }

  /**
   * Invite a new member to the organization
   * NOTE: This creates a placeholder user account. In production,
   * you would send an invitation email and the user would complete signup.
   */
  async inviteMember(
    orgId: string,
    inviterUserId: string,
    email: string,
    role: string
  ): Promise<InviteMemberResult> {
    // Verify inviter is admin
    const isAdmin = await isOrgAdmin(inviterUserId, orgId);
    if (!isAdmin) {
      throw new Error('Only organization admins can invite members');
    }

    // Validate role
    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(role as UserRole)) {
      throw new Error(`Invalid role: ${role}. Valid roles are: ${validRoles.join(', ')}`);
    }

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      // If user exists and is already in an org, reject
      if (existingUser.orgId) {
        throw new Error('User is already a member of an organization');
      }

      // If user exists but not in an org, add them to this org
      const updatedUser = await prisma.users.update({
        where: { id: existingUser.id },
        data: {
          orgId,
          role: role as UserRole,
        },
      });

      // Log the activity
      await prisma.activityLog.create({
        data: {
          userId: inviterUserId,
          orgId,
          action: 'ADD_MEMBER',
          entity: 'USER',
          entityId: updatedUser.id,
          metadata: {
            email,
            role,
            addedBy: inviterUserId,
          },
        },
      });

      return {
        success: true,
        message: 'Existing user added to organization',
        userId: updatedUser.id,
      };
    }

    // Create new invited user (placeholder - in production would send invite email)
    // Using a temporary password that should be reset on first login
    const newUser = await prisma.users.create({
      data: {
        email,
        password: `PENDING_INVITE_${Date.now()}`, // Placeholder - user must set password
        role: role as UserRole,
        orgId,
        isActive: false, // User is inactive until they complete signup
      },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        userId: inviterUserId,
        orgId,
        action: 'INVITE_MEMBER',
        entity: 'USER',
        entityId: newUser.id,
        metadata: {
          email,
          role,
          invitedBy: inviterUserId,
        },
      },
    });

    return {
      success: true,
      message: 'Invitation created. User must complete signup to activate account.',
      userId: newUser.id,
    };
  }

  /**
   * Remove a member from the organization
   */
  async removeMember(
    orgId: string,
    adminUserId: string,
    memberUserId: string
  ): Promise<{ success: boolean; message: string }> {
    // Verify admin status
    const isAdmin = await isOrgAdmin(adminUserId, orgId);
    if (!isAdmin) {
      throw new Error('Only organization admins can remove members');
    }

    // Prevent self-removal
    if (adminUserId === memberUserId) {
      throw new Error('Cannot remove yourself from the organization');
    }

    // Verify the member exists and belongs to this org
    const member = await prisma.users.findFirst({
      where: {
        id: memberUserId,
        orgId: orgId,
      },
    });

    if (!member) {
      throw new Error('Member not found in this organization');
    }

    // Check if this is the last admin
    if (member.role === UserRole.ADMIN) {
      const adminCount = await prisma.users.count({
        where: {
          orgId: orgId,
          role: UserRole.ADMIN,
          isActive: true,
        },
      });

      if (adminCount <= 1) {
        throw new Error('Cannot remove the last admin from the organization');
      }
    }

    // Remove member from organization (set orgId to null)
    await prisma.users.update({
      where: { id: memberUserId },
      data: {
        orgId: null,
      },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        userId: adminUserId,
        orgId,
        action: 'REMOVE_MEMBER',
        entity: 'USER',
        entityId: memberUserId,
        metadata: {
          removedUserEmail: member.email,
          removedUserRole: member.role,
          removedBy: adminUserId,
        },
      },
    });

    return {
      success: true,
      message: 'Member removed from organization',
    };
  }

  /**
   * Update a member's role within the organization
   */
  async updateMemberRole(
    orgId: string,
    adminUserId: string,
    memberUserId: string,
    newRole: string
  ): Promise<{ success: boolean; message: string; member: OrgMember }> {
    // Verify admin status
    const isAdmin = await isOrgAdmin(adminUserId, orgId);
    if (!isAdmin) {
      throw new Error('Only organization admins can update member roles');
    }

    // Validate new role
    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(newRole as UserRole)) {
      throw new Error(`Invalid role: ${newRole}. Valid roles are: ${validRoles.join(', ')}`);
    }

    // Verify the member exists and belongs to this org
    const member = await prisma.users.findFirst({
      where: {
        id: memberUserId,
        orgId: orgId,
      },
    });

    if (!member) {
      throw new Error('Member not found in this organization');
    }

    // Prevent demoting the last admin
    if (member.role === UserRole.ADMIN && newRole !== UserRole.ADMIN) {
      const adminCount = await prisma.users.count({
        where: {
          orgId: orgId,
          role: UserRole.ADMIN,
          isActive: true,
        },
      });

      if (adminCount <= 1) {
        throw new Error('Cannot demote the last admin of the organization');
      }
    }

    const oldRole = member.role;

    // Update member role
    const updatedMember = await prisma.users.update({
      where: { id: memberUserId },
      data: {
        role: newRole as UserRole,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        userId: adminUserId,
        orgId,
        action: 'UPDATE_ROLE',
        entity: 'USER',
        entityId: memberUserId,
        metadata: {
          oldRole,
          newRole,
          updatedBy: adminUserId,
        },
      },
    });

    return {
      success: true,
      message: `Member role updated from ${oldRole} to ${newRole}`,
      member: updatedMember,
    };
  }
}

export const orgSettingsService = new OrgSettingsService();

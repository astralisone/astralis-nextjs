import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { UserRole } from '@prisma/client';
import { NextResponse } from 'next/server';

/**
 * Check if user has required role
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const userRole = session.user.role as UserRole;
  if (!allowedRoles.includes(userRole)) {
    return NextResponse.json(
      { error: 'Forbidden - insufficient permissions' },
      { status: 403 }
    );
  }

  return null; // Allow request to continue
}

/**
 * Check if user belongs to specified organization
 */
export async function requireOrganization(orgId: string) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  if (session.user.orgId !== orgId) {
    return NextResponse.json(
      { error: 'Forbidden - access to other organizations not allowed' },
      { status: 403 }
    );
  }

  return null; // Allow request to continue
}

/**
 * Permission matrix
 */
export const permissions = {
  // User management
  'user:create': ['ADMIN'],
  'user:update': ['ADMIN'],
  'user:delete': ['ADMIN'],
  'user:view': ['ADMIN', 'EDITOR', 'PM'],

  // Pipeline management
  'pipeline:create': ['ADMIN'],
  'pipeline:update': ['ADMIN', 'EDITOR', 'PM'],
  'pipeline:delete': ['ADMIN'],
  'pipeline:view': ['ADMIN', 'EDITOR', 'PM', 'USER'],

  // Intake management
  'intake:create': ['ADMIN', 'EDITOR', 'PM', 'USER'],
  'intake:update': ['ADMIN', 'EDITOR', 'PM'],
  'intake:delete': ['ADMIN'],
  'intake:view': ['ADMIN', 'EDITOR', 'PM', 'USER'],

  // Document management
  'document:upload': ['ADMIN', 'EDITOR', 'PM', 'USER'],
  'document:view': ['ADMIN', 'EDITOR', 'PM', 'USER'],
  'document:delete': ['ADMIN', 'EDITOR'],

  // Organization settings
  'org:settings': ['ADMIN'],
  'org:billing': ['ADMIN'],
};

/**
 * Check if user has specific permission
 */
export async function hasPermission(permission: keyof typeof permissions): Promise<boolean> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return false;
  }

  const userRole = session.user.role as UserRole;
  const allowedRoles = permissions[permission];

  return allowedRoles.includes(userRole);
}

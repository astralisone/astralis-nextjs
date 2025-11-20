import { auth } from '@/lib/auth/config';
import { Role } from '@prisma/client';
import { NextResponse } from 'next/server';

/**
 * Check if user has required role
 */
export async function requireRole(allowedRoles: Role[]) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const userRole = session.user.role as Role;
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
  const session = await auth();

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
  'user:view': ['ADMIN', 'OPERATOR'],

  // Pipeline management
  'pipeline:create': ['ADMIN'],
  'pipeline:update': ['ADMIN', 'OPERATOR'],
  'pipeline:delete': ['ADMIN'],
  'pipeline:view': ['ADMIN', 'OPERATOR'],

  // Intake management
  'intake:create': ['ADMIN', 'OPERATOR', 'CLIENT'],
  'intake:update': ['ADMIN', 'OPERATOR'],
  'intake:delete': ['ADMIN'],
  'intake:view': ['ADMIN', 'OPERATOR', 'CLIENT'],

  // Document management
  'document:upload': ['ADMIN', 'OPERATOR', 'CLIENT'],
  'document:view': ['ADMIN', 'OPERATOR', 'CLIENT'],
  'document:delete': ['ADMIN', 'OPERATOR'],

  // Organization settings
  'org:settings': ['ADMIN'],
  'org:billing': ['ADMIN'],
};

/**
 * Check if user has specific permission
 */
export async function hasPermission(permission: keyof typeof permissions): Promise<boolean> {
  const session = await auth();

  if (!session || !session.user) {
    return false;
  }

  const userRole = session.user.role as Role;
  const allowedRoles = permissions[permission];

  return allowedRoles.includes(userRole);
}

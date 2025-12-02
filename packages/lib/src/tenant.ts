/**
 * Multi-tenant utilities for org-scoped operations
 */

export interface TenantContext {
  orgId: string;
  userId?: string;
  role?: string;
}

/**
 * Validates that an orgId is present and valid
 */
export function requireOrgId(orgId: string | null | undefined): string {
  if (!orgId) {
    throw new Error('Organization ID is required');
  }
  return orgId;
}

/**
 * Creates a Prisma WHERE clause with orgId
 */
export function withOrgId<T extends Record<string, unknown>>(
  orgId: string,
  where?: T
): T & { orgId: string } {
  return {
    ...where,
    orgId,
  } as T & { orgId: string };
}

/**
 * Creates a Prisma data object with orgId for creates
 */
export function withOrgIdData<T extends Record<string, unknown>>(
  orgId: string,
  data: T
): T & { orgId: string } {
  return {
    ...data,
    orgId,
  };
}

/**
 * Type guard to check if session has orgId
 */
export function hasOrgId(session: unknown): session is { user: { orgId: string } } {
  return (
    typeof session === 'object' &&
    session !== null &&
    'user' in session &&
    typeof (session as { user: unknown }).user === 'object' &&
    (session as { user: unknown }).user !== null &&
    'orgId' in ((session as { user: object }).user) &&
    typeof ((session as { user: { orgId: unknown } }).user.orgId) === 'string'
  );
}

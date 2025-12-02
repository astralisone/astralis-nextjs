/**
 * Multi-tenant utilities for org-scoped operations
 */
/**
 * Validates that an orgId is present and valid
 */
export function requireOrgId(orgId) {
    if (!orgId) {
        throw new Error('Organization ID is required');
    }
    return orgId;
}
/**
 * Creates a Prisma WHERE clause with orgId
 */
export function withOrgId(orgId, where) {
    return {
        ...where,
        orgId,
    };
}
/**
 * Creates a Prisma data object with orgId for creates
 */
export function withOrgIdData(orgId, data) {
    return {
        ...data,
        orgId,
    };
}
/**
 * Type guard to check if session has orgId
 */
export function hasOrgId(session) {
    return (typeof session === 'object' &&
        session !== null &&
        'user' in session &&
        typeof session.user === 'object' &&
        session.user !== null &&
        'orgId' in (session.user) &&
        typeof (session.user.orgId) === 'string');
}

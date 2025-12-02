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
export declare function requireOrgId(orgId: string | null | undefined): string;
/**
 * Creates a Prisma WHERE clause with orgId
 */
export declare function withOrgId<T extends Record<string, unknown>>(orgId: string, where?: T): T & {
    orgId: string;
};
/**
 * Creates a Prisma data object with orgId for creates
 */
export declare function withOrgIdData<T extends Record<string, unknown>>(orgId: string, data: T): T & {
    orgId: string;
};
/**
 * Type guard to check if session has orgId
 */
export declare function hasOrgId(session: unknown): session is {
    user: {
        orgId: string;
    };
};
//# sourceMappingURL=tenant.d.ts.map
/**
 * Query Key Factories
 *
 * Centralized query key management for TanStack Query.
 * Ensures type safety and consistent key structure across the application.
 *
 * Benefits:
 * - Type-safe query keys with autocomplete
 * - Hierarchical key structure for efficient invalidation
 * - Prevents key duplication and typos
 * - Easy refactoring and maintenance
 *
 * @see https://tkdodo.eu/blog/effective-react-query-keys
 */

/**
 * Base query key structure
 */
type QueryKeyBase = readonly [string, ...any[]];

/**
 * Organizations Query Keys
 *
 * Hierarchy:
 * - ['organizations'] - all organizations
 * - ['organizations', orgId] - specific organization
 * - ['organizations', orgId, 'stats'] - organization statistics
 */
export const organizationKeys = {
  all: ['organizations'] as const,
  lists: () => [...organizationKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) =>
    [...organizationKeys.lists(), { filters }] as const,
  details: () => [...organizationKeys.all, 'detail'] as const,
  detail: (orgId: string) => [...organizationKeys.details(), orgId] as const,
  stats: (orgId: string) => [...organizationKeys.detail(orgId), 'stats'] as const,
};

/**
 * Pipelines Query Keys
 *
 * Hierarchy:
 * - ['pipelines', orgId] - all pipelines for an org
 * - ['pipelines', orgId, pipelineId] - specific pipeline
 * - ['pipelines', orgId, pipelineId, 'items'] - pipeline items
 * - ['pipelines', orgId, pipelineId, 'stages'] - pipeline stages
 */
export const pipelineKeys = {
  all: ['pipelines'] as const,
  lists: () => [...pipelineKeys.all, 'list'] as const,
  list: (orgId: string, filters?: {
    isActive?: boolean;
    search?: string;
  }) => [...pipelineKeys.lists(), orgId, { filters }] as const,
  details: () => [...pipelineKeys.all, 'detail'] as const,
  detail: (pipelineId: string) => [...pipelineKeys.details(), pipelineId] as const,
  items: (pipelineId: string) => [...pipelineKeys.detail(pipelineId), 'items'] as const,
  stages: (pipelineId: string) => [...pipelineKeys.detail(pipelineId), 'stages'] as const,
  item: (pipelineId: string, itemId: string) =>
    [...pipelineKeys.items(pipelineId), itemId] as const,
};

/**
 * Intake Requests Query Keys
 *
 * Hierarchy:
 * - ['intake', orgId] - all intake requests for an org
 * - ['intake', orgId, filters] - filtered intake requests
 * - ['intake', orgId, requestId] - specific intake request
 */
export const intakeKeys = {
  all: ['intake'] as const,
  lists: () => [...intakeKeys.all, 'list'] as const,
  list: (orgId: string, filters?: {
    status?: string;
    source?: string;
    priority?: number;
    limit?: number;
    offset?: number;
  }) => [...intakeKeys.lists(), orgId, { filters }] as const,
  details: () => [...intakeKeys.all, 'detail'] as const,
  detail: (requestId: string) => [...intakeKeys.details(), requestId] as const,
  stats: (orgId: string) => [...intakeKeys.all, orgId, 'stats'] as const,
};

/**
 * Users Query Keys
 *
 * Hierarchy:
 * - ['users', orgId] - all users in an org
 * - ['users', orgId, userId] - specific user
 */
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (orgId: string, filters?: {
    role?: string;
    isActive?: boolean;
    search?: string;
  }) => [...userKeys.lists(), orgId, { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (userId: string) => [...userKeys.details(), userId] as const,
  current: () => [...userKeys.all, 'current'] as const,
};

/**
 * Automations Query Keys
 *
 * Hierarchy:
 * - ['automations', orgId] - all automations for an org
 * - ['automations', orgId, automationId] - specific automation
 */
export const automationKeys = {
  all: ['automations'] as const,
  lists: () => [...automationKeys.all, 'list'] as const,
  list: (orgId: string, filters?: {
    isActive?: boolean;
    search?: string;
  }) => [...automationKeys.lists(), orgId, { filters }] as const,
  details: () => [...automationKeys.all, 'detail'] as const,
  detail: (automationId: string) => [...automationKeys.details(), automationId] as const,
  runs: (automationId: string) =>
    [...automationKeys.detail(automationId), 'runs'] as const,
};

/**
 * Activity Logs Query Keys
 *
 * Hierarchy:
 * - ['activity-logs', orgId] - all activity logs for an org
 * - ['activity-logs', orgId, filters] - filtered activity logs
 */
export const activityLogKeys = {
  all: ['activity-logs'] as const,
  lists: () => [...activityLogKeys.all, 'list'] as const,
  list: (orgId: string, filters?: {
    entity?: string;
    action?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) => [...activityLogKeys.lists(), orgId, { filters }] as const,
};

/**
 * Documents Query Keys
 *
 * Hierarchy:
 * - ['documents', orgId] - all documents for an org
 * - ['documents', orgId, filters] - filtered documents
 * - ['documents', orgId, documentId] - specific document
 * - ['documents', orgId, 'stats'] - document statistics
 */
export const documentKeys = {
  all: ['documents'] as const,
  lists: () => [...documentKeys.all, 'list'] as const,
  list: (orgId: string, filters?: {
    status?: string;
    mimeType?: string;
    uploadedBy?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) => [...documentKeys.lists(), orgId, { filters }] as const,
  details: () => [...documentKeys.all, 'detail'] as const,
  detail: (documentId: string) => [...documentKeys.details(), documentId] as const,
  stats: (orgId: string) => [...documentKeys.all, orgId, 'stats'] as const,
};

/**
 * Helper function to invalidate all queries for a specific organization
 *
 * Usage:
 * ```ts
 * queryClient.invalidateQueries({ queryKey: invalidateOrganization(orgId) })
 * ```
 */
export function invalidateOrganization(orgId: string): QueryKeyBase {
  return [orgId] as const;
}

/**
 * Helper function to get all query keys that should be invalidated
 * when switching organizations
 */
export function getOrgDependentKeys(orgId: string): QueryKeyBase[] {
  return [
    pipelineKeys.list(orgId),
    intakeKeys.list(orgId),
    userKeys.list(orgId),
    automationKeys.list(orgId),
    activityLogKeys.list(orgId),
    documentKeys.list(orgId),
    organizationKeys.detail(orgId),
  ];
}

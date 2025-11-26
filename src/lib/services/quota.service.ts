/**
 * Quota Service
 *
 * Manages organization-level quota tracking and enforcement based on plan tiers.
 * Supports FREE, STARTER, PROFESSIONAL, and ENTERPRISE plans with configurable limits.
 */

import { prisma } from '@/lib/prisma';
import { PlanType } from '@prisma/client';

/**
 * Plan limits interface
 * -1 indicates unlimited for that resource
 */
interface PlanLimits {
  intakes: number;      // Monthly intake requests (-1 = unlimited)
  pipelines: number;    // Total pipelines allowed (-1 = unlimited)
  documents: number;    // Total documents allowed (-1 = unlimited)
  users: number;        // Total users allowed (-1 = unlimited)
  storage: number;      // Storage in MB (-1 = unlimited)
}

/**
 * Quota check result interface
 */
interface QuotaCheckResult {
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
}

/**
 * Plan limits configuration
 * Defines resource limits for each plan tier
 */
const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  FREE: {
    intakes: 10,
    pipelines: 5,
    documents: 100,
    users: 3,
    storage: 100
  },
  STARTER: {
    intakes: 100,
    pipelines: 20,
    documents: 1000,
    users: 10,
    storage: 1000
  },
  PROFESSIONAL: {
    intakes: 1000,
    pipelines: -1,     // unlimited
    documents: 10000,
    users: 50,
    storage: 10000
  },
  ENTERPRISE: {
    intakes: -1,       // unlimited
    pipelines: -1,     // unlimited
    documents: -1,     // unlimited
    users: -1,         // unlimited
    storage: -1        // unlimited
  }
};

/**
 * Custom error for quota exceeded scenarios
 */
export class QuotaExceededError extends Error {
  constructor(resource: string, limit: number) {
    super(`Quota exceeded for ${resource}. Limit: ${limit}`);
    this.name = 'QuotaExceededError';
  }
}

/**
 * Quota Service Class
 *
 * Provides methods to check and enforce usage quotas for organizations
 * based on their subscription plan.
 */
export class QuotaService {
  /**
   * Check quota for a specific resource
   *
   * @param orgId - Organization ID
   * @param resource - Resource type to check
   * @returns Quota check result with allowed status, current usage, limit, and remaining
   */
  async checkQuota(orgId: string, resource: keyof PlanLimits): Promise<QuotaCheckResult> {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { plan: true, quotaResetAt: true }
    });

    if (!org) {
      throw new Error('Organization not found');
    }

    const limit = PLAN_LIMITS[org.plan][resource];

    // Unlimited resources
    if (limit === -1) {
      return {
        allowed: true,
        current: 0,
        limit: -1,
        remaining: -1
      };
    }

    // Get current usage
    const current = await this.getUsage(orgId, resource, org.quotaResetAt);
    const remaining = Math.max(0, limit - current);

    return {
      allowed: current < limit,
      current,
      limit,
      remaining
    };
  }

  /**
   * Get current usage for a resource
   *
   * @param orgId - Organization ID
   * @param resource - Resource type
   * @param since - Date to count usage from (for monthly quotas)
   * @returns Current usage count
   */
  async getUsage(
    orgId: string,
    resource: keyof PlanLimits,
    since?: Date
  ): Promise<number> {
    const where = { orgId, ...(since ? { createdAt: { gte: since } } : {}) };

    switch (resource) {
      case 'intakes':
        // Count intakes created since quota reset (monthly)
        return prisma.intakeRequest.count({ where });

      case 'pipelines':
        // Count total active pipelines (not monthly, total)
        return prisma.pipeline.count({ where: { orgId } });

      case 'documents':
        // Count total documents (not monthly, total)
        return prisma.document.count({ where: { orgId } });

      case 'users':
        // Count total active users (not monthly, total)
        return prisma.users.count({ where: { orgId, isActive: true } });

      case 'storage':
        // Calculate total storage used in MB
        const docs = await prisma.document.aggregate({
          where: { orgId },
          _sum: { fileSize: true }
        });
        return Math.round((docs._sum.fileSize || 0) / (1024 * 1024)); // Convert to MB

      default:
        return 0;
    }
  }

  /**
   * Get all usage metrics for an organization
   *
   * @param orgId - Organization ID
   * @returns Record of all resource usages with current and limit values
   */
  async getAllUsage(
    orgId: string
  ): Promise<Record<keyof PlanLimits, { current: number; limit: number }>> {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { plan: true, quotaResetAt: true }
    });

    if (!org) {
      throw new Error('Organization not found');
    }

    const limits = PLAN_LIMITS[org.plan];
    const resources: (keyof PlanLimits)[] = ['intakes', 'pipelines', 'documents', 'users', 'storage'];

    const usage: Record<string, { current: number; limit: number }> = {};

    for (const resource of resources) {
      const current = await this.getUsage(
        orgId,
        resource,
        // Only use quotaResetAt for monthly quotas (intakes)
        resource === 'intakes' ? org.quotaResetAt : undefined
      );
      usage[resource] = { current, limit: limits[resource] };
    }

    return usage as Record<keyof PlanLimits, { current: number; limit: number }>;
  }

  /**
   * Reset monthly quotas for all organizations
   * Called by a scheduled job to reset quotas after 30 days
   */
  async resetMonthlyQuotas(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await prisma.organization.updateMany({
      where: { quotaResetAt: { lt: thirtyDaysAgo } },
      data: { quotaResetAt: new Date() }
    });
  }

  /**
   * Enforce quota for a specific resource
   * Throws QuotaExceededError if limit is reached
   *
   * @param orgId - Organization ID
   * @param resource - Resource type to check
   * @throws QuotaExceededError if quota is exceeded
   */
  async enforceQuota(orgId: string, resource: keyof PlanLimits): Promise<void> {
    const result = await this.checkQuota(orgId, resource);

    if (!result.allowed) {
      throw new QuotaExceededError(resource, result.limit);
    }
  }

  /**
   * Get plan limits for reference
   *
   * @param plan - Plan type (optional)
   * @returns Plan limits for specified plan or all plans
   */
  getPlanLimits(plan?: PlanType): PlanLimits | Record<PlanType, PlanLimits> {
    if (plan) {
      return PLAN_LIMITS[plan];
    }
    return { ...PLAN_LIMITS };
  }

  /**
   * Update organization plan
   *
   * @param orgId - Organization ID
   * @param plan - New plan type
   */
  async updatePlan(orgId: string, plan: PlanType): Promise<void> {
    await prisma.organization.update({
      where: { id: orgId },
      data: {
        plan,
        // Reset quota counter when plan changes
        quotaResetAt: new Date()
      }
    });
  }

  /**
   * Check if organization is approaching quota limits (80%+ usage)
   *
   * @param orgId - Organization ID
   * @returns Array of resources approaching their limits
   */
  async checkQuotaWarnings(orgId: string): Promise<Array<{
    resource: string;
    current: number;
    limit: number;
    percentUsed: number;
  }>> {
    const usage = await this.getAllUsage(orgId);
    const warnings: Array<{
      resource: string;
      current: number;
      limit: number;
      percentUsed: number;
    }> = [];

    const WARNING_THRESHOLD = 80; // 80% usage triggers warning

    for (const [resource, data] of Object.entries(usage)) {
      if (data.limit === -1) continue; // Skip unlimited resources

      const percentUsed = (data.current / data.limit) * 100;

      if (percentUsed >= WARNING_THRESHOLD) {
        warnings.push({
          resource,
          current: data.current,
          limit: data.limit,
          percentUsed: Math.round(percentUsed * 100) / 100
        });
      }
    }

    return warnings;
  }
}

// Export singleton instance
export const quotaService = new QuotaService();

// Export plan limits for reference
export { PLAN_LIMITS };

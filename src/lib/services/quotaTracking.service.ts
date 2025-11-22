/**
 * Quota Tracking Service
 *
 * Manages usage quotas and limits for organizations based on their subscription plan.
 * Tracks monthly usage for:
 * - Intake requests
 * - Documents
 * - Team members
 * - Pipelines
 *
 * Plan tiers:
 * - Starter: Limited quotas (500 intake/month, 100 docs/month, 3 team members, 5 pipelines)
 * - Professional: Higher limits (5000 intake/month, 1000 docs/month, 15 team members, unlimited pipelines)
 * - Enterprise: Unlimited everything
 */

import { prisma } from '@/lib/prisma';

/**
 * Quota limits per resource type
 */
export interface QuotaLimits {
  intake: number;      // Monthly intake requests (-1 = unlimited)
  documents: number;   // Monthly documents (-1 = unlimited)
  teamMembers: number; // Max team members (-1 = unlimited)
  pipelines: number;   // Max pipelines (-1 = unlimited)
}

/**
 * Plan-based quota limits configuration
 */
const PLAN_LIMITS: Record<string, QuotaLimits> = {
  starter: {
    intake: 500,
    documents: 100,
    teamMembers: 3,
    pipelines: 5,
  },
  professional: {
    intake: 5000,
    documents: 1000,
    teamMembers: 15,
    pipelines: -1, // unlimited
  },
  enterprise: {
    intake: -1, // unlimited
    documents: -1,
    teamMembers: -1,
    pipelines: -1,
  },
};

/**
 * Result of a quota check operation
 */
export interface QuotaCheckResult {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
  percentUsed: number;
  plan: string;
}

/**
 * All quotas for an organization
 */
export interface OrgQuotasSummary {
  intake: QuotaCheckResult;
  documents: QuotaCheckResult;
  teamMembers: QuotaCheckResult;
  pipelines: QuotaCheckResult;
  plan: string;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
}

/**
 * Quota exceeded error
 */
export class QuotaExceededError extends Error {
  public readonly quotaType: string;
  public readonly used: number;
  public readonly limit: number;
  public readonly plan: string;

  constructor(quotaType: string, used: number, limit: number, plan: string) {
    super(`Quota exceeded for ${quotaType}: ${used}/${limit} (${plan} plan)`);
    this.name = 'QuotaExceededError';
    this.quotaType = quotaType;
    this.used = used;
    this.limit = limit;
    this.plan = plan;
  }
}

/**
 * Quota Tracking Service Class
 *
 * Provides methods to check and enforce usage quotas for organizations.
 */
export class QuotaTrackingService {
  /**
   * Get the start of the current billing month
   * Uses the first day of the current month at midnight UTC
   */
  private getStartOfMonth(): Date {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
  }

  /**
   * Get the end of the current billing month
   * Uses the last millisecond of the last day of the current month
   */
  private getEndOfMonth(): Date {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
  }

  /**
   * Get the organization's subscription plan
   * Defaults to 'starter' since plan field doesn't exist in schema yet
   *
   * @param orgId - Organization ID
   * @returns Plan name (starter, professional, or enterprise)
   */
  private async getOrgPlan(orgId: string): Promise<string> {
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { id: true, name: true },
    });

    if (!org) {
      throw new Error(`Organization not found: ${orgId}`);
    }

    // TODO: When plan field is added to organization model, retrieve it here
    // For now, default to 'starter' plan
    // const plan = org.plan || 'starter';
    return 'starter';
  }

  /**
   * Get quota limits for a specific plan
   *
   * @param plan - Plan name
   * @returns Quota limits for the plan
   */
  private getPlanLimits(plan: string): QuotaLimits {
    const limits = PLAN_LIMITS[plan.toLowerCase()];
    if (!limits) {
      console.warn(`Unknown plan "${plan}", defaulting to starter limits`);
      return PLAN_LIMITS.starter;
    }
    return limits;
  }

  /**
   * Calculate quota check result
   *
   * @param used - Current usage count
   * @param limit - Maximum allowed (-1 for unlimited)
   * @param plan - Organization's plan name
   * @returns QuotaCheckResult
   */
  private calculateQuotaResult(used: number, limit: number, plan: string): QuotaCheckResult {
    const isUnlimited = limit === -1;
    const remaining = isUnlimited ? -1 : Math.max(0, limit - used);
    const percentUsed = isUnlimited ? 0 : limit > 0 ? Math.min(100, (used / limit) * 100) : 100;
    const allowed = isUnlimited || used < limit;

    return {
      allowed,
      used,
      limit,
      remaining,
      percentUsed: Math.round(percentUsed * 100) / 100,
      plan,
    };
  }

  /**
   * Check intake request quota for an organization
   *
   * @param orgId - Organization ID
   * @returns QuotaCheckResult for intake requests
   */
  async checkIntakeQuota(orgId: string): Promise<QuotaCheckResult> {
    const plan = await this.getOrgPlan(orgId);
    const limits = this.getPlanLimits(plan);
    const startOfMonth = this.getStartOfMonth();

    const used = await prisma.intakeRequest.count({
      where: {
        orgId,
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    const result = this.calculateQuotaResult(used, limits.intake, plan);

    console.log(`Intake quota check for org ${orgId}: ${used}/${limits.intake} (${plan} plan)`);

    return result;
  }

  /**
   * Check document quota for an organization
   *
   * @param orgId - Organization ID
   * @returns QuotaCheckResult for documents
   */
  async checkDocumentQuota(orgId: string): Promise<QuotaCheckResult> {
    const plan = await this.getOrgPlan(orgId);
    const limits = this.getPlanLimits(plan);
    const startOfMonth = this.getStartOfMonth();

    const used = await prisma.document.count({
      where: {
        orgId,
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    const result = this.calculateQuotaResult(used, limits.documents, plan);

    console.log(`Document quota check for org ${orgId}: ${used}/${limits.documents} (${plan} plan)`);

    return result;
  }

  /**
   * Check team member limit for an organization
   * Note: This is not a monthly quota but an absolute limit
   *
   * @param orgId - Organization ID
   * @returns QuotaCheckResult for team members
   */
  async checkTeamMemberQuota(orgId: string): Promise<QuotaCheckResult> {
    const plan = await this.getOrgPlan(orgId);
    const limits = this.getPlanLimits(plan);

    const used = await prisma.users.count({
      where: {
        orgId,
        isActive: true,
      },
    });

    const result = this.calculateQuotaResult(used, limits.teamMembers, plan);

    console.log(`Team member quota check for org ${orgId}: ${used}/${limits.teamMembers} (${plan} plan)`);

    return result;
  }

  /**
   * Check pipeline limit for an organization
   * Note: This is not a monthly quota but an absolute limit
   *
   * @param orgId - Organization ID
   * @returns QuotaCheckResult for pipelines
   */
  async checkPipelineQuota(orgId: string): Promise<QuotaCheckResult> {
    const plan = await this.getOrgPlan(orgId);
    const limits = this.getPlanLimits(plan);

    const used = await prisma.pipeline.count({
      where: {
        orgId,
      },
    });

    const result = this.calculateQuotaResult(used, limits.pipelines, plan);

    console.log(`Pipeline quota check for org ${orgId}: ${used}/${limits.pipelines} (${plan} plan)`);

    return result;
  }

  /**
   * Get all quotas for an organization (for dashboard display)
   *
   * @param orgId - Organization ID
   * @returns Complete quota summary for the organization
   */
  async getOrgQuotas(orgId: string): Promise<OrgQuotasSummary> {
    const plan = await this.getOrgPlan(orgId);

    // Run all quota checks in parallel for better performance
    const [intake, documents, teamMembers, pipelines] = await Promise.all([
      this.checkIntakeQuota(orgId),
      this.checkDocumentQuota(orgId),
      this.checkTeamMemberQuota(orgId),
      this.checkPipelineQuota(orgId),
    ]);

    return {
      intake,
      documents,
      teamMembers,
      pipelines,
      plan,
      billingPeriodStart: this.getStartOfMonth(),
      billingPeriodEnd: this.getEndOfMonth(),
    };
  }

  /**
   * Enforce intake quota - throws error if quota exceeded
   *
   * @param orgId - Organization ID
   * @throws QuotaExceededError if quota is exceeded
   */
  async enforceIntakeQuota(orgId: string): Promise<void> {
    const quota = await this.checkIntakeQuota(orgId);

    if (!quota.allowed) {
      throw new QuotaExceededError('intake', quota.used, quota.limit, quota.plan);
    }
  }

  /**
   * Enforce document quota - throws error if quota exceeded
   *
   * @param orgId - Organization ID
   * @throws QuotaExceededError if quota is exceeded
   */
  async enforceDocumentQuota(orgId: string): Promise<void> {
    const quota = await this.checkDocumentQuota(orgId);

    if (!quota.allowed) {
      throw new QuotaExceededError('documents', quota.used, quota.limit, quota.plan);
    }
  }

  /**
   * Enforce team member quota - throws error if limit exceeded
   *
   * @param orgId - Organization ID
   * @throws QuotaExceededError if limit is exceeded
   */
  async enforceTeamMemberQuota(orgId: string): Promise<void> {
    const quota = await this.checkTeamMemberQuota(orgId);

    if (!quota.allowed) {
      throw new QuotaExceededError('teamMembers', quota.used, quota.limit, quota.plan);
    }
  }

  /**
   * Enforce pipeline quota - throws error if limit exceeded
   *
   * @param orgId - Organization ID
   * @throws QuotaExceededError if limit is exceeded
   */
  async enforcePipelineQuota(orgId: string): Promise<void> {
    const quota = await this.checkPipelineQuota(orgId);

    if (!quota.allowed) {
      throw new QuotaExceededError('pipelines', quota.used, quota.limit, quota.plan);
    }
  }

  /**
   * Check if organization is approaching quota limit (80% or more used)
   *
   * @param orgId - Organization ID
   * @returns Object with warnings for quotas approaching limits
   */
  async checkQuotaWarnings(orgId: string): Promise<{
    hasWarnings: boolean;
    warnings: Array<{
      quotaType: string;
      percentUsed: number;
      used: number;
      limit: number;
    }>;
  }> {
    const quotas = await this.getOrgQuotas(orgId);
    const warnings: Array<{
      quotaType: string;
      percentUsed: number;
      used: number;
      limit: number;
    }> = [];

    const WARNING_THRESHOLD = 80; // 80% usage triggers warning

    // Check each quota type
    const quotaTypes: Array<{ key: keyof OrgQuotasSummary; name: string }> = [
      { key: 'intake', name: 'Intake Requests' },
      { key: 'documents', name: 'Documents' },
      { key: 'teamMembers', name: 'Team Members' },
      { key: 'pipelines', name: 'Pipelines' },
    ];

    for (const { key, name } of quotaTypes) {
      const quota = quotas[key] as QuotaCheckResult;
      if (quota.limit !== -1 && quota.percentUsed >= WARNING_THRESHOLD) {
        warnings.push({
          quotaType: name,
          percentUsed: quota.percentUsed,
          used: quota.used,
          limit: quota.limit,
        });
      }
    }

    return {
      hasWarnings: warnings.length > 0,
      warnings,
    };
  }

  /**
   * Get usage history for an organization (for analytics)
   * Returns daily usage counts for the current month
   *
   * @param orgId - Organization ID
   * @returns Daily usage breakdown
   */
  async getUsageHistory(orgId: string): Promise<{
    intake: Array<{ date: string; count: number }>;
    documents: Array<{ date: string; count: number }>;
  }> {
    const startOfMonth = this.getStartOfMonth();
    const now = new Date();

    // Get intake requests grouped by day
    const intakeRequests = await prisma.intakeRequest.findMany({
      where: {
        orgId,
        createdAt: {
          gte: startOfMonth,
          lte: now,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Get documents grouped by day
    const documents = await prisma.document.findMany({
      where: {
        orgId,
        createdAt: {
          gte: startOfMonth,
          lte: now,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Group by date
    const groupByDate = (items: Array<{ createdAt: Date }>): Array<{ date: string; count: number }> => {
      const grouped = items.reduce((acc, item) => {
        const dateKey = item.createdAt.toISOString().split('T')[0];
        acc[dateKey] = (acc[dateKey] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(grouped)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));
    };

    return {
      intake: groupByDate(intakeRequests),
      documents: groupByDate(documents),
    };
  }

  /**
   * Get plan limits for reference
   *
   * @param plan - Plan name (optional, returns all plans if not specified)
   * @returns Plan limits configuration
   */
  getPlanLimitsReference(plan?: string): QuotaLimits | Record<string, QuotaLimits> {
    if (plan) {
      return this.getPlanLimits(plan);
    }
    return { ...PLAN_LIMITS };
  }
}

// Export singleton instance
export const quotaTrackingService = new QuotaTrackingService();

// Export plan limits for external use
export { PLAN_LIMITS };

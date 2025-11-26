/**
 * Quota Service Unit Tests
 *
 * Tests quota tracking, enforcement, and limit checking
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { QuotaService, QuotaExceededError, PLAN_LIMITS } from '../quota.service';
import { PlanType } from '@prisma/client';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    organization: {
      findUnique: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
    },
    intakeRequest: {
      count: jest.fn(),
    },
    pipeline: {
      count: jest.fn(),
    },
    document: {
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    users: {
      count: jest.fn(),
    },
  },
}));

describe('QuotaService', () => {
  let quotaService: QuotaService;

  beforeEach(() => {
    quotaService = new QuotaService();
    jest.clearAllMocks();
  });

  describe('Plan Limits Configuration', () => {
    it('should have correct limits for FREE plan', () => {
      const limits = PLAN_LIMITS.FREE;
      expect(limits.intakes).toBe(10);
      expect(limits.pipelines).toBe(5);
      expect(limits.documents).toBe(100);
      expect(limits.users).toBe(3);
      expect(limits.storage).toBe(100);
    });

    it('should have correct limits for STARTER plan', () => {
      const limits = PLAN_LIMITS.STARTER;
      expect(limits.intakes).toBe(100);
      expect(limits.pipelines).toBe(20);
      expect(limits.documents).toBe(1000);
      expect(limits.users).toBe(10);
      expect(limits.storage).toBe(1000);
    });

    it('should have correct limits for PROFESSIONAL plan', () => {
      const limits = PLAN_LIMITS.PROFESSIONAL;
      expect(limits.intakes).toBe(1000);
      expect(limits.pipelines).toBe(-1); // unlimited
      expect(limits.documents).toBe(10000);
      expect(limits.users).toBe(50);
      expect(limits.storage).toBe(10000);
    });

    it('should have correct limits for ENTERPRISE plan', () => {
      const limits = PLAN_LIMITS.ENTERPRISE;
      expect(limits.intakes).toBe(-1); // unlimited
      expect(limits.pipelines).toBe(-1); // unlimited
      expect(limits.documents).toBe(-1); // unlimited
      expect(limits.users).toBe(-1); // unlimited
      expect(limits.storage).toBe(-1); // unlimited
    });
  });

  describe('QuotaExceededError', () => {
    it('should create error with correct message and properties', () => {
      const error = new QuotaExceededError('intakes', 10);
      expect(error.message).toBe('Quota exceeded for intakes. Limit: 10');
      expect(error.name).toBe('QuotaExceededError');
    });
  });

  describe('checkQuota', () => {
    it('should return unlimited status for ENTERPRISE plan', async () => {
      const mockOrg = {
        plan: PlanType.ENTERPRISE,
        quotaResetAt: new Date(),
      };

      (quotaService as any).prisma = {
        organization: {
          findUnique: jest.fn().mockResolvedValue(mockOrg),
        },
      };

      const result = await quotaService.checkQuota('org123', 'intakes');

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(-1);
      expect(result.remaining).toBe(-1);
    });

    it('should check quota correctly for FREE plan', async () => {
      const mockOrg = {
        plan: PlanType.FREE,
        quotaResetAt: new Date(),
      };

      (quotaService as any).prisma = {
        organization: {
          findUnique: jest.fn().mockResolvedValue(mockOrg),
        },
        intakeRequest: {
          count: jest.fn().mockResolvedValue(5),
        },
      };

      const result = await quotaService.checkQuota('org123', 'intakes');

      expect(result.allowed).toBe(true);
      expect(result.current).toBe(5);
      expect(result.limit).toBe(10);
      expect(result.remaining).toBe(5);
    });

    it('should return not allowed when quota exceeded', async () => {
      const mockOrg = {
        plan: PlanType.FREE,
        quotaResetAt: new Date(),
      };

      (quotaService as any).prisma = {
        organization: {
          findUnique: jest.fn().mockResolvedValue(mockOrg),
        },
        intakeRequest: {
          count: jest.fn().mockResolvedValue(15),
        },
      };

      const result = await quotaService.checkQuota('org123', 'intakes');

      expect(result.allowed).toBe(false);
      expect(result.current).toBe(15);
      expect(result.limit).toBe(10);
      expect(result.remaining).toBe(0);
    });
  });

  describe('enforceQuota', () => {
    it('should not throw when quota is available', async () => {
      const mockOrg = {
        plan: PlanType.STARTER,
        quotaResetAt: new Date(),
      };

      (quotaService as any).prisma = {
        organization: {
          findUnique: jest.fn().mockResolvedValue(mockOrg),
        },
        intakeRequest: {
          count: jest.fn().mockResolvedValue(50),
        },
      };

      await expect(quotaService.enforceQuota('org123', 'intakes')).resolves.not.toThrow();
    });

    it('should throw QuotaExceededError when quota exceeded', async () => {
      const mockOrg = {
        plan: PlanType.FREE,
        quotaResetAt: new Date(),
      };

      (quotaService as any).prisma = {
        organization: {
          findUnique: jest.fn().mockResolvedValue(mockOrg),
        },
        intakeRequest: {
          count: jest.fn().mockResolvedValue(15),
        },
      };

      await expect(quotaService.enforceQuota('org123', 'intakes')).rejects.toThrow(QuotaExceededError);
    });
  });

  describe('checkQuotaWarnings', () => {
    it('should return warnings for resources at 80% or more', async () => {
      const mockOrg = {
        plan: PlanType.FREE,
        quotaResetAt: new Date(),
      };

      (quotaService as any).prisma = {
        organization: {
          findUnique: jest.fn().mockResolvedValue(mockOrg),
        },
        intakeRequest: {
          count: jest.fn().mockResolvedValue(9), // 90% of 10
        },
        pipeline: {
          count: jest.fn().mockResolvedValue(2), // 40% of 5
        },
        document: {
          count: jest.fn().mockResolvedValue(50),
          aggregate: jest.fn().mockResolvedValue({ _sum: { fileSize: 0 } }),
        },
        users: {
          count: jest.fn().mockResolvedValue(1),
        },
      };

      const warnings = await quotaService.checkQuotaWarnings('org123');

      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0].resource).toBe('intakes');
      expect(warnings[0].percentUsed).toBeGreaterThanOrEqual(80);
    });
  });
});

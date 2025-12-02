/**
 * Organization Quota API Route
 *
 * GET /api/organization/quota
 * Returns current quota usage for the authenticated user's organization
 *
 * Authentication: Required
 * Authorization: Any authenticated user can view their organization's quotas
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { quotaService } from '@/lib/services/quota.service';

/**
 * GET /api/organization/quota
 *
 * Returns quota usage information for the user's organization
 *
 * Response Format:
 * {
 *   intakes: { current: number, limit: number },
 *   pipelines: { current: number, limit: number },
 *   documents: { current: number, limit: number },
 *   users: { current: number, limit: number },
 *   storage: { current: number, limit: number }
 * }
 *
 * @param req - Next.js request object
 * @returns JSON response with quota usage data
 */
export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);

    if (!session?.user?.orgId) {
      return NextResponse.json(
        { error: 'Unauthorized - No organization found' },
        { status: 401 }
      );
    }

    // Get quota usage for organization
    const usage = await quotaService.getAllUsage(session.user.orgId);

    // Get quota warnings
    const warnings = await quotaService.checkQuotaWarnings(session.user.orgId);

    return NextResponse.json({
      usage,
      warnings,
      hasWarnings: warnings.length > 0
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching quota information:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

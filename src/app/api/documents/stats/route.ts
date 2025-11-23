import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/documents/stats
 * Get document statistics for an organization
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.orgId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 2. Get orgId from query params
    const searchParams = req.nextUrl.searchParams;
    const orgId = searchParams.get('orgId');

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    // 3. Verify user has access to this org
    if (session.user.orgId !== orgId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // 4. Get document counts by status
    const [total, pending, processing, completed, failed] = await Promise.all([
      prisma.document.count({ where: { orgId } }),
      prisma.document.count({ where: { orgId, status: 'PENDING' } }),
      prisma.document.count({ where: { orgId, status: 'PROCESSING' } }),
      prisma.document.count({ where: { orgId, status: 'COMPLETED' } }),
      prisma.document.count({ where: { orgId, status: 'FAILED' } }),
    ]);

    const stats = {
      total,
      pending,
      processing,
      completed,
      failed,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Document stats error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch document stats',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

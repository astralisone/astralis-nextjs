import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ensureDefaultPipelines } from '@/lib/services/defaultPipelines.service';

/**
 * POST /api/pipelines/seed
 * Seed default pipelines for the current user's organization
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.orgId) {
      return NextResponse.json(
        { error: 'Unauthorized - no organization' },
        { status: 401 }
      );
    }

    const pipelines = await ensureDefaultPipelines(session.user.orgId);

    return NextResponse.json({
      success: true,
      message: `Created/found ${pipelines.length} default pipelines`,
      pipelines: pipelines.map((p) => ({
        id: p.id,
        name: p.name,
        key: p.key,
        stageCount: p.stages.length,
      })),
    });
  } catch (error) {
    console.error('Error seeding pipelines:', error);
    return NextResponse.json(
      { error: 'Failed to seed pipelines', details: String(error) },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';

import { prisma } from '@/lib/prisma';

/**
 * GET /api/debug/agents
 *
 * Returns information about available agents for debugging.
 *
 * Auth: Required (admin only)
 * Returns: Agent configurations and status
 */
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Authentication required' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden', details: 'Admin access required' },
        { status: 403 }
      );
    }

    // Fetch recent decisions from DB
    const recentDecisions = await prisma.decisionLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        task: {
          select: { title: true }
        }
      }
    });

    // Agent configurations (hardcoded for now, could be dynamic)
    const agents = [
      {
        id: 'orchestration',
        name: 'Orchestration Agent',
        description: 'Command center for intelligent workflow automation and multi-agent coordination',
        status: 'active',
        capabilities: [
          'workflow_orchestration',
          'agent_coordination',
          'command_processing',
          'task_routing'
        ],
        version: '1.0.0',
        lastActive: new Date().toISOString(),
      },
      {
        id: 'scheduling',
        name: 'Scheduling Agent',
        description: 'Strategic calendar management and intelligent appointment orchestration',
        status: 'active',
        capabilities: [
          'calendar_management',
          'appointment_scheduling',
          'conflict_detection',
          'reminder_system'
        ],
        version: '1.0.0',
        lastActive: new Date().toISOString(),
      },
      {
        id: 'document',
        name: 'Document Agent',
        description: 'Advanced document intelligence and automated processing pipeline',
        status: 'active',
        capabilities: [
          'document_processing',
          'ocr_extraction',
          'content_analysis',
          'file_management'
        ],
        version: '1.0.0',
        lastActive: new Date().toISOString(),
      }
    ];

    // Add environment information
    const agentEnvironment = {
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      redisAvailable: !!(process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL),
      databaseAvailable: !!process.env.DATABASE_URL,
    };

    return NextResponse.json({
      agents,
      environment: agentEnvironment,
      recentDecisions,
      totalAgents: agents.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[API /api/debug/agents GET] Error:', error);
    return NextResponse.json(
      {
        error: 'Agent debug failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
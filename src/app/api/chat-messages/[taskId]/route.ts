/**
 * Task Chat Messages API
 *
 * GET /api/chat-messages/[taskId] - Retrieve all chat messages for a specific task
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import * as chatResponseService from '@/lib/services/chat-response.service';

/**
 * GET /api/chat-messages/[taskId]
 *
 * Retrieve all chat messages for a specific scheduling agent task.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId } = params;

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Get messages for the task
    const result = await chatResponseService.getTaskMessages(taskId, session.user.id);

    return NextResponse.json({
      taskId,
      messages: result.messages,
      count: result.messages.length,
    });
  } catch (error) {
    console.error('[TaskChatMessagesAPI] GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

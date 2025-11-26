/**
 * Chat Messages API
 *
 * GET /api/chat-messages - Retrieve unread chat messages for current user
 * POST /api/chat-messages/mark-read - Mark messages as read
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import * as chatResponseService from '@/lib/services/chat-response.service';
import { z } from 'zod';

/**
 * GET /api/chat-messages
 *
 * Retrieve unread chat messages for the current user.
 * Useful for polling when Pusher is not configured.
 *
 * Query params:
 * - limit: number (default: 50)
 */
export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    // Validate limit
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Get unread messages
    const result = await chatResponseService.getUnreadMessages(session.user.id, limit);

    return NextResponse.json({
      messages: result.messages,
      total: result.total,
      hasMore: result.messages.length < result.total,
    });
  } catch (error) {
    console.error('[ChatMessagesAPI] GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chat-messages/mark-read
 *
 * Mark specific messages as read.
 *
 * Body:
 * - messageIds: string[] - Array of message IDs to mark as read
 */
const markReadSchema = z.object({
  messageIds: z.array(z.string()).min(1).max(100),
});

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = markReadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { messageIds } = validation.data;

    // Mark messages as read
    const result = await chatResponseService.markMessagesAsRead(
      messageIds,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      markedCount: result.count,
    });
  } catch (error) {
    console.error('[ChatMessagesAPI] POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

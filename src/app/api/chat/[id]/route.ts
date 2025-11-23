import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { getChatService } from '@/lib/services/chat.service';

/**
 * GET /api/chat/[id] - Get specific chat with message history
 *
 * Path params:
 * - id: Chat ID
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     id: string,
 *     title: string,
 *     documentId: string | null,
 *     document: { id, originalName, fileName, cdnUrl } | null,
 *     messages: Array<{
 *       role: 'user' | 'assistant',
 *       content: string,
 *       timestamp: string,
 *       sources?: Array<{
 *         documentId: string,
 *         chunkIndex: number,
 *         content: string,
 *         similarity: number
 *       }>
 *     }>,
 *     lastMessageAt: string,
 *     createdAt: string,
 *     updatedAt: string
 *   }
 * }
 *
 * Auth: Required (user must be owner of chat)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to view chats' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const orgId = session.user.orgId;

    if (!orgId) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'No organization associated with user' },
        { status: 403 }
      );
    }

    const { id: chatId } = await params;

    if (!chatId) {
      return NextResponse.json(
        { error: 'Bad request', message: 'Chat ID is required' },
        { status: 400 }
      );
    }

    // Get chat using ChatService
    const chatService = getChatService();
    const chat = await chatService.getChat(chatId, userId, orgId);

    console.log(`[GET /api/chat/${chatId}] Retrieved chat for user ${userId}`);

    return NextResponse.json(
      {
        success: true,
        data: chat,
      },
      { status: 200 }
    );
  } catch (error) {
    const { id: chatId } = await params;
    console.error(`[GET /api/chat/${chatId}] Error:`, error);

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Not found', message: 'Chat not found or you do not have access' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'Chat retrieval error', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/chat/[id] - Delete chat conversation
 *
 * Path params:
 * - id: Chat ID
 *
 * Response:
 * {
 *   success: true,
 *   message: 'Chat deleted successfully'
 * }
 *
 * Auth: Required (user must be owner of chat)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to delete chats' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const orgId = session.user.orgId;

    if (!orgId) {
      return NextResponse.json(
        { error: 'Forbidden', message: 'No organization associated with user' },
        { status: 403 }
      );
    }

    const { id: chatId } = await params;

    if (!chatId) {
      return NextResponse.json(
        { error: 'Bad request', message: 'Chat ID is required' },
        { status: 400 }
      );
    }

    // Delete chat using ChatService
    const chatService = getChatService();
    await chatService.deleteChat(chatId, userId, orgId);

    console.log(`[DELETE /api/chat/${chatId}] Deleted chat for user ${userId}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Chat deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    const { id: chatId } = await params;
    console.error(`[DELETE /api/chat/${chatId}] Error:`, error);

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Not found', message: 'Chat not found or you do not have access' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'Chat deletion error', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

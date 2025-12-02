import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { getChatService } from '@/lib/services/chat.service';
import { SendChatMessageSchema, ListChatsSchema } from '@/lib/validators/chat.validators';

/**
 * POST /api/chat - Send chat message and get AI response
 *
 * Request body:
 * {
 *   chatId?: string,          // Existing chat ID (optional, creates new if not provided)
 *   documentId?: string,      // Document to chat with (optional, multi-doc if not provided)
 *   message: string,          // User message
 *   maxContextChunks?: number // Max context chunks to retrieve (default: 5)
 *   temperature?: number      // GPT temperature 0-2 (default: 0.7)
 * }
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     chatId: string,
 *     message: string,
 *     sources: Array<{
 *       documentId: string,
 *       documentName: string,
 *       chunkIndex: number,
 *       content: string,
 *       similarity: number
 *     }>,
 *     tokensUsed?: number
 *   }
 * }
 *
 * Auth: Required (user must be authenticated and belong to organization)
 * RBAC: USER, OPERATOR, ADMIN, CLIENT
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to use chat' },
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

    // Parse and validate request body
    const body = await req.json();
    const validationResult = SendChatMessageSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      chatId,
      documentId,
      message,
      maxContextChunks = 5,
      temperature = 0.7,
    } = validationResult.data;

    // Send message using ChatService
    const chatService = getChatService();
    const result = await chatService.sendMessage(
      userId,
      orgId,
      message,
      chatId,
      documentId,
      maxContextChunks,
      temperature
    );

    console.log(`[POST /api/chat] Message sent in chat ${result.chatId} by user ${userId}`);

    return NextResponse.json(
      {
        success: true,
        data: {
          chatId: result.chatId,
          message: result.response.message,
          sources: result.response.sources,
          tokensUsed: result.response.tokensUsed,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[POST /api/chat] Error:', error);

    if (error instanceof Error) {
      // Check for specific error types
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Not found', message: error.message },
          { status: 404 }
        );
      }

      if (error.message.includes('OPENAI_API_KEY')) {
        return NextResponse.json(
          { error: 'Configuration error', message: 'Chat service is not configured' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: 'Chat error', message: error.message },
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
 * GET /api/chat - List user's chat conversations
 *
 * Query params:
 * - limit: number (default: 50, max: 100)
 * - offset: number (default: 0)
 * - documentId: string (optional, filter by document)
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     chats: Array<{
 *       id: string,
 *       title: string,
 *       documentId: string | null,
 *       document: { id, originalName, fileName } | null,
 *       messageCount: number,
 *       lastMessageAt: string,
 *       createdAt: string
 *     }>,
 *     pagination: {
 *       total: number,
 *       limit: number,
 *       offset: number,
 *       hasMore: boolean
 *     }
 *   }
 * }
 *
 * Auth: Required
 */
export async function GET(req: NextRequest) {
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

    // Parse and validate query params
    const { searchParams } = new URL(req.url);
    const queryParams = {
      limit: searchParams.get('limit') || '50',
      offset: searchParams.get('offset') || '0',
      documentId: searchParams.get('documentId') || undefined,
    };

    const validationResult = ListChatsSchema.safeParse(queryParams);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { limit, offset, documentId } = validationResult.data;

    // Enforce maximum limit
    const effectiveLimit = Math.min(limit || 50, 100);

    // Get chats using ChatService
    const chatService = getChatService();
    const result = await chatService.listChats(
      userId,
      orgId,
      documentId,
      effectiveLimit,
      offset || 0
    );

    console.log(`[GET /api/chat] Listed ${result.chats.length} chats for user ${userId}`);

    return NextResponse.json(
      {
        success: true,
        data: {
          chats: result.chats,
          pagination: result.pagination,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GET /api/chat] Error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Chat list error', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

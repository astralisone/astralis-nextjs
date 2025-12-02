import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { getCalendarChatService } from '@/lib/services/calendarChat.service';
import { authOptions } from '@/lib/auth/config';

/**
 * Calendar Chat API Endpoint
 *
 * Handles conversational calendar management requests.
 *
 * POST /api/chat/calendar
 * - Processes natural language calendar queries
 * - Supports confirmation flow for destructive actions
 * - Returns AI responses with calendar data
 */

// ============================================================================
// Request Validation
// ============================================================================

const calendarChatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required').max(1000, 'Message too long'),
  context: z
    .object({
      previousMessages: z
        .array(
          z.object({
            role: z.enum(['user', 'assistant']),
            content: z.string(),
          })
        )
        .optional(),
      confirmed: z.boolean().optional(),
      pendingAction: z
        .object({
          type: z.string(),
          data: z.any(),
        })
        .optional(),
    })
    .optional(),
});

type CalendarChatRequest = z.infer<typeof calendarChatRequestSchema>;

// ============================================================================
// POST Handler
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    // Authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'You must be signed in to use the calendar chat' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const orgId = (session.user as any).orgId || 'default-org';

    // Parse and validate request body
    const body = await req.json();
    const parsed = calendarChatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { message, context } = parsed.data;

    // Get calendar chat service
    const calendarChatService = getCalendarChatService();

    // Process the message
    console.log(`[CalendarChatAPI] Processing message for user ${userId}:`, message);
    const startTime = Date.now();

    const response = await calendarChatService.processCalendarMessage(
      userId,
      orgId,
      message,
      context
    );

    const duration = Date.now() - startTime;
    console.log(`[CalendarChatAPI] Response generated in ${duration}ms`);

    // Return response
    return NextResponse.json(
      {
        success: true,
        message: response.message,
        requiresConfirmation: response.requiresConfirmation || false,
        action: response.action,
        data: response.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[CalendarChatAPI] Error:', error);

    // Detailed error logging
    if (error instanceof Error) {
      console.error('[CalendarChatAPI] Error name:', error.name);
      console.error('[CalendarChatAPI] Error message:', error.message);
      if (error.stack) {
        console.error('[CalendarChatAPI] Error stack:', error.stack.substring(0, 500));
      }
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// OPTIONS Handler (CORS)
// ============================================================================

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}

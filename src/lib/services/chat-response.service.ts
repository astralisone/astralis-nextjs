/**
 * Chat Response Service
 *
 * Handles sending real-time chat messages for the scheduling agent.
 * Supports multiple delivery methods with graceful fallbacks:
 * - Pusher (real-time, if configured)
 * - Database storage (for polling/retrieval)
 *
 * If Pusher is not configured, messages are stored in the database
 * without throwing errors, allowing the system to continue functioning.
 */

import { prisma } from '@/lib/prisma';
import { ChatMessageType } from '@prisma/client';

/**
 * Chat Message Interface
 */
export interface ChatMessage {
  type: 'scheduling_update' | 'confirmation' | 'clarification' | 'cancellation' | 'error' | 'info';
  taskId: string;
  userId: string;
  content: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Pusher Configuration
 */
interface PusherConfig {
  appId: string;
  key: string;
  secret: string;
  cluster: string;
}

/**
 * Check if Pusher is configured
 */
function isPusherConfigured(): boolean {
  return !!(
    process.env.PUSHER_APP_ID &&
    process.env.PUSHER_KEY &&
    process.env.PUSHER_SECRET &&
    process.env.PUSHER_CLUSTER
  );
}

/**
 * Get Pusher configuration from environment
 */
function getPusherConfig(): PusherConfig | null {
  if (!isPusherConfigured()) {
    return null;
  }

  return {
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER!,
  };
}

/**
 * Lazy-load Pusher only if configured
 */
let pusherInstance: any = null;

async function getPusherInstance() {
  if (!isPusherConfigured()) {
    return null;
  }

  if (pusherInstance) {
    return pusherInstance;
  }

  try {
    // Dynamically import Pusher only if needed
    const Pusher = (await import('pusher')).default;
    const config = getPusherConfig();

    if (!config) {
      return null;
    }

    pusherInstance = new Pusher({
      appId: config.appId,
      key: config.key,
      secret: config.secret,
      cluster: config.cluster,
      useTLS: true,
    });

    console.log('[ChatResponseService] Pusher initialized successfully');
    return pusherInstance;
  } catch (error) {
    console.error('[ChatResponseService] Failed to initialize Pusher:', error);
    return null;
  }
}

/**
 * Map chat message type to Prisma enum
 */
function mapMessageTypeToPrisma(type: ChatMessage['type']): ChatMessageType {
  const typeMap: Record<ChatMessage['type'], ChatMessageType> = {
    scheduling_update: 'SCHEDULING_UPDATE',
    confirmation: 'CONFIRMATION',
    clarification: 'CLARIFICATION',
    cancellation: 'CANCELLATION',
    error: 'ERROR',
    info: 'INFO',
  };

  return typeMap[type];
}

/**
 * Send chat message via Pusher (if configured)
 *
 * @param message - Chat message to send
 * @returns Success status
 */
async function sendViaPusher(message: ChatMessage): Promise<{ success: boolean; error?: string }> {
  try {
    const pusher = await getPusherInstance();

    if (!pusher) {
      return {
        success: false,
        error: 'Pusher not configured',
      };
    }

    // Send message to user-specific channel
    const channel = `private-user-${message.userId}`;
    const event = 'chat-message';

    await pusher.trigger(channel, event, {
      type: message.type,
      taskId: message.taskId,
      content: message.content,
      data: message.data,
      timestamp: message.timestamp,
    });

    console.log(`[ChatResponseService] Message sent via Pusher to ${channel}`);

    return { success: true };
  } catch (error) {
    console.error('[ChatResponseService] Pusher send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Store chat message in database
 *
 * @param message - Chat message to store
 * @param orgId - Organization ID (optional)
 * @returns Stored message ID
 */
async function storeInDatabase(
  message: ChatMessage,
  orgId?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const chatMessage = await prisma.chatMessage.create({
      data: {
        userId: message.userId,
        orgId: orgId || null,
        taskId: message.taskId,
        type: mapMessageTypeToPrisma(message.type),
        content: message.content,
        data: message.data || null,
        read: false,
      },
    });

    console.log(`[ChatResponseService] Message stored in database: ${chatMessage.id}`);

    return {
      success: true,
      messageId: chatMessage.id,
    };
  } catch (error) {
    console.error('[ChatResponseService] Database store error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send chat message with multiple delivery methods
 *
 * @param message - Chat message to send
 * @param orgId - Organization ID (optional)
 * @returns Delivery results
 */
export async function sendChatMessage(
  message: ChatMessage,
  orgId?: string
): Promise<{
  success: boolean;
  pusherSent: boolean;
  databaseStored: boolean;
  messageId?: string;
  error?: string;
}> {
  console.log(`[ChatResponseService] Sending ${message.type} message to user ${message.userId}`);

  let pusherSent = false;
  let databaseStored = false;
  let messageId: string | undefined;
  let lastError: string | undefined;

  // Try sending via Pusher (if configured)
  if (isPusherConfigured()) {
    const pusherResult = await sendViaPusher(message);
    if (pusherResult.success) {
      pusherSent = true;
      console.log('[ChatResponseService] Message delivered via Pusher');
    } else {
      console.log(`[ChatResponseService] Pusher delivery failed: ${pusherResult.error}`);
      lastError = pusherResult.error;
    }
  } else {
    console.log('[ChatResponseService] Pusher not configured, skipping real-time delivery');
  }

  // Always store in database for retrieval/history
  const dbResult = await storeInDatabase(message, orgId);
  if (dbResult.success) {
    databaseStored = true;
    messageId = dbResult.messageId;
    console.log('[ChatResponseService] Message stored in database for polling');
  } else {
    console.error(`[ChatResponseService] Database storage failed: ${dbResult.error}`);
    lastError = dbResult.error;
  }

  // Consider it a success if either method worked
  const success = pusherSent || databaseStored;

  return {
    success,
    pusherSent,
    databaseStored,
    messageId,
    error: success ? undefined : lastError || 'All delivery methods failed',
  };
}

/**
 * Get unread messages for a user
 *
 * @param userId - User ID
 * @param limit - Maximum number of messages to retrieve
 * @returns Unread messages
 */
export async function getUnreadMessages(
  userId: string,
  limit: number = 50
): Promise<{
  messages: Array<{
    id: string;
    type: string;
    taskId: string | null;
    content: string;
    data: unknown;
    createdAt: Date;
  }>;
  total: number;
}> {
  const messages = await prisma.chatMessage.findMany({
    where: {
      userId,
      read: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
    select: {
      id: true,
      type: true,
      taskId: true,
      content: true,
      data: true,
      createdAt: true,
    },
  });

  const total = await prisma.chatMessage.count({
    where: {
      userId,
      read: false,
    },
  });

  return {
    messages,
    total,
  };
}

/**
 * Mark messages as read
 *
 * @param messageIds - Array of message IDs to mark as read
 * @param userId - User ID (for access control)
 * @returns Number of messages marked as read
 */
export async function markMessagesAsRead(
  messageIds: string[],
  userId: string
): Promise<{ count: number }> {
  const result = await prisma.chatMessage.updateMany({
    where: {
      id: { in: messageIds },
      userId, // Ensure user can only mark their own messages as read
    },
    data: {
      read: true,
    },
  });

  console.log(`[ChatResponseService] Marked ${result.count} messages as read for user ${userId}`);

  return { count: result.count };
}

/**
 * Get messages for a specific task
 *
 * @param taskId - SchedulingAgentTask ID
 * @param userId - User ID (for access control)
 * @returns Messages for the task
 */
export async function getTaskMessages(
  taskId: string,
  userId: string
): Promise<{
  messages: Array<{
    id: string;
    type: string;
    content: string;
    data: unknown;
    read: boolean;
    createdAt: Date;
  }>;
}> {
  const messages = await prisma.chatMessage.findMany({
    where: {
      taskId,
      userId, // Ensure user can only see their own messages
    },
    orderBy: {
      createdAt: 'asc',
    },
    select: {
      id: true,
      type: true,
      content: true,
      data: true,
      read: true,
      createdAt: true,
    },
  });

  return { messages };
}

/**
 * Helper: Create and send a scheduling update message
 */
export async function sendSchedulingUpdate(
  taskId: string,
  userId: string,
  content: string,
  data?: Record<string, unknown>,
  orgId?: string
) {
  return sendChatMessage(
    {
      type: 'scheduling_update',
      taskId,
      userId,
      content,
      data,
      timestamp: new Date().toISOString(),
    },
    orgId
  );
}

/**
 * Helper: Create and send a confirmation message
 */
export async function sendConfirmation(
  taskId: string,
  userId: string,
  content: string,
  data?: Record<string, unknown>,
  orgId?: string
) {
  return sendChatMessage(
    {
      type: 'confirmation',
      taskId,
      userId,
      content,
      data,
      timestamp: new Date().toISOString(),
    },
    orgId
  );
}

/**
 * Helper: Create and send a clarification message
 */
export async function sendClarification(
  taskId: string,
  userId: string,
  content: string,
  data?: Record<string, unknown>,
  orgId?: string
) {
  return sendChatMessage(
    {
      type: 'clarification',
      taskId,
      userId,
      content,
      data,
      timestamp: new Date().toISOString(),
    },
    orgId
  );
}

/**
 * Helper: Create and send a cancellation message
 */
export async function sendCancellation(
  taskId: string,
  userId: string,
  content: string,
  data?: Record<string, unknown>,
  orgId?: string
) {
  return sendChatMessage(
    {
      type: 'cancellation',
      taskId,
      userId,
      content,
      data,
      timestamp: new Date().toISOString(),
    },
    orgId
  );
}

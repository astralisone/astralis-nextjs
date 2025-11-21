/**
 * Chat API Client
 *
 * Frontend TypeScript client for interacting with the chat API.
 * Use this in React components, hooks, or client-side utilities.
 */

export interface ChatSource {
  documentId: string;
  documentName: string;
  chunkIndex: number;
  content: string;
  similarity: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: ChatSource[];
}

export interface SendMessageRequest {
  chatId?: string;
  documentId?: string;
  message: string;
  maxContextChunks?: number;
  temperature?: number;
}

export interface SendMessageResponse {
  chatId: string;
  message: string;
  sources: ChatSource[];
  tokensUsed?: number;
}

export interface Chat {
  id: string;
  title: string;
  documentId: string | null;
  document: {
    id: string;
    originalName: string;
    fileName: string;
  } | null;
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
}

export interface ChatDetail {
  id: string;
  title: string;
  documentId: string | null;
  document: {
    id: string;
    originalName: string;
    fileName: string;
    cdnUrl: string | null;
  } | null;
  messages: ChatMessage[];
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListChatsResponse {
  chats: Chat[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export class ChatAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ChatAPIError';
  }
}

/**
 * Send a chat message and get AI response
 *
 * @param request - Message request
 * @returns Chat response with sources
 * @throws ChatAPIError
 */
export async function sendChatMessage(
  request: SendMessageRequest
): Promise<SendMessageResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include session cookie
    body: JSON.stringify(request),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ChatAPIError(
      data.message || 'Failed to send message',
      response.status,
      data.details
    );
  }

  return data.data;
}

/**
 * List user's chat conversations
 *
 * @param limit - Max results (default: 50)
 * @param offset - Pagination offset (default: 0)
 * @param documentId - Filter by document ID (optional)
 * @returns List of chats with pagination
 * @throws ChatAPIError
 */
export async function listChats(
  limit: number = 50,
  offset: number = 0,
  documentId?: string
): Promise<ListChatsResponse> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });

  if (documentId) {
    params.set('documentId', documentId);
  }

  const response = await fetch(`/api/chat?${params}`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ChatAPIError(
      data.message || 'Failed to list chats',
      response.status,
      data.details
    );
  }

  return data.data;
}

/**
 * Get specific chat with full message history
 *
 * @param chatId - Chat ID
 * @returns Chat detail with messages
 * @throws ChatAPIError
 */
export async function getChat(chatId: string): Promise<ChatDetail> {
  const response = await fetch(`/api/chat/${chatId}`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ChatAPIError(
      data.message || 'Failed to get chat',
      response.status,
      data.details
    );
  }

  return data.data;
}

/**
 * Delete a chat conversation
 *
 * @param chatId - Chat ID
 * @throws ChatAPIError
 */
export async function deleteChat(chatId: string): Promise<void> {
  const response = await fetch(`/api/chat/${chatId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ChatAPIError(
      data.message || 'Failed to delete chat',
      response.status,
      data.details
    );
  }
}

/**
 * React hook example for using chat API
 *
 * Usage:
 * ```typescript
 * import { useChatAPI } from '@/lib/api/chat.client';
 *
 * function ChatComponent({ documentId }) {
 *   const { sendMessage, loading, error } = useChatAPI();
 *
 *   const handleSend = async (message: string) => {
 *     const response = await sendMessage({ documentId, message });
 *     console.log(response.message);
 *   };
 *
 *   return (
 *     <div>
 *       {loading && <p>Loading...</p>}
 *       {error && <p>Error: {error.message}</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useChatAPI() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<ChatAPIError | null>(null);

  const sendMessage = async (request: SendMessageRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await sendChatMessage(request);
      return response;
    } catch (err) {
      const error = err instanceof ChatAPIError ? err : new ChatAPIError('Unknown error', 500);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchChats = async (limit?: number, offset?: number, documentId?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await listChats(limit, offset, documentId);
      return response;
    } catch (err) {
      const error = err instanceof ChatAPIError ? err : new ChatAPIError('Unknown error', 500);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchChat = async (chatId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getChat(chatId);
      return response;
    } catch (err) {
      const error = err instanceof ChatAPIError ? err : new ChatAPIError('Unknown error', 500);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeChat = async (chatId: string) => {
    setLoading(true);
    setError(null);

    try {
      await deleteChat(chatId);
    } catch (err) {
      const error = err instanceof ChatAPIError ? err : new ChatAPIError('Unknown error', 500);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendMessage,
    fetchChats,
    fetchChat,
    removeChat,
    loading,
    error,
  };
}

// Add React import for hook (will be tree-shaken if not used)
import React from 'react';

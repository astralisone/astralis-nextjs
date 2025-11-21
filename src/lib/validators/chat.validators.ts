import { z } from 'zod';

/**
 * Chat Validation Schemas
 *
 * Zod schemas for validating chat-related operations.
 */

/**
 * Chat message schema
 */
export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1, 'Message content cannot be empty'),
  timestamp: z.string().datetime(),
  sources: z.array(z.object({
    documentId: z.string().cuid(),
    chunkIndex: z.number().int(),
    content: z.string(),
    similarity: z.number().min(0).max(1),
  })).optional(),
});

/**
 * Send chat message schema (POST /api/chat)
 */
export const SendChatMessageSchema = z.object({
  chatId: z.string().cuid().optional(),
  documentId: z.string().cuid().optional(),
  message: z.string().min(1, 'Message cannot be empty').max(10000, 'Message too long'),
  maxContextChunks: z.number().int().min(1).max(20).default(5).optional(),
  temperature: z.number().min(0).max(2).default(0.7).optional(),
});

/**
 * List chats schema (GET /api/chat)
 */
export const ListChatsSchema = z.object({
  limit: z.string().regex(/^\d+$/).transform(Number).default('50').optional(),
  offset: z.string().regex(/^\d+$/).transform(Number).default('0').optional(),
  documentId: z.string().cuid().optional(),
});

/**
 * Get chat by ID schema (GET /api/chat/[id])
 */
export const GetChatSchema = z.object({
  chatId: z.string().cuid(),
  includeMessages: z.boolean().default(true).optional(),
});

/**
 * Delete chat schema (DELETE /api/chat/[id])
 */
export const DeleteChatSchema = z.object({
  chatId: z.string().cuid(),
});

/**
 * Chat response with sources
 */
export const ChatResponseSchema = z.object({
  chatId: z.string().cuid(),
  message: z.string(),
  sources: z.array(z.object({
    documentId: z.string().cuid(),
    documentName: z.string(),
    chunkIndex: z.number(),
    content: z.string(),
    similarity: z.number(),
  })),
  tokensUsed: z.number().int().optional(),
});

/**
 * Type exports for TypeScript
 */
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type SendChatMessageInput = z.infer<typeof SendChatMessageSchema>;
export type ListChatsInput = z.infer<typeof ListChatsSchema>;
export type GetChatInput = z.infer<typeof GetChatSchema>;
export type DeleteChatInput = z.infer<typeof DeleteChatSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;

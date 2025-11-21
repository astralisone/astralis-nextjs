import { prisma } from '@/lib/prisma';
import { getVectorSearchService } from './vector-search.service';
import OpenAI from 'openai';
import type { ChatMessage } from '@/lib/validators/chat.validators';

/**
 * Chat Service
 *
 * Handles business logic for document-based chat conversations with RAG.
 * Integrates with VectorSearchService for context retrieval and OpenAI for responses.
 */

interface ChatSource {
  documentId: string;
  documentName: string;
  chunkIndex: number;
  content: string;
  similarity: number;
}

interface ChatResponse {
  message: string;
  sources: ChatSource[];
  tokensUsed?: number;
}

export class ChatService {
  private openai: OpenAI;
  private vectorSearchService = getVectorSearchService();
  private chatModel = 'gpt-4-turbo-preview';

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    console.log('[ChatService] Initializing OpenAI client with 30s timeout');
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 30000, // 30 second timeout
      maxRetries: 2, // Retry failed requests twice
    });
  }

  /**
   * Send a chat message and get AI response with RAG
   *
   * @param userId - User ID
   * @param orgId - Organization ID
   * @param message - User message
   * @param chatId - Existing chat ID (optional)
   * @param documentId - Specific document to chat with (optional)
   * @param maxContextChunks - Max number of context chunks to retrieve
   * @param temperature - GPT temperature (0-2)
   * @returns Chat response with sources
   */
  async sendMessage(
    userId: string,
    orgId: string,
    message: string,
    chatId?: string,
    documentId?: string,
    maxContextChunks: number = 5,
    temperature: number = 0.7
  ): Promise<{ chatId: string; response: ChatResponse }> {
    try {
      // Get or create chat
      let chat = chatId
        ? await prisma.documentChat.findFirst({
            where: { id: chatId, userId, orgId },
            include: { document: true },
          })
        : null;

      if (!chat) {
        // Create new chat
        chat = await prisma.documentChat.create({
          data: {
            userId,
            orgId,
            documentId: documentId || null,
            title: null, // Will be generated from first message
            messages: [],
            lastMessageAt: new Date(),
          },
          include: { document: true },
        });

        console.log(`[ChatService] Created new chat: ${chat.id}`);
      }

      // Retrieve relevant context using RAG
      const searchResults = await this.vectorSearchService.search(
        message,
        orgId,
        chat.documentId || documentId,
        maxContextChunks
      );

      console.log(`[ChatService] Retrieved ${searchResults.length} relevant chunks for context`);

      // Get document names for sources
      const documentIds = [...new Set(searchResults.map(r => r.documentId))];
      const documents = await prisma.document.findMany({
        where: { id: { in: documentIds } },
        select: { id: true, originalName: true },
      });

      const documentMap = new Map(documents.map(d => [d.id, d.originalName]));

      // Build context from retrieved chunks
      const context = searchResults
        .map((result, idx) => `[Source ${idx + 1}]: ${result.content}`)
        .join('\n\n');

      // Build chat history
      const existingMessages = (chat.messages as ChatMessage[]) || [];
      const chatHistory = existingMessages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

      // Build system prompt
      const systemPrompt = this.buildSystemPrompt(context, chat.documentId || documentId);

      // Call GPT-4 with context
      console.log(`[ChatService] Calling OpenAI ${this.chatModel} (timeout: 30s)...`);
      const startTime = Date.now();

      const completion = await this.openai.chat.completions.create({
        model: this.chatModel,
        messages: [
          { role: 'system', content: systemPrompt },
          ...chatHistory,
          { role: 'user', content: message },
        ],
        temperature,
        max_tokens: 1000,
      });

      const duration = Date.now() - startTime;
      console.log(`[ChatService] OpenAI response received in ${duration}ms`);

      const assistantMessage = completion.choices[0].message.content || 'I apologize, but I could not generate a response.';
      const tokensUsed = completion.usage?.total_tokens;
      console.log(`[ChatService] Response generated - ${tokensUsed} tokens used`);

      // Build sources array
      const sources: ChatSource[] = searchResults.map(result => ({
        documentId: result.documentId,
        documentName: documentMap.get(result.documentId) || 'Unknown Document',
        chunkIndex: result.chunkIndex,
        content: result.content,
        similarity: result.similarity,
      }));

      // Append messages to chat
      const userMsg: ChatMessage = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      };

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: assistantMessage,
        timestamp: new Date().toISOString(),
        sources: searchResults.map(r => ({
          documentId: r.documentId,
          chunkIndex: r.chunkIndex,
          content: r.content,
          similarity: r.similarity,
        })),
      };

      const updatedMessages = [...existingMessages, userMsg, assistantMsg];

      // Generate title from first message if not set
      let title = chat.title;
      if (!title && existingMessages.length === 0) {
        title = await this.generateChatTitle(message);
      }

      // Update chat in database
      await prisma.documentChat.update({
        where: { id: chat.id },
        data: {
          title,
          messages: updatedMessages as any,
          lastMessageAt: new Date(),
        },
      });

      console.log(`[ChatService] Chat ${chat.id} updated with new messages`);

      return {
        chatId: chat.id,
        response: {
          message: assistantMessage,
          sources,
          tokensUsed,
        },
      };
    } catch (error) {
      console.error('[ChatService] Send message error:', error);

      // Log detailed error info
      if (error instanceof Error) {
        console.error('[ChatService] Error name:', error.name);
        console.error('[ChatService] Error message:', error.message);
        if (error.stack) {
          console.error('[ChatService] Error stack:', error.stack.substring(0, 500));
        }
      }

      throw new Error(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build system prompt with context
   *
   * @param context - Retrieved context from vector search
   * @param documentId - Document ID (optional)
   * @returns System prompt
   */
  private buildSystemPrompt(context: string, documentId?: string): string {
    const scope = documentId
      ? 'the provided document'
      : 'the available documents in your organization';

    return `You are a helpful AI assistant with access to ${scope}. Your role is to answer questions based on the provided context.

CONTEXT:
${context || 'No relevant context found.'}

INSTRUCTIONS:
- Answer questions using ONLY the information from the context above.
- If the context does not contain enough information to answer, say so clearly.
- Cite specific sources when making claims (e.g., "According to Source 1...").
- Be concise and accurate.
- If asked about information not in the context, politely explain that you can only answer based on the available documents.
- Do not make up or infer information beyond what is explicitly stated in the context.`;
  }

  /**
   * Generate a concise title for a chat from the first message
   *
   * @param firstMessage - First user message
   * @returns Generated title
   */
  private async generateChatTitle(firstMessage: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Generate a concise, descriptive title (max 6 words) for a chat conversation based on the first user message. Return only the title, nothing else.',
          },
          {
            role: 'user',
            content: firstMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 20,
      });

      const title = completion.choices[0].message.content?.trim() || 'New Chat';
      return title.replace(/^["']|["']$/g, ''); // Remove quotes if present
    } catch (error) {
      console.error('[ChatService] Title generation error:', error);
      return 'New Chat';
    }
  }

  /**
   * List user's chats
   *
   * @param userId - User ID
   * @param orgId - Organization ID
   * @param documentId - Filter by document ID (optional)
   * @param limit - Max results
   * @param offset - Pagination offset
   * @returns Chats and pagination info
   */
  async listChats(
    userId: string,
    orgId: string,
    documentId?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{
    chats: any[];
    pagination: { total: number; limit: number; offset: number; hasMore: boolean };
  }> {
    const where: any = { userId, orgId };
    if (documentId) {
      where.documentId = documentId;
    }

    const [chats, total] = await Promise.all([
      prisma.documentChat.findMany({
        where,
        include: {
          document: {
            select: {
              id: true,
              originalName: true,
              fileName: true,
            },
          },
        },
        orderBy: { lastMessageAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.documentChat.count({ where }),
    ]);

    return {
      chats: chats.map(chat => ({
        id: chat.id,
        title: chat.title || 'Untitled Chat',
        documentId: chat.documentId,
        document: chat.document,
        messageCount: Array.isArray(chat.messages) ? chat.messages.length : 0,
        lastMessageAt: chat.lastMessageAt,
        createdAt: chat.createdAt,
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  /**
   * Get chat by ID with full message history
   *
   * @param chatId - Chat ID
   * @param userId - User ID (for access control)
   * @param orgId - Organization ID (for access control)
   * @returns Chat with messages
   */
  async getChat(chatId: string, userId: string, orgId: string): Promise<any> {
    const chat = await prisma.documentChat.findFirst({
      where: {
        id: chatId,
        userId,
        orgId,
      },
      include: {
        document: {
          select: {
            id: true,
            originalName: true,
            fileName: true,
            cdnUrl: true,
          },
        },
      },
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    return {
      id: chat.id,
      title: chat.title || 'Untitled Chat',
      documentId: chat.documentId,
      document: chat.document,
      messages: chat.messages,
      lastMessageAt: chat.lastMessageAt,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    };
  }

  /**
   * Delete chat
   *
   * @param chatId - Chat ID
   * @param userId - User ID (for access control)
   * @param orgId - Organization ID (for access control)
   */
  async deleteChat(chatId: string, userId: string, orgId: string): Promise<void> {
    const chat = await prisma.documentChat.findFirst({
      where: {
        id: chatId,
        userId,
        orgId,
      },
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    await prisma.documentChat.delete({
      where: { id: chatId },
    });

    console.log(`[ChatService] Deleted chat ${chatId}`);
  }
}

// Singleton instance
let chatServiceInstance: ChatService | null = null;

/**
 * Get singleton instance of ChatService
 *
 * @returns ChatService instance
 */
export function getChatService(): ChatService {
  if (!chatServiceInstance) {
    chatServiceInstance = new ChatService();
  }
  return chatServiceInstance;
}

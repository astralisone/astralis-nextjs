'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Send, FileText, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import {
  useChatAPI,
  type ChatMessage,
  type ChatSource,
  ChatAPIError,
} from '@/lib/api/chat.client';

/**
 * DocumentChat Component
 *
 * Chat interface for document Q&A with AI-powered responses.
 *
 * Features:
 * - Message history display (user and AI messages)
 * - Source citations from retrieved document chunks
 * - Loading states with spinner
 * - Error handling with branded alerts
 * - Auto-scroll to latest message
 * - Responsive design with Astralis brand styling
 *
 * @example
 * ```tsx
 * <DocumentChat
 *   documentId="doc-123"
 *   orgId="org-456"
 *   userId="user-789"
 *   chatId="chat-abc" // Optional
 * />
 * ```
 */

export interface DocumentChatProps {
  /** Optional - if not provided, chat across all docs */
  documentId?: string;
  /** Organization ID for scoping */
  orgId: string;
  /** User ID for authentication */
  userId: string;
  /** Optional - for continuing existing chat */
  chatId?: string;
  /** Additional CSS classes */
  className?: string;
}

interface Message extends ChatMessage {
  id: string;
}

export function DocumentChat({
  documentId,
  orgId,
  userId,
  chatId: initialChatId,
  className,
}: DocumentChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatId, setChatId] = useState<string | undefined>(initialChatId);
  const [initError, setInitError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { sendMessage, fetchChat, loading, error } = useChatAPI();

  // Load existing chat if chatId provided
  useEffect(() => {
    if (initialChatId) {
      const loadChat = async () => {
        try {
          const chat = await fetchChat(initialChatId);
          setMessages(
            chat.messages.map((msg, index) => ({
              ...msg,
              id: `${initialChatId}-${index}`,
            }))
          );
        } catch (err) {
          setInitError(
            err instanceof ChatAPIError
              ? err.message
              : 'Failed to load chat history'
          );
        }
      };

      loadChat();
    }
  }, [initialChatId, fetchChat]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || loading) {
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const response = await sendMessage({
        chatId,
        documentId,
        message: userMessage.content,
      });

      // Update chatId if this is a new conversation
      if (!chatId && response.chatId) {
        setChatId(response.chatId);
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        sources: response.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      // Error is handled by useChatAPI hook
      // We could add a retry mechanism here if needed
      console.error('Failed to send message:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-white rounded-lg border border-slate-300',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-300 bg-slate-50">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-astralis-blue" />
          <h3 className="text-lg font-semibold text-astralis-navy">
            {documentId ? 'Document Chat' : 'All Documents Chat'}
          </h3>
        </div>
        {chatId && (
          <Badge variant="primary" className="text-xs">
            Active Chat
          </Badge>
        )}
      </div>

      {/* Initialization Error */}
      {initError && (
        <div className="px-6 pt-4">
          <Alert variant="error" showIcon>
            <AlertDescription>{initError}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <FileText className="h-16 w-16 text-slate-300 mb-4" />
            <h4 className="text-lg font-semibold text-slate-700 mb-2">
              Start a Conversation
            </h4>
            <p className="text-sm text-slate-500 max-w-md">
              Ask questions about {documentId ? 'this document' : 'your documents'} and get AI-powered answers with source citations.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex gap-3',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'flex flex-col max-w-[80%] gap-2',
                message.role === 'user' ? 'items-end' : 'items-start'
              )}
            >
              {/* Message Bubble */}
              <Card
                variant="default"
                className={cn(
                  'px-4 py-3',
                  message.role === 'user'
                    ? 'bg-astralis-blue text-white border-astralis-blue'
                    : 'bg-white border-slate-300'
                )}
              >
                <p
                  className={cn(
                    'text-sm leading-relaxed whitespace-pre-wrap',
                    message.role === 'user' ? 'text-white' : 'text-slate-900'
                  )}
                >
                  {message.content}
                </p>
              </Card>

              {/* Timestamp */}
              <span className="text-xs text-slate-500">
                {formatTimestamp(message.timestamp)}
              </span>

              {/* Sources (for assistant messages) */}
              {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                <div className="w-full space-y-2">
                  <p className="text-xs font-semibold text-slate-700">
                    Sources ({message.sources.length}):
                  </p>
                  <div className="space-y-2">
                    {message.sources.map((source, index) => (
                      <Card
                        key={`${source.documentId}-${source.chunkIndex}`}
                        variant="bordered"
                        className="p-3 bg-slate-50"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-astralis-blue flex-shrink-0" />
                            <p className="text-xs font-medium text-slate-900">
                              {source.documentName}
                            </p>
                          </div>
                          <Badge variant="default" className="text-xs">
                            {Math.round(source.similarity * 100)}% match
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2">
                          {source.content}
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-start">
            <Card variant="default" className="px-4 py-3 bg-slate-50 border-slate-300">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 text-astralis-blue animate-spin" />
                <p className="text-sm text-slate-600">Thinking...</p>
              </div>
            </Card>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="error" showIcon>
            <AlertDescription>
              <strong>Error:</strong> {error.message}
              {error.details && (
                <p className="mt-1 text-xs">{JSON.stringify(error.details)}</p>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-slate-300 bg-slate-50">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about the document..."
            disabled={loading}
            className="resize-none min-h-[44px] max-h-[200px]"
            rows={1}
          />
          <Button
            type="submit"
            variant="primary"
            size="icon"
            disabled={!input.trim() || loading}
            className="flex-shrink-0"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        <p className="text-xs text-slate-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

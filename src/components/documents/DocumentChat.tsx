'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import {
  sendChatMessage,
  type ChatSource,
  type SendMessageResponse,
} from '@/lib/api/chat.client';

export interface DocumentChatProps {
  documentId?: string;
  className?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[];
}

export function DocumentChat({ documentId, className }: DocumentChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatId, setChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput || loading) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmedInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setError(null);
    setLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const response: SendMessageResponse = await sendChatMessage({
        chatId: chatId || undefined,
        documentId,
        message: trimmedInput,
      });

      // Store chatId for conversation continuity
      if (!chatId && response.chatId) {
        setChatId(response.chatId);
      }

      // Add assistant message
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        sources: response.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <FileText className="h-16 w-16 text-slate-300 mb-4" />
            <h4 className="text-lg font-semibold text-slate-700 mb-2">
              Start a Conversation
            </h4>
            <p className="text-sm text-slate-500 max-w-md">
              Ask questions about {documentId ? 'this document' : 'your documents'} and get AI-powered answers.
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
              <Card
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

              {/* Sources */}
              {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                <div className="w-full mt-2">
                  <p className="text-xs font-medium text-slate-600 mb-2">
                    Sources ({message.sources.length}):
                  </p>
                  <div className="space-y-2">
                    {message.sources.slice(0, 3).map((source, idx) => (
                      <Card key={idx} className="p-2 bg-slate-50 border-slate-200">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-medium text-slate-700 truncate">
                            {source.documentName}
                          </p>
                          <Badge variant="default" className="text-xs">
                            {Math.round(source.similarity * 100)}%
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">
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

        {/* Loading */}
        {loading && (
          <div className="flex justify-start">
            <Card className="px-4 py-3 bg-slate-50 border-slate-300">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-astralis-blue animate-spin" />
                <p className="text-sm text-slate-600">Thinking...</p>
              </div>
            </Card>
          </div>
        )}

        {/* Error */}
        {error && (
          <Alert variant="error" showIcon>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-slate-300 bg-slate-50">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
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

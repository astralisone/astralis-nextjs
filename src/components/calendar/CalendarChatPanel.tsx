'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Calendar, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Calendar Chat Panel Component
 *
 * Conversational interface for calendar management.
 *
 * Features:
 * - Natural language calendar queries
 * - Message history display
 * - Confirmation flow for destructive actions
 * - User/AI message differentiation
 * - Auto-scroll to latest message
 * - Loading states and error handling
 *
 * @example
 * ```tsx
 * <CalendarChatPanel userId="user-123" orgId="org-456" />
 * ```
 */

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  requiresConfirmation?: boolean;
  action?: {
    type: string;
    data: any;
  };
  data?: any;
}

interface CalendarChatPanelProps {
  userId: string;
  orgId: string;
  className?: string;
  onEventCreated?: () => void;
}

export function CalendarChatPanel({ userId, orgId, className, onEventCreated }: CalendarChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your calendar assistant. I can help you:\n\n• View your schedule\n• Schedule new meetings\n• Find available time slots\n• Check your availability\n• Cancel events\n\nTry asking me something like:\n• \"What meetings do I have tomorrow?\"\n• \"Find me 2 hours of focus time this week\"\n• \"Schedule a meeting with john@example.com next Tuesday at 2pm\"",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    type: string;
    data: any;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /**
   * Send message to calendar chat API
   */
  const handleSendMessage = async () => {
    if (!input.trim() || loading) {
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setError(null);
    setLoading(true);

    try {
      // Build context from previous messages (last 5 for context)
      const previousMessages = messages.slice(-5).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/chat/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          context: {
            previousMessages,
            confirmed: false,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to send message');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        requiresConfirmation: data.requiresConfirmation,
        action: data.action,
        data: data.data,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // If confirmation required, store the pending action
      if (data.requiresConfirmation && data.action) {
        setPendingAction(data.action);
      } else {
        setPendingAction(null);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');

      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `I encountered an error: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Confirm pending action
   */
  const handleConfirm = async () => {
    if (!pendingAction) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Confirmed',
          context: {
            confirmed: true,
            pendingAction,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to confirm action');
      }

      const data = await response.json();

      const confirmationMessage: Message = {
        id: `confirmation-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        data: data.data,
      };

      setMessages(prev => [...prev, confirmationMessage]);
      setPendingAction(null);

      // Notify parent component of event creation
      if (onEventCreated) {
        onEventCreated();
      }
    } catch (err) {
      console.error('Failed to confirm action:', err);
      setError(err instanceof Error ? err.message : 'Failed to confirm action');

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Failed to confirm: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancel pending action
   */
  const handleCancel = () => {
    setPendingAction(null);

    const cancelMessage: Message = {
      id: `cancel-${Date.now()}`,
      role: 'assistant',
      content: 'Action cancelled. How else can I help you with your calendar?',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, cancelMessage]);
  };

  /**
   * Handle Enter key press
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Format timestamp
   */
  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-white rounded-lg border border-slate-300 shadow-card',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-300 bg-gradient-to-r from-astralis-blue to-blue-600">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Calendar Assistant</h3>
            <p className="text-xs text-white/80">Manage your schedule with natural language</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-slate-50">
        {messages.map(message => (
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
                  'px-4 py-3 shadow-sm',
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
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-start">
            <Card
              variant="default"
              className="px-4 py-3 bg-white border-slate-300 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-astralis-blue animate-spin" />
                <p className="text-sm text-slate-600 font-medium">Thinking...</p>
              </div>
            </Card>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="error" showIcon>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Confirmation UI */}
      {pendingAction && !loading && (
        <div className="px-6 py-4 border-t border-amber-200 bg-amber-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900 mb-3">
                Confirmation Required
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleConfirm}
                  variant="primary"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Confirm
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-slate-300 bg-white">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your calendar..."
            disabled={loading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            variant="primary"
            size="icon"
            disabled={!input.trim() || loading}
            className="flex-shrink-0"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          Press Enter to send
        </p>
      </div>
    </div>
  );
}

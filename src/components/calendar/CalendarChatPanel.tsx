'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Calendar, Loader2, CheckCircle, XCircle, AlertCircle, Brain, Activity, Clock, Users } from 'lucide-react';
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
      content: "🎯 **Calendar Intelligence Active**\n\nI'm your strategic calendar command center. I can execute:\n\n⚡ **Schedule Optimization**\n• Intelligent meeting placement\n• Conflict detection & resolution\n• Time zone coordination\n\n📅 **Availability Management**\n• Real-time availability scanning\n• Automated booking workflows\n• Resource allocation\n\n🎪 **Event Orchestration**\n• Multi-party coordination\n• Recurring event management\n• Calendar synchronization\n\n**Ready Commands:**\n• `\"Deploy 2-hour strategy session next week\"`\n• `\"Scan my availability for client calls\"`\n• `\"Orchestrate team sync for Friday 2pm\"`",
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
        'flex flex-col h-full bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-card-glass overflow-hidden',
        className
      )}
    >
      {/* Command Center Header */}
      <div className="bg-gradient-to-r from-astralis-navy via-slate-800 to-astralis-navy p-6 border-b border-slate-200 dark:border-slate-700 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-astralis-blue/5 via-transparent to-astralis-blue/5"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-astralis-blue/20 rounded-xl backdrop-blur-sm border border-astralis-blue/30 shadow-glow-blue">
                <Activity className="h-8 w-8 text-astralis-blue" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Calendar Command Center</h2>
                <p className="text-slate-300 text-sm">Strategic scheduling intelligence and automated calendar orchestration</p>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 rounded-lg border border-green-500/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-300">CALENDAR ACTIVE</span>
            </div>
          </div>

          {/* Capabilities Display */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-300">
              <Brain className="h-[24px] w-[24px]" />
              <span className="text-sm font-medium">Capabilities:</span>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-astralis-blue/20 text-astralis-blue border-astralis-blue/30 text-xs px-2 py-1">
                <Clock className="h-5 w-5 mr-1" />
                Scheduling
              </Badge>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs px-2 py-1">
                <Users className="h-5 w-5 mr-1" />
                Coordination
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs px-2 py-1">
                <Activity className="h-5 w-5 mr-1" />
                Intelligence
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Command Interface */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-gradient-to-b from-transparent to-slate-50/50 dark:to-slate-900/50">
        {messages.map(message => (
          <div
            key={message.id}
            className={cn(
              'flex gap-4 group',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-astralis-blue to-blue-600 rounded-xl flex items-center justify-center shadow-glow-blue">
                  <Activity className="h-5 w-5 text-white" />
                </div>
              </div>
            )}

            <div className={`max-w-[75%] ${message.role === 'user' ? 'order-first' : ''}`}>
              {/* Message Header */}
              <div className={`flex items-center gap-2 mb-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <span className="text-xs font-medium text-slate-500">
                  {message.role === 'user' ? 'You' : 'Calendar Intelligence'}
                </span>
                {message.requiresConfirmation && (
                  <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs px-2 py-1">
                    <AlertCircle className="h-5 w-5 mr-1" />
                    Confirmation Required
                  </Badge>
                )}
              </div>

              {/* Message Content */}
              <div
                className={cn(
                  'rounded-2xl px-6 py-4 shadow-card border backdrop-blur-sm transition-all duration-300 group-hover:shadow-card-hover group-hover:scale-[1.02]',
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-astralis-blue via-blue-600 to-astralis-blue text-white border-astralis-blue/30 shadow-glow-blue hover:shadow-glow-blue-lg'
                    : 'bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-800 dark:to-slate-700/50 border-slate-200/60 dark:border-slate-700/60 text-slate-900 dark:text-white hover:border-astralis-blue/20'
                )}
              >
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
                {message.data && (
                  <div className="mt-4 p-3 bg-slate-50/50 dark:bg-slate-700/50 rounded-lg border border-slate-200/30">
                    <div className="text-xs text-slate-600 dark:text-slate-300 font-medium mb-1">📅 Event Details</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {JSON.stringify(message.data, null, 2)}
                    </div>
                  </div>
                )}
              </div>

              {/* Timestamp */}
              <div className={`text-xs text-slate-500 mt-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                {formatTimestamp(message.timestamp)}
              </div>
            </div>

            {message.role === 'user' && (
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-600 rounded-xl flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-astralis-blue to-blue-600 rounded-xl flex items-center justify-center shadow-glow-blue">
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              </div>
            </div>
            <div className="max-w-[75%]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-slate-500">Calendar Intelligence</span>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl px-6 py-4 shadow-card border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-astralis-blue rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-astralis-blue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-astralis-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Processing calendar command...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex justify-center">
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 max-w-[75%]">
              <AlertCircle className="h-[24px] w-[24px] text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Confirmation UI */}
      {pendingAction && !loading && (
        <div className="border-t border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 px-6 py-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-500/30">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-amber-900 dark:text-amber-100 mb-2">
                  Strategic Confirmation Required
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-200 mb-4">
                  This action will modify your calendar schedule. Please confirm to proceed with the orchestration.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={handleConfirm}
                    className="bg-green-600 hover:bg-green-700 text-white shadow-glow-green hover:shadow-glow-green transition-all duration-200"
                    size="sm"
                  >
                    <CheckCircle className="h-[24px] w-[24px] mr-2" />
                    Confirm Execution
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                    className="border-slate-300 hover:bg-slate-50"
                  >
                    <XCircle className="h-[24px] w-[24px] mr-2" />
                    Cancel Operation
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Command Input */}
      <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Issue calendar command..."
              disabled={loading}
              className="pr-12 py-4 text-base border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-astralis-blue focus:ring-astralis-blue bg-slate-50 dark:bg-slate-700 transition-all duration-200"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Send className="h-5 w-5" />
            </div>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || loading}
            size="lg"
            className="px-8 bg-gradient-to-r from-astralis-blue to-blue-600 hover:from-blue-600 hover:to-astralis-blue shadow-glow-blue hover:shadow-glow-blue-lg transition-all duration-200 font-semibold"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <Send className="h-5 w-5 mr-2" />
            )}
            Execute
          </Button>
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
          <span>Press Enter to execute • Shift+Enter for new line</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Calendar intelligence ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}

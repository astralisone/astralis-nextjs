'use client';

import { useState } from 'react';
import { Send, FileText, Loader2, AlertCircle, Brain, Database, Search, Zap } from 'lucide-react';

interface DocumentChatProps {
  documentId?: string;
  className?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function DocumentChat({ documentId, className }: DocumentChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          chatId: chatId || undefined,
          documentId,
          message: text,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      if (data.data?.chatId) {
        setChatId(data.data.chatId);
      }

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.data?.message || 'No response',
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`flex flex-col h-full bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-card-glass overflow-hidden ${className || ''}`}>
      {/* Command Center Header */}
      <div className="bg-gradient-to-r from-astralis-navy via-slate-800 to-astralis-navy p-6 border-b border-slate-200 dark:border-slate-700 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-astralis-blue/5 via-transparent to-astralis-blue/5"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-astralis-blue/20 rounded-xl backdrop-blur-sm border border-astralis-blue/30 shadow-glow-blue">
                <Database className="h-8 w-8 text-astralis-blue" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Document Intelligence Center</h2>
                <p className="text-slate-300 text-sm">Advanced document processing and intelligent knowledge extraction</p>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 rounded-lg border border-green-500/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-300">AI PROCESSING ACTIVE</span>
            </div>
          </div>

          {/* Capabilities Display */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-300">
              <Brain className="h-4 w-4" />
              <span className="text-sm font-medium">Capabilities:</span>
            </div>
            <div className="flex gap-2">
              <Badge className="bg-astralis-blue/20 text-astralis-blue border-astralis-blue/30 text-xs px-2 py-1">
                <Search className="h-5 w-5 mr-1" />
                Analysis
              </Badge>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs px-2 py-1">
                <Database className="h-5 w-5 mr-1" />
                Processing
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs px-2 py-1">
                <Zap className="h-5 w-5 mr-1" />
                Intelligence
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Command Interface */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-gradient-to-b from-transparent to-slate-50/50 dark:to-slate-900/50">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <div className="p-6 bg-gradient-to-br from-astralis-blue/10 to-slate-100 dark:from-astralis-blue/20 dark:to-slate-800 rounded-2xl border border-astralis-blue/20 shadow-card mb-6">
              <Database className="h-16 w-16 text-astralis-blue mx-auto mb-4" />
              <h3 className="text-xl font-bold text-astralis-navy dark:text-white mb-2">Document Intelligence Ready</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4 max-w-md text-center">
                Issue queries to analyze documents, extract insights, and process information with advanced AI capabilities.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="secondary" className="bg-astralis-blue/10 text-astralis-blue border-astralis-blue/20">
                  Content Analysis
                </Badge>
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                  Data Extraction
                </Badge>
                <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                  Pattern Recognition
                </Badge>
              </div>
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-4 group ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-astralis-blue to-blue-600 rounded-xl flex items-center justify-center shadow-glow-blue">
                  <Database className="h-5 w-5 text-white" />
                </div>
              </div>
            )}

            <div className={`max-w-[75%] ${msg.role === 'user' ? 'order-first' : ''}`}>
              {/* Message Header */}
              <div className={`flex items-center gap-2 mb-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <span className="text-xs font-medium text-slate-500">
                  {msg.role === 'user' ? 'You' : 'Document Intelligence'}
                </span>
              </div>

              {/* Message Content */}
              <div
                className={`rounded-2xl px-6 py-4 shadow-card border backdrop-blur-sm transition-all duration-200 group-hover:shadow-card-hover ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-astralis-blue to-blue-600 text-white border-astralis-blue/20 shadow-glow-blue'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                }`}
              >
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-600 rounded-xl flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-astralis-blue to-blue-600 rounded-xl flex items-center justify-center shadow-glow-blue">
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              </div>
            </div>
            <div className="max-w-[75%]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-slate-500">Document Intelligence</span>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl px-6 py-4 shadow-card border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-astralis-blue rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-astralis-blue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-astralis-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Analyzing documents...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex justify-center">
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 max-w-[75%]">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      {/* Command Input */}
      <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Issue document analysis command..."
              disabled={isLoading}
              className="w-full pr-12 py-4 text-base border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-astralis-blue focus:ring-astralis-blue bg-slate-50 dark:bg-slate-700 transition-all duration-200 disabled:opacity-50"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Send className="h-5 w-5" />
            </div>
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="px-8 py-4 bg-gradient-to-r from-astralis-blue to-blue-600 hover:from-blue-600 hover:to-astralis-blue text-white rounded-xl shadow-glow-blue hover:shadow-glow-blue-lg transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <Send className="h-5 w-5 mr-2" />
            )}
            Analyze
          </button>
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
          <span>Press Enter to analyze • Shift+Enter for new line</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Document intelligence ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}

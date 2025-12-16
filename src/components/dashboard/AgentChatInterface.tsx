'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Send, Bot, User, Zap, Lightbulb, Activity, Brain, Settings, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { AgentDecisionResult, IntegrationSuggestion } from '@/lib/agent/types/agent.types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agent?: string;
  suggestions?: IntegrationSuggestion[];
  confidence?: number;
}

interface AgentOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const AVAILABLE_AGENTS: AgentOption[] = [
  {
    id: 'orchestration',
    name: 'Orchestration Agent',
    description: 'Command center for intelligent workflow automation and multi-agent coordination',
    icon: <Brain className="h-5 w-5" />
  },
  {
    id: 'scheduling',
    name: 'Scheduling Agent',
    description: 'Strategic calendar management and intelligent appointment orchestration',
    icon: <Activity className="h-5 w-5" />
  },
  {
    id: 'document',
    name: 'Document Agent',
    description: 'Advanced document intelligence and automated processing pipeline',
    icon: <Settings className="h-5 w-5" />
  }
];

export function AgentChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('orchestration');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestionsCollapsed, setSuggestionsCollapsed] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/agent/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: userMessage.content,
          source: 'API',
          type: 'chat',
          agent: selectedAgent,
          priority: 3,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.decision.reasoning,
        timestamp: new Date(),
        agent: AVAILABLE_AGENTS.find(a => a.id === selectedAgent)?.name,
        suggestions: data.decision.suggestions,
        confidence: data.decision.confidence,
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');

      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        timestamp: new Date(),
        agent: AVAILABLE_AGENTS.find(a => a.id === selectedAgent)?.name,
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderSuggestions = (suggestions?: IntegrationSuggestion[]) => {
    if (!suggestions || suggestions.length === 0) return null;

    return (
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-astralis-blue font-semibold">
            <Lightbulb className="h-4 w-4" />
            <span>Strategic Integration Recommendations</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSuggestionsCollapsed(!suggestionsCollapsed)}
            className="text-astralis-blue hover:text-astralis-blue/80"
          >
            {suggestionsCollapsed ? 'Show' : 'Hide'}
          </Button>
        </div>
        {!suggestionsCollapsed && (
          <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="bg-gradient-to-r from-astralis-blue/5 to-blue-50 dark:from-astralis-blue/10 dark:to-blue-950/50 rounded-xl p-4 border border-astralis-blue/20">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-astralis-navy dark:text-white mb-1">
                      {suggestion.provider ? `🔗 Connect ${suggestion.provider}` : '⚙️ Integration Setup'}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                      {suggestion.reason}
                    </div>
                    <div className="text-xs text-astralis-blue font-medium bg-astralis-blue/10 px-2 py-1 rounded-lg inline-block">
                      💡 {suggestion.benefit}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="ml-4 bg-astralis-blue hover:bg-blue-600 text-white shadow-glow-blue hover:shadow-glow-blue-lg transition-all duration-200"
                    onClick={() => {
                      window.location.href = '/integrations';
                    }}
                  >
                    Connect Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const selectedAgentData = AVAILABLE_AGENTS.find(a => a.id === selectedAgent);

  return (
    <div className="h-[700px] bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-card-glass overflow-hidden flex flex-col">
      {/* Command Center Header */}
      <div className="bg-gradient-to-r from-astralis-navy via-slate-800 to-astralis-navy p-6 border-b border-slate-200 dark:border-slate-700 relative overflow-hidden flex-shrink-0">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-astralis-blue/5 via-transparent to-astralis-blue/5"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-astralis-blue/20 rounded-xl backdrop-blur-sm border border-astralis-blue/30 shadow-glow-blue">
                <Brain className="h-8 w-8 text-astralis-blue" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">AI Command Center</h2>
                <p className="text-slate-300 text-sm">Direct intelligent agents to execute your business operations</p>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-2 bg-green-500/20 rounded-lg border border-green-500/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-300">SYSTEMS ACTIVE</span>
            </div>
          </div>

          {/* Agent Selector */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-300">
              <Settings className="h-4 w-4" />
              <span className="text-sm font-medium">Active Agent:</span>
            </div>
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger className="w-80 bg-white/10 border-slate-600 text-white backdrop-blur-sm hover:bg-white/20 transition-all duration-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {AVAILABLE_AGENTS.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id} className="text-white hover:bg-slate-700 focus:bg-slate-700">
                    <div className="flex items-center gap-3 py-2">
                      <div className="p-2 bg-astralis-blue/20 rounded-lg">
                        {agent.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{agent.name}</div>
                        <div className="text-xs text-slate-400 leading-relaxed">{agent.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Messages Command Interface */}
      <div className="flex-1 flex flex-col min-h-0">
        <div
          className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-gradient-to-b from-transparent to-slate-50/50 dark:to-slate-900/50"
          ref={scrollAreaRef}
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="p-6 bg-gradient-to-br from-astralis-blue/10 to-slate-100 dark:from-astralis-blue/20 dark:to-slate-800 rounded-2xl border border-astralis-blue/20 shadow-card mb-6">
                <Brain className="h-16 w-16 text-astralis-blue mx-auto mb-4" />
                <h3 className="text-xl font-bold text-astralis-navy dark:text-white mb-2">Ready to Execute</h3>
                <p className="text-slate-600 dark:text-slate-300 mb-4 max-w-md">
                  Issue commands to your AI agents. They can automate workflows, process documents, schedule meetings, and coordinate complex business operations.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary" className="bg-astralis-blue/10 text-astralis-blue border-astralis-blue/20">
                    Workflow Automation
                  </Badge>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                    Document Processing
                  </Badge>
                  <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                    Calendar Intelligence
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 group ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-astralis-blue to-blue-600 rounded-xl flex items-center justify-center shadow-glow-blue">
                      {selectedAgentData?.icon}
                    </div>
                  </div>
                )}

                <div className={`max-w-[75%] ${message.role === 'user' ? 'order-first' : ''}`}>
                  {/* Message Header */}
                  <div className={`flex items-center gap-2 mb-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-xs font-medium text-slate-500">
                      {message.role === 'user' ? 'You' : selectedAgentData?.name}
                    </span>
                    {message.confidence && (
                      <Badge
                        variant="secondary"
                        className={`text-xs px-2 py-1 ${
                          message.confidence > 0.8
                            ? 'bg-green-500/10 text-green-600 border-green-500/20'
                            : message.confidence > 0.6
                            ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
                            : 'bg-red-500/10 text-red-600 border-red-500/20'
                        }`}
                      >
                        {message.confidence > 0.8 ? (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        ) : (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        )}
                        {Math.round(message.confidence * 100)}% confidence
                      </Badge>
                    )}
                  </div>

                  {/* Message Content */}
                  <div
                    className={`rounded-2xl px-6 py-4 shadow-card border backdrop-blur-sm transition-all duration-200 group-hover:shadow-card-hover ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-astralis-blue to-blue-600 text-white border-astralis-blue/20 shadow-glow-blue'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                    }`}
                  >
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
                    {renderSuggestions(message.suggestions)}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-600 rounded-xl flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

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
                  <span className="text-xs font-medium text-slate-500">{selectedAgentData?.name}</span>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl px-6 py-4 shadow-card border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-astralis-blue rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-astralis-blue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-astralis-blue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Processing your command...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Error Display */}
        {error && (
          <div className="px-6 pb-4 flex-shrink-0">
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Command Input */}
        <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 flex-shrink-0">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`Command ${selectedAgentData?.name.toLowerCase()}...`}
                disabled={isLoading}
                className="pr-12 py-4 text-base border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:border-astralis-blue focus:ring-astralis-blue bg-slate-50 dark:bg-slate-700 transition-all duration-200"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Send className="h-5 w-5" />
              </div>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              size="lg"
              className="px-8 bg-gradient-to-r from-astralis-blue to-blue-600 hover:from-blue-600 hover:to-astralis-blue shadow-glow-blue hover:shadow-glow-blue-lg transition-all duration-200 font-semibold"
            >
              {isLoading ? (
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
              <span>Agent ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
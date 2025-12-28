'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Maximize2, Minimize2, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// If ScrollArea doesn't exist, we'll swap to a simple div overflow-auto for now to fix build
// import { ScrollArea } from '@/components/ui/scroll-area'; 
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useUIStore } from '@/stores/useUIStore';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    steps?: any[];
}

export function AgentChatWidget() {
    const { rightPanelOpen, toggleRightPanel, activeRightPanel, setActiveRightPanel } = useUIStore();
    const isOpen = rightPanelOpen && activeRightPanel === 'agent';
    const setIsOpen = (open: boolean) => {
        if (!open) {
            useUIStore.getState().closeRightPanel();
        } else {
            setActiveRightPanel('agent');
        }
    };

    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hi! I\'m your Astralis assistant. I can help you check integrations, tasks, or run automations. How can I help?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const widgetRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');

        // Handle Local Slash Commands
        if (userMessage === '/commands') {
            const commandList = [
                '**Available Commands:**',
                '- `/commands`: Show this list',
                '- `/task add`: Create a new task (Agent-led)',
                '- `/automation report`: Get automation status',
                '- `/task report`: Get task board status'
            ].join('\n');

            setMessages(prev => [
                ...prev,
                { role: 'user', content: userMessage },
                { role: 'assistant', content: commandList }
            ]);
            return;
        }

        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/agent/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages.map(m => ({ role: m.role, content: m.content }))
                }),
            });

            if (!response.ok) throw new Error('Failed to send message');

            const data = await response.json();

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.message,
                steps: data.steps
            }]);
        } catch (error) {
            console.error(error);
            toast({
                title: 'Error',
                description: 'Failed to communicate with the agent.',
                variant: 'destructive',
            });
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'I encountered an error. Please try again.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg z-[100000] bg-[#0A1B2B] hover:bg-[#1a2f42] border border-[#2B6CB0]/20 transition-all duration-300 hover:scale-110 active:scale-95"
            >
                <Bot className="h-8 w-8 text-[#2B6CB0]" />
            </Button>
        );
    }

    return (
        <Card
            ref={widgetRef}
            className={cn(
                "fixed top-[70px] bottom-0 right-0 z-[100000] shadow-2xl transition-all duration-300 flex flex-col border-l border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-in slide-in-from-right",
                isExpanded ? "w-[600px]" : "w-[400px]"
            )}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-[#0A1B2B] flex items-center justify-center border border-[#2B6CB0]/20">
                        <Sparkles className="h-[24px] w-[24px] text-[#2B6CB0]" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-medium">Astralis Assistant</CardTitle>
                        <p className="text-xs text-muted-foreground">Orchestration Agent Active</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? <Minimize2 className="h-[24px] w-[24px]" /> : <Maximize2 className="h-[24px] w-[24px]" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                        <X className="h-[24px] w-[24px]" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-hidden relative">
                <div className="h-full p-4 overflow-y-auto">
                    <div className="space-y-4">
                        {messages.map((message, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex flex-col gap-2 max-w-[85%]",
                                    message.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                                )}
                            >
                                <div
                                    className={cn(
                                        "rounded-2xl px-4 py-2 text-sm shadow-sm",
                                        message.role === 'user'
                                            ? "bg-[#2B6CB0] text-white"
                                            : "bg-muted text-foreground border border-border/50"
                                    )}
                                >
                                    <div className="whitespace-pre-wrap">{message.content}</div>
                                </div>

                                {message.steps && message.steps.length > 0 && (
                                    <div className="text-xs text-muted-foreground pl-2 border-l-2 border-border/50 ml-2 space-y-1">
                                        <p className="font-semibold text-[10px] uppercase tracking-wider">Reasoning Steps:</p>
                                        {message.steps.map((step: any, sIdx: number) => (
                                            <div key={sIdx} className="bg-muted/50 p-2 rounded text-[10px] font-mono">
                                                {step.actions.map((a: any) => `Action: ${a.type}`).join(', ')}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground ml-2 animate-pulse">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Thinking...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-4 border-t border-border/50">
                <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask to check status or run actions..."
                        className="flex-1 bg-background/50"
                        disabled={isLoading}
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="bg-[#2B6CB0] hover:bg-[#2B6CB0]/90">
                        <Send className="h-[24px] w-[24px]" />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}

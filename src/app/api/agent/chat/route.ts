import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { OrchestrationAgent } from '@/lib/agent/core/OrchestrationAgent';
import { ChatAgent } from '@/lib/agent/core/ChatAgent';
import { LLMProvider, DecisionType } from '@/lib/agent/types/agent.types';

// Cache the agent instance to maintain some state/connections if needed
// In a serverless environment, this might be recreated, which is fine
let chatAgent: ChatAgent | null = null;

function getChatAgent(orgId: string): ChatAgent {
    // In a real app, we might want to cache by orgId or create fresh
    const orchestrator = new OrchestrationAgent({
        orgId,
        llmProvider: LLMProvider.CLAUDE,
        llmModel: 'claude-3-5-sonnet-20241022',
        temperature: 0, // Deterministic for tools
        autoExecuteThreshold: 0.6, // Lower threshold for chat interactions
        requireApprovalThreshold: 0.4,
        enabledActions: [
            DecisionType.GET_INTEGRATIONS_STATUS,
            DecisionType.LIST_ACTIVE_AUTOMATIONS,
            DecisionType.GET_KANBAN_STATE,
            DecisionType.SEARCH_DOCUMENTS,
            DecisionType.CREATE_TASK, // Allow creating tasks
            DecisionType.NO_ACTION
        ],
        maxActionsPerMinute: 60,
        maxActionsPerHour: 1000,
        notifyOnHighPriority: false,
        notifyOnFailure: false,
        escalationEmail: 'admin@astralisone.com'
    });

    orchestrator.start();

    return new ChatAgent({
        orchestrationAgent: orchestrator,
        maxTurns: 5
    });
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { message, history } = await req.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Use organization from session or default
        // Note: session.user type might need casting depending on your auth setup
        const orgId = (session.user as any).orgId || 'default-org';

        const agent = getChatAgent(orgId);

        const response = await agent.chat(message, history, session.user.name || session.user.email || 'User');

        return NextResponse.json(response);
    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: (error as Error).message },
            { status: 500 }
        );
    }
}

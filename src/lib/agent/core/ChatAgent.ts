import { OrchestrationAgent } from './OrchestrationAgent';
import { AgentInputSource, ChatMessage, DecisionType } from '../types/agent.types';
import { ResultFormatter } from '../utils/ResultFormatter';
import { ConversationContext } from '../utils/ConversationContext';
import { v4 as uuidv4 } from 'uuid';

export interface ChatAgentConfig {
    orchestrationAgent: OrchestrationAgent;
    maxTurns?: number;
}

export interface ChatResponse {
    message: string;
    toolCalls?: any[];
    steps?: any[];
}

/**
 * ChatAgent - Conversational wrapper around OrchestrationAgent
 * Implements a ReAct (Reasoning + Acting) loop to handle multi-step requests.
 */
export class ChatAgent {
    private agent: OrchestrationAgent;
    private maxTurns: number;

    constructor(config: ChatAgentConfig) {
        this.agent = config.orchestrationAgent;
        this.maxTurns = config.maxTurns || 10;
    }

    /**
     * Process a chat message
     */
    async chat(
        message: string,
        history: ChatMessage[] = [],
        userId?: string
    ): Promise<ChatResponse> {
        const sessionId = uuidv4();
        const steps: any[] = [];

        // Construct the context for the conversation
        // In a real implementation, we would summarize history or pass it to the LLM
        // 0. Check for "Capability Discovery" / Help intent
        const isCapabilityQuery = /^(what|how) (can|do) (you|i)|help|capabilities|features/i.test(message);
        if (isCapabilityQuery) {
            return this.handleCapabilityQuery(userId);
        }

        // 1. Build conversation context with history
        const conversationContext = ConversationContext.buildContext(message, history, steps);
        let currentInput = conversationContext;
        let turnCount = 0;

        while (turnCount < this.maxTurns) {
            turnCount++;

            // 1. Ask OrchestrationAgent to decide what to do
            // We wrap the chat interaction as an API input
            const result = await this.agent.process({
                source: AgentInputSource.API,
                type: 'chat_interaction',
                rawContent: currentInput,
                timestamp: new Date(),
                correlationId: sessionId,
                metadata: {
                    senderName: userId || 'User',
                    // Pass history as metadata if the prompt supports it, 
                    // or we rely on the implementation to handle conversation context
                }
            });

            // 2. Check if the agent decided to act (Tool Call) or just respond
            const actions = result.actions;

            // Filter out NO_ACTION
            const realActions = actions.filter(a => a.type !== DecisionType.NO_ACTION);

            if (realActions.length === 0) {
                // No actions means the agent probably provided a reasoning/response 
                // derived from its internal knowledge or it's a simple chit-chat
                // In the specific specific agent types, 'reasoning' is the text response
                return {
                    message: result.reasoning || "I processed that but have no specific action to take.",
                    steps
                };
            }

            // 3. Helper to detect if the action is a "Response" action or a "Tool" action
            // For this implementation, we assume if the agent uses a tool, it's gathering info
            // If it uses "SEND_NOTIFICATION" or similar, it's an effect.
            // We need a specific "REPLY_TO_USER" action or we infer it.

            // For Omniscient Chat, we look for "Get/List/Search" tools
            const isInformationGathering = realActions.some(a =>
                [
                    DecisionType.GET_INTEGRATIONS_STATUS,
                    DecisionType.LIST_ACTIVE_AUTOMATIONS,
                    DecisionType.GET_KANBAN_STATE,
                    DecisionType.SEARCH_DOCUMENTS,
                    'DB_LOOKUP' // If generic lookup exists
                ].includes(a.type)
            );

            // 3. Update the isInformationGathering block to format observations, update steps, and perform a synthesis turn with the LLM.
            if (isInformationGathering) {
                // Execute the actions
                // The process() method in OrchestrationAgent ALREADY executes auto-executable actions
                // if configured. We now have the results attached.

                const executionResults = result.executionResults || [];

                if (executionResults.length > 0) {
                    // Format observations for the LLM
                    const observations = executionResults.map(r =>
                        `Action: ${r.action || 'Unknown'}\nResult: ${JSON.stringify(r.data, null, 2)}`
                    ).join('\n\n');

                    steps.push({
                        turn: turnCount,
                        actions: realActions,
                        observation: observations
                    });

                    // Ask LLM to synthesize final answer based on observations
                    const synthesisPrompt = `User asked: "${message}"

I have gathered the following information:
${observations}

Based on this information, provide a clear, helpful answer to the user's question. Be specific and reference the data gathered.`;

                    // Perform synthesis turn
                    const synthesisResult = await this.agent.process({
                        source: AgentInputSource.API,
                        type: 'chat_synthesis',
                        rawContent: synthesisPrompt,
                        timestamp: new Date(),
                        correlationId: uuidv4(),
                        metadata: {
                            senderName: userId || 'User',
                        }
                    });

                    return {
                        message: synthesisResult.reasoning || "Based on the information gathered, I can help you with that.",
                        steps,
                        toolCalls: realActions
                    };
                } else {
                    // If no results returned (maybe auto-execute failed or was disabled), providing feedback
                    const observation = "Actions were proposed but no execution results were returned. They might require approval or failed.";
                    steps.push({ turn: turnCount, actions: realActions, observation });
                    currentInput = `${currentInput} \n\n[SYSTEM] ${observation} `;
                    continue;
                }
            }

            // If actions were side-effects or we are done with the loop
            // We return the final answer.
            // But we should format the results nicely for the user

            let finalMessage = result.reasoning;

            if (result.executionResults && result.executionResults.length > 0) {
                const formattedResults = ResultFormatter.formatResultsBlock(realActions, result.executionResults);
                finalMessage += `\n\n${formattedResults} `;
            } else if (realActions.length > 0) {
                finalMessage += "\n\nI have initiated the requested actions, but no immediate results were returned.";
            }

            return {
                message: finalMessage,
                steps,
                toolCalls: realActions,
            };
        }

        return {
            message: "I reached the maximum number of steps without a final answer.",
            steps
        };
    }


    /**
     * Handle detailed capability queries (e.g. "What can you do?").
     */
    private async handleCapabilityQuery(userId?: string): Promise<ChatResponse> {
        const capabilities = [
            "## 🤖 Agent Capabilities",
            "I am your Astralis AI assistant. Here is what I can help you with:",
            "",
            "### ⚡️ Automations & Workflows",
            "- **Trigger n8n workflows** (e.g., \"Run the onboarding workflow\")",
            "- **List active automations** (e.g., \"Show my automations\")",
            "",
            "### 📋 Task & Project Management",
            "- **Create and assign tasks** (e.g., \"Create a task to review Q3 report\")",
            "- **Update Kanban items**",
            "- **Check Kanban board state** (e.g., \"What's in progress?\")",
            "",
            "### 📅 Scheduling",
            "- **Create and manage calendar events** (e.g., \"Schedule a meeting with Greg tomorrow at 2pm\")",
            "- **Check availability**",
            "",
            "### 📚 Knowledge & Documents",
            "- **Search internal documentation** (e.g., \"Search docs for API keys\")",
            "",
            "### 📧 Communication",
            "- **Send emails and notifications**",
            "- **Check integration status**",
        ];

        return {
            message: capabilities.join('\n'),
            steps: []
        };
    }
}

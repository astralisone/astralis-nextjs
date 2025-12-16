import { OrchestrationAgent } from './OrchestrationAgent';
import { AgentInputSource, ChatMessage, DecisionType } from '../types/agent.types';
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
        // For now, we'll treat the simplest ReAct loop: current message + tools

        let currentInput = message;
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

            if (isInformationGathering) {
                // Execute the actions
                // The process() method in OrchestrationAgent ALREADY executes auto-executable actions
                // if configured. We now have the results attached.

                const executionResults = result.executionResults || [];

                if (executionResults.length > 0) {
                    // Format the observation from real results
                    const observation = executionResults.map(r =>
                        `Action: ${r.action}\nResult: ${JSON.stringify(r.data, null, 2)}`
                    ).join('\n\n');

                    steps.push({
                        turn: turnCount,
                        actions: realActions,
                        observation
                    });

                    // Construct next input with the observation
                    currentInput = `${currentInput}\n\n[SYSTEM] Observation from previous actions:\n${observation}\n\nBased on this, please provide a final answer or take further actions.`;
                    continue;
                } else {
                    // If no results returned (maybe auto-execute failed or was disabled), providing feedback
                    const observation = "Actions were proposed but no execution results were returned. They might require approval or failed.";
                    steps.push({ turn: turnCount, actions: realActions, observation });
                    currentInput = `${currentInput}\n\n[SYSTEM] ${observation}`;
                    continue;
                }
            }

            // If actions were side-effects (Create Task), we are done.
            return {
                message: result.reasoning + "\n\nI have executed the requested actions.",
                steps
            };
        }

        return {
            message: "I reached the maximum number of steps without a final answer.",
            steps
        };
    }
}

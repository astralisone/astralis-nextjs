
import { ChatMessage } from '../types/agent.types';

/**
 * Utility for building and managing conversation context.
 */
export class ConversationContext {
    /**
     * Build a context string that includes conversation history and previous steps.
     * 
     * @param currentMessage The current user message
     * @param history Array of previous chat messages
     * @param steps Array of steps taken in the current turn (observations)
     * @returns Formatted context string for the LLM
     */
    static buildContext(
        currentMessage: string,
        history: ChatMessage[] = [],
        steps: any[] = []
    ): string {
        let context = '';

        // Include recent history (last 5 messages) to maintain context
        // efficiently without overloading the prompt
        if (history.length > 0) {
            const recentHistory = history.slice(-5);
            context += "Previous conversation:\n";
            recentHistory.forEach(msg => {
                const role = msg.role === 'user' ? 'User' : 'Assistant';
                context += `${role}: ${msg.content}\n`;
            });
            context += "\n";
        }

        // Include previous steps/actions taken in this current session
        if (steps.length > 0) {
            context += "Actions taken in this conversation so far:\n";
            steps.forEach((step, idx) => {
                // If step has observation, include it
                if (step.observation) {
                    context += `Step ${idx + 1}: ${step.observation}\n`;
                } else if (step.actions && step.actions.length > 0) {
                    const actionTypes = step.actions.map((a: any) => a.type).join(', ');
                    context += `Step ${idx + 1}: Executed ${actionTypes}\n`;
                }
            });
            context += "\n";
        }

        context += `Current request: ${currentMessage}`;

        return context;
    }
}

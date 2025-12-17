
import type { AgentAction, DecisionType } from '../types/agent.types';
import { DecisionType as DecisionTypeEnum } from '../types/agent.types';

/**
 * Utility for formatting action results into natural language.
 */
export class ResultFormatter {
    /**
     * Format a single action execution result into a user-friendly string.
     * 
     * @param action The action that was executed
     * @param result The result returned from the execution
     * @returns A formatted string description of the result
     */
    static formatActionResult(action: AgentAction, result: any): string {
        if (!result) {
            return `✓ Completed action: ${action.type}`;
        }

        const formatters: Record<string, (a: AgentAction, r: any) => string> = {
            [DecisionTypeEnum.SEND_NOTIFICATION]: (a, r) => {
                const recipients = r.recipientCount || (a.params.recipientIds as any[])?.length || 'recipients';
                const method = a.params.type === 'in_app' ? 'notification' : a.params.type;
                return `✓ Sent ${method} "${a.params.subject}" to ${recipients} recipient(s)`;
            },

            [DecisionTypeEnum.CREATE_TASK]: (a, r) => {
                const taskId = r.id || 'new task';
                const title = r.title || a.params.title;
                return `✓ Created task "${title}" (ID: ${taskId})`;
            },

            [DecisionTypeEnum.ASSIGN_PIPELINE]: (a, r) => {
                const pipeline = r.pipelineName || a.params.pipelineId;
                const intake = a.params.intakeId;
                return `✓ Assigned intake ${intake} to pipeline: ${pipeline}`;
            },

            [DecisionTypeEnum.CREATE_EVENT]: (a, r) => {
                const title = r.title || a.params.title;
                let timeStr = '';
                if (a.params.startTime) {
                    try {
                        timeStr = ` for ${new Date(a.params.startTime as string).toLocaleString()}`;
                    } catch (e) {
                        // Ignore date parsing errors
                    }
                }
                return `✓ Scheduled "${title}"${timeStr}`;
            },

            [DecisionTypeEnum.UPDATE_EVENT]: (a, r) => {
                return `✓ Updated calendar event: "${r.title || a.params.eventId}"`;
            },

            [DecisionTypeEnum.CANCEL_EVENT]: (a, r) => {
                return `✓ Canceled calendar event: "${r.title || a.params.eventId}"`;
            },

            [DecisionTypeEnum.TRIGGER_AUTOMATION]: (a, r) => {
                const workflow = r.workflowName || a.params.workflowId;
                return `✓ Triggered automation workflow: ${workflow}`;
            },

            [DecisionTypeEnum.ESCALATE]: (a, r) => {
                return `✓ Escalated item (Level ${a.params.level}): ${a.params.reason}`;
            },

            [DecisionTypeEnum.SEARCH_DOCUMENTS]: (a, r) => {
                const count = Array.isArray(r.results) ? r.results.length : 0;
                return `✓ Found ${count} document(s) matching "${a.params.query}"`;
            }
        };

        const formatter = formatters[action.type];
        if (formatter) {
            try {
                return formatter(action, result);
            } catch (error) {
                console.warn('Error formatting action result:', error);
                return `✓ Completed action: ${action.type}`;
            }
        }

        return `✓ Completed action: ${action.type}`;
    }

    /**
     * Format an error that occurred during action execution.
     */
    static formatError(action: AgentAction, error: any): string {
        const errorMsg = error.message || error.toString() || 'Unknown error';
        return `✗ Failed to execute ${action.type}: ${errorMsg}`;
    }

    /**
     * Format a list of results into a cohesive summary block.
     */
    static formatResultsBlock(actions: AgentAction[], results: any[]): string {
        if (!results || results.length === 0) {
            return "No actions were executed or no results returned.";
        }

        const lines = results.map((result, idx) => {
            const action = actions[idx];
            if (!action) return null;

            if (result && result.error) {
                return ResultFormatter.formatError(action, result.error);
            }

            return ResultFormatter.formatActionResult(action, result);
        }).filter(Boolean);

        return lines.join('\n');
    }
}

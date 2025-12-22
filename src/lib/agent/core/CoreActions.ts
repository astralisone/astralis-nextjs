
import { DecisionType } from '../types/agent.types';
import { IntegrationProvider } from '@prisma/client';
import { ActionDefinition } from './ActionRegistry';

/**
 * Core Agent Actions
 * 
 * These are fundamental actions that don't require external integrations
 * (or use internal system integrations).
 */
export const CORE_ACTIONS: ActionDefinition[] = [
    {
        action: DecisionType.ASSIGN_PIPELINE,
        provider: 'INTERNAL' as any,
        description: 'Assign a request or task to a specific pipeline and stage',
        schema: {
            type: 'ASSIGN_PIPELINE',
            params: {
                pipelineId: 'string',
                stageId: 'string | number',
                targetId: 'string (Intake ID or Task ID)',
                priority: 'number (1-3) | null'
            }
        }
    },
    {
        action: DecisionType.CREATE_TASK,
        provider: 'INTERNAL' as any,
        description: 'Create a new task from a template or requirement',
        schema: {
            type: 'CREATE_TASK',
            params: {
                title: 'string',
                description: 'string',
                assignedToId: 'string | null',
                templateId: 'string | null',
                dueDate: 'ISO date string | null'
            }
        }
    },
    {
        action: DecisionType.TRIGGER_AUTOMATION,
        provider: 'INTERNAL' as any,
        description: 'Trigger an active n8n automation workflow',
        schema: {
            type: 'TRIGGER_AUTOMATION',
            params: {
                workflowId: 'string (ID of the active automation to trigger)',
                payload: 'object (data to pass to the workflow)'
            }
        }
    },
    {
        action: DecisionType.SEND_NOTIFICATION,
        provider: 'INTERNAL' as any,
        description: 'Send an in-app or system notification to a user',
        schema: {
            type: 'SEND_NOTIFICATION',
            params: {
                userId: 'string',
                title: 'string',
                message: 'string',
                type: '"INFO" | "WARNING" | "ERROR" | "SUCCESS"',
                actionLink: 'string | null'
            }
        }
    },
    {
        action: DecisionType.ESCALATE,
        provider: 'INTERNAL' as any,
        description: 'Escalate a situation to human review or management',
        schema: {
            type: 'ESCALATE',
            params: {
                reason: 'string',
                priority: 'number (1-3)',
                context: 'object | null'
            }
        }
    },
    {
        action: DecisionType.NO_ACTION,
        provider: 'INTERNAL' as any,
        description: 'No action is required for this input',
        schema: {
            type: 'NO_ACTION',
            params: {}
        }
    },
    {
        action: DecisionType.CREATE_BOOKING,
        provider: 'INTERNAL' as any,
        description: 'Schedule a new meeting/consultation between a guest and a host',
        schema: {
            type: 'CREATE_BOOKING',
            params: {
                hostId: 'string (ID of the team member)',
                guestName: 'string',
                guestEmail: 'string',
                startTime: 'ISO datetime string',
                endTime: 'ISO datetime string',
                title: 'string',
                meetingType: '"VIDEO_CALL" | "PHONE_CALL" | "IN_PERSON"'
            }
        }
    },
    {
        action: DecisionType.GET_INTEGRATIONS_STATUS,
        provider: 'INTERNAL' as any,
        description: 'Check the status and health of all connected third-party integrations (Gmail, Slack, etc.)',
        schema: {
            type: 'GET_INTEGRATIONS_STATUS',
            params: {}
        }
    },
    {
        action: DecisionType.LIST_ACTIVE_AUTOMATIONS,
        provider: 'INTERNAL' as any,
        description: 'List all currently active n8n automation workflows and their triggers',
        schema: {
            type: 'LIST_ACTIVE_AUTOMATIONS',
            params: {}
        }
    },
    {
        action: DecisionType.GET_KANBAN_STATE,
        provider: 'INTERNAL' as any,
        description: 'Get the current state of the Kanban board, including tasks by stage/status',
        schema: {
            type: 'GET_KANBAN_STATE',
            params: {
                status: 'string | null (Filter by status like "todo", "in_progress", "done")',
                limit: 'number (Number of tasks to return, default 50)'
            }
        }
    },
    {
        action: DecisionType.SEARCH_DOCUMENTS,
        provider: 'INTERNAL' as any,
        description: 'Perform a semantic search across internal documentation and uploaded files',
        schema: {
            type: 'SEARCH_DOCUMENTS',
            params: {
                query: 'string (The search query)'
            }
        }
    },
    {
        action: DecisionType.CREATE_INTAKE_ITEM,
        provider: 'INTERNAL' as any,
        description: 'Create a new intake request directly in the system',
        schema: {
            type: 'CREATE_INTAKE_ITEM',
            params: {
                subject: 'string',
                source: 'string',
                content: 'string',
                contactEmail: 'string | null',
                contactName: 'string | null',
                urgency: 'number (1-5)'
            }
        }
    },
    {
        action: DecisionType.UPDATE_KANBAN_ITEM,
        provider: 'INTERNAL' as any,
        description: 'Update an existing task or pipeline item on the Kanban board',
        schema: {
            type: 'UPDATE_KANBAN_ITEM',
            params: {
                taskId: 'string',
                status: 'string | null',
                stageId: 'string | null',
                priority: 'number (1-5) | null',
                assigneeId: 'string | null'
            }
        }
    },
    {
        action: DecisionType.GENERATE_N8N_TEMPLATE,
        provider: 'INTERNAL' as any,
        description: 'Generate a new n8n automation template based on a business goal',
        schema: {
            type: 'GENERATE_N8N_TEMPLATE',
            params: {
                templateName: 'string',
                description: 'string',
                businessGoal: 'string',
                triggerType: 'string',
                steps: 'string[] (Natural language steps for the automation)'
            }
        }
    }
];

export function getCoreActions(): ActionDefinition[] {
    return CORE_ACTIONS;
}

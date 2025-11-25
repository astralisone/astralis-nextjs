/**
 * Base Task Agent Prompt Builder
 *
 * Builds system and user prompts for the Base Task Agent LLM decision-making.
 * This prompt builder creates context-rich prompts that guide the agent to make
 * intelligent decisions about task lifecycle management.
 *
 * @module base-task-agent
 */

import type { TaskInstance, TaskTemplate, AgentDecision } from '@/lib/types/tasks';
import type { TaskEvent } from '@/lib/events/types';
import type { DecisionLogEntry } from '@/lib/types/tasks';

// =============================================================================
// System Prompt
// =============================================================================

/**
 * Build the system prompt for the Base Task Agent.
 * This prompt defines the agent's role and behavior rules.
 *
 * @param template - The task template containing agent configuration
 * @returns System prompt string with template-specific instructions
 */
export function buildSystemPrompt(template: TaskTemplate): string {
  const allowedActionsStr = template.agentConfig.allowedActions.join(', ');
  const completionCriteria = template.agentConfig.completionCriteria;

  return `You are the AstralisOps Base Task Agent.

You manage BUSINESS TASKS represented as JSON. Each task is created from a Task Template and contains:
- metadata (type, category, pipeline, stage, priority, department, staff role),
- a list of steps,
- a timeline with an expected duration,
- status and stage,
- assignment info,
- override flags.

You DO NOT chat with end users. You only decide what the automation system should do next for a task.

## TEMPLATE-SPECIFIC INSTRUCTIONS

**Task Type**: ${template.label} (${template.id})
**Category**: ${template.category}
**Department**: ${template.department}
**Staff Role**: ${template.staffRole}
**Typical Duration**: ${template.typicalMinutes} minutes
**Allowed Actions**: ${allowedActionsStr}

**Completion Criteria**:
- Target Status: ${completionCriteria.status}
${completionCriteria.requiredStepsCompleted ? `- Required Steps: ${completionCriteria.requiredStepsCompleted.join(', ')}` : ''}

## CORE RULES

You must follow these rules:

1. **Think in small, safe steps.** Prefer incremental progress over large changes.

2. **Respect the task template**:
   - Only perform actions listed in template.agentConfig.allowedActions: [${allowedActionsStr}]
   - Drive the task towards completion criteria: status="${completionCriteria.status}"
   - Follow the defined workflow steps

3. **Respect human overrides**:
   - If task.override.overridden is true, DO NOTHING and return a NO_OP action explaining why.

4. **Respect status and stage semantics**:
   - status "DONE" or "CANCELLED" usually means the task is complete. Prefer NO_OP unless something is clearly wrong.
   - status "BLOCKED" requires investigation before taking action.

5. **Use the event**:
   - React only to what changed: e.g. task.created, task.status_changed, task.sla_breached, etc.
   - Don't make the same decision twice for the same event.

6. **Be deterministic and auditable**:
   - Use the existing task data and recent decisions to be consistent.
   - Avoid random behavior. Make decisions that can be explained.
   - Reference previous decisions in your reasoning.

## OUTPUT FORMAT

You must ALWAYS respond with a single JSON object of the form:

{
  "reasoning": "...short explanation referencing the event, task state, and template rules...",
  "actions": [
    { "type": "...", ... }
  ]
}

**NO EXTRA KEYS. NO PROSE OUTSIDE JSON.**

If you want to do nothing, return a single NO_OP action with a clear reason:
{
  "reasoning": "Task is already complete / overridden / etc.",
  "actions": [{ "type": "NO_OP", "reason": "..." }]
}

## AVAILABLE ACTION TYPES

${buildActionTypesReference(template.agentConfig.allowedActions)}

${template.agentConfig.systemPrompt ? `\n## ADDITIONAL TEMPLATE INSTRUCTIONS\n\n${template.agentConfig.systemPrompt}` : ''}`;
}

/**
 * Build a reference guide for available action types
 */
function buildActionTypesReference(allowedActions: string[]): string {
  const allActionTypes: Record<string, string> = {
    SET_STATUS: '{ "type": "SET_STATUS", "toStatus": "NEW" | "IN_PROGRESS" | "NEEDS_REVIEW" | "BLOCKED" | "DONE" | "CANCELLED" }',
    SET_STAGE: '{ "type": "SET_STAGE", "toStageKey": "stage-key-string" }',
    ASSIGN_STAFF: '{ "type": "ASSIGN_STAFF", "strategy": "LEAST_BUSY_IN_ROLE" | "KEEP_EXISTING" | "UNASSIGN", "role"?: "optional-role" }',
    TAG_TASK: '{ "type": "TAG_TASK", "add": ["tag1", "tag2"], "remove"?: ["tag3"] }',
    PING_CUSTOMER: '{ "type": "PING_CUSTOMER", "channel": "EMAIL" | "SMS" | "CHAT", "templateHint": "template-name" }',
    ADD_INTERNAL_NOTE: '{ "type": "ADD_INTERNAL_NOTE", "note": "internal note text" }',
    ESCALATE: '{ "type": "ESCALATE", "reason": "escalation reason", "targetRole"?: "optional-role" }',
    NO_OP: '{ "type": "NO_OP", "reason": "reason for no action" }',
  };

  return allowedActions
    .filter(action => action in allActionTypes)
    .map(action => `- ${action}: ${allActionTypes[action]}`)
    .join('\n');
}

// =============================================================================
// User Prompt
// =============================================================================

/**
 * Build the user prompt for a specific task event.
 * This prompt provides the agent with current task state, event context,
 * and decision history.
 *
 * @param task - The current task instance
 * @param event - The event that triggered this decision cycle
 * @param recentDecisions - Recent decisions for context
 * @returns User prompt string with complete context
 */
export function buildUserPrompt(
  task: TaskInstance,
  event: TaskEvent,
  recentDecisions: Pick<DecisionLogEntry, 'id' | 'decision' | 'appliedAt'>[]
): string {
  return `## CURRENT TASK INSTANCE

\`\`\`json
${JSON.stringify(task, null, 2)}
\`\`\`

## TRIGGERING EVENT

**Event Type**: ${event.name}
**Event ID**: ${event.id}
**Occurred At**: ${event.occurredAt}

\`\`\`json
${JSON.stringify(event.payload, null, 2)}
\`\`\`

## RECENT DECISIONS (Last ${recentDecisions.length})

${buildRecentDecisionsSummary(recentDecisions)}

---

Based on the above information, analyze the event and task state, then decide what should happen NEXT for this task.

Follow the system instructions carefully. Return ONLY a valid AgentDecision JSON object.`;
}

/**
 * Build a human-readable summary of recent decisions
 */
function buildRecentDecisionsSummary(
  recentDecisions: Pick<DecisionLogEntry, 'id' | 'decision' | 'appliedAt'>[]
): string {
  if (recentDecisions.length === 0) {
    return '*No previous decisions for this task*';
  }

  return recentDecisions
    .map((log, idx) => {
      const actionTypes = log.decision.actions.map(a => a.type).join(', ');
      return `${idx + 1}. **Decision ${log.id.slice(0, 8)}** (${new Date(log.appliedAt).toISOString()}):
   - Reasoning: ${log.decision.reasoning}
   - Actions: ${actionTypes}`;
    })
    .join('\n\n');
}

// =============================================================================
// JSON Schema for AgentDecision
// =============================================================================

/**
 * JSON Schema for the expected AgentDecision response.
 * This can be used for LLM structured output or validation.
 */
export const AGENT_DECISION_SCHEMA = {
  type: 'object',
  required: ['reasoning', 'actions'],
  properties: {
    reasoning: {
      type: 'string',
      description: 'Clear explanation of why this decision was made, referencing the event and task state',
    },
    actions: {
      type: 'array',
      description: 'Array of actions to execute',
      items: {
        oneOf: [
          {
            type: 'object',
            required: ['type', 'toStatus'],
            properties: {
              type: { type: 'string', const: 'SET_STATUS' },
              toStatus: { type: 'string', enum: ['NEW', 'IN_PROGRESS', 'NEEDS_REVIEW', 'BLOCKED', 'DONE', 'CANCELLED'] },
            },
          },
          {
            type: 'object',
            required: ['type', 'toStageKey'],
            properties: {
              type: { type: 'string', const: 'SET_STAGE' },
              toStageKey: { type: 'string' },
            },
          },
          {
            type: 'object',
            required: ['type', 'strategy'],
            properties: {
              type: { type: 'string', const: 'ASSIGN_STAFF' },
              strategy: { type: 'string', enum: ['LEAST_BUSY_IN_ROLE', 'KEEP_EXISTING', 'UNASSIGN'] },
              role: { type: 'string' },
            },
          },
          {
            type: 'object',
            required: ['type', 'add'],
            properties: {
              type: { type: 'string', const: 'TAG_TASK' },
              add: { type: 'array', items: { type: 'string' } },
              remove: { type: 'array', items: { type: 'string' } },
            },
          },
          {
            type: 'object',
            required: ['type', 'channel', 'templateHint'],
            properties: {
              type: { type: 'string', const: 'PING_CUSTOMER' },
              channel: { type: 'string', enum: ['EMAIL', 'SMS', 'CHAT'] },
              templateHint: { type: 'string' },
            },
          },
          {
            type: 'object',
            required: ['type', 'note'],
            properties: {
              type: { type: 'string', const: 'ADD_INTERNAL_NOTE' },
              note: { type: 'string' },
            },
          },
          {
            type: 'object',
            required: ['type', 'reason'],
            properties: {
              type: { type: 'string', const: 'ESCALATE' },
              reason: { type: 'string' },
              targetRole: { type: 'string' },
            },
          },
          {
            type: 'object',
            required: ['type', 'reason'],
            properties: {
              type: { type: 'string', const: 'NO_OP' },
              reason: { type: 'string' },
            },
          },
        ],
      },
    },
  },
  additionalProperties: false,
} as const;

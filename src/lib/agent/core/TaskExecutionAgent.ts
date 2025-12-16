import { prisma } from '@/lib/prisma';
import { ActionExecutor } from './ActionExecutor';
import {
    AgentAction,
    DecisionStatus,
    Logger
} from '../types/agent.types';
import { TaskStatus } from '@prisma/client';

/**
 * TaskExecutionAgent
 * 
 * A specialized agent that "wakes up" when a Task is created.
 * If the Task is based on an "Auto-Execute" template, this agent
 * recursively executes the steps defined in the template.
 */
export class TaskExecutionAgent {
    private logger: Logger;
    private actionExecutor: ActionExecutor;

    constructor(logger: Logger) {
        this.logger = logger;
        this.actionExecutor = new ActionExecutor({
            logger: this.logger,
            // We want to stop if a step fails so we don't cascade errors
            stopOnFailure: true
        });
    }

    /**
     * Handle the task:created event
     */
    async handleTaskCreated(taskId: string): Promise<void> {
        this.logger.info('TaskExecutionAgent received task:created', { taskId });

        try {
            // 1. Fetch the Task and its Template Definition
            const task = await prisma.task.findUnique({
                where: { id: taskId },
                include: { template: true }
            });

            if (!task) {
                this.logger.warn('Task not found', { taskId });
                return;
            }

            // 2. Check if it's an Auto-Execute task
            // We look at the 'definition' field which is a JSON object
            const definition = task.template?.definition as any;

            if (!definition?.autoExecute) {
                this.logger.info('Task is not marked for auto-execution', { taskId });
                return;
            }

            const steps = definition.agentSteps as AgentAction[];
            if (!steps || steps.length === 0) {
                this.logger.warn('Task has autoExecute=true but no agentSteps', { taskId });
                return;
            }

            // 3. Mark Task as IN_PROGRESS
            await prisma.task.update({
                where: { id: taskId },
                data: {
                    status: 'IN_PROGRESS',
                    timeline: {
                        ...(task.timeline as object),
                        startedAt: new Date().toISOString()
                    }
                }
            });

            this.logger.info('Starting autonomous execution', {
                taskId,
                stepCount: steps.length
            });

            // 4. Resolve Variables (Context Injection)
            // We inject the Task itself as context so steps can reference {{task.id}}, {{task.sourceId}}
            const contextData = {
                task: task,
                source: task.source,
                // If we had the source entity (e.g. IntakeRequest), we could fetch it here
                // For now, we assume critical data is on the Task
            };

            // 5. Execute Steps
            // We use the ActionExecutor which handles the heavy lifting
            // We pass a correlationId linked to this task
            const outcome = await this.actionExecutor.execute(steps, {
                correlationId: `task-${taskId}`,
                executionId: `exec-task-${taskId}`,
                // Future: Pass context for variable substitution if ActionExecutor supports it
            });

            // 6. Update Task based on Outcome
            if (outcome.status === DecisionStatus.EXECUTED) {
                await prisma.task.update({
                    where: { id: taskId },
                    data: {
                        status: 'COMPLETED',
                        // Store the results in the task for audit
                        data: {
                            ...(task.data as object),
                            executionResults: outcome.results
                        }
                    }
                });
                this.logger.info('Task completed successfully', { taskId });

            } else {
                await prisma.task.update({
                    where: { id: taskId },
                    data: {
                        status: 'FAILED',
                        data: {
                            ...(task.data as object),
                            executionErrors: outcome.errors
                        }
                    }
                });
                this.logger.error('Task execution failed', new Error('Execution finished with errors'), {
                    taskId,
                    errors: outcome.errors
                });
            }

        } catch (error) {
            this.logger.error('Critical error in TaskExecutionAgent', error as Error, { taskId });
            // Fail-safe update
            await prisma.task.update({
                where: { id: taskId },
                data: { status: 'FAILED' }
            }).catch(() => { });
        }
    }
}

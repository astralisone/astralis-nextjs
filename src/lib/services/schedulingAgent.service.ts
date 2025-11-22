/**
 * Scheduling Agent Service
 *
 * Core orchestrator for the SMB Scheduling Task Automation Agent.
 * Handles multi-channel inputs (forms, emails, SMS, API, chat, voice),
 * manages task lifecycle, and coordinates AI classification and scheduling.
 *
 * Reference: docs/phase/AIAGENTS.md
 */

import { prisma } from '@/lib/prisma';
import type {
  AgentTaskSource,
  AgentTaskType,
  AgentTaskStatus,
  SchedulingAgentTask,
  Prisma,
} from '@prisma/client';

/**
 * Input type for creating a new agent task
 */
export interface CreateTaskInput {
  /** User ID who owns this task */
  userId: string;
  /** Optional organization ID */
  orgId?: string;
  /** Source channel of the task (FORM, EMAIL, SMS, API, CHAT, VOICE) */
  source: AgentTaskSource;
  /** Optional reference to original message/form/email ID */
  sourceId?: string;
  /** Original raw input text content */
  rawContent: string;
}

/**
 * Input type for AI classification results
 */
export interface ClassificationInput {
  /** Detected task type */
  taskType: AgentTaskType;
  /** Extracted intent description */
  intent: string;
  /** Extracted entities (date, time, duration, participants, subject, location) */
  entities: Record<string, unknown>;
  /** Priority level 1-5 (5 = highest) */
  priority: number;
  /** AI confidence score 0-1 */
  confidence: number;
  /** Optional full AI response metadata for audit */
  aiMetadata?: Record<string, unknown>;
}

/**
 * Parsed date entity with raw string and parsed Date object
 */
export interface ParsedDate {
  /** Original text that was matched */
  raw: string;
  /** Parsed Date object (null if parsing failed) */
  parsed: Date | null;
}

/**
 * Parsed time entity with raw string and normalized time string
 */
export interface ParsedTime {
  /** Original text that was matched */
  raw: string;
  /** Parsed time in HH:MM 24-hour format (null if parsing failed) */
  parsed: string | null;
}

/**
 * Parsed duration entity with raw string and minutes
 */
export interface ParsedDuration {
  /** Original text that was matched */
  raw: string;
  /** Duration in minutes */
  minutes: number;
}

/**
 * Extracted entities from natural language content
 */
export interface ExtractedEntities {
  /** Parsed date references */
  dates?: ParsedDate[];
  /** Parsed time references */
  times?: ParsedTime[];
  /** Parsed duration references */
  duration?: ParsedDuration[];
  /** Extracted participant emails or names */
  participants?: string[];
  /** Extracted meeting subject/title */
  subject?: string;
  /** Extracted meeting location (physical or virtual) */
  location?: string;
  /** Words indicating priority level */
  priorityIndicators?: string[];
}

/**
 * Result of the AI classification process
 */
export interface ClassificationResult {
  /** Detected task type */
  taskType: AgentTaskType;
  /** Extracted intent description */
  intent: string;
  /** Extracted entities from the content */
  entities: ExtractedEntities;
  /** Priority level 1-5 (5 = highest) */
  priority: number;
  /** Confidence score 0-1 based on classification strength */
  confidence: number;
  /** Time taken to process in milliseconds */
  processingTimeMs: number;
}

/**
 * Intent detection result
 */
export interface IntentDetectionResult {
  /** Extracted intent description */
  intent: string;
  /** Mapped task type */
  taskType: AgentTaskType;
  /** Confidence score 0-1 */
  confidence: number;
}

/**
 * Filter options for listing tasks
 */
export interface TaskFilters {
  /** Filter by user ID */
  userId?: string;
  /** Filter by organization ID */
  orgId?: string;
  /** Filter by task status */
  status?: AgentTaskStatus;
  /** Filter by task type */
  taskType?: AgentTaskType;
  /** Filter by source channel */
  source?: AgentTaskSource;
  /** Filter by priority (1-5) */
  priority?: number;
  /** Maximum number of results to return */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
}

/**
 * Result type for paginated task list
 */
export interface TaskListResult {
  /** Array of tasks matching the filters */
  tasks: SchedulingAgentTask[];
  /** Total count of matching tasks */
  total: number;
}

/**
 * Scheduling Agent Service
 *
 * Orchestrates the SMB Scheduling Task Automation Agent workflow:
 * 1. Task intake from multiple channels
 * 2. AI classification and entity extraction
 * 3. Task status management
 * 4. Integration with SchedulingEvent for calendar operations
 */
class SchedulingAgentService {
  /**
   * Create a new agent task from any input source
   *
   * @param input - Task creation input data
   * @returns Created SchedulingAgentTask
   * @throws Error if user does not exist or creation fails
   *
   * @example
   * ```typescript
   * const task = await schedulingAgentService.createTask({
   *   userId: 'user-123',
   *   source: 'EMAIL',
   *   rawContent: 'Schedule a meeting with John next Tuesday at 3pm'
   * });
   * ```
   */
  async createTask(input: CreateTaskInput): Promise<SchedulingAgentTask> {
    const { userId, orgId, source, sourceId, rawContent } = input;

    // Validate required fields
    if (!userId || typeof userId !== 'string') {
      throw new Error('userId is required and must be a string');
    }
    if (!source) {
      throw new Error('source is required');
    }
    if (!rawContent || typeof rawContent !== 'string') {
      throw new Error('rawContent is required and must be a string');
    }

    try {
      // Verify user exists
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      // If orgId provided, verify it exists
      if (orgId) {
        const org = await prisma.organization.findUnique({
          where: { id: orgId },
          select: { id: true },
        });

        if (!org) {
          throw new Error(`Organization with ID ${orgId} not found`);
        }
      }

      const task = await prisma.schedulingAgentTask.create({
        data: {
          userId,
          orgId: orgId || null,
          source,
          sourceId: sourceId || null,
          rawContent,
          status: 'PENDING',
          taskType: 'UNKNOWN',
          priority: 3,
          confidence: 0,
        },
      });

      console.log(`Created scheduling agent task ${task.id} from ${source} for user ${userId}`);
      return task;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error creating scheduling agent task:', error);
      throw new Error(`Failed to create agent task: ${message}`);
    }
  }

  /**
   * Get a task by its ID
   *
   * @param taskId - The task ID to retrieve
   * @returns SchedulingAgentTask or null if not found
   * @throws Error if database query fails
   *
   * @example
   * ```typescript
   * const task = await schedulingAgentService.getTask('task-123');
   * if (task) {
   *   console.log(task.status);
   * }
   * ```
   */
  async getTask(taskId: string): Promise<SchedulingAgentTask | null> {
    if (!taskId || typeof taskId !== 'string') {
      throw new Error('taskId is required and must be a string');
    }

    try {
      const task = await prisma.schedulingAgentTask.findUnique({
        where: { id: taskId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
          schedulingEvent: true,
        },
      });

      return task;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching scheduling agent task:', error);
      throw new Error(`Failed to fetch agent task: ${message}`);
    }
  }

  /**
   * List tasks with optional filters and pagination
   *
   * @param filters - Optional filter criteria
   * @returns Object containing tasks array and total count
   * @throws Error if database query fails
   *
   * @example
   * ```typescript
   * const { tasks, total } = await schedulingAgentService.listTasks({
   *   userId: 'user-123',
   *   status: 'PENDING',
   *   limit: 10,
   *   offset: 0
   * });
   * ```
   */
  async listTasks(filters: TaskFilters = {}): Promise<TaskListResult> {
    const {
      userId,
      orgId,
      status,
      taskType,
      source,
      priority,
      limit = 50,
      offset = 0,
    } = filters;

    try {
      const where: Prisma.SchedulingAgentTaskWhereInput = {};

      if (userId) {
        where.userId = userId;
      }
      if (orgId) {
        where.orgId = orgId;
      }
      if (status) {
        where.status = status;
      }
      if (taskType) {
        where.taskType = taskType;
      }
      if (source) {
        where.source = source;
      }
      if (priority !== undefined) {
        where.priority = priority;
      }

      const [tasks, total] = await Promise.all([
        prisma.schedulingAgentTask.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
            schedulingEvent: {
              select: {
                id: true,
                title: true,
                startTime: true,
                endTime: true,
                status: true,
              },
            },
          },
          orderBy: [
            { priority: 'desc' },
            { createdAt: 'desc' },
          ],
          take: limit,
          skip: offset,
        }),
        prisma.schedulingAgentTask.count({ where }),
      ]);

      console.log(`Listed ${tasks.length} of ${total} scheduling agent tasks`);
      return { tasks, total };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error listing scheduling agent tasks:', error);
      throw new Error(`Failed to list agent tasks: ${message}`);
    }
  }

  /**
   * Update the status of a task
   *
   * @param taskId - The task ID to update
   * @param status - New status to set
   * @param resolution - Optional resolution description
   * @returns Updated SchedulingAgentTask
   * @throws Error if task not found or update fails
   *
   * @example
   * ```typescript
   * const task = await schedulingAgentService.updateTaskStatus(
   *   'task-123',
   *   'PROCESSING'
   * );
   * ```
   */
  async updateTaskStatus(
    taskId: string,
    status: AgentTaskStatus,
    resolution?: string
  ): Promise<SchedulingAgentTask> {
    if (!taskId || typeof taskId !== 'string') {
      throw new Error('taskId is required and must be a string');
    }
    if (!status) {
      throw new Error('status is required');
    }

    try {
      // Verify task exists
      const existing = await prisma.schedulingAgentTask.findUnique({
        where: { id: taskId },
        select: { id: true },
      });

      if (!existing) {
        throw new Error(`Task with ID ${taskId} not found`);
      }

      const updateData: Prisma.SchedulingAgentTaskUpdateInput = {
        status,
      };

      if (resolution !== undefined) {
        updateData.resolution = resolution;
      }

      // Set completedAt when task reaches a terminal state
      if (status === 'COMPLETED' || status === 'CANCELLED') {
        updateData.completedAt = new Date();
      }

      const task = await prisma.schedulingAgentTask.update({
        where: { id: taskId },
        data: updateData,
      });

      console.log(`Updated scheduling agent task ${taskId} status to ${status}`);
      return task;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error updating scheduling agent task status:', error);
      throw new Error(`Failed to update task status: ${message}`);
    }
  }

  /**
   * Mark a task as failed with an error message
   *
   * @param taskId - The task ID to mark as failed
   * @param errorMessage - Description of the failure
   * @returns Updated SchedulingAgentTask
   * @throws Error if task not found or update fails
   *
   * @example
   * ```typescript
   * const task = await schedulingAgentService.failTask(
   *   'task-123',
   *   'Failed to parse date from input'
   * );
   * ```
   */
  async failTask(taskId: string, errorMessage: string): Promise<SchedulingAgentTask> {
    if (!taskId || typeof taskId !== 'string') {
      throw new Error('taskId is required and must be a string');
    }
    if (!errorMessage || typeof errorMessage !== 'string') {
      throw new Error('errorMessage is required and must be a string');
    }

    try {
      // Verify task exists
      const existing = await prisma.schedulingAgentTask.findUnique({
        where: { id: taskId },
        select: { id: true, retryCount: true },
      });

      if (!existing) {
        throw new Error(`Task with ID ${taskId} not found`);
      }

      const task = await prisma.schedulingAgentTask.update({
        where: { id: taskId },
        data: {
          status: 'FAILED',
          errorMessage,
          completedAt: new Date(),
          retryCount: existing.retryCount + 1,
        },
      });

      console.log(`Marked scheduling agent task ${taskId} as FAILED: ${errorMessage}`);
      return task;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error failing scheduling agent task:', error);
      throw new Error(`Failed to mark task as failed: ${message}`);
    }
  }

  /**
   * Mark a task as completed with a resolution message
   *
   * @param taskId - The task ID to complete
   * @param resolution - Description of how the task was resolved
   * @returns Updated SchedulingAgentTask
   * @throws Error if task not found or update fails
   *
   * @example
   * ```typescript
   * const task = await schedulingAgentService.completeTask(
   *   'task-123',
   *   'Meeting scheduled for 2024-01-15 at 3:00 PM'
   * );
   * ```
   */
  async completeTask(taskId: string, resolution: string): Promise<SchedulingAgentTask> {
    if (!taskId || typeof taskId !== 'string') {
      throw new Error('taskId is required and must be a string');
    }
    if (!resolution || typeof resolution !== 'string') {
      throw new Error('resolution is required and must be a string');
    }

    try {
      // Verify task exists
      const existing = await prisma.schedulingAgentTask.findUnique({
        where: { id: taskId },
        select: { id: true },
      });

      if (!existing) {
        throw new Error(`Task with ID ${taskId} not found`);
      }

      const task = await prisma.schedulingAgentTask.update({
        where: { id: taskId },
        data: {
          status: 'COMPLETED',
          resolution,
          completedAt: new Date(),
        },
      });

      console.log(`Completed scheduling agent task ${taskId}: ${resolution}`);
      return task;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error completing scheduling agent task:', error);
      throw new Error(`Failed to complete task: ${message}`);
    }
  }

  /**
   * Update AI classification results for a task
   *
   * @param taskId - The task ID to update
   * @param classification - AI classification results
   * @returns Updated SchedulingAgentTask
   * @throws Error if task not found or update fails
   *
   * @example
   * ```typescript
   * const task = await schedulingAgentService.updateClassification('task-123', {
   *   taskType: 'SCHEDULE_MEETING',
   *   intent: 'User wants to schedule a meeting with John',
   *   entities: {
   *     date: '2024-01-15',
   *     time: '15:00',
   *     participants: ['john@example.com'],
   *     duration: 60
   *   },
   *   priority: 3,
   *   confidence: 0.95,
   *   aiMetadata: { model: 'gpt-4', tokens: 150 }
   * });
   * ```
   */
  async updateClassification(
    taskId: string,
    classification: ClassificationInput
  ): Promise<SchedulingAgentTask> {
    if (!taskId || typeof taskId !== 'string') {
      throw new Error('taskId is required and must be a string');
    }
    if (!classification) {
      throw new Error('classification is required');
    }

    const { taskType, intent, entities, priority, confidence, aiMetadata } = classification;

    // Validate classification fields
    if (!taskType) {
      throw new Error('classification.taskType is required');
    }
    if (!intent || typeof intent !== 'string') {
      throw new Error('classification.intent is required and must be a string');
    }
    if (typeof priority !== 'number' || priority < 1 || priority > 5) {
      throw new Error('classification.priority must be a number between 1 and 5');
    }
    if (typeof confidence !== 'number' || confidence < 0 || confidence > 1) {
      throw new Error('classification.confidence must be a number between 0 and 1');
    }

    try {
      // Verify task exists
      const existing = await prisma.schedulingAgentTask.findUnique({
        where: { id: taskId },
        select: { id: true },
      });

      if (!existing) {
        throw new Error(`Task with ID ${taskId} not found`);
      }

      const task = await prisma.schedulingAgentTask.update({
        where: { id: taskId },
        data: {
          taskType,
          intent,
          entities: entities as Prisma.InputJsonValue,
          priority,
          confidence,
          aiMetadata: aiMetadata as Prisma.InputJsonValue | undefined,
          processedAt: new Date(),
          status: 'PROCESSING',
        },
      });

      console.log(
        `Updated classification for task ${taskId}: type=${taskType}, priority=${priority}, confidence=${confidence}`
      );
      return task;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error updating task classification:', error);
      throw new Error(`Failed to update classification: ${message}`);
    }
  }

  /**
   * Link a task to a scheduling event
   *
   * @param taskId - The task ID to link
   * @param schedulingEventId - The scheduling event ID to link to
   * @returns Updated SchedulingAgentTask
   * @throws Error if task or event not found, or update fails
   *
   * @example
   * ```typescript
   * const task = await schedulingAgentService.linkToSchedulingEvent(
   *   'task-123',
   *   'event-456'
   * );
   * ```
   */
  async linkToSchedulingEvent(
    taskId: string,
    schedulingEventId: string
  ): Promise<SchedulingAgentTask> {
    if (!taskId || typeof taskId !== 'string') {
      throw new Error('taskId is required and must be a string');
    }
    if (!schedulingEventId || typeof schedulingEventId !== 'string') {
      throw new Error('schedulingEventId is required and must be a string');
    }

    try {
      // Verify task exists
      const existingTask = await prisma.schedulingAgentTask.findUnique({
        where: { id: taskId },
        select: { id: true },
      });

      if (!existingTask) {
        throw new Error(`Task with ID ${taskId} not found`);
      }

      // Verify scheduling event exists
      const existingEvent = await prisma.schedulingEvent.findUnique({
        where: { id: schedulingEventId },
        select: { id: true },
      });

      if (!existingEvent) {
        throw new Error(`Scheduling event with ID ${schedulingEventId} not found`);
      }

      const task = await prisma.schedulingAgentTask.update({
        where: { id: taskId },
        data: {
          schedulingEventId,
          status: 'SCHEDULED',
        },
        include: {
          schedulingEvent: true,
        },
      });

      console.log(`Linked task ${taskId} to scheduling event ${schedulingEventId}`);
      return task;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error linking task to scheduling event:', error);
      throw new Error(`Failed to link task to event: ${message}`);
    }
  }

  /**
   * Get pending tasks ready for AI processing
   *
   * @param limit - Maximum number of tasks to return (default: 10)
   * @returns Array of pending SchedulingAgentTasks ordered by priority and creation time
   * @throws Error if database query fails
   *
   * @example
   * ```typescript
   * const pendingTasks = await schedulingAgentService.getPendingTasks(5);
   * for (const task of pendingTasks) {
   *   await processTask(task);
   * }
   * ```
   */
  async getPendingTasks(limit: number = 10): Promise<SchedulingAgentTask[]> {
    if (typeof limit !== 'number' || limit < 1) {
      throw new Error('limit must be a positive number');
    }

    try {
      const tasks = await prisma.schedulingAgentTask.findMany({
        where: {
          status: 'PENDING',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' },
        ],
        take: limit,
      });

      console.log(`Retrieved ${tasks.length} pending scheduling agent tasks`);
      return tasks;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching pending tasks:', error);
      throw new Error(`Failed to get pending tasks: ${message}`);
    }
  }

  /**
   * Delete a task by ID
   *
   * @param taskId - The task ID to delete
   * @throws Error if task not found or deletion fails
   *
   * @example
   * ```typescript
   * await schedulingAgentService.deleteTask('task-123');
   * ```
   */
  async deleteTask(taskId: string): Promise<void> {
    if (!taskId || typeof taskId !== 'string') {
      throw new Error('taskId is required and must be a string');
    }

    try {
      // Verify task exists
      const existing = await prisma.schedulingAgentTask.findUnique({
        where: { id: taskId },
        select: { id: true },
      });

      if (!existing) {
        throw new Error(`Task with ID ${taskId} not found`);
      }

      await prisma.schedulingAgentTask.delete({
        where: { id: taskId },
      });

      console.log(`Deleted scheduling agent task ${taskId}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error deleting scheduling agent task:', error);
      throw new Error(`Failed to delete task: ${message}`);
    }
  }

  /**
   * Get tasks awaiting user input
   *
   * @param userId - User ID to filter by
   * @param limit - Maximum number of tasks to return (default: 10)
   * @returns Array of tasks with AWAITING_INPUT status
   * @throws Error if database query fails
   *
   * @example
   * ```typescript
   * const awaitingTasks = await schedulingAgentService.getTasksAwaitingInput('user-123');
   * ```
   */
  async getTasksAwaitingInput(
    userId: string,
    limit: number = 10
  ): Promise<SchedulingAgentTask[]> {
    if (!userId || typeof userId !== 'string') {
      throw new Error('userId is required and must be a string');
    }

    try {
      const tasks = await prisma.schedulingAgentTask.findMany({
        where: {
          userId,
          status: 'AWAITING_INPUT',
        },
        include: {
          schedulingEvent: {
            select: {
              id: true,
              title: true,
              startTime: true,
              endTime: true,
            },
          },
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
        take: limit,
      });

      console.log(`Retrieved ${tasks.length} tasks awaiting input for user ${userId}`);
      return tasks;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching tasks awaiting input:', error);
      throw new Error(`Failed to get tasks awaiting input: ${message}`);
    }
  }

  /**
   * Update proposed time slots for a scheduling task
   *
   * @param taskId - The task ID to update
   * @param proposedSlots - Array of proposed time slots
   * @returns Updated SchedulingAgentTask
   * @throws Error if task not found or update fails
   *
   * @example
   * ```typescript
   * const task = await schedulingAgentService.updateProposedSlots('task-123', [
   *   { startTime: '2024-01-15T15:00:00Z', endTime: '2024-01-15T16:00:00Z', score: 0.9 },
   *   { startTime: '2024-01-15T16:00:00Z', endTime: '2024-01-15T17:00:00Z', score: 0.8 }
   * ]);
   * ```
   */
  async updateProposedSlots(
    taskId: string,
    proposedSlots: Array<{
      startTime: string | Date;
      endTime: string | Date;
      score?: number;
    }>
  ): Promise<SchedulingAgentTask> {
    if (!taskId || typeof taskId !== 'string') {
      throw new Error('taskId is required and must be a string');
    }
    if (!Array.isArray(proposedSlots)) {
      throw new Error('proposedSlots must be an array');
    }

    try {
      // Verify task exists
      const existing = await prisma.schedulingAgentTask.findUnique({
        where: { id: taskId },
        select: { id: true },
      });

      if (!existing) {
        throw new Error(`Task with ID ${taskId} not found`);
      }

      const task = await prisma.schedulingAgentTask.update({
        where: { id: taskId },
        data: {
          proposedSlots: proposedSlots as Prisma.InputJsonValue,
          status: 'AWAITING_INPUT',
        },
      });

      console.log(`Updated proposed slots for task ${taskId} with ${proposedSlots.length} options`);
      return task;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error updating proposed slots:', error);
      throw new Error(`Failed to update proposed slots: ${message}`);
    }
  }

  /**
   * Select a time slot for a scheduling task
   *
   * @param taskId - The task ID to update
   * @param selectedSlot - The selected time slot
   * @returns Updated SchedulingAgentTask
   * @throws Error if task not found or update fails
   *
   * @example
   * ```typescript
   * const task = await schedulingAgentService.selectSlot('task-123', {
   *   startTime: '2024-01-15T15:00:00Z',
   *   endTime: '2024-01-15T16:00:00Z'
   * });
   * ```
   */
  async selectSlot(
    taskId: string,
    selectedSlot: {
      startTime: string | Date;
      endTime: string | Date;
    }
  ): Promise<SchedulingAgentTask> {
    if (!taskId || typeof taskId !== 'string') {
      throw new Error('taskId is required and must be a string');
    }
    if (!selectedSlot || !selectedSlot.startTime || !selectedSlot.endTime) {
      throw new Error('selectedSlot with startTime and endTime is required');
    }

    try {
      // Verify task exists
      const existing = await prisma.schedulingAgentTask.findUnique({
        where: { id: taskId },
        select: { id: true },
      });

      if (!existing) {
        throw new Error(`Task with ID ${taskId} not found`);
      }

      const task = await prisma.schedulingAgentTask.update({
        where: { id: taskId },
        data: {
          selectedSlot: selectedSlot as Prisma.InputJsonValue,
          status: 'PROCESSING',
        },
      });

      console.log(`Selected slot for task ${taskId}`);
      return task;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error selecting slot:', error);
      throw new Error(`Failed to select slot: ${message}`);
    }
  }

  /**
   * Record processing time for a task
   *
   * @param taskId - The task ID to update
   * @param processingTimeMs - Processing time in milliseconds
   * @returns Updated SchedulingAgentTask
   * @throws Error if task not found or update fails
   */
  async recordProcessingTime(
    taskId: string,
    processingTimeMs: number
  ): Promise<SchedulingAgentTask> {
    if (!taskId || typeof taskId !== 'string') {
      throw new Error('taskId is required and must be a string');
    }
    if (typeof processingTimeMs !== 'number' || processingTimeMs < 0) {
      throw new Error('processingTimeMs must be a non-negative number');
    }

    try {
      const task = await prisma.schedulingAgentTask.update({
        where: { id: taskId },
        data: {
          processingTime: processingTimeMs,
        },
      });

      console.log(`Recorded processing time ${processingTimeMs}ms for task ${taskId}`);
      return task;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error recording processing time:', error);
      throw new Error(`Failed to record processing time: ${message}`);
    }
  }

  // ============================================================================
  // AI CLASSIFICATION ENGINE - Phase 2
  // ============================================================================

  /**
   * Main classification method that orchestrates intent detection, entity extraction,
   * and priority scoring for a task.
   *
   * @param taskId - The task ID to classify
   * @returns Full classification result including taskType, entities, priority, and confidence
   * @throws Error if task not found or classification fails
   *
   * @example
   * ```typescript
   * const result = await schedulingAgentService.classifyTask('task-123');
   * console.log(result.taskType); // 'SCHEDULE_MEETING'
   * console.log(result.entities.dates); // [{ raw: 'tomorrow', parsed: Date }]
   * console.log(result.priority); // 4
   * ```
   */
  async classifyTask(taskId: string): Promise<ClassificationResult> {
    const startTime = Date.now();

    if (!taskId || typeof taskId !== 'string') {
      throw new Error('taskId is required and must be a string');
    }

    try {
      // Fetch the task to get the raw content
      const task = await prisma.schedulingAgentTask.findUnique({
        where: { id: taskId },
        select: { id: true, rawContent: true },
      });

      if (!task) {
        throw new Error(`Task with ID ${taskId} not found`);
      }

      const content = task.rawContent;

      // Step 1: Detect intent and map to task type
      const intentResult = await this.detectIntent(content);

      // Step 2: Extract entities from content
      const entities = await this.extractEntities(content);

      // Step 3: Calculate priority based on content and entities
      const priority = this.calculatePriority(content, entities);

      const processingTimeMs = Date.now() - startTime;

      // Build the classification result
      const result: ClassificationResult = {
        taskType: intentResult.taskType,
        intent: intentResult.intent,
        entities,
        priority,
        confidence: intentResult.confidence,
        processingTimeMs,
      };

      // Persist the classification results
      await this.updateClassification(taskId, {
        taskType: result.taskType,
        intent: result.intent,
        entities: entities as Record<string, unknown>,
        priority: result.priority,
        confidence: result.confidence,
        aiMetadata: {
          processingTimeMs: result.processingTimeMs,
          classifiedAt: new Date().toISOString(),
          version: '1.0.0',
        },
      });

      // Also record the processing time
      await this.recordProcessingTime(taskId, processingTimeMs);

      console.log(
        `Classified task ${taskId}: type=${result.taskType}, priority=${result.priority}, ` +
        `confidence=${result.confidence.toFixed(2)}, processingTime=${processingTimeMs}ms`
      );

      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error classifying task ${taskId}:`, error);
      throw new Error(`Failed to classify task: ${message}`);
    }
  }

  /**
   * Parse the raw content to detect user intent and map to AgentTaskType.
   *
   * Intent mapping:
   * - "schedule", "book", "set up meeting", "arrange" -> SCHEDULE_MEETING
   * - "reschedule", "move", "change time", "postpone" -> RESCHEDULE_MEETING
   * - "cancel", "remove", "delete meeting" -> CANCEL_MEETING
   * - "available", "free", "when can", "openings" -> CHECK_AVAILABILITY
   * - "task", "todo", "remind me", "don't forget" -> CREATE_TASK
   * - "update", "modify", "edit task" -> UPDATE_TASK
   * - "what", "how", "who", "when" (questions) -> INQUIRY
   *
   * @param content - The raw text content to analyze
   * @returns Intent detection result with taskType and confidence
   *
   * @example
   * ```typescript
   * const result = await schedulingAgentService.detectIntent(
   *   'Schedule a meeting with John next Tuesday at 3pm'
   * );
   * console.log(result.taskType); // 'SCHEDULE_MEETING'
   * console.log(result.confidence); // 0.9
   * ```
   */
  async detectIntent(content: string): Promise<IntentDetectionResult> {
    if (!content || typeof content !== 'string') {
      throw new Error('content is required and must be a string');
    }

    const normalizedContent = content.toLowerCase().trim();

    // Define intent patterns with their corresponding task types and weights
    const intentPatterns: Array<{
      patterns: RegExp[];
      taskType: AgentTaskType;
      intentDescription: string;
      weight: number;
    }> = [
      // CANCEL_MEETING - Check first as it's more specific
      {
        patterns: [
          /\b(cancel|remove|delete)\s+(meeting|appointment|event|call)/i,
          /\b(cancel|remove|delete)\s+(the|my|our)?\s*(meeting|appointment|event|call)/i,
          /\bcancell?ing\s+(the|my|our)?\s*(meeting|appointment|event)/i,
        ],
        taskType: 'CANCEL_MEETING',
        intentDescription: 'User wants to cancel an existing meeting or appointment',
        weight: 0.95,
      },
      // RESCHEDULE_MEETING - Check before SCHEDULE to catch rescheduling
      {
        patterns: [
          /\b(reschedule|re-schedule|move|postpone|push\s+back|change\s+(the\s+)?time)/i,
          /\bchange\s+(the|my|our)?\s*(meeting|appointment|event)\s*(time|date)?/i,
          /\bmove\s+(the|my|our)?\s*(meeting|appointment|event)/i,
        ],
        taskType: 'RESCHEDULE_MEETING',
        intentDescription: 'User wants to reschedule or move an existing meeting',
        weight: 0.9,
      },
      // SCHEDULE_MEETING
      {
        patterns: [
          /\b(schedule|book|set\s+up|arrange|plan|organize)\s+(a|an|the|my|our)?\s*(meeting|appointment|call|session|event)/i,
          /\b(schedule|book|set\s+up|arrange)\b/i,
          /\blet'?s\s+(meet|schedule|set\s+up)/i,
          /\bmeet(ing)?\s+with\b/i,
          /\bset\s+up\s+(a|an)?\s*(call|meeting|appointment)/i,
          /\bcan\s+(we|you)\s+(meet|schedule|set\s+up)/i,
        ],
        taskType: 'SCHEDULE_MEETING',
        intentDescription: 'User wants to schedule a new meeting or appointment',
        weight: 0.85,
      },
      // CHECK_AVAILABILITY
      {
        patterns: [
          /\b(available|free|openings?|availability)/i,
          /\bwhen\s+(can|are)\s+(you|we|they)\s+(free|available|meet)/i,
          /\bcheck\s+(my|your|their|the)?\s*availability/i,
          /\bwhat\s+(times?|slots?)\s+(are|is)\s+(available|open|free)/i,
          /\bfind\s+(a|some)?\s*(free|available|open)\s*(time|slot)/i,
        ],
        taskType: 'CHECK_AVAILABILITY',
        intentDescription: 'User wants to check availability or find open time slots',
        weight: 0.85,
      },
      // UPDATE_TASK - Check before CREATE_TASK
      {
        patterns: [
          /\b(update|modify|edit|change)\s+(the|my|a|this)?\s*(task|todo|reminder|to-do)/i,
          /\b(update|modify|edit)\s+(the|my)?\s*(due\s+date|deadline|priority)/i,
          /\bmark\s+(as|the|this)?\s*(complete|done|finished)/i,
        ],
        taskType: 'UPDATE_TASK',
        intentDescription: 'User wants to update or modify an existing task',
        weight: 0.85,
      },
      // CREATE_TASK
      {
        patterns: [
          /\b(task|todo|to-do|reminder|to\s+do)\b/i,
          /\b(remind\s+me|don'?t\s+forget|remember\s+to)/i,
          /\b(add|create|make)\s+(a|an)?\s*(task|todo|reminder|to-do)/i,
          /\bneed\s+to\b/i,
          /\bhave\s+to\b/i,
        ],
        taskType: 'CREATE_TASK',
        intentDescription: 'User wants to create a new task or reminder',
        weight: 0.75,
      },
      // INQUIRY - Questions and general inquiries
      {
        patterns: [
          /^(what|how|who|when|where|why|which)\b/i,
          /\?$/,
          /\b(tell\s+me|explain|describe|show\s+me)\b/i,
          /\b(do\s+(you|we)|can\s+(you|we)|will\s+(you|we))\b.*\?/i,
        ],
        taskType: 'INQUIRY',
        intentDescription: 'User is asking a question or making an inquiry',
        weight: 0.7,
      },
    ];

    // Find the best matching intent
    let bestMatch: {
      taskType: AgentTaskType;
      intent: string;
      confidence: number;
      matchCount: number;
    } = {
      taskType: 'UNKNOWN',
      intent: 'Unable to determine user intent from the provided content',
      confidence: 0,
      matchCount: 0,
    };

    for (const intentPattern of intentPatterns) {
      let matchCount = 0;

      for (const pattern of intentPattern.patterns) {
        if (pattern.test(normalizedContent)) {
          matchCount++;
        }
      }

      if (matchCount > 0) {
        // Calculate confidence based on match count and weight
        const confidence = Math.min(
          intentPattern.weight + (matchCount - 1) * 0.05,
          1.0
        );

        // Use this match if it has higher confidence or more pattern matches
        if (
          confidence > bestMatch.confidence ||
          (confidence === bestMatch.confidence && matchCount > bestMatch.matchCount)
        ) {
          bestMatch = {
            taskType: intentPattern.taskType,
            intent: intentPattern.intentDescription,
            confidence,
            matchCount,
          };
        }
      }
    }

    console.log(
      `Detected intent for content: taskType=${bestMatch.taskType}, ` +
      `confidence=${bestMatch.confidence.toFixed(2)}, matches=${bestMatch.matchCount}`
    );

    return {
      intent: bestMatch.intent,
      taskType: bestMatch.taskType,
      confidence: bestMatch.confidence,
    };
  }

  /**
   * Extract entities from content using pattern matching (regex-based).
   *
   * Extracts:
   * - dates: "tomorrow", "next Tuesday", "Dec 15", "12/15/2024", relative dates
   * - times: "3pm", "15:00", "at 3", "morning", "afternoon", "evening"
   * - duration: "30 minutes", "1 hour", "2 hrs", "half hour"
   * - participants: email addresses, "with John", "invite team"
   * - subject: text after "about", "regarding", "for", "re:"
   * - location: "at office", "via zoom", "in conference room", URLs
   * - priority indicators: "urgent", "ASAP", "when you can", "no rush"
   *
   * @param content - The raw text content to analyze
   * @returns Extracted entities object
   *
   * @example
   * ```typescript
   * const entities = await schedulingAgentService.extractEntities(
   *   'Schedule a 30-minute meeting with john@example.com tomorrow at 3pm about Q4 planning'
   * );
   * console.log(entities.dates); // [{ raw: 'tomorrow', parsed: Date }]
   * console.log(entities.times); // [{ raw: '3pm', parsed: '15:00' }]
   * console.log(entities.duration); // [{ raw: '30-minute', minutes: 30 }]
   * ```
   */
  async extractEntities(content: string): Promise<ExtractedEntities> {
    if (!content || typeof content !== 'string') {
      throw new Error('content is required and must be a string');
    }

    const entities: ExtractedEntities = {};

    // Extract dates
    entities.dates = this.extractDates(content);

    // Extract times
    entities.times = this.extractTimes(content);

    // Extract duration
    entities.duration = this.extractDuration(content);

    // Extract participants
    entities.participants = this.extractParticipants(content);

    // Extract subject
    entities.subject = this.extractSubject(content);

    // Extract location
    entities.location = this.extractLocation(content);

    // Extract priority indicators
    entities.priorityIndicators = this.extractPriorityIndicators(content);

    // Clean up empty arrays/undefined values
    const cleanedEntities: ExtractedEntities = {};
    if (entities.dates && entities.dates.length > 0) cleanedEntities.dates = entities.dates;
    if (entities.times && entities.times.length > 0) cleanedEntities.times = entities.times;
    if (entities.duration && entities.duration.length > 0) cleanedEntities.duration = entities.duration;
    if (entities.participants && entities.participants.length > 0) cleanedEntities.participants = entities.participants;
    if (entities.subject) cleanedEntities.subject = entities.subject;
    if (entities.location) cleanedEntities.location = entities.location;
    if (entities.priorityIndicators && entities.priorityIndicators.length > 0) {
      cleanedEntities.priorityIndicators = entities.priorityIndicators;
    }

    console.log(`Extracted entities: ${JSON.stringify(cleanedEntities)}`);
    return cleanedEntities;
  }

  /**
   * Extract date references from content
   * @private
   */
  private extractDates(content: string): ParsedDate[] {
    const dates: ParsedDate[] = [];
    const now = new Date();

    // Relative date patterns
    const relativeDates: Array<{ pattern: RegExp; getDate: () => Date }> = [
      {
        pattern: /\btoday\b/i,
        getDate: () => now,
      },
      {
        pattern: /\btomorrow\b/i,
        getDate: () => {
          const d = new Date(now);
          d.setDate(d.getDate() + 1);
          return d;
        },
      },
      {
        pattern: /\bday\s+after\s+tomorrow\b/i,
        getDate: () => {
          const d = new Date(now);
          d.setDate(d.getDate() + 2);
          return d;
        },
      },
      {
        pattern: /\byesterday\b/i,
        getDate: () => {
          const d = new Date(now);
          d.setDate(d.getDate() - 1);
          return d;
        },
      },
      {
        pattern: /\bnext\s+week\b/i,
        getDate: () => {
          const d = new Date(now);
          d.setDate(d.getDate() + 7);
          return d;
        },
      },
      {
        pattern: /\bthis\s+week\b/i,
        getDate: () => now,
      },
    ];

    for (const { pattern, getDate } of relativeDates) {
      const match = content.match(pattern);
      if (match) {
        dates.push({ raw: match[0], parsed: getDate() });
      }
    }

    // Day of week patterns (e.g., "next Tuesday", "this Monday")
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayPattern = /\b(next|this|coming)?\s*(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/gi;
    let dayMatch;
    while ((dayMatch = dayPattern.exec(content)) !== null) {
      const modifier = (dayMatch[1] || '').toLowerCase();
      const dayName = dayMatch[2].toLowerCase();
      const targetDay = daysOfWeek.indexOf(dayName);
      const currentDay = now.getDay();

      let daysToAdd = targetDay - currentDay;
      if (daysToAdd <= 0 || modifier === 'next') {
        daysToAdd += 7;
      }
      if (modifier === 'this' && daysToAdd > 7) {
        daysToAdd -= 7;
      }

      const d = new Date(now);
      d.setDate(d.getDate() + daysToAdd);
      dates.push({ raw: dayMatch[0], parsed: d });
    }

    // Absolute date patterns (MM/DD/YYYY, MM-DD-YYYY, YYYY-MM-DD)
    const absoluteDatePatterns = [
      /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/g, // MM/DD/YYYY or MM-DD-YYYY
      /\b(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\b/g, // YYYY-MM-DD
    ];

    for (const pattern of absoluteDatePatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        let year: number, month: number, day: number;
        if (match[1].length === 4) {
          // YYYY-MM-DD
          year = parseInt(match[1], 10);
          month = parseInt(match[2], 10) - 1;
          day = parseInt(match[3], 10);
        } else {
          // MM/DD/YYYY
          month = parseInt(match[1], 10) - 1;
          day = parseInt(match[2], 10);
          year = parseInt(match[3], 10);
        }
        const d = new Date(year, month, day);
        if (!isNaN(d.getTime())) {
          dates.push({ raw: match[0], parsed: d });
        }
      }
    }

    // Month name patterns (e.g., "Dec 15", "December 15", "15 Dec", "15th December")
    const monthNames = [
      'jan(?:uary)?', 'feb(?:ruary)?', 'mar(?:ch)?', 'apr(?:il)?',
      'may', 'jun(?:e)?', 'jul(?:y)?', 'aug(?:ust)?',
      'sep(?:t(?:ember)?)?', 'oct(?:ober)?', 'nov(?:ember)?', 'dec(?:ember)?'
    ];
    const monthPattern = new RegExp(
      `\\b(${monthNames.join('|')})\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s+(\\d{4}))?\\b|` +
      `\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(${monthNames.join('|')})(?:,?\\s+(\\d{4}))?\\b`,
      'gi'
    );

    let monthMatch;
    while ((monthMatch = monthPattern.exec(content)) !== null) {
      let monthStr: string, dayStr: string, yearStr: string | undefined;
      if (monthMatch[1]) {
        // "Dec 15" format
        monthStr = monthMatch[1];
        dayStr = monthMatch[2];
        yearStr = monthMatch[3];
      } else {
        // "15 Dec" format
        dayStr = monthMatch[4];
        monthStr = monthMatch[5];
        yearStr = monthMatch[6];
      }

      const monthIndex = monthNames.findIndex(m =>
        new RegExp(`^${m}$`, 'i').test(monthStr)
      );
      if (monthIndex !== -1) {
        const year = yearStr ? parseInt(yearStr, 10) : now.getFullYear();
        const d = new Date(year, monthIndex, parseInt(dayStr, 10));
        if (!isNaN(d.getTime())) {
          dates.push({ raw: monthMatch[0], parsed: d });
        }
      }
    }

    // "in X days/weeks" patterns
    const inDaysPattern = /\bin\s+(\d+)\s+(day|days|week|weeks)\b/gi;
    let inDaysMatch;
    while ((inDaysMatch = inDaysPattern.exec(content)) !== null) {
      const amount = parseInt(inDaysMatch[1], 10);
      const unit = inDaysMatch[2].toLowerCase();
      const d = new Date(now);
      if (unit.startsWith('week')) {
        d.setDate(d.getDate() + amount * 7);
      } else {
        d.setDate(d.getDate() + amount);
      }
      dates.push({ raw: inDaysMatch[0], parsed: d });
    }

    return dates;
  }

  /**
   * Extract time references from content
   * @private
   */
  private extractTimes(content: string): ParsedTime[] {
    const times: ParsedTime[] = [];

    // Time patterns: "3pm", "3:30pm", "15:00", "3:30 PM"
    const timePatterns = [
      /\b(\d{1,2}):(\d{2})\s*(am|pm|a\.m\.|p\.m\.)\b/gi, // 3:30pm
      /\b(\d{1,2})\s*(am|pm|a\.m\.|p\.m\.)\b/gi, // 3pm
      /\b(\d{1,2}):(\d{2})\b(?!\s*(am|pm|a\.m\.|p\.m\.))/gi, // 15:00 (24-hour)
      /\bat\s+(\d{1,2})(?::(\d{2}))?\b/gi, // "at 3" or "at 3:30"
    ];

    // Time of day words
    const timeOfDay: Array<{ pattern: RegExp; time: string }> = [
      { pattern: /\b(early\s+)?morning\b/i, time: '09:00' },
      { pattern: /\bmid[\s-]?morning\b/i, time: '10:30' },
      { pattern: /\b(around\s+)?noon\b/i, time: '12:00' },
      { pattern: /\bmidday\b/i, time: '12:00' },
      { pattern: /\b(early\s+)?afternoon\b/i, time: '14:00' },
      { pattern: /\blate\s+afternoon\b/i, time: '16:00' },
      { pattern: /\b(early\s+)?evening\b/i, time: '18:00' },
      { pattern: /\bend\s+of\s+(the\s+)?day\b/i, time: '17:00' },
      { pattern: /\beod\b/i, time: '17:00' },
    ];

    for (const { pattern, time } of timeOfDay) {
      const match = content.match(pattern);
      if (match) {
        times.push({ raw: match[0], parsed: time });
      }
    }

    // Process specific time patterns
    // Pattern: HH:MM AM/PM
    let match;
    const pattern1 = /\b(\d{1,2}):(\d{2})\s*(am|pm|a\.m\.|p\.m\.)\b/gi;
    while ((match = pattern1.exec(content)) !== null) {
      let hours = parseInt(match[1], 10);
      const minutes = match[2];
      const meridiem = match[3].toLowerCase().replace(/\./g, '');

      if (meridiem === 'pm' && hours < 12) hours += 12;
      if (meridiem === 'am' && hours === 12) hours = 0;

      const parsed = `${hours.toString().padStart(2, '0')}:${minutes}`;
      times.push({ raw: match[0], parsed });
    }

    // Pattern: H AM/PM (e.g., "3pm")
    const pattern2 = /\b(\d{1,2})\s*(am|pm|a\.m\.|p\.m\.)\b/gi;
    while ((match = pattern2.exec(content)) !== null) {
      // Skip if already matched by pattern1
      if (/\d:\d{2}/.test(match[0])) continue;

      let hours = parseInt(match[1], 10);
      const meridiem = match[2].toLowerCase().replace(/\./g, '');

      if (meridiem === 'pm' && hours < 12) hours += 12;
      if (meridiem === 'am' && hours === 12) hours = 0;

      const parsed = `${hours.toString().padStart(2, '0')}:00`;
      times.push({ raw: match[0], parsed });
    }

    // Pattern: 24-hour format (e.g., "15:00")
    const pattern3 = /\b([01]?\d|2[0-3]):([0-5]\d)\b(?!\s*(am|pm|a\.m\.|p\.m\.))/gi;
    while ((match = pattern3.exec(content)) !== null) {
      const hours = match[1].padStart(2, '0');
      const minutes = match[2];
      times.push({ raw: match[0], parsed: `${hours}:${minutes}` });
    }

    return times;
  }

  /**
   * Extract duration references from content
   * @private
   */
  private extractDuration(content: string): ParsedDuration[] {
    const durations: ParsedDuration[] = [];

    const durationPatterns: Array<{ pattern: RegExp; getMinutes: (match: RegExpMatchArray) => number }> = [
      // "30 minutes", "30-minute", "30 mins"
      {
        pattern: /(\d+)[\s-]*(minute|minutes|min|mins)\b/gi,
        getMinutes: (m) => parseInt(m[1], 10),
      },
      // "1 hour", "2 hours", "1-hour"
      {
        pattern: /(\d+(?:\.\d+)?)[\s-]*(hour|hours|hr|hrs)\b/gi,
        getMinutes: (m) => Math.round(parseFloat(m[1]) * 60),
      },
      // "half hour", "half an hour"
      {
        pattern: /\bhalf\s+(an?\s+)?hour\b/gi,
        getMinutes: () => 30,
      },
      // "quarter hour", "quarter of an hour"
      {
        pattern: /\bquarter\s+(of\s+)?(an?\s+)?hour\b/gi,
        getMinutes: () => 15,
      },
      // "1.5 hours", "1 and a half hours"
      {
        pattern: /(\d+)\s+and\s+(a\s+)?half\s+(hour|hours|hr|hrs)\b/gi,
        getMinutes: (m) => parseInt(m[1], 10) * 60 + 30,
      },
      // "90 mins", "45 min"
      {
        pattern: /\b(\d+)\s*(m|min)\b(?!\w)/gi,
        getMinutes: (m) => parseInt(m[1], 10),
      },
    ];

    for (const { pattern, getMinutes } of durationPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const minutes = getMinutes(match);
        if (minutes > 0 && minutes <= 480) { // Max 8 hours
          durations.push({ raw: match[0], minutes });
        }
      }
    }

    return durations;
  }

  /**
   * Extract participant references from content
   * @private
   */
  private extractParticipants(content: string): string[] {
    const participants: string[] = [];

    // Email pattern
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    let match;
    while ((match = emailPattern.exec(content)) !== null) {
      if (!participants.includes(match[0].toLowerCase())) {
        participants.push(match[0].toLowerCase());
      }
    }

    // "with John", "with Sarah and Mike"
    const withPattern = /\bwith\s+([A-Z][a-z]+(?:\s+(?:and|&)\s+[A-Z][a-z]+)*)/g;
    while ((match = withPattern.exec(content)) !== null) {
      const names = match[1].split(/\s+(?:and|&)\s+/i);
      for (const name of names) {
        const trimmed = name.trim();
        if (trimmed && !participants.includes(trimmed)) {
          participants.push(trimmed);
        }
      }
    }

    // "invite John", "invite the team"
    const invitePattern = /\b(?:invite|include|add|cc)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?|the\s+team|team|everyone)/gi;
    while ((match = invitePattern.exec(content)) !== null) {
      const invitee = match[1].trim();
      if (invitee && !participants.includes(invitee)) {
        participants.push(invitee);
      }
    }

    return participants;
  }

  /**
   * Extract subject/title from content
   * @private
   */
  private extractSubject(content: string): string | undefined {
    // Patterns to extract subject
    const subjectPatterns = [
      /\b(?:about|regarding|re:|for|to\s+discuss)\s*[:\s]?\s*["']?([^"'\n.!?]{5,60})["']?/i,
      /\b(?:meeting|call|session)\s+(?:about|on|for)\s+["']?([^"'\n.!?]{5,60})["']?/i,
      /["']([^"'\n]{5,60})["']\s*(?:meeting|call|session)?/i,
    ];

    for (const pattern of subjectPatterns) {
      const match = content.match(pattern);
      if (match && match[1]) {
        const subject = match[1].trim();
        // Validate it's not just common words
        if (subject.length >= 5 && !/^(the|and|with|from|that|this)$/i.test(subject)) {
          return subject;
        }
      }
    }

    return undefined;
  }

  /**
   * Extract location references from content
   * @private
   */
  private extractLocation(content: string): string | undefined {
    // URL patterns (Zoom, Meet, Teams, etc.)
    const urlPattern = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
    const urlMatch = content.match(urlPattern);
    if (urlMatch && urlMatch[0]) {
      return urlMatch[0];
    }

    // Location patterns
    const locationPatterns = [
      /\b(?:at|in|via|on)\s+(zoom|teams|meet|google\s+meet|skype|webex|conference\s+room\s*\w*|room\s*\d*\w*|office|the\s+office|my\s+office|their\s+office)\b/i,
      /\bvirtual(?:ly)?\b/i,
      /\bin[\s-]person\b/i,
      /\bon[\s-]site\b/i,
      /\b(conference\s+room|meeting\s+room|board\s+room)\s*(\w+|\d+)?\b/i,
    ];

    for (const pattern of locationPatterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1] || match[0];
      }
    }

    return undefined;
  }

  /**
   * Extract priority indicator words from content
   * @private
   */
  private extractPriorityIndicators(content: string): string[] {
    const indicators: string[] = [];
    const normalizedContent = content.toLowerCase();

    const highPriorityPatterns = [
      /\burgent\b/i,
      /\basap\b/i,
      /\bemergency\b/i,
      /\bcritical\b/i,
      /\bimportant\b/i,
      /\bpriority\b/i,
      /\bhigh[\s-]priority\b/i,
      /\btime[\s-]sensitive\b/i,
      /\bimmediately\b/i,
      /\bdeadline\b/i,
      /\bsoon\b/i,
    ];

    const lowPriorityPatterns = [
      /\bno\s+rush\b/i,
      /\bwhenever\b/i,
      /\blow[\s-]priority\b/i,
      /\bwhen\s+(you|they)\s+(can|have\s+time)\b/i,
      /\bif\s+(you|they)\s+have\s+time\b/i,
      /\bno\s+hurry\b/i,
      /\bat\s+your\s+convenience\b/i,
      /\bnot\s+urgent\b/i,
    ];

    for (const pattern of highPriorityPatterns) {
      const match = normalizedContent.match(pattern);
      if (match) {
        indicators.push(match[0]);
      }
    }

    for (const pattern of lowPriorityPatterns) {
      const match = normalizedContent.match(pattern);
      if (match) {
        indicators.push(match[0]);
      }
    }

    return indicators;
  }

  /**
   * Calculate priority level (1-5) based on content and extracted entities.
   *
   * Priority scoring:
   * - "urgent", "ASAP", "emergency", "critical" -> 5
   * - "important", "priority", "soon" -> 4
   * - "client", "customer", "revenue", "deal" -> +1
   * - Time pressure (today, tomorrow) -> +1
   * - Default: 3
   * - "no rush", "whenever", "low priority" -> 2
   *
   * @param content - The raw text content
   * @param entities - The extracted entities
   * @returns Priority level from 1-5
   *
   * @example
   * ```typescript
   * const priority = schedulingAgentService.calculatePriority(
   *   'Urgent meeting with client about the deal ASAP',
   *   { priorityIndicators: ['urgent', 'asap'] }
   * );
   * console.log(priority); // 5
   * ```
   */
  calculatePriority(content: string, entities: ExtractedEntities): number {
    if (!content || typeof content !== 'string') {
      return 3; // Default priority
    }

    const normalizedContent = content.toLowerCase();
    let priority = 3; // Default

    // Check for explicit low priority indicators first (they override)
    const lowPriorityPatterns = [
      /\bno\s+rush\b/,
      /\bwhenever\b/,
      /\blow[\s-]priority\b/,
      /\bwhen\s+(you|they)\s+(can|have\s+time)\b/,
      /\bif\s+(you|they)\s+have\s+time\b/,
      /\bno\s+hurry\b/,
      /\bat\s+your\s+convenience\b/,
      /\bnot\s+urgent\b/,
    ];

    for (const pattern of lowPriorityPatterns) {
      if (pattern.test(normalizedContent)) {
        return 2; // Low priority
      }
    }

    // Check for critical/emergency priority (5)
    const criticalPatterns = [
      /\burgent\b/,
      /\basap\b/,
      /\bemergency\b/,
      /\bcritical\b/,
      /\bimmediately\b/,
      /\bright\s+now\b/,
      /\btime[\s-]sensitive\b/,
    ];

    for (const pattern of criticalPatterns) {
      if (pattern.test(normalizedContent)) {
        return 5; // Critical priority
      }
    }

    // Check for high priority indicators (start at 4)
    const highPriorityPatterns = [
      /\bimportant\b/,
      /\bpriority\b/,
      /\bhigh[\s-]priority\b/,
      /\bsoon\b/,
      /\bquickly\b/,
    ];

    for (const pattern of highPriorityPatterns) {
      if (pattern.test(normalizedContent)) {
        priority = 4;
        break;
      }
    }

    // Business context modifiers (+1 each)
    const businessPatterns = [
      /\bclient\b/,
      /\bcustomer\b/,
      /\brevenue\b/,
      /\bdeal\b/,
      /\bcontract\b/,
      /\bsales\b/,
      /\bexecutive\b/,
      /\bc[\s-]?suite\b/,
      /\bceo\b/,
      /\bcfo\b/,
      /\bcto\b/,
    ];

    for (const pattern of businessPatterns) {
      if (pattern.test(normalizedContent)) {
        priority = Math.min(priority + 1, 5);
        break;
      }
    }

    // Time pressure modifiers (+1 for today/tomorrow)
    if (entities.dates && entities.dates.length > 0) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      for (const date of entities.dates) {
        if (date.parsed) {
          const dateOnly = new Date(
            date.parsed.getFullYear(),
            date.parsed.getMonth(),
            date.parsed.getDate()
          );
          if (dateOnly.getTime() === today.getTime() ||
              dateOnly.getTime() === tomorrow.getTime()) {
            priority = Math.min(priority + 1, 5);
            break;
          }
        }
      }
    }

    // Check for "today" or "tomorrow" in priority indicators
    if (entities.priorityIndicators) {
      const hasTimePressure = entities.priorityIndicators.some(
        indicator => /\btoday\b|\btomorrow\b/i.test(indicator)
      );
      if (hasTimePressure) {
        priority = Math.min(priority + 1, 5);
      }
    }

    console.log(`Calculated priority: ${priority} for content length ${content.length}`);
    return priority;
  }
}

/**
 * Singleton instance of SchedulingAgentService
 */
export const schedulingAgentService = new SchedulingAgentService();

/**
 * Export the class for testing or custom instantiation
 */
export { SchedulingAgentService };

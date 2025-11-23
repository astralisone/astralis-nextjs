/**
 * PipelineAssigner - Action Executor for Pipeline Assignment Operations
 *
 * Handles assignment of intake requests and pipeline items, including:
 * - Initial assignment to pipeline and stage
 * - Reassignment between pipelines
 * - Stage transitions within a pipeline
 * - Assignee management with load balancing
 * - Priority and tag management
 * - Full audit logging of all changes
 *
 * This module works with the existing Prisma models:
 * - intakeRequest: For routing incoming requests to pipelines
 * - pipelineItem: For managing items within pipeline stages
 * - pipeline: Pipeline definitions with stages
 * - pipelineStage: Stages within pipelines
 *
 * @module actions/PipelineAssigner
 * @version 1.0.0
 */

import { prisma } from '@/lib/prisma';
import type {
  UserSummary,
  PipelineSummary,
  Logger,
} from '../types/agent.types';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Result of a pipeline assignment operation
 */
export interface AssignmentResult {
  /** Whether the operation succeeded */
  success: boolean;
  /** ID of the affected entity (intake or pipeline item) */
  intakeId: string;
  /** Previous state before the change */
  previousState: AssignmentState;
  /** New state after the change */
  newState: AssignmentState;
  /** Audit log entry ID */
  auditLogId?: string;
  /** Error message if operation failed */
  error?: string;
  /** Timestamp of the operation */
  timestamp: Date;
}

/**
 * State of an intake's assignment
 */
export interface AssignmentState {
  pipelineId: string | null;
  pipelineName?: string;
  stageId: string | null;
  stageName?: string;
  assigneeId: string | null;
  assigneeName?: string;
  priority: number;
  tags: string[];
  status: string;
}

/**
 * Pipeline entity from database
 */
export interface Pipeline {
  id: string;
  name: string;
  orgId: string;
  isActive: boolean;
  description?: string | null;
  stages: PipelineStage[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Pipeline stage entity
 */
export interface PipelineStage {
  id: string;
  name: string;
  pipelineId: string;
  order: number;
  description?: string | null;
  color?: string | null;
  isDefault?: boolean;
  isFinal?: boolean;
}

/**
 * Team member with pipeline access
 */
export interface TeamMember {
  id: string;
  userId: string;
  pipelineId: string;
  role: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
  };
}

/**
 * Intake request entity from database
 */
export interface IntakeRequest {
  id: string;
  orgId: string;
  title: string;
  description?: string | null;
  status: string;
  priority: number;
  source: string;
  assignedPipeline: string | null;
  requestData: Record<string, unknown>;
  aiRoutingMeta?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  pipeline?: Pipeline | null;
}

/**
 * Pipeline item entity from database
 */
export interface PipelineItem {
  id: string;
  title: string;
  description?: string | null;
  stageId: string;
  assignedToId: string | null;
  priority: number;
  status: string;
  tags: string[];
  progress: number;
  dueDate?: Date | null;
  data?: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  stage?: PipelineStage | null;
}

/**
 * Audit log entry for assignment changes
 */
export interface AssignmentAuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: AssignmentAction;
  previousState: AssignmentState;
  newState: AssignmentState;
  reason?: string;
  performedBy: {
    type: 'agent' | 'human';
    id?: string;
    name?: string;
  };
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Types of assignment actions for audit logging
 */
export type AssignmentAction =
  | 'ASSIGN_TO_PIPELINE'
  | 'REASSIGN_TO_PIPELINE'
  | 'MOVE_TO_STAGE'
  | 'SET_ASSIGNEE'
  | 'SET_PRIORITY'
  | 'ADD_TAGS'
  | 'REMOVE_TAGS'
  | 'CREATE_PIPELINE_ITEM';

/**
 * Configuration for PipelineAssigner
 */
export interface PipelineAssignerConfig {
  /** Organization ID for multi-tenant operations */
  orgId: string;
  /** Custom logger instance */
  logger?: Logger;
  /** ID of the agent performing actions (for audit) */
  agentId?: string;
  /** ID of the human user performing actions (for audit) */
  userId?: string;
  /** Whether operations are performed by agent (true) or human (false) */
  isAgentAction?: boolean;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Options for load balancing assignee selection
 */
export interface LoadBalancingOptions {
  /** Maximum workload per assignee (default: 20) */
  maxWorkload?: number;
  /** Required skills/specializations to match */
  requiredSkills?: string[];
  /** Preferred assignee ID (will be used if available and within capacity) */
  preferredAssigneeId?: string;
  /** Whether to use round-robin as fallback (default: true) */
  useRoundRobin?: boolean;
}

/**
 * Workload information for a team member
 */
export interface WorkloadInfo {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  currentLoad: number;
  maxLoad: number;
  availableCapacity: number;
  isAvailable: boolean;
  lastAssignedAt?: Date;
}

// =============================================================================
// ERRORS
// =============================================================================

/**
 * Base error for pipeline assignment operations
 */
export class PipelineAssignmentError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly intakeId?: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'PipelineAssignmentError';

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, PipelineAssignmentError);
    }
  }
}

/**
 * Error thrown when validation fails
 */
export class ValidationError extends PipelineAssignmentError {
  constructor(message: string, intakeId?: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', intakeId, details);
    this.name = 'ValidationError';
  }
}

/**
 * Error thrown when an entity is not found
 */
export class NotFoundError extends PipelineAssignmentError {
  constructor(
    entityType: 'intake' | 'pipeline' | 'stage' | 'user' | 'pipelineItem',
    entityId: string,
    details?: Record<string, unknown>
  ) {
    super(
      `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} not found: ${entityId}`,
      `${entityType.toUpperCase()}_NOT_FOUND`,
      entityType === 'intake' ? entityId : undefined,
      details
    );
    this.name = 'NotFoundError';
  }
}

/**
 * Error thrown when operation is not permitted
 */
export class PermissionError extends PipelineAssignmentError {
  constructor(message: string, intakeId?: string, details?: Record<string, unknown>) {
    super(message, 'PERMISSION_DENIED', intakeId, details);
    this.name = 'PermissionError';
  }
}

/**
 * Error thrown when intake is in an invalid state for the operation
 */
export class InvalidStateError extends PipelineAssignmentError {
  constructor(message: string, intakeId: string, details?: Record<string, unknown>) {
    super(message, 'INVALID_STATE', intakeId, details);
    this.name = 'InvalidStateError';
  }
}

// =============================================================================
// DEFAULT LOGGER
// =============================================================================

declare const process: { env?: { NODE_ENV?: string } } | undefined;
const isDevelopment =
  typeof process !== 'undefined' && process?.env?.NODE_ENV === 'development';

const createDefaultLogger = (componentName: string): Logger => ({
  debug: (message: string, data?: Record<string, unknown>) => {
    if (isDevelopment) {
      console.debug(`[${componentName}] ${message}`, data ?? '');
    }
  },
  info: (message: string, data?: Record<string, unknown>) => {
    console.info(`[${componentName}] ${message}`, data ?? '');
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    console.warn(`[${componentName}] ${message}`, data ?? '');
  },
  error: (message: string, error?: Error | unknown, data?: Record<string, unknown>) => {
    console.error(`[${componentName}] ${message}`, error, data ?? '');
  },
});

// =============================================================================
// HELPER FUNCTION
// =============================================================================

/**
 * Generate a CUID-like unique identifier
 */
function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${timestamp}${randomPart}`;
}

// =============================================================================
// PIPELINE ASSIGNER CLASS
// =============================================================================

/**
 * PipelineAssigner handles all pipeline assignment operations for intakes.
 *
 * Features:
 * - Validate pipelines, stages, and assignees before operations
 * - Load balance assignee selection based on workload
 * - Full audit logging of all changes
 * - Support for both agent and human-initiated actions
 *
 * @example
 * ```typescript
 * const assigner = new PipelineAssigner({ orgId: 'org_123' });
 *
 * // Assign intake to pipeline
 * const result = await assigner.assign('intake_123', 'pipeline_456', 'stage_789');
 *
 * // Reassign to different pipeline
 * const result2 = await assigner.reassign('intake_123', 'pipeline_new', 'Escalated to support');
 *
 * // Get optimal assignee with load balancing
 * const assignee = await assigner.selectOptimalAssignee('pipeline_456', {
 *   maxWorkload: 15,
 * });
 * ```
 */
export class PipelineAssigner {
  private orgId: string;
  private logger: Logger;
  private agentId?: string;
  private userId?: string;
  private isAgentAction: boolean;
  private debug: boolean;

  // Round-robin tracking for assignee selection
  private lastAssignedIndex: Map<string, number> = new Map();

  // ==========================================================================
  // Constructor
  // ==========================================================================

  constructor(config: PipelineAssignerConfig) {
    this.orgId = config.orgId;
    this.logger = config.logger ?? createDefaultLogger('PipelineAssigner');
    this.agentId = config.agentId;
    this.userId = config.userId;
    this.isAgentAction = config.isAgentAction ?? true;
    this.debug = config.debug ?? false;

    this.logger.info('PipelineAssigner initialized', {
      orgId: this.orgId,
      isAgentAction: this.isAgentAction,
    });
  }

  // ==========================================================================
  // PUBLIC METHODS - INTAKE REQUESTS
  // ==========================================================================

  /**
   * Assign an intake request to a pipeline.
   * This routes the intake to a pipeline and optionally creates a pipeline item.
   *
   * @param intakeId - ID of the intake request to assign
   * @param pipelineId - ID of the target pipeline
   * @param stageId - Optional specific stage ID (defaults to first stage)
   * @param assigneeId - Optional assignee ID
   * @returns Assignment result with previous and new state
   */
  public async assign(
    intakeId: string,
    pipelineId: string,
    stageId?: string,
    assigneeId?: string
  ): Promise<AssignmentResult> {
    const startTime = Date.now();

    try {
      this.logger.info('Assigning intake to pipeline', {
        intakeId,
        pipelineId,
        stageId,
        assigneeId,
      });

      // Fetch and validate intake
      const intake = await this.fetchIntakeRequest(intakeId);
      this.validateIntakeNotClosed(intake);

      // Fetch and validate pipeline
      const pipeline = await this.fetchPipeline(pipelineId);
      this.validatePipelineActive(pipeline);

      // Determine the stage
      const targetStageId = stageId ?? this.getDefaultStage(pipeline)?.id;
      if (!targetStageId) {
        throw new ValidationError('Pipeline has no stages configured', intakeId, {
          pipelineId,
        });
      }

      // Validate stage belongs to pipeline
      this.validateStageInPipeline(targetStageId, pipeline);

      // Validate assignee if provided
      if (assigneeId) {
        await this.validateUserExists(assigneeId);
      }

      // Capture previous state
      const previousState = this.captureIntakeState(intake);

      // Update intake request to assign to pipeline
      const updatedIntake = await prisma.intakeRequest.update({
        where: { id: intakeId },
        data: {
          assignedPipeline: pipelineId,
          status: 'ASSIGNED',
          aiRoutingMeta: {
            ...(intake.aiRoutingMeta as Record<string, unknown> | null),
            assignedAt: new Date().toISOString(),
            assignedByAgent: this.isAgentAction,
            agentId: this.agentId,
          },
        },
        include: {
          pipeline: { include: { stages: { orderBy: { order: 'asc' } } } },
        },
      });

      // Create a pipeline item for this intake
      const pipelineItem = await prisma.pipelineItem.create({
        data: {
          title: intake.title,
          description: intake.description,
          stageId: targetStageId,
          assignedToId: assigneeId ?? null,
          priority: intake.priority,
          status: 'NOT_STARTED',
          tags: [],
          progress: 0,
          data: {
            intakeRequestId: intakeId,
            source: intake.source,
            requestData: intake.requestData,
          },
        },
      });

      // Capture new state
      const newState = this.captureIntakeState({
        ...updatedIntake,
        assignedPipeline: pipelineId,
        status: 'ASSIGNED',
      } as IntakeRequest);
      newState.stageId = targetStageId;
      newState.assigneeId = assigneeId ?? null;

      // Create audit log
      const auditLogId = await this.createAuditLog({
        entityType: 'intakeRequest',
        entityId: intakeId,
        action: 'ASSIGN_TO_PIPELINE',
        previousState,
        newState,
        metadata: { pipelineItemId: pipelineItem.id },
      });

      const result: AssignmentResult = {
        success: true,
        intakeId,
        previousState,
        newState,
        auditLogId,
        timestamp: new Date(),
      };

      this.logger.info('Intake assigned to pipeline successfully', {
        intakeId,
        pipelineId,
        pipelineItemId: pipelineItem.id,
        processingTimeMs: Date.now() - startTime,
      });

      return result;
    } catch (error) {
      return this.handleError(intakeId, error, 'assign');
    }
  }

  /**
   * Reassign an intake request to a different pipeline.
   *
   * @param intakeId - ID of the intake request to reassign
   * @param newPipelineId - ID of the new target pipeline
   * @param reason - Optional reason for reassignment (for audit)
   * @returns Assignment result with previous and new state
   */
  public async reassign(
    intakeId: string,
    newPipelineId: string,
    reason?: string
  ): Promise<AssignmentResult> {
    const startTime = Date.now();

    try {
      this.logger.info('Reassigning intake to new pipeline', {
        intakeId,
        newPipelineId,
        reason,
      });

      // Fetch and validate intake
      const intake = await this.fetchIntakeRequest(intakeId);
      this.validateIntakeNotClosed(intake);

      // Fetch and validate new pipeline
      const newPipeline = await this.fetchPipeline(newPipelineId);
      this.validatePipelineActive(newPipeline);

      // Get default stage of new pipeline
      const defaultStage = this.getDefaultStage(newPipeline);
      if (!defaultStage) {
        throw new ValidationError('New pipeline has no stages configured', intakeId, {
          pipelineId: newPipelineId,
        });
      }

      // Capture previous state
      const previousState = this.captureIntakeState(intake);

      // Update intake request
      const updatedIntake = await prisma.intakeRequest.update({
        where: { id: intakeId },
        data: {
          assignedPipeline: newPipelineId,
          status: 'ROUTING',
          aiRoutingMeta: {
            ...(intake.aiRoutingMeta as Record<string, unknown> | null),
            reassignedAt: new Date().toISOString(),
            reassignReason: reason,
            previousPipeline: intake.assignedPipeline,
          },
        },
        include: {
          pipeline: { include: { stages: { orderBy: { order: 'asc' } } } },
        },
      });

      // Capture new state
      const newState = this.captureIntakeState(updatedIntake as unknown as IntakeRequest);

      // Create audit log
      const auditLogId = await this.createAuditLog({
        entityType: 'intakeRequest',
        entityId: intakeId,
        action: 'REASSIGN_TO_PIPELINE',
        previousState,
        newState,
        reason,
      });

      const result: AssignmentResult = {
        success: true,
        intakeId,
        previousState,
        newState,
        auditLogId,
        timestamp: new Date(),
      };

      this.logger.info('Intake reassigned to new pipeline successfully', {
        intakeId,
        oldPipelineId: previousState.pipelineId,
        newPipelineId,
        processingTimeMs: Date.now() - startTime,
      });

      return result;
    } catch (error) {
      return this.handleError(intakeId, error, 'reassign');
    }
  }

  // ==========================================================================
  // PUBLIC METHODS - PIPELINE ITEMS
  // ==========================================================================

  /**
   * Move a pipeline item to a different stage within its current pipeline.
   *
   * @param intakeId - ID of the pipeline item to move (or intake request ID)
   * @param stageId - ID of the target stage
   * @returns Assignment result with previous and new state
   */
  public async moveToStage(intakeId: string, stageId: string): Promise<AssignmentResult> {
    const startTime = Date.now();

    try {
      this.logger.info('Moving item to stage', {
        intakeId,
        stageId,
      });

      // Try to find pipeline item first
      const pipelineItem = await this.fetchPipelineItemByIntakeId(intakeId);

      if (!pipelineItem) {
        throw new NotFoundError('pipelineItem', intakeId);
      }

      // Get the current stage's pipeline
      const currentStage = await prisma.pipelineStage.findUnique({
        where: { id: pipelineItem.stageId },
        include: { pipeline: { include: { stages: { orderBy: { order: 'asc' } } } } },
      });

      if (!currentStage) {
        throw new NotFoundError('stage', pipelineItem.stageId);
      }

      // Validate new stage belongs to same pipeline
      const pipeline = currentStage.pipeline as unknown as Pipeline;
      this.validateStageInPipeline(stageId, pipeline);

      // Check if stage is a final stage (last by order)
      const targetStage = pipeline.stages.find((s) => s.id === stageId);
      const isFinalStage =
        targetStage?.order === Math.max(...pipeline.stages.map((s) => s.order));

      // Capture previous state
      const previousState = this.capturePipelineItemState(pipelineItem as PipelineItem, currentStage.name);

      // Update the pipeline item
      const updatedItem = await prisma.pipelineItem.update({
        where: { id: pipelineItem.id },
        data: {
          stageId,
          status: isFinalStage ? 'COMPLETED' : 'IN_PROGRESS',
        },
        include: { stage: true },
      });

      // Capture new state
      const newState = this.capturePipelineItemState(
        updatedItem as unknown as PipelineItem,
        targetStage?.name
      );

      // Create audit log
      const auditLogId = await this.createAuditLog({
        entityType: 'pipelineItem',
        entityId: pipelineItem.id,
        action: 'MOVE_TO_STAGE',
        previousState,
        newState,
      });

      const result: AssignmentResult = {
        success: true,
        intakeId: pipelineItem.id,
        previousState,
        newState,
        auditLogId,
        timestamp: new Date(),
      };

      this.logger.info('Item moved to stage successfully', {
        pipelineItemId: pipelineItem.id,
        previousStageId: previousState.stageId,
        newStageId: stageId,
        processingTimeMs: Date.now() - startTime,
      });

      return result;
    } catch (error) {
      return this.handleError(intakeId, error, 'moveToStage');
    }
  }

  /**
   * Set or change the assignee for a pipeline item.
   *
   * @param intakeId - ID of the pipeline item (or intake request ID)
   * @param userId - ID of the user to assign (or null to unassign)
   * @returns Assignment result with previous and new state
   */
  public async setAssignee(
    intakeId: string,
    userId: string | null
  ): Promise<AssignmentResult> {
    const startTime = Date.now();

    try {
      this.logger.info('Setting item assignee', {
        intakeId,
        userId,
      });

      // Find pipeline item
      const pipelineItem = await this.fetchPipelineItemByIntakeId(intakeId);

      if (!pipelineItem) {
        throw new NotFoundError('pipelineItem', intakeId);
      }

      // Validate assignee if provided
      if (userId) {
        await this.validateUserExists(userId);
      }

      // Capture previous state
      const previousState = this.capturePipelineItemState(pipelineItem as PipelineItem);

      // Update the pipeline item
      const updatedItem = await prisma.pipelineItem.update({
        where: { id: pipelineItem.id },
        data: {
          assignedToId: userId,
        },
        include: { stage: true },
      });

      // Get assignee name if set
      let assigneeName: string | undefined;
      if (userId) {
        const user = await prisma.users.findUnique({
          where: { id: userId },
          select: { name: true },
        });
        assigneeName = user?.name ?? undefined;
      }

      // Capture new state
      const newState = this.capturePipelineItemState(updatedItem as unknown as PipelineItem);
      newState.assigneeName = assigneeName;

      // Create audit log
      const auditLogId = await this.createAuditLog({
        entityType: 'pipelineItem',
        entityId: pipelineItem.id,
        action: 'SET_ASSIGNEE',
        previousState,
        newState,
      });

      const result: AssignmentResult = {
        success: true,
        intakeId: pipelineItem.id,
        previousState,
        newState,
        auditLogId,
        timestamp: new Date(),
      };

      this.logger.info('Item assignee set successfully', {
        pipelineItemId: pipelineItem.id,
        previousAssigneeId: previousState.assigneeId,
        newAssigneeId: userId,
        processingTimeMs: Date.now() - startTime,
      });

      return result;
    } catch (error) {
      return this.handleError(intakeId, error, 'setAssignee');
    }
  }

  /**
   * Set the priority level for a pipeline item.
   *
   * @param intakeId - ID of the pipeline item
   * @param priority - Priority level (1-5, where 5 is highest)
   */
  public async setPriority(intakeId: string, priority: number): Promise<void> {
    const startTime = Date.now();

    try {
      // Validate priority range
      if (priority < 1 || priority > 5 || !Number.isInteger(priority)) {
        throw new ValidationError('Priority must be an integer between 1 and 5', intakeId, {
          providedPriority: priority,
        });
      }

      this.logger.info('Setting item priority', {
        intakeId,
        priority,
      });

      // Find pipeline item
      const pipelineItem = await this.fetchPipelineItemByIntakeId(intakeId);

      if (!pipelineItem) {
        throw new NotFoundError('pipelineItem', intakeId);
      }

      // Capture previous state
      const previousState = this.capturePipelineItemState(pipelineItem as PipelineItem);

      // Update the pipeline item
      await prisma.pipelineItem.update({
        where: { id: pipelineItem.id },
        data: { priority },
      });

      // Create simplified new state
      const newState: AssignmentState = {
        ...previousState,
        priority,
      };

      // Create audit log
      await this.createAuditLog({
        entityType: 'pipelineItem',
        entityId: pipelineItem.id,
        action: 'SET_PRIORITY',
        previousState,
        newState,
      });

      this.logger.info('Item priority set successfully', {
        pipelineItemId: pipelineItem.id,
        previousPriority: previousState.priority,
        newPriority: priority,
        processingTimeMs: Date.now() - startTime,
      });
    } catch (error) {
      this.logger.error('Failed to set priority', error, { intakeId, priority });
      throw error;
    }
  }

  /**
   * Add tags to a pipeline item.
   *
   * @param intakeId - ID of the pipeline item
   * @param tags - Array of tags to add
   */
  public async addTags(intakeId: string, tags: string[]): Promise<void> {
    const startTime = Date.now();

    try {
      // Validate tags
      if (!Array.isArray(tags) || tags.length === 0) {
        throw new ValidationError('Tags must be a non-empty array of strings', intakeId, {
          providedTags: tags,
        });
      }

      // Sanitize tags
      const sanitizedTags = tags
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag.length > 0);

      if (sanitizedTags.length === 0) {
        throw new ValidationError('No valid tags provided after sanitization', intakeId, {
          providedTags: tags,
        });
      }

      this.logger.info('Adding tags to item', {
        intakeId,
        tags: sanitizedTags,
      });

      // Find pipeline item
      const pipelineItem = await this.fetchPipelineItemByIntakeId(intakeId);

      if (!pipelineItem) {
        throw new NotFoundError('pipelineItem', intakeId);
      }

      // Capture previous state
      const previousState = this.capturePipelineItemState(pipelineItem as PipelineItem);

      // Merge tags (avoid duplicates)
      const existingTags = pipelineItem.tags || [];
      const mergedTags = [...new Set([...existingTags, ...sanitizedTags])];

      // Update the pipeline item
      await prisma.pipelineItem.update({
        where: { id: pipelineItem.id },
        data: { tags: mergedTags },
      });

      // Create simplified new state
      const newState: AssignmentState = {
        ...previousState,
        tags: mergedTags,
      };

      // Create audit log
      await this.createAuditLog({
        entityType: 'pipelineItem',
        entityId: pipelineItem.id,
        action: 'ADD_TAGS',
        previousState,
        newState,
        metadata: { addedTags: sanitizedTags },
      });

      this.logger.info('Tags added to item successfully', {
        pipelineItemId: pipelineItem.id,
        addedTags: sanitizedTags,
        totalTags: mergedTags.length,
        processingTimeMs: Date.now() - startTime,
      });
    } catch (error) {
      this.logger.error('Failed to add tags', error, { intakeId, tags });
      throw error;
    }
  }

  // ==========================================================================
  // LOAD BALANCING
  // ==========================================================================

  /**
   * Select the optimal assignee for a pipeline based on load balancing.
   *
   * Selection criteria (in order):
   * 1. Preferred assignee (if available and within capacity)
   * 2. Lowest workload among organization members
   * 3. Round-robin fallback
   *
   * @param pipelineId - ID of the pipeline to find assignee for
   * @param options - Load balancing options
   * @returns The selected user summary, or null if no suitable assignee found
   */
  public async selectOptimalAssignee(
    pipelineId: string,
    options: LoadBalancingOptions = {}
  ): Promise<UserSummary | null> {
    const { maxWorkload = 20, preferredAssigneeId, useRoundRobin = true } = options;

    try {
      this.logger.debug('Selecting optimal assignee', {
        pipelineId,
        maxWorkload,
        preferredAssigneeId,
      });

      // Get organization members with their workload
      const teamMembers = await this.getOrgMembersWithWorkload();

      if (teamMembers.length === 0) {
        this.logger.warn('No team members found for organization', { orgId: this.orgId });
        return null;
      }

      // Filter available team members
      let candidates = teamMembers.filter(
        (member) => member.isAvailable && member.currentLoad < maxWorkload
      );

      if (candidates.length === 0) {
        this.logger.warn('No available team members within capacity', {
          orgId: this.orgId,
          totalMembers: teamMembers.length,
        });
        return null;
      }

      // Check for preferred assignee
      if (preferredAssigneeId) {
        const preferred = candidates.find((c) => c.userId === preferredAssigneeId);
        if (preferred) {
          this.logger.debug('Using preferred assignee', {
            userId: preferredAssigneeId,
            currentLoad: preferred.currentLoad,
          });
          return this.workloadInfoToUserSummary(preferred);
        }
      }

      // Sort by workload (lowest first)
      candidates.sort((a, b) => a.currentLoad - b.currentLoad);

      // If multiple candidates have same lowest workload, use round-robin
      const lowestLoad = candidates[0].currentLoad;
      const equalLoadCandidates = candidates.filter((c) => c.currentLoad === lowestLoad);

      if (equalLoadCandidates.length > 1 && useRoundRobin) {
        const lastIndex = this.lastAssignedIndex.get(pipelineId) ?? -1;
        const nextIndex = (lastIndex + 1) % equalLoadCandidates.length;
        this.lastAssignedIndex.set(pipelineId, nextIndex);

        const selected = equalLoadCandidates[nextIndex];
        this.logger.debug('Selected assignee via round-robin', {
          userId: selected.userId,
          roundRobinIndex: nextIndex,
        });
        return this.workloadInfoToUserSummary(selected);
      }

      // Return the candidate with lowest workload
      const selected = candidates[0];
      this.logger.debug('Selected assignee with lowest workload', {
        userId: selected.userId,
        currentLoad: selected.currentLoad,
      });

      return this.workloadInfoToUserSummary(selected);
    } catch (error) {
      this.logger.error('Failed to select optimal assignee', error, { pipelineId });
      throw error;
    }
  }

  /**
   * Get organization members with their current workload.
   */
  private async getOrgMembersWithWorkload(): Promise<WorkloadInfo[]> {
    // Fetch organization members
    const orgUsers = await prisma.users.findMany({
      where: {
        orgId: this.orgId,
        isActive: true,
        role: { in: ['ADMIN', 'PM', 'OPERATOR', 'EDITOR'] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    // Get open pipeline item counts per user
    const userIds = orgUsers.map((u: { id: string }) => u.id);
    const workloadCounts = await prisma.pipelineItem.groupBy({
      by: ['assignedToId'],
      where: {
        assignedToId: { in: userIds },
        status: { notIn: ['COMPLETED', 'CANCELLED'] },
      },
      _count: { id: true },
    });

    // Build workload map
    const workloadMap = new Map<string, number>();
    for (const count of workloadCounts) {
      if (count.assignedToId) {
        workloadMap.set(count.assignedToId, count._count.id);
      }
    }

    // Map to WorkloadInfo
    return orgUsers.map((user: { id: string; name: string | null; email: string; role: string }) => ({
      userId: user.id,
      userName: user.name ?? 'Unknown',
      userEmail: user.email,
      userRole: user.role,
      currentLoad: workloadMap.get(user.id) ?? 0,
      maxLoad: 20, // Default max load
      availableCapacity: 20 - (workloadMap.get(user.id) ?? 0),
      isAvailable: true,
      lastAssignedAt: undefined,
    }));
  }

  /**
   * Convert WorkloadInfo to UserSummary format.
   */
  private workloadInfoToUserSummary(info: WorkloadInfo): UserSummary {
    return {
      id: info.userId,
      name: info.userName,
      email: info.userEmail,
      role: info.userRole,
      currentLoad: info.currentLoad,
      maxLoad: info.maxLoad,
      isAvailable: info.isAvailable,
    };
  }

  // ==========================================================================
  // VALIDATION METHODS
  // ==========================================================================

  /**
   * Fetch an intake request by ID and validate it exists and belongs to org.
   */
  private async fetchIntakeRequest(intakeId: string): Promise<IntakeRequest> {
    const intake = await prisma.intakeRequest.findUnique({
      where: { id: intakeId },
      include: {
        pipeline: { include: { stages: { orderBy: { order: 'asc' } } } },
      },
    });

    if (!intake) {
      throw new NotFoundError('intake', intakeId);
    }

    if (intake.orgId !== this.orgId) {
      throw new PermissionError('Intake does not belong to this organization', intakeId, {
        intakeOrgId: intake.orgId,
        requestedOrgId: this.orgId,
      });
    }

    return intake as unknown as IntakeRequest;
  }

  /**
   * Fetch a pipeline item by intake request ID or direct ID.
   */
  private async fetchPipelineItemByIntakeId(
    intakeId: string
  ): Promise<PipelineItem | null> {
    // First try to find by direct ID
    let item = await prisma.pipelineItem.findUnique({
      where: { id: intakeId },
      include: { stage: true },
    });

    if (item) {
      return item as unknown as PipelineItem;
    }

    // Try to find by linked intake request ID in data
    const items = await prisma.pipelineItem.findMany({
      where: {
        data: {
          path: ['intakeRequestId'],
          equals: intakeId,
        },
      },
      include: { stage: true },
      take: 1,
    });

    return items.length > 0 ? (items[0] as unknown as PipelineItem) : null;
  }

  /**
   * Fetch a pipeline by ID and validate it exists.
   */
  private async fetchPipeline(pipelineId: string): Promise<Pipeline> {
    const pipeline = await prisma.pipeline.findUnique({
      where: { id: pipelineId },
      include: {
        stages: { orderBy: { order: 'asc' } },
      },
    });

    if (!pipeline) {
      throw new NotFoundError('pipeline', pipelineId);
    }

    return pipeline as unknown as Pipeline;
  }

  /**
   * Validate that the intake is not closed.
   */
  private validateIntakeNotClosed(intake: IntakeRequest): void {
    const closedStatuses = ['COMPLETED', 'REJECTED'];
    if (closedStatuses.includes(intake.status.toUpperCase())) {
      throw new InvalidStateError(
        `Cannot modify intake with status "${intake.status}"`,
        intake.id,
        { status: intake.status }
      );
    }
  }

  /**
   * Validate that the pipeline is active.
   */
  private validatePipelineActive(pipeline: Pipeline): void {
    if (!pipeline.isActive) {
      throw new ValidationError('Cannot assign to inactive pipeline', undefined, {
        pipelineId: pipeline.id,
        pipelineName: pipeline.name,
      });
    }
  }

  /**
   * Validate that a stage belongs to the given pipeline.
   */
  private validateStageInPipeline(stageId: string, pipeline: Pipeline): void {
    const stageExists = pipeline.stages.some((s) => s.id === stageId);
    if (!stageExists) {
      throw new ValidationError(
        'Stage does not belong to the specified pipeline',
        undefined,
        {
          stageId,
          pipelineId: pipeline.id,
          availableStages: pipeline.stages.map((s) => s.id),
        }
      );
    }
  }

  /**
   * Validate that a user exists.
   */
  private async validateUserExists(userId: string): Promise<void> {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundError('user', userId);
    }
  }

  /**
   * Get the default (first) stage of a pipeline.
   */
  private getDefaultStage(pipeline: Pipeline): PipelineStage | undefined {
    // Fall back to first stage by order
    return pipeline.stages[0];
  }

  // ==========================================================================
  // STATE CAPTURE & AUDIT LOGGING
  // ==========================================================================

  /**
   * Capture the current state of an intake request for audit logging.
   */
  private captureIntakeState(intake: IntakeRequest): AssignmentState {
    return {
      pipelineId: intake.assignedPipeline,
      pipelineName: intake.pipeline?.name,
      stageId: null,
      stageName: undefined,
      assigneeId: null,
      assigneeName: undefined,
      priority: intake.priority,
      tags: [],
      status: intake.status,
    };
  }

  /**
   * Capture the current state of a pipeline item for audit logging.
   */
  private capturePipelineItemState(item: PipelineItem, stageName?: string): AssignmentState {
    return {
      pipelineId: null, // Pipeline items belong to stages
      pipelineName: undefined,
      stageId: item.stageId,
      stageName: stageName ?? item.stage?.name,
      assigneeId: item.assignedToId,
      assigneeName: undefined,
      priority: item.priority,
      tags: item.tags || [],
      status: item.status,
    };
  }

  /**
   * Create an audit log entry for an assignment change.
   */
  private async createAuditLog(params: {
    entityType: string;
    entityId: string;
    action: AssignmentAction;
    previousState: AssignmentState;
    newState: AssignmentState;
    reason?: string;
    metadata?: Record<string, unknown>;
  }): Promise<string | undefined> {
    try {
      // Use the existing ActivityLog model for audit logging
      const activityLog = await prisma.activityLog.create({
        data: {
          id: generateId(),
          orgId: this.orgId,
          userId: this.isAgentAction ? this.agentId : this.userId,
          action: params.action,
          entity: params.entityType,
          entityId: params.entityId,
          changes: {
            previousState: params.previousState,
            newState: params.newState,
            reason: params.reason,
          },
          metadata: {
            ...(params.metadata ?? {}),
            performedByType: this.isAgentAction ? 'agent' : 'human',
            agentId: this.agentId,
          },
        },
      });

      this.logger.debug('Audit log created', {
        auditLogId: activityLog.id,
        action: params.action,
        entityId: params.entityId,
      });

      return activityLog.id;
    } catch (error) {
      // Log the error but don't fail the main operation
      this.logger.error('Failed to create audit log', error, {
        entityId: params.entityId,
        action: params.action,
      });
      return undefined;
    }
  }

  // ==========================================================================
  // ERROR HANDLING
  // ==========================================================================

  /**
   * Handle errors and create appropriate error results.
   */
  private handleError(intakeId: string, error: unknown, operation: string): AssignmentResult {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    this.logger.error(`Failed to ${operation} intake`, error, { intakeId });

    return {
      success: false,
      intakeId,
      previousState: {
        pipelineId: null,
        stageId: null,
        assigneeId: null,
        priority: 0,
        tags: [],
        status: 'unknown',
      },
      newState: {
        pipelineId: null,
        stageId: null,
        assigneeId: null,
        priority: 0,
        tags: [],
        status: 'error',
      },
      error: errorMessage,
      timestamp: new Date(),
    };
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Update the configuration (e.g., change action performer).
   */
  public updateConfig(updates: Partial<PipelineAssignerConfig>): void {
    if (updates.agentId !== undefined) {
      this.agentId = updates.agentId;
    }
    if (updates.userId !== undefined) {
      this.userId = updates.userId;
    }
    if (updates.isAgentAction !== undefined) {
      this.isAgentAction = updates.isAgentAction;
    }
    if (updates.debug !== undefined) {
      this.debug = updates.debug;
    }

    this.logger.debug('Configuration updated', updates);
  }

  /**
   * Get pipeline summary for context building.
   */
  public async getPipelineSummaries(): Promise<PipelineSummary[]> {
    const pipelines = await prisma.pipeline.findMany({
      where: { isActive: true },
      include: {
        stages: { orderBy: { order: 'asc' } },
      },
    });

    return pipelines.map((p: Pipeline) => ({
      id: p.id,
      name: p.name,
      stages: p.stages.map((s: PipelineStage) => s.name),
      category: 'general',
      description: p.description ?? undefined,
      isActive: p.isActive,
    }));
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a PipelineAssigner instance with the given configuration.
 *
 * @param config - Configuration for the assigner
 * @returns A new PipelineAssigner instance
 */
export function createPipelineAssigner(config: PipelineAssignerConfig): PipelineAssigner {
  return new PipelineAssigner(config);
}

// =============================================================================
// EXPORTS
// =============================================================================

export default PipelineAssigner;

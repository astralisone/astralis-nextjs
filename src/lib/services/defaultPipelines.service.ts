import { prisma } from '@/lib/prisma';
import type { pipeline, pipelineStage, PipelineType } from '@prisma/client';

// Types for default pipelines
export interface DefaultPipelineDefinition {
  key: string;
  name: string;
  type: PipelineType;
  description: string;
  isDefault: boolean;
  stages: {
    key: string;
    name: string;
    description: string;
    order: number;
    color: string;
    isTerminal: boolean;
  }[];
}

export interface PipelineWithStages extends pipeline {
  stages: pipelineStage[];
}

// Default pipeline definitions - all 6 PipelineType values
export const DEFAULT_PIPELINES: DefaultPipelineDefinition[] = [
  {
    key: 'sales',
    name: 'Sales Pipeline',
    type: 'SALES',
    description: 'Lead acquisition through deal closure',
    isDefault: false,
    stages: [
      { key: 'new_lead', name: 'New Lead', description: 'New sales leads', order: 0, color: '#3B82F6', isTerminal: false },
      { key: 'qualified', name: 'Qualified', description: 'Lead has been qualified', order: 1, color: '#8B5CF6', isTerminal: false },
      { key: 'proposal_sent', name: 'Proposal Sent', description: 'Proposal delivered to prospect', order: 2, color: '#EC4899', isTerminal: false },
      { key: 'negotiation', name: 'Negotiation', description: 'In active negotiation', order: 3, color: '#F59E0B', isTerminal: false },
      { key: 'closed_won', name: 'Closed Won', description: 'Deal closed successfully', order: 4, color: '#10B981', isTerminal: true },
      { key: 'closed_lost', name: 'Closed Lost', description: 'Deal did not close', order: 5, color: '#EF4444', isTerminal: true },
    ],
  },
  {
    key: 'support',
    name: 'Support Pipeline',
    type: 'SUPPORT',
    description: 'Customer support ticket management',
    isDefault: false,
    stages: [
      { key: 'new_ticket', name: 'New Ticket', description: 'Newly submitted support request', order: 0, color: '#3B82F6', isTerminal: false },
      { key: 'triaged', name: 'Triaged', description: 'Issue categorized and prioritized', order: 1, color: '#8B5CF6', isTerminal: false },
      { key: 'in_progress', name: 'In Progress', description: 'Being worked on by support', order: 2, color: '#F59E0B', isTerminal: false },
      { key: 'waiting_customer', name: 'Waiting on Customer', description: 'Awaiting customer response', order: 3, color: '#EC4899', isTerminal: false },
      { key: 'resolved', name: 'Resolved', description: 'Issue has been resolved', order: 4, color: '#10B981', isTerminal: false },
      { key: 'closed', name: 'Closed', description: 'Ticket closed', order: 5, color: '#6B7280', isTerminal: true },
    ],
  },
  {
    key: 'billing',
    name: 'Billing Pipeline',
    type: 'BILLING',
    description: 'Invoice and payment tracking',
    isDefault: false,
    stages: [
      { key: 'pending_invoice', name: 'Pending Invoice', description: 'Invoice being prepared', order: 0, color: '#3B82F6', isTerminal: false },
      { key: 'invoice_sent', name: 'Invoice Sent', description: 'Invoice sent to customer', order: 1, color: '#8B5CF6', isTerminal: false },
      { key: 'payment_received', name: 'Payment Received', description: 'Payment has been received', order: 2, color: '#10B981', isTerminal: false },
      { key: 'overdue', name: 'Overdue', description: 'Payment is past due', order: 3, color: '#EF4444', isTerminal: false },
      { key: 'collections', name: 'Collections', description: 'Escalated to collections', order: 4, color: '#DC2626', isTerminal: false },
      { key: 'paid', name: 'Paid', description: 'Fully paid', order: 5, color: '#059669', isTerminal: true },
      { key: 'written_off', name: 'Written Off', description: 'Debt written off', order: 6, color: '#6B7280', isTerminal: true },
    ],
  },
  {
    key: 'internal',
    name: 'Internal Operations Pipeline',
    type: 'INTERNAL',
    description: 'Internal team task management',
    isDefault: false,
    stages: [
      { key: 'backlog', name: 'Backlog', description: 'Items in the backlog', order: 0, color: '#6B7280', isTerminal: false },
      { key: 'planned', name: 'Planned', description: 'Planned for execution', order: 1, color: '#3B82F6', isTerminal: false },
      { key: 'in_progress', name: 'In Progress', description: 'Currently being worked on', order: 2, color: '#F59E0B', isTerminal: false },
      { key: 'blocked', name: 'Blocked', description: 'Blocked by dependency', order: 3, color: '#EF4444', isTerminal: false },
      { key: 'review', name: 'Review', description: 'Under review', order: 4, color: '#8B5CF6', isTerminal: false },
      { key: 'done', name: 'Done', description: 'Completed successfully', order: 5, color: '#10B981', isTerminal: true },
      { key: 'cancelled', name: 'Cancelled', description: 'Task cancelled', order: 6, color: '#6B7280', isTerminal: true },
    ],
  },
  {
    key: 'generic',
    name: 'General Tasks Pipeline',
    type: 'GENERIC',
    description: 'Simple task workflow for general use',
    isDefault: true,
    stages: [
      { key: 'inbox', name: 'Inbox', description: 'Newly received items', order: 0, color: '#3B82F6', isTerminal: false },
      { key: 'todo', name: 'To Do', description: 'Ready to start', order: 1, color: '#8B5CF6', isTerminal: false },
      { key: 'doing', name: 'Doing', description: 'In progress', order: 2, color: '#F59E0B', isTerminal: false },
      { key: 'done', name: 'Done', description: 'Completed', order: 3, color: '#10B981', isTerminal: true },
    ],
  },
  {
    key: 'custom',
    name: 'Custom Pipeline',
    type: 'CUSTOM',
    description: 'Customizable workflow template',
    isDefault: false,
    stages: [
      { key: 'stage_1', name: 'Stage 1', description: 'First stage', order: 0, color: '#3B82F6', isTerminal: false },
      { key: 'stage_2', name: 'Stage 2', description: 'Second stage', order: 1, color: '#8B5CF6', isTerminal: false },
      { key: 'stage_3', name: 'Stage 3', description: 'Third stage', order: 2, color: '#F59E0B', isTerminal: false },
      { key: 'completed', name: 'Completed', description: 'Final stage', order: 3, color: '#10B981', isTerminal: true },
    ],
  },
];

/**
 * Check if default pipelines exist for an organization
 */
export async function hasDefaultPipelines(orgId: string): Promise<boolean> {
  const defaultPipelineNames = DEFAULT_PIPELINES.map((p) => p.name);

  const existingPipelines = await prisma.pipeline.findMany({
    where: {
      orgId: orgId,
      name: { in: defaultPipelineNames },
    },
    select: { name: true },
  });

  return existingPipelines.length === DEFAULT_PIPELINES.length;
}

/**
 * Get existing pipelines for an organization by name
 */
export async function getExistingPipelineNames(orgId: string): Promise<string[]> {
  const pipelines = await prisma.pipeline.findMany({
    where: { orgId: orgId },
    select: { name: true },
  });

  return pipelines.map((p) => p.name);
}

/**
 * Ensure default pipelines exist for an organization.
 * Creates any missing default pipelines with their stages.
 *
 * WARNING: This function performs database write operations.
 * Only call when explicitly authorized by the user.
 *
 * @param orgId - The organization ID to create pipelines for
 * @returns Array of created or existing pipelines with their stages
 */
export async function ensureDefaultPipelines(orgId: string): Promise<PipelineWithStages[]> {
  // Validate orgId
  if (!orgId || typeof orgId !== 'string') {
    throw new Error('Invalid organization ID provided');
  }

  // Verify organization exists
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { id: true },
  });

  if (!org) {
    throw new Error(`Organization not found: ${orgId}`);
  }

  // Get existing pipeline names for this org
  const existingNames = await getExistingPipelineNames(orgId);

  // Determine which pipelines need to be created
  const pipelinesToCreate = DEFAULT_PIPELINES.filter(
    (defaultPipeline) => !existingNames.includes(defaultPipeline.name)
  );

  const createdPipelines: PipelineWithStages[] = [];

  // Create missing pipelines with their stages
  for (const pipelineDef of pipelinesToCreate) {
    const pipeline = await prisma.pipeline.create({
      data: {
        name: pipelineDef.name,
        key: pipelineDef.key,
        type: pipelineDef.type,
        description: pipelineDef.description,
        isActive: true,
        orgId: orgId,
        stages: {
          create: pipelineDef.stages.map((stage) => ({
            name: stage.name,
            key: stage.key,
            description: stage.description,
            order: stage.order,
            color: stage.color,
            isTerminal: stage.isTerminal,
          })),
        },
      },
      include: {
        stages: {
          orderBy: { order: 'asc' },
        },
      },
    });

    createdPipelines.push(pipeline);
  }

  // Return all default pipelines (existing + newly created)
  const allDefaultPipelines = await prisma.pipeline.findMany({
    where: {
      orgId: orgId,
      name: { in: DEFAULT_PIPELINES.map((p) => p.name) },
    },
    include: {
      stages: {
        orderBy: { order: 'asc' },
      },
    },
  });

  return allDefaultPipelines;
}

/**
 * Get the default GENERIC pipeline for an organization.
 * Creates it if it doesn't exist.
 *
 * WARNING: This function may perform database write operations if the pipeline doesn't exist.
 * Only call when explicitly authorized by the user.
 *
 * @param orgId - The organization ID
 * @returns The General Tasks pipeline with stages
 */
export async function getDefaultPipeline(orgId: string): Promise<PipelineWithStages> {
  // Validate orgId
  if (!orgId || typeof orgId !== 'string') {
    throw new Error('Invalid organization ID provided');
  }

  const genericDef = DEFAULT_PIPELINES.find((p) => p.type === 'GENERIC');
  if (!genericDef) {
    throw new Error('GENERIC pipeline definition not found');
  }

  // Try to find existing GENERIC pipeline
  const existingPipeline = await prisma.pipeline.findFirst({
    where: {
      orgId: orgId,
      type: 'GENERIC',
    },
    include: {
      stages: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (existingPipeline) {
    return existingPipeline;
  }

  // Verify organization exists before creating
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { id: true },
  });

  if (!org) {
    throw new Error(`Organization not found: ${orgId}`);
  }

  // Create the GENERIC pipeline with stages
  const newPipeline = await prisma.pipeline.create({
    data: {
      name: genericDef.name,
      key: genericDef.key,
      type: genericDef.type,
      description: genericDef.description,
      isActive: true,
      orgId: orgId,
      stages: {
        create: genericDef.stages.map((stage) => ({
          name: stage.name,
          key: stage.key,
          description: stage.description,
          order: stage.order,
          color: stage.color,
          isTerminal: stage.isTerminal,
        })),
      },
    },
    include: {
      stages: {
        orderBy: { order: 'asc' },
      },
    },
  });

  return newPipeline;
}

/**
 * Get or create a pipeline by type for an organization.
 * Creates it if it doesn't exist.
 *
 * @param orgId - The organization ID
 * @param pipelineType - The type of pipeline (SALES, SUPPORT, etc.)
 * @returns The pipeline with stages
 */
export async function getPipelineByType(
  orgId: string,
  pipelineType: PipelineType
): Promise<PipelineWithStages> {
  if (!orgId || typeof orgId !== 'string') {
    throw new Error('Invalid organization ID provided');
  }

  // Try to find existing pipeline of this type
  const existingPipeline = await prisma.pipeline.findFirst({
    where: {
      orgId: orgId,
      type: pipelineType,
    },
    include: {
      stages: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (existingPipeline) {
    return existingPipeline;
  }

  // Find the definition for this type
  const pipelineDef = DEFAULT_PIPELINES.find((p) => p.type === pipelineType);
  if (!pipelineDef) {
    throw new Error(`No pipeline definition found for type: ${pipelineType}`);
  }

  // Verify organization exists before creating
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { id: true },
  });

  if (!org) {
    throw new Error(`Organization not found: ${orgId}`);
  }

  // Create the pipeline with stages
  const newPipeline = await prisma.pipeline.create({
    data: {
      name: pipelineDef.name,
      key: pipelineDef.key,
      type: pipelineDef.type,
      description: pipelineDef.description,
      isActive: true,
      orgId: orgId,
      stages: {
        create: pipelineDef.stages.map((stage) => ({
          name: stage.name,
          key: stage.key,
          description: stage.description,
          order: stage.order,
          color: stage.color,
          isTerminal: stage.isTerminal,
        })),
      },
    },
    include: {
      stages: {
        orderBy: { order: 'asc' },
      },
    },
  });

  return newPipeline;
}

/**
 * Get a specific default pipeline by name for an organization.
 * Does NOT create the pipeline if it doesn't exist.
 *
 * @param orgId - The organization ID
 * @param pipelineName - The name of the pipeline to retrieve
 * @returns The pipeline with stages, or null if not found
 */
export async function getDefaultPipelineByName(
  orgId: string,
  pipelineName: string
): Promise<PipelineWithStages | null> {
  if (!orgId || typeof orgId !== 'string') {
    throw new Error('Invalid organization ID provided');
  }

  if (!pipelineName || typeof pipelineName !== 'string') {
    throw new Error('Invalid pipeline name provided');
  }

  const pipeline = await prisma.pipeline.findFirst({
    where: {
      orgId: orgId,
      name: pipelineName,
    },
    include: {
      stages: {
        orderBy: { order: 'asc' },
      },
    },
  });

  return pipeline;
}

/**
 * Get all pipelines for an organization
 *
 * @param orgId - The organization ID
 * @returns Array of pipelines with their stages
 */
export async function getOrganizationPipelines(orgId: string): Promise<PipelineWithStages[]> {
  if (!orgId || typeof orgId !== 'string') {
    throw new Error('Invalid organization ID provided');
  }

  const pipelines = await prisma.pipeline.findMany({
    where: { orgId: orgId },
    include: {
      stages: {
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return pipelines;
}

/**
 * Get template definitions without database interaction
 * Returns all available pipeline templates as JSON
 */
export function getPipelineTemplates(): DefaultPipelineDefinition[] {
  return DEFAULT_PIPELINES;
}

/**
 * Get a specific template by key
 * @param templateKey - The template key (e.g., 'sales', 'support', 'generic')
 * @returns The template definition or null if not found
 */
export function getTemplateByKey(templateKey: string): DefaultPipelineDefinition | null {
  return DEFAULT_PIPELINES.find((template) => template.key === templateKey) || null;
}

/**
 * Service class for managing default pipelines
 */
export class DefaultPipelinesService {
  /**
   * Check if default pipelines exist for an organization
   */
  async hasDefaults(orgId: string): Promise<boolean> {
    return hasDefaultPipelines(orgId);
  }

  /**
   * Ensure default pipelines exist for an organization
   */
  async ensureDefaults(orgId: string): Promise<PipelineWithStages[]> {
    return ensureDefaultPipelines(orgId);
  }

  /**
   * Get the default GENERIC pipeline
   */
  async getDefault(orgId: string): Promise<PipelineWithStages> {
    return getDefaultPipeline(orgId);
  }

  /**
   * Get or create a pipeline by type (SALES, SUPPORT, BILLING, etc.)
   */
  async getByType(orgId: string, type: PipelineType): Promise<PipelineWithStages> {
    return getPipelineByType(orgId, type);
  }

  /**
   * Get a specific default pipeline by name
   */
  async getByName(orgId: string, name: string): Promise<PipelineWithStages | null> {
    return getDefaultPipelineByName(orgId, name);
  }

  /**
   * Get all pipelines for an organization
   */
  async getAllPipelines(orgId: string): Promise<PipelineWithStages[]> {
    return getOrganizationPipelines(orgId);
  }

  /**
   * Get the default pipeline definitions (without database interaction)
   */
  getDefinitions(): DefaultPipelineDefinition[] {
    return getPipelineTemplates();
  }

  /**
   * Get a specific template by key
   */
  getTemplateByKey(templateKey: string): DefaultPipelineDefinition | null {
    return getTemplateByKey(templateKey);
  }
}

export const defaultPipelinesService = new DefaultPipelinesService();

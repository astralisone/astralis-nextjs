import { prisma } from '@/lib/prisma';
import type { pipeline, pipelineStage } from '@prisma/client';

// Types for default pipelines
export interface DefaultPipelineDefinition {
  name: string;
  description: string;
  isDefault: boolean;
  stages: {
    name: string;
    description: string;
    order: number;
    color: string;
  }[];
}

export interface PipelineWithStages extends pipeline {
  stages: pipelineStage[];
}

// Default pipeline definitions
export const DEFAULT_PIPELINES: DefaultPipelineDefinition[] = [
  {
    name: 'General Intake',
    description: 'Default catch-all pipeline for general requests and inquiries',
    isDefault: true,
    stages: [
      { name: 'New', description: 'Newly received requests', order: 0, color: '#3182CE' },
      { name: 'In Progress', description: 'Currently being processed', order: 1, color: '#DD6B20' },
      { name: 'Review', description: 'Under review and verification', order: 2, color: '#805AD5' },
      { name: 'Completed', description: 'Successfully completed', order: 3, color: '#38A169' },
    ],
  },
  {
    name: 'Support Requests',
    description: 'Pipeline for support and help ticket management',
    isDefault: false,
    stages: [
      { name: 'New', description: 'New support requests', order: 0, color: '#3182CE' },
      { name: 'In Progress', description: 'Being worked on by support team', order: 1, color: '#DD6B20' },
      { name: 'Review', description: 'Solution review and validation', order: 2, color: '#805AD5' },
      { name: 'Completed', description: 'Issue resolved', order: 3, color: '#38A169' },
    ],
  },
  {
    name: 'Sales Inquiries',
    description: 'Pipeline for sales leads and business inquiries',
    isDefault: false,
    stages: [
      { name: 'New', description: 'New sales inquiries', order: 0, color: '#3182CE' },
      { name: 'In Progress', description: 'In active conversation', order: 1, color: '#DD6B20' },
      { name: 'Review', description: 'Proposal review stage', order: 2, color: '#805AD5' },
      { name: 'Completed', description: 'Deal closed or finalized', order: 3, color: '#38A169' },
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
    // Generate pipeline key (kebab-case)
    const pipelineKey = pipelineDef.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const pipeline = await prisma.pipeline.create({
      data: {
        name: pipelineDef.name,
        key: pipelineKey,
        description: pipelineDef.description,
        isActive: true,
        orgId: orgId,
        stages: {
          create: pipelineDef.stages.map((stage) => {
            // Generate stage key (snake_case)
            const stageKey = stage.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '_')
              .replace(/(^_|_$)/g, '');

            return {
              name: stage.name,
              key: stageKey,
              description: stage.description,
              order: stage.order,
              color: stage.color,
            };
          }),
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
 * Get the default "General Intake" pipeline for an organization.
 * Creates it if it doesn't exist.
 *
 * WARNING: This function may perform database write operations if the pipeline doesn't exist.
 * Only call when explicitly authorized by the user.
 *
 * @param orgId - The organization ID
 * @returns The General Intake pipeline with stages
 */
export async function getDefaultPipeline(orgId: string): Promise<PipelineWithStages> {
  // Validate orgId
  if (!orgId || typeof orgId !== 'string') {
    throw new Error('Invalid organization ID provided');
  }

  const generalIntakeDef = DEFAULT_PIPELINES.find((p) => p.name === 'General Intake');
  if (!generalIntakeDef) {
    throw new Error('General Intake pipeline definition not found');
  }

  // Try to find existing General Intake pipeline
  const existingPipeline = await prisma.pipeline.findFirst({
    where: {
      orgId: orgId,
      name: 'General Intake',
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

  // Create the General Intake pipeline with stages
  // Generate pipeline key (kebab-case)
  const pipelineKey = generalIntakeDef.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const newPipeline = await prisma.pipeline.create({
    data: {
      name: generalIntakeDef.name,
      key: pipelineKey,
      description: generalIntakeDef.description,
      isActive: true,
      orgId: orgId,
      stages: {
        create: generalIntakeDef.stages.map((stage) => {
          // Generate stage key (snake_case)
          const stageKey = stage.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/(^_|_$)/g, '');

          return {
            name: stage.name,
            key: stageKey,
            description: stage.description,
            order: stage.order,
            color: stage.color,
          };
        }),
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
   * Get the default General Intake pipeline
   */
  async getDefault(orgId: string): Promise<PipelineWithStages> {
    return getDefaultPipeline(orgId);
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
    return DEFAULT_PIPELINES;
  }
}

export const defaultPipelinesService = new DefaultPipelinesService();

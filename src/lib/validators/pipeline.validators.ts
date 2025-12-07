import { z } from 'zod';

/**
 * Schema for creating a new pipeline
 * Supports both template-based and custom pipeline creation
 */
export const createPipelineSchema = z.object({
  name: z.string().min(2, "Pipeline name must be at least 2 characters").max(100),
  description: z.string().optional(),
  orgId: z.string().min(1, "Organization ID is required"),
  templateKey: z.string().optional(),
  type: z.enum(['SALES', 'SUPPORT', 'BILLING', 'INTERNAL', 'GENERIC', 'CUSTOM']).optional(),
});

/**
 * Schema for pipeline filters (GET endpoint)
 */
export const pipelineFiltersSchema = z.object({
  orgId: z.string().min(1, "Organization ID is required"),
  search: z.string().optional().nullable(),
  isActive: z.enum(["true", "false"]).optional().nullable(),
  type: z.enum(['SALES', 'SUPPORT', 'BILLING', 'INTERNAL', 'GENERIC', 'CUSTOM']).optional().nullable(),
});

/**
 * Schema for updating a pipeline
 */
export const updatePipelineSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type CreatePipelineInput = z.infer<typeof createPipelineSchema>;
export type PipelineFiltersInput = z.infer<typeof pipelineFiltersSchema>;
export type UpdatePipelineInput = z.infer<typeof updatePipelineSchema>;

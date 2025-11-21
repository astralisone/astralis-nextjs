import { z } from 'zod';
import {
  AutomationTrigger,
  ExecutionStatus,
  TriggerType,
  TemplateCategory,
  IntegrationProvider
} from '@prisma/client';

/**
 * Automation Validators for Phase 6: Business Automation & n8n Integration
 *
 * Comprehensive Zod validation schemas for all automation-related API requests.
 * All schemas include detailed error messages and proper type inference.
 */

// ============================================================================
// Enum Schemas (Prisma-aligned)
// ============================================================================

/**
 * Automation trigger type enum
 */
export const automationTriggerSchema = z.nativeEnum(AutomationTrigger, {
  errorMap: () => ({ message: 'Invalid automation trigger type' }),
});

/**
 * Execution status enum
 */
export const executionStatusSchema = z.nativeEnum(ExecutionStatus, {
  errorMap: () => ({ message: 'Invalid execution status' }),
});

/**
 * Workflow trigger type enum
 */
export const triggerTypeSchema = z.nativeEnum(TriggerType, {
  errorMap: () => ({ message: 'Invalid trigger type' }),
});

/**
 * Template category enum
 */
export const templateCategorySchema = z.nativeEnum(TemplateCategory, {
  errorMap: () => ({ message: 'Invalid template category' }),
});

/**
 * Integration provider enum
 */
export const integrationProviderSchema = z.nativeEnum(IntegrationProvider, {
  errorMap: () => ({ message: 'Invalid integration provider' }),
});

// ============================================================================
// n8n Workflow Schemas
// ============================================================================

/**
 * n8n workflow node schema
 */
export const n8nNodeSchema = z.object({
  id: z.string().min(1, 'Node ID is required'),
  name: z.string().min(1, 'Node name is required').max(100, 'Node name too long'),
  type: z.string().min(1, 'Node type is required'),
  typeVersion: z.number().int().positive('Node type version must be positive'),
  position: z.tuple([z.number(), z.number()]).describe('Node position [x, y]'),
  parameters: z.record(z.unknown()).default({}),
  credentials: z.record(z.string()).optional(),
});

/**
 * n8n workflow JSON schema
 */
export const n8nWorkflowJsonSchema = z.object({
  nodes: z.array(n8nNodeSchema)
    .min(1, 'Workflow must have at least one node')
    .max(100, 'Workflow cannot exceed 100 nodes'),
  connections: z.record(z.unknown()).default({}),
  settings: z.object({
    executionOrder: z.enum(['v0', 'v1']).optional(),
    saveManualExecutions: z.boolean().optional(),
    saveExecutionProgress: z.boolean().optional(),
    saveDataErrorExecution: z.string().optional(),
    saveDataSuccessExecution: z.string().optional(),
    executionTimeout: z.number().int().positive().max(3600).optional(),
    timezone: z.string().optional(),
  }).optional(),
});

// ============================================================================
// Automation CRUD Schemas
// ============================================================================

/**
 * Create automation request schema
 */
export const createAutomationSchema = z.object({
  name: z.string()
    .min(3, 'Automation name must be at least 3 characters')
    .max(100, 'Automation name must not exceed 100 characters')
    .trim(),

  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .trim()
    .optional(),

  triggerType: automationTriggerSchema,

  triggerConfig: z.record(z.unknown())
    .refine((val) => Object.keys(val).length > 0, {
      message: 'Trigger configuration cannot be empty',
    }),

  workflowJson: n8nWorkflowJsonSchema,

  tags: z.array(z.string().trim().min(1, 'Tag cannot be empty'))
    .max(10, 'Maximum 10 tags allowed')
    .optional()
    .default([]),
});

/**
 * Update automation request schema
 */
export const updateAutomationSchema = z.object({
  name: z.string()
    .min(3, 'Automation name must be at least 3 characters')
    .max(100, 'Automation name must not exceed 100 characters')
    .trim()
    .optional(),

  description: z.string()
    .max(500, 'Description must not exceed 500 characters')
    .trim()
    .nullable()
    .optional(),

  isActive: z.boolean().optional(),

  tags: z.array(z.string().trim().min(1, 'Tag cannot be empty'))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),

  metadata: z.record(z.unknown()).nullable().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

/**
 * Execute automation request schema
 */
export const executeAutomationSchema = z.object({
  triggerData: z.record(z.unknown())
    .refine((val) => Object.keys(val).length > 0, {
      message: 'Trigger data cannot be empty',
    }),
});

// ============================================================================
// Workflow Trigger Schemas
// ============================================================================

/**
 * Cron schedule validation regex (standard cron format)
 */
const cronRegex = /^(\*|([0-9]|[1-5][0-9])|\*\/([0-9]|[1-5][0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|[12][0-9]|3[01])|\*\/([1-9]|[12][0-9]|3[01])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/;

/**
 * Create workflow trigger request schema
 */
export const createTriggerSchema = z.object({
  automationId: z.string().cuid('Invalid automation ID format'),

  triggerType: triggerTypeSchema,

  triggerEvent: z.string()
    .min(3, 'Trigger event must be at least 3 characters')
    .max(100, 'Trigger event must not exceed 100 characters')
    .trim(),

  webhookUrl: z.string()
    .url('Invalid webhook URL format')
    .optional(),

  cronSchedule: z.string()
    .regex(cronRegex, 'Invalid cron schedule format (e.g., "0 9 * * *" for daily at 9 AM)')
    .optional(),

  eventFilters: z.record(z.unknown()).optional(),
}).refine(
  (data) => {
    // Webhook triggers require webhookUrl
    if (data.triggerType === 'WEBHOOK' && !data.webhookUrl) {
      return false;
    }
    // Schedule triggers require cronSchedule
    if (data.triggerType === 'SCHEDULE' && !data.cronSchedule) {
      return false;
    }
    return true;
  },
  {
    message: 'Webhook triggers require webhookUrl, schedule triggers require cronSchedule',
  }
);

/**
 * Update workflow trigger request schema
 */
export const updateTriggerSchema = z.object({
  triggerEvent: z.string()
    .min(3, 'Trigger event must be at least 3 characters')
    .max(100, 'Trigger event must not exceed 100 characters')
    .trim()
    .optional(),

  webhookUrl: z.string()
    .url('Invalid webhook URL format')
    .nullable()
    .optional(),

  cronSchedule: z.string()
    .regex(cronRegex, 'Invalid cron schedule format')
    .nullable()
    .optional(),

  eventFilters: z.record(z.unknown())
    .nullable()
    .optional(),

  isActive: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

// ============================================================================
// Integration Credential Schemas
// ============================================================================

/**
 * OAuth credential data schema
 */
export const oauthCredentialDataSchema = z.object({
  accessToken: z.string().min(1, 'Access token is required'),
  refreshToken: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
  scope: z.string().optional(),
  tokenType: z.string().optional(),
});

/**
 * API key credential data schema
 */
export const apiKeyCredentialDataSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
  apiSecret: z.string().optional(),
  apiUrl: z.string().url('Invalid API URL').optional(),
});

/**
 * Save integration credential request schema
 */
export const saveCredentialSchema = z.object({
  provider: integrationProviderSchema,

  credentialName: z.string()
    .min(3, 'Credential name must be at least 3 characters')
    .max(100, 'Credential name must not exceed 100 characters')
    .trim(),

  credentialData: z.record(z.unknown())
    .refine((val) => Object.keys(val).length > 0, {
      message: 'Credential data cannot be empty',
    }),

  scope: z.string().optional(),

  expiresAt: z.string()
    .datetime('Invalid datetime format')
    .optional()
    .transform((val) => val ? new Date(val) : undefined),
});

/**
 * Alias for saveCredentialSchema (used in API routes)
 */
export const createIntegrationCredentialSchema = saveCredentialSchema;

/**
 * Update integration credential request schema
 */
export const updateCredentialSchema = z.object({
  credentialName: z.string()
    .min(3, 'Credential name must be at least 3 characters')
    .max(100, 'Credential name must not exceed 100 characters')
    .trim()
    .optional(),

  credentialData: z.record(z.unknown())
    .refine((val) => Object.keys(val).length > 0, {
      message: 'Credential data cannot be empty',
    })
    .optional(),

  scope: z.string().nullable().optional(),

  expiresAt: z.string()
    .datetime('Invalid datetime format')
    .nullable()
    .optional()
    .transform((val) => val ? new Date(val) : null),

  isActive: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

// ============================================================================
// Template Schemas
// ============================================================================

/**
 * Deploy automation template request schema
 */
export const deployTemplateSchema = z.object({
  templateId: z.string().cuid('Invalid template ID format'),

  name: z.string()
    .min(3, 'Automation name must be at least 3 characters')
    .max(100, 'Automation name must not exceed 100 characters')
    .trim()
    .optional(),

  customConfig: z.record(z.unknown()).optional(),
});

/**
 * Create automation template request schema (admin only)
 */
export const createTemplateSchema = z.object({
  name: z.string()
    .min(3, 'Template name must be at least 3 characters')
    .max(100, 'Template name must not exceed 100 characters')
    .trim(),

  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters')
    .trim(),

  category: templateCategorySchema,

  difficulty: z.enum(['beginner', 'intermediate', 'advanced'], {
    errorMap: () => ({ message: 'Invalid difficulty level' }),
  }),

  n8nWorkflowJson: z.string()
    .min(1, 'Workflow JSON is required')
    .refine((val) => {
      try {
        const parsed = JSON.parse(val);
        return parsed.nodes && Array.isArray(parsed.nodes) && parsed.nodes.length > 0;
      } catch {
        return false;
      }
    }, 'Invalid n8n workflow JSON format'),

  thumbnailUrl: z.string().url('Invalid thumbnail URL').nullable().optional(),

  demoVideoUrl: z.string().url('Invalid demo video URL').nullable().optional(),

  requiredIntegrations: z.array(z.string())
    .max(20, 'Maximum 20 required integrations allowed')
    .default([]),

  tags: z.array(z.string().trim().min(1, 'Tag cannot be empty'))
    .max(20, 'Maximum 20 tags allowed')
    .default([]),

  isOfficial: z.boolean().default(false),
});

// ============================================================================
// Filter and Query Schemas
// ============================================================================

/**
 * Automation list filters schema
 */
export const automationFiltersSchema = z.object({
  isActive: z.boolean().optional(),
  triggerType: automationTriggerSchema.optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

/**
 * Execution history filters schema
 */
export const executionFiltersSchema = z.object({
  automationId: z.string().cuid().optional(),
  status: executionStatusSchema.optional(),
  startDate: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
  endDate: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

/**
 * Template list filters schema
 */
export const templateFiltersSchema = z.object({
  category: templateCategorySchema.optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  isOfficial: z.boolean().optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

// ============================================================================
// Webhook Schemas
// ============================================================================

/**
 * Generic webhook payload schema
 */
export const webhookPayloadSchema = z.object({
  event: z.string().min(1, 'Event name is required'),
  timestamp: z.string().datetime('Invalid timestamp format'),
  data: z.record(z.unknown()),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Internal system event payload schema
 */
export const systemEventPayloadSchema = z.object({
  eventType: triggerTypeSchema,
  eventName: z.string().min(1, 'Event name is required'),
  entityType: z.string().min(1, 'Entity type is required'),
  entityId: z.string().cuid('Invalid entity ID format'),
  data: z.record(z.unknown()),
  orgId: z.string().cuid('Invalid organization ID format'),
  userId: z.string().cuid('Invalid user ID format').optional(),
  timestamp: z.date().default(() => new Date()),
});

// ============================================================================
// Type Exports (inferred from schemas)
// ============================================================================

export type CreateAutomationInput = z.infer<typeof createAutomationSchema>;
export type UpdateAutomationInput = z.infer<typeof updateAutomationSchema>;
export type ExecuteAutomationInput = z.infer<typeof executeAutomationSchema>;
export type CreateTriggerInput = z.infer<typeof createTriggerSchema>;
export type UpdateTriggerInput = z.infer<typeof updateTriggerSchema>;
export type SaveCredentialInput = z.infer<typeof saveCredentialSchema>;
export type UpdateCredentialInput = z.infer<typeof updateCredentialSchema>;
export type DeployTemplateInput = z.infer<typeof deployTemplateSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type AutomationFilters = z.infer<typeof automationFiltersSchema>;
export type ExecutionFilters = z.infer<typeof executionFiltersSchema>;
export type TemplateFilters = z.infer<typeof templateFiltersSchema>;
export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;
export type SystemEventPayload = z.infer<typeof systemEventPayloadSchema>;
export type N8nWorkflowJson = z.infer<typeof n8nWorkflowJsonSchema>;
export type N8nNode = z.infer<typeof n8nNodeSchema>;

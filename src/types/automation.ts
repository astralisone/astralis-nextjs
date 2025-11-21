/**
 * Type definitions for Phase 6: Business Automation & n8n Integration
 *
 * Comprehensive types for automation workflows, executions, triggers,
 * templates, and integration credentials.
 */

import type {
  AutomationTrigger as PrismaAutomationTrigger,
  ExecutionStatus as PrismaExecutionStatus,
  TriggerType as PrismaTriggerType,
  TemplateCategory as PrismaTemplateCategory,
  IntegrationProvider as PrismaIntegrationProvider
} from '@prisma/client';

// ============================================================================
// Core Automation Types
// ============================================================================

/**
 * Base automation workflow entity
 */
export interface Automation {
  id: string;
  name: string;
  description: string | null;
  n8nWorkflowId: string | null;
  webhookUrl: string | null;
  isActive: boolean;
  triggerType: PrismaAutomationTrigger;
  triggerConfig: Record<string, unknown>;
  lastExecutedAt: Date | null;
  executionCount: number;
  successCount: number;
  failureCount: number;
  avgExecutionTime: number | null;
  orgId: string;
  createdById: string;
  tags: string[];
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Automation with creator and execution relations
 */
export interface AutomationWithRelations extends Automation {
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  };
  executions: WorkflowExecution[];
  triggers: WorkflowTrigger[];
  _count?: {
    executions: number;
    triggers: number;
  };
}

/**
 * Automation with execution statistics
 */
export interface AutomationWithStats extends Automation {
  stats: AutomationStats;
  recentExecutions: WorkflowExecution[];
}

// ============================================================================
// Workflow Execution Types
// ============================================================================

/**
 * Workflow execution record
 */
export interface WorkflowExecution {
  id: string;
  automationId: string;
  orgId: string;
  n8nExecutionId: string | null;
  status: PrismaExecutionStatus;
  startedAt: Date;
  completedAt: Date | null;
  executionTime: number | null;
  triggerData: Record<string, unknown>;
  outputData: Record<string, unknown> | null;
  errorMessage: string | null;
  errorStack: string | null;
  retryCount: number;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Workflow execution with automation details
 */
export interface WorkflowExecutionWithAutomation extends WorkflowExecution {
  automation: {
    id: string;
    name: string;
    triggerType: PrismaAutomationTrigger;
  };
}

// ============================================================================
// Workflow Trigger Types
// ============================================================================

/**
 * Workflow trigger configuration
 */
export interface WorkflowTrigger {
  id: string;
  automationId: string;
  orgId: string;
  triggerType: PrismaTriggerType;
  triggerEvent: string;
  webhookUrl: string | null;
  cronSchedule: string | null;
  eventFilters: Record<string, unknown> | null;
  isActive: boolean;
  lastTriggeredAt: Date | null;
  triggerCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Workflow trigger with automation details
 */
export interface WorkflowTriggerWithAutomation extends WorkflowTrigger {
  automation: {
    id: string;
    name: string;
  };
}

// ============================================================================
// Automation Template Types
// ============================================================================

/**
 * Pre-built automation template
 */
export interface AutomationTemplate {
  id: string;
  name: string;
  description: string;
  category: PrismaTemplateCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  n8nWorkflowJson: string;
  thumbnailUrl: string | null;
  demoVideoUrl: string | null;
  requiredIntegrations: string[];
  useCount: number;
  rating: number;
  tags: string[];
  isOfficial: boolean;
  publishedById: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Parsed n8n workflow JSON structure
 */
export interface N8nWorkflowJson {
  nodes: N8nNode[];
  connections: Record<string, unknown>;
  settings?: {
    executionOrder?: 'v0' | 'v1';
    saveManualExecutions?: boolean;
    saveExecutionProgress?: boolean;
    saveDataErrorExecution?: string;
    saveDataSuccessExecution?: string;
    executionTimeout?: number;
    timezone?: string;
  };
}

/**
 * n8n workflow node structure
 */
export interface N8nNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, unknown>;
  credentials?: Record<string, string>;
}

// ============================================================================
// Integration Credential Types
// ============================================================================

/**
 * Integration credential (sensitive data excluded)
 */
export interface IntegrationCredential {
  id: string;
  userId: string;
  orgId: string;
  provider: PrismaIntegrationProvider;
  credentialName: string;
  scope: string | null;
  expiresAt: Date | null;
  isActive: boolean;
  lastUsedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Integration credential with decrypted data (for internal use only)
 */
export interface IntegrationCredentialWithData extends IntegrationCredential {
  credentialData: Record<string, unknown>;
}

/**
 * OAuth credential data structure
 */
export interface OAuthCredential {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  scope?: string;
  tokenType?: string;
}

/**
 * API key credential data structure
 */
export interface ApiKeyCredential {
  apiKey: string;
  apiSecret?: string;
  apiUrl?: string;
}

// ============================================================================
// Input Types (for API requests)
// ============================================================================

/**
 * Input for creating a new automation
 */
export interface CreateAutomationInput {
  name: string;
  description?: string;
  triggerType: PrismaAutomationTrigger;
  triggerConfig: Record<string, unknown>;
  workflowJson: N8nWorkflowJson;
  tags?: string[];
}

/**
 * Input for updating an automation
 */
export interface UpdateAutomationInput {
  name?: string;
  description?: string;
  isActive?: boolean;
  tags?: string[];
}

/**
 * Input for executing an automation
 */
export interface ExecuteAutomationInput {
  triggerData: Record<string, unknown>;
}

/**
 * Input for creating a workflow trigger
 */
export interface CreateTriggerInput {
  automationId: string;
  triggerType: PrismaTriggerType;
  triggerEvent: string;
  webhookUrl?: string;
  cronSchedule?: string;
  eventFilters?: Record<string, unknown>;
}

/**
 * Input for updating a workflow trigger
 */
export interface UpdateTriggerInput {
  triggerEvent?: string;
  webhookUrl?: string;
  cronSchedule?: string;
  eventFilters?: Record<string, unknown>;
  isActive?: boolean;
}

/**
 * Input for saving integration credentials
 */
export interface SaveCredentialInput {
  provider: PrismaIntegrationProvider;
  credentialName: string;
  credentialData: Record<string, unknown>;
  scope?: string;
  expiresAt?: Date;
}

/**
 * Input for deploying an automation template
 */
export interface DeployTemplateInput {
  templateId: string;
  name?: string;
  customConfig?: Record<string, unknown>;
}

// ============================================================================
// Filter and Query Types
// ============================================================================

/**
 * Filters for querying automations
 */
export interface AutomationFilters {
  isActive?: boolean;
  triggerType?: PrismaAutomationTrigger;
  tags?: string[];
  search?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Filters for querying workflow executions
 */
export interface ExecutionFilters {
  automationId?: string;
  status?: PrismaExecutionStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
}

/**
 * Filters for querying automation templates
 */
export interface TemplateFilters {
  category?: PrismaTemplateCategory;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  isOfficial?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

// ============================================================================
// Response Types (for API responses)
// ============================================================================

/**
 * Paginated list of automations
 */
export interface AutomationListResponse {
  automations: Automation[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Paginated execution history
 */
export interface ExecutionHistoryResponse {
  executions: WorkflowExecution[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Paginated list of templates
 */
export interface TemplateListResponse {
  templates: AutomationTemplate[];
  total: number;
  page: number;
  pageSize: number;
  categories: PrismaTemplateCategory[];
}

/**
 * Single automation response
 */
export interface AutomationResponse {
  automation: AutomationWithRelations;
  stats: AutomationStats;
}

/**
 * Automation execution result
 */
export interface ExecutionResult {
  executionId: string;
  status: PrismaExecutionStatus;
  startedAt: Date;
  completedAt?: Date;
  outputData?: Record<string, unknown>;
  errorMessage?: string;
}

/**
 * Webhook registration response
 */
export interface WebhookRegistrationResponse {
  webhookUrl: string;
  webhookId: string;
  secret?: string;
}

// ============================================================================
// Statistics and Analytics Types
// ============================================================================

/**
 * Automation execution statistics
 */
export interface AutomationStats {
  totalExecutions: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  avgExecutionTime: number | null;
  lastExecution: Date | null;
}

/**
 * Organization-wide automation analytics
 */
export interface AutomationAnalytics {
  totalAutomations: number;
  activeAutomations: number;
  totalExecutions: number;
  executionsToday: number;
  executionsThisWeek: number;
  executionsThisMonth: number;
  avgSuccessRate: number;
  avgExecutionTime: number | null;
  topAutomations: Array<{
    id: string;
    name: string;
    executionCount: number;
    successRate: number;
  }>;
  executionsByStatus: Record<PrismaExecutionStatus, number>;
  executionsByTrigger: Record<PrismaAutomationTrigger, number>;
}

/**
 * Execution time series data point
 */
export interface ExecutionTimeSeriesData {
  date: string;
  total: number;
  success: number;
  failed: number;
  avgTime: number | null;
}

// ============================================================================
// Webhook and Event Types
// ============================================================================

/**
 * Generic webhook payload structure
 */
export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Internal event payload for system events
 */
export interface SystemEventPayload {
  eventType: PrismaTriggerType;
  eventName: string;
  entityType: string;
  entityId: string;
  data: Record<string, unknown>;
  orgId: string;
  userId?: string;
  timestamp: Date;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Automation execution error details
 */
export interface ExecutionError {
  message: string;
  stack?: string;
  node?: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Integration credential validation error
 */
export interface CredentialValidationError {
  provider: PrismaIntegrationProvider;
  error: string;
  field?: string;
}

// ============================================================================
// Type Aliases (exported for convenience)
// ============================================================================

export type AutomationTrigger = PrismaAutomationTrigger;
export type ExecutionStatus = PrismaExecutionStatus;
export type TriggerType = PrismaTriggerType;
export type TemplateCategory = PrismaTemplateCategory;
export type IntegrationProvider = PrismaIntegrationProvider;

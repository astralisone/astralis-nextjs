/**
 * Action Repository Types
 *
 * Core types for the AI Action Repository system.
 * Actions are discovered once by AI, cached, and reused to save inference costs.
 */

import { ActionStatus, IntegrationProvider } from '@prisma/client';

// ============================================================================
// ACTION DEFINITION TYPES
// ============================================================================

export interface ActionDefinition {
  id: string;
  actionKey: string;           // "gmail-send-email-v1"
  provider: IntegrationProvider;
  name: string;               // "Send Email via Gmail"
  description?: string;
  category: string;           // "communication", "storage", "crm"

  // Action specification
  inputSchema: JSONSchema;    // JSON Schema for input validation
  outputSchema: JSONSchema;   // JSON Schema for output validation
  executionSpec: ActionExecutionSpec; // How to execute (API endpoints, methods, etc.)

  // Metadata
  version: string;
  status: ActionStatus;
  tags: string[];

  // Usage tracking
  executionCount: number;
  lastExecutedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// JSON Schema types
export interface JSONSchema {
  type: string;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
  additionalProperties?: boolean;
}

export interface JSONSchemaProperty {
  type: string;
  description?: string;
  enum?: string[];
  default?: any;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
}

// Execution specification
export interface ActionExecutionSpec {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  baseUrl: string;             // e.g., "https://gmail.googleapis.com"
  endpoint: string;            // e.g., "/v1/users/me/messages/send"
  headers?: Record<string, string>;
  authType: 'oauth2' | 'api_key' | 'basic' | 'bearer';
  bodyTemplate?: any;          // Template for request body
  queryParams?: Record<string, string>;
  responseMapping?: Record<string, string>; // Map API response to action output
}

// ============================================================================
// EXECUTION TYPES
// ============================================================================

export interface ActionExecution {
  id: string;
  actionId: string;
  actionKey: string;

  // Execution details
  status: ExecutionStatus;
  inputParams: Record<string, any>;
  outputData?: Record<string, any>;
  errorMessage?: string;
  executionTime?: number;      // milliseconds

  // Context
  userId?: string;
  orgId?: string;
  integrationId?: string;      // Which integration credential was used

  // Timestamps
  startedAt: Date;
  completedAt?: Date;
}

export type ExecutionStatus = 'success' | 'failed' | 'stuck' | 'cancelled';

// ============================================================================
// SERVICE INTERFACES
// ============================================================================

export interface IActionRepository {
  // CRUD operations
  save(action: Omit<ActionDefinition, 'id' | 'createdAt' | 'updatedAt'>): Promise<ActionDefinition>;
  findById(id: string): Promise<ActionDefinition | null>;
  findByKey(actionKey: string): Promise<ActionDefinition | null>;
  findByProvider(provider: IntegrationProvider): Promise<ActionDefinition[]>;
  search(filters: ActionSearchFilters): Promise<ActionDefinition[]>;
  update(id: string, updates: Partial<ActionDefinition>): Promise<ActionDefinition>;
  delete(id: string): Promise<void>;

  // Bulk operations
  saveBulk(actions: Omit<ActionDefinition, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<ActionDefinition[]>;

  // Analytics
  getPopularActions(limit?: number): Promise<ActionDefinition[]>;
  getRecentlyUsed(limit?: number): Promise<ActionDefinition[]>;
  getActionStats(actionId: string): Promise<ActionStats>;
}

export interface ActionSearchFilters {
  provider?: IntegrationProvider[];
  category?: string[];
  status?: ActionStatus[];
  tags?: string[];
  searchQuery?: string;
  limit?: number;
  offset?: number;
}

export interface ActionStats {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  lastExecutedAt?: Date;
}

// ============================================================================
// EXECUTION SERVICE
// ============================================================================

export interface IActionExecutionService {
  recordExecution(execution: Omit<ActionExecution, 'id' | 'startedAt'>): Promise<ActionExecution>;
  getExecutionHistory(actionId: string, limit?: number): Promise<ActionExecution[]>;
  getExecutionStats(actionId: string): Promise<ExecutionStats>;
  updateExecutionStatus(executionId: string, status: ExecutionStatus, details?: any): Promise<void>;
}

export interface ExecutionStats {
  total: number;
  successful: number;
  failed: number;
  stuck: number;
  cancelled: number;
  averageExecutionTime: number;
  successRate: number;
}

// ============================================================================
// DISCOVERY SERVICE
// ============================================================================

export interface IActionDiscoveryService {
  discoverActionsForIntegration(integrationId: string): Promise<ActionDefinition[]>;
  validateAction(action: ActionDefinition): Promise<ValidationResult>;
  refreshActionsForProvider(provider: IntegrationProvider): Promise<ActionDefinition[]>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// RUNTIME SERVICE
// ============================================================================

export interface IActionRuntime {
  executeAction(
    actionKey: string,
    params: Record<string, any>,
    context: ExecutionContext
  ): Promise<ExecutionResult>;
  validateExecution(
    actionKey: string,
    params: Record<string, any>
  ): Promise<ValidationResult>;
  getActionCapabilities(actionKey: string): Promise<ActionCapabilities>;
}

export interface ExecutionContext {
  userId?: string;
  orgId?: string;
  integrationId?: string;
  timeout?: number;            // milliseconds
  retries?: number;
}

export interface ExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime: number;
  executionId: string;
}

export interface ActionCapabilities {
  supported: boolean;
  requiresAuth: boolean;
  rateLimited: boolean;
  estimatedCost?: number;      // API call cost in cents
}

// ============================================================================
// AGENT INTEGRATION
// ============================================================================

export interface IAgentActionService {
  getAvailableActions(orgId: string): Promise<ActionDefinition[]>;
  executeActionViaAgent(
    actionKey: string,
    params: Record<string, any>,
    agentContext: AgentContext
  ): Promise<ExecutionResult>;
  escalateFailedExecution(
    executionId: string,
    error: string,
    agentContext: AgentContext
  ): Promise<void>;
}

export interface AgentContext {
  agentId: string;
  decisionId: string;
  userId?: string;
  orgId: string;
  confidence: number;
}

// ============================================================================
// ADMIN INTERFACE
// ============================================================================

export interface IActionAdminService {
  // Repository management
  listActions(filters: ActionSearchFilters): Promise<ActionDefinition[]>;
  getActionDetails(actionId: string): Promise<ActionDetails>;
  updateActionStatus(actionId: string, status: ActionStatus): Promise<void>;
  deleteAction(actionId: string): Promise<void>;

  // Execution monitoring
  getExecutionHistory(actionId?: string, limit?: number): Promise<ActionExecution[]>;
  getSystemStats(): Promise<SystemStats>;

  // Maintenance
  cleanupOldExecutions(daysOld: number): Promise<number>;
  reindexActions(): Promise<void>;
}

export interface ActionDetails extends ActionDefinition {
  executions: ActionExecution[];
  stats: ActionStats;
  usage: UsageMetrics;
}

export interface UsageMetrics {
  dailyUsage: number[];
  weeklyUsage: number[];
  monthlyUsage: number[];
  topUsers: Array<{ userId: string; count: number }>;
  topOrgs: Array<{ orgId: string; count: number }>;
}

export interface SystemStats {
  totalActions: number;
  activeActions: number;
  totalExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  storageUsed: number;          // bytes
}
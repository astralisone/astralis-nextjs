/**
 * Type definitions for Business Automation & n8n Integration
 *
 * Core types for automation workflows, executions, and triggers.
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

// ============================================================================
// n8n Specific Types
// ============================================================================

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

/**
 * Parsed n8n workflow JSON structure
 */
export interface N8nWorkflowJson {
  nodes: N8nNode[];
  connections: Record<string, unknown>;
  settings?: Record<string, unknown>;
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

// ============================================================================
// API Response Types
// ============================================================================

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

// ============================================================================
// Type Aliases (exported for convenience)
// ============================================================================

export type AutomationTrigger = PrismaAutomationTrigger;
export type ExecutionStatus = PrismaExecutionStatus;
export type TriggerType = PrismaTriggerType;
export type TemplateCategory = PrismaTemplateCategory;
export type IntegrationProvider = PrismaIntegrationProvider;

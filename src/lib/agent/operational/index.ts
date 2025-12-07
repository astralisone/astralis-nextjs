/**
 * Operational Agents Module
 *
 * This module exports all operational agents for document processing.
 * Operational agents are specialized agents that handle specific document types:
 * - APClerkAgent: Processes invoices and bills (accounts payable)
 * - ComplianceSentinelAgent: Monitors contracts, policies, and certificates
 * - LogisticsCoordinatorAgent: Handles packing slips, BOLs, and receiving reports
 *
 * All agents extend BaseOperationalAgent and follow common patterns for:
 * - Document type validation
 * - Action logging
 * - Pipeline integration
 * - Error handling
 *
 * @module agent/operational
 * @version 1.0.0
 */

// =============================================================================
// BASE OPERATIONAL AGENT
// =============================================================================

export {
  BaseOperationalAgent,
  // Types
  type DocumentProcessedEvent,
  type ProcessingResult,
  type OperationalAgentConfig,
  // Constants
  DEFAULT_OPERATIONAL_CONFIG,
} from './BaseOperationalAgent';

// =============================================================================
// AP CLERK AGENT
// =============================================================================

export {
  APClerkAgent,
  createAPClerkAgent,
  apClerkAgent,
  // Types
  type APClerkConfig,
} from './APClerkAgent';

// =============================================================================
// COMPLIANCE SENTINEL AGENT
// =============================================================================

export {
  ComplianceSentinelAgent,
  createComplianceSentinelAgent,
  complianceSentinelAgent,
  // Types
  type ComplianceSentinelConfig,
} from './ComplianceSentinelAgent';

// =============================================================================
// LOGISTICS COORDINATOR AGENT
// =============================================================================

export {
  LogisticsCoordinatorAgent,
  createLogisticsCoordinatorAgent,
  logisticsCoordinatorAgent,
  // Types
  type LogisticsCoordinatorConfig,
} from './LogisticsCoordinatorAgent';

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

import { DocumentType } from '@prisma/client';
import type { BaseOperationalAgent } from './BaseOperationalAgent';
import { apClerkAgent } from './APClerkAgent';
import { complianceSentinelAgent } from './ComplianceSentinelAgent';
import { logisticsCoordinatorAgent } from './LogisticsCoordinatorAgent';

/**
 * Registry of all operational agents
 */
export const OPERATIONAL_AGENTS: BaseOperationalAgent[] = [
  apClerkAgent,
  complianceSentinelAgent,
  logisticsCoordinatorAgent,
];

/**
 * Find the appropriate agent for a document type
 */
export function getAgentForDocumentType(
  documentType: DocumentType
): BaseOperationalAgent | undefined {
  return OPERATIONAL_AGENTS.find(agent => agent.canHandle(documentType));
}

/**
 * Get all registered operational agents
 */
export function getAllOperationalAgents(): BaseOperationalAgent[] {
  return [...OPERATIONAL_AGENTS];
}

/**
 * Get agent by name
 */
export function getAgentByName(name: string): BaseOperationalAgent | undefined {
  return OPERATIONAL_AGENTS.find(agent => agent.getName() === name);
}

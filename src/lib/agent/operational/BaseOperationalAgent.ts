/**
 * BaseOperationalAgent - Abstract Base Class for Document Processing Agents
 *
 * Provides common functionality for operational agents that process documents:
 * - Document type validation
 * - Action logging
 * - Error handling
 * - Pipeline integration
 *
 * @module operational/BaseOperationalAgent
 * @version 1.0.0
 */

import { DocumentType } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Document processed event emitted by the system
 */
export interface DocumentProcessedEvent {
  /** Document ID */
  documentId: string;
  /** Organization ID */
  orgId: string;
  /** Document type */
  documentType: DocumentType;
  /** Extracted data from OCR/AI */
  extractedData: Record<string, unknown>;
  /** OCR text */
  ocrText?: string;
  /** File metadata */
  metadata: {
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadedById: string;
    uploadedAt: Date;
  };
  /** Classification confidence */
  classificationConfidence?: number;
}

/**
 * Processing result from an operational agent
 */
export interface ProcessingResult {
  /** Whether processing succeeded */
  success: boolean;
  /** Actions taken */
  actionsTaken: string[];
  /** Pipeline item created (if any) */
  pipelineItemId?: string;
  /** Warnings or flags */
  warnings?: string[];
  /** Error message if failed */
  error?: string;
  /** Processing timestamp */
  timestamp: Date;
}

/**
 * Configuration for operational agents
 */
export interface OperationalAgentConfig {
  /** Enable debug logging */
  enableLogging: boolean;
  /** Automatically create pipeline items */
  autoCreatePipelineItems: boolean;
  /** Confidence threshold for processing (0-1) */
  confidenceThreshold: number;
}

// =============================================================================
// DEFAULT CONFIGURATION
// =============================================================================

export const DEFAULT_OPERATIONAL_CONFIG: OperationalAgentConfig = {
  enableLogging: process.env.NODE_ENV === 'development',
  autoCreatePipelineItems: true,
  confidenceThreshold: 0.7,
};

// =============================================================================
// BASE OPERATIONAL AGENT CLASS
// =============================================================================

/**
 * Abstract base class for operational agents
 */
export abstract class BaseOperationalAgent {
  /** Agent name */
  protected readonly name: string;

  /** Document types this agent handles */
  protected readonly documentTypes: DocumentType[];

  /** Agent configuration */
  protected config: OperationalAgentConfig;

  constructor(
    name: string,
    documentTypes: DocumentType[],
    config: Partial<OperationalAgentConfig> = {}
  ) {
    this.name = name;
    this.documentTypes = documentTypes;
    this.config = { ...DEFAULT_OPERATIONAL_CONFIG, ...config };
  }

  /**
   * Process a document event (must be implemented by subclass)
   */
  abstract process(event: DocumentProcessedEvent): Promise<ProcessingResult>;

  /**
   * Check if this agent can handle a given document type
   */
  canHandle(documentType: DocumentType): boolean {
    return this.documentTypes.includes(documentType);
  }

  /**
   * Log an action taken by the agent
   */
  protected async logAction(
    documentId: string,
    orgId: string,
    action: string,
    data: Record<string, unknown>
  ): Promise<void> {
    try {
      await prisma.activityLog.create({
        data: {
          orgId,
          action: `${this.name}:${action}`,
          entity: 'Document',
          entityId: documentId,
          changes: data,
          metadata: {
            agent: this.name,
            timestamp: new Date().toISOString(),
          },
          createdAt: new Date(),
        },
      });

      if (this.config.enableLogging) {
        console.log(`[${this.name}] ${action}:`, data);
      }
    } catch (error) {
      console.error(`[${this.name}] Failed to log action:`, error);
    }
  }

  /**
   * Mark document as processed by this agent
   */
  protected async markAsProcessed(documentId: string): Promise<void> {
    await prisma.document.update({
      where: { id: documentId },
      data: {
        agentProcessed: true,
        agentProcessedAt: new Date(),
      },
    });
  }

  /**
   * Validate classification confidence
   */
  protected isConfidentEnough(confidence?: number): boolean {
    if (!confidence) return false;
    return confidence >= this.config.confidenceThreshold;
  }

  /**
   * Get agent name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get supported document types
   */
  getSupportedTypes(): DocumentType[] {
    return [...this.documentTypes];
  }
}

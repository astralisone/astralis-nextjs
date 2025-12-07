/**
 * ComplianceSentinelAgent - Operational Agent for Compliance Document Monitoring
 *
 * Handles:
 * - CONTRACT documents
 * - POLICY documents
 * - CERTIFICATE documents
 *
 * Process logic:
 * 1. Extract key dates (effective, expiration, renewal)
 * 2. Calculate alert windows (30/60/90 days before expiration)
 * 3. Create pipeline item in COMPLIANCE pipeline
 * 4. Dispatch notifications for expiring documents
 *
 * @module operational/ComplianceSentinelAgent
 * @version 1.0.0
 */

import { DocumentType, PipelineType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  BaseOperationalAgent,
  type DocumentProcessedEvent,
  type ProcessingResult,
  type OperationalAgentConfig,
} from './BaseOperationalAgent';
import {
  dateCalculationHandler,
  type ExpirationCheckResult,
  type AlertThreshold,
} from '@/lib/agent/actions/DateCalculationHandler';
import {
  notificationDispatcher,
  type NotificationResult,
} from '@/lib/agent/actions/NotificationDispatcher';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Compliance Sentinel specific configuration
 */
export interface ComplianceSentinelConfig extends OperationalAgentConfig {
  /** Alert thresholds for expiration */
  expirationThresholds: AlertThreshold[];
  /** Enable automatic notification dispatch */
  autoDispatchNotifications: boolean;
  /** Default assignee email for compliance tasks */
  defaultAssigneeEmail?: string;
}

/**
 * Extracted compliance document data
 */
interface ComplianceData {
  document_title?: string;
  party_name?: string;
  effective_date?: string;
  expiration_date?: string;
  renewal_date?: string;
  renewal_terms?: string;
  governing_law?: string;
  key_terms?: string[];
  stakeholders?: string[];
}

// =============================================================================
// DEFAULT CONFIGURATION
// =============================================================================

const DEFAULT_COMPLIANCE_CONFIG: ComplianceSentinelConfig = {
  enableLogging: process.env.NODE_ENV === 'development',
  autoCreatePipelineItems: true,
  confidenceThreshold: 0.7,
  expirationThresholds: [
    { days: 90, level: 'info', action: 'SEND_NOTIFICATION' },
    { days: 60, level: 'warning', action: 'CREATE_TASK' },
    { days: 30, level: 'critical', action: 'ESCALATE' },
  ],
  autoDispatchNotifications: true,
};

// =============================================================================
// COMPLIANCE SENTINEL AGENT CLASS
// =============================================================================

/**
 * Operational agent for compliance document monitoring
 */
export class ComplianceSentinelAgent extends BaseOperationalAgent {
  private complianceConfig: ComplianceSentinelConfig;

  constructor(config: Partial<ComplianceSentinelConfig> = {}) {
    super(
      'ComplianceSentinelAgent',
      [DocumentType.CONTRACT, DocumentType.POLICY, DocumentType.CERTIFICATE],
      config
    );
    this.complianceConfig = { ...DEFAULT_COMPLIANCE_CONFIG, ...config };
  }

  /**
   * Process a compliance document
   */
  async process(event: DocumentProcessedEvent): Promise<ProcessingResult> {
    const actionsTaken: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate document type
      if (!this.canHandle(event.documentType)) {
        return {
          success: false,
          actionsTaken,
          error: `Cannot handle document type: ${event.documentType}`,
          timestamp: new Date(),
        };
      }

      // Validate classification confidence
      if (!this.isConfidentEnough(event.classificationConfidence)) {
        warnings.push(
          `Low classification confidence: ${event.classificationConfidence?.toFixed(2)}`
        );
      }

      // Extract compliance data
      const complianceData = event.extractedData as ComplianceData;

      // Step 1: Validate required dates
      if (!complianceData.expiration_date) {
        warnings.push('No expiration date found in document');
      }

      // Step 2: Check expiration status and calculate alerts
      let expirationCheck: ExpirationCheckResult | undefined;
      let reminderDates: Date[] = [];

      if (complianceData.expiration_date) {
        expirationCheck = this.checkExpirationStatus(complianceData.expiration_date);
        actionsTaken.push('EXPIRATION_CHECK_COMPLETED');

        // Calculate reminder dates
        reminderDates = this.calculateReminderDates(complianceData.expiration_date);
        actionsTaken.push('REMINDER_DATES_CALCULATED');
      }

      // Step 3: Create pipeline item in COMPLIANCE pipeline
      const pipelineItemId = await this.createCompliancePipelineItem(
        event,
        complianceData,
        expirationCheck,
        warnings
      );
      actionsTaken.push('PIPELINE_ITEM_CREATED');

      // Step 4: Dispatch notification if expiring soon
      if (
        this.complianceConfig.autoDispatchNotifications &&
        expirationCheck?.isExpiringSoon &&
        expirationCheck.triggeredThreshold?.level === 'critical'
      ) {
        const notificationResult = await this.dispatchExpirationAlert(
          event,
          complianceData,
          expirationCheck
        );

        if (notificationResult.success) {
          actionsTaken.push('NOTIFICATION_DISPATCHED');
        } else {
          warnings.push(`Notification dispatch failed: ${notificationResult.error}`);
        }
      }

      // Mark document as processed
      await this.markAsProcessed(event.documentId);
      actionsTaken.push('MARKED_AS_PROCESSED');

      // Log successful processing
      await this.logAction(event.documentId, event.orgId, 'PROCESSED', {
        pipelineItemId,
        expirationCheck,
        reminderDates: reminderDates.map(d => d.toISOString()),
        actionsTaken,
        warnings,
      });

      return {
        success: true,
        actionsTaken,
        pipelineItemId,
        warnings: warnings.length > 0 ? warnings : undefined,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      await this.logAction(event.documentId, event.orgId, 'PROCESSING_FAILED', {
        error: errorMessage,
        actionsTaken,
      });

      return {
        success: false,
        actionsTaken,
        error: errorMessage,
        warnings,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Check expiration status against thresholds
   */
  private checkExpirationStatus(expirationDate: string): ExpirationCheckResult {
    return dateCalculationHandler.checkExpiration({
      expirationDate,
      thresholds: this.complianceConfig.expirationThresholds,
    });
  }

  /**
   * Calculate reminder dates based on expiration
   */
  private calculateReminderDates(expirationDate: string): Date[] {
    const thresholdDays = this.complianceConfig.expirationThresholds.map(t => t.days);

    const { reminders } = dateCalculationHandler.calculateRenewalReminders({
      expirationDate,
      reminderDays: thresholdDays,
    });

    return reminders.map(r => r.date);
  }

  /**
   * Create a pipeline item in the COMPLIANCE pipeline
   */
  private async createCompliancePipelineItem(
    event: DocumentProcessedEvent,
    complianceData: ComplianceData,
    expirationCheck: ExpirationCheckResult | undefined,
    warnings: string[]
  ): Promise<string> {
    // Find the COMPLIANCE pipeline
    const compliancePipeline = await prisma.pipeline.findFirst({
      where: {
        type: PipelineType.COMPLIANCE,
        isActive: true,
      },
      include: {
        stages: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!compliancePipeline || compliancePipeline.stages.length === 0) {
      throw new Error('COMPLIANCE pipeline not found or has no stages');
    }

    // Determine which stage based on expiration status
    let targetStage = compliancePipeline.stages[0]; // Default to first stage

    if (expirationCheck?.isExpired) {
      // Find "Expired" stage or use last stage
      const expiredStage = compliancePipeline.stages.find(s =>
        s.name.toLowerCase().includes('expired')
      );
      targetStage = expiredStage || compliancePipeline.stages[compliancePipeline.stages.length - 1];
    } else if (expirationCheck?.isExpiringSoon) {
      // Find "Expiring Soon" or "Action Required" stage
      const expiringSoonStage = compliancePipeline.stages.find(
        s =>
          s.name.toLowerCase().includes('expiring') ||
          s.name.toLowerCase().includes('action required')
      );
      targetStage = expiringSoonStage || compliancePipeline.stages[1] || targetStage;
    }

    // Determine priority based on expiration
    let priority = 2; // Normal
    if (expirationCheck?.isExpired) {
      priority = 5; // Critical
    } else if (expirationCheck?.triggeredThreshold?.level === 'critical') {
      priority = 4; // High
    } else if (expirationCheck?.triggeredThreshold?.level === 'warning') {
      priority = 3; // Medium
    }

    // Create pipeline item
    const pipelineItem = await prisma.pipelineItem.create({
      data: {
        stageId: targetStage.id,
        title: `${complianceData.document_title || event.metadata.fileName}`,
        description: this.buildDescription(event.documentType, complianceData, expirationCheck),
        data: {
          documentId: event.documentId,
          documentType: event.documentType,
          partyName: complianceData.party_name,
          effectiveDate: complianceData.effective_date,
          expirationDate: complianceData.expiration_date,
          renewalDate: complianceData.renewal_date,
          daysUntilExpiration: expirationCheck?.daysUntilExpiration,
          isExpired: expirationCheck?.isExpired,
          isExpiringSoon: expirationCheck?.isExpiringSoon,
          extractedData: complianceData,
          warnings: warnings.length > 0 ? warnings : undefined,
        },
        dueDate: complianceData.expiration_date
          ? new Date(complianceData.expiration_date)
          : undefined,
        priority,
        status: expirationCheck?.isExpired
          ? 'NEEDS_REVIEW'
          : expirationCheck?.isExpiringSoon
            ? 'IN_PROGRESS'
            : 'NOT_STARTED',
        tags: [
          event.documentType,
          complianceData.party_name || 'unknown_party',
          ...(expirationCheck?.isExpired ? ['expired'] : []),
          ...(expirationCheck?.isExpiringSoon ? ['expiring_soon'] : []),
          ...(warnings.length > 0 ? ['needs_review'] : []),
        ],
      },
    });

    return pipelineItem.id;
  }

  /**
   * Build a descriptive text for the pipeline item
   */
  private buildDescription(
    documentType: DocumentType,
    data: ComplianceData,
    expirationCheck: ExpirationCheckResult | undefined
  ): string {
    const parts: string[] = [];

    parts.push(`${documentType} document`);

    if (data.party_name) {
      parts.push(`with ${data.party_name}`);
    }

    if (expirationCheck) {
      if (expirationCheck.isExpired) {
        parts.push(`- EXPIRED ${Math.abs(expirationCheck.daysUntilExpiration)} days ago`);
      } else if (expirationCheck.isExpiringSoon) {
        parts.push(
          `- Expires in ${expirationCheck.daysUntilExpiration} days (${expirationCheck.triggeredThreshold?.level.toUpperCase()})`
        );
      } else {
        parts.push(`- Expires in ${expirationCheck.daysUntilExpiration} days`);
      }
    }

    return parts.join(' ');
  }

  /**
   * Dispatch expiration alert notification
   */
  private async dispatchExpirationAlert(
    event: DocumentProcessedEvent,
    complianceData: ComplianceData,
    expirationCheck: ExpirationCheckResult
  ): Promise<NotificationResult> {
    const recipientEmail =
      this.complianceConfig.defaultAssigneeEmail || 'compliance@example.com';

    return await notificationDispatcher.dispatch({
      channel: 'email',
      priority: expirationCheck.triggeredThreshold?.level === 'critical' ? 'high' : 'medium',
      subject: `${expirationCheck.isExpired ? 'EXPIRED' : 'EXPIRING SOON'}: ${complianceData.document_title || event.metadata.fileName}`,
      message: `
Document: ${complianceData.document_title || event.metadata.fileName}
Type: ${event.documentType}
Party: ${complianceData.party_name || 'Unknown'}
Expiration: ${complianceData.expiration_date}
Status: ${expirationCheck.isExpired ? 'EXPIRED' : `Expiring in ${expirationCheck.daysUntilExpiration} days`}

Action Required: ${expirationCheck.suggestedAction || 'Review and take appropriate action'}
      `.trim(),
      recipient: {
        userId: undefined,
        email: recipientEmail,
      },
      metadata: {
        documentId: event.documentId,
        documentType: event.documentType,
        expirationDate: complianceData.expiration_date,
        daysUntilExpiration: expirationCheck.daysUntilExpiration,
      },
    });
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a new ComplianceSentinelAgent instance
 */
export function createComplianceSentinelAgent(
  config?: Partial<ComplianceSentinelConfig>
): ComplianceSentinelAgent {
  return new ComplianceSentinelAgent(config);
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const complianceSentinelAgent = new ComplianceSentinelAgent();

/**
 * LogisticsCoordinatorAgent - Operational Agent for Logistics Document Processing
 *
 * Handles:
 * - PACKING_SLIP documents
 * - BOL (Bill of Lading) documents
 * - RECEIVING_REPORT documents
 *
 * Process logic:
 * 1. Extract PO number and line items
 * 2. Look up matching purchase order in database
 * 3. Compare expected vs received items using array comparison
 * 4. Flag discrepancies for manual review
 * 5. Create pipeline item in LOGISTICS pipeline
 *
 * @module operational/LogisticsCoordinatorAgent
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
  dbLookupHandler,
} from '@/lib/agent/actions/DbLookupHandler';
import {
  arrayComparisonHandler,
  type ArrayComparisonResult,
  type DiscrepancyReport,
} from '@/lib/agent/actions/ArrayComparisonHandler';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Logistics Coordinator specific configuration
 */
export interface LogisticsCoordinatorConfig extends OperationalAgentConfig {
  /** Quantity tolerance for receiving (percentage) */
  quantityTolerance: number;
  /** Automatically accept items within tolerance */
  autoAcceptWithinTolerance: boolean;
  /** Create discrepancy reports for mismatches */
  generateDiscrepancyReports: boolean;
  /** Default warehouse location */
  defaultWarehouseLocation?: string;
}

/**
 * Extracted logistics document data
 */
interface LogisticsData {
  po_number?: string;
  shipment_number?: string;
  carrier?: string;
  tracking_number?: string;
  ship_date?: string;
  delivery_date?: string;
  warehouse_location?: string;
  line_items?: Array<{
    item_number: string;
    description: string;
    quantity: number;
    unit_price?: number;
    uom?: string; // Unit of measure
  }>;
  total_quantity?: number;
  notes?: string;
}

/**
 * Purchase order data structure
 */
interface PurchaseOrder {
  id: string;
  po_number?: string;
  vendor_name?: string;
  order_date?: string;
  line_items?: Array<{
    item_number: string;
    description: string;
    quantity: number;
    unit_price?: number;
  }>;
}

// =============================================================================
// DEFAULT CONFIGURATION
// =============================================================================

const DEFAULT_LOGISTICS_CONFIG: LogisticsCoordinatorConfig = {
  enableLogging: process.env.NODE_ENV === 'development',
  autoCreatePipelineItems: true,
  confidenceThreshold: 0.7,
  quantityTolerance: 0, // Exact match by default
  autoAcceptWithinTolerance: false,
  generateDiscrepancyReports: true,
};

// =============================================================================
// LOGISTICS COORDINATOR AGENT CLASS
// =============================================================================

/**
 * Operational agent for logistics document processing
 */
export class LogisticsCoordinatorAgent extends BaseOperationalAgent {
  private logisticsConfig: LogisticsCoordinatorConfig;

  constructor(config: Partial<LogisticsCoordinatorConfig> = {}) {
    super(
      'LogisticsCoordinatorAgent',
      [DocumentType.PACKING_SLIP, DocumentType.BOL, DocumentType.RECEIVING_REPORT],
      config
    );
    this.logisticsConfig = { ...DEFAULT_LOGISTICS_CONFIG, ...config };
  }

  /**
   * Process a logistics document
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

      // Extract logistics data
      const logisticsData = event.extractedData as LogisticsData;

      // Step 1: Validate required fields
      if (!logisticsData.po_number) {
        warnings.push('No PO number found in document');
        return await this.createUnmatchedPipelineItem(event, logisticsData, warnings);
      }

      // Step 2: Look up matching purchase order
      const poLookup = await this.lookupPurchaseOrder(event.orgId, logisticsData.po_number);
      actionsTaken.push('PO_LOOKUP_COMPLETED');

      if (!poLookup.found) {
        warnings.push(`Purchase order ${logisticsData.po_number} not found in system`);
        return await this.createUnmatchedPipelineItem(event, logisticsData, warnings);
      }

      // Step 3: Compare line items
      const comparisonResult = await this.compareLineItems(
        poLookup.lineItems || [],
        logisticsData.line_items || []
      );
      actionsTaken.push('LINE_ITEMS_COMPARED');

      // Step 4: Generate discrepancy report if needed
      let discrepancyReport: DiscrepancyReport | undefined;

      if (this.logisticsConfig.generateDiscrepancyReports) {
        discrepancyReport = this.generateDiscrepancyReport(comparisonResult);

        if (discrepancyReport.hasDiscrepancies) {
          actionsTaken.push('DISCREPANCY_REPORT_GENERATED');
          warnings.push(discrepancyReport.summary);
        } else {
          actionsTaken.push('NO_DISCREPANCIES_FOUND');
        }
      }

      // Step 5: Create pipeline item in LOGISTICS pipeline
      const pipelineItemId = await this.createLogisticsPipelineItem(
        event,
        logisticsData,
        poLookup.po as PurchaseOrder,
        comparisonResult,
        discrepancyReport,
        warnings
      );
      actionsTaken.push('PIPELINE_ITEM_CREATED');

      // Mark document as processed
      await this.markAsProcessed(event.documentId);
      actionsTaken.push('MARKED_AS_PROCESSED');

      // Log successful processing
      await this.logAction(event.documentId, event.orgId, 'PROCESSED', {
        pipelineItemId,
        poNumber: logisticsData.po_number,
        comparisonSummary: comparisonResult.summary,
        discrepancyReport,
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
   * Look up a purchase order by PO number
   */
  private async lookupPurchaseOrder(
    orgId: string,
    poNumber: string
  ): Promise<{ found: boolean; po?: Record<string, unknown>; lineItems?: Record<string, unknown>[] }> {
    return await dbLookupHandler.lookupPurchaseOrder({ orgId, poNumber });
  }

  /**
   * Compare expected vs actual line items
   */
  private async compareLineItems(
    poLineItems: Array<{
      item_number: string;
      description: string;
      quantity: number;
      unit_price?: number;
    }>,
    receivedLineItems: Array<{
      item_number: string;
      description: string;
      quantity: number;
      unit_price?: number;
    }>
  ): Promise<ArrayComparisonResult> {
    return arrayComparisonHandler.comparePOToPackingSlip({
      poLineItems,
      packingSlipItems: receivedLineItems,
    });
  }

  /**
   * Generate a discrepancy report from comparison results
   */
  private generateDiscrepancyReport(
    comparisonResult: ArrayComparisonResult
  ): DiscrepancyReport {
    return arrayComparisonHandler.generateDiscrepancyReport(comparisonResult);
  }

  /**
   * Create a pipeline item in the LOGISTICS pipeline
   */
  private async createLogisticsPipelineItem(
    event: DocumentProcessedEvent,
    logisticsData: LogisticsData,
    purchaseOrder: PurchaseOrder,
    comparisonResult: ArrayComparisonResult,
    discrepancyReport: DiscrepancyReport | undefined,
    warnings: string[]
  ): Promise<string> {
    // Find the LOGISTICS pipeline
    const logisticsPipeline = await prisma.pipeline.findFirst({
      where: {
        type: PipelineType.LOGISTICS,
        isActive: true,
      },
      include: {
        stages: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!logisticsPipeline || logisticsPipeline.stages.length === 0) {
      throw new Error('LOGISTICS pipeline not found or has no stages');
    }

    // Determine target stage based on discrepancies
    let targetStage = logisticsPipeline.stages[0]; // Default to first stage

    if (discrepancyReport?.hasDiscrepancies) {
      // Find "Review Required" or "Discrepancies" stage
      const reviewStage = logisticsPipeline.stages.find(
        s =>
          s.name.toLowerCase().includes('review') ||
          s.name.toLowerCase().includes('discrepancy')
      );
      targetStage = reviewStage || logisticsPipeline.stages[1] || targetStage;
    } else if (comparisonResult.summary.isPerfectMatch) {
      // Find "Approved" or "Complete" stage
      const approvedStage = logisticsPipeline.stages.find(
        s =>
          s.name.toLowerCase().includes('approved') ||
          s.name.toLowerCase().includes('complete')
      );
      targetStage = approvedStage || targetStage;
    }

    // Determine priority based on severity
    let priority = 2; // Normal
    if (discrepancyReport?.severity === 'high') {
      priority = 5; // Critical
    } else if (discrepancyReport?.severity === 'medium') {
      priority = 3; // Medium
    } else if (discrepancyReport?.severity === 'low') {
      priority = 2; // Normal
    }

    // Create pipeline item
    const pipelineItem = await prisma.pipelineItem.create({
      data: {
        stageId: targetStage.id,
        title: `${event.documentType} - PO ${logisticsData.po_number}`,
        description: this.buildDescription(
          event.documentType,
          logisticsData,
          comparisonResult,
          discrepancyReport
        ),
        data: {
          documentId: event.documentId,
          documentType: event.documentType,
          poNumber: logisticsData.po_number,
          purchaseOrderId: purchaseOrder.id,
          shipmentNumber: logisticsData.shipment_number,
          carrier: logisticsData.carrier,
          trackingNumber: logisticsData.tracking_number,
          shipDate: logisticsData.ship_date,
          deliveryDate: logisticsData.delivery_date,
          warehouseLocation: logisticsData.warehouse_location,
          comparisonSummary: comparisonResult.summary,
          discrepancyReport,
          lineItems: logisticsData.line_items,
          extractedData: logisticsData,
          warnings: warnings.length > 0 ? warnings : undefined,
        },
        dueDate: logisticsData.delivery_date
          ? new Date(logisticsData.delivery_date)
          : undefined,
        priority,
        status: discrepancyReport?.hasDiscrepancies
          ? 'NEEDS_REVIEW'
          : comparisonResult.summary.isPerfectMatch
            ? 'DONE'
            : 'IN_PROGRESS',
        tags: [
          event.documentType,
          `po_${logisticsData.po_number}`,
          ...(discrepancyReport?.hasDiscrepancies ? ['discrepancy'] : []),
          ...(comparisonResult.summary.isPerfectMatch ? ['perfect_match'] : []),
          ...(warnings.length > 0 ? ['needs_review'] : []),
        ],
      },
    });

    return pipelineItem.id;
  }

  /**
   * Create pipeline item for unmatched/problematic shipments
   */
  private async createUnmatchedPipelineItem(
    event: DocumentProcessedEvent,
    logisticsData: LogisticsData,
    warnings: string[]
  ): Promise<ProcessingResult> {
    const logisticsPipeline = await prisma.pipeline.findFirst({
      where: {
        type: PipelineType.LOGISTICS,
        isActive: true,
      },
      include: {
        stages: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!logisticsPipeline || logisticsPipeline.stages.length === 0) {
      throw new Error('LOGISTICS pipeline not found or has no stages');
    }

    // Use first stage for unmatched items
    const firstStage = logisticsPipeline.stages[0];

    const pipelineItem = await prisma.pipelineItem.create({
      data: {
        stageId: firstStage.id,
        title: `UNMATCHED ${event.documentType} - ${logisticsData.po_number || 'NO PO'}`,
        description: `Document could not be matched to a purchase order. ${warnings.join('. ')}`,
        data: {
          documentId: event.documentId,
          documentType: event.documentType,
          poNumber: logisticsData.po_number,
          extractedData: logisticsData,
          warnings,
          unmatched: true,
        },
        priority: 4, // High priority for unmatched items
        status: 'NEEDS_REVIEW',
        tags: [event.documentType, 'unmatched', 'needs_review'],
      },
    });

    await this.markAsProcessed(event.documentId);

    return {
      success: true,
      actionsTaken: ['CREATED_UNMATCHED_ITEM'],
      pipelineItemId: pipelineItem.id,
      warnings,
      timestamp: new Date(),
    };
  }

  /**
   * Build a descriptive text for the pipeline item
   */
  private buildDescription(
    documentType: DocumentType,
    data: LogisticsData,
    comparison: ArrayComparisonResult,
    discrepancy: DiscrepancyReport | undefined
  ): string {
    const parts: string[] = [];

    parts.push(`${documentType} for PO ${data.po_number}`);

    if (data.carrier && data.tracking_number) {
      parts.push(`via ${data.carrier} (${data.tracking_number})`);
    }

    if (comparison.summary.isPerfectMatch) {
      parts.push('- All items match perfectly');
    } else if (discrepancy?.hasDiscrepancies) {
      parts.push(`- ${discrepancy.summary}`);
      parts.push(`- ${discrepancy.recommendedAction}`);
    }

    return parts.join('. ');
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a new LogisticsCoordinatorAgent instance
 */
export function createLogisticsCoordinatorAgent(
  config?: Partial<LogisticsCoordinatorConfig>
): LogisticsCoordinatorAgent {
  return new LogisticsCoordinatorAgent(config);
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const logisticsCoordinatorAgent = new LogisticsCoordinatorAgent();

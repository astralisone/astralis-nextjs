/**
 * APClerkAgent - Operational Agent for Accounts Payable Processing
 *
 * Handles:
 * - INVOICE documents
 * - BILL documents
 *
 * Process logic:
 * 1. Check for duplicate invoices (same vendor + invoice number)
 * 2. Create pipeline item in FINANCE pipeline
 * 3. Calculate payment due date reminders
 * 4. Optionally sync to accounting system (QuickBooks, etc.)
 *
 * @module operational/APClerkAgent
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
  type DuplicateCheckResult,
} from '@/lib/agent/actions/DbLookupHandler';
import {
  dateCalculationHandler,
  type DateCalculationResult,
} from '@/lib/agent/actions/DateCalculationHandler';
import {
  apiPostHandler,
  type ApiPostResult,
} from '@/lib/agent/actions/ApiPostHandler';

// =============================================================================
// TYPES
// =============================================================================

/**
 * AP Clerk specific configuration
 */
export interface APClerkConfig extends OperationalAgentConfig {
  /** Enable QuickBooks sync */
  syncToQuickBooks: boolean;
  /** Default payment terms in days */
  defaultPaymentTerms: number;
  /** Alert days before payment due */
  paymentReminderDays: number[];
  /** Mark duplicates as warnings instead of errors */
  allowDuplicates: boolean;
}

/**
 * Extracted invoice data structure
 */
interface InvoiceData {
  vendor_name?: string;
  invoice_number?: string;
  invoice_date?: string;
  due_date?: string;
  amount?: number;
  payment_terms?: number;
  line_items?: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
  }>;
}

// =============================================================================
// DEFAULT CONFIGURATION
// =============================================================================

const DEFAULT_AP_CONFIG: APClerkConfig = {
  enableLogging: process.env.NODE_ENV === 'development',
  autoCreatePipelineItems: true,
  confidenceThreshold: 0.7,
  syncToQuickBooks: false, // Disabled by default
  defaultPaymentTerms: 30,
  paymentReminderDays: [7, 3, 1], // Remind 7, 3, and 1 day before due
  allowDuplicates: false,
};

// =============================================================================
// AP CLERK AGENT CLASS
// =============================================================================

/**
 * Operational agent for accounts payable document processing
 */
export class APClerkAgent extends BaseOperationalAgent {
  private apConfig: APClerkConfig;

  constructor(config: Partial<APClerkConfig> = {}) {
    super('APClerkAgent', [DocumentType.INVOICE, DocumentType.BILL], config);
    this.apConfig = { ...DEFAULT_AP_CONFIG, ...config };
  }

  /**
   * Process an invoice or bill document
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

      // Extract invoice data
      const invoiceData = event.extractedData as InvoiceData;

      // Step 1: Check for duplicates
      const duplicateCheck = await this.checkForDuplicates(
        event.orgId,
        invoiceData
      );

      if (duplicateCheck.isDuplicate) {
        const duplicateMsg = `Duplicate invoice detected (confidence: ${duplicateCheck.confidence.toFixed(2)})`;

        if (this.apConfig.allowDuplicates) {
          warnings.push(duplicateMsg);
          actionsTaken.push('DUPLICATE_DETECTED_WARNING');
        } else {
          await this.logAction(event.documentId, event.orgId, 'DUPLICATE_DETECTED', {
            existingRecord: duplicateCheck.existingRecord,
            matchedOn: duplicateCheck.matchedOn,
          });

          return {
            success: false,
            actionsTaken: ['DUPLICATE_DETECTED'],
            error: duplicateMsg,
            warnings,
            timestamp: new Date(),
          };
        }
      } else {
        actionsTaken.push('DUPLICATE_CHECK_PASSED');
      }

      // Step 2: Calculate due date and reminders
      const dueDate = await this.calculateDueDate(invoiceData);
      actionsTaken.push('DUE_DATE_CALCULATED');

      // Step 3: Create pipeline item in FINANCE pipeline
      const pipelineItemId = await this.createFinancePipelineItem(
        event,
        invoiceData,
        dueDate,
        warnings
      );
      actionsTaken.push('PIPELINE_ITEM_CREATED');

      // Step 4: Sync to accounting system (if enabled)
      if (this.apConfig.syncToQuickBooks) {
        const syncResult = await this.syncToAccounting(invoiceData, dueDate);

        if (syncResult.success) {
          actionsTaken.push('SYNCED_TO_QUICKBOOKS');
        } else {
          warnings.push(`QuickBooks sync failed: ${syncResult.error}`);
        }
      }

      // Mark document as processed
      await this.markAsProcessed(event.documentId);
      actionsTaken.push('MARKED_AS_PROCESSED');

      // Log successful processing
      await this.logAction(event.documentId, event.orgId, 'PROCESSED', {
        pipelineItemId,
        dueDate: dueDate.resultDateISO,
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
   * Check for duplicate invoices
   */
  private async checkForDuplicates(
    orgId: string,
    invoiceData: InvoiceData
  ): Promise<DuplicateCheckResult> {
    const { vendor_name, invoice_number, amount } = invoiceData;

    if (!vendor_name || !invoice_number) {
      return {
        isDuplicate: false,
        confidence: 0,
        matchedOn: [],
      };
    }

    return await dbLookupHandler.checkDuplicateInvoice({
      orgId,
      vendorName: vendor_name,
      invoiceNumber: invoice_number,
      amount,
    });
  }

  /**
   * Calculate payment due date
   */
  private async calculateDueDate(
    invoiceData: InvoiceData
  ): Promise<DateCalculationResult> {
    // If due date is already provided, use it
    if (invoiceData.due_date) {
      return {
        success: true,
        resultDate: new Date(invoiceData.due_date),
        resultDateISO: invoiceData.due_date,
        timestamp: new Date(),
      };
    }

    // Otherwise, calculate from invoice date + payment terms
    const invoiceDate = invoiceData.invoice_date || new Date().toISOString();
    const paymentTerms = invoiceData.payment_terms || this.apConfig.defaultPaymentTerms;

    return dateCalculationHandler.calculateDueDate({
      invoiceDate,
      paymentTermsDays: paymentTerms,
    });
  }

  /**
   * Create a pipeline item in the FINANCE pipeline
   */
  private async createFinancePipelineItem(
    event: DocumentProcessedEvent,
    invoiceData: InvoiceData,
    dueDate: DateCalculationResult,
    warnings: string[]
  ): Promise<string> {
    // Find the FINANCE pipeline
    const financePipeline = await prisma.pipeline.findFirst({
      where: {
        type: PipelineType.FINANCE,
        isActive: true,
      },
      include: {
        stages: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!financePipeline || financePipeline.stages.length === 0) {
      throw new Error('FINANCE pipeline not found or has no stages');
    }

    // Use the first stage (typically "New" or "Pending Review")
    const firstStage = financePipeline.stages[0];

    // Create pipeline item
    const pipelineItem = await prisma.pipelineItem.create({
      data: {
        stageId: firstStage.id,
        title: `${invoiceData.vendor_name || 'Unknown Vendor'} - Invoice ${invoiceData.invoice_number || 'N/A'}`,
        description: `Invoice processing for ${event.metadata.fileName}`,
        data: {
          documentId: event.documentId,
          documentType: event.documentType,
          vendorName: invoiceData.vendor_name,
          invoiceNumber: invoiceData.invoice_number,
          invoiceDate: invoiceData.invoice_date,
          amount: invoiceData.amount,
          lineItems: invoiceData.line_items,
          extractedData: invoiceData,
          warnings: warnings.length > 0 ? warnings : undefined,
        },
        dueDate: dueDate.resultDate,
        priority: warnings.length > 0 ? 3 : 2, // Higher priority if warnings
        status: warnings.length > 0 ? 'NEEDS_REVIEW' : 'NOT_STARTED',
        tags: [
          event.documentType,
          invoiceData.vendor_name || 'unknown_vendor',
          ...(warnings.length > 0 ? ['needs_review'] : []),
        ],
      },
    });

    return pipelineItem.id;
  }

  /**
   * Sync invoice to accounting system (QuickBooks)
   */
  private async syncToAccounting(
    invoiceData: InvoiceData,
    dueDate: DateCalculationResult
  ): Promise<ApiPostResult> {
    if (!invoiceData.vendor_name || !invoiceData.invoice_number || !invoiceData.amount) {
      return {
        success: false,
        error: 'Missing required fields for accounting sync',
        errorCode: 'VALIDATION_ERROR',
        retryAttempts: 0,
        executionTimeMs: 0,
        timestamp: new Date(),
      };
    }

    return await apiPostHandler.syncToQuickBooks({
      vendorName: invoiceData.vendor_name,
      invoiceNumber: invoiceData.invoice_number,
      amount: invoiceData.amount,
      dueDate: dueDate.resultDateISO || new Date().toISOString(),
      lineItems: invoiceData.line_items,
    });
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a new APClerkAgent instance
 */
export function createAPClerkAgent(config?: Partial<APClerkConfig>): APClerkAgent {
  return new APClerkAgent(config);
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const apClerkAgent = new APClerkAgent();

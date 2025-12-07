/**
 * DbLookupHandler - Action Executor for Database Lookup Operations
 *
 * Handles database queries for operational agents including:
 * - Duplicate detection (invoices, contracts, etc.)
 * - PO matching for logistics
 * - Vendor lookups
 * - General entity searches
 *
 * @module actions/DbLookupHandler
 * @version 1.0.0
 */

import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Supported table types for lookup operations
 */
export type LookupTable =
  | 'document'
  | 'pipelineItem'
  | 'intakeRequest'
  | 'task'
  | 'users'
  | 'organization';

/**
 * Input for database lookup operation
 */
export interface DbLookupInput {
  /** Table to query */
  table: LookupTable;
  /** Where conditions (Prisma-style) */
  where: Record<string, unknown>;
  /** Fields to select (optional, returns all if not specified) */
  select?: Record<string, boolean>;
  /** Include related entities */
  include?: Record<string, boolean | object>;
  /** Take limit */
  take?: number;
  /** Order by */
  orderBy?: Record<string, 'asc' | 'desc'>;
  /** Organization ID for scoping queries */
  orgId?: string;
}

/**
 * Result of a database lookup operation
 */
export interface DbLookupResult<T = unknown> {
  /** Whether the operation succeeded */
  success: boolean;
  /** Matched records */
  records: T[];
  /** Total count of matching records */
  count: number;
  /** Whether duplicate was found (for duplicate detection) */
  hasDuplicate: boolean;
  /** Error message if operation failed */
  error?: string;
  /** Query execution time in ms */
  executionTimeMs: number;
  /** Timestamp of the operation */
  timestamp: Date;
}

/**
 * Duplicate detection result
 */
export interface DuplicateCheckResult {
  /** Whether a duplicate exists */
  isDuplicate: boolean;
  /** The duplicate record if found */
  existingRecord?: Record<string, unknown>;
  /** Confidence score (0-1) */
  confidence: number;
  /** Match criteria that was met */
  matchedOn: string[];
}

/**
 * Configuration for DbLookupHandler
 */
export interface DbLookupHandlerConfig {
  /** Maximum records to return */
  maxResults: number;
  /** Query timeout in ms */
  timeoutMs: number;
  /** Enable query logging */
  enableLogging: boolean;
}

// =============================================================================
// ERRORS
// =============================================================================

export class DbLookupError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'DbLookupError';
  }
}

export class TableNotFoundError extends DbLookupError {
  constructor(table: string) {
    super(`Table '${table}' is not supported for lookup operations`, 'TABLE_NOT_FOUND', { table });
  }
}

export class QueryTimeoutError extends DbLookupError {
  constructor(timeoutMs: number) {
    super(`Query exceeded timeout of ${timeoutMs}ms`, 'QUERY_TIMEOUT', { timeoutMs });
  }
}

// =============================================================================
// DEFAULT CONFIGURATION
// =============================================================================

export const DEFAULT_LOOKUP_CONFIG: DbLookupHandlerConfig = {
  maxResults: 100,
  timeoutMs: 30000,
  enableLogging: process.env.NODE_ENV === 'development',
};

// =============================================================================
// DB LOOKUP HANDLER CLASS
// =============================================================================

/**
 * Handler for database lookup operations used by operational agents
 */
export class DbLookupHandler {
  private config: DbLookupHandlerConfig;

  constructor(config: Partial<DbLookupHandlerConfig> = {}) {
    this.config = { ...DEFAULT_LOOKUP_CONFIG, ...config };
  }

  /**
   * Perform a database lookup
   */
  async lookup<T = unknown>(input: DbLookupInput): Promise<DbLookupResult<T>> {
    const startTime = Date.now();

    try {
      const { table, where, select, include, take, orderBy, orgId } = input;

      // Add org scoping if provided
      const scopedWhere = orgId ? { ...where, orgId } : where;

      // Get the appropriate Prisma model
      const model = this.getModel(table);
      if (!model) {
        throw new TableNotFoundError(table);
      }

      // Build query options
      const queryOptions: Record<string, unknown> = {
        where: scopedWhere,
        take: Math.min(take || this.config.maxResults, this.config.maxResults),
      };

      if (select) queryOptions.select = select;
      if (include) queryOptions.include = include;
      if (orderBy) queryOptions.orderBy = orderBy;

      // Execute query
      const records = await (model as { findMany: (opts: Record<string, unknown>) => Promise<T[]> }).findMany(queryOptions);
      const count = await (model as { count: (opts: { where: Record<string, unknown> }) => Promise<number> }).count({ where: scopedWhere });

      const executionTimeMs = Date.now() - startTime;

      if (this.config.enableLogging) {
        console.log(`[DbLookup] ${table}: ${count} records found in ${executionTimeMs}ms`);
      }

      return {
        success: true,
        records,
        count,
        hasDuplicate: records.length > 0,
        executionTimeMs,
        timestamp: new Date(),
      };
    } catch (error) {
      const executionTimeMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        success: false,
        records: [],
        count: 0,
        hasDuplicate: false,
        error: errorMessage,
        executionTimeMs,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Check for duplicate invoice/bill
   */
  async checkDuplicateInvoice(params: {
    orgId: string;
    vendorName: string;
    invoiceNumber: string;
    amount?: number;
  }): Promise<DuplicateCheckResult> {
    const { orgId, vendorName, invoiceNumber, amount } = params;

    // Look for documents with matching extracted data
    const result = await this.lookup<{ id: string; extractedData: Prisma.JsonValue }>({
      table: 'document',
      where: {
        orgId,
        documentType: { in: ['INVOICE', 'BILL'] },
        extractedData: {
          path: ['invoice_number'],
          equals: invoiceNumber,
        },
      },
      select: {
        id: true,
        extractedData: true,
      },
    });

    if (!result.success || result.records.length === 0) {
      return {
        isDuplicate: false,
        confidence: 0,
        matchedOn: [],
      };
    }

    // Check if vendor name matches
    const matchedOn: string[] = ['invoice_number'];
    let confidence = 0.7;

    const existingRecord = result.records[0];
    const extractedData = existingRecord.extractedData as Record<string, unknown>;

    if (extractedData?.vendor_name === vendorName) {
      matchedOn.push('vendor_name');
      confidence = 0.9;
    }

    if (amount && extractedData?.amount === amount) {
      matchedOn.push('amount');
      confidence = 0.95;
    }

    return {
      isDuplicate: true,
      existingRecord,
      confidence,
      matchedOn,
    };
  }

  /**
   * Look up a purchase order by PO number
   */
  async lookupPurchaseOrder(params: {
    orgId: string;
    poNumber: string;
  }): Promise<{ found: boolean; po?: Record<string, unknown>; lineItems?: Record<string, unknown>[] }> {
    const { orgId, poNumber } = params;

    // Look for documents with matching PO number
    const result = await this.lookup<{ id: string; extractedData: Prisma.JsonValue }>({
      table: 'document',
      where: {
        orgId,
        documentType: 'PURCHASE_ORDER',
        extractedData: {
          path: ['po_number'],
          equals: poNumber,
        },
      },
      select: {
        id: true,
        extractedData: true,
      },
    });

    if (!result.success || result.records.length === 0) {
      return { found: false };
    }

    const po = result.records[0];
    const extractedData = po.extractedData as Record<string, unknown>;

    return {
      found: true,
      po: { id: po.id, ...extractedData },
      lineItems: extractedData?.line_items as Record<string, unknown>[] || [],
    };
  }

  /**
   * Look up contracts expiring within a time window
   */
  async lookupExpiringContracts(params: {
    orgId: string;
    daysFromNow: number;
  }): Promise<{ contracts: Record<string, unknown>[] }> {
    const { orgId, daysFromNow } = params;

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysFromNow);

    const result = await this.lookup<{ id: string; extractedData: Prisma.JsonValue; fileName: string }>({
      table: 'document',
      where: {
        orgId,
        documentType: { in: ['CONTRACT', 'POLICY', 'CERTIFICATE'] },
        agentProcessed: true,
      },
      select: {
        id: true,
        fileName: true,
        extractedData: true,
      },
    });

    if (!result.success) {
      return { contracts: [] };
    }

    // Filter contracts by expiration date
    const expiringContracts = result.records.filter(record => {
      const extractedData = record.extractedData as Record<string, unknown>;
      const expirationDate = extractedData?.expiration_date;
      if (!expirationDate) return false;

      const expDate = new Date(expirationDate as string);
      return expDate <= futureDate && expDate >= new Date();
    });

    return {
      contracts: expiringContracts.map(c => ({
        id: c.id,
        fileName: c.fileName,
        ...(c.extractedData as Record<string, unknown>),
      })),
    };
  }

  /**
   * Get the Prisma model for a table
   */
  private getModel(table: LookupTable): unknown {
    const models: Record<LookupTable, unknown> = {
      document: prisma.document,
      pipelineItem: prisma.pipelineItem,
      intakeRequest: prisma.intakeRequest,
      task: prisma.task,
      users: prisma.users,
      organization: prisma.organization,
    };

    return models[table];
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a new DbLookupHandler instance
 */
export function createDbLookupHandler(config?: Partial<DbLookupHandlerConfig>): DbLookupHandler {
  return new DbLookupHandler(config);
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const dbLookupHandler = new DbLookupHandler();

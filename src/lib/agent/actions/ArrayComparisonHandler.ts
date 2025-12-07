/**
 * ArrayComparisonHandler - Action Executor for Array Comparison Operations
 *
 * Handles array comparison operations for operational agents including:
 * - Line item matching (PO vs packing slip)
 * - Quantity reconciliation
 * - Missing/extra item detection
 * - Discrepancy reporting
 *
 * @module actions/ArrayComparisonHandler
 * @version 1.0.0
 */

// =============================================================================
// TYPES
// =============================================================================

/**
 * A single line item for comparison
 */
export interface ComparisonItem {
  /** Unique identifier or key for matching */
  key: string;
  /** Quantity (if applicable) */
  quantity?: number;
  /** Description */
  description?: string;
  /** Unit price (if applicable) */
  unitPrice?: number;
  /** Additional properties */
  [property: string]: unknown;
}

/**
 * Input for array comparison operation
 */
export interface ArrayComparisonInput {
  /** Expected items (e.g., from PO) */
  expected: ComparisonItem[];
  /** Actual items (e.g., from packing slip) */
  actual: ComparisonItem[];
  /** Field to use for matching items */
  keyField: string;
  /** Fields to compare for differences */
  compareFields?: string[];
  /** Tolerance for quantity differences (percentage) */
  quantityTolerance?: number;
}

/**
 * Matched item with comparison details
 */
export interface MatchedItem {
  /** The expected item */
  expected: ComparisonItem;
  /** The actual item */
  actual: ComparisonItem;
  /** Whether quantities match */
  quantityMatches: boolean;
  /** Quantity difference (actual - expected) */
  quantityDifference?: number;
  /** Fields that differ */
  differingFields: string[];
  /** Whether within tolerance */
  withinTolerance: boolean;
}

/**
 * Result of an array comparison operation
 */
export interface ArrayComparisonResult {
  /** Whether the operation succeeded */
  success: boolean;
  /** Items that matched between arrays */
  matched: MatchedItem[];
  /** Items in expected but not in actual */
  missing: ComparisonItem[];
  /** Items in actual but not in expected */
  extra: ComparisonItem[];
  /** Summary statistics */
  summary: {
    /** Total expected items */
    expectedCount: number;
    /** Total actual items */
    actualCount: number;
    /** Number of matched items */
    matchedCount: number;
    /** Number of missing items */
    missingCount: number;
    /** Number of extra items */
    extraCount: number;
    /** Overall match percentage */
    matchPercentage: number;
    /** Whether all items match perfectly */
    isPerfectMatch: boolean;
    /** Total quantity expected */
    totalExpectedQuantity: number;
    /** Total quantity received */
    totalActualQuantity: number;
    /** Quantity discrepancy */
    quantityDiscrepancy: number;
  };
  /** Error message if operation failed */
  error?: string;
  /** Timestamp of the operation */
  timestamp: Date;
}

/**
 * Discrepancy report for logistics
 */
export interface DiscrepancyReport {
  /** Report ID */
  id: string;
  /** Whether there are any discrepancies */
  hasDiscrepancies: boolean;
  /** Type of discrepancy */
  type: 'NONE' | 'MISSING_ITEMS' | 'EXTRA_ITEMS' | 'QUANTITY_MISMATCH' | 'MULTIPLE';
  /** Severity level */
  severity: 'none' | 'low' | 'medium' | 'high';
  /** Human-readable summary */
  summary: string;
  /** Detailed issues */
  issues: Array<{
    itemKey: string;
    issueType: string;
    expected?: unknown;
    actual?: unknown;
    message: string;
  }>;
  /** Recommended action */
  recommendedAction: string;
}

/**
 * Configuration for ArrayComparisonHandler
 */
export interface ArrayComparisonHandlerConfig {
  /** Default quantity tolerance percentage */
  defaultQuantityTolerance: number;
  /** Default fields to compare */
  defaultCompareFields: string[];
}

// =============================================================================
// ERRORS
// =============================================================================

export class ArrayComparisonError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ArrayComparisonError';
  }
}

export class InvalidInputError extends ArrayComparisonError {
  constructor(message: string) {
    super(message, 'INVALID_INPUT');
  }
}

// =============================================================================
// DEFAULT CONFIGURATION
// =============================================================================

export const DEFAULT_COMPARISON_CONFIG: ArrayComparisonHandlerConfig = {
  defaultQuantityTolerance: 0, // Exact match by default
  defaultCompareFields: ['quantity', 'description', 'unitPrice'],
};

// =============================================================================
// ARRAY COMPARISON HANDLER CLASS
// =============================================================================

/**
 * Handler for array comparison operations used by operational agents
 */
export class ArrayComparisonHandler {
  private config: ArrayComparisonHandlerConfig;

  constructor(config: Partial<ArrayComparisonHandlerConfig> = {}) {
    this.config = { ...DEFAULT_COMPARISON_CONFIG, ...config };
  }

  /**
   * Compare two arrays of items
   */
  compare(input: ArrayComparisonInput): ArrayComparisonResult {
    try {
      const {
        expected,
        actual,
        keyField,
        compareFields = this.config.defaultCompareFields,
        quantityTolerance = this.config.defaultQuantityTolerance,
      } = input;

      // Validate input
      if (!Array.isArray(expected) || !Array.isArray(actual)) {
        throw new InvalidInputError('Expected and actual must be arrays');
      }

      if (!keyField) {
        throw new InvalidInputError('keyField is required');
      }

      // Create lookup maps
      const expectedMap = new Map<string, ComparisonItem>();
      const actualMap = new Map<string, ComparisonItem>();

      for (const item of expected) {
        const key = String(item[keyField] || item.key);
        expectedMap.set(key, item);
      }

      for (const item of actual) {
        const key = String(item[keyField] || item.key);
        actualMap.set(key, item);
      }

      // Find matched, missing, and extra items
      const matched: MatchedItem[] = [];
      const missing: ComparisonItem[] = [];
      const extra: ComparisonItem[] = [];

      // Check expected items
      for (const [key, expectedItem] of expectedMap) {
        const actualItem = actualMap.get(key);

        if (actualItem) {
          // Found a match - compare details
          const differingFields = this.findDifferingFields(expectedItem, actualItem, compareFields);
          const quantityDiff = (actualItem.quantity || 0) - (expectedItem.quantity || 0);
          const expectedQty = expectedItem.quantity || 0;
          const toleranceAmount = expectedQty * (quantityTolerance / 100);

          matched.push({
            expected: expectedItem,
            actual: actualItem,
            quantityMatches: Math.abs(quantityDiff) <= toleranceAmount,
            quantityDifference: quantityDiff,
            differingFields,
            withinTolerance: Math.abs(quantityDiff) <= toleranceAmount,
          });
        } else {
          // Item not found in actual
          missing.push(expectedItem);
        }
      }

      // Check for extra items in actual
      for (const [key, actualItem] of actualMap) {
        if (!expectedMap.has(key)) {
          extra.push(actualItem);
        }
      }

      // Calculate totals
      const totalExpectedQuantity = expected.reduce((sum, item) => sum + (item.quantity || 0), 0);
      const totalActualQuantity = actual.reduce((sum, item) => sum + (item.quantity || 0), 0);

      const isPerfectMatch =
        missing.length === 0 &&
        extra.length === 0 &&
        matched.every(m => m.quantityMatches && m.differingFields.length === 0);

      return {
        success: true,
        matched,
        missing,
        extra,
        summary: {
          expectedCount: expected.length,
          actualCount: actual.length,
          matchedCount: matched.length,
          missingCount: missing.length,
          extraCount: extra.length,
          matchPercentage: expected.length > 0 ? (matched.length / expected.length) * 100 : 100,
          isPerfectMatch,
          totalExpectedQuantity,
          totalActualQuantity,
          quantityDiscrepancy: totalActualQuantity - totalExpectedQuantity,
        },
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        matched: [],
        missing: [],
        extra: [],
        summary: {
          expectedCount: 0,
          actualCount: 0,
          matchedCount: 0,
          missingCount: 0,
          extraCount: 0,
          matchPercentage: 0,
          isPerfectMatch: false,
          totalExpectedQuantity: 0,
          totalActualQuantity: 0,
          quantityDiscrepancy: 0,
        },
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Compare PO line items with packing slip items
   */
  comparePOToPackingSlip(params: {
    poLineItems: Array<{
      itemNumber: string;
      description: string;
      quantity: number;
      unitPrice?: number;
    }>;
    packingSlipItems: Array<{
      itemNumber: string;
      description: string;
      quantity: number;
    }>;
  }): ArrayComparisonResult {
    const expected = params.poLineItems.map(item => ({
      key: item.itemNumber,
      ...item,
    }));

    const actual = params.packingSlipItems.map(item => ({
      key: item.itemNumber,
      ...item,
    }));

    return this.compare({
      expected,
      actual,
      keyField: 'itemNumber',
      compareFields: ['quantity', 'description'],
      quantityTolerance: 0, // Exact match for receiving
    });
  }

  /**
   * Generate a discrepancy report
   */
  generateDiscrepancyReport(comparisonResult: ArrayComparisonResult): DiscrepancyReport {
    const { matched, missing, extra, summary } = comparisonResult;

    // Determine discrepancy type
    let type: DiscrepancyReport['type'] = 'NONE';
    if (missing.length > 0 && extra.length > 0) {
      type = 'MULTIPLE';
    } else if (missing.length > 0) {
      type = 'MISSING_ITEMS';
    } else if (extra.length > 0) {
      type = 'EXTRA_ITEMS';
    } else if (matched.some(m => !m.quantityMatches)) {
      type = 'QUANTITY_MISMATCH';
    }

    // Determine severity
    let severity: DiscrepancyReport['severity'] = 'none';
    const discrepancyPercent = Math.abs(summary.quantityDiscrepancy / summary.totalExpectedQuantity) * 100;

    if (type !== 'NONE') {
      if (discrepancyPercent > 20 || missing.length > summary.expectedCount * 0.2) {
        severity = 'high';
      } else if (discrepancyPercent > 10 || missing.length > summary.expectedCount * 0.1) {
        severity = 'medium';
      } else {
        severity = 'low';
      }
    }

    // Collect issues
    const issues: DiscrepancyReport['issues'] = [];

    for (const item of missing) {
      issues.push({
        itemKey: item.key,
        issueType: 'MISSING',
        expected: item.quantity,
        actual: 0,
        message: `Item ${item.key} not received (expected: ${item.quantity})`,
      });
    }

    for (const item of extra) {
      issues.push({
        itemKey: item.key,
        issueType: 'EXTRA',
        expected: 0,
        actual: item.quantity,
        message: `Unexpected item ${item.key} received (quantity: ${item.quantity})`,
      });
    }

    for (const match of matched) {
      if (!match.quantityMatches) {
        issues.push({
          itemKey: match.expected.key,
          issueType: 'QUANTITY_MISMATCH',
          expected: match.expected.quantity,
          actual: match.actual.quantity,
          message: `Item ${match.expected.key}: expected ${match.expected.quantity}, received ${match.actual.quantity}`,
        });
      }
    }

    // Generate summary and recommendation
    let summaryText = '';
    let recommendedAction = '';

    if (type === 'NONE') {
      summaryText = 'All items received match the purchase order.';
      recommendedAction = 'Proceed with stocking items.';
    } else {
      summaryText = `Found ${issues.length} discrepanc${issues.length === 1 ? 'y' : 'ies'}: `;
      summaryText += `${missing.length} missing, ${extra.length} extra, `;
      summaryText += `${matched.filter(m => !m.quantityMatches).length} quantity mismatches.`;

      if (severity === 'high') {
        recommendedAction = 'Contact vendor immediately. Hold shipment for review.';
      } else if (severity === 'medium') {
        recommendedAction = 'Flag for supervisor review before stocking.';
      } else {
        recommendedAction = 'Note discrepancy and proceed with adjusted quantities.';
      }
    }

    return {
      id: `DR-${Date.now()}`,
      hasDiscrepancies: type !== 'NONE',
      type,
      severity,
      summary: summaryText,
      issues,
      recommendedAction,
    };
  }

  /**
   * Find fields that differ between two items
   */
  private findDifferingFields(
    expected: ComparisonItem,
    actual: ComparisonItem,
    fields: string[]
  ): string[] {
    return fields.filter(field => {
      const expectedValue = expected[field];
      const actualValue = actual[field];

      // Handle undefined/null
      if (expectedValue === undefined && actualValue === undefined) return false;
      if (expectedValue === null && actualValue === null) return false;

      // Handle numbers with tolerance
      if (typeof expectedValue === 'number' && typeof actualValue === 'number') {
        return Math.abs(expectedValue - actualValue) > 0.001;
      }

      // Handle strings (case-insensitive for descriptions)
      if (typeof expectedValue === 'string' && typeof actualValue === 'string') {
        if (field === 'description') {
          return expectedValue.toLowerCase().trim() !== actualValue.toLowerCase().trim();
        }
        return expectedValue !== actualValue;
      }

      return expectedValue !== actualValue;
    });
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a new ArrayComparisonHandler instance
 */
export function createArrayComparisonHandler(config?: Partial<ArrayComparisonHandlerConfig>): ArrayComparisonHandler {
  return new ArrayComparisonHandler(config);
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const arrayComparisonHandler = new ArrayComparisonHandler();

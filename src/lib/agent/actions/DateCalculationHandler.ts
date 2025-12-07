/**
 * DateCalculationHandler - Action Executor for Date Calculation Operations
 *
 * Handles date-related calculations for operational agents including:
 * - Due date calculation
 * - Renewal window calculations
 * - Expiration alerts
 * - SLA deadline computations
 *
 * @module actions/DateCalculationHandler
 * @version 1.0.0
 */

// =============================================================================
// TYPES
// =============================================================================

/**
 * Date operation types
 */
export type DateOperation = 'add' | 'subtract' | 'diff' | 'startOf' | 'endOf';

/**
 * Time units for date operations
 */
export type TimeUnit = 'days' | 'weeks' | 'months' | 'years' | 'hours' | 'minutes';

/**
 * Input for date calculation operation
 */
export interface DateCalculationInput {
  /** Base date (ISO string or Date) */
  baseDate: string | Date;
  /** Operation to perform */
  operation: DateOperation;
  /** Value for add/subtract operations */
  value?: number;
  /** Unit for the operation */
  unit?: TimeUnit;
  /** Second date for diff operation */
  compareDate?: string | Date;
}

/**
 * Result of a date calculation operation
 */
export interface DateCalculationResult {
  /** Whether the operation succeeded */
  success: boolean;
  /** Resulting date (for add/subtract/startOf/endOf) */
  resultDate?: Date;
  /** ISO string of result date */
  resultDateISO?: string;
  /** Difference value (for diff operation) */
  diffValue?: number;
  /** Unit used for difference */
  diffUnit?: TimeUnit;
  /** Error message if operation failed */
  error?: string;
  /** Timestamp of the operation */
  timestamp: Date;
}

/**
 * Alert threshold configuration
 */
export interface AlertThreshold {
  /** Days before expiration to trigger alert */
  days: number;
  /** Alert level */
  level: 'info' | 'warning' | 'critical';
  /** Action to take */
  action: string;
}

/**
 * Expiration check result
 */
export interface ExpirationCheckResult {
  /** Whether the date is in the past */
  isExpired: boolean;
  /** Whether expiration is within alert window */
  isExpiringSoon: boolean;
  /** Days until/since expiration (negative if past) */
  daysUntilExpiration: number;
  /** Triggered alert threshold if any */
  triggeredThreshold?: AlertThreshold;
  /** Suggested action based on threshold */
  suggestedAction?: string;
}

/**
 * Configuration for DateCalculationHandler
 */
export interface DateCalculationHandlerConfig {
  /** Default alert thresholds for expiration checks */
  defaultThresholds: AlertThreshold[];
  /** Timezone for date operations */
  timezone: string;
}

// =============================================================================
// ERRORS
// =============================================================================

export class DateCalculationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'DateCalculationError';
  }
}

export class InvalidDateError extends DateCalculationError {
  constructor(dateValue: unknown) {
    super(`Invalid date value: ${dateValue}`, 'INVALID_DATE', { dateValue });
  }
}

// =============================================================================
// DEFAULT CONFIGURATION
// =============================================================================

export const DEFAULT_DATE_CONFIG: DateCalculationHandlerConfig = {
  defaultThresholds: [
    { days: 90, level: 'info', action: 'SEND_NOTIFICATION' },
    { days: 60, level: 'warning', action: 'CREATE_TASK' },
    { days: 30, level: 'critical', action: 'ESCALATE' },
  ],
  timezone: 'UTC',
};

// =============================================================================
// DATE CALCULATION HANDLER CLASS
// =============================================================================

/**
 * Handler for date calculation operations used by operational agents
 */
export class DateCalculationHandler {
  private config: DateCalculationHandlerConfig;

  constructor(config: Partial<DateCalculationHandlerConfig> = {}) {
    this.config = { ...DEFAULT_DATE_CONFIG, ...config };
  }

  /**
   * Perform a date calculation
   */
  calculate(input: DateCalculationInput): DateCalculationResult {
    try {
      const baseDate = this.parseDate(input.baseDate);
      const { operation, value, unit, compareDate } = input;

      let resultDate: Date | undefined;
      let diffValue: number | undefined;

      switch (operation) {
        case 'add':
          if (value === undefined || !unit) {
            throw new DateCalculationError('Value and unit required for add operation', 'MISSING_PARAMS');
          }
          resultDate = this.addTime(baseDate, value, unit);
          break;

        case 'subtract':
          if (value === undefined || !unit) {
            throw new DateCalculationError('Value and unit required for subtract operation', 'MISSING_PARAMS');
          }
          resultDate = this.addTime(baseDate, -value, unit);
          break;

        case 'diff':
          if (!compareDate) {
            throw new DateCalculationError('Compare date required for diff operation', 'MISSING_PARAMS');
          }
          const targetDate = this.parseDate(compareDate);
          diffValue = this.calculateDiff(baseDate, targetDate, unit || 'days');
          break;

        case 'startOf':
          resultDate = this.getStartOf(baseDate, unit || 'days');
          break;

        case 'endOf':
          resultDate = this.getEndOf(baseDate, unit || 'days');
          break;

        default:
          throw new DateCalculationError(`Unknown operation: ${operation}`, 'UNKNOWN_OPERATION');
      }

      return {
        success: true,
        resultDate,
        resultDateISO: resultDate?.toISOString(),
        diffValue,
        diffUnit: unit,
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Calculate payment due date based on invoice terms
   */
  calculateDueDate(params: {
    invoiceDate: string | Date;
    paymentTermsDays: number;
  }): DateCalculationResult {
    return this.calculate({
      baseDate: params.invoiceDate,
      operation: 'add',
      value: params.paymentTermsDays,
      unit: 'days',
    });
  }

  /**
   * Calculate renewal reminder dates
   */
  calculateRenewalReminders(params: {
    expirationDate: string | Date;
    reminderDays: number[];
  }): { reminders: Array<{ date: Date; daysBeforeExpiration: number }> } {
    const expDate = this.parseDate(params.expirationDate);
    const reminders = params.reminderDays
      .sort((a, b) => b - a)
      .map(days => ({
        date: this.addTime(expDate, -days, 'days'),
        daysBeforeExpiration: days,
      }));

    return { reminders };
  }

  /**
   * Check expiration status against thresholds
   */
  checkExpiration(params: {
    expirationDate: string | Date;
    thresholds?: AlertThreshold[];
  }): ExpirationCheckResult {
    const expDate = this.parseDate(params.expirationDate);
    const now = new Date();
    const thresholds = params.thresholds || this.config.defaultThresholds;

    const diffMs = expDate.getTime() - now.getTime();
    const daysUntilExpiration = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    const isExpired = daysUntilExpiration < 0;

    // Find triggered threshold (first one where days >= daysUntilExpiration)
    const sortedThresholds = [...thresholds].sort((a, b) => a.days - b.days);
    const triggeredThreshold = sortedThresholds.find(t => t.days >= daysUntilExpiration && daysUntilExpiration >= 0);

    return {
      isExpired,
      isExpiringSoon: !isExpired && triggeredThreshold !== undefined,
      daysUntilExpiration,
      triggeredThreshold,
      suggestedAction: triggeredThreshold?.action,
    };
  }

  /**
   * Calculate SLA deadline
   */
  calculateSLADeadline(params: {
    createdAt: string | Date;
    slaHours: number;
    excludeWeekends?: boolean;
  }): DateCalculationResult {
    const startDate = this.parseDate(params.createdAt);
    let deadline = this.addTime(startDate, params.slaHours, 'hours');

    if (params.excludeWeekends) {
      // Skip weekends
      while (deadline.getDay() === 0 || deadline.getDay() === 6) {
        deadline = this.addTime(deadline, 1, 'days');
      }
    }

    return {
      success: true,
      resultDate: deadline,
      resultDateISO: deadline.toISOString(),
      timestamp: new Date(),
    };
  }

  /**
   * Parse a date from various formats
   */
  private parseDate(date: string | Date): Date {
    if (date instanceof Date) {
      if (isNaN(date.getTime())) {
        throw new InvalidDateError(date);
      }
      return date;
    }

    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      throw new InvalidDateError(date);
    }
    return parsed;
  }

  /**
   * Add time to a date
   */
  private addTime(date: Date, value: number, unit: TimeUnit): Date {
    const result = new Date(date);

    switch (unit) {
      case 'minutes':
        result.setMinutes(result.getMinutes() + value);
        break;
      case 'hours':
        result.setHours(result.getHours() + value);
        break;
      case 'days':
        result.setDate(result.getDate() + value);
        break;
      case 'weeks':
        result.setDate(result.getDate() + value * 7);
        break;
      case 'months':
        result.setMonth(result.getMonth() + value);
        break;
      case 'years':
        result.setFullYear(result.getFullYear() + value);
        break;
    }

    return result;
  }

  /**
   * Calculate difference between two dates
   */
  private calculateDiff(date1: Date, date2: Date, unit: TimeUnit): number {
    const diffMs = date2.getTime() - date1.getTime();

    switch (unit) {
      case 'minutes':
        return Math.floor(diffMs / (1000 * 60));
      case 'hours':
        return Math.floor(diffMs / (1000 * 60 * 60));
      case 'days':
        return Math.floor(diffMs / (1000 * 60 * 60 * 24));
      case 'weeks':
        return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
      case 'months':
        return (date2.getFullYear() - date1.getFullYear()) * 12 + (date2.getMonth() - date1.getMonth());
      case 'years':
        return date2.getFullYear() - date1.getFullYear();
      default:
        return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    }
  }

  /**
   * Get start of period
   */
  private getStartOf(date: Date, unit: TimeUnit): Date {
    const result = new Date(date);

    switch (unit) {
      case 'days':
        result.setHours(0, 0, 0, 0);
        break;
      case 'weeks':
        result.setDate(result.getDate() - result.getDay());
        result.setHours(0, 0, 0, 0);
        break;
      case 'months':
        result.setDate(1);
        result.setHours(0, 0, 0, 0);
        break;
      case 'years':
        result.setMonth(0, 1);
        result.setHours(0, 0, 0, 0);
        break;
    }

    return result;
  }

  /**
   * Get end of period
   */
  private getEndOf(date: Date, unit: TimeUnit): Date {
    const result = new Date(date);

    switch (unit) {
      case 'days':
        result.setHours(23, 59, 59, 999);
        break;
      case 'weeks':
        result.setDate(result.getDate() + (6 - result.getDay()));
        result.setHours(23, 59, 59, 999);
        break;
      case 'months':
        result.setMonth(result.getMonth() + 1, 0);
        result.setHours(23, 59, 59, 999);
        break;
      case 'years':
        result.setMonth(11, 31);
        result.setHours(23, 59, 59, 999);
        break;
    }

    return result;
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a new DateCalculationHandler instance
 */
export function createDateCalculationHandler(config?: Partial<DateCalculationHandlerConfig>): DateCalculationHandler {
  return new DateCalculationHandler(config);
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const dateCalculationHandler = new DateCalculationHandler();

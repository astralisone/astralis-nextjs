/**
 * Query Error Handling Utilities
 *
 * Centralized error handling for API requests and mutations.
 * Provides consistent error formatting and user-friendly messages.
 */

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

/**
 * Transform fetch errors into structured ApiError format
 */
export function parseApiError(error: unknown): ApiError {
  // Network or fetch errors
  if (error instanceof TypeError) {
    return {
      message: 'Network error. Please check your connection.',
      code: 'NETWORK_ERROR',
    };
  }

  // HTTP errors
  if (error instanceof Response) {
    return {
      message: `Request failed with status ${error.status}`,
      status: error.status,
      code: 'HTTP_ERROR',
    };
  }

  // Structured API errors (from our backend)
  if (error && typeof error === 'object' && 'message' in error) {
    return {
      message: String(error.message),
      status: 'status' in error ? Number(error.status) : undefined,
      code: 'code' in error ? String(error.code) : undefined,
      details: 'details' in error ? error.details : undefined,
    };
  }

  // Generic errors
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
    };
  }

  // Fallback
  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  };
}

/**
 * Get user-friendly error message based on error type
 */
export function getUserFriendlyMessage(error: ApiError): string {
  // Network errors
  if (error.code === 'NETWORK_ERROR') {
    return 'Unable to connect. Please check your internet connection.';
  }

  // Authentication errors
  if (error.status === 401) {
    return 'Your session has expired. Please sign in again.';
  }

  // Authorization errors
  if (error.status === 403) {
    return "You don't have permission to perform this action.";
  }

  // Not found errors
  if (error.status === 404) {
    return 'The requested resource was not found.';
  }

  // Validation errors
  if (error.status === 400) {
    return error.message || 'Invalid request. Please check your input.';
  }

  // Conflict errors
  if (error.status === 409) {
    return error.message || 'This action conflicts with existing data.';
  }

  // Rate limiting
  if (error.status === 429) {
    return 'Too many requests. Please try again later.';
  }

  // Server errors
  if (error.status && error.status >= 500) {
    return 'Server error. Our team has been notified.';
  }

  // Default to original message
  return error.message || 'An unexpected error occurred';
}

/**
 * Determine if error is retryable
 */
export function isRetryableError(error: ApiError): boolean {
  // Retry on network errors
  if (error.code === 'NETWORK_ERROR') {
    return true;
  }

  // Retry on server errors (5xx)
  if (error.status && error.status >= 500) {
    return true;
  }

  // Retry on rate limiting (with backoff)
  if (error.status === 429) {
    return true;
  }

  // Don't retry client errors (4xx)
  return false;
}

/**
 * Log error for debugging and monitoring
 *
 * Logs to console in development and sends to Sentry in production.
 * Includes structured context for better debugging.
 */
export function logError(error: ApiError, context?: string) {
  const logData = {
    timestamp: new Date().toISOString(),
    context,
    error: {
      message: error.message,
      status: error.status,
      code: error.code,
      details: error.details,
    },
  };

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('[API Error]', logData);
  }

  // In production, send to Sentry (Phase 3: Task 3.4)
  // Import is dynamic to avoid errors if @sentry/nextjs is not installed
  if (process.env.NODE_ENV === 'production') {
    try {
      // Dynamic import to avoid build errors if Sentry is not installed
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { captureException } = require('@/lib/monitoring/sentry');

      // Capture the error with context
      captureException(
        error instanceof Error ? error : new Error(error.message),
        {
          operation: context || 'api_request',
          metadata: {
            status: error.status,
            code: error.code,
            details: error.details,
            timestamp: logData.timestamp,
          },
          tags: {
            error_type: error.code || 'unknown',
            http_status: error.status?.toString() || 'unknown',
          },
        }
      );
    } catch (sentryError) {
      // Silently fail if Sentry is not available
      // This allows the app to work without Sentry installed
      console.error('[Sentry Error]', sentryError);
    }
  }
}

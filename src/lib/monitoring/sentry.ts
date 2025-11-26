/**
 * Sentry Error Monitoring Utilities
 *
 * Centralized error tracking and monitoring functions using Sentry.
 * Provides helpers for exception capture, user context, breadcrumbs,
 * and error tracking wrappers.
 *
 * Installation:
 * npm install @sentry/nextjs
 * npx @sentry/wizard@latest -i nextjs
 *
 * Environment Variables Required:
 * - SENTRY_DSN (server-side)
 * - NEXT_PUBLIC_SENTRY_DSN (client-side)
 * - SENTRY_AUTH_TOKEN (for source maps upload)
 * - SENTRY_ORG (your Sentry organization slug)
 * - SENTRY_PROJECT (your Sentry project slug)
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from '@sentry/nextjs';

/**
 * User context for error tracking
 */
export interface SentryUser {
  id: string;
  email?: string;
  username?: string;
  orgId?: string;
  role?: string;
}

/**
 * Error context for additional debugging information
 */
export interface ErrorContext {
  userId?: string;
  orgId?: string;
  operation?: string;
  metadata?: Record<string, unknown>;
  tags?: Record<string, string>;
}

/**
 * Capture an exception with additional context
 *
 * @param error - The error to capture (Error object or unknown)
 * @param context - Additional context for debugging
 *
 * @example
 * try {
 *   await createUser(data);
 * } catch (error) {
 *   captureException(error, {
 *     userId: session.user.id,
 *     orgId: session.user.orgId,
 *     operation: 'createUser',
 *     metadata: { email: data.email },
 *   });
 *   throw error;
 * }
 */
export function captureException(
  error: Error | unknown,
  context?: ErrorContext
): void {
  Sentry.captureException(error, {
    tags: {
      operation: context?.operation,
      ...context?.tags,
    },
    user: context?.userId
      ? {
          id: context.userId,
          orgId: context.orgId,
        }
      : undefined,
    extra: context?.metadata,
  });
}

/**
 * Capture a message with severity level
 *
 * Use this for non-error events that you want to track,
 * such as warnings or important state changes.
 *
 * @param message - The message to log
 * @param level - Severity level (info, warning, error)
 * @param context - Additional context data
 *
 * @example
 * captureMessage('User attempted invalid action', 'warning', {
 *   userId: user.id,
 *   action: 'deleteProtectedResource',
 * });
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, unknown>
): void {
  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

/**
 * Set user context for all subsequent errors
 *
 * Call this after successful authentication to associate
 * all errors with the current user.
 *
 * @param user - User information to track
 *
 * @example
 * // After successful login
 * setUserContext({
 *   id: session.user.id,
 *   email: session.user.email,
 *   orgId: session.user.orgId,
 *   role: session.user.role,
 * });
 */
export function setUserContext(user: SentryUser): void {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
    orgId: user.orgId,
    role: user.role,
  });
}

/**
 * Clear user context (on logout)
 *
 * Call this when the user logs out to ensure subsequent
 * errors are not associated with the logged-out user.
 *
 * @example
 * // After logout
 * clearUserContext();
 */
export function clearUserContext(): void {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 *
 * Breadcrumbs are a trail of events leading up to an error.
 * Use them to track important actions or state changes.
 *
 * @param message - Breadcrumb message
 * @param category - Category for filtering (e.g., 'auth', 'api', 'ui')
 * @param data - Additional data to attach
 * @param level - Severity level
 *
 * @example
 * addBreadcrumb('User clicked delete button', 'ui', {
 *   resourceId: resource.id,
 *   resourceType: 'engagement',
 * });
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info'
): void {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Wrap an async function with error tracking
 *
 * Automatically captures and re-throws errors with context.
 * Use this to wrap critical async operations.
 *
 * @param operation - Name of the operation (for tracking)
 * @param fn - Async function to wrap
 * @param context - Additional context to attach on error
 * @returns Result of the function or throws error
 *
 * @example
 * const result = await withErrorTracking(
 *   'createEngagement',
 *   () => engagementService.create(data),
 *   { userId: user.id, orgId: user.orgId }
 * );
 */
export async function withErrorTracking<T>(
  operation: string,
  fn: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    captureException(error, { operation, metadata: context });
    throw error;
  }
}

/**
 * Wrap a sync function with error tracking
 *
 * Automatically captures and re-throws errors with context.
 * Use this to wrap critical sync operations.
 *
 * @param operation - Name of the operation (for tracking)
 * @param fn - Function to wrap
 * @param context - Additional context to attach on error
 * @returns Result of the function or throws error
 *
 * @example
 * const result = withErrorTrackingSync(
 *   'parseUserInput',
 *   () => JSON.parse(input),
 *   { input }
 * );
 */
export function withErrorTrackingSync<T>(
  operation: string,
  fn: () => T,
  context?: Record<string, unknown>
): T {
  try {
    return fn();
  } catch (error) {
    captureException(error, { operation, metadata: context });
    throw error;
  }
}

/**
 * Create a transaction for performance monitoring
 *
 * Use this to track the performance of critical operations.
 *
 * @param name - Transaction name
 * @param op - Operation type (e.g., 'http.server', 'db.query')
 * @param callback - Function to execute within the transaction
 * @returns Result of the callback
 *
 * @example
 * const result = await withTransaction(
 *   'createEngagement',
 *   'service.create',
 *   async (transaction) => {
 *     transaction.setTag('userId', user.id);
 *     return await engagementService.create(data);
 *   }
 * );
 */
export async function withTransaction<T>(
  name: string,
  op: string,
  callback: (transaction: Sentry.Transaction) => Promise<T>
): Promise<T> {
  const transaction = Sentry.startTransaction({ name, op });

  try {
    const result = await callback(transaction);
    transaction.setStatus('ok');
    return result;
  } catch (error) {
    transaction.setStatus('internal_error');
    throw error;
  } finally {
    transaction.finish();
  }
}

/**
 * Set custom tags for filtering and grouping
 *
 * @param tags - Key-value pairs of tags
 *
 * @example
 * setTags({
 *   feature: 'engagements',
 *   environment: process.env.NODE_ENV,
 * });
 */
export function setTags(tags: Record<string, string>): void {
  Object.entries(tags).forEach(([key, value]) => {
    Sentry.setTag(key, value);
  });
}

/**
 * Set custom context for debugging
 *
 * @param name - Context name
 * @param data - Context data
 *
 * @example
 * setContext('engagement', {
 *   id: engagement.id,
 *   status: engagement.status,
 *   companyId: engagement.companyId,
 * });
 */
export function setContext(name: string, data: Record<string, unknown>): void {
  Sentry.setContext(name, data);
}

/**
 * Check if Sentry is enabled
 *
 * @returns True if Sentry is initialized and enabled
 *
 * @example
 * if (isSentryEnabled()) {
 *   captureException(error);
 * }
 */
export function isSentryEnabled(): boolean {
  return (
    process.env.NODE_ENV === 'production' ||
    process.env.SENTRY_DEBUG === 'true'
  );
}

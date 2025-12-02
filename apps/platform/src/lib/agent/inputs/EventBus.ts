/**
 * AgentEventBus - Typed event bus for agent system events
 *
 * Features:
 * - Singleton pattern for global event coordination
 * - Async event handling with error isolation
 * - Event history and replay capability
 * - Wildcard listeners for debugging/logging
 * - Type-safe event payloads using AgentEvent wrapper
 */

import type {
  AgentEventType,
  AgentEvent,
  EventHandler,
  EventSubscription,
  AgentInputSource,
} from '../types/agent.types';

// Simple UUID v4 generator (crypto-safe when available)
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_HISTORY_SIZE = 100;
const WILDCARD_EVENT = '*' as const;

// =============================================================================
// Logger Interface (internal)
// =============================================================================

interface Logger {
  debug(message: string, data?: Record<string, unknown>): void;
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void;
}

/**
 * Default console-based logger implementation
 */
const isDevelopment = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';

const defaultLogger: Logger = {
  debug: (message: string, data?: Record<string, unknown>) => {
    if (isDevelopment) {
      console.debug(`[EventBus] ${message}`, data ?? '');
    }
  },
  info: (message: string, data?: Record<string, unknown>) => {
    console.info(`[EventBus] ${message}`, data ?? '');
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    console.warn(`[EventBus] ${message}`, data ?? '');
  },
  error: (message: string, error?: Error | unknown, data?: Record<string, unknown>) => {
    console.error(`[EventBus] ${message}`, error, data ?? '');
  },
};

// =============================================================================
// Event Bus Configuration
// =============================================================================

export interface EventBusConfig {
  /** Maximum number of events to store in history */
  historySize?: number;
  /** Custom logger implementation */
  logger?: Logger;
  /** Enable debug logging */
  debug?: boolean;
  /** Default organization ID */
  defaultOrgId?: string;
}

// =============================================================================
// Handler Result Types
// =============================================================================

interface HandlerResult {
  subscriptionId: string;
  success: boolean;
  error?: Error;
  executionTimeMs: number;
}

export interface EmitResult {
  eventType: AgentEventType;
  eventId: string;
  timestamp: Date;
  handlersInvoked: number;
  results: HandlerResult[];
  errors: Error[];
}

// =============================================================================
// Stored Event for History
// =============================================================================

interface StoredEvent<T = unknown> {
  id: string;
  event: AgentEvent<T>;
  timestamp: Date;
  processed: boolean;
  handlersInvoked: number;
  errors?: string[];
}

// =============================================================================
// AgentEventBus Class
// =============================================================================

/**
 * Singleton event bus for agent system events
 *
 * @example
 * ```typescript
 * const eventBus = AgentEventBus.getInstance();
 *
 * // Subscribe to specific event
 * const subId = eventBus.on('intake:created', async (event) => {
 *   console.log('New intake:', event.payload);
 * });
 *
 * // Subscribe to all events (wildcard)
 * eventBus.onAny((event) => {
 *   console.log(`Event ${event.type}:`, event.payload);
 * });
 *
 * // Emit event
 * await eventBus.emit('intake:created', {
 *   intakeId: 'int-456',
 *   type: 'contact',
 *   data: { name: 'John Doe' }
 * });
 * ```
 */
export class AgentEventBus {
  private static instance: AgentEventBus | null = null;

  // Subscription storage
  private subscriptions: Map<AgentEventType | typeof WILDCARD_EVENT, Map<string, EventSubscription>>;

  // Event history for replay
  private eventHistory: StoredEvent[];
  private historySize: number;

  // Configuration
  private logger: Logger;
  private debug: boolean;
  private defaultOrgId?: string;

  // Statistics
  private stats: {
    totalEventsEmitted: number;
    totalHandlersInvoked: number;
    totalErrors: number;
    eventCounts: Map<AgentEventType, number>;
  };

  // ==========================================================================
  // Constructor & Singleton
  // ==========================================================================

  private constructor(config: EventBusConfig = {}) {
    this.subscriptions = new Map();
    this.eventHistory = [];
    this.historySize = config.historySize ?? DEFAULT_HISTORY_SIZE;
    this.logger = config.logger ?? defaultLogger;
    this.debug = config.debug ?? false;
    this.defaultOrgId = config.defaultOrgId;

    this.stats = {
      totalEventsEmitted: 0,
      totalHandlersInvoked: 0,
      totalErrors: 0,
      eventCounts: new Map(),
    };

    this.logger.info('EventBus initialized', { historySize: this.historySize });
  }

  /**
   * Get the singleton instance of AgentEventBus
   */
  public static getInstance(config?: EventBusConfig): AgentEventBus {
    if (!AgentEventBus.instance) {
      AgentEventBus.instance = new AgentEventBus(config);
    }
    return AgentEventBus.instance;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  public static resetInstance(): void {
    if (AgentEventBus.instance) {
      AgentEventBus.instance.removeAllListeners();
      AgentEventBus.instance = null;
    }
  }

  // ==========================================================================
  // Event Registration
  // ==========================================================================

  /**
   * Register a handler for a specific event type
   *
   * @param eventType - The event type to listen for
   * @param handler - The handler function to invoke
   * @returns A subscription ID that can be used to unsubscribe
   */
  public on<T = unknown>(
    eventType: AgentEventType,
    handler: EventHandler<T>
  ): string {
    const subscriptionId = this.generateSubscriptionId();

    const subscription: EventSubscription = {
      eventType,
      handler: handler as EventHandler,
      subscriptionId,
      once: false,
    };

    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, new Map());
    }

    this.subscriptions.get(eventType)!.set(subscriptionId, subscription);

    if (this.debug) {
      this.logger.debug(`Handler registered for event "${eventType}"`, { subscriptionId });
    }

    return subscriptionId;
  }

  /**
   * Register a handler that fires once and then removes itself
   *
   * @param eventType - The event type to listen for
   * @param handler - The handler function to invoke
   * @returns A subscription ID that can be used to unsubscribe early
   */
  public once<T = unknown>(
    eventType: AgentEventType,
    handler: EventHandler<T>
  ): string {
    const subscriptionId = this.generateSubscriptionId();

    const subscription: EventSubscription = {
      eventType,
      handler: handler as EventHandler,
      subscriptionId,
      once: true,
    };

    if (!this.subscriptions.has(eventType)) {
      this.subscriptions.set(eventType, new Map());
    }

    this.subscriptions.get(eventType)!.set(subscriptionId, subscription);

    if (this.debug) {
      this.logger.debug(`Once handler registered for event "${eventType}"`, { subscriptionId });
    }

    return subscriptionId;
  }

  /**
   * Register a wildcard handler that receives all events
   *
   * @param handler - The handler function to invoke for all events
   * @returns A subscription ID that can be used to unsubscribe
   */
  public onAny<T = unknown>(handler: EventHandler<T>): string {
    const subscriptionId = this.generateSubscriptionId();

    const subscription: EventSubscription = {
      eventType: '*',
      handler: handler as EventHandler,
      subscriptionId,
      once: false,
    };

    if (!this.subscriptions.has(WILDCARD_EVENT)) {
      this.subscriptions.set(WILDCARD_EVENT, new Map());
    }

    this.subscriptions.get(WILDCARD_EVENT)!.set(subscriptionId, subscription);

    if (this.debug) {
      this.logger.debug('Wildcard handler registered', { subscriptionId });
    }

    return subscriptionId;
  }

  /**
   * Unregister a handler by its subscription ID
   *
   * @param subscriptionId - The subscription ID returned from on(), once(), or onAny()
   * @returns True if the subscription was found and removed
   */
  public off(subscriptionId: string): boolean {
    for (const [, handlers] of this.subscriptions) {
      if (handlers.has(subscriptionId)) {
        handlers.delete(subscriptionId);
        if (this.debug) {
          this.logger.debug('Handler removed', { subscriptionId });
        }
        return true;
      }
    }
    return false;
  }

  /**
   * Remove all listeners for a specific event or all events
   *
   * @param eventType - Optional event type to clear. If omitted, clears all handlers.
   */
  public removeAllListeners(eventType?: AgentEventType): void {
    if (eventType) {
      this.subscriptions.delete(eventType);
      this.logger.info(`All handlers removed for event "${eventType}"`);
    } else {
      this.subscriptions.clear();
      this.logger.info('All handlers removed');
    }
  }

  // ==========================================================================
  // Event Emission
  // ==========================================================================

  /**
   * Emit an event to all registered handlers
   *
   * Handlers are executed concurrently with error isolation - one handler's
   * failure does not prevent other handlers from executing.
   *
   * @param eventType - The event type to emit
   * @param payload - The event payload
   * @param options - Additional event options
   * @returns Result containing handler outcomes and any errors
   */
  public async emit<T = unknown>(
    eventType: AgentEventType,
    payload: T,
    options?: {
      source?: AgentInputSource | 'agent' | 'system';
      correlationId?: string;
      orgId?: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<EmitResult> {
    const eventId = generateUUID();
    const timestamp = new Date();
    const results: HandlerResult[] = [];
    const errors: Error[] = [];

    // Create the AgentEvent wrapper
    const event: AgentEvent<T> = {
      type: eventType,
      payload,
      timestamp,
      source: options?.source ?? 'system',
      eventId,
      correlationId: options?.correlationId,
      orgId: options?.orgId ?? this.defaultOrgId,
      metadata: options?.metadata,
    };

    // Update stats
    this.stats.totalEventsEmitted++;
    this.stats.eventCounts.set(
      eventType,
      (this.stats.eventCounts.get(eventType) ?? 0) + 1
    );

    if (this.debug) {
      this.logger.debug(`Emitting event "${eventType}"`, {
        eventId,
        source: event.source,
      });
    }

    // Collect all subscriptions to invoke
    const subscriptionsToInvoke: EventSubscription[] = [];

    // Add specific event handlers
    const eventHandlers = this.subscriptions.get(eventType);
    if (eventHandlers) {
      for (const subscription of eventHandlers.values()) {
        subscriptionsToInvoke.push(subscription);
      }
    }

    // Add wildcard handlers
    const wildcardHandlers = this.subscriptions.get(WILDCARD_EVENT);
    if (wildcardHandlers) {
      for (const subscription of wildcardHandlers.values()) {
        subscriptionsToInvoke.push(subscription);
      }
    }

    // Track once handlers to remove after execution
    const onceHandlersToRemove: string[] = [];

    // Execute all handlers concurrently with error isolation
    const handlerPromises = subscriptionsToInvoke.map(async (subscription) => {
      const startTime = Date.now();
      try {
        await subscription.handler(event);
        this.stats.totalHandlersInvoked++;

        // Mark once handlers for removal
        if (subscription.once) {
          onceHandlersToRemove.push(subscription.subscriptionId);
        }

        return {
          subscriptionId: subscription.subscriptionId,
          success: true,
          executionTimeMs: Date.now() - startTime,
        } as HandlerResult;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        this.stats.totalErrors++;
        this.logger.error(
          `Handler ${subscription.subscriptionId} failed for event "${eventType}"`,
          error,
          { eventId, subscriptionId: subscription.subscriptionId }
        );
        return {
          subscriptionId: subscription.subscriptionId,
          success: false,
          error,
          executionTimeMs: Date.now() - startTime,
        } as HandlerResult;
      }
    });

    const handlerResults = await Promise.all(handlerPromises);

    // Remove once handlers
    for (const subscriptionId of onceHandlersToRemove) {
      this.off(subscriptionId);
    }

    // Collect results and errors
    for (const result of handlerResults) {
      results.push(result);
      if (result.error) {
        errors.push(result.error);
      }
    }

    // Store in history
    this.addToHistory(event, results.length, errors.map((e) => e.message));

    if (this.debug) {
      this.logger.debug(`Event "${eventType}" processing complete`, {
        eventId,
        handlersInvoked: results.length,
        successCount: results.filter((r) => r.success).length,
        errorCount: errors.length,
      });
    }

    return {
      eventType,
      eventId,
      timestamp,
      handlersInvoked: results.length,
      results,
      errors,
    };
  }

  /**
   * Emit an event synchronously (for performance-critical paths)
   *
   * WARNING: Errors in handlers will be logged but not awaited.
   * Use emit() for proper error handling.
   */
  public emitSync<T = unknown>(
    eventType: AgentEventType,
    payload: T,
    options?: {
      source?: AgentInputSource | 'agent' | 'system';
      correlationId?: string;
      orgId?: string;
      metadata?: Record<string, unknown>;
    }
  ): void {
    // Fire and forget
    this.emit(eventType, payload, options).catch((err) => {
      this.logger.error(`Sync emit failed for event "${eventType}"`, err);
    });
  }

  // ==========================================================================
  // Event History & Replay
  // ==========================================================================

  /**
   * Get the event history
   *
   * @param filter - Optional filter by event type
   * @param limit - Maximum number of events to return
   * @returns Array of stored events
   */
  public getHistory<T = unknown>(
    filter?: AgentEventType | AgentEventType[],
    limit?: number
  ): StoredEvent<T>[] {
    let history = [...this.eventHistory] as StoredEvent<T>[];

    if (filter) {
      const filterTypes = Array.isArray(filter) ? filter : [filter];
      history = history.filter((e) => filterTypes.includes(e.event.type));
    }

    if (limit && limit > 0) {
      history = history.slice(-limit);
    }

    return history;
  }

  /**
   * Replay events from history
   *
   * @param events - Events to replay (from getHistory)
   * @returns Results of replaying each event
   */
  public async replay<T = unknown>(events: StoredEvent<T>[]): Promise<EmitResult[]> {
    this.logger.info(`Replaying ${events.length} events`);

    const results: EmitResult[] = [];
    for (const stored of events) {
      const result = await this.emit(
        stored.event.type,
        stored.event.payload,
        {
          source: stored.event.source,
          correlationId: stored.event.correlationId,
          orgId: stored.event.orgId,
          metadata: {
            ...stored.event.metadata,
            replayed: true,
            originalEventId: stored.event.eventId,
            originalTimestamp: stored.event.timestamp.toISOString(),
          },
        }
      );
      results.push(result);
    }

    return results;
  }

  /**
   * Clear event history
   */
  public clearHistory(): void {
    this.eventHistory = [];
    this.logger.info('Event history cleared');
  }

  // ==========================================================================
  // Statistics & Debugging
  // ==========================================================================

  /**
   * Get event bus statistics
   */
  public getStats(): {
    totalEventsEmitted: number;
    totalHandlersInvoked: number;
    totalErrors: number;
    eventCounts: Record<string, number>;
    subscriptionCounts: Record<string, number>;
    historySize: number;
  } {
    const eventCounts: Record<string, number> = {};
    for (const [event, count] of this.stats.eventCounts) {
      eventCounts[event] = count;
    }

    const subscriptionCounts: Record<string, number> = {};
    for (const [event, subs] of this.subscriptions) {
      subscriptionCounts[event] = subs.size;
    }

    return {
      totalEventsEmitted: this.stats.totalEventsEmitted,
      totalHandlersInvoked: this.stats.totalHandlersInvoked,
      totalErrors: this.stats.totalErrors,
      eventCounts,
      subscriptionCounts,
      historySize: this.eventHistory.length,
    };
  }

  /**
   * Get the number of handlers registered for a specific event
   */
  public listenerCount(eventType: AgentEventType): number {
    const eventHandlers = this.subscriptions.get(eventType);
    const wildcardHandlers = this.subscriptions.get(WILDCARD_EVENT);
    return (eventHandlers?.size ?? 0) + (wildcardHandlers?.size ?? 0);
  }

  /**
   * Get all registered event types
   */
  public eventNames(): AgentEventType[] {
    const names: AgentEventType[] = [];
    for (const key of this.subscriptions.keys()) {
      if (key !== WILDCARD_EVENT) {
        names.push(key as AgentEventType);
      }
    }
    return names;
  }

  /**
   * Get all subscriptions (for debugging)
   */
  public getSubscriptions(): EventSubscription[] {
    const all: EventSubscription[] = [];
    for (const handlers of this.subscriptions.values()) {
      for (const sub of handlers.values()) {
        all.push(sub);
      }
    }
    return all;
  }

  // ==========================================================================
  // Private Helpers
  // ==========================================================================

  private generateSubscriptionId(): string {
    return `sub_${generateUUID().slice(0, 8)}`;
  }

  private addToHistory<T>(
    event: AgentEvent<T>,
    handlersInvoked: number,
    errors?: string[]
  ): void {
    const storedEvent: StoredEvent<T> = {
      id: event.eventId ?? generateUUID(),
      event,
      timestamp: new Date(),
      processed: true,
      handlersInvoked,
      errors: errors?.length ? errors : undefined,
    };

    this.eventHistory.push(storedEvent as StoredEvent);

    // Trim history if it exceeds the limit
    if (this.eventHistory.length > this.historySize) {
      this.eventHistory = this.eventHistory.slice(-this.historySize);
    }
  }
}

// =============================================================================
// Convenience Functions
// =============================================================================

/**
 * Get the singleton EventBus instance
 */
export function getEventBus(config?: EventBusConfig): AgentEventBus {
  return AgentEventBus.getInstance(config);
}

/**
 * Emit an event using the singleton EventBus
 */
export async function emitAgentEvent<T = unknown>(
  eventType: AgentEventType,
  payload: T,
  options?: {
    source?: AgentInputSource | 'agent' | 'system';
    correlationId?: string;
    orgId?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<EmitResult> {
  return AgentEventBus.getInstance().emit(eventType, payload, options);
}

// =============================================================================
// Type Re-exports (for convenience - already exported inline)
// =============================================================================

// Note: EmitResult and EventBusConfig are exported inline above
// Exporting additional internal types for consumers who need them
export type { HandlerResult, StoredEvent, Logger };

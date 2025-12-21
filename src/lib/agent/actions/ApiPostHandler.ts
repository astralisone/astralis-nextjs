/**
 * ApiPostHandler - Action Executor for External API POST Operations
 *
 * Handles external API calls for operational agents including:
 * - QuickBooks accounting sync
 * - ERP system integration
 * - Inventory updates
 * - Webhook dispatching
 *
 * @module actions/ApiPostHandler
 * @version 1.0.0
 */

// =============================================================================
// TYPES
// =============================================================================

/**
 * Authentication types for API calls
 */
export type AuthType = 'bearer' | 'basic' | 'api_key' | 'oauth2' | 'none';

/**
 * Authentication configuration
 */
export interface AuthConfig {
  /** Type of authentication */
  type: AuthType;
  /** Token or API key */
  token?: string;
  /** Username for basic auth */
  username?: string;
  /** Password for basic auth */
  password?: string;
  /** API key header name (for api_key type) */
  headerName?: string;
  /** OAuth2 client credentials */
  oauth2?: {
    clientId: string;
    clientSecret: string;
    tokenUrl: string;
  };
}

/**
 * Input for API POST operation
 */
export interface ApiPostInput {
  /** Target endpoint URL */
  endpoint: string;
  /** Request payload */
  payload: Record<string, unknown>;
  /** Authentication configuration */
  auth?: AuthConfig;
  /** Additional headers */
  headers?: Record<string, string>;
  /** Request timeout in ms */
  timeout?: number;
  /** Retry configuration */
  retry?: {
    maxAttempts: number;
    delayMs: number;
  };
}

/**
 * Result of an API POST operation
 */
export interface ApiPostResult {
  /** Whether the operation succeeded */
  success: boolean;
  /** HTTP status code */
  statusCode?: number;
  /** Response data */
  data?: unknown;
  /** Response headers */
  responseHeaders?: Record<string, string>;
  /** Error message if operation failed */
  error?: string;
  /** Error code if applicable */
  errorCode?: string;
  /** Number of retry attempts */
  retryAttempts: number;
  /** Total execution time in ms */
  executionTimeMs: number;
  /** Timestamp of the operation */
  timestamp: Date;
}

/**
 * Pre-configured integration endpoints
 */
export type IntegrationType = 'quickbooks' | 'xero' | 'stripe' | 'inventory' | 'webhook' | 'custom';

/**
 * Configuration for specific integrations
 */
export interface IntegrationConfig {
  /** Integration type */
  type: IntegrationType;
  /** Base URL for the integration */
  baseUrl: string;
  /** Authentication config */
  auth: AuthConfig;
  /** Default headers */
  defaultHeaders?: Record<string, string>;
}

/**
 * Configuration for ApiPostHandler
 */
export interface ApiPostHandlerConfig {
  /** Default timeout in ms */
  defaultTimeout: number;
  /** Default retry configuration */
  defaultRetry: {
    maxAttempts: number;
    delayMs: number;
  };
  /** Enable request logging */
  enableLogging: boolean;
  /** Registered integrations */
  integrations: Record<string, IntegrationConfig>;
}

// =============================================================================
// ERRORS
// =============================================================================

export class ApiPostError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiPostError';
  }
}

export class AuthenticationError extends ApiPostError {
  constructor(message: string) {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

export class RateLimitError extends ApiPostError {
  constructor(retryAfter?: number) {
    super(`Rate limit exceeded${retryAfter ? `, retry after ${retryAfter}s` : ''}`, 'RATE_LIMIT', 429, { retryAfter });
  }
}

export class TimeoutError extends ApiPostError {
  constructor(timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms`, 'TIMEOUT', undefined, { timeoutMs });
  }
}

// =============================================================================
// DEFAULT CONFIGURATION
// =============================================================================

export const DEFAULT_API_CONFIG: ApiPostHandlerConfig = {
  defaultTimeout: 30000,
  defaultRetry: {
    maxAttempts: 3,
    delayMs: 1000,
  },
  enableLogging: process.env.NODE_ENV === 'development',
  integrations: {},
};

// =============================================================================
// API POST HANDLER CLASS
// =============================================================================

/**
 * Handler for external API POST operations used by operational agents
 */
export class ApiPostHandler {
  private config: ApiPostHandlerConfig;

  constructor(config: Partial<ApiPostHandlerConfig> = {}) {
    this.config = { ...DEFAULT_API_CONFIG, ...config };
  }

  /**
   * Perform an API POST request
   */
  async post(input: ApiPostInput): Promise<ApiPostResult> {
    const startTime = Date.now();
    const {
      endpoint,
      payload,
      auth,
      headers = {},
      timeout = this.config.defaultTimeout,
      retry = this.config.defaultRetry,
    } = input;

    let lastError: Error | null = null;
    let retryAttempts = 0;

    for (let attempt = 0; attempt < retry.maxAttempts; attempt++) {
      try {
        // Build headers
        const requestHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          ...headers,
        };

        // Add authentication
        if (auth) {
          const authHeader = await this.buildAuthHeader(auth);
          if (authHeader) {
            Object.assign(requestHeaders, authHeader);
          }
        }

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: requestHeaders,
            body: JSON.stringify(payload),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          // Parse response
          let data: unknown;
          const contentType = response.headers.get('content-type');
          if (contentType?.includes('application/json')) {
            data = await response.json();
          } else {
            data = await response.text();
          }

          const executionTimeMs = Date.now() - startTime;

          if (this.config.enableLogging) {
            console.log(`[ApiPost] ${endpoint}: ${response.status} in ${executionTimeMs}ms`);
          }

          // Handle rate limiting
          if (response.status === 429) {
            const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
            throw new RateLimitError(retryAfter);
          }

          // Handle auth errors
          if (response.status === 401 || response.status === 403) {
            throw new AuthenticationError(`Authentication failed: ${response.statusText}`);
          }

          return {
            success: response.ok,
            statusCode: response.status,
            data,
            responseHeaders: Object.fromEntries(response.headers.entries()),
            retryAttempts,
            executionTimeMs,
            timestamp: new Date(),
            ...(response.ok ? {} : { error: `HTTP ${response.status}: ${response.statusText}` }),
          };
        } catch (fetchError) {
          clearTimeout(timeoutId);

          if (fetchError instanceof Error && fetchError.name === 'AbortError') {
            throw new TimeoutError(timeout);
          }
          throw fetchError;
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        retryAttempts++;

        // Don't retry auth errors
        if (error instanceof AuthenticationError) {
          break;
        }

        // Wait before retry
        if (attempt < retry.maxAttempts - 1) {
          await this.sleep(retry.delayMs * Math.pow(2, attempt));
        }
      }
    }

    const executionTimeMs = Date.now() - startTime;

    return {
      success: false,
      error: lastError?.message || 'Unknown error',
      errorCode: lastError instanceof ApiPostError ? lastError.code : 'UNKNOWN',
      retryAttempts,
      executionTimeMs,
      timestamp: new Date(),
    };
  }

  /**
   * Post to a registered integration
   */
  async postToIntegration(
    integrationName: string,
    path: string,
    payload: Record<string, unknown>
  ): Promise<ApiPostResult> {
    const integration = this.config.integrations[integrationName];
    if (!integration) {
      return {
        success: false,
        error: `Integration '${integrationName}' not registered`,
        errorCode: 'INTEGRATION_NOT_FOUND',
        retryAttempts: 0,
        executionTimeMs: 0,
        timestamp: new Date(),
      };
    }

    const endpoint = `${integration.baseUrl}${path}`;

    return this.post({
      endpoint,
      payload,
      auth: integration.auth,
      headers: integration.defaultHeaders,
    });
  }

  /**
   * Register an integration
   */
  registerIntegration(name: string, config: IntegrationConfig): void {
    this.config.integrations[name] = config;
  }

  /**
   * Post invoice to QuickBooks (Production implementation)
   */
  async syncToQuickBooks(
    invoice: {
      vendorName: string;
      invoiceNumber: string;
      amount: number;
      dueDate: string;
      lineItems?: Array<{ description: string; quantity: number; unitPrice: number }>;
    },
    context: { userId: string; orgId: string }
  ): Promise<ApiPostResult> {
    const startTime = Date.now();
    
    try {
      const { integrationService } = await import('@/lib/services/integration.service');
      const { IntegrationProvider } = await import('@prisma/client');

      // 1. Get credentials for QuickBooks
      const credentials = await integrationService.listCredentials(
        context.userId, 
        context.orgId, 
        IntegrationProvider.QUICKBOOKS
      );

      const activeCred = credentials.find(c => c.isActive && c.status === 'CONNECTED_ACTIVE');

      if (!activeCred) {
        return {
          success: false,
          error: 'Active QuickBooks integration not found for this user',
          errorCode: 'INTEGRATION_NOT_FOUND',
          retryAttempts: 0,
          executionTimeMs: Date.now() - startTime,
          timestamp: new Date(),
        };
      }

      // 2. Get decrypted data (tokens)
      const fullCred = await integrationService.getCredentialWithData(
        activeCred.id,
        context.userId,
        context.orgId
      );

      if (!fullCred || !fullCred.credentialData.accessToken) {
        return {
          success: false,
          error: 'QuickBooks credentials missing access token',
          errorCode: 'INVALID_CREDENTIALS',
          retryAttempts: 0,
          executionTimeMs: Date.now() - startTime,
          timestamp: new Date(),
        };
      }

      const { accessToken, realmId } = fullCred.credentialData;
      if (!realmId) {
        return {
          success: false,
          error: 'QuickBooks realmId (Company ID) missing from connection',
          errorCode: 'MISSING_REALM_ID',
          retryAttempts: 0,
          executionTimeMs: Date.now() - startTime,
          timestamp: new Date(),
        };
      }

      // 3. Prepare QuickBooks Bill payload
      // Ref: https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/bill#create-a-bill
      const qbPayload = {
        DocNumber: invoice.invoiceNumber,
        DueDate: invoice.dueDate,
        TotalAmt: invoice.amount,
        VendorRef: {
          name: invoice.vendorName,
          // In a real production system, you'd look up the Vendor ID by name first
          // value: "lookup_id_here" 
        },
        Line: invoice.lineItems?.map((item, idx) => ({
          LineNum: idx + 1,
          Description: item.description,
          Amount: item.quantity * item.unitPrice,
          DetailType: 'ItemBasedExpenseLineDetail',
          ItemBasedExpenseLineDetail: {
            Qty: item.quantity,
            UnitPrice: item.unitPrice,
          }
        })) || [
          {
            DetailType: 'AccountBasedExpenseLineDetail',
            Amount: invoice.amount,
            AccountBasedExpenseLineDetail: {
              AccountRef: {
                name: 'Uncategorized Expense',
                value: '1' // Default account often exists
              }
            }
          }
        ],
      };

      // 4. Execute the real API call
      const sandbox = process.env.QUICKBOOKS_ENVIRONMENT === 'sandbox';
      const baseUrl = sandbox 
        ? 'https://sandbox-quickbooks.api.intuit.com' 
        : 'https://quickbooks.api.intuit.com';
      
      const endpoint = `${baseUrl}/v3/company/${realmId}/bill?minorversion=70`;

      return await this.post({
        endpoint,
        payload: qbPayload,
        auth: {
          type: 'bearer',
          token: accessToken
        },
        headers: {
          'Accept': 'application/json'
        }
      });

    } catch (error) {
      console.error('[ApiPost] QuickBooks sync exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'QuickBooks sync failed',
        errorCode: 'SYNC_EXCEPTION',
        retryAttempts: 0,
        executionTimeMs: Date.now() - startTime,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Update inventory system
   */
  async updateInventory(params: {
    itemNumber: string;
    quantityChange: number;
    transactionType: 'RECEIPT' | 'SHIPMENT' | 'ADJUSTMENT';
    referenceNumber?: string;
  }): Promise<ApiPostResult> {
    if (!this.config.integrations['inventory']) {
      return {
        success: false,
        error: 'Inventory integration not configured',
        errorCode: 'INTEGRATION_NOT_CONFIGURED',
        retryAttempts: 0,
        executionTimeMs: 0,
        timestamp: new Date(),
      };
    }

    return this.postToIntegration('inventory', '/api/v1/inventory/update', {
      sku: params.itemNumber,
      quantityDelta: params.quantityChange,
      transactionType: params.transactionType,
      reference: params.referenceNumber,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Build authentication header
   */
  private async buildAuthHeader(auth: AuthConfig): Promise<Record<string, string> | null> {
    switch (auth.type) {
      case 'bearer':
        return auth.token ? { Authorization: `Bearer ${auth.token}` } : null;

      case 'basic':
        if (auth.username && auth.password) {
          const encoded = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
          return { Authorization: `Basic ${encoded}` };
        }
        return null;

      case 'api_key':
        if (auth.token && auth.headerName) {
          return { [auth.headerName]: auth.token };
        }
        return null;

      case 'oauth2':
        if (auth.oauth2) {
          const token = await this.getOAuth2Token(auth.oauth2);
          return token ? { Authorization: `Bearer ${token}` } : null;
        }
        return null;

      case 'none':
      default:
        return null;
    }
  }

  /**
   * Get OAuth2 token (simplified implementation)
   */
  private async getOAuth2Token(config: NonNullable<AuthConfig['oauth2']>): Promise<string | null> {
    try {
      const response = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: config.clientId,
          client_secret: config.clientSecret,
        }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json() as { access_token?: string };
      return data.access_token || null;
    } catch {
      return null;
    }
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

/**
 * Create a new ApiPostHandler instance
 */
export function createApiPostHandler(config?: Partial<ApiPostHandlerConfig>): ApiPostHandler {
  return new ApiPostHandler(config);
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const apiPostHandler = new ApiPostHandler();

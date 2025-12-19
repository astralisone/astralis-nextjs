/**
 * Base Integration Service
 *
 * Abstract base class for all third-party integration services.
 * Provides common functionality for credential management, token refresh, and API calls.
 */

import { integrationService, type CredentialWithData } from '@/lib/services/integration.service';
import { refreshAccessToken, getOAuthConfig } from '@/lib/integrations/oauth-config';
import type { IntegrationProvider } from '@prisma/client';
import type { IntegrationApiResponse } from '@/types/integrations';

/**
 * Base configuration for integration services
 */
export interface IntegrationServiceConfig {
  provider: IntegrationProvider;
  baseUrl: string;
  rateLimitPerMinute?: number;
}

/**
 * API request options
 */
export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  timeout?: number;
}

/**
 * Connection test result
 */
export interface ConnectionTestResult {
  success: boolean;
  message?: string;
  needsReconnect?: boolean;
}

/**
 * Abstract base class for integration services
 */
export abstract class BaseIntegrationService<TCredentialData = Record<string, unknown>> {
  protected config: IntegrationServiceConfig;
  protected credential: CredentialWithData | null = null;

  constructor(config: IntegrationServiceConfig) {
    this.config = config;
  }

  /**
   * Initialize the service with a credential
   */
  async initialize(
    credentialId: string,
    userId: string,
    orgId: string
  ): Promise<void> {
    this.credential = await integrationService.getCredentialWithData(
      credentialId,
      userId,
      orgId
    );

    if (!this.credential) {
      throw new Error(`Credential not found: ${credentialId}`);
    }

    // Check if token needs refresh (expired or close to expiring)
    if (this.needsRefresh()) {
      try {
        console.log(`[${this.config.provider}] Token needs refresh, attempting automatic refresh`);
        await this.refreshToken();
        console.log(`[${this.config.provider}] Token refreshed successfully during initialization`);
      } catch (refreshError) {
        console.warn(`[${this.config.provider}] Token refresh failed during initialization:`, refreshError);
        // Continue with expired token - let the API call handle it
      }
    }
  }

  /**
   * Set the credential manually
   */
  setCredential(credential: CredentialWithData): void {
    this.credential = credential;
  }

  /**
   * Get the typed credential data
   */
  protected getCredentialData(): TCredentialData {
    if (!this.credential) {
      throw new Error('Service not initialized. Call initialize() first.');
    }
    return this.credential.credentialData as TCredentialData;
  }

  /**
   * Get the access token
   */
  protected getAccessToken(): string {
    const data = this.getCredentialData() as Record<string, unknown>;
    return data.accessToken as string;
  }

  /**
   * Check if the token is expired
   */
  protected isTokenExpired(): boolean {
    if (!this.credential?.expiresAt) return false;
    // Consider expired if less than 10 minutes remaining
    return new Date(this.credential.expiresAt).getTime() < Date.now() + 10 * 60 * 1000;
  }

  /**
   * Check if the token needs refresh (expires within 30 minutes)
   */
  protected needsRefresh(): boolean {
    if (!this.credential?.expiresAt) return false;
    // Refresh if less than 30 minutes remaining
    return new Date(this.credential.expiresAt).getTime() < Date.now() + 30 * 60 * 1000;
  }

  /**
   * Standard test connection implementation that can be used by subclasses
   * Calls getAccountInfo() and wraps the result in a ConnectionTestResult
   */
  protected async standardTestConnection(): Promise<ConnectionTestResult> {
    try {
      const result = await this.getAccountInfo();
      if (result.success) {
        return { success: true, message: 'Connection test successful' };
      } else {
        return {
          success: false,
          message: result.error?.message || 'Connection test failed',
          needsReconnect: this.isTokenExpired()
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed',
        needsReconnect: this.isTokenExpired()
      };
    }
  }

  /**
   * Refresh the access token
   */
  protected async refreshToken(): Promise<void> {
    if (!this.credential) {
      throw new Error('Service not initialized');
    }

    const data = this.getCredentialData() as Record<string, unknown>;
    const refreshToken = data.refreshToken as string;

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const newTokens = await refreshAccessToken(this.config.provider, refreshToken);

      // Update credential with new tokens
      await integrationService.refreshToken(
        this.credential.id,
        this.credential.userId,
        this.credential.orgId,
        newTokens.accessToken,
        newTokens.refreshToken,
        newTokens.expiresIn
          ? new Date(Date.now() + newTokens.expiresIn * 1000)
          : undefined
      );

      // Update local credential data
      (this.credential.credentialData as Record<string, unknown>).accessToken = newTokens.accessToken;
      if (newTokens.refreshToken) {
        (this.credential.credentialData as Record<string, unknown>).refreshToken = newTokens.refreshToken;
      }
      if (newTokens.expiresIn) {
        this.credential.expiresAt = new Date(Date.now() + newTokens.expiresIn * 1000);
      }

      console.log(`[${this.config.provider}] Token refreshed successfully`);
    } catch (error) {
      console.error(`[${this.config.provider}] Token refresh failed:`, error);

      // Mark credential as needing reconnection if refresh fails
      if (this.credential) {
        try {
          await integrationService.markNeedsReauth(
            this.credential.id,
            this.credential.userId,
            this.credential.orgId,
            `Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        } catch (statusError) {
          console.error(`[${this.config.provider}] Failed to update credential status:`, statusError);
        }
      }

      throw new Error(`Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Make an API request to the provider
   */
  protected async apiRequest<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<IntegrationApiResponse<T>> {
    if (!this.credential) {
      throw new Error('Service not initialized');
    }

    const { method = 'GET', body, headers = {}, params, timeout = 30000 } = options;

    // Check if token needs refresh
    if (this.needsRefresh()) {
      try {
        console.log(`[${this.config.provider}] Token expired or expiring soon, refreshing before API call`);
        await this.refreshToken();
      } catch (refreshError) {
        console.error(`[${this.config.provider}] Token refresh failed before API call:`, refreshError);
        // If refresh fails and token is actually expired, throw error
        if (this.isTokenExpired()) {
          throw new Error('Authentication token expired and refresh failed. Please reconnect this integration.');
        }
      }
    }

    // Build URL with params
    let url = `${this.config.baseUrl}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    // Build headers
    const requestHeaders: Record<string, string> = {
      'Authorization': `Bearer ${this.getAccessToken()}`,
      'Content-Type': 'application/json',
      ...headers,
    };

    // Build request options
    const requestInit: RequestInit = {
      method,
      headers: requestHeaders,
      signal: AbortSignal.timeout(timeout),
    };

    if (body && method !== 'GET') {
      requestInit.body = JSON.stringify(body);
    }

    try {
      console.log(`[${this.config.provider}] API Request: ${method} ${endpoint}`);

      const response = await fetch(url, requestInit);

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        throw new Error(`Rate limited. Retry after ${retryAfter || 'unknown'} seconds`);
      }

      // Handle auth errors
      if (response.status === 401) {
        // Try to refresh token and retry
        await this.refreshToken();

        // Update authorization header with new token
        requestHeaders['Authorization'] = `Bearer ${this.getAccessToken()}`;
        const retryResponse = await fetch(url, { ...requestInit, headers: requestHeaders });

        if (!retryResponse.ok) {
          throw new Error(`API request failed: ${retryResponse.statusText}`);
        }

        const retryData = await retryResponse.json();
        return { success: true, data: retryData };
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorData: Record<string, unknown> | undefined;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          // Not JSON
        }

        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: errorData?.message as string || response.statusText,
            details: errorData,
          },
        };
      }

      const data = await response.json();
      return { success: true, data };

    } catch (error) {
      console.error(`[${this.config.provider}] API Request failed:`, error);

      return {
        success: false,
        error: {
          code: 'REQUEST_FAILED',
          message: error instanceof Error ? error.message : 'Request failed',
        },
      };
    }
  }

  /**
   * Test the connection to the provider
   */
  abstract testConnection(): Promise<ConnectionTestResult>;

  /**
   * Get provider-specific user/account info
   */
  abstract getAccountInfo(): Promise<IntegrationApiResponse<Record<string, unknown>>>;
}

/**
 * OAuth credential data shape
 */
export interface OAuthCredentialData {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  scope?: string;
  tokenType?: string;
}

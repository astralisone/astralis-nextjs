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

    // Check if token is expired and refresh if needed
    if (this.isTokenExpired()) {
      await this.refreshToken();
    }
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
    // Consider expired if less than 5 minutes remaining
    return new Date(this.credential.expiresAt).getTime() < Date.now() + 5 * 60 * 1000;
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
      throw new Error('Token refresh failed');
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
    if (this.isTokenExpired()) {
      await this.refreshToken();
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
  abstract testConnection(): Promise<boolean>;

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

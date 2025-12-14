/**
 * Integrations Module Index
 *
 * Central export point for all integration services and utilities.
 */

// OAuth Configuration
export {
  getOAuthConfig,
  generateAuthorizationUrl,
  generateOAuthState,
  parseOAuthState,
  validateOAuthState,
  exchangeCodeForTokens,
  refreshAccessToken,
  getSupportedOAuthProviders,
  supportsOAuth,
  getClientId,
  getClientSecret,
} from './oauth-config';
export type {
  OAuthProviderConfig,
  TokenResponseData,
  OAuthStateData,
} from './oauth-config';

// Base Service
export { BaseIntegrationService } from './base-integration.service';
export type {
  IntegrationServiceConfig,
  ApiRequestOptions,
  OAuthCredentialData,
} from './base-integration.service';

// Accounting Integrations
export * from './accounting';

// CRM Integrations
export * from './crm';

// Communication Integrations
export * from './communication';

// Storage Integrations
export * from './storage';

// DevOps Integrations
export * from './devops';

// Social Integrations
export * from './social';

// E-commerce Integrations
export * from './ecommerce';

// HR Integrations
export * from './hr';

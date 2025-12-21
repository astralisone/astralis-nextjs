/**
 * Type definitions for Third-Party Integrations
 *
 * Core types for OAuth flows, API clients, and integration services.
 */

import type { IntegrationProvider as PrismaIntegrationProvider } from '@prisma/client';

// ============================================================================
// Core Integration Types
// ============================================================================

/**
 * Integration category for grouping providers
 */
export type IntegrationCategory =
  | 'accounting'
  | 'crm'
  | 'communication'
  | 'storage'
  | 'marketing'
  | 'productivity'
  | 'devops'
  | 'ecommerce'
  | 'hr';

/**
 * Integration connection state
 */
export type IntegrationConnectionStatus =
  | 'connected'
  | 'disconnected'
  | 'expired'
  | 'error';

/**
 * Base integration metadata
 */
export interface IntegrationMetadata {
  id: string;
  provider: PrismaIntegrationProvider;
  name: string;
  description: string;
  category: IntegrationCategory;
  icon: string;
  color: string;
  oauthSupported: boolean;
  apiKeySupported: boolean;
  scopes?: string[];
  webhooksSupported?: boolean;
}

/**
 * View model for an integration in the UI
 */
export interface IntegrationStatus {
  provider: PrismaIntegrationProvider;
  isConnected: boolean;
  available: boolean;
  unavailableReason?: string;
  credential?: {
    id: string;
    status: string;
    expiresAt?: Date;
    lastUsedAt?: Date;
    lastError?: string;
  };
}

/**
 * Connected integration instance (backend record)
 */
export interface ConnectedIntegration {
  id: string;
  provider: PrismaIntegrationProvider;
  credentialName: string;
  status: IntegrationConnectionStatus;
  scope: string | null;
  expiresAt: Date | null;
  lastUsedAt: Date | null;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// OAuth Types
// ============================================================================

/**
 * OAuth configuration for a provider
 */
export interface OAuthConfig {
  provider: PrismaIntegrationProvider;
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  revokeUrl?: string;
  scopes: string[];
  redirectUri: string;
  additionalParams?: Record<string, string>;
}

/**
 * OAuth token response from provider
 */
export interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type: string;
  scope?: string;
  id_token?: string;
  // Provider-specific fields (kept for general mapping)
  realmId?: string; // QuickBooks
  tenantId?: string; // Xero
  team?: { id: string; name: string }; // Slack
  authed_user?: { id: string }; // Slack
}

/**
 * OAuth state parameter for security
 */
export interface OAuthState {
  provider: PrismaIntegrationProvider;
  returnUrl: string;
  userId: string;
  orgId: string;
  timestamp: number;
  nonce: string;
}

// ============================================================================
// Integration Catalog
// ============================================================================

/**
 * Available integrations catalog
 */
export const INTEGRATION_CATALOG: IntegrationMetadata[] = [
  {
    id: 'quickbooks',
    provider: 'QUICKBOOKS' as PrismaIntegrationProvider,
    name: 'QuickBooks Online',
    description: 'Sync invoices, customers, and payments with QuickBooks',
    category: 'accounting',
    icon: 'quickbooks',
    color: '#2CA01C',
    oauthSupported: true,
    apiKeySupported: false,
    scopes: ['com.intuit.quickbooks.accounting'],
    webhooksSupported: true,
  },
  {
    id: 'xero',
    provider: 'XERO' as PrismaIntegrationProvider,
    name: 'Xero',
    description: 'Connect your Xero accounting for invoices and contacts',
    category: 'accounting',
    icon: 'xero',
    color: '#13B5EA',
    oauthSupported: true,
    apiKeySupported: false,
    scopes: ['openid', 'profile', 'email', 'accounting.transactions', 'accounting.contacts'],
    webhooksSupported: true,
  },
  {
    id: 'hubspot',
    provider: 'HUBSPOT' as PrismaIntegrationProvider,
    name: 'HubSpot',
    description: 'Sync contacts, companies, and deals with HubSpot CRM',
    category: 'crm',
    icon: 'hubspot',
    color: '#FF7A59',
    oauthSupported: true,
    apiKeySupported: true,
    scopes: ['crm.objects.contacts.read', 'crm.objects.contacts.write', 'crm.objects.companies.read', 'crm.objects.deals.read'],
    webhooksSupported: true,
  },
  {
    id: 'slack',
    provider: 'SLACK' as PrismaIntegrationProvider,
    name: 'Slack',
    description: 'Send messages and notifications to Slack channels',
    category: 'communication',
    icon: 'slack',
    color: '#4A154B',
    oauthSupported: true,
    apiKeySupported: false,
    scopes: ['channels:read', 'channels:write', 'chat:write', 'users:read', 'team:read'],
    webhooksSupported: true,
  },
  {
    id: 'gmail',
    provider: 'GMAIL' as PrismaIntegrationProvider,
    name: 'Gmail',
    description: 'Send and read emails through Gmail',
    category: 'communication',
    icon: 'gmail',
    color: '#EA4335',
    oauthSupported: true,
    apiKeySupported: false,
    scopes: ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly'],
    webhooksSupported: true,
  },
  {
    id: 'google-drive',
    provider: 'GOOGLE_DRIVE' as PrismaIntegrationProvider,
    name: 'Google Drive',
    description: 'Sync and manage files in Google Drive',
    category: 'storage',
    icon: 'google-drive',
    color: '#4285F4',
    oauthSupported: true,
    apiKeySupported: false,
    scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.readonly'],
    webhooksSupported: true,
  },
];

/**
 * Get integration metadata by provider
 */
export function getIntegrationMetadata(provider: PrismaIntegrationProvider): IntegrationMetadata | undefined {
  return INTEGRATION_CATALOG.find((i) => i.provider === provider);
}

// Export provider type alias
export type IntegrationProvider = PrismaIntegrationProvider;

/**
 * Standard API Response for Integration Services
 */
export interface IntegrationApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  pagination?: {
    cursor?: string;
    hasMore: boolean;
    total?: number;
  };
}

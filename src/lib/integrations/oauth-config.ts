/**
 * OAuth Configuration for Third-Party Integrations
 *
 * Centralized configuration for OAuth 2.0 flows across all supported providers.
 * Each provider has its specific authorization URL, token URL, scopes, and params.
 */

import type { IntegrationProvider } from '@prisma/client';
import { generateSecureToken, decrypt } from '@/lib/utils/crypto';
import { prisma } from '@/lib/prisma';

/**
 * OAuth credentials for a specific organization
 */
export interface OrgOAuthCredentials {
  clientId: string;
  clientSecret: string;
  customScopes?: string;
  redirectUri?: string;
  metadata?: Record<string, unknown>;
}

/**
 * OAuth provider configuration
 */
export interface OAuthProviderConfig {
  provider: IntegrationProvider;
  authorizationUrl: string;
  tokenUrl: string;
  revokeUrl?: string;
  userInfoUrl?: string;
  scopes: string[];
  additionalAuthParams?: Record<string, string>;
  additionalTokenParams?: Record<string, string>;
  // How to send client credentials in token request
  tokenAuthMethod: 'body' | 'header';
  // Provider-specific response handling
  parseTokenResponse?: (response: Record<string, unknown>) => TokenResponseData;
}

/**
 * Parsed token response data
 */
export interface TokenResponseData {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  scope?: string;
  tokenType?: string;
  // Provider-specific fields
  realmId?: string; // QuickBooks
  tenantId?: string; // Xero
  teamId?: string; // Slack
  instanceUrl?: string; // Salesforce
}

/**
 * OAuth state for CSRF protection
 */
export interface OAuthStateData {
  provider: IntegrationProvider;
  returnUrl: string;
  userId: string;
  orgId: string;
  timestamp: number;
  nonce: string;
}

/**
 * Get OAuth configuration for a provider
 */
export function getOAuthConfig(provider: IntegrationProvider): OAuthProviderConfig | null {
  const config = OAUTH_CONFIGS[provider];
  if (!config) return null;
  return config;
}

/**
 * Generate OAuth authorization URL
 * @deprecated Use generateAuthorizationUrlWithCredentials for org-specific credentials
 */
export function generateAuthorizationUrl(
  provider: IntegrationProvider,
  redirectUri: string,
  state: string
): string | null {
  const config = getOAuthConfig(provider);
  if (!config) return null;

  const clientId = getClientId(provider);
  if (!clientId) return null;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    state,
    ...config.additionalAuthParams,
  });

  return `${config.authorizationUrl}?${params.toString()}`;
}

/**
 * Generate OAuth authorization URL with org-specific credentials
 */
export function generateAuthorizationUrlWithCredentials(
  provider: IntegrationProvider,
  redirectUri: string,
  state: string,
  credentials: OrgOAuthCredentials
): string | null {
  const config = getOAuthConfig(provider);
  if (!config) return null;

  // Use custom scopes if provided, otherwise use default
  const scopes = credentials.customScopes
    ? credentials.customScopes.split(',').map((s) => s.trim())
    : config.scopes;

  // Use custom redirect URI if provided
  const finalRedirectUri = credentials.redirectUri || redirectUri;

  const params = new URLSearchParams({
    client_id: credentials.clientId,
    redirect_uri: finalRedirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
    state,
    ...config.additionalAuthParams,
  });

  return `${config.authorizationUrl}?${params.toString()}`;
}

/**
 * Generate secure state parameter
 */
export function generateOAuthState(data: Omit<OAuthStateData, 'timestamp' | 'nonce'>): string {
  const stateData: OAuthStateData = {
    ...data,
    timestamp: Date.now(),
    nonce: generateSecureToken(16),
  };
  return Buffer.from(JSON.stringify(stateData)).toString('base64url');
}

/**
 * Parse state parameter
 */
export function parseOAuthState(state: string): OAuthStateData | null {
  try {
    const decoded = Buffer.from(state, 'base64url').toString('utf-8');
    return JSON.parse(decoded) as OAuthStateData;
  } catch {
    return null;
  }
}

/**
 * Validate state parameter
 */
export function validateOAuthState(
  state: OAuthStateData,
  maxAgeMs: number = 10 * 60 * 1000 // 10 minutes
): boolean {
  const now = Date.now();
  if (now - state.timestamp > maxAgeMs) {
    return false;
  }
  return true;
}

/**
 * Get OAuth credentials for an organization
 * First checks org config, then falls back to environment variables
 */
export async function getOrgOAuthCredentials(
  provider: IntegrationProvider,
  orgId: string
): Promise<OrgOAuthCredentials | null> {
  // First, try to get org-specific credentials
  const orgConfig = await prisma.organizationIntegrationConfig.findUnique({
    where: {
      orgId_provider: {
        orgId,
        provider,
      },
    },
  });

  if (orgConfig && orgConfig.isEnabled) {
    try {
      return {
        clientId: decrypt(orgConfig.clientId),
        clientSecret: decrypt(orgConfig.clientSecret),
        customScopes: orgConfig.customScopes || undefined,
        redirectUri: orgConfig.redirectUri || undefined,
        metadata: orgConfig.metadata as Record<string, unknown> | undefined,
      };
    } catch (error) {
      console.error(`[OAuth] Error decrypting org credentials for ${provider}:`, error);
    }
  }

  // Fall back to environment variables (platform-level credentials)
  const clientId = getClientId(provider);
  const clientSecret = getClientSecret(provider);

  if (clientId && clientSecret) {
    return {
      clientId,
      clientSecret,
    };
  }

  return null;
}

/**
 * Check if an organization has configured credentials for a provider
 */
export async function hasOrgCredentials(
  provider: IntegrationProvider,
  orgId: string
): Promise<boolean> {
  const orgConfig = await prisma.organizationIntegrationConfig.findUnique({
    where: {
      orgId_provider: {
        orgId,
        provider,
      },
    },
    select: { isEnabled: true },
  });

  if (orgConfig?.isEnabled) {
    return true;
  }

  // Check environment variables as fallback
  const clientId = getClientId(provider);
  return !!clientId;
}

/**
 * Get client ID for a provider (from environment variables)
 */
export function getClientId(provider: IntegrationProvider): string | null {
  const envKey = getEnvKeyPrefix(provider) + '_CLIENT_ID';
  return process.env[envKey] || null;
}

/**
 * Get client secret for a provider (from environment variables)
 */
export function getClientSecret(provider: IntegrationProvider): string | null {
  const envKey = getEnvKeyPrefix(provider) + '_CLIENT_SECRET';
  return process.env[envKey] || null;
}

/**
 * Get environment variable key prefix for a provider
 */
function getEnvKeyPrefix(provider: IntegrationProvider): string {
  const prefixMap: Record<string, string> = {
    QUICKBOOKS: 'QUICKBOOKS',
    XERO: 'XERO',
    HUBSPOT: 'HUBSPOT',
    SALESFORCE: 'SALESFORCE',
    SLACK: 'SLACK',
    GMAIL: 'GOOGLE',
    GOOGLE_DRIVE: 'GOOGLE',
    MICROSOFT_TEAMS: 'MICROSOFT',
    DROPBOX: 'DROPBOX',
  };
  return prefixMap[provider] || provider;
}

/**
 * Exchange authorization code for tokens
 * @deprecated Use exchangeCodeForTokensWithCredentials for org-specific credentials
 */
export async function exchangeCodeForTokens(
  provider: IntegrationProvider,
  code: string,
  redirectUri: string
): Promise<TokenResponseData> {
  const clientId = getClientId(provider);
  const clientSecret = getClientSecret(provider);

  if (!clientId || !clientSecret) {
    throw new Error(`OAuth credentials not configured for ${provider}`);
  }

  return exchangeCodeForTokensWithCredentials(provider, code, redirectUri, {
    clientId,
    clientSecret,
  });
}

/**
 * Exchange authorization code for tokens with org-specific credentials
 */
export async function exchangeCodeForTokensWithCredentials(
  provider: IntegrationProvider,
  code: string,
  redirectUri: string,
  credentials: OrgOAuthCredentials
): Promise<TokenResponseData> {
  const config = getOAuthConfig(provider);
  if (!config) {
    throw new Error(`Unsupported OAuth provider: ${provider}`);
  }

  // Use custom redirect URI if provided
  const finalRedirectUri = credentials.redirectUri || redirectUri;

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: finalRedirectUri,
    ...config.additionalTokenParams,
  });

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  if (config.tokenAuthMethod === 'header') {
    const creds = Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString('base64');
    headers['Authorization'] = `Basic ${creds}`;
  } else {
    body.append('client_id', credentials.clientId);
    body.append('client_secret', credentials.clientSecret);
  }

  console.log(`[OAuth] Exchanging code for tokens: ${provider}`);

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers,
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[OAuth] Token exchange failed for ${provider}:`, errorText);
    throw new Error(`Token exchange failed: ${response.statusText}`);
  }

  const tokens = await response.json();
  console.log(`[OAuth] Token exchange successful for: ${provider}`);

  // Use provider-specific parser if available
  if (config.parseTokenResponse) {
    return config.parseTokenResponse(tokens);
  }

  // Default token parsing
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresIn: tokens.expires_in,
    scope: tokens.scope,
    tokenType: tokens.token_type,
  };
}

/**
 * Refresh access token
 * @deprecated Use refreshAccessTokenWithCredentials for org-specific credentials
 */
export async function refreshAccessToken(
  provider: IntegrationProvider,
  refreshToken: string
): Promise<TokenResponseData> {
  const clientId = getClientId(provider);
  const clientSecret = getClientSecret(provider);

  if (!clientId || !clientSecret) {
    throw new Error(`OAuth credentials not configured for ${provider}`);
  }

  return refreshAccessTokenWithCredentials(provider, refreshToken, {
    clientId,
    clientSecret,
  });
}

/**
 * Refresh access token with org-specific credentials
 */
export async function refreshAccessTokenWithCredentials(
  provider: IntegrationProvider,
  refreshToken: string,
  credentials: OrgOAuthCredentials
): Promise<TokenResponseData> {
  const config = getOAuthConfig(provider);
  if (!config) {
    throw new Error(`Unsupported OAuth provider: ${provider}`);
  }

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  if (config.tokenAuthMethod === 'header') {
    const creds = Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString('base64');
    headers['Authorization'] = `Basic ${creds}`;
  } else {
    body.append('client_id', credentials.clientId);
    body.append('client_secret', credentials.clientSecret);
  }

  console.log(`[OAuth] Refreshing token for: ${provider}`);

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers,
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[OAuth] Token refresh failed for ${provider}:`, errorText);
    throw new Error(`Token refresh failed: ${response.statusText}`);
  }

  const tokens = await response.json();
  console.log(`[OAuth] Token refresh successful for: ${provider}`);

  if (config.parseTokenResponse) {
    return config.parseTokenResponse(tokens);
  }

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token || refreshToken, // Keep old refresh token if not returned
    expiresIn: tokens.expires_in,
    scope: tokens.scope,
    tokenType: tokens.token_type,
  };
}

// ============================================================================
// OAuth Provider Configurations
// ============================================================================

const OAUTH_CONFIGS: Partial<Record<IntegrationProvider, OAuthProviderConfig>> = {
  // -------------------------------------------------------------------------
  // Accounting
  // -------------------------------------------------------------------------
  QUICKBOOKS: {
    provider: 'QUICKBOOKS',
    authorizationUrl: 'https://appcenter.intuit.com/connect/oauth2',
    tokenUrl: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
    revokeUrl: 'https://developer.api.intuit.com/v2/oauth2/tokens/revoke',
    userInfoUrl: 'https://accounts.platform.intuit.com/v1/openid_connect/userinfo',
    scopes: ['com.intuit.quickbooks.accounting', 'openid', 'profile', 'email'],
    tokenAuthMethod: 'header',
    parseTokenResponse: (tokens) => ({
      accessToken: tokens.access_token as string,
      refreshToken: tokens.refresh_token as string,
      expiresIn: tokens.expires_in as number,
      scope: tokens.scope as string,
      tokenType: tokens.token_type as string,
      realmId: tokens.realmId as string,
    }),
  },

  XERO: {
    provider: 'XERO',
    authorizationUrl: 'https://login.xero.com/identity/connect/authorize',
    tokenUrl: 'https://identity.xero.com/connect/token',
    revokeUrl: 'https://identity.xero.com/connect/revocation',
    userInfoUrl: 'https://api.xero.com/connections',
    scopes: [
      'openid',
      'profile',
      'email',
      'accounting.transactions',
      'accounting.contacts',
      'accounting.settings',
      'offline_access',
    ],
    tokenAuthMethod: 'header',
    parseTokenResponse: (tokens) => ({
      accessToken: tokens.access_token as string,
      refreshToken: tokens.refresh_token as string,
      expiresIn: tokens.expires_in as number,
      scope: tokens.scope as string,
      tokenType: tokens.token_type as string,
    }),
  },

  // -------------------------------------------------------------------------
  // CRM / Sales
  // -------------------------------------------------------------------------
  HUBSPOT: {
    provider: 'HUBSPOT',
    authorizationUrl: 'https://app.hubspot.com/oauth/authorize',
    tokenUrl: 'https://api.hubapi.com/oauth/v1/token',
    userInfoUrl: 'https://api.hubapi.com/oauth/v1/access-tokens',
    scopes: [
      'crm.objects.contacts.read',
      'crm.objects.contacts.write',
      'crm.objects.companies.read',
      'crm.objects.companies.write',
      'crm.objects.deals.read',
      'crm.objects.deals.write',
    ],
    tokenAuthMethod: 'body',
    parseTokenResponse: (tokens) => ({
      accessToken: tokens.access_token as string,
      refreshToken: tokens.refresh_token as string,
      expiresIn: tokens.expires_in as number,
      tokenType: tokens.token_type as string,
    }),
  },

  SALESFORCE: {
    provider: 'SALESFORCE',
    authorizationUrl: 'https://login.salesforce.com/services/oauth2/authorize',
    tokenUrl: 'https://login.salesforce.com/services/oauth2/token',
    revokeUrl: 'https://login.salesforce.com/services/oauth2/revoke',
    userInfoUrl: 'https://login.salesforce.com/services/oauth2/userinfo',
    scopes: ['api', 'refresh_token', 'offline_access'],
    tokenAuthMethod: 'body',
    parseTokenResponse: (tokens) => ({
      accessToken: tokens.access_token as string,
      refreshToken: tokens.refresh_token as string,
      tokenType: tokens.token_type as string,
      instanceUrl: tokens.instance_url as string,
      scope: tokens.scope as string,
    }),
  },

  // -------------------------------------------------------------------------
  // Communication
  // -------------------------------------------------------------------------
  SLACK: {
    provider: 'SLACK',
    authorizationUrl: 'https://slack.com/oauth/v2/authorize',
    tokenUrl: 'https://slack.com/api/oauth.v2.access',
    revokeUrl: 'https://slack.com/api/auth.revoke',
    userInfoUrl: 'https://slack.com/api/auth.test',
    scopes: [
      'channels:read',
      'channels:write',
      'chat:write',
      'users:read',
      'team:read',
      'groups:read',
    ],
    tokenAuthMethod: 'body',
    parseTokenResponse: (tokens) => ({
      accessToken: tokens.access_token as string,
      tokenType: tokens.token_type as string,
      scope: tokens.scope as string,
      teamId: (tokens.team as Record<string, string>)?.id,
    }),
  },

  GMAIL: {
    provider: 'GMAIL',
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    revokeUrl: 'https://oauth2.googleapis.com/revoke',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scopes: [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.labels',
      'openid',
      'email',
      'profile',
    ],
    additionalAuthParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
    tokenAuthMethod: 'body',
    parseTokenResponse: (tokens) => ({
      accessToken: tokens.access_token as string,
      refreshToken: tokens.refresh_token as string,
      expiresIn: tokens.expires_in as number,
      scope: tokens.scope as string,
      tokenType: tokens.token_type as string,
    }),
  },

  MICROSOFT_TEAMS: {
    provider: 'MICROSOFT_TEAMS',
    authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    revokeUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/logout',
    userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
    scopes: [
      'User.Read',
      'Team.ReadBasic.All',
      'Channel.ReadBasic.All',
      'ChannelMessage.Send',
      'offline_access',
    ],
    tokenAuthMethod: 'body',
    parseTokenResponse: (tokens) => ({
      accessToken: tokens.access_token as string,
      refreshToken: tokens.refresh_token as string,
      expiresIn: tokens.expires_in as number,
      scope: tokens.scope as string,
      tokenType: tokens.token_type as string,
    }),
  },

  // -------------------------------------------------------------------------
  // Storage
  // -------------------------------------------------------------------------
  GOOGLE_DRIVE: {
    provider: 'GOOGLE_DRIVE',
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    revokeUrl: 'https://oauth2.googleapis.com/revoke',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scopes: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.readonly',
      'openid',
      'email',
      'profile',
    ],
    additionalAuthParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
    tokenAuthMethod: 'body',
    parseTokenResponse: (tokens) => ({
      accessToken: tokens.access_token as string,
      refreshToken: tokens.refresh_token as string,
      expiresIn: tokens.expires_in as number,
      scope: tokens.scope as string,
      tokenType: tokens.token_type as string,
    }),
  },

  DROPBOX: {
    provider: 'DROPBOX',
    authorizationUrl: 'https://www.dropbox.com/oauth2/authorize',
    tokenUrl: 'https://api.dropboxapi.com/oauth2/token',
    revokeUrl: 'https://api.dropboxapi.com/2/auth/token/revoke',
    userInfoUrl: 'https://api.dropboxapi.com/2/users/get_current_account',
    scopes: [
      'files.content.read',
      'files.content.write',
      'sharing.read',
      'sharing.write',
      'account_info.read',
    ],
    additionalAuthParams: {
      token_access_type: 'offline',
    },
    tokenAuthMethod: 'body',
    parseTokenResponse: (tokens) => ({
      accessToken: tokens.access_token as string,
      refreshToken: tokens.refresh_token as string,
      expiresIn: tokens.expires_in as number,
      tokenType: tokens.token_type as string,
    }),
  },
};

/**
 * Get all supported OAuth providers
 */
export function getSupportedOAuthProviders(): IntegrationProvider[] {
  return Object.keys(OAUTH_CONFIGS) as IntegrationProvider[];
}

/**
 * Check if a provider supports OAuth
 */
export function supportsOAuth(provider: IntegrationProvider): boolean {
  return provider in OAUTH_CONFIGS;
}

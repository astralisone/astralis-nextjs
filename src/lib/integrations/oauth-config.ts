/**
 * OAuth Configuration for Third-Party Integrations
 *
 * Centralized configuration for OAuth 2.0 flows across all supported providers.
 * Each provider has its specific authorization URL, token URL, scopes, and params.
 */

import type { IntegrationProvider } from '@prisma/client';
import { generateSecureToken, decrypt } from '@/lib/utils/crypto';
import { prisma } from '@/lib/prisma';
import { createHash } from 'crypto';

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
  // PKCE support
  usePKCE?: boolean;
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
  // PKCE data
  codeVerifier?: string;
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
  credentials: OrgOAuthCredentials,
  pkceData?: PKCEData
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

  // Add PKCE parameters if required
  if (config.usePKCE && pkceData) {
    params.set('code_challenge', pkceData.codeChallenge);
    params.set('code_challenge_method', pkceData.codeChallengeMethod);
  }

  return `${config.authorizationUrl}?${params.toString()}`;
}

/**
 * Generate secure state parameter
 */
export function generateOAuthState(data: Omit<OAuthStateData, 'timestamp' | 'nonce' | 'codeVerifier'>): string {
  const stateData: OAuthStateData = {
    ...data,
    timestamp: Date.now(),
    nonce: generateSecureToken(16),
  };

  // Add PKCE data if provider requires it
  const config = getOAuthConfig(data.provider);
  if (config?.usePKCE) {
    stateData.codeVerifier = generateCodeVerifier();
  }

  return Buffer.from(JSON.stringify(stateData)).toString('base64url');
}

/**
 * Parse state parameter
 */
export function parseOAuthState(state: string): OAuthStateData | null {
  try {
    console.log('[parseOAuthState] Decoding state parameter');
    const decoded = Buffer.from(state, 'base64url').toString('utf-8');

    console.log('[parseOAuthState] Parsing JSON');
    const parsed = JSON.parse(decoded);

    // Validate required fields
    if (!parsed.provider || !parsed.userId || !parsed.orgId) {
      console.error('[parseOAuthState] Missing required fields. Found:', Object.keys(parsed));
      console.error('[parseOAuthState] Parsed data:', parsed);
      return null;
    }

    console.log('[parseOAuthState] State parsed successfully');
    return parsed as OAuthStateData;

  } catch (error) {
    console.error('[parseOAuthState] Exception during parsing:', error);
    console.error('[parseOAuthState] Raw state parameter:', state);
    return null;
  }
}

/**
 * Validate state parameter
 */
export function validateOAuthState(
  state: OAuthStateData,
  maxAgeMs: number = 30 * 60 * 1000 // 30 minutes
): boolean {
  const now = Date.now();
  const ageMs = now - state.timestamp;
  const ageMinutes = ageMs / (60 * 1000);

  console.log(`[validateOAuthState] State age: ${ageMinutes.toFixed(2)} minutes (${ageMs}ms), max allowed: ${maxAgeMs / (60 * 1000)} minutes`);

  if (ageMs > maxAgeMs) {
    console.log(`[validateOAuthState] State expired - age: ${ageMinutes.toFixed(2)} minutes`);
    return false;
  }

  console.log(`[validateOAuthState] State valid`);
  return true;
}

/**
 * PKCE (Proof Key for Code Exchange) utilities for OAuth 2.0
 */
export function generateCodeVerifier(): string {
  return generateSecureToken(32); // 32 bytes = 43 characters when base64url encoded
}

export function generateCodeChallenge(verifier: string): string {
  const hash = createHash('sha256').update(verifier).digest('base64url');
  return hash;
}

export interface PKCEData {
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: 'S256';
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
 * Provider availability status
 */
export interface ProviderStatus {
  provider: IntegrationProvider;
  available: boolean;
  reason?: string;
}

/**
 * Validate OAuth credentials for a provider
 */
export function validateOAuthCredentials(
  provider: IntegrationProvider,
  credentials: OrgOAuthCredentials | null
): ProviderStatus {
  if (!credentials?.clientId || !credentials?.clientSecret) {
    return {
      provider,
      available: false,
      reason: 'No OAuth credentials configured'
    };
  }

  // Check for obviously invalid patterns
  if (credentials.clientId.toLowerCase().includes('null') ||
    credentials.clientId.includes('personal-access-key') ||
    credentials.clientId.length < 5) {
    return {
      provider,
      available: false,
      reason: 'Invalid credential format detected'
    };
  }

  // Provider-specific validation
  switch (provider) {
    case 'GITHUB':
      if (credentials.clientId.length < 20) {
        return {
          provider,
          available: false,
          reason: 'GitHub client ID appears incomplete (typically 20+ characters)'
        };
      }
      break;

    case 'GOOGLE':
    case 'GMAIL':
    case 'GOOGLE_DRIVE':
    case 'GOOGLE_DOCS':
      // Google client IDs can have various formats, just check minimum length
      if (credentials.clientId.length < 20) {
        return {
          provider,
          available: false,
          reason: 'Google client ID appears incomplete (typically 40+ characters)'
        };
      }
      break;

    case 'HUBSPOT':
      if (credentials.clientId === 'personal-access-key') {
        return {
          provider,
          available: false,
          reason: 'HubSpot requires OAuth app credentials, not API keys'
        };
      }
      break;

    case 'SLACK':
      if (!credentials.clientId.includes('.')) {
        return {
          provider,
          available: false,
          reason: 'Slack client ID should contain a dot (app-id.bot-id format)'
        };
      }
      break;

    case 'DROPBOX':
      if (credentials.clientId.length < 10) {
        return {
          provider,
          available: false,
          reason: 'Dropbox app key appears incomplete'
        };
      }
      break;
  }

  return {
    provider,
    available: true
  };
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
    GOOGLE_DOCS: 'GOOGLE',
    MICROSOFT_TEAMS: 'MICROSOFT',
    DROPBOX: 'DROPBOX',
    GITHUB: 'GITHUB',
    FACEBOOK: 'FACEBOOK',
    SHOPIFY: 'SHOPIFY',
    BAMBOOHR: 'BAMBOOHR',
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
  credentials: OrgOAuthCredentials,
  codeVerifier?: string
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

  // Add code verifier for PKCE
  if (config.usePKCE && codeVerifier) {
    body.append('code_verifier', codeVerifier);
  }

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

  console.log(`[OAuth] Exchanging code for tokens: ${provider}${config.usePKCE ? ' (with PKCE)' : ''}`);

  const response = await fetch(config.tokenUrl, {
    method: 'POST',
    headers,
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[OAuth] Token exchange failed for ${provider}:`, {
      status: response.status,
      statusText: response.statusText,
      responseBody: errorText,
      requestUrl: config.tokenUrl,
      requestData: {
        grant_type: 'authorization_code',
        code: code.substring(0, 10) + '...', // Don't log full code
        redirect_uri: finalRedirectUri,
        client_id: credentials.clientId.substring(0, 10) + '...', // Don't log full client_id
      }
    });

    // Try to parse error as JSON for better error messages
    try {
      const errorJson = JSON.parse(errorText);
      console.error(`[OAuth] Parsed error response:`, errorJson);

      if (errorJson.error) {
        throw new Error(`Token exchange failed: ${errorJson.error}${errorJson.error_description ? ' - ' + errorJson.error_description : ''}`);
      }
    } catch (parseError) {
      // If not JSON, use the raw error text
    }

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
  // Temporarily disabled - invalid OAuth app configuration
  // HUBSPOT: {
  //   provider: 'HUBSPOT',
  //   authorizationUrl: 'https://app.hubspot.com/oauth/authorize',
  //   tokenUrl: 'https://api.hubapi.com/oauth/v1/token',
  //   userInfoUrl: 'https://api.hubapi.com/oauth/v1/access-tokens',
  //   scopes: [
  //     'crm.objects.contacts.read',
  //     'crm.objects.contacts.write',
  //     'crm.objects.companies.read',
  //     'crm.objects.companies.write',
  //     'crm.objects.deals.read',
  //     'crm.objects.deals.write',
  //   ],
  //   tokenAuthMethod: 'body',
  //   parseTokenResponse: (tokens) => ({
  //     accessToken: tokens.access_token as string,
  //     refreshToken: tokens.refresh_token as string,
  //     expiresIn: tokens.expires_in as number,
  //     tokenType: tokens.token_type as string,
  //   }),
  // },

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
      'chat:write',
      'users:read',
      'team:read',
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
    usePKCE: true, // Microsoft requires PKCE for cross-origin requests
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

  GOOGLE_DOCS: {
    provider: 'GOOGLE_DOCS',
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    revokeUrl: 'https://oauth2.googleapis.com/revoke',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    scopes: [
      'https://www.googleapis.com/auth/documents',
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

  // -------------------------------------------------------------------------
  // Developer Tools & Project Management
  // -------------------------------------------------------------------------
  // Temporarily disabled - truncated client ID in credentials
  // GITHUB: {
  //   provider: 'GITHUB',
  //   authorizationUrl: 'https://github.com/login/oauth/authorize',
  //   tokenUrl: 'https://github.com/login/oauth/access_token',
  //   userInfoUrl: 'https://api.github.com/user',
  //   scopes: ['repo', 'user'],
  //   tokenAuthMethod: 'body',
  //   parseTokenResponse: (tokens) => ({
  //     accessToken: tokens.access_token as string,
  //     tokenType: tokens.token_type as string,
  //     scope: tokens.scope as string,
  //   }),
  // },

  FACEBOOK: {
    provider: 'FACEBOOK',
    authorizationUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v19.0/oauth/access_token',
    userInfoUrl: 'https://graph.facebook.com/v19.0/me?fields=id,name,email',
    scopes: ['public_profile'],
    tokenAuthMethod: 'body',
    parseTokenResponse: (tokens) => ({
      accessToken: tokens.access_token as string,
      tokenType: tokens.token_type as string,
      expiresIn: tokens.expires_in as number,
    }),
  },

  SHOPIFY: {
    provider: 'SHOPIFY',
    authorizationUrl: 'https://{shop}.myshopify.com/admin/oauth/authorize',
    tokenUrl: 'https://{shop}.myshopify.com/admin/oauth/access_token',
    scopes: ['read_products', 'read_orders'],
    tokenAuthMethod: 'body',
    parseTokenResponse: (tokens) => ({
      accessToken: tokens.access_token as string,
      scope: tokens.scope as string,
    }),
  },

  BAMBOOHR: {
    provider: 'BAMBOOHR',
    authorizationUrl: 'https://{subdomain}.bamboohr.com/oauth2/authorize',
    tokenUrl: 'https://{subdomain}.bamboohr.com/oauth2/token',
    scopes: ['openid', 'profile', 'email'],
    tokenAuthMethod: 'header',
    parseTokenResponse: (tokens) => ({
      accessToken: tokens.access_token as string,
      refreshToken: tokens.refresh_token as string,
      expiresIn: tokens.expires_in as number,
      scope: tokens.scope as string,
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

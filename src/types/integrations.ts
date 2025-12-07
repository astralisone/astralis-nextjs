/**
 * Type definitions for Third-Party Integrations
 *
 * Comprehensive types for OAuth flows, API clients, and integration services
 * for Accounting, CRM, Communication, and Storage providers.
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
  | 'productivity';

/**
 * Integration status for connection state
 */
export type IntegrationStatus =
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
 * Connected integration instance
 */
export interface ConnectedIntegration {
  id: string;
  provider: PrismaIntegrationProvider;
  credentialName: string;
  status: IntegrationStatus;
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
  // Provider-specific fields
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
// Accounting Integrations (QuickBooks, Xero)
// ============================================================================

/**
 * QuickBooks-specific types
 */
export interface QuickBooksCompanyInfo {
  companyName: string;
  companyId: string;
  legalName?: string;
  country?: string;
  email?: string;
  phone?: string;
}

export interface QuickBooksInvoice {
  id: string;
  docNumber: string;
  customerRef: { value: string; name: string };
  totalAmt: number;
  balance: number;
  dueDate: string;
  txnDate: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Voided';
  line: Array<{
    id: string;
    description?: string;
    amount: number;
    detailType: string;
  }>;
}

export interface QuickBooksCustomer {
  id: string;
  displayName: string;
  companyName?: string;
  primaryEmailAddr?: { address: string };
  primaryPhone?: { freeFormNumber: string };
  balance: number;
  active: boolean;
}

export interface QuickBooksPayment {
  id: string;
  totalAmt: number;
  txnDate: string;
  customerRef: { value: string; name: string };
  paymentMethodRef?: { value: string; name: string };
}

/**
 * Xero-specific types
 */
export interface XeroOrganization {
  organisationID: string;
  name: string;
  legalName?: string;
  countryCode: string;
  baseCurrency: string;
  organisationType: string;
}

export interface XeroInvoice {
  invoiceID: string;
  invoiceNumber: string;
  contact: { contactID: string; name: string };
  total: number;
  amountDue: number;
  dueDate: string;
  date: string;
  status: 'DRAFT' | 'SUBMITTED' | 'AUTHORISED' | 'PAID' | 'VOIDED';
  lineItems: Array<{
    lineItemID: string;
    description?: string;
    lineAmount: number;
    quantity: number;
    unitAmount: number;
  }>;
}

export interface XeroContact {
  contactID: string;
  name: string;
  emailAddress?: string;
  phones?: Array<{ phoneNumber: string; phoneType: string }>;
  accountsReceivableTaxType?: string;
  accountsPayableTaxType?: string;
}

// ============================================================================
// CRM Integrations (HubSpot, Salesforce)
// ============================================================================

/**
 * HubSpot-specific types
 */
export interface HubSpotContact {
  id: string;
  properties: {
    email: string;
    firstname?: string;
    lastname?: string;
    phone?: string;
    company?: string;
    lifecyclestage?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface HubSpotCompany {
  id: string;
  properties: {
    name: string;
    domain?: string;
    industry?: string;
    phone?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface HubSpotDeal {
  id: string;
  properties: {
    dealname: string;
    amount?: string;
    dealstage: string;
    closedate?: string;
    pipeline: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Salesforce-specific types
 */
export interface SalesforceContact {
  Id: string;
  FirstName?: string;
  LastName: string;
  Email?: string;
  Phone?: string;
  AccountId?: string;
  Title?: string;
  Department?: string;
}

export interface SalesforceAccount {
  Id: string;
  Name: string;
  Type?: string;
  Industry?: string;
  Phone?: string;
  Website?: string;
  BillingCity?: string;
  BillingState?: string;
  BillingCountry?: string;
}

export interface SalesforceOpportunity {
  Id: string;
  Name: string;
  Amount?: number;
  StageName: string;
  CloseDate: string;
  Probability?: number;
  AccountId?: string;
  Description?: string;
}

export interface SalesforceLead {
  Id: string;
  FirstName?: string;
  LastName: string;
  Email?: string;
  Phone?: string;
  Company: string;
  Status: string;
  LeadSource?: string;
}

// ============================================================================
// Communication Integrations (Slack, Gmail, Microsoft Teams)
// ============================================================================

/**
 * Slack-specific types
 */
export interface SlackWorkspace {
  id: string;
  name: string;
  domain: string;
  icon?: { image_132: string };
}

export interface SlackChannel {
  id: string;
  name: string;
  is_channel: boolean;
  is_private: boolean;
  is_member: boolean;
  num_members?: number;
  topic?: { value: string };
  purpose?: { value: string };
}

export interface SlackUser {
  id: string;
  name: string;
  real_name?: string;
  profile?: {
    email?: string;
    image_72?: string;
    display_name?: string;
  };
  is_admin?: boolean;
  is_bot?: boolean;
}

export interface SlackMessage {
  ts: string;
  channel: string;
  text: string;
  user?: string;
  bot_id?: string;
  thread_ts?: string;
  attachments?: Array<{
    fallback: string;
    color?: string;
    title?: string;
    text?: string;
  }>;
  blocks?: Array<Record<string, unknown>>;
}

/**
 * Gmail-specific types
 */
export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    mimeType: string;
    body?: { data?: string; size: number };
    parts?: Array<{
      mimeType: string;
      body: { data?: string; size: number };
    }>;
  };
  internalDate: string;
}

export interface GmailThread {
  id: string;
  historyId: string;
  messages: GmailMessage[];
}

export interface GmailLabel {
  id: string;
  name: string;
  type: 'system' | 'user';
  messagesTotal?: number;
  messagesUnread?: number;
}

/**
 * Microsoft Teams-specific types
 */
export interface TeamsUser {
  id: string;
  displayName: string;
  mail?: string;
  userPrincipalName: string;
  jobTitle?: string;
  department?: string;
}

export interface TeamsTeam {
  id: string;
  displayName: string;
  description?: string;
  visibility: 'public' | 'private';
  webUrl: string;
}

export interface TeamsChannel {
  id: string;
  displayName: string;
  description?: string;
  email?: string;
  webUrl: string;
  membershipType: 'standard' | 'private' | 'shared';
}

export interface TeamsMessage {
  id: string;
  createdDateTime: string;
  body: { contentType: string; content: string };
  from?: { user?: { displayName: string; id: string } };
  attachments?: Array<{
    id: string;
    contentType: string;
    name: string;
    contentUrl?: string;
  }>;
}

// ============================================================================
// Storage Integrations (Google Drive, Dropbox)
// ============================================================================

/**
 * Google Drive-specific types
 */
export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime: string;
  modifiedTime: string;
  parents?: string[];
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  owners?: Array<{ displayName: string; emailAddress: string }>;
  shared?: boolean;
}

export interface GoogleDriveFolder {
  id: string;
  name: string;
  mimeType: 'application/vnd.google-apps.folder';
  parents?: string[];
  createdTime: string;
  modifiedTime: string;
}

export interface GoogleDrivePermission {
  id: string;
  type: 'user' | 'group' | 'domain' | 'anyone';
  role: 'owner' | 'organizer' | 'fileOrganizer' | 'writer' | 'commenter' | 'reader';
  emailAddress?: string;
  domain?: string;
}

/**
 * Dropbox-specific types
 */
export interface DropboxAccount {
  account_id: string;
  name: { display_name: string; given_name: string; surname: string };
  email: string;
  email_verified: boolean;
  profile_photo_url?: string;
}

export interface DropboxFile {
  id: string;
  name: string;
  path_lower: string;
  path_display: string;
  size: number;
  client_modified: string;
  server_modified: string;
  rev: string;
  is_downloadable: boolean;
  content_hash?: string;
}

export interface DropboxFolder {
  id: string;
  name: string;
  path_lower: string;
  path_display: string;
}

export interface DropboxSharedLink {
  url: string;
  name: string;
  link_permissions: {
    can_revoke: boolean;
    resolved_visibility: 'public' | 'team_only' | 'password' | 'team_and_password';
  };
  expires?: string;
}

// ============================================================================
// API Action Types
// ============================================================================

/**
 * Generic API response wrapper
 */
export interface IntegrationApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  pagination?: {
    cursor?: string;
    hasMore: boolean;
    total?: number;
  };
}

/**
 * Sync operation result
 */
export interface SyncResult {
  provider: PrismaIntegrationProvider;
  syncedAt: Date;
  itemsCreated: number;
  itemsUpdated: number;
  itemsDeleted: number;
  errors: Array<{
    itemId: string;
    error: string;
  }>;
}

/**
 * Webhook event from provider
 */
export interface IntegrationWebhookEvent {
  provider: PrismaIntegrationProvider;
  eventType: string;
  eventId: string;
  timestamp: Date;
  data: Record<string, unknown>;
  signature?: string;
}

// ============================================================================
// Integration Configuration
// ============================================================================

/**
 * Available integrations catalog
 */
export const INTEGRATION_CATALOG: IntegrationMetadata[] = [
  // Accounting
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
  // CRM
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
    id: 'salesforce',
    provider: 'SALESFORCE' as PrismaIntegrationProvider,
    name: 'Salesforce',
    description: 'Connect to Salesforce for leads, accounts, and opportunities',
    category: 'crm',
    icon: 'salesforce',
    color: '#00A1E0',
    oauthSupported: true,
    apiKeySupported: false,
    scopes: ['api', 'refresh_token', 'offline_access'],
    webhooksSupported: true,
  },
  // Communication
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
    id: 'microsoft-teams',
    provider: 'MICROSOFT_TEAMS' as PrismaIntegrationProvider,
    name: 'Microsoft Teams',
    description: 'Send messages and collaborate in Teams channels',
    category: 'communication',
    icon: 'microsoft-teams',
    color: '#6264A7',
    oauthSupported: true,
    apiKeySupported: false,
    scopes: ['User.Read', 'Team.ReadBasic.All', 'Channel.ReadBasic.All', 'ChannelMessage.Send'],
    webhooksSupported: true,
  },
  // Storage
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
  {
    id: 'dropbox',
    provider: 'DROPBOX' as PrismaIntegrationProvider,
    name: 'Dropbox',
    description: 'Sync documents and files with Dropbox',
    category: 'storage',
    icon: 'dropbox',
    color: '#0061FF',
    oauthSupported: true,
    apiKeySupported: false,
    scopes: ['files.content.read', 'files.content.write', 'sharing.read', 'sharing.write'],
    webhooksSupported: true,
  },
];

/**
 * Get integration metadata by provider
 */
export function getIntegrationMetadata(provider: PrismaIntegrationProvider): IntegrationMetadata | undefined {
  return INTEGRATION_CATALOG.find((i) => i.provider === provider);
}

/**
 * Get integrations by category
 */
export function getIntegrationsByCategory(category: IntegrationCategory): IntegrationMetadata[] {
  return INTEGRATION_CATALOG.filter((i) => i.category === category);
}

// Export provider type alias
export type IntegrationProvider = PrismaIntegrationProvider;

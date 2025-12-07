import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { z } from 'zod';
import {
  quickBooksService,
  xeroService,
  hubSpotService,
  salesforceService,
  slackService,
  gmailService,
  teamsService,
  googleDriveService,
  dropboxService,
} from '@/lib/integrations';
import type { IntegrationProvider } from '@prisma/client';

/**
 * Action request schema
 */
const actionRequestSchema = z.object({
  credentialId: z.string().min(1),
  action: z.string().min(1),
  params: z.record(z.unknown()).optional(),
});

/**
 * POST /api/integrations/[provider]/actions
 *
 * Execute an action on a connected integration.
 *
 * Body: {
 *   credentialId: string,
 *   action: string (e.g., "listInvoices", "sendMessage"),
 *   params?: object (action-specific parameters)
 * }
 *
 * Auth: Required
 * Returns: { success: boolean, data?: any, error?: object }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider: providerParam } = await params;
  const provider = providerParam.toUpperCase().replace(/-/g, '_') as IntegrationProvider;

  try {
    // 1. Verify authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!session.user.orgId) {
      return NextResponse.json(
        { error: 'Forbidden', details: 'Organization required' },
        { status: 403 }
      );
    }

    // 2. Parse and validate body
    const body = await req.json();
    const parsed = actionRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { credentialId, action, params: actionParams } = parsed.data;

    // 3. Execute the action
    const result = await executeAction(
      provider,
      credentialId,
      session.user.id,
      session.user.orgId,
      action,
      actionParams
    );

    // 4. Return result
    return NextResponse.json(result);

  } catch (error) {
    console.error(`[API /api/integrations/${provider}/actions POST] Error:`, error);
    return NextResponse.json(
      {
        success: false,
        error: 'Action failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Execute an integration action
 */
async function executeAction(
  provider: IntegrationProvider,
  credentialId: string,
  userId: string,
  orgId: string,
  action: string,
  params?: Record<string, unknown>
): Promise<{ success: boolean; data?: unknown; error?: { code: string; message: string } }> {
  // Get and initialize the service
  const service = getServiceForProvider(provider);

  if (!service) {
    return {
      success: false,
      error: { code: 'UNSUPPORTED_PROVIDER', message: `No service available for ${provider}` },
    };
  }

  await service.initialize(credentialId, userId, orgId);

  // Execute action based on provider
  switch (provider) {
    case 'QUICKBOOKS':
      return executeQuickBooksAction(action, params);
    case 'XERO':
      return executeXeroAction(action, params);
    case 'HUBSPOT':
      return executeHubSpotAction(action, params);
    case 'SALESFORCE':
      return executeSalesforceAction(action, params);
    case 'SLACK':
      return executeSlackAction(action, params);
    case 'GMAIL':
      return executeGmailAction(action, params);
    case 'MICROSOFT_TEAMS':
      return executeTeamsAction(action, params);
    case 'GOOGLE_DRIVE':
      return executeGoogleDriveAction(action, params);
    case 'DROPBOX':
      return executeDropboxAction(action, params);
    default:
      return {
        success: false,
        error: { code: 'UNSUPPORTED_ACTION', message: `Provider ${provider} not supported` },
      };
  }
}

// QuickBooks Actions
async function executeQuickBooksAction(action: string, params?: Record<string, unknown>) {
  switch (action) {
    case 'getCompanyInfo':
      return quickBooksService.getCompanyInfo();
    case 'listInvoices':
      return quickBooksService.listInvoices(params as any);
    case 'getInvoice':
      return quickBooksService.getInvoice(params?.invoiceId as string);
    case 'createInvoice':
      return quickBooksService.createInvoice(params as any);
    case 'listCustomers':
      return quickBooksService.listCustomers(params as any);
    case 'createCustomer':
      return quickBooksService.createCustomer(params as any);
    case 'listPayments':
      return quickBooksService.listPayments(params as any);
    default:
      return { success: false, error: { code: 'UNKNOWN_ACTION', message: `Unknown action: ${action}` } };
  }
}

// Xero Actions
async function executeXeroAction(action: string, params?: Record<string, unknown>) {
  switch (action) {
    case 'getOrganization':
      return xeroService.getOrganization();
    case 'listInvoices':
      return xeroService.listInvoices(params as any);
    case 'getInvoice':
      return xeroService.getInvoice(params?.invoiceId as string);
    case 'createInvoice':
      return xeroService.createInvoice(params as any);
    case 'listContacts':
      return xeroService.listContacts(params as any);
    case 'createContact':
      return xeroService.createContact(params as any);
    default:
      return { success: false, error: { code: 'UNKNOWN_ACTION', message: `Unknown action: ${action}` } };
  }
}

// HubSpot Actions
async function executeHubSpotAction(action: string, params?: Record<string, unknown>) {
  switch (action) {
    case 'listContacts':
      return hubSpotService.listContacts(params as any);
    case 'getContact':
      return hubSpotService.getContact(params?.contactId as string);
    case 'createContact':
      return hubSpotService.createContact(params as any);
    case 'searchContacts':
      return hubSpotService.searchContacts(params?.query as string);
    case 'listCompanies':
      return hubSpotService.listCompanies(params as any);
    case 'createCompany':
      return hubSpotService.createCompany(params as any);
    case 'listDeals':
      return hubSpotService.listDeals(params as any);
    case 'createDeal':
      return hubSpotService.createDeal(params as any);
    case 'getPipelines':
      return hubSpotService.getPipelines();
    default:
      return { success: false, error: { code: 'UNKNOWN_ACTION', message: `Unknown action: ${action}` } };
  }
}

// Salesforce Actions
async function executeSalesforceAction(action: string, params?: Record<string, unknown>) {
  switch (action) {
    case 'listContacts':
      return salesforceService.listContacts(params as any);
    case 'getContact':
      return salesforceService.getContact(params?.contactId as string);
    case 'createContact':
      return salesforceService.createContact(params as any);
    case 'listAccounts':
      return salesforceService.listAccounts(params as any);
    case 'createAccount':
      return salesforceService.createAccount(params as any);
    case 'listOpportunities':
      return salesforceService.listOpportunities(params as any);
    case 'createOpportunity':
      return salesforceService.createOpportunity(params as any);
    case 'listLeads':
      return salesforceService.listLeads(params as any);
    case 'createLead':
      return salesforceService.createLead(params as any);
    default:
      return { success: false, error: { code: 'UNKNOWN_ACTION', message: `Unknown action: ${action}` } };
  }
}

// Slack Actions
async function executeSlackAction(action: string, params?: Record<string, unknown>) {
  switch (action) {
    case 'sendMessage':
      return slackService.sendMessage(params as any);
    case 'listChannels':
      return slackService.listChannels(params as any);
    case 'listUsers':
      return slackService.listUsers(params as any);
    case 'getUser':
      return slackService.getUser(params?.userId as string);
    case 'joinChannel':
      return slackService.joinChannel(params?.channelId as string);
    default:
      return { success: false, error: { code: 'UNKNOWN_ACTION', message: `Unknown action: ${action}` } };
  }
}

// Gmail Actions
async function executeGmailAction(action: string, params?: Record<string, unknown>) {
  switch (action) {
    case 'getProfile':
      return gmailService.getProfile();
    case 'listMessages':
      return gmailService.listMessages(params as any);
    case 'getMessage':
      return gmailService.getMessage(params?.messageId as string);
    case 'sendEmail':
      return gmailService.sendEmail(params as any);
    case 'listLabels':
      return gmailService.listLabels();
    case 'listThreads':
      return gmailService.listThreads(params as any);
    default:
      return { success: false, error: { code: 'UNKNOWN_ACTION', message: `Unknown action: ${action}` } };
  }
}

// Microsoft Teams Actions
async function executeTeamsAction(action: string, params?: Record<string, unknown>) {
  switch (action) {
    case 'getMe':
      return teamsService.getMe();
    case 'listTeams':
      return teamsService.listTeams();
    case 'listChannels':
      return teamsService.listChannels(params?.teamId as string);
    case 'sendChannelMessage':
      return teamsService.sendChannelMessage(
        params?.teamId as string,
        params?.channelId as string,
        params?.message as any
      );
    case 'listChats':
      return teamsService.listChats();
    case 'sendChatMessage':
      return teamsService.sendChatMessage(params?.chatId as string, params?.message as any);
    default:
      return { success: false, error: { code: 'UNKNOWN_ACTION', message: `Unknown action: ${action}` } };
  }
}

// Google Drive Actions
async function executeGoogleDriveAction(action: string, params?: Record<string, unknown>) {
  switch (action) {
    case 'listFiles':
      return googleDriveService.listFiles(params as any);
    case 'getFile':
      return googleDriveService.getFile(params?.fileId as string);
    case 'uploadFile':
      return googleDriveService.uploadFile(params as any);
    case 'createFolder':
      return googleDriveService.createFolder(params as any);
    case 'shareFile':
      return googleDriveService.shareFile(params?.fileId as string, params?.share as any);
    case 'searchFiles':
      return googleDriveService.searchFiles(params?.query as string, params as any);
    default:
      return { success: false, error: { code: 'UNKNOWN_ACTION', message: `Unknown action: ${action}` } };
  }
}

// Dropbox Actions
async function executeDropboxAction(action: string, params?: Record<string, unknown>) {
  switch (action) {
    case 'listFolder':
      return dropboxService.listFolder(params as any);
    case 'getMetadata':
      return dropboxService.getMetadata(params?.path as string);
    case 'uploadFile':
      return dropboxService.uploadFile(params as any);
    case 'createFolder':
      return dropboxService.createFolder(params as any);
    case 'createSharedLink':
      return dropboxService.createSharedLink(params?.path as string, params?.settings as any);
    case 'search':
      return dropboxService.search(params?.query as string, params as any);
    default:
      return { success: false, error: { code: 'UNKNOWN_ACTION', message: `Unknown action: ${action}` } };
  }
}

/**
 * Get the service instance for a provider
 */
function getServiceForProvider(provider: IntegrationProvider) {
  const serviceMap: Partial<Record<IntegrationProvider, any>> = {
    QUICKBOOKS: quickBooksService,
    XERO: xeroService,
    HUBSPOT: hubSpotService,
    SALESFORCE: salesforceService,
    SLACK: slackService,
    GMAIL: gmailService,
    MICROSOFT_TEAMS: teamsService,
    GOOGLE_DRIVE: googleDriveService,
    DROPBOX: dropboxService,
  };

  return serviceMap[provider] || null;
}

/**
 * Action Discovery Service
 *
 * AI-powered service to discover actions from API schemas.
 * Focuses on Gmail, Dropbox, and Google Docs integrations.
 */

import { actionRepository } from './action-repository';
import {
  IActionDiscoveryService,
  ActionDefinition,
  ValidationResult,
  IntegrationProvider
} from '@/lib/types/action';

export class ActionDiscoveryService implements IActionDiscoveryService {
  /**
   * Discover actions for a specific integration
   */
  async discoverActionsForIntegration(integrationId: string): Promise<ActionDefinition[]> {
    // Check if we already have actions for this integration
    const provider = await this.getProviderForIntegration(integrationId);
    if (!provider) {
      throw new Error(`Integration not found: ${integrationId}`);
    }

    // Check repository cache first
    const existingActions = await actionRepository.findByProvider(provider);
    if (existingActions.length > 0) {
      console.log(`✅ Using cached actions for ${provider}, saved AI inference costs`);
      return existingActions;
    }

    // Discover new actions based on provider
    const actions = await this.discoverActionsForProvider(provider);

    // Validate and save to repository
    const validatedActions = [];
    for (const action of actions) {
      const validation = await this.validateAction(action);
      if (validation.isValid) {
        validatedActions.push(action);
      } else {
        console.warn(`Skipping invalid action ${action.actionKey}:`, validation.errors);
      }
    }

    // Save to repository
    if (validatedActions.length > 0) {
      await actionRepository.saveBulk(validatedActions);
      console.log(`✅ Discovered and saved ${validatedActions.length} actions for ${provider}`);
    }

    return validatedActions;
  }

  /**
   * Validate an action definition
   */
  async validateAction(action: ActionDefinition): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!action.actionKey) errors.push('Missing actionKey');
    if (!action.provider) errors.push('Missing provider');
    if (!action.name) errors.push('Missing name');
    if (!action.category) errors.push('Missing category');
    if (!action.inputSchema) errors.push('Missing inputSchema');
    if (!action.outputSchema) errors.push('Missing outputSchema');
    if (!action.executionSpec) errors.push('Missing executionSpec');

    // Validate execution spec
    if (action.executionSpec) {
      if (!action.executionSpec.method) errors.push('Missing execution method');
      if (!action.executionSpec.baseUrl) errors.push('Missing base URL');
      if (!action.executionSpec.endpoint) errors.push('Missing endpoint');
      if (!action.executionSpec.authType) errors.push('Missing auth type');
    }

    // Validate JSON schemas (basic check)
    if (action.inputSchema && typeof action.inputSchema !== 'object') {
      errors.push('Invalid inputSchema format');
    }
    if (action.outputSchema && typeof action.outputSchema !== 'object') {
      errors.push('Invalid outputSchema format');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Refresh actions for a provider (force rediscovery)
   */
  async refreshActionsForProvider(provider: IntegrationProvider): Promise<ActionDefinition[]> {
    // Delete existing actions
    const existingActions = await actionRepository.findByProvider(provider);
    for (const action of existingActions) {
      await actionRepository.delete(action.id);
    }

    // Discover new actions
    const newActions = await this.discoverActionsForProvider(provider);

    // Save new actions
    if (newActions.length > 0) {
      await actionRepository.saveBulk(newActions);
    }

    return newActions;
  }

  /**
   * Discover actions based on provider
   */
  private async discoverActionsForProvider(provider: IntegrationProvider): Promise<ActionDefinition[]> {
    switch (provider) {
      case IntegrationProvider.GMAIL:
        return this.discoverGmailActions();
      case IntegrationProvider.GOOGLE_DRIVE:
        return this.discoverDropboxActions(); // Note: Using same for Google Drive
      case IntegrationProvider.GOOGLE_DOCS:
        return this.discoverDocsActions();
      default:
        console.warn(`No discovery logic for provider: ${provider}`);
        return [];
    }
  }

  /**
   * Discover Gmail actions
   */
  private async discoverGmailActions(): Promise<ActionDefinition[]> {
    const actions: ActionDefinition[] = [];

    // Send Email Action
    actions.push({
      actionKey: 'gmail-send-email-v1',
      provider: IntegrationProvider.GMAIL,
      name: 'Send Email',
      description: 'Send an email via Gmail',
      category: 'communication',
      version: '1.0.0',
      status: 'ACTIVE',
      tags: ['email', 'communication', 'send'],
      executionCount: 0,
      inputSchema: {
        type: 'object',
        properties: {
          to: { type: 'string', format: 'email', description: 'Recipient email address' },
          subject: { type: 'string', description: 'Email subject' },
          body: { type: 'string', description: 'Email body (HTML or plain text)' },
          cc: { type: 'array', items: { type: 'string', format: 'email' }, description: 'CC recipients' },
          bcc: { type: 'array', items: { type: 'string', format: 'email' }, description: 'BCC recipients' },
        },
        required: ['to', 'subject', 'body'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          messageId: { type: 'string', description: 'Gmail message ID' },
          threadId: { type: 'string', description: 'Gmail thread ID' },
        },
      },
      executionSpec: {
        method: 'POST',
        baseUrl: 'https://gmail.googleapis.com',
        endpoint: '/gmail/v1/users/me/messages/send',
        authType: 'oauth2',
        bodyTemplate: {
          raw: '{{body}}', // Base64 encoded email content would be built here
        },
      },
    });

    // Search Emails Action
    actions.push({
      actionKey: 'gmail-search-emails-v1',
      provider: IntegrationProvider.GMAIL,
      name: 'Search Emails',
      description: 'Search for emails in Gmail',
      category: 'communication',
      version: '1.0.0',
      status: 'ACTIVE',
      tags: ['email', 'search', 'read'],
      executionCount: 0,
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Gmail search query' },
          maxResults: { type: 'number', minimum: 1, maximum: 500, default: 10 },
        },
        required: ['query'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          messages: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                threadId: { type: 'string' },
                snippet: { type: 'string' },
              },
            },
          },
        },
      },
      executionSpec: {
        method: 'GET',
        baseUrl: 'https://gmail.googleapis.com',
        endpoint: '/gmail/v1/users/me/messages',
        authType: 'oauth2',
        queryParams: {
          q: '{{query}}',
          maxResults: '{{maxResults}}',
        },
      },
    });

    return actions;
  }

  /**
   * Discover Google Drive actions (treating as Dropbox-like storage)
   */
  private async discoverDropboxActions(): Promise<ActionDefinition[]> {
    const actions: ActionDefinition[] = [];

    // Upload File Action
    actions.push({
      actionKey: 'drive-upload-file-v1',
      provider: IntegrationProvider.GOOGLE_DRIVE,
      name: 'Upload File',
      description: 'Upload a file to Google Drive',
      category: 'storage',
      version: '1.0.0',
      status: 'ACTIVE',
      tags: ['file', 'upload', 'storage'],
      executionCount: 0,
      inputSchema: {
        type: 'object',
        properties: {
          filename: { type: 'string', description: 'Name of the file' },
          content: { type: 'string', description: 'File content (base64 encoded)' },
          mimeType: { type: 'string', description: 'MIME type of the file' },
          folderId: { type: 'string', description: 'Parent folder ID (optional)' },
        },
        required: ['filename', 'content', 'mimeType'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'File ID' },
          name: { type: 'string', description: 'File name' },
          webViewLink: { type: 'string', description: 'Web view link' },
        },
      },
      executionSpec: {
        method: 'POST',
        baseUrl: 'https://www.googleapis.com',
        endpoint: '/upload/drive/v3/files',
        authType: 'oauth2',
        queryParams: {
          uploadType: 'multipart',
        },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    });

    // List Files Action
    actions.push({
      actionKey: 'drive-list-files-v1',
      provider: IntegrationProvider.GOOGLE_DRIVE,
      name: 'List Files',
      description: 'List files in Google Drive',
      category: 'storage',
      version: '1.0.0',
      status: 'ACTIVE',
      tags: ['file', 'list', 'storage'],
      executionCount: 0,
      inputSchema: {
        type: 'object',
        properties: {
          folderId: { type: 'string', description: 'Folder ID to list (optional)' },
          query: { type: 'string', description: 'Search query' },
          pageSize: { type: 'number', minimum: 1, maximum: 1000, default: 100 },
        },
      },
      outputSchema: {
        type: 'object',
        properties: {
          files: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                mimeType: { type: 'string' },
                webViewLink: { type: 'string' },
              },
            },
          },
        },
      },
      executionSpec: {
        method: 'GET',
        baseUrl: 'https://www.googleapis.com',
        endpoint: '/drive/v3/files',
        authType: 'oauth2',
        queryParams: {
          q: '{{query}}',
          pageSize: '{{pageSize}}',
        },
      },
    });

    return actions;
  }

  /**
   * Discover Google Docs actions
   */
  private async discoverDocsActions(): Promise<ActionDefinition[]> {
    const actions: ActionDefinition[] = [];

    // Create Document Action
    actions.push({
      actionKey: 'docs-create-document-v1',
      provider: IntegrationProvider.GOOGLE_DOCS,
      name: 'Create Document',
      description: 'Create a new Google Doc',
      category: 'productivity',
      version: '1.0.0',
      status: 'ACTIVE',
      tags: ['document', 'create', 'productivity'],
      executionCount: 0,
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Document title' },
          content: { type: 'string', description: 'Initial document content' },
          folderId: { type: 'string', description: 'Parent folder ID (optional)' },
        },
        required: ['title'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          documentId: { type: 'string', description: 'Document ID' },
          title: { type: 'string', description: 'Document title' },
          alternateLink: { type: 'string', description: 'Web view link' },
        },
      },
      executionSpec: {
        method: 'POST',
        baseUrl: 'https://docs.googleapis.com',
        endpoint: '/v1/documents',
        authType: 'oauth2',
        bodyTemplate: {
          title: '{{title}}',
        },
      },
    });

    // Get Document Content Action
    actions.push({
      actionKey: 'docs-get-document-v1',
      provider: IntegrationProvider.GOOGLE_DOCS,
      name: 'Get Document',
      description: 'Retrieve Google Doc content',
      category: 'productivity',
      version: '1.0.0',
      status: 'ACTIVE',
      tags: ['document', 'read', 'content'],
      executionCount: 0,
      inputSchema: {
        type: 'object',
        properties: {
          documentId: { type: 'string', description: 'Document ID' },
        },
        required: ['documentId'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          documentId: { type: 'string' },
          title: { type: 'string' },
          body: {
            type: 'object',
            description: 'Document content structure',
          },
        },
      },
      executionSpec: {
        method: 'GET',
        baseUrl: 'https://docs.googleapis.com',
        endpoint: '/v1/documents/{{documentId}}',
        authType: 'oauth2',
      },
    });

    return actions;
  }

  /**
   * Get provider for integration ID
   */
  private async getProviderForIntegration(integrationId: string): Promise<IntegrationProvider | null> {
    // This would query the integration_credentials table
    // For now, return null - provider should be determined elsewhere
    console.warn('getProviderForIntegration not implemented');
    return null;
  }
}

// Export singleton instance
export const actionDiscoveryService = new ActionDiscoveryService();
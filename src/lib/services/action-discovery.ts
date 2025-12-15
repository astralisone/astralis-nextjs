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
      case IntegrationProvider.GOOGLE_SHEETS:
        return this.discoverSheetsActions();
      case IntegrationProvider.GOOGLE_CALENDAR:
        return this.discoverCalendarActions();
      case IntegrationProvider.SLACK:
        return this.discoverSlackActions();
      case IntegrationProvider.DROPBOX:
        return this.discoverActualDropboxActions();
      case IntegrationProvider.HUBSPOT:
        return this.discoverHubSpotActions();
      case IntegrationProvider.SALESFORCE:
        return this.discoverSalesforceActions();
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
   * Discover Google Sheets actions
   */
  private async discoverSheetsActions(): Promise<ActionDefinition[]> {
    const actions: ActionDefinition[] = [];

    // Create Spreadsheet Action
    actions.push({
      actionKey: 'sheets-create-spreadsheet-v1',
      provider: IntegrationProvider.GOOGLE_SHEETS,
      name: 'Create Spreadsheet',
      description: 'Create a new Google Sheets spreadsheet',
      category: 'productivity',
      version: '1.0.0',
      status: 'ACTIVE',
      tags: ['spreadsheet', 'create', 'productivity'],
      executionCount: 0,
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Spreadsheet title' },
          folderId: { type: 'string', description: 'Parent folder ID (optional)' },
        },
        required: ['title'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          spreadsheetId: { type: 'string', description: 'Spreadsheet ID' },
          spreadsheetUrl: { type: 'string', description: 'Spreadsheet URL' },
        },
      },
      executionSpec: {
        method: 'POST',
        baseUrl: 'https://sheets.googleapis.com',
        endpoint: '/v4/spreadsheets',
        authType: 'oauth2',
        bodyTemplate: {
          properties: {
            title: '{{title}}',
          },
        },
      },
    });

    // Read Range Action
    actions.push({
      actionKey: 'sheets-read-range-v1',
      provider: IntegrationProvider.GOOGLE_SHEETS,
      name: 'Read Range',
      description: 'Read data from a Google Sheets range',
      category: 'productivity',
      version: '1.0.0',
      status: 'ACTIVE',
      tags: ['spreadsheet', 'read', 'data'],
      executionCount: 0,
      inputSchema: {
        type: 'object',
        properties: {
          spreadsheetId: { type: 'string', description: 'Spreadsheet ID' },
          range: { type: 'string', description: 'Range to read (e.g., Sheet1!A1:B10)' },
        },
        required: ['spreadsheetId', 'range'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          values: {
            type: 'array',
            items: { type: 'array', items: { type: 'string' } },
            description: '2D array of cell values',
          },
        },
      },
      executionSpec: {
        method: 'GET',
        baseUrl: 'https://sheets.googleapis.com',
        endpoint: '/v4/spreadsheets/{{spreadsheetId}}/values/{{range}}',
        authType: 'oauth2',
      },
    });

    // Write Range Action
    actions.push({
      actionKey: 'sheets-write-range-v1',
      provider: IntegrationProvider.GOOGLE_SHEETS,
      name: 'Write Range',
      description: 'Write data to a Google Sheets range',
      category: 'productivity',
      version: '1.0.0',
      status: 'ACTIVE',
      tags: ['spreadsheet', 'write', 'data'],
      executionCount: 0,
      inputSchema: {
        type: 'object',
        properties: {
          spreadsheetId: { type: 'string', description: 'Spreadsheet ID' },
          range: { type: 'string', description: 'Range to write (e.g., Sheet1!A1:B10)' },
          values: {
            type: 'array',
            items: { type: 'array', items: { type: 'string' } },
            description: '2D array of values to write',
          },
        },
        required: ['spreadsheetId', 'range', 'values'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          updatedRange: { type: 'string', description: 'Range that was updated' },
          updatedRows: { type: 'number', description: 'Number of rows updated' },
          updatedColumns: { type: 'number', description: 'Number of columns updated' },
        },
      },
      executionSpec: {
        method: 'PUT',
        baseUrl: 'https://sheets.googleapis.com',
        endpoint: '/v4/spreadsheets/{{spreadsheetId}}/values/{{range}}',
        authType: 'oauth2',
        queryParams: {
          valueInputOption: 'RAW',
        },
        bodyTemplate: {
          values: '{{values}}',
        },
      },
    });

    return actions;
  }

  /**
   * Discover Google Calendar actions
   */
  private async discoverCalendarActions(): Promise<ActionDefinition[]> {
    const actions: ActionDefinition[] = [];

    // Create Event Action
    actions.push({
      actionKey: 'calendar-create-event-v1',
      provider: IntegrationProvider.GOOGLE_CALENDAR,
      name: 'Create Event',
      description: 'Create a new Google Calendar event',
      category: 'productivity',
      version: '1.0.0',
      status: 'ACTIVE',
      tags: ['calendar', 'event', 'create'],
      executionCount: 0,
      inputSchema: {
        type: 'object',
        properties: {
          summary: { type: 'string', description: 'Event title' },
          description: { type: 'string', description: 'Event description' },
          start: {
            type: 'object',
            properties: {
              dateTime: { type: 'string', format: 'date-time', description: 'Start date/time in ISO format' },
              timeZone: { type: 'string', description: 'Time zone' },
            },
            required: ['dateTime'],
          },
          end: {
            type: 'object',
            properties: {
              dateTime: { type: 'string', format: 'date-time', description: 'End date/time in ISO format' },
              timeZone: { type: 'string', description: 'Time zone' },
            },
            required: ['dateTime'],
          },
          attendees: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                email: { type: 'string', format: 'email' },
              },
            },
            description: 'List of attendees',
          },
        },
        required: ['summary', 'start', 'end'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Event ID' },
          htmlLink: { type: 'string', description: 'Event link' },
          status: { type: 'string', description: 'Event status' },
        },
      },
      executionSpec: {
        method: 'POST',
        baseUrl: 'https://www.googleapis.com',
        endpoint: '/calendar/v3/calendars/primary/events',
        authType: 'oauth2',
        bodyTemplate: {
          summary: '{{summary}}',
          description: '{{description}}',
          start: '{{start}}',
          end: '{{end}}',
          attendees: '{{attendees}}',
        },
      },
    });

    // List Events Action
    actions.push({
      actionKey: 'calendar-list-events-v1',
      provider: IntegrationProvider.GOOGLE_CALENDAR,
      name: 'List Events',
      description: 'List Google Calendar events',
      category: 'productivity',
      version: '1.0.0',
      status: 'ACTIVE',
      tags: ['calendar', 'events', 'list'],
      executionCount: 0,
      inputSchema: {
        type: 'object',
        properties: {
          timeMin: { type: 'string', format: 'date-time', description: 'Start time filter' },
          timeMax: { type: 'string', format: 'date-time', description: 'End time filter' },
          maxResults: { type: 'number', minimum: 1, maximum: 2500, default: 10 },
          q: { type: 'string', description: 'Search query' },
        },
      },
      outputSchema: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                summary: { type: 'string' },
                start: { type: 'object' },
                end: { type: 'object' },
                htmlLink: { type: 'string' },
              },
            },
          },
        },
      },
      executionSpec: {
        method: 'GET',
        baseUrl: 'https://www.googleapis.com',
        endpoint: '/calendar/v3/calendars/primary/events',
        authType: 'oauth2',
        queryParams: {
          timeMin: '{{timeMin}}',
          timeMax: '{{timeMax}}',
          maxResults: '{{maxResults}}',
          q: '{{q}}',
        },
      },
    });

    return actions;
  }

  /**
   * Discover Slack actions
   */
  private async discoverSlackActions(): Promise<ActionDefinition[]> {
    const actions: ActionDefinition[] = [];

    // Send Message Action
    actions.push({
      actionKey: 'slack-send-message-v1',
      provider: IntegrationProvider.SLACK,
      name: 'Send Message',
      description: 'Send a message to a Slack channel or user',
      category: 'communication',
      version: '1.0.0',
      status: 'ACTIVE',
      tags: ['slack', 'message', 'send'],
      executionCount: 0,
      inputSchema: {
        type: 'object',
        properties: {
          channel: { type: 'string', description: 'Channel ID or name (e.g., #general or C1234567890)' },
          text: { type: 'string', description: 'Message text' },
          username: { type: 'string', description: 'Username to send as' },
          icon_emoji: { type: 'string', description: 'Emoji icon (e.g., :robot_face:)' },
        },
        required: ['channel', 'text'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          ok: { type: 'boolean' },
          channel: { type: 'string' },
          ts: { type: 'string', description: 'Timestamp of the message' },
          message: { type: 'object' },
        },
      },
      executionSpec: {
        method: 'POST',
        baseUrl: 'https://slack.com',
        endpoint: '/api/chat.postMessage',
        authType: 'bearer',
        headers: {
          'Content-Type': 'application/json',
        },
        bodyTemplate: {
          channel: '{{channel}}',
          text: '{{text}}',
          username: '{{username}}',
          icon_emoji: '{{icon_emoji}}',
        },
      },
    });

    // Create Channel Action
    actions.push({
      actionKey: 'slack-create-channel-v1',
      provider: IntegrationProvider.SLACK,
      name: 'Create Channel',
      description: 'Create a new Slack channel',
      category: 'communication',
      version: '1.0.0',
      status: 'ACTIVE',
      tags: ['slack', 'channel', 'create'],
      executionCount: 0,
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Channel name (without #)' },
          is_private: { type: 'boolean', description: 'Whether the channel is private', default: false },
        },
        required: ['name'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          ok: { type: 'boolean' },
          channel: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              is_private: { type: 'boolean' },
            },
          },
        },
      },
      executionSpec: {
        method: 'POST',
        baseUrl: 'https://slack.com',
        endpoint: '/api/conversations.create',
        authType: 'bearer',
        headers: {
          'Content-Type': 'application/json',
        },
        bodyTemplate: {
          name: '{{name}}',
          is_private: '{{is_private}}',
        },
      },
    });

    return actions;
  }

  /**
   * Discover actual Dropbox actions
   */
  private async discoverActualDropboxActions(): Promise<ActionDefinition[]> {
    const actions: ActionDefinition[] = [];

    // Upload File Action
    actions.push({
      actionKey: 'dropbox-upload-file-v1',
      provider: IntegrationProvider.DROPBOX,
      name: 'Upload File',
      description: 'Upload a file to Dropbox',
      category: 'storage',
      version: '1.0.0',
      status: 'ACTIVE',
      tags: ['dropbox', 'file', 'upload'],
      executionCount: 0,
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Path where to upload the file (e.g., /folder/file.txt)' },
          content: { type: 'string', description: 'File content (base64 encoded)' },
          mode: { type: 'string', enum: ['add', 'overwrite', 'update'], default: 'add' },
          autorename: { type: 'boolean', default: true },
        },
        required: ['path', 'content'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          path_lower: { type: 'string' },
          path_display: { type: 'string' },
          id: { type: 'string' },
          size: { type: 'number' },
        },
      },
      executionSpec: {
        method: 'POST',
        baseUrl: 'https://content.dropboxapi.com',
        endpoint: '/2/files/upload',
        authType: 'bearer',
        headers: {
          'Content-Type': 'application/octet-stream',
          'Dropbox-API-Arg': JSON.stringify({
            path: '{{path}}',
            mode: '{{mode}}',
            autorename: '{{autorename}}',
          }),
        },
      },
    });

    // List Folder Action
    actions.push({
      actionKey: 'dropbox-list-folder-v1',
      provider: IntegrationProvider.DROPBOX,
      name: 'List Folder',
      description: 'List contents of a Dropbox folder',
      category: 'storage',
      version: '1.0.0',
      status: 'ACTIVE',
      tags: ['dropbox', 'folder', 'list'],
      executionCount: 0,
      inputSchema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Path to list (empty string for root)', default: '' },
          recursive: { type: 'boolean', default: false },
          limit: { type: 'number', minimum: 1, maximum: 2000, default: 100 },
        },
      },
      outputSchema: {
        type: 'object',
        properties: {
          entries: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                '.tag': { type: 'string' },
                name: { type: 'string' },
                path_lower: { type: 'string' },
                path_display: { type: 'string' },
                id: { type: 'string' },
              },
            },
          },
        },
      },
      executionSpec: {
        method: 'POST',
        baseUrl: 'https://api.dropboxapi.com',
        endpoint: '/2/files/list_folder',
        authType: 'bearer',
        headers: {
          'Content-Type': 'application/json',
        },
        bodyTemplate: {
          path: '{{path}}',
          recursive: '{{recursive}}',
          limit: '{{limit}}',
        },
      },
    });

    return actions;
  }

  /**
   * Discover HubSpot actions
   */
  private async discoverHubSpotActions(): Promise<ActionDefinition[]> {
    const actions: ActionDefinition[] = [];

    // Create Contact Action
    actions.push({
      actionKey: 'hubspot-create-contact-v1',
      provider: IntegrationProvider.HUBSPOT,
      name: 'Create Contact',
      description: 'Create a new contact in HubSpot',
      category: 'crm',
      version: '1.0.0',
      status: 'ACTIVE',
      tags: ['hubspot', 'contact', 'create'],
      executionCount: 0,
      inputSchema: {
        type: 'object',
        properties: {
          properties: {
            type: 'object',
            properties: {
              firstname: { type: 'string' },
              lastname: { type: 'string' },
              email: { type: 'string', format: 'email' },
              phone: { type: 'string' },
              company: { type: 'string' },
            },
          },
        },
        required: ['properties'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          properties: { type: 'object' },
        },
      },
      executionSpec: {
        method: 'POST',
        baseUrl: 'https://api.hubapi.com',
        endpoint: '/crm/v3/objects/contacts',
        authType: 'bearer',
        headers: {
          'Content-Type': 'application/json',
        },
        bodyTemplate: {
          properties: '{{properties}}',
        },
      },
    });

    // Search Contacts Action
    actions.push({
      actionKey: 'hubspot-search-contacts-v1',
      provider: IntegrationProvider.HUBSPOT,
      name: 'Search Contacts',
      description: 'Search for contacts in HubSpot',
      category: 'crm',
      version: '1.0.0',
      status: 'ACTIVE',
      tags: ['hubspot', 'contact', 'search'],
      executionCount: 0,
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
          properties: {
            type: 'array',
            items: { type: 'string' },
            default: ['firstname', 'lastname', 'email'],
          },
        },
      },
      outputSchema: {
        type: 'object',
        properties: {
          total: { type: 'number' },
          results: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                properties: { type: 'object' },
              },
            },
          },
        },
      },
      executionSpec: {
        method: 'POST',
        baseUrl: 'https://api.hubapi.com',
        endpoint: '/crm/v3/objects/contacts/search',
        authType: 'bearer',
        headers: {
          'Content-Type': 'application/json',
        },
        bodyTemplate: {
          query: '{{query}}',
          limit: '{{limit}}',
          properties: '{{properties}}',
        },
      },
    });

    return actions;
  }

  /**
   * Discover Salesforce actions
   */
  private async discoverSalesforceActions(): Promise<ActionDefinition[]> {
    const actions: ActionDefinition[] = [];

    // Create Lead Action
    actions.push({
      actionKey: 'salesforce-create-lead-v1',
      provider: IntegrationProvider.SALESFORCE,
      name: 'Create Lead',
      description: 'Create a new lead in Salesforce',
      category: 'crm',
      version: '1.0.0',
      status: 'ACTIVE',
      tags: ['salesforce', 'lead', 'create'],
      executionCount: 0,
      inputSchema: {
        type: 'object',
        properties: {
          FirstName: { type: 'string' },
          LastName: { type: 'string' },
          Email: { type: 'string', format: 'email' },
          Phone: { type: 'string' },
          Company: { type: 'string' },
          LeadSource: { type: 'string' },
        },
        required: ['LastName'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          success: { type: 'boolean' },
          errors: { type: 'array' },
        },
      },
      executionSpec: {
        method: 'POST',
        baseUrl: 'https://{{instance}}.salesforce.com', // Dynamic base URL
        endpoint: '/services/data/v58.0/sobjects/Lead',
        authType: 'bearer',
        headers: {
          'Content-Type': 'application/json',
        },
        bodyTemplate: {
          FirstName: '{{FirstName}}',
          LastName: '{{LastName}}',
          Email: '{{Email}}',
          Phone: '{{Phone}}',
          Company: '{{Company}}',
          LeadSource: '{{LeadSource}}',
        },
      },
    });

    // Query Records Action
    actions.push({
      actionKey: 'salesforce-query-records-v1',
      provider: IntegrationProvider.SALESFORCE,
      name: 'Query Records',
      description: 'Query Salesforce records using SOQL',
      category: 'crm',
      version: '1.0.0',
      status: 'ACTIVE',
      tags: ['salesforce', 'query', 'records'],
      executionCount: 0,
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'SOQL query string' },
        },
        required: ['query'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          totalSize: { type: 'number' },
          done: { type: 'boolean' },
          records: { type: 'array' },
        },
      },
      executionSpec: {
        method: 'GET',
        baseUrl: 'https://{{instance}}.salesforce.com', // Dynamic base URL
        endpoint: '/services/data/v58.0/query',
        authType: 'bearer',
        queryParams: {
          q: '{{query}}',
        },
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
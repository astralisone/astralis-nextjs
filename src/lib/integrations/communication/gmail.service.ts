/**
 * Gmail Integration Service
 *
 * Provides methods for interacting with Gmail API.
 * Supports sending emails, reading messages, and managing labels.
 */

import { BaseIntegrationService, type OAuthCredentialData } from '../base-integration.service';
import type { IntegrationApiResponse } from '@/types/integrations';
import type {
  GmailProfile,
  GmailMessage,
  GmailThread,
  GmailLabel,
} from '@/types/integrations';

/**
 * Send email input
 */
export interface SendEmailInput {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  isHtml?: boolean;
  attachments?: Array<{
    filename: string;
    mimeType: string;
    data: string; // Base64 encoded
  }>;
  replyTo?: string;
  inReplyTo?: string;
  threadId?: string;
}

/**
 * Gmail Service
 */
export class GmailService extends BaseIntegrationService<OAuthCredentialData> {
  constructor() {
    super({
      provider: 'GMAIL',
      baseUrl: 'https://gmail.googleapis.com/gmail/v1',
      rateLimitPerMinute: 250,
    });
  }

  /**
   * Make a Gmail API request
   */
  private async gmailRequest<T>(
    endpoint: string,
    options: { method?: string; body?: Record<string, unknown> | string } = {}
  ): Promise<IntegrationApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;

    if (!this.credential) {
      throw new Error('Service not initialized');
    }

    const { method = 'GET', body } = options;

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.getAccessToken()}`,
    };

    if (body && typeof body === 'object') {
      headers['Content-Type'] = 'application/json';
    }

    const requestInit: RequestInit = {
      method,
      headers,
    };

    if (body) {
      requestInit.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    try {
      const response = await fetch(url, requestInit);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: errorData.error?.message || response.statusText,
            details: errorData,
          },
        };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
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
   * Test connection to Gmail
   */
  async testConnection(): Promise<boolean> {
    const result = await this.getProfile();
    return result.success;
  }

  /**
   * Get account info
   */
  async getAccountInfo(): Promise<IntegrationApiResponse<Record<string, unknown>>> {
    return this.getProfile();
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<IntegrationApiResponse<GmailProfile>> {
    const response = await this.gmailRequest<GmailProfile>('/users/me/profile');
    return response;
  }

  // -------------------------------------------------------------------------
  // Messages
  // -------------------------------------------------------------------------

  /**
   * List messages
   */
  async listMessages(params?: {
    maxResults?: number;
    pageToken?: string;
    q?: string; // Gmail search query
    labelIds?: string[];
  }): Promise<IntegrationApiResponse<Array<{ id: string; threadId: string }>>> {
    const queryParams = new URLSearchParams();

    if (params?.maxResults) queryParams.set('maxResults', params.maxResults.toString());
    if (params?.pageToken) queryParams.set('pageToken', params.pageToken);
    if (params?.q) queryParams.set('q', params.q);
    if (params?.labelIds) {
      params.labelIds.forEach((id) => queryParams.append('labelIds', id));
    }

    const endpoint = `/users/me/messages?${queryParams.toString()}`;
    const response = await this.gmailRequest<{
      messages?: Array<{ id: string; threadId: string }>;
      nextPageToken?: string;
      resultSizeEstimate?: number;
    }>(endpoint);

    if (!response.success) return response as IntegrationApiResponse<Array<{ id: string; threadId: string }>>;

    return {
      success: true,
      data: response.data?.messages || [],
      pagination: {
        cursor: response.data?.nextPageToken,
        hasMore: !!response.data?.nextPageToken,
        total: response.data?.resultSizeEstimate,
      },
    };
  }

  /**
   * Get a single message
   */
  async getMessage(messageId: string, format: 'minimal' | 'full' | 'raw' | 'metadata' = 'full'): Promise<IntegrationApiResponse<GmailMessage>> {
    const response = await this.gmailRequest<GmailMessage>(
      `/users/me/messages/${messageId}?format=${format}`
    );
    return response;
  }

  /**
   * Send an email
   */
  async sendEmail(input: SendEmailInput): Promise<IntegrationApiResponse<GmailMessage>> {
    // Build the raw email message
    const rawMessage = this.buildRawMessage(input);

    // Encode as base64url
    const encodedMessage = Buffer.from(rawMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const body: Record<string, unknown> = {
      raw: encodedMessage,
    };

    if (input.threadId) {
      body.threadId = input.threadId;
    }

    const response = await this.gmailRequest<GmailMessage>(
      '/users/me/messages/send',
      { method: 'POST', body }
    );

    return response;
  }

  /**
   * Reply to a message
   */
  async replyToMessage(
    messageId: string,
    threadId: string,
    input: Omit<SendEmailInput, 'threadId'>
  ): Promise<IntegrationApiResponse<GmailMessage>> {
    // Get the original message to extract headers
    const originalMessage = await this.getMessage(messageId);

    if (!originalMessage.success) return originalMessage;

    const headers = originalMessage.data!.payload.headers;
    const messageIdHeader = headers.find((h) => h.name.toLowerCase() === 'message-id')?.value;

    return this.sendEmail({
      ...input,
      threadId,
      inReplyTo: messageIdHeader,
    });
  }

  /**
   * Trash a message
   */
  async trashMessage(messageId: string): Promise<IntegrationApiResponse<GmailMessage>> {
    const response = await this.gmailRequest<GmailMessage>(
      `/users/me/messages/${messageId}/trash`,
      { method: 'POST' }
    );
    return response;
  }

  /**
   * Untrash a message
   */
  async untrashMessage(messageId: string): Promise<IntegrationApiResponse<GmailMessage>> {
    const response = await this.gmailRequest<GmailMessage>(
      `/users/me/messages/${messageId}/untrash`,
      { method: 'POST' }
    );
    return response;
  }

  /**
   * Modify message labels
   */
  async modifyLabels(
    messageId: string,
    addLabelIds?: string[],
    removeLabelIds?: string[]
  ): Promise<IntegrationApiResponse<GmailMessage>> {
    const response = await this.gmailRequest<GmailMessage>(
      `/users/me/messages/${messageId}/modify`,
      {
        method: 'POST',
        body: {
          addLabelIds: addLabelIds || [],
          removeLabelIds: removeLabelIds || [],
        },
      }
    );
    return response;
  }

  // -------------------------------------------------------------------------
  // Threads
  // -------------------------------------------------------------------------

  /**
   * List threads
   */
  async listThreads(params?: {
    maxResults?: number;
    pageToken?: string;
    q?: string;
  }): Promise<IntegrationApiResponse<Array<{ id: string; snippet: string; historyId: string }>>> {
    const queryParams = new URLSearchParams();

    if (params?.maxResults) queryParams.set('maxResults', params.maxResults.toString());
    if (params?.pageToken) queryParams.set('pageToken', params.pageToken);
    if (params?.q) queryParams.set('q', params.q);

    const response = await this.gmailRequest<{
      threads?: Array<{ id: string; snippet: string; historyId: string }>;
      nextPageToken?: string;
    }>(`/users/me/threads?${queryParams.toString()}`);

    if (!response.success) return response as IntegrationApiResponse<Array<{ id: string; snippet: string; historyId: string }>>;

    return {
      success: true,
      data: response.data?.threads || [],
      pagination: {
        cursor: response.data?.nextPageToken,
        hasMore: !!response.data?.nextPageToken,
      },
    };
  }

  /**
   * Get a thread
   */
  async getThread(threadId: string): Promise<IntegrationApiResponse<GmailThread>> {
    const response = await this.gmailRequest<GmailThread>(
      `/users/me/threads/${threadId}`
    );
    return response;
  }

  // -------------------------------------------------------------------------
  // Labels
  // -------------------------------------------------------------------------

  /**
   * List labels
   */
  async listLabels(): Promise<IntegrationApiResponse<GmailLabel[]>> {
    const response = await this.gmailRequest<{ labels: GmailLabel[] }>(
      '/users/me/labels'
    );

    if (!response.success) return response as IntegrationApiResponse<GmailLabel[]>;

    return {
      success: true,
      data: response.data?.labels || [],
    };
  }

  /**
   * Get a label
   */
  async getLabel(labelId: string): Promise<IntegrationApiResponse<GmailLabel>> {
    const response = await this.gmailRequest<GmailLabel>(
      `/users/me/labels/${labelId}`
    );
    return response;
  }

  /**
   * Create a label
   */
  async createLabel(name: string, options?: {
    labelListVisibility?: 'labelShow' | 'labelHide' | 'labelShowIfUnread';
    messageListVisibility?: 'show' | 'hide';
  }): Promise<IntegrationApiResponse<GmailLabel>> {
    const response = await this.gmailRequest<GmailLabel>(
      '/users/me/labels',
      {
        method: 'POST',
        body: {
          name,
          ...options,
        },
      }
    );
    return response;
  }

  // -------------------------------------------------------------------------
  // Helper Methods
  // -------------------------------------------------------------------------

  /**
   * Build a raw MIME message
   */
  private buildRawMessage(input: SendEmailInput): string {
    const boundary = `boundary_${Date.now()}`;
    const lines: string[] = [];

    // Headers
    lines.push(`To: ${input.to.join(', ')}`);
    if (input.cc?.length) lines.push(`Cc: ${input.cc.join(', ')}`);
    if (input.bcc?.length) lines.push(`Bcc: ${input.bcc.join(', ')}`);
    lines.push(`Subject: ${input.subject}`);
    if (input.replyTo) lines.push(`Reply-To: ${input.replyTo}`);
    if (input.inReplyTo) {
      lines.push(`In-Reply-To: ${input.inReplyTo}`);
      lines.push(`References: ${input.inReplyTo}`);
    }

    if (input.attachments?.length) {
      lines.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
      lines.push('');
      lines.push(`--${boundary}`);
    }

    // Body
    const contentType = input.isHtml ? 'text/html' : 'text/plain';
    lines.push(`Content-Type: ${contentType}; charset="UTF-8"`);
    lines.push('');
    lines.push(input.body);

    // Attachments
    if (input.attachments?.length) {
      for (const attachment of input.attachments) {
        lines.push(`--${boundary}`);
        lines.push(`Content-Type: ${attachment.mimeType}; name="${attachment.filename}"`);
        lines.push('Content-Transfer-Encoding: base64');
        lines.push(`Content-Disposition: attachment; filename="${attachment.filename}"`);
        lines.push('');
        lines.push(attachment.data);
      }
      lines.push(`--${boundary}--`);
    }

    return lines.join('\r\n');
  }

  /**
   * Extract email body from message
   */
  extractBody(message: GmailMessage): string {
    const payload = message.payload;

    // Simple message
    if (payload.body?.data) {
      return Buffer.from(payload.body.data, 'base64url').toString('utf-8');
    }

    // Multipart message
    if (payload.parts) {
      const textPart = payload.parts.find((p) =>
        p.mimeType === 'text/plain' || p.mimeType === 'text/html'
      );

      if (textPart?.body?.data) {
        return Buffer.from(textPart.body.data, 'base64url').toString('utf-8');
      }
    }

    return '';
  }

  /**
   * Extract header value from message
   */
  extractHeader(message: GmailMessage, headerName: string): string | undefined {
    return message.payload.headers.find(
      (h) => h.name.toLowerCase() === headerName.toLowerCase()
    )?.value;
  }
}

export const gmailService = new GmailService();

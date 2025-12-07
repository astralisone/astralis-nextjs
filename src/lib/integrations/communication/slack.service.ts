/**
 * Slack Integration Service
 *
 * Provides methods for interacting with Slack API.
 * Supports sending messages, managing channels, and user lookups.
 */

import { BaseIntegrationService, type OAuthCredentialData } from '../base-integration.service';
import type { IntegrationApiResponse } from '@/types/integrations';
import type {
  SlackWorkspace,
  SlackChannel,
  SlackUser,
  SlackMessage,
} from '@/types/integrations';

/**
 * Slack-specific credential data
 */
interface SlackCredentialData extends OAuthCredentialData {
  teamId?: string;
}

/**
 * Slack API response wrapper
 */
interface SlackResponse<T> {
  ok: boolean;
  error?: string;
  warning?: string;
  response_metadata?: {
    next_cursor?: string;
  };
  [key: string]: unknown;
}

/**
 * Send message input
 */
export interface SendSlackMessageInput {
  channel: string;
  text?: string;
  blocks?: Record<string, unknown>[];
  attachments?: Array<{
    fallback: string;
    color?: string;
    title?: string;
    text?: string;
    fields?: Array<{ title: string; value: string; short?: boolean }>;
  }>;
  thread_ts?: string;
  mrkdwn?: boolean;
}

/**
 * Slack Service
 */
export class SlackService extends BaseIntegrationService<SlackCredentialData> {
  constructor() {
    super({
      provider: 'SLACK',
      baseUrl: 'https://slack.com/api',
      rateLimitPerMinute: 100,
    });
  }

  /**
   * Make a Slack API request
   */
  private async slackRequest<T>(
    method: string,
    body?: Record<string, unknown>
  ): Promise<IntegrationApiResponse<T>> {
    const url = `${this.config.baseUrl}/${method}`;

    if (!this.credential) {
      throw new Error('Service not initialized');
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.getAccessToken()}`,
      'Content-Type': 'application/json; charset=utf-8',
    };

    const requestInit: RequestInit = {
      method: body ? 'POST' : 'GET',
      headers,
    };

    if (body) {
      requestInit.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, requestInit);
      const data = await response.json() as SlackResponse<T>;

      if (!data.ok) {
        return {
          success: false,
          error: {
            code: data.error || 'UNKNOWN_ERROR',
            message: data.error || 'Slack API error',
          },
        };
      }

      return { success: true, data: data as unknown as T };
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
   * Test connection to Slack
   */
  async testConnection(): Promise<boolean> {
    const result = await this.authTest();
    return result.success;
  }

  /**
   * Get account info
   */
  async getAccountInfo(): Promise<IntegrationApiResponse<Record<string, unknown>>> {
    return this.authTest();
  }

  /**
   * Auth test - verify token and get workspace info
   */
  async authTest(): Promise<IntegrationApiResponse<SlackWorkspace>> {
    const response = await this.slackRequest<SlackResponse<unknown> & {
      team_id: string;
      team: string;
      url: string;
      user_id: string;
    }>('auth.test');

    if (!response.success) return response as IntegrationApiResponse<SlackWorkspace>;

    const data = response.data!;
    return {
      success: true,
      data: {
        id: data.team_id,
        name: data.team,
        domain: new URL(data.url).hostname.split('.')[0],
      },
    };
  }

  // -------------------------------------------------------------------------
  // Messages
  // -------------------------------------------------------------------------

  /**
   * Send a message to a channel
   */
  async sendMessage(input: SendSlackMessageInput): Promise<IntegrationApiResponse<SlackMessage>> {
    const response = await this.slackRequest<SlackResponse<unknown> & {
      ts: string;
      channel: string;
      message: Record<string, unknown>;
    }>('chat.postMessage', input);

    if (!response.success) return response as IntegrationApiResponse<SlackMessage>;

    const data = response.data!;
    return {
      success: true,
      data: {
        ts: data.ts,
        channel: data.channel,
        text: input.text || '',
        attachments: input.attachments,
        blocks: input.blocks,
      },
    };
  }

  /**
   * Update a message
   */
  async updateMessage(
    channel: string,
    ts: string,
    input: Partial<SendSlackMessageInput>
  ): Promise<IntegrationApiResponse<SlackMessage>> {
    const response = await this.slackRequest<SlackResponse<unknown> & {
      ts: string;
      channel: string;
    }>('chat.update', {
      channel,
      ts,
      ...input,
    });

    if (!response.success) return response as IntegrationApiResponse<SlackMessage>;

    const data = response.data!;
    return {
      success: true,
      data: {
        ts: data.ts,
        channel: data.channel,
        text: input.text || '',
      },
    };
  }

  /**
   * Delete a message
   */
  async deleteMessage(channel: string, ts: string): Promise<IntegrationApiResponse<void>> {
    const response = await this.slackRequest<SlackResponse<unknown>>('chat.delete', {
      channel,
      ts,
    });

    if (!response.success) return response as IntegrationApiResponse<void>;

    return { success: true, data: undefined };
  }

  /**
   * Reply to a thread
   */
  async replyToThread(
    channel: string,
    threadTs: string,
    text: string,
    options?: Partial<SendSlackMessageInput>
  ): Promise<IntegrationApiResponse<SlackMessage>> {
    return this.sendMessage({
      channel,
      text,
      thread_ts: threadTs,
      ...options,
    });
  }

  // -------------------------------------------------------------------------
  // Channels
  // -------------------------------------------------------------------------

  /**
   * List channels
   */
  async listChannels(params?: {
    cursor?: string;
    limit?: number;
    types?: string;
  }): Promise<IntegrationApiResponse<SlackChannel[]>> {
    const queryParams = new URLSearchParams({
      limit: (params?.limit || 100).toString(),
      types: params?.types || 'public_channel,private_channel',
    });

    if (params?.cursor) {
      queryParams.set('cursor', params.cursor);
    }

    const response = await this.slackRequest<SlackResponse<unknown> & {
      channels: Record<string, unknown>[];
      response_metadata?: { next_cursor: string };
    }>(`conversations.list?${queryParams.toString()}`);

    if (!response.success) return response as IntegrationApiResponse<SlackChannel[]>;

    const data = response.data!;
    const channels = data.channels || [];

    return {
      success: true,
      data: channels.map((c) => ({
        id: c.id as string,
        name: c.name as string,
        is_channel: c.is_channel as boolean,
        is_private: c.is_private as boolean,
        is_member: c.is_member as boolean,
        num_members: c.num_members as number,
        topic: c.topic as { value: string },
        purpose: c.purpose as { value: string },
      })),
      pagination: {
        cursor: data.response_metadata?.next_cursor,
        hasMore: !!data.response_metadata?.next_cursor,
      },
    };
  }

  /**
   * Get channel info
   */
  async getChannel(channelId: string): Promise<IntegrationApiResponse<SlackChannel>> {
    const response = await this.slackRequest<SlackResponse<unknown> & {
      channel: Record<string, unknown>;
    }>(`conversations.info?channel=${channelId}`);

    if (!response.success) return response as IntegrationApiResponse<SlackChannel>;

    const c = response.data!.channel;
    return {
      success: true,
      data: {
        id: c.id as string,
        name: c.name as string,
        is_channel: c.is_channel as boolean,
        is_private: c.is_private as boolean,
        is_member: c.is_member as boolean,
        num_members: c.num_members as number,
        topic: c.topic as { value: string },
        purpose: c.purpose as { value: string },
      },
    };
  }

  /**
   * Join a channel
   */
  async joinChannel(channelId: string): Promise<IntegrationApiResponse<SlackChannel>> {
    const response = await this.slackRequest<SlackResponse<unknown> & {
      channel: Record<string, unknown>;
    }>('conversations.join', { channel: channelId });

    if (!response.success) return response as IntegrationApiResponse<SlackChannel>;

    const c = response.data!.channel;
    return {
      success: true,
      data: {
        id: c.id as string,
        name: c.name as string,
        is_channel: c.is_channel as boolean,
        is_private: c.is_private as boolean,
        is_member: true,
      },
    };
  }

  // -------------------------------------------------------------------------
  // Users
  // -------------------------------------------------------------------------

  /**
   * List users
   */
  async listUsers(params?: {
    cursor?: string;
    limit?: number;
  }): Promise<IntegrationApiResponse<SlackUser[]>> {
    const queryParams = new URLSearchParams({
      limit: (params?.limit || 100).toString(),
    });

    if (params?.cursor) {
      queryParams.set('cursor', params.cursor);
    }

    const response = await this.slackRequest<SlackResponse<unknown> & {
      members: Record<string, unknown>[];
      response_metadata?: { next_cursor: string };
    }>(`users.list?${queryParams.toString()}`);

    if (!response.success) return response as IntegrationApiResponse<SlackUser[]>;

    const data = response.data!;
    const members = data.members || [];

    return {
      success: true,
      data: members
        .filter((m) => !m.deleted && !m.is_bot)
        .map((m) => ({
          id: m.id as string,
          name: m.name as string,
          real_name: m.real_name as string,
          profile: m.profile as SlackUser['profile'],
          is_admin: m.is_admin as boolean,
          is_bot: m.is_bot as boolean,
        })),
      pagination: {
        cursor: data.response_metadata?.next_cursor,
        hasMore: !!data.response_metadata?.next_cursor,
      },
    };
  }

  /**
   * Get user info
   */
  async getUser(userId: string): Promise<IntegrationApiResponse<SlackUser>> {
    const response = await this.slackRequest<SlackResponse<unknown> & {
      user: Record<string, unknown>;
    }>(`users.info?user=${userId}`);

    if (!response.success) return response as IntegrationApiResponse<SlackUser>;

    const m = response.data!.user;
    return {
      success: true,
      data: {
        id: m.id as string,
        name: m.name as string,
        real_name: m.real_name as string,
        profile: m.profile as SlackUser['profile'],
        is_admin: m.is_admin as boolean,
        is_bot: m.is_bot as boolean,
      },
    };
  }

  /**
   * Lookup user by email
   */
  async lookupUserByEmail(email: string): Promise<IntegrationApiResponse<SlackUser>> {
    const response = await this.slackRequest<SlackResponse<unknown> & {
      user: Record<string, unknown>;
    }>(`users.lookupByEmail?email=${encodeURIComponent(email)}`);

    if (!response.success) return response as IntegrationApiResponse<SlackUser>;

    const m = response.data!.user;
    return {
      success: true,
      data: {
        id: m.id as string,
        name: m.name as string,
        real_name: m.real_name as string,
        profile: m.profile as SlackUser['profile'],
        is_admin: m.is_admin as boolean,
        is_bot: m.is_bot as boolean,
      },
    };
  }

  // -------------------------------------------------------------------------
  // Utility Methods
  // -------------------------------------------------------------------------

  /**
   * Upload a file
   */
  async uploadFile(
    channels: string[],
    file: Buffer | string,
    options: {
      filename: string;
      title?: string;
      initial_comment?: string;
      filetype?: string;
    }
  ): Promise<IntegrationApiResponse<Record<string, unknown>>> {
    // For file uploads, we need multipart form data
    const formData = new FormData();
    formData.append('channels', channels.join(','));
    formData.append('filename', options.filename);

    if (options.title) formData.append('title', options.title);
    if (options.initial_comment) formData.append('initial_comment', options.initial_comment);
    if (options.filetype) formData.append('filetype', options.filetype);

    if (typeof file === 'string') {
      formData.append('content', file);
    } else {
      formData.append('file', new Blob([file]), options.filename);
    }

    const response = await fetch(`${this.config.baseUrl}/files.upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAccessToken()}`,
      },
      body: formData,
    });

    const data = await response.json() as SlackResponse<{ file: Record<string, unknown> }>;

    if (!data.ok) {
      return {
        success: false,
        error: { code: data.error || 'UPLOAD_FAILED', message: data.error || 'Upload failed' },
      };
    }

    return { success: true, data: data.file };
  }
}

export const slackService = new SlackService();

/**
 * Microsoft Teams Integration Service
 *
 * Provides methods for interacting with Microsoft Graph API for Teams.
 * Supports sending messages, managing teams and channels.
 */

import { BaseIntegrationService, type OAuthCredentialData } from '../base-integration.service';
import type { IntegrationApiResponse } from '@/types/integrations';
import type {
  TeamsUser,
  TeamsTeam,
  TeamsChannel,
  TeamsMessage,
} from '@/types/integrations';

/**
 * Graph API response wrapper
 */
interface GraphResponse<T> {
  value?: T[];
  '@odata.nextLink'?: string;
  '@odata.count'?: number;
}

/**
 * Send message input
 */
export interface SendTeamsMessageInput {
  body: {
    contentType: 'text' | 'html';
    content: string;
  };
  attachments?: Array<{
    id: string;
    contentType: string;
    contentUrl?: string;
    name: string;
    content?: string;
  }>;
  mentions?: Array<{
    id: number;
    mentionText: string;
    mentioned: {
      user: {
        displayName: string;
        id: string;
        userIdentityType: string;
      };
    };
  }>;
}

/**
 * Microsoft Teams Service
 */
export class TeamsService extends BaseIntegrationService<OAuthCredentialData> {
  constructor() {
    super({
      provider: 'MICROSOFT_TEAMS',
      baseUrl: 'https://graph.microsoft.com/v1.0',
      rateLimitPerMinute: 100,
    });
  }

  /**
   * Make a Graph API request
   */
  private async graphRequest<T>(
    endpoint: string,
    options: { method?: string; body?: Record<string, unknown> } = {}
  ): Promise<IntegrationApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;

    if (!this.credential) {
      throw new Error('Service not initialized');
    }

    const { method = 'GET', body } = options;

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.getAccessToken()}`,
      'Content-Type': 'application/json',
    };

    const requestInit: RequestInit = {
      method,
      headers,
    };

    if (body) {
      requestInit.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, requestInit);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: {
            code: errorData.error?.code || response.status.toString(),
            message: errorData.error?.message || response.statusText,
            details: errorData,
          },
        };
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return { success: true, data: undefined as unknown as T };
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
   * Test connection to Teams
   */
  async testConnection(): Promise<boolean> {
    const result = await this.getMe();
    return result.success;
  }

  /**
   * Get account info
   */
  async getAccountInfo(): Promise<IntegrationApiResponse<Record<string, unknown>>> {
    return this.getMe();
  }

  /**
   * Get current user
   */
  async getMe(): Promise<IntegrationApiResponse<TeamsUser>> {
    const response = await this.graphRequest<TeamsUser>('/me');
    return response;
  }

  // -------------------------------------------------------------------------
  // Teams
  // -------------------------------------------------------------------------

  /**
   * List teams the user is a member of
   */
  async listTeams(): Promise<IntegrationApiResponse<TeamsTeam[]>> {
    const response = await this.graphRequest<GraphResponse<Record<string, unknown>>>(
      '/me/joinedTeams'
    );

    if (!response.success) return response as IntegrationApiResponse<TeamsTeam[]>;

    const teams = response.data?.value || [];

    return {
      success: true,
      data: teams.map((t) => ({
        id: t.id as string,
        displayName: t.displayName as string,
        description: t.description as string,
        visibility: t.visibility as 'public' | 'private',
        webUrl: t.webUrl as string,
      })),
    };
  }

  /**
   * Get a team
   */
  async getTeam(teamId: string): Promise<IntegrationApiResponse<TeamsTeam>> {
    const response = await this.graphRequest<Record<string, unknown>>(
      `/teams/${teamId}`
    );

    if (!response.success) return response as IntegrationApiResponse<TeamsTeam>;

    const t = response.data!;
    return {
      success: true,
      data: {
        id: t.id as string,
        displayName: t.displayName as string,
        description: t.description as string,
        visibility: t.visibility as 'public' | 'private',
        webUrl: t.webUrl as string,
      },
    };
  }

  // -------------------------------------------------------------------------
  // Channels
  // -------------------------------------------------------------------------

  /**
   * List channels in a team
   */
  async listChannels(teamId: string): Promise<IntegrationApiResponse<TeamsChannel[]>> {
    const response = await this.graphRequest<GraphResponse<Record<string, unknown>>>(
      `/teams/${teamId}/channels`
    );

    if (!response.success) return response as IntegrationApiResponse<TeamsChannel[]>;

    const channels = response.data?.value || [];

    return {
      success: true,
      data: channels.map((c) => ({
        id: c.id as string,
        displayName: c.displayName as string,
        description: c.description as string,
        email: c.email as string,
        webUrl: c.webUrl as string,
        membershipType: c.membershipType as 'standard' | 'private' | 'shared',
      })),
    };
  }

  /**
   * Get a channel
   */
  async getChannel(teamId: string, channelId: string): Promise<IntegrationApiResponse<TeamsChannel>> {
    const response = await this.graphRequest<Record<string, unknown>>(
      `/teams/${teamId}/channels/${channelId}`
    );

    if (!response.success) return response as IntegrationApiResponse<TeamsChannel>;

    const c = response.data!;
    return {
      success: true,
      data: {
        id: c.id as string,
        displayName: c.displayName as string,
        description: c.description as string,
        email: c.email as string,
        webUrl: c.webUrl as string,
        membershipType: c.membershipType as 'standard' | 'private' | 'shared',
      },
    };
  }

  // -------------------------------------------------------------------------
  // Messages
  // -------------------------------------------------------------------------

  /**
   * Send a message to a channel
   */
  async sendChannelMessage(
    teamId: string,
    channelId: string,
    input: SendTeamsMessageInput
  ): Promise<IntegrationApiResponse<TeamsMessage>> {
    const response = await this.graphRequest<Record<string, unknown>>(
      `/teams/${teamId}/channels/${channelId}/messages`,
      { method: 'POST', body: input as unknown as Record<string, unknown> }
    );

    if (!response.success) return response as IntegrationApiResponse<TeamsMessage>;

    const m = response.data!;
    return {
      success: true,
      data: {
        id: m.id as string,
        createdDateTime: m.createdDateTime as string,
        body: m.body as TeamsMessage['body'],
        from: m.from as TeamsMessage['from'],
        attachments: m.attachments as TeamsMessage['attachments'],
      },
    };
  }

  /**
   * Reply to a message in a channel
   */
  async replyToChannelMessage(
    teamId: string,
    channelId: string,
    messageId: string,
    input: SendTeamsMessageInput
  ): Promise<IntegrationApiResponse<TeamsMessage>> {
    const response = await this.graphRequest<Record<string, unknown>>(
      `/teams/${teamId}/channels/${channelId}/messages/${messageId}/replies`,
      { method: 'POST', body: input as unknown as Record<string, unknown> }
    );

    if (!response.success) return response as IntegrationApiResponse<TeamsMessage>;

    const m = response.data!;
    return {
      success: true,
      data: {
        id: m.id as string,
        createdDateTime: m.createdDateTime as string,
        body: m.body as TeamsMessage['body'],
        from: m.from as TeamsMessage['from'],
        attachments: m.attachments as TeamsMessage['attachments'],
      },
    };
  }

  /**
   * List messages in a channel
   */
  async listChannelMessages(
    teamId: string,
    channelId: string,
    params?: {
      top?: number;
      skipToken?: string;
    }
  ): Promise<IntegrationApiResponse<TeamsMessage[]>> {
    let endpoint = `/teams/${teamId}/channels/${channelId}/messages`;
    const queryParams: string[] = [];

    if (params?.top) queryParams.push(`$top=${params.top}`);
    if (params?.skipToken) queryParams.push(`$skiptoken=${params.skipToken}`);

    if (queryParams.length > 0) {
      endpoint += '?' + queryParams.join('&');
    }

    const response = await this.graphRequest<GraphResponse<Record<string, unknown>>>(endpoint);

    if (!response.success) return response as IntegrationApiResponse<TeamsMessage[]>;

    const messages = response.data?.value || [];

    return {
      success: true,
      data: messages.map((m) => ({
        id: m.id as string,
        createdDateTime: m.createdDateTime as string,
        body: m.body as TeamsMessage['body'],
        from: m.from as TeamsMessage['from'],
        attachments: m.attachments as TeamsMessage['attachments'],
      })),
      pagination: {
        cursor: response.data?.['@odata.nextLink'],
        hasMore: !!response.data?.['@odata.nextLink'],
      },
    };
  }

  // -------------------------------------------------------------------------
  // Chats (1:1 and Group)
  // -------------------------------------------------------------------------

  /**
   * List chats
   */
  async listChats(): Promise<IntegrationApiResponse<Array<{ id: string; topic?: string; chatType: string }>>> {
    const response = await this.graphRequest<GraphResponse<Record<string, unknown>>>('/me/chats');

    if (!response.success) return response as IntegrationApiResponse<Array<{ id: string; topic?: string; chatType: string }>>;

    const chats = response.data?.value || [];

    return {
      success: true,
      data: chats.map((c) => ({
        id: c.id as string,
        topic: c.topic as string,
        chatType: c.chatType as string,
      })),
    };
  }

  /**
   * Send a message to a chat
   */
  async sendChatMessage(
    chatId: string,
    input: SendTeamsMessageInput
  ): Promise<IntegrationApiResponse<TeamsMessage>> {
    const response = await this.graphRequest<Record<string, unknown>>(
      `/chats/${chatId}/messages`,
      { method: 'POST', body: input as unknown as Record<string, unknown> }
    );

    if (!response.success) return response as IntegrationApiResponse<TeamsMessage>;

    const m = response.data!;
    return {
      success: true,
      data: {
        id: m.id as string,
        createdDateTime: m.createdDateTime as string,
        body: m.body as TeamsMessage['body'],
        from: m.from as TeamsMessage['from'],
        attachments: m.attachments as TeamsMessage['attachments'],
      },
    };
  }

  // -------------------------------------------------------------------------
  // Members
  // -------------------------------------------------------------------------

  /**
   * List team members
   */
  async listTeamMembers(teamId: string): Promise<IntegrationApiResponse<TeamsUser[]>> {
    const response = await this.graphRequest<GraphResponse<Record<string, unknown>>>(
      `/teams/${teamId}/members`
    );

    if (!response.success) return response as IntegrationApiResponse<TeamsUser[]>;

    const members = response.data?.value || [];

    return {
      success: true,
      data: members.map((m) => ({
        id: m.userId as string,
        displayName: m.displayName as string,
        mail: m.email as string,
        userPrincipalName: (m as Record<string, unknown>).userPrincipalName as string || '',
      })),
    };
  }

  // -------------------------------------------------------------------------
  // Utility Methods
  // -------------------------------------------------------------------------

  /**
   * Create a simple text message
   */
  createTextMessage(text: string): SendTeamsMessageInput {
    return {
      body: {
        contentType: 'text',
        content: text,
      },
    };
  }

  /**
   * Create an HTML message
   */
  createHtmlMessage(html: string): SendTeamsMessageInput {
    return {
      body: {
        contentType: 'html',
        content: html,
      },
    };
  }

  /**
   * Create a message with a mention
   */
  createMentionMessage(
    text: string,
    mentionUserId: string,
    mentionDisplayName: string
  ): SendTeamsMessageInput {
    return {
      body: {
        contentType: 'html',
        content: `<at id="0">${mentionDisplayName}</at> ${text}`,
      },
      mentions: [
        {
          id: 0,
          mentionText: mentionDisplayName,
          mentioned: {
            user: {
              displayName: mentionDisplayName,
              id: mentionUserId,
              userIdentityType: 'aadUser',
            },
          },
        },
      ],
    };
  }
}

export const teamsService = new TeamsService();

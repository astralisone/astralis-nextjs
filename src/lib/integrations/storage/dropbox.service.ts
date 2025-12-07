/**
 * Dropbox Integration Service
 *
 * Provides methods for interacting with Dropbox API.
 * Supports file uploads, downloads, sharing, and folder management.
 */

import { BaseIntegrationService, type OAuthCredentialData } from '../base-integration.service';
import type { IntegrationApiResponse } from '@/types/integrations';
import type {
  DropboxAccount,
  DropboxFile,
  DropboxFolder,
  DropboxSharedLink,
} from '@/types/integrations';

/**
 * Upload file input
 */
export interface UploadDropboxFileInput {
  path: string;
  content: Buffer | string;
  mode?: 'add' | 'overwrite' | 'update';
  autorename?: boolean;
  mute?: boolean;
}

/**
 * Create folder input
 */
export interface CreateDropboxFolderInput {
  path: string;
  autorename?: boolean;
}

/**
 * Dropbox Service
 */
export class DropboxService extends BaseIntegrationService<OAuthCredentialData> {
  private contentUrl = 'https://content.dropboxapi.com/2';

  constructor() {
    super({
      provider: 'DROPBOX',
      baseUrl: 'https://api.dropboxapi.com/2',
      rateLimitPerMinute: 1000,
    });
  }

  /**
   * Make a Dropbox API request (RPC style)
   */
  private async dropboxRequest<T>(
    endpoint: string,
    body?: Record<string, unknown>
  ): Promise<IntegrationApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;

    if (!this.credential) {
      throw new Error('Service not initialized');
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.getAccessToken()}`,
      'Content-Type': 'application/json',
    };

    const requestInit: RequestInit = {
      method: 'POST',
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
            code: errorData.error?.['.tag'] || response.status.toString(),
            message: errorData.error_summary || response.statusText,
            details: errorData,
          },
        };
      }

      // Some endpoints return no content
      if (response.status === 200 && response.headers.get('content-length') === '0') {
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
   * Test connection to Dropbox
   */
  async testConnection(): Promise<boolean> {
    const result = await this.getAccountInfo();
    return result.success;
  }

  /**
   * Get account info
   */
  async getAccountInfo(): Promise<IntegrationApiResponse<DropboxAccount>> {
    const response = await this.dropboxRequest<Record<string, unknown>>(
      '/users/get_current_account'
    );

    if (!response.success) return response as IntegrationApiResponse<DropboxAccount>;

    const a = response.data!;
    return {
      success: true,
      data: {
        account_id: a.account_id as string,
        name: a.name as DropboxAccount['name'],
        email: a.email as string,
        email_verified: a.email_verified as boolean,
        profile_photo_url: a.profile_photo_url as string,
      },
    };
  }

  // -------------------------------------------------------------------------
  // Files
  // -------------------------------------------------------------------------

  /**
   * List folder contents
   */
  async listFolder(params: {
    path: string;
    recursive?: boolean;
    limit?: number;
  }): Promise<IntegrationApiResponse<Array<DropboxFile | DropboxFolder>>> {
    const response = await this.dropboxRequest<{
      entries: Record<string, unknown>[];
      cursor: string;
      has_more: boolean;
    }>('/files/list_folder', {
      path: params.path === '/' ? '' : params.path,
      recursive: params.recursive || false,
      limit: params.limit || 100,
    });

    if (!response.success) return response as IntegrationApiResponse<Array<DropboxFile | DropboxFolder>>;

    const entries = response.data?.entries || [];

    return {
      success: true,
      data: entries.map((e) => this.mapEntry(e)),
      pagination: {
        cursor: response.data?.cursor,
        hasMore: response.data?.has_more || false,
      },
    };
  }

  /**
   * Continue listing folder (pagination)
   */
  async listFolderContinue(cursor: string): Promise<IntegrationApiResponse<Array<DropboxFile | DropboxFolder>>> {
    const response = await this.dropboxRequest<{
      entries: Record<string, unknown>[];
      cursor: string;
      has_more: boolean;
    }>('/files/list_folder/continue', { cursor });

    if (!response.success) return response as IntegrationApiResponse<Array<DropboxFile | DropboxFolder>>;

    const entries = response.data?.entries || [];

    return {
      success: true,
      data: entries.map((e) => this.mapEntry(e)),
      pagination: {
        cursor: response.data?.cursor,
        hasMore: response.data?.has_more || false,
      },
    };
  }

  /**
   * Get file/folder metadata
   */
  async getMetadata(path: string): Promise<IntegrationApiResponse<DropboxFile | DropboxFolder>> {
    const response = await this.dropboxRequest<Record<string, unknown>>(
      '/files/get_metadata',
      { path }
    );

    if (!response.success) return response as IntegrationApiResponse<DropboxFile | DropboxFolder>;

    return {
      success: true,
      data: this.mapEntry(response.data!),
    };
  }

  /**
   * Upload a file
   */
  async uploadFile(input: UploadDropboxFileInput): Promise<IntegrationApiResponse<DropboxFile>> {
    const url = `${this.contentUrl}/files/upload`;

    const args = {
      path: input.path,
      mode: input.mode || 'add',
      autorename: input.autorename !== false,
      mute: input.mute || false,
    };

    const contentData = typeof input.content === 'string'
      ? Buffer.from(input.content)
      : input.content;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAccessToken()}`,
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': JSON.stringify(args),
      },
      body: contentData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: {
          code: errorData.error?.['.tag'] || response.status.toString(),
          message: errorData.error_summary || 'Upload failed',
        },
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: this.mapFile(data),
    };
  }

  /**
   * Download a file
   */
  async downloadFile(path: string): Promise<IntegrationApiResponse<{ content: Buffer; metadata: DropboxFile }>> {
    const url = `${this.contentUrl}/files/download`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAccessToken()}`,
        'Dropbox-API-Arg': JSON.stringify({ path }),
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: response.status.toString(),
          message: 'Download failed',
        },
      };
    }

    const metadataHeader = response.headers.get('Dropbox-API-Result');
    const metadata = metadataHeader ? JSON.parse(metadataHeader) : {};

    const arrayBuffer = await response.arrayBuffer();
    return {
      success: true,
      data: {
        content: Buffer.from(arrayBuffer),
        metadata: this.mapFile(metadata),
      },
    };
  }

  /**
   * Delete a file or folder
   */
  async delete(path: string): Promise<IntegrationApiResponse<DropboxFile | DropboxFolder>> {
    const response = await this.dropboxRequest<Record<string, unknown>>(
      '/files/delete_v2',
      { path }
    );

    if (!response.success) return response as IntegrationApiResponse<DropboxFile | DropboxFolder>;

    return {
      success: true,
      data: this.mapEntry((response.data?.metadata as Record<string, unknown>) || {}),
    };
  }

  /**
   * Copy a file or folder
   */
  async copy(fromPath: string, toPath: string): Promise<IntegrationApiResponse<DropboxFile | DropboxFolder>> {
    const response = await this.dropboxRequest<{ metadata: Record<string, unknown> }>(
      '/files/copy_v2',
      { from_path: fromPath, to_path: toPath }
    );

    if (!response.success) return response as IntegrationApiResponse<DropboxFile | DropboxFolder>;

    return {
      success: true,
      data: this.mapEntry(response.data?.metadata || {}),
    };
  }

  /**
   * Move a file or folder
   */
  async move(fromPath: string, toPath: string): Promise<IntegrationApiResponse<DropboxFile | DropboxFolder>> {
    const response = await this.dropboxRequest<{ metadata: Record<string, unknown> }>(
      '/files/move_v2',
      { from_path: fromPath, to_path: toPath }
    );

    if (!response.success) return response as IntegrationApiResponse<DropboxFile | DropboxFolder>;

    return {
      success: true,
      data: this.mapEntry(response.data?.metadata || {}),
    };
  }

  // -------------------------------------------------------------------------
  // Folders
  // -------------------------------------------------------------------------

  /**
   * Create a folder
   */
  async createFolder(input: CreateDropboxFolderInput): Promise<IntegrationApiResponse<DropboxFolder>> {
    const response = await this.dropboxRequest<{ metadata: Record<string, unknown> }>(
      '/files/create_folder_v2',
      {
        path: input.path,
        autorename: input.autorename !== false,
      }
    );

    if (!response.success) return response as IntegrationApiResponse<DropboxFolder>;

    const f = response.data?.metadata || {};
    return {
      success: true,
      data: {
        id: f.id as string,
        name: f.name as string,
        path_lower: f.path_lower as string,
        path_display: f.path_display as string,
      },
    };
  }

  // -------------------------------------------------------------------------
  // Sharing
  // -------------------------------------------------------------------------

  /**
   * Create a shared link
   */
  async createSharedLink(path: string, settings?: {
    requested_visibility?: 'public' | 'team_only' | 'password';
    audience?: 'public' | 'team' | 'no_one';
    expires?: string;
  }): Promise<IntegrationApiResponse<DropboxSharedLink>> {
    const response = await this.dropboxRequest<Record<string, unknown>>(
      '/sharing/create_shared_link_with_settings',
      {
        path,
        settings: settings || {},
      }
    );

    if (!response.success) {
      // Check if link already exists
      if (response.error?.code === 'shared_link_already_exists') {
        return this.getExistingSharedLink(path);
      }
      return response as IntegrationApiResponse<DropboxSharedLink>;
    }

    return {
      success: true,
      data: this.mapSharedLink(response.data!),
    };
  }

  /**
   * Get existing shared links
   */
  async listSharedLinks(path?: string): Promise<IntegrationApiResponse<DropboxSharedLink[]>> {
    const response = await this.dropboxRequest<{ links: Record<string, unknown>[] }>(
      '/sharing/list_shared_links',
      path ? { path } : {}
    );

    if (!response.success) return response as IntegrationApiResponse<DropboxSharedLink[]>;

    const links = response.data?.links || [];

    return {
      success: true,
      data: links.map((l) => this.mapSharedLink(l)),
    };
  }

  /**
   * Get existing shared link for a path
   */
  private async getExistingSharedLink(path: string): Promise<IntegrationApiResponse<DropboxSharedLink>> {
    const links = await this.listSharedLinks(path);
    if (!links.success) return links as IntegrationApiResponse<DropboxSharedLink>;

    if (links.data!.length > 0) {
      return { success: true, data: links.data![0] };
    }

    return {
      success: false,
      error: { code: 'NOT_FOUND', message: 'No shared link found' },
    };
  }

  /**
   * Revoke a shared link
   */
  async revokeSharedLink(url: string): Promise<IntegrationApiResponse<void>> {
    const response = await this.dropboxRequest<void>(
      '/sharing/revoke_shared_link',
      { url }
    );

    return response;
  }

  // -------------------------------------------------------------------------
  // Search
  // -------------------------------------------------------------------------

  /**
   * Search files
   */
  async search(query: string, options?: {
    path?: string;
    max_results?: number;
  }): Promise<IntegrationApiResponse<Array<DropboxFile | DropboxFolder>>> {
    const response = await this.dropboxRequest<{
      matches: Array<{ metadata: { metadata: Record<string, unknown> } }>;
      has_more: boolean;
      cursor?: string;
    }>('/files/search_v2', {
      query,
      options: {
        path: options?.path || '',
        max_results: options?.max_results || 100,
      },
    });

    if (!response.success) return response as IntegrationApiResponse<Array<DropboxFile | DropboxFolder>>;

    const matches = response.data?.matches || [];

    return {
      success: true,
      data: matches.map((m) => this.mapEntry(m.metadata?.metadata || {})),
      pagination: {
        cursor: response.data?.cursor,
        hasMore: response.data?.has_more || false,
      },
    };
  }

  // -------------------------------------------------------------------------
  // Helper Methods
  // -------------------------------------------------------------------------

  private mapEntry(e: Record<string, unknown>): DropboxFile | DropboxFolder {
    const tag = e['.tag'] as string;

    if (tag === 'folder') {
      return {
        id: e.id as string,
        name: e.name as string,
        path_lower: e.path_lower as string,
        path_display: e.path_display as string,
      };
    }

    return this.mapFile(e);
  }

  private mapFile(f: Record<string, unknown>): DropboxFile {
    return {
      id: f.id as string,
      name: f.name as string,
      path_lower: f.path_lower as string,
      path_display: f.path_display as string,
      size: f.size as number,
      client_modified: f.client_modified as string,
      server_modified: f.server_modified as string,
      rev: f.rev as string,
      is_downloadable: f.is_downloadable as boolean,
      content_hash: f.content_hash as string,
    };
  }

  private mapSharedLink(l: Record<string, unknown>): DropboxSharedLink {
    return {
      url: l.url as string,
      name: l.name as string,
      link_permissions: l.link_permissions as DropboxSharedLink['link_permissions'],
      expires: l.expires as string,
    };
  }
}

export const dropboxService = new DropboxService();

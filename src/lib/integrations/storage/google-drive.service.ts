/**
 * Google Drive Integration Service
 *
 * Provides methods for interacting with Google Drive API.
 * Supports file uploads, downloads, sharing, and folder management.
 */

import { BaseIntegrationService, type OAuthCredentialData } from '../base-integration.service';
import type { IntegrationApiResponse } from '@/types/integrations';
import type {
  GoogleDriveFile,
  GoogleDriveFolder,
  GoogleDrivePermission,
} from '@/types/integrations';

/**
 * Upload file input
 */
export interface UploadFileInput {
  name: string;
  mimeType: string;
  content: Buffer | string;
  parents?: string[];
  description?: string;
}

/**
 * Create folder input
 */
export interface CreateFolderInput {
  name: string;
  parents?: string[];
  description?: string;
}

/**
 * Share file input
 */
export interface ShareFileInput {
  role: 'owner' | 'organizer' | 'fileOrganizer' | 'writer' | 'commenter' | 'reader';
  type: 'user' | 'group' | 'domain' | 'anyone';
  emailAddress?: string;
  domain?: string;
  sendNotificationEmail?: boolean;
  emailMessage?: string;
}

/**
 * Google Drive Service
 */
export class GoogleDriveService extends BaseIntegrationService<OAuthCredentialData> {
  constructor() {
    super({
      provider: 'GOOGLE_DRIVE',
      baseUrl: 'https://www.googleapis.com/drive/v3',
      rateLimitPerMinute: 1000,
    });
  }

  /**
   * Make a Drive API request
   */
  private async driveRequest<T>(
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
            code: errorData.error?.code?.toString() || response.status.toString(),
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
   * Test connection to Google Drive
   */
  async testConnection(): Promise<ConnectionTestResult> {
    return this.standardTestConnection();
  }

  /**
   * Get account info
   */
  async getAccountInfo(): Promise<IntegrationApiResponse<Record<string, unknown>>> {
    const response = await this.driveRequest<Record<string, unknown>>('/about?fields=user,storageQuota');
    return response;
  }

  // -------------------------------------------------------------------------
  // Files
  // -------------------------------------------------------------------------

  /**
   * List files
   */
  async listFiles(params?: {
    pageSize?: number;
    pageToken?: string;
    q?: string; // Search query
    orderBy?: string;
    folderId?: string;
  }): Promise<IntegrationApiResponse<GoogleDriveFile[]>> {
    const queryParams = new URLSearchParams({
      fields: 'nextPageToken,files(id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink,webContentLink,iconLink,thumbnailLink,owners,shared)',
    });

    if (params?.pageSize) queryParams.set('pageSize', params.pageSize.toString());
    if (params?.pageToken) queryParams.set('pageToken', params.pageToken);
    if (params?.orderBy) queryParams.set('orderBy', params.orderBy);

    // Build query
    const queryParts: string[] = [];
    if (params?.folderId) {
      queryParts.push(`'${params.folderId}' in parents`);
    }
    if (params?.q) {
      queryParts.push(params.q);
    }
    queryParts.push('trashed = false');

    queryParams.set('q', queryParts.join(' and '));

    const response = await this.driveRequest<{
      files: Record<string, unknown>[];
      nextPageToken?: string;
    }>(`/files?${queryParams.toString()}`);

    if (!response.success) return response as IntegrationApiResponse<GoogleDriveFile[]>;

    const files = response.data?.files || [];

    return {
      success: true,
      data: files.map((f) => this.mapFile(f)),
      pagination: {
        cursor: response.data?.nextPageToken,
        hasMore: !!response.data?.nextPageToken,
      },
    };
  }

  /**
   * Get a file
   */
  async getFile(fileId: string): Promise<IntegrationApiResponse<GoogleDriveFile>> {
    const response = await this.driveRequest<Record<string, unknown>>(
      `/files/${fileId}?fields=id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink,webContentLink,iconLink,thumbnailLink,owners,shared`
    );

    if (!response.success) return response as IntegrationApiResponse<GoogleDriveFile>;

    return {
      success: true,
      data: this.mapFile(response.data!),
    };
  }

  /**
   * Upload a file
   */
  async uploadFile(input: UploadFileInput): Promise<IntegrationApiResponse<GoogleDriveFile>> {
    const uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,createdTime,modifiedTime,webViewLink';

    const metadata = {
      name: input.name,
      mimeType: input.mimeType,
      parents: input.parents,
      description: input.description,
    };

    // Build multipart body
    const boundary = `boundary_${Date.now()}`;
    const contentData = typeof input.content === 'string'
      ? input.content
      : input.content.toString('base64');

    const body = [
      `--${boundary}`,
      'Content-Type: application/json; charset=UTF-8',
      '',
      JSON.stringify(metadata),
      `--${boundary}`,
      `Content-Type: ${input.mimeType}`,
      'Content-Transfer-Encoding: base64',
      '',
      contentData,
      `--${boundary}--`,
    ].join('\r\n');

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAccessToken()}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: {
          code: response.status.toString(),
          message: errorData.error?.message || 'Upload failed',
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
  async downloadFile(fileId: string): Promise<IntegrationApiResponse<{ content: Buffer; mimeType: string }>> {
    // First get file metadata
    const fileInfo = await this.getFile(fileId);
    if (!fileInfo.success) return fileInfo as IntegrationApiResponse<{ content: Buffer; mimeType: string }>;

    const mimeType = fileInfo.data!.mimeType;

    // Check if it's a Google Docs file that needs export
    const exportMimeTypes: Record<string, string> = {
      'application/vnd.google-apps.document': 'application/pdf',
      'application/vnd.google-apps.spreadsheet': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.google-apps.presentation': 'application/pdf',
    };

    let downloadUrl: string;
    let resultMimeType = mimeType;

    if (exportMimeTypes[mimeType]) {
      resultMimeType = exportMimeTypes[mimeType];
      downloadUrl = `${this.config.baseUrl}/files/${fileId}/export?mimeType=${encodeURIComponent(resultMimeType)}`;
    } else {
      downloadUrl = `${this.config.baseUrl}/files/${fileId}?alt=media`;
    }

    const response = await fetch(downloadUrl, {
      headers: {
        'Authorization': `Bearer ${this.getAccessToken()}`,
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

    const arrayBuffer = await response.arrayBuffer();
    return {
      success: true,
      data: {
        content: Buffer.from(arrayBuffer),
        mimeType: resultMimeType,
      },
    };
  }

  /**
   * Delete a file (move to trash)
   */
  async trashFile(fileId: string): Promise<IntegrationApiResponse<void>> {
    const response = await this.driveRequest<Record<string, unknown>>(
      `/files/${fileId}`,
      { method: 'PATCH', body: { trashed: true } }
    );

    if (!response.success) return response as IntegrationApiResponse<void>;

    return { success: true, data: undefined };
  }

  /**
   * Permanently delete a file
   */
  async deleteFile(fileId: string): Promise<IntegrationApiResponse<void>> {
    const response = await this.driveRequest<void>(
      `/files/${fileId}`,
      { method: 'DELETE' }
    );

    return response;
  }

  /**
   * Copy a file
   */
  async copyFile(
    fileId: string,
    options?: { name?: string; parents?: string[] }
  ): Promise<IntegrationApiResponse<GoogleDriveFile>> {
    const response = await this.driveRequest<Record<string, unknown>>(
      `/files/${fileId}/copy?fields=id,name,mimeType,size,createdTime,modifiedTime,webViewLink`,
      { method: 'POST', body: options || {} }
    );

    if (!response.success) return response as IntegrationApiResponse<GoogleDriveFile>;

    return {
      success: true,
      data: this.mapFile(response.data!),
    };
  }

  /**
   * Move a file
   */
  async moveFile(
    fileId: string,
    newParentId: string,
    removeFromCurrent: boolean = true
  ): Promise<IntegrationApiResponse<GoogleDriveFile>> {
    // Get current parents
    const fileInfo = await this.getFile(fileId);
    if (!fileInfo.success) return fileInfo;

    const currentParents = fileInfo.data!.parents?.join(',') || '';

    const queryParams = new URLSearchParams({
      addParents: newParentId,
      fields: 'id,name,mimeType,parents',
    });

    if (removeFromCurrent && currentParents) {
      queryParams.set('removeParents', currentParents);
    }

    const response = await this.driveRequest<Record<string, unknown>>(
      `/files/${fileId}?${queryParams.toString()}`,
      { method: 'PATCH' }
    );

    if (!response.success) return response as IntegrationApiResponse<GoogleDriveFile>;

    return {
      success: true,
      data: this.mapFile(response.data!),
    };
  }

  // -------------------------------------------------------------------------
  // Folders
  // -------------------------------------------------------------------------

  /**
   * Create a folder
   */
  async createFolder(input: CreateFolderInput): Promise<IntegrationApiResponse<GoogleDriveFolder>> {
    const response = await this.driveRequest<Record<string, unknown>>(
      '/files?fields=id,name,mimeType,parents,createdTime,modifiedTime',
      {
        method: 'POST',
        body: {
          name: input.name,
          mimeType: 'application/vnd.google-apps.folder',
          parents: input.parents,
          description: input.description,
        },
      }
    );

    if (!response.success) return response as IntegrationApiResponse<GoogleDriveFolder>;

    const f = response.data!;
    return {
      success: true,
      data: {
        id: f.id as string,
        name: f.name as string,
        mimeType: 'application/vnd.google-apps.folder',
        parents: f.parents as string[],
        createdTime: f.createdTime as string,
        modifiedTime: f.modifiedTime as string,
      },
    };
  }

  /**
   * List folder contents
   */
  async listFolderContents(folderId: string, params?: {
    pageSize?: number;
    pageToken?: string;
  }): Promise<IntegrationApiResponse<GoogleDriveFile[]>> {
    return this.listFiles({
      ...params,
      folderId,
    });
  }

  // -------------------------------------------------------------------------
  // Permissions / Sharing
  // -------------------------------------------------------------------------

  /**
   * Share a file
   */
  async shareFile(
    fileId: string,
    input: ShareFileInput
  ): Promise<IntegrationApiResponse<GoogleDrivePermission>> {
    const body: Record<string, unknown> = {
      role: input.role,
      type: input.type,
    };

    if (input.emailAddress) body.emailAddress = input.emailAddress;
    if (input.domain) body.domain = input.domain;

    const queryParams = new URLSearchParams();
    if (input.sendNotificationEmail !== undefined) {
      queryParams.set('sendNotificationEmail', input.sendNotificationEmail.toString());
    }
    if (input.emailMessage) {
      queryParams.set('emailMessage', input.emailMessage);
    }

    const response = await this.driveRequest<Record<string, unknown>>(
      `/files/${fileId}/permissions?${queryParams.toString()}`,
      { method: 'POST', body }
    );

    if (!response.success) return response as IntegrationApiResponse<GoogleDrivePermission>;

    const p = response.data!;
    return {
      success: true,
      data: {
        id: p.id as string,
        type: p.type as GoogleDrivePermission['type'],
        role: p.role as GoogleDrivePermission['role'],
        emailAddress: p.emailAddress as string,
        domain: p.domain as string,
      },
    };
  }

  /**
   * List permissions
   */
  async listPermissions(fileId: string): Promise<IntegrationApiResponse<GoogleDrivePermission[]>> {
    const response = await this.driveRequest<{ permissions: Record<string, unknown>[] }>(
      `/files/${fileId}/permissions?fields=permissions(id,type,role,emailAddress,domain)`
    );

    if (!response.success) return response as IntegrationApiResponse<GoogleDrivePermission[]>;

    const permissions = response.data?.permissions || [];

    return {
      success: true,
      data: permissions.map((p) => ({
        id: p.id as string,
        type: p.type as GoogleDrivePermission['type'],
        role: p.role as GoogleDrivePermission['role'],
        emailAddress: p.emailAddress as string,
        domain: p.domain as string,
      })),
    };
  }

  /**
   * Remove a permission
   */
  async removePermission(fileId: string, permissionId: string): Promise<IntegrationApiResponse<void>> {
    const response = await this.driveRequest<void>(
      `/files/${fileId}/permissions/${permissionId}`,
      { method: 'DELETE' }
    );

    return response;
  }

  // -------------------------------------------------------------------------
  // Search
  // -------------------------------------------------------------------------

  /**
   * Search files
   */
  async searchFiles(query: string, params?: {
    pageSize?: number;
    pageToken?: string;
  }): Promise<IntegrationApiResponse<GoogleDriveFile[]>> {
    // Build search query
    const searchQuery = `name contains '${query}' and trashed = false`;

    return this.listFiles({
      ...params,
      q: searchQuery,
    });
  }

  // -------------------------------------------------------------------------
  // Helper Methods
  // -------------------------------------------------------------------------

  private mapFile(f: Record<string, unknown>): GoogleDriveFile {
    return {
      id: f.id as string,
      name: f.name as string,
      mimeType: f.mimeType as string,
      size: f.size as string,
      createdTime: f.createdTime as string,
      modifiedTime: f.modifiedTime as string,
      parents: f.parents as string[],
      webViewLink: f.webViewLink as string,
      webContentLink: f.webContentLink as string,
      iconLink: f.iconLink as string,
      thumbnailLink: f.thumbnailLink as string,
      owners: f.owners as Array<{ displayName: string; emailAddress: string }>,
      shared: f.shared as boolean,
    };
  }
}

export const googleDriveService = new GoogleDriveService();

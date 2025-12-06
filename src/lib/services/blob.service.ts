import { put, del, head, list } from '@vercel/blob';
import sanitizeFilename from 'sanitize-filename';
import crypto from 'crypto';

/**
 * Vercel Blob Storage Service
 *
 * Handles all file storage operations using Vercel Blob Storage.
 * Requires BLOB_READ_WRITE_TOKEN environment variable.
 *
 * Features:
 * - Upload files with automatic path generation
 * - Download files as buffers
 * - Delete files
 * - Get file URLs (public by default)
 * - Get file metadata
 * - Organization-based folder structure
 */
export class BlobService {
  constructor() {
    // Require BLOB_READ_WRITE_TOKEN - throw error if not configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error('BLOB_READ_WRITE_TOKEN environment variable is required. Please configure Vercel Blob storage.');
    }
    console.log('[BlobService] Initialized');
  }

  /**
   * Generate unique filename with timestamp and random string
   *
   * @param originalName - Original filename
   * @returns Sanitized unique filename
   */
  private generateFilename(originalName: string): string {
    const sanitized = sanitizeFilename(originalName);
    const ext = sanitized.split('.').pop() || '';
    const baseName = sanitized.slice(0, -(ext.length + 1)) || 'file';
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');

    return `${baseName}-${timestamp}-${random}.${ext}`;
  }

  /**
   * Generate file path with organization prefix
   *
   * @param orgId - Organization ID
   * @param filename - Filename
   * @param folder - Folder name (default: 'documents')
   * @returns Full file path
   */
  private getFilePath(orgId: string, filename: string, folder: string = 'documents'): string {
    return `org-${orgId}/${folder}/${filename}`;
  }

  /**
   * Upload file to Vercel Blob
   *
   * @param file - File buffer
   * @param originalName - Original filename
   * @param mimeType - MIME type
   * @param orgId - Organization ID
   * @param folder - Optional folder name (default: 'documents')
   * @returns Object with file metadata
   */
  async uploadFile(
    file: Buffer,
    originalName: string,
    mimeType: string,
    orgId: string,
    folder: string = 'documents'
  ): Promise<{
    fileName: string;
    filePath: string;
    cdnUrl: string;
    fileSize: number;
  }> {
    try {
      const fileName = this.generateFilename(originalName);
      const filePath = this.getFilePath(orgId, fileName, folder);

      // Upload to Vercel Blob
      const blob = await put(filePath, file, {
        access: 'public',
        contentType: mimeType,
        addRandomSuffix: false, // We already add our own random suffix
      });

      return {
        fileName,
        filePath,
        cdnUrl: blob.url,
        fileSize: file.length,
      };
    } catch (error) {
      console.error('Blob upload error:', error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Download file from Vercel Blob
   *
   * @param filePathOrUrl - File path or full URL
   * @returns File buffer
   */
  async downloadFile(filePathOrUrl: string): Promise<Buffer> {
    try {
      // If it's a full URL, use it directly; otherwise we need to get the URL
      let url = filePathOrUrl;

      // If not a URL, fetch from blob list to get the URL
      if (!filePathOrUrl.startsWith('http')) {
        const blobs = await list({ prefix: filePathOrUrl });
        if (blobs.blobs.length === 0) {
          throw new Error(`File not found: ${filePathOrUrl}`);
        }
        url = blobs.blobs[0].url;
      }

      // Fetch the file
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.error('Blob download error:', error);
      throw new Error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete file from Vercel Blob
   *
   * @param filePathOrUrl - File path or full URL
   */
  async deleteFile(filePathOrUrl: string): Promise<void> {
    try {
      // If it's a path, we need to get the URL first
      let url = filePathOrUrl;

      if (!filePathOrUrl.startsWith('http')) {
        const blobs = await list({ prefix: filePathOrUrl });
        if (blobs.blobs.length === 0) {
          // File doesn't exist, consider it deleted
          return;
        }
        url = blobs.blobs[0].url;
      }

      await del(url);
    } catch (error) {
      console.error('Blob delete error:', error);
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get file metadata
   *
   * @param url - Blob URL
   * @returns File metadata
   */
  async getFileMetadata(url: string): Promise<{
    contentType: string;
    contentLength: number;
    lastModified: Date;
    metadata: Record<string, string>;
  }> {
    try {
      const metadata = await head(url);

      return {
        contentType: metadata.contentType || 'application/octet-stream',
        contentLength: metadata.size,
        lastModified: new Date(metadata.uploadedAt),
        metadata: {},
      };
    } catch (error) {
      console.error('Blob metadata error:', error);
      throw new Error(`Failed to get file metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get public URL for a file
   *
   * Note: Vercel Blob URLs are public by default, so we don't need signed URLs.
   * The cdnUrl stored in the database is the permanent public URL.
   *
   * @param filePathOrUrl - File path or existing URL
   * @param expiresIn - Ignored for Vercel Blob (kept for API compatibility)
   * @returns Public URL
   */
  async getSignedUrl(filePathOrUrl: string, expiresIn: number = 3600): Promise<string> {
    // If it's already a URL, return it
    if (filePathOrUrl.startsWith('http')) {
      return filePathOrUrl;
    }

    // Otherwise, find the blob and return its URL
    try {
      const blobs = await list({ prefix: filePathOrUrl });
      if (blobs.blobs.length === 0) {
        throw new Error(`File not found: ${filePathOrUrl}`);
      }
      return blobs.blobs[0].url;
    } catch (error) {
      console.error('Blob URL error:', error);
      throw new Error(`Failed to get file URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Copy file to new location
   *
   * Note: Vercel Blob doesn't have a native copy operation,
   * so we download and re-upload.
   *
   * @param sourceUrl - Source file URL
   * @param destinationPath - Destination file path
   */
  async copyFile(sourceUrl: string, destinationPath: string): Promise<string> {
    try {
      // Download the source file
      const buffer = await this.downloadFile(sourceUrl);

      // Get metadata to preserve content type
      const metadata = await this.getFileMetadata(sourceUrl);

      // Upload to new location
      const blob = await put(destinationPath, buffer, {
        access: 'public',
        contentType: metadata.contentType,
        addRandomSuffix: false,
      });

      return blob.url;
    } catch (error) {
      console.error('Blob copy error:', error);
      throw new Error(`Failed to copy file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if file exists
   *
   * @param url - Blob URL
   * @returns True if file exists
   */
  async fileExists(url: string): Promise<boolean> {
    try {
      await head(url);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Upload thumbnail image
   *
   * Convenience method for uploading thumbnail images to the 'thumbnails' folder.
   *
   * @param file - Thumbnail image buffer
   * @param originalName - Original filename
   * @param orgId - Organization ID
   * @returns Object with file metadata
   */
  async uploadThumbnail(
    file: Buffer,
    originalName: string,
    orgId: string
  ): Promise<{
    fileName: string;
    filePath: string;
    cdnUrl: string;
    fileSize: number;
  }> {
    return this.uploadFile(file, originalName, 'image/jpeg', orgId, 'thumbnails');
  }

  /**
   * List files with a given prefix
   *
   * @param prefix - Path prefix to filter
   * @returns Array of blob metadata
   */
  async listFiles(prefix: string): Promise<Array<{
    url: string;
    pathname: string;
    size: number;
    uploadedAt: Date;
  }>> {
    try {
      const blobs = await list({ prefix });
      return blobs.blobs.map(blob => ({
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: new Date(blob.uploadedAt),
      }));
    } catch (error) {
      console.error('Blob list error:', error);
      throw new Error(`Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Singleton instance
let blobServiceInstance: BlobService | null = null;

/**
 * Get singleton instance of BlobService
 *
 * @returns BlobService instance
 */
export function getBlobService(): BlobService {
  if (!blobServiceInstance) {
    blobServiceInstance = new BlobService();
  }
  return blobServiceInstance;
}

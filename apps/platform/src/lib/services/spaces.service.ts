import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sanitizeFilename from 'sanitize-filename';
import crypto from 'crypto';

/**
 * DigitalOcean Spaces Service
 *
 * Handles all file storage operations using DigitalOcean Spaces
 * (S3-compatible object storage).
 *
 * Features:
 * - Upload files with automatic path generation
 * - Download files as buffers
 * - Delete files
 * - Generate pre-signed URLs for temporary access
 * - Get file metadata
 * - Organization-based folder structure
 */
export class SpacesService {
  private client: S3Client;
  private bucket: string;
  private cdnUrl: string;
  private endpoint: string;

  constructor() {
    // Validate required environment variables
    if (!process.env.SPACES_ACCESS_KEY || !process.env.SPACES_SECRET_KEY) {
      throw new Error('Spaces credentials not configured. Set SPACES_ACCESS_KEY and SPACES_SECRET_KEY.');
    }

    if (!process.env.SPACES_ENDPOINT) {
      throw new Error('SPACES_ENDPOINT environment variable is required');
    }

    this.bucket = process.env.SPACES_BUCKET || 'astralis-documents';
    this.cdnUrl = process.env.SPACES_CDN_URL || '';
    this.endpoint = process.env.SPACES_ENDPOINT;

    console.log('[SpacesService] Initialized with bucket:', this.bucket);
    console.log('[SpacesService] SPACES_BUCKET env var:', process.env.SPACES_BUCKET);

    // Initialize S3 client with DigitalOcean Spaces endpoint
    this.client = new S3Client({
      endpoint: `https://${this.endpoint}`,
      region: process.env.SPACES_REGION || 'nyc3',
      credentials: {
        accessKeyId: process.env.SPACES_ACCESS_KEY,
        secretAccessKey: process.env.SPACES_SECRET_KEY,
      },
      // Force path-style URLs for compatibility
      forcePathStyle: false,
    });
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
   * Generate CDN URL for a file path
   *
   * @param filePath - File path in Spaces
   * @returns CDN URL or direct Spaces URL
   */
  private getCdnUrl(filePath: string): string {
    if (this.cdnUrl) {
      return `${this.cdnUrl}/${filePath}`;
    }
    // Fallback to direct Spaces URL
    return `https://${this.bucket}.${this.endpoint}/${filePath}`;
  }

  /**
   * Upload file to Spaces
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

      // Upload to Spaces
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: filePath,
        Body: file,
        ContentType: mimeType,
        // Set cache control for CDN
        CacheControl: 'public, max-age=31536000', // 1 year
        // ACL for private access (requires signed URLs)
        ACL: 'private',
        // Metadata
        Metadata: {
          'original-name': originalName,
          'org-id': orgId,
          'uploaded-at': new Date().toISOString(),
        },
      });

      await this.client.send(command);

      // Generate CDN URL
      const cdnUrl = this.getCdnUrl(filePath);

      return {
        fileName,
        filePath,
        cdnUrl,
        fileSize: file.length,
      };
    } catch (error) {
      console.error('Spaces upload error:', error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Download file from Spaces
   *
   * @param filePath - File path in Spaces
   * @returns File buffer
   */
  async downloadFile(filePath: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: filePath,
      });

      const response = await this.client.send(command);

      if (!response.Body) {
        throw new Error('No file body received');
      }

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      console.error('Spaces download error:', error);
      throw new Error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete file from Spaces
   *
   * @param filePath - File path in Spaces
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: filePath,
      });

      await this.client.send(command);
    } catch (error) {
      console.error('Spaces delete error:', error);
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get file metadata
   *
   * @param filePath - File path in Spaces
   * @returns File metadata
   */
  async getFileMetadata(filePath: string): Promise<{
    contentType: string;
    contentLength: number;
    lastModified: Date;
    metadata: Record<string, string>;
  }> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: filePath,
      });

      const response = await this.client.send(command);

      return {
        contentType: response.ContentType || 'application/octet-stream',
        contentLength: response.ContentLength || 0,
        lastModified: response.LastModified || new Date(),
        metadata: response.Metadata || {},
      };
    } catch (error) {
      console.error('Spaces metadata error:', error);
      throw new Error(`Failed to get file metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate pre-signed URL for temporary file access
   *
   * @param filePath - File path in Spaces
   * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
   * @returns Pre-signed URL
   */
  async getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: filePath,
      });

      const signedUrl = await getSignedUrl(this.client, command, { expiresIn });
      return signedUrl;
    } catch (error) {
      console.error('Spaces signed URL error:', error);
      throw new Error(`Failed to generate signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Copy file to new location in Spaces
   *
   * @param sourcePath - Source file path
   * @param destinationPath - Destination file path
   */
  async copyFile(sourcePath: string, destinationPath: string): Promise<void> {
    try {
      const command = new CopyObjectCommand({
        Bucket: this.bucket,
        CopySource: `${this.bucket}/${sourcePath}`,
        Key: destinationPath,
      });

      await this.client.send(command);
    } catch (error) {
      console.error('Spaces copy error:', error);
      throw new Error(`Failed to copy file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if file exists in Spaces
   *
   * @param filePath - File path in Spaces
   * @returns True if file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await this.getFileMetadata(filePath);
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
}

// Singleton instance
let spacesServiceInstance: SpacesService | null = null;

/**
 * Get singleton instance of SpacesService
 *
 * @returns SpacesService instance
 */
export function getSpacesService(): SpacesService {
  if (!spacesServiceInstance) {
    spacesServiceInstance = new SpacesService();
  }
  return spacesServiceInstance;
}

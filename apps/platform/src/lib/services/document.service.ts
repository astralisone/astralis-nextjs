import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getSpacesService } from './spaces.service';
import { getOCRService } from './ocr.service';
import { getVisionService, DocumentType } from './vision.service';
import { validateFile, supportsOCR } from '@/lib/utils/file-validation';
import { queueDocumentProcessing } from '@/workers/queues/document-processing.queue';
import sharp from 'sharp';
import type {
  CreateDocumentInput,
  UpdateDocumentInput,
  DocumentFilters,
  DocumentProcessingOptions,
} from '@/lib/validators/document.validators';

/**
 * Document Service
 *
 * Handles business logic for document CRUD operations, file uploads,
 * OCR processing, and structured data extraction.
 *
 * NOTE: This service assumes the Document model exists in Prisma schema.
 * If not yet migrated, database operations will fail.
 */

/**
 * Document with relations type
 */
interface DocumentWithRelations {
  id: string;
  fileName: string;
  originalName: string;
  filePath: string;
  cdnUrl: string | null;
  thumbnailUrl: string | null;
  fileSize: number;
  mimeType: string;
  status: string;
  ocrText: string | null;
  ocrConfidence: number | null;
  extractedData: any;
  metadata: any;
  processingError: string | null;
  uploadedBy: string;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
  processedAt: Date | null;
}

export class DocumentService {
  private spacesService = getSpacesService();
  private ocrService = getOCRService();
  private visionService = getVisionService();

  /**
   * Upload and create document record
   *
   * @param file - File buffer
   * @param filename - Original filename
   * @param mimeType - MIME type
   * @param userId - User ID uploading the file
   * @param orgId - Organization ID
   * @param options - Processing options
   * @returns Created document record
   */
  async uploadDocument(
    file: Buffer,
    filename: string,
    mimeType: string,
    userId: string,
    orgId: string,
    options: DocumentProcessingOptions = {
      performOCR: true,
      performVisionExtraction: false,
      generateThumbnail: true,
      language: 'eng',
    }
  ): Promise<any> {
    // NOTE: This method assumes Document model exists
    // If not migrated yet, this will throw an error

    // 1. Validate file
    const validation = await validateFile(file, filename, mimeType);
    if (!validation.valid) {
      throw new Error(validation.error || 'File validation failed');
    }

    // 2. Upload to Spaces
    const uploadResult = await this.spacesService.uploadFile(
      file,
      filename,
      validation.detectedMimeType || mimeType,
      orgId
    );

    // 3. Generate thumbnail if requested
    let thumbnailUrl: string | null = null;
    if (options.generateThumbnail && mimeType.startsWith('image/')) {
      try {
        const thumbnail = await this.generateThumbnail(file);
        const thumbResult = await this.spacesService.uploadThumbnail(
          thumbnail,
          `thumb_${filename}`,
          orgId
        );
        thumbnailUrl = thumbResult.cdnUrl;
      } catch (error) {
        console.error('Failed to generate thumbnail:', error);
        // Continue without thumbnail
      }
    }

    // 4. Create document record (REQUIRES Document model in schema)
    const documentData: CreateDocumentInput = {
      fileName: uploadResult.fileName,
      originalName: filename,
      filePath: uploadResult.filePath,
      cdnUrl: uploadResult.cdnUrl,
      thumbnailUrl,
      fileSize: uploadResult.fileSize,
      mimeType: validation.detectedMimeType || mimeType,
      uploadedById: userId,
      orgId,
      metadata: {
        uploadedAt: new Date().toISOString(),
        originalMimeType: mimeType,
      },
    };

    // Create document record in database
    const { metadata, ...rest } = documentData;
    const document = await prisma.document.create({
      data: {
        ...rest,
        status: 'PENDING',
        metadata: metadata === null ? Prisma.JsonNull : (metadata || Prisma.JsonNull),
      },
    });

    // 5. Queue background processing
    try {
      await queueDocumentProcessing({
        documentId: document.id,
        orgId,
        performOCR: options.performOCR,
        performVisionExtraction: options.performVisionExtraction,
        documentType: options.documentType || undefined,
        language: options.language,
      });

      console.log(`[DocumentService] Queued processing for document ${document.id}`);
    } catch (error) {
      console.error('[DocumentService] Failed to queue document processing:', error);
      // Don't fail the upload if queueing fails
    }

    return document;
  }

  /**
   * Generate thumbnail from image
   *
   * @param imageBuffer - Original image buffer
   * @param width - Thumbnail width (default: 200px)
   * @param height - Thumbnail height (default: 200px)
   * @returns Thumbnail buffer
   */
  async generateThumbnail(
    imageBuffer: Buffer,
    width: number = 200,
    height: number = 200
  ): Promise<Buffer> {
    try {
      return await sharp(imageBuffer)
        .resize(width, height, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 80 })
        .toBuffer();
    } catch (error) {
      console.error('Thumbnail generation error:', error);
      throw new Error('Failed to generate thumbnail');
    }
  }

  /**
   * Get document by ID
   *
   * @param documentId - Document ID
   * @param orgId - Organization ID (for access control)
   * @returns Document record
   */
  async getDocument(documentId: string, orgId: string): Promise<any> {
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        orgId,
      },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    return document;
  }

  /**
   * List documents with filters
   *
   * @param filters - Query filters
   * @returns Documents and pagination info
   */
  async listDocuments(filters: DocumentFilters): Promise<{
    documents: any[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  }> {
    // NOTE: Requires Document model
    const limit = parseInt(filters.limit || '50');
    const offset = parseInt(filters.offset || '0');

    const where: any = {
      orgId: filters.orgId,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.mimeType) {
      where.mimeType = filters.mimeType;
    }

    if (filters.uploadedBy) {
      where.uploadedBy = filters.uploadedBy;
    }

    if (filters.search) {
      where.OR = [
        { originalName: { contains: filters.search, mode: 'insensitive' } },
        { fileName: { contains: filters.search, mode: 'insensitive' } },
        { ocrText: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        take: limit,
        skip: offset,
      }),
      prisma.document.count({ where }),
    ]);

    return {
      documents,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  /**
   * Update document
   *
   * @param documentId - Document ID
   * @param orgId - Organization ID (for access control)
   * @param updates - Update data
   * @returns Updated document
   */
  async updateDocument(
    documentId: string,
    orgId: string,
    updates: UpdateDocumentInput
  ): Promise<any> {
    // Verify document exists and belongs to org
    const existing = await this.getDocument(documentId, orgId);

    // Handle JSON fields that can't be null
    const { metadata, extractedData, ...rest } = updates;
    const updated = await prisma.document.update({
      where: { id: documentId },
      data: {
        ...rest,
        ...(metadata !== undefined && {
          metadata: metadata === null ? Prisma.JsonNull : metadata,
        }),
        ...(extractedData !== undefined && {
          extractedData: extractedData === null ? Prisma.JsonNull : extractedData,
        }),
      },
    });

    return updated;
  }

  /**
   * Delete document
   *
   * @param documentId - Document ID
   * @param orgId - Organization ID (for access control)
   */
  async deleteDocument(documentId: string, orgId: string): Promise<void> {
    // Get document to retrieve file path
    const document = await this.getDocument(documentId, orgId);

    // Delete from Spaces
    try {
      await this.spacesService.deleteFile(document.filePath);
      if (document.thumbnailUrl) {
        // Extract path from CDN URL and delete thumbnail
        const thumbPath = document.thumbnailUrl.split('/').slice(-3).join('/');
        await this.spacesService.deleteFile(thumbPath);
      }
    } catch (error) {
      console.error('Failed to delete files from Spaces:', error);
      // Continue with database deletion
    }

    // Delete from database
    await prisma.document.delete({
      where: { id: documentId },
    });
  }

  /**
   * Download document file
   *
   * @param documentId - Document ID
   * @param orgId - Organization ID (for access control)
   * @returns File buffer and metadata
   */
  async downloadDocument(documentId: string, orgId: string): Promise<{
    buffer: Buffer;
    filename: string;
    mimeType: string;
  }> {
    const document = await this.getDocument(documentId, orgId);

    const buffer = await this.spacesService.downloadFile(document.filePath);

    return {
      buffer,
      filename: document.originalName,
      mimeType: document.mimeType,
    };
  }

  /**
   * Process document with OCR
   *
   * @param documentId - Document ID
   * @param orgId - Organization ID (for access control)
   * @param language - OCR language (default: 'eng')
   * @returns OCR result
   */
  async processOCR(
    documentId: string,
    orgId: string,
    language: string = 'eng'
  ): Promise<any> {
    const document = await this.getDocument(documentId, orgId);

    if (!supportsOCR(document.mimeType)) {
      throw new Error('Document type does not support OCR');
    }

    // Update status to PROCESSING
    await this.updateDocument(documentId, orgId, { status: 'PROCESSING' });

    try {
      // Download file
      const fileBuffer = await this.spacesService.downloadFile(document.filePath);

      // Perform OCR
      const ocrResult = await this.ocrService.extractText(
        fileBuffer,
        document.mimeType,
        language
      );

      // Update document with OCR results
      await this.updateDocument(documentId, orgId, {
        status: 'COMPLETED',
        ocrText: ocrResult.text,
        ocrConfidence: ocrResult.confidence,
        processedAt: new Date(),
        metadata: {
          ...document.metadata,
          ocr: {
            language: ocrResult.language,
            wordCount: ocrResult.wordCount,
            processingTime: ocrResult.processingTime,
          },
        },
      });

      return ocrResult;
    } catch (error) {
      // Update status to FAILED
      await this.updateDocument(documentId, orgId, {
        status: 'FAILED',
        processingError: error instanceof Error ? error.message : 'OCR processing failed',
      });

      throw error;
    }
  }

  /**
   * Extract structured data with GPT-4 Vision
   *
   * @param documentId - Document ID
   * @param orgId - Organization ID (for access control)
   * @param documentType - Type of document (optional, will auto-detect if not provided)
   * @returns Extraction result
   */
  async extractStructuredData(
    documentId: string,
    orgId: string,
    documentType?: DocumentType
  ): Promise<any> {
    const document = await this.getDocument(documentId, orgId);

    if (!document.mimeType.startsWith('image/')) {
      throw new Error('Vision extraction only supports image documents');
    }

    try {
      // Download file
      const fileBuffer = await this.spacesService.downloadFile(document.filePath);

      // Detect document type if not provided
      let detectedType = documentType;
      if (!detectedType) {
        detectedType = await this.visionService.detectDocumentType(
          fileBuffer,
          document.mimeType
        );
      }

      // Extract structured data
      const extractionResult = await this.visionService.extractStructuredData(
        fileBuffer,
        document.mimeType,
        detectedType
      );

      // Update document with extracted data
      await this.updateDocument(documentId, orgId, {
        extractedData: extractionResult.data,
        metadata: {
          ...document.metadata,
          vision: {
            documentType: extractionResult.type,
            confidence: extractionResult.confidence,
            model: extractionResult.model,
            processingTime: extractionResult.processingTime,
          },
        },
      });

      return extractionResult;
    } catch (error) {
      console.error('Vision extraction error:', error);
      throw error;
    }
  }
}

// Singleton instance
let documentServiceInstance: DocumentService | null = null;

/**
 * Get singleton instance of DocumentService
 *
 * @returns DocumentService instance
 */
export function getDocumentService(): DocumentService {
  if (!documentServiceInstance) {
    documentServiceInstance = new DocumentService();
  }
  return documentServiceInstance;
}

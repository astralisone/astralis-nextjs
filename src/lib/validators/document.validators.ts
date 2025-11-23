import { z } from 'zod';

/**
 * Document Validation Schemas
 *
 * Zod schemas for validating document-related operations.
 */

/**
 * Document status enum
 */
export const DocumentStatusSchema = z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']);

/**
 * Document type enum (for structured extraction)
 */
export const DocumentTypeSchema = z.enum([
  'invoice',
  'receipt',
  'form',
  'contract',
  'identity',
  'business_card',
  'generic',
]);

/**
 * File upload validation schema
 */
export const FileUploadSchema = z.object({
  file: z.instanceof(Buffer).or(z.any()), // File buffer
  filename: z.string().min(1, 'Filename is required').max(255, 'Filename too long'),
  mimeType: z.string().min(1, 'MIME type is required'),
  fileSize: z.number().int().positive('File size must be positive'),
  orgId: z.string().cuid('Invalid organization ID'),
});

/**
 * Document creation schema
 */
export const CreateDocumentSchema = z.object({
  fileName: z.string().min(1).max(255),
  originalName: z.string().min(1).max(255),
  filePath: z.string().min(1),
  cdnUrl: z.string().url().optional().nullable(),
  thumbnailUrl: z.string().url().optional().nullable(),
  fileSize: z.number().int().positive(),
  mimeType: z.string().min(1),
  uploadedById: z.string().cuid(),
  orgId: z.string().cuid(),
  metadata: z.record(z.any()).optional().nullable(),
});

/**
 * Document update schema
 */
export const UpdateDocumentSchema = z.object({
  status: DocumentStatusSchema.optional(),
  ocrText: z.string().optional().nullable(),
  ocrConfidence: z.number().min(0).max(1).optional().nullable(),
  extractedData: z.record(z.any()).optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
  processingError: z.string().optional().nullable(),
  processedAt: z.date().optional().nullable(),
  thumbnailUrl: z.string().url().optional().nullable(),
});

/**
 * Document query filters schema
 */
export const DocumentFiltersSchema = z.object({
  orgId: z.string().cuid('Organization ID is required'),
  status: DocumentStatusSchema.optional().nullable(),
  mimeType: z.string().optional().nullable(),
  uploadedBy: z.string().cuid().optional().nullable(),
  search: z.string().optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  limit: z.string().regex(/^\d+$/).optional().nullable(),
  offset: z.string().regex(/^\d+$/).optional().nullable(),
});

/**
 * Document processing options schema
 */
export const DocumentProcessingOptionsSchema = z.object({
  performOCR: z.boolean().default(true),
  performVisionExtraction: z.boolean().default(false),
  documentType: DocumentTypeSchema.optional().nullable(),
  language: z.string().optional().default('eng'),
  generateThumbnail: z.boolean().default(true),
});

/**
 * OCR request schema
 */
export const OCRRequestSchema = z.object({
  documentId: z.string().cuid(),
  language: z.string().optional().default('eng'),
  preprocessing: z
    .object({
      enhanceContrast: z.boolean().optional(),
      grayscale: z.boolean().optional(),
      sharpen: z.boolean().optional(),
      resize: z.boolean().optional(),
      targetWidth: z.number().int().positive().optional(),
    })
    .optional(),
});

/**
 * Vision extraction request schema
 */
export const VisionExtractionRequestSchema = z.object({
  documentId: z.string().cuid(),
  documentType: DocumentTypeSchema.optional(),
});

/**
 * Bulk document operation schema
 */
export const BulkDocumentOperationSchema = z.object({
  documentIds: z.array(z.string().cuid()).min(1, 'At least one document ID required').max(100, 'Maximum 100 documents'),
  operation: z.enum(['delete', 'reprocess', 'update_status']),
  params: z.record(z.any()).optional(),
});

/**
 * Document download request schema
 */
export const DocumentDownloadSchema = z.object({
  documentId: z.string().cuid(),
  disposition: z.enum(['inline', 'attachment']).default('attachment'),
  expiresIn: z.number().int().positive().max(86400).optional(), // Max 24 hours
});

/**
 * Type exports for TypeScript
 */
export type FileUploadInput = z.infer<typeof FileUploadSchema>;
export type CreateDocumentInput = z.infer<typeof CreateDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof UpdateDocumentSchema>;
export type DocumentFilters = z.infer<typeof DocumentFiltersSchema>;
export type DocumentProcessingOptions = z.infer<typeof DocumentProcessingOptionsSchema>;
export type OCRRequest = z.infer<typeof OCRRequestSchema>;
export type VisionExtractionRequest = z.infer<typeof VisionExtractionRequestSchema>;
export type BulkDocumentOperation = z.infer<typeof BulkDocumentOperationSchema>;
export type DocumentDownloadRequest = z.infer<typeof DocumentDownloadSchema>;

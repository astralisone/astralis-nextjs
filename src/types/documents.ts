/**
 * Document Types
 * Type definitions for document processing components and API responses
 */

/**
 * Document Status Enum
 */
export type DocumentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

/**
 * Document Entity
 */
export interface Document {
  id: string;
  fileName: string;
  originalName: string;
  filePath: string;
  cdnUrl: string | null;
  thumbnailUrl: string | null;
  fileSize: number;
  mimeType: string;
  status: DocumentStatus;
  ocrText: string | null;
  ocrConfidence: number | null;
  extractedData: Record<string, any> | null;
  metadata: Record<string, any> | null;
  processingError: string | null;
  uploadedBy: string;
  orgId: string;
  createdAt: string;
  updatedAt: string;
  processedAt: string | null;
}

/**
 * Document Upload Response
 */
export interface DocumentUploadResponse {
  document: Document;
  message: string;
}

/**
 * Document List Response
 */
export interface DocumentListResponse {
  documents: Document[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

/**
 * Document Upload Progress
 */
export interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  document?: Document;
}

/**
 * Document Filter Options
 */
export interface DocumentFilters {
  status?: DocumentStatus;
  mimeType?: string;
  uploadedBy?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Document Stats
 */
export interface DocumentStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  totalSize: number;
}

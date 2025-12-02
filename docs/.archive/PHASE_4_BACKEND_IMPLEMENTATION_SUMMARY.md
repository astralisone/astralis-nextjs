# Phase 4: Backend Implementation Summary

## Overview

This document summarizes the backend services and API endpoints implemented for Phase 4 (Document Processing & OCR). All components follow Astralis brand patterns and are ready for integration once the Document model is added to the Prisma schema.

---

## Files Created

### 1. File Validation Utilities
**Path**: `/src/lib/utils/file-validation.ts`

**Purpose**: Secure file validation for uploads

**Key Functions**:
- `validateFile()` - Comprehensive file validation (size, MIME type, security checks)
- `validateFileSize()` - Check file size against limits
- `validateMimeType()` - Validate MIME type against allowed list
- `detectMimeType()` - Detect MIME type from file buffer using magic numbers
- `getMimeTypeFromExtension()` - Get MIME type from file extension
- `formatFileSize()` - Format bytes to human-readable string
- `isImage()` - Check if file is an image
- `isPDF()` - Check if file is a PDF
- `supportsOCR()` - Check if file type supports OCR

**Security Features**:
- Magic number validation to prevent MIME type spoofing
- File size limits (default 50MB)
- Suspicious filename pattern detection
- Cross-validation of declared vs. detected MIME types

**Allowed File Types**:
- Images: JPEG, PNG, GIF, WebP, BMP, TIFF
- PDFs: application/pdf
- Microsoft Office: .doc, .docx, .xls, .xlsx, .ppt, .pptx
- Text: .txt, .csv

---

### 2. Spaces Service (DigitalOcean Storage)
**Path**: `/src/lib/services/spaces.service.ts`

**Purpose**: File storage operations with DigitalOcean Spaces (S3-compatible)

**Key Methods**:
- `uploadFile()` - Upload file to Spaces with automatic path generation
- `downloadFile()` - Download file as Buffer
- `deleteFile()` - Delete file from Spaces
- `getFileMetadata()` - Get file metadata (size, type, last modified)
- `getSignedUrl()` - Generate pre-signed URL for temporary access
- `copyFile()` - Copy file to new location
- `fileExists()` - Check if file exists
- `uploadThumbnail()` - Convenience method for thumbnail uploads

**Features**:
- Organization-based folder structure (`org-{orgId}/documents/`)
- Automatic filename sanitization and uniqueness (timestamp + random hash)
- CDN URL generation for fast access
- Private ACL with signed URLs for secure access
- Metadata tagging (original name, org ID, upload timestamp)

**Configuration**:
- Requires `SPACES_ACCESS_KEY`, `SPACES_SECRET_KEY`, `SPACES_ENDPOINT`, `SPACES_REGION`, `SPACES_BUCKET`
- Optional `SPACES_CDN_URL` for CDN acceleration

**Singleton Pattern**: Use `getSpacesService()` to get instance

---

### 3. OCR Service (Tesseract.js)
**Path**: `/src/lib/services/ocr.service.ts`

**Purpose**: Text extraction from images and PDFs using Tesseract OCR

**Key Methods**:
- `extractTextFromImage()` - Extract text from image with preprocessing
- `extractTextFromPDF()` - Extract text from PDF (placeholder for future implementation)
- `extractText()` - Auto-detect file type and extract text
- `validateOCRResult()` - Validate OCR quality and confidence
- `getSupportedLanguages()` - Get list of supported OCR languages
- `detectLanguage()` - Basic language detection from text

**Preprocessing Options**:
- `enhanceContrast` - Normalize image contrast (default: true)
- `grayscale` - Convert to grayscale (default: true)
- `sharpen` - Apply sharpening filter (default: true)
- `resize` - Resize for optimal OCR (default: true, target: 2000px width)

**OCR Result**:
```typescript
{
  text: string,           // Extracted text
  confidence: number,     // Confidence score (0-1)
  language: string,       // OCR language used
  wordCount: number,      // Number of words detected
  processingTime: number  // Processing time in ms
}
```

**Supported Languages**: English, Spanish, French, German, Italian, Portuguese, Russian, Chinese, Japanese, Korean, Arabic, Hindi

**Singleton Pattern**: Use `getOCRService()` to get instance

---

### 4. Vision Service (GPT-4 Vision)
**Path**: `/src/lib/services/vision.service.ts`

**Purpose**: Structured data extraction from document images using GPT-4 Vision

**Key Methods**:
- `extractStructuredData()` - Extract structured data based on document type
- `detectDocumentType()` - Auto-detect document type from image
- `extractField()` - Extract specific field from document

**Document Types Supported**:
- `INVOICE` - Extracts invoice number, dates, vendor, customer, items, amounts
- `RECEIPT` - Extracts merchant, items, amounts, payment method
- `FORM` - Extracts form fields and values
- `CONTRACT` - Extracts parties, dates, terms, signatures
- `IDENTITY` - Extracts ID card/passport information
- `BUSINESS_CARD` - Extracts contact information
- `GENERIC` - General document information extraction

**Extraction Result**:
```typescript
{
  type: DocumentType,           // Detected document type
  data: Record<string, any>,    // Extracted structured data
  confidence: number,           // Extraction confidence (0-1)
  model: string,                // Model used (gpt-4-vision-preview)
  processingTime: number        // Processing time in ms
}
```

**Example Extracted Data (Invoice)**:
```json
{
  "invoice_number": "INV-001",
  "invoice_date": "2024-01-15",
  "vendor_name": "Acme Corp",
  "total": 1500.00,
  "currency": "USD",
  "items": [
    { "description": "Widget A", "quantity": 10, "unit_price": 100, "total": 1000 }
  ]
}
```

**Configuration**:
- Requires `OPENAI_API_KEY`
- Optional `OPENAI_ORG_ID`

**Singleton Pattern**: Use `getVisionService()` to get instance

---

### 5. Document Validation Schemas
**Path**: `/src/lib/validators/document.validators.ts`

**Purpose**: Zod schemas for validating all document-related operations

**Schemas**:
- `FileUploadSchema` - File upload validation
- `CreateDocumentSchema` - Document creation
- `UpdateDocumentSchema` - Document updates
- `DocumentFiltersSchema` - Query filters for listing
- `DocumentProcessingOptionsSchema` - Processing options (OCR, vision)
- `OCRRequestSchema` - OCR job request
- `VisionExtractionRequestSchema` - Vision extraction request
- `BulkDocumentOperationSchema` - Bulk operations
- `DocumentDownloadSchema` - Download request

**TypeScript Type Exports**:
All schemas have corresponding TypeScript type exports for use in services and API routes.

---

### 6. Document Service
**Path**: `/src/lib/services/document.service.ts`

**Purpose**: Business logic for document CRUD operations

**Key Methods**:
- `uploadDocument()` - Upload file and create document record
- `getDocument()` - Get document by ID with org isolation
- `listDocuments()` - List documents with filters and pagination
- `updateDocument()` - Update document metadata
- `deleteDocument()` - Delete document and files
- `downloadDocument()` - Download document file
- `generateThumbnail()` - Generate thumbnail from image
- `processOCR()` - Process document with OCR
- `extractStructuredData()` - Extract structured data with GPT-4 Vision

**Features**:
- Organization-level isolation (users only access their org's documents)
- Automatic thumbnail generation for images
- Background job queueing (ready for BullMQ integration)
- Comprehensive error handling
- Activity logging (ready for ActivityLog integration)

**Important Notes**:
- All database operations are commented out with placeholder implementations
- Methods throw error: "Document model not yet implemented in Prisma schema"
- Ready to uncomment once Document model is added to schema

**Singleton Pattern**: Use `getDocumentService()` to get instance

---

## API Endpoints

### 1. File Upload Endpoint
**Path**: `/src/app/api/documents/upload/route.ts`

**POST /api/documents/upload**

**Purpose**: Upload document file to DigitalOcean Spaces and create database record

**Authentication**: Required (NextAuth session)

**Authorization**: All authenticated users can upload to their organization

**Request**: `multipart/form-data`
- `file`: File (required)
- `performOCR`: boolean (optional, default: true)
- `performVisionExtraction`: boolean (optional, default: false)
- `documentType`: string (optional, for vision extraction)
- `language`: string (optional, default: 'eng')
- `generateThumbnail`: boolean (optional, default: true)

**Response**: 201 Created
```json
{
  "success": true,
  "document": {
    "id": "clxxx...",
    "fileName": "invoice-1234567890-a1b2c3d4.pdf",
    "originalName": "invoice.pdf",
    "cdnUrl": "https://astralis-documents.nyc3.cdn.digitaloceanspaces.com/org-xxx/documents/...",
    "fileSize": 1024000,
    "mimeType": "application/pdf",
    "status": "PENDING",
    "createdAt": "2024-01-15T10:00:00Z"
  },
  "message": "Document uploaded successfully"
}
```

**Error Codes**:
- `401` - Not authenticated
- `400` - Invalid file or validation failed
- `413` - File too large
- `501` - Document model not yet implemented
- `500` - Upload or processing error

**GET /api/documents/upload**

**Purpose**: Get upload configuration and limits

**Response**: 200 OK
```json
{
  "maxFileSize": 52428800,
  "maxFileSizeMB": "50.00",
  "allowedTypes": ["image/*", "application/pdf", ...],
  "features": {
    "ocr": true,
    "visionExtraction": true,
    "thumbnails": true
  }
}
```

---

### 2. Document List Endpoint
**Path**: `/src/app/api/documents/route.ts`

**GET /api/documents**

**Purpose**: List documents with filtering, search, and pagination

**Authentication**: Required

**Authorization**: Users only see documents from their organization

**Query Parameters**:
- `status`: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' (optional)
- `mimeType`: Filter by MIME type (optional)
- `uploadedBy`: Filter by uploader user ID (optional)
- `search`: Search in filenames and OCR text (optional)
- `startDate`: Filter by creation date (ISO format) (optional)
- `endDate`: Filter by creation date (ISO format) (optional)
- `limit`: Results per page (default: 50, max: 100) (optional)
- `offset`: Pagination offset (default: 0) (optional)

**Response**: 200 OK
```json
{
  "documents": [
    {
      "id": "clxxx...",
      "fileName": "invoice-1234567890-a1b2c3d4.pdf",
      "originalName": "invoice.pdf",
      "cdnUrl": "https://...",
      "thumbnailUrl": "https://...",
      "fileSize": 1024000,
      "mimeType": "application/pdf",
      "status": "COMPLETED",
      "ocrText": "INVOICE\nInvoice #: INV-001...",
      "ocrConfidence": 0.95,
      "extractedData": { "invoice_number": "INV-001", ... },
      "createdAt": "2024-01-15T10:00:00Z",
      "processedAt": "2024-01-15T10:05:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

**DELETE /api/documents (Bulk)**

**Purpose**: Delete multiple documents at once

**Request Body**:
```json
{
  "documentIds": ["clxxx...", "clyyy..."]
}
```

**Response**: 200 OK
```json
{
  "success": true,
  "deletedCount": 2,
  "errors": []
}
```

---

### 3. Single Document Endpoint
**Path**: `/src/app/api/documents/[id]/route.ts`

**GET /api/documents/[id]**

**Purpose**: Get single document by ID

**Authentication**: Required

**Authorization**: Organization-level isolation

**Response**: 200 OK
```json
{
  "document": {
    "id": "clxxx...",
    "fileName": "invoice-1234567890-a1b2c3d4.pdf",
    "originalName": "invoice.pdf",
    "cdnUrl": "https://...",
    "thumbnailUrl": "https://...",
    "fileSize": 1024000,
    "mimeType": "application/pdf",
    "status": "COMPLETED",
    "ocrText": "Full OCR text...",
    "ocrConfidence": 0.95,
    "extractedData": { ... },
    "metadata": { ... },
    "uploadedBy": "cluser123",
    "createdAt": "2024-01-15T10:00:00Z",
    "processedAt": "2024-01-15T10:05:00Z"
  }
}
```

**PATCH /api/documents/[id]**

**Purpose**: Update document metadata

**Request Body**:
```json
{
  "status": "COMPLETED",
  "ocrText": "Updated text...",
  "ocrConfidence": 0.95,
  "extractedData": { ... },
  "processedAt": "2024-01-15T10:05:00Z"
}
```

**DELETE /api/documents/[id]**

**Purpose**: Delete single document (file + database record)

**Response**: 200 OK
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

---

### 4. Document Download Endpoint
**Path**: `/src/app/api/documents/[id]/download/route.ts`

**GET /api/documents/[id]/download**

**Purpose**: Download document file

**Authentication**: Required

**Authorization**: Organization-level isolation

**Query Parameters**:
- `disposition`: 'inline' | 'attachment' (default: 'attachment')

**Response**: 200 OK (file stream)
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="invoice.pdf"
Content-Length: 1024000
Cache-Control: private, max-age=3600

[Binary file data]
```

**HEAD /api/documents/[id]/download**

**Purpose**: Get document metadata without downloading file

**Response**: 200 OK
```
Content-Type: application/pdf
Content-Length: 1024000
Last-Modified: Mon, 15 Jan 2024 10:00:00 GMT
```

---

## Integration Points

### 1. Prisma Schema (REQUIRED)

Add the Document model to `/prisma/schema.prisma`:

```prisma
model Document {
  id              String         @id @default(cuid())
  fileName        String
  originalName    String
  filePath        String
  cdnUrl          String?
  thumbnailUrl    String?
  fileSize        Int
  mimeType        String
  status          DocumentStatus @default(PENDING)
  ocrText         String?        @db.Text
  ocrConfidence   Float?
  extractedData   Json?
  metadata        Json?
  processingError String?        @db.Text
  uploadedBy      String
  orgId           String
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  processedAt     DateTime?

  organization Organization @relation(fields: [orgId], references: [id])

  @@index([orgId])
  @@index([status])
  @@index([uploadedBy])
  @@index([createdAt])
  @@index([processedAt])
  @@index([mimeType])
}

enum DocumentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}
```

Then run:
```bash
npx prisma migrate dev --name add-document-model
npx prisma generate
```

### 2. Environment Variables

Add to `.env.local`:

```bash
# ===== DIGITALOCEAN SPACES (Phase 4) =====
SPACES_ACCESS_KEY="DO00ABCDEFGHIJKLMNOP"
SPACES_SECRET_KEY="your-spaces-secret-key-64-chars-long"
SPACES_ENDPOINT="nyc3.digitaloceanspaces.com"
SPACES_REGION="nyc3"
SPACES_BUCKET="astralis-documents"
SPACES_CDN_URL="https://astralis-documents.nyc3.cdn.digitaloceanspaces.com"

# File upload limits
MAX_FILE_SIZE="52428800"  # 50MB
ALLOWED_FILE_TYPES="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"

# ===== OPENAI (For Vision Extraction) =====
OPENAI_API_KEY="sk-proj-your-openai-api-key"
OPENAI_ORG_ID="org-your-openai-org-id"  # Optional
```

### 3. Dependencies

Install required packages:

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npm install tesseract.js
npm install sharp
npm install pdf-parse
npm install file-type
npm install sanitize-filename
npm install react-dropzone  # For UI component
```

### 4. Document Service Activation

Uncomment database operations in `/src/lib/services/document.service.ts`:

1. Search for `// NOTE: Requires Document model`
2. Uncomment all `prisma.document.*` operations
3. Remove placeholder return statements
4. Test all methods

### 5. Background Job Queue (Future)

When BullMQ is set up (Phase 3), create job queues:

- `document-processing.queue.ts` - Queue for OCR and vision jobs
- `ocr.processor.ts` - Worker for OCR processing
- `data-extraction.processor.ts` - Worker for vision extraction

### 6. Activity Logging

Uncomment activity log entries in API routes:

Search for `// TODO: Add activity log` and uncomment `prisma.activityLog.create()` calls.

---

## Security Considerations

### 1. File Validation
- Magic number validation prevents MIME type spoofing
- File size limits prevent DOS attacks
- Suspicious filename pattern detection
- Allowed file types whitelist

### 2. Access Control
- Organization-level isolation enforced in all operations
- Session-based authentication required
- Users can only access documents from their organization

### 3. Storage Security
- Private ACL on Spaces (files not publicly accessible)
- Pre-signed URLs for temporary access
- CDN caching with appropriate headers

### 4. Input Validation
- All inputs validated with Zod schemas
- Filename sanitization prevents path traversal
- Buffer validation before processing

### 5. Error Handling
- No sensitive information in error messages
- Failed uploads don't leave orphaned files
- Transaction safety for database operations

---

## Testing Checklist

### Unit Tests (TODO)
- [ ] File validation utilities
- [ ] Spaces service upload/download/delete
- [ ] OCR service text extraction
- [ ] Vision service data extraction
- [ ] Document service CRUD operations

### Integration Tests (TODO)
- [ ] File upload flow (file → Spaces → database)
- [ ] Document list with filters
- [ ] Document download with signed URLs
- [ ] Bulk delete operations
- [ ] OCR processing pipeline
- [ ] Vision extraction pipeline

### Manual Tests
- [ ] Upload various file types (images, PDFs, Office docs)
- [ ] Verify file size limits enforced
- [ ] Verify MIME type validation
- [ ] Test organization isolation
- [ ] Download files with inline/attachment disposition
- [ ] Test OCR on scanned documents
- [ ] Test vision extraction on invoices/receipts

---

## Performance Considerations

### 1. File Upload
- Stream large files instead of loading into memory (future optimization)
- Generate thumbnails asynchronously (ready for background jobs)
- Use CDN for fast file access

### 2. OCR Processing
- Image preprocessing improves accuracy
- Process in background worker (Phase 3)
- Cache OCR results in database

### 3. Vision Extraction
- Process in background worker (Phase 3)
- Rate limit OpenAI API calls
- Cache extraction results

### 4. Database Queries
- Indexes on orgId, status, createdAt, mimeType
- Pagination for large result sets
- Full-text search on ocrText (future: use PostgreSQL full-text search)

---

## Next Steps

### Immediate (Required)
1. Add Document model to Prisma schema
2. Run database migration
3. Set up DigitalOcean Spaces bucket and CDN
4. Add environment variables
5. Install dependencies
6. Uncomment database operations in document.service.ts
7. Test file upload flow

### Phase 3 Integration (Background Jobs)
1. Create document-processing queue
2. Create OCR processor
3. Create vision extraction processor
4. Queue jobs on upload
5. Update document status on completion

### Phase 2 Integration (UI)
1. Create DocumentUploader component (drag-and-drop)
2. Create DocumentQueue table component
3. Create DocumentViewer component
4. Create OCROverlay component
5. Add document management pages

### Future Enhancements
1. PDF page rendering for OCR
2. Batch processing optimizations
3. Webhook notifications on completion
4. Document versioning
5. Document sharing/permissions
6. Advanced search (full-text, filters)
7. Document templates and auto-classification

---

## Summary

All Phase 4 backend components are complete and ready for integration:

**Services Implemented**:
- File Validation (security, MIME type detection)
- Spaces Service (DigitalOcean storage operations)
- OCR Service (Tesseract.js text extraction)
- Vision Service (GPT-4 Vision structured data extraction)
- Document Service (business logic)

**API Endpoints Implemented**:
- POST /api/documents/upload (file upload)
- GET /api/documents/upload (config)
- GET /api/documents (list with filters)
- DELETE /api/documents (bulk delete)
- GET /api/documents/[id] (get single)
- PATCH /api/documents/[id] (update)
- DELETE /api/documents/[id] (delete single)
- GET /api/documents/[id]/download (download file)
- HEAD /api/documents/[id]/download (metadata)

**Validation Schemas**: All operations validated with Zod

**Status**: Ready for integration once Document model is added to Prisma schema

**No Database Writes**: All database operations are commented out per requirements. System will return 501 status code until migration is complete.

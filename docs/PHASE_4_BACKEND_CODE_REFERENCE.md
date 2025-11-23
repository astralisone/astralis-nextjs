# Phase 4 Backend - Code Reference Guide

Quick reference for using the Phase 4 document processing backend services.

---

## Service Imports

```typescript
// File storage (DigitalOcean Spaces)
import { getSpacesService } from '@/lib/services/spaces.service';

// Text extraction (Tesseract OCR)
import { getOCRService } from '@/lib/services/ocr.service';

// Structured extraction (GPT-4 Vision)
import { getVisionService, DocumentType } from '@/lib/services/vision.service';

// Business logic (CRUD operations)
import { getDocumentService } from '@/lib/services/document.service';

// Validation utilities
import {
  validateFile,
  formatFileSize,
  supportsOCR
} from '@/lib/utils/file-validation';

// Zod schemas
import {
  FileUploadSchema,
  DocumentFiltersSchema,
  UpdateDocumentSchema
} from '@/lib/validators/document.validators';
```

---

## Common Usage Patterns

### 1. Upload File to Spaces

```typescript
const spacesService = getSpacesService();

const result = await spacesService.uploadFile(
  fileBuffer,       // Buffer
  'invoice.pdf',    // Original filename
  'application/pdf',// MIME type
  orgId,            // Organization ID
  'documents'       // Folder (optional)
);

// Returns:
// {
//   fileName: 'invoice-1234567890-a1b2c3d4.pdf',
//   filePath: 'org-xxx/documents/invoice-1234567890-a1b2c3d4.pdf',
//   cdnUrl: 'https://astralis-documents.nyc3.cdn.digitaloceanspaces.com/org-xxx/documents/...',
//   fileSize: 1024000
// }
```

### 2. Extract Text with OCR

```typescript
const ocrService = getOCRService();

const result = await ocrService.extractText(
  fileBuffer,        // Buffer
  'image/jpeg',      // MIME type
  'eng'              // Language (optional, default: 'eng')
);

// Returns:
// {
//   text: 'Extracted text content...',
//   confidence: 0.95,
//   language: 'eng',
//   wordCount: 450,
//   processingTime: 3500
// }
```

### 3. Extract Structured Data with Vision

```typescript
const visionService = getVisionService();

const result = await visionService.extractStructuredData(
  imageBuffer,            // Buffer
  'image/jpeg',          // MIME type
  DocumentType.INVOICE   // Document type
);

// Returns:
// {
//   type: 'invoice',
//   data: {
//     invoice_number: 'INV-001',
//     invoice_date: '2024-01-15',
//     vendor_name: 'Acme Corp',
//     total: 1500.00,
//     items: [...]
//   },
//   confidence: 0.92,
//   model: 'gpt-4-vision-preview',
//   processingTime: 2000
// }
```

### 4. Complete Document Upload Flow

```typescript
const documentService = getDocumentService();

// Upload document (file + database record + background processing)
const document = await documentService.uploadDocument(
  fileBuffer,
  filename,
  mimeType,
  userId,
  orgId,
  {
    performOCR: true,
    performVisionExtraction: false,
    generateThumbnail: true,
    language: 'eng'
  }
);

// Document created with status 'PENDING'
// Background jobs will process OCR/vision (when Phase 3 integrated)
```

### 5. List Documents with Filters

```typescript
const result = await documentService.listDocuments({
  orgId: 'clxxx...',
  status: 'COMPLETED',
  search: 'invoice',
  startDate: '2024-01-01T00:00:00Z',
  limit: '50',
  offset: '0'
});

// Returns:
// {
//   documents: [...],
//   pagination: {
//     total: 150,
//     limit: 50,
//     offset: 0,
//     hasMore: true
//   }
// }
```

---

## API Endpoint Examples

### Upload Document

```bash
curl -X POST http://localhost:3001/api/documents/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/invoice.pdf" \
  -F "performOCR=true" \
  -F "performVisionExtraction=false" \
  -F "generateThumbnail=true" \
  -F "language=eng"
```

### List Documents

```bash
curl "http://localhost:3001/api/documents?orgId=xxx&status=COMPLETED&limit=50" \
  -H "Authorization: Bearer <token>"
```

### Get Single Document

```bash
curl http://localhost:3001/api/documents/clxxx... \
  -H "Authorization: Bearer <token>"
```

### Download Document

```bash
curl http://localhost:3001/api/documents/clxxx.../download \
  -H "Authorization: Bearer <token>" \
  -o downloaded-file.pdf
```

### Delete Document

```bash
curl -X DELETE http://localhost:3001/api/documents/clxxx... \
  -H "Authorization: Bearer <token>"
```

---

## Validation Examples

### File Validation

```typescript
import { validateFile } from '@/lib/utils/file-validation';

const validation = await validateFile(
  fileBuffer,
  'invoice.pdf',
  'application/pdf'
);

if (!validation.valid) {
  throw new Error(validation.error);
}

// Use detected MIME type
const safeMimeType = validation.detectedMimeType || declaredMimeType;
```

### Schema Validation

```typescript
import { FileUploadSchema } from '@/lib/validators/document.validators';

const parsed = FileUploadSchema.safeParse({
  file: buffer,
  filename: 'invoice.pdf',
  mimeType: 'application/pdf',
  fileSize: buffer.length,
  orgId: 'clxxx...'
});

if (!parsed.success) {
  console.error('Validation errors:', parsed.error.flatten());
  throw new Error('Invalid file upload');
}
```

---

## Configuration Reference

### Environment Variables

```bash
# DigitalOcean Spaces
SPACES_ACCESS_KEY="DO00ABCDEFGHIJKLMNOP"
SPACES_SECRET_KEY="your-secret-key"
SPACES_ENDPOINT="nyc3.digitaloceanspaces.com"
SPACES_REGION="nyc3"
SPACES_BUCKET="astralis-documents"
SPACES_CDN_URL="https://astralis-documents.nyc3.cdn.digitaloceanspaces.com"

# File Limits
MAX_FILE_SIZE="52428800"  # 50MB

# OpenAI (Vision)
OPENAI_API_KEY="sk-proj-..."
```

### Supported File Types

**Images**: JPEG, PNG, GIF, WebP, BMP, TIFF  
**Documents**: PDF  
**Office**: DOC, DOCX, XLS, XLSX, PPT, PPTX  
**Text**: TXT, CSV

### OCR Languages

English (eng), Spanish (spa), French (fra), German (deu), Italian (ita), Portuguese (por), Russian (rus), Chinese (chi_sim, chi_tra), Japanese (jpn), Korean (kor), Arabic (ara), Hindi (hin)

### Document Types (Vision)

- `DocumentType.INVOICE` - Invoices
- `DocumentType.RECEIPT` - Receipts
- `DocumentType.FORM` - Forms
- `DocumentType.CONTRACT` - Contracts
- `DocumentType.IDENTITY` - ID cards
- `DocumentType.BUSINESS_CARD` - Business cards
- `DocumentType.GENERIC` - Generic documents

---

## Error Handling

```typescript
try {
  const document = await documentService.uploadDocument(...);
} catch (error) {
  if (error instanceof Error) {
    // Check specific errors
    if (error.message.includes('File size exceeds')) {
      // Handle file too large
    } else if (error.message.includes('not allowed')) {
      // Handle invalid file type
    } else if (error.message.includes('Document model not yet implemented')) {
      // Database schema not migrated yet
      return res.status(501).json({
        error: 'Feature not available',
        details: 'Database migration required'
      });
    }
  }
}
```

---

## Response Status Codes

- `200` - Success
- `201` - Created (upload success)
- `400` - Bad Request (validation failed)
- `401` - Unauthorized (not authenticated)
- `404` - Not Found (document not found)
- `413` - Payload Too Large (file too big)
- `501` - Not Implemented (schema not migrated)
- `500` - Internal Server Error

---

## File Structure

```
src/
├── lib/
│   ├── services/
│   │   ├── spaces.service.ts        # DigitalOcean Spaces
│   │   ├── ocr.service.ts           # Tesseract OCR
│   │   ├── vision.service.ts        # GPT-4 Vision
│   │   └── document.service.ts      # Business logic
│   ├── validators/
│   │   └── document.validators.ts   # Zod schemas
│   └── utils/
│       └── file-validation.ts       # Security validation
└── app/api/documents/
    ├── upload/route.ts              # Upload endpoint
    ├── route.ts                     # List/bulk delete
    ├── [id]/route.ts                # CRUD single document
    └── [id]/download/route.ts       # Download file
```

---

## Next Steps

1. **Add Document Model** to Prisma schema
2. **Run Migration**: `npx prisma migrate dev --name add-document-model`
3. **Uncomment DB Operations** in `document.service.ts`
4. **Set Up Spaces** in DigitalOcean
5. **Add Env Variables** to `.env.local`
6. **Install Dependencies**: `npm install @aws-sdk/client-s3 tesseract.js sharp file-type sanitize-filename`
7. **Test Upload** via API endpoint

---

## Full Documentation

- Implementation Summary: `docs/PHASE_4_BACKEND_IMPLEMENTATION_SUMMARY.md`
- Infrastructure Setup: `docs/PHASE_4_QUICK_REFERENCE.md`
- Phase Specification: `docs/phases/phase-4-document-processing-ocr.md`

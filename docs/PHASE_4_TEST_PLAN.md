# Phase 4: Document Processing & OCR - Test Plan

**Version**: 1.0  
**Date**: 2025-11-20  
**Phase**: Document Processing & OCR  
**Status**: Ready for Implementation

---

## Table of Contents

1. [Test Strategy Overview](#test-strategy-overview)
2. [Unit Tests](#unit-tests)
3. [Integration Tests](#integration-tests)
4. [API Tests](#api-tests)
5. [UI Tests](#ui-tests)
6. [Performance Tests](#performance-tests)
7. [Security Tests](#security-tests)
8. [Test Data & Fixtures](#test-data--fixtures)
9. [Test Execution Plan](#test-execution-plan)
10. [Success Criteria](#success-criteria)

---

## Test Strategy Overview

### Objectives

- Verify file upload, storage, and retrieval functionality
- Validate OCR accuracy for images and PDFs
- Ensure GPT-4 Vision data extraction works correctly
- Confirm document status workflow transitions
- Test error handling and retry mechanisms
- Validate security controls and access restrictions
- Measure performance under load

### Test Pyramid

```
       /\
      /  \  E2E UI Tests (10%)
     /----\
    / Inte-\  Integration Tests (30%)
   / gration\
  /----------\
 /   Unit     \ Unit Tests (60%)
/--------------\
```

### Test Environment

- **Local Development**: localhost:3001
- **Test Database**: PostgreSQL (separate test DB)
- **Test Object Storage**: DigitalOcean Spaces test bucket
- **CI/CD**: GitHub Actions
- **Tools**: Jest, React Testing Library, Supertest, Playwright

### Coverage Targets

- **Unit Tests**: 80% code coverage
- **Integration Tests**: All critical paths
- **API Tests**: 100% endpoint coverage
- **UI Tests**: Core user journeys
- **Performance**: Baseline metrics established

---

## Unit Tests

### 1. Spaces Service Tests

**File**: `src/lib/services/__tests__/spaces.service.test.ts`

#### Test Suite: SpacesService

**TC-UNIT-001: Upload File - Success**
- **Description**: Successfully upload file to Spaces
- **Setup**: Mock S3Client, create test buffer
- **Input**: 1MB image buffer, "test.png", "image/png", "org-123"
- **Expected**:
  - `uploadFile()` returns object with fileName, filePath, cdnUrl, fileSize
  - File path format: `org-123/documents/test-{timestamp}-{random}.png`
  - CDN URL includes Spaces endpoint
  - S3 PutObjectCommand called with correct parameters
- **Assertions**:
  ```typescript
  expect(result.fileName).toMatch(/^test-\d+-[a-f0-9]{16}\.png$/);
  expect(result.filePath).toBe('org-123/documents/test-1234567890-abc123.png');
  expect(result.cdnUrl).toContain('digitaloceanspaces.com');
  expect(result.fileSize).toBe(1048576);
  expect(mockS3Send).toHaveBeenCalledTimes(1);
  ```

**TC-UNIT-002: Upload File - Missing Credentials**
- **Description**: Throw error if Spaces credentials not configured
- **Setup**: Clear env vars SPACES_ACCESS_KEY and SPACES_SECRET_KEY
- **Input**: Valid file buffer
- **Expected**: Constructor throws "Spaces credentials not configured"
- **Assertions**:
  ```typescript
  expect(() => new SpacesService()).toThrow('Spaces credentials not configured');
  ```

**TC-UNIT-003: Download File - Success**
- **Description**: Successfully download file from Spaces
- **Setup**: Mock GetObjectCommand response
- **Input**: "org-123/documents/test.png"
- **Expected**: Returns Buffer containing file data
- **Assertions**:
  ```typescript
  expect(result).toBeInstanceOf(Buffer);
  expect(result.length).toBeGreaterThan(0);
  ```

**TC-UNIT-004: Download File - Not Found**
- **Description**: Handle file not found error
- **Setup**: Mock S3 NoSuchKey error
- **Input**: "org-123/documents/nonexistent.png"
- **Expected**: Throws error with message containing "Failed to download file"
- **Assertions**:
  ```typescript
  await expect(service.downloadFile('nonexistent.png')).rejects.toThrow('Failed to download file');
  ```

**TC-UNIT-005: Delete File - Success**
- **Description**: Successfully delete file from Spaces
- **Setup**: Mock DeleteObjectCommand
- **Input**: "org-123/documents/test.png"
- **Expected**: Completes without error
- **Assertions**:
  ```typescript
  await expect(service.deleteFile(filePath)).resolves.not.toThrow();
  expect(mockS3Send).toHaveBeenCalledWith(expect.any(DeleteObjectCommand));
  ```

**TC-UNIT-006: Generate Filename - Unique**
- **Description**: Generated filenames are unique
- **Setup**: Call generateFilename multiple times
- **Input**: "test.pdf"
- **Expected**: Each filename is unique with timestamp and random hex
- **Assertions**:
  ```typescript
  const name1 = service['generateFilename']('org-123', 'test.pdf');
  const name2 = service['generateFilename']('org-123', 'test.pdf');
  expect(name1).not.toBe(name2);
  expect(name1).toMatch(/^test-\d+-[a-f0-9]{16}\.pdf$/);
  ```

**TC-UNIT-007: Get CDN URL**
- **Description**: Generate correct CDN URL
- **Setup**: Set SPACES_CDN_URL env var
- **Input**: "org-123/documents/test.png"
- **Expected**: Returns URL with CDN domain
- **Assertions**:
  ```typescript
  expect(url).toBe('https://astralis-documents.nyc3.cdn.digitaloceanspaces.com/org-123/documents/test.png');
  ```

---

### 2. File Validation Tests

**File**: `src/lib/utils/__tests__/file-validation.test.ts`

#### Test Suite: validateFile

**TC-UNIT-101: Validate File - Valid Image**
- **Description**: Accept valid PNG image
- **Setup**: Load test PNG buffer
- **Input**: PNG buffer, "test.png", "image/png"
- **Expected**: `{ valid: true, mimeType: 'image/png' }`
- **Assertions**:
  ```typescript
  const result = await validateFile(buffer, 'test.png', 'image/png');
  expect(result.valid).toBe(true);
  expect(result.mimeType).toBe('image/png');
  expect(result.error).toBeUndefined();
  ```

**TC-UNIT-102: Validate File - Size Too Large**
- **Description**: Reject file exceeding 50MB limit
- **Setup**: Create 51MB buffer
- **Input**: 51MB buffer, "large.pdf"
- **Expected**: `{ valid: false, error: 'File size exceeds maximum...' }`
- **Assertions**:
  ```typescript
  const result = await validateFile(buffer, 'large.pdf');
  expect(result.valid).toBe(false);
  expect(result.error).toContain('File size exceeds maximum');
  ```

**TC-UNIT-103: Validate File - Size Too Small**
- **Description**: Reject file smaller than 1KB
- **Setup**: Create 512-byte buffer
- **Input**: 512-byte buffer, "tiny.txt"
- **Expected**: `{ valid: false, error: 'File size too small...' }`
- **Assertions**:
  ```typescript
  expect(result.valid).toBe(false);
  expect(result.error).toBe('File size too small (minimum 1KB)');
  ```

**TC-UNIT-104: Validate File - Invalid Type**
- **Description**: Reject executable files
- **Setup**: Create EXE file buffer
- **Input**: EXE buffer, "malware.exe", "application/x-msdownload"
- **Expected**: `{ valid: false, error: 'File type ... is not allowed' }`
- **Assertions**:
  ```typescript
  expect(result.valid).toBe(false);
  expect(result.error).toContain('is not allowed');
  ```

**TC-UNIT-105: Validate File - MIME Type Mismatch**
- **Description**: Reject file with spoofed MIME type
- **Setup**: Create PNG buffer, declare as PDF
- **Input**: PNG buffer, "fake.pdf", "application/pdf"
- **Expected**: `{ valid: false, error: 'File type mismatch...' }`
- **Assertions**:
  ```typescript
  expect(result.valid).toBe(false);
  expect(result.error).toContain('File type mismatch');
  ```

**TC-UNIT-106: Validate File - Office Document Exception**
- **Description**: Accept DOCX detected as ZIP
- **Setup**: Create DOCX buffer (internally ZIP)
- **Input**: DOCX buffer, "doc.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
- **Expected**: `{ valid: true, mimeType: 'application/zip' }` (exception allowed)
- **Assertions**:
  ```typescript
  expect(result.valid).toBe(true);
  ```

**TC-UNIT-107: Validate File - Text File**
- **Description**: Accept plain text file
- **Setup**: Create text buffer
- **Input**: "Hello World" buffer, "test.txt", "text/plain"
- **Expected**: `{ valid: true, mimeType: 'text/plain' }`
- **Assertions**:
  ```typescript
  expect(result.valid).toBe(true);
  expect(result.mimeType).toBe('text/plain');
  ```

**TC-UNIT-108: isImage - Correct Detection**
- **Description**: Correctly identify image MIME types
- **Input**: Various MIME types
- **Expected**: Returns true only for image types
- **Assertions**:
  ```typescript
  expect(isImage('image/png')).toBe(true);
  expect(isImage('image/jpeg')).toBe(true);
  expect(isImage('application/pdf')).toBe(false);
  ```

**TC-UNIT-109: requiresOCR - Correct Detection**
- **Description**: Identify files requiring OCR
- **Input**: Various MIME types
- **Expected**: Returns true for images and PDFs
- **Assertions**:
  ```typescript
  expect(requiresOCR('image/png')).toBe(true);
  expect(requiresOCR('application/pdf')).toBe(true);
  expect(requiresOCR('text/plain')).toBe(false);
  ```

---

### 3. OCR Service Tests

**File**: `src/lib/services/__tests__/ocr.service.test.ts`

#### Test Suite: OCRService

**TC-UNIT-201: Extract Text - PNG Image**
- **Description**: Extract text from PNG with clear text
- **Setup**: Create PNG with "INVOICE #12345"
- **Input**: PNG buffer, "image/png"
- **Expected**: OCR extracts "INVOICE #12345", confidence > 0.8
- **Assertions**:
  ```typescript
  const result = await ocrService.extractText(buffer, 'image/png');
  expect(result.text).toContain('INVOICE');
  expect(result.confidence).toBeGreaterThan(0.8);
  ```

**TC-UNIT-202: Extract Text - PDF**
- **Description**: Extract text from PDF
- **Setup**: Create simple PDF with text
- **Input**: PDF buffer, "application/pdf"
- **Expected**: Extracted text matches PDF content
- **Assertions**:
  ```typescript
  const result = await ocrService.extractText(buffer, 'application/pdf');
  expect(result.text).toContain('Test Document');
  expect(result.confidence).toBe(1.0); // PDF extraction is deterministic
  ```

**TC-UNIT-203: Extract Text - Low Quality Image**
- **Description**: Handle low-quality scanned image
- **Setup**: Create blurry, low-resolution image
- **Input**: Low-quality PNG buffer
- **Expected**: Extracts text but lower confidence
- **Assertions**:
  ```typescript
  const result = await ocrService.extractText(buffer, 'image/png');
  expect(result.confidence).toBeGreaterThan(0.3);
  expect(result.confidence).toBeLessThan(0.7);
  ```

**TC-UNIT-204: Extract Text - Empty Image**
- **Description**: Handle image with no text
- **Setup**: Create blank white image
- **Input**: Blank PNG buffer
- **Expected**: Returns empty text, low confidence
- **Assertions**:
  ```typescript
  const result = await ocrService.extractText(buffer, 'image/png');
  expect(result.text.trim()).toBe('');
  expect(result.confidence).toBeLessThan(0.5);
  ```

**TC-UNIT-205: Generate Thumbnail - Success**
- **Description**: Generate thumbnail from image
- **Setup**: Create 2000x2000 PNG
- **Input**: Large PNG buffer, width=300, height=300
- **Expected**: Returns JPEG buffer, max dimensions 300x300
- **Assertions**:
  ```typescript
  const thumbnail = await ocrService.generateThumbnail(buffer, 300, 300);
  expect(thumbnail).toBeInstanceOf(Buffer);
  const metadata = await sharp(thumbnail).metadata();
  expect(metadata.width).toBeLessThanOrEqual(300);
  expect(metadata.height).toBeLessThanOrEqual(300);
  expect(metadata.format).toBe('jpeg');
  ```

**TC-UNIT-206: Preprocess Image - Enhancement**
- **Description**: Image preprocessing improves OCR
- **Setup**: Create low-contrast image
- **Input**: Low-contrast PNG
- **Expected**: Preprocessed image has better OCR results
- **Assertions**:
  ```typescript
  const originalOcr = await ocrService.extractText(originalBuffer, 'image/png');
  const preprocessed = await ocrService['preprocessImage'](originalBuffer);
  const enhancedOcr = await ocrService.extractText(preprocessed, 'image/png');
  expect(enhancedOcr.confidence).toBeGreaterThan(originalOcr.confidence);
  ```

**TC-UNIT-207: Extract Text - Unsupported Type**
- **Description**: Reject unsupported file type
- **Setup**: Pass text file
- **Input**: "text/plain" buffer
- **Expected**: Throws error
- **Assertions**:
  ```typescript
  await expect(ocrService.extractText(buffer, 'text/plain')).rejects.toThrow();
  ```

---

### 4. Document Service Tests

**File**: `src/lib/services/__tests__/document.service.test.ts`

#### Test Suite: DocumentService

**TC-UNIT-301: Upload Document - Success**
- **Description**: Successfully upload and create document record
- **Setup**: Mock Spaces, OCR, Prisma
- **Input**: PNG buffer, "invoice.png", "image/png", userId, orgId
- **Expected**: Document record created, job queued
- **Assertions**:
  ```typescript
  const doc = await documentService.uploadDocument(buffer, 'invoice.png', 'image/png', userId, orgId);
  expect(doc.id).toBeDefined();
  expect(doc.status).toBe('PENDING');
  expect(doc.mimeType).toBe('image/png');
  expect(mockPrisma.document.create).toHaveBeenCalled();
  expect(mockAddJob).toHaveBeenCalledWith('document-processing', { documentId: doc.id, orgId });
  ```

**TC-UNIT-302: Upload Document - Validation Failure**
- **Description**: Reject invalid file
- **Setup**: Mock validateFile to return invalid
- **Input**: Invalid buffer
- **Expected**: Throws validation error
- **Assertions**:
  ```typescript
  await expect(documentService.uploadDocument(buffer, 'file.exe', 'application/x-msdownload', userId, orgId))
    .rejects.toThrow('File validation failed');
  ```

**TC-UNIT-303: Upload Document - Thumbnail Generated**
- **Description**: Generate thumbnail for images
- **Setup**: Mock ocrService.generateThumbnail
- **Input**: PNG buffer
- **Expected**: thumbnailUrl set in document record
- **Assertions**:
  ```typescript
  const doc = await documentService.uploadDocument(buffer, 'image.png', 'image/png', userId, orgId);
  expect(doc.thumbnailUrl).toBeDefined();
  expect(doc.thumbnailUrl).toContain('/thumbnails/');
  ```

**TC-UNIT-304: Upload Document - Non-Image No Thumbnail**
- **Description**: Skip thumbnail for PDFs
- **Setup**: Upload PDF
- **Input**: PDF buffer
- **Expected**: thumbnailUrl is null
- **Assertions**:
  ```typescript
  const doc = await documentService.uploadDocument(buffer, 'doc.pdf', 'application/pdf', userId, orgId);
  expect(doc.thumbnailUrl).toBeNull();
  ```

**TC-UNIT-305: Upload Document - No OCR Needed**
- **Description**: Mark completed if no OCR required
- **Setup**: Upload text file
- **Input**: "text/plain" buffer
- **Expected**: Status immediately set to COMPLETED
- **Assertions**:
  ```typescript
  const doc = await documentService.uploadDocument(buffer, 'notes.txt', 'text/plain', userId, orgId);
  expect(doc.status).toBe('COMPLETED');
  expect(mockAddJob).not.toHaveBeenCalled();
  ```

**TC-UNIT-306: Get Documents - Pagination**
- **Description**: Retrieve documents with pagination
- **Setup**: Create 25 documents
- **Input**: orgId, page=2, limit=10
- **Expected**: Returns 10 documents (items 11-20)
- **Assertions**:
  ```typescript
  const result = await documentService.getDocuments(orgId, { page: 2, limit: 10 });
  expect(result.documents).toHaveLength(10);
  expect(result.total).toBe(25);
  expect(result.page).toBe(2);
  ```

**TC-UNIT-307: Get Documents - Filter by Status**
- **Description**: Filter documents by status
- **Setup**: Create documents with various statuses
- **Input**: orgId, { status: 'COMPLETED' }
- **Expected**: Returns only COMPLETED documents
- **Assertions**:
  ```typescript
  const result = await documentService.getDocuments(orgId, { status: 'COMPLETED' });
  expect(result.documents.every(d => d.status === 'COMPLETED')).toBe(true);
  ```

**TC-UNIT-308: Get Documents - Search**
- **Description**: Search documents by filename
- **Setup**: Create documents with various names
- **Input**: orgId, { search: 'invoice' }
- **Expected**: Returns documents with "invoice" in filename
- **Assertions**:
  ```typescript
  const result = await documentService.getDocuments(orgId, { search: 'invoice' });
  expect(result.documents.every(d => d.originalName.toLowerCase().includes('invoice'))).toBe(true);
  ```

**TC-UNIT-309: Delete Document - Success**
- **Description**: Delete document and file from Spaces
- **Setup**: Create document, mock Spaces delete
- **Input**: documentId, orgId
- **Expected**: Document deleted from DB and Spaces
- **Assertions**:
  ```typescript
  await documentService.deleteDocument(docId, orgId);
  expect(mockSpaces.deleteFile).toHaveBeenCalledWith(doc.filePath);
  expect(mockPrisma.document.delete).toHaveBeenCalledWith({ where: { id: docId } });
  ```

**TC-UNIT-310: Delete Document - Wrong Org**
- **Description**: Prevent cross-org deletion
- **Setup**: Create document for org-A
- **Input**: documentId, org-B
- **Expected**: Throws authorization error
- **Assertions**:
  ```typescript
  await expect(documentService.deleteDocument(docId, 'org-B')).rejects.toThrow('Not found');
  ```

---

## Integration Tests

### 5. End-to-End Upload Flow

**File**: `tests/integration/document-upload.test.ts`

**TC-INT-001: Complete Upload Flow - Image**
- **Description**: Upload image through complete pipeline
- **Setup**: Start test server, real Spaces test bucket, real DB
- **Steps**:
  1. POST /api/documents/upload with PNG file
  2. Verify document record created (status=PENDING)
  3. Verify file exists in Spaces
  4. Verify job queued in Redis
  5. Wait for worker to process
  6. Verify document status updated to COMPLETED
  7. Verify ocrText populated
  8. Verify thumbnail generated
- **Expected**: Document fully processed with OCR text
- **Assertions**:
  ```typescript
  const uploadRes = await request(app).post('/api/documents/upload')
    .attach('file', 'test/fixtures/invoice.png');
  expect(uploadRes.status).toBe(200);
  
  const doc = await prisma.document.findUnique({ where: { id: uploadRes.body.document.id } });
  expect(doc.status).toBe('PENDING');
  
  // Wait for processing
  await waitFor(() => doc.status === 'COMPLETED', { timeout: 30000 });
  
  const processed = await prisma.document.findUnique({ where: { id: doc.id } });
  expect(processed.status).toBe('COMPLETED');
  expect(processed.ocrText).toBeTruthy();
  expect(processed.thumbnailUrl).toBeTruthy();
  ```

**TC-INT-002: Complete Upload Flow - PDF**
- **Description**: Upload PDF through complete pipeline
- **Setup**: Start test server
- **Steps**:
  1. POST /api/documents/upload with PDF file
  2. Verify document created
  3. Wait for OCR processing
  4. Verify PDF text extracted
- **Expected**: PDF text successfully extracted
- **Assertions**:
  ```typescript
  const uploadRes = await request(app).post('/api/documents/upload')
    .attach('file', 'test/fixtures/sample.pdf');
  
  await waitFor(() => doc.status === 'COMPLETED');
  const processed = await prisma.document.findUnique({ where: { id: uploadRes.body.document.id } });
  expect(processed.ocrText).toContain('Expected Text from PDF');
  ```

**TC-INT-003: Upload with GPT-4 Vision Extraction**
- **Description**: Extract structured data from invoice image
- **Setup**: Mock OpenAI API
- **Steps**:
  1. Upload invoice image
  2. Trigger GPT-4 Vision extraction
  3. Verify structured data extracted
- **Expected**: Invoice data extracted (amount, date, vendor)
- **Assertions**:
  ```typescript
  const doc = await uploadDocument('invoice.png');
  await waitFor(() => doc.extractedData !== null);
  
  const processed = await prisma.document.findUnique({ where: { id: doc.id } });
  expect(processed.extractedData).toMatchObject({
    invoiceNumber: expect.any(String),
    totalAmount: expect.any(Number),
    vendorName: expect.any(String),
  });
  ```

**TC-INT-004: Error Handling - OCR Failure**
- **Description**: Handle OCR processing failure
- **Setup**: Upload corrupted image
- **Steps**:
  1. Upload corrupted image file
  2. Worker attempts OCR
  3. OCR fails
  4. Document status set to FAILED
- **Expected**: Document marked as FAILED with error message
- **Assertions**:
  ```typescript
  const uploadRes = await uploadDocument('corrupted.png');
  await waitFor(() => doc.status === 'FAILED', { timeout: 10000 });
  
  const failed = await prisma.document.findUnique({ where: { id: uploadRes.body.document.id } });
  expect(failed.status).toBe('FAILED');
  expect(failed.processingError).toBeTruthy();
  ```

**TC-INT-005: Retry Logic - Transient Failure**
- **Description**: Retry OCR on transient failures
- **Setup**: Mock OCR to fail once, succeed on retry
- **Steps**:
  1. Upload document
  2. First OCR attempt fails
  3. Job retried automatically
  4. Second attempt succeeds
- **Expected**: Document eventually processed after retry
- **Assertions**:
  ```typescript
  mockOcrService.extractText.mockRejectedValueOnce(new Error('Transient error'));
  mockOcrService.extractText.mockResolvedValueOnce({ text: 'Success', confidence: 0.9 });
  
  const doc = await uploadDocument('test.png');
  await waitFor(() => doc.status === 'COMPLETED', { timeout: 30000 });
  
  expect(mockOcrService.extractText).toHaveBeenCalledTimes(2);
  ```

**TC-INT-006: Concurrent Uploads**
- **Description**: Handle multiple simultaneous uploads
- **Setup**: Upload 10 files concurrently
- **Steps**:
  1. Upload 10 different images at once
  2. All uploads succeed
  3. All files stored in Spaces
  4. All jobs queued
  5. Worker processes all documents
- **Expected**: All 10 documents successfully processed
- **Assertions**:
  ```typescript
  const uploads = await Promise.all(
    Array(10).fill(null).map((_, i) => uploadDocument(`test-${i}.png`))
  );
  
  expect(uploads).toHaveLength(10);
  expect(uploads.every(u => u.status === 200)).toBe(true);
  
  await waitFor(() => allDocumentsCompleted(uploads), { timeout: 60000 });
  ```

---

### 6. Database State Tests

**File**: `tests/integration/document-state.test.ts`

**TC-INT-101: Document Status Workflow**
- **Description**: Verify status transitions
- **Setup**: Upload document
- **Steps**:
  1. Initial status: PENDING
  2. Worker starts: PROCESSING
  3. OCR completes: COMPLETED
- **Expected**: Status transitions in correct order
- **Assertions**:
  ```typescript
  const doc = await uploadDocument('test.png');
  expect(doc.status).toBe('PENDING');
  
  await waitFor(() => getDocument(doc.id).status === 'PROCESSING');
  await waitFor(() => getDocument(doc.id).status === 'COMPLETED');
  
  const final = await getDocument(doc.id);
  expect(final.processedAt).toBeTruthy();
  ```

**TC-INT-102: Activity Log Created**
- **Description**: Verify activity logs created
- **Setup**: Upload and process document
- **Steps**:
  1. Upload document
  2. Check UPLOAD activity log
  3. Wait for processing
  4. Check PROCESS activity log
- **Expected**: Two activity log entries created
- **Assertions**:
  ```typescript
  const doc = await uploadDocument('test.png');
  
  const uploadLog = await prisma.activityLog.findFirst({
    where: { entity: 'DOCUMENT', entityId: doc.id, action: 'UPLOAD' }
  });
  expect(uploadLog).toBeTruthy();
  
  await waitFor(() => doc.status === 'COMPLETED');
  
  const processLog = await prisma.activityLog.findFirst({
    where: { entity: 'DOCUMENT', entityId: doc.id, action: 'PROCESS' }
  });
  expect(processLog).toBeTruthy();
  ```

**TC-INT-103: Organization Isolation**
- **Description**: Ensure documents isolated by organization
- **Setup**: Create docs for two orgs
- **Steps**:
  1. Create document for org-A
  2. Create document for org-B
  3. Query documents for org-A
  4. Verify org-B document not returned
- **Expected**: Each org only sees own documents
- **Assertions**:
  ```typescript
  const docA = await uploadDocument('test-a.png', orgIdA);
  const docB = await uploadDocument('test-b.png', orgIdB);
  
  const orgADocs = await documentService.getDocuments(orgIdA);
  expect(orgADocs.documents).toHaveLength(1);
  expect(orgADocs.documents[0].id).toBe(docA.id);
  ```

---

## API Tests

### 7. Document Upload Endpoint

**File**: `tests/api/documents-upload.test.ts`

**TC-API-001: POST /api/documents/upload - Success**
- **Description**: Successfully upload file
- **Setup**: Authenticated user
- **Request**:
  ```http
  POST /api/documents/upload HTTP/1.1
  Content-Type: multipart/form-data; boundary=----WebKitFormBoundary
  Authorization: Bearer {token}
  
  ------WebKitFormBoundary
  Content-Disposition: form-data; name="file"; filename="test.png"
  Content-Type: image/png
  
  {binary data}
  ------WebKitFormBoundary--
  ```
- **Expected Response** (201):
  ```json
  {
    "success": true,
    "document": {
      "id": "clx123456",
      "fileName": "test.png",
      "cdnUrl": "https://cdn.example.com/org-123/documents/test-1234.png",
      "status": "PENDING",
      "fileSize": 1048576,
      "mimeType": "image/png"
    }
  }
  ```
- **Assertions**:
  ```typescript
  expect(res.status).toBe(201);
  expect(res.body.success).toBe(true);
  expect(res.body.document.id).toBeDefined();
  ```

**TC-API-002: POST /api/documents/upload - Unauthorized**
- **Description**: Reject unauthenticated request
- **Request**: POST without Authorization header
- **Expected Response** (401):
  ```json
  { "error": "Unauthorized" }
  ```

**TC-API-003: POST /api/documents/upload - No File**
- **Description**: Reject request with no file
- **Request**: POST with empty form data
- **Expected Response** (400):
  ```json
  { "error": "No file provided" }
  ```

**TC-API-004: POST /api/documents/upload - File Too Large**
- **Description**: Reject file exceeding 50MB
- **Request**: POST with 51MB file
- **Expected Response** (400):
  ```json
  { "error": "File size exceeds maximum allowed size of 50MB" }
  ```

**TC-API-005: POST /api/documents/upload - Invalid Type**
- **Description**: Reject invalid file type
- **Request**: POST with .exe file
- **Expected Response** (400):
  ```json
  { "error": "File type application/x-msdownload is not allowed" }
  ```

---

### 8. Document List Endpoint

**File**: `tests/api/documents-list.test.ts`

**TC-API-101: GET /api/documents - Success**
- **Description**: List documents with pagination
- **Request**:
  ```http
  GET /api/documents?page=1&limit=20 HTTP/1.1
  Authorization: Bearer {token}
  ```
- **Expected Response** (200):
  ```json
  {
    "success": true,
    "documents": [
      {
        "id": "doc1",
        "fileName": "invoice.png",
        "status": "COMPLETED",
        "uploadedAt": "2025-11-20T10:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20
  }
  ```

**TC-API-102: GET /api/documents - Filter by Status**
- **Description**: Filter documents by status
- **Request**: GET /api/documents?status=COMPLETED
- **Expected**: Returns only COMPLETED documents

**TC-API-103: GET /api/documents - Search**
- **Description**: Search documents by filename
- **Request**: GET /api/documents?search=invoice
- **Expected**: Returns documents matching "invoice"

**TC-API-104: GET /api/documents - Unauthorized**
- **Description**: Reject unauthenticated request
- **Request**: GET without Authorization
- **Expected Response** (401):
  ```json
  { "error": "Unauthorized" }
  ```

---

### 9. Document Detail Endpoint

**File**: `tests/api/documents-detail.test.ts`

**TC-API-201: GET /api/documents/[id] - Success**
- **Description**: Get document details
- **Request**:
  ```http
  GET /api/documents/clx123456 HTTP/1.1
  Authorization: Bearer {token}
  ```
- **Expected Response** (200):
  ```json
  {
    "success": true,
    "document": {
      "id": "clx123456",
      "fileName": "invoice.png",
      "originalName": "invoice.png",
      "cdnUrl": "https://cdn.example.com/...",
      "status": "COMPLETED",
      "ocrText": "INVOICE #12345...",
      "ocrConfidence": 0.95,
      "extractedData": { "invoiceNumber": "12345" }
    }
  }
  ```

**TC-API-202: GET /api/documents/[id] - Not Found**
- **Description**: Handle non-existent document
- **Request**: GET /api/documents/nonexistent
- **Expected Response** (404):
  ```json
  { "error": "Document not found" }
  ```

**TC-API-203: GET /api/documents/[id] - Wrong Org**
- **Description**: Prevent cross-org access
- **Setup**: Document belongs to org-A, user from org-B
- **Request**: GET /api/documents/doc-org-a
- **Expected Response** (403):
  ```json
  { "error": "Access denied" }
  ```

---

### 10. Document Delete Endpoint

**File**: `tests/api/documents-delete.test.ts`

**TC-API-301: DELETE /api/documents/[id] - Success**
- **Description**: Delete document
- **Request**:
  ```http
  DELETE /api/documents/clx123456 HTTP/1.1
  Authorization: Bearer {token}
  ```
- **Expected Response** (200):
  ```json
  { "success": true, "message": "Document deleted" }
  ```
- **Verification**: Document deleted from DB and Spaces

**TC-API-302: DELETE /api/documents/[id] - CLIENT Role Denied**
- **Description**: Prevent CLIENT users from deleting
- **Setup**: User with role=CLIENT
- **Request**: DELETE /api/documents/doc1
- **Expected Response** (403):
  ```json
  { "error": "Insufficient permissions" }
  ```

**TC-API-303: DELETE /api/documents/[id] - Document in Use**
- **Description**: Prevent deletion if document linked to intake
- **Setup**: Document linked to active IntakeRequest
- **Request**: DELETE /api/documents/doc1
- **Expected Response** (409):
  ```json
  { "error": "Document is in use and cannot be deleted" }
  ```

---

### 11. Document Download Endpoint

**File**: `tests/api/documents-download.test.ts`

**TC-API-401: GET /api/documents/[id]/download - Success**
- **Description**: Download original file
- **Request**:
  ```http
  GET /api/documents/clx123456/download HTTP/1.1
  Authorization: Bearer {token}
  ```
- **Expected Response** (200):
  - Content-Type: {original MIME type}
  - Content-Disposition: attachment; filename="invoice.png"
  - Body: Binary file data
- **Assertions**:
  ```typescript
  expect(res.status).toBe(200);
  expect(res.headers['content-type']).toBe('image/png');
  expect(res.headers['content-disposition']).toContain('filename="invoice.png"');
  expect(res.body).toBeInstanceOf(Buffer);
  ```

**TC-API-402: GET /api/documents/[id]/download - Unauthorized**
- **Description**: Reject unauthenticated download
- **Request**: GET without Authorization
- **Expected Response** (401)

---

## UI Tests

### 12. Document Uploader Component

**File**: `tests/ui/document-uploader.test.tsx`

**TC-UI-001: Drag and Drop File**
- **Description**: Upload file via drag-and-drop
- **Setup**: Render DocumentUploader component
- **Steps**:
  1. Render component
  2. Simulate file drag over drop zone
  3. Drop PNG file
  4. Verify upload started
  5. Verify progress shown
  6. Verify success message
- **Expected**: File uploaded successfully
- **Assertions**:
  ```typescript
  render(<DocumentUploader />);
  const dropzone = screen.getByTestId('document-dropzone');
  
  fireEvent.dragOver(dropzone);
  fireEvent.drop(dropzone, { dataTransfer: { files: [testFile] } });
  
  expect(screen.getByText(/Uploading/i)).toBeInTheDocument();
  
  await waitFor(() => {
    expect(screen.getByText(/Upload successful/i)).toBeInTheDocument();
  });
  ```

**TC-UI-002: Click to Upload**
- **Description**: Upload file via file picker
- **Steps**:
  1. Click "Choose File" button
  2. Select file from picker
  3. Verify upload starts
- **Expected**: File uploaded

**TC-UI-003: Upload Progress**
- **Description**: Display upload progress bar
- **Steps**:
  1. Upload large file (10MB)
  2. Verify progress bar shown
  3. Verify percentage updates
- **Expected**: Progress bar shows 0% → 100%

**TC-UI-004: Multiple File Upload**
- **Description**: Upload multiple files at once
- **Steps**:
  1. Drop 3 files into dropzone
  2. Verify all 3 uploads start
  3. Verify individual progress for each
- **Expected**: All 3 files uploaded

**TC-UI-005: File Type Validation Error**
- **Description**: Show error for invalid file type
- **Steps**:
  1. Drop .exe file
  2. Verify error message shown
  3. Verify upload blocked
- **Expected**: Error: "File type not allowed"

**TC-UI-006: File Size Validation Error**
- **Description**: Show error for oversized file
- **Steps**:
  1. Drop 60MB file
  2. Verify error message shown
- **Expected**: Error: "File exceeds 50MB limit"

**TC-UI-007: Cancel Upload**
- **Description**: Cancel in-progress upload
- **Steps**:
  1. Start uploading large file
  2. Click "Cancel" button
  3. Verify upload aborted
- **Expected**: Upload stopped, file not created

---

### 13. Document Queue Table

**File**: `tests/ui/document-queue.test.tsx`

**TC-UI-101: Display Documents**
- **Description**: Show list of documents
- **Setup**: Mock 5 documents
- **Expected**: Table displays all 5 documents with columns: Filename, Status, Size, Uploaded At
- **Assertions**:
  ```typescript
  render(<DocumentQueue documents={mockDocuments} />);
  expect(screen.getByText('invoice.png')).toBeInTheDocument();
  expect(screen.getByText('COMPLETED')).toBeInTheDocument();
  ```

**TC-UI-102: Filter by Status**
- **Description**: Filter documents by status
- **Steps**:
  1. Render table with mixed status documents
  2. Click "COMPLETED" filter
  3. Verify only COMPLETED documents shown
- **Expected**: Table filtered correctly

**TC-UI-103: Search Documents**
- **Description**: Search documents by filename
- **Steps**:
  1. Enter "invoice" in search box
  2. Verify only matching documents shown
- **Expected**: Search results filtered

**TC-UI-104: Sort by Column**
- **Description**: Sort documents by column
- **Steps**:
  1. Click "Uploaded At" column header
  2. Verify documents sorted by date descending
  3. Click again
  4. Verify sorted ascending
- **Expected**: Sorting works correctly

**TC-UI-105: Pagination**
- **Description**: Navigate between pages
- **Setup**: Mock 50 documents
- **Steps**:
  1. Verify page 1 shows 20 documents
  2. Click "Next" button
  3. Verify page 2 shows next 20
- **Expected**: Pagination works

**TC-UI-106: Status Badge Colors**
- **Description**: Verify status badges have correct colors
- **Expected**:
  - PENDING: Blue
  - PROCESSING: Yellow
  - COMPLETED: Green
  - FAILED: Red

---

### 14. Document Viewer

**File**: `tests/ui/document-viewer.test.tsx`

**TC-UI-201: Display Image Document**
- **Description**: View image document
- **Steps**:
  1. Render viewer with image document
  2. Verify image displayed
  3. Verify OCR overlay toggle available
- **Expected**: Image rendered correctly

**TC-UI-202: Display PDF Document**
- **Description**: View PDF document
- **Steps**:
  1. Render viewer with PDF
  2. Verify PDF rendered in iframe/viewer
- **Expected**: PDF displayed

**TC-UI-203: OCR Overlay Toggle**
- **Description**: Toggle OCR text overlay
- **Steps**:
  1. View image with OCR text
  2. Click "Show OCR" toggle
  3. Verify OCR text overlay shown
  4. Click toggle again
  5. Verify overlay hidden
- **Expected**: OCR overlay toggles correctly

**TC-UI-204: Download Button**
- **Description**: Download original file
- **Steps**:
  1. Click "Download" button
  2. Verify file download initiated
- **Expected**: Browser downloads file

**TC-UI-205: Extracted Data Display**
- **Description**: Show extracted structured data
- **Setup**: Document with extractedData
- **Steps**:
  1. View invoice document
  2. Verify "Extracted Data" panel shown
  3. Verify invoice fields displayed
- **Expected**: Structured data rendered

**TC-UI-206: Processing Status**
- **Description**: Show processing status for pending documents
- **Setup**: Document with status=PROCESSING
- **Expected**: Spinner and "Processing..." message shown

**TC-UI-207: Error State**
- **Description**: Show error for failed documents
- **Setup**: Document with status=FAILED
- **Expected**: Error message and retry button shown

---

## Performance Tests

### 15. Load Tests

**File**: `tests/performance/document-upload-load.test.ts`

**TC-PERF-001: Concurrent Uploads - 10 Users**
- **Description**: Simulate 10 concurrent users uploading files
- **Setup**: 10 virtual users, each uploads 5MB file
- **Metrics**:
  - Upload time p50: < 2 seconds
  - Upload time p95: < 5 seconds
  - Success rate: > 99%
  - Server CPU: < 70%
  - Memory usage: < 1GB
- **Assertions**:
  ```typescript
  const results = await loadTest({
    users: 10,
    duration: 60000,
    scenario: uploadFile
  });
  
  expect(results.p50).toBeLessThan(2000);
  expect(results.p95).toBeLessThan(5000);
  expect(results.successRate).toBeGreaterThan(0.99);
  ```

**TC-PERF-002: OCR Processing Throughput**
- **Description**: Measure OCR processing capacity
- **Setup**: Queue 100 documents for OCR
- **Metrics**:
  - Processing time per document: < 10 seconds
  - Throughput: > 6 documents/minute (with concurrency=3)
  - Worker CPU usage: < 90%
- **Assertions**:
  ```typescript
  const start = Date.now();
  await queueDocuments(100);
  await waitForAllCompleted();
  const duration = Date.now() - start;
  
  const throughput = 100 / (duration / 60000);
  expect(throughput).toBeGreaterThan(6);
  ```

**TC-PERF-003: Large File Upload - 50MB**
- **Description**: Upload maximum size file
- **Setup**: 50MB PDF file
- **Metrics**:
  - Upload time: < 30 seconds
  - Memory usage spike: < 200MB
  - No timeout errors
- **Assertions**:
  ```typescript
  const start = Date.now();
  const res = await uploadFile(largeFile);
  const duration = Date.now() - start;
  
  expect(res.status).toBe(201);
  expect(duration).toBeLessThan(30000);
  ```

**TC-PERF-004: CDN Cache Performance**
- **Description**: Verify CDN caching works
- **Steps**:
  1. Request file from CDN (cold cache)
  2. Measure response time
  3. Request same file again (warm cache)
  4. Measure response time
- **Expected**: Cached response < 50ms, uncached < 500ms
- **Assertions**:
  ```typescript
  const coldTime = await measureCdnRequest(fileUrl);
  expect(coldTime).toBeLessThan(500);
  
  const warmTime = await measureCdnRequest(fileUrl);
  expect(warmTime).toBeLessThan(50);
  ```

**TC-PERF-005: Database Query Performance**
- **Description**: Measure document list query performance
- **Setup**: 10,000 documents in database
- **Metrics**:
  - Query time: < 100ms
  - Proper index usage
- **Assertions**:
  ```typescript
  const start = Date.now();
  await documentService.getDocuments(orgId, { page: 1, limit: 20 });
  const duration = Date.now() - start;
  
  expect(duration).toBeLessThan(100);
  ```

---

### 16. Stress Tests

**TC-PERF-101: Maximum Concurrent Uploads**
- **Description**: Find breaking point for concurrent uploads
- **Setup**: Gradually increase concurrent users until failures
- **Expected**: System handles 50+ concurrent uploads gracefully

**TC-PERF-102: Memory Leak Test**
- **Description**: Verify no memory leaks during extended operation
- **Setup**: Run upload/process cycle for 1 hour
- **Expected**: Memory usage stable, no continuous growth

---

## Security Tests

### 17. Access Control Tests

**File**: `tests/security/access-control.test.ts`

**TC-SEC-001: Cross-Org Document Access Prevention**
- **Description**: Users cannot access other organizations' documents
- **Setup**: Create doc-A for org-A, user from org-B
- **Steps**:
  1. User from org-B tries GET /api/documents/{doc-A-id}
  2. Verify 403 Forbidden
- **Expected**: Access denied
- **Assertions**:
  ```typescript
  const res = await request(app)
    .get(`/api/documents/${docA.id}`)
    .set('Authorization', `Bearer ${tokenOrgB}`);
  
  expect(res.status).toBe(403);
  ```

**TC-SEC-002: Role-Based Access - CLIENT Cannot Delete**
- **Description**: CLIENT role cannot delete documents
- **Setup**: User with role=CLIENT
- **Steps**:
  1. CLIENT user tries DELETE /api/documents/{id}
  2. Verify 403 Forbidden
- **Expected**: Access denied

**TC-SEC-003: Role-Based Access - OPERATOR Can Upload**
- **Description**: OPERATOR role can upload documents
- **Setup**: User with role=OPERATOR
- **Expected**: Upload succeeds

**TC-SEC-004: Unauthenticated Access Blocked**
- **Description**: All endpoints require authentication
- **Steps**: Try all endpoints without Authorization header
- **Expected**: All return 401 Unauthorized

---

### 18. File Security Tests

**File**: `tests/security/file-validation.test.ts`

**TC-SEC-101: Malicious File Upload - Executable**
- **Description**: Block executable file upload
- **Input**: Windows .exe file
- **Expected**: Upload rejected with validation error

**TC-SEC-102: Malicious File Upload - Script**
- **Description**: Block script file upload
- **Input**: JavaScript .js file
- **Expected**: Upload rejected

**TC-SEC-103: MIME Type Spoofing**
- **Description**: Detect and block MIME type spoofing
- **Setup**: Rename .exe to .png, set Content-Type: image/png
- **Expected**: File-type detection catches mismatch, upload rejected

**TC-SEC-104: Path Traversal Prevention**
- **Description**: Prevent path traversal in filename
- **Input**: Filename "../../../etc/passwd.txt"
- **Expected**: Filename sanitized, path traversal blocked

**TC-SEC-105: XSS Prevention in Filename**
- **Description**: Sanitize filenames with XSS payloads
- **Input**: Filename "<script>alert('xss')</script>.png"
- **Expected**: Filename sanitized, script tags removed

**TC-SEC-106: SQL Injection Prevention**
- **Description**: Prevent SQL injection via search
- **Input**: Search query "'; DROP TABLE documents; --"
- **Expected**: Query safely parameterized, no injection

---

### 19. CORS Tests

**File**: `tests/security/cors.test.ts`

**TC-SEC-201: CORS - Allowed Origin**
- **Description**: Accept requests from allowed origins
- **Request**: GET with Origin: https://app.astralisone.com
- **Expected**: Response includes Access-Control-Allow-Origin header

**TC-SEC-202: CORS - Blocked Origin**
- **Description**: Block requests from unauthorized origins
- **Request**: GET with Origin: https://evil.com
- **Expected**: No CORS headers, request blocked by browser

**TC-SEC-203: Preflight Request**
- **Description**: Handle OPTIONS preflight correctly
- **Request**: OPTIONS /api/documents/upload
- **Expected**: Correct preflight headers returned

---

## Test Data & Fixtures

### 20. Test Files

**Directory**: `tests/fixtures/`

**Required Test Files**:

1. **images/invoice-clear.png**
   - Size: 500KB
   - Resolution: 1200x1600
   - Content: Clear invoice with:
     - Invoice #: INV-2024-001
     - Date: 2024-11-20
     - Total: $1,234.56
     - Vendor: Acme Corp
   - OCR confidence expected: > 0.9

2. **images/receipt-blurry.jpg**
   - Size: 300KB
   - Resolution: 800x1200
   - Content: Slightly blurred receipt
   - OCR confidence expected: 0.5 - 0.8

3. **images/blank.png**
   - Size: 10KB
   - Content: White blank image
   - OCR result: Empty string

4. **pdfs/sample-document.pdf**
   - Size: 200KB
   - Pages: 3
   - Content: Sample text document
   - Text extraction: Deterministic

5. **pdfs/scanned-form.pdf**
   - Size: 2MB
   - Pages: 1
   - Content: Scanned form (image-based PDF)
   - Requires OCR

6. **invalid/malware.exe**
   - Size: 50KB
   - Type: Windows executable
   - Expected: Rejected

7. **invalid/large-file.pdf**
   - Size: 51MB
   - Expected: Rejected (exceeds 50MB limit)

8. **invalid/tiny-file.txt**
   - Size: 100 bytes
   - Expected: Rejected (below 1KB minimum)

9. **invalid/corrupted.png**
   - Size: 50KB
   - Content: Corrupted PNG header
   - Expected: Upload succeeds, OCR fails

10. **office/sample.docx**
    - Size: 50KB
    - Content: Word document
    - Expected: Accepted

---

### 21. Database Fixtures

**File**: `tests/fixtures/database.ts`

```typescript
export const testUsers = {
  adminOrgA: {
    id: 'user-admin-org-a',
    email: 'admin@org-a.com',
    role: 'ADMIN',
    orgId: 'org-a',
  },
  operatorOrgA: {
    id: 'user-operator-org-a',
    email: 'operator@org-a.com',
    role: 'OPERATOR',
    orgId: 'org-a',
  },
  clientOrgA: {
    id: 'user-client-org-a',
    email: 'client@org-a.com',
    role: 'CLIENT',
    orgId: 'org-a',
  },
  adminOrgB: {
    id: 'user-admin-org-b',
    email: 'admin@org-b.com',
    role: 'ADMIN',
    orgId: 'org-b',
  },
};

export const testOrganizations = {
  orgA: {
    id: 'org-a',
    name: 'Organization A',
  },
  orgB: {
    id: 'org-b',
    name: 'Organization B',
  },
};

export const testDocuments = {
  completedImageOrgA: {
    id: 'doc-completed-image-org-a',
    fileName: 'invoice-123-1234567890-abc.png',
    originalName: 'invoice-123.png',
    filePath: 'org-a/documents/invoice-123-1234567890-abc.png',
    cdnUrl: 'https://cdn.example.com/org-a/documents/invoice-123-1234567890-abc.png',
    thumbnailUrl: 'https://cdn.example.com/org-a/thumbnails/thumb-invoice-123-1234567890-abc.jpg',
    fileSize: 524288,
    mimeType: 'image/png',
    status: 'COMPLETED',
    ocrText: 'INVOICE #INV-2024-001\nTotal: $1,234.56',
    ocrConfidence: 0.95,
    extractedData: {
      invoiceNumber: 'INV-2024-001',
      totalAmount: 1234.56,
      currency: 'USD',
    },
    uploadedBy: 'user-admin-org-a',
    orgId: 'org-a',
    processedAt: new Date('2025-11-20T10:05:00Z'),
    createdAt: new Date('2025-11-20T10:00:00Z'),
  },
  pendingPdfOrgA: {
    id: 'doc-pending-pdf-org-a',
    fileName: 'report-1234567891-def.pdf',
    originalName: 'report.pdf',
    status: 'PENDING',
    mimeType: 'application/pdf',
    fileSize: 2097152,
    uploadedBy: 'user-operator-org-a',
    orgId: 'org-a',
  },
  failedDocOrgA: {
    id: 'doc-failed-org-a',
    status: 'FAILED',
    processingError: 'OCR extraction failed: corrupted image',
    uploadedBy: 'user-admin-org-a',
    orgId: 'org-a',
  },
};
```

---

### 22. Mock Services

**File**: `tests/mocks/services.ts`

```typescript
export const mockSpacesService = {
  uploadFile: jest.fn().mockResolvedValue({
    fileName: 'test-1234567890-abc123.png',
    filePath: 'org-123/documents/test-1234567890-abc123.png',
    cdnUrl: 'https://cdn.example.com/org-123/documents/test-1234567890-abc123.png',
    fileSize: 1048576,
  }),
  downloadFile: jest.fn().mockResolvedValue(Buffer.from('file content')),
  deleteFile: jest.fn().mockResolvedValue(undefined),
  getFileMetadata: jest.fn().mockResolvedValue({
    contentType: 'image/png',
    contentLength: 1048576,
    lastModified: new Date(),
  }),
};

export const mockOcrService = {
  extractText: jest.fn().mockResolvedValue({
    text: 'INVOICE #12345\nTotal: $100.00',
    confidence: 0.95,
  }),
  generateThumbnail: jest.fn().mockResolvedValue(Buffer.from('thumbnail')),
};

export const mockDataExtractionService = {
  extractStructuredData: jest.fn().mockResolvedValue({
    data: {
      invoiceNumber: 'INV-2024-001',
      totalAmount: 1234.56,
      vendorName: 'Acme Corp',
    },
    confidence: 0.9,
    raw: '{"invoiceNumber":"INV-2024-001","totalAmount":1234.56}',
  }),
};
```

---

## Test Execution Plan

### Phase 1: Unit Tests (Week 1)

**Day 1-2**: Spaces Service Tests
- Implement TC-UNIT-001 to TC-UNIT-007
- Target: 100% coverage of SpacesService

**Day 3**: File Validation Tests
- Implement TC-UNIT-101 to TC-UNIT-109
- Target: All validation logic covered

**Day 4-5**: OCR & Document Service Tests
- Implement TC-UNIT-201 to TC-UNIT-310
- Target: Core business logic covered

### Phase 2: Integration Tests (Week 2)

**Day 1-2**: Upload Flow Tests
- Implement TC-INT-001 to TC-INT-006
- Setup test Spaces bucket
- Configure test worker

**Day 3**: Database State Tests
- Implement TC-INT-101 to TC-INT-103
- Verify data integrity

### Phase 3: API Tests (Week 2)

**Day 4-5**: All API Endpoint Tests
- Implement TC-API-001 to TC-API-402
- Target: 100% endpoint coverage

### Phase 4: UI Tests (Week 3)

**Day 1-2**: Component Tests
- Implement TC-UI-001 to TC-UI-207
- Use React Testing Library

### Phase 5: Performance & Security (Week 3)

**Day 3**: Performance Tests
- Implement TC-PERF-001 to TC-PERF-102
- Establish baseline metrics

**Day 4-5**: Security Tests
- Implement TC-SEC-001 to TC-SEC-203
- Penetration testing

### Continuous Testing

**Pre-commit**:
- Run unit tests
- Run linter

**PR Validation**:
- Run all unit tests
- Run integration tests
- Check code coverage

**Nightly**:
- Run full test suite
- Run performance tests
- Generate coverage report

---

## Success Criteria

### Test Coverage

- [ ] Unit test coverage: ≥ 80%
- [ ] Integration test coverage: All critical paths
- [ ] API test coverage: 100% of endpoints
- [ ] UI test coverage: Core user journeys

### Test Results

- [ ] All unit tests passing (100%)
- [ ] All integration tests passing (100%)
- [ ] All API tests passing (100%)
- [ ] All UI tests passing (≥ 95%)
- [ ] All security tests passing (100%)

### Performance Metrics

- [ ] Upload time p95 < 5 seconds
- [ ] OCR processing < 10 seconds per document
- [ ] Database queries < 100ms
- [ ] CDN cache hit rate > 90%
- [ ] Concurrent upload capacity: 50+ users

### Security Validation

- [ ] No unauthorized access possible
- [ ] All file types validated
- [ ] MIME type spoofing detected
- [ ] Path traversal prevented
- [ ] XSS and SQL injection prevented

### Documentation

- [ ] All test cases documented
- [ ] Test data fixtures created
- [ ] Test execution plan defined
- [ ] CI/CD pipeline configured
- [ ] Test reports generated

---

## Appendix A: Test Commands

```bash
# Run all tests
npm test

# Run unit tests only
npm test -- --testPathPattern=__tests__

# Run integration tests
npm test -- --testPathPattern=integration

# Run API tests
npm test -- --testPathPattern=api

# Run UI tests
npm test -- --testPathPattern=ui

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- spaces.service.test.ts

# Run in watch mode
npm test -- --watch

# Run performance tests
npm run test:performance

# Run security tests
npm run test:security
```

---

## Appendix B: CI/CD Integration

**GitHub Actions Workflow**: `.github/workflows/test.yml`

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test -- --testPathPattern=__tests__ --coverage
      - uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
      redis:
        image: redis:7
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm test -- --testPathPattern=integration

  api-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm test -- --testPathPattern=api
```

---

**End of Test Plan**

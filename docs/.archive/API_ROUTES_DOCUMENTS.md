# Document API Routes

Document management system with upload, OCR processing, embedding generation, and RAG-based chat capabilities.

## Table of Contents
- [Document Management](#document-management)
- [Document Upload](#document-upload)
- [Document Processing](#document-processing)
- [Document Search](#document-search)
- [Document Embeddings](#document-embeddings)

---

## Document Management

### List Documents

Retrieve a list of documents for the current organization.

**Endpoint**: `GET /api/documents`
**Auth**: Required
**Query Parameters**:
- `status` (optional): Filter by status (PENDING, PROCESSING, COMPLETED, FAILED)
- `limit` (optional): Number of results (default: 50, max: 100)
- `offset` (optional): Pagination offset
- `search` (optional): Search by filename

### Response
```json
{
  "documents": [
    {
      "id": "doc_abc123",
      "fileName": "contract-2024.pdf",
      "originalName": "Enterprise Contract 2024.pdf",
      "fileSize": 2458624,
      "mimeType": "application/pdf",
      "status": "COMPLETED",
      "cdnUrl": "https://cdn.astralisone.com/documents/doc_abc123.pdf",
      "thumbnailUrl": "https://cdn.astralisone.com/thumbnails/doc_abc123_thumb.jpg",
      "uploadedById": "user_456",
      "orgId": "org_789",
      "ocrConfidence": 0.95,
      "processedAt": "2024-11-24T10:05:00Z",
      "createdAt": "2024-11-24T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 234,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

### Create Document Entry

Create a document entry before upload (for pre-signed URL pattern).

**Endpoint**: `POST /api/documents`
**Auth**: Required

### Request Body
```json
{
  "fileName": "contract-2024.pdf",
  "fileSize": 2458624,
  "mimeType": "application/pdf",
  "metadata": {
    "department": "Sales",
    "clientId": "client_123",
    "contractValue": 50000
  }
}
```

### Response
```json
{
  "success": true,
  "document": {
    "id": "doc_abc123",
    "fileName": "contract-2024.pdf",
    "uploadUrl": "https://spaces.digitalocean.com/...",
    "status": "PENDING"
  }
}
```

### Get Single Document

**Endpoint**: `GET /api/documents/[id]`
**Auth**: Required

### Response
```json
{
  "id": "doc_abc123",
  "fileName": "contract-2024.pdf",
  "originalName": "Enterprise Contract 2024.pdf",
  "fileSize": 2458624,
  "mimeType": "application/pdf",
  "filePath": "org_789/2024/11/doc_abc123.pdf",
  "cdnUrl": "https://cdn.astralisone.com/documents/doc_abc123.pdf",
  "thumbnailUrl": "https://cdn.astralisone.com/thumbnails/doc_abc123_thumb.jpg",
  "status": "COMPLETED",
  "uploadedById": "user_456",
  "orgId": "org_789",
  "ocrText": "ENTERPRISE SOFTWARE LICENSE AGREEMENT...",
  "ocrConfidence": 0.95,
  "extractedData": {
    "entities": {
      "parties": ["Acme Corp", "Client Inc"],
      "dates": ["2024-01-15", "2025-01-14"],
      "amounts": [50000, 10000],
      "emails": ["legal@acme.com", "contracts@client.com"]
    },
    "documentType": "contract",
    "language": "en"
  },
  "metadata": {
    "department": "Sales",
    "clientId": "client_123",
    "contractValue": 50000
  },
  "processedAt": "2024-11-24T10:05:00Z",
  "createdAt": "2024-11-24T10:00:00Z",
  "updatedAt": "2024-11-24T10:05:30Z"
}
```

### Update Document

**Endpoint**: `PUT /api/documents/[id]`
**Auth**: Required

### Request Body
```json
{
  "metadata": {
    "department": "Legal",
    "reviewed": true,
    "reviewedBy": "user_legal123"
  }
}
```

### Response
```json
{
  "success": true,
  "document": {
    "id": "doc_abc123",
    "metadata": {
      "department": "Legal",
      "reviewed": true,
      "reviewedBy": "user_legal123"
    },
    "updatedAt": "2024-11-24T11:00:00Z"
  }
}
```

### Delete Document

**Endpoint**: `DELETE /api/documents/[id]`
**Auth**: Required (Admin or document owner)

### Response
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

---

## Document Upload

### Direct Upload

Upload a document file directly.

**Endpoint**: `POST /api/documents/upload`
**Auth**: Required
**Content-Type**: `multipart/form-data`

### Request (Multipart Form Data)
- `file`: Document file (required)
- `metadata`: JSON string with additional metadata (optional)

### Response
```json
{
  "success": true,
  "document": {
    "id": "doc_abc123",
    "fileName": "contract-2024.pdf",
    "fileSize": 2458624,
    "status": "PROCESSING",
    "uploadedAt": "2024-11-24T10:00:00Z"
  },
  "processingJobId": "job_xyz789"
}
```

### Example (cURL)
```bash
curl -X POST http://localhost:3001/api/documents/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/contract.pdf" \
  -F 'metadata={"department":"Sales","clientId":"client_123"}'
```

### Example (JavaScript)
```javascript
const formData = new FormData();
formData.append('file', file);
formData.append('metadata', JSON.stringify({
  department: 'Sales',
  clientId: 'client_123'
}));

const response = await fetch('/api/documents/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

---

## Document Processing

### Download Document

**Endpoint**: `GET /api/documents/[id]/download`
**Auth**: Required

### Response
Binary file download with appropriate `Content-Type` and `Content-Disposition` headers.

### Example
```bash
curl -X GET http://localhost:3001/api/documents/doc_abc123/download \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o contract.pdf
```

### Update Document URL

Update document CDN/storage URL (for migrations or re-uploads).

**Endpoint**: `PUT /api/documents/[id]/url`
**Auth**: Required (Admin only)

### Request Body
```json
{
  "cdnUrl": "https://new-cdn.example.com/doc_abc123.pdf",
  "thumbnailUrl": "https://new-cdn.example.com/doc_abc123_thumb.jpg"
}
```

### Response
```json
{
  "success": true,
  "document": {
    "id": "doc_abc123",
    "cdnUrl": "https://new-cdn.example.com/doc_abc123.pdf",
    "thumbnailUrl": "https://new-cdn.example.com/doc_abc123_thumb.jpg",
    "updatedAt": "2024-11-24T11:30:00Z"
  }
}
```

### Retry Document Processing

Retry OCR and embedding generation for failed documents.

**Endpoint**: `POST /api/documents/[id]/retry`
**Auth**: Required

### Response
```json
{
  "success": true,
  "message": "Document processing job queued",
  "jobId": "job_retry_xyz789",
  "document": {
    "id": "doc_abc123",
    "status": "PROCESSING"
  }
}
```

---

## Document Embeddings

### Generate Embeddings

Manually trigger embedding generation for a document.

**Endpoint**: `POST /api/documents/[id]/embed`
**Auth**: Required

### Request Body
```json
{
  "force": false,
  "chunkSize": 1000,
  "chunkOverlap": 200
}
```

### Response
```json
{
  "success": true,
  "embeddings": {
    "documentId": "doc_abc123",
    "totalChunks": 24,
    "status": "COMPLETED",
    "model": "text-embedding-3-small",
    "dimensions": 1536,
    "processedAt": "2024-11-24T10:10:00Z"
  },
  "jobId": "job_embed_xyz789"
}
```

### Embedding Processing Flow
1. Document text extracted via OCR
2. Text split into chunks (default: 1000 chars with 200 char overlap)
3. Each chunk processed through OpenAI embedding model
4. Embeddings stored in database with chunk metadata
5. Vector search enabled for RAG chat

---

## Document Search

### Search Documents

Search documents by content using vector similarity.

**Endpoint**: `GET /api/documents/search`
**Auth**: Required
**Query Parameters**:
- `q` (required): Search query
- `limit` (optional): Number of results (default: 10, max: 50)
- `minSimilarity` (optional): Minimum similarity score (default: 0.5, range: 0-1)
- `documentIds` (optional): Comma-separated document IDs to search within

### Response
```json
{
  "results": [
    {
      "documentId": "doc_abc123",
      "fileName": "contract-2024.pdf",
      "chunkIndex": 5,
      "content": "...relevant text excerpt containing the search terms...",
      "similarity": 0.89,
      "metadata": {
        "pageNumber": 3,
        "section": "Payment Terms"
      }
    },
    {
      "documentId": "doc_def456",
      "fileName": "proposal-enterprise.pdf",
      "chunkIndex": 12,
      "content": "...another relevant excerpt...",
      "similarity": 0.82,
      "metadata": {
        "pageNumber": 7,
        "section": "Technical Specifications"
      }
    }
  ],
  "total": 18,
  "query": "payment terms and invoicing",
  "searchTime": 124
}
```

### Example
```bash
curl -X GET "http://localhost:3001/api/documents/search?q=payment+terms&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Document Statistics

### Get Document Stats

Retrieve document statistics for the organization.

**Endpoint**: `GET /api/documents/stats`
**Auth**: Required
**Query Parameters**:
- `startDate` (optional): Start date for stats (ISO 8601)
- `endDate` (optional): End date for stats (ISO 8601)

### Response
```json
{
  "total": 234,
  "byStatus": {
    "PENDING": 5,
    "PROCESSING": 12,
    "COMPLETED": 210,
    "FAILED": 7
  },
  "byMimeType": {
    "application/pdf": 156,
    "image/jpeg": 45,
    "image/png": 23,
    "application/msword": 10
  },
  "totalSize": 524288000,
  "averageOcrConfidence": 0.91,
  "recentUploads": [
    {
      "id": "doc_recent1",
      "fileName": "invoice-nov.pdf",
      "uploadedAt": "2024-11-24T09:45:00Z"
    }
  ],
  "topUploadedBy": [
    {
      "userId": "user_456",
      "userName": "John Doe",
      "count": 67
    }
  ]
}
```

---

## Supported File Types

### Images
- **JPEG** (`.jpg`, `.jpeg`) - Max 10MB
- **PNG** (`.png`) - Max 10MB
- **WebP** (`.webp`) - Max 10MB
- **GIF** (`.gif`) - Max 10MB

### Documents
- **PDF** (`.pdf`) - Max 50MB
- **Microsoft Word** (`.doc`, `.docx`) - Max 25MB
- **Microsoft Excel** (`.xls`, `.xlsx`) - Max 25MB
- **Text** (`.txt`) - Max 5MB

### Processing Capabilities
- **OCR**: Extract text from images and PDFs
- **Entity Extraction**: Detect dates, emails, names, amounts
- **Language Detection**: Identify document language
- **Thumbnail Generation**: Create preview images
- **Vector Embeddings**: Enable semantic search

---

## Error Codes

- `400`: Bad request (invalid file type, size exceeded, missing fields)
- `401`: Unauthorized (invalid or missing API token)
- `403`: Forbidden (insufficient permissions)
- `404`: Document not found
- `413`: Payload too large (file size exceeded)
- `415`: Unsupported media type
- `422`: Processing error (OCR failed, embedding generation failed)
- `500`: Internal server error
- `503`: Service unavailable (storage or processing service down)

---

## Rate Limits

- **Upload**: 100 files/hour per user
- **Processing**: 1000 pages/hour per organization (OCR)
- **Embedding Generation**: 5000 chunks/hour per organization
- **Search**: 1000 queries/hour per user

---

## Webhooks

Document processing webhooks:

```json
{
  "event": "document.processed",
  "timestamp": "2024-11-24T10:05:30Z",
  "data": {
    "documentId": "doc_abc123",
    "status": "COMPLETED",
    "ocrConfidence": 0.95,
    "embeddingsGenerated": true,
    "totalChunks": 24
  }
}
```

---

## Best Practices

1. **File Validation**: Check file type and size on client before upload
2. **Progress Tracking**: Poll document status after upload to track processing
3. **Error Handling**: Implement retry logic for failed uploads/processing
4. **Metadata**: Include rich metadata for better organization and search
5. **Thumbnails**: Use thumbnail URLs for previews to reduce bandwidth
6. **CDN Caching**: Leverage CDN URLs for faster document access
7. **Vector Search**: Use semantic search for better document discovery
8. **Chunking**: Adjust chunk size based on document structure for optimal RAG performance

---

## Complete Upload and Chat Workflow

```bash
# 1. Upload Document
curl -X POST http://localhost:3001/api/documents/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@contract.pdf" \
  -F 'metadata={"type":"contract"}'

# 2. Check Processing Status
curl -X GET http://localhost:3001/api/documents/doc_abc123 \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Search Document Content
curl -X GET "http://localhost:3001/api/documents/search?q=payment+terms" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Use in RAG Chat (see CHAT_API_QUICK_REFERENCE.md)
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "documentId": "doc_abc123",
    "message": "What are the payment terms in this contract?"
  }'
```

---

## Related Documentation

- [Embedding Service](./EMBEDDING_SERVICE.md)
- [Chat API RAG Implementation](./CHAT_API_RAG_IMPLEMENTATION.md)
- [Phase 4 Architecture](./PHASE_4_ARCHITECTURE.md)
- [API Routes Index](./API_ROUTES_INDEX.md)

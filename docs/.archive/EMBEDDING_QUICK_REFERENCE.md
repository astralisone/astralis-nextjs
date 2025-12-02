# Embedding Service - Quick Reference

## Installation

```bash
npm install openai
# OpenAI SDK is required (will be installed separately)
```

## Environment Setup

```bash
# .env.local
OPENAI_API_KEY="sk-..."
```

## Quick Start

```typescript
import { getEmbeddingService } from '@/lib/services/embedding.service';

const embeddingService = getEmbeddingService();

// Embed a document
await embeddingService.embedDocument('doc_abc123');
```

## Common Operations

### 1. Embed Single Document

```typescript
await embeddingService.embedDocument(documentId);
```

### 2. Embed Multiple Documents

```typescript
const result = await embeddingService.embedDocuments([
  'doc_1',
  'doc_2',
  'doc_3',
]);

console.log(`Success: ${result.successful.length}`);
console.log(`Failed: ${result.failed.length}`);
```

### 3. Search Similar Chunks

```typescript
const results = await embeddingService.searchSimilarChunks(
  'your search query',
  orgId,
  5 // top 5 results
);

results.forEach((r) => {
  console.log(`[${r.similarity.toFixed(3)}] ${r.content.substring(0, 100)}...`);
});
```

### 4. Get Embedding Stats

```typescript
const stats = await embeddingService.getEmbeddingStats(documentId);
console.log(`Chunks: ${stats.totalChunks}`);
console.log(`Avg size: ${stats.avgChunkSize} words`);
```

## API Routes

### Embed Document

```bash
POST /api/documents/:id/embed
Authorization: Bearer <token>

Response:
{
  "success": true,
  "documentId": "doc_abc123",
  "stats": {
    "totalChunks": 31,
    "totalWords": 15432,
    "avgChunkSize": 498,
    "minChunkSize": 245,
    "maxChunkSize": 698
  }
}
```

### Get Embedding Stats

```bash
GET /api/documents/:id/embed
Authorization: Bearer <token>

Response:
{
  "success": true,
  "embedded": true,
  "stats": { ... }
}
```

### Search Documents

```bash
POST /api/documents/search
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "payment terms",
  "topK": 5,
  "documentId": "doc_abc123", // optional
  "minSimilarity": 0.7 // optional
}

Response:
{
  "success": true,
  "query": "payment terms",
  "results": [
    {
      "documentId": "doc_abc123",
      "chunkIndex": 5,
      "content": "Payment terms are net 30 days...",
      "similarity": 0.892,
      "document": {
        "fileName": "contract.pdf",
        "originalName": "Contract_2024.pdf",
        "mimeType": "application/pdf"
      }
    }
  ]
}
```

## Configuration

### Chunking Options

```typescript
const chunks = embeddingService.chunkText(text, {
  chunkSize: 500, // words per chunk
  overlap: 50, // overlap in words
  maxChunkSize: 800, // hard limit
});
```

### Default Settings

- **Model**: `text-embedding-3-small` (1536 dimensions)
- **Chunk size**: 500 words
- **Overlap**: 50 words
- **Batch size**: 20 chunks per API request
- **Rate limit delay**: 100ms between batches
- **Max retries**: 3 with exponential backoff

## Common Errors

### "OpenAI API key is required"

```bash
# Set environment variable
export OPENAI_API_KEY="sk-..."
```

### "Document has no OCR text"

```typescript
// Run OCR first
import { getOCRService } from '@/lib/services/ocr.service';
await getOCRService().processDocument(documentId);

// Then embed
await embeddingService.embedDocument(documentId);
```

### Rate Limit Exceeded

```typescript
// Service retries automatically with exponential backoff
// If persistent, reduce batch size:
embeddingService.batchSize = 10;
embeddingService.rateLimitDelayMs = 500;
```

## RAG Workflow

```typescript
// 1. Embed documents
await embeddingService.embedDocument(documentId);

// 2. Search for relevant context
const results = await embeddingService.searchSimilarChunks(
  userQuestion,
  orgId,
  3 // top 3 chunks
);

// 3. Build context
const context = results.map((r) => r.content).join('\n\n');

// 4. Generate answer with GPT-4
const prompt = `
Context:
${context}

Question: ${userQuestion}

Answer:
`;

const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: prompt }],
});
```

## Performance Tips

1. **Batch processing**: Use `embedDocuments()` for multiple documents
2. **Filter before embedding**: Only embed documents with OCR text
3. **Monitor progress**: Check console logs for processing status
4. **Retry failures**: Handle failed embeddings gracefully
5. **Use stats**: Monitor chunk quality with `getEmbeddingStats()`

## Database Queries

### Get all embedded documents

```typescript
const documents = await prisma.document.findMany({
  where: {
    orgId,
    embeddings: { some: {} },
  },
  include: {
    _count: { select: { embeddings: true } },
  },
});
```

### Get chunks for a document

```typescript
const chunks = await prisma.documentEmbedding.findMany({
  where: { documentId },
  orderBy: { chunkIndex: 'asc' },
  select: {
    chunkIndex: true,
    content: true,
  },
});
```

### Delete embeddings

```typescript
await prisma.documentEmbedding.deleteMany({
  where: { documentId },
});
```

## Testing Checklist

- [ ] Environment variable `OPENAI_API_KEY` is set
- [ ] Document has OCR text before embedding
- [ ] Document status is `COMPLETED`
- [ ] Organization ID is valid
- [ ] User has access to document
- [ ] Search returns relevant results
- [ ] Similarity scores are between 0 and 1
- [ ] Error handling works for missing documents
- [ ] Rate limiting retries work
- [ ] Activity logs are created

## File Structure

```
src/lib/services/
  └── embedding.service.ts     # Main service

src/app/api/documents/
  ├── [id]/embed/route.ts      # Embed endpoint
  └── search/route.ts          # Search endpoint

docs/
  ├── EMBEDDING_SERVICE.md            # Full documentation
  └── EMBEDDING_QUICK_REFERENCE.md    # This file

prisma/schema.prisma
  └── DocumentEmbedding model  # Database schema
```

## Next Steps

1. Install OpenAI SDK: `npm install openai`
2. Set `OPENAI_API_KEY` environment variable
3. Run Prisma migration (if not already done)
4. Test with a sample document
5. Integrate with frontend UI
6. Set up background job for batch processing

## Support

For detailed documentation, see:
- `docs/EMBEDDING_SERVICE.md` - Complete API reference
- `docs/ASTRALISOPS-PRD.md` - Product requirements
- OpenAI Embeddings: https://platform.openai.com/docs/guides/embeddings

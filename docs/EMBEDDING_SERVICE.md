# Embedding Service Documentation

## Overview

The `EmbeddingService` provides intelligent document chunking and OpenAI embedding generation for RAG (Retrieval-Augmented Generation) in the Astralis One platform.

**Location**: `/src/lib/services/embedding.service.ts`

## Features

- **Intelligent Text Chunking**: Splits OCR text into ~500-word segments with configurable overlap
- **OpenAI Integration**: Uses `text-embedding-3-small` model (1536 dimensions)
- **Batch Processing**: Handles large documents efficiently with automatic batching
- **Rate Limiting**: Built-in delays and retry logic to respect OpenAI API limits
- **Exponential Backoff**: Automatic retry with exponential backoff for transient failures
- **Progress Logging**: Detailed console logs for monitoring processing
- **Database Storage**: Stores embeddings in PostgreSQL via Prisma
- **Similarity Search**: Cosine similarity search across document chunks
- **Statistics**: Embedding analytics and quality metrics

## Architecture

```
Document (with ocrText)
    ↓
chunkText() → chunks (500 words each, 50-word overlap)
    ↓
generateEmbeddings() → OpenAI API (batched, retries)
    ↓
storeEmbeddings() → PostgreSQL (DocumentEmbedding table)
    ↓
searchSimilarChunks() → Cosine similarity search
```

## Database Schema

```prisma
model DocumentEmbedding {
  id         String   @id @default(cuid())
  documentId String
  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  orgId      String
  chunkIndex Int      // Position in document (0, 1, 2, ...)
  content    String   @db.Text // The actual text chunk
  embedding  String   @db.Text // JSON array of 1536 floats
  metadata   Json?    // {wordCount, charCount}
  createdAt  DateTime @default(now())

  @@unique([documentId, chunkIndex])
  @@index([documentId])
  @@index([orgId])
}
```

## Usage

### Basic Usage (Singleton Pattern)

```typescript
import { getEmbeddingService } from '@/lib/services/embedding.service';

// Get singleton instance (uses OPENAI_API_KEY from env)
const embeddingService = getEmbeddingService();

// Embed a document (main method)
await embeddingService.embedDocument('doc_abc123');
```

### Chunking Text

```typescript
const text = `
  Long document text here...
  This will be split into chunks...
`;

// Default chunking (500 words, 50-word overlap)
const chunks = embeddingService.chunkText(text);

// Custom chunking options
const customChunks = embeddingService.chunkText(text, {
  chunkSize: 300,
  overlap: 30,
  maxChunkSize: 500,
});

console.log(`Created ${chunks.length} chunks`);
```

### Generating Embeddings

```typescript
const chunks = [
  'First chunk of text...',
  'Second chunk of text...',
  'Third chunk of text...',
];

// Generate embeddings for chunks (auto-batched)
const embeddings = await embeddingService.generateEmbeddings(chunks);

// embeddings is number[][] where each inner array has 1536 dimensions
console.log(`Generated ${embeddings.length} embeddings`);
console.log(`First embedding dimensions: ${embeddings[0].length}`); // 1536
```

### Storing Embeddings

```typescript
const documentId = 'doc_abc123';
const orgId = 'org_xyz789';
const chunks = ['chunk 1', 'chunk 2', 'chunk 3'];
const embeddings = [[0.1, 0.2, ...], [0.3, 0.4, ...], [0.5, 0.6, ...]];

await embeddingService.storeEmbeddings(documentId, orgId, chunks, embeddings);
```

### Complete Workflow (embedDocument)

```typescript
// This is the main orchestration method
// 1. Fetches document from database
// 2. Chunks the OCR text
// 3. Generates embeddings
// 4. Stores in database

await embeddingService.embedDocument('doc_abc123');
```

### Batch Processing Multiple Documents

```typescript
const documentIds = ['doc_1', 'doc_2', 'doc_3'];

const result = await embeddingService.embedDocuments(documentIds);

console.log(`Successful: ${result.successful.length}`);
console.log(`Failed: ${result.failed.length}`);

result.failed.forEach(({ documentId, error }) => {
  console.error(`Document ${documentId} failed: ${error}`);
});
```

### Similarity Search

```typescript
// Search for chunks similar to a query
const query = 'How do I configure the system?';
const orgId = 'org_xyz789';

const results = await embeddingService.searchSimilarChunks(
  query,
  orgId,
  5 // top 5 results
);

results.forEach((result, index) => {
  console.log(`${index + 1}. [${result.similarity.toFixed(3)}] ${result.content.substring(0, 100)}...`);
  console.log(`   Document: ${result.documentId}, Chunk: ${result.chunkIndex}`);
});

// Search within a specific document
const docResults = await embeddingService.searchSimilarChunks(
  query,
  orgId,
  3,
  'doc_specific' // optional documentId filter
);
```

### Get Embedding Statistics

```typescript
const stats = await embeddingService.getEmbeddingStats('doc_abc123');

if (stats) {
  console.log(`Total chunks: ${stats.totalChunks}`);
  console.log(`Total words: ${stats.totalWords}`);
  console.log(`Average chunk size: ${stats.avgChunkSize} words`);
  console.log(`Min chunk size: ${stats.minChunkSize} words`);
  console.log(`Max chunk size: ${stats.maxChunkSize} words`);
}
```

## API Route Example

```typescript
// src/app/api/documents/[id]/embed/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getEmbeddingService } from '@/lib/services/embedding.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const documentId = params.id;

    // Embed the document
    const embeddingService = getEmbeddingService();
    await embeddingService.embedDocument(documentId);

    // Get statistics
    const stats = await embeddingService.getEmbeddingStats(documentId);

    return NextResponse.json({
      success: true,
      documentId,
      stats,
    });
  } catch (error) {
    console.error('Embedding error:', error);
    return NextResponse.json(
      {
        error: 'Failed to embed document',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

## Search API Route Example

```typescript
// src/app/api/documents/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getEmbeddingService } from '@/lib/services/embedding.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { z } from 'zod';

const searchSchema = z.object({
  query: z.string().min(1),
  topK: z.number().int().min(1).max(20).optional().default(5),
  documentId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = session.user.orgId;
    if (!orgId) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 400 });
    }

    const body = await req.json();
    const { query, topK, documentId } = searchSchema.parse(body);

    const embeddingService = getEmbeddingService();
    const results = await embeddingService.searchSimilarChunks(
      query,
      orgId,
      topK,
      documentId
    );

    return NextResponse.json({
      success: true,
      query,
      results,
      count: results.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      {
        error: 'Search failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
```

## Configuration

### Environment Variables

```bash
# Required: OpenAI API key
OPENAI_API_KEY="sk-..."
```

### Chunking Configuration

Default values (can be overridden):

```typescript
{
  chunkSize: 500,      // Target chunk size in words
  overlap: 50,         // Overlap between chunks in words
  maxChunkSize: 800,   // Hard limit on chunk size
}
```

### Retry Configuration

Built-in retry logic:

```typescript
{
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
}
```

### Rate Limiting

- **Batch size**: 20 chunks per API request
- **Delay between batches**: 100ms
- **Exponential backoff**: Automatic for rate limit errors

## Error Handling

### Common Errors

```typescript
try {
  await embeddingService.embedDocument(documentId);
} catch (error) {
  if (error.message.includes('Document not found')) {
    // Handle missing document
  } else if (error.message.includes('has no OCR text')) {
    // Run OCR processing first
  } else if (error.message.includes('rate limit')) {
    // OpenAI rate limit hit (service retries automatically)
  } else if (error.message.includes('api key')) {
    // Invalid or missing API key
  } else {
    // Unknown error
  }
}
```

### Retryable vs Non-Retryable Errors

**Retryable** (automatic retry with backoff):
- Rate limit errors
- Network timeouts
- Connection errors (ECONNRESET, ECONNREFUSED)
- HTTP 500, 502, 503 errors

**Non-Retryable** (fail immediately):
- HTTP 401 (Unauthorized)
- HTTP 403 (Forbidden)
- HTTP 400 (Bad request)
- Invalid API key
- Invalid input

## Best Practices

### 1. Run OCR First

```typescript
// Always ensure document has OCR text before embedding
const document = await prisma.document.findUnique({
  where: { id: documentId },
  select: { ocrText: true, status: true },
});

if (!document.ocrText || document.status !== 'COMPLETED') {
  // Run OCR processing first
  await ocrService.processDocument(documentId);
}

// Then embed
await embeddingService.embedDocument(documentId);
```

### 2. Batch Processing for Multiple Documents

```typescript
// Use embedDocuments() for batch processing
const documentIds = await prisma.document.findMany({
  where: { orgId, status: 'COMPLETED', ocrText: { not: null } },
  select: { id: true },
}).then(docs => docs.map(d => d.id));

const result = await embeddingService.embedDocuments(documentIds);
```

### 3. Monitor Progress

All operations log progress to console:

```
[Embedding] Starting embedding process for document doc_abc123
[Embedding] Processing document: contract.pdf (15432 characters)
[Embedding] Created 31 chunks
[Embedding] Generating embeddings for 31 chunks in 2 batches
[Embedding] Processing batch 1/2 (20 chunks)
[Embedding] Processing batch 2/2 (11 chunks)
[Embedding] Storing 31 embeddings for document doc_abc123
[Embedding] Successfully stored 31 embeddings
[Embedding] Successfully embedded document doc_abc123 in 3245ms
[Embedding] Stats: 31 chunks, 31 embeddings, avg chunk size: 498 chars
```

### 4. Handle Failures Gracefully

```typescript
const result = await embeddingService.embedDocuments(documentIds);

// Log successful embeddings
result.successful.forEach(id => {
  console.log(`✓ Embedded document ${id}`);
});

// Handle failures
result.failed.forEach(({ documentId, error }) => {
  console.error(`✗ Failed to embed ${documentId}: ${error}`);
  // Optionally: queue for retry, notify admin, etc.
});
```

### 5. Use Similarity Search for RAG

```typescript
// RAG workflow: search → retrieve → augment → generate
const userQuestion = "What are the payment terms?";

// 1. Search for relevant chunks
const relevantChunks = await embeddingService.searchSimilarChunks(
  userQuestion,
  orgId,
  3 // top 3 most relevant chunks
);

// 2. Retrieve chunk content
const context = relevantChunks
  .map(chunk => chunk.content)
  .join('\n\n');

// 3. Augment prompt with context
const prompt = `
Context from documents:
${context}

Question: ${userQuestion}

Answer based on the context above:
`;

// 4. Generate response with GPT-4
const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: prompt }],
});

const answer = completion.choices[0].message.content;
```

## Performance Considerations

### Chunking Performance

- **500 words per chunk**: Optimal for embedding model context
- **50-word overlap**: Maintains context across boundaries
- **~2000 characters per chunk**: Efficient token usage

### API Rate Limits

OpenAI `text-embedding-3-small` limits:
- **Tier 1**: 3,000 RPM, 1,000,000 TPM
- **Tier 2**: 5,000 RPM, 5,000,000 TPM

Service handles this automatically:
- Batches of 20 chunks per request
- 100ms delay between batches
- Exponential backoff on rate limit errors

### Database Storage

- Embeddings stored as JSON strings (1536 floats)
- Each embedding ~12KB in database
- Consider pgvector extension for vector operations

## Future Enhancements

### 1. pgvector Integration

```sql
-- Add vector column for native PostgreSQL vector search
ALTER TABLE "DocumentEmbedding"
ADD COLUMN embedding_vector vector(1536);

-- Create index for fast similarity search
CREATE INDEX ON "DocumentEmbedding"
USING ivfflat (embedding_vector vector_cosine_ops)
WITH (lists = 100);
```

### 2. Caching Layer

```typescript
// Cache frequently accessed embeddings in Redis
const cachedEmbedding = await redis.get(`embedding:${documentId}:${chunkIndex}`);
if (cachedEmbedding) {
  return JSON.parse(cachedEmbedding);
}
```

### 3. Streaming Embeddings

```typescript
// For very large documents, process in streams
async *streamEmbeddings(documentId: string) {
  const chunks = this.chunkText(ocrText);
  for (const chunk of chunks) {
    const embedding = await this.generateEmbeddings([chunk]);
    yield { chunk, embedding: embedding[0] };
  }
}
```

## Troubleshooting

### Issue: "OpenAI API key is required"

**Solution**: Set `OPENAI_API_KEY` environment variable:

```bash
export OPENAI_API_KEY="sk-..."
```

### Issue: "Document has no OCR text"

**Solution**: Run OCR processing first:

```typescript
import { getOCRService } from '@/lib/services/ocr.service';

const ocrService = getOCRService();
await ocrService.processDocument(documentId);

// Then embed
await embeddingService.embedDocument(documentId);
```

### Issue: Rate limit errors

**Solution**: Service retries automatically, but if persistent:

```typescript
// Reduce batch size (default: 20)
embeddingService.batchSize = 10;

// Increase delay between batches (default: 100ms)
embeddingService.rateLimitDelayMs = 500;
```

### Issue: Poor search results

**Solution**: Adjust chunking parameters:

```typescript
// Smaller chunks for more precise matching
const chunks = embeddingService.chunkText(text, {
  chunkSize: 300,
  overlap: 50,
});

// Or larger chunks for more context
const chunks = embeddingService.chunkText(text, {
  chunkSize: 700,
  overlap: 100,
});
```

## Testing

```typescript
// Example test
describe('EmbeddingService', () => {
  it('should chunk text correctly', () => {
    const service = getEmbeddingService();
    const text = 'word '.repeat(1000); // 1000 words
    const chunks = service.chunkText(text, {
      chunkSize: 100,
      overlap: 10,
    });

    expect(chunks.length).toBeGreaterThan(9); // ~10 chunks
    expect(chunks[0].split(' ').length).toBeLessThanOrEqual(100);
  });

  it('should generate embeddings', async () => {
    const service = getEmbeddingService();
    const chunks = ['test chunk 1', 'test chunk 2'];
    const embeddings = await service.generateEmbeddings(chunks);

    expect(embeddings.length).toBe(2);
    expect(embeddings[0].length).toBe(1536);
  });
});
```

## References

- [OpenAI Embeddings API](https://platform.openai.com/docs/guides/embeddings)
- [text-embedding-3-small model](https://platform.openai.com/docs/models/embeddings)
- [RAG (Retrieval-Augmented Generation)](https://www.pinecone.io/learn/retrieval-augmented-generation/)
- [Cosine Similarity](https://en.wikipedia.org/wiki/Cosine_similarity)

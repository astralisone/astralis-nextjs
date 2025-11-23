# Chat API with RAG Implementation

Complete implementation of document-based chat using Retrieval-Augmented Generation (RAG) with OpenAI GPT-4 and vector embeddings.

## Overview

The chat API allows users to have conversations about their documents using AI. It uses:
- **Vector Search**: OpenAI text-embedding-3-small (1536 dimensions)
- **LLM**: GPT-4 Turbo for chat responses
- **Storage**: PostgreSQL with DocumentChat and DocumentEmbedding models
- **RAG**: Retrieves relevant document chunks to provide context for AI responses

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Request                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Route Handler                         │
│                  /api/chat (POST/GET)                        │
│                  /api/chat/[id] (GET/DELETE)                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      ChatService                             │
│  - sendMessage(): Send user message, get AI response         │
│  - listChats(): Get user's chat history                      │
│  - getChat(): Get specific chat with messages                │
│  - deleteChat(): Delete conversation                         │
└────────────────────────┬────────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
┌─────────────────┐ ┌──────────────┐ ┌─────────────────┐
│ VectorSearch    │ │   OpenAI     │ │    Prisma       │
│   Service       │ │   GPT-4      │ │   Database      │
│ - searchSimilar │ │ - completion │ │ - DocumentChat  │
│ - createEmbed   │ │              │ │ - Document      │
└─────────────────┘ └──────────────┘ └─────────────────┘
```

## Database Schema

### DocumentChat
```prisma
model DocumentChat {
  id            String       @id @default(cuid())
  documentId    String?      // null = multi-document chat
  document      Document?    @relation(fields: [documentId], references: [id], onDelete: Cascade)
  userId        String
  user          users        @relation(fields: [userId], references: [id])
  orgId         String
  organization  organization @relation(fields: [orgId], references: [id])
  title         String?      // Auto-generated from first message
  messages      Json         // Array of {role, content, timestamp, sources?}
  lastMessageAt DateTime     @default(now())
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}
```

### DocumentEmbedding
```prisma
model DocumentEmbedding {
  id         String   @id @default(cuid())
  documentId String
  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  orgId      String
  chunkIndex Int      // Position in document (0, 1, 2, ...)
  content    String   @db.Text // The actual text chunk
  embedding  String   @db.Text // JSON array of 1536 floats
  metadata   Json?    // {page, section, etc.}
  createdAt  DateTime @default(now())
}
```

## API Endpoints

### POST /api/chat - Send Message

Send a chat message and get AI response with RAG.

**Request:**
```typescript
POST /api/chat
Content-Type: application/json
Authorization: Session cookie

{
  "chatId": "clxxx...",        // Optional: existing chat ID
  "documentId": "clxxx...",    // Optional: specific document
  "message": "What is the main topic?",
  "maxContextChunks": 5,       // Optional: max chunks (default: 5)
  "temperature": 0.7           // Optional: GPT temp (default: 0.7)
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "chatId": "clxxx...",
    "message": "Based on the document, the main topic is...",
    "sources": [
      {
        "documentId": "clxxx...",
        "documentName": "report.pdf",
        "chunkIndex": 3,
        "content": "The main topic discussed is...",
        "similarity": 0.87
      }
    ],
    "tokensUsed": 1234
  }
}
```

**Response (400):**
```json
{
  "error": "Validation failed",
  "details": {
    "message": ["Message cannot be empty"]
  }
}
```

**Response (401):**
```json
{
  "error": "Unauthorized",
  "message": "You must be logged in to use chat"
}
```

**Response (500):**
```json
{
  "error": "Chat error",
  "message": "Failed to send message: ..."
}
```

### GET /api/chat - List Chats

Get user's chat conversation history.

**Request:**
```
GET /api/chat?limit=50&offset=0&documentId=clxxx...
Authorization: Session cookie
```

**Query Parameters:**
- `limit` (optional): Max results (default: 50, max: 100)
- `offset` (optional): Pagination offset (default: 0)
- `documentId` (optional): Filter by document ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "chats": [
      {
        "id": "clxxx...",
        "title": "Discussion about Q3 Report",
        "documentId": "clxxx...",
        "document": {
          "id": "clxxx...",
          "originalName": "q3-report.pdf",
          "fileName": "documents/orgId/q3-report-xyz.pdf"
        },
        "messageCount": 8,
        "lastMessageAt": "2025-01-20T10:30:00Z",
        "createdAt": "2025-01-20T09:00:00Z"
      }
    ],
    "pagination": {
      "total": 42,
      "limit": 50,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

### GET /api/chat/[id] - Get Chat

Get specific chat with full message history.

**Request:**
```
GET /api/chat/clxxx...
Authorization: Session cookie
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "title": "Discussion about Q3 Report",
    "documentId": "clxxx...",
    "document": {
      "id": "clxxx...",
      "originalName": "q3-report.pdf",
      "fileName": "documents/orgId/q3-report-xyz.pdf",
      "cdnUrl": "https://cdn.example.com/..."
    },
    "messages": [
      {
        "role": "user",
        "content": "What is the revenue for Q3?",
        "timestamp": "2025-01-20T09:00:00Z"
      },
      {
        "role": "assistant",
        "content": "According to Source 1, the Q3 revenue was $2.5M...",
        "timestamp": "2025-01-20T09:00:05Z",
        "sources": [
          {
            "documentId": "clxxx...",
            "chunkIndex": 5,
            "content": "Q3 revenue totaled $2.5M...",
            "similarity": 0.92
          }
        ]
      }
    ],
    "lastMessageAt": "2025-01-20T10:30:00Z",
    "createdAt": "2025-01-20T09:00:00Z",
    "updatedAt": "2025-01-20T10:30:00Z"
  }
}
```

**Response (404):**
```json
{
  "error": "Not found",
  "message": "Chat not found or you do not have access"
}
```

### DELETE /api/chat/[id] - Delete Chat

Delete a chat conversation.

**Request:**
```
DELETE /api/chat/clxxx...
Authorization: Session cookie
```

**Response (200):**
```json
{
  "success": true,
  "message": "Chat deleted successfully"
}
```

**Response (404):**
```json
{
  "error": "Not found",
  "message": "Chat not found or you do not have access"
}
```

## Services

### ChatService

Located at: `src/lib/services/chat.service.ts`

**Methods:**
- `sendMessage()`: Send user message, retrieve context, get GPT-4 response
- `listChats()`: Get user's chat history with pagination
- `getChat()`: Get specific chat with full message history
- `deleteChat()`: Delete chat conversation
- `generateChatTitle()`: Auto-generate title from first message

**Example Usage:**
```typescript
import { getChatService } from '@/lib/services/chat.service';

const chatService = getChatService();

const result = await chatService.sendMessage(
  userId,
  orgId,
  "What are the key findings?",
  chatId, // optional
  documentId, // optional
  5, // maxContextChunks
  0.7 // temperature
);

console.log(result.response.message);
console.log(result.response.sources);
```

### VectorSearchService

Located at: `src/lib/services/vector-search.service.ts`

**Methods:**
- `generateEmbedding()`: Generate 1536-dim vector for text
- `searchSimilarChunks()`: Find relevant chunks using cosine similarity
- `createEmbeddings()`: Create embeddings for document chunks
- `deleteEmbeddings()`: Delete all embeddings for a document
- `chunkText()`: Split text into overlapping chunks
- `getEmbeddingCount()`: Get number of embeddings for a document

**Example Usage:**
```typescript
import { getVectorSearchService } from '@/lib/services/vector-search.service';

const vectorService = getVectorSearchService();

// Search for relevant chunks
const results = await vectorService.searchSimilarChunks(
  "What is the revenue?",
  orgId,
  documentId, // optional
  5, // topK
  0.5 // minSimilarity
);

// Create embeddings
const chunks = vectorService.chunkText(ocrText, 1000, 200);
const chunkData = chunks.map((content, i) => ({ content, metadata: { i } }));
await vectorService.createEmbeddings(documentId, orgId, chunkData);
```

## Embedding Helper Utilities

Located at: `src/lib/utils/embedding-helper.ts`

**Functions:**
- `createEmbeddingsForDocument()`: Create embeddings for a single document
- `createEmbeddingsForOrganization()`: Batch process all documents in org
- `hasEmbeddings()`: Check if document has embeddings
- `getEmbeddingStats()`: Get embedding statistics
- `reEmbedAllDocuments()`: Re-embed all documents (after strategy change)

**Example Usage:**
```typescript
import { createEmbeddingsForDocument } from '@/lib/utils/embedding-helper';

// Create embeddings for a document
await createEmbeddingsForDocument(documentId);

// Batch process organization
import { createEmbeddingsForOrganization } from '@/lib/utils/embedding-helper';
const stats = await createEmbeddingsForOrganization(orgId, 5);
console.log(`Processed: ${stats.processed}, Failed: ${stats.failed}`);
```

## Workflow

### 1. Document Upload & Processing
```
User uploads PDF → Document record created → OCR processing → ocrText saved
```

### 2. Embedding Creation
```
OCR text → chunk into 1000-char pieces (200 overlap)
→ generate embeddings (1536-dim vectors)
→ save to DocumentEmbedding table
```

### 3. Chat Flow
```
User sends message → search similar chunks (cosine similarity)
→ retrieve top 5 relevant chunks → build context
→ GPT-4 completion with context → save messages to chat
```

## Configuration

### Environment Variables

Required in `.env.local`:
```bash
# OpenAI API Key (required)
OPENAI_API_KEY="sk-..."

# Database
DATABASE_URL="postgresql://..."

# NextAuth (for authentication)
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3001"
```

## Chunking Strategy

**Default Parameters:**
- **Chunk Size**: 1000 characters
- **Overlap**: 200 characters
- **Why overlap?**: Ensures context continuity at chunk boundaries

**Example:**
```
Text: "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
Chunk size: 10, Overlap: 3

Chunk 1: "ABCDEFGHIJ"
Chunk 2: "HIJKLMNOPQ"  (overlap: HIJ)
Chunk 3: "OPQRSTUVWX"  (overlap: OPQ)
Chunk 4: "VWXYZ"       (overlap: VWX)
```

## RAG Context Building

**System Prompt Template:**
```
You are a helpful AI assistant with access to {scope}.

CONTEXT:
[Source 1]: {chunk1}
[Source 2]: {chunk2}
...

INSTRUCTIONS:
- Answer using ONLY the context above
- Cite sources when making claims
- If insufficient context, say so
- Do not infer beyond what's stated
```

**Chat History:**
- Previous messages included in GPT-4 call for continuity
- Format: `[{role: 'user'|'assistant', content: string}]`

## Performance Considerations

### Vector Search
- **In-memory search**: Fetches all embeddings for org, calculates similarity in Node.js
- **Limitation**: Does not scale beyond ~10K embeddings per org
- **Future**: Use pgvector extension for PostgreSQL-native vector search

### Embedding Generation
- **Batch size**: 100 texts per OpenAI API call (max allowed)
- **Cost**: ~$0.0001 per 1K tokens (text-embedding-3-small)
- **Speed**: ~1-2 seconds for 100 chunks

### GPT-4 Response
- **Model**: gpt-4-turbo-preview
- **Max tokens**: 1000 (response limit)
- **Cost**: ~$0.01 per 1K input tokens, ~$0.03 per 1K output tokens
- **Latency**: 2-5 seconds typical

## Security

### Access Control
- **Authentication**: Required for all endpoints (NextAuth session)
- **Authorization**: Users can only access their own chats
- **Org Isolation**: Vector search scoped to user's organization
- **Document Access**: Chats inherit document access permissions

### Data Privacy
- **Embeddings**: Stored as JSON arrays in database (not sent to OpenAI after generation)
- **Chat History**: Stored in `messages` JSON field (encrypted at rest via PostgreSQL)
- **API Keys**: Never exposed to client, used only in server-side services

## Error Handling

### Common Errors

**1. No embeddings found**
```
Error: No embeddings found for orgId: xxx, documentId: yyy
Solution: Run OCR processing + embedding creation first
```

**2. OpenAI API key missing**
```
Error: OPENAI_API_KEY environment variable is not set
Solution: Add OPENAI_API_KEY to .env.local
```

**3. Chat not found**
```
Error: Chat not found or you do not have access
Solution: Verify chatId and user ownership
```

**4. Token limit exceeded**
```
Error: Context too large for model
Solution: Reduce maxContextChunks or chunk size
```

## Testing

### Manual Testing with cURL

**Send chat message:**
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{
    "message": "What is the main topic of this document?",
    "documentId": "clxxx...",
    "maxContextChunks": 5
  }'
```

**List chats:**
```bash
curl -X GET "http://localhost:3001/api/chat?limit=10&offset=0" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Get specific chat:**
```bash
curl -X GET http://localhost:3001/api/chat/clxxx... \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**Delete chat:**
```bash
curl -X DELETE http://localhost:3001/api/chat/clxxx... \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

## Troubleshooting

### No results from vector search
1. Check if embeddings exist: `SELECT COUNT(*) FROM "DocumentEmbedding" WHERE "documentId" = 'xxx';`
2. Verify OCR text exists: `SELECT "ocrText" FROM "Document" WHERE id = 'xxx';`
3. Run embedding creation: `await createEmbeddingsForDocument(documentId);`

### Chat title not generating
- Check GPT-3.5-turbo API access
- Verify first message is not empty
- Falls back to "New Chat" on error

### High latency
- **Vector search**: Optimize by using pgvector extension
- **GPT-4**: Reduce maxContextChunks or use GPT-3.5-turbo
- **Embeddings**: Pre-generate during document processing

## Future Enhancements

1. **pgvector Integration**: Use PostgreSQL vector extension for faster similarity search
2. **Streaming Responses**: Stream GPT-4 responses for better UX
3. **Multi-modal Chat**: Support image-based questions with GPT-4 Vision
4. **Chat Sharing**: Allow sharing chat conversations with team members
5. **Export**: Export chat history as PDF or Markdown
6. **Fine-tuning**: Fine-tune embeddings on domain-specific data
7. **Hybrid Search**: Combine vector search with keyword search (BM25)

## Related Files

- `/src/app/api/chat/route.ts` - POST/GET endpoints
- `/src/app/api/chat/[id]/route.ts` - GET/DELETE endpoints
- `/src/lib/services/chat.service.ts` - Chat business logic
- `/src/lib/services/vector-search.service.ts` - Vector search & embeddings
- `/src/lib/validators/chat.validators.ts` - Zod validation schemas
- `/src/lib/utils/embedding-helper.ts` - Embedding utilities
- `/prisma/schema.prisma` - DocumentChat & DocumentEmbedding models

## References

- [OpenAI Embeddings API](https://platform.openai.com/docs/guides/embeddings)
- [OpenAI Chat Completions API](https://platform.openai.com/docs/guides/chat)
- [Retrieval-Augmented Generation (RAG)](https://arxiv.org/abs/2005.11401)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Client Reference](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)

# Chat API Quick Reference

Fast reference guide for implementing document-based chat with RAG.

## Setup Checklist

- [ ] Add `OPENAI_API_KEY` to `.env.local`
- [ ] Ensure database schema includes `DocumentChat` and `DocumentEmbedding` models
- [ ] Run `npx prisma generate` to update Prisma client
- [ ] Upload documents and run OCR processing
- [ ] Create embeddings for documents

## API Endpoints Summary

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/chat` | Send message, get AI response | Required |
| GET | `/api/chat` | List user's chats | Required |
| GET | `/api/chat/[id]` | Get chat with messages | Required |
| DELETE | `/api/chat/[id]` | Delete chat | Required |

## Quick Examples

### Send First Message (New Chat)
```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "What is this document about?",
    documentId: "clxxx...", // optional
    maxContextChunks: 5
  })
});

const data = await response.json();
console.log(data.data.chatId); // Save for next message
console.log(data.data.message); // AI response
console.log(data.data.sources); // Source citations
```

### Continue Existing Chat
```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chatId: "clxxx...", // existing chat
    message: "Can you elaborate on that?"
  })
});
```

### List All Chats
```typescript
const response = await fetch('/api/chat?limit=20&offset=0');
const data = await response.json();
console.log(data.data.chats); // Array of chats
console.log(data.data.pagination); // Pagination info
```

### Get Chat History
```typescript
const response = await fetch('/api/chat/clxxx...');
const data = await response.json();
console.log(data.data.messages); // Full message history
```

### Delete Chat
```typescript
const response = await fetch('/api/chat/clxxx...', {
  method: 'DELETE'
});
```

## Service Usage

### Create Embeddings for Document
```typescript
import { createEmbeddingsForDocument } from '@/lib/utils/embedding-helper';

// After OCR processing completes
await createEmbeddingsForDocument(documentId);
```

### Batch Create Embeddings
```typescript
import { createEmbeddingsForOrganization } from '@/lib/utils/embedding-helper';

const stats = await createEmbeddingsForOrganization(orgId);
console.log(`Success: ${stats.processed}, Failed: ${stats.failed}`);
```

### Direct Service Usage
```typescript
import { getChatService } from '@/lib/services/chat.service';

const chatService = getChatService();
const result = await chatService.sendMessage(
  userId,
  orgId,
  "What are the key points?",
  undefined, // chatId (creates new)
  documentId, // optional
  5, // maxContextChunks
  0.7 // temperature
);
```

## Common Patterns

### Single-Document Chat
```typescript
// User clicks "Chat with Document" button
POST /api/chat
{
  "documentId": "clxxx...",
  "message": "Summarize this document"
}
```

### Multi-Document Chat
```typescript
// User asks question across all documents
POST /api/chat
{
  "message": "What do all reports say about revenue?",
  // No documentId = search all org documents
}
```

### Chat with Context Control
```typescript
POST /api/chat
{
  "chatId": "clxxx...",
  "message": "Explain in detail",
  "maxContextChunks": 10, // More context
  "temperature": 0.3 // More focused response
}
```

## Response Structure

### Success Response
```typescript
{
  success: true,
  data: {
    chatId: string,
    message: string,
    sources: Array<{
      documentId: string,
      documentName: string,
      chunkIndex: number,
      content: string,
      similarity: number
    }>,
    tokensUsed?: number
  }
}
```

### Error Response
```typescript
{
  error: string,
  message: string,
  details?: object
}
```

## Environment Variables

Required:
```bash
OPENAI_API_KEY="sk-..."
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
```

Optional (with defaults):
```bash
CHAT_MODEL="gpt-4-turbo-preview"
EMBEDDING_MODEL="text-embedding-3-small"
CHUNK_SIZE="1000"
CHUNK_OVERLAP="200"
MAX_CONTEXT_CHUNKS="5"
MIN_SIMILARITY="0.5"
```

## Workflow Integration

### After Document Upload
```typescript
// 1. Upload document
const uploadResponse = await uploadDocument(file);
const documentId = uploadResponse.id;

// 2. Wait for OCR to complete
// (webhook or polling)

// 3. Create embeddings
await createEmbeddingsForDocument(documentId);

// 4. Ready for chat!
const chatResponse = await sendChatMessage({
  documentId,
  message: "What is this about?"
});
```

### Background Processing
```typescript
// Queue embedding creation after OCR
await queueDocumentProcessing({
  documentId,
  performOCR: true,
  performEmbedding: true, // Add this flag
});
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No results from search | Create embeddings first |
| "OPENAI_API_KEY not set" | Add to `.env.local` |
| Chat not found | Verify chatId and user ownership |
| Slow responses | Reduce maxContextChunks |
| Empty sources | Check if document has OCR text |

## Performance Tips

1. **Pre-generate embeddings**: Create during OCR processing
2. **Limit context**: Use 3-5 chunks for faster responses
3. **Cache common queries**: Store results for FAQ-type questions
4. **Batch operations**: Process multiple documents in parallel
5. **Use pgvector**: For 10K+ embeddings per org

## Cost Estimation

**Embeddings** (text-embedding-3-small):
- ~$0.0001 per 1K tokens
- Average document (5 pages): ~$0.001

**Chat** (gpt-4-turbo-preview):
- Input: ~$0.01 per 1K tokens
- Output: ~$0.03 per 1K tokens
- Average query: ~$0.05

**Monthly estimate** (100 documents, 1000 queries):
- Embeddings: $0.10
- Chat: $50
- **Total: ~$50/month**

## Files Reference

```
src/
├── app/api/chat/
│   ├── route.ts              # POST/GET endpoints
│   └── [id]/route.ts         # GET/DELETE endpoints
├── lib/
│   ├── services/
│   │   ├── chat.service.ts
│   │   └── vector-search.service.ts
│   ├── validators/
│   │   └── chat.validators.ts
│   └── utils/
│       └── embedding-helper.ts
└── docs/
    ├── CHAT_API_RAG_IMPLEMENTATION.md  # Full docs
    └── CHAT_API_QUICK_REFERENCE.md     # This file
```

## Next Steps

1. Add streaming support for real-time responses
2. Implement chat sharing between team members
3. Add export functionality (PDF/Markdown)
4. Create frontend chat UI components
5. Integrate with n8n workflows for automated chat triggers

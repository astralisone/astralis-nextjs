# Document Processing Components

React components for Phase 4 document upload, processing, and viewing with OCR support.

## Quick Start

```typescript
import { DocumentUploader, DocumentCard, DocumentViewer, DocumentChat } from '@/components/documents';
import { useDocuments, useUploadDocument } from '@/hooks/useDocuments';

function MyDocumentsPage() {
  const { data } = useDocuments();
  const { mutate: upload } = useUploadDocument();

  return (
    <div>
      <DocumentUploader onComplete={() => console.log('Done!')} />

      {data?.documents.map(doc => (
        <DocumentCard key={doc.id} document={doc} />
      ))}

      {/* AI-powered document chat */}
      <DocumentChat
        documentId={selectedDocId}
        orgId="org-123"
        userId="user-456"
      />
    </div>
  );
}
```

## Components

### DocumentUploader
Drag-and-drop file uploader with progress tracking.

**Usage**:
```tsx
<DocumentUploader
  maxSize={10 * 1024 * 1024}  // 10MB
  maxFiles={5}
  acceptedTypes={['image/jpeg', 'image/png', 'application/pdf']}
  onComplete={() => refetch()}
/>
```

### DocumentCard
Compact card displaying document info, status, and actions.

**Usage**:
```tsx
<DocumentCard
  document={myDocument}
  onView={(doc) => setSelectedDoc(doc)}
  showActions={true}
/>
```

### DocumentViewer
Full-screen viewer with zoom, rotation, OCR overlay.

**Usage**:
```tsx
<DocumentViewer
  document={selectedDocument}
  isOpen={!!selectedDocument}
  onClose={() => setSelectedDoc(null)}
/>
```

### DocumentChat
AI-powered chat interface for document Q&A with source citations.

**Features**:
- Message history display (user and AI responses)
- Source citations from retrieved document chunks
- Auto-scroll to latest message
- Loading states with spinner
- Error handling
- Auto-resizing textarea input
- Enter to send, Shift+Enter for new line

**Usage**:
```tsx
// Chat with specific document
<DocumentChat
  documentId="doc-123"
  orgId="org-456"
  userId="user-789"
/>

// Chat across all documents
<DocumentChat
  orgId="org-456"
  userId="user-789"
/>

// Continue existing chat
<DocumentChat
  chatId="chat-abc-123"
  documentId="doc-123"
  orgId="org-456"
  userId="user-789"
/>
```

**Props**:
- `documentId?: string` - Optional document ID to scope chat
- `orgId: string` - Required organization ID
- `userId: string` - Required user ID
- `chatId?: string` - Optional chat ID for continuing conversation
- `className?: string` - Additional CSS classes

## Hooks

### useDocuments(filters?)
Fetch paginated document list.

```tsx
const { data, isLoading, error } = useDocuments({
  status: 'COMPLETED',
  mimeType: 'image/',
  limit: 12,
  offset: 0
});
```

### useDocument(documentId)
Fetch single document with auto-polling for processing status.

```tsx
const { data: document } = useDocument('doc-123');
// Polls every 5s while status is PENDING or PROCESSING
```

### useUploadDocument()
Upload file with progress tracking.

```tsx
const { mutate: upload, isPending } = useUploadDocument();

upload({
  file: myFile,
  onProgress: (progress) => setProgress(progress)
});
```

### useDeleteDocument()
Delete document mutation.

```tsx
const { mutate: deleteDoc } = useDeleteDocument();
deleteDoc(documentId);
```

### useRetryDocument()
Retry failed document processing.

```tsx
const { mutate: retry } = useRetryDocument();
retry(documentId);
```

## Types

```typescript
interface Document {
  id: string;
  fileName: string;
  originalName: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  ocrText: string | null;
  ocrConfidence: number | null;
  extractedData: Record<string, any> | null;
  cdnUrl: string | null;
  thumbnailUrl: string | null;
  fileSize: number;
  mimeType: string;
  // ... more fields
}
```

## Storybook

View component stories:
```bash
npm run storybook
```

Navigate to:
- Documents/DocumentUploader
- Documents/DocumentCard
- Documents/DocumentViewer
- Documents/DocumentChat

## Status Flow

```
PENDING → PROCESSING → COMPLETED
                    ↘ FAILED (can retry)
```

## Accessibility

- Full keyboard navigation
- ARIA labels on all interactive elements
- Screen reader announcements
- Focus management in modals

## Design Tokens

- Primary: Astralis Blue (#2B6CB0)
- Success: Green (#38A169)
- Warning: Orange (#DD6B20)
- Error: Red (#E53E3E)
- Border radius: 8px
- Transitions: 200ms ease-out

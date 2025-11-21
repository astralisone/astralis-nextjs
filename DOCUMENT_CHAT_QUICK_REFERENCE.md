# DocumentChat Quick Reference

## Import

```tsx
import { DocumentChat } from '@/components/documents';
```

## Basic Usage

```tsx
<DocumentChat
  documentId="doc-123"    // Optional
  orgId="org-456"         // Required
  userId="user-789"       // Required
  chatId="chat-abc"       // Optional
  className="h-[700px]"   // Optional
/>
```

## Common Patterns

### With NextAuth Session
```tsx
import { useSession } from 'next-auth/react';

const { data: session } = useSession();

{session?.user && (
  <DocumentChat
    documentId={selectedDocId}
    orgId={session.user.orgId}
    userId={session.user.id}
  />
)}
```

### All Documents Chat
```tsx
<DocumentChat
  orgId={session.user.orgId}
  userId={session.user.id}
  // Omit documentId to chat across all docs
/>
```

### Continue Existing Chat
```tsx
<DocumentChat
  chatId="chat-existing-123"
  documentId="doc-123"
  orgId={session.user.orgId}
  userId={session.user.id}
/>
```

### Full Page Layout
```tsx
<div className="h-screen p-4">
  <DocumentChat
    orgId={session.user.orgId}
    userId={session.user.id}
    className="h-full"
  />
</div>
```

### Sidebar Widget
```tsx
<div className="w-96 h-[600px]">
  <DocumentChat
    documentId={selectedDocId}
    orgId={session.user.orgId}
    userId={session.user.id}
  />
</div>
```

## Props Reference

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `documentId` | `string` | No | Document ID to scope chat to specific document |
| `orgId` | `string` | Yes | Organization ID for scoping |
| `userId` | `string` | Yes | User ID for authentication |
| `chatId` | `string` | No | Chat ID for continuing existing conversation |
| `className` | `string` | No | Additional CSS classes |

## Features

- ✅ Message history (user + AI)
- ✅ Source citations with similarity scores
- ✅ Auto-scroll to latest message
- ✅ Loading states with spinner
- ✅ Error handling with alerts
- ✅ Auto-resizing textarea
- ✅ Keyboard shortcuts (Enter/Shift+Enter)
- ✅ Responsive design
- ✅ Astralis brand styling

## Keyboard Shortcuts

- **Enter**: Send message
- **Shift+Enter**: New line in textarea
- **Tab**: Navigate UI elements

## Styling Examples

### Custom Height
```tsx
className="h-[500px]"
className="h-screen"
className="min-h-[600px] max-h-[900px]"
```

### Custom Border
```tsx
className="border-2 border-astralis-blue"
className="rounded-lg shadow-lg"
```

### Layout Classes
```tsx
className="w-full max-w-4xl mx-auto"
className="lg:col-span-2"
```

## API Integration

Component uses `useChatAPI` hook which calls:
- **POST /api/chat**: Send message
- **GET /api/chat/:chatId**: Load history
- **GET /api/chat**: List chats

## Files

- **Component**: `src/components/documents/DocumentChat.tsx`
- **Stories**: `src/components/documents/DocumentChat.stories.tsx`
- **Examples**: `src/components/documents/DocumentChat.example.tsx`
- **Export**: `src/components/documents/index.ts`

## Storybook

```bash
npm run storybook
# Navigate to: Documents/DocumentChat
```

## TypeScript

```typescript
interface DocumentChatProps {
  documentId?: string;
  orgId: string;
  userId: string;
  chatId?: string;
  className?: string;
}
```

## Brand Colors

- **User Messages**: `bg-astralis-blue` (#2B6CB0)
- **AI Messages**: `bg-white` with slate border
- **Sources**: `bg-slate-50` with blue accents
- **Loading**: `text-astralis-blue`
- **Errors**: Red variant alerts

## Common Issues

### Session Not Available
```tsx
// Always check session before rendering
{session?.user && <DocumentChat {...props} />}
```

### Height Not Working
```tsx
// Parent must have defined height
<div className="h-screen">
  <DocumentChat className="h-full" />
</div>
```

### Auto-scroll Issues
```tsx
// Component handles this automatically
// No action needed
```

## Related Components

- `DocumentCard`: Display document info
- `DocumentViewer`: View document content
- `DocumentUploader`: Upload new documents

## See Also

- Full Documentation: `DOCUMENT_CHAT_IMPLEMENTATION.md`
- Documents README: `src/components/documents/README.md`
- Chat API Client: `src/lib/api/chat.client.ts`

/**
 * DocumentChat Usage Example
 *
 * This file demonstrates how to integrate DocumentChat into a real application page.
 * It shows common patterns like:
 * - Session-based authentication
 * - Responsive layout
 * - Integration with document list
 * - State management
 */

'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { DocumentChat } from './DocumentChat';
import { DocumentCard } from './DocumentCard';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, MessageSquare } from 'lucide-react';

/**
 * Example: Document Chat Page
 *
 * Full-page layout with document list and chat interface
 */
export function DocumentChatPageExample() {
  const { data: session } = useSession();
  const [selectedDocId, setSelectedDocId] = useState<string | undefined>();
  const [activeChatId, setActiveChatId] = useState<string | undefined>();

  if (!session?.user) {
    return (
      <Alert variant="warning">
        <AlertDescription>Please sign in to use document chat.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document List Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-astralis-blue" />
                Your Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={!selectedDocId ? 'primary' : 'outline'}
                className="w-full justify-start"
                onClick={() => setSelectedDocId(undefined)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat with All Documents
              </Button>

              {/* Example document buttons */}
              <Button
                variant={selectedDocId === 'doc-1' ? 'primary' : 'outline'}
                className="w-full justify-start"
                onClick={() => setSelectedDocId('doc-1')}
              >
                Annual Report 2024.pdf
              </Button>
              <Button
                variant={selectedDocId === 'doc-2' ? 'primary' : 'outline'}
                className="w-full justify-start"
                onClick={() => setSelectedDocId('doc-2')}
              >
                Product Roadmap.docx
              </Button>
              <Button
                variant={selectedDocId === 'doc-3' ? 'primary' : 'outline'}
                className="w-full justify-start"
                onClick={() => setSelectedDocId('doc-3')}
              >
                Meeting Notes Q1.pdf
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <DocumentChat
            documentId={selectedDocId}
            orgId={session.user.orgId}
            userId={session.user.id}
            chatId={activeChatId}
            className="h-[700px]"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Example: Embedded Chat Widget
 *
 * Compact chat widget that can be embedded in document viewer
 */
export function DocumentChatWidgetExample() {
  const { data: session } = useSession();
  const documentId = 'doc-123'; // Would come from props or context

  if (!session?.user) {
    return null;
  }

  return (
    <div className="w-full max-w-md">
      <DocumentChat
        documentId={documentId}
        orgId={session.user.orgId}
        userId={session.user.id}
        className="h-[500px]"
      />
    </div>
  );
}

/**
 * Example: Mobile Responsive Chat
 *
 * Full-screen chat optimized for mobile devices
 */
export function DocumentChatMobileExample() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile Header */}
      <div className="bg-astralis-navy text-white px-4 py-3 flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h1 className="text-lg font-semibold">Document Chat</h1>
      </div>

      {/* Chat fills remaining space */}
      <div className="flex-1">
        <DocumentChat
          orgId={session.user.orgId}
          userId={session.user.id}
          className="h-full rounded-none border-x-0"
        />
      </div>
    </div>
  );
}

/**
 * Example: Chat with Document Selection
 *
 * Shows how to let users switch between documents while maintaining chat
 */
export function DocumentChatWithSelectionExample() {
  const { data: session } = useSession();
  const [selectedDocId, setSelectedDocId] = useState<string>('doc-1');
  const [chatHistory, setChatHistory] = useState<Record<string, string>>({});

  const handleDocumentChange = (docId: string) => {
    setSelectedDocId(docId);
    // Could save/load chat history per document here
  };

  if (!session?.user) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Document Tabs */}
      <div className="flex gap-2 border-b border-slate-300 pb-2">
        <Button
          variant={selectedDocId === 'doc-1' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => handleDocumentChange('doc-1')}
        >
          Contract.pdf
        </Button>
        <Button
          variant={selectedDocId === 'doc-2' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => handleDocumentChange('doc-2')}
        >
          Invoice.pdf
        </Button>
        <Button
          variant={selectedDocId === 'doc-3' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => handleDocumentChange('doc-3')}
        >
          Report.pdf
        </Button>
      </div>

      {/* Chat Interface */}
      <DocumentChat
        key={selectedDocId} // Force remount on document change
        documentId={selectedDocId}
        orgId={session.user.orgId}
        userId={session.user.id}
        chatId={chatHistory[selectedDocId]}
        className="h-[600px]"
      />
    </div>
  );
}

/**
 * Example: TypeScript Usage Patterns
 */
export function TypeScriptExamples() {
  const { data: session } = useSession();

  // Pattern 1: With all props
  const fullExample = (
    <DocumentChat
      documentId="doc-123"
      orgId="org-456"
      userId="user-789"
      chatId="chat-abc"
      className="custom-class"
    />
  );

  // Pattern 2: Session-based (recommended)
  const sessionExample = session?.user ? (
    <DocumentChat
      documentId="doc-123"
      orgId={session.user.orgId}
      userId={session.user.id}
    />
  ) : null;

  // Pattern 3: All documents chat
  const allDocsExample = session?.user ? (
    <DocumentChat
      orgId={session.user.orgId}
      userId={session.user.id}
    />
  ) : null;

  // Pattern 4: With state management
  const [currentDocId, setCurrentDocId] = useState<string | undefined>();
  const stateExample = session?.user ? (
    <DocumentChat
      documentId={currentDocId}
      orgId={session.user.orgId}
      userId={session.user.id}
    />
  ) : null;

  return null; // This is just for demonstration
}

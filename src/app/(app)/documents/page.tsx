'use client';

import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useDocuments, useDocumentStats } from '@/hooks/useDocuments';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { DocumentViewer } from '@/components/documents/DocumentViewer';
import { DocumentChat } from '@/components/documents/DocumentChat';
import { DocumentUploader } from '@/components/documents/DocumentUploader';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/layout/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Document, DocumentStatus } from '@/types/documents';
import {
  Search,
  Filter,
  Upload as UploadIcon,
  FileText,
} from 'lucide-react';

// Test v7: All imports + useMemo + useDocumentStats
// If this works, the issue is in the full JSX

export default function DocumentsPage() {
  const { data: session } = useSession();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showUploader, setShowUploader] = useState(false);

  const {
    data: documentsData,
    isLoading,
    error,
  } = useDocuments({
    limit: 12,
    offset: 0,
  });

  const { data: stats } = useDocumentStats();

  const documents = documentsData?.documents || [];

  // Test useMemo - this is in the full page
  const sortedDocuments = useMemo(() => {
    return [...documents].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [documents]);

  return (
    <PageContainer>
      <PageHeader
        title="Documents"
        description={`v7: All imports + useMemo | OrgId: ${session?.user?.orgId || 'none'}`}
        actions={
          <Button variant="primary" onClick={() => setShowUploader(true)}>
            <UploadIcon className="h-4 w-4 mr-2" />
            Upload
          </Button>
        }
      />

      <div className="p-6 space-y-4">
        <p>Session: {session?.user?.email || 'No session'}</p>
        <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
        <p>Error: {error ? String(error) : 'None'}</p>
        <p>Documents: {sortedDocuments.length}</p>
        <p>Stats: {stats ? JSON.stringify(stats) : 'loading...'}</p>

        {sortedDocuments.length === 0 && !isLoading ? (
          <EmptyState
            icon={FileText}
            title="No documents yet"
            description="Upload your first document to get started"
            primaryAction={{
              label: "Upload Document",
              onClick: () => setShowUploader(true),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedDocuments.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onView={(doc) => setSelectedDocument(doc)}
              />
            ))}
          </div>
        )}
      </div>

      <DocumentViewer
        document={selectedDocument}
        isOpen={!!selectedDocument}
        onClose={() => setSelectedDocument(null)}
      />

      <Sheet open={showUploader} onOpenChange={setShowUploader}>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Upload Documents</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <DocumentUploader onComplete={() => setShowUploader(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </PageContainer>
  );
}

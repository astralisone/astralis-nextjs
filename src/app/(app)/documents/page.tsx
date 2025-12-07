'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useDocuments } from '@/hooks/useDocuments';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { DocumentViewer } from '@/components/documents/DocumentViewer';
import { DocumentChat } from '@/components/documents/DocumentChat';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Document } from '@/types/documents';

export default function DocumentsPage() {
  const { data: session } = useSession();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const {
    data: documentsData,
    isLoading,
    error,
  } = useDocuments({
    limit: 10,
    offset: 0,
  });

  const documents = documentsData?.documents || [];

  return (
    <PageContainer>
      <PageHeader
        title="Documents"
        description="Testing with DocumentChat import"
      />
      <div className="p-4">
        <p>Session: {session?.user?.email || 'No session'}</p>
        <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
        <p>Error: {error ? String(error) : 'None'}</p>
        <p>Documents: {documents.length}</p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onView={(doc) => setSelectedDocument(doc)}
            />
          ))}
        </div>
      </div>

      <DocumentViewer
        document={selectedDocument}
        isOpen={!!selectedDocument}
        onClose={() => setSelectedDocument(null)}
      />
    </PageContainer>
  );
}

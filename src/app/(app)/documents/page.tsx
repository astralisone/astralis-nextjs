'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useDocuments, useDocumentStats } from '@/hooks/useDocuments';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { DocumentViewer } from '@/components/documents/DocumentViewer';
import { DocumentChat } from '@/components/documents/DocumentChat';
import { DocumentUploader } from '@/components/documents/DocumentUploader';
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

  // TEST: Adding useDocumentStats
  const { data: stats } = useDocumentStats();

  const documents = documentsData?.documents || [];

  return (
    <PageContainer>
      <PageHeader
        title="Documents"
        description={`Testing useDocumentStats | OrgId: ${session?.user?.orgId || 'none'}`}
      />
      <div className="p-4">
        <p>Session: {session?.user?.email || 'No session'}</p>
        <p>OrgId: {session?.user?.orgId || 'none'}</p>
        <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
        <p>Error: {error ? String(error) : 'None'}</p>
        <p>Documents: {documents.length}</p>
        <p>Stats: {stats ? JSON.stringify(stats) : 'none'}</p>

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

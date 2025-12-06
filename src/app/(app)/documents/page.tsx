'use client';

import { useSession } from 'next-auth/react';
import { useDocuments } from '@/hooks/useDocuments';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';

export default function DocumentsPage() {
  const { data: session } = useSession();

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
        description="Testing with DocumentCard component"
      />
      <div className="p-4">
        <p>Session: {session?.user?.email || 'No session'}</p>
        <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
        <p>Error: {error ? String(error) : 'None'}</p>
        <p>Documents: {documents.length}</p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}

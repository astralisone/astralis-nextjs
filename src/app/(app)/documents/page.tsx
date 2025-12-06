'use client';

import { useSession } from 'next-auth/react';
import { useDocuments } from '@/hooks/useDocuments';
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

  return (
    <PageContainer>
      <PageHeader
        title="Documents"
        description="Testing with useDocuments hook"
      />
      <div className="p-4">
        <p>Session: {session?.user?.email || 'No session'}</p>
        <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
        <p>Error: {error ? String(error) : 'None'}</p>
        <p>Documents: {documentsData?.documents?.length ?? 0}</p>
      </div>
    </PageContainer>
  );
}

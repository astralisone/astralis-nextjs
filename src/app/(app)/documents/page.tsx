'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';

export default function DocumentsPage() {
  const { data: session } = useSession();
  const [test, setTest] = useState('working');

  return (
    <PageContainer>
      <PageHeader
        title="Documents"
        description="Testing imports - session loaded"
      />
      <div className="p-4">
        <p>Session: {session?.user?.email || 'No session'}</p>
        <p>State: {test}</p>
      </div>
    </PageContainer>
  );
}

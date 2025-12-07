'use client';

import { useSearchParams } from 'next/navigation';
import { DocumentChat } from '@/components/documents/DocumentChat';

export default function DocumentChatPage() {
  const searchParams = useSearchParams();
  const documentId = searchParams.get('documentId') || undefined;

  return (
    <div className="h-screen w-full p-4 bg-slate-100">
      <DocumentChat documentId={documentId} className="h-full" />
    </div>
  );
}

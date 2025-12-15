'use client';

import { useSearchParams } from 'next/navigation';
import { DocumentChat } from '@/components/documents/DocumentChat';

export default function DocumentChatPage() {
  const searchParams = useSearchParams();
  const documentId = searchParams.get('documentId') || undefined;

  return (
    <div className="min-h-screen w-full p-6 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-astralis-navy dark:text-white mb-2">
            Document Intelligence Center
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Advanced AI-powered document analysis and knowledge extraction
          </p>
        </div>

        <div className="h-[calc(100vh-200px)]">
          <DocumentChat documentId={documentId} className="h-full" />
        </div>
      </div>
    </div>
  );
}

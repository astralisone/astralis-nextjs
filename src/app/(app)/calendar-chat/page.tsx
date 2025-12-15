import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/config';
import { CalendarChatPanel } from '@/components/calendar/CalendarChatPanel';

/**
 * Calendar Chat Page
 *
 * Conversational interface for managing calendar events.
 * Allows users to interact with their calendar using natural language.
 */

export const metadata: Metadata = {
  title: 'Calendar Chat | Astralis One',
  description: 'Manage your calendar with natural language conversations',
};

export default async function CalendarChatPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/calendar-chat');
  }

  const userId = session.user.id;
  const orgId = (session.user as any).orgId || 'default-org';

  return (
    <div className="min-h-screen w-full p-6 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-astralis-navy dark:text-white mb-2">
            Calendar Command Center
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Strategic scheduling intelligence and automated calendar orchestration
          </p>
        </div>

        <div className="h-[calc(100vh-200px)]">
          <CalendarChatPanel userId={userId} orgId={orgId} />
        </div>
      </div>
    </div>
  );
}

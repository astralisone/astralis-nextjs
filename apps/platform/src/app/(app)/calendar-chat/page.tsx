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
    <div className="container mx-auto py-8 px-4 h-[calc(100vh-200px)]">
      <div className="max-w-5xl mx-auto h-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-astralis-navy mb-2">
            Calendar Assistant
          </h1>
          <p className="text-slate-600">
            Chat with your calendar using natural language. Ask about your schedule, book meetings, or find available time slots.
          </p>
        </div>

        <div className="h-[calc(100%-100px)]">
          <CalendarChatPanel userId={userId} orgId={orgId} />
        </div>
      </div>
    </div>
  );
}

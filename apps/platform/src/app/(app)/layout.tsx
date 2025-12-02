import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/config';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <div className="fixed inset-0 top-[70px] flex bg-slate-50">
      <DashboardSidebar user={session.user} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader user={session.user} />

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

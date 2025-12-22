/**
 * Admin Action Repository Page
 *
 * Admin interface for managing the AI action repository.
 */

import { ActionRepositoryAdmin } from '@/components/admin/ActionRepositoryAdmin';
import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';

interface AdminActionsPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function AdminActionsPage({ searchParams }: AdminActionsPageProps) {
  // Check authentication and admin role
  const session = await auth();
  if (!session?.user?.orgId) {
    redirect('/auth/signin');
  }

  // Check if user is admin (this would need to be implemented based on your user roles)
  // For now, assume all authenticated users can access (you should add role checking)

  return <ActionRepositoryAdmin orgId={session.user.orgId} />;
}
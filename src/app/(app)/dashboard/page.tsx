import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { StatsWidget } from '@/components/dashboard/StatsWidget';
import { Inbox, GitBranch, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await auth();
  if (!session) return null;

  const orgId = session.user.orgId;

  // Validate orgId exists before attempting database queries
  if (!orgId) {
    console.error('Dashboard Error: User has no organization assigned', {
      userId: session.user.id,
      userEmail: session.user.email,
    });

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-astralis-navy">Dashboard</h1>
          <p className="text-slate-600 mt-1">Welcome back, {session.user.name || 'User'}</p>
        </div>

        <Alert variant="error" showIcon className="max-w-2xl">
          <AlertTitle>Organization Not Found</AlertTitle>
          <AlertDescription>
            <p className="mb-4">
              Your account is not associated with an organization. This is required to access the dashboard.
            </p>
            <div className="flex gap-3">
              <Button asChild variant="primary" size="sm">
                <Link href="/settings/profile">Go to Settings</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/auth/signin">Sign Out</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <h2 className="text-xl font-semibold text-astralis-navy mb-4">Need Help?</h2>
          <p className="text-slate-600 mb-2">
            If you believe this is an error, please contact your system administrator or our support team.
          </p>
          <p className="text-sm text-slate-500">
            User ID: <code className="bg-slate-100 px-2 py-1 rounded">{session.user.id}</code>
          </p>
        </div>
      </div>
    );
  }

  // Wrap database queries in try-catch for proper error handling
  let intakeStats, pipelineStats;
  try {
    // Fetch dashboard stats in parallel
    [intakeStats, pipelineStats] = await Promise.all([
      prisma.intakeRequest.groupBy({
        by: ['status'],
        where: { orgId },
        _count: true,
      }),
      prisma.pipeline.findMany({
        where: { orgId, isActive: true },
        include: {
          _count: {
            select: { stages: true },
          },
        },
      }),
    ]);
  } catch (error) {
    console.error('Dashboard Error: Failed to fetch dashboard data', {
      userId: session.user.id,
      orgId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-astralis-navy">Dashboard</h1>
          <p className="text-slate-600 mt-1">Welcome back, {session.user.name || 'User'}</p>
        </div>

        <Alert variant="error" showIcon className="max-w-2xl">
          <AlertTitle>Unable to Load Dashboard</AlertTitle>
          <AlertDescription>
            <p className="mb-4">
              We encountered an error while loading your dashboard data. Please try refreshing the page.
            </p>
            <div className="flex gap-3">
              <Button asChild variant="primary" size="sm">
                <Link href="/dashboard">Refresh Page</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/">Go to Home</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <h2 className="text-xl font-semibold text-astralis-navy mb-4">Error Details</h2>
          <p className="text-slate-600 mb-4">
            If this problem persists, please contact support with the following information:
          </p>
          <div className="text-sm text-slate-500 space-y-1">
            <p>Time: <code className="bg-slate-100 px-2 py-1 rounded">{new Date().toISOString()}</code></p>
            <p>User ID: <code className="bg-slate-100 px-2 py-1 rounded">{session.user.id}</code></p>
            <p>Organization ID: <code className="bg-slate-100 px-2 py-1 rounded">{orgId}</code></p>
          </div>
        </div>
      </div>
    );
  }

  const totalIntake = intakeStats.reduce((sum, stat) => sum + stat._count, 0);
  const newIntake = intakeStats.find((s) => s.status === 'NEW')?._count || 0;
  const totalPipelines = pipelineStats.length;

  // Document stats - placeholder for Phase 4
  const totalDocuments = 0;
  const processedDocuments = 0;
  const completionRate = 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-astralis-navy">Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome back, {session.user.name || 'User'}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsWidget
          title="Total Intake Requests"
          value={totalIntake}
          change={{ value: newIntake, trend: 'up', period: 'new this week' }}
          icon={<Inbox className="w-6 h-6" />}
          variant="default"
        />

        <StatsWidget
          title="Active Pipelines"
          value={totalPipelines}
          icon={<GitBranch className="w-6 h-6" />}
          variant="default"
        />

        <StatsWidget
          title="Documents Processed"
          value={processedDocuments}
          change={{
            value: completionRate,
            trend: 'up',
            period: '% completion rate',
          }}
          icon={<FileText className="w-6 h-6" />}
          variant="success"
        />

        <StatsWidget
          title="Tasks Completed"
          value={0}
          icon={<CheckCircle className="w-6 h-6" />}
          variant="default"
        />
      </div>

      {/* Recent Activity placeholder */}
      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <h2 className="text-xl font-semibold text-astralis-navy mb-4">Recent Activity</h2>
        <p className="text-slate-500">No recent activity to display.</p>
      </div>
    </div>
  );
}

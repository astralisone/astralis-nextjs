import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { StatsWidget } from '@/components/dashboard/StatsWidget';
import { Inbox, GitBranch, FileText, CheckCircle } from 'lucide-react';

export default async function DashboardPage() {
  const session = await auth();
  if (!session) return null;

  const orgId = session.user.orgId;

  // Fetch dashboard stats in parallel
  const [intakeStats, pipelineStats] = await Promise.all([
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

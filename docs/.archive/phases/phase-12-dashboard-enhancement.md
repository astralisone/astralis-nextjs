# Phase 12: Dashboard Enhancement

**Duration**: 1 week
**Prerequisites**: Phases 9-11 complete (data sources available)
**Priority**: High - Core AstralisOps feature

---

## Overview

Transform the basic dashboard into a comprehensive operations center that displays all business metrics, team workload, and recent activity in one unified view.

**Marketing Promise:**
> "View all your active projects, client requests, and team workload on one screen. Know what's happening in your business at a glance without checking multiple systems."

---

## Current State (as of Phase 6)

### What Exists
- `/dashboard` authenticated page with basic stats
- `StatsWidget` component for metric display
- `/api/dashboard/stats` endpoint (limited data)
- Database models for all required data sources

### What's Missing
- Comprehensive metrics (only intake/pipeline counts shown)
- Real-time updates (no polling or WebSockets)
- Team workload visualization
- Activity feed (placeholder only)
- Document processing status (hardcoded to 0)
- Automation execution status
- Calendar overview
- Quick action buttons

---

## Implementation Plan

### 1. Enhanced Stats API

Update `src/app/api/dashboard/stats/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

interface DashboardStats {
  intake: {
    total: number;
    new: number;
    processing: number;
    completed: number;
    byPriority: Record<number, number>;
  };
  pipelines: {
    total: number;
    active: number;
    itemsByStage: Record<string, number>;
    overdueItems: number;
  };
  documents: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    extractionComplete: number;
  };
  automations: {
    active: number;
    recentExecutions: number;
    failedExecutions: number;
    successRate: number;
  };
  calendar: {
    todayEvents: number;
    weekEvents: number;
    pendingReminders: number;
  };
  team: {
    totalMembers: number;
    activeMembers: number;
    workloadByMember: Array<{
      userId: string;
      name: string;
      assignedItems: number;
      pendingTasks: number;
    }>;
  };
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = session.user;

  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Parallel queries for performance
    const [
      intakeStats,
      pipelineStats,
      documentStats,
      automationStats,
      calendarStats,
      teamStats,
    ] = await Promise.all([
      // Intake statistics
      prisma.intakeRequest.groupBy({
        by: ['status'],
        where: { orgId },
        _count: true,
      }),

      // Pipeline statistics
      prisma.pipelineItem.groupBy({
        by: ['stageId'],
        where: { pipeline: { orgId } },
        _count: true,
      }),

      // Document statistics
      prisma.document.groupBy({
        by: ['status'],
        where: { orgId },
        _count: true,
      }),

      // Automation statistics
      Promise.all([
        prisma.automation.count({ where: { orgId, isActive: true } }),
        prisma.workflowExecution.count({
          where: {
            automation: { orgId },
            createdAt: { gte: last24Hours },
          },
        }),
        prisma.workflowExecution.count({
          where: {
            automation: { orgId },
            status: 'FAILED',
            createdAt: { gte: last24Hours },
          },
        }),
      ]),

      // Calendar statistics
      Promise.all([
        prisma.schedulingEvent.count({
          where: {
            orgId,
            startTime: { gte: startOfDay },
            endTime: { lte: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000) },
            status: { not: 'CANCELLED' },
          },
        }),
        prisma.schedulingEvent.count({
          where: {
            orgId,
            startTime: { gte: startOfDay, lte: endOfWeek },
            status: { not: 'CANCELLED' },
          },
        }),
        prisma.eventReminder.count({
          where: {
            event: { orgId },
            status: 'PENDING',
          },
        }),
      ]),

      // Team statistics
      prisma.users.findMany({
        where: { orgId, isActive: true },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              pipelineItems: { where: { status: { not: 'COMPLETED' } } },
            },
          },
        },
      }),
    ]);

    // Process intake stats
    const intakeByStatus = Object.fromEntries(
      intakeStats.map((s) => [s.status, s._count])
    );

    // Process document stats
    const docByStatus = Object.fromEntries(
      documentStats.map((s) => [s.status, s._count])
    );

    // Calculate automation success rate
    const [activeAutomations, recentExecutions, failedExecutions] = automationStats;
    const successRate =
      recentExecutions > 0
        ? ((recentExecutions - failedExecutions) / recentExecutions) * 100
        : 100;

    // Calendar stats
    const [todayEvents, weekEvents, pendingReminders] = calendarStats;

    const stats: DashboardStats = {
      intake: {
        total: Object.values(intakeByStatus).reduce((a, b) => a + b, 0),
        new: intakeByStatus['NEW'] || 0,
        processing: (intakeByStatus['ROUTING'] || 0) + (intakeByStatus['ASSIGNED'] || 0),
        completed: intakeByStatus['COMPLETED'] || 0,
        byPriority: {}, // Add priority grouping if needed
      },
      pipelines: {
        total: await prisma.pipeline.count({ where: { orgId } }),
        active: await prisma.pipeline.count({ where: { orgId, isActive: true } }),
        itemsByStage: Object.fromEntries(
          pipelineStats.map((s) => [s.stageId, s._count])
        ),
        overdueItems: await prisma.pipelineItem.count({
          where: {
            pipeline: { orgId },
            dueDate: { lt: now },
            status: { not: 'COMPLETED' },
          },
        }),
      },
      documents: {
        total: Object.values(docByStatus).reduce((a, b) => a + b, 0),
        pending: docByStatus['PENDING'] || 0,
        processing: docByStatus['PROCESSING'] || 0,
        completed: docByStatus['COMPLETED'] || 0,
        failed: docByStatus['FAILED'] || 0,
        extractionComplete: await prisma.document.count({
          where: {
            orgId,
            extractedData: { not: null },
          },
        }),
      },
      automations: {
        active: activeAutomations,
        recentExecutions,
        failedExecutions,
        successRate: Math.round(successRate),
      },
      calendar: {
        todayEvents,
        weekEvents,
        pendingReminders,
      },
      team: {
        totalMembers: teamStats.length,
        activeMembers: teamStats.length,
        workloadByMember: teamStats.map((member) => ({
          userId: member.id,
          name: member.name || 'Unknown',
          assignedItems: member._count.pipelineItems,
          pendingTasks: member._count.pipelineItems,
        })),
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[Dashboard] Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
```

### 2. Activity Feed API

Create `src/app/api/dashboard/activity/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

interface ActivityItem {
  id: string;
  type: 'intake' | 'document' | 'pipeline' | 'automation' | 'calendar';
  action: string;
  title: string;
  description?: string;
  userId?: string;
  userName?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId } = session.user;
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');

  try {
    // Fetch recent activity from multiple sources
    const [recentIntake, recentDocuments, recentPipelineItems, recentExecutions] =
      await Promise.all([
        prisma.intakeRequest.findMany({
          where: { orgId },
          orderBy: { updatedAt: 'desc' },
          take: limit,
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.document.findMany({
          where: { orgId },
          orderBy: { updatedAt: 'desc' },
          take: limit,
          select: {
            id: true,
            filename: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            uploadedBy: { select: { name: true } },
          },
        }),
        prisma.pipelineItem.findMany({
          where: { pipeline: { orgId } },
          orderBy: { updatedAt: 'desc' },
          take: limit,
          select: {
            id: true,
            title: true,
            status: true,
            stage: { select: { name: true } },
            updatedAt: true,
          },
        }),
        prisma.workflowExecution.findMany({
          where: { automation: { orgId } },
          orderBy: { createdAt: 'desc' },
          take: limit,
          select: {
            id: true,
            status: true,
            automation: { select: { name: true } },
            createdAt: true,
            completedAt: true,
          },
        }),
      ]);

    // Combine and sort activities
    const activities: ActivityItem[] = [
      ...recentIntake.map((item) => ({
        id: `intake-${item.id}`,
        type: 'intake' as const,
        action: item.createdAt.getTime() === item.updatedAt.getTime() ? 'created' : 'updated',
        title: item.title,
        description: `Status: ${item.status}`,
        timestamp: item.updatedAt,
      })),
      ...recentDocuments.map((doc) => ({
        id: `doc-${doc.id}`,
        type: 'document' as const,
        action: doc.status === 'COMPLETED' ? 'processed' : doc.status.toLowerCase(),
        title: doc.filename,
        userName: doc.uploadedBy?.name,
        timestamp: doc.updatedAt,
      })),
      ...recentPipelineItems.map((item) => ({
        id: `pipeline-${item.id}`,
        type: 'pipeline' as const,
        action: 'moved',
        title: item.title,
        description: `Moved to ${item.stage.name}`,
        timestamp: item.updatedAt,
      })),
      ...recentExecutions.map((exec) => ({
        id: `exec-${exec.id}`,
        type: 'automation' as const,
        action: exec.status.toLowerCase(),
        title: exec.automation.name,
        timestamp: exec.completedAt || exec.createdAt,
      })),
    ];

    // Sort by timestamp descending
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return NextResponse.json({
      activities: activities.slice(0, limit),
    });
  } catch (error) {
    console.error('[Dashboard] Activity error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}
```

### 3. Enhanced Dashboard Page

Update `src/app/(app)/dashboard/page.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Users,
  Calendar,
  Zap,
  ArrowRight,
  RefreshCw,
  Plus,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  intake: { total: number; new: number; processing: number; completed: number };
  pipelines: { total: number; active: number; overdueItems: number };
  documents: { total: number; pending: number; completed: number; failed: number };
  automations: { active: number; recentExecutions: number; successRate: number };
  calendar: { todayEvents: number; weekEvents: number };
  team: { totalMembers: number; workloadByMember: Array<{ name: string; assignedItems: number }> };
}

interface ActivityItem {
  id: string;
  type: string;
  action: string;
  title: string;
  description?: string;
  timestamp: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/activity?limit=10'),
      ]);

      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
      if (activityRes.ok) {
        const data = await activityRes.json();
        setActivities(data.activities);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-slate-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-astralis-navy">Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="primary" size="sm" asChild>
            <Link href="/intake/new">
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Intake Requests</p>
                <p className="text-2xl font-bold">{stats?.intake.total || 0}</p>
                <p className="text-xs text-slate-500">
                  {stats?.intake.new || 0} new, {stats?.intake.processing || 0} processing
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Active Pipelines</p>
                <p className="text-2xl font-bold">{stats?.pipelines.active || 0}</p>
                {stats?.pipelines.overdueItems ? (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {stats.pipelines.overdueItems} overdue items
                  </p>
                ) : (
                  <p className="text-xs text-green-600">All on track</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Today's Events</p>
                <p className="text-2xl font-bold">{stats?.calendar.todayEvents || 0}</p>
                <p className="text-xs text-slate-500">
                  {stats?.calendar.weekEvents || 0} this week
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-100">
                <Zap className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Automations</p>
                <p className="text-2xl font-bold">{stats?.automations.active || 0}</p>
                <p className="text-xs text-slate-500">
                  {stats?.automations.successRate || 100}% success rate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No recent activity</p>
              ) : (
                activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50"
                  >
                    <Badge variant="outline" className="capitalize">
                      {activity.type}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{activity.title}</p>
                      {activity.description && (
                        <p className="text-sm text-slate-500">{activity.description}</p>
                      )}
                      <p className="text-xs text-slate-400">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team Workload */}
        <Card>
          <CardHeader>
            <CardTitle>Team Workload</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.team.workloadByMember.map((member) => (
                <div key={member.name} className="flex items-center justify-between">
                  <span className="font-medium">{member.name}</span>
                  <Badge variant={member.assignedItems > 5 ? 'destructive' : 'default'}>
                    {member.assignedItems} items
                  </Badge>
                </div>
              ))}
              {(!stats?.team.workloadByMember || stats.team.workloadByMember.length === 0) && (
                <p className="text-slate-500 text-center py-4">No team members</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/intake/new">
                <FileText className="w-5 h-5" />
                <span>New Intake</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/calendar-chat">
                <Calendar className="w-5 h-5" />
                <span>Schedule Meeting</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/documents">
                <FileText className="w-5 h-5" />
                <span>Upload Document</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link href="/automations/new">
                <Zap className="w-5 h-5" />
                <span>Create Automation</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Testing Checklist

- [ ] Dashboard loads all stats within 2 seconds
- [ ] Activity feed shows recent items from all sources
- [ ] Team workload accurately reflects assignments
- [ ] Auto-refresh updates data every 30 seconds
- [ ] Overdue items trigger visual warnings
- [ ] Quick actions navigate to correct pages
- [ ] Mobile responsive layout works correctly
- [ ] Empty states display appropriately

---

## Success Criteria

1. Dashboard displays metrics from all 6 core systems
2. Activity feed shows last 20 actions across systems
3. Team workload visualization shows per-member assignments
4. Auto-refresh every 30 seconds without page reload
5. Quick action buttons for common tasks
6. Page load time under 2 seconds
7. Mobile-responsive design


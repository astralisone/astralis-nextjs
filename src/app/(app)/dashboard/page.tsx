'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { StatsWidget } from '@/components/dashboard/StatsWidget';

import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { MetricCard, LineChart, BarChart, AreaChart, ChartContainer } from '@/components/dashboard/charts';
import { Inbox, GitBranch, FileText, CheckCircle, Calendar, Bot, TrendingUp, RefreshCw, Download, Lightbulb } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { DashboardData, ChartDataPoint } from '@/types/dashboard';

// Fallback data generators for when APIs fail
const getFallbackIntakeData = () => {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 10) + 1,
      label: `${Math.floor(Math.random() * 10) + 1} intakes`
    });
  }
  return data;
};

const getFallbackDocumentData = () => {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      uploaded: Math.floor(Math.random() * 8) + 1,
      processed: Math.floor(Math.random() * 6) + 1,
    });
  }
  return data;
};

const getFallbackAgentData = () => {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      decisions: Math.floor(Math.random() * 15) + 1,
      executions: Math.floor(Math.random() * 12) + 1,
      successRate: Math.floor(Math.random() * 30) + 70,
    });
  }
  return data;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [chartData, setChartData] = useState<{
    intakeTrends: ChartDataPoint[];
    documentProcessing: any[];
    agentMetrics: any[];
  }>({
    intakeTrends: [],
    documentProcessing: [],
    agentMetrics: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (status !== 'authenticated') return;

    try {
      setLoading(true);
      setError(null);

      // Fetch stats and chart data in parallel
      const [statsResponse, intakeResponse, documentResponse, agentResponse] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch(`/api/dashboard/charts/intake-trends?range=${timeRange}`),
        fetch(`/api/dashboard/charts/document-processing?range=${timeRange}`),
        fetch(`/api/dashboard/charts/agent-metrics?range=${timeRange}`),
      ]);

      if (!statsResponse.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const statsData: DashboardData = await statsResponse.json();
      const intakeData = intakeResponse.ok ? await intakeResponse.json() : getFallbackIntakeData();
      const documentData = documentResponse.ok ? await documentResponse.json() : getFallbackDocumentData();
      const agentData = agentResponse.ok ? await agentResponse.json() : getFallbackAgentData();

      setDashboardData(statsData);
      setChartData({
        intakeTrends: intakeData,
        documentProcessing: documentData,
        agentMetrics: agentData,
      });
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [status, timeRange]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchDashboardData();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, timeRange, status]);

  // Handle time range change
  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
  };

  const router = useRouter();
  // Handle metric card clicks for drill-down
  const handleMetricClick = (metricType: string) => {
    switch (metricType) {
      case 'intake':
        router.push('/intake');
        break;
      case 'pipelines':
        router.push('/pipelines');
        break;
      case 'documents':
        router.push('/documents');
        break;
      case 'events':
        router.push('/calendar-chat');
        break;
      default:
        break;
    }
  };

  // Handle manual refresh
  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Handle export functionality
  const handleExport = (chartType: string) => {
    const data = chartData[chartType as keyof typeof chartData];
    if (!data || data.length === 0) return;

    // Convert to CSV
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row =>
      Object.values(row).map(value =>
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(',')
    );
    const csv = [headers, ...rows].join('\n');

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chartType}-data.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (status === 'loading') {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="animate-pulse">
          <div className="h-9 bg-gradient-to-r from-slate-200 to-slate-100 rounded-lg w-48 mb-3"></div>
          <div className="h-5 bg-gradient-to-r from-slate-200 to-slate-100 rounded w-64"></div>
        </div>

        {/* Time Range Selector Skeleton */}
        <div className="flex justify-end animate-pulse">
          <div className="h-10 bg-gradient-to-r from-slate-200 to-slate-100 rounded-lg w-32"></div>
        </div>

        {/* Metrics Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gradient-to-br from-white to-slate-50/50 shadow-card-glass rounded-xl border border-slate-200/60 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-100 rounded w-24"></div>
                  <div className="h-10 w-10 bg-gradient-to-r from-slate-200 to-slate-100 rounded-xl"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-8 bg-gradient-to-r from-slate-300 to-slate-200 rounded w-16"></div>
                    <div className="h-6 bg-gradient-to-r from-slate-200 to-slate-100 rounded-full w-20"></div>
                  </div>
                  <div className="h-14 w-24 bg-gradient-to-r from-slate-200 to-slate-100 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gradient-to-br from-white to-slate-50/50 shadow-card-glass rounded-xl border border-slate-200/60 backdrop-blur-sm">
                <div className="p-6 pb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 bg-gradient-to-r from-slate-200 to-slate-100 rounded-lg"></div>
                    <div className="h-6 bg-gradient-to-r from-slate-300 to-slate-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <div className="h-64 bg-gradient-to-r from-slate-100 to-slate-50 rounded-lg flex items-center justify-center">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-astralis-blue"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-astralis-cyan animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Activity Feed Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 animate-pulse">
            <div className="bg-gradient-to-br from-white to-slate-50/50 shadow-card-glass rounded-xl border border-slate-200/60 backdrop-blur-sm">
              <div className="p-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-gradient-to-r from-slate-200 to-slate-100 rounded-lg"></div>
                  <div className="h-6 bg-gradient-to-r from-slate-300 to-slate-200 rounded w-40"></div>
                </div>
              </div>
              <div className="px-6 pb-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-25">
                    <div className="h-12 w-12 bg-gradient-to-r from-slate-200 to-slate-100 rounded-xl flex-shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gradient-to-r from-slate-300 to-slate-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-100 rounded w-1/2"></div>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="h-6 w-6 bg-gradient-to-r from-slate-200 to-slate-100 rounded-full"></div>
                        <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-100 rounded w-16"></div>
                        <div className="h-1 w-1 bg-slate-400 rounded-full"></div>
                        <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-100 rounded w-12"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat and Tips Skeleton */}
          <div className="space-y-6">
            <div className="animate-pulse">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 shadow-card-glass rounded-xl border border-slate-700/60 backdrop-blur-sm h-96"></div>
            </div>
            <div className="animate-pulse">
              <div className="bg-gradient-to-br from-white to-slate-50/50 shadow-card-glass rounded-xl border border-slate-200/60 backdrop-blur-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 bg-gradient-to-r from-slate-200 to-slate-100 rounded-lg"></div>
                  <div className="h-6 bg-gradient-to-r from-slate-300 to-slate-200 rounded w-32"></div>
                </div>
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-3 bg-gradient-to-r from-slate-50 to-slate-25 rounded-lg">
                      <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-100 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-100 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-astralis-navy">Dashboard</h1>
          <p className="text-slate-600 mt-1">Welcome back, {session?.user?.name || 'User'}</p>
        </div>

        <Alert variant="error" showIcon className="max-w-2xl">
          <AlertTitle>Unable to Load Dashboard</AlertTitle>
          <AlertDescription>
            <p className="mb-4">
              We encountered an error while loading your dashboard data. Please try refreshing the page.
            </p>
            <div className="flex gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/">Go to Home</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-astralis-navy">Dashboard</h1>
          <p className="text-slate-600 mt-1">Welcome back, {session?.user?.name || 'User'}</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-astralis-blue"></div>
        </div>
      </div>
    );
  }

  const { stats, recentActivity, recentPipelines } = dashboardData;

  // Calculate tasks completed from pipeline items
  const tasksCompleted = recentPipelines.reduce((sum, pipeline) => sum + pipeline.itemCount, 0);

  // Extract individual stats for widgets
  const totalIntakes = stats.intake.total;
  const documentsProcessed = stats.documents.total;
  const activePipelines = stats.pipelines.active;
  const upcomingEvents = stats.events.upcoming;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-astralis-navy">Dashboard</h1>
          <p className="text-slate-600 mt-1">Welcome back, {session?.user?.name || 'User'}</p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <div className="text-sm text-slate-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid with Professional Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Intake Requests"
          value={stats.intake.total}
          change={{
            value: stats.intake.change,
            trend: stats.intake.change >= 0 ? 'up' : 'down',
            period: 'vs last period',
          }}
          icon={<Inbox className="w-6 h-6" />}
          sparklineData={chartData.intakeTrends.slice(-7)} // Last 7 days for sparkline
          className="animate-slide-in"
          style={{ animationDelay: '0ms' }}
          onClick={() => handleMetricClick('intake')}
        />

        <MetricCard
          title="Active Pipelines"
          value={stats.pipelines.active}
          change={{
            value: stats.pipelines.change,
            trend: stats.pipelines.change >= 0 ? 'up' : 'down',
            period: 'vs last period',
          }}
          icon={<GitBranch className="w-6 h-6" />}
          sparklineData={[]} // Could add pipeline creation trends
          className="animate-slide-in"
          style={{ animationDelay: '100ms' }}
          onClick={() => handleMetricClick('pipelines')}
        />

        <MetricCard
          title="Documents Processed"
          value={stats.documents.total}
          change={{
            value: stats.documents.change,
            trend: stats.documents.change >= 0 ? 'up' : 'down',
            period: 'vs last period',
          }}
          icon={<FileText className="w-6 h-6" />}
          sparklineData={chartData.documentProcessing.slice(-7).map(d => ({ date: d.date, value: d.processed }))}
          className="animate-slide-in"
          style={{ animationDelay: '200ms' }}
          onClick={() => handleMetricClick('documents')}
        />

        <MetricCard
          title="Tasks Completed"
          value={tasksCompleted}
          icon={<CheckCircle className="w-6 h-6" />}
          sparklineData={[]} // Could add task completion trends
          className="animate-slide-in"
          style={{ animationDelay: '300ms' }}
        />
      </div>



      {/* Navigation Menu */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-6 shadow-card-glass animate-slide-in" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center gap-6 overflow-x-auto">
          <span className="text-sm font-semibold text-astralis-navy dark:text-white whitespace-nowrap">Jump to:</span>
          <a href="#overview" className="text-sm text-astralis-blue hover:text-astralis-blue/80 font-medium whitespace-nowrap transition-colors">
            📊 Overview
          </a>
          <a href="#intake-trends" className="text-sm text-astralis-blue hover:text-astralis-blue/80 font-medium whitespace-nowrap transition-colors">
            📈 Intake Trends
          </a>
          <a href="#document-processing" className="text-sm text-astralis-blue hover:text-astralis-blue/80 font-medium whitespace-nowrap transition-colors">
            📄 Document Processing
          </a>
          <a href="#activity" className="text-sm text-astralis-blue hover:text-astralis-blue/80 font-medium whitespace-nowrap transition-colors">
            📋 Recent Activity
          </a>
        </div>
      </div>

      {/* Overview Stats with Anchor */}
      <div id="overview" className="scroll-mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsWidget
            title="Total Intakes"
            value={totalIntakes}
            icon={<Inbox className="w-6 h-6" />}
            //sparklineData={[]} // Could add intake trends
            className="animate-slide-in"
            style={{ animationDelay: '300ms' }}
          />
          <StatsWidget
            title="Documents Processed"
            value={documentsProcessed}
            icon={<FileText className="w-6 h-6" />}
            //sparklineData={[]} // Could add processing trends
            className="animate-slide-in"
            style={{ animationDelay: '400ms' }}
          />
          <StatsWidget
            title="Active Workflows"
            value={0} // todo calculate this oonce workflows Are iun
            icon={<GitBranch className="w-6 h-6" />}
            //sparklineData={[]} // Could add workflow trends
            className="animate-slide-in"
            style={{ animationDelay: '500ms' }}
          />
          <StatsWidget
            title="Tasks Completed"
            value={tasksCompleted}
            icon={<CheckCircle className="w-6 h-6" />}
            //sparklineData={[]} // Could add task completion trends
            className="animate-slide-in"
            style={{ animationDelay: '600ms' }}
          />
        </div>
      </div>

      {/* Professional Charts Grid with Enhanced Styling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div id="intake-trends" className="scroll-mt-6">
          <ChartContainer
            title="Intake Trends"
            loading={loading}
            className="animate-slide-in"
            style={{ animationDelay: '700ms' }}
            onExport={() => handleExport('intakeTrends')}
          >
            <LineChart
              data={chartData.intakeTrends}
              height={300}
              dataKey="value"
              strokeColor="#2B6CB0"
              showTooltip
              animate
            />
          </ChartContainer>
        </div>

        <div id="document-processing" className="scroll-mt-6">
          <ChartContainer
            title="Document Processing"
            loading={loading}
            className="animate-slide-in"
            style={{ animationDelay: '800ms' }}
            onExport={() => handleExport('documentProcessing')}
          >
            <AreaChart
              data={chartData.documentProcessing}
              height={300}
              dataKey="processed"
              fillColor="#38A169"
              strokeColor="#38A169"
              fillOpacity={0.3}
              showTooltip
              animate
            />
          </ChartContainer>
        </div>
      </div>

      {/* Bottom Section: Activity Feed and Tips */}
      <div id="activity" className="scroll-mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="animate-slide-in shadow-card-glass border-slate-200/60 backdrop-blur-sm" style={{ animationDelay: '900ms' }}>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-astralis-navy flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-astralis-blue/10 to-blue-50 rounded-lg border border-astralis-blue/20">
                    <TrendingUp className="w-5 h-5 text-astralis-blue" />
                  </div>
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ActivityFeed activities={recentActivity} />
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Quick Tips with Professional Styling */}
          <Card className="animate-slide-in shadow-card-glass border-slate-200/60 backdrop-blur-sm" style={{ animationDelay: '1000ms' }}>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-astralis-navy flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-astralis-cyan/10 to-cyan-50 rounded-lg border border-astralis-cyan/20">
                  <Lightbulb className="w-5 h-5 text-astralis-cyan" />
                </div>
                AI Command Examples
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="p-3 bg-gradient-to-r from-astralis-blue/5 to-blue-50 rounded-lg border border-astralis-blue/10">
                  <p className="text-sm font-medium text-astralis-navy mb-1">📧 Email Automation</p>
                  <p className="text-xs text-slate-600">"Send welcome email to new customer"</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200/30">
                  <p className="text-sm font-medium text-astralis-navy mb-1">📅 Scheduling</p>
                  <p className="text-xs text-slate-600">"Schedule onboarding call for next week"</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200/30">
                  <p className="text-sm font-medium text-astralis-navy mb-1">📁 File Management</p>
                  <p className="text-xs text-slate-600">"Create customer folder in Google Drive"</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-astralis-cyan/5 to-cyan-50 rounded-lg border border-astralis-cyan/20">
                  <p className="text-sm font-medium text-astralis-navy mb-1">📄 Document Processing</p>
                  <p className="text-xs text-slate-600">"Process this document and extract key info"</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

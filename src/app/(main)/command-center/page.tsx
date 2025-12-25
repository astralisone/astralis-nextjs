'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { RecentDocuments } from '@/components/dashboard/RecentDocuments';
import { RoiMetricsWidget } from '@/components/dashboard/RoiMetricsWidget';
import { AgentChatInterface } from '@/components/dashboard/AgentChatInterface';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import {
    MetricCard,
    LineChart,
    BarChart,
    AreaChart,
    ChartContainer,
    CHART_THEME
} from '@/components/dashboard/charts';
import {
    Inbox,
    GitBranch,
    FileText,
    CheckCircle,
    RefreshCw,
    TrendingUp,
    Zap,
    Target,
    BarChart3,
    Activity
} from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { DashboardData, ChartDataPoint } from '@/types/dashboard';

export default function CommandCenterPage() {
    const { data: session, status } = useSession();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [chartData, setChartData] = useState<{
        intakeTrends: ChartDataPoint[];
        documentProcessing: any[];
        agentMetrics: any[];
        pipelinePerformance: any[];
        quotaData: any[];
    }>({
        intakeTrends: [],
        documentProcessing: [],
        agentMetrics: [],
        pipelinePerformance: [],
        quotaData: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState('30d');
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    const fetchDashboardData = async () => {
        if (status !== 'authenticated') return;

        try {
            setLoading(true);
            setError(null);

            const [statsResponse, intakeResponse, documentResponse, agentResponse, pipelineResponse, quotaResponse] = await Promise.all([
                fetch('/api/dashboard/stats'),
                fetch(`/api/dashboard/charts/intake-trends?range=${timeRange}`),
                fetch(`/api/dashboard/charts/document-processing?range=${timeRange}`),
                fetch(`/api/dashboard/charts/agent-metrics?range=${timeRange}`),
                fetch(`/api/dashboard/charts/pipeline-performance`),
                fetch(`/api/dashboard/quota`),
            ]);

            if (!statsResponse.ok || !intakeResponse.ok || !documentResponse.ok || !agentResponse.ok || !pipelineResponse.ok || !quotaResponse.ok) {
                throw new Error('Failed to fetch one or more dashboard data sources');
            }

            const statsData: DashboardData = await statsResponse.json();
            const intakeData = await intakeResponse.json();
            const documentData = await documentResponse.json();
            const agentData = await agentResponse.json();
            const pipelineData = await pipelineResponse.json();
            const quotaData = await quotaResponse.json();

            setDashboardData(statsData);
            setChartData({
                intakeTrends: intakeData,
                documentProcessing: documentData,
                agentMetrics: agentData,
                pipelinePerformance: pipelineData,
                quotaData: quotaData.chartData,
            });
            setLastRefresh(new Date());
        } catch (err) {
            console.error('Command Center fetch error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load command center data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [status, timeRange]);

    // Auto-refresh every 60 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchDashboardData();
        }, 60000);
        return () => clearInterval(interval);
    }, [timeRange, status]);

    const router = useRouter();

    const handleMetricClick = (metricType: string) => {
        switch (metricType) {
            case 'intake': router.push('/intake'); break;
            case 'pipelines': router.push('/pipelines'); break;
            case 'documents': router.push('/documents'); break;
            default: break;
        }
    };

    if (status === 'loading') {
        return <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-astralis-blue"></div>
        </div>;
    }

    if (error) {
        return (
            <div className="p-6">
                <Alert variant="error">
                    <AlertTitle>Operation Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!dashboardData) return null;

    const { stats, recentActivity, roiMetrics } = dashboardData;
    const tasksCompleted = (dashboardData.recentPipelines || []).reduce((sum, p) => sum + p.itemCount, 0);

    return (
        <div className="space-y-8 pb-12">
            {/* Dynamic Header with Status Pulse */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-gradient-to-br from-astralis-navy to-slate-900 p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Activity className="w-32 h-32 text-blue-400" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)] animate-pulse" />
                        <span className="text-xs font-bold tracking-[0.2em] text-emerald-400 uppercase">System Operational</span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight">Command Center</h1>
                    <p className="text-slate-400 mt-2 text-lg">Mission control for {session?.user?.name || 'Authorized Personnel'}</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 relative z-10">
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Time Range</span>
                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger className="w-36 bg-white/5 border-white/10 text-white font-semibold">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7d">Last 7 Days</SelectItem>
                                <SelectItem value="30d">Last 30 Days</SelectItem>
                                <SelectItem value="90d">Quarterly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => fetchDashboardData()}
                        disabled={loading}
                        className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Sync
                    </Button>
                </div>
            </div>

            {/* Primary KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Inbound Volume"
                    value={stats.intake.total}
                    change={{ value: stats.intake.change, trend: stats.intake.change >= 0 ? 'up' : 'down', period: 'last period' }}
                    icon={<Inbox className="w-5 h-5" />}
                    sparklineData={chartData.intakeTrends.slice(-10)}
                    className="bg-white border-0 shadow-sm hover:shadow-md transition-all border-l-4 border-l-astralis-blue"
                    onClick={() => handleMetricClick('intake')}
                />
                <MetricCard
                    title="Active Operations"
                    value={stats.pipelines.active}
                    change={{ value: stats.pipelines.change, trend: stats.pipelines.change >= 0 ? 'up' : 'down', period: 'last period' }}
                    icon={<GitBranch className="w-5 h-5" />}
                    className="bg-white border-0 shadow-sm hover:shadow-md transition-all border-l-4 border-l-indigo-500"
                    onClick={() => handleMetricClick('pipelines')}
                />
                <MetricCard
                    title="Neural Processing"
                    value={stats.documents.total}
                    change={{ value: stats.documents.change, trend: stats.documents.change >= 0 ? 'up' : 'down', period: 'last period' }}
                    icon={<Zap className="w-5 h-5" />}
                    className="bg-white border-0 shadow-sm hover:shadow-md transition-all border-l-4 border-l-amber-500"
                />
                <MetricCard
                    title="Completed Objectives"
                    value={tasksCompleted}
                    icon={<Target className="w-5 h-5" />}
                    className="bg-white border-0 shadow-sm hover:shadow-md transition-all border-l-4 border-l-emerald-500"
                />
            </div>

            {/* Strategic Insights & ROI */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ChartContainer title="Operational Efficiency" loading={loading} className="bg-white rounded-2xl shadow-sm border-0">
                            <AreaChart
                                data={chartData.documentProcessing}
                                height={300}
                                dataKey="processed"
                                fillColor="#2B6CB0"
                                strokeColor="#2B6CB0"
                                showTooltip
                                animate
                            />
                        </ChartContainer>

                        <ChartContainer title="Pipeline Distribution" loading={loading} className="bg-white rounded-2xl shadow-sm border-0">
                            <BarChart
                                data={chartData.pipelinePerformance}
                                height={300}
                                dataKey="value"
                                xAxisKey="name"
                                fillColor="#4F46E5"
                                animate
                            />
                        </ChartContainer>
                    </div>

                    <Card className="border-0 shadow-sm bg-white overflow-hidden rounded-2xl">
                        <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-astralis-blue" />
                                    Live Operational Stream
                                </CardTitle>
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                    Realtime Monitoring
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ActivityFeed activities={recentActivity} />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <RoiMetricsWidget metrics={roiMetrics} />

                    <Card className="bg-white border-0 shadow-sm rounded-2xl overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest">Commercial Capacity</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {chartData.quotaData.map((quota) => (
                                <div key={quota.resource} className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-slate-700">
                                        <span>{quota.resource}</span>
                                        <span>{quota.percentage}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "h-full rounded-full transition-all duration-500",
                                                quota.percentage > 80 ? "bg-rose-500" : quota.percentage > 50 ? "bg-amber-400" : "bg-astralis-blue"
                                            )}
                                            style={{ width: `${quota.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white border-0 shadow-lg rounded-2xl">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold flex items-center gap-2 text-white">
                                <BarChart3 className="w-6 h-6" />
                                Strategic Yield
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-0">
                            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/5">
                                <div className="text-xs font-bold text-blue-100 uppercase tracking-widest mb-1">Automation Velocity</div>
                                <div className="text-3xl font-black">{roiMetrics.automationRate}%</div>
                                <div className="w-full bg-white/20 h-2 rounded-full mt-3 overflow-hidden">
                                    <div
                                        className="bg-emerald-400 h-full rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                                        style={{ width: `${roiMetrics.automationRate}%` }}
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/5">
                                <div className="text-xs font-bold text-blue-100 uppercase tracking-widest mb-1">Human Capital Saved</div>
                                <div className="text-3xl font-black text-emerald-400">{roiMetrics.timeSavedHours}h</div>
                                <div className="text-sm text-blue-100 mt-1 opacity-80">This billing period</div>
                            </div>
                        </CardContent>
                    </Card>

                    <AgentChatInterface
                        context={{
                            metrics: dashboardData,
                            trends: chartData
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

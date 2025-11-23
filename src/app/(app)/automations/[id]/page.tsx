'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ExecutionHistory } from '@/components/automations/ExecutionHistory';
import { ExecutionDetailModal } from '@/components/automations/ExecutionDetailModal';
import { TriggerConfig } from '@/components/automations/TriggerConfig';
import {
  ArrowLeft,
  Play,
  Pause,
  Settings,
  Trash2,
  TrendingUp,
  CheckCircle2,
  Clock,
  Activity,
} from 'lucide-react';
import type { Automation, WorkflowExecution } from '@/types/automation';

export default function AutomationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const automationId = params.id as string;

  const [automation, setAutomation] = useState<Automation | null>(null);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    // Don't fetch if this is the "new" route
    if (automationId && automationId !== 'new') {
      fetchAutomation();
      fetchExecutions();
    } else if (automationId === 'new') {
      // Redirect to the correct new page
      router.push('/automations/new');
    }
  }, [automationId]);

  const fetchAutomation = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/automations/${automationId}`);
      if (!res.ok) throw new Error('Failed to fetch automation');
      const response = await res.json();
      setAutomation(response.data || response); // Handle both {data: ...} and direct object
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load automation');
    } finally {
      setLoading(false);
    }
  };

  const fetchExecutions = async () => {
    try {
      const res = await fetch(`/api/automations/${automationId}/executions`);
      if (!res.ok) throw new Error('Failed to fetch executions');
      const data = await res.json();
      setExecutions(data.executions || []);
    } catch (err) {
      console.error('Failed to load executions:', err);
    }
  };

  const handleToggle = async () => {
    if (!automation) return;
    try {
      const res = await fetch(`/api/automations/${automationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !automation.isActive }),
      });

      if (!res.ok) throw new Error('Failed to toggle automation');

      setAutomation({ ...automation, isActive: !automation.isActive });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to toggle automation');
    }
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      const res = await fetch(`/api/automations/${automationId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerData: {} }),
      });

      if (!res.ok) throw new Error('Failed to execute automation');

      alert('Automation executed successfully!');
      fetchAutomation();
      fetchExecutions();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to execute automation');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this automation?')) return;

    try {
      const res = await fetch(`/api/automations/${automationId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete automation');

      router.push('/automations');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete automation');
    }
  };

  const handleRetry = async (executionId: string) => {
    try {
      const res = await fetch(`/api/automations/${automationId}/executions/${executionId}/retry`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed to retry execution');

      fetchExecutions();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to retry execution');
    }
  };

  const handleExport = () => {
    // Convert executions to CSV
    const headers = ['ID', 'Status', 'Started At', 'Duration (ms)', 'Trigger Data'];
    const rows = executions.map((exec) => [
      exec.id,
      exec.status,
      new Date(exec.startedAt).toISOString(),
      exec.executionTime || '',
      JSON.stringify(exec.triggerData),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `automation-${automationId}-executions.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !automation) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Alert variant="error" showIcon>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error || 'Automation not found'}</AlertDescription>
          </Alert>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/automations">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Automations
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const successRate =
    automation.executionCount > 0
      ? Math.round((automation.successCount / automation.executionCount) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/automations">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-astralis-navy">{automation.name}</h1>
              {automation.description && (
                <p className="text-slate-600 mt-1">{automation.description}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={automation.isActive ? 'success' : 'default'}>
                  {automation.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant="primary" className="capitalize">
                  {automation.triggerType.toLowerCase()}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              className="gap-1.5 text-sm"
              onClick={handleExecute}
              disabled={isExecuting}
            >
              <Play className="h-4 w-4" />
              {isExecuting ? 'Executing...' : 'Execute Now'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="gap-1.5 text-sm"
              onClick={handleToggle}
            >
              {automation.isActive ? (
                <>
                  <Pause className="h-4 w-4" />
                  Deactivate
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Activate
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-sm" asChild>
              <Link href={`/automations/${automationId}/edit`}>
                <Settings className="h-5 w-5" />
                Edit
              </Link>
            </Button>
            <Button variant="destructive" size="icon" className="h-9 w-9" onClick={handleDelete}>
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-astralis-blue/10 text-astralis-blue">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Executions</p>
                  <p className="text-2xl font-bold text-astralis-navy">
                    {automation.executionCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Success Rate</p>
                  <p className="text-2xl font-bold text-astralis-navy">{successRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Avg Execution Time</p>
                  <p className="text-2xl font-bold text-astralis-navy">
                    {automation.avgExecutionTime
                      ? `${(automation.avgExecutionTime / 1000).toFixed(2)}s`
                      : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 text-info">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Last Executed</p>
                  <p className="text-sm font-semibold text-astralis-navy">
                    {automation.lastExecutedAt
                      ? new Date(automation.lastExecutedAt).toLocaleDateString()
                      : 'Never'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="executions">
              Executions ({executions.length})
            </TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trigger Configuration</CardTitle>
                <CardDescription>
                  How this automation is triggered
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TriggerConfig
                  triggerType={automation.triggerType}
                  config={automation.triggerConfig}
                  onChange={() => {}}
                  webhookUrl={automation.webhookUrl || undefined}
                />
              </CardContent>
            </Card>

            {automation.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {automation.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="executions">
            <ExecutionHistory
              automationId={automationId}
              executions={executions}
              onViewDetails={setSelectedExecution}
              onRetry={handleRetry}
              onExport={handleExport}
            />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Automation Settings</CardTitle>
                <CardDescription>
                  Configuration and metadata for this automation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-900 mb-1">Automation ID</p>
                  <p className="text-sm text-slate-600 font-mono">{automation.id}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-900 mb-1">Created</p>
                  <p className="text-sm text-slate-600">
                    {new Date(automation.createdAt).toLocaleString('en-US', {
                      dateStyle: 'full',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-900 mb-1">Last Updated</p>
                  <p className="text-sm text-slate-600">
                    {new Date(automation.updatedAt).toLocaleString('en-US', {
                      dateStyle: 'full',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>

                {automation.n8nWorkflowId && (
                  <div>
                    <p className="text-sm font-medium text-slate-900 mb-1">n8n Workflow ID</p>
                    <p className="text-sm text-slate-600 font-mono">
                      {automation.n8nWorkflowId}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Execution Detail Modal */}
      <ExecutionDetailModal
        execution={selectedExecution}
        isOpen={!!selectedExecution}
        onClose={() => setSelectedExecution(null)}
        onRetry={handleRetry}
      />
    </div>
  );
}

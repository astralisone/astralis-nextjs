'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { WorkflowEditor } from '@/components/automations/WorkflowEditor';
import { ArrowLeft, Save, X } from 'lucide-react';
import type { Automation } from '@/types/automation';

export default function EditAutomationPage() {
  const params = useParams();
  const router = useRouter();
  const automationId = params.id as string;

  const [automation, setAutomation] = useState<Automation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [workflowJson, setWorkflowJson] = useState<any>(null);

  useEffect(() => {
    if (automationId && automationId !== 'new') {
      fetchAutomation();
    }
  }, [automationId]);

  const fetchAutomation = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/automations/${automationId}`);
      if (!res.ok) throw new Error('Failed to fetch automation');
      const response = await res.json();
      const data = response.data || response;

      setAutomation(data);
      setName(data.name || '');
      setDescription(data.description || '');
      setTags(data.tags?.join(', ') || '');
      setIsActive(data.isActive ?? true);

      // Get workflow JSON from metadata or fetch from n8n
      if (data.metadata?.workflowJson) {
        setWorkflowJson(data.metadata.workflowJson);
      } else if (data.n8nWorkflowId) {
        // Fetch from n8n if available
        fetchWorkflowFromN8n(data.n8nWorkflowId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load automation');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkflowFromN8n = async (workflowId: string) => {
    try {
      const res = await fetch(`/api/automations/${automationId}/workflow`);
      if (res.ok) {
        const data = await res.json();
        setWorkflowJson(data.workflow);
      }
    } catch (err) {
      console.error('Failed to fetch workflow from n8n:', err);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const updateData: any = {
        name,
        description: description || null,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        isActive,
      };

      // Include workflow JSON in metadata if modified
      if (workflowJson) {
        updateData.metadata = {
          ...(automation?.metadata || {}),
          workflowJson,
        };
      }

      const res = await fetch(`/api/automations/${automationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.details || 'Failed to update automation');
      }

      router.push(`/automations/${automationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save automation');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error && !automation) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-3xl mx-auto">
          <Alert variant="error" showIcon>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button variant="outline" className="mt-4" asChild>
            <Link href={`/automations/${automationId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Automation
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/automations/${automationId}`}>
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-astralis-navy">
                Edit Automation
              </h1>
              <p className="text-slate-600 mt-1">
                Update automation settings and configuration
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="error" showIcon>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Edit Tabs */}
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Automation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Lead Notification Workflow"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this automation does..."
                rows={4}
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., sales, email, notification (comma-separated)"
              />
              <p className="text-xs text-slate-500">
                Separate tags with commas
              </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-astralis-blue border-slate-300 rounded focus:ring-astralis-blue"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Automation is active
              </Label>
            </div>

            {/* Read-only Info */}
            {automation && (
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">Trigger Type</p>
                  <p className="text-sm text-slate-600 capitalize mt-1">
                    {automation.triggerType?.toLowerCase()}
                  </p>
                </div>
                {automation.n8nWorkflowId && (
                  <div>
                    <p className="text-sm font-medium text-slate-900">n8n Workflow ID</p>
                    <p className="text-sm text-slate-600 font-mono mt-1">
                      {automation.n8nWorkflowId}
                    </p>
                    <a
                      href={`http://localhost:5678/workflow/${automation.n8nWorkflowId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-astralis-blue hover:underline"
                    >
                      Edit in n8n →
                    </a>
                  </div>
                )}
              </div>
            )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workflow">
            <WorkflowEditor
              workflowJson={workflowJson}
              onChange={setWorkflowJson}
              n8nWorkflowId={automation?.n8nWorkflowId}
            />
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving || !name}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/automations/${automationId}`}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

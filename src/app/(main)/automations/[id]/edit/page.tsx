// src/app/(main)/automations/[id]/edit/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  X,
  Settings,
  Zap,
  Activity,
  Code,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { WorkflowEditor } from '@/components/automations/WorkflowEditor';

export default function EditAutomationPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const automationId = params.id as string;

  const [automation, setAutomation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [workflowJson, setWorkflowJson] = useState<any>(null);

  useEffect(() => {
    async function fetchAutomation() {
      try {
        const response = await fetch(`/api/automations/${automationId}`);
        if (!response.ok) throw new Error('Failed to fetch automation');
        const data = await response.json();

        setAutomation(data);
        setName(data.name);
        setDescription(data.description || '');
        setIsActive(data.isActive);
        setWorkflowJson(data.metadata?.workflowJson || { nodes: [], connections: {} });
      } catch (error) {
        console.error('Error fetching automation:', error);
        toast({
          title: 'Error',
          description: 'Failed to load automation details.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    if (automationId) {
      fetchAutomation();
    }
  }, [automationId, toast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/automations/${automationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          isActive,
          metadata: {
            ...automation.metadata,
            workflowJson
          }
        }),
      });

      if (!response.ok) throw new Error('Failed to update automation');

      toast({
        title: 'Success',
        description: 'Automation updated successfully.',
      });
      router.push(`/automations/${automationId}`);
    } catch (error) {
      console.error('Error updating automation:', error);
      toast({
        title: 'Error',
        description: 'Failed to update automation.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-astralis-blue"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/automations/${automationId}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Edit Automation</h1>
              <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                <Link href="/automations" className="hover:text-astralis-blue">Automations</Link>
                <ChevronRight className="h-3 w-3" />
                <span>{name}</span>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="bg-slate-100 p-1">
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="workflow" className="gap-2">
              <Code className="h-4 w-4" />
              Workflow Logic
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Automation Details</CardTitle>
                <CardDescription>
                  Configure the basic information and triggering for this automation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Lead Response Workflow"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what this automation does..."
                    rows={3}
                  />
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className=" w-5 h-5 text-astralis-blue border-slate-300 rounded focus:ring-astralis-blue"
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
                        <div className="mt-3">
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={`https://astralis-n8n.fly.dev/workflow/${automation.n8nWorkflowId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              Edit in n8n →
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workflow" className="mt-6">
            <WorkflowEditor
              workflowJson={workflowJson}
              onChange={setWorkflowJson}
              n8nWorkflowId={automation?.n8nWorkflowId ?? undefined}
            />
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
          <Button
            variant="primary"
            size="sm"
            className="gap-1.5 text-sm"
            onClick={handleSave}
            disabled={saving || !name}
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-sm" asChild>
            <Link href={`/automations/${automationId}`}>
              <X className="h-4 w-4" />
              Cancel
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
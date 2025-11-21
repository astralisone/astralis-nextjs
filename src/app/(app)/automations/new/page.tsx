'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Zap, FileCode } from 'lucide-react';
import type { AutomationTemplate } from '@/types/automation';

export default function NewAutomationPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<AutomationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/automations/templates');
      if (!res.ok) throw new Error('Failed to fetch templates');
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Link href="/automations">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Automations
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-astralis-navy mb-2">Create New Automation</h1>
        <p className="text-slate-600">Choose how you want to create your automation workflow</p>
      </div>

      {error && (
        <Alert variant="error" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Creation Options */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {/* Option 1: From Template */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-astralis-blue">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-astralis-blue/10 rounded-lg">
                <Zap className="h-6 w-6 text-astralis-blue" />
              </div>
              <CardTitle>Start from Template</CardTitle>
            </div>
            <CardDescription>
              Choose from {templates.length} pre-built automation workflows. Get started in minutes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/automations/templates">
              <Button className="w-full">
                Browse Templates
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Option 2: From Scratch */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-500">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <FileCode className="h-6 w-6 text-purple-500" />
              </div>
              <CardTitle>Build from Scratch</CardTitle>
            </div>
            <CardDescription>
              Create a custom workflow using the visual n8n editor. Advanced users only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full bg-purple-500 hover:bg-purple-600"
              onClick={() => window.open('http://localhost:5678', '_blank')}
            >
              Open n8n Editor
            </Button>
            <p className="text-xs text-slate-500 mt-2 text-center">
              Opens in new tab. Save your workflow and import it here.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Featured Templates Preview */}
      {!loading && templates.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-astralis-navy mb-4">Featured Templates</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {templates.slice(0, 3).map((template) => (
              <Link key={template.id} href={`/automations/templates#${template.id}`}>
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {template.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-astralis-blue border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Loading templates...</p>
        </div>
      )}
    </div>
  );
}

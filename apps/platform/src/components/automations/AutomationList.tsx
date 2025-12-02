'use client';

import { AutomationCard } from './AutomationCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Plus, Zap } from 'lucide-react';
import type { Automation } from '@/types/automation';

interface AutomationListProps {
  automations: Automation[];
  isLoading?: boolean;
  error?: string | null;
  onToggle?: (id: string, isActive: boolean) => void;
  onDelete?: (id: string) => void;
  onExecute?: (id: string) => void;
}

export function AutomationList({
  automations,
  isLoading = false,
  error = null,
  onToggle,
  onDelete,
  onExecute,
}: AutomationListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border border-slate-200 rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Skeleton variant="rectangular" width={40} height={40} className="rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" className="w-3/4 h-5" />
                <Skeleton variant="text" className="w-1/2 h-4" />
              </div>
            </div>
            <Skeleton variant="text" className="w-full h-4" />
            <Skeleton variant="text" className="w-5/6 h-4" />
            <div className="grid grid-cols-3 gap-3 pt-3">
              <Skeleton variant="text" className="h-12" />
              <Skeleton variant="text" className="h-12" />
              <Skeleton variant="text" className="h-12" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" showIcon>
        <AlertTitle>Error Loading Automations</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (automations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-20 h-20 bg-astralis-blue/10 rounded-full flex items-center justify-center mb-6">
          <Zap className="w-10 h-10 text-astralis-blue" />
        </div>
        <h3 className="text-2xl font-semibold text-astralis-navy mb-2">
          No Automations Yet
        </h3>
        <p className="text-slate-600 mb-6 max-w-md">
          Get started by creating your first automation. Choose from our pre-built templates
          or build a custom workflow from scratch.
        </p>
        <div className="flex gap-3">
          <Button variant="primary" size="lg" asChild>
            <a href="/automations/new">
              <Plus className="w-5 h-5 mr-2" />
              Create Automation
            </a>
          </Button>
          <Button variant="secondary" size="lg" asChild>
            <a href="/automations/templates">Browse Templates</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {automations.map((automation) => (
        <AutomationCard
          key={automation.id}
          automation={automation}
          onToggle={onToggle}
          onDelete={onDelete}
          onExecute={onExecute}
        />
      ))}
    </div>
  );
}

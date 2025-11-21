'use client';

import { use, useState } from 'react';
import { usePipeline } from '@/hooks/usePipelines';
import { KanbanBoard } from '@/components/dashboard/KanbanBoard';
import { StageManager } from '@/components/pipelines/StageManager';
import { ArrowLeft, Settings } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function PipelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: pipeline, isLoading, error, refetch } = usePipeline(id);
  const [isStageManagerOpen, setIsStageManagerOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-astralis-blue"></div>
      </div>
    );
  }

  if (error || !pipeline) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load pipeline</p>
      </div>
    );
  }

  const handleStagesChange = () => {
    refetch();
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/pipelines">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-astralis-navy">{pipeline.name}</h1>
            {pipeline.description && (
              <p className="text-slate-600 mt-1">{pipeline.description}</p>
            )}
          </div>
        </div>

        <Sheet open={isStageManagerOpen} onOpenChange={setIsStageManagerOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Settings className="w-4 h-4" />
              Manage Stages
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Pipeline Stages</SheetTitle>
              <SheetDescription>
                Add, edit, or remove stages in this pipeline
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <StageManager
                pipelineId={pipeline.id}
                stages={pipeline.stages}
                onStagesChange={handleStagesChange}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {pipeline.stages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <Settings className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-astralis-navy mb-2">
              No stages yet
            </h3>
            <p className="text-slate-600 mb-6">
              Get started by creating stages for your pipeline. Stages help organize
              work items as they move through your workflow.
            </p>
            <Button onClick={() => setIsStageManagerOpen(true)} className="gap-2">
              <Settings className="w-4 h-4" />
              Create First Stage
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <KanbanBoard pipeline={pipeline} onRefetch={refetch} />
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, GitBranch } from 'lucide-react';
import { CreatePipelineModal } from '@/components/pipelines/CreatePipelineModal';
import { usePipelines } from '@/hooks/usePipelines';

export default function PipelinesPage() {
  const { data: session } = useSession();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: pipelines, isLoading, error, refetch } = usePipelines();

  const handleCreateSuccess = () => {
    refetch();
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Please sign in to view pipelines.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-astralis-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        Failed to load pipelines. Please try again.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-astralis-navy">Pipelines</h1>
            <p className="text-slate-600 mt-1">Manage your workflow pipelines</p>
          </div>
          <Button
            variant="primary"
            className="gap-2"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="w-5 h-5" />
            New Pipeline
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pipelines && pipelines.length > 0 && pipelines.map((pipeline) => {
            // Calculate total items across all stages
            const totalItems = pipeline.stages?.reduce((sum, stage) => {
              // API returns _count.items for each stage
              const stageCount = (stage as any)._count?.items || 0;
              return sum + stageCount;
            }, 0) || 0;

            return (
              <Link key={pipeline.id} href={`/pipelines/${pipeline.id}`}>
                <Card variant="default" hover>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-astralis-blue/10 rounded-lg">
                        <GitBranch className="w-5 h-5 text-astralis-blue" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{pipeline.name}</CardTitle>
                        <p className="text-sm text-slate-500 mt-1">
                          {pipeline.stages?.length || 0} stages • {totalItems} items
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  {pipeline.description && (
                    <CardContent>
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {pipeline.description}
                      </p>
                    </CardContent>
                  )}
                </Card>
              </Link>
            );
          })}

          {(!pipelines || pipelines.length === 0) && (
            <div className="col-span-full">
              <Card variant="default">
                <CardContent className="p-12 text-center">
                  <GitBranch className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">
                    No pipelines yet
                  </h3>
                  <p className="text-slate-500 mb-4">
                    Create your first pipeline to get started
                  </p>
                  <Button
                    variant="primary"
                    className="gap-2"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <Plus className=" ui-icon w-5 h-5" />
                    Create Pipeline
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <CreatePipelineModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}

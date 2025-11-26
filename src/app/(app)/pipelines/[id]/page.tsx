'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePipeline, usePipelines } from '@/hooks/usePipelines';
import { useUnclassifiedIntake, useAssignIntake } from '@/hooks/useIntakeRequests';
import { KanbanBoard } from '@/components/dashboard/KanbanBoard';
import { StageManager } from '@/components/pipelines/StageManager';
import { IntakeCard } from '@/components/intake/IntakeCard';
import { ArrowLeft, Settings, Inbox, AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { toast } from '@/components/ui/use-toast';
import { IntakeRequest, IntakeStatus } from '@/types/pipelines';

export default function PipelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: pipeline, isLoading, error, refetch } = usePipeline(id);
  const { data: allPipelines } = usePipelines();
  const { data: unclassifiedData, isLoading: isLoadingUnclassified, refetch: refetchUnclassified } = useUnclassifiedIntake();
  const assignIntakeMutation = useAssignIntake();
  const [isStageManagerOpen, setIsStageManagerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('kanban');
  const [assigningIntakeId, setAssigningIntakeId] = useState<string | null>(null);

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

  const handleIntakeClick = (intake: IntakeRequest) => {
    // Navigate to intake detail page
    router.push(`/intakes/${intake.id}`);
  };

  const handleAssignToPipeline = async (intakeId: string, pipelineId: string) => {
    setAssigningIntakeId(intakeId);
    try {
      const result = await assignIntakeMutation.mutateAsync({
        intakeId,
        pipelineId,
      });

      toast({
        title: 'Intake Assigned',
        description: result.message || 'Successfully assigned intake to pipeline',
      });

      // Refresh both the unclassified list and pipeline data
      refetchUnclassified();
      refetch();
    } catch (error) {
      toast({
        title: 'Assignment Failed',
        description: error instanceof Error ? error.message : 'Failed to assign intake to pipeline',
        variant: 'destructive',
      });
    } finally {
      setAssigningIntakeId(null);
    }
  };

  // Get list of pipelines for the dropdown (with stages so we can filter out empty ones)
  const pipelinesForDropdown = (allPipelines || [])
    .filter(p => p.isActive && p.stages && p.stages.length > 0)
    .map(p => ({ id: p.id, name: p.name }));

  // Get intake counts for display
  const intakeRequests = (pipeline?.intakeRequests || []) as IntakeRequest[];
  const intakeCounts = {
    new: intakeRequests.filter(i => i.status === IntakeStatus.NEW).length,
    routing: intakeRequests.filter(i => i.status === IntakeStatus.ROUTING).length,
    assigned: intakeRequests.filter(i => i.status === IntakeStatus.ASSIGNED).length,
    processing: intakeRequests.filter(i => i.status === IntakeStatus.PROCESSING).length,
    total: intakeRequests.filter(
      i => i.status !== IntakeStatus.COMPLETED && i.status !== IntakeStatus.REJECTED
    ).length,
  };

  // Unclassified items (from all org pipelines, not yet assigned)
  const unclassifiedItems = unclassifiedData?.intakeRequests || [];
  const unclassifiedCounts = unclassifiedData?.counts || { new: 0, routing: 0, total: 0 };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/pipelines">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-5 h-5" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-astralis-navy">{pipeline.name}</h1>
              {/* Intake status summary badges */}
              {intakeCounts.total > 0 && (
                <div className="flex items-center gap-2">
                  {intakeCounts.new > 0 && (
                    <Badge className="bg-yellow-100 text-yellow-700 text-xs flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {intakeCounts.new} new
                    </Badge>
                  )}
                  {intakeCounts.routing > 0 && (
                    <Badge className="bg-blue-100 text-blue-700 text-xs flex items-center gap-1">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {intakeCounts.routing} routing
                    </Badge>
                  )}
                  {intakeCounts.processing > 0 && (
                    <Badge className="bg-blue-100 text-blue-700 text-xs flex items-center gap-1">
                      <Inbox className="w-4 h-4" />
                      {intakeCounts.processing} processing
                    </Badge>
                  )}
                </div>
              )}
            </div>
            {pipeline.description && (
              <p className="text-slate-600 mt-1">{pipeline.description}</p>
            )}
          </div>
        </div>

        <Sheet open={isStageManagerOpen} onOpenChange={setIsStageManagerOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Settings className="w-5 h-5" />
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
        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="mb-4">
              <TabsTrigger value="kanban" className="gap-2">
                <Inbox className="w-5 h-5" />
                Kanban Board
              </TabsTrigger>
              <TabsTrigger value="unclassified" className="gap-2">
                <AlertTriangle className="w-5 h-5" />
                Unclassified Intake
                {unclassifiedCounts.total > 0 && (
                  <Badge className="ml-1 bg-yellow-100 text-yellow-700 text-xs">
                    {unclassifiedCounts.total}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="kanban" className="flex-1 overflow-hidden">
              <KanbanBoard
                pipeline={pipeline}
                onRefetch={refetch}
              />
            </TabsContent>

            <TabsContent value="unclassified" className="flex-1 overflow-auto">
              <div className="space-y-6">
                {/* Unclassified Intake Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-astralis-navy">
                      Unclassified Intake Items
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">
                      These items have not been routed to a pipeline yet and need classification.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {unclassifiedCounts.new > 0 && (
                      <Badge className="bg-yellow-100 text-yellow-700 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {unclassifiedCounts.new} New
                      </Badge>
                    )}
                    {unclassifiedCounts.routing > 0 && (
                      <Badge className="bg-blue-100 text-blue-700 flex items-center gap-1">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {unclassifiedCounts.routing} Routing
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Loading state */}
                {isLoadingUnclassified && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-astralis-blue" />
                  </div>
                )}

                {/* Empty state */}
                {!isLoadingUnclassified && unclassifiedItems.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
                      <Inbox className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-astralis-navy mb-2">
                      All caught up!
                    </h3>
                    <p className="text-slate-600">
                      There are no unclassified intake items at the moment.
                    </p>
                  </div>
                )}

                {/* Unclassified items grid */}
                {!isLoadingUnclassified && unclassifiedItems.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {unclassifiedItems.map((intake: IntakeRequest) => (
                      <IntakeCard
                        key={intake.id}
                        intake={intake}
                        onClick={() => handleIntakeClick(intake)}
                        availablePipelines={pipelinesForDropdown}
                        onPipelineAssign={handleAssignToPipeline}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

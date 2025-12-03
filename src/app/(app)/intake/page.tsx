'use client';

import { useState, useEffect, useMemo } from 'react';
import { useIntake } from '@/hooks/useIntake';
import { usePipelines } from '@/hooks/usePipelines';
import { useAssignIntake } from '@/hooks/useIntakeRequests';
import { IntakeQueueTable } from '@/components/dashboard/IntakeQueueTable';
import { CreateIntakeModal } from '@/components/intake/CreateIntakeModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function IntakePage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState<{
    status?: string;
    source?: string;
  }>({});
  const [assigningIntakeId, setAssigningIntakeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search query with 300ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, error, refetch } = useIntake(filters);

  // Filter requests client-side by title (description not available in interface)
  const filteredRequests = useMemo(() => {
    const requests = data?.requests || [];
    if (!debouncedSearch.trim()) return requests;

    const searchLower = debouncedSearch.toLowerCase();
    return requests.filter((request) =>
      request.title.toLowerCase().includes(searchLower)
    );
  }, [data?.requests, debouncedSearch]);
  const { data: allPipelines } = usePipelines();
  const assignIntakeMutation = useAssignIntake();

  const handleCreateSuccess = () => {
    refetch();
  };

  // Get list of pipelines for the dropdown (with stages so we can filter out empty ones)
  const pipelinesForDropdown = (allPipelines || [])
    .filter(p => p.isActive && p.stages && p.stages.length > 0)
    .map(p => ({ id: p.id, name: p.name }));

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

      // Refresh the intake list
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

  const handleDeleteSingle = async (intakeId: string) => {
    try {
      const response = await fetch(`/api/intake/${intakeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete intake request');
      }

      toast({
        title: 'Deleted',
        description: 'Intake request has been deleted',
      });

      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete intake request',
        variant: 'destructive',
      });
      throw error; // Re-throw to let the dialog know it failed
    }
  };

  const handleDeleteBulk = async (intakeIds: string[]) => {
    try {
      const response = await fetch('/api/intake/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: intakeIds,
          action: 'delete',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete intake requests');
      }

      const result = await response.json();

      toast({
        title: 'Deleted',
        description: `${result.deletedCount || intakeIds.length} intake request${intakeIds.length > 1 ? 's' : ''} deleted`,
      });

      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete intake requests',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-astralis-navy">Intake Queue</h1>
            <p className="text-slate-600 mt-1">Review and route incoming requests</p>
          </div>
          <Button
            variant="primary"
            className="gap-2"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="w-5 h-5" />
            New Request
          </Button>
        </div>

        {/* Full-width search bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search requests by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 w-full"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-astralis-blue"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">
            Failed to load intake requests
          </div>
        ) : (
          <IntakeQueueTable
            requests={filteredRequests}
            pipelines={pipelinesForDropdown}
            onAssignToPipeline={handleAssignToPipeline}
            assigningIntakeId={assigningIntakeId}
            onDeleteSingle={handleDeleteSingle}
            onDeleteBulk={handleDeleteBulk}
          />
        )}
      </div>

      <CreateIntakeModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}

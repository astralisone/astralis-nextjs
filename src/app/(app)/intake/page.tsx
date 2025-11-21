'use client';

import { useState } from 'react';
import { useIntake } from '@/hooks/useIntake';
import { IntakeQueueTable } from '@/components/dashboard/IntakeQueueTable';
import { CreateIntakeModal } from '@/components/intake/CreateIntakeModal';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';

export default function IntakePage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState<{
    status?: string;
    source?: string;
  }>({});

  const { data, isLoading, error, refetch } = useIntake(filters);

  const handleCreateSuccess = () => {
    refetch();
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-astralis-navy">Intake Queue</h1>
            <p className="text-slate-600 mt-1">Review and route incoming requests</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            <Button
              variant="primary"
              className="gap-2"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="w-4 h-4" />
              New Request
            </Button>
          </div>
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
          <IntakeQueueTable requests={data?.requests || []} />
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

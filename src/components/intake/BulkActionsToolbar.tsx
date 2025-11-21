'use client';

import React from 'react';
import { IntakeStatus } from '@prisma/client';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { UserCheck, Route, AlertCircle, Archive, Trash2, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface BulkActionsToolbarProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onActionComplete: () => void;
  availablePipelines?: Array<{ id: string; name: string }>;
}

type BulkAction = 'status' | 'pipeline' | 'priority' | 'delete' | null;

export function BulkActionsToolbar({
  selectedIds,
  onClearSelection,
  onActionComplete,
  availablePipelines = [],
}: BulkActionsToolbarProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState<BulkAction>(null);
  const [selectedStatus, setSelectedStatus] = React.useState<IntakeStatus | ''>('');
  const [selectedPipeline, setSelectedPipeline] = React.useState<string>('');
  const [selectedPriority, setSelectedPriority] = React.useState<string>('');

  const count = selectedIds.length;

  if (count === 0) {
    return null;
  }

  const performBulkAction = async (
    action: string,
    data?: Record<string, any>
  ) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/intake/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedIds,
          action,
          data,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to perform action');
      }

      const result = await response.json();

      toast({
        title: 'Success',
        description: `Updated ${result.affectedCount} request(s)`,
      });

      onActionComplete();
      onClearSelection();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to perform action',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      setConfirmAction(null);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedStatus) return;
    await performBulkAction('update_status', { status: selectedStatus });
    setSelectedStatus('');
  };

  const handlePipelineAssignment = async () => {
    if (!selectedPipeline) return;
    await performBulkAction('assign_pipeline', { assignedPipeline: selectedPipeline });
    setSelectedPipeline('');
  };

  const handlePriorityChange = async () => {
    if (!selectedPriority) return;
    await performBulkAction('update_priority', { priority: parseInt(selectedPriority) });
    setSelectedPriority('');
  };

  const handleDelete = async () => {
    await performBulkAction('delete');
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-astralis-navy text-white rounded-lg shadow-lg border border-astralis-cyan/20 px-6 py-4">
          <div className="flex items-center gap-6">
            {/* Selection count */}
            <div className="flex items-center gap-2">
              <span className="font-semibold">{count}</span>
              <span className="text-slate-300">
                {count === 1 ? 'item' : 'items'} selected
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Change Status */}
              <Select
                value={selectedStatus}
                onValueChange={(value) => {
                  setSelectedStatus(value as IntakeStatus);
                  setConfirmAction('status');
                }}
              >
                <SelectTrigger className="w-[160px] bg-white/10 border-white/20 text-white">
                  <UserCheck className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Change Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="ROUTING">Routing</SelectItem>
                  <SelectItem value="ASSIGNED">Assigned</SelectItem>
                  <SelectItem value="PROCESSING">Processing</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>

              {/* Assign to Pipeline */}
              {availablePipelines.length > 0 && (
                <Select
                  value={selectedPipeline}
                  onValueChange={(value) => {
                    setSelectedPipeline(value);
                    setConfirmAction('pipeline');
                  }}
                >
                  <SelectTrigger className="w-[160px] bg-white/10 border-white/20 text-white">
                    <Route className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Route to..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePipelines.map((pipeline) => (
                      <SelectItem key={pipeline.id} value={pipeline.id}>
                        {pipeline.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Change Priority */}
              <Select
                value={selectedPriority}
                onValueChange={(value) => {
                  setSelectedPriority(value);
                  setConfirmAction('priority');
                }}
              >
                <SelectTrigger className="w-[160px] bg-white/10 border-white/20 text-white">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Set Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Low (0-3)</SelectItem>
                  <SelectItem value="5">Medium (4-6)</SelectItem>
                  <SelectItem value="8">High (7-10)</SelectItem>
                </SelectContent>
              </Select>

              {/* Delete */}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setConfirmAction('delete')}
                disabled={isProcessing}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>

            {/* Clear Selection */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <AlertDialog open={confirmAction === 'status'} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the status of {count} request(s) to{' '}
              <strong>{selectedStatus}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStatusChange} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmAction === 'pipeline'} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Assign to Pipeline</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to assign {count} request(s) to the selected pipeline?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePipelineAssignment} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmAction === 'priority'} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Priority</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update the priority of {count} request(s)?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePriorityChange} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmAction === 'delete'} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Requests</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {count} request(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

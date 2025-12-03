'use client';

import React from 'react';
import { IntakeStatus } from '@prisma/client';
import { IntakeRequest } from './IntakeTable';
import { IntakeStatusBadge } from './IntakeStatusBadge';
import { PriorityIndicator, getPriorityLevel } from './PriorityIndicator';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  X,
  Calendar,
  User,
  Route,
  FileText,
  MessageSquare,
  CheckCircle2,
  XCircle,
  UserCheck,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

interface IntakeDetailDrawerProps {
  request: IntakeRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
  availablePipelines?: Array<{ id: string; name: string }>;
}

export function IntakeDetailDrawer({
  request,
  isOpen,
  onClose,
  onUpdate,
  availablePipelines = [],
}: IntakeDetailDrawerProps) {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<IntakeStatus | ''>('');
  const [selectedPipeline, setSelectedPipeline] = React.useState<string>('');

  React.useEffect(() => {
    if (request) {
      setSelectedStatus(request.status);
      setSelectedPipeline(request.pipeline?.id || '');
    }
  }, [request]);

  if (!isOpen || !request) {
    return null;
  }

  const createdDate = typeof request.createdAt === 'string'
    ? new Date(request.createdAt)
    : request.createdAt;

  const handleUpdateStatus = async (newStatus: IntakeStatus) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/intake/${request.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast({
        title: 'Status Updated',
        description: `Request status changed to ${newStatus}`,
      });

      onUpdate?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignPipeline = async (pipelineId: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/intake/${request.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedPipeline: pipelineId,
          status: 'ASSIGNED',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign pipeline');
      }

      toast({
        title: 'Pipeline Assigned',
        description: 'Request successfully assigned to pipeline',
      });

      onUpdate?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign pipeline',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReject = async () => {
    await handleUpdateStatus(IntakeStatus.REJECTED);
  };

  const handleComplete = async () => {
    await handleUpdateStatus(IntakeStatus.COMPLETED);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-astralis-navy">
              Request Details
            </h2>
            <p className="text-sm text-slate-600 font-mono mt-1">
              {request.id}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status & Priority */}
          <div className="flex items-center gap-4">
            <IntakeStatusBadge status={request.status} />
            <PriorityIndicator priority={request.priority} showLabel />
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Subject
            </label>
            <h3 className="text-lg font-semibold text-astralis-navy mt-1">
              {request.title}
            </h3>
          </div>

          {/* Description */}
          {request.description && (
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                Description
              </label>
              <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">
                {request.description}
              </p>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                Created
              </label>
              <p className="text-sm text-slate-700 mt-1">
                {format(createdDate, 'MMM d, yyyy h:mm a')}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" />
                Source
              </label>
              <p className="text-sm text-slate-700 mt-1 capitalize">
                {request.source.toLowerCase()}
              </p>
            </div>
          </div>

          {/* Action Section */}
          <div className="border-t border-slate-200 pt-6 space-y-4">
            <h4 className="text-sm font-semibold text-astralis-navy">
              Actions
            </h4>

            {/* Change Status */}
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">
                Change Status
              </label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => {
                  setSelectedStatus(value as IntakeStatus);
                  handleUpdateStatus(value as IntakeStatus);
                }}
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue />
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
            </div>

            {/* Assign to Pipeline */}
            {availablePipelines.length > 0 && (
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block flex items-center gap-2">
                  <Route className="w-3.5 h-3.5" />
                  Assign to Pipeline
                </label>
                <Select
                  value={selectedPipeline}
                  onValueChange={(value) => {
                    setSelectedPipeline(value);
                    handleAssignPipeline(value);
                  }}
                  disabled={isUpdating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pipeline..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePipelines.map((pipeline) => (
                      <SelectItem key={pipeline.id} value={pipeline.id}>
                        {pipeline.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleComplete}
                disabled={isUpdating || request.status === 'COMPLETED'}
                className="flex-1"
              >
                <CheckCircle2 className=" ui-icon w-5 h-5 mr-2" />
                Mark Complete
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReject}
                disabled={isUpdating || request.status === 'REJECTED'}
                className="flex-1"
              >
                <XCircle className=" ui-icon w-5 h-5 mr-2" />
                Reject
              </Button>
            </div>
          </div>

          {/* Request Data */}
          {request.requestData && (
            <div className="border-t border-slate-200 pt-6">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">
                Request Data
              </label>
              <pre className="bg-slate-50 rounded-md p-4 text-xs overflow-x-auto">
                {JSON.stringify(request.requestData, null, 2)}
              </pre>
            </div>
          )}

          {/* Activity Timeline Placeholder */}
          <div className="border-t border-slate-200 pt-6">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-4 block">
              Activity Timeline
            </label>
            <div className="text-sm text-slate-500 text-center py-8">
              Activity timeline coming soon
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

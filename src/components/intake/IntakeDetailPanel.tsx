'use client';

import { useState } from 'react';
import { X, FileText, Clock, Mail, MessageSquare, Inbox, Zap, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { IntakeRequest } from '@/types/pipelines';

interface Pipeline {
  id: string;
  name: string;
}

interface IntakeDetailPanelProps {
  intake: IntakeRequest;
  pipelines?: Pipeline[];
  onClose: () => void;
  onStatusChange?: (status: string) => Promise<void>;
  onPipelineAssign?: (pipelineId: string) => Promise<void>;
}

const statusColors: Record<string, string> = {
  NEW: 'bg-yellow-100 text-yellow-700',
  ROUTING: 'bg-blue-100 text-blue-700',
  ASSIGNED: 'bg-purple-100 text-purple-700',
  PROCESSING: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

const sourceIcons: Record<string, React.ReactNode> = {
  FORM: <Inbox className=" ui-icon w-5 h-5" />,
  EMAIL: <Mail className=" ui-icon w-5 h-5" />,
  CHAT: <MessageSquare className=" ui-icon w-5 h-5" />,
  API: <Zap className=" ui-icon w-5 h-5" />,
};

const priorityLabels: Record<number, { label: string; className: string }> = {
  0: { label: 'None', className: 'bg-slate-100 text-slate-600' },
  1: { label: 'Low', className: 'bg-blue-100 text-blue-700' },
  2: { label: 'Medium', className: 'bg-yellow-100 text-yellow-700' },
  3: { label: 'High', className: 'bg-orange-100 text-orange-700' },
  4: { label: 'Urgent', className: 'bg-red-100 text-red-700' },
};

export function IntakeDetailPanel({
  intake,
  pipelines = [],
  onClose,
  onStatusChange,
  onPipelineAssign,
}: IntakeDetailPanelProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (!onStatusChange) return;
    setIsUpdating(true);
    try {
      await onStatusChange(newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePipelineChange = async (pipelineId: string) => {
    if (!onPipelineAssign) return;
    setIsUpdating(true);
    try {
      await onPipelineAssign(pipelineId);
    } finally {
      setIsUpdating(false);
    }
  };

  const priority = priorityLabels[intake.priority] || priorityLabels[0];

  return (
    <div className="h-full flex flex-col bg-white shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
        <h3 className="font-semibold text-astralis-navy">Request Details</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className=" ui-icon w-5 h-5" />
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Title & Status */}
        <div>
          <div className="flex items-start gap-2 mb-2">
            <div className="flex-shrink-0 mt-1">
              {sourceIcons[intake.source]}
            </div>
            <h4 className="font-medium text-lg text-astralis-navy">
              {intake.title}
            </h4>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={statusColors[intake.status]}>
              {intake.status}
            </Badge>
            <Badge className={priority.className}>
              {priority.label} Priority
            </Badge>
            <Badge className="bg-slate-100 text-slate-600 border border-slate-300">
              {intake.source}
            </Badge>
          </div>
        </div>

        {/* Description */}
        {intake.description && (
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
              <FileText className=" ui-icon w-5 h-5" />
              Description
            </div>
            <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
              {intake.description}
            </p>
          </div>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-slate-500">Created</span>
            <p className="font-medium text-slate-700">
              {format(new Date(intake.createdAt), 'MMM d, yyyy h:mm a')}
            </p>
          </div>
          {intake.updatedAt && (
            <div>
              <span className="text-slate-500">Updated</span>
              <p className="font-medium text-slate-700">
                {format(new Date(intake.updatedAt), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          )}
        </div>

        {/* Pipeline Assignment */}
        {pipelines.length > 0 && (
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">
              Pipeline
            </label>
            <Select
              value={intake.assignedPipeline || intake.pipeline?.id || ''}
              onValueChange={handlePipelineChange}
              disabled={isUpdating}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select pipeline..." />
              </SelectTrigger>
              <SelectContent>
                {pipelines.map((pipeline) => (
                  <SelectItem key={pipeline.id} value={pipeline.id}>
                    {pipeline.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Status Change */}
        {onStatusChange && (
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">
              Status
            </label>
            <Select
              value={intake.status}
              onValueChange={handleStatusChange}
              disabled={isUpdating}
            >
              <SelectTrigger className="w-full">
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
        )}

        {/* AI Routing Info */}
        {intake.aiRoutingMeta && (
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-700 mb-1">
              <AlertTriangle className=" ui-icon w-5 h-5" />
              AI Routing
            </div>
            {intake.aiRoutingMeta.confidence !== undefined && (
              <p className="text-sm text-blue-600">
                Confidence: {Math.round(intake.aiRoutingMeta.confidence * 100)}%
              </p>
            )}
            {intake.aiRoutingMeta.reasoning && (
              <p className="text-sm text-blue-600 mt-1">
                {intake.aiRoutingMeta.reasoning}
              </p>
            )}
          </div>
        )}

        {/* Request Data */}
        {intake.requestData && Object.keys(intake.requestData).length > 0 && (
          <div>
            <div className="text-sm font-medium text-slate-700 mb-1">
              Request Data
            </div>
            <pre className="text-xs bg-slate-100 rounded-lg p-3 overflow-x-auto max-h-48">
              {JSON.stringify(intake.requestData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

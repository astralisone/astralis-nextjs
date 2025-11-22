'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface IntakeRequest {
  id: string;
  title: string;
  source: 'FORM' | 'EMAIL' | 'CHAT' | 'API';
  status: 'NEW' | 'ROUTING' | 'ASSIGNED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  priority: number;
  createdAt: string;
}

interface PipelineOption {
  id: string;
  name: string;
}

interface IntakeQueueTableProps {
  requests: IntakeRequest[];
  /** List of available pipelines for assignment */
  pipelines?: PipelineOption[];
  /** Callback when a pipeline is selected for assignment */
  onAssignToPipeline?: (intakeId: string, pipelineId: string) => void;
  /** ID of the intake currently being assigned */
  assigningIntakeId?: string | null;
}

const statusColors = {
  NEW: 'bg-blue-100 text-blue-700',
  ROUTING: 'bg-yellow-100 text-yellow-700',
  ASSIGNED: 'bg-purple-100 text-purple-700',
  PROCESSING: 'bg-orange-100 text-orange-700',
  COMPLETED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

const sourceColors = {
  FORM: 'bg-slate-100 text-slate-700',
  EMAIL: 'bg-blue-100 text-blue-700',
  CHAT: 'bg-purple-100 text-purple-700',
  API: 'bg-green-100 text-green-700',
};

export function IntakeQueueTable({
  requests,
  pipelines = [],
  onAssignToPipeline,
  assigningIntakeId,
}: IntakeQueueTableProps) {
  const showPipelineColumn = pipelines.length > 0 && onAssignToPipeline;

  const handlePipelineSelect = (intakeId: string, pipelineId: string) => {
    if (onAssignToPipeline) {
      onAssignToPipeline(intakeId, pipelineId);
    }
  };

  const canAssign = (status: IntakeRequest['status']) => {
    return status === 'NEW' || status === 'ROUTING';
  };

  return (
    <Card variant="default">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Created
              </th>
              {showPipelineColumn && (
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Assign to Pipeline
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {requests.map((request) => (
              <tr key={request.id} className="hover:bg-slate-50 cursor-pointer">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-astralis-navy">
                    {request.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={sourceColors[request.source]}>
                    {request.source}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={statusColors[request.status]}>
                    {request.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  P{request.priority}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {format(new Date(request.createdAt), 'MMM d, yyyy')}
                </td>
                {showPipelineColumn && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    {canAssign(request.status) ? (
                      <Select
                        onValueChange={(value) => handlePipelineSelect(request.id, value)}
                        disabled={assigningIntakeId === request.id}
                      >
                        <SelectTrigger className="h-8 w-[180px] text-xs">
                          {assigningIntakeId === request.id ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Assigning...</span>
                            </div>
                          ) : (
                            <SelectValue placeholder="Select pipeline..." />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          {pipelines.map((pipeline) => (
                            <SelectItem
                              key={pipeline.id}
                              value={pipeline.id}
                              className="text-xs"
                            >
                              {pipeline.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                )}
              </tr>
            ))}

            {requests.length === 0 && (
              <tr>
                <td colSpan={showPipelineColumn ? 6 : 5} className="px-6 py-12 text-center text-slate-500">
                  No intake requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

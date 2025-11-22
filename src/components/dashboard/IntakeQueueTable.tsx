'use client';

import { useState, useMemo } from 'react';
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
import { Loader2, ChevronUp, ChevronDown } from 'lucide-react';

interface IntakeRequest {
  id: string;
  title: string;
  source: 'FORM' | 'EMAIL' | 'CHAT' | 'API';
  status: 'NEW' | 'ROUTING' | 'ASSIGNED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  priority: number;
  createdAt: string;
}

type SortColumn = 'title' | 'source' | 'status' | 'priority' | 'createdAt';
type SortDirection = 'asc' | 'desc';

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
  const [sortColumn, setSortColumn] = useState<SortColumn>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const showPipelineColumn = pipelines.length > 0 && onAssignToPipeline;

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedRequests = useMemo(() => {
    return [...requests].sort((a, b) => {
      let comparison = 0;
      switch (sortColumn) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'source':
          comparison = a.source.localeCompare(b.source);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'priority':
          comparison = a.priority - b.priority;
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [requests, sortColumn, sortDirection]);

  const SortIndicator = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-3 h-3 inline-block ml-1" />
    ) : (
      <ChevronDown className="w-3 h-3 inline-block ml-1" />
    );
  };

  const handlePipelineSelect = (intakeId: string, pipelineId: string) => {
    if (onAssignToPipeline) {
      onAssignToPipeline(intakeId, pipelineId);
    }
  };

  const canAssign = (status: IntakeRequest['status']) => {
    return status === 'NEW' || status === 'ROUTING';
  };

  const headerClasses = "px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors duration-150 select-none";

  return (
    <Card variant="default">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className={headerClasses} onClick={() => handleSort('title')}>
                Title
                <SortIndicator column="title" />
              </th>
              <th className={headerClasses} onClick={() => handleSort('source')}>
                Source
                <SortIndicator column="source" />
              </th>
              <th className={headerClasses} onClick={() => handleSort('status')}>
                Status
                <SortIndicator column="status" />
              </th>
              <th className={headerClasses} onClick={() => handleSort('priority')}>
                Priority
                <SortIndicator column="priority" />
              </th>
              <th className={headerClasses} onClick={() => handleSort('createdAt')}>
                Created
                <SortIndicator column="createdAt" />
              </th>
              {showPipelineColumn && (
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Assign to Pipeline
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sortedRequests.map((request, index) => (
              <tr key={request.id} className={`hover:bg-slate-100 cursor-pointer transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
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
                        <SelectTrigger className="h-9 w-[200px] text-sm">
                          {assigningIntakeId === request.id ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
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
                              className="text-sm"
                            >
                              {pipeline.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </td>
                )}
              </tr>
            ))}

            {sortedRequests.length === 0 && (
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

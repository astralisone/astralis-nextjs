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
import { Loader2, ChevronUp, ChevronDown, Trash2, Inbox, Mail, MessageSquare, Zap } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
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

interface IntakeRequest {
  id: string;
  title: string;
  source: 'FORM' | 'EMAIL' | 'CHAT' | 'API';
  status: 'NEW' | 'ROUTING' | 'ASSIGNED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  priority: number;
  createdAt: string;
  assignedPipeline?: string | null;
  pipeline?: {
    id: string;
    name: string;
  } | null;
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
  /** Callback when deleting a single intake request */
  onDeleteSingle?: (intakeId: string) => Promise<void>;
  /** Callback when deleting multiple intake requests */
  onDeleteBulk?: (intakeIds: string[]) => Promise<void>;
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

const sourceIcons: Record<string, { icon: React.ComponentType<{ className?: string }>; className: string }> = {
  FORM: { icon: Inbox, className: 'text-purple-600' },
  EMAIL: { icon: Mail, className: 'text-blue-600' },
  CHAT: { icon: MessageSquare, className: 'text-green-600' },
  API: { icon: Zap, className: 'text-orange-600' },
};

export function IntakeQueueTable({
  requests,
  pipelines = [],
  onAssignToPipeline,
  assigningIntakeId,
  onDeleteSingle,
  onDeleteBulk,
}: IntakeQueueTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteMode, setDeleteMode] = useState<'single' | 'bulk'>('single');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showPipelineColumn = pipelines.length > 0 && onAssignToPipeline;

  const getSourceIcon = (source: string) => {
    const config = sourceIcons[source];
    if (!config) return null;
    const IconComponent = config.icon;
    return <IconComponent className={`w-4 h-4 flex-shrink-0 ${config.className}`} />;
  };

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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(sortedRequests.map(r => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDeleteClick = (id: string) => {
    setPendingDeleteId(id);
    setDeleteMode('single');
    setShowDeleteDialog(true);
  };

  const handleBulkDeleteClick = () => {
    setDeleteMode('bulk');
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteMode === 'single' && pendingDeleteId && onDeleteSingle) {
        await onDeleteSingle(pendingDeleteId);
      } else if (deleteMode === 'bulk' && onDeleteBulk) {
        await onDeleteBulk(Array.from(selectedIds));
        setSelectedIds(new Set());
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setPendingDeleteId(null);
    }
  };

  const isAllSelected = sortedRequests.length > 0 && selectedIds.size === sortedRequests.length;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < sortedRequests.length;

  const headerClasses = "px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors duration-150 select-none";

  return (
    <>
      {selectedIds.size > 0 && (
        <div className="mb-4 p-3 bg-slate-100 rounded-lg flex items-center justify-between">
          <span className="text-sm text-slate-600">
            {selectedIds.size} item{selectedIds.size > 1 ? 's' : ''} selected
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDeleteClick}
            disabled={!onDeleteBulk}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Selected
          </Button>
        </div>
      )}

      <Card variant="default">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <Checkbox
                    checked={isAllSelected}
                    data-state={isIndeterminate ? 'indeterminate' : isAllSelected ? 'checked' : 'unchecked'}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </th>
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
                  Pipeline
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sortedRequests.map((request, index) => (
              <tr key={request.id} className={`hover:bg-slate-100 cursor-pointer transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                <td className="px-4 py-4">
                  <Checkbox
                    checked={selectedIds.has(request.id)}
                    onCheckedChange={(checked) => handleSelectOne(request.id, !!checked)}
                    aria-label={`Select ${request.title}`}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getSourceIcon(request.source)}
                    <span className="text-sm font-medium text-astralis-navy">
                      {request.title}
                    </span>
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
                    <Select
                      value={request.assignedPipeline || request.pipeline?.id || ''}
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
                  </td>
                )}
                <td className="px-4 py-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(request.id);
                    }}
                    className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                    disabled={!onDeleteSingle}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}

            {sortedRequests.length === 0 && (
              <tr>
                <td colSpan={showPipelineColumn ? 8 : 7} className="px-6 py-12 text-center text-slate-500">
                  No intake requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>

    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {deleteMode === 'single' ? 'Delete Intake Request' : `Delete ${selectedIds.size} Intake Request${selectedIds.size > 1 ? 's' : ''}`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the intake request{deleteMode === 'bulk' && selectedIds.size > 1 ? 's' : ''} and all related data from the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

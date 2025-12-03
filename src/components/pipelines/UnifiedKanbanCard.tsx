'use client';

import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { GripVertical, Calendar, AlertCircle, User, Clock, X, Check, Loader2, Inbox, Mail, MessageSquare, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { PipelineItem, PipelinePriority, PipelineItemStatus } from '@/types/pipelines';
import { formatDistanceToNow, isPast, parseISO } from 'date-fns';

// Unified interface that handles both PipelineItem and simpler item formats
export interface UnifiedCardItem {
  id: string;
  title: string;
  description?: string | null;
  priority: number | PipelinePriority;
  tags?: string[];
  stageId?: string;
  // Rich PipelineItem fields (optional)
  status?: PipelineItemStatus;
  progress?: number;
  dueDate?: string | null;
  assignedTo?: {
    id?: string;
    name: string;
    email?: string;
    avatar?: string | null;
  } | null;
  assignedToId?: string | null;
  // Timestamp fields (optional)
  createdAt?: string;
  updatedAt?: string;
  data?: Record<string, unknown>;
  source?: 'FORM' | 'EMAIL' | 'CHAT' | 'API' | string;
}

interface UnifiedKanbanCardProps {
  item: UnifiedCardItem | PipelineItem;
  isDragging?: boolean;
  onClick?: () => void;
  // Control drag handle vs full-card dragging
  fullCardDrag?: boolean;
  // Pipeline context for API calls
  pipelineId?: string;
  // Callback when item status changes (for parent to refetch data)
  onStatusChange?: (itemId: string, newStatus: PipelineItemStatus) => void;
  // Team members for assignee dropdown
  teamMembers?: Array<{ id: string; name: string; email?: string; avatar?: string | null }>;
  // Callback when assignee changes
  onAssigneeChange?: (itemId: string, assigneeId: string | null) => void;
}

const priorityConfig: Record<number, {
  label: string;
  className: string;
}> = {
  [PipelinePriority.NONE]: {
    label: 'None',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  },
  [PipelinePriority.LOW]: {
    label: 'Low',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  [PipelinePriority.MEDIUM]: {
    label: 'Medium',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  },
  [PipelinePriority.HIGH]: {
    label: 'High',
    className: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  [PipelinePriority.URGENT]: {
    label: 'Urgent',
    className: 'bg-red-50 text-red-700 border-red-200',
  },
};

const sourceIcons: Record<string, { icon: React.ComponentType<{ className?: string }>; className: string }> = {
  FORM: { icon: Inbox, className: 'text-purple-600' },
  EMAIL: { icon: Mail, className: 'text-blue-600' },
  CHAT: { icon: MessageSquare, className: 'text-green-600' },
  API: { icon: Zap, className: 'text-orange-600' },
};

// Helper function to extract source from item
const getItemSource = (item: UnifiedCardItem | PipelineItem): string | null => {
  // Check if item has source directly
  if ('source' in item && item.source) return item.source as string;
  // Check if source is in data field
  if (item.data && typeof item.data === 'object' && 'source' in item.data) {
    return (item.data as Record<string, unknown>).source as string;
  }
  return null;
};

export function UnifiedKanbanCard({
  item,
  isDragging = false,
  onClick,
  fullCardDrag = false,
  pipelineId,
  onStatusChange,
  teamMembers,
  onAssigneeChange,
}: UnifiedKanbanCardProps) {
  const [isUpdating, setIsUpdating] = useState<'close' | 'complete' | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  // Compute derived values
  const isOverdue = item.dueDate ? isPast(parseISO(item.dueDate)) : false;
  const priority = priorityConfig[item.priority] || priorityConfig[PipelinePriority.NONE];
  const progress = (item as PipelineItem).progress || 0;
  const tags = item.tags || [];

  // Drag props - either on the handle or the full card
  const dragProps = fullCardDrag
    ? { ...listeners, ...attributes }
    : {};

  const handleDragProps = !fullCardDrag
    ? { ...listeners, ...attributes }
    : {};

  // Handler for Close action - sets status to CLOSED
  const handleClose = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!pipelineId || isUpdating) return;

    setIsUpdating('close');
    try {
      const response = await fetch(`/api/pipelines/${pipelineId}/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: PipelineItemStatus.CLOSED }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to close item');
      }

      onStatusChange?.(item.id, PipelineItemStatus.CLOSED);
    } catch (error) {
      console.error('Error closing item:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  // Handler for Complete action - sets status to COMPLETED
  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!pipelineId || isUpdating) return;

    setIsUpdating('complete');
    try {
      const response = await fetch(`/api/pipelines/${pipelineId}/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: PipelineItemStatus.COMPLETED }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to complete item');
      }

      onStatusChange?.(item.id, PipelineItemStatus.COMPLETED);
    } catch (error) {
      console.error('Error completing item:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  // Handler for Assignee change
  const handleAssigneeChange = async (value: string) => {
    if (!onAssigneeChange) return;
    setIsAssigning(true);
    try {
      const assigneeId = value === 'unassigned' ? null : value;
      await onAssigneeChange(item.id, assigneeId);
    } finally {
      setIsAssigning(false);
    }
  };

  // Only show action buttons if we have pipelineId and item is not already closed/completed
  const showActions = pipelineId &&
    item.status !== PipelineItemStatus.CLOSED &&
    item.status !== PipelineItemStatus.COMPLETED;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...dragProps}
      className={cn(
        'UnifiedKanbanCard transition-all duration-200',
        fullCardDrag && 'cursor-grab active:cursor-grabbing touch-none',
        isDragging && 'opacity-50 scale-95'
      )}
    >
      <Card
        variant="default"
        hover
        className={cn(
          'cursor-pointer border-2 transition-colors',
          isOverdue && 'border-red-300 bg-red-50/30',
          isDragging && 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-200'
        )}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            {/* Drag Handle (only shown when not fullCardDrag) */}
            {!fullCardDrag && (
              <button
                {...handleDragProps}
                className="mt-1 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing touch-none"
                aria-label="Drag to move"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="w-5 h-5" />
              </button>
            )}

            {/* Drag indicator for fullCardDrag mode */}
            {fullCardDrag && (
              <div className="mt-1 text-slate-400">
                <GripVertical className="w-5 h-5" />
              </div>
            )}

            <div className="flex-1 min-w-0 space-y-3">
              {/* Title Row with Source Icon and Actions */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  {(() => {
                    const source = getItemSource(item);
                    if (source && sourceIcons[source]) {
                      const IconComponent = sourceIcons[source].icon;
                      return (
                        <div className="flex-shrink-0 mt-0.5">
                          <IconComponent className={`w-4 h-4 ${sourceIcons[source].className}`} />
                        </div>
                      );
                    }
                    return null;
                  })()}
                  <h4 className="font-medium text-sm text-astralis-navy line-clamp-2">
                    {item.title}
                  </h4>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Action Buttons */}
                  {showActions && (
                    <>
                      {/* Complete Button */}
                      <button
                        onClick={handleComplete}
                        disabled={isUpdating !== null}
                        className={cn(
                          'p-1 rounded transition-colors',
                          'hover:bg-green-100 text-slate-400 hover:text-green-600',
                          isUpdating === 'complete' && 'bg-green-100 text-green-600'
                        )}
                        aria-label="Mark as completed"
                        title="Mark as completed"
                      >
                        {isUpdating === 'complete' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                      {/* Close Button */}
                      <button
                        onClick={handleClose}
                        disabled={isUpdating !== null}
                        className={cn(
                          'p-1 rounded transition-colors',
                          'hover:bg-red-100 text-slate-400 hover:text-red-600',
                          isUpdating === 'close' && 'bg-red-100 text-red-600'
                        )}
                        aria-label="Close item"
                        title="Close item (hide from board)"
                      >
                        {isUpdating === 'close' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </button>
                    </>
                  )}
                  {/* Priority Badge */}
                  {item.priority > PipelinePriority.NONE && (
                    <Badge
                      variant="default"
                      className={cn('text-xs font-medium', priority.className)}
                    >
                      {priority.label}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Description */}
              {item.description && (
                <p className="text-xs text-slate-500 line-clamp-2">
                  {item.description}
                </p>
              )}

              {/* Progress Bar (only for PipelineItem with progress) */}
              {progress > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Progress</span>
                    <span className="text-slate-900 font-medium">{progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-astralis-blue rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Metadata Row */}
              <div className="flex items-center gap-3 text-xs text-slate-500">
                {/* Assignee Dropdown */}
                {teamMembers && teamMembers.length > 0 && onAssigneeChange ? (
                  <div onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={item.assignedToId || 'unassigned'}
                      onValueChange={handleAssigneeChange}
                      disabled={isAssigning}
                    >
                      <SelectTrigger className="h-7 w-[140px] text-xs bg-white border-slate-200">
                        <SelectValue>
                          {isAssigning ? (
                            <div className="flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Assigning...</span>
                            </div>
                          ) : item.assignedTo ? (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span className="truncate">{item.assignedTo.name}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-slate-400">
                              <User className="w-3 h-3" />
                              <span>Unassigned</span>
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">
                          <span className="text-slate-400">Unassigned</span>
                        </SelectItem>
                        {teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name || member.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  // Fallback: Read-only display when no teamMembers or callback
                  item.assignedTo ? (
                    <div className="flex items-center gap-1.5">
                      {item.assignedTo.avatar ? (
                        <img
                          src={item.assignedTo.avatar}
                          alt={item.assignedTo.name}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-astralis-blue/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-astralis-blue" />
                        </div>
                      )}
                      <span className="truncate max-w-[100px]">
                        {item.assignedTo.name}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <User className="w-4 h-4" />
                      <span>Unassigned</span>
                    </div>
                  )
                )}

                {/* Due Date */}
                {item.dueDate && (
                  <div
                    className={cn(
                      'flex items-center gap-1.5',
                      isOverdue && 'text-red-600 font-medium'
                    )}
                  >
                    {isOverdue && <AlertCircle className="w-4 h-4" />}
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDistanceToNow(parseISO(item.dueDate), { addSuffix: true })}
                    </span>
                  </div>
                )}

                {/* Created timestamp (if no due date but has createdAt) */}
                {!item.dueDate && item.createdAt && (
                  <div className="flex items-center gap-1.5 text-slate-400 ml-auto">
                    <Clock className="w-4 h-4" />
                    <span>
                      {formatDistanceToNow(parseISO(item.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {tags.length > 3 && (
                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded">
                      +{tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

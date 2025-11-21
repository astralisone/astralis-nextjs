'use client';

import { useDraggable } from '@dnd-kit/core';
import { GripVertical, Calendar, AlertCircle, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PipelineItem, PipelinePriority, PipelineItemStatus } from '@/types/pipelines';
import { formatDistanceToNow, isPast, parseISO } from 'date-fns';

interface PipelineCardProps {
  item: PipelineItem;
  isDragging?: boolean;
  onClick?: () => void;
}

const priorityConfig = {
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

const statusConfig = {
  [PipelineItemStatus.NOT_STARTED]: {
    label: 'Not Started',
    className: 'bg-slate-100 text-slate-600',
  },
  [PipelineItemStatus.IN_PROGRESS]: {
    label: 'In Progress',
    className: 'bg-blue-100 text-blue-700',
  },
  [PipelineItemStatus.BLOCKED]: {
    label: 'Blocked',
    className: 'bg-red-100 text-red-700',
  },
  [PipelineItemStatus.COMPLETED]: {
    label: 'Completed',
    className: 'bg-green-100 text-green-700',
  },
};

export function PipelineCard({ item, isDragging = false, onClick }: PipelineCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const isOverdue = item.dueDate ? isPast(parseISO(item.dueDate)) : false;
  const priority = priorityConfig[item.priority] || priorityConfig[PipelinePriority.NONE];
  const status = statusConfig[item.status];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'transition-all duration-200',
        isDragging && 'opacity-50 scale-95'
      )}
    >
      <Card
        variant="default"
        hover
        className={cn(
          'cursor-pointer',
          isOverdue && 'border-red-300 bg-red-50/30'
        )}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <button
              {...listeners}
              {...attributes}
              className="mt-1 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing touch-none"
              aria-label="Drag to move"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-4 h-4" />
            </button>

            <div className="flex-1 min-w-0 space-y-3">
              {/* Title and Priority */}
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium text-sm text-astralis-navy line-clamp-2 flex-1">
                  {item.title}
                </h4>
                {item.priority > PipelinePriority.NONE && (
                  <Badge
                    variant="default"
                    className={cn('text-xs font-medium flex-shrink-0', priority.className)}
                  >
                    {priority.label}
                  </Badge>
                )}
              </div>

              {/* Description */}
              {item.description && (
                <p className="text-xs text-slate-500 line-clamp-2">
                  {item.description}
                </p>
              )}

              {/* Progress Bar */}
              {item.progress > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Progress</span>
                    <span className="text-slate-900 font-medium">{item.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-astralis-blue rounded-full transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Status Badge */}
              {status && (
                <Badge className={cn('text-xs', status.className)}>
                  {status.label}
                </Badge>
              )}

              {/* Metadata Row */}
              <div className="flex items-center gap-3 text-xs text-slate-500">
                {/* Assignee */}
                {item.assignedTo ? (
                  <div className="flex items-center gap-1.5">
                    {item.assignedTo.avatar ? (
                      <img
                        src={item.assignedTo.avatar}
                        alt={item.assignedTo.name}
                        className="w-5 h-5 rounded-full"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-astralis-blue/10 flex items-center justify-center">
                        <User className="w-3 h-3 text-astralis-blue" />
                      </div>
                    )}
                    <span className="truncate max-w-[100px]">
                      {item.assignedTo.name}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <User className="w-3 h-3" />
                    <span>Unassigned</span>
                  </div>
                )}

                {/* Due Date */}
                {item.dueDate && (
                  <div
                    className={cn(
                      'flex items-center gap-1.5',
                      isOverdue && 'text-red-600 font-medium'
                    )}
                  >
                    {isOverdue && <AlertCircle className="w-3 h-3" />}
                    <Calendar className="w-3 h-3" />
                    <span>
                      {formatDistanceToNow(parseISO(item.dueDate), { addSuffix: true })}
                    </span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 3 && (
                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded">
                      +{item.tags.length - 3}
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

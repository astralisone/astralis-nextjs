'use client';

import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { GripVertical, Mail, MessageSquare, Zap, Inbox, Clock, AlertTriangle, GitBranch, Loader2, RefreshCw } from 'lucide-react';
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
import { IntakeRequest, IntakeSource, IntakeStatus, PipelinePriority } from '@/types/pipelines';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface Pipeline {
  id: string;
  name: string;
}

interface IntakeCardProps {
  intake: IntakeRequest;
  isDragging?: boolean;
  onClick?: () => void;
  fullCardDrag?: boolean;
  /** Available pipelines for assignment dropdown */
  availablePipelines?: Pipeline[];
  /** Callback when pipeline is assigned */
  onPipelineAssign?: (intakeId: string, pipelineId: string) => void;
  /** Callback to trigger AI reclassification */
  onReclassify?: (intakeId: string) => void;
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

const statusConfig: Record<string, {
  label: string;
  className: string;
  icon: React.ReactNode;
}> = {
  [IntakeStatus.NEW]: {
    label: 'New',
    className: 'bg-yellow-100 text-yellow-700',
    icon: <AlertTriangle className="w-5 h-5" />,
  },
  [IntakeStatus.ROUTING]: {
    label: 'Routing',
    className: 'bg-blue-100 text-blue-700',
    icon: <Inbox className="w-5 h-5" />,
  },
  [IntakeStatus.ASSIGNED]: {
    label: 'Assigned',
    className: 'bg-green-100 text-green-700',
    icon: null,
  },
  [IntakeStatus.PROCESSING]: {
    label: 'Processing',
    className: 'bg-purple-100 text-purple-700',
    icon: null,
  },
  [IntakeStatus.COMPLETED]: {
    label: 'Completed',
    className: 'bg-emerald-100 text-emerald-700',
    icon: null,
  },
  [IntakeStatus.REJECTED]: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-700',
    icon: null,
  },
};

const sourceConfig: Record<string, {
  label: string;
  icon: React.ReactNode;
  className: string;
}> = {
  [IntakeSource.FORM]: {
    label: 'Form',
    icon: <Inbox className="w-5 h-5" />,
    className: 'text-purple-600',
  },
  [IntakeSource.EMAIL]: {
    label: 'Email',
    icon: <Mail className="w-5 h-5" />,
    className: 'text-blue-600',
  },
  [IntakeSource.CHAT]: {
    label: 'Chat',
    icon: <MessageSquare className="w-5 h-5" />,
    className: 'text-green-600',
  },
  [IntakeSource.API]: {
    label: 'API',
    icon: <Zap className="w-5 h-5" />,
    className: 'text-orange-600',
  },
};

export function IntakeCard({
  intake,
  isDragging = false,
  onClick,
  fullCardDrag = false,
  availablePipelines = [],
  onPipelineAssign,
  onReclassify,
}: IntakeCardProps) {
  const [isAssigning, setIsAssigning] = useState(false);
  const [isReclassifying, setIsReclassifying] = useState(false);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `intake-${intake.id}`,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const priority = priorityConfig[intake.priority] || priorityConfig[PipelinePriority.NONE];
  const status = statusConfig[intake.status] || statusConfig[IntakeStatus.NEW];
  const source = sourceConfig[intake.source] || sourceConfig[IntakeSource.FORM];

  const dragProps = fullCardDrag
    ? { ...listeners, ...attributes }
    : {};

  const handleDragProps = !fullCardDrag
    ? { ...listeners, ...attributes }
    : {};

  // Handle pipeline assignment
  const handlePipelineSelect = async (pipelineId: string) => {
    if (onPipelineAssign) {
      setIsAssigning(true);
      try {
        await onPipelineAssign(intake.id, pipelineId);
      } finally {
        setIsAssigning(false);
      }
    }
  };

  // Handle reclassification request
  const handleReclassify = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReclassify) {
      setIsReclassifying(true);
      try {
        await onReclassify(intake.id);
      } finally {
        setIsReclassifying(false);
      }
    }
  };

  // Check if already assigned to a pipeline
  const isAssigned = intake.pipeline || intake.assignedPipeline;
  const pipelineName = intake.pipeline?.name;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...dragProps}
      className={cn(
        'IntakeCard transition-all duration-200',
        fullCardDrag && 'cursor-grab active:cursor-grabbing touch-none',
        isDragging && 'opacity-50 scale-95'
      )}
    >
      <Card
        variant="default"
        hover
        className={cn(
          'cursor-pointer border-2 border-amber-200 bg-amber-50/30 transition-colors',
          isDragging && 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-200'
        )}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            {/* Drag Handle */}
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

            {fullCardDrag && (
              <div className="mt-1 text-slate-400">
                <GripVertical className="w-5 h-5" />
              </div>
            )}

            <div className="flex-1 min-w-0 space-y-2">
              {/* Title Row with Status Badge */}
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium text-sm text-astralis-navy line-clamp-2 flex-1">
                  {intake.title}
                </h4>
                <Badge
                  variant="default"
                  className={cn('text-xs font-medium flex items-center gap-1', status.className)}
                >
                  {status.icon}
                  {status.label}
                </Badge>
              </div>

              {/* Description */}
              {intake.description && (
                <p className="text-xs text-slate-500 line-clamp-2">
                  {intake.description}
                </p>
              )}

              {/* Pipeline Assignment Section - Always show dropdown for reassignment */}
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {availablePipelines.length > 0 && onPipelineAssign ? (
                  <Select
                    value={intake.assignedPipeline || intake.pipeline?.id || ''}
                    onValueChange={handlePipelineSelect}
                    disabled={isAssigning}
                  >
                    <SelectTrigger className="h-8 text-sm bg-white flex-1">
                      <div className="flex items-center gap-1.5">
                        {isAssigning ? (
                          <Loader2 className=" ui-icon w-5 h-5 animate-spin" />
                        ) : (
                          <GitBranch className=" ui-icon w-5 h-5 text-astralis-blue" />
                        )}
                        <SelectValue placeholder="Assign to pipeline..." />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {availablePipelines.map((pipeline) => (
                        <SelectItem key={pipeline.id} value={pipeline.id}>
                          {pipeline.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-1.5 text-slate-400 flex-1">
                    <GitBranch className=" ui-icon w-5 h-5" />
                    <span className="text-sm">{pipelineName || 'Unassigned'}</span>
                  </div>
                )}
                {onReclassify && (
                  <button
                    onClick={handleReclassify}
                    disabled={isReclassifying}
                    className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    title="Reclassify with AI"
                    aria-label="Reclassify with AI"
                  >
                    {isReclassifying ? (
                      <Loader2 className=" ui-icon w-5 h-5 animate-spin" />
                    ) : (
                      <RefreshCw className=" ui-icon w-5 h-5" />
                    )}
                  </button>
                )}
              </div>

              {/* Source and Priority Row */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Source Badge */}
                <div className={cn('flex items-center gap-1 text-xs', source.className)}>
                  {source.icon}
                  <span>{source.label}</span>
                </div>

                {/* Priority Badge */}
                {intake.priority > PipelinePriority.NONE && (
                  <Badge
                    variant="default"
                    className={cn('text-xs font-medium', priority.className)}
                  >
                    {priority.label}
                  </Badge>
                )}
              </div>

              {/* Timestamp */}
              {intake.createdAt && (
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Clock className="w-5 h-5" />
                  <span>
                    {formatDistanceToNow(parseISO(intake.createdAt), { addSuffix: true })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

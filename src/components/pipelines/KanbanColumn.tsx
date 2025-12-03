'use client';

import { useDroppable } from '@dnd-kit/core';
import { UnifiedKanbanCard } from './UnifiedKanbanCard';
import { cn } from '@/lib/utils';
import { PipelineStage, PipelineItem, PipelineItemStatus } from '@/types/pipelines';

interface KanbanColumnProps {
  stage: PipelineStage;
  items: PipelineItem[];
  pipelineId: string;
  onItemClick?: (item: PipelineItem) => void;
  onStatusChange?: (itemId: string, newStatus: PipelineItemStatus) => void;
  teamMembers?: Array<{ id: string; name: string; email?: string; avatar?: string | null }>;
  onAssigneeChange?: (itemId: string, assigneeId: string | null) => void;
}

export function KanbanColumn({
  stage,
  items,
  pipelineId,
  onItemClick,
  onStatusChange,
  teamMembers,
  onAssigneeChange,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  // Filter out CLOSED and COMPLETED items from display
  const visibleItems = items.filter(
    (item) => item.status !== PipelineItemStatus.CLOSED && item.status !== PipelineItemStatus.COMPLETED
  );

  return (
    <div className="flex-shrink-0 w-80 flex flex-col" style={{ maxHeight: 'calc(100vh - 280px)' }}>
      <div className="bg-slate-50 rounded-lg border border-slate-200 flex flex-col h-full overflow-hidden">
        {/* Stage Header - Fixed */}
        <div className="px-4 py-3 border-b border-slate-200 bg-white rounded-t-lg flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {stage.color && (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: stage.color }}
                />
              )}
              <h3 className="font-semibold text-sm text-astralis-navy">
                {stage.name}
              </h3>
            </div>
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded font-medium">
              {visibleItems.length}
            </span>
          </div>
          {stage.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              {stage.description}
            </p>
          )}
        </div>

        {/* Drop Zone - Scrollable */}
        <div
          ref={setNodeRef}
          className={cn(
            'p-4 space-y-3 min-h-[120px] flex-1 overflow-y-auto transition-colors duration-200',
            isOver && 'bg-astralis-blue/5 ring-2 ring-astralis-blue/20 ring-inset'
          )}
        >
          {visibleItems.map((item) => (
            <UnifiedKanbanCard
              key={item.id}
              item={item}
              pipelineId={pipelineId}
              onClick={() => onItemClick?.(item)}
              onStatusChange={onStatusChange}
              teamMembers={teamMembers}
              onAssigneeChange={onAssigneeChange}
            />
          ))}

          {visibleItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                <svg
                  className="w-8 h-8 text-slate-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium">No items</p>
              <p className="text-xs mt-1">Drag items here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

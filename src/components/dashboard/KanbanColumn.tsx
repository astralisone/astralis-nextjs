'use client';

import { useDroppable } from '@dnd-kit/core';
import { UnifiedKanbanCard } from '@/components/pipelines/UnifiedKanbanCard';
import { CreateItemModal } from '@/components/pipelines/CreateItemModal';
import { cn } from '@/lib/utils';
import { PipelineItemStatus } from '@/types/pipelines';

interface Stage {
  id: string;
  name: string;
  order: number;
  color?: string | null;
}

interface PipelineItem {
  id: string;
  title: string;
  description?: string | null;
  priority: number;
  tags: string[];
  stageId: string;
  status?: PipelineItemStatus;
}

interface KanbanColumnProps {
  stage: Stage;
  items: PipelineItem[];
  pipelineId: string;
  onItemCreated?: () => void;
  onStatusChange?: (itemId: string, newStatus: PipelineItemStatus) => void;
}

export function KanbanColumn({
  stage,
  items,
  pipelineId,
  onItemCreated,
  onStatusChange,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  // Filter out CLOSED and COMPLETED items from display
  const visibleItems = items.filter(
    (item) => item.status !== PipelineItemStatus.CLOSED && item.status !== PipelineItemStatus.COMPLETED
  );

  return (
    <div className="flex-shrink-0 w-80 h-full flex flex-col">
      <div className="bg-slate-100 rounded-lg p-4 flex flex-col h-full">
        {/* Column Header - Fixed */}
        <div className="flex items-center justify-center gap-3 mb-4 py-2 px-3 -mx-4 -mt-4 rounded-t-lg bg-slate-200/70 flex-shrink-0">
          <div className="flex items-center gap-2">
            {stage.color && (
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: stage.color }}
              />
            )}
            <h3 className="font-semibold text-sm text-astralis-navy">{stage.name}</h3>
          </div>
          <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded font-medium">
            {visibleItems.length}
          </span>
        </div>

        {/* Scrollable Content Area */}
        <div
          ref={setNodeRef}
          className={cn(
            'space-y-3 flex-1 overflow-y-auto min-h-[200px] transition-colors',
            isOver && 'bg-astralis-blue/10 rounded-lg p-2'
          )}
        >
          {/* Pipeline items using UnifiedKanbanCard */}
          {visibleItems.map((item) => (
            <UnifiedKanbanCard
              key={item.id}
              item={item}
              pipelineId={pipelineId}
              onStatusChange={onStatusChange}
              fullCardDrag
            />
          ))}

          {visibleItems.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">
              Drop items here
            </div>
          )}
        </div>

        {/* Add Item Button - Fixed at bottom */}
        <div className="mt-3 flex-shrink-0">
          <CreateItemModal
            pipelineId={pipelineId}
            stageId={stage.id}
            stageName={stage.name}
            onItemCreated={onItemCreated}
          />
        </div>
      </div>
    </div>
  );
}

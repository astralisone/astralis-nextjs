'use client';

import { useDroppable } from '@dnd-kit/core';
import { KanbanCard } from './KanbanCard';
import { CreateItemModal } from '@/components/pipelines/CreateItemModal';
import { cn } from '@/lib/utils';

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
}

interface KanbanColumnProps {
  stage: Stage;
  items: PipelineItem[];
  pipelineId: string;
  onItemCreated?: () => void;
}

export function KanbanColumn({ stage, items, pipelineId, onItemCreated }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  return (
    <div className="flex-shrink-0 w-80">
      <div className="bg-slate-100 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {stage.color && (
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: stage.color }}
              />
            )}
            <h3 className="font-semibold text-astralis-navy">{stage.name}</h3>
          </div>
          <span className="text-sm text-slate-500 bg-white px-2 py-1 rounded">
            {items.length}
          </span>
        </div>

        <div
          ref={setNodeRef}
          className={cn(
            'space-y-3 min-h-[200px] transition-colors',
            isOver && 'bg-astralis-blue/10 rounded-lg p-2'
          )}
        >
          {items.map((item) => (
            <KanbanCard key={item.id} item={item} />
          ))}

          {items.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">
              Drop items here
            </div>
          )}
        </div>

        {/* Add Item Button */}
        <div className="mt-3">
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

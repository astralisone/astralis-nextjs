'use client';

import { useDroppable } from '@dnd-kit/core';
import { PipelineCard } from './PipelineCard';
import { cn } from '@/lib/utils';
import { PipelineStage, PipelineItem } from '@/types/pipelines';

interface KanbanColumnProps {
  stage: PipelineStage;
  items: PipelineItem[];
  onItemClick?: (item: PipelineItem) => void;
}

export function KanbanColumn({ stage, items, onItemClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  return (
    <div className="flex-shrink-0 w-80">
      <div className="bg-slate-50 rounded-lg border border-slate-200">
        {/* Stage Header */}
        <div className="px-4 py-3 border-b border-slate-200 bg-white rounded-t-lg">
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
              {items.length}
            </span>
          </div>
          {stage.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              {stage.description}
            </p>
          )}
        </div>

        {/* Drop Zone */}
        <div
          ref={setNodeRef}
          className={cn(
            'p-4 space-y-3 min-h-[400px] transition-colors duration-200',
            isOver && 'bg-astralis-blue/5 ring-2 ring-astralis-blue/20 ring-inset'
          )}
        >
          {items.map((item) => (
            <PipelineCard
              key={item.id}
              item={item}
              onClick={() => onItemClick?.(item)}
            />
          ))}

          {items.length === 0 && (
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

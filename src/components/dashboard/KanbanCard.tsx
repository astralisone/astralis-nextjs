'use client';

/**
 * KanbanCard - Simple pipeline item card for dashboard Kanban board.
 * Used for regular pipeline items. For intake items, use IntakeCard.
 */

import { useDraggable } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PipelineItem {
  id: string;
  title: string;
  description?: string | null;
  priority: number;
  tags: string[];
}

interface KanbanCardProps {
  item: PipelineItem;
  isDragging?: boolean;
}

const priorityColors = {
  0: 'bg-slate-100 text-slate-600',
  1: 'bg-blue-100 text-blue-600',
  2: 'bg-orange-100 text-orange-600',
  3: 'bg-red-100 text-red-600',
};

export function KanbanCard({ item, isDragging = false }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: item.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'transition-all duration-200 cursor-grab active:cursor-grabbing touch-none',
        isDragging && 'opacity-50 scale-95'
      )}
    >
      <Card
        variant="default"
        hover
        className={cn(
          'border-2 transition-colors',
          isDragging && 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-200'
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <div className="mt-1 text-slate-400">
              <GripVertical className=" ui-icon w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-astralis-navy line-clamp-2">
                {item.title}
              </h4>

              {item.description && (
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {item.description}
                </p>
              )}

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {item.priority > 0 && (
                <div className="mt-2">
                  <span
                    className={cn(
                      'text-xs px-2 py-0.5 rounded font-medium',
                      priorityColors[item.priority as keyof typeof priorityColors] || priorityColors[0]
                    )}
                  >
                    P{item.priority}
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

'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { UnifiedKanbanCard } from './UnifiedKanbanCard';
import { useMovePipelineItem } from '@/hooks/usePipelines';
import { PipelineStage, PipelineItem, PipelineItemStatus } from '@/types/pipelines';

interface KanbanBoardProps {
  pipelineId: string;
  stages: PipelineStage[];
  onItemClick?: (item: PipelineItem) => void;
  onRefetch?: () => void;
}

export function KanbanBoard({ pipelineId, stages, onItemClick, onRefetch }: KanbanBoardProps) {
  const [activeItem, setActiveItem] = useState<PipelineItem | null>(null);
  const moveItem = useMovePipelineItem();

  // Handler for when item status changes (close/complete)
  const handleStatusChange = (itemId: string, newStatus: PipelineItemStatus) => {
    // Trigger refetch to update the board
    onRefetch?.();
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const item = stages
      .flatMap((stage) => stage.items)
      .find((item) => item.id === active.id);

    if (item) {
      setActiveItem(item);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveItem(null);
      return;
    }

    const itemId = active.id as string;
    const targetStageId = over.id as string;

    // Find current stage
    const currentStage = stages.find((stage) =>
      stage.items.some((item) => item.id === itemId)
    );

    if (!currentStage || currentStage.id === targetStageId) {
      setActiveItem(null);
      return;
    }

    // Move item with optimistic update
    moveItem.mutate({
      itemId,
      pipelineId,
      targetStageId,
    });

    setActiveItem(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCorners}
    >
      <div className="ui-kanban flex gap-4 overflow-hidden p-4">
        {stages.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            items={stage.items}
            pipelineId={pipelineId}
            onItemClick={onItemClick}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>

      <DragOverlay>
        {activeItem ? (
          <div className="rotate-3 scale-105">
            <UnifiedKanbanCard item={activeItem} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

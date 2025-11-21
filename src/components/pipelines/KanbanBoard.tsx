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
import { PipelineCard } from './PipelineCard';
import { useMovePipelineItem } from '@/hooks/usePipelines';
import { PipelineStage, PipelineItem } from '@/types/pipelines';

interface KanbanBoardProps {
  pipelineId: string;
  stages: PipelineStage[];
  onItemClick?: (item: PipelineItem) => void;
}

export function KanbanBoard({ pipelineId, stages, onItemClick }: KanbanBoardProps) {
  const [activeItem, setActiveItem] = useState<PipelineItem | null>(null);
  const moveItem = useMovePipelineItem();

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
      <div className="flex gap-6 h-full overflow-x-auto pb-6 px-2">
        {stages.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            items={stage.items}
            onItemClick={onItemClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeItem ? (
          <div className="rotate-3 scale-105">
            <PipelineCard item={activeItem} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

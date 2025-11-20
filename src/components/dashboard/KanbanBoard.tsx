'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { useMovePipelineItem } from '@/hooks/usePipelines';

interface Pipeline {
  id: string;
  name: string;
  stages: Stage[];
}

interface Stage {
  id: string;
  name: string;
  order: number;
  items: PipelineItem[];
}

interface PipelineItem {
  id: string;
  title: string;
  description?: string | null;
  priority: number;
  tags: string[];
  stageId: string;
}

interface KanbanBoardProps {
  pipeline: Pipeline;
  onRefetch?: () => void;
}

export function KanbanBoard({ pipeline, onRefetch }: KanbanBoardProps) {
  const [activeItem, setActiveItem] = useState<PipelineItem | null>(null);
  const moveItem = useMovePipelineItem();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const item = pipeline.stages
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
    const currentStage = pipeline.stages.find((stage) =>
      stage.items.some((item) => item.id === itemId)
    );

    if (!currentStage || currentStage.id === targetStageId) {
      setActiveItem(null);
      return;
    }

    // Move item
    moveItem.mutate({
      itemId,
      pipelineId: pipeline.id,
      targetStageId,
    });

    setActiveItem(null);
  };

  const handleItemCreated = () => {
    // Trigger refetch through the parent component
    onRefetch?.();
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 h-full overflow-x-auto pb-6">
        {pipeline.stages.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            items={stage.items}
            pipelineId={pipeline.id}
            onItemCreated={handleItemCreated}
          />
        ))}
      </div>

      <DragOverlay>
        {activeItem ? (
          <div className="rotate-2 scale-105">
            <KanbanCard item={activeItem} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

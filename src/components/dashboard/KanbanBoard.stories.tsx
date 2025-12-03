import type { Meta, StoryObj } from '@storybook/react';
import { KanbanBoard } from './KanbanBoard';
import { PipelineItemStatus } from '@/types/pipelines';

const meta = {
  title: 'Pipelines/KanbanBoard',
  component: KanbanBoard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', padding: '24px', background: '#f8fafc' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof KanbanBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

// Helper to generate mock items
const generateItems = (count: number, stageId: string, prefix: string = 'Item') => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${stageId}-item-${i + 1}`,
    title: `${prefix} ${i + 1}`,
    description: i % 2 === 0 ? `Description for ${prefix.toLowerCase()} ${i + 1}` : null,
    priority: (i % 5) as 0 | 1 | 2 | 3 | 4,
    tags: i % 3 === 0 ? ['intake'] : [],
    stageId,
    status: PipelineItemStatus.NOT_STARTED,
  }));
};

// Basic pipeline with 3 stages
const basicPipeline = {
  id: 'pipeline-1',
  name: 'Sales Pipeline',
  stages: [
    {
      id: 'stage-1',
      name: 'New Lead',
      order: 0,
      color: '#3B82F6',
      items: generateItems(3, 'stage-1', 'Lead'),
    },
    {
      id: 'stage-2',
      name: 'Qualified',
      order: 1,
      color: '#F59E0B',
      items: generateItems(2, 'stage-2', 'Prospect'),
    },
    {
      id: 'stage-3',
      name: 'Proposal Sent',
      order: 2,
      color: '#EF4444',
      items: generateItems(1, 'stage-3', 'Deal'),
    },
  ],
};

// Pipeline with many items to test scrolling
const manyItemsPipeline = {
  id: 'pipeline-2',
  name: 'Support Pipeline',
  stages: [
    {
      id: 'stage-1',
      name: 'New Tickets',
      order: 0,
      color: '#3B82F6',
      items: generateItems(15, 'stage-1', 'Ticket'),
    },
    {
      id: 'stage-2',
      name: 'In Progress',
      order: 1,
      color: '#F59E0B',
      items: generateItems(8, 'stage-2', 'Issue'),
    },
    {
      id: 'stage-3',
      name: 'Resolved',
      order: 2,
      color: '#10B981',
      items: generateItems(4, 'stage-3', 'Resolved'),
    },
  ],
};

// Pipeline with 5 stages to test horizontal fit
const manyStagesPipeline = {
  id: 'pipeline-3',
  name: 'Development Pipeline',
  stages: [
    {
      id: 'stage-1',
      name: 'Backlog',
      order: 0,
      color: '#6B7280',
      items: generateItems(5, 'stage-1', 'Task'),
    },
    {
      id: 'stage-2',
      name: 'To Do',
      order: 1,
      color: '#3B82F6',
      items: generateItems(3, 'stage-2', 'Story'),
    },
    {
      id: 'stage-3',
      name: 'In Progress',
      order: 2,
      color: '#F59E0B',
      items: generateItems(2, 'stage-3', 'Feature'),
    },
    {
      id: 'stage-4',
      name: 'Review',
      order: 3,
      color: '#8B5CF6',
      items: generateItems(2, 'stage-4', 'PR'),
    },
    {
      id: 'stage-5',
      name: 'Done',
      order: 4,
      color: '#10B981',
      items: generateItems(4, 'stage-5', 'Completed'),
    },
  ],
};

// Empty pipeline
const emptyPipeline = {
  id: 'pipeline-4',
  name: 'Empty Pipeline',
  stages: [
    {
      id: 'stage-1',
      name: 'New',
      order: 0,
      color: '#3B82F6',
      items: [],
    },
    {
      id: 'stage-2',
      name: 'In Progress',
      order: 1,
      color: '#F59E0B',
      items: [],
    },
    {
      id: 'stage-3',
      name: 'Done',
      order: 2,
      color: '#10B981',
      items: [],
    },
  ],
};

export const Default: Story = {
  args: {
    pipeline: basicPipeline,
  },
};

export const ManyItems: Story = {
  args: {
    pipeline: manyItemsPipeline,
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests vertical scrolling within columns when there are many items. Only the card content should scroll, not the columns container.',
      },
    },
  },
};

export const ManyStages: Story = {
  args: {
    pipeline: manyStagesPipeline,
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests how columns fit when there are 5 stages. Columns should flex to fill available space without horizontal scrolling.',
      },
    },
  },
};

export const EmptyStages: Story = {
  args: {
    pipeline: emptyPipeline,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows empty state for columns with no items.',
      },
    },
  },
};

export const ConstrainedHeight: Story = {
  args: {
    pipeline: manyItemsPipeline,
  },
  decorators: [
    (Story) => (
      <div style={{ height: '500px', padding: '24px', background: '#f8fafc', border: '2px dashed #cbd5e1' }}>
        <p style={{ marginBottom: '12px', color: '#64748b', fontSize: '14px' }}>
          Container height: 500px - columns should not overflow
        </p>
        <div style={{ height: 'calc(100% - 40px)' }}>
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Tests that columns respect parent container height constraints. The columns container should not overflow - only individual column content should scroll.',
      },
    },
  },
};

export const SmallViewport: Story = {
  args: {
    pipeline: manyStagesPipeline,
  },
  decorators: [
    (Story) => (
      <div style={{ height: '400px', width: '900px', padding: '16px', background: '#f8fafc', border: '2px dashed #cbd5e1' }}>
        <p style={{ marginBottom: '8px', color: '#64748b', fontSize: '12px' }}>
          900px x 400px viewport
        </p>
        <div style={{ height: 'calc(100% - 30px)' }}>
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Tests column behavior in a constrained viewport. Columns should shrink to fit without overflow.',
      },
    },
  },
};

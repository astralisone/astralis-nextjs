import type { Meta, StoryObj } from '@storybook/react';
import { ConstellationBackground } from './ConstellationBackground';

const meta: Meta<typeof ConstellationBackground> = {
  title: 'Effects/ConstellationBackground',
  component: ConstellationBackground,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    nodeCount: {
      control: { type: 'range', min: 5, max: 50, step: 1 },
      description: 'Number of constellation nodes',
    },
    connectionDistance: {
      control: { type: 'range', min: 50, max: 300, step: 10 },
      description: 'Distance threshold for node connections',
    },
    interactive: {
      control: 'boolean',
      description: 'Enable hover effects on nodes',
    },
    color: {
      control: { type: 'select' },
      options: ['cyan', 'blue', 'purple'],
      description: 'Color theme',
    },
    animateOnMount: {
      control: 'boolean',
      description: 'Animate line drawing on mount',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ConstellationBackground>;

export const Default: Story = {
  args: {
    nodeCount: 20,
    connectionDistance: 150,
    interactive: true,
    color: 'cyan',
    animateOnMount: true,
  },
  render: (args) => (
    <div className="relative w-full h-screen bg-astralis-navy">
      <ConstellationBackground {...args} />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-4">AI Marketplace</h1>
          <p className="text-xl text-slate-300">Hover over nodes to see connections</p>
        </div>
      </div>
    </div>
  ),
};

export const Dense: Story = {
  args: {
    ...Default.args,
    nodeCount: 40,
    connectionDistance: 120,
  },
  render: Default.render,
};

export const Sparse: Story = {
  args: {
    ...Default.args,
    nodeCount: 10,
    connectionDistance: 200,
  },
  render: Default.render,
};

export const BlueTheme: Story = {
  args: {
    ...Default.args,
    color: 'blue',
  },
  render: Default.render,
};

export const NonInteractive: Story = {
  args: {
    ...Default.args,
    interactive: false,
  },
  render: Default.render,
};

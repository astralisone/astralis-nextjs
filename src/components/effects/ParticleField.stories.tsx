import type { Meta, StoryObj } from '@storybook/react';
import { ParticleField } from './ParticleField';

const meta: Meta<typeof ParticleField> = {
  title: 'Effects/ParticleField',
  component: ParticleField,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    density: {
      control: { type: 'range', min: 10, max: 200, step: 10 },
      description: 'Number of particles in the field',
    },
    speed: {
      control: { type: 'range', min: 0.1, max: 2, step: 0.1 },
      description: 'Movement speed multiplier',
    },
    color: {
      control: { type: 'select' },
      options: ['cyan', 'blue', 'purple', 'white'],
      description: 'Particle color preset',
    },
    connectionLines: {
      control: 'boolean',
      description: 'Show connection lines between nearby particles',
    },
    connectionDistance: {
      control: { type: 'range', min: 50, max: 300, step: 10 },
      description: 'Maximum distance for particle connections',
    },
    interactive: {
      control: 'boolean',
      description: 'Enable mouse interaction (particles move away from cursor)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ParticleField>;

export const Default: Story = {
  args: {
    density: 50,
    speed: 0.5,
    color: 'cyan',
    connectionLines: true,
    connectionDistance: 150,
    interactive: false,
  },
  render: (args) => (
    <div className="relative w-full h-screen bg-astralis-navy">
      <ParticleField {...args} />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <h1 className="text-5xl font-bold text-white">Particle Field Effect</h1>
      </div>
    </div>
  ),
};

export const Interactive: Story = {
  args: {
    ...Default.args,
    interactive: true,
  },
  render: Default.render,
};

export const Dense: Story = {
  args: {
    ...Default.args,
    density: 100,
  },
  render: Default.render,
};

export const Fast: Story = {
  args: {
    ...Default.args,
    speed: 1.5,
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

export const NoConnections: Story = {
  args: {
    ...Default.args,
    connectionLines: false,
  },
  render: Default.render,
};

import type { Meta, StoryObj } from '@storybook/react';
import { OrbitalIcons } from './OrbitalIcons';
import { PulsingRing } from '@/components/effects/PulsingRing';
import {
  Search,
  Settings,
  Zap,
  Shield,
  Database,
  Cloud,
  Lock,
  Globe,
} from 'lucide-react';

const meta: Meta<typeof OrbitalIcons> = {
  title: 'Interactive/OrbitalIcons',
  component: OrbitalIcons,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0A1B2B' },
        { name: 'light', value: '#ffffff' },
      ],
    },
  },
  tags: ['autodocs'],
  argTypes: {
    radius: {
      control: { type: 'range', min: 100, max: 300, step: 10 },
      description: 'Orbit radius in pixels',
    },
    speed: {
      control: { type: 'select' },
      options: ['slow', 'medium', 'fast', 10, 20, 30],
      description: 'Orbital speed',
    },
    glowOnHover: {
      control: 'boolean',
      description: 'Show glow effect on hover',
    },
    iconSize: {
      control: { type: 'range', min: 16, max: 48, step: 4 },
      description: 'Icon size in pixels',
    },
    reverse: {
      control: 'boolean',
      description: 'Reverse orbital direction',
    },
  },
};

export default meta;
type Story = StoryObj<typeof OrbitalIcons>;

const techIcons = [Search, Settings, Zap, Shield, Database, Cloud, Lock, Globe];

export const Default: Story = {
  args: {
    icons: techIcons,
    radius: 200,
    speed: 'slow',
    glowOnHover: true,
    iconSize: 24,
    reverse: false,
  },
};

export const WithCenterContent: Story = {
  args: {
    ...Default.args,
  },
  render: (args) => (
    <OrbitalIcons {...args}>
      <div className="text-center">
        <div className="text-5xl font-bold text-white mb-2">AI</div>
        <div className="text-sm text-astralis-cyan">Technology Hub</div>
      </div>
    </OrbitalIcons>
  ),
};

export const WithPulsingRing: Story = {
  args: {
    ...Default.args,
  },
  render: (args) => (
    <OrbitalIcons {...args}>
      <PulsingRing size={120} rings={3} color="cyan">
        <div className="text-4xl font-bold text-white">AI</div>
      </PulsingRing>
    </OrbitalIcons>
  ),
};

export const FastOrbit: Story = {
  args: {
    ...Default.args,
    speed: 'fast',
  },
};

export const ReverseOrbit: Story = {
  args: {
    ...Default.args,
    reverse: true,
  },
};

export const LargeRadius: Story = {
  args: {
    ...Default.args,
    radius: 280,
    iconSize: 28,
  },
};

export const CompactOrbit: Story = {
  args: {
    ...Default.args,
    radius: 120,
    iconSize: 20,
  },
};

export const FewIcons: Story = {
  args: {
    icons: [Search, Settings, Zap, Shield],
    radius: 200,
    speed: 'medium',
    glowOnHover: true,
  },
};

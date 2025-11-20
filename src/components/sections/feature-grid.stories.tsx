import type { Meta, StoryObj } from '@storybook/react';
import { FeatureGrid } from './feature-grid';
import { Zap, Shield, TrendingUp, Users } from 'lucide-react';

const meta = {
  title: 'Sections/FeatureGrid',
  component: FeatureGrid,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FeatureGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleFeatures = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Optimized performance for rapid deployment and execution.',
  },
  {
    icon: Shield,
    title: 'Secure & Reliable',
    description: 'Enterprise-grade security protecting your data 24/7.',
  },
  {
    icon: TrendingUp,
    title: 'Scalable Growth',
    description: 'Grow seamlessly from startup to enterprise scale.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Built for teams with powerful collaboration tools.',
  },
];

export const Default: Story = {
  args: {
    headline: 'Why Choose Astralis',
    subheadline: 'Everything you need to automate and scale your business operations.',
    features: sampleFeatures,
  },
};

export const TwoColumns: Story = {
  args: {
    headline: 'Core Features',
    subheadline: 'The essentials for modern business automation.',
    features: sampleFeatures.slice(0, 2),
    columns: 2,
  },
};

export const ThreeColumns: Story = {
  args: {
    headline: 'Complete Solution',
    subheadline: 'Everything your business needs to succeed.',
    features: [...sampleFeatures, ...sampleFeatures.slice(0, 2)],
    columns: 3,
  },
};

export const WithoutDescription: Story = {
  args: {
    headline: 'Our Features',
    features: sampleFeatures,
  },
};

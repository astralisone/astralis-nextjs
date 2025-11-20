import type { Meta, StoryObj } from '@storybook/react';
import { StatsSection } from './stats-section';

const meta = {
  title: 'Sections/StatsSection',
  component: StatsSection,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof StatsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleStats = [
  {
    value: '500+',
    label: 'Active Clients',
    description: 'Businesses trust us',
  },
  {
    value: '98%',
    label: 'Satisfaction Rate',
    description: 'Client happiness score',
  },
  {
    value: '10M+',
    label: 'Tasks Automated',
    description: 'Hours saved monthly',
  },
  {
    value: '24/7',
    label: 'Support Available',
    description: 'Always here to help',
  },
];

export const Default: Story = {
  args: {
    headline: 'Trusted by Industry Leaders',
    description: 'Our platform delivers measurable results across all business sizes.',
    stats: sampleStats,
  },
};

export const ThreeStats: Story = {
  args: {
    headline: 'By the Numbers',
    stats: sampleStats.slice(0, 3),
  },
};

export const TwoStats: Story = {
  args: {
    headline: 'Key Metrics',
    description: 'What matters most to our customers.',
    stats: sampleStats.slice(0, 2),
  },
};

export const WithoutDescription: Story = {
  args: {
    headline: 'Platform Statistics',
    stats: sampleStats,
  },
};

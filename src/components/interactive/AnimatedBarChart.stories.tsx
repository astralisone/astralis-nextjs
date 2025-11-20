import type { Meta, StoryObj } from '@storybook/react';
import { AnimatedBarChart } from './AnimatedBarChart';

const meta: Meta<typeof AnimatedBarChart> = {
  title: 'Interactive/AnimatedBarChart',
  component: AnimatedBarChart,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    height: {
      control: { type: 'range', min: 100, max: 400, step: 10 },
      description: 'Chart height in pixels',
    },
    showValues: {
      control: 'boolean',
      description: 'Display value labels',
    },
    valueFormat: {
      control: { type: 'select' },
      options: ['number', 'currency', 'percentage'],
      description: 'Value format type',
    },
    animateOnScroll: {
      control: 'boolean',
      description: 'Trigger animation on scroll into view',
    },
    animationDuration: {
      control: { type: 'range', min: 500, max: 3000, step: 100 },
      description: 'Animation duration in milliseconds',
    },
    showTooltips: {
      control: 'boolean',
      description: 'Show tooltips on hover',
    },
    spacing: {
      control: { type: 'select' },
      options: ['compact', 'normal', 'relaxed'],
      description: 'Bar spacing',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AnimatedBarChart>;

export const Default: Story = {
  args: {
    data: [
      { label: 'Before', value: 1200, color: 'slate' },
      { label: 'After', value: 3726, color: 'cyan' },
    ],
    height: 192,
    showValues: true,
    valueFormat: 'number',
    animateOnScroll: false,
    animationDuration: 1000,
    showTooltips: true,
    spacing: 'normal',
  },
};

export const ROIComparison: Story = {
  args: {
    data: [
      {
        label: 'Manual Process',
        value: 1200,
        color: 'slate',
        description: 'Current monthly revenue',
      },
      {
        label: 'With AI Automation',
        value: 3726,
        color: 'gradient',
        description: '210% increase in efficiency',
      },
    ],
    height: 240,
    showValues: true,
    valueFormat: 'currency',
    animationDuration: 1500,
  },
};

export const MultipleMetrics: Story = {
  args: {
    data: [
      { label: 'Q1', value: 45, color: 'blue' },
      { label: 'Q2', value: 62, color: 'cyan' },
      { label: 'Q3', value: 78, color: 'purple' },
      { label: 'Q4', value: 95, color: 'gradient' },
    ],
    height: 200,
    showValues: true,
    valueFormat: 'percentage',
    animationDuration: 1200,
    spacing: 'relaxed',
  },
};

export const CompactLayout: Story = {
  args: {
    data: [
      { label: 'A', value: 150 },
      { label: 'B', value: 280 },
      { label: 'C', value: 420 },
      { label: 'D', value: 350 },
      { label: 'E', value: 490 },
    ],
    height: 160,
    showValues: false,
    spacing: 'compact',
  },
};

export const FastAnimation: Story = {
  args: {
    ...Default.args,
    animationDuration: 600,
  },
};

export const SlowAnimation: Story = {
  args: {
    ...Default.args,
    animationDuration: 2500,
  },
};

export const WithDescriptions: Story = {
  args: {
    data: [
      {
        label: 'Traditional',
        value: 5000,
        color: 'slate',
        description: 'Manual data entry and processing - 40 hours/week',
      },
      {
        label: 'Automated',
        value: 15000,
        color: 'cyan',
        description: 'AI-powered automation - Saves 35 hours/week',
      },
    ],
    height: 220,
    valueFormat: 'currency',
  },
};

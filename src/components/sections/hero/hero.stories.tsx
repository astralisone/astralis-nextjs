import type { Meta, StoryObj } from '@storybook/react';
import { HeroSection } from './index';

const meta = {
  title: 'Sections/Hero',
  component: HeroSection,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: 'hsl(220 20% 3%)' },
        { name: 'light', value: '#ffffff' }
      ]
    }
  },
  tags: ['autodocs'],
} satisfies Meta<typeof HeroSection>;

export default meta;
type Story = StoryObj<typeof HeroSection>;

// Default Hero Section
export const Default: Story = {
  render: () => (
    <div className="min-h-screen">
      <HeroSection />
    </div>
  ),
};

// With Custom Background
export const WithGradientBackground: Story = {
  render: () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-neutral-900 to-blue-900/20">
      <HeroSection />
    </div>
  ),
};

// Mobile View
export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: () => (
    <div className="min-h-screen">
      <HeroSection />
    </div>
  ),
};
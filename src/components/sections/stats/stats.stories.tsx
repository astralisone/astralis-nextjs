import type { Meta, StoryObj } from '@storybook/react';
import { StatsSection } from './index';

const meta = {
  title: 'Sections/Stats',
  component: StatsSection,
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
} satisfies Meta<typeof StatsSection>;

export default meta;
type Story = StoryObj<typeof StatsSection>;

// Default Stats Section
export const Default: Story = {
  render: () => (
    <div className="py-20 bg-neutral-900">
      <StatsSection />
    </div>
  ),
};

// With Animated Background
export const WithAnimatedBackground: Story = {
  render: () => (
    <div className="py-20 bg-gradient-to-r from-neutral-900 via-purple-900/10 to-neutral-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-3/4 left-3/4 w-16 h-16 bg-violet-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      <div className="relative">
        <StatsSection />
      </div>
    </div>
  ),
};

// Glassmorphism Variant
export const GlassmorphismVariant: Story = {
  render: () => (
    <div className="py-20 bg-gradient-to-br from-purple-600 via-purple-500 to-blue-500 relative">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative">
        <StatsSection />
      </div>
    </div>
  ),
};

// Mobile Responsive
export const MobileResponsive: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: () => (
    <div className="py-20 bg-neutral-900">
      <StatsSection />
    </div>
  ),
};
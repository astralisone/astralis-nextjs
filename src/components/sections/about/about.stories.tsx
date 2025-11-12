import type { Meta, StoryObj } from '@storybook/react';
import { AboutSection } from './index';

const meta = {
  title: 'Sections/About',
  component: AboutSection,
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
} satisfies Meta<typeof AboutSection>;

export default meta;
type Story = StoryObj<typeof AboutSection>;

// Default About Section
export const Default: Story = {
  render: () => (
    <div className="py-20 bg-neutral-900">
      <AboutSection />
    </div>
  ),
};

// With Glassmorphism Background
export const WithGlassmorphism: Story = {
  render: () => (
    <div className="py-20 bg-gradient-to-br from-purple-600/10 via-neutral-900 to-blue-600/10 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
      </div>
      <div className="relative">
        <AboutSection />
      </div>
    </div>
  ),
};

// Tablet View
export const TabletView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
  render: () => (
    <div className="py-20 bg-neutral-900">
      <AboutSection />
    </div>
  ),
};
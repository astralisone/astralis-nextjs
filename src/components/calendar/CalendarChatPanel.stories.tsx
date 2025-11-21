import type { Meta, StoryObj } from '@storybook/react';
import { CalendarChatPanel } from './CalendarChatPanel';

/**
 * Calendar Chat Panel Story
 *
 * Demonstrates the conversational calendar management interface.
 *
 * ## Features
 * - Natural language calendar queries
 * - Confirmation flow for actions
 * - Message history
 * - Auto-scroll and loading states
 *
 * ## Example Queries
 * - "What meetings do I have tomorrow?"
 * - "Schedule a meeting with john@example.com next Tuesday at 2pm"
 * - "Find me 2 hours of focus time this week"
 * - "Cancel my 3pm meeting"
 */
const meta: Meta<typeof CalendarChatPanel> = {
  title: 'Components/Calendar/CalendarChatPanel',
  component: CalendarChatPanel,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A conversational interface for managing calendar events using natural language. Supports viewing schedules, scheduling meetings, finding time slots, and canceling events with a confirmation flow for destructive actions.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    userId: {
      description: 'User ID for authentication and calendar access',
      control: 'text',
    },
    orgId: {
      description: 'Organization ID for multi-tenant support',
      control: 'text',
    },
    className: {
      description: 'Additional CSS classes',
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default calendar chat panel
 */
export const Default: Story = {
  args: {
    userId: 'user-123',
    orgId: 'org-456',
  },
  decorators: [
    Story => (
      <div className="w-[800px] h-[600px]">
        <Story />
      </div>
    ),
  ],
};

/**
 * Mobile view (narrow width)
 */
export const Mobile: Story = {
  args: {
    userId: 'user-123',
    orgId: 'org-456',
  },
  decorators: [
    Story => (
      <div className="w-[375px] h-[667px]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Calendar chat panel optimized for mobile devices.',
      },
    },
  },
};

/**
 * Tablet view
 */
export const Tablet: Story = {
  args: {
    userId: 'user-123',
    orgId: 'org-456',
  },
  decorators: [
    Story => (
      <div className="w-[768px] h-[1024px]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Calendar chat panel on tablet-sized screens.',
      },
    },
  },
};

/**
 * Full screen
 */
export const FullScreen: Story = {
  args: {
    userId: 'user-123',
    orgId: 'org-456',
  },
  decorators: [
    Story => (
      <div className="w-screen h-screen">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Calendar chat panel in full-screen mode.',
      },
    },
  },
};

/**
 * Custom styling
 */
export const CustomStyling: Story = {
  args: {
    userId: 'user-123',
    orgId: 'org-456',
    className: 'shadow-2xl',
  },
  decorators: [
    Story => (
      <div className="w-[800px] h-[600px] bg-slate-100 p-8">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Calendar chat panel with custom styling and background.',
      },
    },
  },
};

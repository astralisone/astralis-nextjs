import type { Meta, StoryObj } from '@storybook/react';
import { DocumentChat } from './DocumentChat';

/**
 * DocumentChat - AI-powered document Q&A interface
 *
 * A chat component for asking questions about documents with AI responses
 * and source citations. Features auto-scroll, loading states, and error handling.
 *
 * Component follows Astralis brand specification:
 * - Astralis Blue (#2B6CB0) for user messages
 * - Slate neutrals for assistant messages
 * - Card components with 8px border radius
 * - 150ms transitions
 */
const meta = {
  title: 'Documents/DocumentChat',
  component: DocumentChat,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Chat interface for document Q&A with AI-powered responses and source citations.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    documentId: {
      control: 'text',
      description: 'Document ID to scope chat to specific document (optional)',
    },
    orgId: {
      control: 'text',
      description: 'Organization ID for scoping',
    },
    userId: {
      control: 'text',
      description: 'User ID for authentication',
    },
    chatId: {
      control: 'text',
      description: 'Chat ID for continuing existing conversation (optional)',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof DocumentChat>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state - New conversation
 */
export const Default: Story = {
  args: {
    orgId: 'org-123',
    userId: 'user-456',
  },
  decorators: [
    (Story) => (
      <div className="w-[600px] h-[700px]">
        <Story />
      </div>
    ),
  ],
};

/**
 * Document-specific chat
 */
export const DocumentSpecific: Story = {
  args: {
    documentId: 'doc-789',
    orgId: 'org-123',
    userId: 'user-456',
  },
  decorators: [
    (Story) => (
      <div className="w-[600px] h-[700px]">
        <Story />
      </div>
    ),
  ],
};

/**
 * Existing chat conversation
 */
export const ExistingChat: Story = {
  args: {
    chatId: 'chat-abc-123',
    documentId: 'doc-789',
    orgId: 'org-123',
    userId: 'user-456',
  },
  decorators: [
    (Story) => (
      <div className="w-[600px] h-[700px]">
        <Story />
      </div>
    ),
  ],
};

/**
 * Full-width layout
 */
export const FullWidth: Story = {
  args: {
    orgId: 'org-123',
    userId: 'user-456',
  },
  decorators: [
    (Story) => (
      <div className="w-full h-[700px] max-w-4xl mx-auto">
        <Story />
      </div>
    ),
  ],
};

/**
 * Mobile responsive
 */
export const Mobile: Story = {
  args: {
    orgId: 'org-123',
    userId: 'user-456',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[375px] h-[667px]">
        <Story />
      </div>
    ),
  ],
};

/**
 * With custom styling
 */
export const CustomStyling: Story = {
  args: {
    orgId: 'org-123',
    userId: 'user-456',
    className: 'shadow-lg border-2 border-astralis-blue',
  },
  decorators: [
    (Story) => (
      <div className="w-[600px] h-[700px]">
        <Story />
      </div>
    ),
  ],
};

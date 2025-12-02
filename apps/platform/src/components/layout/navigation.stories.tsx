import type { Meta, StoryObj } from '@storybook/react';
import { Navigation } from './navigation';

const meta = {
  title: 'Layout/Navigation',
  component: Navigation,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Navigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OnSolutionsPage: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/solutions',
      },
    },
  },
};

export const OnContactPage: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/contact',
      },
    },
  },
};

export const WithDarkBackground: Story = {
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-astralis-navy">
        <Story />
      </div>
    ),
  ],
};

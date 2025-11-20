import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar, SkeletonButton, SkeletonImage } from './skeleton';

const meta = {
  title: 'UI/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'circular', 'rectangular'],
    },
    animation: {
      control: 'select',
      options: ['pulse', 'wave', 'none'],
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: 'h-12 w-full',
  },
};

export const Text: Story = {
  args: {
    variant: 'text',
    className: 'w-full',
  },
};

export const Circular: Story = {
  args: {
    variant: 'circular',
    width: 64,
    height: 64,
  },
};

export const Rectangular: Story = {
  args: {
    variant: 'rectangular',
    className: 'h-32 w-full',
  },
};

export const PulseAnimation: Story = {
  args: {
    animation: 'pulse',
    className: 'h-12 w-full',
  },
};

export const WaveAnimation: Story = {
  args: {
    animation: 'wave',
    className: 'h-12 w-full',
  },
};

export const NoAnimation: Story = {
  args: {
    animation: 'none',
    className: 'h-12 w-full',
  },
};

export const TextLines: Story = {
  render: () => <SkeletonText lines={5} />,
};

export const Card: Story = {
  render: () => <SkeletonCard />,
};

export const Avatar: Story = {
  render: () => <SkeletonAvatar size={64} />,
};

export const Button: Story = {
  render: () => <SkeletonButton />,
};

export const Image16x9: Story = {
  render: () => <SkeletonImage aspectRatio="16/9" className="max-w-md" />,
};

export const Image4x3: Story = {
  render: () => <SkeletonImage aspectRatio="4/3" className="max-w-md" />,
};

export const ProfileCard: Story = {
  render: () => (
    <div className="max-w-sm border border-slate-200 rounded-lg p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <SkeletonAvatar size={64} />
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" className="w-3/4" />
          <Skeleton variant="text" className="w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-4/5" />
      </div>
      <div className="flex gap-2">
        <SkeletonButton />
        <SkeletonButton />
      </div>
    </div>
  ),
};

export const BlogPost: Story = {
  render: () => (
    <div className="max-w-2xl space-y-6">
      <SkeletonImage aspectRatio="16/9" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <div className="flex items-center gap-3">
          <SkeletonAvatar size={32} />
          <Skeleton className="h-4 w-32" />
        </div>
        <SkeletonText lines={6} />
      </div>
    </div>
  ),
};

export const ProductGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border border-slate-200 rounded-lg overflow-hidden">
          <SkeletonImage aspectRatio="4/3" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-6 w-20" />
              <SkeletonButton className="w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const CommentList: Story = {
  render: () => (
    <div className="max-w-2xl space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <SkeletonAvatar size={40} />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  ),
};

export const DashboardStats: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border border-slate-200 rounded-lg p-6 space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-3 w-full" />
        </div>
      ))}
    </div>
  ),
};

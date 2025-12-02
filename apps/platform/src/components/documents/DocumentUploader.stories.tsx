import type { Meta, StoryObj } from '@storybook/react';
import { DocumentUploader } from './DocumentUploader';

const meta = {
  title: 'Documents/DocumentUploader',
  component: DocumentUploader,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    maxSize: {
      control: 'number',
      description: 'Maximum file size in bytes',
    },
    maxFiles: {
      control: 'number',
      description: 'Maximum number of files to upload at once',
    },
    acceptedTypes: {
      control: 'object',
      description: 'Accepted MIME types',
    },
  },
} satisfies Meta<typeof DocumentUploader>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default uploader with standard settings
 */
export const Default: Story = {
  args: {
    onComplete: () => console.log('Upload complete'),
  },
};

/**
 * Images only uploader
 */
export const ImagesOnly: Story = {
  args: {
    acceptedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 10,
    onComplete: () => console.log('Upload complete'),
  },
};

/**
 * PDFs only uploader
 */
export const PDFsOnly: Story = {
  args: {
    acceptedTypes: ['application/pdf'],
    maxSize: 20 * 1024 * 1024, // 20MB
    maxFiles: 3,
    onComplete: () => console.log('Upload complete'),
  },
};

/**
 * Small file limit
 */
export const SmallFileLimit: Story = {
  args: {
    maxSize: 1 * 1024 * 1024, // 1MB
    maxFiles: 5,
    onComplete: () => console.log('Upload complete'),
  },
};

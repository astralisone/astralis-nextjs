import type { Meta, StoryObj } from '@storybook/react';
import { DocumentCard } from './DocumentCard';
import { Document } from '@/types/documents';

const meta = {
  title: 'Documents/DocumentCard',
  component: DocumentCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    onView: { action: 'view clicked' },
    showActions: {
      control: 'boolean',
      description: 'Show action buttons',
    },
  },
} satisfies Meta<typeof DocumentCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Mock document data
 */
const mockDocument: Document = {
  id: 'doc-123',
  fileName: 'invoice-2024-001.pdf',
  originalName: 'Invoice_January_2024.pdf',
  filePath: 'org-abc123/docs/invoice-2024-001.pdf',
  cdnUrl: 'https://cdn.example.com/invoice-2024-001.pdf',
  thumbnailUrl: 'https://cdn.example.com/thumbnails/invoice-2024-001.jpg',
  fileSize: 245760, // 240 KB
  mimeType: 'application/pdf',
  status: 'COMPLETED',
  ocrText: 'Invoice #INV-2024-001\nDate: January 15, 2024\nAmount: $1,250.00',
  ocrConfidence: 0.95,
  extractedData: {
    invoiceNumber: 'INV-2024-001',
    date: '2024-01-15',
    amount: 1250.0,
    currency: 'USD',
  },
  metadata: {
    pageCount: 1,
    dimensions: { width: 612, height: 792 },
  },
  processingError: null,
  uploadedBy: 'user-456',
  orgId: 'org-abc123',
  createdAt: new Date('2024-01-15T10:30:00Z').toISOString(),
  updatedAt: new Date('2024-01-15T10:32:00Z').toISOString(),
  processedAt: new Date('2024-01-15T10:32:00Z').toISOString(),
};

/**
 * Completed document with high OCR confidence
 */
export const Completed: Story = {
  args: {
    document: mockDocument,
    showActions: true,
  },
};

/**
 * Pending document (just uploaded)
 */
export const Pending: Story = {
  args: {
    document: {
      ...mockDocument,
      status: 'PENDING',
      ocrText: null,
      ocrConfidence: null,
      extractedData: null,
      processedAt: null,
    },
    showActions: true,
  },
};

/**
 * Processing document
 */
export const Processing: Story = {
  args: {
    document: {
      ...mockDocument,
      status: 'PROCESSING',
      ocrText: null,
      ocrConfidence: null,
      extractedData: null,
      processedAt: null,
    },
    showActions: true,
  },
};

/**
 * Failed document with error
 */
export const Failed: Story = {
  args: {
    document: {
      ...mockDocument,
      status: 'FAILED',
      ocrText: null,
      ocrConfidence: null,
      extractedData: null,
      processingError: 'OCR extraction failed: Unable to read text from image',
    },
    showActions: true,
  },
};

/**
 * Image document
 */
export const ImageDocument: Story = {
  args: {
    document: {
      ...mockDocument,
      fileName: 'receipt-scan.jpg',
      originalName: 'Receipt_Scan.jpg',
      mimeType: 'image/jpeg',
      fileSize: 1024000, // 1MB
      ocrConfidence: 0.82,
    },
    showActions: true,
  },
};

/**
 * Low OCR confidence
 */
export const LowConfidence: Story = {
  args: {
    document: {
      ...mockDocument,
      ocrConfidence: 0.45,
      extractedData: null,
    },
    showActions: true,
  },
};

/**
 * Without actions
 */
export const WithoutActions: Story = {
  args: {
    document: mockDocument,
    showActions: false,
  },
};

/**
 * No thumbnail
 */
export const NoThumbnail: Story = {
  args: {
    document: {
      ...mockDocument,
      thumbnailUrl: null,
    },
    showActions: true,
  },
};

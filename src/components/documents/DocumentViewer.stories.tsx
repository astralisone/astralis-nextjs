import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DocumentViewer } from './DocumentViewer';
import { Document } from '@/types/documents';
import { Button } from '@/components/ui/button';

const meta = {
  title: 'Documents/DocumentViewer',
  component: DocumentViewer,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DocumentViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Mock document data
 */
const mockPdfDocument: Document = {
  id: 'doc-123',
  fileName: 'invoice-2024-001.pdf',
  originalName: 'Invoice_January_2024.pdf',
  filePath: 'org-abc123/docs/invoice-2024-001.pdf',
  cdnUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  thumbnailUrl: null,
  fileSize: 245760,
  mimeType: 'application/pdf',
  status: 'COMPLETED',
  ocrText: 'Invoice #INV-2024-001\nDate: January 15, 2024\nTotal Amount: $1,250.00\nDue Date: February 15, 2024',
  ocrConfidence: 0.95,
  extractedData: {
    invoiceNumber: 'INV-2024-001',
    invoiceDate: '2024-01-15',
    dueDate: '2024-02-15',
    totalAmount: 1250.0,
    currency: 'USD',
    vendor: 'Acme Corporation',
    customerName: 'John Doe',
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

const mockImageDocument: Document = {
  ...mockPdfDocument,
  id: 'doc-456',
  fileName: 'receipt-scan.jpg',
  originalName: 'Receipt_Scan.jpg',
  mimeType: 'image/jpeg',
  cdnUrl: 'https://picsum.photos/800/1200',
  thumbnailUrl: 'https://picsum.photos/200/300',
  ocrText: 'RECEIPT\nStore: Coffee Shop\nDate: 2024-01-20\nItem: Cappuccino - $4.50\nTotal: $4.50',
  extractedData: {
    storeName: 'Coffee Shop',
    date: '2024-01-20',
    items: [{ name: 'Cappuccino', price: 4.5 }],
    total: 4.5,
  },
};

/**
 * Interactive wrapper for viewer
 */
function ViewerWrapper({ document }: { document: Document }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-8">
      <Button onClick={() => setIsOpen(true)}>Open Document Viewer</Button>
      <DocumentViewer document={document} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}

/**
 * PDF document viewer
 */
export const PDFDocument: Story = {
  render: () => <ViewerWrapper document={mockPdfDocument} />,
};

/**
 * Image document viewer with OCR
 */
export const ImageDocument: Story = {
  render: () => <ViewerWrapper document={mockImageDocument} />,
};

/**
 * Failed document
 */
export const FailedDocument: Story = {
  render: () => (
    <ViewerWrapper
      document={{
        ...mockPdfDocument,
        status: 'FAILED',
        processingError: 'OCR extraction failed: Unable to read text from corrupted file',
        ocrText: null,
        ocrConfidence: null,
        extractedData: null,
      }}
    />
  ),
};

/**
 * Document without CDN URL
 */
export const NoPreview: Story = {
  render: () => (
    <ViewerWrapper
      document={{
        ...mockPdfDocument,
        cdnUrl: null,
        thumbnailUrl: null,
      }}
    />
  ),
};

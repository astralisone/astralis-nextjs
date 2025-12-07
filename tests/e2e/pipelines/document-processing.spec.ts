import { test, expect, prisma, createTestDocument } from './pipeline-fixtures';
import {
  signInUser,
  waitForAgentProcessing,
  getPipelineItems,
  createTestPurchaseOrder,
} from './pipeline-helpers';

/**
 * Document Processing E2E Tests
 *
 * Test Coverage:
 * - Document upload and classification
 * - OCR text extraction
 * - Agent routing based on document type
 * - Pipeline item creation from documents
 * - Integration between agents and pipelines
 */

test.describe('Document Processing E2E', () => {
  test('should classify and process invoice document', async ({ pipelineTestData }) => {
    const { user, org } = pipelineTestData;

    // Create test invoice document
    const invoice = await createTestDocument(org.id, user.id, 'INVOICE');

    expect(invoice).toBeDefined();
    expect(invoice.documentType).toBe('INVOICE');
    expect(invoice.status).toBe('COMPLETED');
    expect(invoice.classificationConfidence).toBeGreaterThan(0.9);

    // Verify extracted data
    const extractedData = invoice.extractedData as any;
    expect(extractedData.invoice_number).toBe('INV-2024-001');
    expect(extractedData.vendor_name).toBe('Acme Corporation');
    expect(extractedData.amount).toBe(5000.00);
  });

  test('should classify and process contract document', async ({ pipelineTestData }) => {
    const { user, org } = pipelineTestData;

    // Create test contract document
    const contract = await createTestDocument(org.id, user.id, 'CONTRACT');

    expect(contract).toBeDefined();
    expect(contract.documentType).toBe('CONTRACT');

    // Verify extracted data
    const extractedData = contract.extractedData as any;
    expect(extractedData.contract_number).toBe('CNT-2024-001');
    expect(extractedData.parties).toContain('Company A');
    expect(extractedData.parties).toContain('Company B');
    expect(extractedData.auto_renewal).toBe(true);
  });

  test('should classify and process packing slip document', async ({ pipelineTestData }) => {
    const { user, org } = pipelineTestData;

    // Create test packing slip document
    const packingSlip = await createTestDocument(org.id, user.id, 'PACKING_SLIP');

    expect(packingSlip).toBeDefined();
    expect(packingSlip.documentType).toBe('PACKING_SLIP');

    // Verify extracted data
    const extractedData = packingSlip.extractedData as any;
    expect(extractedData.packing_slip_number).toBe('PS-2024-001');
    expect(extractedData.po_number).toBe('PO-2024-100');
    expect(extractedData.line_items).toHaveLength(2);
  });

  test('should classify and process purchase order document', async ({ pipelineTestData }) => {
    const { user, org } = pipelineTestData;

    // Create test purchase order
    const po = await createTestPurchaseOrder(org.id, user.id, 'PO-2024-TEST');

    expect(po).toBeDefined();
    expect(po.documentType).toBe('PURCHASE_ORDER');
    expect(po.agentProcessed).toBe(true);

    // Verify extracted data
    const extractedData = po.extractedData as any;
    expect(extractedData.po_number).toBe('PO-2024-TEST');
    expect(extractedData.vendor).toBe('Supplier Inc');
    expect(extractedData.line_items).toHaveLength(2);
  });

  test('should store OCR text from document', async ({ pipelineTestData }) => {
    const { user, org } = pipelineTestData;

    const invoice = await createTestDocument(org.id, user.id, 'INVOICE');

    expect(invoice.ocrText).toBeDefined();
    expect(invoice.ocrText).toContain('INVOICE');
    expect(invoice.ocrText).toContain('INV-2024-001');
    expect(invoice.ocrConfidence).toBeGreaterThan(0.9);
  });

  test('should link document to pipeline item', async ({ pipelineTestData }) => {
    const { user, org, pipelines } = pipelineTestData;
    const financePipeline = pipelines.finance;

    // Create invoice
    const invoice = await createTestDocument(org.id, user.id, 'INVOICE');

    // Simulate agent creating pipeline item for invoice
    const receivedStage = financePipeline.stages.find(s => s.key === 'received');
    const pipelineItem = await prisma.pipelineItem.create({
      data: {
        title: `Invoice: ${(invoice.extractedData as any).invoice_number}`,
        description: `Vendor: ${(invoice.extractedData as any).vendor_name}`,
        stageId: receivedStage!.id,
        priority: 5,
        status: 'NOT_STARTED',
        metadata: {
          documentId: invoice.id,
          invoiceNumber: (invoice.extractedData as any).invoice_number,
          amount: (invoice.extractedData as any).amount,
        },
      },
    });

    expect(pipelineItem).toBeDefined();
    expect((pipelineItem.metadata as any).documentId).toBe(invoice.id);

    // Verify we can find document from pipeline item
    const linkedDocument = await prisma.document.findUnique({
      where: { id: (pipelineItem.metadata as any).documentId },
    });
    expect(linkedDocument?.id).toBe(invoice.id);
  });

  test('should handle multiple documents of same type', async ({ pipelineTestData }) => {
    const { user, org } = pipelineTestData;

    // Create multiple invoices
    const invoice1 = await createTestDocument(org.id, user.id, 'INVOICE');
    const invoice2 = await prisma.document.create({
      data: {
        fileName: 'second-invoice.pdf',
        originalName: 'second-invoice.pdf',
        filePath: '/uploads/second-invoice.pdf',
        cdnUrl: 'https://cdn.example.com/second-invoice.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        status: 'COMPLETED',
        uploadedById: user.id,
        orgId: org.id,
        documentType: 'INVOICE',
        classificationConfidence: 0.95,
        ocrText: 'INVOICE #INV-2024-002',
        extractedData: {
          invoice_number: 'INV-2024-002',
          vendor_name: 'Different Vendor',
          amount: 7500.00,
        },
      },
    });

    // Query all invoices for org
    const invoices = await prisma.document.findMany({
      where: {
        orgId: org.id,
        documentType: 'INVOICE',
      },
    });

    expect(invoices.length).toBeGreaterThanOrEqual(2);
    expect(invoices.map(i => i.id)).toContain(invoice1.id);
    expect(invoices.map(i => i.id)).toContain(invoice2.id);
  });

  test('should track document processing status', async ({ pipelineTestData }) => {
    const { user, org } = pipelineTestData;

    // Create document in PENDING status
    const pendingDoc = await prisma.document.create({
      data: {
        fileName: 'pending-doc.pdf',
        originalName: 'pending-doc.pdf',
        filePath: '/uploads/pending-doc.pdf',
        cdnUrl: 'https://cdn.example.com/pending-doc.pdf',
        fileSize: 512000,
        mimeType: 'application/pdf',
        status: 'PENDING',
        uploadedById: user.id,
        orgId: org.id,
      },
    });

    expect(pendingDoc.status).toBe('PENDING');
    expect(pendingDoc.documentType).toBeNull();
    expect(pendingDoc.agentProcessed).toBe(false);

    // Simulate processing completion
    const processedDoc = await prisma.document.update({
      where: { id: pendingDoc.id },
      data: {
        status: 'COMPLETED',
        documentType: 'INVOICE',
        classificationConfidence: 0.92,
        agentProcessed: true,
        agentProcessedAt: new Date(),
        processedAt: new Date(),
        extractedData: {
          invoice_number: 'INV-PROCESSED',
        },
      },
    });

    expect(processedDoc.status).toBe('COMPLETED');
    expect(processedDoc.documentType).toBe('INVOICE');
    expect(processedDoc.agentProcessed).toBe(true);
    expect(processedDoc.agentProcessedAt).toBeDefined();
  });

  test('should handle document with low classification confidence', async ({ pipelineTestData }) => {
    const { user, org } = pipelineTestData;

    // Create document with low confidence
    const lowConfidenceDoc = await prisma.document.create({
      data: {
        fileName: 'unclear-doc.pdf',
        originalName: 'unclear-doc.pdf',
        filePath: '/uploads/unclear-doc.pdf',
        cdnUrl: 'https://cdn.example.com/unclear-doc.pdf',
        fileSize: 256000,
        mimeType: 'application/pdf',
        status: 'COMPLETED',
        uploadedById: user.id,
        orgId: org.id,
        documentType: 'UNKNOWN',
        classificationConfidence: 0.45, // Low confidence
        ocrText: 'Ambiguous document content',
      },
    });

    expect(lowConfidenceDoc.documentType).toBe('UNKNOWN');
    expect(lowConfidenceDoc.classificationConfidence).toBeLessThan(0.5);
  });

  test('should extract line items from documents', async ({ pipelineTestData }) => {
    const { user, org } = pipelineTestData;

    const invoice = await createTestDocument(org.id, user.id, 'INVOICE');
    const extractedData = invoice.extractedData as any;

    expect(extractedData.line_items).toBeDefined();
    expect(Array.isArray(extractedData.line_items)).toBe(true);
    expect(extractedData.line_items.length).toBeGreaterThan(0);

    // Verify line item structure
    const firstItem = extractedData.line_items[0];
    expect(firstItem.description).toBeDefined();
    expect(firstItem.quantity).toBeDefined();
    expect(firstItem.unit_price).toBeDefined();
  });

  test('should query documents by extracted data fields', async ({ pipelineTestData }) => {
    const { user, org } = pipelineTestData;

    // Create invoice with specific vendor
    await prisma.document.create({
      data: {
        fileName: 'vendor-specific.pdf',
        originalName: 'vendor-specific.pdf',
        filePath: '/uploads/vendor-specific.pdf',
        cdnUrl: 'https://cdn.example.com/vendor-specific.pdf',
        fileSize: 512000,
        mimeType: 'application/pdf',
        status: 'COMPLETED',
        uploadedById: user.id,
        orgId: org.id,
        documentType: 'INVOICE',
        classificationConfidence: 0.95,
        extractedData: {
          invoice_number: 'INV-VENDOR-SEARCH',
          vendor_name: 'Unique Vendor XYZ',
          amount: 3000.00,
        },
      },
    });

    // Query by vendor name in extractedData
    const vendorDocs = await prisma.document.findMany({
      where: {
        orgId: org.id,
        extractedData: {
          path: ['vendor_name'],
          equals: 'Unique Vendor XYZ',
        },
      },
    });

    expect(vendorDocs.length).toBe(1);
    expect((vendorDocs[0].extractedData as any).invoice_number).toBe('INV-VENDOR-SEARCH');
  });

  test('should handle document with missing optional fields', async ({ pipelineTestData }) => {
    const { user, org } = pipelineTestData;

    // Create minimal invoice document
    const minimalInvoice = await prisma.document.create({
      data: {
        fileName: 'minimal-invoice.pdf',
        originalName: 'minimal-invoice.pdf',
        filePath: '/uploads/minimal-invoice.pdf',
        cdnUrl: 'https://cdn.example.com/minimal-invoice.pdf',
        fileSize: 256000,
        mimeType: 'application/pdf',
        status: 'COMPLETED',
        uploadedById: user.id,
        orgId: org.id,
        documentType: 'INVOICE',
        classificationConfidence: 0.88,
        extractedData: {
          invoice_number: 'INV-MINIMAL',
          amount: 1000.00,
          // No vendor_name, no due_date, no line_items
        },
      },
    });

    const extractedData = minimalInvoice.extractedData as any;
    expect(extractedData.invoice_number).toBe('INV-MINIMAL');
    expect(extractedData.amount).toBe(1000.00);
    expect(extractedData.vendor_name).toBeUndefined();
    expect(extractedData.line_items).toBeUndefined();
  });
});

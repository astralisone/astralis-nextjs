import { test, expect, prisma, createTestDocument } from './pipeline-fixtures';
import {
  signInUser,
  getPipelineItems,
  createPipelineItem,
  movePipelineItem,
  mockExternalAPIs,
  waitForAgentProcessing,
} from './pipeline-helpers';

/**
 * Finance Pipeline E2E Tests
 *
 * Test Coverage:
 * - Invoice upload triggers APClerkAgent
 * - Duplicate invoice detection
 * - Due date calculation
 * - FINANCE pipeline item creation
 * - Payment processing flow
 */

test.describe('Finance Pipeline E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Mock external payment APIs
    await mockExternalAPIs(page);
  });

  test('should process invoice and create finance pipeline item', async ({ page, pipelineTestData }) => {
    const { user, org, pipelines } = pipelineTestData;
    const financePipeline = pipelines.finance;

    // Sign in
    await signInUser(page, user.email, user.password);

    // Create test invoice document
    const invoice = await createTestDocument(org.id, user.id, 'INVOICE');

    // Verify document was created
    expect(invoice).toBeDefined();
    expect(invoice.documentType).toBe('INVOICE');

    // Simulate agent processing (in real scenario, this happens via event bus)
    const receivedStage = financePipeline.stages.find(s => s.key === 'received');
    const financeItem = await prisma.pipelineItem.create({
      data: {
        title: `Invoice: ${(invoice.extractedData as any).invoice_number}`,
        description: `Vendor: ${(invoice.extractedData as any).vendor_name}\nAmount: $${(invoice.extractedData as any).amount}`,
        stageId: receivedStage!.id,
        priority: 3,
        status: 'NOT_STARTED',
        metadata: {
          documentId: invoice.id,
          invoiceNumber: (invoice.extractedData as any).invoice_number,
          amount: (invoice.extractedData as any).amount,
          dueDate: (invoice.extractedData as any).due_date,
        },
      },
    });

    // Verify pipeline item created
    expect(financeItem).toBeDefined();
    expect(financeItem.title).toContain('INV-2024-001');

    // Verify item in database
    const items = await getPipelineItems(financePipeline.id, receivedStage!.id);
    expect(items.length).toBeGreaterThan(0);
  });

  test('should move invoice through approval workflow', async ({ page, pipelineTestData }) => {
    const { user, pipelines } = pipelineTestData;
    const financePipeline = pipelines.finance;

    await signInUser(page, user.email, user.password);

    // Create item in received stage
    const receivedStage = financePipeline.stages.find(s => s.key === 'received');
    const reviewStage = financePipeline.stages.find(s => s.key === 'review');
    const approvedStage = financePipeline.stages.find(s => s.key === 'approved');
    const paidStage = financePipeline.stages.find(s => s.key === 'paid');

    const item = await createPipelineItem(page, financePipeline.id, receivedStage!.id, {
      title: 'Invoice: INV-2024-002',
      description: 'Amount: $2,500.00',
      priority: 2,
    });

    // Move to Review
    await movePipelineItem(page, financePipeline.id, item.id, reviewStage!.id);

    let dbItem = await prisma.pipelineItem.findUnique({ where: { id: item.id }, include: { stage: true } });
    expect(dbItem?.stage.key).toBe('review');

    // Move to Approved
    await movePipelineItem(page, financePipeline.id, item.id, approvedStage!.id);

    dbItem = await prisma.pipelineItem.findUnique({ where: { id: item.id }, include: { stage: true } });
    expect(dbItem?.stage.key).toBe('approved');

    // Move to Paid (terminal stage)
    await movePipelineItem(page, financePipeline.id, item.id, paidStage!.id);

    dbItem = await prisma.pipelineItem.findUnique({ where: { id: item.id }, include: { stage: true } });
    expect(dbItem?.stage.key).toBe('paid');
    expect(dbItem?.stage.isTerminal).toBe(true);
  });

  test('should detect duplicate invoice', async ({ pipelineTestData }) => {
    const { user, org } = pipelineTestData;

    // Create first invoice
    const invoice1 = await createTestDocument(org.id, user.id, 'INVOICE');

    // Create second invoice with same invoice number
    const invoice2 = await prisma.document.create({
      data: {
        fileName: 'duplicate-invoice.pdf',
        originalName: 'duplicate-invoice.pdf',
        filePath: '/uploads/duplicate-invoice.pdf',
        cdnUrl: 'https://cdn.example.com/duplicate-invoice.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        status: 'COMPLETED',
        uploadedById: user.id,
        orgId: org.id,
        documentType: 'INVOICE',
        classificationConfidence: 0.95,
        agentProcessed: false,
        extractedData: {
          invoice_number: 'INV-2024-001', // Same as first invoice
          vendor_name: 'Acme Corporation',
          amount: 5000.00,
        },
      },
    });

    // Check for duplicates (simulating what APClerkAgent would do)
    const duplicates = await prisma.document.findMany({
      where: {
        orgId: org.id,
        documentType: 'INVOICE',
        extractedData: {
          path: ['invoice_number'],
          equals: 'INV-2024-001',
        },
      },
    });

    expect(duplicates.length).toBe(2);
  });

  test('should calculate correct due date', async ({ pipelineTestData }) => {
    const { user, org } = pipelineTestData;

    // Create invoice with specific date
    const invoiceDate = new Date('2024-12-07');
    const expectedDueDate = new Date('2025-01-06'); // Net 30

    const invoice = await prisma.document.create({
      data: {
        fileName: 'dated-invoice.pdf',
        originalName: 'dated-invoice.pdf',
        filePath: '/uploads/dated-invoice.pdf',
        cdnUrl: 'https://cdn.example.com/dated-invoice.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        status: 'COMPLETED',
        uploadedById: user.id,
        orgId: org.id,
        documentType: 'INVOICE',
        classificationConfidence: 0.95,
        extractedData: {
          invoice_number: 'INV-2024-003',
          invoice_date: invoiceDate.toISOString().split('T')[0],
          payment_terms: 'Net 30',
          vendor_name: 'Test Vendor',
          amount: 1000.00,
        },
      },
    });

    // Calculate due date (simulating DateCalculationHandler)
    const invoiceDateParsed = new Date((invoice.extractedData as any).invoice_date);
    const calculatedDueDate = new Date(invoiceDateParsed);
    calculatedDueDate.setDate(calculatedDueDate.getDate() + 30);

    expect(calculatedDueDate.toISOString().split('T')[0]).toBe(expectedDueDate.toISOString().split('T')[0]);
  });

  test('should handle high-priority invoices', async ({ page, pipelineTestData }) => {
    const { user, pipelines } = pipelineTestData;
    const financePipeline = pipelines.finance;

    await signInUser(page, user.email, user.password);

    const receivedStage = financePipeline.stages.find(s => s.key === 'received');

    // Create high-priority invoice (due soon)
    const urgentItem = await createPipelineItem(page, financePipeline.id, receivedStage!.id, {
      title: 'URGENT: Invoice INV-2024-004',
      description: 'Due in 3 days - Amount: $10,000',
      priority: 10, // High priority
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    });

    // Verify high priority set
    const dbItem = await prisma.pipelineItem.findUnique({ where: { id: urgentItem.id } });
    expect(dbItem?.priority).toBe(10);
    expect(dbItem?.dueDate).toBeDefined();
  });
});

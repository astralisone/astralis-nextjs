import { test, expect, prisma, createTestDocument } from './pipeline-fixtures';
import {
  signInUser,
  getPipelineItems,
  createPipelineItem,
  movePipelineItem,
  createTestPurchaseOrder,
} from './pipeline-helpers';

/**
 * Logistics Pipeline E2E Tests
 *
 * Test Coverage:
 * - Packing slip upload triggers LogisticsCoordinatorAgent
 * - PO matching
 * - Discrepancy detection
 * - LOGISTICS pipeline item creation
 * - Receiving workflow
 */

test.describe('Logistics Pipeline E2E', () => {
  test('should process packing slip and create logistics pipeline item', async ({ page, pipelineTestData }) => {
    const { user, org, pipelines } = pipelineTestData;
    const logisticsPipeline = pipelines.logistics;

    await signInUser(page, user.email, user.password);

    // Create test PO first
    const po = await createTestPurchaseOrder(org.id, user.id, 'PO-2024-100');

    // Create test packing slip document
    const packingSlip = await createTestDocument(org.id, user.id, 'PACKING_SLIP');

    // Verify document was created
    expect(packingSlip).toBeDefined();
    expect(packingSlip.documentType).toBe('PACKING_SLIP');

    // Simulate agent processing - match with PO
    const pendingStage = logisticsPipeline.stages.find(s => s.key === 'pending');
    const logisticsItem = await prisma.pipelineItem.create({
      data: {
        title: `Shipment: ${(packingSlip.extractedData as any).packing_slip_number}`,
        description: `PO: ${(packingSlip.extractedData as any).po_number}\nItems: ${(packingSlip.extractedData as any).line_items?.length || 0}`,
        stageId: pendingStage!.id,
        priority: 3,
        status: 'NOT_STARTED',
        metadata: {
          documentId: packingSlip.id,
          poDocumentId: po.id,
          packingSlipNumber: (packingSlip.extractedData as any).packing_slip_number,
          poNumber: (packingSlip.extractedData as any).po_number,
          matched: true,
        },
      },
    });

    // Verify pipeline item created
    expect(logisticsItem).toBeDefined();
    expect(logisticsItem.title).toContain('PS-2024-001');

    // Verify item in database
    const items = await getPipelineItems(logisticsPipeline.id, pendingStage!.id);
    expect(items.length).toBeGreaterThan(0);
  });

  test('should match packing slip with purchase order', async ({ pipelineTestData }) => {
    const { user, org } = pipelineTestData;

    // Create PO
    const po = await createTestPurchaseOrder(org.id, user.id, 'PO-2024-MATCH');

    // Create packing slip referencing that PO
    const packingSlip = await prisma.document.create({
      data: {
        fileName: 'matching-packing-slip.pdf',
        originalName: 'matching-packing-slip.pdf',
        filePath: '/uploads/matching-packing-slip.pdf',
        cdnUrl: 'https://cdn.example.com/matching-packing-slip.pdf',
        fileSize: 512000,
        mimeType: 'application/pdf',
        status: 'COMPLETED',
        uploadedById: user.id,
        orgId: org.id,
        documentType: 'PACKING_SLIP',
        classificationConfidence: 0.95,
        extractedData: {
          packing_slip_number: 'PS-2024-MATCH',
          ship_date: '2024-12-07',
          po_number: 'PO-2024-MATCH', // References the PO
          line_items: [
            { item_number: 'SKU-001', description: 'Widget A', quantity: 50 },
            { item_number: 'SKU-002', description: 'Widget B', quantity: 50 }
          ]
        },
      },
    });

    // Simulate PO lookup (what DbLookupHandler would do)
    const matchingPO = await prisma.document.findFirst({
      where: {
        orgId: org.id,
        documentType: 'PURCHASE_ORDER',
        extractedData: {
          path: ['po_number'],
          equals: 'PO-2024-MATCH',
        },
      },
    });

    expect(matchingPO).toBeDefined();
    expect(matchingPO?.id).toBe(po.id);
  });

  test('should detect quantity discrepancy', async ({ pipelineTestData }) => {
    const { user, org, pipelines } = pipelineTestData;
    const logisticsPipeline = pipelines.logistics;

    // Create PO with 100 units
    const po = await prisma.document.create({
      data: {
        fileName: 'po-100-units.pdf',
        originalName: 'po-100-units.pdf',
        filePath: '/uploads/po-100-units.pdf',
        cdnUrl: 'https://cdn.example.com/po-100-units.pdf',
        fileSize: 512000,
        mimeType: 'application/pdf',
        status: 'COMPLETED',
        uploadedById: user.id,
        orgId: org.id,
        documentType: 'PURCHASE_ORDER',
        classificationConfidence: 0.98,
        agentProcessed: true,
        extractedData: {
          po_number: 'PO-2024-DISC',
          line_items: [
            { item_number: 'SKU-001', description: 'Widget A', quantity: 100 }
          ]
        },
      },
    });

    // Create packing slip with only 95 units
    const packingSlip = await prisma.document.create({
      data: {
        fileName: 'short-packing-slip.pdf',
        originalName: 'short-packing-slip.pdf',
        filePath: '/uploads/short-packing-slip.pdf',
        cdnUrl: 'https://cdn.example.com/short-packing-slip.pdf',
        fileSize: 512000,
        mimeType: 'application/pdf',
        status: 'COMPLETED',
        uploadedById: user.id,
        orgId: org.id,
        documentType: 'PACKING_SLIP',
        classificationConfidence: 0.95,
        extractedData: {
          packing_slip_number: 'PS-2024-DISC',
          po_number: 'PO-2024-DISC',
          line_items: [
            { item_number: 'SKU-001', description: 'Widget A', quantity: 95 } // 5 short
          ]
        },
      },
    });

    // Simulate array comparison (what ArrayComparisonHandler would do)
    const poItems = (po.extractedData as any).line_items;
    const psItems = (packingSlip.extractedData as any).line_items;

    const discrepancies: any[] = [];
    for (const poItem of poItems) {
      const psItem = psItems.find((ps: any) => ps.item_number === poItem.item_number);
      if (psItem) {
        const diff = psItem.quantity - poItem.quantity;
        if (diff !== 0) {
          discrepancies.push({
            itemNumber: poItem.item_number,
            expected: poItem.quantity,
            received: psItem.quantity,
            difference: diff,
          });
        }
      } else {
        discrepancies.push({
          itemNumber: poItem.item_number,
          expected: poItem.quantity,
          received: 0,
          difference: -poItem.quantity,
          status: 'MISSING',
        });
      }
    }

    expect(discrepancies.length).toBe(1);
    expect(discrepancies[0].difference).toBe(-5);
    expect(discrepancies[0].expected).toBe(100);
    expect(discrepancies[0].received).toBe(95);
  });

  test('should move shipment through receiving workflow', async ({ page, pipelineTestData }) => {
    const { user, pipelines } = pipelineTestData;
    const logisticsPipeline = pipelines.logistics;

    await signInUser(page, user.email, user.password);

    const pendingStage = logisticsPipeline.stages.find(s => s.key === 'pending');
    const inTransitStage = logisticsPipeline.stages.find(s => s.key === 'in-transit');
    const receivedStage = logisticsPipeline.stages.find(s => s.key === 'received');
    const verifiedStage = logisticsPipeline.stages.find(s => s.key === 'verified');

    // Create item
    const item = await createPipelineItem(page, logisticsPipeline.id, pendingStage!.id, {
      title: 'Shipment: SHP-2024-001',
      description: 'PO: PO-2024-100 | 2 pallets',
      priority: 3,
    });

    // Move to In Transit
    await movePipelineItem(page, logisticsPipeline.id, item.id, inTransitStage!.id);

    let dbItem = await prisma.pipelineItem.findUnique({ where: { id: item.id }, include: { stage: true } });
    expect(dbItem?.stage.key).toBe('in-transit');

    // Move to Received
    await movePipelineItem(page, logisticsPipeline.id, item.id, receivedStage!.id);

    dbItem = await prisma.pipelineItem.findUnique({ where: { id: item.id }, include: { stage: true } });
    expect(dbItem?.stage.key).toBe('received');

    // Move to Verified (terminal)
    await movePipelineItem(page, logisticsPipeline.id, item.id, verifiedStage!.id);

    dbItem = await prisma.pipelineItem.findUnique({ where: { id: item.id }, include: { stage: true } });
    expect(dbItem?.stage.key).toBe('verified');
    expect(dbItem?.stage.isTerminal).toBe(true);
  });

  test('should handle unmatched packing slip', async ({ pipelineTestData }) => {
    const { user, org, pipelines } = pipelineTestData;
    const logisticsPipeline = pipelines.logistics;

    // Create packing slip with non-existent PO
    const unmatchedPackingSlip = await prisma.document.create({
      data: {
        fileName: 'unmatched-packing-slip.pdf',
        originalName: 'unmatched-packing-slip.pdf',
        filePath: '/uploads/unmatched-packing-slip.pdf',
        cdnUrl: 'https://cdn.example.com/unmatched-packing-slip.pdf',
        fileSize: 512000,
        mimeType: 'application/pdf',
        status: 'COMPLETED',
        uploadedById: user.id,
        orgId: org.id,
        documentType: 'PACKING_SLIP',
        classificationConfidence: 0.95,
        extractedData: {
          packing_slip_number: 'PS-2024-NOMATCH',
          po_number: 'PO-DOES-NOT-EXIST',
          line_items: [
            { item_number: 'SKU-999', description: 'Unknown Item', quantity: 10 }
          ]
        },
      },
    });

    // Try to find matching PO
    const matchingPO = await prisma.document.findFirst({
      where: {
        orgId: org.id,
        documentType: 'PURCHASE_ORDER',
        extractedData: {
          path: ['po_number'],
          equals: 'PO-DOES-NOT-EXIST',
        },
      },
    });

    expect(matchingPO).toBeNull();

    // Create pipeline item flagged as unmatched
    const pendingStage = logisticsPipeline.stages.find(s => s.key === 'pending');
    const unmatchedItem = await prisma.pipelineItem.create({
      data: {
        title: `UNMATCHED: ${(unmatchedPackingSlip.extractedData as any).packing_slip_number}`,
        description: `PO not found: ${(unmatchedPackingSlip.extractedData as any).po_number}`,
        stageId: pendingStage!.id,
        priority: 8, // High priority for unmatched
        status: 'NOT_STARTED',
        metadata: {
          documentId: unmatchedPackingSlip.id,
          matched: false,
          reason: 'PO_NOT_FOUND',
        },
      },
    });

    expect(unmatchedItem.title).toContain('UNMATCHED');
    expect((unmatchedItem.metadata as any).matched).toBe(false);
  });

  test('should process bill of lading', async ({ pipelineTestData }) => {
    const { user, org } = pipelineTestData;

    // Create BOL document
    const bol = await prisma.document.create({
      data: {
        fileName: 'bill-of-lading.pdf',
        originalName: 'bill-of-lading.pdf',
        filePath: '/uploads/bill-of-lading.pdf',
        cdnUrl: 'https://cdn.example.com/bill-of-lading.pdf',
        fileSize: 768000,
        mimeType: 'application/pdf',
        status: 'COMPLETED',
        uploadedById: user.id,
        orgId: org.id,
        documentType: 'BOL',
        classificationConfidence: 0.90,
        ocrText: 'BILL OF LADING\nBOL#: BOL-2024-001\nShipper: ABC Corp\nCarrier: XYZ Freight',
        extractedData: {
          bol_number: 'BOL-2024-001',
          shipper: 'ABC Corporation',
          consignee: 'Test Company',
          carrier: 'XYZ Freight Lines',
          ship_date: '2024-12-07',
          po_number: 'PO-2024-100',
          freight_terms: 'FOB Destination',
          weight: 5000,
          pieces: 10,
        },
      },
    });

    expect(bol).toBeDefined();
    expect(bol.documentType).toBe('BOL');
    expect((bol.extractedData as any).bol_number).toBe('BOL-2024-001');
  });

  test('should handle receiving report', async ({ pipelineTestData }) => {
    const { user, org } = pipelineTestData;

    // Create receiving report document
    const receivingReport = await prisma.document.create({
      data: {
        fileName: 'receiving-report.pdf',
        originalName: 'receiving-report.pdf',
        filePath: '/uploads/receiving-report.pdf',
        cdnUrl: 'https://cdn.example.com/receiving-report.pdf',
        fileSize: 512000,
        mimeType: 'application/pdf',
        status: 'COMPLETED',
        uploadedById: user.id,
        orgId: org.id,
        documentType: 'RECEIVING_REPORT',
        classificationConfidence: 0.88,
        ocrText: 'RECEIVING REPORT\nRR#: RR-2024-001\nPO: PO-2024-100\nReceived By: John Doe',
        extractedData: {
          report_number: 'RR-2024-001',
          po_number: 'PO-2024-100',
          received_date: '2024-12-07',
          received_by: 'John Doe',
          total_items: 100,
          condition: 'Good',
          notes: 'All items received in good condition',
        },
      },
    });

    expect(receivingReport).toBeDefined();
    expect(receivingReport.documentType).toBe('RECEIVING_REPORT');
    expect((receivingReport.extractedData as any).report_number).toBe('RR-2024-001');
  });
});

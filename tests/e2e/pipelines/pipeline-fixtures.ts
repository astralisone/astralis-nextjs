import { test as base } from '@playwright/test';
import { PrismaClient, PipelineType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Pipeline Test Fixtures
 *
 * Provides shared test infrastructure for pipeline E2E tests:
 * - createTestOrg: Creates organization with all pipeline types
 * - createTestDocument: Creates test documents for operational agents
 * - cleanupPipelineItems: Cleanup test data after tests
 */

export interface PipelineTestData {
  org: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    email: string;
    password: string;
    name: string;
  };
  pipelines: {
    sales: { id: string; stages: { id: string; key: string; name: string; order: number }[] };
    finance: { id: string; stages: { id: string; key: string; name: string; order: number }[] };
    compliance: { id: string; stages: { id: string; key: string; name: string; order: number }[] };
    logistics: { id: string; stages: { id: string; key: string; name: string; order: number }[] };
  };
}

export interface PipelineFixtures {
  pipelineTestData: PipelineTestData;
}

/**
 * Create test organization with all pipeline types
 */
export async function createTestOrg(): Promise<PipelineTestData> {
  const timestamp = Date.now();
  const orgName = `Test Org ${timestamp}`;
  const userEmail = `test-${timestamp}@test.com`;
  const userPassword = 'TestPass123!';

  // Hash password using bcrypt-like format for NextAuth
  const bcrypt = await import('bcryptjs');
  const hashedPassword = await bcrypt.hash(userPassword, 12);

  // Create organization
  const org = await prisma.organization.create({
    data: {
      name: orgName,
    },
  });

  // Create user
  const user = await prisma.users.create({
    data: {
      email: userEmail,
      name: `Test User ${timestamp}`,
      password: hashedPassword,
      orgId: org.id,
      role: 'ADMIN',
      isActive: true,
      emailVerified: new Date(),
    },
  });

  // Create sales pipeline
  const salesPipeline = await prisma.pipeline.create({
    data: {
      name: 'Sales Pipeline',
      key: `sales-pipeline-${timestamp}`,
      description: 'Test sales pipeline',
      type: PipelineType.SALES,
      orgId: org.id,
      isActive: true,
      stages: {
        create: [
          { key: 'lead', name: 'Lead', order: 1, description: 'New leads', color: '#3B82F6' },
          { key: 'qualified', name: 'Qualified', order: 2, description: 'Qualified leads', color: '#8B5CF6' },
          { key: 'proposal', name: 'Proposal', order: 3, description: 'Proposal sent', color: '#F59E0B' },
          { key: 'negotiation', name: 'Negotiation', order: 4, description: 'In negotiation', color: '#EF4444' },
          { key: 'closed-won', name: 'Closed Won', order: 5, description: 'Deal won', color: '#10B981', isTerminal: true },
        ],
      },
    },
    include: { stages: { orderBy: { order: 'asc' } } },
  });

  // Create finance/AP pipeline
  const financePipeline = await prisma.pipeline.create({
    data: {
      name: 'Finance Pipeline',
      key: `finance-pipeline-${timestamp}`,
      description: 'Test finance pipeline',
      type: PipelineType.FINANCE,
      orgId: org.id,
      isActive: true,
      stages: {
        create: [
          { key: 'received', name: 'Received', order: 1, description: 'Invoice received', color: '#3B82F6' },
          { key: 'review', name: 'Review', order: 2, description: 'Under review', color: '#F59E0B' },
          { key: 'approved', name: 'Approved', order: 3, description: 'Approved for payment', color: '#10B981' },
          { key: 'paid', name: 'Paid', order: 4, description: 'Payment completed', color: '#6366F1', isTerminal: true },
        ],
      },
    },
    include: { stages: { orderBy: { order: 'asc' } } },
  });

  // Create compliance pipeline
  const compliancePipeline = await prisma.pipeline.create({
    data: {
      name: 'Compliance Pipeline',
      key: `compliance-pipeline-${timestamp}`,
      description: 'Test compliance pipeline',
      type: PipelineType.COMPLIANCE,
      orgId: org.id,
      isActive: true,
      stages: {
        create: [
          { key: 'submitted', name: 'Submitted', order: 1, description: 'Document submitted', color: '#3B82F6' },
          { key: 'review', name: 'Review', order: 2, description: 'Under review', color: '#F59E0B' },
          { key: 'approved', name: 'Approved', order: 3, description: 'Approved', color: '#10B981', isTerminal: true },
          { key: 'expired', name: 'Expired', order: 4, description: 'Document expired', color: '#EF4444', isTerminal: true },
        ],
      },
    },
    include: { stages: { orderBy: { order: 'asc' } } },
  });

  // Create logistics pipeline
  const logisticsPipeline = await prisma.pipeline.create({
    data: {
      name: 'Logistics Pipeline',
      key: `logistics-pipeline-${timestamp}`,
      description: 'Test logistics pipeline',
      type: PipelineType.LOGISTICS,
      orgId: org.id,
      isActive: true,
      stages: {
        create: [
          { key: 'pending', name: 'Pending', order: 1, description: 'Shipment pending', color: '#3B82F6' },
          { key: 'in-transit', name: 'In Transit', order: 2, description: 'In transit', color: '#F59E0B' },
          { key: 'received', name: 'Received', order: 3, description: 'Received', color: '#10B981' },
          { key: 'verified', name: 'Verified', order: 4, description: 'Verified', color: '#6366F1', isTerminal: true },
        ],
      },
    },
    include: { stages: { orderBy: { order: 'asc' } } },
  });

  return {
    org: {
      id: org.id,
      name: org.name,
    },
    user: {
      id: user.id,
      email: userEmail,
      password: userPassword,
      name: user.name || '',
    },
    pipelines: {
      sales: { id: salesPipeline.id, stages: salesPipeline.stages },
      finance: { id: financePipeline.id, stages: financePipeline.stages },
      compliance: { id: compliancePipeline.id, stages: compliancePipeline.stages },
      logistics: { id: logisticsPipeline.id, stages: logisticsPipeline.stages },
    },
  };
}

/**
 * Create test document for operational agent testing
 */
export async function createTestDocument(
  orgId: string,
  userId: string,
  type: 'INVOICE' | 'CONTRACT' | 'PACKING_SLIP' | 'PURCHASE_ORDER' = 'INVOICE'
) {
  const timestamp = Date.now();

  const document = await prisma.document.create({
    data: {
      fileName: `test-${type.toLowerCase()}-${timestamp}.pdf`,
      originalName: `test-${type.toLowerCase()}-${timestamp}.pdf`,
      filePath: `/uploads/test-${type.toLowerCase()}-${timestamp}.pdf`,
      cdnUrl: `https://cdn.example.com/test-${type.toLowerCase()}-${timestamp}.pdf`,
      fileSize: 1024000,
      mimeType: 'application/pdf',
      status: 'COMPLETED',
      uploadedById: userId,
      orgId: orgId,
      documentType: type,
      classificationConfidence: 0.95,
      agentProcessed: false,
      ocrText: getSampleOCRText(type),
      extractedData: getSampleExtractedData(type),
      ocrConfidence: 0.92,
      processedAt: new Date(),
    },
  });

  return document;
}

function getSampleOCRText(type: string): string {
  const samples: Record<string, string> = {
    INVOICE: 'INVOICE #INV-2024-001\nDate: 2024-12-07\nDue Date: 2025-01-07\nAmount: $5,000.00\nVendor: Acme Corp',
    CONTRACT: 'SERVICE AGREEMENT\nEffective: 2024-12-07\nExpiration: 2025-12-07\nParties: Company A and Company B',
    PACKING_SLIP: 'PACKING SLIP #PS-2024-001\nDate: 2024-12-07\nPO: PO-2024-100\nItems: 100 units',
    PURCHASE_ORDER: 'PURCHASE ORDER #PO-2024-100\nDate: 2024-12-01\nVendor: Supplier Inc\nTotal: $1,350.00',
  };
  return samples[type] || 'Sample document text';
}

function getSampleExtractedData(type: string): Record<string, unknown> {
  const samples: Record<string, Record<string, unknown>> = {
    INVOICE: {
      invoice_number: 'INV-2024-001',
      invoice_date: '2024-12-07',
      due_date: '2025-01-07',
      vendor_name: 'Acme Corporation',
      amount: 5000.00,
      line_items: [
        { description: 'Professional Services', quantity: 10, unit_price: 500 }
      ]
    },
    CONTRACT: {
      contract_number: 'CNT-2024-001',
      effective_date: '2024-12-07',
      expiration_date: '2025-12-07',
      parties: ['Company A', 'Company B'],
      auto_renewal: true,
    },
    PACKING_SLIP: {
      packing_slip_number: 'PS-2024-001',
      ship_date: '2024-12-07',
      po_number: 'PO-2024-100',
      line_items: [
        { item_number: 'SKU-001', description: 'Widget A', quantity: 50 },
        { item_number: 'SKU-002', description: 'Widget B', quantity: 50 }
      ]
    },
    PURCHASE_ORDER: {
      po_number: 'PO-2024-100',
      order_date: '2024-12-01',
      vendor: 'Supplier Inc',
      total_amount: 1350.00,
      line_items: [
        { item_number: 'SKU-001', description: 'Widget A', quantity: 50, unit_price: 15 },
        { item_number: 'SKU-002', description: 'Widget B', quantity: 50, unit_price: 12 }
      ]
    },
  };
  return samples[type] || {};
}

export async function cleanupPipelineItems(pipelineId: string) {
  const stages = await prisma.pipelineStage.findMany({
    where: { pipelineId },
    select: { id: true },
  });

  for (const stage of stages) {
    await prisma.pipelineItem.deleteMany({
      where: { stageId: stage.id },
    });
  }
}

export async function cleanupTestOrg(orgId: string) {
  // Delete in correct order to avoid foreign key constraints
  const pipelines = await prisma.pipeline.findMany({
    where: { orgId },
    include: { stages: true },
  });

  for (const pipeline of pipelines) {
    for (const stage of pipeline.stages) {
      await prisma.pipelineItem.deleteMany({ where: { stageId: stage.id } });
    }
    await prisma.pipelineStage.deleteMany({ where: { pipelineId: pipeline.id } });
  }

  await prisma.pipeline.deleteMany({ where: { orgId } });
  await prisma.schedulingEvent.deleteMany({ where: { orgId } });
  await prisma.document.deleteMany({ where: { orgId } });
  await prisma.activityLog.deleteMany({ where: { orgId } });
  await prisma.intakeRequest.deleteMany({ where: { orgId } });

  const users = await prisma.users.findMany({ where: { orgId } });
  for (const user of users) {
    await prisma.session.deleteMany({ where: { userId: user.id } });
  }

  await prisma.users.deleteMany({ where: { orgId } });
  await prisma.organization.delete({ where: { id: orgId } });
}

export const test = base.extend<PipelineFixtures>({
  pipelineTestData: async ({}, use) => {
    const testData = await createTestOrg();
    await use(testData);
    await cleanupTestOrg(testData.org.id);
  },
});

export { expect } from '@playwright/test';
export { prisma };

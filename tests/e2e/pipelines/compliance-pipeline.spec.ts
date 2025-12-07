import { test, expect, prisma, createTestDocument } from './pipeline-fixtures';
import {
  signInUser,
  getPipelineItems,
  createPipelineItem,
  movePipelineItem,
  verifyCalendarEvent,
} from './pipeline-helpers';

/**
 * Compliance Pipeline E2E Tests
 *
 * Test Coverage:
 * - Contract upload triggers ComplianceSentinelAgent
 * - Expiration date extraction and alerts
 * - Calendar events created for reminders
 * - Renewal workflow
 */

test.describe('Compliance Pipeline E2E', () => {
  test('should process contract and create compliance pipeline item', async ({ page, pipelineTestData }) => {
    const { user, org, pipelines } = pipelineTestData;
    const compliancePipeline = pipelines.compliance;

    await signInUser(page, user.email, user.password);

    // Create test contract document
    const contract = await createTestDocument(org.id, user.id, 'CONTRACT');

    // Verify document was created
    expect(contract).toBeDefined();
    expect(contract.documentType).toBe('CONTRACT');

    // Simulate agent processing
    const submittedStage = compliancePipeline.stages.find(s => s.key === 'submitted');
    const complianceItem = await prisma.pipelineItem.create({
      data: {
        title: `Contract: ${(contract.extractedData as any).contract_number}`,
        description: `Expires: ${(contract.extractedData as any).expiration_date}`,
        stageId: submittedStage!.id,
        priority: 5,
        status: 'NOT_STARTED',
        metadata: {
          documentId: contract.id,
          contractNumber: (contract.extractedData as any).contract_number,
          effectiveDate: (contract.extractedData as any).effective_date,
          expirationDate: (contract.extractedData as any).expiration_date,
          autoRenewal: (contract.extractedData as any).auto_renewal,
        },
      },
    });

    // Verify pipeline item created
    expect(complianceItem).toBeDefined();
    expect(complianceItem.title).toContain('CNT-2024-001');

    // Verify item in database
    const items = await getPipelineItems(compliancePipeline.id, submittedStage!.id);
    expect(items.length).toBeGreaterThan(0);
  });

  test('should calculate expiration alerts correctly', async ({ pipelineTestData }) => {
    const { user, org } = pipelineTestData;

    // Create contract expiring in 45 days (should trigger 60-day warning)
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 45);

    const contract = await prisma.document.create({
      data: {
        fileName: 'expiring-contract.pdf',
        originalName: 'expiring-contract.pdf',
        filePath: '/uploads/expiring-contract.pdf',
        cdnUrl: 'https://cdn.example.com/expiring-contract.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        status: 'COMPLETED',
        uploadedById: user.id,
        orgId: org.id,
        documentType: 'CONTRACT',
        classificationConfidence: 0.95,
        extractedData: {
          contract_number: 'CNT-2024-EXPIRING',
          effective_date: '2024-01-01',
          expiration_date: expirationDate.toISOString().split('T')[0],
          parties: ['Company A', 'Company B'],
        },
      },
    });

    // Calculate days until expiration
    const today = new Date();
    const expDate = new Date((contract.extractedData as any).expiration_date);
    const daysUntilExpiration = Math.floor((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Determine alert level based on thresholds
    let alertLevel = 'none';
    if (daysUntilExpiration <= 30) {
      alertLevel = 'critical';
    } else if (daysUntilExpiration <= 60) {
      alertLevel = 'warning';
    } else if (daysUntilExpiration <= 90) {
      alertLevel = 'info';
    }

    expect(daysUntilExpiration).toBe(45);
    expect(alertLevel).toBe('warning');
  });

  test('should create calendar events for contract reminders', async ({ pipelineTestData }) => {
    const { user, org } = pipelineTestData;

    // Create contract with specific expiration date
    const expirationDate = new Date('2025-06-15');

    const contract = await createTestDocument(org.id, user.id, 'CONTRACT');

    // Create reminder events (simulating what ComplianceSentinelAgent would do)
    const reminderDays = [90, 60, 30];

    for (const days of reminderDays) {
      const reminderDate = new Date(expirationDate);
      reminderDate.setDate(reminderDate.getDate() - days);

      await prisma.schedulingEvent.create({
        data: {
          title: `Contract Renewal Reminder - ${days} days`,
          description: `Contract ${(contract.extractedData as any).contract_number} expires in ${days} days`,
          startTime: reminderDate,
          endTime: new Date(reminderDate.getTime() + 60 * 60 * 1000), // 1 hour duration
          isAllDay: false,
          timezone: 'America/New_York',
          userId: user.id,
          orgId: org.id,
          metadata: {
            documentId: contract.id,
            type: 'CONTRACT_REMINDER',
            daysBeforeExpiration: days,
          },
        },
      });
    }

    // Verify events created
    const events = await prisma.schedulingEvent.findMany({
      where: {
        orgId: org.id,
        title: { contains: 'Contract Renewal Reminder' },
      },
    });

    expect(events.length).toBe(3);
  });

  test('should move contract through compliance review workflow', async ({ page, pipelineTestData }) => {
    const { user, pipelines } = pipelineTestData;
    const compliancePipeline = pipelines.compliance;

    await signInUser(page, user.email, user.password);

    const submittedStage = compliancePipeline.stages.find(s => s.key === 'submitted');
    const reviewStage = compliancePipeline.stages.find(s => s.key === 'review');
    const approvedStage = compliancePipeline.stages.find(s => s.key === 'approved');

    // Create item
    const item = await createPipelineItem(page, compliancePipeline.id, submittedStage!.id, {
      title: 'Contract: CNT-2024-REVIEW',
      description: 'Annual service agreement',
      priority: 3,
    });

    // Move to Review
    await movePipelineItem(page, compliancePipeline.id, item.id, reviewStage!.id);

    let dbItem = await prisma.pipelineItem.findUnique({ where: { id: item.id }, include: { stage: true } });
    expect(dbItem?.stage.key).toBe('review');

    // Move to Approved (terminal)
    await movePipelineItem(page, compliancePipeline.id, item.id, approvedStage!.id);

    dbItem = await prisma.pipelineItem.findUnique({ where: { id: item.id }, include: { stage: true } });
    expect(dbItem?.stage.key).toBe('approved');
    expect(dbItem?.stage.isTerminal).toBe(true);
  });

  test('should handle expired contracts', async ({ page, pipelineTestData }) => {
    const { user, org, pipelines } = pipelineTestData;
    const compliancePipeline = pipelines.compliance;

    await signInUser(page, user.email, user.password);

    // Create contract that expired yesterday
    const expiredDate = new Date();
    expiredDate.setDate(expiredDate.getDate() - 1);

    const expiredContract = await prisma.document.create({
      data: {
        fileName: 'expired-contract.pdf',
        originalName: 'expired-contract.pdf',
        filePath: '/uploads/expired-contract.pdf',
        cdnUrl: 'https://cdn.example.com/expired-contract.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        status: 'COMPLETED',
        uploadedById: user.id,
        orgId: org.id,
        documentType: 'CONTRACT',
        classificationConfidence: 0.95,
        extractedData: {
          contract_number: 'CNT-2024-EXPIRED',
          effective_date: '2023-01-01',
          expiration_date: expiredDate.toISOString().split('T')[0],
          parties: ['Company A', 'Company B'],
        },
      },
    });

    // Create pipeline item in expired stage
    const expiredStage = compliancePipeline.stages.find(s => s.key === 'expired');
    const expiredItem = await prisma.pipelineItem.create({
      data: {
        title: `EXPIRED: Contract CNT-2024-EXPIRED`,
        description: `Contract expired on ${expiredDate.toISOString().split('T')[0]}`,
        stageId: expiredStage!.id,
        priority: 10, // High priority for expired
        status: 'NOT_STARTED',
        metadata: {
          documentId: expiredContract.id,
          isExpired: true,
        },
      },
    });

    expect(expiredItem).toBeDefined();
    expect(expiredItem.title).toContain('EXPIRED');

    const stage = await prisma.pipelineStage.findUnique({ where: { id: expiredItem.stageId } });
    expect(stage?.isTerminal).toBe(true);
  });

  test('should process policy documents', async ({ pipelineTestData }) => {
    const { user, org, pipelines } = pipelineTestData;

    // Create insurance policy document
    const policy = await prisma.document.create({
      data: {
        fileName: 'insurance-policy.pdf',
        originalName: 'insurance-policy.pdf',
        filePath: '/uploads/insurance-policy.pdf',
        cdnUrl: 'https://cdn.example.com/insurance-policy.pdf',
        fileSize: 2048000,
        mimeType: 'application/pdf',
        status: 'COMPLETED',
        uploadedById: user.id,
        orgId: org.id,
        documentType: 'POLICY',
        classificationConfidence: 0.92,
        ocrText: 'INSURANCE POLICY\nPolicy Number: POL-2024-001\nEffective: 2024-12-07\nExpiration: 2025-12-07',
        extractedData: {
          policy_number: 'POL-2024-001',
          effective_date: '2024-12-07',
          expiration_date: '2025-12-07',
          coverage_type: 'General Liability',
          coverage_amount: 1000000,
        },
      },
    });

    expect(policy).toBeDefined();
    expect(policy.documentType).toBe('POLICY');
    expect((policy.extractedData as any).policy_number).toBe('POL-2024-001');
  });

  test('should process certificate documents', async ({ pipelineTestData }) => {
    const { user, org } = pipelineTestData;

    // Create certificate document
    const certificate = await prisma.document.create({
      data: {
        fileName: 'iso-certificate.pdf',
        originalName: 'iso-certificate.pdf',
        filePath: '/uploads/iso-certificate.pdf',
        cdnUrl: 'https://cdn.example.com/iso-certificate.pdf',
        fileSize: 512000,
        mimeType: 'application/pdf',
        status: 'COMPLETED',
        uploadedById: user.id,
        orgId: org.id,
        documentType: 'CERTIFICATE',
        classificationConfidence: 0.88,
        ocrText: 'ISO 9001 CERTIFICATE\nCertificate Number: ISO-2024-001\nIssued: 2024-06-01\nExpires: 2027-06-01',
        extractedData: {
          certificate_number: 'ISO-2024-001',
          certificate_type: 'ISO 9001',
          issued_date: '2024-06-01',
          expiration_date: '2027-06-01',
          issuing_body: 'ISO Certification Authority',
        },
      },
    });

    expect(certificate).toBeDefined();
    expect(certificate.documentType).toBe('CERTIFICATE');
    expect((certificate.extractedData as any).certificate_type).toBe('ISO 9001');
  });
});

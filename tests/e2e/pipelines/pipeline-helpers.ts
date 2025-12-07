import { Page, expect } from '@playwright/test';
import { prisma } from './pipeline-fixtures';

/**
 * Pipeline Test Helpers
 *
 * Utility functions for pipeline E2E testing:
 * - uploadAndProcess: Upload document and wait for processing
 * - getPipelineItems: Get items from specific pipeline
 * - dragToStage: Drag pipeline item to a new stage
 * - waitForAgentProcessing: Wait for operational agents to complete
 */

/**
 * Sign in helper for pipeline tests
 */
export async function signInUser(page: Page, email: string, password: string) {
  await page.goto('/auth/signin');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|pipelines)/, { timeout: 15000 });
}

/**
 * Upload document and wait for processing
 */
export async function uploadAndProcess(
  page: Page,
  filePath: string,
  expectedType?: string
): Promise<string> {
  // Navigate to documents page
  await page.goto('/documents');

  // Click upload button
  const uploadButton = page.getByRole('button', { name: /upload/i });
  await uploadButton.click();

  // Upload file
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(filePath);

  // Wait for upload to complete
  await expect(page.getByText(/upload.*complete/i)).toBeVisible({ timeout: 15000 });

  // If expected type provided, verify classification
  if (expectedType) {
    await expect(page.getByText(expectedType)).toBeVisible({ timeout: 5000 });
  }

  // Extract document ID from URL or response
  const documentId = await page.evaluate(() => {
    const urlMatch = window.location.href.match(/documents\/([a-zA-Z0-9]+)/);
    return urlMatch ? urlMatch[1] : null;
  });

  if (!documentId) {
    throw new Error('Failed to extract document ID');
  }

  return documentId;
}

/**
 * Get pipeline items via database
 */
export async function getPipelineItems(pipelineId: string, stageId?: string) {
  if (stageId) {
    return await prisma.pipelineItem.findMany({
      where: { stageId },
      include: {
        stage: {
          include: {
            pipeline: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get all stages for this pipeline
  const stages = await prisma.pipelineStage.findMany({
    where: { pipelineId },
    select: { id: true },
  });

  return await prisma.pipelineItem.findMany({
    where: { stageId: { in: stages.map(s => s.id) } },
    include: {
      stage: {
        include: {
          pipeline: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Drag pipeline item to new stage
 */
export async function dragToStage(
  page: Page,
  itemTitle: string,
  targetStageName: string
): Promise<void> {
  // Find the item
  const item = page.locator('[data-testid="pipeline-item"]', {
    hasText: itemTitle,
  }).first();

  // Find the target stage
  const targetStage = page.locator('[data-testid="pipeline-stage"]', {
    hasText: targetStageName,
  }).first();

  // Perform drag and drop
  await item.dragTo(targetStage);

  // Wait for update to complete
  await page.waitForResponse(
    (response) => response.url().includes('/api/pipelines') && response.status() === 200,
    { timeout: 5000 }
  );

  // Verify item moved
  await expect(targetStage.locator(`text=${itemTitle}`)).toBeVisible({ timeout: 3000 });
}

/**
 * Wait for agent processing to complete
 */
export async function waitForAgentProcessing(
  documentId: string,
  maxWaitMs: number = 30000
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitMs) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: { agentProcessed: true, status: true },
    });

    if (document?.agentProcessed && document.status === 'COMPLETED') {
      return true;
    }

    // Wait 1 second before checking again
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return false;
}

/**
 * Verify calendar event was created
 */
export async function verifyCalendarEvent(
  orgId: string,
  titleContains: string,
  expectedDate?: Date
): Promise<boolean> {
  const events = await prisma.schedulingEvent.findMany({
    where: {
      orgId,
      title: { contains: titleContains },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (events.length === 0) {
    return false;
  }

  if (expectedDate) {
    const event = events[0];
    const eventDate = new Date(event.startTime);
    const isSameDay =
      eventDate.getDate() === expectedDate.getDate() &&
      eventDate.getMonth() === expectedDate.getMonth() &&
      eventDate.getFullYear() === expectedDate.getFullYear();

    return isSameDay;
  }

  return true;
}

/**
 * Create pipeline item via API
 */
export async function createPipelineItem(
  page: Page,
  pipelineId: string,
  stageId: string,
  data: {
    title: string;
    description?: string;
    priority?: number;
    dueDate?: Date;
  }
) {
  const response = await page.request.post(
    `/api/pipelines/${pipelineId}/items`,
    {
      data: {
        title: data.title,
        description: data.description,
        stageId,
        priority: data.priority || 0,
        dueDate: data.dueDate?.toISOString(),
        status: 'NOT_STARTED',
      },
    }
  );

  if (!response.ok()) {
    throw new Error(`Failed to create pipeline item: ${response.status()}`);
  }

  return await response.json();
}

/**
 * Move pipeline item to different stage via API
 */
export async function movePipelineItem(
  page: Page,
  pipelineId: string,
  itemId: string,
  newStageId: string
) {
  const response = await page.request.post(
    `/api/pipelines/${pipelineId}/items/${itemId}/move`,
    {
      data: {
        newStageId,
      },
    }
  );

  if (!response.ok()) {
    throw new Error(`Failed to move pipeline item: ${response.status()}`);
  }

  return await response.json();
}

/**
 * Navigate to pipeline page
 */
export async function navigateToPipeline(page: Page, pipelineName: string) {
  await page.goto('/pipelines');

  // Click on pipeline card or link
  const pipelineLink = page.locator('a', { hasText: pipelineName }).first();
  await pipelineLink.click();

  // Wait for pipeline board to load
  await expect(page.locator('[data-testid="pipeline-board"]')).toBeVisible({ timeout: 5000 });
}

/**
 * Mock external API calls
 */
export async function mockExternalAPIs(page: Page) {
  // Mock QuickBooks API
  await page.route('**/api/external/quickbooks/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Mocked QuickBooks response' }),
    });
  });

  // Mock other external APIs
  await page.route('**/api/external/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });
}

/**
 * Get pipeline by type
 */
export async function getPipelineByType(orgId: string, type: string) {
  return await prisma.pipeline.findFirst({
    where: { orgId, type: type as any },
    include: { stages: { orderBy: { order: 'asc' } } },
  });
}

/**
 * Create a test Purchase Order for logistics tests
 */
export async function createTestPurchaseOrder(
  orgId: string,
  userId: string,
  poNumber: string = 'PO-2024-100'
) {
  return await prisma.document.create({
    data: {
      fileName: `${poNumber}.pdf`,
      originalName: `${poNumber}.pdf`,
      filePath: `/uploads/${poNumber}.pdf`,
      cdnUrl: `https://cdn.example.com/${poNumber}.pdf`,
      fileSize: 512000,
      mimeType: 'application/pdf',
      status: 'COMPLETED',
      uploadedById: userId,
      orgId: orgId,
      documentType: 'PURCHASE_ORDER',
      classificationConfidence: 0.98,
      agentProcessed: true,
      agentProcessedAt: new Date(),
      ocrText: `PURCHASE ORDER #${poNumber}\nDate: 2024-12-01\nVendor: Supplier Inc\nTotal: $1,350.00`,
      extractedData: {
        po_number: poNumber,
        order_date: '2024-12-01',
        vendor: 'Supplier Inc',
        total_amount: 1350.00,
        line_items: [
          { item_number: 'SKU-001', description: 'Widget A', quantity: 50, unit_price: 15 },
          { item_number: 'SKU-002', description: 'Widget B', quantity: 50, unit_price: 12 }
        ]
      },
      ocrConfidence: 0.95,
      processedAt: new Date(),
    },
  });
}

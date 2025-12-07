import { test, expect, prisma } from './pipeline-fixtures';
import {
  signInUser,
  getPipelineItems,
  createPipelineItem,
  movePipelineItem,
  navigateToPipeline,
} from './pipeline-helpers';

/**
 * Sales Pipeline E2E Tests
 *
 * Test Coverage:
 * - Lead creation and management
 * - Pipeline stage progression
 * - Deal qualification workflow
 * - Proposal and negotiation stages
 * - Won/Lost terminal states
 */

test.describe('Sales Pipeline E2E', () => {
  test('should create lead and move through sales pipeline', async ({ page, pipelineTestData }) => {
    const { user, pipelines } = pipelineTestData;
    const salesPipeline = pipelines.sales;

    await signInUser(page, user.email, user.password);

    const leadStage = salesPipeline.stages.find(s => s.key === 'lead');
    const qualifiedStage = salesPipeline.stages.find(s => s.key === 'qualified');
    const proposalStage = salesPipeline.stages.find(s => s.key === 'proposal');

    // Create new lead
    const lead = await createPipelineItem(page, salesPipeline.id, leadStage!.id, {
      title: 'Acme Corp - Enterprise Deal',
      description: 'Potential $50k annual contract',
      priority: 5,
    });

    expect(lead).toBeDefined();
    expect(lead.title).toBe('Acme Corp - Enterprise Deal');

    // Move to Qualified
    await movePipelineItem(page, salesPipeline.id, lead.id, qualifiedStage!.id);

    let dbItem = await prisma.pipelineItem.findUnique({ where: { id: lead.id }, include: { stage: true } });
    expect(dbItem?.stage.key).toBe('qualified');

    // Move to Proposal
    await movePipelineItem(page, salesPipeline.id, lead.id, proposalStage!.id);

    dbItem = await prisma.pipelineItem.findUnique({ where: { id: lead.id }, include: { stage: true } });
    expect(dbItem?.stage.key).toBe('proposal');
  });

  test('should complete full sales cycle to closed-won', async ({ page, pipelineTestData }) => {
    const { user, pipelines } = pipelineTestData;
    const salesPipeline = pipelines.sales;

    await signInUser(page, user.email, user.password);

    const leadStage = salesPipeline.stages.find(s => s.key === 'lead');
    const qualifiedStage = salesPipeline.stages.find(s => s.key === 'qualified');
    const proposalStage = salesPipeline.stages.find(s => s.key === 'proposal');
    const negotiationStage = salesPipeline.stages.find(s => s.key === 'negotiation');
    const closedWonStage = salesPipeline.stages.find(s => s.key === 'closed-won');

    // Create lead
    const deal = await createPipelineItem(page, salesPipeline.id, leadStage!.id, {
      title: 'Big Client - Platform License',
      description: 'Annual license deal - $100k value',
      priority: 8,
    });

    // Progress through all stages
    await movePipelineItem(page, salesPipeline.id, deal.id, qualifiedStage!.id);
    await movePipelineItem(page, salesPipeline.id, deal.id, proposalStage!.id);
    await movePipelineItem(page, salesPipeline.id, deal.id, negotiationStage!.id);
    await movePipelineItem(page, salesPipeline.id, deal.id, closedWonStage!.id);

    // Verify final state
    const dbItem = await prisma.pipelineItem.findUnique({
      where: { id: deal.id },
      include: { stage: true }
    });

    expect(dbItem?.stage.key).toBe('closed-won');
    expect(dbItem?.stage.isTerminal).toBe(true);
  });

  test('should track multiple deals in different stages', async ({ page, pipelineTestData }) => {
    const { user, pipelines } = pipelineTestData;
    const salesPipeline = pipelines.sales;

    await signInUser(page, user.email, user.password);

    const leadStage = salesPipeline.stages.find(s => s.key === 'lead');
    const qualifiedStage = salesPipeline.stages.find(s => s.key === 'qualified');
    const proposalStage = salesPipeline.stages.find(s => s.key === 'proposal');

    // Create multiple deals
    const deal1 = await createPipelineItem(page, salesPipeline.id, leadStage!.id, {
      title: 'Deal 1 - Small Business',
      description: '$5k value',
      priority: 2,
    });

    const deal2 = await createPipelineItem(page, salesPipeline.id, qualifiedStage!.id, {
      title: 'Deal 2 - Mid Market',
      description: '$25k value',
      priority: 5,
    });

    const deal3 = await createPipelineItem(page, salesPipeline.id, proposalStage!.id, {
      title: 'Deal 3 - Enterprise',
      description: '$75k value',
      priority: 8,
    });

    // Verify all deals exist in correct stages
    const leadItems = await getPipelineItems(salesPipeline.id, leadStage!.id);
    const qualifiedItems = await getPipelineItems(salesPipeline.id, qualifiedStage!.id);
    const proposalItems = await getPipelineItems(salesPipeline.id, proposalStage!.id);

    expect(leadItems.some(item => item.id === deal1.id)).toBe(true);
    expect(qualifiedItems.some(item => item.id === deal2.id)).toBe(true);
    expect(proposalItems.some(item => item.id === deal3.id)).toBe(true);
  });

  test('should handle deal priority correctly', async ({ page, pipelineTestData }) => {
    const { user, pipelines } = pipelineTestData;
    const salesPipeline = pipelines.sales;

    await signInUser(page, user.email, user.password);

    const leadStage = salesPipeline.stages.find(s => s.key === 'lead');

    // Create deals with different priorities
    const lowPriority = await createPipelineItem(page, salesPipeline.id, leadStage!.id, {
      title: 'Low Priority Deal',
      priority: 1,
    });

    const highPriority = await createPipelineItem(page, salesPipeline.id, leadStage!.id, {
      title: 'High Priority Deal',
      priority: 10,
    });

    // Verify priorities
    const lowDb = await prisma.pipelineItem.findUnique({ where: { id: lowPriority.id } });
    const highDb = await prisma.pipelineItem.findUnique({ where: { id: highPriority.id } });

    expect(lowDb?.priority).toBe(1);
    expect(highDb?.priority).toBe(10);
  });

  test('should update deal metadata', async ({ page, pipelineTestData }) => {
    const { user, org, pipelines } = pipelineTestData;
    const salesPipeline = pipelines.sales;

    await signInUser(page, user.email, user.password);

    const leadStage = salesPipeline.stages.find(s => s.key === 'lead');

    // Create deal with metadata
    const deal = await prisma.pipelineItem.create({
      data: {
        title: 'Metadata Test Deal',
        description: 'Testing metadata storage',
        stageId: leadStage!.id,
        priority: 5,
        status: 'NOT_STARTED',
        metadata: {
          dealValue: 50000,
          probability: 0.6,
          source: 'website',
          contactName: 'John Doe',
        },
      },
    });

    expect(deal).toBeDefined();
    expect((deal.metadata as any).dealValue).toBe(50000);
    expect((deal.metadata as any).probability).toBe(0.6);
    expect((deal.metadata as any).source).toBe('website');
  });

  test('should handle deal with due date', async ({ page, pipelineTestData }) => {
    const { user, pipelines } = pipelineTestData;
    const salesPipeline = pipelines.sales;

    await signInUser(page, user.email, user.password);

    const leadStage = salesPipeline.stages.find(s => s.key === 'lead');
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // Due in 2 weeks

    const deal = await createPipelineItem(page, salesPipeline.id, leadStage!.id, {
      title: 'Time-Sensitive Deal',
      description: 'Must close within 2 weeks',
      priority: 9,
      dueDate,
    });

    const dbItem = await prisma.pipelineItem.findUnique({ where: { id: deal.id } });

    expect(dbItem?.dueDate).toBeDefined();
    // Check that due date is approximately 14 days from now
    const daysDiff = Math.floor((new Date(dbItem!.dueDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    expect(daysDiff).toBeGreaterThanOrEqual(13);
    expect(daysDiff).toBeLessThanOrEqual(14);
  });
});

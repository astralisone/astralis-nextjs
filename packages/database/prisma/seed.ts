import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Step 1: Create or find the test user first
  let user = await prisma.users.findUnique({
    where: { email: 'test@astralisone.com' },
  });

  if (!user) {
    console.log('👤 Creating test user...');
    const hashedPassword = await hashPassword('Test123!');
    user = await prisma.users.create({
      data: {
        email: 'test@astralisone.com',
        name: 'Test Admin',
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date(),
      },
    });
    console.log(`✅ Created user: ${user.email} (${user.id})`);
  } else {
    console.log(`✅ Found existing user: ${user.email} (${user.id})`);
    // Ensure user has ADMIN role
    if (user.role !== 'ADMIN') {
      user = await prisma.users.update({
        where: { id: user.id },
        data: { role: 'ADMIN' },
      });
      console.log(`   Updated role to ADMIN`);
    }
  }

  // Step 2: Create or find organization, using user's ID as the org ID for consistency
  let organization = await prisma.organization.findFirst({
    where: { name: 'Test Organization' },
  });

  if (!organization) {
    console.log('📦 Creating Test Organization...');
    organization = await prisma.organization.create({
      data: {
        name: 'Test Organization',
      },
    });
    console.log(`✅ Created organization: ${organization.name} (${organization.id})`);
  } else {
    console.log(`✅ Found existing organization: ${organization.name} (${organization.id})`);
  }

  // Step 3: Link user to organization if not already linked
  if (user.orgId !== organization.id) {
    console.log('🔗 Linking user to organization...');
    user = await prisma.users.update({
      where: { id: user.id },
      data: { orgId: organization.id },
    });
    console.log(`✅ User linked to organization`);
  }

  // Step 4: Initialize default pipelines
  console.log('');
  console.log('🔧 Initializing default pipelines...');

  const pipelineDefinitions = [
    {
      key: 'sales',
      name: 'Sales Pipeline',
      type: 'SALES' as const,
      description: 'Lead acquisition through deal closure',
      stages: [
        { key: 'new_lead', name: 'New Lead', order: 1, color: '#3B82F6', isTerminal: false },
        { key: 'qualified', name: 'Qualified', order: 2, color: '#8B5CF6', isTerminal: false },
        { key: 'proposal_sent', name: 'Proposal Sent', order: 3, color: '#EC4899', isTerminal: false },
        { key: 'negotiation', name: 'Negotiation', order: 4, color: '#F59E0B', isTerminal: false },
        { key: 'closed_won', name: 'Closed Won', order: 5, color: '#10B981', isTerminal: true },
        { key: 'closed_lost', name: 'Closed Lost', order: 6, color: '#EF4444', isTerminal: true },
      ],
    },
    {
      key: 'support',
      name: 'Support Pipeline',
      type: 'SUPPORT' as const,
      description: 'Customer support ticket management',
      stages: [
        { key: 'new_ticket', name: 'New Ticket', order: 1, color: '#3B82F6', isTerminal: false },
        { key: 'triaged', name: 'Triaged', order: 2, color: '#8B5CF6', isTerminal: false },
        { key: 'in_progress', name: 'In Progress', order: 3, color: '#F59E0B', isTerminal: false },
        { key: 'waiting_customer', name: 'Waiting on Customer', order: 4, color: '#EC4899', isTerminal: false },
        { key: 'resolved', name: 'Resolved', order: 5, color: '#10B981', isTerminal: false },
        { key: 'closed', name: 'Closed', order: 6, color: '#6B7280', isTerminal: true },
      ],
    },
    {
      key: 'billing',
      name: 'Billing Pipeline',
      type: 'BILLING' as const,
      description: 'Invoice and payment tracking',
      stages: [
        { key: 'pending_invoice', name: 'Pending Invoice', order: 1, color: '#3B82F6', isTerminal: false },
        { key: 'invoice_sent', name: 'Invoice Sent', order: 2, color: '#8B5CF6', isTerminal: false },
        { key: 'payment_received', name: 'Payment Received', order: 3, color: '#10B981', isTerminal: false },
        { key: 'overdue', name: 'Overdue', order: 4, color: '#EF4444', isTerminal: false },
        { key: 'collections', name: 'Collections', order: 5, color: '#DC2626', isTerminal: false },
        { key: 'paid', name: 'Paid', order: 6, color: '#059669', isTerminal: true },
        { key: 'written_off', name: 'Written Off', order: 7, color: '#6B7280', isTerminal: true },
      ],
    },
    {
      key: 'internal',
      name: 'Internal Operations Pipeline',
      type: 'INTERNAL' as const,
      description: 'Internal team task management',
      stages: [
        { key: 'backlog', name: 'Backlog', order: 1, color: '#6B7280', isTerminal: false },
        { key: 'planned', name: 'Planned', order: 2, color: '#3B82F6', isTerminal: false },
        { key: 'in_progress', name: 'In Progress', order: 3, color: '#F59E0B', isTerminal: false },
        { key: 'blocked', name: 'Blocked', order: 4, color: '#EF4444', isTerminal: false },
        { key: 'review', name: 'Review', order: 5, color: '#8B5CF6', isTerminal: false },
        { key: 'done', name: 'Done', order: 6, color: '#10B981', isTerminal: true },
        { key: 'cancelled', name: 'Cancelled', order: 7, color: '#6B7280', isTerminal: true },
      ],
    },
    {
      key: 'generic',
      name: 'General Tasks Pipeline',
      type: 'GENERIC' as const,
      description: 'Simple task workflow',
      stages: [
        { key: 'inbox', name: 'Inbox', order: 1, color: '#3B82F6', isTerminal: false },
        { key: 'todo', name: 'To Do', order: 2, color: '#8B5CF6', isTerminal: false },
        { key: 'doing', name: 'Doing', order: 3, color: '#F59E0B', isTerminal: false },
        { key: 'done', name: 'Done', order: 4, color: '#10B981', isTerminal: true },
      ],
    },
    {
      key: 'custom',
      name: 'Custom Pipeline',
      type: 'CUSTOM' as const,
      description: 'Customizable workflow template',
      stages: [
        { key: 'stage_1', name: 'Stage 1', order: 1, color: '#3B82F6', isTerminal: false },
        { key: 'stage_2', name: 'Stage 2', order: 2, color: '#8B5CF6', isTerminal: false },
        { key: 'stage_3', name: 'Stage 3', order: 3, color: '#F59E0B', isTerminal: false },
        { key: 'completed', name: 'Completed', order: 4, color: '#10B981', isTerminal: true },
      ],
    },
  ];

  let pipelineCount = 0;
  for (const def of pipelineDefinitions) {
    try {
      const pipeline = await prisma.pipeline.upsert({
        where: {
          key: def.key,
        },
        update: {},
        create: {
          key: def.key,
          name: def.name,
          type: def.type,
          description: def.description,
          orgId: organization.id,
          stages: {
            create: def.stages,
          },
        },
      });
      console.log(`   ✅ ${def.name} (${def.stages.length} stages)`);
      pipelineCount++;
    } catch (error) {
      console.log(`   ⚠️  Failed to create ${def.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  console.log(`✅ Initialized ${pipelineCount}/${pipelineDefinitions.length} pipelines`);

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Test credentials:');
  console.log('  Email: test@astralisone.com');
  console.log('  Password: Test123!');
  console.log('  Role: ADMIN');
  console.log(`  Organization: ${organization.name}`);
  console.log(`  Pipelines: ${pipelineCount} initialized`);
  console.log('');
  console.log('Add to your .env / .env.production:');
  console.log(`  DEFAULT_USER_ID=${user.id}`);
  console.log(`  DEFAULT_ORG_ID=${organization.id}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

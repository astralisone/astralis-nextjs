
import { PrismaClient, AutomationTrigger } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding active automations...');

    // Get first organization and an admin user
    const org = await prisma.organization.findFirst();
    if (!org) {
        console.error('❌ No organization found. Please run migrations and seed organizations first.');
        return;
    }

    const admin = await prisma.users.findFirst({
        where: { role: 'ADMIN', isActive: true }
    });

    if (!admin) {
        console.warn('⚠️ No active admin user found. Falling back to any user.');
        const anyUser = await prisma.users.findFirst();
        if (!anyUser) {
            console.error('❌ No users found in the database. Please seed users first.');
            return;
        }
        // For seeding purposes, we'll use this user
        (admin as any) = anyUser;
    }

    const automations = [
        {
            name: 'New Lead Auto-Response',
            description: 'Automatically sends a welcome email to new leads via n8n.',
            orgId: org.id,
            createdById: admin!.id,
            isActive: true,
            n8nWorkflowId: 'lead-response-001',
            triggerType: AutomationTrigger.EVENT,
            triggerConfig: { event: 'intake:created' },
        },
        {
            name: 'Daily Operations Report',
            description: 'Generates and distributes a daily summary of task progress.',
            orgId: org.id,
            createdById: admin!.id,
            isActive: true,
            n8nWorkflowId: 'daily-report-002',
            triggerType: AutomationTrigger.SCHEDULE,
            triggerConfig: { schedule: '0 9 * * *' },
        },
        {
            name: 'Invoice Payment Processor',
            description: 'Handles incoming payment notifications and updates billing status.',
            orgId: org.id,
            createdById: admin!.id,
            isActive: true,
            n8nWorkflowId: 'invoice-processor-003',
            triggerType: AutomationTrigger.WEBHOOK,
            triggerConfig: { source: 'stripe' },
        }
    ];

    for (const automation of automations) {
        const existing = await prisma.automation.findFirst({
            where: { name: automation.name, orgId: org.id }
        });

        if (existing) {
            await prisma.automation.update({
                where: { id: existing.id },
                data: automation
            });
            console.log(`✅ Updated: ${automation.name}`);
        } else {
            await prisma.automation.create({
                data: automation
            });
            console.log(`✅ Created: ${automation.name}`);
        }
    }

    console.log('✨ Seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

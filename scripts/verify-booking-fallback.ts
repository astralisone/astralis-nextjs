
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Verifying booking system fallback logic...');

    // Simulate what the API does
    let hostUser = await prisma.users.findUnique({
        where: { id: process.env.DEFAULT_USER_ID || 'invalid' },
        select: { id: true, name: true, email: true, isActive: true, orgId: true }
    });

    if (!hostUser) {
        console.log('⚠️ DEFAULT_USER_ID not found or invalid. Testing fallback to first ADMIN...');
        hostUser = await prisma.users.findFirst({
            where: { role: 'ADMIN', isActive: true, orgId: { not: null } },
            select: { id: true, name: true, email: true, isActive: true, orgId: true }
        });
    }

    if (hostUser) {
        console.log('✅ Resolved Host:', hostUser.name, `(${hostUser.id})`);
        console.log('✅ Resolved Org:', hostUser.orgId);
    } else {
        console.error('❌ Still no host found! This is bad.');
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());

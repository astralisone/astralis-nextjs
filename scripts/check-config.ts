
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Checking DEFAULT_ORG_ID and DEFAULT_USER_ID...');
    try {
        const orgId = process.env.DEFAULT_ORG_ID;
        const userId = process.env.DEFAULT_USER_ID;

        console.log('DEFAULT_ORG_ID:', orgId);
        console.log('DEFAULT_USER_ID:', userId);

        if (orgId) {
            const org = await prisma.organization.findUnique({
                where: { id: orgId }
            });
            console.log(org ? `✅ Org found: ${org.name}` : '❌ Org NOT found.');
        }

        if (userId) {
            const user = await prisma.users.findUnique({
                where: { id: userId }
            });
            console.log(user ? `✅ User found: ${user.name}` : '❌ User NOT found.');
        }

        const firstOrg = await prisma.organization.findFirst();
        if (firstOrg) {
            console.log('Suggestion for DEFAULT_ORG_ID:', firstOrg.id, `(${firstOrg.name})`);
        }

        const firstUser = await prisma.users.findFirst({ where: { isActive: true } });
        if (firstUser) {
            console.log('Suggestion for DEFAULT_USER_ID:', firstUser.id, `(${firstUser.name})`);
        }

    } catch (error) {
        console.error('❌ Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();

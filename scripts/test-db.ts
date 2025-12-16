
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Testing Database Connection (via Prisma Proxy)...');
    try {
        const result = await prisma.$queryRaw`SELECT 1 as result`;
        console.log('✅ Connection Successful!');
        console.log('Result:', result);
    } catch (error) {
        console.error('❌ Connection Failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();

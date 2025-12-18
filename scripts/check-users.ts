
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Fetching users from DB...');
  try {
    const users = await prisma.users.findMany({
      select: { id: true, name: true, email: true, isActive: true },
      take: 10
    });
    console.log('✅ Found users:');
    console.table(users);

    const defaultId = process.env.DEFAULT_USER_ID;
    console.log('Current DEFAULT_USER_ID:', defaultId);

    if (defaultId) {
      const defaultUser = await prisma.users.findUnique({
        where: { id: defaultId }
      });
      if (defaultUser) {
        console.log('✅ Default user found:', defaultUser.name);
      } else {
        console.log('❌ Default user NOT found in this DB.');
      }
    }
  } catch (error) {
    console.error('❌ Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

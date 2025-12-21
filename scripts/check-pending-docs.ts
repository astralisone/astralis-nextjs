
import { prisma } from '../src/lib/prisma';

async function checkPendingDocs() {
  try {
    console.log('Connecting to database...');
    const totalDocs = await prisma.document.count();
    console.log(`Total documents in database: ${totalDocs}`);

    const pendingDocs = await prisma.document.findMany({
      where: {
        status: 'PENDING',
      },
      select: {
        id: true,
        originalName: true,
        status: true,
        createdAt: true,
        orgId: true,
      }
    });

    console.log(`Found ${pendingDocs.length} pending documents.`);
    if (pendingDocs.length > 0) {
      console.table(pendingDocs);
    }
  } catch (error) {
    console.error('Error querying documents:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPendingDocs();

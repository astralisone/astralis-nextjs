
import { prisma } from '../lib/prisma';
import { queueDocumentProcessing } from './queues/document-processing.queue';
import { closeRedisConnection } from './redis';

async function requeuePendingDocs() {
  try {
    console.log('Finding pending documents...');
    const pendingDocs = await prisma.document.findMany({
      where: {
        status: 'PENDING',
      },
      select: {
        id: true,
        orgId: true,
        originalName: true,
      }
    });

    console.log(`Found ${pendingDocs.length} pending documents.`);

    for (const doc of pendingDocs) {
      console.log(`Queueing document: ${doc.originalName} (${doc.id})...`);
      await queueDocumentProcessing({
        documentId: doc.id,
        orgId: doc.orgId,
        performOCR: true,
        performVisionExtraction: false,
      });
    }

    console.log('All pending documents have been re-queued.');
  } catch (error) {
    console.error('Error re-queueing documents:', error);
  } finally {
    await prisma.$disconnect();
    await closeRedisConnection();
    process.exit(0);
  }
}

requeuePendingDocs();

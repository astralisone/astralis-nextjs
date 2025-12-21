
import { prisma } from '../lib/prisma';
import { retryDocumentProcessing } from './queues/document-processing.queue';
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
      console.log(`Retrying document: ${doc.originalName} (${doc.id})...`);
      await retryDocumentProcessing({
        documentId: doc.id,
        orgId: doc.orgId,
        performOCR: true,
        performVisionExtraction: false,
      });
    }

    console.log('All pending documents have been re-queued for retry.');
  } catch (error) {
    console.error('Error re-queueing documents:', error);
  } finally {
    await prisma.$disconnect();
    await closeRedisConnection();
    process.exit(0);
  }
}

requeuePendingDocs();

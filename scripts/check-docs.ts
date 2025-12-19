import { prisma } from '../src/lib/prisma';

async function checkDocs() {
    console.log('Checking Document Status in Database...');

    const docCount = await prisma.document.count();
    console.log('Total Documents:', docCount);

    const statusCounts = await prisma.document.groupBy({
        by: ['status'],
        _count: {
            _all: true
        }
    });
    console.log('Document Status Counts:', statusCounts);

    const pendingDocs = await prisma.document.findMany({
        where: { status: 'PENDING' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, fileName: true, createdAt: true }
    });
    console.log('Recent Pending Docs:', pendingDocs);

    const completedDocs = await prisma.document.findMany({
        where: { status: 'COMPLETED' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, fileName: true, ocrText: true }
    });

    for (const doc of completedDocs) {
        const embeddingCount = await prisma.documentEmbedding.count({
            where: { documentId: doc.id }
        });
        console.log(`Doc ${doc.id} (${doc.fileName}): OCR Text length: ${doc.ocrText?.length || 0}, Embeddings: ${embeddingCount}`);
    }

    process.exit(0);
}

checkDocs().catch(err => {
    console.error(err);
    process.exit(1);
});

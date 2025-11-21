import { prisma } from '@/lib/prisma';
import { getEmbeddingService } from '@/lib/services/embedding.service';

/**
 * Embedding Helper Utilities
 *
 * Helper functions for creating and managing document embeddings.
 * These can be used in background jobs or CLI scripts.
 */

/**
 * Create embeddings for a document's OCR text
 *
 * @param documentId - Document ID
 * @param chunkSize - Size of each text chunk (default: 1000 chars)
 * @param overlap - Overlap between chunks (default: 200 chars)
 */
export async function createEmbeddingsForDocument(
  documentId: string,
  chunkSize: number = 500,
  overlap: number = 50
): Promise<void> {
  const embeddingService = getEmbeddingService();

  // Fetch document
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    select: {
      id: true,
      orgId: true,
      ocrText: true,
      originalName: true,
      status: true,
    },
  });

  if (!document) {
    throw new Error(`Document ${documentId} not found`);
  }

  if (!document.ocrText) {
    throw new Error(`Document ${documentId} has no OCR text. Run OCR processing first.`);
  }

  console.log(`[EmbeddingHelper] Creating embeddings for document: ${document.originalName} (${documentId})`);

  // Delete existing embeddings
  const existingCount = await prisma.documentEmbedding.count({
    where: { documentId },
  });
  if (existingCount > 0) {
    console.log(`[EmbeddingHelper] Deleting ${existingCount} existing embeddings...`);
    await prisma.documentEmbedding.deleteMany({
      where: { documentId },
    });
  }

  // Chunk the text
  const chunks = embeddingService.chunkText(document.ocrText, { chunkSize, overlap });
  console.log(`[EmbeddingHelper] Created ${chunks.length} chunks from OCR text`);

  // Generate embeddings
  const embeddings = await embeddingService.generateEmbeddings(chunks);

  // Store embeddings
  await embeddingService.storeEmbeddings(documentId, document.orgId, chunks, embeddings);

  console.log(`[EmbeddingHelper] Successfully created ${chunks.length} embeddings for document ${documentId}`);
}

/**
 * Create embeddings for all completed documents in an organization
 *
 * @param orgId - Organization ID
 * @param batchSize - Number of documents to process in parallel (default: 5)
 */
export async function createEmbeddingsForOrganization(
  orgId: string,
  batchSize: number = 5
): Promise<{ processed: number; failed: number; skipped: number }> {
  console.log(`[EmbeddingHelper] Creating embeddings for organization ${orgId}...`);

  // Fetch all completed documents with OCR text
  const documents = await prisma.document.findMany({
    where: {
      orgId,
      status: 'COMPLETED',
      ocrText: { not: null },
    },
    select: {
      id: true,
      originalName: true,
    },
  });

  console.log(`[EmbeddingHelper] Found ${documents.length} documents with OCR text`);

  let processed = 0;
  let failed = 0;
  let skipped = 0;

  // Process in batches
  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize);
    console.log(`[EmbeddingHelper] Processing batch ${Math.floor(i / batchSize) + 1} (${batch.length} documents)...`);

    const results = await Promise.allSettled(
      batch.map(doc => createEmbeddingsForDocument(doc.id))
    );

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        processed++;
      } else {
        failed++;
        console.error(`[EmbeddingHelper] Failed to process ${batch[index].originalName}:`, result.reason);
      }
    });
  }

  console.log(`[EmbeddingHelper] Completed: ${processed} processed, ${failed} failed, ${skipped} skipped`);

  return { processed, failed, skipped };
}

/**
 * Check if document has embeddings
 *
 * @param documentId - Document ID
 * @returns True if embeddings exist
 */
export async function hasEmbeddings(documentId: string): Promise<boolean> {
  const count = await prisma.documentEmbedding.count({
    where: { documentId },
  });
  return count > 0;
}

/**
 * Get embedding statistics for a document
 *
 * @param documentId - Document ID
 * @returns Embedding statistics
 */
export async function getEmbeddingStats(documentId: string): Promise<{
  count: number;
  avgChunkLength: number;
  totalCharacters: number;
}> {
  const embeddings = await prisma.documentEmbedding.findMany({
    where: { documentId },
    select: { content: true },
  });

  const count = embeddings.length;
  const totalCharacters = embeddings.reduce((sum, emb) => sum + emb.content.length, 0);
  const avgChunkLength = count > 0 ? Math.round(totalCharacters / count) : 0;

  return {
    count,
    avgChunkLength,
    totalCharacters,
  };
}

/**
 * Re-embed all documents (useful after changing chunking strategy)
 *
 * @param orgId - Organization ID
 * @param force - Force re-embedding even if embeddings exist
 */
export async function reEmbedAllDocuments(
  orgId: string,
  force: boolean = false
): Promise<void> {
  console.log(`[EmbeddingHelper] Re-embedding all documents for organization ${orgId}...`);

  const documents = await prisma.document.findMany({
    where: {
      orgId,
      status: 'COMPLETED',
      ocrText: { not: null },
    },
    select: { id: true },
  });

  for (const doc of documents) {
    const hasExisting = await hasEmbeddings(doc.id);

    if (!force && hasExisting) {
      console.log(`[EmbeddingHelper] Skipping ${doc.id} (already has embeddings, use force=true to override)`);
      continue;
    }

    await createEmbeddingsForDocument(doc.id);
  }

  console.log(`[EmbeddingHelper] Re-embedding completed for ${documents.length} documents`);
}

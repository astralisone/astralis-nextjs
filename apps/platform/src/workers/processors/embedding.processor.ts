import { Job } from 'bullmq';
import { prisma } from '@/lib/prisma';
import { getEmbeddingService } from '@/lib/services/embedding.service';
import type { DocumentEmbeddingJobData } from '../queues/document-embedding.queue';

/**
 * Document Embedding Processor
 *
 * Generates vector embeddings for document chunks to enable RAG (Retrieval-Augmented Generation)
 */
export async function processDocumentEmbedding(job: Job<DocumentEmbeddingJobData>) {
  const { documentId, orgId, force = false } = job.data;

  console.log(`[Worker] Processing embeddings for document ${documentId}`);

  try {
    // Validate orgId for multi-tenant isolation
    if (!orgId) {
      throw new Error('orgId is required for multi-tenant isolation');
    }

    // Update progress
    await job.updateProgress(5);

    // Get document with orgId filter (defense in depth)
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        orgId: orgId,
      },
      select: {
        id: true,
        fileName: true,
        originalName: true,
        ocrText: true,
        status: true,
        processedAt: true,
      },
    });

    if (!document) {
      throw new Error('Document not found or access denied');
    }

    console.log(`[Worker] Found document: ${document.originalName}`);

    // Validate document has OCR text
    if (!document.ocrText || document.ocrText.trim().length === 0) {
      throw new Error(
        `Document ${documentId} has no OCR text. Cannot generate embeddings without text content.`
      );
    }

    console.log(
      `[Worker] Document has ${document.ocrText.length} characters of OCR text`
    );

    // Check if embeddings already exist (unless force=true)
    if (!force) {
      const existingEmbeddings = await prisma.documentEmbedding.count({
        where: { documentId },
      });

      if (existingEmbeddings > 0) {
        console.log(
          `[Worker] Document ${documentId} already has ${existingEmbeddings} embeddings. Skipping (use force=true to re-embed).`
        );
        await job.updateProgress(100);
        return {
          success: true,
          documentId,
          skipped: true,
          existingEmbeddings,
          message: 'Embeddings already exist',
        };
      }
    }

    await job.updateProgress(10);

    // Initialize embedding service
    console.log(`[Worker] Initializing embedding service...`);
    const embeddingService = getEmbeddingService();

    await job.updateProgress(20);

    // Chunk the text
    console.log(`[Worker] Chunking document text...`);
    const chunks = embeddingService.chunkText(document.ocrText);

    if (chunks.length === 0) {
      throw new Error(
        `Failed to chunk document ${documentId}. OCR text may be malformed.`
      );
    }

    console.log(`[Worker] Created ${chunks.length} chunks`);
    await job.updateProgress(30);

    // Generate embeddings
    console.log(`[Worker] Generating embeddings for ${chunks.length} chunks...`);
    const startTime = Date.now();

    const embeddings = await embeddingService.generateEmbeddings(chunks);

    const embeddingTime = Date.now() - startTime;
    console.log(
      `[Worker] Generated ${embeddings.length} embeddings in ${embeddingTime}ms (${Math.round(embeddingTime / chunks.length)}ms per chunk)`
    );

    await job.updateProgress(70);

    // Validate embeddings
    if (embeddings.length !== chunks.length) {
      throw new Error(
        `Embedding count mismatch: expected ${chunks.length}, got ${embeddings.length}`
      );
    }

    // Store embeddings in database
    console.log(`[Worker] Storing ${embeddings.length} embeddings in database...`);
    await embeddingService.storeEmbeddings(
      document.id,
      orgId,
      chunks,
      embeddings
    );

    await job.updateProgress(95);

    // Update document metadata to indicate embeddings are ready
    await prisma.document.update({
      where: { id: documentId },
      data: {
        metadata: {
          ...(document as any).metadata,
          embeddingsGenerated: true,
          embeddingsCount: chunks.length,
          embeddingsGeneratedAt: new Date().toISOString(),
        },
      },
    });

    console.log(`[Worker] Document ${documentId} embedding completed successfully`);

    await job.updateProgress(100);

    return {
      success: true,
      documentId,
      chunksCreated: chunks.length,
      embeddingsGenerated: embeddings.length,
      processingTimeMs: embeddingTime,
      avgChunkSize: Math.round(document.ocrText.length / chunks.length),
    };
  } catch (error) {
    // CRITICAL: Always show full error details - no silent failures
    console.error(`[Worker] EMBEDDING FAILED for document ${documentId}`);
    console.error(`[Worker] Error message:`, error instanceof Error ? error.message : String(error));
    console.error(`[Worker] Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
    console.error(`[Worker] Full error object:`, error);

    // Update document metadata to indicate embedding failure
    try {
      const document = await prisma.document.findUnique({
        where: { id: documentId },
      });

      if (document) {
        await prisma.document.update({
          where: { id: documentId },
          data: {
            metadata: {
              ...(document as any).metadata,
              embeddingError: error instanceof Error ? error.message : 'Unknown error',
              embeddingErrorStack: error instanceof Error ? error.stack : undefined,
              embeddingFailedAt: new Date().toISOString(),
            },
          },
        });
      }
    } catch (updateError) {
      console.error(
        `[Worker] Failed to update document metadata after embedding error:`,
        updateError
      );
    }

    throw error;
  }
}

/**
 * Check if document is ready for embedding
 *
 * Document must:
 * - Exist in database
 * - Have status COMPLETED (OCR finished)
 * - Have OCR text content
 *
 * @param documentId - Document ID
 * @returns True if document is ready for embedding
 */
export async function isDocumentReadyForEmbedding(
  documentId: string
): Promise<boolean> {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    select: {
      status: true,
      ocrText: true,
    },
  });

  if (!document) {
    return false;
  }

  return (
    document.status === 'COMPLETED' &&
    !!document.ocrText &&
    document.ocrText.trim().length > 0
  );
}

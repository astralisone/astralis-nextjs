import { Job } from 'bullmq';
import { prisma } from '@/lib/prisma';
import { getSpacesService } from '@/lib/services/spaces.service';
import { getOCRService } from '@/lib/services/ocr.service';
import { getVisionService, DocumentType } from '@/lib/services/vision.service';
import type { DocumentProcessingJobData } from '../queues/document-processing.queue';
import { queueDocumentEmbedding } from '../queues/document-embedding.queue';

/**
 * Document OCR Processor
 *
 * Extracts text and structured data from documents
 */
export async function processDocumentOCR(job: Job<DocumentProcessingJobData>) {
  const {
    documentId,
    orgId,
    documentType,
    performOCR = true,
    performVisionExtraction = false,
    language = 'eng',
  } = job.data;

  console.log(`[Worker] Processing document ${documentId}`);

  try {
    // Validate orgId for multi-tenant isolation
    if (!orgId) {
      throw new Error('orgId is required for multi-tenant isolation');
    }

    // Update status to PROCESSING
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'PROCESSING' },
    });

    await job.updateProgress(10);

    // Get document with orgId filter (defense in depth)
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        orgId: orgId,
      },
    });

    if (!document) {
      throw new Error('Document not found or access denied');
    }

    console.log(`[Worker] Found document: ${document.originalName}`);

    // Download file from Spaces
    await job.updateProgress(20);
    const spacesService = getSpacesService();
    const fileBuffer = await spacesService.downloadFile(document.filePath);

    console.log(`[Worker] Downloaded file from Spaces: ${fileBuffer.length} bytes`);

    // Extract text via OCR
    let ocrText = '';
    let ocrConfidence = 0;

    if (performOCR && supportsOCR(document.mimeType)) {
      try {
        await job.updateProgress(30);
        console.log(`[Worker] Starting OCR extraction for ${document.mimeType}...`);

        const ocrService = getOCRService();
        const ocrResult = await ocrService.extractText(
          fileBuffer,
          document.mimeType,
          language
        );

        ocrText = ocrResult.text;
        ocrConfidence = ocrResult.confidence || 0;

        console.log(
          `[Worker] OCR completed: ${ocrText.length} chars, confidence: ${(ocrConfidence * 100).toFixed(1)}%`
        );
      } catch (error) {
        console.error('[Worker] OCR extraction failed:', error);
        // Don't fail the entire job, just log the error and continue with empty OCR data
        ocrText = '';
        ocrConfidence = 0;
      }
    } else {
      console.log(`[Worker] Skipping OCR: performOCR=${performOCR}, supportsOCR=${supportsOCR(document.mimeType)}`);
    }

    await job.updateProgress(60);

    // Extract structured data with GPT-4 Vision (images only)
    let extractedData: any = null;

    if (
      performVisionExtraction &&
      document.mimeType.startsWith('image/') &&
      ocrText.length > 50
    ) {
      try {
        await job.updateProgress(70);
        console.log(`[Worker] Starting vision extraction...`);

        const visionService = getVisionService();
        const validDocumentType = (documentType && Object.values(DocumentType).includes(documentType as DocumentType))
          ? (documentType as DocumentType)
          : DocumentType.INVOICE;

        const extractionResult = await visionService.extractStructuredData(
          fileBuffer,
          document.mimeType,
          validDocumentType
        );

        extractedData = extractionResult.data;

        console.log(
          `[Worker] Vision extraction completed: ${Object.keys(extractedData || {}).length} fields`
        );
      } catch (error) {
        console.error('[Worker] Vision extraction failed:', error);
        // Continue without structured data
      }
    }

    // Update document with results
    await job.updateProgress(90);

    // Sanitize OCR text to remove null bytes and invalid UTF-8 sequences
    const sanitizedOcrText = ocrText
      ? ocrText
          .replace(/\0/g, '') // Remove null bytes
          .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters except \t, \n, \r
          .trim()
      : null;

    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'COMPLETED',
        ocrText: sanitizedOcrText,
        ocrConfidence,
        extractedData,
        processedAt: new Date(),
      },
    });

    console.log(`[Worker] Document ${documentId} processing completed`);

    // Queue embedding job if OCR text exists
    let embeddingQueued = false;
    if (ocrText && ocrText.trim().length > 0) {
      try {
        console.log(`[Worker] Queueing embedding job for document ${documentId}`);
        await queueDocumentEmbedding({
          documentId,
          orgId,
        });
        embeddingQueued = true;
        console.log(`[Worker] Embedding job queued successfully for document ${documentId}`);
      } catch (error) {
        console.error(`[Worker] Failed to queue embedding job for document ${documentId}:`, error);
        // Don't fail the OCR job if embedding queueing fails - just log the error
      }
    } else {
      console.log(`[Worker] Skipping embedding queue for document ${documentId}: no OCR text`);
    }

    await job.updateProgress(100);

    return {
      success: true,
      documentId,
      ocrTextLength: ocrText.length,
      confidence: ocrConfidence,
      hasStructuredData: !!extractedData,
      embeddingQueued,
    };
  } catch (error) {
    console.error(`[Worker] Document processing error for ${documentId}:`, error);

    // Update document status to FAILED
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'FAILED',
        processingError: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw error;
  }
}

/**
 * Check if document type supports OCR
 */
function supportsOCR(mimeType: string): boolean {
  return (
    mimeType.startsWith('image/') ||
    mimeType === 'application/pdf'
  );
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { retryDocumentProcessing } from '@/workers/queues/document-processing.queue';

/**
 * POST /api/documents/[id]/retry
 *
 * Retry processing a document (for FAILED or low-confidence documents)
 *
 * This endpoint:
 * 1. Validates user authentication
 * 2. Verifies document exists and belongs to user's org
 * 3. Resets document to PENDING status
 * 4. Re-queues document for processing
 *
 * Auth: Required (authenticated user)
 * RBAC: Users can only retry documents from their organization
 *
 * Response: 200 OK
 * {
 *   success: true,
 *   document: { ... }
 * }
 *
 * Errors:
 * - 401: Not authenticated
 * - 404: Document not found
 * - 500: Server error
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params for Next.js 15 compatibility
    const { id: documentId } = await params;

    // 1. Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.orgId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const orgId = session.user.orgId;

    // 2. Get document and verify ownership
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        orgId,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // 3. Reset document status to PENDING and clear previous results
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'PENDING',
        ocrText: null,
        ocrConfidence: null,
        extractedData: Prisma.JsonNull,
        processingError: null,
        processedAt: null,
      },
    });

    // 4. Re-queue for processing (removes old job first)
    try {
      await retryDocumentProcessing({
        documentId: document.id,
        orgId,
        performOCR: true,
        performVisionExtraction: false,
        language: 'eng',
      });

      console.log(`[API] Re-queued document ${documentId} for processing`);
    } catch (queueError) {
      console.error('[API] Failed to queue document processing:', queueError);
      // Don't fail the request if queueing fails
      // The document is still marked as PENDING and can be picked up later
    }

    return NextResponse.json({
      success: true,
      document: updatedDocument,
    });
  } catch (error) {
    console.error('Document retry error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

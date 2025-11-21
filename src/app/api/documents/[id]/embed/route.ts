import { NextRequest, NextResponse } from 'next/server';
import { getEmbeddingService } from '@/lib/services/embedding.service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/documents/:id/embed
 *
 * Generate and store embeddings for a document.
 * Document must have OCR text already processed.
 *
 * @auth Required - User must be authenticated
 * @param id - Document ID
 * @returns Embedding statistics
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const orgId = session.user.orgId;
    const { id: documentId } = await params;

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 400 }
      );
    }

    // Verify document exists and belongs to user's organization
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        orgId: orgId,
      },
      select: {
        id: true,
        fileName: true,
        status: true,
        ocrText: true,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or access denied' },
        { status: 404 }
      );
    }

    // Check if document has OCR text
    if (!document.ocrText) {
      return NextResponse.json(
        {
          error: 'Document has no OCR text',
          details: 'Run OCR processing first before generating embeddings',
        },
        { status: 400 }
      );
    }

    // Check document status
    if (document.status !== 'COMPLETED') {
      console.warn(
        `[Embedding API] Document ${documentId} status is ${document.status}, not COMPLETED`
      );
    }

    // Generate embeddings
    console.log(
      `[Embedding API] User ${userId} requested embeddings for document ${documentId}`
    );

    const embeddingService = getEmbeddingService();
    await embeddingService.embedDocument(documentId);

    // Get statistics
    const stats = await embeddingService.getEmbeddingStats(documentId);

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        orgId,
        action: 'EMBED',
        entity: 'DOCUMENT',
        entityId: documentId,
        metadata: {
          fileName: document.fileName,
          stats,
        },
      },
    });

    return NextResponse.json({
      success: true,
      documentId,
      fileName: document.fileName,
      stats,
      message: 'Embeddings generated successfully',
    });
  } catch (error) {
    console.error('[Embedding API] Error:', error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('OpenAI API key')) {
        return NextResponse.json(
          {
            error: 'Service configuration error',
            details: 'OpenAI API key not configured',
          },
          { status: 500 }
        );
      }

      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            details: 'Please try again in a few moments',
          },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to generate embeddings',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/documents/:id/embed
 *
 * Get embedding statistics for a document
 *
 * @auth Required - User must be authenticated
 * @param id - Document ID
 * @returns Embedding statistics or null if not embedded
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const orgId = session.user.orgId;
    const { id: documentId } = await params;

    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 400 }
      );
    }

    // Verify document exists and belongs to user's organization
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        orgId: orgId,
      },
      select: {
        id: true,
        fileName: true,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or access denied' },
        { status: 404 }
      );
    }

    // Get embedding statistics
    const embeddingService = getEmbeddingService();
    const stats = await embeddingService.getEmbeddingStats(documentId);

    if (!stats) {
      return NextResponse.json({
        success: true,
        documentId,
        fileName: document.fileName,
        embedded: false,
        stats: null,
        message: 'Document has not been embedded yet',
      });
    }

    return NextResponse.json({
      success: true,
      documentId,
      fileName: document.fileName,
      embedded: true,
      stats,
    });
  } catch (error) {
    console.error('[Embedding API] Error fetching stats:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch embedding statistics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

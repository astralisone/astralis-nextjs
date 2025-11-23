import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getDocumentService } from '@/lib/services/document.service';
import { UpdateDocumentSchema } from '@/lib/validators/document.validators';

/**
 * GET /api/documents/[id]
 *
 * Get single document by ID.
 *
 * Auth: Required
 * RBAC: Users can only access documents from their organization
 *
 * Response: 200 OK
 * {
 *   document: {
 *     id: string,
 *     fileName: string,
 *     originalName: string,
 *     cdnUrl: string,
 *     thumbnailUrl: string,
 *     fileSize: number,
 *     mimeType: string,
 *     status: string,
 *     ocrText: string,
 *     ocrConfidence: number,
 *     extractedData: object,
 *     metadata: object,
 *     uploadedBy: string,
 *     createdAt: string,
 *     processedAt: string,
 *     ...
 *   }
 * }
 *
 * Errors:
 * - 401: Not authenticated
 * - 404: Document not found
 * - 500: Server error
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.orgId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const orgId = session.user.orgId;
    const { id: documentId } = await params;

    // 2. Get document
    const documentService = getDocumentService();

    try {
      const document = await documentService.getDocument(documentId, orgId);

      return NextResponse.json({ document });
    } catch (getError) {
      if (getError instanceof Error) {
        if (getError.message.includes('not found')) {
          return NextResponse.json(
            { error: 'Document not found' },
            { status: 404 }
          );
        }

        if (getError.message.includes('Document model not yet implemented')) {
          return NextResponse.json(
            {
              error: 'Document feature not yet available',
              details: 'Database schema migration required.',
            },
            { status: 501 }
          );
        }

        return NextResponse.json(
          { error: 'Failed to get document', details: getError.message },
          { status: 500 }
        );
      }

      throw getError;
    }
  } catch (error) {
    console.error('Get document error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/documents/[id]
 *
 * Update document metadata.
 *
 * Auth: Required
 * RBAC: Users can only update documents from their organization
 *
 * Request Body:
 * {
 *   status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED',
 *   ocrText?: string,
 *   ocrConfidence?: number,
 *   extractedData?: object,
 *   metadata?: object,
 *   processingError?: string,
 *   processedAt?: string,
 *   thumbnailUrl?: string
 * }
 *
 * Response: 200 OK
 * {
 *   document: { ... }
 * }
 *
 * Errors:
 * - 401: Not authenticated
 * - 400: Invalid update data
 * - 404: Document not found
 * - 500: Server error
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.orgId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const orgId = session.user.orgId;
    const { id: documentId } = await params;

    // 2. Parse and validate request body
    const body = await req.json();
    const parsed = UpdateDocumentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid update data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // 3. Update document
    const documentService = getDocumentService();

    try {
      const document = await documentService.updateDocument(
        documentId,
        orgId,
        parsed.data
      );

      // 4. Log activity
      // TODO: Add activity log when Document model exists
      /*
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          orgId,
          action: 'UPDATE',
          entity: 'DOCUMENT',
          entityId: documentId,
          changes: parsed.data,
        },
      });
      */

      return NextResponse.json({ document });
    } catch (updateError) {
      if (updateError instanceof Error) {
        if (updateError.message.includes('not found')) {
          return NextResponse.json(
            { error: 'Document not found' },
            { status: 404 }
          );
        }

        if (updateError.message.includes('Document model not yet implemented')) {
          return NextResponse.json(
            {
              error: 'Document update feature not yet available',
              details: 'Database schema migration required.',
            },
            { status: 501 }
          );
        }

        return NextResponse.json(
          { error: 'Failed to update document', details: updateError.message },
          { status: 500 }
        );
      }

      throw updateError;
    }
  } catch (error) {
    console.error('Update document error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documents/[id]
 *
 * Delete single document.
 *
 * This endpoint:
 * 1. Validates authentication and authorization
 * 2. Deletes file from DigitalOcean Spaces
 * 3. Deletes thumbnail if exists
 * 4. Deletes database record
 * 5. Logs activity
 *
 * Auth: Required
 * RBAC: Users can only delete documents from their organization
 *
 * Response: 200 OK
 * {
 *   success: true,
 *   message: 'Document deleted successfully'
 * }
 *
 * Errors:
 * - 401: Not authenticated
 * - 404: Document not found
 * - 500: Server error
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.orgId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const orgId = session.user.orgId;
    const { id: documentId } = await params;

    // 2. Delete document
    const documentService = getDocumentService();

    try {
      await documentService.deleteDocument(documentId, orgId);

      // 3. Log activity
      // TODO: Add activity log when Document model exists
      /*
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          orgId,
          action: 'DELETE',
          entity: 'DOCUMENT',
          entityId: documentId,
        },
      });
      */

      return NextResponse.json({
        success: true,
        message: 'Document deleted successfully',
      });
    } catch (deleteError) {
      if (deleteError instanceof Error) {
        if (deleteError.message.includes('not found')) {
          return NextResponse.json(
            { error: 'Document not found' },
            { status: 404 }
          );
        }

        if (deleteError.message.includes('Document model not yet implemented')) {
          return NextResponse.json(
            {
              error: 'Document deletion feature not yet available',
              details: 'Database schema migration required.',
            },
            { status: 501 }
          );
        }

        return NextResponse.json(
          { error: 'Failed to delete document', details: deleteError.message },
          { status: 500 }
        );
      }

      throw deleteError;
    }
  } catch (error) {
    console.error('Delete document error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

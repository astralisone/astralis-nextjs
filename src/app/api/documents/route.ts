import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getDocumentService } from '@/lib/services/document.service';
import { DocumentFiltersSchema } from '@/lib/validators/document.validators';

/**
 * GET /api/documents
 *
 * List documents with filtering, search, and pagination.
 *
 * This endpoint:
 * 1. Validates user authentication
 * 2. Enforces organization-level isolation
 * 3. Supports filtering by status, type, uploader, date range
 * 4. Supports full-text search across filenames and OCR text
 * 5. Returns paginated results
 *
 * Auth: Required (authenticated user)
 * RBAC: Users can only see documents from their organization
 *
 * Query Parameters:
 * - status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' (optional)
 * - mimeType: Filter by MIME type (optional)
 * - uploadedBy: Filter by uploader user ID (optional)
 * - search: Search in filenames and OCR text (optional)
 * - startDate: Filter documents created after this date (ISO format) (optional)
 * - endDate: Filter documents created before this date (ISO format) (optional)
 * - limit: Number of results per page (default: 50, max: 100) (optional)
 * - offset: Pagination offset (default: 0) (optional)
 *
 * Response: 200 OK
 * {
 *   documents: [
 *     {
 *       id: string,
 *       fileName: string,
 *       originalName: string,
 *       cdnUrl: string,
 *       thumbnailUrl: string,
 *       fileSize: number,
 *       mimeType: string,
 *       status: string,
 *       ocrText: string,
 *       ocrConfidence: number,
 *       extractedData: object,
 *       uploadedBy: string,
 *       createdAt: string,
 *       processedAt: string,
 *       ...
 *     }
 *   ],
 *   pagination: {
 *     total: number,
 *     limit: number,
 *     offset: number,
 *     hasMore: boolean
 *   }
 * }
 *
 * Errors:
 * - 401: Not authenticated
 * - 400: Invalid query parameters
 * - 500: Server error
 */
export async function GET(req: NextRequest) {
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

    // 2. Parse and validate query parameters
    const { searchParams } = req.nextUrl;
    const filters = {
      orgId, // Always filter by user's org
      status: searchParams.get('status'),
      mimeType: searchParams.get('mimeType'),
      uploadedBy: searchParams.get('uploadedBy'),
      search: searchParams.get('search'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    };

    const parsed = DocumentFiltersSchema.safeParse(filters);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid filters', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // 3. Get documents
    const documentService = getDocumentService();

    try {
      const result = await documentService.listDocuments(parsed.data);

      return NextResponse.json({
        documents: result.documents,
        pagination: result.pagination,
      });
    } catch (listError) {
      // Handle specific error cases
      if (listError instanceof Error) {
        if (listError.message.includes('Document model not yet implemented')) {
          return NextResponse.json(
            {
              error: 'Document listing feature not yet available',
              details: 'Database schema migration required. Contact administrator.',
            },
            { status: 501 }
          );
        }

        return NextResponse.json(
          { error: 'Failed to list documents', details: listError.message },
          { status: 500 }
        );
      }

      throw listError;
    }
  } catch (error) {
    console.error('Document list error:', error);
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
 * DELETE /api/documents (Bulk Delete)
 *
 * Delete multiple documents at once.
 *
 * Auth: Required
 * RBAC: Users can only delete documents from their organization
 *
 * Request Body:
 * {
 *   documentIds: string[] (1-100 document IDs)
 * }
 *
 * Response: 200 OK
 * {
 *   success: true,
 *   deletedCount: number,
 *   errors: Array<{ documentId: string, error: string }>
 * }
 */
export async function DELETE(req: NextRequest) {
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

    // 2. Parse request body
    const body = await req.json();
    const documentIds = body.documentIds;

    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json(
        { error: 'documentIds array is required' },
        { status: 400 }
      );
    }

    if (documentIds.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 documents can be deleted at once' },
        { status: 400 }
      );
    }

    // 3. Delete documents
    const documentService = getDocumentService();
    const results = {
      deletedCount: 0,
      errors: [] as Array<{ documentId: string; error: string }>,
    };

    for (const documentId of documentIds) {
      try {
        await documentService.deleteDocument(documentId, orgId);
        results.deletedCount++;
      } catch (deleteError) {
        results.errors.push({
          documentId,
          error: deleteError instanceof Error ? deleteError.message : 'Unknown error',
        });
      }
    }

    // 4. Log activity
    // TODO: Add activity log when Document model exists
    /*
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        orgId,
        action: 'DELETE',
        entity: 'DOCUMENT',
        metadata: {
          deletedCount: results.deletedCount,
          errorCount: results.errors.length,
        },
      },
    });
    */

    return NextResponse.json({
      success: true,
      deletedCount: results.deletedCount,
      errors: results.errors,
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

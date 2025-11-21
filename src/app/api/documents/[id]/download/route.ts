import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getDocumentService } from '@/lib/services/document.service';

/**
 * GET /api/documents/[id]/download
 *
 * Download document file.
 *
 * This endpoint:
 * 1. Validates authentication and authorization
 * 2. Retrieves document metadata
 * 3. Downloads file from DigitalOcean Spaces
 * 4. Returns file with appropriate headers
 *
 * Auth: Required
 * RBAC: Users can only download documents from their organization
 *
 * Query Parameters:
 * - disposition: 'inline' | 'attachment' (default: 'attachment')
 *   Controls whether file is downloaded or displayed in browser
 *
 * Response: 200 OK (file stream)
 * Content-Type: <document mime type>
 * Content-Disposition: attachment; filename="<original filename>"
 * Content-Length: <file size>
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

    // 2. Get disposition parameter
    const { searchParams } = req.nextUrl;
    const disposition = searchParams.get('disposition') || 'attachment';

    if (disposition !== 'inline' && disposition !== 'attachment') {
      return NextResponse.json(
        { error: 'Invalid disposition parameter. Must be "inline" or "attachment"' },
        { status: 400 }
      );
    }

    // 3. Download document
    const documentService = getDocumentService();

    try {
      const result = await documentService.downloadDocument(documentId, orgId);

      // 4. Return file with appropriate headers
      const headers = new Headers();
      headers.set('Content-Type', result.mimeType);
      headers.set(
        'Content-Disposition',
        `${disposition}; filename="${encodeURIComponent(result.filename)}"`
      );
      headers.set('Content-Length', result.buffer.length.toString());

      // Cache control
      headers.set('Cache-Control', 'private, max-age=3600'); // 1 hour

      // Convert Buffer to Uint8Array for NextResponse
      const uint8Array = new Uint8Array(result.buffer);

      return new NextResponse(uint8Array, {
        status: 200,
        headers,
      });
    } catch (downloadError) {
      if (downloadError instanceof Error) {
        if (downloadError.message.includes('not found')) {
          return NextResponse.json(
            { error: 'Document not found' },
            { status: 404 }
          );
        }

        if (downloadError.message.includes('Document model not yet implemented')) {
          return NextResponse.json(
            {
              error: 'Document download feature not yet available',
              details: 'Database schema migration required.',
            },
            { status: 501 }
          );
        }

        return NextResponse.json(
          { error: 'Failed to download document', details: downloadError.message },
          { status: 500 }
        );
      }

      throw downloadError;
    }
  } catch (error) {
    console.error('Download document error:', error);
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
 * HEAD /api/documents/[id]/download
 *
 * Get document metadata without downloading file.
 *
 * Useful for checking file size before download.
 *
 * Auth: Required
 * RBAC: Users can only access documents from their organization
 *
 * Response: 200 OK
 * Content-Type: <document mime type>
 * Content-Length: <file size>
 * Last-Modified: <last modified date>
 */
export async function HEAD(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.orgId) {
      return new NextResponse(null, { status: 401 });
    }

    const orgId = session.user.orgId;
    const { id: documentId } = await params;

    // 2. Get document metadata
    const documentService = getDocumentService();

    try {
      const document = await documentService.getDocument(documentId, orgId);

      // 3. Return headers only
      const headers = new Headers();
      headers.set('Content-Type', document.mimeType);
      headers.set('Content-Length', document.fileSize.toString());
      if (document.updatedAt) {
        headers.set('Last-Modified', new Date(document.updatedAt).toUTCString());
      }

      return new NextResponse(null, {
        status: 200,
        headers,
      });
    } catch (metadataError) {
      if (metadataError instanceof Error) {
        if (metadataError.message.includes('not found')) {
          return new NextResponse(null, { status: 404 });
        }

        if (metadataError.message.includes('Document model not yet implemented')) {
          return new NextResponse(null, { status: 501 });
        }
      }

      return new NextResponse(null, { status: 500 });
    }
  } catch (error) {
    console.error('Document HEAD error:', error);
    return new NextResponse(null, { status: 500 });
  }
}

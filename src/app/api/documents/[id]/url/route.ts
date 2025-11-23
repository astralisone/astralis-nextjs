import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getDocumentService } from '@/lib/services/document.service';
import { getSpacesService } from '@/lib/services/spaces.service';

/**
 * GET /api/documents/[id]/url
 * Generate a temporary signed URL for document access
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

    // 2. Get document and verify access
    const documentService = getDocumentService();
    const document = await documentService.getDocument(documentId, orgId);

    // 3. Generate signed URL (valid for 1 hour)
    const spacesService = getSpacesService();
    const signedUrl = await spacesService.getSignedUrl(document.filePath, 3600);

    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error('Document URL generation error:', error);

    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Document not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to generate document URL',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

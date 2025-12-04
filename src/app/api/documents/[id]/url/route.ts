import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getDocumentService } from '@/lib/services/document.service';

/**
 * GET /api/documents/[id]/url
 * Get the public URL for document access
 *
 * Note: Vercel Blob URLs are public by default, so we return the cdnUrl directly.
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

    // 3. Return the public URL (Vercel Blob URLs are public)
    const url = document.cdnUrl || document.filePath;

    return NextResponse.json({ url });
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

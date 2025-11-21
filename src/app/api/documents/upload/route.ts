import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getDocumentService } from '@/lib/services/document.service';
import { validateFile } from '@/lib/utils/file-validation';
import { DocumentProcessingOptionsSchema } from '@/lib/validators/document.validators';

/**
 * POST /api/documents/upload
 *
 * Upload document file to DigitalOcean Spaces and create database record.
 *
 * This endpoint:
 * 1. Validates user authentication and file
 * 2. Uploads file to DigitalOcean Spaces
 * 3. Creates document record in database (REQUIRES Document model)
 * 4. Optionally queues background processing (OCR, vision extraction)
 *
 * Auth: Required (authenticated user)
 * RBAC: All authenticated users can upload documents
 *
 * Request: multipart/form-data
 * - file: File (required)
 * - performOCR: boolean (optional, default: true)
 * - performVisionExtraction: boolean (optional, default: false)
 * - documentType: string (optional, for vision extraction)
 * - language: string (optional, default: 'eng')
 * - generateThumbnail: boolean (optional, default: true)
 *
 * Response: 201 Created
 * {
 *   document: {
 *     id: string,
 *     fileName: string,
 *     originalName: string,
 *     cdnUrl: string,
 *     fileSize: number,
 *     mimeType: string,
 *     status: 'PENDING',
 *     ...
 *   }
 * }
 *
 * Errors:
 * - 401: Not authenticated
 * - 400: Invalid file or validation failed
 * - 413: File too large
 * - 500: Upload or processing error
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.orgId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const orgId = session.user.orgId;

    // 2. Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // 3. Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Validate file
    const validation = await validateFile(buffer, file.name, file.type);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'File validation failed' },
        { status: 400 }
      );
    }

    // 5. Parse processing options
    const processingOptions = DocumentProcessingOptionsSchema.safeParse({
      performOCR: formData.get('performOCR') !== 'false', // default true
      performVisionExtraction: formData.get('performVisionExtraction') === 'true',
      documentType: formData.get('documentType') || undefined,
      language: formData.get('language') || 'eng',
      generateThumbnail: formData.get('generateThumbnail') !== 'false', // default true
    });

    if (!processingOptions.success) {
      return NextResponse.json(
        { error: 'Invalid processing options', details: processingOptions.error.flatten() },
        { status: 400 }
      );
    }

    // 6. Upload document
    const documentService = getDocumentService();

    try {
      const document = await documentService.uploadDocument(
        buffer,
        file.name,
        validation.detectedMimeType || file.type,
        userId,
        orgId,
        processingOptions.data
      );

      // 7. Log activity
      // TODO: Add activity log entry when Document model exists
      /*
      await prisma.activityLog.create({
        data: {
          userId,
          orgId,
          action: 'CREATE',
          entity: 'DOCUMENT',
          entityId: document.id,
          metadata: {
            filename: file.name,
            fileSize: document.fileSize,
            mimeType: document.mimeType,
          },
        },
      });
      */

      return NextResponse.json(
        {
          success: true,
          document,
          message: 'Document uploaded successfully',
        },
        { status: 201 }
      );
    } catch (uploadError) {
      // Handle specific error cases
      if (uploadError instanceof Error) {
        if (uploadError.message.includes('Document model not yet implemented')) {
          return NextResponse.json(
            {
              error: 'Document upload feature not yet available',
              details: 'Database schema migration required. Contact administrator.',
            },
            { status: 501 }
          );
        }

        return NextResponse.json(
          { error: 'Upload failed', details: uploadError.message },
          { status: 500 }
        );
      }

      throw uploadError;
    }
  } catch (error) {
    console.error('Document upload error:', error);
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
 * GET /api/documents/upload
 *
 * Get upload configuration and limits
 *
 * Auth: Required
 *
 * Response: 200 OK
 * {
 *   maxFileSize: number,
 *   allowedTypes: string[],
 *   features: {
 *     ocr: boolean,
 *     visionExtraction: boolean,
 *     thumbnails: boolean
 *   }
 * }
 */
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '52428800'); // 50MB
    const allowedTypes = process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'image/*',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    return NextResponse.json({
      maxFileSize,
      maxFileSizeMB: (maxFileSize / (1024 * 1024)).toFixed(2),
      allowedTypes,
      features: {
        ocr: true,
        visionExtraction: !!process.env.OPENAI_API_KEY,
        thumbnails: true,
      },
      endpoints: {
        upload: '/api/documents/upload',
        list: '/api/documents',
        download: '/api/documents/[id]/download',
      },
    });
  } catch (error) {
    console.error('Upload config error:', error);
    return NextResponse.json(
      { error: 'Failed to get upload configuration' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Initialize S3 client for DigitalOcean Spaces
const s3Client = new S3Client({
  endpoint: 'https://nyc3.digitaloceanspaces.com',
  region: 'nyc3',
  credentials: {
    accessKeyId: process.env.DO_SPACES_ACCESS_KEY || 'DO00EFT8GE4WBBXWP32Z',
    secretAccessKey: process.env.DO_SPACES_SECRET_KEY || 'nun1YaTVRqgvS3cIKMPBPNlU/RxTGMkYzKMZqLlen6g',
  },
  forcePathStyle: false,
});

const BUCKET_NAME = 'astralisone-documents';

/**
 * Generate unique filename for avatar
 */
function generateAvatarFilename(userId: string, ext: string): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  return `avatars/${userId}/${timestamp}-${random}.${ext}`;
}

/**
 * Get file extension from mime type
 */
function getExtensionFromMimeType(mimeType: string): string {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
  };
  return extensions[mimeType] || 'jpg';
}

/**
 * Extract avatar path from URL for deletion
 */
function extractAvatarPath(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // Remove leading slash and bucket name prefix if present
    let path = urlObj.pathname;
    if (path.startsWith('/')) {
      path = path.slice(1);
    }
    // Only return path if it's in avatars folder
    if (path.includes('avatars/')) {
      return path;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * POST /api/users/me/avatar
 * Upload a new profile avatar image
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to upload an avatar' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        },
        { status: 400 }
      );
    }

    // Get current user to check for existing avatar
    const currentUser = await prisma.users.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    // Delete old avatar if it exists and is in our storage
    if (currentUser?.avatar) {
      const oldAvatarPath = extractAvatarPath(currentUser.avatar);
      if (oldAvatarPath) {
        try {
          await s3Client.send(
            new DeleteObjectCommand({
              Bucket: BUCKET_NAME,
              Key: oldAvatarPath,
            })
          );
          console.log('[Avatar] Deleted old avatar:', oldAvatarPath);
        } catch (deleteError) {
          // Log but don't fail the upload if deletion fails
          console.error('[Avatar] Failed to delete old avatar:', deleteError);
        }
      }
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename
    const ext = getExtensionFromMimeType(file.type);
    const avatarPath = generateAvatarFilename(userId, ext);

    // Upload to DigitalOcean Spaces
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: avatarPath,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read', // Make avatar publicly readable
      CacheControl: 'public, max-age=31536000', // Cache for 1 year
      Metadata: {
        'user-id': userId,
        'original-name': file.name,
        'uploaded-at': new Date().toISOString(),
      },
    });

    await s3Client.send(uploadCommand);

    // Generate public URL
    const avatarUrl = `https://${BUCKET_NAME}.nyc3.digitaloceanspaces.com/${avatarPath}`;

    // Update user avatar in database
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
      select: {
        id: true,
        avatar: true,
        name: true,
        email: true,
      },
    });

    console.log('[Avatar] Successfully uploaded avatar for user:', userId);

    return NextResponse.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatarUrl: updatedUser.avatar,
      },
    });
  } catch (error) {
    console.error('[Avatar] Upload error:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to upload avatar',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/me/avatar
 * Remove the current profile avatar
 */
export async function DELETE(): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to delete your avatar' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get current user avatar
    const currentUser = await prisma.users.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    if (!currentUser?.avatar) {
      return NextResponse.json(
        { error: 'Not Found', message: 'No avatar to delete' },
        { status: 404 }
      );
    }

    // Delete from Spaces if it's our avatar
    const avatarPath = extractAvatarPath(currentUser.avatar);
    if (avatarPath) {
      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: avatarPath,
          })
        );
        console.log('[Avatar] Deleted avatar from storage:', avatarPath);
      } catch (deleteError) {
        console.error('[Avatar] Failed to delete avatar from storage:', deleteError);
        // Continue to remove from database even if storage deletion fails
      }
    }

    // Remove avatar URL from database
    await prisma.users.update({
      where: { id: userId },
      data: { avatar: null },
    });

    console.log('[Avatar] Successfully removed avatar for user:', userId);

    return NextResponse.json({
      success: true,
      message: 'Avatar deleted successfully',
    });
  } catch (error) {
    console.error('[Avatar] Delete error:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Failed to delete avatar',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { put, del } from '@vercel/blob';
import crypto from 'crypto';

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
 * Check if URL is a Vercel Blob URL
 */
function isVercelBlobUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('vercel-storage.com') ||
           urlObj.hostname.includes('blob.vercel-storage.com');
  } catch {
    return false;
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

    // Delete old avatar if it exists and is in Vercel Blob storage
    if (currentUser?.avatar && isVercelBlobUrl(currentUser.avatar)) {
      try {
        await del(currentUser.avatar);
        console.log('[Avatar] Deleted old avatar:', currentUser.avatar);
      } catch (deleteError) {
        // Log but don't fail the upload if deletion fails
        console.error('[Avatar] Failed to delete old avatar:', deleteError);
      }
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename
    const ext = getExtensionFromMimeType(file.type);
    const avatarPath = generateAvatarFilename(userId, ext);

    // Upload to Vercel Blob
    const blob = await put(avatarPath, buffer, {
      access: 'public',
      contentType: file.type,
      addRandomSuffix: false,
    });

    // Update user avatar in database
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { avatar: blob.url },
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

    // Delete from Vercel Blob if it's our avatar
    if (isVercelBlobUrl(currentUser.avatar)) {
      try {
        await del(currentUser.avatar);
        console.log('[Avatar] Deleted avatar from storage:', currentUser.avatar);
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

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/utils/crypto';

/**
 * Schema for validating the POST request body
 */
const acceptInviteSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain uppercase letter')
    .regex(/[a-z]/, 'Password must contain lowercase letter')
    .regex(/[0-9]/, 'Password must contain number'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
});

/**
 * Prefix used to identify pending invite tokens in the password field
 * Format: PENDING_INVITE:{token}:{expiry_timestamp}
 */
const PENDING_INVITE_PREFIX = 'PENDING_INVITE:';

/**
 * Parse the invite data from the password field
 * @param password - The password field containing invite data
 * @returns Parsed token and expiry, or null if invalid format
 */
function parseInviteData(password: string): { token: string; expiry: number } | null {
  if (!password.startsWith(PENDING_INVITE_PREFIX)) {
    return null;
  }

  const parts = password.split(':');
  if (parts.length !== 3) {
    return null;
  }

  const token = parts[1];
  const expiry = parseInt(parts[2], 10);

  if (!token || isNaN(expiry)) {
    return null;
  }

  return { token, expiry };
}

/**
 * GET /api/auth/accept-invite?token=...
 * Validate an invite token and return invite details
 *
 * @param req - Next.js request object
 * @returns JSON response with invite details or error
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Token is required'
        },
        { status: 400 }
      );
    }

    // Find user with pending invite token
    // Search for users where password starts with PENDING_INVITE prefix
    const users = await prisma.users.findMany({
      where: {
        password: {
          startsWith: PENDING_INVITE_PREFIX,
        },
      },
      include: {
        organization: {
          select: {
            name: true,
          },
        },
      },
    });

    // Find the user with the matching token
    const invitedUser = users.find((user) => {
      const inviteData = parseInviteData(user.password);
      return inviteData?.token === token;
    });

    if (!invitedUser) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Invalid invite token'
        },
        { status: 404 }
      );
    }

    // Parse the invite data to check expiry
    const inviteData = parseInviteData(invitedUser.password);
    if (!inviteData) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Invalid invite data format'
        },
        { status: 400 }
      );
    }

    // Check if token is expired
    const now = Date.now();
    if (inviteData.expiry < now) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Invite token has expired'
        },
        { status: 410 }
      );
    }

    // Return invite details
    return NextResponse.json({
      valid: true,
      email: invitedUser.email,
      orgName: invitedUser.organization?.name || 'Unknown Organization',
      role: invitedUser.role,
      expiresAt: new Date(inviteData.expiry).toISOString(),
    });
  } catch (error) {
    console.error('Error validating invite token:', error);
    return NextResponse.json(
      {
        valid: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/accept-invite
 * Accept an invite and set user password
 *
 * @param req - Next.js request object
 * @returns JSON response with success status or error
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body
    const parsed = acceptInviteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { token, password, name } = parsed.data;

    // Find user with pending invite token
    const users = await prisma.users.findMany({
      where: {
        password: {
          startsWith: PENDING_INVITE_PREFIX,
        },
      },
    });

    // Find the user with the matching token
    const invitedUser = users.find((user) => {
      const inviteData = parseInviteData(user.password);
      return inviteData?.token === token;
    });

    if (!invitedUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid invite token',
        },
        { status: 404 }
      );
    }

    // Parse the invite data to check expiry
    const inviteData = parseInviteData(invitedUser.password);
    if (!inviteData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid invite data format',
        },
        { status: 400 }
      );
    }

    // Check if token is expired
    const now = Date.now();
    if (inviteData.expiry < now) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invite token has expired',
        },
        { status: 410 }
      );
    }

    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Update user: set password, name, and activate account
    await prisma.users.update({
      where: { id: invitedUser.id },
      data: {
        password: hashedPassword,
        name,
        isActive: true,
      },
    });

    // Log the activity
    if (invitedUser.orgId) {
      await prisma.activityLog.create({
        data: {
          userId: invitedUser.id,
          orgId: invitedUser.orgId,
          action: 'ACCEPT_INVITE',
          entity: 'USER',
          entityId: invitedUser.id,
          metadata: {
            email: invitedUser.email,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Invite accepted successfully. You can now sign in.',
    });
  } catch (error) {
    console.error('Error accepting invite:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

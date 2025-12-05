import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createOrgSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(100, 'Organization name too long'),
});

/**
 * POST /api/onboarding/create-org
 *
 * Creates a new organization for the authenticated user.
 * Used during onboarding for new users (especially Google OAuth).
 *
 * Request Body:
 * {
 *   name: string (1-100 characters)
 * }
 *
 * Response: 200 OK
 * {
 *   organization: { id, name, createdAt },
 *   message: string
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 2. Check if user already has an organization
    const existingUser = await prisma.users.findUnique({
      where: { id: session.user.id },
      include: { organization: true },
    });

    if (existingUser?.organization) {
      return NextResponse.json(
        { error: 'You already have an organization' },
        { status: 400 }
      );
    }

    // 3. Validate request body
    const body = await req.json();
    const parsed = createOrgSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name } = parsed.data;

    // 4. Create organization and update user
    const organization = await prisma.organization.create({
      data: {
        name,
      },
    });

    await prisma.users.update({
      where: { id: session.user.id },
      data: {
        orgId: organization.id,
        role: 'ADMIN',
      },
    });

    console.log(`[Onboarding] Created organization "${name}" (${organization.id}) for user ${session.user.email}`);

    return NextResponse.json({
      organization: {
        id: organization.id,
        name: organization.name,
        createdAt: organization.createdAt,
      },
      message: 'Organization created successfully',
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}

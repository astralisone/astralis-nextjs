import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { orgSettingsService, isOrgAdmin, isOrgMember } from '@/lib/services/orgSettings.service';

// Validation schemas
const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum([
    UserRole.USER,
    UserRole.AUTHOR,
    UserRole.EDITOR,
    UserRole.ADMIN,
    UserRole.PM,
    UserRole.OPERATOR,
    UserRole.CLIENT,
  ], {
    errorMap: () => ({ message: 'Invalid role' }),
  }),
});

const updateRoleSchema = z.object({
  role: z.enum([
    UserRole.USER,
    UserRole.AUTHOR,
    UserRole.EDITOR,
    UserRole.ADMIN,
    UserRole.PM,
    UserRole.OPERATOR,
    UserRole.CLIENT,
  ], {
    errorMap: () => ({ message: 'Invalid role' }),
  }),
});

// Header names for user authentication (in production, use proper auth middleware)
const USER_ID_HEADER = 'x-user-id';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/orgs/[id]/members
 * Get all members of an organization
 * Requires: User must be a member of the organization
 */
export async function GET(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id: orgId } = await params;
    const userId = req.headers.get(USER_ID_HEADER);

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required', details: 'Missing user ID header' },
        { status: 401 }
      );
    }

    // Verify user is member of the organization
    const isMember = await isOrgMember(userId, orgId);
    if (!isMember) {
      return NextResponse.json(
        { error: 'Access denied', details: 'You are not a member of this organization' },
        { status: 403 }
      );
    }

    const members = await orgSettingsService.getOrgMembers(orgId);

    return NextResponse.json({
      members,
      count: members.length,
    });
  } catch (error) {
    console.error('Error fetching organization members:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orgs/[id]/members
 * Invite a new member to the organization
 * Requires: User must be an ADMIN of the organization
 */
export async function POST(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id: orgId } = await params;
    const userId = req.headers.get(USER_ID_HEADER);

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required', details: 'Missing user ID header' },
        { status: 401 }
      );
    }

    // Verify user is admin of the organization
    const isAdmin = await isOrgAdmin(userId, orgId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Access denied', details: 'Only organization admins can invite members' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const parsed = inviteMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, role } = parsed.data;

    const result = await orgSettingsService.inviteMember(
      orgId,
      userId,
      email,
      role
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error inviting member:', error);

    if (error instanceof Error) {
      // Handle specific service errors
      if (error.message.includes('admin')) {
        return NextResponse.json(
          { error: 'Access denied', details: error.message },
          { status: 403 }
        );
      }
      if (error.message.includes('already a member')) {
        return NextResponse.json(
          { error: 'Conflict', details: error.message },
          { status: 409 }
        );
      }
      if (error.message.includes('Invalid role')) {
        return NextResponse.json(
          { error: 'Validation failed', details: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/orgs/[id]/members
 * Remove a member from the organization
 * Requires: User must be an ADMIN of the organization
 * Body: { memberId: string }
 */
export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id: orgId } = await params;
    const userId = req.headers.get(USER_ID_HEADER);

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required', details: 'Missing user ID header' },
        { status: 401 }
      );
    }

    // Verify user is admin of the organization
    const isAdmin = await isOrgAdmin(userId, orgId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Access denied', details: 'Only organization admins can remove members' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await req.json();
    const memberId = body.memberId;

    if (!memberId || typeof memberId !== 'string') {
      return NextResponse.json(
        { error: 'Validation failed', details: 'memberId is required' },
        { status: 400 }
      );
    }

    const result = await orgSettingsService.removeMember(
      orgId,
      userId,
      memberId
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error removing member:', error);

    if (error instanceof Error) {
      // Handle specific service errors
      if (error.message.includes('admin')) {
        return NextResponse.json(
          { error: 'Access denied', details: error.message },
          { status: 403 }
        );
      }
      if (error.message.includes('yourself')) {
        return NextResponse.json(
          { error: 'Bad request', details: error.message },
          { status: 400 }
        );
      }
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Not found', details: error.message },
          { status: 404 }
        );
      }
      if (error.message.includes('last admin')) {
        return NextResponse.json(
          { error: 'Bad request', details: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orgs/[id]/members
 * Update a member's role
 * Requires: User must be an ADMIN of the organization
 * Body: { memberId: string, role: UserRole }
 */
export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id: orgId } = await params;
    const userId = req.headers.get(USER_ID_HEADER);

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required', details: 'Missing user ID header' },
        { status: 401 }
      );
    }

    // Verify user is admin of the organization
    const isAdmin = await isOrgAdmin(userId, orgId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Access denied', details: 'Only organization admins can update member roles' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await req.json();
    const memberId = body.memberId;

    if (!memberId || typeof memberId !== 'string') {
      return NextResponse.json(
        { error: 'Validation failed', details: 'memberId is required' },
        { status: 400 }
      );
    }

    // Validate the role
    const roleValidation = updateRoleSchema.safeParse({ role: body.role });
    if (!roleValidation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: roleValidation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await orgSettingsService.updateMemberRole(
      orgId,
      userId,
      memberId,
      roleValidation.data.role
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating member role:', error);

    if (error instanceof Error) {
      // Handle specific service errors
      if (error.message.includes('admin')) {
        return NextResponse.json(
          { error: 'Access denied', details: error.message },
          { status: 403 }
        );
      }
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: 'Not found', details: error.message },
          { status: 404 }
        );
      }
      if (error.message.includes('demote')) {
        return NextResponse.json(
          { error: 'Bad request', details: error.message },
          { status: 400 }
        );
      }
      if (error.message.includes('Invalid role')) {
        return NextResponse.json(
          { error: 'Validation failed', details: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

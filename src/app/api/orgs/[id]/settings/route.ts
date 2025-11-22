import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { orgSettingsService, isOrgAdmin, isOrgMember } from '@/lib/services/orgSettings.service';

// Validation schema for updating organization settings
const updateOrgSettingsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
});

// Header names for user authentication (in production, use proper auth middleware)
const USER_ID_HEADER = 'x-user-id';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/orgs/[id]/settings
 * Get organization settings
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

    const settings = await orgSettingsService.getOrgSettings(orgId);

    if (!settings) {
      return NextResponse.json(
        { error: 'Not found', details: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching organization settings:', error);
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
 * PUT /api/orgs/[id]/settings
 * Update organization settings
 * Requires: User must be an ADMIN of the organization
 */
export async function PUT(
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
        { error: 'Access denied', details: 'Only organization admins can update settings' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const parsed = updateOrgSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Check if there are any fields to update
    if (Object.keys(parsed.data).length === 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: 'No fields to update' },
        { status: 400 }
      );
    }

    const updatedSettings = await orgSettingsService.updateOrgSettings(
      orgId,
      userId,
      parsed.data
    );

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error updating organization settings:', error);

    if (error instanceof Error) {
      // Handle specific service errors
      if (error.message.includes('admin')) {
        return NextResponse.json(
          { error: 'Access denied', details: error.message },
          { status: 403 }
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

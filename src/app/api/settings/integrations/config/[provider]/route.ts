import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth/config';
import { decrypt } from '@/lib/utils/crypto';
import { IntegrationProvider } from '@prisma/client';

type RouteParams = {
  params: Promise<{ provider: string }>;
};

// GET - Get specific integration config
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { provider: providerParam } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate provider
    const provider = providerParam.toUpperCase() as IntegrationProvider;
    if (!Object.values(IntegrationProvider).includes(provider)) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    // Get user's organization
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { orgId: true, role: true },
    });

    if (!user?.orgId) {
      return NextResponse.json(
        { error: 'User is not part of an organization' },
        { status: 400 }
      );
    }

    // Only admins and operators can view integration configs
    if (!['ADMIN', 'OPERATOR'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const config = await prisma.organizationIntegrationConfig.findUnique({
      where: {
        orgId_provider: {
          orgId: user.orgId,
          provider,
        },
      },
    });

    if (!config) {
      return NextResponse.json(
        { error: 'Integration config not found' },
        { status: 404 }
      );
    }

    // Mask client ID
    const decryptedClientId = decrypt(config.clientId);

    return NextResponse.json({
      config: {
        id: config.id,
        provider: config.provider,
        clientId: maskSecret(decryptedClientId),
        hasClientSecret: true,
        customScopes: config.customScopes,
        redirectUri: config.redirectUri,
        metadata: config.metadata,
        isEnabled: config.isEnabled,
        isVerified: config.isVerified,
        verifiedAt: config.verifiedAt,
        configuredBy: config.configuredBy,
        createdAt: config.createdAt,
        updatedAt: config.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching integration config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch integration config' },
      { status: 500 }
    );
  }
}

// DELETE - Remove integration config
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    const { provider: providerParam } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate provider
    const provider = providerParam.toUpperCase() as IntegrationProvider;
    if (!Object.values(IntegrationProvider).includes(provider)) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    // Get user's organization
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { orgId: true, role: true },
    });

    if (!user?.orgId) {
      return NextResponse.json(
        { error: 'User is not part of an organization' },
        { status: 400 }
      );
    }

    // Only admins can delete integration configs
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only administrators can delete integration configs' },
        { status: 403 }
      );
    }

    // Check if config exists
    const existing = await prisma.organizationIntegrationConfig.findUnique({
      where: {
        orgId_provider: {
          orgId: user.orgId,
          provider,
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Integration config not found' },
        { status: 404 }
      );
    }

    // Delete the config
    await prisma.organizationIntegrationConfig.delete({
      where: {
        orgId_provider: {
          orgId: user.orgId,
          provider,
        },
      },
    });

    // Also deactivate any user credentials for this provider in the org
    await prisma.integrationCredential.updateMany({
      where: {
        orgId: user.orgId,
        provider,
      },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${provider} integration config deleted successfully`,
    });
  } catch (error) {
    console.error('Error deleting integration config:', error);
    return NextResponse.json(
      { error: 'Failed to delete integration config' },
      { status: 500 }
    );
  }
}

// Helper function to mask secrets
function maskSecret(secret: string): string {
  if (secret.length <= 8) {
    return '****' + secret.slice(-4);
  }
  return secret.slice(0, 4) + '****' + secret.slice(-4);
}

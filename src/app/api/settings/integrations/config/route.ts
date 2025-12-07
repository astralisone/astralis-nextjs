import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { encrypt, decrypt } from '@/lib/utils/crypto';
import { IntegrationProvider } from '@prisma/client';

// Schema for creating/updating an integration config
const configSchema = z.object({
  provider: z.nativeEnum(IntegrationProvider),
  clientId: z.string().min(1, 'Client ID is required'),
  clientSecret: z.string().min(1, 'Client Secret is required'),
  customScopes: z.string().optional(),
  redirectUri: z.string().url().optional().or(z.literal('')),
  metadata: z.record(z.unknown()).optional(),
  isEnabled: z.boolean().optional().default(true),
});

// GET - List all integration configs for the organization
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    const configs = await prisma.organizationIntegrationConfig.findMany({
      where: { orgId: user.orgId },
      select: {
        id: true,
        provider: true,
        clientId: true, // Will be masked in response
        customScopes: true,
        redirectUri: true,
        metadata: true,
        isEnabled: true,
        isVerified: true,
        verifiedAt: true,
        configuredBy: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { provider: 'asc' },
    });

    // Mask client IDs (show only last 4 characters)
    const maskedConfigs = configs.map((config) => {
      const decryptedClientId = decrypt(config.clientId);
      return {
        ...config,
        clientId: maskSecret(decryptedClientId),
        hasClientSecret: true, // Indicate secret is stored
      };
    });

    return NextResponse.json({ configs: maskedConfigs });
  } catch (error) {
    console.error('Error fetching integration configs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch integration configs' },
      { status: 500 }
    );
  }
}

// POST - Create or update an integration config
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Only admins can configure integrations
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only administrators can configure integrations' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = configSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { provider, clientId, clientSecret, customScopes, redirectUri, metadata, isEnabled } =
      validation.data;

    // Encrypt credentials before storing
    const encryptedClientId = encrypt(clientId);
    const encryptedClientSecret = encrypt(clientSecret);

    // Upsert the config
    const config = await prisma.organizationIntegrationConfig.upsert({
      where: {
        orgId_provider: {
          orgId: user.orgId,
          provider,
        },
      },
      update: {
        clientId: encryptedClientId,
        clientSecret: encryptedClientSecret,
        customScopes: customScopes || null,
        redirectUri: redirectUri || null,
        metadata: metadata || null,
        isEnabled,
        isVerified: false, // Reset verification when credentials change
        verifiedAt: null,
        configuredBy: session.user.id,
      },
      create: {
        orgId: user.orgId,
        provider,
        clientId: encryptedClientId,
        clientSecret: encryptedClientSecret,
        customScopes: customScopes || null,
        redirectUri: redirectUri || null,
        metadata: metadata || null,
        isEnabled,
        configuredBy: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      config: {
        id: config.id,
        provider: config.provider,
        clientId: maskSecret(clientId),
        hasClientSecret: true,
        customScopes: config.customScopes,
        redirectUri: config.redirectUri,
        isEnabled: config.isEnabled,
        isVerified: config.isVerified,
      },
    });
  } catch (error) {
    console.error('Error saving integration config:', error);
    return NextResponse.json(
      { error: 'Failed to save integration config' },
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

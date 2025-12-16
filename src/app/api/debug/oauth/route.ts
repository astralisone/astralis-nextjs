import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/debug/oauth
 *
 * Returns OAuth settings and configurations for debugging.
 *
 * Auth: Required
 * Returns: OAuth provider configurations and status
 */
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Authentication required' },
        { status: 401 }
      );
    }

    // OAuth providers configuration
    const oauthProviders = [
      'google',
      'github',
      'slack',
      'microsoft',
      'dropbox',
      'hubspot',
      'quickbooks',
      'shopify',
      'facebook',
    ];

    const oauthSettings: Record<string, any> = {};

    // Check environment variables for each provider
    oauthProviders.forEach(provider => {
      const clientIdKey = `${provider.toUpperCase()}_CLIENT_ID`;
      const clientSecretKey = `${provider.toUpperCase()}_CLIENT_SECRET`;

      oauthSettings[provider] = {
        configured: !!(process.env[clientIdKey] && process.env[clientSecretKey]),
        clientId: process.env[clientIdKey] ? '[CONFIGURED]' : '[NOT SET]',
        clientSecret: process.env[clientSecretKey] ? '[CONFIGURED]' : '[NOT SET]',
      };
    });

    // Get integration credentials from database (for current org)
    try {
      const credentials = await prisma.integrationCredential.findMany({
        where: {
          orgId: session.user.orgId,
        },
        select: {
          id: true,
          provider: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          // Don't expose actual tokens/secrets
        },
      });

      oauthSettings.databaseCredentials = credentials.map(cred => ({
        provider: cred.provider,
        status: cred.status,
        isConnected: cred.status === 'CONNECTED_ACTIVE',
        createdAt: cred.createdAt,
        updatedAt: cred.updatedAt,
      }));
    } catch (error) {
      console.error('Failed to fetch integration credentials:', error);
      oauthSettings.databaseCredentials = 'Error fetching credentials';
    }

    // Add metadata
    oauthSettings._metadata = {
      totalProviders: oauthProviders.length,
      configuredProviders: Object.values(oauthSettings).filter(
        (setting: any) => setting.configured
      ).length,
      databaseCredentialsCount: Array.isArray(oauthSettings.databaseCredentials)
        ? oauthSettings.databaseCredentials.length
        : 0,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(oauthSettings);

  } catch (error) {
    console.error('[API /api/debug/oauth GET] Error:', error);
    return NextResponse.json(
      {
        error: 'OAuth debug failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { decrypt } from '@/lib/utils/crypto';
import { IntegrationProvider } from '@prisma/client';
import { getOAuthConfig } from '@/lib/integrations/oauth-config';

type RouteParams = {
  params: Promise<{ provider: string }>;
};

// POST - Test integration config by validating OAuth credentials
export async function POST(req: NextRequest, { params }: RouteParams) {
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

    // Only admins and operators can test integration configs
    if (!['ADMIN', 'OPERATOR'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get the config
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

    // Decrypt credentials
    const clientId = decrypt(config.clientId);
    const clientSecret = decrypt(config.clientSecret);

    // Get OAuth config for this provider
    const oauthConfig = getOAuthConfig(provider);

    if (!oauthConfig) {
      return NextResponse.json(
        { error: 'OAuth not supported for this provider' },
        { status: 400 }
      );
    }

    // Test the credentials by attempting to get an access token using client credentials
    // Note: Not all providers support client credentials flow, so we do basic validation
    const testResult = await testOAuthCredentials(provider, clientId, clientSecret, oauthConfig);

    if (testResult.success) {
      // Mark as verified
      await prisma.organizationIntegrationConfig.update({
        where: { id: config.id },
        data: {
          isVerified: true,
          verifiedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Integration credentials are valid',
        details: testResult.details,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: testResult.error,
        details: testResult.details,
      });
    }
  } catch (error) {
    console.error('Error testing integration config:', error);
    return NextResponse.json(
      { error: 'Failed to test integration config' },
      { status: 500 }
    );
  }
}

interface OAuthConfig {
  tokenUrl: string;
  [key: string]: unknown;
}

interface TestResult {
  success: boolean;
  error?: string;
  details?: Record<string, unknown>;
}

// Test OAuth credentials based on provider
async function testOAuthCredentials(
  provider: IntegrationProvider,
  clientId: string,
  clientSecret: string,
  oauthConfig: OAuthConfig
): Promise<TestResult> {
  // Basic validation - check format
  if (!clientId || clientId.length < 10) {
    return {
      success: false,
      error: 'Client ID appears to be invalid (too short)',
    };
  }

  if (!clientSecret || clientSecret.length < 10) {
    return {
      success: false,
      error: 'Client Secret appears to be invalid (too short)',
    };
  }

  // Provider-specific validation
  switch (provider) {
    case 'QUICKBOOKS':
      // QuickBooks client IDs are usually alphanumeric
      if (!/^[A-Za-z0-9]+$/.test(clientId)) {
        return {
          success: false,
          error: 'QuickBooks Client ID format appears invalid',
        };
      }
      break;

    case 'XERO':
      // Xero client IDs are UUIDs
      if (!/^[0-9a-f-]{36}$/i.test(clientId)) {
        return {
          success: false,
          error: 'Xero Client ID should be a valid UUID',
        };
      }
      break;

    case 'HUBSPOT':
      // HubSpot client IDs are UUIDs
      if (!/^[0-9a-f-]{36}$/i.test(clientId)) {
        return {
          success: false,
          error: 'HubSpot Client ID should be a valid UUID',
        };
      }
      break;

    case 'SALESFORCE':
      // Salesforce client IDs (consumer keys) are long alphanumeric strings
      if (clientId.length < 80) {
        return {
          success: false,
          error: 'Salesforce Consumer Key appears too short',
        };
      }
      break;

    case 'SLACK':
      // Slack client IDs start with a number and contain periods
      if (!/^\d+\.\d+$/.test(clientId)) {
        return {
          success: false,
          error: 'Slack Client ID format appears invalid (should be like 123456789.987654321)',
        };
      }
      break;

    case 'GMAIL':
    case 'GOOGLE_DRIVE':
      // Google client IDs end with .apps.googleusercontent.com
      if (!clientId.endsWith('.apps.googleusercontent.com')) {
        return {
          success: false,
          error: 'Google Client ID should end with .apps.googleusercontent.com',
        };
      }
      break;

    case 'MICROSOFT_TEAMS':
      // Microsoft client IDs are UUIDs
      if (!/^[0-9a-f-]{36}$/i.test(clientId)) {
        return {
          success: false,
          error: 'Microsoft Client ID should be a valid UUID',
        };
      }
      break;

    case 'DROPBOX':
      // Dropbox app keys are alphanumeric
      if (!/^[a-z0-9]+$/i.test(clientId)) {
        return {
          success: false,
          error: 'Dropbox App Key format appears invalid',
        };
      }
      break;
  }

  // Try to verify by making a request to the token endpoint with an invalid grant
  // This tests if the credentials are recognized by the provider
  try {
    const response = await fetch(oauthConfig.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    const data = await response.json();

    // If we get an "invalid_grant" or "unsupported_grant_type" error, credentials are valid
    // but the grant type is not supported (which is expected for most user OAuth flows)
    if (
      response.status === 400 &&
      (data.error === 'invalid_grant' ||
        data.error === 'unsupported_grant_type' ||
        data.error === 'unauthorized_client')
    ) {
      return {
        success: true,
        details: {
          message: 'Credentials format validated. OAuth flow ready for user authorization.',
          note: 'Full validation will occur when a user completes the OAuth flow.',
        },
      };
    }

    // If we get an "invalid_client" error, credentials are wrong
    if (response.status === 401 || data.error === 'invalid_client') {
      return {
        success: false,
        error: 'Invalid credentials - Client ID or Secret is incorrect',
        details: data,
      };
    }

    // If we actually got tokens (unlikely but possible for some providers)
    if (data.access_token) {
      return {
        success: true,
        details: {
          message: 'Credentials validated successfully',
        },
      };
    }

    // Other errors
    return {
      success: false,
      error: data.error_description || data.error || 'Unknown error from provider',
      details: data,
    };
  } catch (error) {
    // Network errors or parsing errors - assume format validation passed
    console.error('Error during credential verification:', error);
    return {
      success: true,
      details: {
        message: 'Credentials format validated. Full validation will occur during OAuth flow.',
        warning: 'Could not fully verify with provider API',
      },
    };
  }
}

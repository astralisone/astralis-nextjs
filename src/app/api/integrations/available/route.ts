/**
 * Available Integrations API Route
 *
 * Returns only integrations that have OAuth credentials configured
 * for the authenticated user's organization.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { getOrgOAuthCredentials, supportsOAuth } from '@/lib/integrations/oauth-config';
import type { IntegrationProvider } from '@prisma/client';

const ALL_INTEGRATIONS: IntegrationProvider[] = [
  'GMAIL',
  'GOOGLE_DRIVE',
  'GOOGLE_DOCS',
  'SLACK',
  'MICROSOFT_TEAMS',
  'HUBSPOT',
  'SALESFORCE',
  'DROPBOX',
  'QUICKBOOKS',
  'XERO',
  'SHOPIFY',
  'FACEBOOK',
  'BAMBOOHR',
  'GITHUB',
];

/**
 * GET /api/integrations/available
 *
 * Returns integrations that have OAuth credentials configured for the org.
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!session.user.orgId) {
      return NextResponse.json(
        { error: 'Forbidden', details: 'Organization required' },
        { status: 403 }
      );
    }

    // Check which integrations have credentials configured
    const availableProviders: IntegrationProvider[] = [];

    for (const provider of ALL_INTEGRATIONS) {
      // Skip if provider doesn't support OAuth
      if (!supportsOAuth(provider)) {
        continue;
      }

      try {
        // Check if org has credentials for this provider
        const credentials = await getOrgOAuthCredentials(provider, session.user.orgId);
        if (credentials) {
          availableProviders.push(provider);
        }
      } catch (error) {
        // Skip providers with credential check errors
        console.warn(`Failed to check credentials for ${provider}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      providers: availableProviders,
      total: availableProviders.length,
    });
  } catch (error) {
    console.error('[API /api/integrations/available GET] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get available integrations',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
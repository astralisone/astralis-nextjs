import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';

/**
 * GET /api/debug/secrets
 *
 * Returns environment secrets for debugging.
 *
 * Auth: Required (admin only)
 * Returns: Filtered environment variables (safe to expose)
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

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden', details: 'Admin access required' },
        { status: 403 }
      );
    }

    // Define which environment variables are safe to expose
    const safeEnvVars = [
      'NODE_ENV',
      'VERCEL_ENV',
      'VERCEL_URL',
      'NEXTAUTH_URL',
      'DATABASE_URL',
      'REDIS_URL',
      'UPSTASH_REDIS_REST_URL',
      'N8N_HOST',
      'N8N_WEBHOOK_URL',
      'SMTP_HOST',
      'SMTP_PORT',
      // Add more as needed, but be careful not to expose sensitive keys
    ];

    // Collect safe environment variables
    const secrets: Record<string, string | undefined> = {};

    safeEnvVars.forEach(key => {
      const value = process.env[key];
      if (value) {
        // Mask sensitive parts of URLs/connections strings
        if (key.includes('URL') || key.includes('DATABASE') || key.includes('REDIS')) {
          secrets[key] = maskSensitiveUrl(value);
        } else {
          secrets[key] = value;
        }
      }
    });

    // Add some metadata
    secrets._metadata = {
      totalVars: safeEnvVars.length,
      exposedVars: Object.keys(secrets).length - 1, // -1 for _metadata
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(secrets);

  } catch (error) {
    console.error('[API /api/debug/secrets GET] Error:', error);
    return NextResponse.json(
      {
        error: 'Secrets debug failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Mask sensitive parts of URLs/connection strings
 */
function maskSensitiveUrl(url: string): string {
  try {
    // Handle database URLs like postgresql://user:password@host:port/db
    const urlPattern = /^([^:]+:\/\/)([^:]+):([^@]+)@(.*)$/;
    const match = url.match(urlPattern);

    if (match) {
      const [_, protocol, user, password, rest] = match;
      return `${protocol}${user}:***@${rest}`;
    }

    // If no pattern matches, return as-is (shouldn't happen with our safe vars)
    return url;
  } catch {
    return '[MASKED]';
  }
}
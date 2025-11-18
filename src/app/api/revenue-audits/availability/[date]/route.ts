import { NextRequest, NextResponse } from 'next/server';

/**
 * Revenue Audit availability check endpoint
 * Forwards to Express backend on port 3000
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  const { date } = await params;
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
  const targetUrl = `${apiBaseUrl}/api/revenue-audits/availability/${date}`;

  try {
    // Forward the request to the Express backend
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Parse JSON response
    const data = await response.json();

    // Forward response with original status code
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Revenue audit availability proxy error:', {
      date,
      error: error instanceof Error ? error.message : error,
    });

    return NextResponse.json(
      {
        error: 'Failed to fetch availability',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

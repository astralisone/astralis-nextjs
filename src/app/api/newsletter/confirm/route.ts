import { NextRequest, NextResponse } from 'next/server';

/**
 * Newsletter subscription confirmation endpoint
 * Forwards to Express backend on port 3000
 */
export async function GET(request: NextRequest) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  // Get token from query parameters
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        message: 'Confirmation token is required',
      },
      { status: 400 }
    );
  }

  const targetUrl = `${apiBaseUrl}/api/newsletter/confirm/${encodeURIComponent(token)}`;

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
    console.error('Newsletter confirmation proxy error:', {
      token: token?.substring(0, 10) + '...',
      error: error instanceof Error ? error.message : error,
    });

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to confirm newsletter subscription. Please try again later.',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

/**
 * Newsletter subscription endpoint
 * Forwards to Express backend on port 3000
 */
export async function POST(request: NextRequest) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
  const targetUrl = `${apiBaseUrl}/api/newsletter/subscribe`;

  try {
    // Get request body
    const body = await request.json();

    // Forward the request to the Express backend
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Parse JSON response
    const data = await response.json();

    // Forward response with original status code
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Newsletter subscription proxy error:', {
      error: error instanceof Error ? error.message : error,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process newsletter subscription',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

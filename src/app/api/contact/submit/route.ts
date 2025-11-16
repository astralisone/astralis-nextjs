import { NextRequest, NextResponse } from 'next/server';

/**
 * Contact form submission endpoint
 * Forwards to Express backend on port 3000
 */
export async function POST(request: NextRequest) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
  const targetUrl = `${apiBaseUrl}/api/contact/submit`;

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
    console.error('Contact form proxy error:', {
      error: error instanceof Error ? error.message : error,
    });

    return NextResponse.json(
      {
        error: 'Failed to submit contact form',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

// This is a generic proxy route handler for the Express backend
// It forwards all requests to the Express API running on port 3000

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'DELETE');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path, 'PATCH');
}

async function proxyRequest(
  request: NextRequest,
  path: string[],
  method: string
) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  // Include query parameters from the original request
  const searchParams = request.nextUrl.searchParams.toString();
  const queryString = searchParams ? `?${searchParams}` : '';
  const targetUrl = `${apiBaseUrl}/api/${path.join('/')}${queryString}`;

  try {
    // Get request body for POST/PUT/PATCH requests
    let body = undefined;
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const contentType = request.headers.get('Content-Type') || '';

      // Handle different content types
      if (contentType.includes('multipart/form-data')) {
        // For file uploads, pass FormData directly
        body = await request.formData();
      } else if (contentType.includes('application/json')) {
        // For JSON, get text to preserve formatting
        body = await request.text();
      } else {
        // For other types, get as text
        body = await request.text();
      }
    }

    // Forward important headers to the backend
    const headers: HeadersInit = {
      'Content-Type': request.headers.get('Content-Type') || 'application/json',
    };

    // Forward authentication header
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Forward cookies
    const cookieHeader = request.headers.get('Cookie');
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    // Forward user agent for analytics
    const userAgent = request.headers.get('User-Agent');
    if (userAgent) {
      headers['User-Agent'] = userAgent;
    }

    // Forward the request to the Express backend
    const response = await fetch(targetUrl, {
      method,
      headers,
      body: body as any,
    });

    // Handle non-JSON responses (like file downloads)
    const contentType = response.headers.get('Content-Type') || '';
    if (!contentType.includes('application/json')) {
      const blob = await response.blob();
      return new NextResponse(blob, {
        status: response.status,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': response.headers.get('Content-Disposition') || '',
        },
      });
    }

    // Parse JSON response
    const data = await response.json();

    // Forward response with original status code
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Cache-Control': response.headers.get('Cache-Control') || 'no-store',
      },
    });
  } catch (error) {
    console.error('API Proxy Error:', {
      path: path.join('/'),
      method,
      error: error instanceof Error ? error.message : error,
    });

    return NextResponse.json(
      {
        error: 'Failed to proxy request to backend',
        message: error instanceof Error ? error.message : 'Unknown error',
        path: path.join('/'),
      },
      { status: 500 }
    );
  }
}

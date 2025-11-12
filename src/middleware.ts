import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for route protection and authentication
 *
 * This middleware runs before every route and can:
 * - Protect authenticated routes
 * - Protect admin routes
 * - Redirect based on auth status
 * - Add custom headers
 */

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/checkout',
  '/orders',
  '/dashboard',
  '/profile',
  '/account',
];

// Routes that require admin role
const ADMIN_ROUTES = [
  '/admin',
];

// Routes that should redirect to home if user is already authenticated
const AUTH_ROUTES = [
  '/login',
  '/register',
  '/signup',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get authentication token from cookies or headers
  const token = getAuthToken(request);
  const isAuthenticated = !!token;

  // Get user role from token (you'll need to implement JWT verification)
  const userRole = getUserRole(token);
  const isAdmin = userRole === 'ADMIN';

  // Protect admin routes
  if (isAdminRoute(pathname)) {
    if (!isAuthenticated) {
      return redirectToLogin(request);
    }
    if (!isAdmin) {
      return redirectToHome(request, 'Unauthorized access');
    }
  }

  // Protect authenticated routes
  if (isProtectedRoute(pathname)) {
    if (!isAuthenticated) {
      return redirectToLogin(request);
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute(pathname) && isAuthenticated) {
    return redirectToHome(request);
  }

  // Continue with the request
  const response = NextResponse.next();

  // Add custom headers
  response.headers.set('x-middleware-cache', 'no-cache');

  return response;
}

/**
 * Helper Functions
 */

function getAuthToken(request: NextRequest): string | null {
  // Try to get token from Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try to get token from cookies
  const tokenFromCookie = request.cookies.get('token')?.value;
  if (tokenFromCookie) {
    return tokenFromCookie;
  }

  // Try NextAuth session token
  const nextAuthToken = request.cookies.get('next-auth.session-token')?.value;
  if (nextAuthToken) {
    return nextAuthToken;
  }

  return null;
}

function getUserRole(token: string | null): string | null {
  if (!token) return null;

  try {
    // TODO: Implement proper JWT verification
    // For now, we'll use a simple base64 decode (NOT SECURE IN PRODUCTION)
    // In production, use a library like 'jose' or 'jsonwebtoken'
    const payload = parseJwtPayload(token);
    return payload?.role || null;
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
}

function parseJwtPayload(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some((route) => pathname.startsWith(route));
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL('/', request.url);
  loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
  loginUrl.searchParams.set('message', 'Please login to continue');
  return NextResponse.redirect(loginUrl);
}

function redirectToHome(request: NextRequest, message?: string): NextResponse {
  const homeUrl = new URL('/', request.url);
  if (message) {
    homeUrl.searchParams.set('message', message);
  }
  return NextResponse.redirect(homeUrl);
}

/**
 * Middleware Configuration
 *
 * Define which paths should be processed by this middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth (auth endpoints)
     * - api/proxy (proxy endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public files (images, etc.)
     */
    '/((?!api/auth|api/proxy|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};

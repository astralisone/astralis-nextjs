import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/config';

// Routes that require authentication
const protectedRoutes = [
  '/astralisops/dashboard',
  '/astralisops/pipelines',
  '/astralisops/intake',
  '/astralisops/documents',
  '/astralisops/scheduling',
  '/astralisops/automations',
  '/astralisops/settings',
];

// Routes that should redirect to dashboard if authenticated
const authRoutes = [
  '/auth/signin',
  '/auth/signup',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session
  const session = await auth();

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Redirect to signin if accessing protected route without auth
  if (isProtectedRoute && !session) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect to dashboard if accessing auth routes while authenticated
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/astralisops/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};

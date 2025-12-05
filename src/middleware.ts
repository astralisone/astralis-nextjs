import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Skip middleware for API routes, Next.js internal routes, and static files
    if (
      pathname.startsWith('/api/') ||
      pathname.startsWith('/_next/') ||
      pathname === '/favicon.ico'
    ) {
      return NextResponse.next();
    }

    // Routes that should redirect to dashboard if authenticated
    const authRoutes = ['/auth/signin', '/auth/signup'];
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

    // Redirect to dashboard if accessing auth routes while authenticated
    if (isAuthRoute && token) {
      // If user has no org, redirect to onboarding instead
      if (!token.orgId) {
        return NextResponse.redirect(new URL('/onboarding', req.url));
      }
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Routes that require authentication and organization
    const protectedRoutes = [
      '/dashboard',
      '/pipelines',
      '/intake',
      '/documents',
      '/scheduling',
      '/automations',
      '/settings',
    ];

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    // If user is authenticated but has no org, redirect to onboarding
    if (isProtectedRoute && token && !token.orgId) {
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }

    // If on onboarding page but already has org, redirect to dashboard
    if (pathname === '/onboarding' && token?.orgId) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Always allow API routes, Next.js internals, and static files
        if (
          pathname.startsWith('/api/') ||
          pathname.startsWith('/_next/') ||
          pathname === '/favicon.ico'
        ) {
          return true;
        }

        // Onboarding page requires authentication but not org
        if (pathname === '/onboarding') {
          return !!token;
        }

        // Routes that require authentication (using (app) route group paths)
        const protectedRoutes = [
          '/dashboard',
          '/pipelines',
          '/intake',
          '/documents',
          '/scheduling',
          '/automations',
          '/settings',
        ];

        const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

        // Allow access to protected routes only if token exists
        if (isProtectedRoute) {
          return !!token;
        }

        // Allow access to all other routes
        return true;
      },
    },
    pages: {
      signIn: '/auth/signin',
    },
  }
);

export const config = {
  // Match all routes - exclusions are handled in middleware function above
  matcher: [
    '/(.*)',
  ],
};

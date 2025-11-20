import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Routes that should redirect to dashboard if authenticated
    const authRoutes = ['/auth/signin', '/auth/signup'];
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

    // Redirect to dashboard if accessing auth routes while authenticated
    if (isAuthRoute && token) {
      return NextResponse.redirect(new URL('/astralisops/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

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

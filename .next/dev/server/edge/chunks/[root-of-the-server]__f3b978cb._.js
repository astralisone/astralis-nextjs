(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__f3b978cb._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/projects/astralis-nextjs/src/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$buffer__$5b$external$5d$__$28$node$3a$buffer$2c$__cjs$29$__ = /*#__PURE__*/ __turbopack_context__.i("[externals]/node:buffer [external] (node:buffer, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/astralis-nextjs/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
;
/**
 * Middleware for route protection and authentication
 *
 * This middleware runs before every route and can:
 * - Protect authenticated routes
 * - Protect admin routes
 * - Redirect based on auth status
 * - Add custom headers
 */ // Routes that require authentication
const PROTECTED_ROUTES = [
    '/checkout',
    '/orders',
    '/dashboard',
    '/profile',
    '/account'
];
// Routes that require admin role
const ADMIN_ROUTES = [
    '/admin'
];
// Routes that should redirect to home if user is already authenticated
const AUTH_ROUTES = [
    '/login',
    '/register',
    '/signup'
];
function middleware(request) {
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
    const response = __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
    // Add custom headers
    response.headers.set('x-middleware-cache', 'no-cache');
    return response;
}
/**
 * Helper Functions
 */ function getAuthToken(request) {
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
function getUserRole(token) {
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
function parseJwtPayload(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = parts[1];
        const decoded = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$buffer__$5b$external$5d$__$28$node$3a$buffer$2c$__cjs$29$__["Buffer"].from(payload, 'base64').toString('utf-8');
        return JSON.parse(decoded);
    } catch (error) {
        return null;
    }
}
function isProtectedRoute(pathname) {
    return PROTECTED_ROUTES.some((route)=>pathname.startsWith(route));
}
function isAdminRoute(pathname) {
    return ADMIN_ROUTES.some((route)=>pathname.startsWith(route));
}
function isAuthRoute(pathname) {
    return AUTH_ROUTES.some((route)=>pathname.startsWith(route));
}
function redirectToLogin(request) {
    const loginUrl = new URL('/', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    loginUrl.searchParams.set('message', 'Please login to continue');
    return __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(loginUrl);
}
function redirectToHome(request, message) {
    const homeUrl = new URL('/', request.url);
    if (message) {
        homeUrl.searchParams.set('message', message);
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$astralis$2d$nextjs$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(homeUrl);
}
const config = {
    matcher: [
        /*
     * Match all request paths except:
     * - api/auth (auth endpoints)
     * - api/proxy (proxy endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public files (images, etc.)
     */ '/((?!api/auth|api/proxy|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__f3b978cb._.js.map
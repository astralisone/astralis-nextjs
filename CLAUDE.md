# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Development Server
```bash
# Start Next.js development server on port 3001
npm run dev

# Requires Express backend running on port 3000
# Backend location: /Users/gregorystarr/projects/astralis-agency-server
cd /Users/gregorystarr/projects/astralis-agency-server && yarn server:dev
```

### Build & Production
```bash
# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

### Environment Setup
```bash
# Copy environment template
cp .env.local.template .env.local

# Edit .env.local with required values:
# - DATABASE_URL (PostgreSQL connection)
# - NEXTAUTH_SECRET (auth secret key)
# - NEXT_PUBLIC_API_BASE_URL (backend URL)
# - Payment provider keys (PayPal, Stripe)
```

## Architecture Overview

### Hybrid Routing Strategy
This project uses **both App Router and Pages Router** in a single Next.js 15 application:

- **App Router** (`/src/app`) - SEO-critical pages with SSR/SSG
  - Marketing pages (homepage, about, contact)
  - Blog posts (with dynamic routes)
  - Marketplace (product listings)
  - API Route Handlers

- **Pages Router** (`/src/pages`) - Interactive dashboards
  - Admin dashboard (`/admin`)
  - Checkout flow (`/checkout`)
  - Order management (`/orders`)
  - User authentication pages

**Why Hybrid?**
- App Router: Better SEO, streaming SSR, React Server Components
- Pages Router: Simpler client-side interactivity for dashboards

### Technology Stack
- **Framework**: Next.js 15.0.1 with React 19.2.0
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS 4 with dark theme design system
- **State Management**: Zustand 5.0.8 (auth, cart stores)
- **Forms**: React Hook Form 7.66.0 + Zod 4.1.12 validation
- **Authentication**: NextAuth.js v5 beta
- **Database**: Prisma with PostgreSQL (via Express backend)
- **Payments**: PayPal & Stripe integration
- **UI Components**: 21+ Radix UI primitives
- **HTTP Client**: Axios with interceptors
- **Animations**: Framer Motion 12

### API Integration Architecture

The Next.js app communicates with an Express backend through a proxy system:

```
Next.js (Port 3001) → API Proxy → Express Backend (Port 3000)
```

**Key Files:**
- `next.config.ts` - Rewrites `/api/*` requests to Express backend
- `src/app/api/proxy/[...path]/route.ts` - Enhanced proxy handler
- `src/lib/api/client.ts` - Axios client for client components
- `src/lib/api/server.ts` - Fetch wrapper for server components
- `src/middleware.ts` - Route protection and auth middleware

**API Client Usage:**
```typescript
// Client Components
'use client';
import { apiClient } from '@/lib/api';
const posts = await apiClient.get('/api/blog/posts');

// Server Components
import { serverApiClient } from '@/lib/api';
const posts = await serverApiClient.get('/blog/posts');
```

### Dark Theme Design System

Comprehensive dark theme with glassmorphism effects:

**Color System:**
- Primary: Purple-violet gradient (258° hue, 10 shades)
- Secondary: Blue accents (217° hue)
- Neutral: Dark backgrounds (220° hue, 3-95% lightness)

**Key Utilities:**
- `.glass-card` - Glassmorphism effects
- `.glass-elevated` - Enhanced elevation
- Gradient text utilities
- Enhanced backdrop blur system

**Tailwind Configuration:**
- Extended color palette with CSS custom properties
- Glassmorphism shadow utilities
- Enhanced animation keyframes
- Responsive typography system

### State Management

**Zustand Stores:**
- `src/lib/store/auth.ts` - Authentication state
- `src/lib/store/cart.ts` - Shopping cart state

**Usage:**
```typescript
import { useAuthStore } from '@/lib/store';

const { user, login, logout } = useAuthStore();
```

### Directory Structure

```
src/
├── app/                      # App Router (Next.js 13+)
│   ├── (marketing)/         # Route group for marketing pages
│   ├── marketplace/         # Product listings (SSR)
│   ├── blog/               # Blog system (SSR/SSG)
│   ├── api/                # API Route Handlers
│   │   ├── proxy/          # Backend proxy
│   │   └── auth/           # NextAuth endpoints
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles + dark theme
├── pages/                   # Pages Router (legacy)
│   ├── admin/              # Admin dashboard
│   ├── checkout/           # Checkout flow
│   ├── orders/             # Order management
│   └── _app.tsx           # Pages Router wrapper
├── components/
│   ├── ui/                 # 81 UI components (Radix-based)
│   ├── sections/           # Page sections (Hero, CTA, etc.)
│   ├── providers/          # Context providers
│   └── layouts/            # Layout components
├── lib/
│   ├── api/                # API clients (client + server)
│   ├── store/              # Zustand stores
│   ├── utils/              # Utility functions
│   └── config/             # Configuration
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript type definitions
├── data/                    # Static data files
└── middleware.ts           # Route protection middleware
```

## Migration Context

This project is a **Next.js 15 migration** of an existing React + Vite application.

**Original Project:** `/Users/gregorystarr/projects/astralis-agency-server/client`
**Migration Status:** Phase 1 Complete (Foundation), Phase 2+ In Progress

**Important Files:**
- `MIGRATION_CHECKLIST.md` - Detailed migration tracking
- `API_INTEGRATION_SUMMARY.md` - Complete API integration docs
- `PROJECT_STRUCTURE.md` - Detailed structure guide
- `README.md` - Setup and getting started

## Development Patterns

### Component Migration Pattern
When migrating components from the original React app:

1. **Update Imports:**
   ```typescript
   // Old (React Router)
   import { Link, useNavigate } from 'react-router-dom';

   // New (Next.js App Router)
   import Link from 'next/link';
   import { useRouter } from 'next/navigation';

   // New (Next.js Pages Router)
   import Link from 'next/link';
   import { useRouter } from 'next/router';
   ```

2. **Update Navigation:**
   ```typescript
   // Old
   <Link to="/about">About</Link>
   navigate('/dashboard');

   // New
   <Link href="/about">About</Link>
   router.push('/dashboard');
   ```

3. **Client/Server Directives:**
   - Add `'use client'` to components using hooks, state, or browser APIs
   - Server components are default in App Router (no directive needed)

### Authentication Flow

**Middleware Protection:**
- Protected routes: `/checkout`, `/orders`, `/dashboard`, `/profile`, `/account`
- Admin routes: `/admin/*`
- Auth routes: `/login`, `/register` (redirect if authenticated)

**Token Storage:**
- JWT tokens stored in localStorage (client-side)
- Automatic token injection via Axios interceptor
- Auto-logout on 401 response

**Current State:**
- Basic JWT parsing implemented (NOT production-ready)
- NextAuth.js configured but needs full integration
- Prisma adapter ready for session management

### API Proxy System

**How It Works:**
1. Client makes request to `/api/blog/posts`
2. Next.js rewrites to `/api/proxy/blog/posts`
3. Proxy handler forwards to `http://localhost:3000/api/blog/posts`
4. Express backend processes request
5. Response returned through proxy to client

**Proxy Features:**
- All HTTP methods supported (GET, POST, PUT, DELETE, PATCH)
- Query parameter forwarding
- Header preservation (Authorization, Cookie, User-Agent)
- Multipart form-data support (file uploads)
- Non-JSON response handling (downloads, images)

### Payment Integration

**Providers:**
- PayPal: `@paypal/react-paypal-js` (v8.9.2)
- Stripe: `@stripe/stripe-js` (v8.4.0)

**Configuration:**
- Environment variables for API keys
- Provider components in `src/components/providers/`
- Checkout flow in `src/pages/checkout/`

## Common Tasks

### Adding a New Page

**App Router (SEO-optimized):**
```typescript
// src/app/my-page/page.tsx
export default function MyPage() {
  return <div>My Page</div>;
}

// With metadata
export const metadata = {
  title: 'My Page | Astralis',
  description: 'Page description',
};
```

**Pages Router (Interactive):**
```typescript
// src/pages/my-page.tsx
export default function MyPage() {
  return <div>My Page</div>;
}
```

### Adding a New API Endpoint

Create Route Handler in App Router:
```typescript
// src/app/api/my-endpoint/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ data: 'Hello' });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ received: body });
}
```

### Creating a UI Component

Follow existing patterns in `src/components/ui/`:
```typescript
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface MyComponentProps {
  className?: string;
  children: React.ReactNode;
}

const MyComponent = React.forwardRef<HTMLDivElement, MyComponentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('base-styles', className)} {...props}>
        {children}
      </div>
    );
  }
);
MyComponent.displayName = 'MyComponent';

export { MyComponent };
```

### Using Zustand Store

```typescript
// Create store
import { create } from 'zustand';

interface MyStore {
  count: number;
  increment: () => void;
}

export const useMyStore = create<MyStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// Use in component
'use client';
import { useMyStore } from '@/lib/store/my-store';

export function Counter() {
  const { count, increment } = useMyStore();
  return <button onClick={increment}>Count: {count}</button>;
}
```

## Port Configuration

**Critical: Two Separate Servers**
- **Next.js Frontend**: `http://localhost:3001`
- **Express Backend**: `http://localhost:3000`

Both must run simultaneously for full functionality.

## TypeScript Configuration

- Strict mode enabled
- Path alias: `@/*` maps to `./src/*`
- Target: ES2017
- Module resolution: bundler
- JSX: react-jsx (React 19)

## Build Considerations

**Current Build Issues (Unrelated to API):**
- Tailwind v4 compatibility adjustments needed
- Some Page Router components still being migrated
- Duplicate route definitions being resolved

**API Integration:** ✅ Fully functional

## Security Notes

**Current Implementation:**
- ✅ Token-based authentication
- ✅ Route protection middleware
- ✅ Role-based access control
- ✅ CORS handling via proxy

**Production TODOs:**
- Implement proper JWT verification with `jose` or `jsonwebtoken`
- Move tokens to httpOnly cookies (more secure than localStorage)
- Add CSRF protection
- Implement rate limiting
- Add refresh token mechanism
- Enhance input validation

## Testing Strategy

**Server:**
- Jest + Supertest for API testing (on Express backend)

**Client:**
- Testing Library for component testing (to be configured)

**E2E:**
- Consider Playwright or Cypress for full flow testing

## Deployment Notes

**Build Command:** `npm run build`
**Start Command:** `npm run start`

**Environment Variables Required:**
- DATABASE_URL
- NEXTAUTH_SECRET
- NEXT_PUBLIC_API_BASE_URL
- Payment provider keys

**Production Considerations:**
- Configure proper NEXTAUTH_URL
- Update API_BASE_URL to production backend
- Ensure PostgreSQL database is accessible
- Configure CDN for static assets
- Set up error tracking (Sentry, etc.)

## Related Projects

**Express Backend:** `/Users/gregorystarr/projects/astralis-agency-server`
- Contains Prisma schema, database migrations, API endpoints
- Serves as data layer for Next.js frontend
- See its CLAUDE.md for backend-specific guidance

## Key Dependencies

**UI & Styling:**
- Tailwind CSS 4 with custom dark theme
- Radix UI primitives (21+ packages)
- Framer Motion for animations
- Lucide React for icons

**Forms & Validation:**
- React Hook Form 7.66.0
- Zod 4.1.12
- Hookform Resolvers

**State & Data:**
- Zustand 5.0.8
- Axios for HTTP
- SWR or React Query (consider adding)

**Authentication:**
- NextAuth.js v5 (beta)
- Auth Prisma Adapter

**Utilities:**
- date-fns (date formatting)
- clsx + tailwind-merge (class merging)
- class-variance-authority (variant management)

# Project Structure - Next.js 15 Foundation

## Overview

This document outlines the complete directory structure created for the Astralis Agency Next.js 15 migration.

## Directory Tree

```
astralis-nextjs/
├── src/
│   ├── app/                              # App Router (Next.js 13+)
│   │   ├── (marketing)/                 # Route group for marketing
│   │   │   ├── about/
│   │   │   │   └── page.tsx            # /about route
│   │   │   ├── contact/
│   │   │   │   └── page.tsx            # /contact route
│   │   │   ├── layout.tsx               # Marketing layout wrapper
│   │   │   └── page.tsx                 # / (homepage) route
│   │   ├── api/                         # API Route Handlers
│   │   │   ├── auth/                    # Auth endpoints (placeholder)
│   │   │   └── proxy/
│   │   │       └── [...path]/
│   │   │           └── route.ts         # Generic API proxy to Express
│   │   ├── blog/
│   │   │   └── page.tsx                 # /blog route
│   │   ├── marketplace/
│   │   │   └── page.tsx                 # /marketplace route
│   │   ├── globals.css                  # Global styles
│   │   └── layout.tsx                   # Root layout
│   ├── components/                       # Shared components
│   │   ├── layouts/                     # Layout components (empty, ready for migration)
│   │   ├── providers/                   # Context providers (empty, ready for migration)
│   │   ├── sections/                    # Page sections (empty, ready for migration)
│   │   └── ui/                          # UI components (empty, ready for 81 components)
│   ├── lib/                             # Utilities and configurations
│   │   ├── api/
│   │   │   └── client.ts                # Axios instance with interceptors
│   │   ├── hooks/                       # Custom React hooks (empty, ready for migration)
│   │   ├── store/
│   │   │   ├── auth.ts                  # Zustand auth store
│   │   │   └── cart.ts                  # Zustand cart store
│   │   └── utils/
│   │       ├── cn.ts                    # Tailwind class merge utility
│   │       └── index.ts                 # Utils barrel export
│   ├── pages/                           # Pages Router (legacy)
│   │   ├── admin/
│   │   │   └── index.tsx                # /admin route
│   │   ├── checkout/
│   │   │   └── index.tsx                # /checkout route
│   │   ├── orders/
│   │   │   └── index.tsx                # /orders route
│   │   └── _app.tsx                     # Pages Router wrapper
│   ├── styles/                          # Additional styles (empty, ready for migration)
│   └── middleware.ts                    # Next.js middleware (basic auth structure)
├── .env.local.template                   # Environment variables template
├── .gitignore
├── eslint.config.mjs
├── next.config.ts                        # Next.js configuration with API proxy
├── next-env.d.ts
├── package.json                          # Dependencies and scripts
├── PROJECT_STRUCTURE.md                  # This file
├── README.md                             # Project documentation
├── tailwind.config.ts                    # Tailwind CSS configuration
└── tsconfig.json                         # TypeScript configuration

## Routing Strategy

### App Router (`/src/app`)
Used for SEO-critical, content-heavy pages that benefit from:
- Server-side rendering (SSR)
- Static site generation (SSG)
- React Server Components
- Streaming
- Better SEO optimization

**Routes:**
- `/` - Homepage (marketing)
- `/about` - About page
- `/contact` - Contact page
- `/marketplace` - Product listing
- `/blog` - Blog posts

### Pages Router (`/src/pages`)
Used for interactive, client-heavy pages that need:
- Client-side rendering
- Complex state management
- Real-time interactivity
- Backward compatibility

**Routes:**
- `/admin` - Admin dashboard
- `/checkout` - Checkout flow
- `/orders` - Order management

## Configuration Files

### `next.config.ts`
- API proxy configuration (rewrites `/api/*` to Express backend)
- Image optimization settings
- React strict mode enabled

### `tsconfig.json`
- Path aliases: `@/*` → `./src/*`
- Strict TypeScript mode
- Next.js plugin configured

### `package.json`
- Dev server on port 3001
- Production server on port 3001
- All core dependencies installed

## State Management

### Zustand Stores

**Auth Store** (`/src/lib/store/auth.ts`)
- User authentication state
- Token management
- Login/logout functions
- Persisted to localStorage

**Cart Store** (`/src/lib/store/cart.ts`)
- Shopping cart items
- Add/remove/update items
- Calculate total
- Persisted to localStorage

## API Integration

### API Client (`/src/lib/api/client.ts`)
- Axios instance configured
- Request interceptor (adds auth token)
- Response interceptor (handles 401 errors)
- Base URL: `http://localhost:3000`

### API Proxy (`/src/app/api/proxy/[...path]/route.ts`)
- Generic proxy for all API routes
- Forwards requests to Express backend
- Handles GET, POST, PUT, DELETE, PATCH
- Preserves headers and request body

## Middleware

### Auth Middleware (`/src/middleware.ts`)
- Basic structure for authentication
- Protects routes: `/admin`, `/checkout`, `/orders`
- Ready for NextAuth.js integration
- Configured matcher excludes static files

## Dependencies Installed

### Core Framework
- next@16.0.1
- react@19.2.0
- react-dom@19.2.0
- typescript@5

### State & Forms
- zustand@5.0.8
- react-hook-form@7.66.0
- zod@4.1.12
- @hookform/resolvers@5.2.2

### Authentication
- next-auth@5.0.0-beta.30
- @auth/prisma-adapter@2.11.1

### Database
- @prisma/client@6.19.0

### Payments
- @paypal/react-paypal-js@8.9.2
- @stripe/stripe-js@8.4.0

### API Client
- axios@1.13.2

### UI Components (21 Radix UI packages)
- @radix-ui/react-dialog
- @radix-ui/react-dropdown-menu
- @radix-ui/react-toast
- @radix-ui/react-tabs
- @radix-ui/react-accordion
- @radix-ui/react-alert-dialog
- @radix-ui/react-avatar
- @radix-ui/react-checkbox
- @radix-ui/react-collapsible
- @radix-ui/react-context-menu
- @radix-ui/react-hover-card
- @radix-ui/react-label
- @radix-ui/react-popover
- @radix-ui/react-progress
- @radix-ui/react-radio-group
- @radix-ui/react-scroll-area
- @radix-ui/react-select
- @radix-ui/react-separator
- @radix-ui/react-slider
- @radix-ui/react-switch
- @radix-ui/react-tooltip

### Styling
- tailwindcss@4
- @tailwindcss/postcss@4
- clsx@2.1.1
- tailwind-merge@3.4.0

## Next Steps for Other Agents

### 1. Design System Migration
**Location:** `/Users/gregorystarr/projects/astralis-agency-server/client/src`

Files to migrate:
- `tailwind.config.js` → copy to Next.js project
- `src/index.css` → merge into `src/app/globals.css`
- Dark theme utilities and glassmorphism classes

### 2. UI Components Migration
**Source:** `/Users/gregorystarr/projects/astralis-agency-server/client/src/components/ui`
**Destination:** `/Users/gregorystarr/projects/astralis-nextjs/src/components/ui`

81 components to migrate with updated imports:
- Change `@/` imports to use Next.js paths
- Verify all components work with React 19
- Preserve dark theme styling

### 3. Section Components Migration
**Source:** `/Users/gregorystarr/projects/astralis-agency-server/client/src/components/sections`
**Destination:** `/Users/gregorystarr/projects/astralis-nextjs/src/components/sections`

Migrate all marketing section components

### 4. Page Components Migration
**Source:** `/Users/gregorystarr/projects/astralis-agency-server/client/src/pages`
**Destination:** Convert to App Router pages or Pages Router

Transform existing pages to Next.js routing structure

### 5. Provider Components
**Source:** `/Users/gregorystarr/projects/astralis-agency-server/client/src/components/providers`
**Destination:** `/Users/gregorystarr/projects/astralis-nextjs/src/components/providers`

Adapt providers for Next.js:
- Update AuthProvider for NextAuth.js
- Migrate PaymentProviders
- Update ThemeProvider if needed

### 6. Hooks Migration
**Source:** `/Users/gregorystarr/projects/astralis-agency-server/client/src/hooks`
**Destination:** `/Users/gregorystarr/projects/astralis-nextjs/src/lib/hooks`

Migrate all custom React hooks

## Port Configuration

- **Next.js Dev Server:** Port 3001
- **Express Backend:** Port 3000
- **API Proxy:** Automatically forwards `/api/*` requests from 3001 to 3000

## Environment Variables

Required for full functionality (see `.env.local.template`):
- Database connection
- NextAuth.js secrets
- PayPal credentials
- Stripe credentials
- API base URL

## Testing the Setup

To verify the foundation is working:

```bash
cd /Users/gregorystarr/projects/astralis-nextjs
npm run dev
```

Visit:
- http://localhost:3001 - Homepage
- http://localhost:3001/about - About page
- http://localhost:3001/contact - Contact page
- http://localhost:3001/marketplace - Marketplace
- http://localhost:3001/blog - Blog
- http://localhost:3001/admin - Admin (Pages Router)
- http://localhost:3001/checkout - Checkout (Pages Router)
- http://localhost:3001/orders - Orders (Pages Router)

# Astralis Agency - Next.js 15 Migration

This is the Next.js 15 migration of the Astralis Agency application, using a hybrid routing approach with both App Router and Pages Router.

## Project Setup

### Technology Stack

- **Framework**: Next.js 15.0.1 with React 19.2.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand 5.0.8
- **Forms**: React Hook Form 7.66.0 + Zod 4.1.12
- **Authentication**: NextAuth.js v5 (beta)
- **Database**: Prisma with PostgreSQL
- **Payments**: PayPal & Stripe
- **UI Components**: Radix UI primitives
- **HTTP Client**: Axios

### Architecture

This project uses a **hybrid routing approach**:

- **App Router** (`/src/app`) - For SEO-critical pages (marketing, blog, marketplace)
- **Pages Router** (`/src/pages`) - For interactive dashboards (admin, checkout, orders)

### Directory Structure

```
src/
├── app/                        # App Router (Next.js 13+ routing)
│   ├── (marketing)/           # Route group for marketing pages
│   │   ├── page.tsx          # Homepage
│   │   ├── about/            # About page
│   │   ├── contact/          # Contact page
│   │   └── layout.tsx        # Marketing layout
│   ├── marketplace/          # Product listing (SSR)
│   ├── blog/                 # Blog posts (SSR/SSG)
│   ├── api/                  # API Route Handlers
│   │   ├── auth/            # Auth endpoints
│   │   └── proxy/           # Proxy to Express backend
│   └── layout.tsx           # Root layout
├── pages/                    # Pages Router (legacy routing)
│   ├── admin/               # Admin dashboard
│   ├── checkout/            # Checkout flow
│   ├── orders/              # Order management
│   └── _app.tsx            # Pages Router app wrapper
├── components/
│   ├── ui/                  # Design system components (81 files)
│   ├── sections/            # Page sections
│   ├── providers/           # Context providers
│   └── layouts/             # Layout components
├── lib/
│   ├── store/               # Zustand stores (auth, cart)
│   ├── api/                 # API client (axios)
│   ├── hooks/               # Custom React hooks
│   └── utils/               # Utility functions
└── styles/
    └── globals.css          # Global styles
```

### Environment Variables

Copy `.env.local.template` to `.env.local` and fill in the required values:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/astralis"

# NextAuth.js
NEXTAUTH_SECRET="your-nextauth-secret-key-here"
NEXTAUTH_URL="http://localhost:3001"

# API Configuration
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000"

# Payment Providers
NEXT_PUBLIC_PAYPAL_CLIENT_ID="your-paypal-client-id"
PAYPAL_CLIENT_SECRET="your-paypal-client-secret"
NEXT_PUBLIC_STRIPE_PUBLIC_KEY="your-stripe-public-key"
STRIPE_SECRET_KEY="your-stripe-secret-key"
```

### Getting Started

1. **Install Dependencies**

```bash
npm install
```

2. **Set Up Environment**

```bash
cp .env.local.template .env.local
# Edit .env.local with your configuration
```

3. **Run Development Server**

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### API Proxy Configuration

The Next.js app proxies API requests to the Express backend running on port 3000:

- Next.js Frontend: `http://localhost:3001`
- Express Backend: `http://localhost:3000`

API routes are automatically rewritten:
- `/api/*` → `http://localhost:3000/api/*`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Migration Status

**Week 1, Days 1-2: Foundation Setup** ✅

- [x] Next.js 15 project initialized
- [x] Core dependencies installed
- [x] Hybrid routing structure created
- [x] API proxy configured
- [x] Environment template created
- [x] Basic middleware structure
- [x] Zustand stores (auth, cart)
- [x] API client configuration

**Next Steps:**

1. **Component Migration** (Other agents)
   - Migrate 81 UI components from `/client/src/components/ui`
   - Update import paths to use `@/` alias
   - Ensure dark theme styling is preserved

2. **Design System** (Other agents)
   - Copy Tailwind configuration
   - Migrate global CSS with dark theme
   - Set up glassmorphism utilities

3. **Authentication**
   - Configure NextAuth.js
   - Set up Prisma adapter
   - Implement auth middleware

4. **Payment Integration**
   - Configure PayPal provider
   - Configure Stripe provider
   - Migrate checkout flow

### Key Features

- **Hybrid Routing**: App Router for SEO, Pages Router for interactivity
- **Dark Theme**: Comprehensive dark theme with glassmorphism effects
- **State Management**: Zustand for client-side state (cart, auth)
- **Type Safety**: Full TypeScript coverage
- **API Integration**: Axios client with interceptors
- **Form Validation**: React Hook Form + Zod schemas
- **UI Components**: 21+ Radix UI primitives installed

### Port Configuration

- **Next.js Dev Server**: Port 3001 (configured separately from Express)
- **Express Backend**: Port 3000 (existing server)

### Notes

- The `/pages` directory enables the Pages Router for backward compatibility
- The `/app` directory uses the new App Router for modern features
- Both routers can coexist in the same project
- Components can be shared between both routing systems

### Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js 15 Release Notes](https://nextjs.org/blog/next-15)
- [Hybrid Routing Guide](https://nextjs.org/docs/app/building-your-application/routing)

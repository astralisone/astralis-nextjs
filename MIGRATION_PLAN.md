# Next.js Migration Plan - Astralis Agency

**Project**: Astralis Agency Next.js 15 Migration
**Date**: November 11, 2025
**Status**: Phase 1 Complete, Phase 2 In Progress

---

## Table of Contents
1. [Current Status](#current-status)
2. [Issues Identified](#issues-identified)
3. [Migration Requirements](#migration-requirements)
4. [Page Migration Plan](#page-migration-plan)
5. [Layout & Navigation](#layout--navigation)
6. [Technical Implementation](#technical-implementation)
7. [Execution Strategy](#execution-strategy)
8. [E-commerce & Database Migration](#phase-2f-e-commerce-database--seed-migration)
9. [Success Criteria](#success-criteria)

---

## Current Status

### ✅ Completed (Phase 1)
- Next.js 15 project initialized with TypeScript
- Hybrid routing structure (App Router + Pages Router)
- API proxy configuration to Express backend
- Zustand stores (auth, cart)
- API client with Axios interceptors
- Middleware for route protection
- Basic environment setup
- CLAUDE.md documentation created

### 🔄 In Progress (Phase 2)
- Page migrations from original React+Vite codebase
- Component library migration
- Layout implementation (header/footer)
- Admin section verification

---

## Issues Identified

### 1. Missing Pages (404 Errors)
From server logs analysis:
```
GET /process 404
GET /workflow-demo 404
```

**Root Cause**: Pages not migrated from original codebase or incorrectly routed

### 2. Placeholder Pages
- `/blog` - Simple placeholder (needs enhancement)
- `/marketplace` - Simple placeholder (needs enhancement)

### 3. Backend Connection Issues
```
Failed to proxy http://localhost:3000/api/auth/session
Failed to proxy http://localhost:3000/api/testimonials
Code: ECONNREFUSED
```

**Root Cause**: Express backend not running on port 3000
**Impact**: Pages load but API calls fail gracefully

### 4. Middleware Deprecation Warning
```
⚠ The "middleware" file convention is deprecated.
Please use "proxy" instead.
```

**Action Required**: Future Next.js update may require renaming

### 5. Missing Admin & Auth Pages
Status unknown - needs verification:
- `/admin` routes
- `/login` page
- `/register` page

---

## Migration Requirements

### Critical Requirements
1. **All pages MUST include Header with navbar**
2. **All pages MUST include Footer**
3. **Preserve dark theme + glassmorphism design system**
4. **Maintain responsive design**
5. **Handle backend connection failures gracefully**

### Technical Requirements
- TypeScript strict mode
- Next.js 15 App Router for SEO pages
- Next.js Pages Router for interactive dashboards
- Framer Motion animations preserved
- Tailwind CSS 4 with custom dark theme

---

## Page Migration Plan

### Phase 2A: Process Page (PRIORITY)

**Source**: `/Users/gregorystarr/projects/astralis-agency-server/client/src/pages/Process.tsx`
**Target**: `src/app/process/page.tsx`
**Router**: App Router (SEO-optimized)

**Complexity**: ⭐ Low
- Mostly static content
- Minimal dependencies
- No API calls
- Simple state management (activeStep, openFaq)

**Dependencies**:
```
Process.tsx
├── SEOHead → Replace with Next.js Metadata
├── WebPageStructuredData → Replace with Next.js Metadata
├── Framer Motion (keep as-is)
└── Lucide React icons (keep as-is)
```

**Migration Steps**:
1. Copy Process.tsx content
2. Add `'use client'` directive (for animations/state)
3. Remove SEOHead imports
4. Add Next.js metadata export
5. Update any React Router links to Next.js Link
6. Verify header/footer appear
7. Test animations and interactions

---

### Phase 2B: Workflow Demo Page (PRIORITY)

**Current**: `src/pages/WorkflowDemoPage.tsx` (exists but wrong route)
**Target**: `src/pages/workflow-demo.tsx`
**Router**: Pages Router

**Complexity**: ⭐⭐ Medium
- File already exists, needs routing fix
- Multiple workflow components required
- No API calls (uses static data)
- URL parameter handling for sharing

**Dependencies**:
```
WorkflowDemoPage.tsx
├── IndustrySelector (ui component)
├── WorkflowBuilder (workflow component)
├── WorkflowCustomizer (workflow component)
├── IntegrationShowcase (workflow component)
├── Button, Badge (ui components)
├── WorkflowTemplate type (types/workflow.ts)
├── Industry type (types/workflow.ts)
├── WorkflowExporter utility (utils/workflowExport.ts)
└── Workflow data (data/workflowTemplates.ts)
```

**Migration Steps**:
1. Check if workflow components exist in Next.js
2. If missing, migrate from original codebase:
   - WorkflowBuilder
   - WorkflowCustomizer
   - IntegrationShowcase
   - IndustrySelector
3. Migrate workflow types
4. Migrate workflow data files
5. Rename/move WorkflowDemoPage.tsx → workflow-demo.tsx
6. Replace react-helmet-async with next/head
7. Update URL parameter handling with Next.js useSearchParams
8. Verify header/footer appear
9. Test workflow builder functionality

---

### Phase 2C: Blog Page (RECREATE - SIMPLE)

**Source**: Use `/Users/gregorystarr/projects/astralis-agency-server/client/src/pages/Blog.tsx` as **reference only**
**Target**: `src/app/blog/page.tsx`
**Router**: App Router

**Approach**: Create simple functional page, NOT full migration
- Use original design as visual reference
- Implement hero section
- Simple grid layout (can be "Coming Soon" or basic posts)
- Proper header/footer integration
- Dark theme styling

**Components Needed** (create simple versions):
- Hero section with gradient background
- Search/filter bar (can be non-functional initially)
- Blog card grid (can show dummy data or empty state)

---

### Phase 2D: Marketplace Page (RECREATE - SIMPLE)

**Source**: Use `/Users/gregorystarr/projects/astralis-agency-server/client/src/pages/marketplace/index.tsx` as **reference only**
**Target**: `src/app/marketplace/page.tsx`
**Router**: App Router

**Approach**: Create simple functional page, NOT full migration
- Use original design as visual reference
- Implement hero section with stats
- Simple product grid (can be "Coming Soon" or basic products)
- Proper header/footer integration
- Dark theme with glassmorphism

**Components Needed** (create simple versions):
- Hero section with gradient background
- Filter bar (can be non-functional initially)
- Product card grid (can show dummy data or empty state)

---

### Phase 2E: Admin & Auth Pages Audit

**Goal**: Verify migration status of admin and authentication pages

**Pages to Check**:
```
Admin Section:
- /admin → Admin dashboard
- /admin/posts → Post management
- /admin/posts/new → Create new post
- /admin/posts/[id] → Edit post
- /admin/products → Product management
- /admin/products/new → Create new product
- /admin/products/[id] → Edit product
- /admin/users → User management

Authentication:
- /login → Login page
- /register → Registration page
- /forgot-password → Password reset
- /reset-password → Password reset form
```

**For Each Page**:
1. Check if file exists in Next.js project
2. If exists, verify:
   - Header/footer present
   - Routing works correctly
   - TypeScript compiles
3. If missing:
   - Note source file path from original
   - Add to future migration queue
   - Document dependencies

**Output**: Status report of admin/auth pages

---

### Phase 2F: E-commerce, Database & Seed Migration

**Goal**: Migrate complete e-commerce functionality, database schema, and seed operations

**Complexity**: ⭐⭐⭐⭐ Very High
- Critical business functionality
- Multiple integration points
- Database schema synchronization
- Payment provider setup
- Order management system

#### E-commerce Components Migration

**Source Files**:
```
/client/src/pages/checkout/
/client/src/components/checkout/
/client/src/components/cart/
/client/src/components/payments/
```

**Components to Migrate**:
```
Checkout Flow:
├── CheckoutPage (src/pages/checkout/index.tsx)
├── CartSummary
├── ShippingForm
├── PaymentForm
├── OrderConfirmation
└── CheckoutSteps

Cart Management:
├── CartDrawer
├── CartItem
├── CartTotal
└── EmptyCart

Payment Integration:
├── PayPalButton
├── StripeCheckout
└── PaymentMethodSelector
```

**Payment Providers**:
- PayPal: `@paypal/react-paypal-js` (already installed v8.9.2)
- Stripe: `@stripe/stripe-js` (already installed v8.4.0)

**Environment Variables Needed**:
```env
NEXT_PUBLIC_PAYPAL_CLIENT_ID="your-paypal-client-id"
PAYPAL_CLIENT_SECRET="your-paypal-client-secret"
NEXT_PUBLIC_STRIPE_PUBLIC_KEY="your-stripe-public-key"
STRIPE_SECRET_KEY="your-stripe-secret-key"
```

#### Database Schema Migration

**Current Backend Schema Location**:
`/Users/gregorystarr/projects/astralis-agency-server/prisma/schema.prisma`

**Key Models to Verify/Sync**:
```prisma
// User & Authentication
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  role      UserRole @default(USER)
  orders    Order[]
  wishlist  Wishlist[]
}

// Products & Marketplace
model MarketplaceItem {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  price       Decimal
  category    Category?
  orderItems  OrderItem[]
}

// Orders & Transactions
model Order {
  id            Int         @id @default(autoincrement())
  userId        Int
  user          User        @relation(fields: [userId], references: [id])
  total         Decimal
  status        OrderStatus
  orderItems    OrderItem[]
  payment       Payment?
  createdAt     DateTime    @default(now())
}

model OrderItem {
  id              Int             @id @default(autoincrement())
  orderId         Int
  order           Order           @relation(fields: [orderId], references: [id])
  marketplaceItemId Int
  marketplaceItem MarketplaceItem @relation(fields: [marketplaceItemId], references: [id])
  quantity        Int
  price           Decimal
}

model Payment {
  id              Int           @id @default(autoincrement())
  orderId         Int           @unique
  order           Order         @relation(fields: [orderId], references: [id])
  paymentMethod   PaymentMethod
  transactionId   String?
  status          PaymentStatus
  amount          Decimal
  createdAt       DateTime      @default(now())
}

// Blog & Content
model Post {
  id          Int       @id @default(autoincrement())
  title       String
  slug        String    @unique
  content     String
  authorId    Int
  author      User      @relation(fields: [authorId], references: [id])
  category    Category?
  tags        Tag[]
  publishedAt DateTime?
}

// Taxonomy
model Category {
  id    Int    @id @default(autoincrement())
  name  String @unique
  slug  String @unique
  posts Post[]
  items MarketplaceItem[]
}

model Tag {
  id    Int    @id @default(autoincrement())
  name  String @unique
  slug  String @unique
  posts Post[]
}
```

**Migration Tasks**:
1. **Schema Sync**: Ensure Next.js project can access backend Prisma schema
2. **Connection String**: Configure DATABASE_URL in Next.js .env.local
3. **Prisma Client**: Generate Prisma client for Next.js if using server components
4. **Migration Scripts**: Document all available migrations

#### Seed Operations Migration

**Current Seed Location**:
`/Users/gregorystarr/projects/astralis-agency-server/prisma/project-seeds.ts`

**Seed Data Structure**:
```
prisma/
├── project-seeds.ts          # Main seed script
└── seeds/
    └── data/
        ├── categories.ts     # Category definitions (15+)
        ├── tags.ts          # Tag definitions (50+)
        ├── testimonials.ts  # Testimonial data (6 items)
        ├── marketplace.ts   # Marketplace items
        └── blog-posts.ts    # Blog post content
```

**Seed Content Includes**:
- Admin user (email: admin@astralis.one, password: 45tr4l15)
- 15+ categories (Technology, AI, Automation, etc.)
- 50+ modern technology tags
- 6 curated testimonials with ratings
- Marketplace products with pricing
- 15 comprehensive blog posts with technical content

**Seed Commands (from backend)**:
```bash
# Fresh database setup (drop, create, migrate, seed)
cd server && yarn db:fresh

# Update blog seeds with latest content
yarn update-blog-seeds

# Run seed only
yarn seed

# Create admin user
yarn create:admin
```

**Next.js Integration**:
Since seeds run on the backend, Next.js needs:
1. Documentation of seed data structure
2. API endpoints to trigger seeding (admin only)
3. UI to view/manage seed status
4. Development workflow guide

#### E-commerce API Integration

**Required API Endpoints** (already on backend):
```
POST   /api/orders          # Create order
GET    /api/orders          # List user orders
GET    /api/orders/:id      # Get order details
PUT    /api/orders/:id      # Update order status

POST   /api/checkout        # Process checkout
POST   /api/payments/paypal # PayPal webhook
POST   /api/payments/stripe # Stripe webhook

GET    /api/cart           # Get cart (if server-side)
POST   /api/cart           # Add to cart
PUT    /api/cart/:id       # Update cart item
DELETE /api/cart/:id       # Remove from cart
```

**Client-Side State** (already implemented):
- Zustand cart store: `src/lib/store/cart.ts`
- Cart persistence in localStorage
- Cart item management

#### Migration Steps

**Phase 2F-1: Database Setup** (Agent 1)
1. Verify Prisma schema in backend
2. Document all models and relationships
3. Ensure migrations are up to date
4. Test database connection from Next.js
5. Configure DATABASE_URL in Next.js env

**Phase 2F-2: Checkout Flow** (Agent 2)
1. Migrate checkout page components
2. Integrate with cart store
3. Setup payment provider components
4. Configure PayPal provider
5. Configure Stripe provider
6. Test checkout flow end-to-end

**Phase 2F-3: Order Management** (Agent 3)
1. Migrate order pages (list, detail)
2. Create order status tracking UI
3. Integrate with orders API
4. Add order history functionality
5. Test order flow

**Phase 2F-4: Seed Documentation** (Agent 4)
1. Document seed data structure
2. Create seed status page (admin)
3. Document development workflow
4. Create seed management UI (optional)
5. Update CLAUDE.md with seed info

#### Success Criteria

**E-commerce Functionality**:
✅ Shopping cart works (add, update, remove)
✅ Checkout flow completes successfully
✅ PayPal integration functional
✅ Stripe integration functional
✅ Orders are created in database
✅ Order history displays correctly

**Database Integration**:
✅ Database schema documented
✅ Migrations run successfully
✅ Connection from Next.js works
✅ Prisma client accessible (if needed)

**Seed Operations**:
✅ Seed data structure documented
✅ Development workflow documented
✅ Seed commands available
✅ Admin user creation documented

**Payment Security**:
✅ API keys stored securely in env vars
✅ No sensitive data in client code
✅ Payment webhooks configured
✅ Transaction verification implemented

---

## Layout & Navigation

### Header Component Requirements

**Must Include**:
- Logo/brand
- Navigation menu (Home, About, Services, Blog, Marketplace, Contact)
- User authentication status
- Mobile responsive menu
- Dark theme styling
- Glassmorphism effects

**Source**: `/Users/gregorystarr/projects/astralis-agency-server/client/src/components/sections/Header.tsx`

**Target**:
- Component: `src/components/sections/Header.tsx`
- Integration: `src/app/layout.tsx`

### Footer Component Requirements

**Must Include**:
- Company information
- Navigation links
- Social media links
- Copyright notice
- Dark theme styling
- Glassmorphism effects

**Source**: `/Users/gregorystarr/projects/astralis-agency-server/client/src/components/sections/Footer.tsx`

**Target**:
- Component: `src/components/sections/Footer.tsx`
- Integration: `src/app/layout.tsx`

### Layout Integration

**App Router Layout** (`src/app/layout.tsx`):
```tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

**Pages Router Layout** (`src/pages/_app.tsx`):
```tsx
export default function App({ Component, pageProps }) {
  return (
    <>
      <Header />
      <Component {...pageProps} />
      <Footer />
    </>
  )
}
```

---

## Technical Implementation

### React Router → Next.js Migration Patterns

#### 1. Link Component
```tsx
// ❌ React Router (OLD)
import { Link } from 'react-router-dom'
<Link to="/blog">Blog</Link>

// ✅ Next.js (NEW)
import Link from 'next/link'
<Link href="/blog">Blog</Link>
```

#### 2. Navigation Hook
```tsx
// ❌ React Router (OLD)
import { useNavigate } from 'react-router-dom'
const navigate = useNavigate()
navigate('/dashboard')

// ✅ Next.js App Router (NEW)
import { useRouter } from 'next/navigation'
const router = useRouter()
router.push('/dashboard')

// ✅ Next.js Pages Router (NEW)
import { useRouter } from 'next/router'
const router = useRouter()
router.push('/dashboard')
```

#### 3. URL Parameters
```tsx
// ❌ React Router (OLD)
import { useParams, useSearchParams } from 'react-router-dom'
const { id } = useParams()
const [searchParams] = useSearchParams()

// ✅ Next.js App Router (NEW)
import { useParams, useSearchParams } from 'next/navigation'
const params = useParams()
const searchParams = useSearchParams()

// ✅ Next.js Pages Router (NEW)
import { useRouter } from 'next/router'
const router = useRouter()
const { id } = router.query
```

### API Calls Migration Patterns

#### 1. useApi Hook → apiClient
```tsx
// ❌ Custom Hook (OLD)
import { useApi } from '@/hooks/useApi'
const { data, error, isLoading } = useApi<BlogPost[]>('/api/blog')

// ✅ Direct API Client (NEW)
import { apiClient } from '@/lib/api'
import { useState, useEffect } from 'react'

const [data, setData] = useState<BlogPost[] | null>(null)
const [error, setError] = useState<string | null>(null)
const [isLoading, setIsLoading] = useState(true)

useEffect(() => {
  async function fetchData() {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.get('/api/blog')
      setData(response.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }
  fetchData()
}, [])
```

#### 2. Axios Instance → apiClient
```tsx
// ❌ Custom Axios Instance (OLD)
import api from '@/lib/axios'
const response = await api.get('/marketplace')

// ✅ Next.js API Client (NEW)
import { apiClient } from '@/lib/api'
const response = await apiClient.get('/api/marketplace')
```

### SEO Migration Patterns

#### 1. React Helmet → Next.js Metadata
```tsx
// ❌ React Helmet (OLD)
import { Helmet } from 'react-helmet-async'
<Helmet>
  <title>Blog - Astralis</title>
  <meta name="description" content="..." />
</Helmet>

// ✅ Next.js App Router (NEW)
export const metadata: Metadata = {
  title: 'Blog - Astralis',
  description: '...',
  openGraph: {
    title: 'Blog - Astralis',
    description: '...',
  }
}

// ✅ Next.js Pages Router (NEW)
import Head from 'next/head'
<Head>
  <title>Blog - Astralis</title>
  <meta name="description" content="..." />
</Head>
```

### Client Component Patterns

All pages with interactivity must use `'use client'` directive:
```tsx
'use client'

import { useState } from 'react'
// ... rest of component
```

**When to use 'use client'**:
- useState, useEffect, or any React hooks
- Event handlers (onClick, onChange, etc.)
- Browser APIs (localStorage, window, etc.)
- Animations (Framer Motion)
- Third-party interactive libraries

---

## Execution Strategy

### Parallel Agent Approach

#### Phase 2A-E: Core Pages Migration
Run **5 specialized agents** simultaneously for maximum efficiency:

#### Agent 1: Layout Integration
**Responsibility**: Ensure header/footer on all pages
**Tasks**:
1. Check if Header component exists
2. Check if Footer component exists
3. If missing, migrate from original codebase
4. Integrate into App Router layout
5. Integrate into Pages Router layout
6. Verify all pages show header/footer

#### Agent 2: Process Page Migration
**Responsibility**: Migrate /process page
**Tasks**:
1. Copy Process.tsx from original
2. Convert to Next.js App Router page
3. Add 'use client' directive
4. Replace SEO components
5. Verify header/footer display
6. Test all interactions

#### Agent 3: Workflow Demo Fix
**Responsibility**: Fix /workflow-demo routing
**Tasks**:
1. Audit workflow component dependencies
2. Migrate missing components
3. Rename/move WorkflowDemoPage.tsx
4. Update imports and routing
5. Verify header/footer display
6. Test workflow builder

#### Agent 4: Admin & Auth Audit
**Responsibility**: Check admin/auth page status
**Tasks**:
1. Check all admin routes
2. Check all auth routes
3. Document missing pages
4. Verify existing pages work
5. Create status report

#### Agent 5: Simple Blog & Marketplace
**Responsibility**: Create simple pages
**Tasks**:
1. Create simple blog page (reference original)
2. Create simple marketplace page (reference original)
3. Implement hero sections
4. Add basic grid layouts
5. Verify header/footer display
6. Dark theme styling

### Execution Order - Phase 2A-E
```
START (Core Pages)
  ├── Agent 1 (Layout) ────────┐
  ├── Agent 2 (Process) ───────┤
  ├── Agent 3 (Workflow) ──────┼─→ All run in parallel
  ├── Agent 4 (Admin Audit) ───┤
  └── Agent 5 (Simple Pages) ──┘
         │
         ▼
    Phase 2A-E COMPLETE
         │
         ▼
```

#### Phase 2F: E-commerce & Database
Run **4 specialized agents** after core pages complete:

**Agent 6: Database Setup**
- Verify Prisma schema
- Document models
- Configure database connection
- Test connectivity

**Agent 7: Checkout & Payments**
- Migrate checkout components
- Setup PayPal integration
- Setup Stripe integration
- Test payment flows

**Agent 8: Order Management**
- Migrate order pages
- Create order tracking UI
- Integrate with orders API
- Test order flows

**Agent 9: Seed Documentation**
- Document seed structure
- Create seed management UI
- Update development docs
- Test seed operations

### Complete Execution Flow
```
START
  │
  ├─→ Phase 2A-E (Agents 1-5) ──→ Core pages complete
  │
  └─→ Phase 2F (Agents 6-9) ────→ E-commerce complete
         │
         ▼
    FULL MIGRATION COMPLETE
```

### Dependencies Between Agents
- **Agent 1 must complete first** if header/footer don't exist
- Agents 2, 3, 5 depend on Agent 1 (need layout components)
- Agent 4 is independent (just auditing)

### Rollback Strategy
If any agent fails:
1. Keep successful changes from other agents
2. Report specific failure
3. Create isolated task for failed item
4. Continue with remaining work

---

## Success Criteria

### Page Accessibility
✅ `/process` - Returns 200, shows content
✅ `/workflow-demo` - Returns 200, shows content
✅ `/blog` - Returns 200, shows simple page
✅ `/marketplace` - Returns 200, shows simple page

### Layout Consistency
✅ Header appears on all pages
✅ Footer appears on all pages
✅ Navigation works correctly
✅ Mobile responsive

### Visual Design
✅ Dark theme preserved
✅ Glassmorphism effects working
✅ Purple-violet gradients present
✅ Animations smooth (Framer Motion)
✅ Typography consistent

### Technical Quality
✅ No TypeScript compilation errors
✅ No 404 errors in browser console
✅ No runtime errors
✅ Pages load successfully
✅ Graceful handling of backend connection failures

### Admin & Auth Status
✅ Complete audit report generated
✅ All admin/auth pages documented
✅ Migration plan for missing pages

---

## Post-Migration Tasks

### Immediate (This Sprint)
1. Test all migrated pages end-to-end
2. Fix any TypeScript errors
3. Verify responsive design on mobile
4. Test with backend connected
5. Test with backend disconnected

### Short-term (Next Sprint)
1. Migrate missing admin pages
2. Migrate missing auth pages
3. Enhance blog page (full migration)
4. Enhance marketplace page (full migration)
5. Add loading states
6. Add error boundaries

### Medium-term (Future Sprints)
1. Optimize with Next.js Image component
2. Implement ISR for blog posts
3. Add middleware caching
4. Performance optimization
5. Accessibility audit
6. SEO optimization

---

## Known Issues & Limitations

### Current Limitations
1. **Backend Required**: Some pages need Express backend running on port 3000
2. **API Failures**: Pages load but show errors when backend unavailable
3. **Middleware Warning**: Next.js deprecation warning (minor)
4. **Simple Pages**: Blog and marketplace are basic versions

### Technical Debt
1. Replace useApi hook throughout codebase with direct apiClient
2. Migrate all SEO components to Next.js Metadata API
3. Update all React Router references to Next.js routing
4. Consolidate client/server component patterns
5. Add comprehensive error handling

### Future Improvements
1. Server-side rendering for blog posts
2. Static generation for marketing pages
3. Image optimization with next/image
4. Font optimization with next/font
5. Bundle size optimization
6. Performance monitoring

---

## Resources & References

### Documentation
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Next.js Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
- [CLAUDE.md](./CLAUDE.md) - Project setup guide
- [MIGRATION_CHECKLIST.md](./MIGRATION_CHECKLIST.md) - Detailed migration tracking

### Codebase Locations
- **Original React App**: `/Users/gregorystarr/projects/astralis-agency-server/client/`
- **Next.js App**: `/Users/gregorystarr/projects/astralis-nextjs/`
- **Express Backend**: `/Users/gregorystarr/projects/astralis-agency-server/`

### Key Files
- API Client: `src/lib/api/client.ts`
- Types: `src/types/`
- Components: `src/components/`
- Pages (App Router): `src/app/`
- Pages (Pages Router): `src/pages/`

---

## Contact & Support

**Project Lead**: Development Team
**Documentation**: This file + CLAUDE.md
**Issues**: Track in project management system

---

**Last Updated**: November 11, 2025
**Next Review**: After Phase 2 completion

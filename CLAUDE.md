# CLAUDE.md

This file provides guidance to AI assistants when working with code in this repository.

## Project Overview

**Astralis One** - Multi-Agent Engineering Platform built with Next.js 15, TypeScript, and Prisma. Enterprise-grade AI operations platform featuring booking systems, email notifications, analytics tracking, and a comprehensive UI component library.

## Essential Commands

### Development
```bash
npm run dev              # Start dev server on port 3001
npm run build            # Production build
npm run start            # Start production server on port 3001
npm run lint             # Run ESLint
```

### Database
```bash
npx prisma generate      # Generate Prisma client (runs after npm install)
npx prisma migrate dev   # Create and apply migrations
npx prisma studio        # Open database GUI
```

### Storybook
```bash
npm run storybook        # Start Storybook on port 6006
npm run build-storybook  # Build static Storybook
```

### Deployment
- Server location: `/home/deploy/astralis-nextjs` on 137.184.31.207
- SSH access: `ssh -i ~/.ssh/id_ed25519 root@137.184.31.207`

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 (App Router) on port 3001
- **Language**: TypeScript 5 with strict mode
- **Styling**: Tailwind CSS 3 with custom Astralis brand theme
- **Database**: PostgreSQL + Prisma ORM
- **UI Components**: Radix UI primitives with custom branded styling
- **Email**: Nodemailer with SMTP
- **Calendar**: ICS generation for booking confirmations
- **Analytics**: Google Analytics 4 + Google Ads tracking
- **Font**: Inter (via next/font/google)

### Brand Design System

**Astralis brand colors** (defined in `tailwind.config.ts`):
- **Navy**: `#0A1B2B` - Used for headings and dark backgrounds
- **Blue**: `#2B6CB0` - Primary action color for buttons and links
- **Status colors**: Success (#38A169), Warning (#DD6B20), Error (#E53E3E), Info (#3182CE)
- **Neutrals**: Slate palette (50-950)

**Design specifications**:
- Border radius: 6px (md), 8px (lg), 4px (sm)
- Transition duration: 150ms (fast), 200ms (normal), 250ms (slow)
- Box shadows: `card` and `card-hover` variants
- Spacing scale: 4px increments (4, 8, 12, 16, 20, 24, 32, 48, 64, 96)

### Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (marketing)/             # Marketing pages group
│   │   ├── about/
│   │   ├── blog/
│   │   ├── contact/
│   │   ├── marketplace/
│   │   └── services/
│   ├── api/                     # API routes
│   │   ├── booking/            # Booking submission endpoint
│   │   ├── contact/            # Contact form endpoint
│   │   └── [other endpoints]   # Users, orgs, pipelines, automations
│   ├── astralisops/            # Product pages
│   ├── solutions/              # Solutions page
│   ├── layout.tsx              # Root layout with Navigation + Footer
│   ├── page.tsx                # Homepage
│   ├── globals.css             # Global styles + CSS variables
│   ├── error.tsx               # Error boundary
│   └── loading.tsx             # Loading state
├── components/
│   ├── analytics/              # GoogleAnalytics component
│   ├── booking/                # BookingModal (multi-step booking form)
│   ├── layout/                 # Navigation, header, footer
│   ├── sections/               # Page sections (Hero, FeatureGrid, Stats, CTA)
│   └── ui/                     # Radix UI-based components (Button, Input, Card, etc.)
├── data/                       # Content definitions
│   ├── homepage-content.ts
│   ├── solutions-content.ts
│   └── astralisops-content.ts
├── hooks/                      # Custom React hooks
│   ├── useAnalytics.ts        # Analytics tracking hook
│   └── index.ts
├── lib/                        # Utilities
│   ├── analytics/             # Google Analytics utilities
│   ├── calendar.ts            # ICS calendar generation
│   ├── email.ts               # Email templates and sending
│   ├── prisma.ts              # Prisma client singleton
│   └── utils.ts               # cn() utility for className merging
└── types/                      # TypeScript type definitions

prisma/
└── schema.prisma               # Database schema with Organization, User, Pipeline, etc.

.storybook/                     # Storybook configuration
```

### Key Architectural Patterns

**1. Path Aliasing**: Use `@/` prefix for imports
```typescript
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
```

**2. Component Architecture**:
- UI components in `src/components/ui/` are Radix UI-based primitives
- Section components in `src/components/sections/` compose UI components for page layouts
- All components have corresponding `.stories.tsx` files for Storybook
- Components follow Astralis brand specification

**3. Route Groups**: Marketing pages use `(marketing)` route group for shared layout without URL prefix

**4. API Routes**: RESTful endpoints in `src/app/api/` return NextResponse with proper error handling

**5. Email System**:
- `src/lib/email.ts` provides email utilities
- Templates: `generateCustomerConfirmationEmail()`, `generateInternalNotificationEmail()`
- Uses Nodemailer with SMTP configuration from environment variables
- Supports HTML/text versions and ICS attachments

**6. Booking Flow**:
- Multi-step modal: Info → Schedule → Details → Confirmation
- POST to `/api/booking`
- Generates unique booking IDs (`BK-{timestamp}-{random}`)
- Sends customer confirmation + internal notification emails
- Attaches ICS calendar files to both emails
- Validates with Zod schema

**7. Analytics Integration**:
- Google Analytics 4 via `src/components/analytics/GoogleAnalytics.tsx`
- Google Ads conversion tracking
- Environment-based tracking IDs
- Custom hook `useAnalytics()` for event tracking

## Database Schema

### Core Models
- **Organization**: Multi-tenant parent entity
- **User**: Members with roles (ADMIN, OPERATOR, CLIENT)
- **Pipeline**: Workflow management with stages
- **IntakeRequest**: AI-powered request routing
- **Document**: File processing with OCR
- **Automation**: n8n workflow integration
- **SchedulingEvent**: Calendar integration with conflict detection

### Status Enums
- `DocumentStatus`: PENDING, PROCESSING, COMPLETED, FAILED
- `IntakeSource`: FORM, EMAIL, CHAT, API
- `IntakeStatus`: NEW, ROUTING, ASSIGNED, PROCESSING, COMPLETED, REJECTED
- `EventStatus`: SCHEDULED, CONFIRMED, CANCELLED, COMPLETED, CONFLICT

## Environment Variables

Required in `.env.local`:
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/astralis_one"

# API
NEXT_PUBLIC_API_BASE_URL="http://localhost:3001"

# Email (Nodemailer SMTP)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-smtp-username"
SMTP_PASSWORD="your-smtp-password"
SMTP_FROM_NAME="Astralis"
SMTP_FROM_EMAIL="support@astralisone.com"

# Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
NEXT_PUBLIC_GOOGLE_ADS_ID="AW-XXXXXXXXXX"
```

See `.env.local.template` for complete reference.

## Component Usage Patterns

### Buttons
```tsx
import { Button } from "@/components/ui/button";

<Button variant="primary" size="lg">Primary Action</Button>
<Button variant="secondary" size="default">Secondary</Button>
<Button variant="outline" size="sm">Outline</Button>
```

**Variants**: primary, secondary, destructive, outline, ghost, link
**Sizes**: sm, default, lg, icon

### Cards
```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card variant="default" hover>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

**Variants**: default, bordered, elevated

### Forms
```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="you@example.com" />
</div>
```

### Alerts
```tsx
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

<Alert variant="success" showIcon>
  <AlertTitle>Success</AlertTitle>
  <AlertDescription>Operation completed</AlertDescription>
</Alert>
```

**Variants**: default, success, warning, error, info

## API Route Patterns

### Standard Response Format
```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  // validation schema
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Process request

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal error", details: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
```

## Important Implementation Notes

### Email Best Practices
- Always provide both HTML and plain text versions
- Include calendar attachments (ICS) for bookings
- Log email sending attempts for debugging
- Gracefully handle email failures (don't block booking confirmation)
- Use branded email templates with Astralis colors

### Analytics Tracking
- Events are tracked via `useAnalytics()` hook
- Google Analytics script is injected via `GoogleAnalytics` component in root layout
- Track conversions: bookings, form submissions, button clicks

### Database Operations
- **CRITICAL**: Never perform write operations to the database without triple verification from the user
- Use Prisma client from `@/lib/prisma` for all database operations
- Always handle errors with try/catch blocks
- Include appropriate indexes for performance

### Styling Conventions
- Use Tailwind utility classes
- Prefer Astralis brand colors (`astralis-navy`, `astralis-blue`)
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Follow spacing scale (4, 8, 12, 16, 20, 24, 32, 48, 64, 96)
- Transitions should be 150-250ms

### Accessibility
- All interactive elements must be keyboard accessible
- Use semantic HTML
- Include proper ARIA labels
- Maintain focus management in modals/dialogs
- Ensure sufficient color contrast

## Testing with Storybook

All UI components have Storybook stories for visual testing:
```bash
npm run storybook  # Access at http://localhost:6006
```

Stories are co-located with components: `ComponentName.stories.tsx`

## Common Pitfalls to Avoid

1. **Database writes**: Never write to database without explicit user approval
2. **Email errors**: Don't fail booking requests if emails fail to send
3. **Environment variables**: Always check for required env vars before using
4. **Imports**: Use `@/` path alias, not relative paths
5. **Port conflicts**: Dev server runs on 3001, not 3000
6. **Styling**: Don't override Astralis brand colors without justification
7. **Error handling**: Always show errors to users, no silent failures

## Related Documentation

- `SETUP_GUIDE.md` - Complete setup and execution plan
- `astralis-branded-refactor.md` - Master specification document
- `docs/ASTRALISOPS-PRD.md` - Product requirements
- `docs/BOOKING_SETUP.md` - Email and booking configuration guide
- `README.md` - Quick start and project overview

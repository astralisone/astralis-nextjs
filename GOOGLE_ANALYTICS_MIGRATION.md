# Google Analytics Migration Report

## Overview
Successfully migrated Google Analytics implementation from `astralis-agency-server` to `astralis-nextjs` project. The implementation now supports both Next.js App Router and Pages Router with automatic page tracking and conversion events.

## Tracking Configuration
- **Tracking ID**: G-49DWRM7K4G
- **Environment Variable**: NEXT_PUBLIC_GA_TRACKING_ID

## Files Created

### 1. Core Analytics Library
**Location**: `/Users/gregorystarr/projects/astralis-nextjs/src/lib/analytics/gtag.ts`

**Purpose**: Core Google Analytics tracking utilities

**Features**:
- Global gtag interface declaration
- Page view tracking (`pageview`)
- Custom event tracking (`event`)
- Purchase conversion tracking (`trackPurchase`)
- Audit booking tracking (`trackAuditBooking`)

**Usage Example**:
```typescript
import { pageview, event, trackPurchase } from '@/lib/analytics/gtag';

// Track page view
pageview('/about', 'About Page');

// Track custom event
event('button_click', { button_name: 'cta_signup' });

// Track purchase
trackPurchase({
  id: 'order-123',
  total: 99.99,
  currency: 'USD',
  items: [...]
});
```

### 2. Analytics Index
**Location**: `/Users/gregorystarr/projects/astralis-nextjs/src/lib/analytics/index.ts`

**Purpose**: Centralized exports for all analytics functionality

### 3. Google Analytics Component (App Router)
**Location**: `/Users/gregorystarr/projects/astralis-nextjs/src/components/analytics/GoogleAnalytics.tsx`

**Purpose**: Client-side component for App Router with automatic route change tracking

**Features**:
- Uses Next.js Script component with `afterInteractive` strategy
- Automatic page view tracking on route changes
- Listens to pathname and searchParams changes

**Integration**: Added to `/Users/gregorystarr/projects/astralis-nextjs/src/app/layout.tsx`

### 4. Google Analytics Component (Pages Router)
**Location**: `/Users/gregorystarr/projects/astralis-nextjs/src/components/analytics/GoogleAnalyticsPagesRouter.tsx`

**Purpose**: Client-side component for Pages Router with automatic route change tracking

**Features**:
- Uses Next.js Script component
- Listens to Next.js router events for page tracking
- Tracks `routeChangeComplete` events

**Integration**: Added to `/Users/gregorystarr/projects/astralis-nextjs/src/pages/_app.tsx`

### 5. Analytics Hook
**Location**: `/Users/gregorystarr/projects/astralis-nextjs/src/hooks/useAnalytics.ts`

**Purpose**: Custom React hook for convenient event tracking in components

**Features**:
- `trackEvent` - Track custom events
- `trackPurchaseEvent` - Track e-commerce purchases
- `trackAuditBookingEvent` - Track audit bookings
- `trackFormSubmit` - Track form submissions
- `trackButtonClick` - Track button clicks
- `trackLinkClick` - Track link clicks

**Usage Example**:
```typescript
import { useAnalytics } from '@/hooks';

function MyComponent() {
  const { trackButtonClick, trackFormSubmit } = useAnalytics();

  const handleClick = () => {
    trackButtonClick('signup_cta', { location: 'hero' });
  };

  return <button onClick={handleClick}>Sign Up</button>;
}
```

## Files Modified

### 1. App Router Layout
**File**: `/Users/gregorystarr/projects/astralis-nextjs/src/app/layout.tsx`

**Changes**:
- Imported `GoogleAnalytics` component
- Added `<GoogleAnalytics />` inside `<head>` tag

**Result**: Automatic GA tracking for all App Router pages

### 2. Pages Router App Component
**File**: `/Users/gregorystarr/projects/astralis-nextjs/src/pages/_app.tsx`

**Changes**:
- Imported `GoogleAnalyticsPagesRouter` component
- Added `<GoogleAnalyticsPagesRouter />` at the top of the component tree

**Result**: Automatic GA tracking for all Pages Router pages

### 3. Checkout Page
**File**: `/Users/gregorystarr/projects/astralis-nextjs/src/pages/checkout/index.tsx`

**Changes**:
- Imported `trackPurchase` from analytics library
- Removed old `callGTAG` function
- Replaced with proper `trackPurchase` call with structured data

**Tracking Events**:
- Purchase conversion event (`purchase`)
- Ads conversion event (`ads_conversion_Purchase`)
- Includes transaction ID, total, currency, and item details

**Example**:
```typescript
trackPurchase({
  id: order.id,
  total: orderTotals.total,
  items: items.map(item => ({
    item_id: item.id,
    item_name: item.title,
    price: item.price,
    quantity: item.quantity,
  })),
  currency: 'USD',
});
```

### 4. Unified Booking Interface
**File**: `/Users/gregorystarr/projects/astralis-nextjs/src/components/booking/UnifiedBookingInterface.tsx`

**Changes**:
- Added Google Analytics tracking on successful booking completion
- Tracks `booking_completed` event with booking type

**Tracking Events**:
- Event: `booking_completed`
- Category: `engagement`
- Label: `revenue-audit` or consultation type
- Value: 1

### 5. Environment Template
**File**: `/Users/gregorystarr/projects/astralis-nextjs/.env.local.template`

**Changes**:
- Added `NEXT_PUBLIC_GA_TRACKING_ID="G-49DWRM7K4G"`

**Note**: Environment variable can be overridden for different environments

### 6. Hooks Index
**File**: `/Users/gregorystarr/projects/astralis-nextjs/src/hooks/index.ts`

**Changes**:
- Added export for `useAnalytics` hook

## Migration from Old Implementation

### Old Implementation (React + Vite)
**Location**: `astralis-agency-server/client/`

**Components**:
1. `client/index.html` - Inline gtag script (lines 8-15)
2. `client/src/hooks/useSEO.ts` - SEO and tracking hook
3. `client/src/pages/checkout/index.tsx` - Checkout conversion tracking
4. `client/src/components/audit-booking/use-audit-booking.tsx` - Audit tracking

### New Implementation (Next.js 15)
**Location**: `astralis-nextjs/`

**Improvements**:
1. Uses Next.js Script component for optimal loading
2. Separated concerns (analytics vs SEO)
3. Better TypeScript support
4. Cleaner integration with Next.js routing
5. Support for both App Router and Pages Router
6. Reusable hooks and utilities

## Tracked Events

### Automatic Events
- **Page Views**: Automatically tracked on all route changes
  - App Router: Via pathname/searchParams changes
  - Pages Router: Via routeChangeComplete events

### E-commerce Events
- **Purchase Conversion** (`purchase`)
  - Transaction ID
  - Total value
  - Currency (USD)
  - Item details (ID, name, price, quantity)

- **Ads Conversion** (`ads_conversion_Purchase`)
  - Transaction ID
  - Total value
  - Currency

### Engagement Events
- **Booking Completed** (`booking_completed`)
  - Category: engagement
  - Label: booking type
  - Value: 1

### Custom Events (Available via useAnalytics hook)
- Form submissions
- Button clicks
- Link clicks
- Custom events with parameters

## Implementation Status

### ✅ Completed
1. Core analytics utilities created
2. App Router integration complete
3. Pages Router integration complete
4. Checkout conversion tracking migrated
5. Booking tracking added
6. Environment configuration updated
7. Custom hooks created
8. Type definitions added
9. Documentation created

### ⚠️ Not Migrated
1. **useSEO hook**: Already exists in astralis-nextjs but uses different approach (uses Next.js router instead of React Router)
2. **Audit booking component**: No direct equivalent found in astralis-nextjs, but tracking logic added to UnifiedBookingInterface

### 📝 Notes
- The existing `useSEO.ts` hook in astralis-nextjs already has GA tracking capabilities
- Consider consolidating tracking logic if needed
- Both implementations can coexist as they serve different pages

## Testing Checklist

- [ ] Verify GA script loads on all pages
- [ ] Check page view events in GA Real-Time reports
- [ ] Test checkout conversion tracking
- [ ] Test booking completion tracking
- [ ] Verify custom event tracking with useAnalytics hook
- [ ] Check that tracking ID matches across environments
- [ ] Test in both App Router and Pages Router pages
- [ ] Verify tracking works in production build

## Environment Setup

1. Copy the template:
   ```bash
   cp .env.local.template .env.local
   ```

2. The GA tracking ID is already set to `G-49DWRM7K4G` in the template

3. For production, ensure the environment variable is set:
   ```bash
   NEXT_PUBLIC_GA_TRACKING_ID=G-49DWRM7K4G
   ```

## Usage Examples

### Track Page Views (Automatic)
Page views are automatically tracked when routes change. No manual implementation needed.

### Track Custom Events
```typescript
import { useAnalytics } from '@/hooks';

function MyComponent() {
  const { trackEvent } = useAnalytics();

  const handleAction = () => {
    trackEvent('user_action', {
      action_type: 'download',
      file_name: 'whitepaper.pdf'
    });
  };
}
```

### Track E-commerce Purchases
```typescript
import { trackPurchase } from '@/lib/analytics';

trackPurchase({
  id: order.id,
  total: 199.99,
  currency: 'USD',
  items: [
    {
      item_id: 'prod-123',
      item_name: 'Premium Service',
      price: 199.99,
      quantity: 1
    }
  ]
});
```

### Track Form Submissions
```typescript
import { useAnalytics } from '@/hooks';

function ContactForm() {
  const { trackFormSubmit } = useAnalytics();

  const handleSubmit = (data) => {
    trackFormSubmit('contact_form', {
      form_location: 'footer',
      user_type: 'prospect'
    });
  };
}
```

## Additional Resources

- [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [Next.js Analytics Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/analytics)
- [gtag.js Reference](https://developers.google.com/tag-platform/gtagjs/reference)

## Migration Completion Date
2025-11-15

## Migration Performed By
Automated migration from astralis-agency-server to astralis-nextjs

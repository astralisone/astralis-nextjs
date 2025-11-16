# Google Analytics Integration

This directory contains all Google Analytics tracking utilities for the Astralis Next.js application.

## Quick Start

### 1. Environment Setup
Add to your `.env.local`:
```bash
NEXT_PUBLIC_GA_TRACKING_ID=G-49DWRM7K4G
```

### 2. Automatic Page Tracking
Page views are automatically tracked in both App Router and Pages Router. No additional code needed!

### 3. Track Custom Events
```typescript
import { event } from '@/lib/analytics';

// Track any custom event
event('button_click', {
  button_name: 'hero_cta',
  location: 'homepage'
});
```

### 4. Track Purchases
```typescript
import { trackPurchase } from '@/lib/analytics';

trackPurchase({
  id: 'order-123',
  total: 99.99,
  currency: 'USD',
  items: [{
    item_id: 'prod-1',
    item_name: 'Product Name',
    price: 99.99,
    quantity: 1
  }]
});
```

### 5. Use React Hook
```typescript
import { useAnalytics } from '@/hooks';

function MyComponent() {
  const { trackEvent, trackFormSubmit } = useAnalytics();

  return (
    <button onClick={() => trackEvent('click', { location: 'nav' })}>
      Click Me
    </button>
  );
}
```

## Available Functions

### Core Functions (from `gtag.ts`)
- `pageview(url, title?)` - Track page views
- `event(name, params?)` - Track custom events
- `trackPurchase(orderData)` - Track e-commerce purchases
- `trackAuditBooking(auditType)` - Track audit bookings

### Hook Functions (from `useAnalytics.ts`)
- `trackEvent(name, params?)` - Track custom events
- `trackPurchaseEvent(orderData)` - Track purchases
- `trackAuditBookingEvent(type)` - Track bookings
- `trackFormSubmit(formName, data?)` - Track form submissions
- `trackButtonClick(buttonName, data?)` - Track button clicks
- `trackLinkClick(url, text?)` - Track link clicks

## Files Structure

```
src/lib/analytics/
├── gtag.ts           # Core tracking utilities
├── index.ts          # Exports
└── README.md         # This file

src/components/analytics/
├── GoogleAnalytics.tsx              # App Router component
└── GoogleAnalyticsPagesRouter.tsx   # Pages Router component

src/hooks/
└── useAnalytics.ts   # React hook for tracking
```

## Integration Points

- **App Router**: Integrated in `src/app/layout.tsx`
- **Pages Router**: Integrated in `src/pages/_app.tsx`
- **Checkout**: Conversion tracking in `src/pages/checkout/index.tsx`
- **Bookings**: Event tracking in `src/components/booking/UnifiedBookingInterface.tsx`

## Testing

Check Google Analytics Real-Time reports:
1. Open GA dashboard
2. Go to Reports > Real-time
3. Navigate your site
4. Verify events appear in real-time

## Tracking ID
**Production**: G-49DWRM7K4G

For different environments, override the env variable:
```bash
NEXT_PUBLIC_GA_TRACKING_ID=your-tracking-id
```

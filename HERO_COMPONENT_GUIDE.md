# Hero Component - Implementation Guide

## Overview

The Hero section component follows the **Astralis Brand Specification (Section 3.3)** and provides a flexible, reusable template for creating impactful landing sections.

## Component Location

```
/Users/gregorystarr/projects/astralis-nextjs/src/components/sections/hero.tsx
```

## Key Features

### Layout System
- **12-column grid** (max-width: 1280px per spec Section 3.1)
- **Left column**: Text content (headline, subheadline, description, CTAs)
- **Right column**: Optional custom content (image, cards, forms, etc.)
- **Responsive**: Automatically stacks on mobile devices (<768px)

### Typography (Spec Section 2.4)
- **Headline**: 48px font size (`text-5xl`)
- **Subheadline**: 20px font size (`text-xl`)
- **Font Family**: Inter (primary typeface)

### Spacing (Spec Section 3.1 & 3.2)
- **Section Padding**: 96-120px vertical spacing
- **Horizontal Padding**: 80-120px on desktop, responsive on mobile
- **Gap Between Elements**: 24-32px (spacing scale compliant)

### Buttons (Spec Section 3.3)
- **Primary Button**: Astralis Blue background (#2B6CB0), white text
- **Secondary Button**: Astralis Blue border (1.5px), blue text
- **Border Radius**: 6px
- **Hover Effects**: 150ms ease-out transitions

### Animations
- **Fade-in**: 200ms on component load
- **Follows**: 150-250ms animation constraints (spec Section 2.2)

---

## Props Interface

```typescript
interface HeroProps {
  // Required: Main headline text
  headline: string;

  // Optional: Subheadline above main headline
  subheadline?: string;

  // Optional: Description text below headline
  description?: string;

  // Optional: Primary CTA configuration
  primaryButton?: {
    text: string;
    href: string;
  };

  // Optional: Secondary CTA configuration
  secondaryButton?: {
    text: string;
    href: string;
  };

  // Optional: Custom content for right column
  rightContent?: React.ReactNode;

  // Optional: Additional CSS classes
  className?: string;

  // Optional: Text column width control
  textColumnWidth?: 'half' | 'full' | 'two-thirds';

  // Optional: Text alignment
  textAlign?: 'left' | 'center';
}
```

---

## Usage Examples

### 1. Basic Hero (Text Only)

```tsx
import { Hero } from '@/components/sections';

export default function HomePage() {
  return (
    <Hero
      headline="Streamline Your Operations with AI"
      subheadline="AstralisOps Platform"
      description="Automate workflows, optimize processes, and scale your business with enterprise-grade AI operations."
      primaryButton={{
        text: 'Get Started',
        href: '/signup',
      }}
      secondaryButton={{
        text: 'Learn More',
        href: '/solutions',
      }}
    />
  );
}
```

### 2. Hero with Image

```tsx
import Image from 'next/image';
import { Hero } from '@/components/sections';

export default function ProductPage() {
  return (
    <Hero
      headline="Build Faster with Enterprise Automation"
      subheadline="Astralis Marketplace"
      description="Pre-built toolkits, component libraries, and automation blueprints."
      primaryButton={{
        text: 'Browse Marketplace',
        href: '/marketplace',
      }}
      secondaryButton={{
        text: 'View Demos',
        href: '/demos',
      }}
      rightContent={
        <div className="relative w-full h-[400px] lg:h-[500px] rounded-lg overflow-hidden shadow-card">
          <Image
            src="/images/hero-dashboard.png"
            alt="Dashboard Preview"
            fill
            className="object-cover"
            priority
          />
        </div>
      }
    />
  );
}
```

### 3. Hero with Feature Cards

```tsx
import { Hero } from '@/components/sections';

export default function FeaturesPage() {
  return (
    <Hero
      headline="AI-Powered Operations Console"
      subheadline="AstralisOps"
      description="Unified platform for intake routing, scheduling, and document processing."
      primaryButton={{
        text: 'Start Free Trial',
        href: '/trial',
      }}
      rightContent={
        <div className="space-y-4">
          <FeatureCard
            icon={<CheckIcon />}
            title="AI Intake Routing"
            description="Intelligent request classification and routing."
          />
          <FeatureCard
            icon={<ClockIcon />}
            title="Smart Scheduling"
            description="Automated calendar management."
          />
        </div>
      }
    />
  );
}
```

### 4. Centered Hero (Full Width)

```tsx
import { Hero } from '@/components/sections';

export default function ServicesPage() {
  return (
    <Hero
      headline="Enterprise Automation Services"
      subheadline="Custom Solutions"
      description="From intake automation to full platform deployment."
      primaryButton={{
        text: 'View Services',
        href: '/services',
      }}
      textAlign="center"
      textColumnWidth="full"
    />
  );
}
```

### 5. Hero with Form

```tsx
import { Hero } from '@/components/sections';

export default function SignupPage() {
  return (
    <Hero
      headline="Start Your Free Trial"
      subheadline="No Credit Card Required"
      description="Join hundreds of companies automating their operations."
      rightContent={
        <div className="bg-white border border-slate-300 rounded-lg p-8 shadow-card">
          <form className="space-y-4">
            <input
              type="email"
              placeholder="you@company.com"
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-astralis-blue"
            />
            <button
              type="submit"
              className="w-full bg-astralis-blue text-white py-3 rounded-md"
            >
              Start Free Trial
            </button>
          </form>
        </div>
      }
    />
  );
}
```

### 6. Two-Thirds Layout

```tsx
import { Hero } from '@/components/sections';

export default function TemplatesPage() {
  return (
    <Hero
      headline="Deploy AI Workflows in Minutes"
      description="Pre-configured automation templates ready for your stack."
      primaryButton={{
        text: 'Browse Templates',
        href: '/templates',
      }}
      textColumnWidth="two-thirds"
      rightContent={
        <div className="bg-gradient-to-br from-astralis-blue to-astralis-navy rounded-lg p-8 text-white">
          <p className="text-2xl font-semibold">500+</p>
          <p className="text-sm opacity-90">Ready-to-use templates</p>
        </div>
      }
    />
  );
}
```

---

## Responsive Behavior

### Desktop (≥1024px)
- 12-column grid layout active
- Left/right columns side by side
- Max-width container: 1280px
- Horizontal padding: 96px (lg:px-24)

### Tablet (768px - 1023px)
- Grid maintains 2-column layout
- Reduced padding: 80px (md:px-20)
- Smaller gap between columns

### Mobile (<768px)
- Single column stack
- Text content displays first
- Right content below
- Padding: 32px (px-8)

---

## Brand Compliance Checklist

- ✅ **Color Palette**: Astralis Navy (#0A1B2B) and Astralis Blue (#2B6CB0)
- ✅ **Typography**: Inter font, 48px headline, 20px subheadline
- ✅ **Layout**: 12-column grid, max-width 1280px
- ✅ **Spacing**: 96-120px section padding, spacing scale compliant
- ✅ **Buttons**: 6px border radius, 150ms transitions
- ✅ **Animations**: 200ms fade-in, within 150-250ms constraints
- ✅ **Shadows**: Card shadow (rgba(0,0,0,0.06))

---

## Component Architecture Notes

### Client vs Server Component

The Hero component is marked as `'use client'` because:
1. It uses React hooks (`useMemo`) for dynamic class computation
2. It may contain interactive buttons and links
3. It supports custom `rightContent` that might include client-side components

However, you can safely use it in both:
- **Server Components** (Next.js App Router)
- **Client Components** (interactive pages)

### Performance Considerations

1. **Image Optimization**: Use Next.js `<Image>` component with `priority` prop for above-the-fold images
2. **Animation**: Single fade-in animation is lightweight (200ms)
3. **Grid Layout**: CSS Grid is highly performant for layout calculations
4. **Memoization**: `useMemo` prevents unnecessary class recalculations

### Accessibility

- Semantic HTML: `<section>`, `<h1>`, `<p>`
- Proper heading hierarchy (h1 for headline)
- Button focus states with visible rings
- ARIA-compliant (inherits from Button component)

---

## File Structure

```
src/
├── components/
│   ├── sections/
│   │   ├── hero.tsx               # Main component
│   │   ├── hero.example.tsx       # 8 usage examples
│   │   └── index.ts               # Barrel export
│   └── ui/
│       └── button.tsx             # Button component (dependency)
└── lib/
    └── utils.ts                   # cn() utility (dependency)
```

---

## Integration with Existing Codebase

The Hero component integrates seamlessly with your current setup:

1. **Button Component**: Uses existing `/src/components/ui/button.tsx`
2. **Tailwind Config**: Leverages colors and spacing from `/tailwind.config.ts`
3. **Utilities**: Uses `cn()` helper from `/src/lib/utils.ts`
4. **Next.js Link**: Built-in support for Next.js routing

---

## Next Steps

1. **Create Additional Sections**:
   - CTA Section
   - Feature Grid Section
   - Logo Cloud Section
   - Testimonial Section

2. **Build Page Templates**:
   - Homepage template
   - Product page template
   - Solutions page template

3. **Add Variants**:
   - Dark mode support (if needed)
   - Video background hero
   - Animated gradient backgrounds

---

## Support & Customization

The Hero component is fully customizable through:
- Props configuration
- CSS class overrides via `className` prop
- Tailwind utility classes
- Custom `rightContent` React nodes

For questions or customization needs, refer to:
- Astralis specification: `/astralis-branded-refactor.md`
- Component examples: `/src/components/sections/hero.example.tsx`
- Tailwind config: `/tailwind.config.ts`

---

**Version**: 1.0
**Last Updated**: 2025-11-18
**Spec Compliance**: Astralis Brand Specification Section 3.3

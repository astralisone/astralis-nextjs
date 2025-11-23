# Layout Components

This directory contains layout components for the Astralis application, following the brand specification defined in `astralis-branded-refactor.md`.

## Navigation Component

The `Navigation` component provides a comprehensive navigation system with both desktop and mobile experiences.

### Features

#### Desktop Navigation (≥768px)
- **Logo positioning**: Left-aligned with gradient text effect
- **Navigation items**: Right-aligned horizontal menu
  - Home
  - Solutions
  - AstralisOps
  - Marketplace
  - Contact
- **Active state**: Bottom slide-in underline animation (150-250ms)
- **CTA button**: "Talk to us" with primary button styling
- **Container**: Max width 1280px with 80-120px horizontal padding
- **Smooth transitions**: All interactions use 150ms duration

#### Mobile Navigation (<768px)
- **Hamburger menu**: Accessible button with Menu/X icons
- **Slide-out panel**: Animates from right side
- **Link spacing**: 24px vertical spacing between items
- **Backdrop overlay**: Semi-transparent with blur effect
- **Auto-close**: Closes on route change or link selection
- **Body scroll lock**: Prevents background scrolling when open

#### Styling Details
- **Background**: Astralis Navy (#0A1B2B) with 95% opacity and backdrop blur
- **Border**: Bottom border using slate-800
- **Positioning**: Sticky at top (z-index: 50)
- **Typography**: Inter font family (via Tailwind)
- **Accessibility**: Full ARIA labels and keyboard navigation support

### Usage

#### Basic Implementation

```tsx
// In your App Router layout
import { Navigation } from '@/components/layout';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        <main>{children}</main>
      </body>
    </html>
  );
}
```

#### With Pages Router

```tsx
// In _app.tsx
import { Navigation } from '@/components/layout';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Navigation />
      <Component {...pageProps} />
    </>
  );
}
```

### Component Architecture

The Navigation component is a **client component** (`'use client'`) that uses:

1. **Next.js Navigation Hooks**:
   - `usePathname()` - Track active route
   - `next/link` - Client-side navigation

2. **State Management**:
   - `mobileMenuOpen` - Control mobile menu visibility
   - Auto-close on route change via `useEffect`
   - Body scroll lock when mobile menu is open

3. **Responsive Breakpoints**:
   - Mobile: < 768px (Tailwind `md` breakpoint)
   - Desktop: ≥ 768px

4. **Animation Strategy**:
   - Desktop active state: CSS animation (slide-in)
   - Mobile panel: Custom keyframe animation (slide-in-right)
   - Backdrop: Tailwind's fade-in animation
   - All animations: 150-250ms as per brand spec

### Accessibility Features

- **Semantic HTML**: Uses `<header>`, `<nav>`, `<ul>`, `<li>` elements
- **ARIA Labels**: All interactive elements have proper labels
- **ARIA States**: `aria-expanded` on mobile menu button
- **ARIA Modal**: Mobile menu uses `role="dialog"` and `aria-modal="true"`
- **Screen Reader**: Hidden text for icon-only buttons
- **Keyboard Navigation**: Full keyboard support for all interactions

### Customization

#### Adding New Navigation Items

Edit the `navItems` array in `/src/components/layout/navigation.tsx`:

```tsx
const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Solutions', href: '/solutions' },
  { label: 'AstralisOps', href: '/astralisops' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Contact', href: '/contact' },
  // Add your new item:
  { label: 'Blog', href: '/blog' },
];
```

#### Changing CTA Button

The CTA button uses the primary Button component. To change:

```tsx
{/* Desktop CTA */}
<Button variant="primary" size="default" asChild>
  <Link href="/your-custom-link">Your CTA Text</Link>
</Button>
```

#### Styling Overrides

The component uses Tailwind CSS classes. To override:

1. **Colors**: Update in `tailwind.config.ts` under `colors.astralis-*`
2. **Spacing**: Modify padding/gap classes in the component
3. **Container width**: Change `max-w-[1280px]` to your preferred width
4. **Animations**: Adjust `duration-fast` (150ms) or add custom keyframes

### Performance Considerations

1. **Client Component**: This is a client component due to interactive state
2. **Code Splitting**: Automatically code-split by Next.js
3. **No External Dependencies**: Uses only built-in Next.js features and lucide-react icons
4. **Minimal Re-renders**: State changes are localized to mobile menu interactions
5. **Optimized Animations**: CSS-based animations (GPU-accelerated)

### Browser Support

- **Modern Browsers**: Full support (Chrome, Firefox, Safari, Edge)
- **Backdrop Blur**: Progressive enhancement (fallback to solid background)
- **Sticky Positioning**: Fully supported in all modern browsers

### Testing Checklist

- [ ] Desktop navigation displays correctly at all viewport widths ≥768px
- [ ] Mobile menu opens/closes smoothly with hamburger button
- [ ] Active route highlights correctly on both desktop and mobile
- [ ] "Talk to us" CTA navigates to /contact page
- [ ] Mobile menu closes when clicking a navigation link
- [ ] Mobile menu closes when clicking backdrop overlay
- [ ] Body scroll is locked when mobile menu is open
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Screen readers announce navigation structure correctly
- [ ] All links navigate correctly with Next.js routing
- [ ] Animations are smooth and match brand timing (150-250ms)

### Brand Compliance

This component follows **Section 3.3** of the Astralis brand specification:

✅ Logo positioned left
✅ Nav items positioned right
✅ Active state with bottom slide-in underline (150-250ms)
✅ Primary CTA button ("Talk to us")
✅ Max width: 1280px container
✅ Horizontal padding: 80-120px (using Tailwind's px-20 lg:px-[120px])
✅ Mobile hamburger → slide-out panel
✅ Mobile link spacing: 24px (gap-24)
✅ Backdrop overlay
✅ Astralis Navy background (#0A1B2B)
✅ Border bottom: slate-800
✅ Backdrop blur effect
✅ Sticky positioning
✅ Smooth animations (150-250ms)

### Dependencies

- **Next.js**: Link component and usePathname hook
- **React**: useState, useEffect hooks
- **lucide-react**: Menu and X icons
- **Tailwind CSS**: Utility classes
- **Custom utilities**: cn() function from @/lib/utils
- **UI components**: Button component from @/components/ui/button

### File Structure

```
src/components/layout/
├── index.ts           # Barrel export for cleaner imports
├── navigation.tsx     # Main navigation component
└── README.md          # This file
```

---

## Future Enhancements

Consider these enhancements for future iterations:

1. **Mega Menu**: Add dropdown menus for Solutions/AstralisOps
2. **Search**: Integrate global search functionality
3. **User Menu**: Add authenticated user menu with avatar
4. **Notifications**: Add notification bell icon
5. **Theme Toggle**: Add dark/light mode switcher
6. **Language Selector**: Add i18n support
7. **Progress Indicator**: Add loading bar for page transitions
8. **Breadcrumbs**: Add breadcrumb navigation for deep pages

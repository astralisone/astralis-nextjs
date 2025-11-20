# Animation System Documentation

## Overview

This document describes the comprehensive animation system implemented for the Astralis platform. All animations are designed to be performant (60fps), accessible (respect `prefers-reduced-motion`), and match the visual polish shown in the reference mockups.

## Architecture

### Component Structure

```
src/
├── components/
│   ├── effects/          # Ambient animation effects
│   │   ├── ParticleField.tsx
│   │   ├── ConstellationBackground.tsx
│   │   ├── LensFlare.tsx
│   │   ├── PulsingRing.tsx
│   │   └── index.ts
│   └── interactive/      # Interactive animated components
│       ├── FloatingIcons.tsx
│       ├── OrbitalIcons.tsx
│       ├── AnimatedBarChart.tsx
│       └── index.ts
└── hooks/
    └── animations/       # Animation utility hooks
        ├── useCountUp.ts
        ├── useStepTransition.ts
        ├── useIntersectionAnimation.ts
        ├── useHoverGlow.ts
        └── index.ts
```

## Effects Components

### ParticleField

Canvas-based particle system for ambient background animations.

**Features:**
- Floating particles with connection lines
- Mouse interaction (particles move away from cursor)
- Configurable density, speed, and color
- GPU-accelerated rendering

**Usage:**
```tsx
import { ParticleField } from '@/components/effects';

<ParticleField
  density={50}
  speed={0.5}
  color="cyan"
  connectionLines={true}
  interactive={true}
/>
```

**Performance Notes:**
- Uses `requestAnimationFrame` for 60fps
- Canvas-based for optimal performance with many particles
- Automatically pauses when not visible (Intersection Observer)

### ConstellationBackground

SVG-based network of connected nodes creating a constellation effect.

**Features:**
- Floating nodes with connection lines
- Interactive hover effects
- Animated line drawing on mount
- Smooth floating animations

**Usage:**
```tsx
import { ConstellationBackground } from '@/components/effects';

<ConstellationBackground
  nodeCount={20}
  connectionDistance={150}
  interactive={true}
  color="cyan"
/>
```

**Best Practices:**
- Use on dark backgrounds for best visibility
- Keep nodeCount reasonable (15-30) for performance
- Enable interactive mode for engagement

### LensFlare

SVG radial gradient-based lens flare effect.

**Features:**
- Multiple gradient layers
- Pulsing animation
- Customizable position and intensity
- Multiple color presets

**Usage:**
```tsx
import { LensFlare } from '@/components/effects';

<LensFlare
  position={{ x: '50%', y: '50%' }}
  intensity={0.6}
  color="cyan"
  size={1.2}
/>
```

### PulsingRing

Concentric pulsing rings with glow effects.

**Features:**
- Multiple animated rings
- Customizable colors and glow intensity
- Support for center content
- Ripple animation

**Usage:**
```tsx
import { PulsingRing } from '@/components/effects';

<PulsingRing
  size={200}
  rings={3}
  color="cyan"
  glowIntensity="high"
>
  <div>Center Content</div>
</PulsingRing>
```

## Interactive Components

### OrbitalIcons

Icons orbiting around a center point in a circular path.

**Features:**
- Configurable orbit radius and speed
- Glow effects on hover
- Support for center content (logo, text)
- Staggered animation starts

**Usage:**
```tsx
import { OrbitalIcons } from '@/components/interactive';
import { Search, Settings, Zap, Shield } from 'lucide-react';

<OrbitalIcons
  icons={[Search, Settings, Zap, Shield]}
  radius={200}
  speed="slow"
  glowOnHover={true}
>
  <PulsingRing size={120}>
    <div className="text-4xl">AI</div>
  </PulsingRing>
</OrbitalIcons>
```

**Reference:** Matches Image 1 (ykpbji) - Central AI ring with orbiting tech icons

### AnimatedBarChart

Bar chart with animated entry and hover effects.

**Features:**
- Bars animate from 0 to value on scroll
- Count-up animation for numbers
- Hover tooltips
- Multiple color schemes
- Responsive design

**Usage:**
```tsx
import { AnimatedBarChart } from '@/components/interactive';

<AnimatedBarChart
  data={[
    { label: 'Before', value: 1200, color: 'slate' },
    { label: 'After', value: 3726, color: 'cyan' }
  ]}
  valueFormat="currency"
  animateOnScroll={true}
/>
```

**Reference:** Matches ROI calculator comparison charts from reference images

### FloatingIcons

Physics-based floating icon animation.

**Features:**
- Smooth floating motion using sine waves
- Parallax scroll effect (optional)
- Configurable speed and amplitude
- Intersection Observer for performance

**Usage:**
```tsx
import { FloatingIcons } from '@/components/interactive';

<FloatingIcons
  icons={[<Icon1 />, <Icon2 />, <Icon3 />]}
  count={8}
  enableParallax={true}
  speed={1}
/>
```

## Animation Hooks

### useCountUp

Animated number counting with configurable formatting.

**Features:**
- Smooth easing functions (linear, easeOut, easeInOut)
- Format options (currency, percentage, compact)
- Configurable duration and delay
- Respects reduced motion

**Usage:**
```tsx
import { useCountUp } from '@/hooks/animations';

function MyComponent() {
  const value = useCountUp(3726, {
    duration: 1000,
    format: 'currency',
    decimals: 0,
    easing: 'easeOut'
  });

  return <div className="text-5xl">{value}</div>;
}
```

### useStepTransition

Multi-step navigation with slide transitions.

**Features:**
- Step navigation (next, prev, goto)
- Validation support
- History tracking
- Transition direction tracking

**Usage:**
```tsx
import { useStepTransition } from '@/hooks/animations';

function Wizard() {
  const {
    currentStep,
    nextStep,
    prevStep,
    isFirstStep,
    isLastStep,
    transitionClass
  } = useStepTransition({
    totalSteps: 3,
    initialStep: 1,
    validateStep: (step) => true
  });

  return (
    <div className={transitionClass}>
      Step {currentStep}
    </div>
  );
}
```

### useIntersectionAnimation

Trigger animations when elements scroll into view.

**Features:**
- Intersection Observer based
- Configurable threshold and root margin
- Play-once or repeat modes
- Delay support

**Usage:**
```tsx
import { useIntersectionAnimation } from '@/hooks/animations';

function AnimatedSection() {
  const { ref, isVisible, hasAnimated } = useIntersectionAnimation({
    threshold: 0.1,
    triggerOnce: true
  });

  return (
    <div
      ref={ref}
      className={isVisible ? 'animate-fade-in' : 'opacity-0'}
    >
      Content
    </div>
  );
}
```

### useStaggerAnimation

Create staggered child animations.

**Usage:**
```tsx
import { useStaggerAnimation } from '@/hooks/animations';

function StaggeredList({ items }) {
  const delays = useStaggerAnimation(items.length, 100);

  return items.map((item, i) => (
    <div
      key={i}
      className="animate-fade-in"
      style={{ animationDelay: `${delays[i]}ms` }}
    >
      {item}
    </div>
  ));
}
```

### useHoverGlow

Manage glow effects on interactive elements.

**Features:**
- Hover and focus state management
- Mouse position tracking
- Glow intensity presets
- CSS class and inline style generation

**Usage:**
```tsx
import { useHoverGlow } from '@/hooks/animations';

function GlowCard() {
  const { isHovered, handlers, glowClass, glowStyle } = useHoverGlow({
    intensity: 'high',
    color: 'cyan',
    trackMouse: true,
    activateOnFocus: true
  });

  return (
    <div
      {...handlers}
      className={cn('card', isHovered && glowClass)}
      style={glowStyle}
    >
      Card Content
    </div>
  );
}
```

## Tailwind Animation Classes

### Pre-configured Animations

All these are defined in `tailwind.config.ts`:

**Entrance Animations:**
- `animate-fade-in` - Fade in (200ms)
- `animate-slide-in` - Slide in from bottom (250ms)
- `animate-slide-in-right` - Slide in from right (300ms)
- `animate-slide-in-left` - Slide in from left (300ms)

**Glow Effects:**
- `animate-glow-pulse` - Pulsing cyan glow (2s infinite)
- `animate-glow-pulse-blue` - Pulsing blue glow (2s infinite)
- `animate-pulse-glow` - Simple opacity pulse (2s infinite)

**Float Animations:**
- `animate-float` - Gentle floating (3s infinite)
- `animate-float-slow` - Slow floating (6s infinite)

**Particle Effects:**
- `animate-particle-float` - Complex particle movement (4s infinite)
- `animate-particle-stream` - Flowing particles (15s infinite)

**Rotation:**
- `animate-rotate-slow` - Slow rotation (20s infinite)
- `animate-orbit` - Orbital rotation (30s infinite)

**Special Effects:**
- `animate-ring-pulse` - Ring ripple effect (2s infinite)
- `animate-lens-flare` - Lens flare pulse (3s infinite)
- `animate-draw-line` - SVG line drawing (2s forwards)
- `animate-scale-pulse` - Scale pulse (2s infinite)
- `animate-border-flow` - Border color flow (3s infinite)

### Shadow Classes

**Glow Shadows:**
- `shadow-glow-cyan` - Cyan glow (low intensity)
- `shadow-glow-cyan-lg` - Cyan glow (medium)
- `shadow-glow-cyan-xl` - Cyan glow (high)
- `shadow-glow-blue` - Blue glow (low)
- `shadow-glow-blue-lg` - Blue glow (medium)
- `shadow-glow-purple` - Purple glow

**Special Shadows:**
- `shadow-neon-cyan` - Intense neon cyan
- `shadow-neon-blue` - Intense neon blue
- `shadow-lens-flare` - Lens flare effect
- `shadow-card-glass` - Glass morphism shadow

## Performance Guidelines

### 60 FPS Target

1. **Use CSS Transforms** - Only animate `transform` and `opacity` for GPU acceleration
2. **Avoid Layout Thrashing** - Don't animate properties that trigger reflow (width, height, margin, padding)
3. **Use will-change** - Apply `will-change: transform, opacity` to elements being animated
4. **Debounce Scroll Handlers** - Use passive listeners and throttle expensive operations

### Optimization Techniques

```tsx
// Good: GPU-accelerated
<div className="transform translate-x-4 opacity-50 transition-all" />

// Bad: Forces layout recalculation
<div className="left-4 transition-all" />
```

### Canvas Performance

For ParticleField and similar canvas components:
- Limit particle count (50-100 max)
- Use `requestAnimationFrame`
- Clear and redraw only changed areas if possible
- Throttle mouse interaction calculations

## Accessibility

All animation components respect `prefers-reduced-motion`:

```tsx
// Automatic in all hooks and components
useEffect(() => {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  setPrefersReducedMotion(mediaQuery.matches);

  const handler = (e: MediaQueryListEvent) =>
    setPrefersReducedMotion(e.matches);
  mediaQuery.addEventListener('change', handler);

  return () => mediaQuery.removeEventListener('change', handler);
}, []);
```

### Keyboard Navigation

Interactive components support keyboard navigation:

```tsx
<button
  onMouseEnter={handleHover}
  onFocus={handleHover}  // Also trigger on focus
  onMouseLeave={handleBlur}
  onBlur={handleBlur}
  className="focus-visible:ring-2 focus-visible:ring-astralis-cyan"
>
  Interactive Element
</button>
```

### ARIA Attributes

Decorative animations use proper ARIA:

```tsx
<div aria-hidden="true" role="presentation">
  <ParticleField />
</div>
```

## Usage Examples

### Hero Section with Effects

```tsx
import { Hero } from '@/components/sections/hero';
import { ParticleField, PulsingRing } from '@/components/effects';
import { OrbitalIcons } from '@/components/interactive';

function HomePage() {
  return (
    <Hero
      headline="AI-Powered Solutions"
      subheadline="Transform Your Business"
      rightContent={
        <div className="relative h-full w-full">
          <ParticleField
            density={40}
            color="cyan"
            connectionLines={true}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <OrbitalIcons
              icons={techIcons}
              radius={180}
              speed="slow"
            >
              <PulsingRing size={140} rings={3} />
            </OrbitalIcons>
          </div>
        </div>
      }
    />
  );
}
```

### Marketplace with Constellation

```tsx
import { ConstellationBackground } from '@/components/effects';
import { MarketplaceSearch } from '@/components/marketplace';

function MarketplacePage() {
  return (
    <section className="relative min-h-screen bg-astralis-navy">
      <ConstellationBackground
        nodeCount={20}
        interactive={true}
        color="cyan"
      />
      <div className="relative z-10">
        <MarketplaceSearch />
      </div>
    </section>
  );
}
```

### ROI Calculator with Animation

```tsx
import { AnimatedBarChart } from '@/components/interactive';
import { useCountUp } from '@/hooks/animations';

function ROISection() {
  const estimatedROI = useCountUp(3726, {
    duration: 1500,
    format: 'currency',
    delay: 500
  });

  return (
    <div>
      <h3 className="text-5xl font-bold text-astralis-cyan">
        {estimatedROI}
      </h3>
      <AnimatedBarChart
        data={[
          { label: 'Before', value: 1200, color: 'slate' },
          { label: 'After', value: 3726, color: 'cyan' }
        ]}
        animateOnScroll={true}
      />
    </div>
  );
}
```

## Browser Compatibility

All animations are tested and supported in:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Fallbacks

Modern CSS features used with fallbacks:
- `backdrop-filter` - Falls back to solid background
- CSS Grid - Falls back to flexbox
- CSS animations - Respects `prefers-reduced-motion`

## Testing

### Visual Regression Tests

Use Storybook for visual regression testing:

```bash
npm run storybook
```

All animated components have Storybook stories in `*.stories.tsx` files.

### Performance Monitoring

Check FPS in development:

```tsx
// Add to any animated component in dev mode
if (process.env.NODE_ENV === 'development') {
  let lastTime = performance.now();
  const checkFPS = () => {
    const now = performance.now();
    const fps = 1000 / (now - lastTime);
    if (fps < 55) console.warn('FPS drop:', fps);
    lastTime = now;
    requestAnimationFrame(checkFPS);
  };
  checkFPS();
}
```

## Future Enhancements

Planned improvements:
1. WebGL-based particle system for even better performance
2. More easing function presets
3. Advanced path animations (SVG stroke animations)
4. 3D CSS transforms for depth effects
5. Spring physics-based animations
6. Gesture-based interactions (touch/swipe)

## References

- **Reference Images**: `/public/images/Gemini_Generated_Image_*.png`
- **Tailwind Config**: `/tailwind.config.ts`
- **Storybook**: Run `npm run storybook` to see all components

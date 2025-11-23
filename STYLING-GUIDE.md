# Astralis Design System - Styling Guide

## Overview

This guide documents the atomic-level CSS/Tailwind styling system designed to match the reference mockups pixel-perfectly. The system includes advanced visual effects like glows, particles, glassmorphism, and animations.

## Reference Images

The styling is based on 9 reference mockups located at:
- `/public/images/Gemini_Generated_Image_*.png`

Key visual elements:
- **Image 1 (ykpbji)**: Central AI ring with glowing cyan effects and orbiting tech icons
- **Image 2 (45a75t)**: Full landing page with hero, stats, process flow
- **Image 3 (u8cfwa)**: Marketplace with constellation particles and glass search bar
- **Image 4 (b4zufe)**: Calendar with gradient background and lens flare
- **Image 5 (4bhw50)**: Marketplace listing with cards and filters
- **Images 6, 9**: Services pages with stats and ROI calculator
- **Image 7 (4o4jid)**: Booking page with wizard steps
- **Image 8 (mrhqnj)**: Solutions by function with FAQ accordion

---

## Color System

### Primary Colors

```tsx
// Astralis Brand
'astralis-navy': '#0A1B2B'      // Dark navy backgrounds
'astralis-blue': '#2B6CB0'       // Primary blue
'astralis-cyan': '#00D4FF'       // Accent cyan (main glow color)

// Full Cyan Palette
'astralis-cyan-50': '#E5F9FF'
'astralis-cyan-100': '#CCF3FF'
'astralis-cyan-500': '#00D4FF'   // DEFAULT
'astralis-cyan-900': '#002633'

// Tech Glow Colors
'tech-glow-cyan': '#00D4FF'
'tech-glow-blue': '#0099FF'
'tech-glow-purple': '#6B5BFF'
```

### Gradient Colors

```tsx
'navy-gradient-start': '#0A1B2B'
'navy-gradient-end': '#000000'
'light-gradient': '#F5F5F5'
```

### Usage Examples

```tsx
// Dark navy background with cyan text
<div className="bg-astralis-navy text-astralis-cyan">

// Gradient background
<div className="bg-gradient-to-br from-astralis-navy to-navy-gradient-end">

// Cyan accents
<button className="bg-astralis-cyan text-white">
```

---

## Background Gradients

### Radial Gradients (Image 1, 4)

```tsx
// Dark radial (Image 1 - AI ring background)
<div className="bg-gradient-radial-dark">

// Navy radial with ellipse
<div className="bg-gradient-radial-navy">

// Navy to light (Image 4 - calendar section)
<div className="bg-gradient-navy-to-light">
```

### Tech Gradients

```tsx
// Tech gradient (Image 2, 5 - hero sections)
<div className="bg-gradient-tech">

// Tech radial
<div className="bg-gradient-tech-radial">
```

### Custom Gradient Example

```tsx
<div className="bg-gradient-to-br from-astralis-navy via-astralis-blue to-navy-gradient-end">
  Hero Content
</div>
```

---

## Glow Effects

### Box Shadows

```tsx
// Cyan glows (Images 1, 3, 4)
shadow-glow-cyan       // Standard cyan glow
shadow-glow-cyan-lg    // Large cyan glow
shadow-glow-cyan-xl    // Extra large cyan glow

// Blue glows (Images 2, 5, 6)
shadow-glow-blue
shadow-glow-blue-lg

// Neon ring effects (Image 1 - central AI ring)
shadow-neon-cyan
shadow-neon-blue

// Glass shadows (Images 3, 4)
shadow-card-glass
shadow-card-glass-light

// Lens flare (Image 4)
shadow-lens-flare
```

### Usage Examples

```tsx
// Glowing button (Image 2 - CTA buttons)
<button className="bg-astralis-cyan text-white shadow-glow-cyan hover:shadow-glow-cyan-lg">
  Book Free Session
</button>

// Glowing card
<div className="bg-white rounded-lg shadow-glow-blue p-6">
  Feature Card
</div>

// Central AI ring (Image 1)
<div className="ai-ring">
  <span className="text-white font-bold">AI</span>
</div>
```

---

## Glassmorphism

### Glass Card Classes

```tsx
// Standard glass (Images 3, 4)
.glass-card           // Medium blur, dark backgrounds
.glass-elevated       // Strong blur, elevated effect
.glass-search         // Search bar with focus glow (Image 3)
.glass-card-light     // Light glass for bright backgrounds (Image 4)

// Content cards (Images 2, 5)
.content-card         // White cards on light backgrounds
```

### Usage Examples

```tsx
// Search bar with glass effect (Image 3)
<div className="glass-search px-4 py-3 rounded-lg">
  <input type="text" placeholder="Search..." />
</div>

// Calendar with glass styling (Image 4)
<div className="glass-card-light p-6 rounded-xl">
  <CalendarIcon />
</div>

// Elevated glass card
<div className="glass-elevated p-8 rounded-2xl">
  Modal Content
</div>
```

---

## Particle Effects

### Particle Backgrounds

```tsx
// Static particle background (Images 1, 3, 4)
<div className="particle-bg">

// Animated particles
<div className="particle-bg-animated">

// Constellation network (Image 3)
<div className="constellation-bg">

// With custom background
<div className="bg-gradient-radial-dark particle-bg">
```

### Advanced Particle System

```tsx
// Full particle system (Image 1, 3)
<div className="particle-system">
  <div className="particle"></div>
  <div className="particle"></div>
  <div className="particle"></div>
  {/* ...up to 10 particles */}
</div>

// Particle stream (Image 4)
<div className="particle-stream"></div>
```

---

## Tech Grid Patterns

```tsx
// Static tech grid (Images 1, 3)
<div className="tech-grid">

// Animated tech grid
<div className="tech-grid-animated">

// Hexagonal pattern
<div className="hex-pattern">

// Circuit pattern
<div className="circuit-pattern">
```

### Combined Example

```tsx
<div className="bg-astralis-navy tech-grid particle-bg">
  <div className="container mx-auto">
    Hero Content
  </div>
</div>
```

---

## Glowing Borders

### Border Utilities

```tsx
// Cyan glowing border (Image 1 - AI ring)
<div className="glow-border-cyan rounded-lg p-6">
  Content
</div>

// Blue glowing border
<div className="glow-border-blue rounded-lg p-6">
  Content
</div>
```

### Custom Border Animation

The border animates with the `border-flow` animation automatically.

---

## Text Effects

### Text Glow

```tsx
// Cyan text glow (Image 2 - hero headings)
<h1 className="text-glow-cyan text-white">
  AI-Driven Sales Automation
</h1>

// White text glow
<h2 className="text-glow-white text-white">
  Transform Your Business
</h2>

// Blue text glow
<h3 className="text-glow-blue text-white">
  Key Features
</h3>
```

---

## Icon Circles

### Icon Container Styles

```tsx
// Cyan icon circle (Images 1, 2 - feature icons)
<div className="icon-circle">
  <SearchIcon className="w-6 h-6 text-astralis-cyan" />
</div>

// Blue icon circle
<div className="icon-circle-blue">
  <ChartIcon className="w-6 h-6 text-astralis-blue" />
</div>

// Large feature icon (Images 2, 5, 8)
<div className="feature-icon">
  <RocketIcon className="w-10 h-10 text-astralis-cyan" />
</div>
```

### Orbiting Icons (Image 1)

```tsx
<div className="orbit-container">
  <div className="orbit-ring orbit-ring-1"></div>
  <div className="orbit-ring orbit-ring-2"></div>
  <div className="orbit-ring orbit-ring-3"></div>

  <div className="orbit-item">
    <div className="orbit-item-content icon-circle">
      <SearchIcon />
    </div>
  </div>
  {/* Repeat for multiple orbiting icons */}
</div>
```

---

## Button Styles

### Glow Buttons

```tsx
// Cyan glow button (Image 2, 5 - CTAs)
<button className="btn-glow-cyan">
  Launch Sales Autopilot
</button>

// Blue glow button
<button className="btn-glow-blue">
  Get Started
</button>

// Outline with glow on hover
<button className="btn-outline-glow">
  Contact an Expert
</button>
```

### Existing Button Classes

```tsx
// Primary button (from globals.css)
<button className="btn-primary">
  Learn More
</button>

// Secondary button
<button className="btn-secondary">
  View Pricing
</button>
```

---

## Animations

### Float Animations (Image 1)

```tsx
// Standard float
<div className="animate-float">
  <TechIcon />
</div>

// Slow float
<div className="animate-float-slow">
  <CloudIcon />
</div>
```

### Glow Pulse Animations

```tsx
// Cyan glow pulse
<div className="animate-glow-pulse shadow-glow-cyan">
  Pulsing Element
</div>

// Blue glow pulse
<div className="animate-glow-pulse-blue shadow-glow-blue">
  Pulsing Element
</div>
```

### Special Animations

```tsx
// Ring pulse (Image 1 - central AI ring)
<div className="animate-ring-pulse">

// Lens flare (Image 4)
<div className="animate-lens-flare lens-flare">

// Orbiting elements (Image 1)
<div className="animate-orbit">

// Particle stream (Image 4)
<div className="animate-particle-stream">

// Border flow
<div className="animate-border-flow border-2 border-astralis-cyan">
```

### Full Animation List

```tsx
animate-fade-in          // 200ms fade in
animate-slide-in         // 250ms slide in
animate-glow-pulse       // Cyan glow pulse
animate-glow-pulse-blue  // Blue glow pulse
animate-float            // 3s float
animate-float-slow       // 6s slow float
animate-pulse-glow       // Opacity pulse
animate-shimmer          // Shimmer effect
animate-scan-line        // Vertical scan line
animate-particle-float   // Particle movement
animate-particle-stream  // Horizontal stream
animate-rotate-slow      // 20s rotation
animate-orbit            // 30s orbit
animate-scale-pulse      // Scale pulse
animate-border-flow      // Border color flow
animate-ring-pulse       // Ring expansion
animate-lens-flare       // Lens flare pulse
animate-draw-line        // SVG line draw
```

---

## Process Flow Connectors (Images 2, 5)

### Arrow Connectors

```tsx
// Flow arrow between steps
<div className="flex items-center gap-4">
  <div className="icon-circle">Step 1</div>
  <div className="flow-arrow"></div>
  <div className="icon-circle">Step 2</div>
</div>
```

---

## Badges (Image 5)

### Badge Styles

```tsx
// Featured badge
<span className="badge-featured">Featured</span>

// New badge
<span className="badge-new">New</span>
```

---

## Advanced Effects

### Central AI Ring (Image 1)

```tsx
<div className="flex items-center justify-center min-h-screen bg-gradient-radial-dark particle-bg">
  <div className="ai-ring">
    <span className="text-2xl font-bold text-white">AI</span>
  </div>
</div>
```

### Lens Flare Effect (Image 4)

```tsx
<div className="relative">
  <div className="lens-flare">
    <CalendarIcon className="w-20 h-20" />
  </div>
</div>
```

### Radial Glow (Image 1)

```tsx
<div className="radial-glow">
  <TechIcon />
</div>
```

### Halo Effect

```tsx
<div className="halo">
  <CircularElement />
</div>
```

---

## Background Overlays

### Dark Radial Overlay (Image 1)

```tsx
<div className="relative">
  <div className="overlay-radial-dark"></div>
  <div className="relative z-10">
    Content
  </div>
</div>
```

### Light Gradient Overlay (Image 4)

```tsx
<div className="relative">
  <div className="overlay-gradient-light"></div>
  <div className="relative z-10">
    Content
  </div>
</div>
```

### Vignette Effect

```tsx
<div className="vignette">
  <img src="..." alt="..." />
</div>
```

---

## Star Field & Special Effects

### Star Field

```tsx
<div className="relative">
  <div className="starfield"></div>
  <div className="relative z-10">
    Content
  </div>
</div>
```

### Scan Line Effect

```tsx
<div className="scan-line-effect">
  <!-- Animated scan line appears -->
</div>
```

### Holographic Effect

```tsx
<div className="holographic p-6 rounded-lg">
  Holographic Card
</div>
```

### Gradient Shift

```tsx
<div className="gradient-shift min-h-screen">
  Animated Background
</div>

<div className="gradient-cyan-shift p-6">
  Cyan Animated Background
</div>
```

---

## Loading Animations

### Dot Loader

```tsx
<div className="dot-loader">
  <span></span>
  <span></span>
  <span></span>
</div>
```

### Ring Loader

```tsx
<div className="ring-loader"></div>
```

---

## Complete Page Examples

### Hero Section (Image 2)

```tsx
<div className="bg-astralis-navy particle-bg tech-grid">
  <div className="container mx-auto px-6 py-24">
    <h1 className="text-5xl font-bold text-white text-glow-white mb-6">
      AI-Driven Sales Automation: Elevate Conversion, Accelerate Growth
    </h1>
    <p className="text-xl text-slate-300 mb-8">
      Transform your sales intelligence with multi-input routing...
    </p>
    <div className="flex gap-4">
      <button className="btn-glow-cyan">
        Launch Sales Autopilot
      </button>
      <button className="btn-outline-glow">
        Book a Demo
      </button>
    </div>
  </div>
</div>
```

### Marketplace Hero (Image 3)

```tsx
<div className="bg-astralis-navy constellation-bg min-h-screen flex items-center justify-center">
  <div className="text-center">
    <h1 className="text-4xl font-bold text-white text-glow-cyan mb-8">
      AI Marketplace
    </h1>
    <div className="glass-search max-w-2xl mx-auto">
      <input
        type="text"
        placeholder="Search..."
        className="w-full bg-transparent text-white px-4 py-3 outline-none"
      />
    </div>
  </div>
</div>
```

### Feature Grid (Image 2, 5)

```tsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
  <div className="content-card text-center">
    <div className="feature-icon mx-auto mb-4">
      <SearchIcon className="w-10 h-10 text-astralis-cyan" />
    </div>
    <h3 className="text-xl font-semibold mb-2">Feature Name</h3>
    <p className="text-slate-600">Description...</p>
  </div>
  {/* Repeat for other features */}
</div>
```

### Process Flow (Image 2, 5)

```tsx
<div className="flex items-center justify-center gap-4">
  <div className="text-center">
    <div className="icon-circle mx-auto mb-3">
      <Icon1 />
    </div>
    <p className="text-sm font-medium">Step 1</p>
  </div>

  <div className="flow-arrow"></div>

  <div className="text-center">
    <div className="icon-circle mx-auto mb-3">
      <Icon2 />
    </div>
    <p className="text-sm font-medium">Step 2</p>
  </div>

  <div className="flow-arrow"></div>

  <div className="text-center">
    <div className="icon-circle mx-auto mb-3">
      <Icon3 />
    </div>
    <p className="text-sm font-medium">Step 3</p>
  </div>
</div>
```

---

## Browser Compatibility

### Backdrop Filter Support

The glassmorphism effects use `backdrop-filter`, which is supported in:
- Chrome 76+
- Safari 9+
- Firefox 103+
- Edge 79+

### Fallback for Older Browsers

```css
/* Automatically handled by Tailwind */
.glass-card {
  @apply backdrop-blur-md; /* With fallback */
}
```

### CSS Mask Support

The glowing border effects use CSS mask, supported in:
- Chrome 120+
- Safari 15.4+
- Firefox 53+

For older browsers, the effect gracefully degrades to a standard border.

---

## Performance Considerations

### Animation Performance

- All animations use `transform` and `opacity` for GPU acceleration
- Particle systems use CSS-only animations (no JavaScript)
- Backdrop blur can impact performance on lower-end devices

### Optimization Tips

```tsx
// Reduce particles on mobile
<div className="hidden md:block particle-bg">

// Disable animations for reduced motion
@media (prefers-reduced-motion: reduce) {
  .animate-float {
    animation: none;
  }
}

// Use will-change sparingly
.performance-critical {
  will-change: transform;
}
```

---

## Responsive Design

### Mobile-First Approach

All effects are designed mobile-first with progressive enhancement:

```tsx
// Particles only on larger screens
<div className="bg-astralis-navy md:particle-bg">

// Simplified glass on mobile
<div className="bg-white/90 md:glass-card">

// Reduced glow on mobile
<button className="shadow-glow-cyan md:shadow-glow-cyan-lg">
```

### Breakpoints

```tsx
sm: 640px   // Small devices
md: 768px   // Medium devices
lg: 1024px  // Large devices
xl: 1280px  // Extra large
2xl: 1400px // Container max-width
```

---

## Storybook Integration

All components with these effects should have Storybook stories showing:

1. Default state
2. Dark background variant
3. With glow effects
4. Animated variant
5. Glass variant

Example:

```tsx
export const Default = () => <Button>Click me</Button>;
export const WithGlow = () => <Button className="btn-glow-cyan">Click me</Button>;
export const OnDarkBg = () => (
  <div className="bg-astralis-navy p-8">
    <Button className="btn-outline-glow">Click me</Button>
  </div>
);
```

---

## Quick Reference

### Most Common Patterns

```tsx
// Hero section background
className="bg-astralis-navy particle-bg tech-grid"

// CTA button
className="btn-glow-cyan"

// Feature card
className="content-card hover:shadow-card-hover"

// Icon container
className="icon-circle"

// Glass search bar
className="glass-search"

// Glowing heading
className="text-glow-cyan text-white"

// Process step connector
<div className="flow-arrow" />

// Featured badge
className="badge-featured"
```

---

## Support

For questions or issues with the styling system, refer to:
- `tailwind.config.ts` - Color palette and animation definitions
- `src/app/globals.css` - Component classes and utilities
- `src/styles/effects.css` - Advanced visual effects
- Reference images in `/public/images/Gemini_Generated_Image_*.png`

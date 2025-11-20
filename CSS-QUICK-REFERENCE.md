# Astralis CSS Quick Reference Card

**One-page cheat sheet for the most common styling patterns**

---

## 🎨 Colors

```tsx
// Primary Brand
bg-astralis-navy      // #0A1B2B (dark navy)
bg-astralis-blue      // #2B6CB0 (primary blue)
bg-astralis-cyan      // #00D4FF (accent cyan)

// Text Colors
text-astralis-cyan
text-astralis-blue
text-white
text-slate-300        // Light gray text on dark
text-slate-600        // Dark gray text on light
```

---

## 🌈 Gradients

```tsx
// Dark Backgrounds (Hero Sections)
bg-gradient-radial-dark         // Image 1: Black center to navy
bg-gradient-radial-navy         // Ellipse navy gradient
bg-gradient-tech                // Linear navy gradient

// Light Backgrounds
bg-gradient-navy-to-light       // Image 4: Navy to light gray
```

---

## ✨ Glow Effects

```tsx
// Box Shadows
shadow-glow-cyan                // Standard cyan glow
shadow-glow-cyan-lg             // Large cyan glow
shadow-glow-blue                // Blue glow
shadow-neon-cyan                // Multi-layer neon ring

// Text Glow
text-glow-cyan                  // Glowing cyan text
text-glow-white                 // Glowing white text
```

---

## 🪟 Glassmorphism

```tsx
glass-card                      // Dark glass card
glass-search                    // Search bar with focus glow
glass-card-light                // Light glass (bright backgrounds)
content-card                    // White card on light bg
```

---

## 🎯 Buttons

```tsx
btn-glow-cyan                   // Cyan glowing CTA
btn-glow-blue                   // Blue glowing CTA
btn-outline-glow                // Outline with glow on hover
btn-primary                     // Standard primary
btn-secondary                   // Standard secondary
```

---

## 💫 Particle Effects

```tsx
particle-bg                     // Static particles
particle-bg-animated            // Animated particles
constellation-bg                // Image 3: Network effect
tech-grid                       // Grid overlay
```

---

## 🔘 Icons

```tsx
icon-circle                     // Cyan circular container
icon-circle-blue                // Blue circular container
feature-icon                    // Large feature icon
```

---

## 🎬 Animations

```tsx
animate-float                   // Gentle float (3s)
animate-float-slow              // Slow float (6s)
animate-glow-pulse              // Pulsing glow
animate-ring-pulse              // Expanding ring
animate-particle-float          // Particle movement
animate-orbit                   // Circular orbit
```

---

## 🏷️ Badges

```tsx
badge-featured                  // "Featured" tag
badge-new                       // "New" tag
```

---

## 🔗 Process Flows

```tsx
// Step with connector
<div className="icon-circle">Step 1</div>
<div className="flow-arrow" />
<div className="icon-circle">Step 2</div>
```

---

## 📐 Special Effects

```tsx
ai-ring                         // Image 1: Central AI ring
lens-flare                      // Image 4: Lens flare
glow-border-cyan                // Animated border glow
radial-glow                     // Expanding radial glow
```

---

## 📄 Page Patterns

### Dark Hero Section
```tsx
<section className="bg-astralis-navy particle-bg tech-grid py-24">
  <h1 className="text-5xl font-bold text-white text-glow-white">
    Hero Title
  </h1>
  <button className="btn-glow-cyan">Get Started</button>
</section>
```

### Marketplace Hero
```tsx
<section className="bg-astralis-navy constellation-bg min-h-screen">
  <div className="glass-search">
    <input type="text" placeholder="Search..." />
  </div>
</section>
```

### Feature Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
  <div className="content-card">
    <div className="feature-icon mx-auto mb-4">
      <Icon />
    </div>
    <h3>Feature Title</h3>
  </div>
</div>
```

### Process Flow
```tsx
<div className="flex items-center gap-4">
  {[1, 2, 3, 4].map((step, i) => (
    <>
      <div className="icon-circle">
        <span>{step}</span>
      </div>
      {i < 3 && <div className="flow-arrow" />}
    </>
  ))}
</div>
```

### Stats Bar
```tsx
<div className="bg-astralis-navy/50 border-y border-white/10 py-6">
  <div className="flex justify-between">
    <div>
      <div className="text-3xl font-bold text-astralis-cyan text-glow-cyan">
        278%
      </div>
      <div className="text-sm text-slate-300">Metric Name</div>
    </div>
  </div>
</div>
```

---

## 🎨 Image-Specific Patterns

| Image | Key Classes |
|-------|-------------|
| **1 (AI Ring)** | `bg-gradient-radial-dark particle-bg tech-grid` + `ai-ring` |
| **2 (Landing)** | `bg-astralis-navy particle-bg` + `btn-glow-cyan` + `flow-arrow` |
| **3 (Marketplace)** | `bg-astralis-navy constellation-bg` + `glass-search` |
| **4 (Calendar)** | `bg-gradient-navy-to-light lens-flare` + `glass-card-light` |
| **5 (Listing)** | `content-card` + `badge-featured` + `feature-icon` |

---

## 🚀 Common Combinations

```tsx
// Glowing hero heading
text-5xl font-bold text-white text-glow-cyan

// Feature card
content-card hover:shadow-card-hover transition-shadow

// Icon with hover
icon-circle hover:scale-110 transition-transform

// Dark section with effects
bg-astralis-navy particle-bg tech-grid py-24

// Glass container
glass-card backdrop-blur-lg p-6 rounded-xl

// Glowing button
btn-glow-cyan hover:scale-105 transition-all
```

---

## 📱 Responsive Patterns

```tsx
// Hide particles on mobile
<div className="bg-astralis-navy md:particle-bg">

// Simplified glass on mobile
<div className="bg-white/90 md:glass-card">

// Reduced glow on mobile
<button className="shadow-glow-cyan md:shadow-glow-cyan-lg">

// Stack flow on mobile
<div className="flex flex-col md:flex-row items-center gap-4">
  <div className="icon-circle">1</div>
  <div className="flow-arrow hidden md:block" />
  <div className="icon-circle">2</div>
</div>
```

---

## ⚡ Performance Tips

```tsx
// Disable heavy effects on mobile
className="hidden md:block particle-system"

// Use simpler animations on mobile
className="md:animate-float"

// Reduce blur on mobile
className="backdrop-blur-sm md:backdrop-blur-lg"
```

---

## 🎯 Do's and Don'ts

### ✅ DO
- Use `btn-glow-cyan` for primary CTAs
- Use `particle-bg` on dark navy backgrounds
- Combine `text-glow-cyan` with white text
- Use `content-card` for white cards on light backgrounds
- Use `icon-circle` for feature icons

### ❌ DON'T
- Don't use `particle-bg` on light backgrounds
- Don't use `text-glow-cyan` on light backgrounds
- Don't stack multiple glow effects on one element
- Don't use `glass-card` without a background image/gradient
- Don't animate too many elements at once

---

## 📚 Full Documentation

- **Complete Guide:** `STYLING-GUIDE.md` (5000+ words)
- **Examples:** `STYLING-EXAMPLES.tsx` (500+ lines)
- **Summary:** `REFACTOR-SUMMARY.md`

---

## 🔍 Finding Classes

**Colors:** Search for `astralis-` or `tech-glow-`
**Effects:** Look in `globals.css` for `.` prefixed classes
**Advanced:** Check `effects.css` for complex animations
**Examples:** See `STYLING-EXAMPLES.tsx` for full components

---

**Last Updated:** 2025-11-19
**Version:** 1.0.0
**Build Status:** ✅ Passing

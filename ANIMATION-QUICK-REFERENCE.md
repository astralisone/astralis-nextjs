# Animation Quick Reference

A cheat sheet for using the Astralis animation system.

## Import Paths

```tsx
// Effects Components
import {
  ParticleField,
  ConstellationBackground,
  LensFlare,
  PulsingRing
} from '@/components/effects';

// Interactive Components
import {
  OrbitalIcons,
  AnimatedBarChart,
  FloatingIcons
} from '@/components/interactive';

// Animation Hooks
import {
  useCountUp,
  useStepTransition,
  useIntersectionAnimation,
  useStaggerAnimation,
  useHoverGlow
} from '@/hooks/animations';
```

## Common Patterns

### Hero Section with Orbital Animation

```tsx
<Hero
  headline="AI-Powered Solutions"
  rightContent={
    <div className="relative h-[500px]">
      <ParticleField density={40} color="cyan" />
      <div className="absolute inset-0 flex items-center justify-center">
        <OrbitalIcons
          icons={[Search, Settings, Zap, Shield, Database, Cloud]}
          radius={180}
          speed="slow"
        >
          <PulsingRing size={140} rings={3} color="cyan">
            <div className="text-4xl font-bold text-white">AI</div>
          </PulsingRing>
        </OrbitalIcons>
      </div>
    </div>
  }
/>
```

### Marketplace with Constellation

```tsx
<section className="relative min-h-screen bg-astralis-navy">
  <ConstellationBackground
    nodeCount={20}
    connectionDistance={150}
    interactive={true}
    color="cyan"
  />
  <div className="relative z-10">
    {/* Your content */}
  </div>
</section>
```

### Animated Stats/Metrics

```tsx
function StatsCard({ value, label }) {
  const animatedValue = useCountUp(value, {
    duration: 1500,
    format: 'number',
    easing: 'easeOut'
  });

  return (
    <div className="text-center">
      <div className="text-5xl font-bold text-astralis-cyan">
        {animatedValue}
      </div>
      <div className="text-slate-600">{label}</div>
    </div>
  );
}
```

### ROI Calculator with Chart

```tsx
function ROICalculator({ before, after }) {
  const roi = useCountUp(after, {
    format: 'currency',
    duration: 1500
  });

  return (
    <div>
      <h3 className="text-5xl text-astralis-cyan mb-6">{roi}</h3>
      <AnimatedBarChart
        data={[
          { label: 'Before', value: before, color: 'slate' },
          { label: 'After', value: after, color: 'cyan' }
        ]}
        valueFormat="currency"
        animateOnScroll={true}
      />
    </div>
  );
}
```

### Scroll-Triggered Animation

```tsx
function AnimatedSection({ children }) {
  const { ref, isVisible } = useIntersectionAnimation({
    threshold: 0.2,
    triggerOnce: true
  });

  return (
    <section
      ref={ref}
      className={cn(
        'transition-all duration-700',
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-10'
      )}
    >
      {children}
    </section>
  );
}
```

### Staggered List Animation

```tsx
function StaggeredList({ items }) {
  const { ref, isVisible } = useIntersectionAnimation({
    threshold: 0.1,
    triggerOnce: true
  });
  const delays = useStaggerAnimation(items.length, 100);

  return (
    <div ref={ref} className="grid gap-4">
      {items.map((item, i) => (
        <div
          key={i}
          className={cn(
            'transition-all duration-500',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}
          style={{ transitionDelay: `${delays[i]}ms` }}
        >
          {item}
        </div>
      ))}
    </div>
  );
}
```

### Card with Hover Glow

```tsx
function GlowCard({ children }) {
  const { isHovered, handlers, glowClass } = useHoverGlow({
    intensity: 'medium',
    color: 'cyan',
    trackMouse: true
  });

  return (
    <div
      {...handlers}
      className={cn(
        'p-6 rounded-xl bg-white border-2 border-slate-200',
        'transition-all duration-300',
        isHovered && [
          'border-astralis-cyan',
          '-translate-y-1',
          glowClass
        ]
      )}
    >
      {children}
    </div>
  );
}
```

### Multi-Step Wizard

```tsx
function BookingWizard() {
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
    validateStep: async (step) => {
      // Validate current step before proceeding
      return true;
    }
  });

  return (
    <div>
      <div className={transitionClass}>
        {currentStep === 1 && <Step1 />}
        {currentStep === 2 && <Step2 />}
        {currentStep === 3 && <Step3 />}
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={prevStep}
          disabled={isFirstStep}
        >
          Previous
        </button>
        <button
          onClick={nextStep}
          disabled={isLastStep}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

## Tailwind Animation Classes

### Entrance Animations
```tsx
className="animate-fade-in"           // 200ms fade in
className="animate-slide-in"          // 250ms slide from bottom
className="animate-slide-in-right"    // 300ms slide from right
className="animate-slide-in-left"     // 300ms slide from left
```

### Glow Effects
```tsx
className="animate-glow-pulse"        // Cyan pulsing glow
className="animate-glow-pulse-blue"   // Blue pulsing glow
className="shadow-glow-cyan"          // Cyan shadow (low)
className="shadow-glow-cyan-lg"       // Cyan shadow (medium)
className="shadow-glow-cyan-xl"       // Cyan shadow (high)
```

### Float Animations
```tsx
className="animate-float"             // 3s gentle float
className="animate-float-slow"        // 6s slow float
className="animate-particle-float"    // Complex particle motion
```

### Special Effects
```tsx
className="animate-orbit"             // 30s circular orbit
className="animate-ring-pulse"        // Ring ripple effect
className="animate-lens-flare"        // Lens flare pulse
className="animate-scale-pulse"       // Scale pulse
```

## Component Prop Quick Reference

### ParticleField
```tsx
<ParticleField
  density={50}              // 10-200
  speed={0.5}               // 0.1-2
  color="cyan"              // cyan|blue|purple|white
  connectionLines={true}
  connectionDistance={150}  // 50-300
  interactive={false}
/>
```

### ConstellationBackground
```tsx
<ConstellationBackground
  nodeCount={20}            // 5-50
  connectionDistance={150}  // 50-300
  interactive={true}
  color="cyan"              // cyan|blue|purple
  animateOnMount={true}
/>
```

### OrbitalIcons
```tsx
<OrbitalIcons
  icons={[Icon1, Icon2]}    // Array of LucideIcon
  radius={200}              // 100-300
  speed="slow"              // slow|medium|fast
  glowOnHover={true}
  iconSize={24}             // 16-48
  reverse={false}
>
  {/* Center content */}
</OrbitalIcons>
```

### AnimatedBarChart
```tsx
<AnimatedBarChart
  data={[
    { label: 'A', value: 100, color: 'cyan' }
  ]}
  height={192}              // 100-400
  showValues={true}
  valueFormat="number"      // number|currency|percentage
  animateOnScroll={true}
  animationDuration={1000}  // 500-3000
  showTooltips={true}
  spacing="normal"          // compact|normal|relaxed
/>
```

### PulsingRing
```tsx
<PulsingRing
  size={200}                // 80-400
  rings={3}                 // 1-5
  color="cyan"              // cyan|blue|purple
  glowIntensity="medium"    // low|medium|high
  speed={1}                 // 0.5-2
>
  {/* Center content */}
</PulsingRing>
```

### LensFlare
```tsx
<LensFlare
  position={{ x: '50%', y: '50%' }}
  intensity={0.6}           // 0-1
  color="cyan"              // cyan|blue|white|purple
  size={1}                  // 0.5-2
/>
```

## Hook Options Quick Reference

### useCountUp
```tsx
const value = useCountUp(3726, {
  duration: 1000,           // Animation duration (ms)
  start: 0,                 // Starting value
  format: 'number',         // number|currency|percentage|compact
  decimals: 0,              // Decimal places
  currencySymbol: '$',      // Currency symbol
  easing: 'easeOut',        // linear|easeOut|easeInOut
  delay: 0,                 // Delay before start (ms)
  autoStart: true           // Auto-start on mount
});
```

### useStepTransition
```tsx
const {
  currentStep,
  direction,
  isFirstStep,
  isLastStep,
  nextStep,
  prevStep,
  goToStep,
  reset,
  history,
  transitionClass
} = useStepTransition({
  totalSteps: 3,
  initialStep: 1,
  validateStep: (step) => true,
  onStepChange: (step, direction) => {},
  allowSkip: false
});
```

### useIntersectionAnimation
```tsx
const {
  ref,
  isVisible,
  hasAnimated,
  entry
} = useIntersectionAnimation({
  threshold: 0.1,           // 0-1
  rootMargin: '0px',
  triggerOnce: true,
  delay: 0                  // ms
});
```

### useHoverGlow
```tsx
const {
  isHovered,
  handlers,
  mousePosition,
  glowClass,
  glowStyle
} = useHoverGlow({
  intensity: 'medium',      // low|medium|high
  trackMouse: false,
  color: 'cyan',            // cyan|blue|purple
  activateOnFocus: true,
  onHoverChange: (hovered) => {}
});
```

### useStaggerAnimation
```tsx
const delays = useStaggerAnimation(
  items.length,             // Number of items
  100,                      // Base delay (ms)
  0                         // Initial delay (ms)
);
```

## Color Themes

All components support these color presets:

- **cyan** - Primary brand color (`#00D4FF`)
- **blue** - Secondary brand color (`#2B6CB0`)
- **purple** - Accent color (`#A855F7`)
- **slate** - Neutral color (for charts)
- **white** - Light theme option

## Performance Tips

1. **Limit particles**: Keep density 30-60 for ParticleField
2. **Lazy load**: Use `animateOnScroll` for charts and heavy animations
3. **One canvas per page**: Max 2 ParticleField components
4. **GPU acceleration**: Stick to `transform` and `opacity` animations
5. **Reduced motion**: All components automatically respect user preference

## Accessibility Checklist

- ✅ All decorative animations have `aria-hidden="true"`
- ✅ Interactive elements have focus states
- ✅ Keyboard navigation supported (Tab, Enter, Escape)
- ✅ Reduced motion respected automatically
- ✅ Proper ARIA labels on buttons/controls

## Common Issues

### Animation Not Starting
```tsx
// Make sure component is visible
const { ref, isVisible } = useIntersectionAnimation();

// Or disable visibility check
<AnimatedBarChart animateOnScroll={false} />
```

### Low Frame Rate
```tsx
// Reduce particle density
<ParticleField density={30} />

// Simplify constellation
<ConstellationBackground nodeCount={15} />
```

### Animation Too Fast/Slow
```tsx
// Adjust duration
const value = useCountUp(100, { duration: 2000 });

// Adjust animation speed
<OrbitalIcons speed="slow" />
```

## More Examples

See `ANIMATIONS.md` for comprehensive documentation and `*.stories.tsx` files for interactive examples in Storybook.

Run Storybook:
```bash
npm run storybook
```

Navigate to:
- Effects → ParticleField
- Effects → ConstellationBackground
- Interactive → OrbitalIcons
- Interactive → AnimatedBarChart

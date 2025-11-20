# Astralis Component Library - Reference Design Implementation

This document catalogs all components created from the Gemini-generated reference images, ensuring pixel-perfect implementation of the visual designs.

## Overview

All components have been extracted from 9 reference mockup images located at:
`/Users/gregorystarr/projects/astralis-nextjs/public/images/Gemini_Generated_Image_*.png`

## Component Inventory

### 1. ProcessFlow Component
**Location**: `/src/components/sections/process-flow.tsx`
**Storybook**: `process-flow.stories.tsx`
**Reference Images**: Images 2, 4, 5, 6, 7, 8

**Visual Specifications**:
- Horizontal row of 4-5 circular icon containers
- Connecting arrows between steps (→)
- Each step: icon (cyan/blue) + title + description
- Dark navy background variant
- White text, cyan icon glow effects
- Responsive: stacks on mobile

**Usage**:
```tsx
import { ProcessFlow } from '@/components/sections';
import { Search, Wrench, Rocket, TrendingUp } from 'lucide-react';

<ProcessFlow
  title="Our Proven Process"
  subtitle="Ready to Transform Your Business?"
  variant="dark"
  steps={[
    { icon: Search, title: "Browse & Strategy", description: "Discover opportunities" },
    { icon: Wrench, title: "Design & Optimize", description: "Create solutions" },
    { icon: Rocket, title: "Build Innovative Solutions", description: "Launch systems" },
    { icon: TrendingUp, title: "Growth & Support", description: "Scale success" }
  ]}
/>
```

**Props**:
- `title?: string` - Section heading
- `subtitle?: string` - Section description
- `steps: ProcessStep[]` - Array of process steps
- `variant?: "dark" | "light"` - Color scheme
- `showArrows?: boolean` - Display connecting arrows
- `enableGlow?: boolean` - Enable icon glow effects

---

### 2. HeroWithTechGraphic Component
**Location**: `/src/components/sections/hero-with-graphic.tsx`
**Storybook**: `hero-with-graphic.stories.tsx`
**Reference Images**: Images 2, 4, 6, 7, 8

**Visual Specifications**:
- Dark navy background (#0A1B2B) with gradient
- Left: Large heading + subheading + dual CTAs
- Right: 3D tech graphic (funnel/network/abstract)
- Particle dots in background
- Tech grid pattern overlay
- Cyan primary CTA, white outline secondary CTA

**Usage**:
```tsx
import { HeroWithTechGraphic } from '@/components/sections';

<HeroWithTechGraphic
  title="AI-Driven Sales Automation: Elevate Conversion, Accelerate Growth"
  subtitle="Transform your sales intelligence with powerful AI solutions"
  primaryCTA={{ text: "Launch Sales Analyzer Wizard", href: "#" }}
  secondaryCTA={{ text: "Book a Demo", href: "/contact" }}
  graphicType="funnel"
/>
```

**Props**:
- `title: string` - Main heading
- `subtitle: string` - Subheading/description
- `primaryCTA: CTAButton` - Primary call-to-action
- `secondaryCTA?: CTAButton` - Optional secondary CTA
- `graphicType?: "funnel" | "network" | "abstract" | "custom"` - Tech graphic type
- `customGraphic?: string` - Custom image path
- `showParticles?: boolean` - Particle background effect

---

### 3. StatsBar Component
**Location**: `/src/components/sections/stats-bar.tsx`
**Storybook**: `stats-bar.stories.tsx`
**Reference Images**: Images 2, 6, 7, 8, 9

**Visual Specifications**:
- Dark background strip (navy/black gradient)
- 3-4 stats horizontally arranged
- Large value text (white with cyan gradient)
- Smaller label text (slate-300)
- Optional separators
- Responsive: stacks on mobile

**Usage**:
```tsx
import { StatsBar } from '@/components/sections';

<StatsBar
  variant="dark"
  stats={[
    { value: "278%", label: "Higher Lead Conversion" },
    { value: "40%", label: "Reduced Cycle by" },
    { value: "95%", label: "Client Success Rate" }
  ]}
  showSeparators={true}
/>
```

**Props**:
- `stats: Stat[]` - Array of statistics
- `variant?: "dark" | "light"` - Color scheme
- `showSeparators?: boolean` - Show dividers between stats

---

### 4. FeatureCardIcon Component
**Location**: `/src/components/sections/feature-card-icon.tsx`
**Storybook**: `feature-card-icon.stories.tsx`
**Reference Images**: Images 2, 4, 8

**Visual Specifications**:
- Circular icon container (20x20, cyan/blue border)
- Icon in cyan/blue
- Title below (navy, bold, text-xl)
- Description text (gray, text-base)
- Hover: lift effect (-translate-y-2)
- Used in 3-4 column grids

**Usage**:
```tsx
import { FeatureCardIcon } from '@/components/sections';
import { Target } from 'lucide-react';

<FeatureCardIcon
  icon={Target}
  title="Sales & Marketing Optimization"
  description="Scale faster with AI-driven solutions"
  variant="light"
/>
```

**Props**:
- `icon: LucideIcon` - Icon component
- `title: string` - Feature title
- `description: string` - Feature description
- `variant?: "light" | "dark"` - Color scheme
- `onClick?: () => void` - Click handler
- `enableHover?: boolean` - Enable hover effects

---

### 5. MarketplaceSearch Component
**Location**: `/src/components/marketplace/marketplace-search.tsx`
**Storybook**: `marketplace-search.stories.tsx`
**Reference Images**: Image 3, 5

**Visual Specifications**:
- Dark navy background with particle/constellation effect
- Large centered search bar with glass/blur effect
- Placeholder: "Search"
- Category icons in circles below (6-8 icons)
- Icons float with animation
- Connecting lines (SVG constellation)
- Cyan glow accents

**Usage**:
```tsx
import { MarketplaceSearch } from '@/components/marketplace';
import { Search, Settings, Zap } from 'lucide-react';

<MarketplaceSearch
  onSearch={(query) => handleSearch(query)}
  placeholder="Search AI solutions..."
  categories={[
    { icon: Search, label: "Search", onClick: () => {} },
    { icon: Settings, label: "Configure", onClick: () => {} },
    { icon: Zap, label: "Automate", onClick: () => {} }
  ]}
/>
```

**Props**:
- `onSearch: (query: string) => void` - Search handler
- `categories?: SearchCategory[]` - Category icons
- `placeholder?: string` - Search input placeholder
- `showConstellation?: boolean` - Constellation effect

---

### 6. SolutionCard Component
**Location**: `/src/components/marketplace/solution-card.tsx`
**Storybook**: `solution-card.stories.tsx`
**Reference Images**: Images 5, 8

**Visual Specifications**:
- White background card with border
- Blue icon at top (circular container, 16x16)
- Title (bold, navy, text-xl)
- 5-star rating (yellow filled/gray empty)
- Price or metric display
- "Featured" badge (cyan, top-right, rounded-full)
- "Learn More" button (cyan, bottom)
- Hover: lift + shadow enhancement

**Usage**:
```tsx
import { SolutionCard } from '@/components/marketplace';
import { Zap } from 'lucide-react';

<SolutionCard
  icon={Zap}
  title="Predictive Analytics AI"
  rating={4.5}
  price="$99/mo"
  featured={true}
  description="Forecast customer behavior with advanced ML"
  onLearnMore={() => {}}
/>
```

**Props**:
- `icon: LucideIcon` - Icon component
- `title: string` - Solution title
- `rating?: number` - Rating (0-5)
- `price?: string` - Price or metric
- `description?: string` - Short description
- `featured?: boolean` - Show featured badge
- `badgeText?: string` - Badge text (default: "Featured")
- `onLearnMore?: () => void` - Button click handler

---

### 7. ROICalculator Component
**Location**: `/src/components/interactive/roi-calculator.tsx`
**Storybook**: `roi-calculator.stories.tsx`
**Reference Images**: Images 6, 7, 9

**Visual Specifications**:
- White card with border-2 border-slate-200
- Title and description
- Interactive slider inputs with custom styling
- Real-time calculated value (large, cyan, text-5xl)
- Bar chart showing before/after comparison
- Sliders: cyan thumb with glow effect
- Clean, modern spacing

**Usage**:
```tsx
import { ROICalculator } from '@/components/interactive';

<ROICalculator
  title="ROI Calculator"
  description="See how much you could save"
  inputs={[
    {
      label: "Avg Ticket Size",
      type: "slider",
      min: 0,
      max: 10000,
      step: 100,
      defaultValue: 5000,
      unit: "$"
    }
  ]}
  onCalculate={(values) => values.input_0 * 2.78}
  resultLabel="Estimated Monthly ROI"
  showChart={true}
/>
```

**Props**:
- `title: string` - Calculator title
- `description?: string` - Description text
- `inputs: CalculatorInput[]` - Input fields
- `onCalculate: (values: Record<string, number>) => number` - Calculation function
- `resultLabel?: string` - Result label
- `showChart?: boolean` - Display comparison chart

---

### 8. StepWizard Component
**Location**: `/src/components/booking/step-wizard.tsx`
**Storybook**: `step-wizard.stories.tsx`
**Reference Images**: Image 2, 7

**Visual Specifications**:
- White modal/card with rounded-2xl
- Header: gradient background (navy to blue), white text
- "Step X of Y: Title" format
- Progress bar below header (cyan with glow)
- Radio button options in rounded rectangles
- Each option: icon (14x14 circle) + label
- Active state: cyan border + cyan/5 background
- Close button (X) top-right
- Hover: scale-[1.02] + shadow-lg

**Usage**:
```tsx
import { StepWizard } from '@/components/booking';
import { Zap, Code, TrendingUp } from 'lucide-react';

<StepWizard
  currentStep={1}
  totalSteps={3}
  title="Select Topic"
  description="Choose the area you'd like to discuss"
  options={[
    { icon: Zap, label: "AI Automation & Efficiency", value: "ai" },
    { icon: Code, label: "Custom Development", value: "dev" },
    { icon: TrendingUp, label: "Sales & Marketing", value: "sales" }
  ]}
  selectedValue="ai"
  onSelect={(value) => {}}
  onClose={() => {}}
/>
```

**Props**:
- `currentStep: number` - Current step (1-based)
- `totalSteps: number` - Total steps
- `title: string` - Step title
- `description?: string` - Step description
- `options: WizardOption[]` - Available options
- `selectedValue?: string` - Selected option
- `onSelect: (value: string) => void` - Selection handler
- `onClose?: () => void` - Close handler
- `showClose?: boolean` - Show close button

---

### 9. CaseStudyCard Component
**Location**: `/src/components/sections/case-study-card.tsx`
**Storybook**: `case-study-card.stories.tsx`
**Reference Images**: Images 2, 4, 7, 8

**Visual Specifications**:
- Dark blue/navy card with tech background pattern
- Grid pattern overlay (30x30 cyan lines)
- White text
- Large title (text-3xl to text-5xl, bold)
- Subtitle in cyan (text-xl to text-3xl)
- Cyan "Read More" button with ArrowRight icon
- Glow accent (top-right, cyan/20 blur-3xl)
- Circuit line SVG decoration
- Hover: -translate-y-1 + shadow-2xl

**Usage**:
```tsx
import { CaseStudyCard } from '@/components/sections';

<CaseStudyCard
  title="Boosting Manufacturing Output by 40%"
  subtitle="with Predictive Maintenance AI"
  description="Learn how we helped transform operations"
  variant="dark-tech"
  ctaText="Read More"
  onClick={() => {}}
/>
```

**Props**:
- `title: string` - Case study title
- `subtitle?: string` - Subtitle/tagline
- `description?: string` - Description text
- `href?: string` - Link to case study
- `onClick?: () => void` - Click handler
- `variant?: "dark-tech" | "light" | "gradient"` - Visual variant
- `ctaText?: string` - CTA button text

---

### 10. FilterSidebar Component
**Location**: `/src/components/marketplace/filter-sidebar.tsx`
**Storybook**: `filter-sidebar.stories.tsx`
**Reference Images**: Image 5

**Visual Specifications**:
- Left sidebar, width: w-64 to w-72
- White background, border-r border-slate-200
- Section headers: uppercase, text-sm, slate-700
- Checkbox styling: square (5x5), cyan when checked
- Checkmark SVG in cyan boxes
- Collapsible sections with chevron icons
- Count badges (text-xs, slate-400)
- "Clear All Filters" button at bottom
- Clean spacing with space-y-6

**Usage**:
```tsx
import { FilterSidebar } from '@/components/marketplace';

<FilterSidebar
  title="The Offers"
  filters={{
    category: {
      label: "Category",
      options: [
        { value: "sales", label: "Sales & AI/Strategy", count: 12 },
        { value: "operations", label: "Operations", count: 8 }
      ]
    },
    integration: {
      label: "Integration",
      collapsible: true,
      options: [
        { value: "api", label: "API", count: 15 },
        { value: "zapier", label: "Zapier", count: 10 }
      ]
    }
  }}
  selectedFilters={{ category: ["sales"] }}
  onFilterChange={(filters) => {}}
/>
```

**Props**:
- `title?: string` - Sidebar title
- `filters: Record<string, FilterSection>` - Filter sections
- `selectedFilters?: Record<string, string[]>` - Current selections
- `onFilterChange: (filters: Record<string, string[]>) => void` - Change handler

---

## Design System Integration

### Colors Used
- **Primary Cyan**: `#00D4FF` (astralis-cyan)
- **Navy Background**: `#0A1B2B` (astralis-navy)
- **Blue Accent**: `#2B6CB0` (astralis-blue)
- **Slate Neutrals**: slate-200 to slate-900

### Typography
- **Font Family**: Inter (via `font-sans`)
- **Headings**: font-bold, text-2xl to text-7xl
- **Body**: text-sm to text-xl
- **Labels**: text-sm, font-semibold

### Spacing
- **Section Padding**: py-16 md:py-24 lg:py-32
- **Card Padding**: p-6 md:p-8 lg:p-12
- **Gap**: gap-4 to gap-16

### Animations
- **Transitions**: duration-300 (150-300ms)
- **Hover Effects**: -translate-y-1 to -translate-y-2, scale-105
- **Glow Effects**: shadow-glow-cyan, shadow-glow-cyan-lg
- **Float Animation**: animate-float, animate-float-slow
- **Pulse**: animate-pulse-glow, animate-glow-pulse

### Shadows
- **Card**: shadow-card, shadow-card-hover
- **Glow Cyan**: shadow-glow-cyan (0 0 20px rgba(0, 212, 255, 0.4))
- **Glow Cyan Large**: shadow-glow-cyan-lg (0 0 30px rgba(0, 212, 255, 0.5))

---

## Storybook Stories

All components have comprehensive Storybook stories showcasing:
- Default variants
- All color variants (dark, light, gradient)
- Interactive states (hover, active, disabled)
- Edge cases (long text, empty states)
- Responsive breakpoints
- Animation examples

To view:
```bash
npm run storybook
```

---

## Component Exports

### Sections
```typescript
import {
  HeroWithTechGraphic,
  ProcessFlow,
  StatsBar,
  CaseStudyCard,
  FeatureCardIcon
} from '@/components/sections';
```

### Marketplace
```typescript
import {
  MarketplaceSearch,
  SolutionCard,
  FilterSidebar
} from '@/components/marketplace';
```

### Interactive
```typescript
import { ROICalculator } from '@/components/interactive';
```

### Booking
```typescript
import { StepWizard } from '@/components/booking';
```

---

## Implementation Checklist

- [x] ProcessFlow component
- [x] HeroWithTechGraphic component
- [x] StatsBar component
- [x] FeatureCardIcon component
- [x] MarketplaceSearch component
- [x] SolutionCard component
- [x] ROICalculator component
- [x] StepWizard component
- [x] CaseStudyCard component
- [x] FilterSidebar component
- [x] All Storybook stories
- [x] Component exports
- [x] TypeScript types
- [x] JSDoc documentation
- [x] Responsive design
- [x] Accessibility (ARIA labels, keyboard navigation)
- [x] Animation polish

---

## Next Steps

1. **Integration**: Use these components to rebuild existing pages
2. **Testing**: Add unit tests for interactive components
3. **Performance**: Optimize animations and bundle size
4. **Accessibility**: Audit with axe-devtools
5. **Documentation**: Add usage examples to each page

---

## File Locations Summary

```
src/components/
├── sections/
│   ├── hero-with-graphic.tsx
│   ├── hero-with-graphic.stories.tsx
│   ├── process-flow.tsx
│   ├── process-flow.stories.tsx
│   ├── stats-bar.tsx
│   ├── stats-bar.stories.tsx
│   ├── feature-card-icon.tsx
│   ├── feature-card-icon.stories.tsx
│   ├── case-study-card.tsx
│   ├── case-study-card.stories.tsx
│   └── index.ts
├── marketplace/
│   ├── marketplace-search.tsx
│   ├── marketplace-search.stories.tsx
│   ├── solution-card.tsx
│   ├── solution-card.stories.tsx
│   ├── filter-sidebar.tsx
│   ├── filter-sidebar.stories.tsx
│   └── index.ts
├── interactive/
│   ├── roi-calculator.tsx
│   ├── roi-calculator.stories.tsx
│   └── index.ts
└── booking/
    ├── step-wizard.tsx
    ├── step-wizard.stories.tsx
    └── index.ts
```

---

**Created**: 2025-11-19
**Status**: Complete
**Components**: 10
**Stories**: 10
**Total Files**: 33

# Component Usage Examples

Quick reference guide for implementing the new branded components.

## Complete Landing Page Example

```tsx
import {
  HeroWithTechGraphic,
  ProcessFlow,
  StatsBar,
  FeatureCardIcon,
  CaseStudyCard
} from '@/components/sections';
import { MarketplaceSearch, SolutionCard } from '@/components/marketplace';
import { ROICalculator } from '@/components/interactive';
import { Search, Wrench, Rocket, TrendingUp, Target, Settings, Zap, Bot } from 'lucide-react';

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <HeroWithTechGraphic
        title="AI-Driven Sales Automation: Elevate Conversion, Accelerate Growth"
        subtitle="Transform your sales intelligence with powerful AI-driven solutions and streamline your CRM workflows."
        primaryCTA={{
          text: "Launch Sales Analyzer Wizard",
          href: "/wizard"
        }}
        secondaryCTA={{
          text: "Book a Demo",
          href: "/contact"
        }}
        graphicType="funnel"
      />

      {/* Stats Bar */}
      <StatsBar
        variant="dark"
        showSeparators={true}
        stats={[
          { value: "278%", label: "Higher Lead Conversion" },
          { value: "40%", label: "Reduced Cycle by" },
          { value: "95%", label: "Client Success Rate" }
        ]}
      />

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Solutions by Business Function
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCardIcon
              icon={Target}
              title="Sales & Marketing Optimization"
              description="Scale faster with AI-driven solutions"
              variant="light"
            />
            <FeatureCardIcon
              icon={Settings}
              title="Operations & Efficiency"
              description="Optimize business processes"
              variant="light"
            />
            <FeatureCardIcon
              icon={Zap}
              title="Financial Intelligence"
              description="Data-driven financial decisions"
              variant="light"
            />
            <FeatureCardIcon
              icon={Bot}
              title="HR & Talent Management"
              description="Streamline hiring and onboarding"
              variant="light"
            />
          </div>
        </div>
      </section>

      {/* Process Flow */}
      <ProcessFlow
        title="Our Proven Process"
        subtitle="Ready to Transform Your Business?"
        variant="dark"
        steps={[
          {
            icon: Search,
            title: "Browse & Strategy",
            description: "Discover opportunities and develop strategic roadmaps"
          },
          {
            icon: Wrench,
            title: "Design & Optimize",
            description: "Create tailored solutions that fit your needs"
          },
          {
            icon: Rocket,
            title: "Build Innovative Solutions",
            description: "Launch powerful AI-driven systems"
          },
          {
            icon: TrendingUp,
            title: "Growth & Support",
            description: "Scale your success with ongoing optimization"
          }
        ]}
      />

      {/* ROI Calculator */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <ROICalculator
              title="ROI Calculator"
              description="See how much you could save with our automation tools"
              inputs={[
                {
                  label: "Average Ticket Size (per Opportunity/Sale/Task/Hour)",
                  type: "slider",
                  min: 0,
                  max: 10000,
                  step: 100,
                  defaultValue: 5000,
                  unit: "$"
                },
                {
                  label: "Number of Opportunities per Month",
                  type: "slider",
                  min: 0,
                  max: 500,
                  step: 10,
                  defaultValue: 100
                }
              ]}
              onCalculate={(values) => {
                const ticketSize = values.input_0 || 0;
                const opportunities = values.input_1 || 0;
                return Math.round(ticketSize * opportunities * 0.278);
              }}
              resultLabel="Estimated Monthly ROI"
              showChart={true}
            />
          </div>
        </div>
      </section>

      {/* Case Study */}
      <CaseStudyCard
        title="Boosting Manufacturing Output by 40%"
        subtitle="with Predictive Maintenance AI"
        description="Learn how we helped transform operations and reduce downtime"
        variant="dark-tech"
        href="/case-studies/manufacturing"
      />
    </>
  );
}
```

## Marketplace Page Example

```tsx
import { MarketplaceSearch, SolutionCard, FilterSidebar } from '@/components/marketplace';
import { Search, Settings, Zap, TrendingUp, Users, Code } from 'lucide-react';
import { useState } from 'react';

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string[]>>({});

  return (
    <>
      {/* Search Hero */}
      <MarketplaceSearch
        onSearch={setSearchQuery}
        placeholder="Search AI solutions..."
        categories={[
          { icon: Search, label: "Search", onClick: () => {} },
          { icon: Settings, label: "Configure", onClick: () => {} },
          { icon: Zap, label: "Automate", onClick: () => {} },
          { icon: TrendingUp, label: "Optimize", onClick: () => {} },
          { icon: Users, label: "Collaborate", onClick: () => {} },
          { icon: Code, label: "Develop", onClick: () => {} }
        ]}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <FilterSidebar
            title="The Offers"
            filters={{
              category: {
                label: "Category",
                options: [
                  { value: "sales", label: "Sales & AI/Strategy", count: 12 },
                  { value: "operations", label: "Operations", count: 8 },
                  { value: "finance", label: "Finance & Accounting", count: 6 }
                ]
              },
              integration: {
                label: "Integration",
                options: [
                  { value: "api", label: "API", count: 15 },
                  { value: "zapier", label: "Zapier", count: 10 }
                ]
              }
            }}
            selectedFilters={filters}
            onFilterChange={setFilters}
          />

          {/* Solutions Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <SolutionCard
                icon={Zap}
                title="Predictive Analytics AI"
                rating={4.5}
                price="$99/mo"
                featured={true}
                description="Forecast customer behavior with advanced ML"
                onLearnMore={() => {}}
              />
              <SolutionCard
                icon={TrendingUp}
                title="Automation Dashboard"
                rating={4.0}
                price="$49/mo"
                description="Streamline workflows with intelligent tools"
                onLearnMore={() => {}}
              />
              {/* More cards... */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
```

## Booking/Wizard Flow Example

```tsx
import { StepWizard } from '@/components/booking';
import { Zap, Code, TrendingUp, Target, Users, Settings } from 'lucide-react';
import { useState } from 'react';

export default function BookingFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selections, setSelections] = useState({
    topic: '',
    goal: '',
    timeline: ''
  });

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      {currentStep === 1 && (
        <StepWizard
          currentStep={1}
          totalSteps={3}
          title="Select Topic"
          description="Choose the area you'd like to discuss"
          options={[
            {
              icon: Zap,
              label: "AI Automation & Efficiency",
              value: "ai",
              description: "Streamline workflows with intelligent automation"
            },
            {
              icon: Code,
              label: "Custom Development & Digital Products",
              value: "dev",
              description: "Build tailored solutions for your needs"
            },
            {
              icon: TrendingUp,
              label: "Sales & Marketing Solutions",
              value: "sales",
              description: "Optimize your revenue generation"
            }
          ]}
          selectedValue={selections.topic}
          onSelect={(value) => {
            setSelections({ ...selections, topic: value });
            handleNext();
          }}
          onClose={() => window.history.back()}
        />
      )}

      {currentStep === 2 && (
        <StepWizard
          currentStep={2}
          totalSteps={3}
          title="Select Your Goal"
          description="What's your primary objective?"
          options={[
            { icon: Target, label: "Increase Revenue", value: "revenue" },
            { icon: Users, label: "Improve Team Efficiency", value: "efficiency" },
            { icon: Settings, label: "Reduce Operational Costs", value: "costs" }
          ]}
          selectedValue={selections.goal}
          onSelect={(value) => {
            setSelections({ ...selections, goal: value });
            handleNext();
          }}
          onClose={() => window.history.back()}
        />
      )}

      {currentStep === 3 && (
        <StepWizard
          currentStep={3}
          totalSteps={3}
          title="Choose Your Timeline"
          options={[
            { icon: Zap, label: "Immediate (1-2 weeks)", value: "immediate" },
            { icon: TrendingUp, label: "Short-term (1-3 months)", value: "short" },
            { icon: Target, label: "Long-term (3+ months)", value: "long" }
          ]}
          selectedValue={selections.timeline}
          onSelect={(value) => {
            setSelections({ ...selections, timeline: value });
            // Submit form
            console.log('Completed:', selections);
          }}
          onClose={() => window.history.back()}
        />
      )}
    </div>
  );
}
```

## Component Composition Tips

### 1. Hero + Stats Combo
Always pair `HeroWithTechGraphic` with `StatsBar` for maximum impact:

```tsx
<HeroWithTechGraphic {...heroProps} />
<StatsBar variant="dark" {...statsProps} />
```

### 2. Process Flow Placement
Use `ProcessFlow` as a divider between major sections:

```tsx
<FeatureSection />
<ProcessFlow variant="dark" {...processProps} />
<PricingSection />
```

### 3. Feature Grid Layout
Use 3-4 columns for `FeatureCardIcon`:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
  {features.map(feature => <FeatureCardIcon {...feature} />)}
</div>
```

### 4. Solution Card Grid
Use 3 columns for marketplace grids:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {solutions.map(solution => <SolutionCard {...solution} />)}
</div>
```

### 5. Case Study as Section Break
Use `CaseStudyCard` between major content blocks:

```tsx
<ServicesSection />
<CaseStudyCard variant="dark-tech" {...caseStudyProps} />
<TestimonialsSection />
```

## Accessibility Best Practices

All components include:
- Proper ARIA labels
- Keyboard navigation support
- Focus states
- Color contrast compliance
- Screen reader support

Example with custom ARIA:
```tsx
<SolutionCard
  {...props}
  aria-label={`${title} - ${rating} stars - ${price}`}
/>
```

## Performance Tips

1. **Lazy load heavy sections**:
```tsx
const MarketplaceSearch = dynamic(() => import('@/components/marketplace').then(mod => mod.MarketplaceSearch));
```

2. **Memoize expensive calculations**:
```tsx
const calculatedROI = useMemo(() => onCalculate(values), [values, onCalculate]);
```

3. **Optimize animations**:
```tsx
<ProcessFlow enableGlow={false} /> // Disable on mobile
```

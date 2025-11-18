/**
 * Section Components Usage Examples
 *
 * This file demonstrates how to use the reusable section components
 * for building Astralis pages.
 */

import {
  FeatureGrid,
  CTASection,
  StatsSection,
  Hero,
} from '@/components/sections';
import {
  Zap,
  Shield,
  Rocket,
  BarChart,
  Users,
  TrendingUp,
} from 'lucide-react';

// ============================================================================
// FEATURE GRID EXAMPLES
// ============================================================================

/**
 * Example 1: Basic 3-column feature grid with icons
 */
export function FeatureGridExample1() {
  return (
    <FeatureGrid
      headline="Why Choose Astralis"
      subheadline="Built for modern teams who need reliability, speed, and scalability"
      features={[
        {
          title: 'Lightning Fast',
          description:
            'Optimized performance ensures your applications load in milliseconds, not seconds.',
          icon: Zap,
        },
        {
          title: 'Enterprise Security',
          description:
            'Bank-level encryption and compliance certifications protect your data.',
          icon: Shield,
        },
        {
          title: 'Rapid Deployment',
          description:
            'Deploy to production in minutes with our streamlined CI/CD pipeline.',
          icon: Rocket,
        },
      ]}
      columns={3}
    />
  );
}

/**
 * Example 2: 4-column grid with clickable cards
 */
export function FeatureGridExample2() {
  return (
    <FeatureGrid
      headline="Our Services"
      centerHeader
      features={[
        {
          title: 'Web Development',
          description: 'Custom web applications built with modern technologies.',
          icon: Zap,
          href: '/services/web-development',
        },
        {
          title: 'Mobile Apps',
          description: 'Native iOS and Android applications.',
          icon: Rocket,
          href: '/services/mobile-apps',
        },
        {
          title: 'Cloud Solutions',
          description: 'Scalable cloud infrastructure and migration services.',
          icon: Shield,
          href: '/services/cloud-solutions',
        },
        {
          title: 'Analytics',
          description: 'Data-driven insights and business intelligence.',
          icon: BarChart,
          href: '/services/analytics',
        },
      ]}
      columns={4}
    />
  );
}

/**
 * Example 3: Simple 2-column grid without icons
 */
export function FeatureGridExample3() {
  return (
    <FeatureGrid
      features={[
        {
          title: 'Flexible Pricing',
          description:
            'Pay only for what you use with our transparent, scalable pricing model.',
        },
        {
          title: '24/7 Support',
          description:
            'Our expert team is available around the clock to help you succeed.',
        },
      ]}
      columns={2}
      enableHover={false}
    />
  );
}

// ============================================================================
// CTA SECTION EXAMPLES
// ============================================================================

/**
 * Example 1: Default CTA with two buttons
 */
export function CTASectionExample1() {
  return (
    <CTASection
      headline="Ready to Get Started?"
      description="Join thousands of teams already using Astralis to build better products faster."
      primaryButton={{
        text: 'Start Free Trial',
        href: '/signup',
      }}
      secondaryButton={{
        text: 'Schedule Demo',
        href: '/demo',
      }}
    />
  );
}

/**
 * Example 2: Navy background variant
 */
export function CTASectionExample2() {
  return (
    <CTASection
      headline="Transform Your Business Today"
      description="Our platform helps you deliver exceptional experiences at scale."
      backgroundVariant="navy"
      primaryButton={{
        text: 'Get Started',
        href: '/signup',
      }}
      secondaryButton={{
        text: 'View Pricing',
        href: '/pricing',
      }}
    />
  );
}

/**
 * Example 3: Gradient background with single button
 */
export function CTASectionExample3() {
  return (
    <CTASection
      headline="See It In Action"
      description="Watch a 2-minute demo of how Astralis can streamline your workflow."
      backgroundVariant="gradient"
      primaryButton={{
        text: 'Watch Demo Video',
        href: '/demo',
      }}
    />
  );
}

/**
 * Example 4: Light background with custom content
 */
export function CTASectionExample4() {
  return (
    <CTASection
      headline="Join Our Newsletter"
      description="Get weekly insights on product development, design, and growth."
      backgroundVariant="light"
      primaryButton={{
        text: 'Subscribe Now',
        href: '/newsletter',
      }}
    >
      {/* Custom content below buttons */}
      <p className="text-sm text-slate-500">
        No spam. Unsubscribe anytime. Read by 10,000+ professionals.
      </p>
    </CTASection>
  );
}

// ============================================================================
// STATS SECTION EXAMPLES
// ============================================================================

/**
 * Example 1: Basic 4-stat section with trends
 */
export function StatsSectionExample1() {
  return (
    <StatsSection
      headline="Trusted by Industry Leaders"
      description="Companies worldwide rely on Astralis for their critical infrastructure"
      stats={[
        {
          value: '10,000+',
          label: 'Active Users',
          trend: 'up',
          trendValue: '+12%',
          secondaryText: 'vs last month',
        },
        {
          value: '99.9%',
          label: 'Uptime',
          trend: 'neutral',
          secondaryText: 'guaranteed SLA',
        },
        {
          value: '$2.4M',
          label: 'Revenue Saved',
          trend: 'up',
          trendValue: '+45%',
          secondaryText: 'for our clients',
        },
        {
          value: '24/7',
          label: 'Support',
          trend: 'none',
          secondaryText: 'always available',
        },
      ]}
      enableCards
    />
  );
}

/**
 * Example 2: 3-stat section with custom icons
 */
export function StatsSectionExample2() {
  return (
    <StatsSection
      headline="Our Impact"
      centerHeader
      stats={[
        {
          value: '500+',
          label: 'Enterprise Clients',
          icon: (
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-astralis-blue/10">
              <Users className="w-6 h-6 text-astralis-blue" />
            </div>
          ),
        },
        {
          value: '150+',
          label: 'Countries Served',
          icon: (
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-success/10">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
          ),
        },
        {
          value: '4.9/5',
          label: 'Customer Rating',
          icon: (
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-warning/10">
              <BarChart className="w-6 h-6 text-warning" />
            </div>
          ),
        },
      ]}
      backgroundVariant="light"
    />
  );
}

/**
 * Example 3: Navy background with large numbers
 */
export function StatsSectionExample3() {
  return (
    <StatsSection
      headline="By The Numbers"
      description="Real metrics that demonstrate our commitment to excellence"
      stats={[
        {
          value: '15M+',
          label: 'API Requests Daily',
        },
        {
          value: '< 100ms',
          label: 'Average Response Time',
        },
        {
          value: '99.99%',
          label: 'Data Accuracy',
        },
      ]}
      backgroundVariant="navy"
      enableCards={false}
    />
  );
}

// ============================================================================
// COMBINED EXAMPLE - Full Page Layout
// ============================================================================

/**
 * Example: Complete page using all section components together
 */
export function CompletePageExample() {
  return (
    <>
      {/* Hero Section */}
      <Hero
        headline="Build Better Products Faster"
        subheadline="Introducing Astralis Platform"
        description="The all-in-one solution for modern teams to design, develop, and deploy exceptional digital experiences."
        primaryButton={{
          text: 'Get Started',
          href: '/signup',
        }}
        secondaryButton={{
          text: 'View Demo',
          href: '/demo',
        }}
        rightContent={
          <div className="aspect-video bg-slate-200 rounded-lg flex items-center justify-center">
            <p className="text-slate-500">Hero Image / Video</p>
          </div>
        }
      />

      {/* Stats Section */}
      <StatsSection
        stats={[
          {
            value: '10,000+',
            label: 'Active Users',
            trend: 'up',
            trendValue: '+12%',
          },
          {
            value: '99.9%',
            label: 'Uptime',
          },
          {
            value: '24/7',
            label: 'Support',
          },
        ]}
        backgroundVariant="light"
      />

      {/* Feature Grid */}
      <FeatureGrid
        headline="Everything You Need"
        subheadline="Powerful features designed for modern development teams"
        features={[
          {
            title: 'Fast Performance',
            description: 'Lightning-fast load times and optimized delivery.',
            icon: Zap,
          },
          {
            title: 'Secure by Default',
            description: 'Enterprise-grade security built into every layer.',
            icon: Shield,
          },
          {
            title: 'Easy Deployment',
            description: 'Deploy to production with a single command.',
            icon: Rocket,
          },
        ]}
        columns={3}
        centerHeader
      />

      {/* CTA Section */}
      <CTASection
        headline="Ready to Transform Your Workflow?"
        description="Join thousands of teams building better products with Astralis."
        backgroundVariant="navy"
        primaryButton={{
          text: 'Start Free Trial',
          href: '/signup',
        }}
        secondaryButton={{
          text: 'Contact Sales',
          href: '/contact',
        }}
      />
    </>
  );
}

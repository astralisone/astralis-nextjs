import type { Meta, StoryObj } from '@storybook/react';
import { Hero } from './hero';

const meta = {
  title: 'Sections/Hero',
  component: Hero,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    headline: 'Build Smarter Systems with AI',
    description: 'Transform your business operations with intelligent automation and cutting-edge technology.',
    primaryButton: {
      text: 'Get Started',
      href: '/contact',
    },
    secondaryButton: {
      text: 'Learn More',
      href: '/solutions',
    },
  },
};

export const WithSubheadline: Story = {
  args: {
    subheadline: 'Innovation Powered',
    headline: 'AI-Driven Solutions for Modern Businesses',
    description: 'Leverage artificial intelligence and automation to streamline operations and drive growth.',
    primaryButton: {
      text: 'Schedule Demo',
      href: '/contact',
    },
  },
};

export const LightTheme: Story = {
  args: {
    headline: 'Empower Your Business',
    description: 'Discover how intelligent automation can transform your workflows.',
    variant: 'light',
    primaryButton: {
      text: 'Get Started',
      href: '/contact',
    },
    secondaryButton: {
      text: 'View Solutions',
      href: '/solutions',
    },
  },
};

export const CenterAligned: Story = {
  args: {
    headline: 'Welcome to Astralis',
    description: 'Your partner in business automation and AI integration.',
    textAlign: 'center',
    textColumnWidth: 'two-thirds',
    primaryButton: {
      text: 'Explore',
      href: '/solutions',
    },
  },
};

export const FullWidth: Story = {
  args: {
    headline: 'Transform Your Operations Today',
    description: 'Join hundreds of businesses already automating their processes with Astralis.',
    textColumnWidth: 'full',
    textAlign: 'center',
    primaryButton: {
      text: 'Start Free Trial',
      href: '/contact',
    },
    secondaryButton: {
      text: 'Watch Demo',
      href: '#',
    },
  },
};

// NEW: Hero with particle background and glow effects
export const WithParticles: Story = {
  args: {
    subheadline: 'Next-Generation Technology',
    headline: 'Transform Your Business with AI',
    description: 'Harness the power of artificial intelligence and automation to drive unprecedented growth.',
    primaryButton: {
      text: 'Get Started',
      href: '/contact',
    },
    secondaryButton: {
      text: 'Learn More',
      href: '/solutions',
    },
    className: 'particle-bg tech-grid',
  },
};

// NEW: Hero with glowing buttons
export const WithGlowButtons: Story = {
  render: () => (
    <Hero
      subheadline="Innovation at Scale"
      headline="Build the Future Today"
      description="Leverage cutting-edge technology to automate complex workflows and accelerate your digital transformation."
      className="particle-bg constellation-bg"
      rightContent={
        <div className="relative">
          <div className="ai-ring mx-auto animate-glow-pulse">
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-20 h-20 text-astralis-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      }
      primaryButton={{ text: 'Start Now', href: '/contact' }}
      secondaryButton={{ text: 'View Demo', href: '/demo' }}
    />
  ),
};

// NEW: Hero with tech graphic
export const WithTechGraphic: Story = {
  render: () => (
    <Hero
      headline="Intelligent Automation for Modern Teams"
      description="Streamline your operations with AI-powered workflows that learn and adapt to your business needs."
      className="particle-bg tech-grid"
      rightContent={
        <div className="relative h-[400px] w-full">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="icon-circle animate-float" style={{ animationDelay: `${i * 0.2}s` }}>
                  <svg className="w-8 h-8 text-astralis-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
      primaryButton={{ text: 'Get Started', href: '/contact' }}
    />
  ),
};

// NEW: Hero with floating icons
export const WithFloatingIcons: Story = {
  render: () => (
    <Hero
      subheadline="Powered by AI"
      headline="The Future of Business Operations"
      description="Join thousands of companies transforming their workflows with intelligent automation."
      className="particle-bg-animated"
      textAlign="center"
      textColumnWidth="two-thirds"
      rightContent={
        <div className="relative h-[400px]">
          <div className="absolute top-10 left-10 feature-icon animate-float">
            <svg className="w-10 h-10 text-astralis-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <div className="absolute top-24 right-16 icon-circle-blue animate-float" style={{ animationDelay: '1s' }}>
            <svg className="w-8 h-8 text-astralis-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="absolute bottom-16 left-20 icon-circle animate-float" style={{ animationDelay: '0.5s' }}>
            <svg className="w-8 h-8 text-astralis-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
        </div>
      }
      primaryButton={{ text: 'Start Free Trial', href: '/contact' }}
      secondaryButton={{ text: 'Watch Demo', href: '/demo' }}
    />
  ),
};

// NEW: Minimal hero with gradient text
export const MinimalGradient: Story = {
  render: () => (
    <section className="w-full px-8 py-32 md:px-20 lg:px-24 bg-gradient-radial-dark particle-bg">
      <div className="mx-auto max-w-[1280px] text-center">
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 text-white text-glow-cyan">
          The Future is Here
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto">
          Experience next-generation automation powered by artificial intelligence
        </p>
        <div className="flex gap-4 justify-center">
          <button className="btn-glow-cyan text-lg px-8 py-4">
            Get Started
          </button>
          <button className="btn-outline-glow text-lg px-8 py-4">
            Learn More
          </button>
        </div>
      </div>
    </section>
  ),
};

// NEW: Hero showcase comparing variants
export const AllVariantsShowcase: Story = {
  render: () => (
    <div className="space-y-0">
      <Hero
        headline="Standard Dark Hero"
        description="Default dark theme with navy background"
        primaryButton={{ text: 'Get Started', href: '/contact' }}
        secondaryButton={{ text: 'Learn More', href: '/solutions' }}
      />

      <Hero
        headline="With Particle Background"
        description="Enhanced with particle effects and tech grid"
        className="particle-bg tech-grid"
        primaryButton={{ text: 'Get Started', href: '/contact' }}
      />

      <Hero
        variant="light"
        headline="Light Theme Variant"
        description="Clean white background for lighter pages"
        primaryButton={{ text: 'Get Started', href: '/contact' }}
        secondaryButton={{ text: 'Learn More', href: '/solutions' }}
      />
    </div>
  ),
};

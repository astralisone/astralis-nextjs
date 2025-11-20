import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'destructive', 'outline', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Standard button variants
export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
};

export const Link: Story = {
  args: {
    children: 'Link Button',
    variant: 'link',
  },
};

export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
};

export const Medium: Story = {
  args: {
    children: 'Medium Button',
    size: 'default',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
};

// NEW: Cyan glow button with enhanced effects
export const CyanGlowButton: Story = {
  render: () => (
    <div className="p-12 bg-astralis-navy">
      <Button className="btn-glow-cyan">
        Get Started
      </Button>
    </div>
  ),
};

// NEW: Blue glow button variant
export const BlueGlowButton: Story = {
  render: () => (
    <div className="p-12 bg-gradient-radial-dark">
      <Button className="btn-glow-blue">
        Schedule Demo
      </Button>
    </div>
  ),
};

// NEW: Outline button with glow on hover
export const OutlineGlowButton: Story = {
  render: () => (
    <div className="p-12 bg-astralis-navy">
      <Button className="btn-outline-glow">
        Learn More
      </Button>
    </div>
  ),
};

// NEW: Buttons on dark background with particles
export const OnParticleBackground: Story = {
  render: () => (
    <div className="bg-astralis-navy particle-bg tech-grid p-16 flex gap-4 items-center justify-center">
      <Button variant="primary" className="shadow-glow-cyan hover:shadow-glow-cyan-lg">
        Primary
      </Button>
      <Button variant="secondary" className="shadow-glow-blue hover:shadow-glow-blue-lg">
        Secondary
      </Button>
      <Button className="btn-glow-cyan">
        Glow Cyan
      </Button>
    </div>
  ),
};

// NEW: Interactive glow effects
export const WithGlowEffects: Story = {
  render: () => (
    <div className="bg-gradient-radial-dark p-16 flex flex-col gap-6 items-center">
      <Button className="shadow-glow-cyan hover:shadow-glow-cyan-lg transition-all duration-200">
        Hover for Glow
      </Button>
      <Button className="animate-glow-pulse shadow-glow-cyan">
        Pulsing Glow
      </Button>
      <Button className="glow-border-cyan bg-astralis-navy text-white px-6 py-3 rounded-md font-semibold">
        Glowing Border
      </Button>
    </div>
  ),
};

// NEW: Animated button variants
export const WithAnimations: Story = {
  render: () => (
    <div className="bg-slate-100 p-16 flex gap-4">
      <Button className="transition-all duration-200 hover:scale-105 hover:shadow-glow-cyan">
        Scale on Hover
      </Button>
      <Button className="animate-float shadow-glow-blue">
        Floating
      </Button>
      <Button className="animate-pulse-glow shadow-glow-cyan">
        Pulse
      </Button>
    </div>
  ),
};

// NEW: All button variants side-by-side comparison
export const AllVariantsGrid: Story = {
  render: () => (
    <div className="p-8 bg-slate-100">
      <h3 className="text-2xl font-semibold mb-6 text-astralis-navy">Standard Variants</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
      </div>

      <div className="bg-astralis-navy p-8 rounded-lg">
        <h3 className="text-2xl font-semibold mb-6 text-white">Glow Variants (Dark Background)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Button className="btn-glow-cyan">Cyan Glow</Button>
          <Button className="btn-glow-blue">Blue Glow</Button>
          <Button className="btn-outline-glow">Outline Glow</Button>
        </div>
      </div>
    </div>
  ),
};

// NEW: Button sizes comparison on dark background
export const SizesOnDarkBackground: Story = {
  render: () => (
    <div className="bg-gradient-radial-dark particle-bg p-16 flex flex-col gap-6 items-center">
      <Button size="sm" className="shadow-glow-cyan">Small Button</Button>
      <Button size="default" className="shadow-glow-cyan">Default Button</Button>
      <Button size="lg" className="shadow-glow-cyan">Large Button</Button>
    </div>
  ),
};

// NEW: CTA button showcase
export const CTAShowcase: Story = {
  render: () => (
    <div className="bg-astralis-navy particle-bg tech-grid p-20 flex flex-col gap-8 items-center">
      <div className="text-center mb-4">
        <h2 className="text-4xl font-bold text-white text-glow-white mb-4">
          Ready to Transform Your Business?
        </h2>
        <p className="text-slate-300 text-lg">
          Join hundreds of companies already using Astralis
        </p>
      </div>
      <div className="flex gap-4">
        <Button className="btn-glow-cyan text-lg px-8 py-4">
          Get Started Free
        </Button>
        <Button className="btn-outline-glow text-lg px-8 py-4">
          Schedule Demo
        </Button>
      </div>
    </div>
  ),
};

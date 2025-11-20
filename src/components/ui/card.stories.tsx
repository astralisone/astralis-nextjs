import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
import { Button } from './button';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// Standard card variants
export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the card content area where you can place any content.</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithoutFooter: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Simple Card</CardTitle>
        <CardDescription>A card without a footer</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This card only has a header and content section.</p>
      </CardContent>
    </Card>
  ),
};

export const ContentOnly: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardContent className="pt-6">
        <p>A minimal card with only content.</p>
      </CardContent>
    </Card>
  ),
};

// NEW: Glass card with frosted effect
export const GlassCard: Story = {
  render: () => (
    <div className="bg-gradient-radial-dark p-16">
      <Card className="glass-card w-[380px]">
        <CardHeader>
          <CardTitle className="text-white">Glassmorphism Card</CardTitle>
          <CardDescription className="text-slate-300">Frosted glass effect with backdrop blur</CardDescription>
        </CardHeader>
        <CardContent className="text-slate-200">
          <p>This card features a frosted glass aesthetic with translucent background and soft shadows.</p>
        </CardContent>
        <CardFooter>
          <Button className="btn-glow-cyan">Learn More</Button>
        </CardFooter>
      </Card>
    </div>
  ),
};

// NEW: Light glass card variant
export const GlassCardLight: Story = {
  render: () => (
    <div className="bg-gradient-navy-to-light p-16">
      <Card className="glass-card-light w-[380px]">
        <CardHeader>
          <CardTitle>Light Glass Card</CardTitle>
          <CardDescription className="text-slate-600">Semi-transparent light variant</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700">Perfect for lighter backgrounds with subtle glass effect.</p>
        </CardContent>
        <CardFooter>
          <Button variant="primary">Action</Button>
        </CardFooter>
      </Card>
    </div>
  ),
};

// NEW: Content card with hover effect
export const ContentCard: Story = {
  render: () => (
    <div className="bg-slate-100 p-16">
      <Card className="content-card w-[380px]">
        <CardHeader>
          <CardTitle>Content Card</CardTitle>
          <CardDescription>Solid white card with hover shadow</CardDescription>
        </CardHeader>
        <CardContent>
          <p>This card uses the content-card utility class with enhanced shadow on hover.</p>
        </CardContent>
        <CardFooter>
          <Button variant="primary">View Details</Button>
        </CardFooter>
      </Card>
    </div>
  ),
};

// NEW: Floating card with lift animation
export const FloatingCard: Story = {
  render: () => (
    <div className="bg-slate-100 p-16">
      <Card className="w-[380px] transition-all duration-200 hover:shadow-card-hover hover:-translate-y-2 hover:scale-105">
        <CardHeader>
          <CardTitle>Floating Card</CardTitle>
          <CardDescription>Lifts on hover with scale effect</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Hover over this card to see the floating animation effect.</p>
        </CardContent>
      </Card>
    </div>
  ),
};

// NEW: Card on dark background with glow
export const OnDarkBackground: Story = {
  render: () => (
    <div className="bg-astralis-navy particle-bg tech-grid p-16">
      <Card className="w-[380px] shadow-glow-cyan border-astralis-cyan/30">
        <CardHeader>
          <CardTitle className="text-white">Dark Background Card</CardTitle>
          <CardDescription className="text-slate-300">Card with cyan glow on dark navy</CardDescription>
        </CardHeader>
        <CardContent className="text-slate-200">
          <p>This card stands out on dark backgrounds with a cyan glow effect.</p>
        </CardContent>
        <CardFooter>
          <Button className="btn-glow-cyan">Get Started</Button>
        </CardFooter>
      </Card>
    </div>
  ),
};

// NEW: Elevated glass card
export const GlassElevated: Story = {
  render: () => (
    <div className="bg-gradient-radial-dark particle-bg p-16">
      <Card className="glass-elevated w-[380px]">
        <CardHeader>
          <CardTitle className="text-white">Elevated Glass</CardTitle>
          <CardDescription className="text-slate-300">Higher opacity and stronger shadows</CardDescription>
        </CardHeader>
        <CardContent className="text-slate-200">
          <p>Uses glass-elevated class for more prominent glass effect.</p>
        </CardContent>
      </Card>
    </div>
  ),
};

// NEW: Card with glow border
export const WithGlowBorder: Story = {
  render: () => (
    <div className="bg-astralis-navy p-16">
      <Card className="w-[380px] glow-border-cyan bg-slate-900">
        <CardHeader>
          <CardTitle className="text-white">Glowing Border Card</CardTitle>
          <CardDescription className="text-slate-300">Animated cyan border glow</CardDescription>
        </CardHeader>
        <CardContent className="text-slate-200">
          <p>Features an animated glowing border effect that pulses with cyan light.</p>
        </CardContent>
        <CardFooter>
          <Button className="btn-outline-glow">Explore</Button>
        </CardFooter>
      </Card>
    </div>
  ),
};

// NEW: Feature card with icon
export const FeatureCard: Story = {
  render: () => (
    <div className="bg-slate-100 p-16">
      <Card className="content-card w-[350px]">
        <CardContent className="pt-6">
          <div className="feature-icon mb-4 mx-auto">
            <svg className="w-10 h-10 text-astralis-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <CardTitle className="text-center mb-2">Lightning Fast</CardTitle>
          <CardDescription className="text-center mb-4">
            Optimized performance for instant results
          </CardDescription>
          <p className="text-slate-600 text-center">
            Experience blazing fast speeds with our optimized infrastructure.
          </p>
        </CardContent>
      </Card>
    </div>
  ),
};

// NEW: All card variants showcase
export const AllVariantsShowcase: Story = {
  render: () => (
    <div className="p-8 bg-slate-100">
      <h3 className="text-2xl font-semibold mb-6 text-astralis-navy">Standard Cards</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Card className="content-card">
          <CardHeader>
            <CardTitle>Standard Card</CardTitle>
            <CardDescription>Default white card</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Basic card with solid background.</p>
          </CardContent>
        </Card>

        <Card className="content-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1">
          <CardHeader>
            <CardTitle>Hover Card</CardTitle>
            <CardDescription>Hover for effect</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card with hover lift animation.</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-astralis-navy p-8 rounded-lg mb-12">
        <h3 className="text-2xl font-semibold mb-6 text-white">Glass Cards (Dark)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white">Glass Card</CardTitle>
              <CardDescription className="text-slate-300">Frosted glass effect</CardDescription>
            </CardHeader>
            <CardContent className="text-slate-200">
              <p>Translucent background with blur.</p>
            </CardContent>
          </Card>

          <Card className="glass-elevated">
            <CardHeader>
              <CardTitle className="text-white">Elevated Glass</CardTitle>
              <CardDescription className="text-slate-300">Stronger glass effect</CardDescription>
            </CardHeader>
            <CardContent className="text-slate-200">
              <p>Higher opacity glass variant.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="bg-gradient-radial-dark particle-bg tech-grid p-8 rounded-lg">
        <h3 className="text-2xl font-semibold mb-6 text-white">Special Effects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-glow-cyan border-astralis-cyan/30">
            <CardHeader>
              <CardTitle className="text-white">Glow Card</CardTitle>
              <CardDescription className="text-slate-300">Cyan glow shadow</CardDescription>
            </CardHeader>
            <CardContent className="text-slate-200">
              <p>Card with glowing shadow effect.</p>
            </CardContent>
          </Card>

          <Card className="glow-border-cyan bg-slate-900">
            <CardHeader>
              <CardTitle className="text-white">Border Glow</CardTitle>
              <CardDescription className="text-slate-300">Animated border</CardDescription>
            </CardHeader>
            <CardContent className="text-slate-200">
              <p>Pulsing glowing border animation.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  ),
};

// NEW: Interactive comparison
export const InteractiveComparison: Story = {
  render: () => (
    <div className="bg-gradient-navy-to-light p-16 flex gap-8 items-center justify-center flex-wrap">
      <Card className="content-card w-[300px] animate-float">
        <CardHeader>
          <CardTitle>Floating</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Animated floating effect</p>
        </CardContent>
      </Card>

      <Card className="glass-card w-[300px] animate-glow-pulse shadow-glow-cyan">
        <CardHeader>
          <CardTitle className="text-white">Pulsing</CardTitle>
        </CardHeader>
        <CardContent className="text-slate-200">
          <p>Glow pulse animation</p>
        </CardContent>
      </Card>

      <Card className="content-card w-[300px] animate-scale-pulse shadow-glow-blue">
        <CardHeader>
          <CardTitle>Scaling</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Scale pulse animation</p>
        </CardContent>
      </Card>
    </div>
  ),
};

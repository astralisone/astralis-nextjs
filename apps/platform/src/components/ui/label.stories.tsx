import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './label';
import { Input } from './input';

const meta = {
  title: 'UI/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Email Address',
  },
};

export const WithHtmlFor: Story = {
  args: {
    htmlFor: 'email-input',
    children: 'Email Address',
  },
};

export const Required: Story = {
  args: {
    children: 'Name *',
  },
};

export const WithInput: Story = {
  render: () => (
    <div className="w-[350px] space-y-2">
      <Label htmlFor="email">Email Address</Label>
      <Input id="email" type="email" placeholder="Enter your email" />
    </div>
  ),
};

// NEW: Label on dark background
export const OnDarkBackground: Story = {
  render: () => (
    <div className="bg-astralis-navy p-12 w-[400px]">
      <div className="space-y-2">
        <Label htmlFor="dark-input" className="text-white">
          Your Name
        </Label>
        <Input
          id="dark-input"
          type="text"
          placeholder="Enter your name"
          className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
        />
      </div>
    </div>
  ),
};

// NEW: Label with cyan accent
export const WithCyanAccent: Story = {
  render: () => (
    <div className="bg-astralis-navy particle-bg p-12 w-[400px]">
      <div className="space-y-2">
        <Label htmlFor="cyan-input" className="text-astralis-cyan font-semibold">
          Email Address
        </Label>
        <Input
          id="cyan-input"
          type="email"
          placeholder="you@example.com"
          className="bg-slate-800/50 border-astralis-cyan/30 text-white placeholder:text-slate-400 focus-visible:border-astralis-cyan focus-visible:shadow-glow-cyan"
        />
      </div>
    </div>
  ),
};

// NEW: Label with glow text
export const WithGlowText: Story = {
  render: () => (
    <div className="bg-gradient-radial-dark p-12 w-[400px]">
      <div className="space-y-2">
        <Label htmlFor="glow-input" className="text-white text-glow-cyan font-bold text-lg">
          Special Field
        </Label>
        <Input
          id="glow-input"
          type="text"
          placeholder="Glowing label above"
          className="glass-card text-white placeholder:text-slate-400 border-astralis-cyan/20"
        />
      </div>
    </div>
  ),
};

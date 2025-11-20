import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';
import { Label } from './label';

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithValue: Story = {
  args: {
    value: 'Sample text',
    placeholder: 'Enter text...',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'email@example.com',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-[350px] space-y-2">
      <Label htmlFor="email">Email Address</Label>
      <Input id="email" type="email" placeholder="Enter your email" />
    </div>
  ),
};

// NEW: Input with cyan glow on focus
export const WithGlowFocus: Story = {
  render: () => (
    <div className="bg-astralis-navy p-12 w-[400px]">
      <Label htmlFor="glow-input" className="text-white mb-2 block">
        Focus for Cyan Glow
      </Label>
      <Input
        id="glow-input"
        type="text"
        placeholder="Click to focus..."
        className="focus-visible:ring-astralis-cyan focus-visible:ring-2 focus-visible:shadow-glow-cyan bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
      />
    </div>
  ),
};

// NEW: Glass input with search styling
export const GlassInput: Story = {
  render: () => (
    <div className="bg-gradient-radial-dark p-12 w-[450px]">
      <div className="glass-search rounded-md px-4 py-3">
        <Input
          type="search"
          placeholder="Search..."
          className="bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-slate-300"
        />
      </div>
    </div>
  ),
};

// NEW: Input on dark background
export const OnDarkBackground: Story = {
  render: () => (
    <div className="bg-astralis-navy particle-bg tech-grid p-16 w-[500px]">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-white mb-2 block">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            className="bg-slate-800/50 border-astralis-cyan/30 text-white placeholder:text-slate-400 focus-visible:border-astralis-cyan focus-visible:shadow-glow-cyan"
          />
        </div>
        <div>
          <Label htmlFor="email-dark" className="text-white mb-2 block">Email</Label>
          <Input
            id="email-dark"
            type="email"
            placeholder="john@example.com"
            className="bg-slate-800/50 border-astralis-cyan/30 text-white placeholder:text-slate-400 focus-visible:border-astralis-cyan focus-visible:shadow-glow-cyan"
          />
        </div>
      </div>
    </div>
  ),
};

// NEW: Interactive search bar
export const InteractiveSearch: Story = {
  render: () => (
    <div className="bg-astralis-navy particle-bg p-20 flex items-center justify-center">
      <div className="w-[600px]">
        <div className="glass-search rounded-full px-6 py-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-astralis-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <Input
            type="search"
            placeholder="Search solutions, features, and more..."
            className="flex-1 bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-slate-300 text-lg"
          />
        </div>
      </div>
    </div>
  ),
};

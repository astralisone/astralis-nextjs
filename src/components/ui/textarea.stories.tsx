import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './textarea';
import { Label } from './label';

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter your message...',
  },
};

export const WithValue: Story = {
  args: {
    value: 'This is a sample message that spans multiple lines.',
    placeholder: 'Enter your message...',
  },
};

export const WithRows: Story = {
  args: {
    placeholder: 'Enter your message...',
    rows: 6,
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled textarea',
    disabled: true,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-[400px] space-y-2">
      <Label htmlFor="message">Message</Label>
      <Textarea
        id="message"
        placeholder="Enter your message..."
        rows={5}
      />
    </div>
  ),
};

// NEW: Textarea with glow on focus
export const WithGlowFocus: Story = {
  render: () => (
    <div className="bg-astralis-navy p-12 w-[450px]">
      <Label htmlFor="glow-textarea" className="text-white mb-2 block">
        Your Message
      </Label>
      <Textarea
        id="glow-textarea"
        placeholder="Focus to see cyan glow..."
        rows={6}
        className="focus-visible:ring-astralis-cyan focus-visible:ring-2 focus-visible:shadow-glow-cyan bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
      />
    </div>
  ),
};

// NEW: Glass textarea
export const GlassTextarea: Story = {
  render: () => (
    <div className="bg-gradient-radial-dark p-12 w-[500px]">
      <Label htmlFor="glass-textarea" className="text-white mb-2 block">
        Feedback
      </Label>
      <Textarea
        id="glass-textarea"
        placeholder="Share your thoughts..."
        rows={6}
        className="glass-card text-white placeholder:text-slate-300 border-astralis-cyan/20 focus-visible:border-astralis-cyan focus-visible:shadow-glow-cyan"
      />
    </div>
  ),
};

// NEW: Textarea on dark background
export const OnDarkBackground: Story = {
  render: () => (
    <div className="bg-astralis-navy particle-bg tech-grid p-16 w-[550px]">
      <div className="space-y-4">
        <div>
          <Label htmlFor="dark-message" className="text-white mb-2 block">Message</Label>
          <Textarea
            id="dark-message"
            placeholder="Type your message here..."
            rows={8}
            className="bg-slate-800/50 border-astralis-cyan/30 text-white placeholder:text-slate-400 focus-visible:border-astralis-cyan focus-visible:shadow-glow-cyan"
          />
        </div>
      </div>
    </div>
  ),
};

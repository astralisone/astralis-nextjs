import type { Meta, StoryObj } from '@storybook/react';
import { CTASection } from './cta-section';

const meta = {
  title: 'Sections/CTASection',
  component: CTASection,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CTASection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    headline: 'Ready to Get Started?',
    description: 'Join thousands of businesses automating their operations with Astralis.',
    primaryButton: {
      text: 'Start Free Trial',
      href: '/contact',
    },
    secondaryButton: {
      text: 'Schedule Demo',
      href: '/contact',
    },
  },
};

export const SingleButton: Story = {
  args: {
    headline: 'Transform Your Business Today',
    description: 'See how AI-powered automation can revolutionize your workflows.',
    primaryButton: {
      text: 'Get Started Now',
      href: '/contact',
    },
  },
};

export const ShortText: Story = {
  args: {
    headline: 'Let\'s Build Together',
    primaryButton: {
      text: 'Contact Us',
      href: '/contact',
    },
    secondaryButton: {
      text: 'Learn More',
      href: '/solutions',
    },
  },
};

export const LongDescription: Story = {
  args: {
    headline: 'Take the Next Step',
    description: 'Whether you\'re looking to automate workflows, integrate AI capabilities, or scale your operations, Astralis has the tools and expertise to help you succeed. Our platform is designed for businesses of all sizes.',
    primaryButton: {
      text: 'Get Started',
      href: '/contact',
    },
    secondaryButton: {
      text: 'View Pricing',
      href: '/solutions',
    },
  },
};

import type { Meta, StoryObj } from '@storybook/react';
import { UserJourneyVisualization } from './UserJourneyVisualization';

const meta: Meta<typeof UserJourneyVisualization> = {
  title: 'Analytics/UserJourneyVisualization',
  component: UserJourneyVisualization,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Interactive user journey visualization for Revenue Operations personas. Shows detailed journey stages, conversion triggers, and metrics for SaaS, E-commerce, Professional Services, and General Business personas.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      description: 'Additional CSS classes to apply to the component',
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Default user journey visualization showing all personas with detailed journey mapping for conversion optimization.',
      },
    },
  },
};

export const SaaSPersona: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Focused on SaaS Revenue Leader persona journey - shows detailed pain points, emotional states, and conversion triggers for $2M-$50M ARR companies.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="space-y-6">
        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-200">
            SaaS Revenue Leader Journey
          </h3>
          <p className="text-sm text-blue-600 dark:text-blue-300">
            VP/Director at $2M-$50M ARR SaaS company struggling with manual processes
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
            <div>
              <strong className="text-blue-800 dark:text-blue-200">Key Metrics:</strong>
              <div className="text-blue-600 dark:text-blue-300">340+ hours saved</div>
            </div>
            <div>
              <strong className="text-blue-800 dark:text-blue-200">Savings:</strong>
              <div className="text-blue-600 dark:text-blue-300">$25K+ monthly</div>
            </div>
            <div>
              <strong className="text-blue-800 dark:text-blue-200">ROI:</strong>
              <div className="text-blue-600 dark:text-blue-300">180%+</div>
            </div>
            <div>
              <strong className="text-blue-800 dark:text-blue-200">Payback:</strong>
              <div className="text-blue-600 dark:text-blue-300">3.2 months</div>
            </div>
          </div>
        </div>
        <Story />
      </div>
    ),
  ],
};

export const EcommercePersona: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'E-commerce Growth Director persona journey - shows lifecycle management challenges and automation opportunities for $10M+ GMV companies.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="space-y-6">
        <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-green-800 dark:text-green-200">
            E-commerce Growth Director Journey
          </h3>
          <p className="text-sm text-green-600 dark:text-green-300">
            Operations leader at $10M+ GMV e-commerce company needing customer lifecycle automation
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
            <div>
              <strong className="text-green-800 dark:text-green-200">Key Metrics:</strong>
              <div className="text-green-600 dark:text-green-300">280+ hours saved</div>
            </div>
            <div>
              <strong className="text-green-800 dark:text-green-200">Savings:</strong>
              <div className="text-green-600 dark:text-green-300">$32K+ monthly</div>
            </div>
            <div>
              <strong className="text-green-800 dark:text-green-200">ROI:</strong>
              <div className="text-green-600 dark:text-green-300">220%+</div>
            </div>
            <div>
              <strong className="text-green-800 dark:text-green-200">Payback:</strong>
              <div className="text-green-600 dark:text-green-300">2.8 months</div>
            </div>
          </div>
        </div>
        <Story />
      </div>
    ),
  ],
};

export const ProfessionalServicesPersona: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Professional Services Partner journey - shows project profitability and client operations automation needs for $5M+ revenue firms.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="space-y-6">
        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
          <h3 className="text-lg font-semibold mb-2 text-purple-800 dark:text-purple-200">
            Professional Services Partner Journey
          </h3>
          <p className="text-sm text-purple-600 dark:text-purple-300">
            Managing Partner at $5M+ revenue consulting firm needing project profitability optimization
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
            <div>
              <strong className="text-purple-800 dark:text-purple-200">Key Metrics:</strong>
              <div className="text-purple-600 dark:text-purple-300">450+ hours saved</div>
            </div>
            <div>
              <strong className="text-purple-800 dark:text-purple-200">Savings:</strong>
              <div className="text-purple-600 dark:text-purple-300">$28K+ monthly</div>
            </div>
            <div>
              <strong className="text-purple-800 dark:text-purple-200">ROI:</strong>
              <div className="text-purple-600 dark:text-purple-300">300%+</div>
            </div>
            <div>
              <strong className="text-purple-800 dark:text-purple-200">Payback:</strong>
              <div className="text-purple-600 dark:text-purple-300">2.1 months</div>
            </div>
          </div>
        </div>
        <Story />
      </div>
    ),
  ],
};

export const AllPersonasComparison: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Comprehensive comparison view showing all four personas with their key metrics and conversion characteristics side-by-side.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-4">Revenue Operations Persona Comparison</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Journey mapping for different Revenue Operations Authority target personas
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">SaaS Revenue Leader</h4>
              <div className="space-y-1 text-blue-600 dark:text-blue-300">
                <div>$2M-$50M ARR</div>
                <div>340+ hours saved</div>
                <div>$25K+ monthly savings</div>
                <div>180% ROI, 3.2mo payback</div>
              </div>
            </div>
            
            <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">E-commerce Director</h4>
              <div className="space-y-1 text-green-600 dark:text-green-300">
                <div>$10M+ GMV</div>
                <div>280+ hours saved</div>
                <div>$32K+ monthly savings</div>
                <div>220% ROI, 2.8mo payback</div>
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
              <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Services Partner</h4>
              <div className="space-y-1 text-purple-600 dark:text-purple-300">
                <div>$5M+ Revenue</div>
                <div>450+ hours saved</div>
                <div>$28K+ monthly savings</div>
                <div>300% ROI, 2.1mo payback</div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">General Business</h4>
              <div className="space-y-1 text-gray-600 dark:text-gray-300">
                <div>$2M+ Revenue</div>
                <div>240+ hours saved</div>
                <div>$18K+ monthly savings</div>
                <div>140% ROI, 4.2mo payback</div>
              </div>
            </div>
          </div>
        </div>
        <Story />
      </div>
    ),
  ],
};

export const DarkTheme: Story = {
  args: {},
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#1f2937' },
      ],
    },
    docs: {
      description: {
        story: 'User journey visualization in dark theme showing excellent contrast and readability for all persona data.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <div className="bg-gray-900 p-8 rounded-lg min-h-screen">
          <Story />
        </div>
      </div>
    ),
  ],
};

export const InteractiveDemo: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Interactive demonstration of the user journey visualization. Click between personas to see detailed journey stages, conversion triggers, and emotional states.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="space-y-6">
        <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Interactive User Journey Demo</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Click between different personas to explore their detailed journey stages
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow">
              <strong>Features:</strong> Persona selection, Journey stages, Emotional mapping
            </div>
            <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow">
              <strong>Data:</strong> Pain points, Conversion triggers, Key metrics
            </div>
            <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow">
              <strong>Usage:</strong> Marketing strategy, Sales enablement, Product planning
            </div>
          </div>
        </div>
        <Story />
      </div>
    ),
  ],
};
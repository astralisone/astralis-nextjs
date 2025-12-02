import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './checkbox';

const meta = {
  title: 'UI/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <label
        htmlFor="terms"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Accept terms and conditions
      </label>
    </div>
  ),
};

export const WithLabelAndDescription: Story = {
  render: () => (
    <div className="flex items-start space-x-2">
      <Checkbox id="marketing" className="mt-1" />
      <div className="space-y-1">
        <label
          htmlFor="marketing"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Marketing emails
        </label>
        <p className="text-sm text-slate-500">
          Receive emails about new products, features, and more.
        </p>
      </div>
    </div>
  ),
};

export const CheckboxList: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="c1" defaultChecked />
        <label htmlFor="c1" className="text-sm font-medium">
          Option 1
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="c2" />
        <label htmlFor="c2" className="text-sm font-medium">
          Option 2
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="c3" />
        <label htmlFor="c3" className="text-sm font-medium">
          Option 3
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="c4" disabled />
        <label htmlFor="c4" className="text-sm font-medium text-slate-400">
          Option 4 (Disabled)
        </label>
      </div>
    </div>
  ),
};

export const FormExample: Story = {
  render: () => (
    <div className="max-w-md space-y-6 p-6 border border-slate-200 rounded-lg">
      <div>
        <h3 className="text-lg font-semibold text-astralis-navy mb-4">
          Newsletter Preferences
        </h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-2">
            <Checkbox id="weekly" defaultChecked className="mt-1" />
            <div className="space-y-1">
              <label htmlFor="weekly" className="text-sm font-medium">
                Weekly Newsletter
              </label>
              <p className="text-sm text-slate-500">
                Get a weekly digest of the latest articles and updates.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Checkbox id="product" className="mt-1" />
            <div className="space-y-1">
              <label htmlFor="product" className="text-sm font-medium">
                Product Updates
              </label>
              <p className="text-sm text-slate-500">
                Be the first to know about new features and improvements.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Checkbox id="events" className="mt-1" />
            <div className="space-y-1">
              <label htmlFor="events" className="text-sm font-medium">
                Events & Webinars
              </label>
              <p className="text-sm text-slate-500">
                Get notified about upcoming events and webinars.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

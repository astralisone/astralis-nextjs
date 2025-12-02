import type { Meta, StoryObj } from '@storybook/react';
import { Alert, AlertTitle, AlertDescription } from './alert';

const meta = {
  title: 'UI/Alert',
  component: Alert,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'error', 'warning', 'info'],
    },
    showIcon: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    showIcon: false,
    children: (
      <>
        <AlertTitle>Default Alert</AlertTitle>
        <AlertDescription>
          This is a default alert message.
        </AlertDescription>
      </>
    ),
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    showIcon: true,
    children: (
      <>
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>
          Your changes have been saved successfully.
        </AlertDescription>
      </>
    ),
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    showIcon: true,
    children: (
      <>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          There was an error processing your request. Please try again.
        </AlertDescription>
      </>
    ),
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    showIcon: true,
    children: (
      <>
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          This action may have unintended consequences. Please proceed with caution.
        </AlertDescription>
      </>
    ),
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    showIcon: true,
    children: (
      <>
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>
          We've updated our privacy policy. Please review the changes.
        </AlertDescription>
      </>
    ),
  },
};

export const WithoutTitle: Story = {
  args: {
    variant: 'success',
    showIcon: true,
    children: (
      <AlertDescription>
        This alert only has a description without a title.
      </AlertDescription>
    ),
  },
};

export const WithIcon: Story = {
  args: {
    variant: 'info',
    showIcon: true,
    children: (
      <>
        <AlertTitle>With Icon</AlertTitle>
        <AlertDescription>
          This alert displays an icon based on its variant.
        </AlertDescription>
      </>
    ),
  },
};

export const WithoutIcon: Story = {
  args: {
    variant: 'warning',
    showIcon: false,
    children: (
      <>
        <AlertTitle>Without Icon</AlertTitle>
        <AlertDescription>
          This alert doesn't display an icon even though it has a variant.
        </AlertDescription>
      </>
    ),
  },
};

export const LongContent: Story = {
  args: {
    variant: 'error',
    showIcon: true,
    children: (
      <>
        <AlertTitle>System Error</AlertTitle>
        <AlertDescription>
          An unexpected error occurred while processing your request. This could be due to
          network connectivity issues, server problems, or invalid data. Please check your
          internet connection and try again. If the problem persists, contact support at
          support@example.com or call 1-800-SUPPORT.
        </AlertDescription>
      </>
    ),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4 max-w-2xl">
      <Alert variant="default" showIcon>
        <AlertTitle>Default</AlertTitle>
        <AlertDescription>
          This is a default alert message.
        </AlertDescription>
      </Alert>
      <Alert variant="success" showIcon>
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>
          Your changes have been saved successfully.
        </AlertDescription>
      </Alert>
      <Alert variant="error" showIcon>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          There was an error processing your request.
        </AlertDescription>
      </Alert>
      <Alert variant="warning" showIcon>
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          Please proceed with caution.
        </AlertDescription>
      </Alert>
      <Alert variant="info" showIcon>
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>
          We've updated our privacy policy.
        </AlertDescription>
      </Alert>
    </div>
  ),
};

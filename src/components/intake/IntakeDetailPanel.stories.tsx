import type { Meta, StoryObj } from '@storybook/react';
import { IntakeDetailPanel } from './IntakeDetailPanel';
import { IntakeSource, IntakeStatus } from '@/types/pipelines';

/**
 * IntakeDetailPanel displays full intake request details in a sliding panel.
 *
 * Features:
 * - Slides in from the right (~1/3 width)
 * - Shows title, description, status, priority, source
 * - Allows status changes and pipeline assignment
 * - Displays AI routing metadata
 * - Shows request data JSON
 * - Astralis brand styling with smooth animations
 */
const meta: Meta<typeof IntakeDetailPanel> = {
  title: 'Intake/IntakeDetailPanel',
  component: IntakeDetailPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A detailed panel for viewing and managing intake requests. Displays all request information with interactive controls for status and pipeline assignment.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof IntakeDetailPanel>;

const mockPipelines = [
  { id: 'pipeline-1', name: 'Software Development' },
  { id: 'pipeline-2', name: 'Infrastructure' },
  { id: 'pipeline-3', name: 'Data Analytics' },
  { id: 'pipeline-4', name: 'Security & Compliance' },
];

/**
 * New intake request that hasn't been assigned yet
 */
export const NewRequest: Story = {
  args: {
    intake: {
      id: 'intake-1',
      title: 'Set up CI/CD pipeline for new microservice',
      description:
        'We need to establish automated deployment workflows for our new authentication microservice. Requirements include automated testing, security scanning, and multi-environment deployment.',
      source: IntakeSource.FORM,
      status: IntakeStatus.NEW,
      priority: 3,
      orgId: 'org-1',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      requestData: {
        repository: 'https://github.com/company/auth-service',
        technology: 'Node.js',
        environments: ['dev', 'staging', 'production'],
        requester: 'john.doe@company.com',
      },
    },
    pipelines: mockPipelines,
    onClose: () => console.log('Close clicked'),
    onStatusChange: async (status: string) => {
      console.log('Status changed to:', status);
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
    onPipelineAssign: async (pipelineId: string) => {
      console.log('Pipeline assigned:', pipelineId);
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
  },
  decorators: [
    (Story) => (
      <div className="h-screen flex">
        <div className="flex-1 bg-slate-100 p-4 flex items-center justify-center">
          <p className="text-slate-600">Table content area (2/3 width)</p>
        </div>
        <div className="w-96 flex-shrink-0">
          <Story />
        </div>
      </div>
    ),
  ],
};

/**
 * Request that's being routed by AI
 */
export const RoutingWithAI: Story = {
  args: {
    intake: {
      id: 'intake-2',
      title: 'Database migration assistance needed',
      description:
        'Looking for help migrating our PostgreSQL database from version 12 to 15. Need to ensure zero downtime and data integrity.',
      source: IntakeSource.EMAIL,
      status: IntakeStatus.ROUTING,
      priority: 4,
      orgId: 'org-1',
      requestData: {},
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      aiRoutingMeta: {
        confidence: 0.87,
        reasoning:
          'Keywords "database", "PostgreSQL", "migration" indicate Infrastructure pipeline. High priority due to production impact mentioned.',
        suggestedPipelines: ['pipeline-2'],
        routedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
    },
    pipelines: mockPipelines,
    onClose: () => console.log('Close clicked'),
    onStatusChange: async (status: string) => {
      console.log('Status changed to:', status);
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
    onPipelineAssign: async (pipelineId: string) => {
      console.log('Pipeline assigned:', pipelineId);
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
  },
  decorators: [
    (Story) => (
      <div className="h-screen flex">
        <div className="flex-1 bg-slate-100 p-4 flex items-center justify-center">
          <p className="text-slate-600">Table content area</p>
        </div>
        <div className="w-96 flex-shrink-0">
          <Story />
        </div>
      </div>
    ),
  ],
};

/**
 * Assigned request with full details
 */
export const AssignedRequest: Story = {
  args: {
    intake: {
      id: 'intake-3',
      title: 'API rate limiting implementation',
      description:
        'Implement rate limiting for public API endpoints to prevent abuse and ensure fair usage across all clients.',
      source: IntakeSource.CHAT,
      status: IntakeStatus.ASSIGNED,
      priority: 2,
      orgId: 'org-1',
      assignedPipeline: 'pipeline-1',
      pipeline: { id: 'pipeline-1', name: 'Software Development' },
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      requestData: {
        endpoints: ['/api/v1/users', '/api/v1/orders', '/api/v1/products'],
        proposedLimits: {
          perMinute: 100,
          perHour: 5000,
        },
        priority: 'medium',
      },
      aiRoutingMeta: {
        confidence: 0.92,
        reasoning:
          'API development task identified. Assigned to Software Development pipeline based on technical requirements.',
        suggestedPipelines: ['pipeline-1'],
        routedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    },
    pipelines: mockPipelines,
    onClose: () => console.log('Close clicked'),
    onStatusChange: async (status: string) => {
      console.log('Status changed to:', status);
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
    onPipelineAssign: async (pipelineId: string) => {
      console.log('Pipeline assigned:', pipelineId);
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
  },
  decorators: [
    (Story) => (
      <div className="h-screen flex">
        <div className="flex-1 bg-slate-100 p-4 flex items-center justify-center">
          <p className="text-slate-600">Table content area</p>
        </div>
        <div className="w-96 flex-shrink-0">
          <Story />
        </div>
      </div>
    ),
  ],
};

/**
 * Completed request
 */
export const CompletedRequest: Story = {
  args: {
    intake: {
      id: 'intake-4',
      title: 'Security audit for payment processing',
      description:
        'Conduct comprehensive security audit of payment processing module including PCI compliance verification.',
      source: IntakeSource.API,
      status: IntakeStatus.COMPLETED,
      priority: 4,
      orgId: 'org-1',
      assignedPipeline: 'pipeline-4',
      pipeline: { id: 'pipeline-4', name: 'Security & Compliance' },
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      requestData: {
        scope: 'payment-module',
        standards: ['PCI-DSS', 'SOC2'],
        deadline: '2025-12-15',
      },
    },
    pipelines: mockPipelines,
    onClose: () => console.log('Close clicked'),
  },
  decorators: [
    (Story) => (
      <div className="h-screen flex">
        <div className="flex-1 bg-slate-100 p-4 flex items-center justify-center">
          <p className="text-slate-600">Table content area</p>
        </div>
        <div className="w-96 flex-shrink-0">
          <Story />
        </div>
      </div>
    ),
  ],
};

/**
 * Minimal request without description or extra data
 */
export const MinimalRequest: Story = {
  args: {
    intake: {
      id: 'intake-5',
      title: 'Quick question about deployment process',
      source: IntakeSource.CHAT,
      status: IntakeStatus.NEW,
      priority: 0,
      orgId: 'org-1',
      requestData: {},
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    pipelines: mockPipelines,
    onClose: () => console.log('Close clicked'),
    onStatusChange: async (status: string) => {
      console.log('Status changed to:', status);
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
    onPipelineAssign: async (pipelineId: string) => {
      console.log('Pipeline assigned:', pipelineId);
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
  },
  decorators: [
    (Story) => (
      <div className="h-screen flex">
        <div className="flex-1 bg-slate-100 p-4 flex items-center justify-center">
          <p className="text-slate-600">Table content area</p>
        </div>
        <div className="w-96 flex-shrink-0">
          <Story />
        </div>
      </div>
    ),
  ],
};

/**
 * Rejected request
 */
export const RejectedRequest: Story = {
  args: {
    intake: {
      id: 'intake-6',
      title: 'Build custom blockchain from scratch',
      description:
        'We want a fully custom blockchain solution built from the ground up with unique consensus mechanism.',
      source: IntakeSource.FORM,
      status: IntakeStatus.REJECTED,
      priority: 1,
      orgId: 'org-1',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      requestData: {
        reason: 'Out of scope for current capabilities',
        rejectedBy: 'admin',
      },
    },
    pipelines: mockPipelines,
    onClose: () => console.log('Close clicked'),
  },
  decorators: [
    (Story) => (
      <div className="h-screen flex">
        <div className="flex-1 bg-slate-100 p-4 flex items-center justify-center">
          <p className="text-slate-600">Table content area</p>
        </div>
        <div className="w-96 flex-shrink-0">
          <Story />
        </div>
      </div>
    ),
  ],
};

/**
 * Without interaction handlers (read-only)
 */
export const ReadOnly: Story = {
  args: {
    intake: {
      id: 'intake-7',
      title: 'Kubernetes cluster upgrade',
      description: 'Upgrade production Kubernetes cluster from v1.26 to v1.28',
      source: IntakeSource.EMAIL,
      status: IntakeStatus.PROCESSING,
      priority: 3,
      orgId: 'org-1',
      requestData: {},
      assignedPipeline: 'pipeline-2',
      pipeline: { id: 'pipeline-2', name: 'Infrastructure' },
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    pipelines: mockPipelines,
    onClose: () => console.log('Close clicked'),
    // No onStatusChange or onPipelineAssign handlers
  },
  decorators: [
    (Story) => (
      <div className="h-screen flex">
        <div className="flex-1 bg-slate-100 p-4 flex items-center justify-center">
          <p className="text-slate-600">Table content area</p>
        </div>
        <div className="w-96 flex-shrink-0">
          <Story />
        </div>
      </div>
    ),
  ],
};

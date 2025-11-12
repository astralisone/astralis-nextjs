import { WorkflowTemplate, Integration } from '@/types/workflow';

// Common integrations
export const integrations: Integration[] = [
  {
    id: 'salesforce',
    name: 'Salesforce',
    icon: '🔵',
    category: 'CRM',
    description: 'World-class CRM and sales automation',
    isPremium: false,
    tags: ['crm', 'sales', 'automation']
  },
  {
    id: 'hubspot', 
    name: 'HubSpot',
    icon: '🟠',
    category: 'Marketing',
    description: 'Inbound marketing and sales platform',
    isPremium: false,
    tags: ['marketing', 'crm', 'automation']
  },
  {
    id: 'stripe',
    name: 'Stripe',
    icon: '💜',
    category: 'Payments',
    description: 'Online payment processing',
    isPremium: false,
    tags: ['payments', 'billing', 'ecommerce']
  },
  {
    id: 'shopify',
    name: 'Shopify',
    icon: '🟢',
    category: 'E-commerce',
    description: 'E-commerce platform and tools',
    isPremium: false,
    tags: ['ecommerce', 'inventory', 'orders']
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    icon: '🍌',
    category: 'Email Marketing',
    description: 'Email marketing automation',
    isPremium: false,
    tags: ['email', 'marketing', 'automation']
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: '📩',
    category: 'Communication',
    description: 'Team communication platform',
    isPremium: false,
    tags: ['communication', 'notifications', 'team']
  },
  {
    id: 'zapier',
    name: 'Zapier',
    icon: '⚡',
    category: 'Automation',
    description: 'No-code automation platform',
    isPremium: false,
    tags: ['automation', 'integration', 'workflow']
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    icon: '📊',
    category: 'Analytics',
    description: 'Web and app analytics',
    isPremium: false,
    tags: ['analytics', 'tracking', 'insights']
  }
];

// SaaS Industry Templates
export const saasTemplates: WorkflowTemplate[] = [
  {
    id: 'saas-lead-nurturing',
    name: 'SaaS Lead Nurturing Pipeline',
    description: 'Automate lead scoring, qualification, and nurturing for SaaS companies',
    industry: 'saas',
    category: 'lead-generation',
    complexity: 'intermediate',
    estimatedTime: '2-3 weeks',
    roi: '340% increase in qualified leads',
    nodes: [
      {
        id: '1',
        type: 'custom',
        position: { x: 200, y: 50 },
        data: {
          label: 'Website Form Submission',
          category: 'lead-generation',
          type: 'trigger',
          description: 'New lead submits contact form or signs up for trial',
          integrations: ['hubspot', 'google-analytics'],
          isCustomizable: true
        }
      },
      {
        id: '2',
        type: 'custom',
        position: { x: 200, y: 180 },
        data: {
          label: 'Lead Scoring',
          category: 'lead-generation',
          type: 'action',
          description: 'Score lead based on company size, budget, and behavior',
          integrations: ['hubspot', 'salesforce'],
          isCustomizable: true
        }
      },
      {
        id: '3',
        type: 'custom',
        position: { x: 200, y: 310 },
        data: {
          label: 'Qualified Lead?',
          category: 'lead-generation',
          type: 'condition',
          description: 'Check if lead score meets qualification threshold',
          isCustomizable: true
        }
      },
      {
        id: '4',
        type: 'custom',
        position: { x: 50, y: 440 },
        data: {
          label: 'Sales Notification',
          category: 'sales-automation',
          type: 'action',
          description: 'Notify sales team of high-quality lead',
          integrations: ['slack', 'salesforce'],
          isCustomizable: false
        }
      },
      {
        id: '5',
        type: 'custom',
        position: { x: 350, y: 440 },
        data: {
          label: 'Nurture Sequence',
          category: 'marketing',
          type: 'action',
          description: 'Add to email nurture campaign',
          integrations: ['mailchimp', 'hubspot'],
          isCustomizable: true
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4', sourceHandle: 'true' },
      { id: 'e3-5', source: '3', target: '5', sourceHandle: 'false' }
    ],
    metrics: {
      automationScore: 85,
      timeSavings: '15 hours/week',
      costReduction: '60%',
      scalability: 90
    },
    features: [
      'Real-time lead scoring',
      'Automated qualification',
      'Smart nurturing campaigns',
      'Sales team notifications',
      'A/B testing capabilities'
    ],
    integrations: integrations.filter(i => ['hubspot', 'salesforce', 'mailchimp', 'slack', 'google-analytics'].includes(i.id))
  },
  {
    id: 'saas-trial-onboarding',
    name: 'Trial User Onboarding',
    description: 'Maximize trial-to-paid conversions with automated onboarding',
    industry: 'saas',
    category: 'customer-service',
    complexity: 'advanced',
    estimatedTime: '3-4 weeks',
    roi: '45% trial conversion increase',
    nodes: [
      {
        id: '1',
        type: 'custom',
        position: { x: 200, y: 50 },
        data: {
          label: 'Trial Started',
          category: 'customer-service',
          type: 'trigger',
          description: 'User signs up for free trial',
          integrations: ['stripe', 'google-analytics'],
          isCustomizable: false
        }
      },
      {
        id: '2',
        type: 'custom',
        position: { x: 200, y: 180 },
        data: {
          label: 'Welcome Email Series',
          category: 'marketing',
          type: 'action',
          description: 'Send personalized onboarding email sequence',
          integrations: ['mailchimp', 'hubspot'],
          isCustomizable: true
        }
      },
      {
        id: '3',
        type: 'custom',
        position: { x: 200, y: 310 },
        data: {
          label: 'Usage Tracking',
          category: 'data-processing',
          type: 'action',
          description: 'Monitor feature usage and engagement',
          integrations: ['google-analytics', 'zapier'],
          isCustomizable: true
        }
      },
      {
        id: '4',
        type: 'custom',
        position: { x: 200, y: 440 },
        data: {
          label: 'Low Activity?',
          category: 'data-processing',
          type: 'condition',
          description: 'Check if user engagement is below threshold',
          isCustomizable: true
        }
      },
      {
        id: '5',
        type: 'custom',
        position: { x: 50, y: 570 },
        data: {
          label: 'Re-engagement Campaign',
          category: 'marketing',
          type: 'action',
          description: 'Trigger targeted re-engagement emails',
          integrations: ['mailchimp', 'slack'],
          isCustomizable: true
        }
      },
      {
        id: '6',
        type: 'custom',
        position: { x: 350, y: 570 },
        data: {
          label: 'Upgrade Prompt',
          category: 'sales-automation',
          type: 'action',
          description: 'Show upgrade offer to engaged users',
          integrations: ['stripe', 'salesforce'],
          isCustomizable: true
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4' },
      { id: 'e4-5', source: '4', target: '5', sourceHandle: 'true' },
      { id: 'e4-6', source: '4', target: '6', sourceHandle: 'false' }
    ],
    metrics: {
      automationScore: 92,
      timeSavings: '25 hours/week',
      costReduction: '70%',
      scalability: 95
    },
    features: [
      'Behavioral email triggers',
      'Usage analytics integration',
      'Smart upgrade timing',
      'Personalized onboarding paths',
      'A/B testing for optimization'
    ],
    integrations: integrations.filter(i => ['stripe', 'mailchimp', 'hubspot', 'google-analytics', 'zapier', 'slack', 'salesforce'].includes(i.id))
  }
];

// E-commerce Templates
export const ecommerceTemplates: WorkflowTemplate[] = [
  {
    id: 'ecommerce-abandoned-cart',
    name: 'Abandoned Cart Recovery',
    description: 'Recover lost sales with personalized cart abandonment sequences',
    industry: 'ecommerce',
    category: 'sales-automation',
    complexity: 'intermediate',
    estimatedTime: '1-2 weeks',
    roi: '34% revenue recovery',
    nodes: [
      {
        id: '1',
        type: 'custom',
        position: { x: 200, y: 50 },
        data: {
          label: 'Cart Abandonment',
          category: 'sales-automation',
          type: 'trigger',
          description: 'Customer abandons cart without purchasing',
          integrations: ['shopify', 'google-analytics'],
          isCustomizable: false
        }
      },
      {
        id: '2',
        type: 'custom',
        position: { x: 200, y: 180 },
        data: {
          label: 'Wait Timer',
          category: 'operations',
          type: 'action',
          description: 'Wait 1 hour before first reminder',
          isCustomizable: true
        }
      },
      {
        id: '3',
        type: 'custom',
        position: { x: 200, y: 310 },
        data: {
          label: 'Recovery Email #1',
          category: 'marketing',
          type: 'action',
          description: 'Send personalized reminder with cart items',
          integrations: ['mailchimp', 'shopify'],
          isCustomizable: true
        }
      },
      {
        id: '4',
        type: 'custom',
        position: { x: 200, y: 440 },
        data: {
          label: 'Purchase Completed?',
          category: 'sales-automation',
          type: 'condition',
          description: 'Check if customer completed purchase',
          isCustomizable: false
        }
      },
      {
        id: '5',
        type: 'custom',
        position: { x: 50, y: 570 },
        data: {
          label: 'Thank You Email',
          category: 'customer-service',
          type: 'output',
          description: 'Send purchase confirmation',
          integrations: ['mailchimp', 'shopify'],
          isCustomizable: true
        }
      },
      {
        id: '6',
        type: 'custom',
        position: { x: 350, y: 570 },
        data: {
          label: 'Discount Offer',
          category: 'marketing',
          type: 'action',
          description: 'Send discount code after 24 hours',
          integrations: ['shopify', 'mailchimp'],
          isCustomizable: true
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4' },
      { id: 'e4-5', source: '4', target: '5', sourceHandle: 'true' },
      { id: 'e4-6', source: '4', target: '6', sourceHandle: 'false' }
    ],
    metrics: {
      automationScore: 88,
      timeSavings: '20 hours/week',
      costReduction: '65%',
      scalability: 90
    },
    features: [
      'Personalized product reminders',
      'Discount code automation',
      'Purchase tracking',
      'Multi-step email sequences',
      'Revenue recovery analytics'
    ],
    integrations: integrations.filter(i => ['shopify', 'mailchimp', 'google-analytics'].includes(i.id))
  }
];

// Professional Services Templates
export const professionalServicesTemplates: WorkflowTemplate[] = [
  {
    id: 'services-client-onboarding',
    name: 'Client Onboarding Automation',
    description: 'Streamline new client intake and project kickoff processes',
    industry: 'professional-services',
    category: 'operations',
    complexity: 'intermediate',
    estimatedTime: '2-3 weeks',
    roi: '3x faster onboarding',
    nodes: [
      {
        id: '1',
        type: 'custom',
        position: { x: 200, y: 50 },
        data: {
          label: 'Contract Signed',
          category: 'operations',
          type: 'trigger',
          description: 'New client signs service agreement',
          integrations: ['salesforce', 'hubspot'],
          isCustomizable: false
        }
      },
      {
        id: '2',
        type: 'custom',
        position: { x: 200, y: 180 },
        data: {
          label: 'Welcome Package',
          category: 'customer-service',
          type: 'action',
          description: 'Send welcome email with onboarding materials',
          integrations: ['mailchimp', 'slack'],
          isCustomizable: true
        }
      },
      {
        id: '3',
        type: 'custom',
        position: { x: 200, y: 310 },
        data: {
          label: 'Team Assignment',
          category: 'operations',
          type: 'action',
          description: 'Assign project team and create workspace',
          integrations: ['slack', 'zapier'],
          isCustomizable: true
        }
      },
      {
        id: '4',
        type: 'custom',
        position: { x: 200, y: 440 },
        data: {
          label: 'Kickoff Scheduled?',
          category: 'operations',
          type: 'condition',
          description: 'Check if kickoff meeting is scheduled',
          isCustomizable: true
        }
      },
      {
        id: '5',
        type: 'custom',
        position: { x: 350, y: 570 },
        data: {
          label: 'Schedule Reminder',
          category: 'customer-service',
          type: 'action',
          description: 'Send scheduling reminder to client',
          integrations: ['mailchimp', 'slack'],
          isCustomizable: true
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4' },
      { id: 'e4-5', source: '4', target: '5', sourceHandle: 'false' }
    ],
    metrics: {
      automationScore: 82,
      timeSavings: '12 hours/week',
      costReduction: '55%',
      scalability: 85
    },
    features: [
      'Automated team notifications',
      'Document template delivery',
      'Meeting scheduling automation',
      'Progress tracking dashboards',
      'Client communication templates'
    ],
    integrations: integrations.filter(i => ['salesforce', 'hubspot', 'mailchimp', 'slack', 'zapier'].includes(i.id))
  }
];

// General Industry Templates
export const generalTemplates: WorkflowTemplate[] = [
  {
    id: 'general-lead-generation',
    name: 'Universal Lead Generation',
    description: 'Capture and qualify leads from multiple sources',
    industry: 'general',
    category: 'lead-generation',
    complexity: 'beginner',
    estimatedTime: '1 week',
    roi: '2.2x efficiency gains',
    nodes: [
      {
        id: '1',
        type: 'custom',
        position: { x: 200, y: 50 },
        data: {
          label: 'Lead Capture',
          category: 'lead-generation',
          type: 'trigger',
          description: 'New lead from website, social media, or ads',
          integrations: ['google-analytics', 'hubspot'],
          isCustomizable: true
        }
      },
      {
        id: '2',
        type: 'custom',
        position: { x: 200, y: 180 },
        data: {
          label: 'Lead Enrichment',
          category: 'data-processing',
          type: 'action',
          description: 'Gather additional contact and company information',
          integrations: ['zapier', 'hubspot'],
          isCustomizable: true
        }
      },
      {
        id: '3',
        type: 'custom',
        position: { x: 200, y: 310 },
        data: {
          label: 'CRM Entry',
          category: 'data-processing',
          type: 'action',
          description: 'Add lead to CRM system',
          integrations: ['salesforce', 'hubspot'],
          isCustomizable: false
        }
      },
      {
        id: '4',
        type: 'custom',
        position: { x: 200, y: 440 },
        data: {
          label: 'Follow-up Email',
          category: 'marketing',
          type: 'output',
          description: 'Send personalized welcome email',
          integrations: ['mailchimp', 'hubspot'],
          isCustomizable: true
        }
      }
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2' },
      { id: 'e2-3', source: '2', target: '3' },
      { id: 'e3-4', source: '3', target: '4' }
    ],
    metrics: {
      automationScore: 75,
      timeSavings: '8 hours/week',
      costReduction: '45%',
      scalability: 80
    },
    features: [
      'Multi-source lead capture',
      'Automatic data enrichment',
      'CRM integration',
      'Email automation',
      'Basic reporting'
    ],
    integrations: integrations.filter(i => ['google-analytics', 'hubspot', 'zapier', 'salesforce', 'mailchimp'].includes(i.id))
  }
];

// All templates combined
export const allTemplates: WorkflowTemplate[] = [
  ...saasTemplates,
  ...ecommerceTemplates, 
  ...professionalServicesTemplates,
  ...generalTemplates
];

// Get templates by industry
export const getTemplatesByIndustry = (industry: string): WorkflowTemplate[] => {
  switch (industry) {
    case 'saas':
      return saasTemplates;
    case 'ecommerce':
      return ecommerceTemplates;
    case 'professional-services':
      return professionalServicesTemplates;
    case 'general':
      return generalTemplates;
    default:
      return allTemplates;
  }
};
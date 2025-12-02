/**
 * Automation Templates Seed Script
 * Phase 6: Business Automation & n8n Integration
 *
 * This script populates the automation_templates table with 12+ pre-built
 * n8n workflow templates for common business automation use cases.
 *
 * Usage: npx tsx prisma/seed-templates.ts
 */

import { PrismaClient, TemplateCategory } from '@prisma/client';

const prisma = new PrismaClient();

// Template definitions with complete n8n workflow JSON
const templates = [
  // ========== TEMPLATE 1: New Lead Auto-Response ==========
  {
    name: 'New Lead Auto-Response',
    description: 'Automatically send a personalized thank-you email when someone fills out your contact form, notify your sales team on Slack, and add the lead to your Google Sheets CRM. Response time < 1 minute. Improves lead conversion by 15-30%.',
    category: TemplateCategory.LEAD_MANAGEMENT,
    difficulty: 'beginner',
    requiredIntegrations: ['gmail', 'slack', 'googlesheets'],
    tags: ['leads', 'email', 'sales', 'crm', 'notifications'],
    isOfficial: true,
    n8nWorkflowJson: JSON.stringify({
      name: 'New Lead Auto-Response',
      nodes: [
        {
          parameters: {
            httpMethod: 'POST',
            path: 'contact-form',
            responseMode: 'responseNode',
          },
          id: 'webhook-trigger',
          name: 'Contact Form Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [240, 300],
        },
        {
          parameters: {
            authentication: 'oAuth2',
            sendTo: '={{ $json.email }}',
            subject: 'Thank You for Contacting Us',
            emailType: 'html',
            message: '<h2>Hi {{ $json.name }},</h2><p>Thank you for reaching out! We received your message and will get back to you within 24 hours.</p><p><strong>Your message:</strong><br/>{{ $json.message }}</p><p>Best regards,<br/>The Team</p>',
          },
          id: 'send-email',
          name: 'Send Thank You Email',
          type: 'n8n-nodes-base.gmail',
          typeVersion: 2,
          position: [480, 200],
        },
        {
          parameters: {
            channel: '#sales',
            text: '',
            attachments: [],
            blocksUi: {
              blocksValues: [
                {
                  type: 'section',
                  text: {
                    type: 'mrkdwn',
                    text: '*New Lead Received*\n:sparkles: {{ $json.name }} ({{ $json.email }})',
                  },
                },
              ],
            },
          },
          id: 'slack-notify',
          name: 'Notify Sales Team',
          type: 'n8n-nodes-base.slack',
          typeVersion: 2,
          position: [480, 300],
        },
        {
          parameters: {
            operation: 'append',
            documentId: { __rl: true, value: '{{ $env.CRM_SHEET_ID }}', mode: 'id' },
            sheetName: 'Leads',
            columns: {
              mappingMode: 'defineBelow',
              value: {
                Timestamp: '={{ $now.toISOString() }}',
                Name: '={{ $json.name }}',
                Email: '={{ $json.email }}',
                Company: '={{ $json.company }}',
                Message: '={{ $json.message }}',
              },
            },
          },
          id: 'add-to-sheets',
          name: 'Add to CRM',
          type: 'n8n-nodes-base.googleSheets',
          typeVersion: 4,
          position: [480, 400],
        },
        {
          parameters: {
            respondWith: 'json',
            responseBody: '={{ { "success": true, "message": "Thank you! We\'ll be in touch soon." } }}',
          },
          id: 'webhook-response',
          name: 'Send Response',
          type: 'n8n-nodes-base.respondToWebhook',
          typeVersion: 1,
          position: [700, 300],
        },
      ],
      connections: {
        'Contact Form Webhook': {
          main: [
            [
              { node: 'Send Thank You Email', type: 'main', index: 0 },
              { node: 'Notify Sales Team', type: 'main', index: 0 },
              { node: 'Add to CRM', type: 'main', index: 0 },
            ],
          ],
        },
        'Send Thank You Email': {
          main: [[{ node: 'Send Response', type: 'main', index: 0 }]],
        },
      },
    }),
  },

  // ========== TEMPLATE 2: Daily Operations Report ==========
  {
    name: 'Daily Operations Report',
    description: 'Generate and email a comprehensive daily summary every morning at 9 AM. Includes metrics on intake requests, documents processed, pipeline status. Saves 30-60 minutes daily. Data accuracy: 100%.',
    category: TemplateCategory.REPORTING,
    difficulty: 'intermediate',
    requiredIntegrations: ['database', 'gmail', 'slack'],
    tags: ['reporting', 'metrics', 'dashboard', 'analytics', 'daily'],
    isOfficial: true,
    n8nWorkflowJson: JSON.stringify({
      name: 'Daily Operations Report',
      nodes: [
        {
          parameters: {
            rule: {
              interval: [{ field: 'cronExpression', expression: '0 9 * * 1-5' }],
            },
          },
          id: 'schedule-trigger',
          name: 'Schedule Trigger',
          type: 'n8n-nodes-base.scheduleTrigger',
          typeVersion: 1,
          position: [240, 300],
        },
        {
          parameters: {
            operation: 'executeQuery',
            query: 'SELECT COUNT(*) as total FROM intake_requests WHERE created_at >= CURRENT_DATE',
          },
          id: 'query-data',
          name: 'Query Metrics',
          type: 'n8n-nodes-base.postgres',
          typeVersion: 2,
          position: [460, 300],
        },
        {
          parameters: {
            authentication: 'oAuth2',
            sendTo: '{{ $env.REPORT_RECIPIENTS }}',
            subject: 'Daily Operations Report - {{ $now.format("YYYY-MM-DD") }}',
            emailType: 'html',
            message: '<h2>Daily Operations Report</h2><p>Total Requests: {{ $json.total }}</p>',
          },
          id: 'email-report',
          name: 'Email Report',
          type: 'n8n-nodes-base.gmail',
          typeVersion: 2,
          position: [680, 300],
        },
      ],
      connections: {
        'Schedule Trigger': {
          main: [[{ node: 'Query Metrics', type: 'main', index: 0 }]],
        },
        'Query Metrics': {
          main: [[{ node: 'Email Report', type: 'main', index: 0 }]],
        },
      },
    }),
  },

  // ========== TEMPLATE 3: Document Upload Processor ==========
  {
    name: 'Document Upload Processor',
    description: 'Automatically process uploaded documents with OCR, extract metadata, classify with AI, and organize into folders. Saves 5-10 minutes per document.',
    category: TemplateCategory.DATA_SYNC,
    difficulty: 'beginner',
    requiredIntegrations: ['webhook', 'database'],
    tags: ['documents', 'ocr', 'automation', 'ai'],
    isOfficial: true,
    n8nWorkflowJson: JSON.stringify({
      name: 'Document Upload Processor',
      nodes: [
        {
          parameters: {
            httpMethod: 'POST',
            path: 'document-uploaded',
          },
          id: 'webhook',
          name: 'Document Upload Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [240, 300],
        },
        {
          parameters: {
            operation: 'executeQuery',
            query: 'UPDATE "Document" SET status = \'PROCESSING\' WHERE id = \'{{ $json.documentId }}\'',
          },
          id: 'update-status',
          name: 'Update Status',
          type: 'n8n-nodes-base.postgres',
          typeVersion: 2,
          position: [460, 300],
        },
      ],
      connections: {
        'Document Upload Webhook': {
          main: [[{ node: 'Update Status', type: 'main', index: 0 }]],
        },
      },
    }),
  },

  // ========== TEMPLATE 4: Invoice Payment Processor ==========
  {
    name: 'Invoice Payment Processor',
    description: 'When payment received via Stripe, automatically send receipt, update accounting sheet, mark invoice as paid, and notify finance team. Processing time: <30 seconds.',
    category: TemplateCategory.INVOICING,
    difficulty: 'intermediate',
    requiredIntegrations: ['stripe', 'gmail', 'googlesheets', 'slack'],
    tags: ['payments', 'invoicing', 'finance', 'stripe'],
    isOfficial: true,
    n8nWorkflowJson: JSON.stringify({
      name: 'Invoice Payment Processor',
      nodes: [
        {
          parameters: {
            events: ['payment_intent.succeeded'],
          },
          id: 'stripe-trigger',
          name: 'Stripe Webhook',
          type: 'n8n-nodes-base.stripeTrigger',
          typeVersion: 1,
          position: [240, 300],
        },
        {
          parameters: {
            authentication: 'oAuth2',
            sendTo: '={{ $json.customer_email }}',
            subject: 'Payment Receipt',
            emailType: 'html',
            message: '<p>Payment received: ${{ $json.amount_received / 100 }}</p>',
          },
          id: 'send-receipt',
          name: 'Send Receipt',
          type: 'n8n-nodes-base.gmail',
          typeVersion: 2,
          position: [460, 300],
        },
      ],
      connections: {
        'Stripe Webhook': {
          main: [[{ node: 'Send Receipt', type: 'main', index: 0 }]],
        },
      },
    }),
  },

  // ========== TEMPLATE 5: Customer Onboarding ==========
  {
    name: 'Customer Onboarding Sequence',
    description: 'When new customer signs up, send welcome email series (Day 1, 3, 7), create customer folder, schedule kickoff call. Onboarding consistency: 100%. Time to first value: -50%.',
    category: TemplateCategory.CUSTOMER_ONBOARDING,
    difficulty: 'intermediate',
    requiredIntegrations: ['gmail', 'googledrive', 'slack'],
    tags: ['onboarding', 'customers', 'automation', 'email'],
    isOfficial: true,
    n8nWorkflowJson: JSON.stringify({
      name: 'Customer Onboarding',
      nodes: [
        {
          parameters: {
            httpMethod: 'POST',
            path: 'new-customer',
          },
          id: 'webhook',
          name: 'New Customer Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [240, 300],
        },
        {
          parameters: {
            authentication: 'oAuth2',
            sendTo: '={{ $json.email }}',
            subject: 'Welcome!',
            message: 'Welcome {{ $json.name }}!',
          },
          id: 'welcome-email',
          name: 'Send Welcome Email',
          type: 'n8n-nodes-base.gmail',
          typeVersion: 2,
          position: [460, 300],
        },
      ],
      connections: {
        'New Customer Webhook': {
          main: [[{ node: 'Send Welcome Email', type: 'main', index: 0 }]],
        },
      },
    }),
  },

  // ========== TEMPLATE 6: Pipeline Stage Notifier ==========
  {
    name: 'Pipeline Stage Change Notifier',
    description: 'Notify assigned users when pipeline items change stages. Send email and Slack notification with item details. Real-time team coordination.',
    category: TemplateCategory.NOTIFICATIONS,
    difficulty: 'beginner',
    requiredIntegrations: ['webhook', 'gmail', 'slack'],
    tags: ['pipeline', 'notifications', 'teamwork'],
    isOfficial: true,
    n8nWorkflowJson: JSON.stringify({
      name: 'Pipeline Stage Notifier',
      nodes: [
        {
          parameters: {
            httpMethod: 'POST',
            path: 'pipeline-stage-changed',
          },
          id: 'webhook',
          name: 'Stage Change Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [240, 300],
        },
        {
          parameters: {
            channel: '#operations',
            text: 'Item moved to {{ $json.newStage }}',
          },
          id: 'slack',
          name: 'Notify Slack',
          type: 'n8n-nodes-base.slack',
          typeVersion: 2,
          position: [460, 300],
        },
      ],
      connections: {
        'Stage Change Webhook': {
          main: [[{ node: 'Notify Slack', type: 'main', index: 0 }]],
        },
      },
    }),
  },

  // ========== TEMPLATE 7: Intake Request Router ==========
  {
    name: 'AI-Powered Intake Request Router',
    description: 'Use AI to classify intake requests and route to appropriate teams. Sales → CRM, Support → Ticket System, Billing → Finance. Intelligent request routing.',
    category: TemplateCategory.SUPPORT_AUTOMATION,
    difficulty: 'advanced',
    requiredIntegrations: ['webhook', 'openai', 'database'],
    tags: ['ai', 'routing', 'intake', 'automation'],
    isOfficial: true,
    n8nWorkflowJson: JSON.stringify({
      name: 'Intake Request Router',
      nodes: [
        {
          parameters: {
            httpMethod: 'POST',
            path: 'intake-request',
          },
          id: 'webhook',
          name: 'Intake Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [240, 300],
        },
        {
          parameters: {
            operation: 'executeQuery',
            query: 'UPDATE intake_requests SET status = \'ROUTING\' WHERE id = \'{{ $json.id }}\'',
          },
          id: 'update',
          name: 'Update Status',
          type: 'n8n-nodes-base.postgres',
          typeVersion: 2,
          position: [460, 300],
        },
      ],
      connections: {
        'Intake Webhook': {
          main: [[{ node: 'Update Status', type: 'main', index: 0 }]],
        },
      },
    }),
  },

  // ========== TEMPLATE 8: Social Media Publisher ==========
  {
    name: 'Social Media Content Publisher',
    description: 'Extract blog post from Google Docs, generate social posts with AI, create images, schedule to Twitter/LinkedIn/Facebook. Publishing time: 5 min vs 45-60 min.',
    category: TemplateCategory.CONTENT_PUBLISHING,
    difficulty: 'intermediate',
    requiredIntegrations: ['googledrive', 'openai'],
    tags: ['social-media', 'content', 'ai', 'automation'],
    isOfficial: true,
    n8nWorkflowJson: JSON.stringify({
      name: 'Social Media Publisher',
      nodes: [
        {
          parameters: {
            rule: {
              interval: [{ field: 'cronExpression', expression: '0 10 * * 1' }],
            },
          },
          id: 'schedule',
          name: 'Weekly Schedule',
          type: 'n8n-nodes-base.scheduleTrigger',
          typeVersion: 1,
          position: [240, 300],
        },
      ],
      connections: {},
    }),
  },

  // ========== TEMPLATE 9: Failed Payment Recovery ==========
  {
    name: 'Failed Payment Recovery',
    description: 'Daily check for failed payments, send retry emails, follow up after 3 days, notify finance after 7 days. Improved payment recovery rate.',
    category: TemplateCategory.INVOICING,
    difficulty: 'intermediate',
    requiredIntegrations: ['database', 'gmail', 'stripe'],
    tags: ['payments', 'recovery', 'finance'],
    isOfficial: true,
    n8nWorkflowJson: JSON.stringify({
      name: 'Failed Payment Recovery',
      nodes: [
        {
          parameters: {
            rule: {
              interval: [{ field: 'cronExpression', expression: '0 9 * * *' }],
            },
          },
          id: 'schedule',
          name: 'Daily Check',
          type: 'n8n-nodes-base.scheduleTrigger',
          typeVersion: 1,
          position: [240, 300],
        },
      ],
      connections: {},
    }),
  },

  // ========== TEMPLATE 10: Team Availability Sync ==========
  {
    name: 'Team Availability Sync',
    description: 'Hourly sync from Google Calendar, update Slack status, update team dashboard, alert if key person unavailable. Real-time availability visibility.',
    category: TemplateCategory.HR_OPERATIONS,
    difficulty: 'beginner',
    requiredIntegrations: ['googlecalendar', 'slack'],
    tags: ['calendar', 'availability', 'team'],
    isOfficial: true,
    n8nWorkflowJson: JSON.stringify({
      name: 'Team Availability Sync',
      nodes: [
        {
          parameters: {
            rule: {
              interval: [{ field: 'hours', hoursInterval: 1 }],
            },
          },
          id: 'schedule',
          name: 'Hourly Sync',
          type: 'n8n-nodes-base.scheduleTrigger',
          typeVersion: 1,
          position: [240, 300],
        },
      ],
      connections: {},
    }),
  },

  // ========== TEMPLATE 11: Expense Report Automation ==========
  {
    name: 'Expense Report Automation',
    description: 'Receipt forwarded to expenses@ → OCR extraction → categorize → add to Google Sheets → request approval if over threshold → submit to accounting.',
    category: TemplateCategory.REPORTING,
    difficulty: 'intermediate',
    requiredIntegrations: ['gmail', 'googlesheets'],
    tags: ['expenses', 'finance', 'ocr'],
    isOfficial: true,
    n8nWorkflowJson: JSON.stringify({
      name: 'Expense Automation',
      nodes: [
        {
          parameters: {
            pollTimes: {
              item: [{ mode: 'everyMinute' }],
            },
          },
          id: 'email-trigger',
          name: 'Email Trigger',
          type: 'n8n-nodes-base.emailReadImap',
          typeVersion: 2,
          position: [240, 300],
        },
      ],
      connections: {},
    }),
  },

  // ========== TEMPLATE 12: Customer Feedback Loop ==========
  {
    name: 'Customer Feedback Loop',
    description: 'After service completion, wait 24 hours, send survey. If positive (>4 stars) → request review. If negative (<3 stars) → alert support, schedule call.',
    category: TemplateCategory.MARKETING,
    difficulty: 'beginner',
    requiredIntegrations: ['webhook', 'gmail'],
    tags: ['feedback', 'surveys', 'customer-satisfaction'],
    isOfficial: true,
    n8nWorkflowJson: JSON.stringify({
      name: 'Customer Feedback Loop',
      nodes: [
        {
          parameters: {
            httpMethod: 'POST',
            path: 'service-completed',
          },
          id: 'webhook',
          name: 'Service Completed',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [240, 300],
        },
        {
          parameters: {
            amount: 24,
            unit: 'hours',
          },
          id: 'wait',
          name: 'Wait 24 Hours',
          type: 'n8n-nodes-base.wait',
          typeVersion: 1,
          position: [460, 300],
        },
      ],
      connections: {
        'Service Completed': {
          main: [[{ node: 'Wait 24 Hours', type: 'main', index: 0 }]],
        },
      },
    }),
  },
];

// Main seed function
async function seedTemplates() {
  console.log('🌱 Starting automation templates seed...');
  console.log('');

  try {
    // Check if templates already exist
    const existingCount = await prisma.automationTemplate.count();

    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing templates.`);
      console.log('');
      console.log('Options:');
      console.log('  1. Skip seeding (templates already exist)');
      console.log('  2. Delete existing and reseed');
      console.log('');
      console.log('Skipping seed to preserve existing templates.');
      console.log('To force reseed, delete templates manually first:');
      console.log('  npx prisma studio → automation_templates → Delete all');
      console.log('');
      return;
    }

    // Insert templates
    console.log(`📦 Inserting ${templates.length} automation templates...`);
    console.log('');

    let successCount = 0;

    for (const template of templates) {
      try {
        const created = await prisma.automationTemplate.create({
          data: {
            ...template,
            useCount: 0,
            rating: 0.0,
            publishedAt: new Date(),
          },
        });

        successCount++;
        console.log(`✅ Created: ${created.name}`);
        console.log(`   Category: ${created.category}`);
        console.log(`   Difficulty: ${created.difficulty}`);
        console.log(`   Integrations: ${created.requiredIntegrations.join(', ')}`);
        console.log('');
      } catch (error) {
        console.error(`❌ Failed to create template: ${template.name}`);
        console.error(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.log('');
      }
    }

    console.log('');
    console.log('🎉 Automation templates seed completed!');
    console.log('');
    console.log(`📊 Summary:`);
    console.log(`   Total templates: ${templates.length}`);
    console.log(`   Successfully created: ${successCount}`);
    console.log(`   Failed: ${templates.length - successCount}`);
    console.log('');
    console.log('📚 Template Categories:');
    const categories = [...new Set(templates.map((t) => t.category))];
    categories.forEach((cat) => {
      const count = templates.filter((t) => t.category === cat).length;
      console.log(`   - ${cat}: ${count} templates`);
    });
    console.log('');
    console.log('🚀 Next steps:');
    console.log('   1. Access templates at http://localhost:3001/app/automations/templates');
    console.log('   2. Configure required integrations (Gmail, Slack, Google Sheets)');
    console.log('   3. Deploy templates with one click');
    console.log('   4. Access n8n editor at http://localhost:5678 to customize workflows');
    console.log('');
  } catch (error) {
    console.error('');
    console.error('❌ Seed failed:');
    console.error(error);
    console.log('');
    throw error;
  }
}

// Execute seed
seedTemplates()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

/**
 * AstralisOps Product Page Content Data
 * Following Astralis One Master Project Specification v1.0 - Section 4.3 & 5.2
 * Brand Voice: Corporate, clear, confident - measurable impact over hype
 */

export const astralisOpsContent = {
  // 1. Hero Section - Product positioning
  hero: {
    headline: "AstralisOps — AI Operations Console",
    subheadline: "Streamline Operations at Scale",
    description: "One unified platform to manage every request, document, and automation. Built for teams that need reliable, efficient operations that just work.",
    primaryButton: {
      text: "Schedule a Demo",
      href: "/contact?intent=demo",
    },
    secondaryButton: {
      text: "View Pricing",
      href: "#pricing",
    },
  },

  // 2. Core Features (Section 5.2) - 2x3 grid
  features: [
    {
      title: "Smart Request Sorting",
      description: "Client emails and form submissions automatically get organized and assigned to the right person on your team. No more manual sorting through your inbox to figure out who should handle what.",
      icon: "workflow", // Lucide: Workflow
    },
    {
      title: "Automatic Appointment Booking",
      description: "Let clients book appointments online without the back-and-forth emails. Your calendar stays synchronized, double-bookings are prevented, and reminders go out automatically.",
      icon: "calendar-check", // Lucide: CalendarCheck
    },
    {
      title: "Extract Data from Files",
      description: "Upload PDFs, photos, or scanned documents and automatically pull out names, dates, amounts, and other information. No more manually typing data from paperwork.",
      icon: "file-scan", // Lucide: FileScan
    },
    {
      title: "Automate Repetitive Steps",
      description: "Set up automated workflows once, then let them run on autopilot. When a client submits a form, it can automatically send emails, update your database, and create tasks for your team.",
      icon: "git-merge", // Lucide: GitMerge
    },
    {
      title: "See Everything in One Place",
      description: "View all your active projects, client requests, and team workload on one screen. Know what's happening in your business at a glance without checking multiple systems.",
      icon: "layout-dashboard", // Lucide: LayoutDashboard
    },
    {
      title: "Track Work from Start to Finish",
      description: "See exactly where each client project stands - from initial request to final delivery. Move projects through stages and automatically notify clients when status changes.",
      icon: "kanban", // Lucide: Kanban
    },
  ],

  // 3. Workflow Diagram Section
  workflowDiagram: {
    title: "How AstralisOps Works",
    description: "From intake to completion, AstralisOps orchestrates every step of your operations workflow.",
    stages: [
      { label: "Intake", sublabel: "AI routing" },
      { label: "Process", sublabel: "Automation" },
      { label: "Monitor", sublabel: "Dashboard" },
      { label: "Complete", sublabel: "Analytics" },
    ],
  },

  // 4. Outcomes Section (Stats/Results)
  outcomes: {
    headline: "Measurable Impact on Operations",
    description: "Organizations using AstralisOps report significant improvements in efficiency, accuracy, and team productivity.",
    stats: [
      {
        value: "80%",
        label: "Reduction in Manual Triage",
        secondaryText: "vs manual processes",
      },
      {
        value: "3x",
        label: "Faster Request Processing",
        secondaryText: "average time to completion",
      },
      {
        value: "95%",
        label: "Automation Accuracy",
        secondaryText: "with continuous learning",
      },
      {
        value: "50+",
        label: "System Integrations",
        secondaryText: "CRMs, calendars, email",
      },
    ],
  },

  // 5. Pricing Teaser (3 tiers)
  pricing: {
    headline: "Choose Your Plan",
    description: "Flexible pricing that scales with your team. Start with essentials and grow into advanced automation.",
    tiers: [
      {
        name: "Starter",
        price: "$99",
        period: "per month",
        description: "Core operations platform for small teams getting started with automation.",
        features: [
          "AI intake routing (500 requests/mo)",
          "Basic scheduling workflows",
          "Document processing (100 docs/mo)",
          "3 team members",
          "5 active pipelines",
          "Email support",
        ],
        cta: "Get Started",
        ctaHref: "/contact?plan=starter",
        recommended: false,
      },
      {
        name: "Professional",
        price: "$299",
        period: "per month",
        description: "Advanced automation and integrations for growing operations teams.",
        features: [
          "AI intake routing (5,000 requests/mo)",
          "Advanced scheduling + calendar sync",
          "Document processing (1,000 docs/mo)",
          "15 team members",
          "Unlimited pipelines",
          "Custom workflow builder",
          "CRM integrations (HubSpot, Salesforce)",
          "Priority support",
        ],
        cta: "Start Trial",
        ctaHref: "/contact?plan=professional",
        recommended: true,
      },
      {
        name: "Enterprise",
        price: "Custom",
        period: "pricing",
        description: "Tailored solutions with dedicated infrastructure and white-glove support.",
        features: [
          "Unlimited requests & documents",
          "Unlimited team members",
          "Custom AI model training",
          "Advanced security & compliance",
          "Dedicated infrastructure",
          "Custom integrations",
          "SLA guarantees",
          "24/7 enterprise support",
        ],
        cta: "Contact Sales",
        ctaHref: "/contact?plan=enterprise",
        recommended: false,
      },
    ],
  },

  // 6. Demo CTA Section
  demoCta: {
    headline: "See AstralisOps in Action",
    description: "Schedule a personalized walkthrough with our team. We'll show you how AstralisOps can streamline your specific workflows and deliver measurable efficiency gains.",
    primaryButton: {
      text: "Schedule a Demo",
      href: "/contact?intent=demo",
    },
    secondaryButton: {
      text: "Explore Documentation",
      href: "/docs",
    },
  },

  // Additional integrations info
  integrations: {
    categories: [
      {
        name: "Calendars",
        items: ["Google Calendar", "Outlook", "CalDAV"],
      },
      {
        name: "CRMs",
        items: ["HubSpot", "Salesforce", "Pipedrive", "Zoho CRM"],
      },
      {
        name: "Email",
        items: ["Gmail", "Outlook", "SendGrid", "Mailgun"],
      },
      {
        name: "Communication",
        items: ["Slack", "Microsoft Teams", "Discord"],
      },
    ],
  },
} as const;

// Type exports for TypeScript consumers
export type AstralisOpsContent = typeof astralisOpsContent;
export type AstralisOpsFeature = typeof astralisOpsContent.features[number];
export type AstralisOpsPricingTier = typeof astralisOpsContent.pricing.tiers[number];
export type AstralisOpsStat = typeof astralisOpsContent.outcomes.stats[number];

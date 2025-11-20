/**
 * Homepage Content Data
 * Following Astralis One Master Project Specification v1.0
 * Brand Voice: Corporate, clear, confident - measurable impact over hype
 */

export const homepageContent = {
  // 1. Hero Section
  hero: {
    headline: "Automate Your Growth. Intelligent AI Solutions for Modern Enterprises.",
    subheadline: "Transform manual workflows into intelligent automation. Scale your operations with enterprise-grade AI that delivers measurable results.",
    primaryCta: "Launch the AI Service Wizard",
    secondaryCta: "Book a Free Strategy Session",
    primaryCtaHref: "/contact?intent=wizard",
    secondaryCtaHref: "/contact?intent=strategy",
    socialProof: {
      businesses: "500+",
      successRate: "98%",
      rating: "4.9",
      reviews: "500+"
    }
  },

  // 2. What We Do Overview
  overview: {
    title: "What We Do",
    description: "Astralis builds AI-driven operations platforms and automation systems for growing organizations. We eliminate manual workflows and create scalable infrastructure that adapts to your business needs. Our solutions integrate seamlessly with your existing tools.",
  },

  // 3. Core Capabilities
  capabilities: [
    {
      id: "ai-automation",
      title: "AI Automation Systems",
      description: "Intelligent routing, document processing, and workflow automation that reduce manual effort by up to 80%. Deploy custom AI agents that handle intake, scheduling, and operations tasks.",
      icon: "bot", // Lucide icon suggestion: Bot, Zap, or Workflow
      href: "/solutions#ai-automation",
    },
    {
      id: "saas-platform",
      title: "SaaS Platform Engineering",
      description: "Production-ready operations consoles built on enterprise frameworks. AstralisOps provides unified dashboards, real-time monitoring, and team collaboration tools that scale with your organization.",
      icon: "layout-dashboard", // Lucide icon: LayoutDashboard, Box, or Layers
      href: "/products/astralisops",
    },
    {
      id: "integration-layer",
      title: "System Integration & Orchestration",
      description: "Connect your CRM, calendars, email, and business tools into unified workflows. We build integration layers that eliminate data silos and automate cross-platform operations.",
      icon: "git-merge", // Lucide icon: GitMerge, Workflow, or Network
      href: "/solutions#platform-engineering",
    },
    {
      id: "custom-deployment",
      title: "Custom Deployment Services",
      description: "Tailored automation solutions deployed directly into your infrastructure. From document intelligence to full operations suites, we build and optimize systems for your specific requirements.",
      icon: "rocket", // Lucide icon: Rocket, Settings, or Wrench
      href: "/automation-services",
    },
  ],

  // 4. Why Astralis - 4 Pillars
  pillars: [
    {
      id: "enterprise-ready",
      title: "Enterprise-Ready",
      description: "Production-tested architecture with security, scalability, and compliance built in from day one.",
      icon: "shield-check", // Lucide icon: ShieldCheck or Lock
    },
    {
      id: "ai-first",
      title: "AI-First Design",
      description: "Intelligent automation at every layer. Our systems learn, adapt, and optimize operations without manual configuration.",
      icon: "sparkles", // Lucide icon: Sparkles, Brain, or Cpu
    },
    {
      id: "rapid-deployment",
      title: "Rapid Deployment",
      description: "Implementation in weeks, not months. Modular components and pre-built workflows accelerate time to value.",
      icon: "gauge", // Lucide icon: Gauge, Zap, or Timer
    },
    {
      id: "measurable-impact",
      title: "Measurable Impact",
      description: "Real-time analytics and performance tracking. Every automation delivers quantifiable efficiency gains and cost reduction.",
      icon: "trending-up", // Lucide icon: TrendingUp, BarChart, or LineChart
    },
  ],

  // 5. AstralisOps Spotlight
  platformSpotlight: {
    title: "Introducing AstralisOps",
    subtitle: "The AI Operations Console for Modern Teams",
    description: "A unified platform that automates intake, scheduling, document processing, and workflow orchestration. Built for SMBs scaling to enterprise.",
    features: [
      "AI-powered request routing and triage across channels",
      "Intelligent scheduling with calendar integrations and conflict resolution",
      "Document processing pipeline with OCR and automated data extraction",
      "Custom workflow builder with 100+ pre-built automation templates",
    ],
    cta: "Explore AstralisOps",
    ctaHref: "/products/astralisops",
    secondaryCta: "Book a Demo",
    secondaryCtaHref: "/contact?intent=demo",
  },

  // 6. Trust Indicators (Optional)
  trust: {
    title: "Trusted by Growing Organizations",
    subtitle: "From SMBs to mid-market enterprises, teams rely on Astralis to scale operations.",
    // Logo data would go here if needed
  },

  // 7. CTA Footer Section
  ctaFooter: {
    headline: "Ready to Optimize Your Operations?",
    description: "Discover how Astralis automation systems can streamline your workflows, reduce manual effort, and scale your team's productivity. Schedule a consultation or explore our solutions.",
    primaryCta: "Get Started",
    primaryCtaHref: "/contact",
    secondaryCta: "View Pricing",
    secondaryCtaHref: "/automation-services#pricing",
  },

  // Additional sections for enhanced homepage
  processSteps: [
    {
      title: "Discovery & Analysis",
      description: "We analyze your workflows to identify automation opportunities and efficiency gains.",
    },
    {
      title: "Design & Build",
      description: "Our team designs and implements custom automation solutions tailored to your needs.",
    },
    {
      title: "Deploy & Integrate",
      description: "Seamless integration with your existing systems and deployment to production.",
    },
    {
      title: "Monitor & Optimize",
      description: "Continuous monitoring and optimization to ensure peak performance and ROI.",
    },
  ],

  quickStats: [
    {
      value: "80%",
      label: "Manual Work Reduced",
    },
    {
      value: "3 weeks",
      label: "Average Deployment",
    },
    {
      value: "99.9%",
      label: "Uptime Guaranteed",
    },
  ],

  // Case Study
  caseStudy: {
    company: "TechCorp Manufacturing",
    title: "Boosting Manufacturing Output by 43% with Predictive Maintenance AI",
    description: "Learn how TechCorp reduced downtime by 80% and increased production efficiency using our AI-powered automation platform.",
    metric: "43%",
    metricLabel: "Output Increase",
    ctaText: "Read Story",
    ctaHref: "/blog/techcorp-case-study",
  },

  // AI Workflow Services
  services: {
    title: "AI Workflow Services",
    subtitle: "Transform your operations with intelligent automation",
    featured: {
      title: "AI-Driven Sales Automation",
      roi: "278%",
      description: "Eliminate manual lead qualification, automate follow-ups, and accelerate your sales pipeline with intelligent AI agents.",
      features: [
        "Automated lead capture and qualification",
        "Intelligent email sequences and follow-ups",
        "CRM integration and data enrichment",
        "Real-time pipeline analytics and reporting"
      ],
      pricing: {
        step: "STEP 1/4",
        amount: "$8,800"
      },
      timeEstimate: "2-3 weeks",
      ctaText: "Explore Full Solution",
      ctaHref: "/solutions#ai-automation"
    }
  },

  // CTA Section for Ready to Transform
  transformCta: {
    headline: "Ready to Transform Your Business?",
    description: "Join 500+ businesses already benefiting from AI-powered automation. Start your journey today.",
    primaryCta: "Get Started Now",
    primaryCtaHref: "/contact?intent=start",
    secondaryCta: "Schedule a Demo",
    secondaryCtaHref: "/contact?intent=demo",
  },
} as const;

// Type exports for TypeScript consumers
export type HomepageContent = typeof homepageContent;
export type Capability = typeof homepageContent.capabilities[number];
export type Pillar = typeof homepageContent.pillars[number];

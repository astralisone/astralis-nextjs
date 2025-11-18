/**
 * Homepage Content Data
 * Following Astralis One Master Project Specification v1.0
 * Brand Voice: Corporate, clear, confident - measurable impact over hype
 */

export const homepageContent = {
  // 1. Hero Section
  hero: {
    headline: "Streamline Operations. Scale with AI. Standardize Excellence.",
    subheadline: "Enterprise-grade automation and SaaS solutions that optimize your workflows, eliminate bottlenecks, and deliver measurable results.",
    primaryCta: "Explore AstralisOps",
    secondaryCta: "View Solutions",
    primaryCtaHref: "/products/astralisops",
    secondaryCtaHref: "/solutions",
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
} as const;

// Type exports for TypeScript consumers
export type HomepageContent = typeof homepageContent;
export type Capability = typeof homepageContent.capabilities[number];
export type Pillar = typeof homepageContent.pillars[number];

/**
 * Solutions Page Content Data
 * Following Astralis One Master Project Specification v1.0 - Section 4.2
 * Brand Voice: Corporate, clear, confident - measurable impact over hype
 */

import {
  Bot,
  FileSearch,
  Server,
  Code2,
  Zap,
  Brain,
  Database,
  Workflow,
  LucideIcon,
} from 'lucide-react';
import type { Feature } from '@/components/sections';

/**
 * Solution Category Interface
 * Each solution represents a major service offering
 */
export interface SolutionCategory {
  id: string;
  headline: string;
  description: string;
  features: Feature[];
}

/**
 * Hero Section Content
 */
export const heroContent = {
  headline: 'Solutions that Scale',
  subheadline: 'Enterprise Automation',
  description:
    'Comprehensive AI-driven systems that streamline operations, optimize workflows, and deliver measurable outcomes. From document intelligence to platform engineering, our solutions adapt to your business requirements.',
  primaryButton: {
    text: 'Explore AstralisOps',
    href: '/products/astralisops',
  },
  secondaryButton: {
    text: 'Schedule Consultation',
    href: '/contact?intent=consultation',
  },
} as const;

/**
 * Auto-Pilot for Repetitive Tasks
 * Let AI handle the boring work automatically
 */
export const aiAutomationSystems: SolutionCategory = {
  id: 'ai-automation',
  headline: 'Auto-Pilot for Repetitive Tasks',
  description:
    'Stop wasting time on repetitive work. Our AI handles the boring tasks automatically - sorting requests, scheduling appointments, and following up with clients. Just like cruise control for your business, reducing manual work by up to 80%.',
  features: [
    {
      title: 'Smart Request Sorting',
      description:
        'Emails, forms, and messages get automatically sorted and sent to the right person on your team. No more manually reading every request to figure out who should handle it.',
      icon: Zap,
    },
    {
      title: 'Connect Everything Together',
      description:
        'Your email, calendar, and client database work together automatically. When one thing happens, it triggers the next step - no more copying information between different tools.',
      icon: Workflow,
    },
    {
      title: '24/7 AI Assistants',
      description:
        'AI helpers that schedule appointments, send follow-ups, and collect information from clients - even while you sleep. They work around the clock so you don\'t have to.',
      icon: Bot,
    },
  ],
};

/**
 * Smart Document Sorting
 * Automatically organize and extract information from paperwork
 */
export const documentIntelligence: SolutionCategory = {
  id: 'document-intelligence',
  headline: 'Smart Document Sorting',
  description:
    'Stop manually typing information from PDFs and scans. Our AI reads your documents, pulls out the important information, and files everything in the right place. No more data entry or lost paperwork.',
  features: [
    {
      title: 'Pull Data from Any Document',
      description:
        'Upload a PDF, photo, or scan and our AI automatically extracts names, dates, numbers, and other information you need. Works with contracts, invoices, forms - even handwriting - with 95%+ accuracy.',
      icon: FileSearch,
    },
    {
      title: 'Auto-Sort into Folders',
      description:
        'Documents automatically get sorted into the right folders and tagged based on what\'s inside them. Your client files, invoices, and contracts organize themselves.',
      icon: Brain,
    },
    {
      title: 'Keep Records Safe & Searchable',
      description:
        'Every document is tracked, version-controlled, and searchable. Find any file in seconds and have a complete audit trail showing who accessed what and when.',
      icon: Database,
    },
  ],
};

/**
 * Connect Your Business Tools
 * Make all your software work together seamlessly
 */
export const platformEngineering: SolutionCategory = {
  id: 'platform-engineering',
  headline: 'Connect Your Business Tools',
  description:
    'Tired of logging into 10 different systems? We connect all your business tools so information flows automatically between them. Your email, calendar, client database, and other software work as one system.',
  features: [
    {
      title: 'Make Your Tools Talk to Each Other',
      description:
        'Connect your email, calendar, client database, and billing software so they share information automatically. Add a client in one place, and they appear everywhere.',
      icon: Server,
    },
    {
      title: 'Secure Data Connections',
      description:
        'We build secure bridges between your systems so data flows safely. Your information stays protected while moving between different tools.',
      icon: Code2,
    },
    {
      title: 'Cloud Setup & Hosting',
      description:
        'We set up secure cloud hosting for your business systems. Everything runs reliably 24/7 without you needing to manage servers or worry about technical details.',
      icon: Server,
    },
  ],
};

/**
 * Custom Business Software
 * Build software designed exactly for your business
 */
export const saasDevelopment: SolutionCategory = {
  id: 'saas-development',
  headline: 'Custom Business Software',
  description:
    'Off-the-shelf software doesn\'t fit your business? We build custom web applications designed exactly for how you work. Client portals, team dashboards, booking systems - whatever your business needs.',
  features: [
    {
      title: 'Web Apps Built for You',
      description:
        'We build professional web applications custom-made for your business. Secure login, user permissions, and all the features you need - built to match how you actually work.',
      icon: Code2,
    },
    {
      title: 'Business Dashboards',
      description:
        'See all your important business metrics in one place. Real-time dashboards show your sales, appointments, projects, and team performance at a glance.',
      icon: Server,
    },
    {
      title: 'Works on Phone, Tablet & Computer',
      description:
        'Your custom software works perfectly on any device. Access your business tools from your phone while meeting clients or from your computer in the office.',
      icon: Database,
    },
  ],
};

/**
 * CTA Section Content
 */
export const ctaContent = {
  headline: 'Ready to Transform Your Operations?',
  description:
    'Schedule a consultation to discuss your automation requirements. Our team will design a solution roadmap tailored to your business objectives and technical environment.',
  primaryButton: {
    text: 'Schedule Consultation',
    href: '/contact?intent=consultation',
  },
  secondaryButton: {
    text: 'View Pricing',
    href: '/automation-services#pricing',
  },
} as const;

/**
 * All Solutions (for iteration or filtering)
 */
export const allSolutions: SolutionCategory[] = [
  aiAutomationSystems,
  documentIntelligence,
  platformEngineering,
  saasDevelopment,
];

// Type exports for TypeScript consumers
export type SolutionsContent = {
  hero: typeof heroContent;
  solutions: typeof allSolutions;
  cta: typeof ctaContent;
};

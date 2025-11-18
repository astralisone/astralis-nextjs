/**
 * Hero Component - Usage Examples (Updated for Dark Theme)
 *
 * This file demonstrates various configurations of the Hero component
 * following the Astralis brand specification (Section 3.3)
 *
 * Updated to showcase dark theme optimization per requirements
 */

import Image from 'next/image';
import { Hero } from './hero';

/* ========================================
   EXAMPLE 1: Dark Hero (Default)
   Optimized for Astralis Navy background
   ======================================== */
export function DarkHeroExample() {
  return (
    <Hero
      variant="dark"
      headline="Streamline Your Operations with AI"
      subheadline="AstralisOps Platform"
      description="Automate workflows, optimize processes, and scale your business with enterprise-grade AI operations."
      primaryButton={{
        text: 'Get Started',
        href: '/signup',
      }}
      secondaryButton={{
        text: 'Learn More',
        href: '/solutions',
      }}
    />
  );
}

/* ========================================
   EXAMPLE 2: Dark Hero with Image
   ======================================== */
export function DarkHeroWithImageExample() {
  return (
    <Hero
      variant="dark"
      headline="Build Faster with Enterprise Automation"
      subheadline="Astralis Marketplace"
      description="Pre-built toolkits, component libraries, and automation blueprints ready for deployment."
      primaryButton={{
        text: 'Browse Marketplace',
        href: '/marketplace',
      }}
      secondaryButton={{
        text: 'View Demos',
        href: '/demos',
      }}
      rightContent={
        <div className="relative w-full h-[400px] lg:h-[500px] rounded-lg overflow-hidden shadow-card">
          <Image
            src="/images/hero-dashboard.png"
            alt="AstralisOps Dashboard"
            fill
            className="object-cover"
            priority
          />
        </div>
      }
    />
  );
}

/* ========================================
   EXAMPLE 3: Dark Hero with Feature Cards
   Glass-morphism cards on dark background
   ======================================== */
export function DarkHeroWithCardsExample() {
  return (
    <Hero
      variant="dark"
      headline="AI-Powered Operations Console"
      subheadline="AstralisOps"
      description="Unified platform for intake routing, scheduling, document processing, and workflow automation."
      primaryButton={{
        text: 'Start Free Trial',
        href: '/trial',
      }}
      secondaryButton={{
        text: 'Schedule Demo',
        href: '/demo',
      }}
      rightContent={
        <div className="space-y-4">
          {/* Feature Card 1 - Glass effect for dark bg */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 shadow-card hover:shadow-card-hover transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-astralis-blue/20 rounded-md flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-astralis-blue"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-100 mb-2">
                  AI Intake Routing
                </h4>
                <p className="text-sm text-slate-300">
                  Intelligent request classification and automatic routing to the right team.
                </p>
              </div>
            </div>
          </div>

          {/* Feature Card 2 */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 shadow-card hover:shadow-card-hover transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-astralis-blue/20 rounded-md flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-astralis-blue"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-100 mb-2">
                  Smart Scheduling
                </h4>
                <p className="text-sm text-slate-300">
                  Automated calendar management with context-aware booking.
                </p>
              </div>
            </div>
          </div>

          {/* Feature Card 3 */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 shadow-card hover:shadow-card-hover transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-astralis-blue/20 rounded-md flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-6 h-6 text-astralis-blue"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-100 mb-2">
                  Document Intelligence
                </h4>
                <p className="text-sm text-slate-300">
                  Extract, classify, and process documents with AI precision.
                </p>
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
}

/* ========================================
   EXAMPLE 4: Light Hero (White background)
   For pages that need light theme
   ======================================== */
export function LightHeroExample() {
  return (
    <Hero
      variant="light"
      headline="Enterprise Automation Services"
      subheadline="Custom Solutions"
      description="From intake automation to full platform deployment, we deliver production-ready systems tailored to your business."
      primaryButton={{
        text: 'View Services',
        href: '/services',
      }}
      secondaryButton={{
        text: 'Contact Us',
        href: '/contact',
      }}
    />
  );
}

/* ========================================
   EXAMPLE 5: Centered Dark Hero
   ======================================== */
export function CenteredDarkHeroExample() {
  return (
    <Hero
      variant="dark"
      headline="Deploy AI Workflows in Minutes"
      description="Pre-configured n8n workflows, automation blueprints, and integration templates ready for your stack."
      primaryButton={{
        text: 'Browse Templates',
        href: '/templates',
      }}
      textAlign="center"
      textColumnWidth="full"
    />
  );
}

/* ========================================
   EXAMPLE 6: Two-Thirds Layout with Stats
   ======================================== */
export function TwoThirdsLayoutDarkExample() {
  return (
    <Hero
      variant="dark"
      headline="Deploy AI Workflows in Minutes"
      description="Pre-configured n8n workflows, automation blueprints, and integration templates ready for your stack."
      primaryButton={{
        text: 'Browse Templates',
        href: '/templates',
      }}
      textColumnWidth="two-thirds"
      rightContent={
        <div className="bg-gradient-to-br from-astralis-blue to-astralis-blue/80 rounded-lg p-8 text-white">
          <div className="space-y-6">
            <div>
              <p className="text-4xl font-semibold">500+</p>
              <p className="text-base opacity-90 mt-2">Ready-to-use automation templates</p>
            </div>
            <div className="border-t border-white/20 pt-6">
              <p className="text-4xl font-semibold">98%</p>
              <p className="text-base opacity-90 mt-2">Customer satisfaction rate</p>
            </div>
          </div>
        </div>
      }
    />
  );
}

/* ========================================
   EXAMPLE 7: Minimal Dark Hero (Single CTA)
   ======================================== */
export function MinimalDarkHeroExample() {
  return (
    <Hero
      variant="dark"
      headline="Simplify Complex Operations"
      description="One platform for all your automation needs."
      primaryButton={{
        text: 'Get Started Free',
        href: '/signup',
      }}
    />
  );
}

/* ========================================
   EXAMPLE 8: Dark Hero with Form
   ======================================== */
export function DarkHeroWithFormExample() {
  return (
    <Hero
      variant="dark"
      headline="Start Your Free Trial"
      subheadline="No Credit Card Required"
      description="Join hundreds of companies automating their operations with AstralisOps."
      rightContent={
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8 shadow-card">
          <form className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-100 mb-2"
              >
                Work Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-astralis-blue"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label
                htmlFor="company"
                className="block text-sm font-medium text-slate-100 mb-2"
              >
                Company Name
              </label>
              <input
                type="text"
                id="company"
                className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-astralis-blue"
                placeholder="Acme Inc."
              />
            </div>
            <button
              type="submit"
              className="w-full bg-astralis-blue text-white font-medium py-3 px-4 rounded-md hover:bg-[#245a92] transition-colors duration-150"
            >
              Start Free Trial
            </button>
            <p className="text-xs text-slate-400 text-center">
              14-day trial. No credit card required.
            </p>
          </form>
        </div>
      }
    />
  );
}

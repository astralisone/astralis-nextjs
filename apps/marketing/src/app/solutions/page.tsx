import Link from 'next/link';
import type { Metadata } from 'next';
import {
  heroContent,
  aiAutomationSystems,
  documentIntelligence,
  platformEngineering,
  saasDevelopment,
  ctaContent,
  type SolutionCategory,
  type Feature,
} from '@/data/solutions-content';

/**
 * Solutions Page - Astralis One Master Specification v1.0
 * Section 4.2: Solutions Page
 *
 * Structure:
 * 1. Hero Section - "Solutions that Scale"
 * 2. AI Automation Systems
 * 3. Document Intelligence
 * 4. Platform Engineering
 * 5. SaaS Development
 * 6. CTA Section
 *
 * Brand Voice: Corporate, clear, confident
 * Focus: Measurable outcomes, scalability, optimization
 */

export const metadata: Metadata = {
  title: 'Solutions | Astralis',
  description:
    'Enterprise AI automation, document intelligence, platform engineering, and SaaS development solutions. Streamline operations and scale with Astralis.',
  keywords: [
    'AI automation',
    'document intelligence',
    'platform engineering',
    'SaaS development',
    'workflow automation',
    'enterprise solutions',
  ],
};

/**
 * Navigation Bar Component
 */
function Navigation() {
  return (
    <nav className="bg-white border-b py-4 px-6">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-astralis-navy">
          Astralis One
        </Link>
        <div className="flex gap-6">
          <Link href="/services" className="text-gray-600 hover:text-astralis-blue">
            Services
          </Link>
          <Link href="/solutions" className="text-gray-600 hover:text-astralis-blue font-semibold">
            Solutions
          </Link>
          <Link href="/pricing" className="text-gray-600 hover:text-astralis-blue">
            Pricing
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-astralis-blue">
            About
          </Link>
          <Link href="/contact" className="text-gray-600 hover:text-astralis-blue">
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
}

/**
 * Hero Section Component
 */
function HeroSection() {
  return (
    <section className="bg-astralis-navy text-white py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-sm font-semibold text-astralis-blue mb-2 uppercase tracking-wide">
              {heroContent.subheadline}
            </div>
            <h1 className="text-5xl font-bold mb-6">
              {heroContent.headline}
            </h1>
            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              {heroContent.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href={heroContent.primaryButton.href}
                className="bg-astralis-blue hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-block"
              >
                {heroContent.primaryButton.text}
              </Link>
              <Link
                href={heroContent.secondaryButton.href}
                className="bg-transparent border-2 border-white hover:bg-white hover:text-astralis-navy text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-block"
              >
                {heroContent.secondaryButton.text}
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 shadow-2xl flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-6xl font-bold text-astralis-blue mb-4">2,847</div>
                <div className="text-sm text-gray-400 uppercase tracking-wide">Active Automations</div>
                <div className="mt-6 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs text-gray-500">Live System Status</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Feature Card Component
 */
interface FeatureCardProps {
  feature: Feature;
  variant?: 'light' | 'dark';
}

function FeatureCard({ feature, variant = 'light' }: FeatureCardProps) {
  const isDark = variant === 'dark';

  return (
    <div className={`p-6 rounded-lg border ${
      isDark
        ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'
        : 'bg-white border-slate-200 hover:shadow-md'
    } transition-all`}>
      <h3 className={`text-xl font-semibold mb-3 ${
        isDark ? 'text-white' : 'text-astralis-navy'
      }`}>
        {feature.title}
      </h3>
      <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
        {feature.description}
      </p>
    </div>
  );
}

/**
 * Solution Section Component
 */
interface SolutionSectionProps {
  solution: SolutionCategory;
  variant: 'light' | 'dark';
}

function SolutionSection({ solution, variant }: SolutionSectionProps) {
  const isDark = variant === 'dark';

  return (
    <section className={`py-20 px-6 ${
      isDark
        ? 'bg-gradient-to-b from-slate-900 to-slate-800'
        : 'bg-white'
    }`}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className={`text-4xl font-bold mb-4 ${
            isDark ? 'text-white' : 'text-astralis-navy'
          }`}>
            {solution.headline}
          </h2>
          <p className={`text-lg max-w-3xl mx-auto ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {solution.description}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {solution.features.map((feature) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              variant={variant}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * CTA Section Component
 */
function CTASection() {
  return (
    <section className="bg-astralis-navy text-white py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6">
          {ctaContent.headline}
        </h2>
        <p className="text-lg text-gray-300 mb-8">
          {ctaContent.description}
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href={ctaContent.primaryButton.href}
            className="bg-astralis-blue hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-block"
          >
            {ctaContent.primaryButton.text}
          </Link>
          <Link
            href={ctaContent.secondaryButton.href}
            className="bg-transparent border-2 border-white hover:bg-white hover:text-astralis-navy text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-block"
          >
            {ctaContent.secondaryButton.text}
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * Footer Component
 */
function Footer() {
  return (
    <footer className="bg-astralis-navy text-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Astralis One</h3>
            <p className="text-gray-400 text-sm">
              Enterprise AI operations platform.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/services">Services</Link></li>
              <li><Link href="/solutions">Solutions</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="https://app.astralisone.com/auth/signin">Sign In</a></li>
              <li><a href="https://app.astralisone.com/auth/signup">Sign Up</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          © 2024 Astralis One. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

/**
 * Main Solutions Page
 */
export default function SolutionsPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />

      {/* Alternating light/dark sections */}
      <SolutionSection solution={aiAutomationSystems} variant="light" />
      <SolutionSection solution={documentIntelligence} variant="dark" />
      <SolutionSection solution={platformEngineering} variant="light" />
      <SolutionSection solution={saasDevelopment} variant="dark" />

      <CTASection />
      <Footer />
    </main>
  );
}

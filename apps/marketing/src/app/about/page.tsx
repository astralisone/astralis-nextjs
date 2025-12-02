/**
 * About Page - Astralis Specification Section 4.6
 *
 * Structure:
 * 1. Hero Section - About headline with dark navy background
 * 2. Mission Statement - Core purpose and vision
 * 3. Experience/Credibility - Stats and timeline
 * 4. Approach - Methodology and process
 * 5. Leadership (optional) - Team introduction
 * 6. CTA Section - Final call to action
 *
 * Design:
 * - Light theme with white backgrounds for content sections
 * - Dark navy hero section
 * - Astralis Blue accents
 * - Corporate, clear, confident voice
 * - Focus on measurable impact over hype
 */

import Link from 'next/link';
import { CheckCircle2, TrendingUp, Users, Zap } from 'lucide-react';

/**
 * Hero Section Component
 * Dark navy background with dual-column layout
 */
function Hero() {
  return (
    <section className="w-full px-6 py-16 md:py-20 lg:py-24 bg-gradient-to-br from-astralis-navy to-slate-900">
      <div className="mx-auto max-w-[1280px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-6 text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              We Build Systems That Scale Your Success
            </h1>
            <p className="text-lg md:text-xl text-slate-200 leading-relaxed">
              Astralis specializes in intelligent automation and process optimization. We transform complex operations into efficient, scalable systems that deliver measurable results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-astralis-blue hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                Get Started
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors duration-200 border border-white/20"
              >
                View Our Process
              </Link>
            </div>
          </div>

          {/* Right Column - Visual Placeholder */}
          <div className="relative w-full aspect-square max-w-md mx-auto lg:max-w-none">
            <div className="absolute inset-0 bg-gradient-to-br from-astralis-blue/20 to-transparent rounded-2xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full bg-gradient-to-br from-astralis-blue/10 to-slate-700/10 rounded-2xl border border-white/10 flex items-center justify-center">
                <div className="text-white/40 text-center">
                  <Zap className="w-24 h-24 mx-auto mb-4" />
                  <p className="text-sm">AI-Powered Automation Hub</p>
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
 * CTA Section Component
 * Dark navy background with centered call-to-action
 */
function CTASection() {
  return (
    <section className="w-full px-6 py-20 md:py-24 lg:py-32 bg-gradient-to-br from-astralis-navy to-slate-900">
      <div className="mx-auto max-w-[1280px]">
        <div className="text-center space-y-8">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
            Ready to Transform Your Operations?
          </h2>
          <p className="text-lg md:text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed">
            Let&apos;s discuss how intelligent automation can unlock efficiency and drive growth for your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-astralis-blue hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl text-lg"
            >
              Schedule a Consultation
            </Link>
            <Link
              href="/solutions"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors duration-200 border border-white/20 text-lg"
            >
              View Solutions
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Navigation Bar */}
      <nav className="bg-white border-b py-4 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-astralis-navy">
            Astralis One
          </Link>
          <div className="flex gap-6">
            <Link href="/services" className="text-gray-600 hover:text-astralis-blue">
              Services
            </Link>
            <Link href="/solutions" className="text-gray-600 hover:text-astralis-blue">
              Solutions
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-astralis-blue">
              Pricing
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-astralis-blue font-semibold">
              About
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-astralis-blue">
              Contact
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Dark Navy Background */}
      <Hero />

      {/* Mission Statement Section */}
      <section className="w-full px-6 py-20 md:px-12 md:py-24 lg:px-20 lg:py-32 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
        {/* Subtle geometric pattern background */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgb(43,108,176)_1px,_transparent_0)] bg-[size:40px_40px]" />
        </div>
        <div className="mx-auto max-w-[1280px] relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6 md:space-y-8">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-astralis-navy tracking-tight">
              Our Mission
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-slate-700 leading-relaxed">
              We exist to eliminate operational friction and unlock growth through intelligent
              automation. Every business has untapped potential hidden in manual processes,
              disconnected systems, and repetitive workflows.
            </p>
            <p className="text-lg md:text-xl text-slate-700 leading-relaxed">
              Our mission is to transform those inefficiencies into competitive advantages,
              delivering automation solutions that are reliable, scalable, and built to evolve
              with your business.
            </p>
          </div>

          {/* Value Propositions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mt-16">
            {/* Value Prop 1 */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br from-astralis-blue to-blue-600 shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-astralis-navy">
                Rapid Implementation
              </h3>
              <p className="text-base text-slate-600 leading-relaxed">
                Deploy production-ready automation in weeks, not months.
              </p>
            </div>

            {/* Value Prop 2 */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br from-astralis-blue to-blue-600 shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-astralis-navy">
                Measurable Impact
              </h3>
              <p className="text-base text-slate-600 leading-relaxed">
                Track ROI with clear metrics: time saved, costs reduced, errors eliminated.
              </p>
            </div>

            {/* Value Prop 3 */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br from-astralis-blue to-blue-600 shadow-lg">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-astralis-navy">
                Built to Scale
              </h3>
              <p className="text-base text-slate-600 leading-relaxed">
                Systems designed to grow with your business, not constrain it.
              </p>
            </div>

            {/* Value Prop 4 */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br from-astralis-blue to-blue-600 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-astralis-navy">
                Expert Partnership
              </h3>
              <p className="text-base text-slate-600 leading-relaxed">
                Dedicated support from automation specialists who understand your business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Experience/Credibility Section */}
      <section className="w-full px-6 py-20 md:px-12 md:py-24 lg:px-20 lg:py-32 bg-slate-50 relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,_rgb(43,108,176)_1px,_transparent_1px),_linear-gradient(to_bottom,_rgb(43,108,176)_1px,_transparent_1px)] bg-[size:60px_60px]" />
        </div>
        <div className="mx-auto max-w-[1280px] relative z-10">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-astralis-navy tracking-tight">
              Proven Experience, Measurable Results
            </h2>
            <p className="text-base md:text-lg text-slate-700 max-w-3xl mx-auto leading-relaxed">
              We&apos;ve helped businesses across industries transform their operations with
              automation that delivers real, quantifiable impact.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16">
            {/* Stat 1 */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 md:p-8 text-center shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
              <div className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-astralis-blue to-blue-600 bg-clip-text text-transparent mb-3">
                85%
              </div>
              <div className="text-slate-700 font-medium">
                Average time saved on manual processes
              </div>
            </div>

            {/* Stat 2 */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 md:p-8 text-center shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
              <div className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-astralis-blue to-blue-600 bg-clip-text text-transparent mb-3">
                3-6mo
              </div>
              <div className="text-base text-slate-700 font-medium">
                Typical ROI timeframe for automation projects
              </div>
            </div>

            {/* Stat 3 */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 md:p-8 text-center shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
              <div className="text-5xl md:text-6xl font-bold bg-gradient-to-br from-astralis-blue to-blue-600 bg-clip-text text-transparent mb-3">
                99.9%
              </div>
              <div className="text-slate-700 font-medium">
                System uptime and reliability across deployments
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 md:p-10 lg:p-12 shadow-md">
            <h3 className="text-2xl md:text-3xl font-semibold text-astralis-navy mb-10 text-center tracking-tight">
              Why Organizations Trust Astralis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
              {/* Trust Indicator 1 */}
              <div className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-astralis-blue flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-semibold text-astralis-navy mb-2">
                    Enterprise-Grade Security
                  </h4>
                  <p className="text-slate-600">
                    SOC 2 compliant infrastructure with end-to-end encryption and comprehensive
                    audit trails.
                  </p>
                </div>
              </div>

              {/* Trust Indicator 2 */}
              <div className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-astralis-blue flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-semibold text-astralis-navy mb-2">
                    Transparent Methodology
                  </h4>
                  <p className="text-slate-600">
                    Clear roadmaps, milestone-based delivery, and real-time progress tracking at
                    every stage.
                  </p>
                </div>
              </div>

              {/* Trust Indicator 3 */}
              <div className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-astralis-blue flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-semibold text-astralis-navy mb-2">
                    Future-Proof Architecture
                  </h4>
                  <p className="text-slate-600">
                    Systems built with modern, maintainable technology stacks that adapt to
                    changing requirements.
                  </p>
                </div>
              </div>

              {/* Trust Indicator 4 */}
              <div className="flex gap-4">
                <CheckCircle2 className="w-6 h-6 text-astralis-blue flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-semibold text-astralis-navy mb-2">
                    Ongoing Support
                  </h4>
                  <p className="text-slate-600">
                    Dedicated technical support, proactive monitoring, and continuous optimization
                    post-deployment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Approach Section */}
      <section className="w-full px-6 py-20 md:px-12 md:py-24 lg:px-20 lg:py-32 bg-white relative overflow-hidden">
        {/* Subtle diagonal lines pattern */}
        <div className="absolute inset-0 opacity-[0.015]">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,_rgb(43,108,176)_0,_rgb(43,108,176)_1px,_transparent_0,_transparent_50%)] bg-[size:20px_20px]" />
        </div>
        <div className="mx-auto max-w-[1280px] relative z-10">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-astralis-navy tracking-tight">
              Our Approach to Automation
            </h2>
            <p className="text-base md:text-lg text-slate-700 max-w-3xl mx-auto leading-relaxed">
              We follow a proven methodology that balances speed with quality, delivering
              automation solutions that work reliably from day one.
            </p>
          </div>

          {/* Methodology Steps */}
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 md:p-8 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-astralis-blue to-blue-600 text-white font-bold text-xl shadow-lg">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-semibold text-astralis-navy mb-3">
                  Discovery & Analysis
                </h3>
                <p className="text-base md:text-lg text-slate-700 leading-relaxed">
                  We start by mapping your current processes, identifying bottlenecks, and
                  quantifying improvement opportunities. Every recommendation is backed by data,
                  not assumptions.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 md:p-8 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-astralis-blue to-blue-600 text-white font-bold text-xl shadow-lg">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-semibold text-astralis-navy mb-3">
                  Strategic Design
                </h3>
                <p className="text-base md:text-lg text-slate-700 leading-relaxed">
                  We architect solutions that align with your business goals, technical
                  infrastructure, and growth trajectory. The result: automation that scales with
                  you.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 md:p-8 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-astralis-blue to-blue-600 text-white font-bold text-xl shadow-lg">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-semibold text-astralis-navy mb-3">
                  Agile Implementation
                </h3>
                <p className="text-base md:text-lg text-slate-700 leading-relaxed">
                  We build and deploy in iterative sprints, delivering value incrementally. You see
                  progress weekly, with working functionality at each milestone.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 md:p-8 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-astralis-blue to-blue-600 text-white font-bold text-xl shadow-lg">
                  4
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-semibold text-astralis-navy mb-3">
                  Testing & Validation
                </h3>
                <p className="text-base md:text-lg text-slate-700 leading-relaxed">
                  Rigorous QA ensures reliability before launch. We test edge cases, simulate load,
                  and validate against your success criteria.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 md:p-8 shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-astralis-blue to-blue-600 text-white font-bold text-xl shadow-lg">
                  5
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-semibold text-astralis-navy mb-3">
                  Deployment & Optimization
                </h3>
                <p className="text-base md:text-lg text-slate-700 leading-relaxed">
                  We launch with comprehensive monitoring, provide training for your team, and
                  continuously optimize based on real-world performance data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section className="w-full px-6 py-20 md:px-12 md:py-24 lg:px-20 lg:py-32 bg-slate-50">
        <div className="mx-auto max-w-[1280px]">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-astralis-navy tracking-tight">
              Led by Automation Experts
            </h2>
            <p className="text-base md:text-lg text-slate-700 max-w-3xl mx-auto leading-relaxed">
              Our team combines deep technical expertise with real-world business experience,
              ensuring every solution is both technically sound and strategically aligned.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6 md:p-10 lg:p-12 shadow-md">
            <div className="space-y-6">
              <p className="text-base md:text-lg text-slate-700 leading-relaxed">
                Astralis was founded by engineers and strategists who&apos;ve spent years building
                automation systems for Fortune 500 companies, high-growth startups, and
                everything in between.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                We&apos;ve seen what works—and what doesn&apos;t—when it comes to scaling operations
                through automation. That experience informs every project we take on, from
                initial discovery to post-deployment optimization.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                Our commitment is simple: deliver automation solutions that create measurable
                value for your business, backed by transparent communication and expert execution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <footer className="bg-astralis-navy text-white py-12 px-6 mt-20">
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
            &copy; 2024 Astralis One. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}

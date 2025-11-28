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

import Image from 'next/image';
import { Hero } from '@/components/sections/hero';
import { CTASection } from '@/components/sections/cta-section';
import { CheckCircle2, TrendingUp, Users, Zap } from 'lucide-react';

/**
 * Hero Visual Component - Technology Abstract
 * Displays a tech-themed hero image for the About page
 */
function HeroVisual() {
  return (
    <div className="relative w-full aspect-[4/3] max-w-lg mx-auto lg:max-w-none">
      <div className="absolute inset-0 bg-gradient-to-br from-astralis-blue/20 to-transparent rounded-2xl z-10" />
      <Image
        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80"
        alt="Global digital network visualization representing intelligent automation"
        fill
        className="object-cover rounded-2xl"
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 500px"
        priority
      />
      {/* Stats Badge */}
      <div className="absolute -bottom-3 left-4 md:left-6 bg-white border border-slate-200 rounded-lg px-4 py-2 shadow-lg z-20">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-astralis-blue" />
          <span className="text-sm font-medium text-astralis-navy">85% Time Saved</span>
        </div>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section - Dark Navy Background */}
      <Hero
        headline="We Build Systems That Scale Your Success"
        description="Astralis specializes in intelligent automation and process optimization. We transform complex operations into efficient, scalable systems that deliver measurable results."
        variant="dark"
        textAlign="left"
        textColumnWidth="half"
        primaryButton={{
          text: 'Get Started',
          href: '/contact',
        }}
        secondaryButton={{
          text: 'View Our Process',
          href: '/process',
        }}
        rightContent={<HeroVisual />}
      />

      {/* Mission Statement Section */}
      <section className="w-full px-6 py-20 md:px-12 md:py-24 lg:px-20 lg:py-32 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
        {/* Subtle Tech Pattern Background */}
        <div className="absolute inset-0 opacity-[0.03]">
          <Image
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=60"
            alt="Digital technology pattern"
            fill
            className="object-cover"
            loading="lazy"
            sizes="100vw"
          />
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
        {/* Subtle Tech Grid Background */}
        <div className="absolute inset-0 opacity-[0.02]">
          <Image
            src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&q=60"
            alt="Technology infrastructure"
            fill
            className="object-cover"
            loading="lazy"
            sizes="100vw"
          />
        </div>
        <div className="mx-auto max-w-[1280px] relative z-10">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-astralis-navy tracking-tight">
              Proven Experience, Measurable Results
            </h2>
            <p className="text-base md:text-lg text-slate-700 max-w-3xl mx-auto leading-relaxed">
              We've helped businesses across industries transform their operations with
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
        {/* Tech circuit pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <Image
            src="https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=1920&q=60"
            alt="Circuit board pattern"
            fill
            className="object-cover"
            loading="lazy"
            sizes="100vw"
          />
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

      {/* Leadership Section (Optional) */}
      <section className="w-full px-6 py-20 md:px-12 md:py-24 lg:px-20 lg:py-32 bg-slate-50 relative overflow-hidden">
        {/* Team collaboration background */}
        <div className="absolute inset-0 opacity-[0.03]">
          <Image
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=60"
            alt="Team collaboration"
            fill
            className="object-cover"
            loading="lazy"
            sizes="100vw"
          />
        </div>
        <div className="mx-auto max-w-[1280px] relative z-10">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-astralis-navy tracking-tight">
              Led by Automation Experts
            </h2>
            <p className="text-base md:text-lg text-slate-700 max-w-3xl mx-auto leading-relaxed">
              Our team combines deep technical expertise with real-world business experience,
              ensuring every solution is both technically sound and strategically aligned.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Team Image */}
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80"
                alt="Professional team collaborating on automation solutions"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-astralis-navy/30 to-transparent" />
            </div>

            {/* Content */}
            <div className="bg-white border border-slate-200 rounded-lg p-6 md:p-10 lg:p-12 shadow-md">
              <div className="space-y-6">
                <p className="text-base md:text-lg text-slate-700 leading-relaxed">
                  Astralis was founded by engineers and strategists who've spent years building
                  automation systems for Fortune 500 companies, high-growth startups, and
                  everything in between.
                </p>
                <p className="text-lg text-slate-700 leading-relaxed">
                  We've seen what works—and what doesn't—when it comes to scaling operations
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
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        headline="Ready to Transform Your Operations?"
        description="Let's discuss how intelligent automation can unlock efficiency and drive growth for your business."
        primaryButton={{
          text: 'Schedule a Consultation',
          href: '/contact',
        }}
        secondaryButton={{
          text: 'View Case Studies',
          href: '/marketplace',
        }}
        backgroundVariant="navy"
      />
    </main>
  );
}
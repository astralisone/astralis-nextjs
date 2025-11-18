import React from 'react';
import { useRouter } from 'next/router';
import { UnifiedBookingInterface } from '../components/booking/UnifiedBookingInterface';
import { Helmet } from 'react-helmet-async';

export default function BookRevenueAuditPage() {
  const router = useRouter();

  const handleBookingComplete = (booking: any) => {
    // Redirect to success page with booking data in URL
    const bookingData = encodeURIComponent(JSON.stringify({
      booking,
      type: 'revenue-audit'
    }));
    router.push(`/booking-success?data=${bookingData}`);
  };

  return (
    <>
      <Helmet>
        <title>Book Revenue Audit - Astralis Agency</title>
        <meta 
          name="description" 
          content="Get a comprehensive revenue operations audit from Astralis Agency. Identify optimization opportunities and boost your revenue growth." 
        />
        <meta name="keywords" content="revenue audit, revenue operations, business optimization, astralis agency" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-primary-950/20">
        {/* Hero Section */}
        <div className="relative pt-24 pb-16">
          <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent" />
          
          <div className="container mx-auto px-4 relative">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full glass-card border border-primary-500/30">
                <span className="w-2 h-2 bg-primary-400 rounded-full"></span>
                <span className="text-sm text-primary-400 font-medium">
                  Limited Availability - Only 5 Audits This Month
                </span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-black mb-6">
                <span className="text-white">Get Your</span>
                <span className="gradient-text-ai block sm:inline sm:ml-4">
                  Revenue Audit
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Comprehensive analysis of your revenue operations with actionable insights 
                to optimize processes and unlock hidden growth opportunities.
              </p>
              
              <div className="flex items-center justify-center gap-8 mt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-400">60</div>
                  <div className="text-sm text-gray-400">Minutes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">FREE</div>
                  <div className="text-sm text-gray-400">No Cost</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">$10K+</div>
                  <div className="text-sm text-gray-400">Avg. Value</div>
                </div>
              </div>
            </div>

            <UnifiedBookingInterface
              defaultType="revenue-audit"
              onBookingComplete={handleBookingComplete}
              className="mb-16"
            />
          </div>
        </div>

        {/* What's Included */}
        <div className="py-16 border-t border-white/10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                What's Included in Your Revenue Audit
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                A comprehensive analysis of your revenue operations with actionable recommendations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="glass-card p-6 rounded-lg border border-white/10">
                <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Revenue Process Analysis
                </h3>
                <p className="text-gray-300 text-sm">
                  Deep dive into your current sales funnel, conversion rates, and revenue processes 
                  to identify bottlenecks and optimization opportunities.
                </p>
              </div>

              <div className="glass-card p-6 rounded-lg border border-white/10">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🔧</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Technology Stack Review
                </h3>
                <p className="text-gray-300 text-sm">
                  Evaluation of your current tools and systems to ensure they're optimized 
                  for maximum efficiency and revenue growth.
                </p>
              </div>

              <div className="glass-card p-6 rounded-lg border border-white/10">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Growth Opportunities
                </h3>
                <p className="text-gray-300 text-sm">
                  Identification of specific areas where you can increase revenue, 
                  improve margins, and accelerate business growth.
                </p>
              </div>

              <div className="glass-card p-6 rounded-lg border border-white/10">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Performance Metrics
                </h3>
                <p className="text-gray-300 text-sm">
                  Key performance indicators and benchmarks to track your progress 
                  and measure the success of implemented changes.
                </p>
              </div>

              <div className="glass-card p-6 rounded-lg border border-white/10">
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">📋</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Action Plan
                </h3>
                <p className="text-gray-300 text-sm">
                  Prioritized list of actionable recommendations with clear next steps 
                  and implementation timelines for maximum impact.
                </p>
              </div>

              <div className="glass-card p-6 rounded-lg border border-white/10">
                <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  Follow-up Support
                </h3>
                <p className="text-gray-300 text-sm">
                  Email follow-up with audit summary and options for implementation 
                  support to help you execute the recommended strategies.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="py-16 border-t border-white/10">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-8">
                Join 500+ Companies Who've Optimized Their Revenue
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text-success mb-2">
                    127%
                  </div>
                  <p className="text-gray-300">Average Revenue Increase</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text-energy mb-2">
                    45%
                  </div>
                  <p className="text-gray-300">Process Efficiency Gain</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold gradient-text-ai mb-2">
                    3.2x
                  </div>
                  <p className="text-gray-300">ROI on Implementation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
import React from 'react';
import { useRouter } from 'next/router';
import { UnifiedBookingInterface } from '@/components/booking/UnifiedBookingInterface';

export default function BookConsultationPage() {
  const router = useRouter();

  const handleBookingComplete = (booking: any) => {
    // Redirect to success page or show success state
    router.push(`/booking-success?bookingId=${booking.id}&type=consultation`);
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-primary-950/20">
        {/* Hero Section */}
        <div className="relative pt-24 pb-16">
          <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent" />
          
          <div className="container mx-auto px-4 relative">
            <div className="text-center mb-12">
              <h1 className="text-4xl lg:text-6xl font-black gradient-text-ai mb-6">
                Book Your Consultation
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Get personalized expert guidance to solve your business challenges and unlock growth opportunities.
              </p>
              
              <div className="flex items-center justify-center gap-8 mt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-400">30-60</div>
                  <div className="text-sm text-gray-400">Minutes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">Expert</div>
                  <div className="text-sm text-gray-400">Guidance</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">Custom</div>
                  <div className="text-sm text-gray-400">Solutions</div>
                </div>
              </div>
            </div>

            <UnifiedBookingInterface
              defaultType="consultation"
              onBookingComplete={handleBookingComplete}
              className="mb-16"
            />
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="py-16 border-t border-white/10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-white mb-4">
                Why Choose Astralis Agency?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center glass-card p-6 rounded-lg border border-white/10">
                <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Tailored Strategy
                </h3>
                <p className="text-gray-300 text-sm">
                  Every consultation is customized to your specific business needs and goals.
                </p>
              </div>

              <div className="text-center glass-card p-6 rounded-lg border border-white/10">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Fast Results
                </h3>
                <p className="text-gray-300 text-sm">
                  Walk away with actionable insights and a clear implementation plan.
                </p>
              </div>

              <div className="text-center glass-card p-6 rounded-lg border border-white/10">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔧</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Expert Support
                </h3>
                <p className="text-gray-300 text-sm">
                  Years of experience helping businesses like yours scale and optimize.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
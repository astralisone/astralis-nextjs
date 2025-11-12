"use client"

import { AboveFoldHero } from "@/components/sections/hero/AboveFoldHero"
import Link from "next/link"
import { Sparkles, ArrowRight, Calendar } from "lucide-react"
import { useState, useEffect } from "react"
import { ServicesSection } from "@/components/sections/services"
import { PortfolioSection } from "@/components/sections/portfolio"
import { TestimonialSlider } from "@/components/sections/testimonials/testimonial-slider"
import { CTASection } from "@/components/sections/cta"
import { FeaturedMarketplaceSection } from "@/components/sections/featured-marketplace"
import { LatestBlogSection } from "@/components/sections/latest-blog"
import { StatsSection } from "@/components/sections/stats"
import { TrustIndicatorsSection } from "@/components/sections/trust-indicators"
import { AboutSection } from "@/components/sections/about"
import { ProcessSection } from "@/components/sections/process"
import { FAQSection } from "@/components/sections/faq"
import { LeadCaptureSection } from "@/components/sections/lead-capture"

export function HomePageClient() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Hide button when scrolled past the fold (viewport height)
      const scrolled = window.scrollY;
      const viewportHeight = window.innerHeight;
      setIsVisible(scrolled < viewportHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
       {/* 🎯 HERO SECTION - Above the fold conversion-optimized entry point */}
       <section className="relative">
         <AboveFoldHero />

         {/* Enhanced floating CTA with Service Wizard focus */}
         <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 hidden lg:block">
           <Link
             href="/services/wizard"
             className="glass-card rounded-full px-8 py-4 shadow-glass animate-fade-in-up hover:glass-elevated transition-all group"
           >
             <div className="flex items-center gap-3 text-sm">
               <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-pulse shadow-purple-400/50"></div>
               <span className="text-white font-semibold">
                 🚀 Find Your Perfect AI Solution
               </span>
               <ArrowRight className="w-4 h-4 text-purple-300 group-hover:translate-x-1 transition-transform" />
             </div>
           </Link>
         </div>
       </section>

      {/* 🏆 IMMEDIATE TRUST BUILDING - Critical for first impression */}
      <section className="py-16 relative">
        <div className="absolute inset-0 mesh-gradient"></div>
        <div className="relative">
          <TrustIndicatorsSection />
        </div>
      </section>

      {/* 📊 SOCIAL PROOF AMPLIFICATION - Numbers build confidence */}
      <section className="py-20 relative">
        <div className="absolute inset-0 dots-pattern"></div>
        <div className="relative">
          <StatsSection />

           {/* Enhanced micro-conversion element with Service Wizard CTA */}
           <div className="container mx-auto px-4 mt-12">
             <div className="text-center">
               <div className="glass-card px-8 py-6 rounded-2xl shadow-glass-lg max-w-md mx-auto">
                 <div className="flex items-center justify-center gap-3 mb-4">
                   <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-primary-glow"></div>
                   <span className="text-sm font-semibold text-foreground">
                     <span className="text-primary font-bold">500+ Businesses</span> transformed this year
                   </span>
                 </div>
                 <Link
                   href="/services/wizard"
                   className="inline-flex items-center gap-2 text-sm font-medium text-purple-300 hover:text-purple-200 transition-colors group"
                 >
                   <Sparkles className="w-4 h-4" />
                   Discover your solution
                   <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                 </Link>
               </div>
             </div>
           </div>
        </div>
      </section>

      {/* 🎯 LEAD CAPTURE - Strategic conversion point after social proof */}
      <LeadCaptureSection />

       {/* 🚀 SERVICES SHOWCASE - Clear value proposition */}
       <section className="py-24 relative overflow-hidden">
         <div className="absolute inset-0 gradient-hero opacity-20"></div>
         <div className="relative">
           <ServicesSection />
         </div>
       </section>

       {/* 📊 ROI CALCULATOR - Moved down the page */}
       <section className="py-20 relative">
         <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-purple-900/5 to-neutral-900"></div>
         <div className="relative">
           <div className="container mx-auto px-4">
             <div className="text-center mb-12">
               <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                 Calculate Your
                 <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"> ROI Potential</span>
               </h2>
               <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                 See exactly how much you could save with Revenue Operations automation
               </p>
             </div>
             <div className="max-w-4xl mx-auto">
               {/* CompactROICalculator will be imported and used here */}
               <div className="glass-elevated rounded-2xl p-8 border border-purple-500/20">
                 <div className="text-center text-gray-400">
                   ROI Calculator Component
                 </div>
               </div>
             </div>
           </div>
         </div>
       </section>

      {/* 👥 ABOUT US - Build trust and credibility with glassmorphism */}
      <section className="relative">
        <div className="section-gradient-top"></div>
        <AboutSection />
        <div className="section-gradient-bottom"></div>
      </section>

      {/* 🛍️ DYNAMIC ENGAGEMENT - Marketplace for immediate action */}
      <section className="py-20 relative">
        <div className="absolute inset-0 animated-gradient opacity-20"></div>
        <div className="relative">
          <FeaturedMarketplaceSection />
        </div>
      </section>

      {/* 📈 RESULTS DEMONSTRATION - Portfolio builds confidence */}
      <section className="py-24 relative">
        <div className="absolute inset-0 mesh-gradient"></div>
        <div className="relative">
          <PortfolioSection />

           {/* Enhanced mid-page conversion nudge with Service Wizard focus */}
           <div className="container mx-auto px-4 mt-16">
             <div className="glass-elevated rounded-3xl p-10 text-center shadow-elevation-4 border border-primary/20">
               <div className="max-w-2xl mx-auto">
                 <h3 className="text-2xl font-bold text-foreground mb-4 text-balance">
                   Ready to Transform Your Business?
                 </h3>
                 <p className="text-neutral-400 mb-8 text-lg leading-relaxed">
                   Take our 60-second Service Wizard to discover your perfect AI automation solution
                 </p>
                 <div className="flex flex-col sm:flex-row gap-4 justify-center">
                   <Link
                     href="/services/wizard"
                     className="btn-primary px-8 py-4 rounded-xl text-lg font-bold shadow-elevation-3 hover:shadow-primary-glow inline-flex items-center gap-2"
                   >
                     <Sparkles className="w-5 h-5" />
                     Start Service Wizard
                     <ArrowRight className="w-4 h-4" />
                   </Link>
                   <Link
                     href="/book-consultation"
                     className="glass-card px-8 py-4 rounded-xl text-lg font-semibold hover:glass-elevated transition-all inline-flex items-center gap-2"
                   >
                     <Calendar className="w-5 h-5" />
                     Book Consultation
                   </Link>
                 </div>
               </div>
             </div>
           </div>
        </div>
      </section>

      {/* 🔄 PROCESS EXPLANATION - How we work */}
      <section className="relative">
        <div className="section-gradient-top"></div>
        <ProcessSection />
        <div className="section-gradient-bottom"></div>
      </section>

      {/* 💡 THOUGHT LEADERSHIP - Establish expertise */}
      <section className="py-20 relative">
        <div className="absolute inset-0 dots-pattern opacity-30"></div>
        <div className="relative">
          <LatestBlogSection />
        </div>
      </section>

      {/* 🗣️ SOCIAL PROOF REINFORCEMENT - Customer voices */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-30"></div>
        <div className="relative">
          <TestimonialSlider />

           {/* Enhanced trust reinforcement with Service Wizard CTA */}
           <div className="container mx-auto px-4 mt-16">
             <div className="text-center">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
                 <div className="glass-card rounded-2xl p-6 border border-primary/20 card-hover-subtle">
                   <div className="text-3xl font-bold text-primary mb-2 gradient-text">⭐</div>
                   <div className="text-sm text-neutral-400 font-medium">Excellent ratings</div>
                 </div>
                 <div className="glass-card rounded-2xl p-6 border border-secondary/20 card-hover-subtle">
                   <div className="text-3xl font-bold text-secondary mb-2">⚡</div>
                   <div className="text-sm text-neutral-400 font-medium">Fast response</div>
                 </div>
                 <div className="glass-card rounded-2xl p-6 border border-primary/20 card-hover-subtle">
                   <div className="text-3xl font-bold text-primary mb-2 gradient-text">✓</div>
                   <div className="text-sm text-neutral-400 font-medium">Quality guarantee</div>
                 </div>
               </div>

               {/* Service Wizard CTA in testimonials */}
               <div className="glass-elevated rounded-2xl p-8 max-w-2xl mx-auto border border-purple-500/20">
                 <h3 className="text-xl font-bold text-white mb-3">
                   Join 500+ Successful Businesses
                 </h3>
                 <p className="text-neutral-300 mb-6">
                   See how our AI solutions have transformed businesses just like yours
                 </p>
                 <Link
                   href="/services/wizard"
                   className="btn-primary px-6 py-3 rounded-xl text-base font-semibold inline-flex items-center gap-2"
                 >
                   <Sparkles className="w-4 h-4" />
                   Find Your Solution
                   <ArrowRight className="w-4 h-4" />
                 </Link>
               </div>
             </div>
           </div>
        </div>
      </section>

      {/* ❓ FAQ SECTION - Address objections */}
      <section className="relative">
        <div className="section-gradient-top"></div>
        <FAQSection />
        <div className="section-gradient-bottom"></div>
      </section>

      {/* 📞 FINAL CONVERSION PUSH - Multiple touchpoints */}
      <section className="py-24 relative">
        <div className="absolute inset-0 animated-gradient opacity-40"></div>
        <div className="relative">
          <CTASection />
        </div>
      </section>

      {/* 🔐 FINAL TRUST REASSURANCE - Remove last objections */}
      <section className="py-20 relative overflow-hidden bg-neutral-900">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:40px_40px]"></div>
        </div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center">
            <h3 className="text-3xl lg:text-4xl font-bold mb-4 text-white">
              Why Choose Astralis? <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Our Guarantee to You</span>
            </h3>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-16">
              We stand behind our work with industry-leading guarantees and commitments that put your success first.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              <div className="glass-elevated rounded-2xl p-8 border border-purple-500/20 hover:border-purple-400/40 transition-all group">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 border border-purple-500/30 group-hover:scale-110 transition-transform">
                    <span className="text-3xl bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">✓</span>
                  </div>
                  <div className="font-bold mb-3 text-white text-lg group-hover:text-purple-200 transition-colors">Money-Back Guarantee</div>
                  <div className="text-gray-300 text-sm font-medium">Full refund available</div>
                </div>
              </div>
              <div className="glass-elevated rounded-2xl p-8 border border-blue-500/20 hover:border-blue-400/40 transition-all group">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30 group-hover:scale-110 transition-transform">
                    <span className="text-3xl">🔒</span>
                  </div>
                  <div className="font-bold mb-3 text-white text-lg group-hover:text-blue-200 transition-colors">Data Security</div>
                  <div className="text-gray-300 text-sm font-medium">Enterprise-grade protection</div>
                </div>
              </div>
              <div className="glass-elevated rounded-2xl p-8 border border-purple-500/20 hover:border-purple-400/40 transition-all group">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 border border-purple-500/30 group-hover:scale-110 transition-transform">
                    <span className="text-3xl">⚡</span>
                  </div>
                  <div className="font-bold mb-3 text-white text-lg group-hover:text-purple-200 transition-colors">Fast Delivery</div>
                  <div className="text-gray-300 text-sm font-medium">Quick project initiation</div>
                </div>
              </div>
              <div className="glass-elevated rounded-2xl p-8 border border-blue-500/20 hover:border-blue-400/40 transition-all group">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30 group-hover:scale-110 transition-transform">
                    <span className="text-3xl">🏆</span>
                  </div>
                  <div className="font-bold mb-3 text-white text-lg group-hover:text-blue-200 transition-colors">Award-Winning Team</div>
                  <div className="text-gray-300 text-sm font-medium">Industry recognized experts</div>
                </div>
              </div>
            </div>

             {/* Enhanced final conversion reminder with Service Wizard focus */}
             <div className="mt-12 pt-8 border-t border-border/30">
               <div className="glass-elevated rounded-2xl p-8 max-w-3xl mx-auto text-center">
                 <h3 className="text-2xl font-bold text-white mb-4">
                   Ready to Transform Your Business?
                 </h3>
                 <p className="text-neutral-300 text-lg leading-relaxed text-balance mb-6">
                   Take our intelligent Service Wizard to discover your perfect AI automation solution
                 </p>
                 <div className="flex flex-col sm:flex-row gap-4 justify-center">
                   <Link
                     href="/services/wizard"
                     className="btn-primary px-8 py-4 rounded-xl text-lg font-bold shadow-elevation-3 hover:shadow-primary-glow inline-flex items-center gap-2"
                   >
                     <Sparkles className="w-5 h-5" />
                     Start Service Wizard
                     <ArrowRight className="w-4 h-4" />
                   </Link>
                   <Link
                     href="/book-consultation"
                     className="glass-card px-8 py-4 rounded-xl text-lg font-semibold hover:glass-elevated transition-all inline-flex items-center gap-2"
                   >
                     <Calendar className="w-5 h-5" />
                     Book Consultation
                   </Link>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* Floating CTA Button - Left side, hides after fold */}
      {isVisible && (
        <div className="fixed bottom-6 left-6 z-50 hidden lg:block">
          <Link
            href="/services/wizard"
            className="group inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-full shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105"
          >
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="hidden xl:inline">Service Wizard</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}
    </div>
  )
}

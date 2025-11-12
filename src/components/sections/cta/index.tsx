"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative rounded-3xl overflow-hidden glass-elevated"
      >
        {/* Enhanced dark background with gradient overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-neutral-900/95 to-blue-900/90" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(139,92,246,0.1),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        </div>
        
        <div className="relative px-6 py-24 sm:px-12 sm:py-32 lg:px-16 backdrop-blur-sm">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 glass-card border border-purple-400/30 text-white px-6 py-3 rounded-full text-sm font-medium mb-4 shadow-purple-500/20 shadow-lg">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                🚀 Limited Time Offer
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl mb-6">
              <span className="text-white">Ready to </span>
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-300 bg-clip-text text-transparent">10x Your Business Growth?</span>
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-200 mb-8 leading-relaxed">
              Join the ranks of successful businesses that have transformed their digital presence. 
              <span className="font-semibold text-purple-200"> Book your free strategy session today and get a custom growth plan worth $500 - absolutely free.</span>
            </p>
            
            {/* Enhanced value proposition */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-white">
              <div className="glass-elevated rounded-xl p-6 border border-purple-500/20 hover:border-purple-400/40 transition-all group">
                <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform">Fast</div>
                <div className="text-sm text-gray-200 font-medium">Project kickoff</div>
              </div>
              <div className="glass-elevated rounded-xl p-6 border border-blue-500/20 hover:border-blue-400/40 transition-all group">
                <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform">Secure</div>
                <div className="text-sm text-gray-200 font-medium">Money-back guarantee</div>
              </div>
              <div className="glass-elevated rounded-xl p-6 border border-purple-500/20 hover:border-purple-400/40 transition-all group">
                <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform">Always</div>
                <div className="text-sm text-gray-200 font-medium">Priority support</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-10">
              <Button 
                size="lg" 
                asChild
                className="gap-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-xl hover:shadow-purple-500/30 px-8 py-4 text-lg font-semibold rounded-xl"
              >
                <Link href="/onboarding" className="flex items-center gap-3">
                  <ArrowRight className="h-5 w-5" />
                  <span>Start Now</span>
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="gap-3 glass-card border-white/30 text-white hover:bg-white/10 hover:border-purple-400/50 px-8 py-4 text-lg font-semibold rounded-xl"
              >
                View Success Stories
              </Button>
            </div>

            {/* Enhanced urgency and social proof */}
            <div className="text-center">
              <div className="glass-card rounded-2xl p-6 border border-yellow-400/20 mb-6 inline-block">
                <p className="mb-2">
                  <span className="font-bold text-yellow-300 text-lg">⚡ Only 5 consultation spots left this month</span>
                </p>
              </div>
              <p className="text-gray-300 text-base">
                <span className="text-purple-300 font-semibold">Trusted by growing businesses</span> • 
                <span className="text-blue-300 font-semibold"> High satisfaction rate</span> • 
                <span className="text-green-300 font-semibold"> Significant client revenue generated</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Calendar, MessageCircle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export function HeroActions() {
  return (
    <div className="mt-20 space-y-12">
      {/* Urgency messaging */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <span className="inline-flex items-center gap-2 glass-card border border-red-400/30 text-white px-6 py-3 rounded-full text-sm font-medium mb-4 shadow-red-500/20 shadow-lg animate-pulse">
          <div className="w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
          🤖 Limited Time: Free Revenue Audit
          <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
            Only 5 Spots Left This Month
          </div>
        </span>
      </motion.div>

      {/* Primary CTA buttons with sophisticated styling */}
      <motion.div 
        className="flex flex-col sm:flex-row items-center justify-center gap-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <Button 
          asChild 
          size="lg" 
          className="gap-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-xl hover:shadow-purple-500/30 px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl font-bold rounded-xl hover:scale-105 transition-all duration-200 pulse-glow relative touch-manipulation min-h-[48px]"
        >
          <Link href="/book-revenue-audit" className="flex items-center gap-3">
            <Calendar className="h-6 w-6" />
            <div className="flex flex-col items-start">
              <span>Get Free Revenue Audit</span>
              <span className="text-sm bg-white/20 px-2 py-1 rounded ml-2 font-normal">Worth $500</span>
            </div>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
        
        <Button 
          asChild 
          variant="outline" 
          size="lg" 
          className="gap-3 glass-elevated border-white/30 text-white hover:bg-white/10 hover:border-purple-400/50 px-6 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-semibold rounded-xl transition-all duration-200 touch-manipulation min-h-[48px]"
        >
          <Link href="/book-consultation" className="flex items-center gap-3">
            <span>Book a Consultation</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
      </motion.div>

      {/* Secondary actions with premium glassmorphism */}
      {/* <motion.div 
        className="flex flex-col sm:flex-row items-center justify-center gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-3 glass-card px-8 py-4 rounded-xl border border-white/20 hover:border-purple-400/50 text-white hover:text-purple-200 transition-all duration-200 group"
        >
          <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />
          Watch our story (2 min)
        </Button>
        
        <div className="hidden sm:block w-px h-8 bg-white/20"></div>
        
        <Button 
          asChild 
          variant="ghost" 
          size="sm" 
          className="gap-3 glass-card px-8 py-4 rounded-xl border border-white/20 hover:border-blue-400/50 text-white hover:text-blue-200 transition-all duration-200 group"
        >
          <Link href="/contact">
            <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
            Chat with our team
          </Link>
        </Button>
      </motion.div> */}

      {/* Enhanced trust indicators with sophisticated styling */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        <div className="glass-elevated px-6 py-4 rounded-xl border border-green-500/20 hover:border-green-400/40 transition-all group">
          <div className="flex items-center gap-3 text-sm justify-center">
            <div className="w-2.5 h-2.5 bg-gradient-to-r from-green-400 to-green-300 rounded-full animate-pulse shadow-green-400/50 shadow-sm"></div>
            <span className="text-white font-medium group-hover:text-green-200 transition-colors">Save 10+ Hours/Week</span>
          </div>
        </div>
        <div className="glass-elevated px-6 py-4 rounded-xl border border-yellow-500/20 hover:border-yellow-400/40 transition-all group">
          <div className="flex items-center gap-3 text-sm justify-center">
            <div className="w-2.5 h-2.5 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full animate-pulse shadow-yellow-400/50 shadow-sm"></div>
            <span className="text-white font-medium group-hover:text-yellow-200 transition-colors">AI-Powered Automation</span>
          </div>
        </div>
        <div className="glass-elevated px-6 py-4 rounded-xl border border-blue-500/20 hover:border-blue-400/40 transition-all group">
          <div className="flex items-center gap-3 text-sm justify-center">
            <div className="w-2.5 h-2.5 bg-gradient-to-r from-blue-400 to-blue-300 rounded-full animate-pulse shadow-blue-400/50 shadow-sm"></div>
            <span className="text-white font-medium group-hover:text-blue-200 transition-colors">Start Automating Today</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
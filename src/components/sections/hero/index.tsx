"use client"

import { HeroTitle } from "./hero-title"
import { HeroImage } from "./hero-image"
import { HeroActions } from "./hero-actions"
import { motion } from "framer-motion"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center bg-gradient-to-br from-neutral-900 via-purple-900/10 to-neutral-900">
      <div className="absolute inset-0">
        <img src="/images/astralis-agency-logo.png" alt="Astralis Agency" className="absolute h-100 w-full rounded-sm shadow-sm group-hover:opacity-90 transition mx-auto blur-2xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:50px_50px]"></div>
      </div>
      {/* Sophisticated dark background with glassmorphism */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-neutral-900/95 to-blue-900/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {/* Enhanced pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(139,92,246,0.08),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(59,130,246,0.08),transparent_50%)]"></div>
        {/* Grid pattern for depth */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:60px_60px]"></div>
      </div>
      
      {/* Sophisticated floating elements for depth */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500/3 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }} />
      
      <div className="relative z-10 w-full backdrop-blur-sm">
          <img src="/images/astralis-agency-logo.png" alt="Astralis Agency" className="absolute h-100 w-full rounded-sm shadow-sm group-hover:opacity-90 transition mx-auto blur-2xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:50px_50px]"></div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
          {/* Main hero content in glass-elevated container */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-5xl"
          >
            {/* Enhanced announcement badge with premium styling */}
            <div className="mb-16 flex justify-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="glass-elevated rounded-full px-8 py-4 text-sm leading-6 border border-purple-500/30 hover:border-purple-400/50 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-pulse shadow-purple-400/50 shadow-sm"></div>
                  <span className="text-gray-200 font-medium">🚀 Announcing our next round of products.</span>
                  <a href="/marketplace" className="font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent hover:from-purple-300 hover:to-blue-300 transition-all group-hover:translate-x-1">
                    See all →
                  </a>
                </div>
              </motion.div>
            </div>
            
            {/* Hero content in premium glass container */}
            <div className="glass-elevated rounded-3xl p-8 lg:p-12 border border-white/10 relative overflow-hidden mb-12">
              {/* Subtle gradient overlay for the container */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-blue-600/5 rounded-3xl"></div>
              
              <div className="relative text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <HeroTitle />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <HeroActions />
                </motion.div>
              </div>
              
              {/* Decorative elements for the container */}
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-purple-500/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
            </div>
            
            {/* Hero image with enhanced glass styling
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <HeroImage />
            </motion.div> */}
          </motion.div>
        </div>
        
      </div>
    </section>
  )
}
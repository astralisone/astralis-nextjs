"use client"

import { motion } from "framer-motion"

export function HeroImage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="mt-20 flow-root"
    >
      <div className="relative glass-elevated rounded-3xl p-4 lg:p-6 border border-white/20 overflow-hidden">
        {/* Enhanced glass background with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-blue-600/10 rounded-3xl"></div>
        
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80"
            alt="Digital solutions dashboard showcasing our award-winning web development and design work"
            className="rounded-2xl shadow-2xl ring-1 ring-white/20 w-full h-auto"
          />
          
          {/* Overlay gradient for better integration */}
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-transparent rounded-2xl"></div>
        </div>
        
        {/* Decorative floating elements */}
        <div className="absolute -top-2 -right-2 w-20 h-20 bg-purple-500/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-2 -left-2 w-20 h-20 bg-blue-500/10 rounded-full blur-xl"></div>
        
        {/* Enhanced floating badges for credibility */}
        <motion.div 
          className="absolute -top-4 left-8 glass-card rounded-xl px-4 py-2 border border-green-500/30"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white font-medium">High Client Satisfaction</span>
          </div>
        </motion.div>
        
        <motion.div 
          className="absolute -bottom-4 right-8 glass-card rounded-xl px-4 py-2 border border-blue-500/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-white font-medium">Significant Revenue Generated</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
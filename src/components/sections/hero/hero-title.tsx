"use client"

import { motion } from "framer-motion"

export function HeroTitle() {
  return (
    <div>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-tight mb-8">
        <span className="block text-white mb-4 text-balance">
          Automate Your Business &amp; 2x Your Leads
        </span>
        <span className="block bg-gradient-to-r from-purple-400 via-blue-400 to-purple-300 bg-clip-text text-transparent font-extrabold text-balance">
          with AI-Powered Workflows &amp; Smart Marketing
        </span>
      </h1>
      
      <motion.p 
        className="mt-8 text-xl leading-relaxed text-gray-200 max-w-4xl mx-auto text-balance"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        Join <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-bold">50+ small businesses</span> who've eliminated tedious tasks and doubled their leads with AI automation. 
        From smart workflows to automated marketing, we help you work smarter, not harder. 
        <span className="font-bold text-white"> Save 10+ hours per week or get your money back.</span>
      </motion.p>
      
      {/* Enhanced value proposition indicators with sophisticated glassmorphism */}
      <motion.div 
        className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="glass-elevated rounded-xl p-4 border border-purple-500/20 hover:border-purple-400/40 transition-all group cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-pulse shadow-purple-400/50 shadow-sm"></div>
            <span className="text-white font-semibold group-hover:text-purple-200 transition-colors">AI workflow audit</span>
          </div>
        </div>
        <div className="glass-elevated rounded-xl p-4 border border-blue-500/20 hover:border-blue-400/40 transition-all group cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse shadow-blue-400/50 shadow-sm"></div>
            <span className="text-white font-semibold group-hover:text-blue-200 transition-colors">Automation guarantee</span>
          </div>
        </div>
        <div className="glass-elevated rounded-xl p-4 border border-purple-500/20 hover:border-purple-400/40 transition-all group cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-pulse shadow-purple-400/50 shadow-sm"></div>
            <span className="text-white font-semibold group-hover:text-purple-200 transition-colors">Custom AI solutions</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
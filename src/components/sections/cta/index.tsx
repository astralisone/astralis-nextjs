"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Shield, Clock, Sparkles } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="container mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="relative rounded-[2rem] overflow-hidden"
      >
        {/* Unique background - NOT glass! */}
        <div className="absolute inset-0">
          {/* Solid dark base */}
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950" />

          {/* Aurora effect with new accent colors */}
          <div className="absolute inset-0 aurora-gradient opacity-40" />

          {/* Constellation overlay */}
          <div className="absolute inset-0 constellation-bg opacity-50" />

          {/* Animated orbs */}
          <motion.div
            className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, oklch(0.65 0.25 258 / 0.3) 0%, transparent 70%)' }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, oklch(0.75 0.12 195 / 0.3) 0%, transparent 70%)' }}
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
        </div>

        {/* Border glow effect */}
        <div className="absolute inset-0 rounded-[2rem] border-2 border-transparent bg-gradient-to-r from-purple-500/50 via-cyan/50 to-emerald/50 opacity-50" style={{
          WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude'
        }} />

        <div className="relative px-8 py-20 sm:px-12 sm:py-28 lg:px-20">
          <div className="mx-auto max-w-4xl text-center">

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full card-gradient-border hover-shimmer cursor-pointer group">
                <div className="flex items-center gap-3 px-4 py-2 bg-neutral-950 rounded-full">
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-amber" />
                  </motion.div>
                  <span className="text-sm font-bold bg-gradient-to-r from-amber via-rose to-amber bg-clip-text text-transparent">
                    Limited Spots Available
                  </span>
                  <Zap className="w-4 h-4 text-amber" />
                </div>
              </div>
            </motion.div>

            {/* Headline - MUCH LARGER */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black mb-8 leading-[1.1]"
            >
              <span className="text-white block mb-2">Ready to</span>
              <span className="bg-gradient-to-r from-purple-400 via-cyan to-emerald bg-clip-text text-transparent block">
                Transform Your Business?
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mx-auto max-w-3xl text-xl sm:text-2xl text-neutral-300 mb-12 leading-relaxed"
            >
              Join 500+ businesses that have{' '}
              <span className="text-emerald font-semibold">scaled with AI automation</span>.
              Get your free strategy session + custom growth plan{' '}
              <span className="text-cyan font-semibold">(worth $500)</span>.
            </motion.p>

            {/* Value props - New design with accent colors */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            >
              <motion.div
                className="card-outlined p-6 rounded-2xl hover-border-animate group cursor-pointer"
                whileHover={{ y: -8 }}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock className="w-8 h-8 text-purple-400" />
                  </div>
                  <div className="text-2xl font-black bg-gradient-to-br from-purple-400 to-purple-600 bg-clip-text text-transparent">
                    48hrs
                  </div>
                  <div className="text-sm text-neutral-400 font-semibold">Project Kickoff</div>
                </div>
              </motion.div>

              <motion.div
                className="card-outlined p-6 rounded-2xl hover-border-animate group cursor-pointer"
                whileHover={{ y: -8 }}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-cyan/10 border-2 border-cyan/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Shield className="w-8 h-8 text-cyan" />
                  </div>
                  <div className="text-2xl font-black bg-gradient-to-br from-cyan to-cyan-dark bg-clip-text text-transparent">
                    100%
                  </div>
                  <div className="text-sm text-neutral-400 font-semibold">Money-Back Guarantee</div>
                </div>
              </motion.div>

              <motion.div
                className="card-outlined p-6 rounded-2xl hover-border-animate group cursor-pointer"
                whileHover={{ y: -8 }}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-emerald/10 border-2 border-emerald/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap className="w-8 h-8 text-emerald" />
                  </div>
                  <div className="text-2xl font-black bg-gradient-to-br from-emerald to-emerald-dark bg-clip-text text-transparent">
                    24/7
                  </div>
                  <div className="text-sm text-neutral-400 font-semibold">Priority Support</div>
                </div>
              </motion.div>
            </motion.div>

            {/* CTAs - Bold new design */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row justify-center gap-5 mb-10"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/onboarding"
                  className="group relative inline-flex items-center gap-3 px-10 py-6 rounded-2xl overflow-hidden hover-lift"
                >
                  {/* Animated gradient background */}
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 via-cyan-dark to-emerald"
                    style={{
                      backgroundSize: '200% 200%',
                      animation: 'gradient-shift 3s ease infinite'
                    }}
                  />
                  {/* Glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-emerald blur-2xl" />
                  </div>
                  <span className="relative flex items-center gap-3 text-white font-bold text-xl">
                    Start Free Strategy Session
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </span>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/case-studies"
                  className="inline-flex items-center gap-3 px-10 py-6 rounded-2xl card-outlined hover-border-animate text-white font-bold text-xl transition-all"
                >
                  View Success Stories
                  <ArrowRight className="w-5 h-5 opacity-60" />
                </Link>
              </motion.div>
            </motion.div>

            {/* Social proof - New design */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col items-center gap-6"
            >
              {/* Urgency badge */}
              <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl card-solid border-2 border-amber/30">
                <motion.div
                  className="w-3 h-3 rounded-full bg-amber"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [1, 0.5, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
                <span className="font-bold text-amber text-lg">
                  Only 5 consultation spots left this month
                </span>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-neutral-400 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald" />
                  <span className="font-semibold text-emerald">500+ Happy Clients</span>
                </div>
                <div className="hidden sm:block w-px h-4 bg-neutral-700" />
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan" />
                  <span className="font-semibold text-cyan">95% Success Rate</span>
                </div>
                <div className="hidden sm:block w-px h-4 bg-neutral-700" />
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400" />
                  <span className="font-semibold text-purple-400">$10M+ Revenue Generated</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </motion.div>
    </section>
  )
}

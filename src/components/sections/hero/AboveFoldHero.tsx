import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, ArrowRight, Play, Star, Zap, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AboveFoldHero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Constellation Background - Unique Space Theme */}
      <div className="absolute inset-0">
        {/* Base dark background */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950" />

        {/* Aurora gradient overlay with new accent colors */}
        <div className="absolute inset-0 aurora-gradient opacity-60" />

        {/* Constellation effect */}
        <div className="absolute inset-0 constellation-bg" />

        {/* Space particles */}
        <div className="absolute inset-0 space-particles" />

        {/* Floating orbs with new accent colors */}
        <motion.div
          className="absolute top-20 left-10 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, oklch(0.65 0.25 258 / 0.15) 0%, transparent 70%)'
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/3 right-20 w-[400px] h-[400px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, oklch(0.75 0.12 195 / 0.2) 0%, transparent 70%)'
          }}
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
        <motion.div
          className="absolute bottom-20 left-1/3 w-[350px] h-[350px] rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, oklch(0.70 0.18 155 / 0.15) 0%, transparent 70%)'
          }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 section-grid opacity-30" />
      </div>

      <div className="relative z-10 container mx-auto px-6">
        <div className="max-w-7xl mx-auto">

          {/* Floating Badge - New Style */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <motion.div
              className="inline-flex items-center gap-3 px-6 py-3 rounded-full card-gradient-border hover-shimmer cursor-pointer group"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center gap-3 px-4 py-2 bg-neutral-950 rounded-full">
                <motion.div
                  className="w-2 h-2 rounded-full bg-emerald"
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-sm font-semibold bg-gradient-to-r from-emerald-light via-cyan to-emerald bg-clip-text text-transparent">
                  AI-Powered Solutions
                </span>
                <Sparkles className="w-4 h-4 text-cyan" />
              </div>
            </motion.div>
          </motion.div>

          {/* Main Headline - DRAMATICALLY LARGER */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h1 className="text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black mb-8 leading-[0.95] tracking-tight">
              <motion.span
                className="block mb-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <span className="text-white">Build the</span>
              </motion.span>
              <motion.span
                className="block relative"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <span
                  className="bg-gradient-to-r from-purple-400 via-cyan-light to-emerald bg-clip-text text-transparent"
                  style={{
                    textShadow: '0 0 80px rgba(168, 85, 247, 0.3)',
                  }}
                >
                  Future
                </span>
              </motion.span>
              <motion.span
                className="block text-white"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                with AI
              </motion.span>
            </h1>

            <motion.p
              className="text-xl md:text-2xl lg:text-3xl text-neutral-300 max-w-4xl mx-auto leading-relaxed mb-12 font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              Transform your business with intelligent automation.{' '}
              <span className="text-cyan font-medium">Discover your perfect solution</span> in 60 seconds.
            </motion.p>

            {/* Enhanced CTA Buttons with New Styles */}
            <motion.div
              className="flex flex-col sm:flex-row gap-5 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/services/wizard"
                  className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-2xl overflow-hidden hover-lift"
                >
                  {/* Animated gradient background */}
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 via-cyan-dark to-emerald-dark"
                    style={{
                      backgroundSize: '200% 200%',
                      animation: 'gradient-shift 3s ease infinite'
                    }}
                  />
                  {/* Glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-cyan blur-xl" />
                  </div>
                  <span className="relative flex items-center gap-3 text-white font-bold text-lg">
                    <Rocket className="w-6 h-6" />
                    Start Service Wizard
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </span>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/workflow-demo"
                  className="group inline-flex items-center gap-3 px-10 py-5 card-outlined hover-border-animate rounded-2xl text-white font-semibold text-lg transition-all duration-300"
                >
                  <Play className="w-5 h-5 text-cyan" />
                  Watch Demo
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform opacity-60" />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Trust Indicators - New Layout with Accent Colors */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.3 }}
            className="max-w-5xl mx-auto"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <motion.div
                className="card-solid hover-glow p-8 text-center group cursor-pointer"
                whileHover={{ y: -4 }}
              >
                <div className="text-5xl font-black bg-gradient-to-br from-purple-400 to-purple-600 bg-clip-text text-transparent mb-2">
                  500+
                </div>
                <div className="text-neutral-400 font-medium">Businesses Transformed</div>
              </motion.div>

              <motion.div
                className="card-solid hover-glow p-8 text-center group cursor-pointer"
                whileHover={{ y: -4 }}
              >
                <div className="text-5xl font-black bg-gradient-to-br from-cyan to-cyan-dark bg-clip-text text-transparent mb-2">
                  95%
                </div>
                <div className="text-neutral-400 font-medium">Client Success Rate</div>
              </motion.div>

              <motion.div
                className="card-solid hover-glow p-8 text-center group cursor-pointer"
                whileHover={{ y: -4 }}
              >
                <div className="text-5xl font-black bg-gradient-to-br from-emerald to-emerald-dark bg-clip-text text-transparent mb-2">
                  24/7
                </div>
                <div className="text-neutral-400 font-medium">AI-Powered Support</div>
              </motion.div>
            </div>

            {/* Social Proof */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-6 py-6 card-outlined rounded-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.5 }}
            >
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 1.5 + i * 0.1 }}
                  >
                    <Star className="w-6 h-6 text-amber fill-current" />
                  </motion.div>
                ))}
              </div>
              <div className="h-8 w-px bg-neutral-700 hidden sm:block" />
              <div className="text-center sm:text-left">
                <div className="text-white font-semibold">Rated 4.9/5</div>
                <div className="text-neutral-400 text-sm">From 500+ verified reviews</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.7 }}
            className="absolute bottom-12 left-1/2 transform -translate-x-1/2 hidden lg:block"
          >
            <motion.div
              className="flex flex-col items-center gap-3 cursor-pointer group"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="text-sm text-neutral-500 font-medium group-hover:text-cyan transition-colors">
                Scroll to explore
              </div>
              <div className="w-8 h-14 border-2 border-neutral-700 group-hover:border-cyan rounded-full p-1.5 transition-colors">
                <motion.div
                  className="w-1.5 h-3 bg-gradient-to-b from-cyan to-purple-400 rounded-full mx-auto"
                  animate={{ y: [0, 20, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

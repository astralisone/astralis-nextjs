'use client';

import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

export function ProcessHero() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/95 z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&h=1080&fit=crop&q=80"
          alt="Team collaboration"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Content */}
      <div className="container relative z-20 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block mb-6"
          >
            <span className="glass-card px-6 py-3 rounded-full text-sm font-semibold border border-primary/30">
              Our Methodology
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            A Proven Process for
            <span className="gradient-text block mt-2">
              Digital Excellence
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-neutral-300 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            From initial discovery to continuous optimization, we follow a strategic,
            data-driven approach that ensures your AI automation project delivers
            measurable results and exceeds expectations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex items-center justify-center gap-2 text-sm text-neutral-400"
          >
            <ArrowDown className="h-5 w-5 animate-bounce" />
            <span>Scroll to explore our process</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

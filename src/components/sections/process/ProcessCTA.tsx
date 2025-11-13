'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export function ProcessCTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20"></div>
        <img
          src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1920&h=1080&fit=crop&q=80"
          alt="Team collaboration"
          className="w-full h-full object-cover opacity-10"
        />
      </div>

      {/* Animated orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container relative z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <span className="glass-card px-6 py-3 rounded-full text-sm font-semibold border border-primary/30 inline-block">
              Ready to Get Started?
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-6xl font-bold mb-6 leading-tight"
          >
            Let's Transform Your
            <span className="gradient-text block mt-2">
              Business Together
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-xl text-neutral-300 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Schedule a free consultation to discuss your goals and discover how our
            proven process can help you achieve them. No commitment required.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-primary/25 transition-all"
            >
              <Link href="/book-consultation">
                <Calendar className="mr-2 h-5 w-5" />
                Schedule Free Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="glass-card border-white/20 hover:border-primary/50 text-foreground px-8 py-6 text-lg font-semibold"
            >
              <Link href="/contact">
                <MessageSquare className="mr-2 h-5 w-5" />
                Contact Us
              </Link>
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-neutral-400"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>No Long-Term Contracts</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Money-Back Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Free Consultation</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

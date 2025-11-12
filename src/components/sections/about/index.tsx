import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export function AboutSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Enhanced background with multiple layers */}
      <div className="absolute inset-0 mesh-gradient opacity-30"></div>
      <div className="absolute inset-0 dots-pattern opacity-20"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Enhanced Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground text-balance">
                Why Top Companies Choose{" "}
                <span className="gradient-text">Astralis</span>
              </h2>
              <p className="text-xl text-neutral-300 leading-relaxed">
                We've been helping ambitious businesses transform their digital presence for years. 
                Our team of experienced experts combines creative vision with technical excellence to deliver 
                results that drive real business growth.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-card p-6 rounded-2xl border border-primary/20 card-hover-subtle">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-primary-glow"></div>
                  <h3 className="font-bold text-foreground text-lg">Proven Track Record</h3>
                </div>
                <p className="text-neutral-300">
                  Successful projects with significant ROI improvements for our clients
                </p>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-secondary/20 card-hover-subtle">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 bg-secondary rounded-full animate-pulse shadow-secondary-glow"></div>
                  <h3 className="font-bold text-foreground text-lg">Expert Team</h3>
                </div>
                <p className="text-neutral-300">
                  Certified specialists in React, Next.js, and modern development
                </p>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-primary/20 card-hover-subtle">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-primary-glow"></div>
                  <h3 className="font-bold text-foreground text-lg">Agile Process</h3>
                </div>
                <p className="text-neutral-300">
                  Quick project kickoff with regular progress updates
                </p>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-secondary/20 card-hover-subtle">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-3 h-3 bg-secondary rounded-full animate-pulse shadow-secondary-glow"></div>
                  <h3 className="font-bold text-foreground text-lg">Full Support</h3>
                </div>
                <p className="text-neutral-300">
                  Ongoing maintenance and optimization included
                </p>
              </div>
            </div>

            <div className="pt-6">
              <Button size="lg" className="btn-primary px-8 py-4 text-lg font-bold rounded-xl shadow-elevation-3">
                Learn About Our Process
              </Button>
            </div>
          </motion.div>

          {/* Enhanced Image/Visual with glassmorphism */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative glass-elevated rounded-3xl p-10 shadow-glass-lg border border-white/20">
              <div className="grid grid-cols-2 gap-6">
                {/* Enhanced team photos with gradients */}
                <div className="space-y-6">
                  <div className="w-full h-32 gradient-primary rounded-2xl shadow-elevation-2 card-hover-subtle"></div>
                  <div className="w-full h-20 gradient-secondary rounded-2xl shadow-elevation-2 card-hover-subtle"></div>
                </div>
                <div className="space-y-6 pt-8">
                  <div className="w-full h-20 animated-gradient rounded-2xl shadow-elevation-2 card-hover-subtle"></div>
                  <div className="w-full h-32 gradient-primary rounded-2xl shadow-elevation-2 card-hover-subtle"></div>
                </div>
              </div>
              
              {/* Enhanced floating achievement badges with glassmorphism */}
              <div className="absolute -top-6 -right-6 glass-elevated rounded-2xl p-4 shadow-glass-lg border border-primary/30">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary gradient-text">Pro</div>
                  <div className="text-sm text-neutral-300 font-medium">Level</div>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -left-6 glass-elevated rounded-2xl p-4 shadow-glass-lg border border-secondary/30">
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">98%</div>
                  <div className="text-sm text-neutral-300 font-medium">Success</div>
                </div>
              </div>

              {/* Additional floating element */}
              <div className="absolute top-1/2 -right-3 glass-card rounded-xl p-3 shadow-glass border border-primary/20">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-primary-glow"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
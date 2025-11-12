"use client"

import { motion } from "framer-motion"
import { Shield, Award, Users, Zap, CheckCircle, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const trustIndicators = [
  {
    icon: Shield,
    text: "Secure & Reliable",
    description: "Enterprise-grade security",
  },
  {
    icon: Award,
    text: "Award-Winning",
    description: "Industry recognition",
  },
  {
    icon: Users,
    text: "Happy Clients",
    description: "Proven satisfaction",
  },
  {
    icon: Zap,
    text: "Fast Delivery",
    description: "Quick turnaround times",
  },
  {
    icon: CheckCircle,
    text: "Quality Guaranteed",
    description: "100% satisfaction promise",
  },
  {
    icon: Clock,
    text: "24/7 Support",
    description: "Always here to help",
  },
]

const clientLogos = [
  {
    name: "TechCorp",
    logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop&crop=center&auto=format&q=80",
  },
  {
    name: "Innovate Inc",
    logo: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=200&h=100&fit=crop&crop=center&auto=format&q=80",
  },
  {
    name: "Digital Solutions",
    logo: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=200&h=100&fit=crop&crop=center&auto=format&q=80",
  },
  {
    name: "Growth Co",
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=100&fit=crop&crop=center&auto=format&q=80",
  },
  {
    name: "StartupHub",
    logo: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200&h=100&fit=crop&crop=center&auto=format&q=80",
  },
  {
    name: "Enterprise Ltd",
    logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=100&fit=crop&crop=center&auto=format&q=80",
  },
]

export function TrustIndicatorsSection() {
  return (
    <section className="container mx-auto px-4 py-16">
      {/* Enhanced trust badges with glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-20"
      >
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-6 glass-card px-6 py-2 text-primary border-primary/30 text-base font-semibold">
            Trusted by Industry Leaders
          </Badge>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground text-balance">
            Why thousands of businesses choose Astralis
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {trustIndicators.map((indicator, index) => {
            const Icon = indicator.icon
            return (
              <motion.div
                key={indicator.text}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="glass-card p-6 rounded-2xl border border-white/10 card-hover-subtle shadow-glass">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/20 mb-4 group-hover:bg-primary/30 transition-all duration-300 shadow-primary-glow">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h4 className="text-sm font-bold mb-2 text-foreground">{indicator.text}</h4>
                  <p className="text-xs text-neutral-300">{indicator.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Enhanced client logos section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="border-t border-border/30 pt-16"
      >
        <div className="text-center mb-12">
          <p className="text-lg text-neutral-300 font-semibold">
            Trusted by growing companies worldwide
          </p>
        </div>

        {/* Enhanced logo carousel with glassmorphism container */}
        <div className="glass-elevated rounded-2xl p-8 shadow-glass-lg border border-white/10">
          <div className="relative overflow-hidden">
            <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap">
              {clientLogos.map((client, index) => (
                <motion.div
                  key={client.name}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="flex-shrink-0 transition-all duration-300 opacity-70 hover:opacity-100 card-hover-subtle group"
                >
                  <div className="flex flex-col items-center gap-3 px-4 py-4 rounded-xl hover:bg-white/5 transition-all duration-300">
                    <div className="relative overflow-hidden rounded-lg bg-white p-3 group-hover:scale-105 transition-transform duration-300">
                      <img
                        src={client.logo}
                        alt={client.name}
                        className="h-8 w-16 md:h-10 md:w-20 object-cover filter grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                      {client.name}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced bottom trust message with glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-12"
        >
          <div className="glass-card rounded-2xl p-6 inline-block border border-primary/20">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-primary-glow"></div>
                <span className="font-bold text-primary">High client satisfaction</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse shadow-secondary-glow"></div>
                <span className="font-bold text-secondary">5-star average rating</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-primary-glow"></div>
                <span className="font-bold text-primary">Money-back guarantee</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
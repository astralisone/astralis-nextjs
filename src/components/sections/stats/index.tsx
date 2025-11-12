"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { TrendingUp, Users, Award, Clock } from "lucide-react"

interface Stat {
  id: string
  name: string
  value: number
  suffix: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

const stats: Stat[] = [
  {
    id: "hours",
    name: "Hours Saved Weekly",
    value: 12,
    suffix: "+",
    icon: TrendingUp,
    color: "text-primary",
  },
  {
    id: "leads",
    name: "Lead Generation Increase",
    value: 180,
    suffix: "%",
    icon: Users,
    color: "text-secondary",
  },
  {
    id: "automations",
    name: "Workflows Automated",
    value: 85,
    suffix: "+",
    icon: Award,
    color: "text-primary",
  },
  {
    id: "efficiency",
    name: "Process Efficiency Gain",
    value: 65,
    suffix: "%",
    icon: Clock,
    color: "text-secondary",
  },
]

function CountUpAnimation({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref)

  useEffect(() => {
    if (isInView) {
      let startTime: number
      let animationId: number

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime
        const progress = Math.min((currentTime - startTime) / (duration * 1000), 1)
        
        setCount(Math.floor(progress * end))
        
        if (progress < 1) {
          animationId = requestAnimationFrame(animate)
        }
      }

      animationId = requestAnimationFrame(animate)
      
      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId)
        }
      }
    }
  }, [isInView, end, duration])

  return <span ref={ref}>{count}</span>
}

export function StatsSection() {
  return (
    <section className="container mx-auto px-4 py-20">
      {/* Enhanced background with glassmorphism */}
      <div className="relative">
        <div className="absolute inset-0 glass-elevated rounded-3xl shadow-glass-lg border border-primary/20" />
        <div className="absolute inset-0 gradient-hero opacity-20 rounded-3xl" />
        <div className="relative p-10 md:p-16">
          {/* Section header */}
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text text-balance">
              AI Automation Results That Drive Growth
            </h2>
            <p className="text-neutral-300 max-w-3xl mx-auto text-xl leading-relaxed">
              Real time savings and lead growth from businesses using our AI automation solutions. Stop wasting time on repetitive tasks.
            </p>
          </motion.div>

          {/* Enhanced stats grid with glassmorphism cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.15 }}
                  className="text-center group"
                >
                  <div className="glass-card rounded-3xl p-8 shadow-glass border border-white/10 card-hover-subtle">
                    {/* Enhanced icon with glow */}
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface/50 mb-6 group-hover:scale-110 transition-all duration-300 ${stat.color === 'text-primary' ? 'shadow-primary-glow' : 'shadow-secondary-glow'}`}>
                      <Icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                    
                    {/* Enhanced number with gradient */}
                    <div className="text-4xl md:text-5xl font-bold mb-3 gradient-text">
                      <CountUpAnimation end={stat.value} />
                      <span>{stat.suffix}</span>
                    </div>
                    
                    {/* Enhanced label */}
                    <p className="text-base md:text-lg text-neutral-300 font-semibold">
                      {stat.name}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Enhanced bottom CTA with glassmorphism */}
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="glass-elevated rounded-2xl p-8 max-w-2xl mx-auto border border-primary/20">
              <p className="text-neutral-300 text-xl mb-6 font-medium">
                Ready to become our next success story?
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary border-3 border-surface shadow-elevation-2"
                    />
                  ))}
                </div>
                <span className="text-foreground font-semibold text-lg">Join our satisfied clients</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
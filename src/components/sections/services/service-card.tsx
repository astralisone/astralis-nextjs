"use client"

import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface ServiceCardProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  index: number
  route?: string
  stats?: string
}

// Accent colors for visual variety
const accentColors = [
  { gradient: "from-purple-400 to-purple-600", glow: "purple-500", bg: "purple-500/10", border: "purple-500/30", icon: "text-purple-400" },
  { gradient: "from-cyan to-cyan-dark", glow: "cyan", bg: "cyan/10", border: "cyan/30", icon: "text-cyan" },
  { gradient: "from-emerald to-emerald-dark", glow: "emerald", bg: "emerald/10", border: "emerald/30", icon: "text-emerald" },
  { gradient: "from-amber to-amber-dark", glow: "amber", bg: "amber/10", border: "amber/30", icon: "text-amber" },
]

export function ServiceCard({ title, description, icon: Icon, index, route, stats }: ServiceCardProps) {
  const router = useRouter()

  // Cycle through accent colors
  const accent = accentColors[index % accentColors.length]

  const handleClick = () => {
    if (route) {
      router.push(route)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.23, 1, 0.32, 1] }}
    >
      <div
        onClick={handleClick}
        className={cn(
          "relative group overflow-hidden rounded-3xl transition-all duration-500 cursor-pointer",
          "card-gradient-border hover-lift h-full"
        )}
      >
        {/* Inner card content */}
        <div className="relative bg-neutral-950 rounded-3xl p-8 h-full">

          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className={cn("absolute inset-0 bg-gradient-to-br", accent.bg)} />
            <div className="absolute inset-0 section-grid opacity-20" />
          </div>

          {/* Floating orb accent */}
          <motion.div
            className={cn(
              "absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-700",
              `bg-${accent.glow}`
            )}
            style={{ background: `radial-gradient(circle, var(--color-${accent.glow}) 0%, transparent 70%)` }}
          />

          <div className="relative z-10 flex flex-col h-full">
            {/* Icon with unique style */}
            <div className="mb-6 flex items-start justify-between">
              <motion.div
                className={cn(
                  "relative w-20 h-20 rounded-2xl flex items-center justify-center",
                  "border-2 transition-all duration-500",
                  `bg-gradient-to-br ${accent.bg} border-${accent.border}`,
                  "group-hover:scale-110 group-hover:rotate-6"
                )}
                whileHover={{ rotate: [0, -5, 5, -5, 0], transition: { duration: 0.5 } }}
              >
                {/* Glow effect behind icon */}
                <div className={cn(
                  "absolute inset-0 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500",
                  `bg-gradient-to-br ${accent.gradient}`
                )} />

                <Icon className={cn("w-10 h-10 relative z-10 transition-all duration-300", accent.icon)} />
              </motion.div>

              {/* Sparkle indicator */}
              <motion.div
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <Sparkles className={cn("w-5 h-5", accent.icon)} />
              </motion.div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col">
              <h3 className={cn(
                "text-2xl lg:text-3xl font-black mb-4 transition-all duration-300",
                "text-white group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:text-transparent",
                `group-hover:${accent.gradient}`
              )}>
                {title}
              </h3>

              <p className="text-neutral-400 leading-relaxed text-lg mb-6 group-hover:text-neutral-300 transition-colors flex-1">
                {description}
              </p>

              {/* Stats Badge with accent color */}
              {stats && (
                <motion.div
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-6 w-fit",
                    "card-outlined border-2",
                    `border-${accent.border}`
                  )}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.15 + 0.5 }}
                >
                  <motion.div
                    className={cn("w-2 h-2 rounded-full", `bg-${accent.glow}`)}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [1, 0.5, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <span className={cn("text-sm font-bold", accent.icon)}>{stats}</span>
                </motion.div>
              )}

              {/* CTA */}
              <motion.div
                className={cn(
                  "flex items-center gap-3 font-bold text-lg transition-all duration-300",
                  accent.icon,
                  "group-hover:gap-4"
                )}
                whileHover={{ x: 5 }}
              >
                <span>Explore Solution</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
              </motion.div>
            </div>
          </div>

          {/* Bottom accent line */}
          <div className={cn(
            "absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
            `bg-gradient-to-r ${accent.gradient}`
          )} />
        </div>
      </div>
    </motion.div>
  )
}

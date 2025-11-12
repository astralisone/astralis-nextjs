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

export function ServiceCard({ title, description, icon: Icon, index, route, stats }: ServiceCardProps) {
  const router = useRouter()

  const handleClick = () => {
    if (route) {
      router.push(route)
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <div 
        onClick={handleClick}
        className={cn(
          "relative group overflow-hidden rounded-3xl p-8 transition-all duration-500 cursor-pointer",
          "glass-elevated border border-white/20 hover:border-purple-500/50",
          "hover:scale-105 hover:shadow-elevation-4"
        )}
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Floating Elements */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
          <Sparkles className="w-6 h-6 text-purple-400" />
        </div>
        
        <div className="relative z-10">
          {/* Icon */}
          <div className="mb-6">
            <div className={cn(
              "w-16 h-16 rounded-2xl border flex items-center justify-center transition-all duration-300",
              "bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-purple-500/30",
              "group-hover:scale-110 group-hover:rotate-3"
            )}>
              <Icon className="w-8 h-8 text-purple-400 group-hover:text-purple-300" />
            </div>
          </div>
          
          {/* Content */}
          <div className="space-y-4 mb-6">
            <h3 className="text-2xl font-bold text-white group-hover:text-purple-200 transition-colors">
              {title}
            </h3>
            
            <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors">
              {description}
            </p>
            
            {/* Stats Badge */}
            {stats && (
              <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-xl border border-green-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-300">{stats}</span>
              </div>
            )}
          </div>
          
          {/* CTA */}
          <div className="flex items-center gap-3 text-purple-400 group-hover:text-purple-300 transition-colors">
            <span className="font-medium">Explore Solution</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
        
        {/* Hover border glow */}
        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none border border-purple-400/50" />
      </div>
    </motion.div>
  )
}
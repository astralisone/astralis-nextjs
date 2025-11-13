"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Clock,
  Eye,
  TrendingUp,
  Package,
  Flame,
  Timer,
  AlertCircle,
  Zap,
  Target
} from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface UrgencyIndicatorsProps {
  productId?: string
  stock?: number
  viewerCount?: number
  salesCount?: number
  timeLeft?: number // seconds
  discount?: {
    percentage: number
    endsAt: string
  }
  recentActivity?: {
    purchases: number
    timeframe: string
  }
  lowStockThreshold?: number
  showCountdown?: boolean
  showViewers?: boolean
  showSales?: boolean
  showStock?: boolean
  className?: string
}

export function UrgencyIndicators({
  productId,
  stock = 0,
  viewerCount = 0,
  salesCount = 0,
  timeLeft = 0,
  discount,
  recentActivity,
  lowStockThreshold = 10,
  showCountdown = true,
  showViewers = true,
  showSales = true,
  showStock = true,
  className = ""
}: UrgencyIndicatorsProps) {
  const [currentViewers, setCurrentViewers] = useState(viewerCount)
  const [countdown, setCountdown] = useState(timeLeft)
  const [isVisible, setIsVisible] = useState(true)

  // Simulate live viewer count updates
  useEffect(() => {
    if (!showViewers || viewerCount === 0) return

    const interval = setInterval(() => {
      // Add some randomness to make it feel more realistic
      const change = Math.floor(Math.random() * 5) - 2 // -2 to +2
      const newCount = Math.max(0, currentViewers + change)
      setCurrentViewers(Math.min(newCount, viewerCount + 10)) // Cap at original + 10
    }, 3000 + Math.random() * 2000) // 3-5 seconds

    return () => clearInterval(interval)
  }, [currentViewers, viewerCount, showViewers])

  // Countdown timer
  useEffect(() => {
    if (!showCountdown || countdown <= 0) return

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setIsVisible(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [countdown, showCountdown])

  // Calculate urgency metrics
  const isLowStock = stock > 0 && stock <= lowStockThreshold
  const hasHighViewers = currentViewers >= 10
  const hasRecentSales = recentActivity && recentActivity.purchases > 0
  const hasDiscount = discount && discount.percentage > 0
  const hasCountdown = countdown > 0

  // Format time display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const indicators = []

  // Live viewers indicator
  if (showViewers && currentViewers > 0) {
    indicators.push({
      id: 'viewers',
      icon: Eye,
      content: (
        <motion.div
          key="viewers"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <Eye className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium">{currentViewers}</span>
            <span className="text-xs text-muted-foreground">viewing</span>
          </div>
        </motion.div>
      ),
      priority: 3
    })
  }

  // Low stock indicator
  if (showStock && isLowStock) {
    const stockPercentage = (stock / lowStockThreshold) * 100
    indicators.push({
      id: 'stock',
      icon: Package,
      content: (
        <motion.div
          key="stock"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2"
        >
          <Package className="w-4 h-4 text-orange-400" />
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-orange-400">
              Only {stock} left!
            </span>
            <Progress
              value={stockPercentage}
              className="w-16 h-1"
            />
          </div>
        </motion.div>
      ),
      priority: 5
    })
  }

  // Sales activity indicator
  if (showSales && hasRecentSales) {
    indicators.push({
      id: 'sales',
      icon: TrendingUp,
      content: (
        <motion.div
          key="sales"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          <Flame className="w-4 h-4 text-red-400" />
          <span className="text-sm">
            <span className="font-medium text-red-400">{recentActivity?.purchases}</span>
            <span className="text-muted-foreground ml-1">sold {recentActivity?.timeframe}</span>
          </span>
        </motion.div>
      ),
      priority: 4
    })
  }

  // Discount countdown
  if (hasDiscount && hasCountdown) {
    indicators.push({
      id: 'discount',
      icon: Timer,
      content: (
        <motion.div
          key="discount"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2"
        >
          <Timer className={`w-4 h-4 ${countdown < 300 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`} />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-yellow-400">
              {discount.percentage}% OFF
            </span>
            <span className={`text-xs ${countdown < 300 ? 'text-red-400' : 'text-muted-foreground'}`}>
              {formatTime(countdown)} left
            </span>
          </div>
        </motion.div>
      ),
      priority: 6
    })
  }

  // General urgency indicators
  if (salesCount > 50) {
    indicators.push({
      id: 'bestseller',
      icon: Target,
      content: (
        <motion.div
          key="bestseller"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <Target className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-purple-400 font-medium">Bestseller</span>
        </motion.div>
      ),
      priority: 2
    })
  }

  if (hasHighViewers && isLowStock) {
    indicators.push({
      id: 'high-demand',
      icon: Zap,
      content: (
        <motion.div
          key="high-demand"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2"
        >
          <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
          <span className="text-sm text-yellow-400 font-medium">High Demand</span>
        </motion.div>
      ),
      priority: 6
    })
  }

  // Sort by priority and limit to top 3
  const sortedIndicators = indicators
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3)

  if (sortedIndicators.length === 0 || !isVisible) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`space-y-3 ${className}`}
      >
        {sortedIndicators.map(indicator => (
          <motion.div
            key={indicator.id}
            layout
            className="glass-card p-3 border border-border/30 bg-background/5 backdrop-blur-sm"
          >
            {indicator.content}
          </motion.div>
        ))}

        {/* Special alert for critical urgency */}
        {isLowStock && hasHighViewers && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-3 border border-red-500/30 bg-red-500/5"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 animate-pulse" />
              <span className="text-sm font-medium text-red-400">
                Almost sold out!
              </span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

// Preset configurations for different scenarios
export const UrgencyPresets = {
  lowStock: (stock: number) => (
    <UrgencyIndicators
      stock={stock}
      lowStockThreshold={10}
      viewerCount={Math.floor(Math.random() * 20) + 5}
      showStock={true}
      showViewers={true}
    />
  ),

  flashSale: (timeLeft: number, discountPercentage: number) => (
    <UrgencyIndicators
      timeLeft={timeLeft}
      discount={{
        percentage: discountPercentage,
        endsAt: new Date(Date.now() + timeLeft * 1000).toISOString()
      }}
      showCountdown={true}
      showViewers={true}
    />
  ),

  popular: (viewerCount: number, salesCount: number) => (
    <UrgencyIndicators
      viewerCount={viewerCount}
      salesCount={salesCount}
      recentActivity={{
        purchases: Math.floor(Math.random() * 10) + 1,
        timeframe: "today"
      }}
      showViewers={true}
      showSales={true}
    />
  ),

  limitedEdition: (stock: number) => (
    <UrgencyIndicators
      stock={stock}
      lowStockThreshold={stock}
      viewerCount={Math.floor(Math.random() * 30) + 10}
      salesCount={Math.floor(Math.random() * 100) + 50}
      showStock={true}
      showViewers={true}
      showSales={true}
    />
  )
}

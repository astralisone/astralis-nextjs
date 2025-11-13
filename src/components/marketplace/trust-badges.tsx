"use client"

import { motion } from "framer-motion"
import {
  Shield,
  Truck,
  Clock,
  CreditCard,
  Award,
  Star,
  CheckCircle,
  Lock,
  Headphones,
  RotateCcw,
  Zap,
  Heart
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TrustBadge {
  id: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
  color?: string
  variant?: 'default' | 'success' | 'warning' | 'info'
}

interface TrustBadgesProps {
  badges?: string[]
  layout?: 'horizontal' | 'vertical' | 'grid'
  size?: 'sm' | 'md' | 'lg'
  showLabels?: boolean
  className?: string
  productType?: 'PRODUCT' | 'SERVICE'
  features?: {
    hasGuarantee?: boolean
    hasFreeShipping?: boolean
    hasInstantDelivery?: boolean
    hasSecurePayment?: boolean
    isVerifiedSeller?: boolean
    hasSupport?: boolean
    hasRefund?: boolean
    isBestseller?: boolean
    isNewProduct?: boolean
    hasWarranty?: boolean
  }
}

const trustBadges: Record<string, TrustBadge> = {
  'secure-payment': {
    id: 'secure-payment',
    icon: CreditCard,
    label: 'Secure Payment',
    description: 'Your payment information is encrypted and secure',
    color: 'text-green-400',
    variant: 'success'
  },
  'money-back': {
    id: 'money-back',
    icon: RotateCcw,
    label: '30-Day Guarantee',
    description: 'Full refund if not satisfied within 30 days',
    color: 'text-blue-400',
    variant: 'info'
  },
  'free-shipping': {
    id: 'free-shipping',
    icon: Truck,
    label: 'Free Shipping',
    description: 'Free delivery on all digital products',
    color: 'text-green-400',
    variant: 'success'
  },
  'instant-delivery': {
    id: 'instant-delivery',
    icon: Zap,
    label: 'Instant Delivery',
    description: 'Digital products delivered immediately',
    color: 'text-yellow-400',
    variant: 'warning'
  },
  'verified-seller': {
    id: 'verified-seller',
    icon: CheckCircle,
    label: 'Verified Seller',
    description: 'Trusted and verified by our team',
    color: 'text-blue-400',
    variant: 'info'
  },
  '24-7-support': {
    id: '24-7-support',
    icon: Headphones,
    label: '24/7 Support',
    description: 'Round-the-clock customer support',
    color: 'text-purple-400',
    variant: 'default'
  },
  'ssl-secure': {
    id: 'ssl-secure',
    icon: Lock,
    label: 'SSL Secured',
    description: 'All data transmitted is encrypted',
    color: 'text-green-400',
    variant: 'success'
  },
  'bestseller': {
    id: 'bestseller',
    icon: Award,
    label: 'Bestseller',
    description: 'One of our most popular products',
    color: 'text-yellow-400',
    variant: 'warning'
  },
  'new-product': {
    id: 'new-product',
    icon: Star,
    label: 'New',
    description: 'Recently added to our marketplace',
    color: 'text-purple-400',
    variant: 'default'
  },
  'warranty': {
    id: 'warranty',
    icon: Shield,
    label: 'Warranty',
    description: 'Covered by our comprehensive warranty',
    color: 'text-blue-400',
    variant: 'info'
  },
  'fast-delivery': {
    id: 'fast-delivery',
    icon: Clock,
    label: 'Fast Delivery',
    description: 'Quick turnaround time',
    color: 'text-green-400',
    variant: 'success'
  },
  'customer-choice': {
    id: 'customer-choice',
    icon: Heart,
    label: 'Customer Choice',
    description: 'Highly rated by customers',
    color: 'text-red-400',
    variant: 'default'
  }
}

export function TrustBadges({
  badges = [],
  layout = 'horizontal',
  size = 'md',
  showLabels = true,
  className = "",
  productType = 'PRODUCT',
  features = {}
}: TrustBadgesProps) {
  // Auto-determine badges based on features if not explicitly provided
  const determinedBadges = badges.length > 0 ? badges : (() => {
    const autoBadges: string[] = []

    // Always include secure payment and SSL
    autoBadges.push('secure-payment', 'ssl-secure')

    // Add based on features
    if (features.hasGuarantee) autoBadges.push('money-back')
    if (features.hasFreeShipping) autoBadges.push('free-shipping')
    if (features.hasInstantDelivery) autoBadges.push('instant-delivery')
    if (features.isVerifiedSeller) autoBadges.push('verified-seller')
    if (features.hasSupport) autoBadges.push('24-7-support')
    if (features.isBestseller) autoBadges.push('bestseller')
    if (features.isNewProduct) autoBadges.push('new-product')
    if (features.hasWarranty) autoBadges.push('warranty')

    // Add product type specific badges
    if (productType === 'PRODUCT') {
      if (!autoBadges.includes('instant-delivery')) {
        autoBadges.push('fast-delivery')
      }
    } else {
      autoBadges.push('customer-choice')
    }

    return autoBadges
  })()

  const activeBadges = determinedBadges
    .map(badgeId => trustBadges[badgeId])
    .filter(Boolean)

  if (activeBadges.length === 0) {
    return null
  }

  const sizeClasses = {
    sm: {
      icon: 'w-3 h-3',
      badge: 'text-xs px-2 py-1',
      gap: 'gap-1'
    },
    md: {
      icon: 'w-4 h-4',
      badge: 'text-sm px-3 py-1.5',
      gap: 'gap-2'
    },
    lg: {
      icon: 'w-5 h-5',
      badge: 'text-base px-4 py-2',
      gap: 'gap-3'
    }
  }

  const layoutClasses = {
    horizontal: 'flex flex-wrap',
    vertical: 'flex flex-col',
    grid: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
  }

  const currentSize = sizeClasses[size]
  const currentLayout = layoutClasses[layout]

  return (
    <TooltipProvider>
      <div className={`${currentLayout} ${currentSize.gap} ${className}`}>
        {activeBadges.map((badge, index) => {
          const IconComponent = badge.icon

          return (
            <Tooltip key={badge.id}>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="cursor-help"
                >
                  <Badge
                    variant="outline"
                    className={`
                      glass-badge border-border/50 hover:border-border transition-all duration-200
                      ${currentSize.badge}
                      ${layout === 'vertical' ? 'justify-start' : ''}
                      group hover:scale-105
                    `}
                  >
                    <IconComponent className={`${currentSize.icon} ${badge.color} mr-1.5`} />
                    {showLabels && (
                      <span className="text-foreground group-hover:text-white transition-colors">
                        {badge.label}
                      </span>
                    )}
                  </Badge>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="glass-elevated max-w-xs text-center"
              >
                <p className="font-medium text-foreground">{badge.label}</p>
                <p className="text-sm text-muted-foreground mt-1">{badge.description}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}

// Preset configurations for common use cases
export const TrustBadgePresets = {
  ecommerce: (
    <TrustBadges
      features={{
        hasSecurePayment: true,
        hasFreeShipping: true,
        hasGuarantee: true,
        hasSupport: true
      }}
      layout="horizontal"
      size="md"
    />
  ),

  digitalProduct: (
    <TrustBadges
      features={{
        hasSecurePayment: true,
        hasInstantDelivery: true,
        hasGuarantee: true,
        isVerifiedSeller: true
      }}
      layout="horizontal"
      size="md"
      productType="PRODUCT"
    />
  ),

  service: (
    <TrustBadges
      features={{
        hasSecurePayment: true,
        hasSupport: true,
        isVerifiedSeller: true,
        hasGuarantee: true
      }}
      layout="horizontal"
      size="md"
      productType="SERVICE"
    />
  ),

  premium: (
    <TrustBadges
      features={{
        hasSecurePayment: true,
        hasInstantDelivery: true,
        hasGuarantee: true,
        hasSupport: true,
        isVerifiedSeller: true,
        hasWarranty: true
      }}
      layout="grid"
      size="lg"
    />
  )
}

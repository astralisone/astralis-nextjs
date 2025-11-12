"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, Users, Award } from "lucide-react"
import type { MarketplaceItem } from "@/types/marketplace"

interface ServiceCardProps {
  service: MarketplaceItem
  index: number
}

export function ServiceCard({ service, index }: ServiceCardProps) {
  const getDurationText = () => {
    if (service.estimatedDuration && service.durationUnit) {
      return `${service.estimatedDuration} ${service.durationUnit}`
    }
    return service.durationType?.replace('_', ' ').toLowerCase() || 'Custom timeline'
  }

  const getComplexityColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'intermediate':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'advanced':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'expert':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="h-full"
    >
      <Card className="group overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 h-full flex flex-col">
        <CardHeader className="p-0">
          <div className="aspect-[16/10] sm:aspect-[4/3] overflow-hidden bg-gradient-to-br from-blue-900/20 to-indigo-900/20 relative">
            <Image
              src={service.imageUrl}
              alt={service.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* Service type badge */}
            <div className="absolute top-3 left-3">
              <Badge className="bg-blue-600 text-white border-0">
                Service
              </Badge>
            </div>
            {/* Featured badge */}
            {service.featured && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-yellow-600 text-white border-0">
                  <Award className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 flex-1 flex flex-col">
          {/* Category and complexity */}
          <div className="flex items-center justify-between mb-3">
            <Badge variant="outline" className="text-xs">
              {service.category.name}
            </Badge>
            {service.complexityLevel && (
              <Badge
                variant="outline"
                className={`text-xs ${getComplexityColor(service.complexityLevel)}`}
              >
                {service.complexityLevel}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-semibold mb-2 text-white group-hover:text-blue-200 transition-colors line-clamp-2">
            {service.title}
          </h3>

          {/* Description */}
          <p className="text-sm sm:text-base text-gray-300 line-clamp-2 sm:line-clamp-3 mb-3 sm:mb-4 flex-1">
            {service.description}
          </p>

          {/* Service details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{getDurationText()}</span>
            </div>

            {service.deliveryMethod && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{service.deliveryMethod.replace('_', ' ').toLowerCase()}</span>
              </div>
            )}
          </div>

          {/* Key features */}
          {service.serviceIncludes && service.serviceIncludes.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-400 mb-2">Includes:</p>
              <div className="flex flex-wrap gap-1">
                {service.serviceIncludes.slice(0, 2).map((feature, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs bg-white/10 text-gray-300">
                    {feature.length > 15 ? `${feature.substring(0, 15)}...` : feature}
                  </Badge>
                ))}
                {service.serviceIncludes.length > 2 && (
                  <Badge variant="secondary" className="text-xs bg-white/10 text-gray-300">
                    +{service.serviceIncludes.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {service.tags && service.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {service.tags.slice(0, 3).map((tag) => (
                <Badge key={tag.slug} variant="outline" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 sm:p-6 pt-0">
          <div className="w-full space-y-2">
            {/* Main CTA - Link to onboarding wizard */}
            <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 text-xs sm:text-sm">
              <Link href="/onboarding/wizard" className="flex items-center justify-center gap-2">
                Get Started
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </Button>

            {/* Secondary CTA - Learn more */}
            <Button asChild variant="ghost" size="sm" className="w-full text-gray-300 hover:text-white text-xs sm:text-sm">
              <Link href={`/marketplace/${service.slug}`}>
                Learn More
              </Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  CreditCard,
  Star,
  Download,
  AlertCircle
} from "lucide-react"
import { useCart } from "@/lib/store"
import { useToast } from "@/components/ui/use-toast"
import { RelatedProductsSkeleton } from "./related-products-skeleton"
import type { MarketplaceItem } from "@/types/marketplace"

interface RelatedProductsProps {
  currentProductId: string
  categorySlug?: string
  tags?: string[]
  maxItems?: number
  className?: string
}

interface RecommendationResponse {
  status: 'success' | 'error'
  data: {
    sourceItem: {
      id: string
      title: string
      category: string
    }
    recommendations: MarketplaceItem[]
  }
  message?: string
}

export function RelatedProducts({
  currentProductId,
  categorySlug,
  tags = [],
  maxItems = 4,
  className = ""
}: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<MarketplaceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const addItem = useCart((state) => state.addItem)
  const { toast } = useToast()

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50

  useEffect(() => {
    fetchRelatedProducts()
  }, [currentProductId])

  const fetchRelatedProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      // Try the recommendations endpoint first
      let response: Response
      try {
        response = await fetch(`/api/marketplace/recommendations/${currentProductId}`)
      } catch {
        // Fallback to getting products from the same category
        const fallbackUrl = categorySlug
          ? `/api/marketplace?category=${categorySlug}&limit=${maxItems + 1}`
          : `/api/marketplace?limit=${maxItems + 1}`
        response = await fetch(fallbackUrl)
      }

      if (!response.ok) {
        throw new Error('Failed to fetch related products')
      }

      const data: RecommendationResponse | { status: string; data: { items: MarketplaceItem[] } } = await response.json()

      if (data.status === 'success') {
        let products: MarketplaceItem[]

        if ('items' in data.data) {
          // Fallback response format from /api/marketplace endpoint
          products = data.data.items
        } else if ('recommendations' in data.data) {
          // Recommendations API response format
          products = data.data.recommendations
        } else {
          // Direct array format (legacy)
          products = data.data as MarketplaceItem[]
        }

        // Filter out the current product and limit results
        const filtered = products
          .filter(product => product.id !== currentProductId)
          .slice(0, maxItems)

        setRelatedProducts(filtered)
      } else {
        throw new Error('message' in data ? data.message || 'Failed to fetch related products' : 'Failed to fetch related products')
      }
    } catch (err) {
      console.error('Error fetching related products:', err)
      setError('Unable to load related products')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (e: React.MouseEvent, product: MarketplaceItem) => {
    e.preventDefault()
    e.stopPropagation()

    addItem({
      id: product.id,
      name: product.title,
      price: Number(product.discountPrice || product.price),
      image: product.imageUrl,
      quantity: 1
    })

    toast({
      title: "Added to cart",
      description: `${product.title} has been added to your cart.`,
    })
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && currentIndex < relatedProducts.length - getVisibleCount()) {
      setCurrentIndex(prev => prev + 1)
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }

  const getVisibleCount = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1280) return 4 // xl
      if (window.innerWidth >= 768) return 3   // md
      if (window.innerWidth >= 640) return 2   // sm
      return 1 // mobile
    }
    return 4
  }

  const nextSlide = () => {
    setCurrentIndex(prev =>
      Math.min(prev + 1, relatedProducts.length - getVisibleCount())
    )
  }

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0))
  }

  const getPrice = (product: MarketplaceItem) => {
    if ((product as any).customPricing) {
      if ((product as any).priceRangeMin && (product as any).priceRangeMax) {
        return `$${(product as any).priceRangeMin} - $${(product as any).priceRangeMax}`
      }
      return 'Contact for pricing'
    }

    return product.discountPrice || product.price
  }

  const hasDiscount = (product: MarketplaceItem) =>
    product.discountPrice && product.discountPrice < product.price

  if (loading) {
    return (
      <div className={className}>
        <RelatedProductsSkeleton count={maxItems} />
      </div>
    )
  }

  if (error || relatedProducts.length === 0) {
    return (
      <section className={`py-16 ${className}`}>
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
            Related Products
          </h2>
          {error ? (
            <div className="flex items-center justify-center py-12 text-center">
              <div className="glass-card p-8 rounded-2xl">
                <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <p className="text-gray-300 mb-4">{error}</p>
                <Button
                  variant="outline"
                  onClick={fetchRelatedProducts}
                  className="bg-white/5 hover:bg-white/10"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">No related products found.</p>
            </div>
          )}
        </div>
      </section>
    )
  }

  const visibleCount = getVisibleCount()
  const canNavigateLeft = currentIndex > 0
  const canNavigateRight = currentIndex < relatedProducts.length - visibleCount

  return (
    <section className={`py-16 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Related Products
            </h2>
            <p className="text-gray-400 mt-2">
              Discover similar products you might like
            </p>
          </div>

          {/* Navigation Controls - Hidden on mobile */}
          {relatedProducts.length > visibleCount && (
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={prevSlide}
                disabled={!canNavigateLeft}
                className="glass border-white/20 hover:border-purple-500/50 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextSlide}
                disabled={!canNavigateRight}
                className="glass border-white/20 hover:border-purple-500/50 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Products Grid/Carousel */}
        <div className="relative overflow-hidden">
          <motion.div
            className="flex gap-6"
            animate={{
              x: `calc(-${currentIndex * (100 / visibleCount)}% - ${currentIndex * 1.5}rem)`
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence>
              {relatedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex-shrink-0 w-full sm:w-1/2 md:w-1/3 xl:w-1/4"
                >
                  <Card className="group overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 glass-card border-white/10 hover:border-white/20 h-full flex flex-col">
                    {/* Product Image */}
                    <div className="aspect-[16/10] sm:aspect-[4/3] overflow-hidden bg-gradient-to-br from-purple-900/20 to-violet-900/20 relative">
                      <Link href={`/marketplace/${product.slug}`}>
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </Link>

                      {/* Badges */}
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-purple-600 text-white border-0">
                          <Download className="w-3 h-3 mr-1" />
                          Digital
                        </Badge>
                      </div>

                      {product.featured && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-yellow-600 text-white border-0">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        </div>
                      )}

                      {hasDiscount(product) && (
                        <div className="absolute bottom-3 left-3">
                          <Badge className="bg-red-600 text-white border-0">
                            Save ${(product.price - product.discountPrice!).toFixed(0)}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-4 flex-1 flex flex-col">
                      {/* Category */}
                      <div className="mb-3">
                        <Badge variant="outline" className="text-xs">
                          {product.category.name}
                        </Badge>
                      </div>

                      {/* Title */}
                      <Link href={`/marketplace/${product.slug}`}>
                        <h3 className="text-base font-semibold mb-2 text-white group-hover:text-purple-200 transition-colors line-clamp-2">
                          {product.title}
                        </h3>
                      </Link>

                      {/* Description */}
                      <p className="text-sm text-gray-300 line-clamp-2 mb-3 flex-1">
                        {product.description}
                      </p>

                      {/* Price */}
                      <div className="mb-4">
                        {(product as any).customPricing ? (
                          <div className="text-sm font-bold text-purple-400">
                            {getPrice(product)}
                          </div>
                        ) : hasDiscount(product) ? (
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-green-400">
                              ${product.discountPrice}
                            </span>
                            <span className="text-xs text-gray-400 line-through">
                              ${product.price}
                            </span>
                          </div>
                        ) : (
                          <div className="text-lg font-bold text-white">
                            ${product.price}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-purple-500/50 text-purple-300 hover:bg-purple-500/20 text-xs"
                          onClick={(e) => handleAddToCart(e, product)}
                          disabled={product.status !== 'AVAILABLE'}
                        >
                          <ShoppingCart className="w-3 h-3 mr-1" />
                          Add
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white border-0 text-xs"
                          onClick={(e) => {
                            e.preventDefault()
                            handleAddToCart(e, product)
                            window.location.href = '/checkout'
                          }}
                          disabled={product.status !== 'AVAILABLE'}
                        >
                          <CreditCard className="w-3 h-3 mr-1" />
                          Buy
                        </Button>
                      </div>

                      {/* View Details Link */}
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="w-full text-gray-300 hover:text-white text-xs mt-2"
                      >
                        <Link href={`/marketplace/${product.slug}`}>
                          View Details
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Mobile Swipe Indicator */}
        {relatedProducts.length > 1 && (
          <div className="flex justify-center mt-6 sm:hidden">
            <div className="flex gap-2">
              {Array.from({ length: Math.ceil(relatedProducts.length / visibleCount) }).map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    Math.floor(currentIndex / visibleCount) === index
                      ? 'bg-purple-500'
                      : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

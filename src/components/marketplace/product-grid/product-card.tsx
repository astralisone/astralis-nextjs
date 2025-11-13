"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, CreditCard, Download, Star, Layers } from "lucide-react"
import { useCart } from "@/lib/store"
import { useToast } from "@/components/ui/use-toast"
import { LazyImage } from "@/components/ui/lazy-image"
import { TierSelectionModal } from "../tier-selection-modal"
import type { MarketplaceItem, ConsolidatedProduct } from "@/types/marketplace"

interface ProductCardProps {
  product: MarketplaceItem | ConsolidatedProduct
  index: number
  className?: string
}

// Type guard to check if product is consolidated
function isConsolidatedProduct(product: MarketplaceItem | ConsolidatedProduct): product is ConsolidatedProduct {
  return 'baseProductName' in product && 'tierCount' in product
}

export function ProductCard({ product, index, className }: ProductCardProps) {
  const [showTierModal, setShowTierModal] = useState(false)
  const addItem = useCart((state) => state.addItem)
  const { toast } = useToast()
  const router = useRouter()

  const isConsolidated = isConsolidatedProduct(product)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isConsolidated) {
      // For consolidated products, open tier selection modal
      setShowTierModal(true)
      return
    }

    addItem({
      id: product.id,
      name: product.title,
      price: Number(product.discountPrice || product.price),
      image: product.imageUrl,
      quantity: 1,
    })
    toast({
      title: "Added to cart",
      description: `${product.title} has been added to your cart.`,
    })
  }

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isConsolidated) {
      // For consolidated products, open tier selection modal
      setShowTierModal(true)
      return
    }

    // Add to cart and navigate to checkout
    handleAddToCart(e)
    router.push('/checkout')
  }

  const getPrice = () => {
    if (isConsolidated) {
      return `From $${product.startingPrice}`
    }

    if (product.customPricing) {
      if (product.priceRangeMin && product.priceRangeMax) {
        return `$${product.priceRangeMin} - $${product.priceRangeMax}`
      }
      return 'Contact for pricing'
    }

    return product.discountPrice || product.price
  }

  const getPriceDisplay = () => {
    if (isConsolidated) {
      if (product.priceRange.min !== product.priceRange.max) {
        return (
          <div className="space-y-1">
            <div className="text-lg font-bold text-white">
              ${product.startingPrice}
            </div>
            <div className="text-xs text-gray-400">
              Up to ${product.priceRange.max}
            </div>
          </div>
        )
      } else {
        return (
          <div className="text-lg font-bold text-white">
            ${product.startingPrice}
          </div>
        )
      }
    }

    const hasDiscount = product.discountPrice && product.discountPrice < product.price

    if (product.customPricing) {
      return (
        <div className="text-lg font-bold text-purple-400">
          {getPrice()}
        </div>
      )
    } else if (hasDiscount) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-green-400">
            ${product.discountPrice}
          </span>
          <span className="text-sm text-gray-400 line-through">
            ${product.price}
          </span>
        </div>
      )
    } else {
      return (
        <div className="text-lg font-bold text-white">
          ${product.price}
        </div>
      )
    }
  }

  const getTitle = () => isConsolidated ? product.baseProductName : product.title
  const getSlug = () => product.slug
  const getFeatured = () => product.featured
  const getStatus = () => product.status

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`h-full ${className || ''}`}
    >
      <Card className="group overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 h-full flex flex-col">
        <CardHeader className="p-0">
          <div className="aspect-[16/10] sm:aspect-[3/2] overflow-hidden bg-gradient-to-br from-purple-900/20 to-violet-900/20 relative">
            <Link href={`/marketplace/${getSlug()}`}>
              <LazyImage
                src={product.imageUrl}
                alt={getTitle()}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                placeholderClassName="bg-gradient-to-br from-purple-900/20 to-violet-900/20"
              />
            </Link>

            {/* Product type badge */}
            <div className="absolute top-3 left-3">
              {isConsolidated ? (
                <Badge className="bg-blue-600 text-white border-0">
                  <Download className="w-3 h-3 mr-1" />
                  Multi-Tier
                </Badge>
              ) : product.itemType === 'SERVICE' ? (
                <Badge className="bg-green-600 text-white border-0">
                  <CreditCard className="w-3 h-3 mr-1" />
                  Service
                </Badge>
              ) : (
                <Badge className="bg-purple-600 text-white border-0">
                  <Download className="w-3 h-3 mr-1" />
                  Product
                </Badge>
              )}
            </div>


            {/* Featured badge */}
            {getFeatured() && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-yellow-600 text-white border-0">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              </div>
            )}

            {/* Discount badge for regular products */}
            {!isConsolidated && product.discountPrice && product.discountPrice < product.price && (
              <div className="absolute bottom-3 left-3">
                <Badge className="bg-red-600 text-white border-0">
                  Save ${(product.price - product.discountPrice!).toFixed(0)}
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-3 sm:p-4 w-full flex flex-col">
          {/* Category and complexity */}
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-xs">
              {product.category.name}
            </Badge>
            {!isConsolidated && product.complexityLevel && (
              <Badge variant="outline" className="text-xs">
                {product.complexityLevel}
              </Badge>
            )}
          </div>

          {/* Title */}
          <Link href={`/marketplace/${getSlug()}`}>
            <h3 className="text-sm sm:text-base font-semibold mb-1.5 text-white group-hover:text-purple-200 transition-colors line-clamp-2">
              {getTitle()}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 mb-2 w-full">
            {product.description}
          </p>


          {/* Tier information for consolidated products */}
          {isConsolidated && (
            <div className="mb-2 sm:mb-3">
              <p className="text-xs font-medium text-gray-400 mb-1">Available Tiers:</p>
              <div className="flex flex-wrap gap-1">
                {product.tiers.slice(0, 3).map((tier, idx) => (
                  <Badge
                    key={tier.id}
                    variant={tier.popular ? "default" : "secondary"}
                    className={`text-xs ${tier.popular ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-300'}`}
                  >
                    {tier.title}
                  </Badge>
                ))}
                {product.tiers.length > 3 && (
                  <Badge variant="secondary" className="text-xs bg-white/10 text-gray-300">
                    +{product.tiers.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Key features for regular products */}
          {!isConsolidated && product.features && product.features.length > 0 && (
            <div className="mb-2 sm:mb-3">
              <p className="text-xs font-medium text-gray-400 mb-1">Features:</p>
              <div className="flex flex-wrap gap-1">
                {product.features.slice(0, 3).map((feature, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs bg-white/10 text-gray-300">
                    {feature.length > 15 ? `${feature.substring(0, 15)}...` : feature}
                  </Badge>
                ))}
                {product.features.length > 3 && (
                  <Badge variant="secondary" className="text-xs bg-white/10 text-gray-300">
                    +{product.features.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {product.tags.slice(0, 3).map((tag) => (
                <Badge key={tag.slug} variant="outline" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          {/* License type */}
          {product.licenseType && (
            <div className="text-xs text-gray-400 mb-1">
              License: {product.licenseType}
            </div>
          )}
        </CardContent>

        <CardFooter className="p-3 sm:p-4 pt-0">
          <div className="w-full space-y-1.5">
            {/* Purchase buttons */}
            <div className="flex flex-col gap-1.5">
              {isConsolidated ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/20 text-xs sm:text-sm"
                    onClick={handleAddToCart}
                    disabled={getStatus() !== 'AVAILABLE'}
                  >
                    <Layers className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Select Tier</span>
                    <span className="sm:hidden">Select</span>
                  </Button>
                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white border-0 text-xs sm:text-sm"
                    onClick={handleBuyNow}
                    disabled={getStatus() !== 'AVAILABLE'}
                  >
                    <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Compare & Buy</span>
                    <span className="sm:hidden">Compare</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/20 text-xs sm:text-sm"
                    onClick={handleAddToCart}
                    disabled={getStatus() !== 'AVAILABLE'}
                  >
                    <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Add to Cart</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white border-0 text-xs sm:text-sm"
                    onClick={handleBuyNow}
                    disabled={getStatus() !== 'AVAILABLE'}
                  >
                    <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Buy Now</span>
                    <span className="sm:hidden">Buy</span>
                  </Button>
                </>
              )}
            </div>

            {/* View details button */}
            <Button asChild variant="ghost" size="sm" className="w-full text-gray-300 hover:text-white text-xs sm:text-sm">
              <Link href={`/marketplace/${getSlug()}`}>
                {isConsolidated ? 'View All Tiers' : 'View Details'}
              </Link>
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Tier Selection Modal for Consolidated Products */}
      {isConsolidated && (
        <TierSelectionModal
          isOpen={showTierModal}
          onClose={() => setShowTierModal(false)}
          product={product}
        />
      )}
    </motion.div>
  )
}

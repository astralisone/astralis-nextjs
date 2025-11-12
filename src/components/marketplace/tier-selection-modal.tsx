"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { X, Check, Star, ShoppingCart, CreditCard } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useCart } from "@/lib/store/cart"
import { useToast } from "@/components/ui/use-toast"
import type { ProductTier, ConsolidatedProduct } from "@/types/marketplace"

interface TierSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  product: ConsolidatedProduct
}

export function TierSelectionModal({ isOpen, onClose, product }: TierSelectionModalProps) {
  const [selectedTier, setSelectedTier] = useState<ProductTier | null>(null)
  const addItem = useCart((state) => state.addItem)
  const { toast } = useToast()
  const router = useRouter()

  const handleAddToCart = (tier: ProductTier) => {
    addItem({
      id: tier.id,
      name: tier.title,
      price: Number(tier.discountPrice || tier.price),
      image: product.imageUrl,
      quantity: 1,
    })
    toast({
      title: "Added to cart",
      description: `${tier.title} has been added to your cart.`,
    })
    onClose()
  }

  const handleBuyNow = (tier: ProductTier) => {
    handleAddToCart(tier)
    router.push('/checkout')
  }

  const getFeatureComparison = () => {
    const allFeatures = new Set<string>()
    product.tiers.forEach(tier => {
      tier.serviceIncludes?.forEach(feature => allFeatures.add(feature))
    })
    return Array.from(allFeatures)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-neutral-900/95 backdrop-blur-lg border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white mb-4">
            Choose Your {product.baseProductName} Plan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Overview */}
          <div className="flex gap-4">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden">
              <Image
                src={product.imageUrl}
                alt={product.baseProductName}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2">{product.baseProductName}</h3>
              <p className="text-gray-300 text-sm">{product.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{product.category.name}</Badge>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-300">{product.ratingAverage} ({product.ratingCount} reviews)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tier Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {product.tiers.map((tier) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative ${selectedTier?.id === tier.id ? 'ring-2 ring-purple-500' : ''}`}
              >
                <Card className={`h-full cursor-pointer transition-all duration-300 bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 ${
                  tier.popular ? 'border-purple-500/50 bg-purple-500/5' : ''
                }`}>
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-purple-600 text-white border-0 px-3 py-1">
                        <Star className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-4">
                    <h4 className="text-lg font-semibold text-white">{tier.tierSuffix}</h4>
                    <div className="space-y-1">
                      {tier.discountPrice ? (
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-2xl font-bold text-green-400">
                            ${tier.discountPrice}
                          </span>
                          <span className="text-sm text-gray-400 line-through">
                            ${tier.price}
                          </span>
                        </div>
                      ) : (
                        <div className="text-2xl font-bold text-white">
                          ${tier.price}
                        </div>
                      )}
                    </div>
                    {tier.complexityLevel && (
                      <Badge variant="outline" className="text-xs">
                        {tier.complexityLevel}
                      </Badge>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Features */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-400">Includes:</p>
                      <ul className="space-y-1">
                        {tier.serviceIncludes?.slice(0, 6).map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                            <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                        {tier.serviceIncludes && tier.serviceIncludes.length > 6 && (
                          <li className="text-sm text-gray-400">
                            +{tier.serviceIncludes.length - 6} more features
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2 pt-4">
                      <Button
                        onClick={() => handleBuyNow(tier)}
                        className={`w-full ${
                          tier.popular
                            ? 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700'
                            : 'bg-gradient-to-r from-purple-600/80 to-violet-600/80 hover:from-purple-600 hover:to-violet-600'
                        } text-white border-0`}
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Buy Now
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleAddToCart(tier)}
                        className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Feature Comparison Table (Optional - for products with many tiers) */}
          {product.tiers.length > 2 && (
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-white mb-4">Feature Comparison</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-2 text-gray-400">Features</th>
                      {product.tiers.map(tier => (
                        <th key={tier.id} className="text-center py-2 text-white min-w-[120px]">
                          {tier.tierSuffix}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {getFeatureComparison().slice(0, 8).map((feature, idx) => (
                      <tr key={idx} className="border-b border-white/5">
                        <td className="py-2 text-gray-300">{feature}</td>
                        {product.tiers.map(tier => (
                          <td key={tier.id} className="text-center py-2">
                            {tier.serviceIncludes?.includes(feature) ? (
                              <Check className="w-4 h-4 text-green-400 mx-auto" />
                            ) : (
                              <X className="w-4 h-4 text-gray-600 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

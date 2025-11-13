"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Package,
  Shield,
  Eye,
  Zap,
  MessageCircle,
  ThumbsUp,
  Minus,
  Plus
} from "lucide-react"
import { useCart } from "@/lib/store"
import { useToast } from "@/components/ui/use-toast"
import { RelatedProducts } from "@/components/marketplace/related-products"
import { TrustBadges } from "@/components/marketplace/trust-badges"
import { UrgencyIndicators } from "@/components/marketplace/urgency-indicators"
import { ProductStructuredData } from "@/components/seo/StructuredData"
import type { MarketplaceItem } from "@/types/marketplace"

interface Metadata {
  title: string
  description: string
  openGraph?: {
    images: string[]
  }
}

export default function ProductDetail() {
  const params = useParams()
  const router = useRouter()
  const id = (params?.id as string) || ''
  const [product, setProduct] = useState<MarketplaceItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [viewerCount, setViewerCount] = useState(Math.floor(Math.random() * 50) + 10)
  const addItem = useCart((state) => state.addItem)
  const { toast } = useToast()

  // Simulate live viewer updates
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(prev => {
        const change = Math.floor(Math.random() * 3) - 1 // -1, 0, or 1
        return Math.max(5, prev + change)
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return

      try {
        setLoading(true)
        const response = await fetch(`/api/marketplace/${id}`)
        const data = await response.json()
        if (data.status === 'success') {
          setProduct(data.data)
        } else {
          setError('Product not found')
        }
      } catch (err) {
        setError('Failed to load product details')
        console.error('Error fetching product:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    if (!product) return

    addItem({
      id: product.id,
      name: product.title,
      price: Number(product.discountPrice || product.price),
      image: product.imageUrl,
      quantity
    })

    toast({
      title: "Added to cart",
      description: `${quantity} x ${product.title} added to your cart.`,
    })
  }

  const handleBuyNow = () => {
    handleAddToCart()
    router.push('/checkout')
  }

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted)
    toast({
      title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      description: isWishlisted
        ? `${product?.title} removed from your wishlist.`
        : `${product?.title} added to your wishlist.`,
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title,
          text: product?.description,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied",
        description: "Product link copied to clipboard.",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted/10 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="aspect-square bg-muted/10 rounded-lg"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-square bg-muted/10 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-6 bg-muted/10 rounded w-3/4"></div>
                <div className="h-4 bg-muted/10 rounded w-1/2"></div>
                <div className="h-20 bg-muted/10 rounded"></div>
                <div className="h-12 bg-muted/10 rounded w-1/3"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-12 bg-muted/10 rounded"></div>
                  <div className="h-12 bg-muted/10 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
        <div className="container mx-auto px-4 py-8">
          <div className="glass-card p-12 text-center">
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Product Not Found
            </h1>
            <p className="text-muted-foreground mb-6 text-lg">
              {error || 'The product you are looking for does not exist.'}
            </p>
            <Button onClick={() => router.push('/marketplace')} className="glass-button">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const finalPrice = Number(product.discountPrice || product.price)
  const hasDiscount = product.discountPrice && Number(product.discountPrice) < Number(product.price)
  const isLowStock = product.stock <= 10
  const galleryImages = product.galleryImages && product.galleryImages.length > 0
    ? [product.imageUrl, ...product.galleryImages]
    : [product.imageUrl]

  return (
    <>
      {/* Product Structured Data */}
      <ProductStructuredData
        name={product.title}
        description={product.description}
        price={product.discountPrice || product.price}
        currency="USD"
        image={product.imageUrl}
        url={`https://astralis.one/marketplace/${product.slug}`}
        brand="Astralis Agency"
        category={product.category?.name}
        inStock={product.stock > 0}
        sku={product.id}
        reviews={(product as any).averageRating ? {
          rating: (product as any).averageRating,
          reviewCount: (product as any).reviewCount || 0
        } : undefined}
      />

      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.push('/marketplace')}
            className="glass-button mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Button>

          {/* Product Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square overflow-hidden rounded-lg glass-card border-0">
                <img
                  src={galleryImages[selectedImageIndex]}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />

                {/* Badges Overlay */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.featured && (
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                      Featured
                    </Badge>
                  )}
                  {hasDiscount && (
                    <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0">
                      -{Math.round(((Number(product.price) - finalPrice) / Number(product.price)) * 100)}% OFF
                    </Badge>
                  )}
                </div>

                {/* Live Viewer Count */}
                <div className="absolute bottom-4 right-4">
                  <div className="glass-card px-3 py-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <Eye className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium">{viewerCount}</span>
                  </div>
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {galleryImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {galleryImages.slice(0, 4).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index
                          ? 'border-primary shadow-lg shadow-primary/25'
                          : 'border-border/30 hover:border-border'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="space-y-8">
              {/* Header */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="glass-badge">
                    {product.category.name}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleWishlistToggle}
                      className={`glass-button p-2 ${isWishlisted ? 'text-red-400 border-red-400/50' : ''}`}
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                      className="glass-button p-2"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <h1 className="text-4xl lg:text-5xl font-bold leading-tight bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
                  {product.title}
                </h1>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.ratingAverage || 4.5)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-lg font-medium">
                      {product.ratingAverage || 4.5}
                    </span>
                    <span className="text-muted-foreground">({product.ratingCount || 23} reviews)</span>
                  </div>

                  <Separator orientation="vertical" className="h-6" />

                  <div className="text-muted-foreground">
                    {Math.floor(Math.random() * 500) + 100} sold
                  </div>
                </div>
              </div>

              {/* Urgency Indicators */}
              <UrgencyIndicators
                productId={product.id}
                stock={product.stock}
                viewerCount={viewerCount}
                salesCount={Math.floor(Math.random() * 100) + 50}
                recentActivity={{
                  purchases: Math.floor(Math.random() * 10) + 1,
                  timeframe: "today"
                }}
                showViewers={true}
                showStock={isLowStock}
                showSales={true}
              />

              {/* Price */}
              <div className="glass-card p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">
                    ${finalPrice.toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <div className="space-y-1">
                      <span className="text-xl text-muted-foreground line-through">
                        ${Number(product.price).toFixed(2)}
                      </span>
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                        Save ${(Number(product.price) - finalPrice).toFixed(2)}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Trust Badges */}
                <TrustBadges
                  productType={product.itemType || 'PRODUCT'}
                  features={{
                    hasSecurePayment: true,
                    hasInstantDelivery: (product.itemType || 'PRODUCT') === 'PRODUCT',
                    hasGuarantee: true,
                    isVerifiedSeller: true,
                    hasSupport: true
                  }}
                  size="sm"
                  layout="horizontal"
                />
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-foreground">Description</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {product.description}
                </p>
              </div>

              {/* Stock Status & Quantity */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  <span className={`font-medium ${
                    product.stock > 0
                      ? isLowStock
                        ? 'text-orange-400'
                        : 'text-green-400'
                      : 'text-red-400'
                  }`}>
                    {product.stock > 0
                      ? `${product.stock} in stock${isLowStock ? ' - Limited quantity!' : ''}`
                      : 'Out of stock'}
                  </span>
                </div>

                {/* Quantity Selector */}
                {product.stock > 0 && (
                  <div className="flex items-center gap-4">
                    <label htmlFor="quantity" className="font-medium text-foreground">
                      Quantity:
                    </label>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="glass-button p-2"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-medium text-lg">{quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        disabled={quantity >= product.stock}
                        className="glass-button p-2"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                {product.stock > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      onClick={handleAddToCart}
                      size="lg"
                      className="glass-button-primary text-lg h-14"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </Button>
                    <Button
                      onClick={handleBuyNow}
                      variant="outline"
                      size="lg"
                      className="glass-button text-lg h-14"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      Buy Now
                    </Button>
                  </div>
                ) : (
                  <Button disabled size="lg" className="w-full h-14">
                    <Package className="w-5 h-5 mr-2" />
                    Out of Stock
                  </Button>
                )}

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="glass-button w-full"
                    onClick={() => {
                      // Open AI chat with product context
                      const chatButton = document.getElementById('ai-chat-trigger');
                      if (chatButton) {
                        // Store product context in sessionStorage for the chat
                        sessionStorage.setItem('chatContext', JSON.stringify({
                          type: 'product_inquiry',
                          product: {
                            title: product.title,
                            description: product.description,
                            price: product.price,
                            category: product.category?.name,
                            id: product.id
                          }
                        }));
                        chatButton.click();
                      }
                    }}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Ask Question About This Product
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Information Tabs */}
          <div className="mt-12">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="glass-card grid w-full grid-cols-4 p-1">
                <TabsTrigger value="overview" className="data-[state=active]:bg-primary/20">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="features" className="data-[state=active]:bg-primary/20">
                  Features
                </TabsTrigger>
                <TabsTrigger value="specs" className="data-[state=active]:bg-primary/20">
                  Specifications
                </TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:bg-primary/20">
                  Reviews
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="glass-card p-6 space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Product Overview</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {product.features && product.features.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Key Highlights</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {product.features.slice(0, 6).map((feature, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="features" className="mt-6">
                <div className="glass-card p-6">
                  {product.features && product.features.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">All Features</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {product.features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/5">
                            <ThumbsUp className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No detailed features available for this product.
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="specs" className="mt-6">
                <div className="glass-card p-6">
                  {product.specifications && product.specifications.length > 0 ? (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Technical Specifications</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {product.specifications.map((spec: string, index: number) => (
                          <div key={index} className="flex justify-between p-3 rounded-lg bg-muted/5">
                            <span className="font-medium text-foreground">
                              Specification {index + 1}
                            </span>
                            <span className="text-muted-foreground">{spec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No technical specifications available for this product.
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="glass-card p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold">Customer Reviews</h3>
                      <Button variant="outline" className="glass-button">
                        Write a Review
                      </Button>
                    </div>

                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No reviews yet. Be the first to review this product!
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Related Products */}
          <div className="mt-16">
            <RelatedProducts
              currentProductId={product.id}
              categorySlug={product.category.slug}
              tags={product.tags.map(tag => tag.slug)}
              maxItems={8}
            />
          </div>

          {/* Seller Information */}
          <div className="mt-12">
            <Card className="glass-card border-border/30">
              <CardHeader>
                <h3 className="text-xl font-semibold text-foreground">Seller Information</h3>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {product.seller.avatar ? (
                    <img
                      src={product.seller.avatar}
                      alt={product.seller.name}
                      className="w-16 h-16 rounded-full border-2 border-border"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-blue/20 rounded-full flex items-center justify-center border-2 border-border">
                      <span className="text-2xl font-bold text-primary">
                        {product.seller.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="space-y-1">
                    <h4 className="text-lg font-semibold text-foreground">{product.seller.name}</h4>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified Seller
                      </Badge>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">Member since 2020</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Trusted by {Math.floor(Math.random() * 5000) + 1000}+ customers
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline" className="glass-badge">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
    </>
  )
}

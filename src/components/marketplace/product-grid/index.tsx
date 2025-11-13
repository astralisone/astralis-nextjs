"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Grid, List, Loader2 } from "lucide-react"
import { ProductCard } from "./product-card"
import { MarketplaceItem, ConsolidatedProduct, ItemStatus, ItemType } from "@/types/marketplace"
import { products as fallbackProducts } from "@/lib/marketplace/data"

// Convert Product type to MarketplaceItem type for fallback
const convertProductToMarketplaceItem = (product: any): MarketplaceItem => ({
  id: `fallback-${product.id}`,
  title: product.name,
  slug: product.slug,
  description: product.description,
  price: product.price,
  imageUrl: product.image,
  status: ItemStatus.AVAILABLE,
  itemType: ItemType.PRODUCT,
  category: {
    id: '1',
    name: product.category,
    slug: product.category.toLowerCase().replace(/\s+/g, '-')
  },
  seller: {
    id: '1',
    name: 'Astralis Agency',
    avatar: undefined
  },
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  stock: Math.floor(Math.random() * 50) + 10,
  isRecurring: false,
  consultationRequired: false,
  customPricing: false,
  ratingAverage: 4.5,
  ratingCount: Math.floor(Math.random() * 100) + 10,
  featured: Math.random() > 0.7,
  published: true
})

interface ProductGridProps {
  products?: (MarketplaceItem | ConsolidatedProduct)[]
  viewMode?: 'grid' | 'list'
  loading?: boolean
  error?: string | null
  className?: string
  emptyMessage?: string
  enableInfiniteScroll?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
}

export function ProductGrid({
  products,
  viewMode = 'grid',
  loading = false,
  error = null,
  className = "",
  emptyMessage = "No products found",
  enableInfiniteScroll = false,
  onLoadMore,
  hasMore = false
}: ProductGridProps) {
  const [displayProducts, setDisplayProducts] = useState<(MarketplaceItem | ConsolidatedProduct)[]>([])
  const [isIntersecting, setIsIntersecting] = useState(false)

  // Use provided products or fallback to static products
  useEffect(() => {
    console.log('ProductGrid rendering logic:', {
      hasProducts: products && products.length > 0,
      productsLength: products?.length,
      loading,
      error,
      fallbackLength: fallbackProducts.length
    })

    if (products && products.length > 0) {
      console.log('✅ Using API products:', products.length)
      console.log('First 3 API product names:', products.slice(0, 3).map(p =>
        'baseProductName' in p ? p.baseProductName : p.title
      ))
      setDisplayProducts(products)
    } else if (!loading && !error) {
      console.log('⚠️ Using fallback products:', fallbackProducts.length)
      console.log('First 3 fallback titles:', fallbackProducts.slice(0, 3).map(p => p.name))
      const convertedProducts = fallbackProducts.map(convertProductToMarketplaceItem)
      setDisplayProducts(convertedProducts)
    } else {
      console.log('🔄 Clearing display products (loading or error state)')
      setDisplayProducts([])
    }
  }, [products, loading, error])

  // Infinite scroll observer
  useEffect(() => {
    if (!enableInfiniteScroll || !onLoadMore || !hasMore) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading) {
          setIsIntersecting(true)
          onLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    const sentinel = document.getElementById('scroll-sentinel')
    if (sentinel) observer.observe(sentinel)

    return () => observer.disconnect()
  }, [enableInfiniteScroll, onLoadMore, hasMore, loading])

  // Grid layout classes based on view mode
  const gridClasses = {
    grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
    list: "flex flex-col space-y-4"
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4
      }
    }
  }

  if (loading && displayProducts.length === 0) {
    return (
      <div className={`${gridClasses[viewMode]} ${className}`}>
        {[...Array(12)].map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="aspect-square bg-muted/10 rounded-lg animate-pulse glass-card" />
            <div className="space-y-2">
              <div className="h-4 bg-muted/10 rounded animate-pulse" />
              <div className="h-6 bg-muted/10 rounded animate-pulse w-20" />
              <div className="h-3 bg-muted/10 rounded animate-pulse w-16" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card p-12 text-center border-red-500/20 bg-red-500/5">
        <p className="text-red-400 mb-4">{error}</p>
        <p className="text-muted-foreground">Please try again later.</p>
      </div>
    )
  }

  if (displayProducts.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <Grid className="w-16 h-16 mx-auto mb-6 text-muted-foreground/50" />
        <h3 className="text-xl font-semibold mb-2 text-foreground">{emptyMessage}</h3>
        <p className="text-muted-foreground">
          Try adjusting your search criteria or browse our categories.
        </p>
      </div>
    )
  }

  // Debug: Log final displayProducts before rendering
  console.log('🎯 Final displayProducts to render:', {
    count: displayProducts.length,
    ids: displayProducts.map(p => 'baseProductName' in p ? p.slug : p.id),
    titles: displayProducts.map(p => 'baseProductName' in p ? p.baseProductName : p.title),
    hasDuplicateIds: displayProducts.length !== new Set(displayProducts.map(p => 'baseProductName' in p ? p.slug : p.id)).size
  })

  return (
    <div className={className}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={gridClasses[viewMode]}
      >
        <AnimatePresence>
          {displayProducts.map((product, index) => {
            const productKey = 'baseProductName' in product ? product.slug : product.id
            return (
              <motion.div
                key={productKey}
                variants={itemVariants}
                className="w-full"
              >
                {viewMode === 'grid' ? (
                  <ProductCard
                    product={product}
                    index={index}
                    className="h-full"
                  />
                ) : (
                  <ProductCard
                    product={product}
                    index={index}
                    className="h-full"
                  />
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>

      {/* Infinite Scroll Sentinel */}
      {enableInfiniteScroll && hasMore && (
        <div
          id="scroll-sentinel"
          className="flex justify-center py-8"
        >
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading more products...</span>
            </div>
          ) : (
            <div className="h-20" /> // Invisible trigger area
          )}
        </div>
      )}

      {/* Loading more indicator */}
      <AnimatePresence>
        {loading && displayProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex justify-center py-8"
          >
            <div className="glass-card px-6 py-3 flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading more products...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

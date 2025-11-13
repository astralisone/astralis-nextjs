"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, Grid, List, SlidersHorizontal } from "lucide-react"
import { ProductGrid } from "@/components/marketplace/product-grid"
import { HorizontalFilters, HorizontalFilterState } from "@/components/marketplace/horizontal-filters"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MarketplaceItem, ConsolidatedProduct } from "@/types/marketplace"
import { seoConfigs } from "@/hooks/useSEO"
import api from "@/lib/axios"
import { useToast } from "@/components/ui/use-toast"
import { Metadata } from "next"

interface ConsolidatedMarketplaceResponse {
  items: ConsolidatedProduct[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

interface MarketplaceResponse {
  items: MarketplaceItem[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<ConsolidatedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState<HorizontalFilterState>({
    search: '',
    category: '',
    itemType: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const { toast } = useToast()

  // Fetch products with current filters
  const fetchProducts = useCallback(async (page = 1, newFilters = filters) => {
    console.log('🔄 fetchProducts called with:', { page, newFilters })
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', '12')

      if (newFilters.search) params.set('search', newFilters.search)
      if (newFilters.category) params.set('category', newFilters.category)
      if (newFilters.itemType) params.set('itemType', newFilters.itemType)
      params.set('sortBy', newFilters.sortBy)
      params.set('sortOrder', newFilters.sortOrder)

      console.log('🌐 Making API call to:', `/marketplace/consolidated?${params.toString()}`)
      const response = await api.get(`/marketplace/consolidated?${params.toString()}`)

      if (response.data.status === 'success') {
        const data: ConsolidatedMarketplaceResponse = response.data.data
        console.log('✅ Consolidated Marketplace API Success:', {
          itemsReceived: data.items?.length,
          total: data.pagination.total,
          firstFewNames: data.items?.slice(0, 3).map(item => item.baseProductName)
        })
        setProducts(data.items || [])
        setTotalItems(data.pagination.total || 0)
        setCurrentPage(data.pagination.page || 1)
        setTotalPages(data.pagination.totalPages || 1)
      } else {
        throw new Error(response.data.message || 'Failed to fetch products')
      }
    } catch (err: any) {
      console.error('❌ Error fetching products:', err)
      setError(err.message || 'Failed to load products')
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [filters, toast])

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: HorizontalFilterState) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page
    fetchProducts(1, newFilters)
  }, [fetchProducts])

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    fetchProducts(page)
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [fetchProducts])

  // Initial load
  useEffect(() => {
    console.log('🚀 MarketplacePage useEffect - initial load')
    fetchProducts()
  }, [fetchProducts])


  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      {/* Hero Section */}
      <div className="glass-card border-0 border-b border-border/20">
        <div className="container mx-auto px-4 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
                Digital
              </span>
              <span className="bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">
                Marketplace
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed">
              Explore our curated collection of digital products, design assets, and professional services.
              Everything you need to elevate your projects.
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
              <div className="glass-card p-4 sm:p-6 text-center">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">
                  {totalItems}
                </div>
                <div className="text-sm text-muted-foreground">Products</div>
              </div>
              <div className="glass-card p-4 sm:p-6 text-center">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  24/7
                </div>
                <div className="text-sm text-muted-foreground">Support</div>
              </div>
              <div className="glass-card p-4 sm:p-6 text-center">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Instant
                </div>
                <div className="text-sm text-muted-foreground">Delivery</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Horizontal Filters Bar */}
      <HorizontalFilters
        onFiltersChange={handleFiltersChange}
        totalItems={totalItems}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="space-y-6">
          {/* View Mode Toggle */}
          <div className="flex justify-end">
            <div className="glass-card p-1 flex">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="px-3"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-3"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

            {/* Loading State */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-16 space-y-4"
                >
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Loading products...</p>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="glass-card p-8 text-center border-red-500/20 bg-red-500/5"
                >
                  <p className="text-red-400 mb-4">{error}</p>
                  <Button
                    onClick={() => fetchProducts(currentPage)}
                    variant="outline"
                    className="glass-button"
                  >
                    Try Again
                  </Button>
                </motion.div>
              ) : products.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="glass-card p-12 text-center"
                >
                  <SlidersHorizontal className="w-16 h-16 mx-auto mb-6 text-muted-foreground/50" />
                  <h3 className="text-xl font-semibold mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters or search terms to find what you're looking for.
                  </p>
                  <Button
                    onClick={() => handleFiltersChange({
                      search: '',
                      category: '',
                      itemType: '',
                      sortBy: 'createdAt',
                      sortOrder: 'desc'
                    })}
                    variant="outline"
                    className="glass-button"
                  >
                    Clear All Filters
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="products"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ProductGrid
                    products={products}
                    viewMode={viewMode}
                    loading={loading}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center mt-12"
              >
                <div className="glass-card p-2 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="glass-button"
                  >
                    Previous
                  </Button>

                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const page = Math.max(1, currentPage - 2) + i
                    if (page > totalPages) return null

                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={page === currentPage ? '' : 'glass-button'}
                      >
                        {page}
                      </Button>
                    )
                  })}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="glass-button"
                  >
                    Next
                  </Button>
                </div>
              </motion.div>
            )}
        </div>
      </div>
    </div>
    </>
  )
}

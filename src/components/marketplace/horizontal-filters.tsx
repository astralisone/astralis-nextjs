"use client"

import React, { useState, useCallback, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, SlidersHorizontal, X, Filter, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDebounce } from "@/hooks/useDebounce"
import { cn } from "@/lib/utils"
import api from "@/lib/axios"

export interface HorizontalFilterState {
  search: string
  category: string
  itemType: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

interface HorizontalFiltersProps {
  onFiltersChange: (filters: HorizontalFilterState) => void
  totalItems?: number
  className?: string
}

interface Category {
  id: string
  name: string
  slug: string
  description: string
  itemsCount: number
}

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest First' },
  { value: 'createdAt-asc', label: 'Oldest First' },
  { value: 'title-asc', label: 'Name A-Z' },
  { value: 'title-desc', label: 'Name Z-A' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'featured-desc', label: 'Featured' }
] as const

const ITEM_TYPES = [
  { value: 'all', label: 'All Items' },
  { value: 'PRODUCT', label: 'Products' },
  { value: 'SERVICE', label: 'Services' },
]

const INITIAL_FILTERS: HorizontalFilterState = {
  search: '',
  category: '',
  itemType: '',
  sortBy: 'createdAt',
  sortOrder: 'desc'
}

export function HorizontalFilters({
  onFiltersChange,
  totalItems = 0,
  className
}: HorizontalFiltersProps) {
  console.log('🎯 HorizontalFilters component rendered!')
  const [searchInput, setSearchInput] = useState('')
  const [filters, setFilters] = useState<HorizontalFilterState>(INITIAL_FILTERS)
  const [isSticky, setIsSticky] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const filterBarRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Calculate navbar height (accounting for padding and border)
  // navbar has py-4 (1rem top + 1rem bottom = 2rem = 32px) + border + content (~32px) = ~65px total
  const NAVBAR_HEIGHT = 65

  // Debounced search
  const debouncedSearch = useDebounce(searchInput, 500)

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('🔄 Fetching categories from API...')
        setCategoriesLoading(true)
        const response = await api.get('/marketplace/categories')
        console.log('📊 Categories API response:', response.data)
        if (response.data.status === 'success') {
          console.log('✅ Categories loaded:', response.data.data.length, 'categories')
          setCategories(response.data.data)
        }
      } catch (error) {
        console.error('❌ Error fetching categories:', error)
      } finally {
        setCategoriesLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Update filters when debounced search changes
  useEffect(() => {
    if (filters.search !== debouncedSearch) {
      const newFilters = { ...filters, search: debouncedSearch }
      setFilters(newFilters)
      onFiltersChange(newFilters)
    }
  }, [debouncedSearch])

  // Handle sticky behavior with Intersection Observer
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting)
      },
      { threshold: 0 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value)
  }, [])

  const handleCategoryChange = useCallback((value: string) => {
    const category = value === 'all' ? '' : value
    const newFilters = { ...filters, category }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }, [filters, onFiltersChange])

  const handleItemTypeChange = useCallback((value: string) => {
    console.log('🔄 handleItemTypeChange called with value:', value)
    const itemType = value === 'all' ? '' : value
    const newFilters = { ...filters, itemType }
    console.log('📤 Sending new filters:', newFilters)
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }, [filters, onFiltersChange])

  const handleSortChange = useCallback((value: string) => {
    const [sortBy, sortOrder] = value.split('-') as [string, 'asc' | 'desc']
    const newFilters = { ...filters, sortBy, sortOrder }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }, [filters, onFiltersChange])

  const clearFilters = useCallback(() => {
    setSearchInput('')
    setFilters(INITIAL_FILTERS)
    onFiltersChange(INITIAL_FILTERS)
  }, [onFiltersChange])

  const clearSearch = useCallback(() => {
    setSearchInput('')
    const newFilters = { ...filters, search: '' }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }, [filters, onFiltersChange])

  // Count active filters
  const activeFiltersCount = [
    searchInput.trim(),
    filters.category,
    filters.itemType,
    filters.sortBy !== INITIAL_FILTERS.sortBy ? filters.sortBy : ''
  ].filter(Boolean).length

  // Create dynamic categories array with "All Categories" option - show all categories including empty ones
  const dynamicCategories = [
    { value: 'all', label: 'All Categories' },
    ...categories
      .map(cat => ({ value: cat.slug, label: `${cat.name} (${cat.itemsCount})` }))
  ]

  const currentSort = `${filters.sortBy}-${filters.sortOrder}`
  const currentSortLabel = SORT_OPTIONS.find(opt => opt.value === currentSort)?.label || 'Sort'
  const currentCategoryLabel = dynamicCategories.find(cat => cat.value === (filters.category || 'all'))?.label || 'All Categories'
  const currentItemTypeLabel = ITEM_TYPES.find(type => type.value === (filters.itemType || 'all'))?.label || 'All Items'

  console.log('🎯 Filter UI State:', {
    currentItemType: filters.itemType || 'all',
    currentItemTypeLabel,
    availableTypes: ITEM_TYPES,
    currentFilters: filters,
    categoriesCount: categories.length,
    categoriesLoading
  })

  return (
    <>
      {/* Sentinel element for intersection observer */}
      <div ref={sentinelRef} className="h-0" />

      {/* Filter Bar */}
      <div
        ref={filterBarRef}
        className={cn(
          "transition-all duration-300 z-30",
          isSticky ? "fixed left-0 right-0 shadow-lg shadow-black/30" : "relative",
          className
        )}
        style={{
          top: isSticky ? `${NAVBAR_HEIGHT}px` : undefined
        }}
      >
        <div className={cn(
          "glass-card border-x-0 rounded-none",
          isSticky ? "border-t border-white/10 backdrop-blur-xl bg-neutral-900/95" : "border-0"
        )}>
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 py-4">
              {/* Search Bar - Expandable on desktop, always visible */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchInput}
                    onChange={handleSearchChange}
                    className="pl-10 pr-10 h-10 glass-input bg-white/5 border-white/10 focus:border-primary/50"
                  />
                  {searchInput && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSearch}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Item Type Dropdown - Always Visible */}
              <div className="flex items-center gap-2">
                <Select
                  value={filters.itemType || 'all'}
                  onValueChange={handleItemTypeChange}
                >
                  <SelectTrigger className="w-[140px] h-10 glass-input bg-white/5 border-white/10">
                    <SelectValue placeholder="Item Type">
                      {currentItemTypeLabel}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="glass-card bg-neutral-900/95 backdrop-blur-xl">
                    {ITEM_TYPES.map(itemType => (
                      <SelectItem
                        key={itemType.value}
                        value={itemType.value}
                        className="focus:bg-white/10"
                      >
                        {itemType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Desktop Filters */}
              <div className="hidden md:flex items-center gap-3">
                {/* Category Dropdown */}
                <Select
                  value={filters.category || 'all'}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="w-[180px] h-10 glass-input bg-white/5 border-white/10">
                    <SelectValue placeholder="Category">
                      {categoriesLoading ? 'Loading...' : currentCategoryLabel}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="glass-card bg-neutral-900/95 backdrop-blur-xl">
                    {dynamicCategories.map(category => (
                      <SelectItem
                        key={category.value}
                        value={category.value}
                        className="focus:bg-white/10"
                      >
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Item Type Dropdown */}
                <Select
                  value={filters.itemType || 'all'}
                  onValueChange={handleItemTypeChange}
                >
                  <SelectTrigger className="w-[150px] h-10 glass-input bg-white/5 border-white/10">
                    <SelectValue placeholder="Item Type">
                      {currentItemTypeLabel}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="glass-card bg-neutral-900/95 backdrop-blur-xl">
                    {ITEM_TYPES.map(itemType => (
                      <SelectItem
                        key={itemType.value}
                        value={itemType.value}
                        className="focus:bg-white/10"
                      >
                        {itemType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort Dropdown */}
                <Select
                  value={currentSort}
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="w-[180px] h-10 glass-input bg-white/5 border-white/10">
                    <SelectValue placeholder="Sort by">
                      {currentSortLabel}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="glass-card bg-neutral-900/95 backdrop-blur-xl">
                    {SORT_OPTIONS.map(option => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="focus:bg-white/10"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Results Count */}
                {totalItems > 0 && (
                  <div className="px-3 py-2 glass-card bg-white/5">
                    <span className="text-sm text-muted-foreground">
                      <span className="font-semibold text-white">{totalItems}</span> results
                    </span>
                  </div>
                )}

                {/* Clear Filters */}
                {activeFiltersCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="glass-button border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    Clear ({activeFiltersCount})
                  </Button>
                )}
              </div>

              {/* Mobile Filter Toggle */}
              <div className="flex md:hidden items-center gap-2">
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                    {activeFiltersCount}
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="glass-button"
                >
                  <Filter className="w-4 h-4 mr-1" />
                  Filters
                </Button>
              </div>
            </div>

            {/* Mobile Filters Dropdown */}
            <AnimatePresence>
              {showMobileFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="md:hidden border-t border-white/10 overflow-hidden"
                >
                  <div className="py-4 space-y-3">
                    {/* Category */}
                    <Select
                      value={filters.category || 'all'}
                      onValueChange={handleCategoryChange}
                    >
                      <SelectTrigger className="w-full h-10 glass-input bg-white/5 border-white/10">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {dynamicCategories.map(category => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Item Type */}
                    <Select
                      value={filters.itemType || 'all'}
                      onValueChange={handleItemTypeChange}
                    >
                      <SelectTrigger className="w-full h-10 glass-input bg-white/5 border-white/10">
                        <SelectValue placeholder="Item Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ITEM_TYPES.map(itemType => (
                          <SelectItem key={itemType.value} value={itemType.value}>
                            {itemType.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Sort */}
                    <Select
                      value={currentSort}
                      onValueChange={handleSortChange}
                    >
                      <SelectTrigger className="w-full h-10 glass-input bg-white/5 border-white/10">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        {SORT_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Results and Clear */}
                    <div className="flex items-center justify-between">
                      {totalItems > 0 && (
                        <span className="text-sm text-muted-foreground">
                          <span className="font-semibold text-white">{totalItems}</span> results
                        </span>
                      )}
                      {activeFiltersCount > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearFilters}
                          className="glass-button text-red-400"
                        >
                          Clear All
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Spacer when sticky to prevent content jump */}
      {isSticky && filterBarRef.current && (
        <div style={{ height: filterBarRef.current.offsetHeight }} />
      )}
    </>
  )
}

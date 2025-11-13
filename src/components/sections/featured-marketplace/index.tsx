import { motion } from "framer-motion"
import { useApi } from '@/hooks/useApi'
import { MarketplaceItem } from '@/types/marketplace'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { ArrowRight, ShoppingBag, Star, TrendingUp } from 'lucide-react'
import { ServiceCard } from '@/components/marketplace/service-card'
import { ProductCard } from '@/components/marketplace/product-grid/product-card'

interface FeaturedMarketplaceResponse {
  items: MarketplaceItem[]
}

export function FeaturedMarketplaceSection() {
  // Fetch featured marketplace items - preserving existing API integration
  const {
    data: marketplaceData,
    error: marketplaceError,
    isLoading: marketplaceLoading,
  } = useApi<FeaturedMarketplaceResponse>('/api/marketplace?featured=true&limit=3')

  return (
    <section className="container mx-auto px-4 py-20 bg-neutral-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(139,92,246,0.05),transparent_50%),radial-gradient(circle_at_70%_70%,rgba(59,130,246,0.05),transparent_50%)]"></div>
      </div>
      
      {/* Enhanced section header with conversion focus */}
      <motion.div 
        className="text-center mb-20 relative"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <Star className="h-6 w-6 text-yellow-400 fill-current" />
          <Badge variant="secondary" className="glass-card border border-yellow-400/30 text-yellow-300 bg-yellow-400/10 px-4 py-2 text-sm font-medium">
            Featured Solutions
          </Badge>
          <Star className="h-6 w-6 text-yellow-400 fill-current" />
        </div>
        <h2 className="text-4xl lg:text-5xl font-bold mb-6">
          <span className="text-white">Transform Your Business with </span>
          <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-purple-300 bg-clip-text text-transparent">Award-Winning Digital Solutions</span>
        </h2>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
          Discover our most popular services that have helped hundreds of businesses 
          achieve remarkable growth and digital transformation
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-base">
          <div className="flex items-center gap-3 glass-card px-6 py-3 rounded-full border border-green-500/20">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <span className="text-gray-200 font-semibold">High Client Satisfaction</span>
          </div>
          <div className="flex items-center gap-3 glass-card px-6 py-3 rounded-full border border-blue-500/20">
            <ShoppingBag className="h-5 w-5 text-blue-400" />
            <span className="text-gray-200 font-semibold">Projects Delivered Successfully</span>
          </div>
        </div>
      </motion.div>

      {/* Content with enhanced error handling and loading states */}
      {marketplaceLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="h-full border-2 hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-48 w-full rounded-lg mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : marketplaceError ? (
        <motion.div 
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Unable to load featured services
            </h3>
            <p className="text-red-600 mb-4">
              Don't worry! You can still explore all our services.
            </p>
            <Button asChild variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
              <Link href="/marketplace">Browse All Services</Link>
            </Button>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Enhanced service cards with conversion optimization */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {marketplaceData?.items.map((item, index) => (
              item.itemType === 'SERVICE' ? (
                <ServiceCard key={item.id} service={item} index={index} />
              ) : (
                <ProductCard key={item.id} product={item} index={index} />
              )
            ))}
          </div>

          {/* Enhanced CTA section */}
          <motion.div
            className="text-center relative"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="glass-elevated rounded-3xl p-10 border border-purple-500/20 relative overflow-hidden">
              {/* Background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-blue-600/10 rounded-3xl"></div>
              
              <div className="relative">
                <h3 className="text-3xl font-bold mb-6 text-white">
                  Ready to Transform Your Business?
                </h3>
                <p className="text-gray-300 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
                  Join hundreds of satisfied clients who have accelerated their growth with our proven solutions.
                  Get started today with a free consultation.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Button 
                    asChild 
                    size="lg" 
                    className="gap-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-xl hover:shadow-purple-500/25 px-8 py-4 text-lg font-semibold"
                  >
                    <Link href="/marketplace">
                      Explore All Services
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button 
                    asChild 
                    variant="outline" 
                    size="lg"
                    className="gap-3 glass-card border-white/20 hover:border-purple-400/50 text-white hover:text-purple-200 px-8 py-4 text-lg font-semibold"
                  >
                    <Link href="/contact">Get Free Consultation</Link>
                  </Button>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
            </div>
          </motion.div>
        </>
      )}
    </section>
  )
}
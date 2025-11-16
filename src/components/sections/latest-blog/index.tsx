"use client"

import { motion } from "framer-motion"
import { useApi } from '@/hooks/useApi'
import { BlogPost } from '@/types/api'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { BlogCard } from '@/components/blog/blog-list/blog-card'
import { ArrowRight, BookOpen, TrendingUp, User } from 'lucide-react'
import { useNewsletterModal } from '@/components/providers/newsletter-modal-provider'

interface LatestBlogPostsResponse {
  posts: BlogPost[]
}

export function LatestBlogSection() {
  const { openNewsletterModal } = useNewsletterModal();

  // Fetch latest blog posts - preserving existing API integration
  const {
    data: blogData,
    error: blogError,
    isLoading: blogLoading,
  } = useApi<LatestBlogPostsResponse>('/api/blog?limit=3&sortBy=publishedAt&order=desc')

  return (
    <section className="container mx-auto px-4 py-16">
      {/* Enhanced section header with thought leadership focus */}
      <motion.div 
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-blue-500" />
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
            Latest Insights
          </Badge>
        </div>
        <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Industry Insights & Expertise
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Stay ahead of the curve with our latest articles on digital marketing, 
          web development, and business growth strategies
        </p>
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span>Weekly Updates</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-purple-500" />
            <span>Expert Authors</span>
          </div>
        </div>
      </motion.div>

      {/* Content with enhanced error handling and loading states */}
      {blogLoading ? (
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
                  <Skeleton className="h-48 w-full rounded-lg mb-4" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : blogError ? (
        <motion.div 
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-8 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-orange-800 mb-2">
              Unable to load latest articles
            </h3>
            <p className="text-orange-600 mb-4">
              Check out our blog for the latest insights and tips.
            </p>
            <Button asChild variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
              <Link href="/blog">Visit Our Blog</Link>
            </Button>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Blog post cards using centralized BlogCard component */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {(blogData?.posts || []).map((post, index) => (
              <BlogCard key={post.id} post={post} index={index} />
            ))}
          </div>

          {/* Enhanced CTA section for blog engagement */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl p-8 border border-blue-200/50">
              <h3 className="text-2xl font-bold mb-4">
                Stay Informed, Stay Ahead
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Get the latest insights on digital marketing trends, development best practices, 
                and business growth strategies delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/blog">
                    Read All Articles
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={openNewsletterModal}
                >
                  Subscribe to Newsletter
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </section>
  )
}
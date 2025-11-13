'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { BlogCard } from '@/components/blog/blog-list/blog-card';
import { BookOpen, Lightbulb, ArrowRight, TrendingUp, Brain, Rocket } from 'lucide-react';
import { apiClient } from '@/lib/api';
import type { BlogPost, BlogPaginatedResponse, Category, Tag } from '@/types/api';

interface BlogFilters {
  search?: string;
  category?: string;
  tag?: string;
  author?: string;
  sortBy?: 'publishedAt' | 'title' | 'viewCount';
  order?: 'asc' | 'desc';
}

export default function BlogPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<BlogFilters>({
    category: '',
    tag: '',
    sortBy: 'publishedAt',
    order: 'desc',
  });
  const [blogData, setBlogData] = useState<BlogPaginatedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch blog posts
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Build query string from filters
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: '9',
          status: 'PUBLISHED',
          ...Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
          ),
        });

        const response = await apiClient.get(`/api/blog?${queryParams.toString()}`);
        console.log('Blog API Response:', response.data);

        // Handle both response formats: direct or wrapped in data property
        const data = response.data?.data || response.data;
        setBlogData(data);
      } catch (err: any) {
        console.error('Error fetching blog posts:', err);
        setError(err.message || 'Failed to load blog posts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogPosts();
  }, [page, filters]);

  // Handle filter changes
  const handleFilterChange = (key: keyof BlogFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset page when filters change
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 hero-pattern">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-secondary-900/20"></div>
        <div className="absolute inset-0 mesh-gradient"></div>

        <div className="relative container py-24 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-4xl text-center">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-elevated mb-6">
                <Lightbulb className="h-4 w-4 text-primary-400" />
                <span className="text-sm font-medium text-gray-300">Knowledge Hub</span>
              </div>

              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl leading-tight mb-8">
                <span className="block text-white mb-4 text-balance">
                  Insights, Ideas &
                </span>
                <span className="block bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-300 bg-clip-text text-transparent font-extrabold text-balance">
                  Industry Intelligence
                </span>
              </h1>

              <motion.p
                className="mt-8 text-xl leading-relaxed text-gray-200 max-w-3xl mx-auto text-balance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Stay ahead of the curve with our <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent font-bold">expert insights</span> on digital transformation, technology trends, and business innovation strategies.
              </motion.p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Button
                asChild
                size="lg"
                className="gap-3 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white border-0 shadow-xl hover:shadow-primary-500/30 px-10 py-5 text-lg font-semibold rounded-xl hover:scale-105 transition-all duration-200"
              >
                <a href="#blog-grid">
                  <BookOpen className="h-6 w-6" />
                  Read Latest Posts
                  <ArrowRight className="h-5 w-5" />
                </a>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="gap-3 glass-elevated border-white/30 text-white hover:bg-white/10 hover:border-primary-400/50 px-10 py-5 text-lg font-semibold rounded-xl transition-all duration-200"
              >
                <Link href="/contact">
                  Subscribe to Newsletter
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </motion.div>

            {/* Feature Highlights */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="glass-elevated rounded-xl p-6 border border-primary-500/20 hover:border-primary-400/40 transition-all group cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-white font-semibold group-hover:text-primary-200 transition-colors">Latest Trends</span>
                </div>
                <p className="text-sm text-gray-400">Stay updated with cutting-edge insights</p>
              </div>

              <div className="glass-elevated rounded-xl p-6 border border-secondary-500/20 hover:border-secondary-400/40 transition-all group cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-secondary-600 to-secondary-500 rounded-lg flex items-center justify-center">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-white font-semibold group-hover:text-secondary-200 transition-colors">Expert Analysis</span>
                </div>
                <p className="text-sm text-gray-400">Deep-dive analysis from industry leaders</p>
              </div>

              <div className="glass-elevated rounded-xl p-6 border border-primary-500/20 hover:border-primary-400/40 transition-all group cursor-pointer">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                    <Rocket className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-white font-semibold group-hover:text-primary-200 transition-colors">Growth Strategies</span>
                </div>
                <p className="text-sm text-gray-400">Actionable insights for business growth</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="container py-8" id="blog-grid">
        {/* Filters */}
        <div className="mb-8 grid gap-4 md:grid-cols-1">
          <Input
            placeholder="Search posts..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        {/* Posts Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="w-full">
                <CardHeader>
                  <Skeleton className="h-48 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full mt-2" />
                  <Skeleton className="h-4 w-2/3 mt-2" />
                  <div className="mt-4 flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">
            Failed to load blog posts
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogData?.posts?.map((post, index) => (
                <BlogCard key={post.id} post={post} index={index} />
              ))}
            </div>

            {/* Pagination */}
            {blogData?.pagination && blogData.pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={!blogData.pagination.hasPrevPage}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={!blogData.pagination.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

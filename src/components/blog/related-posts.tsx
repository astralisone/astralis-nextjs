'use client';

import { motion } from 'framer-motion';
import { Clock, User } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ApiBlogPost } from '@/types/blog';
import { formatDate, calculateReadingTime } from '@/lib/utils';

interface RelatedPostsProps {
  posts: ApiBlogPost[];
  currentPostId: string;
}

export function RelatedPosts({ posts, currentPostId }: RelatedPostsProps) {
  // Filter out current post and limit to 3 related posts
  const relatedPosts = posts.filter((post) => post.id !== currentPostId).slice(0, 3);

  if (relatedPosts.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-16"
    >
      <h2 className="text-2xl font-bold text-white mb-8">Related Posts</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedPosts.map((post, index) => (
          <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
            <Link href={`/blog/${post.slug}`}>
              <Card className="glass-card border-white/10 hover:border-primary-400/50 transition-all duration-300 hover:scale-105 group cursor-pointer h-full">
                <CardContent className="p-0">
                  {post.featuredImage && (
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  )}

                  <div className="p-6">
                    <Badge variant="secondary" className="mb-3 bg-primary-500/20 text-primary-300 border-primary-400/30">
                      {post.category.name}
                    </Badge>

                    <h3 className="text-lg font-semibold text-white mb-3 line-clamp-2 group-hover:text-primary-300 transition-colors">
                      {post.title}
                    </h3>

                    {post.excerpt && <p className="text-gray-400 text-sm mb-4 line-clamp-2">{post.excerpt}</p>}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{post.author.name || 'Anonymous'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{calculateReadingTime(post.content)}</span>
                        </div>
                      </div>
                      <time>{formatDate(post.publishedAt || post.createdAt)}</time>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

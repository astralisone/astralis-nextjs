"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import type { BlogPost as LibBlogPost } from "@/lib/blog-posts"
import type { BlogPost as ApiBlogPost } from "@/types/api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, ImageIcon } from "lucide-react"
import { formatDate } from "@/lib/utils"
import Image from "next/image"

// Unified blog post type that can handle both formats
type UnifiedBlogPost = LibBlogPost | ApiBlogPost

interface BlogCardProps {
  post: UnifiedBlogPost
  index: number
}

// Helper function to normalize post data
function normalizePost(post: UnifiedBlogPost) {
  // Check if it's the API format (has slug property)
  if ('slug' in post) {
    const apiPost = post as ApiBlogPost
    return {
      id: apiPost.id,
      slug: apiPost.slug,
      title: apiPost.title,
      excerpt: apiPost.excerpt || apiPost.content?.substring(0, 150) + '...',
      content: apiPost.content || '',
      date: formatDate(apiPost.publishedAt || apiPost.createdAt),
      readTime: `${Math.ceil((apiPost.content?.length || 0) / 200)} min read`,
      category: typeof apiPost.category === 'string' ? apiPost.category : apiPost.category.name,
      image: apiPost.featuredImage,
      author: {
        name: apiPost.author.name || 'Unknown Author',
        avatar: apiPost.author.avatar,
      },
      featured: apiPost.featured,
      viewCount: apiPost.viewCount,
      tags: apiPost.tags
    }
  } else {
    // It's the lib format
    const libPost = post as LibBlogPost
    return {
      id: libPost.id.toString(),
      slug: libPost.id.toString(), // Use ID as slug for lib posts
      title: libPost.title,
      excerpt: libPost.excerpt,
      content: libPost.content,
      date: libPost.date,
      readTime: libPost.readTime,
      category: libPost.category,
      image: libPost.image,
      author: libPost.author,
      featured: false,
      viewCount: 0,
      tags: []
    }
  }
}

export function BlogCard({ post, index }: BlogCardProps) {
  // Normalize the post data to handle both formats
  const normalizedPost = normalizePost(post)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/blog/${normalizedPost.slug}`} className="block cursor-pointer">
        <Card className="h-full hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 group flex flex-col cursor-pointer">
          <CardHeader className="p-0">
            <div className="aspect-[16/10] sm:aspect-[16/9] relative overflow-hidden bg-gradient-to-br from-blue-900/20 to-teal-900/20">
              {normalizedPost.image ? (
                <Image
                  src={normalizedPost.image}
                  alt={normalizedPost.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ImageIcon className="w-12 h-12" />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-300 border-blue-400/30">
                {normalizedPost.category}
              </Badge>
              {normalizedPost.featured && (
                <Badge className="bg-yellow-600 text-white border-0 text-xs">
                  Featured
                </Badge>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-semibold mb-2 line-clamp-2 text-white group-hover:text-blue-200 transition-colors">
              {normalizedPost.title}
            </h2>
            <p className="text-sm sm:text-base text-gray-300 mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 flex-1">
              {normalizedPost.excerpt}
            </p>
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                   <AvatarImage src={normalizedPost.author.avatar || undefined} />
                  <AvatarFallback>{normalizedPost.author.name?.[0] || 'A'}</AvatarFallback>
                </Avatar>
                <div className="text-xs sm:text-sm">
                  <div className="font-medium text-white">{normalizedPost.author.name}</div>
                  <div className="text-gray-400">{normalizedPost.date}</div>
                </div>
              </div>
              <div className="flex items-center text-gray-400 text-xs sm:text-sm">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                {normalizedPost.readTime}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

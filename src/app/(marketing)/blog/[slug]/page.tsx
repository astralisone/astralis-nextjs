'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, User, Eye, Calendar, Tag } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

import { useApi } from '@/hooks/useApi';
import { ApiBlogPost, ApiComment } from '@/types/blog';
import { formatDate, formatRelativeTime, calculateReadingTime } from '@/lib/utils';
import { parseMarkdownCodeBlocks } from '@/lib/blog/content-processor';

import { Breadcrumb } from '@/components/blog/breadcrumb';
import { SocialShare } from '@/components/blog/social-share';
import { CommentsSection } from '@/components/blog/comments-section';
import { RelatedPosts } from '@/components/blog/related-posts';
import { PostNavigation } from '@/components/blog/post-navigation';
import { BlogPostImage } from '@/components/blog/blog-post-image';

interface BlogPostResponse {
  status: 'success' | 'error';
  data: ApiBlogPost;
}

interface BlogListResponse {
  status: 'success' | 'error';
  data: {
    posts: ApiBlogPost[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

function BlogPostSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-8 w-3/4" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-64 w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <Alert className="glass-card border-red-500/20 bg-red-500/10">
          <AlertDescription className="text-red-300">{message}</AlertDescription>
        </Alert>
        <div className="mt-8">
          <Button asChild variant="outline" className="glass-elevated border-white/20">
            <Link href="/blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [comments, setComments] = useState<ApiComment[]>([]);

  // Fetch the blog post
  const {
    data: post,
    error: postError,
    isLoading: postLoading,
  } = useApi<ApiBlogPost>(`/api/blog/${slug}`, { enabled: !!slug });

  // Fetch related posts
  const { data: relatedData } = useApi<BlogListResponse['data']>(`/api/blog?limit=6&status=PUBLISHED`, { enabled: !!post });

  // Initialize comments when post loads
  useEffect(() => {
    if (post && post.comments) {
      setComments(post.comments);
    }
  }, [post]);

  if (postLoading) {
    return <BlogPostSkeleton />;
  }

  if (postError || !post) {
    return <ErrorState message={postError?.message || 'Blog post not found. It may have been moved or deleted.'} />;
  }

  const relatedPosts = relatedData?.posts || [];

  // Find adjacent posts for navigation
  const currentIndex = relatedPosts.findIndex((p) => p.id === post.id);
  const previousPost = currentIndex > 0 ? relatedPosts[currentIndex - 1] : undefined;
  const nextPost = currentIndex < relatedPosts.length - 1 ? relatedPosts[currentIndex + 1] : undefined;

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Hero Section */}
      <section className="relative py-12 bg-gradient-to-b from-neutral-900 to-neutral-950 z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <Breadcrumb category={post.category} postTitle={post.title} />

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
            {/* Post Status and Category */}
            <div className="flex items-center gap-4">
              {post.featured && (
                <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border-yellow-500/30">Featured</Badge>
              )}
              <Badge className="bg-primary-500/20 text-primary-300 border-primary-400/30">{post.category.name}</Badge>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">{post.title}</h1>

            {/* Excerpt */}
            {post.excerpt && <p className="text-xl text-gray-300 leading-relaxed">{post.excerpt}</p>}

            {/* Author and Meta Info */}
            <div className="flex flex-wrap items-center justify-between gap-6 pt-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={post.author.avatar || undefined} />
                  <AvatarFallback className="bg-primary-500/20 text-primary-300 text-lg">{post.author.name?.[0] || 'A'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-white">{post.author.name || 'Anonymous'}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <time dateTime={post.publishedAt || post.createdAt}>{formatDate(post.publishedAt || post.createdAt)}</time>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {calculateReadingTime(post.content)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {post.viewCount} views
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-gray-400" />
                  {post.tags.map((tag) => (
                    <Badge key={tag.id} variant="outline" className="glass-backdrop border-white/20 hover:border-primary-400 text-gray-300">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Image */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="container mx-auto px-4 max-w-5xl -mt-8 relative z-10"
      >
        <div className="relative overflow-hidden rounded-2xl shadow-2xl">
          <BlogPostImage
            postId={post.id.toString()}
            title={post.title}
            existingImage={post.featuredImage}
            content={post.content || undefined}
            category={post.category.name}
            className="w-full h-[400px] md:h-[500px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      </motion.section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Article Content */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-3"
          >
            <div className="blog-content">{parseMarkdownCodeBlocks(post.content || '')}</div>

            <Separator className="my-12 bg-white/10" />

            {/* Post Navigation */}
            <PostNavigation previousPost={previousPost} nextPost={nextPost} />

            {/* Comments Section */}
            <CommentsSection postSlug={post.slug} comments={comments} onCommentAdded={(comment) => setComments((prev) => [comment, ...prev])} />
          </motion.article>

          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-1 space-y-8"
          >
            {/* Social Share */}
            <SocialShare title={post.title} url={typeof window !== 'undefined' ? window.location.href : ''} description={post.excerpt || undefined} />

            {/* Back to Blog */}
            <div className="glass-card border border-white/10 rounded-lg p-6">
              <Button asChild variant="outline" className="w-full glass-elevated border-white/20 hover:border-primary-400">
                <Link href="/blog">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Blog
                </Link>
              </Button>
            </div>
          </motion.aside>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 1 && <RelatedPosts posts={relatedPosts} currentPostId={post.id} />}
      </section>
    </div>
  );
}

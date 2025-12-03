/**
 * Blog Page - Astralis Specification Section 8
 *
 * Structure:
 * 1. Hero Section - Dark navy background
 * 2. Category Filter Buttons
 * 3. Featured Article Section
 * 4. Article Grid (3 columns on desktop)
 *
 * Categories (per spec Section 8):
 * - Automation
 * - AI Architecture
 * - SaaS Engineering
 * - Business Efficiency
 * - Case Studies
 *
 * Design:
 * - Light theme with white backgrounds
 * - Dark text on white (text-astralis-navy, text-slate-700)
 * - Hero section with dark navy background
 * - Card-based layout with subtle shadows
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Hero } from '@/components/sections';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ArrowRight, User } from 'lucide-react';
import { cn } from '@/lib/utils';

// Blog post type definition
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  slug: string;
  featured?: boolean;
  imageUrl?: string;
}

// Helper function to get article image
const getArticleImage = (id: string): string => {
  const images: Record<string, string> = {
    '2': 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=600&q=80', // Team collaboration
    '3': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80', // Tech workspace
    '4': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80', // Analytics
    '5': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80', // Dashboard
    '6': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80', // Data servers
    '7': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80', // AI technology
    '8': 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&q=80', // Productivity
    '9': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80', // Business documents
  };
  return images[id] || 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=600&q=80'; // Default tech image
};

// Blog categories from spec Section 8
const CATEGORIES = [
  'All',
  'Automation',
  'AI Architecture',
  'SaaS Engineering',
  'Business Efficiency',
  'Case Studies',
] as const;

// Mock blog post data
const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Building Scalable AI Pipelines for Enterprise Systems',
    excerpt: 'Learn how to architect production-ready AI systems that scale with your business needs. We explore best practices for data processing, model deployment, and monitoring.',
    category: 'AI Architecture',
    author: 'Sarah Chen',
    date: '2025-01-15',
    readTime: '8 min read',
    slug: 'building-scalable-ai-pipelines',
    featured: true,
  },
  {
    id: '2',
    title: 'Automating Customer Onboarding: A Case Study',
    excerpt: 'How we reduced onboarding time by 75% for a SaaS company using intelligent automation and workflow optimization.',
    category: 'Case Studies',
    author: 'Michael Torres',
    date: '2025-01-12',
    readTime: '6 min read',
    slug: 'automating-customer-onboarding',
  },
  {
    id: '3',
    title: 'The Modern SaaS Tech Stack: What You Need in 2025',
    excerpt: 'A comprehensive guide to building robust, scalable SaaS applications with the latest tools and technologies.',
    category: 'SaaS Engineering',
    author: 'Emily Rodriguez',
    date: '2025-01-10',
    readTime: '10 min read',
    slug: 'modern-saas-tech-stack-2025',
  },
  {
    id: '4',
    title: 'Measuring ROI on Business Process Automation',
    excerpt: 'Data-driven approaches to quantifying the impact of automation investments on your bottom line.',
    category: 'Business Efficiency',
    author: 'David Park',
    date: '2025-01-08',
    readTime: '7 min read',
    slug: 'measuring-roi-automation',
  },
  {
    id: '5',
    title: 'No-Code vs. Custom: Choosing the Right Automation Strategy',
    excerpt: 'When to use no-code platforms and when to build custom solutions. A framework for making the right decision.',
    category: 'Automation',
    author: 'Jessica Williams',
    date: '2025-01-05',
    readTime: '9 min read',
    slug: 'no-code-vs-custom-automation',
  },
  {
    id: '6',
    title: 'Real-Time Data Sync: Bridging Legacy and Modern Systems',
    excerpt: 'Strategies for connecting legacy databases with modern cloud applications while maintaining data integrity.',
    category: 'SaaS Engineering',
    author: 'Alex Kumar',
    date: '2025-01-03',
    readTime: '8 min read',
    slug: 'real-time-data-sync',
  },
  {
    id: '7',
    title: 'AI-Powered Document Processing: From Chaos to Structure',
    excerpt: 'Transform unstructured documents into actionable data using machine learning and intelligent extraction.',
    category: 'AI Architecture',
    author: 'Rachel Kim',
    date: '2025-01-01',
    readTime: '11 min read',
    slug: 'ai-document-processing',
  },
  {
    id: '8',
    title: 'Reducing Manual Work: 10 Quick Automation Wins',
    excerpt: 'Fast, high-impact automation opportunities that every business should implement immediately.',
    category: 'Business Efficiency',
    author: 'Tom Anderson',
    date: '2024-12-28',
    readTime: '5 min read',
    slug: 'quick-automation-wins',
  },
  {
    id: '9',
    title: 'How We Automated Invoice Processing for a 200-Person Company',
    excerpt: 'A deep dive into building an end-to-end invoice automation system that saved 30 hours per week.',
    category: 'Case Studies',
    author: 'Lisa Martinez',
    date: '2024-12-25',
    readTime: '12 min read',
    slug: 'invoice-processing-automation',
  },
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('All');

  // Filter posts based on selected category
  const filteredPosts = React.useMemo(() => {
    if (selectedCategory === 'All') {
      return BLOG_POSTS;
    }
    return BLOG_POSTS.filter((post) => post.category === selectedCategory);
  }, [selectedCategory]);

  // Get featured post
  const featuredPost = BLOG_POSTS.find((post) => post.featured);
  const regularPosts = filteredPosts.filter((post) => !post.featured);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section - Dark Navy Background */}
      <Hero
        headline="Insights on Automation, AI, and Modern SaaS"
        description="Expert perspectives on building efficient, intelligent systems that scale."
        variant="dark"
        className="bg-astralis-navy"
        textAlign="center"
        textColumnWidth="two-thirds"
      />

      {/* Category Filter Section */}
      <section className="w-full px-6 py-12 md:px-12 lg:px-20 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex flex-wrap gap-3 md:gap-4 justify-center">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'px-5 py-2.5 rounded-md font-medium text-sm transition-all duration-200',
                  selectedCategory === category
                    ? 'bg-astralis-blue text-white shadow-md'
                    : 'bg-white text-slate-700 border border-slate-300 hover:border-astralis-blue hover:text-astralis-blue'
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Article Section */}
      {featuredPost && selectedCategory === 'All' && (
        <section className="w-full px-6 py-16 md:px-12 md:py-20 lg:px-20 lg:py-24 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
          {/* Tech background pattern */}
          <div className="absolute inset-0 opacity-[0.02]">
            <Image
              src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=60"
              alt="Technology pattern"
              fill
              className="object-cover"
              loading="lazy"
              sizes="100vw"
            />
          </div>
          <div className="mx-auto max-w-[1280px] relative z-10">
            <div className="mb-8">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-astralis-blue to-blue-600 text-white text-xs font-bold rounded-md uppercase tracking-wide shadow-lg">
                Featured Article
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 bg-white border border-slate-200 rounded-xl p-6 md:p-10 lg:p-12 shadow-xl hover:shadow-2xl transition-all duration-200">
              {/* Left: Content */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <span className="inline-block px-3 py-1.5 bg-astralis-blue/10 text-astralis-blue text-xs font-semibold rounded-md border border-astralis-blue/30">
                    {featuredPost.category}
                  </span>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-astralis-navy leading-tight tracking-tight">
                    {featuredPost.title}
                  </h2>
                </div>

                <p className="text-base md:text-lg text-slate-700 leading-relaxed">
                  {featuredPost.excerpt}
                </p>

                <div className="flex items-center flex-wrap gap-4 md:gap-6 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <User className=" ui-icon w-5 h-5 text-astralis-blue" />
                    <span className="font-medium">{featuredPost.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className=" ui-icon w-5 h-5 text-astralis-blue" />
                    <span>{new Date(featuredPost.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className=" ui-icon w-5 h-5 text-astralis-blue" />
                    <span>{featuredPost.readTime}</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="group shadow-lg"
                  asChild
                >
                  <Link href={`/blog/${featuredPost.slug}`}>
                    Read Full Article
                    <ArrowRight className="ml-2  ui-icon w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </Button>
              </div>

              {/* Right: Featured Image */}
              <div className="hidden lg:block relative rounded-xl overflow-hidden h-96 shadow-lg">
                <Image
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"
                  alt="AI and data visualization"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-astralis-navy/60 to-transparent"></div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Article Grid Section */}
      <section className="w-full px-6 py-16 md:px-12 md:py-20 lg:px-20 lg:py-24 bg-slate-50 relative overflow-hidden">
        {/* Subtle data visualization background */}
        <div className="absolute inset-0 opacity-[0.02]">
          <Image
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=60"
            alt="Data visualization"
            fill
            className="object-cover"
            loading="lazy"
            sizes="100vw"
          />
        </div>
        <div className="mx-auto max-w-[1280px] relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-astralis-navy mb-12 tracking-tight">
            {selectedCategory === 'All' ? 'All Articles' : `${selectedCategory} Articles`}
          </h2>

          {/* 3-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {regularPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-200 hover:-translate-y-2 flex flex-col group"
              >
                {/* Article Image */}
                <div className="w-full h-48 relative border-b border-slate-200 overflow-hidden">
                  <Image
                    src={getArticleImage(post.id)}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-astralis-navy/40 to-transparent group-hover:from-astralis-navy/60 transition-all duration-200"></div>
                </div>

                {/* Card Content */}
                <div className="p-6 md:p-8 flex-1 flex flex-col">
                  {/* Category Tag */}
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1.5 bg-astralis-blue/10 text-astralis-blue text-xs font-semibold rounded border border-astralis-blue/30">
                      {post.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-astralis-navy mb-3 leading-tight group-hover:text-astralis-blue transition-colors duration-200">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-slate-700 text-sm leading-relaxed mb-4 flex-1">
                    {post.excerpt}
                  </p>

                  {/* Meta Information */}
                  <div className="space-y-3 pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <User className=" ui-icon w-5 h-5 text-astralis-blue" />
                      <span className="font-medium">{post.author}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className=" ui-icon w-5 h-5 text-astralis-blue" />
                        <span>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className=" ui-icon w-5 h-5 text-astralis-blue" />
                        <span className="font-medium">{post.readTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Read More Link */}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 text-astralis-blue hover:text-blue-700 font-semibold text-sm mt-4 group/link"
                  >
                    Read more
                    <ArrowRight className=" ui-icon w-5 h-5 group-hover/link:translate-x-1 transition-transform duration-200" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* No Results Message */}
          {filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-slate-600 text-lg">
                No articles found in this category.
              </p>
              <Button
                variant="secondary"
                size="default"
                className="mt-6"
                onClick={() => setSelectedCategory('All')}
              >
                View All Articles
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA Section */}
      <section className="w-full px-6 py-16 md:px-12 md:py-20 lg:px-20 lg:py-24 bg-gradient-to-br from-astralis-navy via-slate-800 to-astralis-navy border-t border-slate-700 relative overflow-hidden">
        {/* Tech grid overlay */}
        <div className="absolute inset-0 opacity-10">
          <Image
            src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&q=60"
            alt="Technology network"
            fill
            className="object-cover"
            loading="lazy"
            sizes="100vw"
          />
        </div>
        <div className="mx-auto max-w-[800px] text-center relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
            Stay Updated
          </h2>
          <p className="text-base md:text-lg text-slate-300 mb-8 leading-relaxed">
            Get the latest insights on automation, AI, and SaaS engineering delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="px-4 py-3 rounded-lg border border-slate-600 bg-slate-800/50 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-astralis-blue focus:border-transparent flex-1 backdrop-blur-sm"
            />
            <Button variant="primary" size="lg" className="sm:w-auto shadow-lg">
              Subscribe
            </Button>
          </div>
          <p className="text-xs text-slate-400 mt-4">
            No spam. Unsubscribe at any time.
          </p>
        </div>
      </section>
    </main>
  );
}
'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ApiBlogPost } from '@/types/blog';

interface PostNavigationProps {
  previousPost?: ApiBlogPost;
  nextPost?: ApiBlogPost;
}

export function PostNavigation({ previousPost, nextPost }: PostNavigationProps) {
  if (!previousPost && !nextPost) return null;

  return (
    <nav className="flex justify-between items-center mt-12 pt-8 border-t border-white/10">
      <div className="flex-1">
        {previousPost && (
          <Link href={`/blog/${previousPost.slug}`}>
            <Button
              variant="outline"
              className="glass-elevated border-white/20 hover:border-primary-400 hover:bg-primary-500/20 p-4 h-auto max-w-xs group"
            >
              <div className="flex items-start gap-3">
                <ChevronLeft className="w-5 h-5 mt-1 flex-shrink-0 group-hover:text-primary-300 transition-colors" />
                <div className="text-left">
                  <div className="text-xs text-gray-400 mb-1">Previous Post</div>
                  <div className="text-sm font-medium text-white line-clamp-2 group-hover:text-primary-300 transition-colors">
                    {previousPost.title}
                  </div>
                </div>
              </div>
            </Button>
          </Link>
        )}
      </div>

      <div className="flex-1 flex justify-end">
        {nextPost && (
          <Link href={`/blog/${nextPost.slug}`}>
            <Button
              variant="outline"
              className="glass-elevated border-white/20 hover:border-primary-400 hover:bg-primary-500/20 p-4 h-auto max-w-xs group"
            >
              <div className="flex items-start gap-3">
                <div className="text-right">
                  <div className="text-xs text-gray-400 mb-1">Next Post</div>
                  <div className="text-sm font-medium text-white line-clamp-2 group-hover:text-primary-300 transition-colors">
                    {nextPost.title}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 mt-1 flex-shrink-0 group-hover:text-primary-300 transition-colors" />
              </div>
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}

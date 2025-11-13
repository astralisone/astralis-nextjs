'use client';

import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { ApiCategory } from '@/types/blog';

interface BreadcrumbProps {
  category?: ApiCategory;
  postTitle: string;
}

export function Breadcrumb({ category, postTitle }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
      <Link href="/" className="flex items-center hover:text-primary-400 transition-colors">
        <Home className="w-4 h-4" />
      </Link>

      <ChevronRight className="w-4 h-4" />

      <Link href="/blog" className="hover:text-primary-400 transition-colors">
        Blog
      </Link>

      {category && (
        <>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/blog?category=${category.slug}`} className="hover:text-primary-400 transition-colors">
            {category.name}
          </Link>
        </>
      )}

      <ChevronRight className="w-4 h-4" />
      <span className="text-gray-300 truncate max-w-xs">{postTitle}</span>
    </nav>
  );
}

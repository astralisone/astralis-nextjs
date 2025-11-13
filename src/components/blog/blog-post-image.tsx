'use client';

import { useBlogPostImage } from '@/hooks/useBlogPostImage';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageIcon } from 'lucide-react';

interface BlogPostImageProps {
  postId: string;
  title: string;
  existingImage?: string | null;
  content?: string;
  category?: string;
  className?: string;
  alt?: string;
}

export function BlogPostImage({
  postId,
  title,
  existingImage,
  content,
  category,
  className = 'w-full h-full object-cover transition-transform duration-300 group-hover:scale-105',
  alt,
}: BlogPostImageProps) {
  const { imageUrl, isLoading, error } = useBlogPostImage({
    postId,
    title,
    existingImage,
    content,
    category,
  });

  if (isLoading) {
    return <Skeleton className="w-full h-full" />;
  }

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={alt || title}
        className={className}
        onError={(e) => {
          // If the image fails to load, hide it
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  // Fallback placeholder
  return (
    <div className="w-full h-full flex items-center justify-center text-gray-400">
      <ImageIcon className="w-12 h-12" />
    </div>
  );
}

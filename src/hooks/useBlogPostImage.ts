import { useState, useEffect } from 'react';
import { getCachedBlogPostImage } from '@/lib/unsplash';

interface UseBlogPostImageProps {
  postId: string;
  title: string;
  existingImage?: string | null;
  content?: string;
  category?: string;
}

export function useBlogPostImage({
  postId,
  title,
  existingImage,
  content,
  category,
}: UseBlogPostImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(existingImage || null);
  const [isLoading, setIsLoading] = useState(!existingImage);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadImage() {
      if (existingImage) {
        setImageUrl(existingImage);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const url = await getCachedBlogPostImage(
          postId,
          title,
          content,
          category,
          existingImage
        );

        if (isMounted) {
          setImageUrl(url);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load image');
          setIsLoading(false);
        }
      }
    }

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [postId, title, existingImage, content, category]);

  return { imageUrl, isLoading, error };
}
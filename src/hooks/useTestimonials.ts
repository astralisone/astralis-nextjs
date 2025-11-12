import { useState, useEffect } from 'react';
import api from '@/lib/axios';

export interface Testimonial {
  id: string;
  content: string;
  rating: number;
  role: string;
  company: string;
  avatar: string;
  featured: boolean;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
}

interface UseTestimonialsOptions {
  featured?: boolean;
}

export function useTestimonials(options: UseTestimonialsOptions = {}) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const queryParams = new URLSearchParams();
        if (options.featured) {
          queryParams.append('featured', 'true');
        }
        
        const response = await api.get(`/testimonials?${queryParams.toString()}`);
        
        if (response.data && response.data.status === 'success') {
          setTestimonials(response.data.data);
        } else {
          throw new Error('Failed to fetch testimonials');
        }
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, [options.featured]);

  return { testimonials, isLoading, error };
} 
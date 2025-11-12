/**
 * Server-side API utilities for Next.js SSR and SSG
 *
 * Use these functions in:
 * - Server Components
 * - API Routes
 * - getServerSideProps
 * - getStaticProps
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

interface ServerApiOptions extends RequestInit {
  token?: string;
}

/**
 * Generic server-side API call function
 * @param endpoint - API endpoint (e.g., '/auth/me', '/blog/posts')
 * @param options - Fetch options including optional token
 */
export async function serverApi<T = any>(
  endpoint: string,
  options?: ServerApiOptions
): Promise<T> {
  const { token, ...fetchOptions } = options || {};

  const url = `${API_BASE_URL}/api${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  // Add authorization token if provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${text}`);
      }
      return text as unknown as T;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`Server API Error [${endpoint}]:`, error);
    throw error;
  }
}

/**
 * Convenience methods for common HTTP verbs
 */
export const serverApiClient = {
  /**
   * GET request
   */
  get: async <T = any>(endpoint: string, options?: ServerApiOptions): Promise<T> => {
    return serverApi<T>(endpoint, { ...options, method: 'GET' });
  },

  /**
   * POST request
   */
  post: async <T = any>(
    endpoint: string,
    data?: any,
    options?: ServerApiOptions
  ): Promise<T> => {
    return serverApi<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * PUT request
   */
  put: async <T = any>(
    endpoint: string,
    data?: any,
    options?: ServerApiOptions
  ): Promise<T> => {
    return serverApi<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * PATCH request
   */
  patch: async <T = any>(
    endpoint: string,
    data?: any,
    options?: ServerApiOptions
  ): Promise<T> => {
    return serverApi<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE request
   */
  delete: async <T = any>(endpoint: string, options?: ServerApiOptions): Promise<T> => {
    return serverApi<T>(endpoint, { ...options, method: 'DELETE' });
  },
};

/**
 * Helper function to get token from cookies (for server components)
 * This is a placeholder - implement based on your auth strategy
 */
export function getServerToken(): string | undefined {
  // TODO: Implement based on NextAuth or your auth solution
  // Example with cookies:
  // import { cookies } from 'next/headers';
  // const cookieStore = cookies();
  // return cookieStore.get('auth-token')?.value;
  return undefined;
}

/**
 * Type-safe API response wrapper
 */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

/**
 * Safe API call that returns a typed response object
 * Useful for error handling in server components
 */
export async function safeServerApi<T>(
  endpoint: string,
  options?: ServerApiOptions
): Promise<ApiResponse<T>> {
  try {
    const data = await serverApi<T>(endpoint, options);
    return {
      data,
      error: null,
      status: 200,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 500,
    };
  }
}

/**
 * Example usage in Server Components:
 *
 * ```tsx
 * import { serverApiClient } from '@/lib/api/server';
 *
 * export default async function BlogPage() {
 *   const posts = await serverApiClient.get('/blog/posts');
 *   return <div>...</div>;
 * }
 * ```
 *
 * With error handling:
 *
 * ```tsx
 * import { safeServerApi } from '@/lib/api/server';
 *
 * export default async function BlogPage() {
 *   const { data: posts, error } = await safeServerApi('/blog/posts');
 *   if (error) return <div>Error: {error}</div>;
 *   return <div>...</div>;
 * }
 * ```
 */
